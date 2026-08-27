#!/usr/bin/env node
/**
 * Contrôle des liens de Programmes 2027.
 *
 * Vérifie que chaque URL citée en source dans data/*.json répond encore.
 * Aucune dépendance. Usage : node scripts/check-links.mjs [--json]
 *
 * Sortie : code 1 si au moins une URL est morte (4xx/5xx ou injoignable).
 * Les redirections sont signalées mais ne font pas échouer le contrôle.
 *
 * Ce script existe parce que la passe de veille automatisée ne peut pas
 * contrôler ses propres sources : son outil de récupération de pages
 * n'accepte que les URL déjà rencontrées dans la conversation. La CI n'a
 * pas cette restriction. Voir MISE-A-JOUR.md, section « Automatisation ».
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const JSON_OUT = process.argv.includes('--json');
const TIMEOUT = 20000;
const CONCURRENCE = 6;
const UA = 'programmes-2027-linkcheck/1.0 (+https://github.com/maax6/programmes-2027)';

const load = (n) => JSON.parse(readFileSync(join(ROOT, 'data', `${n}.json`), 'utf8'));

/* --- collecte : une URL peut être citée à plusieurs endroits --- */
const refs = new Map(); // url -> [contextes]
const ajouter = (url, ou) => {
  if (!url || !/^https?:\/\//.test(url)) return;
  if (!refs.has(url)) refs.set(url, []);
  refs.get(url).push(ou);
};

for (const c of load('candidats')) {
  ajouter(c.site_officiel, `candidats/${c.id} · site_officiel`);
  ajouter(c.programme_url, `candidats/${c.id} · programme_url`);
  (c.sources || []).forEach((s, i) => ajouter(s.url, `candidats/${c.id} · source[${i}]`));
}
for (const p of load('propositions')) {
  (p.sources || []).forEach((s, i) => ajouter(s.url, `propositions/${p.id} · source[${i}]`));
}
const meta = load('meta');
ajouter(meta.election?.source_dates?.url, 'meta · election.source_dates');

/* --- contrôle --- */
async function tester(url) {
  const essai = async (method) => {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), TIMEOUT);
    try {
      const r = await fetch(url, {
        method,
        redirect: 'follow',
        signal: ctrl.signal,
        headers: { 'user-agent': UA, accept: '*/*' }
      });
      return { status: r.status, finale: r.url };
    } finally {
      clearTimeout(t);
    }
  };
  try {
    let r = await essai('HEAD');
    // beaucoup de serveurs refusent HEAD sans que la page soit morte
    if (r.status === 405 || r.status === 403 || r.status === 501) r = await essai('GET');
    return r;
  } catch (e) {
    return { status: 0, erreur: e.name === 'AbortError' ? 'délai dépassé' : e.message };
  }
}

const urls = [...refs.keys()];
const resultats = [];
let curseur = 0;
await Promise.all(
  Array.from({ length: Math.min(CONCURRENCE, urls.length) }, async () => {
    while (curseur < urls.length) {
      const url = urls[curseur++];
      resultats.push({ url, contextes: refs.get(url), ...(await tester(url)) });
    }
  })
);
resultats.sort((a, b) => a.url.localeCompare(b.url));

const morts = resultats.filter((r) => r.status === 0 || r.status >= 400);
const redirigees = resultats.filter((r) => r.status >= 200 && r.status < 400 && r.finale && r.finale !== r.url);

if (JSON_OUT) {
  console.log(JSON.stringify({ total: resultats.length, morts, redirigees }, null, 2));
} else {
  console.log(`\nProgrammes 2027 — contrôle des liens\n`);
  console.log(`  ${String(resultats.length).padStart(4)}  URL distinctes contrôlées`);
  console.log(`  ${String(resultats.length - morts.length).padStart(4)}  répondent`);
  console.log(`  ${String(morts.length).padStart(4)}  ne répondent pas`);
  if (redirigees.length) {
    console.log(`\n→ ${redirigees.length} redirection(s), à vérifier sans urgence :`);
    for (const r of redirigees) console.log(`  · ${r.url}\n      → ${r.finale}\n      ${r.contextes.join(', ')}`);
  }
  // Un échec total signale presque toujours un réseau sortant bloqué, pas des liens morts.
  if (morts.length === resultats.length && resultats.length > 3) {
    console.error(`\n✖ Aucune des ${resultats.length} URL n'a répondu.`);
    console.error(`  C'est le symptôme d'un réseau sortant bloqué, pas de liens morts.`);
    console.error(`  Ce contrôle n'est probant que là où l'accès à Internet est complet :`);
    console.error(`  exécutez-le dans la CI (.github/workflows/liens.yml), pas dans un bac à sable.\n`);
    process.exit(2);
  }

  if (morts.length) {
    console.error(`\n✖ ${morts.length} lien(s) mort(s) :`);
    for (const r of morts) {
      console.error(`  · ${r.url}`);
      console.error(`      ${r.erreur ? 'injoignable : ' + r.erreur : 'code HTTP ' + r.status}`);
      console.error(`      ${r.contextes.join(', ')}`);
    }
    console.error('\nCharte, règle 1 : une source qui disparaît doit être remplacée ou l\'entrée retirée.\n');
  } else {
    console.log('\n✔ Tous les liens répondent.\n');
  }
}

process.exit(morts.length ? 1 : 0);
