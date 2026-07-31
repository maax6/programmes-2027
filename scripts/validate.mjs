#!/usr/bin/env node
/**
 * Validation d'intégrité des données de Programmes 2027.
 * Aucune dépendance. Usage : node scripts/validate.mjs
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const warnings = [];

const err = (m) => errors.push(m);
const warn = (m) => warnings.push(m);

const load = (name) => {
  try {
    return JSON.parse(readFileSync(join(ROOT, 'data', `${name}.json`), 'utf8'));
  } catch (e) {
    err(`data/${name}.json illisible ou JSON invalide : ${e.message}`);
    return null;
  }
};

const meta = load('meta');
const themes = load('themes');
const candidats = load('candidats');
const propositions = load('propositions');
const clivages = load('clivages');

if (errors.length) {
  console.error('\n✖ Erreurs bloquantes :\n' + errors.map((e) => '  · ' + e).join('\n') + '\n');
  process.exit(1);
}

const STATUTS = ['declare', 'conditionnel', 'pressenti', 'retire'];
const FAMILLES = ['extreme-gauche', 'gauche', 'centre', 'droite', 'extreme-droite', 'divers'];
const ETATS = ['complet', 'partiel', 'orientations', 'corpus-existant', 'aucun-publie-2027'];
const VERIFS = ['source-primaire', 'source-media', 'a-verifier'];
const TYPES_SOURCE = ['officiel', 'media'];
const ISO = /^\d{4}(-\d{2}){0,2}$/;

const themeIds = new Set(themes.map((t) => t.id));
const candIds = new Set(candidats.map((c) => c.id));
const propIds = new Set(propositions.map((p) => p.id));

/* --- unicité --- */
const dupes = (arr, label) => {
  const seen = new Set();
  arr.forEach((x) => {
    if (seen.has(x.id)) err(`${label} : identifiant dupliqué « ${x.id} »`);
    seen.add(x.id);
  });
};
dupes(themes, 'themes');
dupes(candidats, 'candidats');
dupes(propositions, 'propositions');
dupes(clivages, 'clivages');

/* --- sources --- */
const checkSources = (sources, where, obligatoire = true) => {
  if (!Array.isArray(sources) || !sources.length) {
    if (obligatoire) err(`${where} : au moins une source est obligatoire (charte, règle 1)`);
    return;
  }
  sources.forEach((s, i) => {
    const w = `${where} · source[${i}]`;
    if (!s.url || !/^https?:\/\//.test(s.url)) err(`${w} : URL absente ou invalide`);
    if (!s.titre) err(`${w} : titre manquant`);
    if (!s.editeur) warn(`${w} : éditeur manquant`);
    if (s.type && !TYPES_SOURCE.includes(s.type)) err(`${w} : type « ${s.type} » inconnu (${TYPES_SOURCE.join(', ')})`);
    if (!s.consulte_le) warn(`${w} : date de consultation manquante`);
    else if (!ISO.test(s.consulte_le)) err(`${w} : date « ${s.consulte_le} » non conforme (AAAA-MM-JJ)`);
  });
};

/* --- meta --- */
['nom', 'derniere_mise_a_jour', 'version_donnees', 'depot', 'avertissement'].forEach((k) => {
  if (!meta[k]) err(`meta.json : champ « ${k} » manquant`);
});
if (!meta.election?.premier_tour || !ISO.test(meta.election.premier_tour)) err('meta.json : election.premier_tour invalide');

/* --- themes --- */
themes.forEach((t) => {
  if (!t.id || !t.nom) err(`themes : entrée incomplète (${JSON.stringify(t).slice(0, 60)}…)`);
  if (!t.description) warn(`themes/${t.id} : description manquante`);
});

/* --- candidats --- */
candidats.forEach((c) => {
  const w = `candidats/${c.id || '?'}`;
  if (!c.id || !c.nom || !c.parti) err(`${w} : id, nom et parti sont obligatoires`);
  if (!STATUTS.includes(c.statut)) err(`${w} : statut « ${c.statut} » inconnu (${STATUTS.join(', ')})`);
  if (!FAMILLES.includes(c.famille)) err(`${w} : famille « ${c.famille} » inconnue (${FAMILLES.join(', ')})`);
  if (!ETATS.includes(c.etat_programme)) err(`${w} : etat_programme « ${c.etat_programme} » inconnu`);
  if (c.couleur && !/^#[0-9a-fA-F]{6}$/.test(c.couleur)) err(`${w} : couleur « ${c.couleur} » invalide`);
  if (c.date_declaration && !ISO.test(c.date_declaration)) err(`${w} : date_declaration invalide`);
  if (c.statut === 'retire' && !c.date_retrait) warn(`${w} : statut « retire » sans date_retrait`);
  if (c.programme_url && c.etat_programme === 'aucun-publie-2027') warn(`${w} : programme_url renseigné mais etat_programme = aucun-publie-2027`);
  checkSources(c.sources, w);
});

/* --- propositions --- */
propositions.forEach((p) => {
  const w = `propositions/${p.id || '?'}`;
  if (!p.id || !p.titre || !p.resume) err(`${w} : id, titre et resume sont obligatoires`);
  if (!candIds.has(p.candidat)) err(`${w} : candidat « ${p.candidat} » inexistant`);
  if (!themeIds.has(p.theme)) err(`${w} : theme « ${p.theme} » inexistant`);
  if (!VERIFS.includes(p.statut_verification)) err(`${w} : statut_verification « ${p.statut_verification} » inconnu`);
  checkSources(p.sources, w);
  if (p.statut_verification === 'source-primaire' && !(p.sources || []).some((s) => s.type === 'officiel')) {
    err(`${w} : marqué « source-primaire » sans aucune source de type « officiel »`);
  }
  if (/\b(seulement|à peine|pas moins de|prétend|soi-disant)\b/i.test(`${p.titre} ${p.resume}`)) {
    warn(`${w} : vocabulaire potentiellement orienté détecté (charte, règle 3)`);
  }
});

/* --- clivages --- */
clivages.forEach((cl) => {
  const w = `clivages/${cl.id || '?'}`;
  if (!cl.id || !cl.question) err(`${w} : id et question sont obligatoires`);
  if (!themeIds.has(cl.theme)) err(`${w} : theme « ${cl.theme} » inexistant`);
  if (!Array.isArray(cl.options) || cl.options.length < 2) err(`${w} : au moins deux options sont nécessaires`);
  const optIds = new Set((cl.options || []).map((o) => o.id));
  Object.entries(cl.positions || {}).forEach(([cid, pos]) => {
    const wp = `${w} · position ${cid}`;
    if (!candIds.has(cid)) err(`${wp} : candidat inexistant`);
    if (!optIds.has(pos.option)) err(`${wp} : option « ${pos.option} » absente de la liste`);
    if (!pos.proposition) warn(`${wp} : aucune proposition rattachée, la source ne sera pas affichée`);
    else if (!propIds.has(pos.proposition)) err(`${wp} : proposition « ${pos.proposition} » inexistante`);
    else {
      const p = propositions.find((x) => x.id === pos.proposition);
      if (p.candidat !== cid) err(`${wp} : la proposition « ${pos.proposition} » appartient à « ${p.candidat} »`);
    }
  });
  if (Object.keys(cl.positions || {}).length < 2) {
    warn(`${w} : moins de deux positions documentées, la question n'apparaîtra qu'en « zone de flou »`);
  }
});

/* --- équilibre de traitement --- */
const parCandidat = {};
propositions.forEach((p) => { parCandidat[p.candidat] = (parCandidat[p.candidat] || 0) + 1; });
const declaresSansDonnees = candidats.filter((c) => c.statut === 'declare' && !parCandidat[c.id]);
if (declaresSansDonnees.length) {
  warn(`Équilibre : ${declaresSansDonnees.length} candidat(s) déclaré(s) sans aucune proposition référencée → ${declaresSansDonnees.map((c) => c.nom).join(', ')}`);
}

/* --- rapport --- */
const stats = {
  candidats: candidats.length,
  déclarés: candidats.filter((c) => c.statut === 'declare').length,
  propositions: propositions.length,
  'dont sources officielles': propositions.filter((p) => p.statut_verification === 'source-primaire').length,
  'questions clés': clivages.length,
  thèmes: themes.length
};

console.log('\nProgrammes 2027 — validation des données\n');
Object.entries(stats).forEach(([k, v]) => console.log(`  ${String(v).padStart(4)}  ${k}`));

if (warnings.length) {
  console.log(`\n⚠ ${warnings.length} avertissement(s) :`);
  warnings.forEach((w) => console.log('  · ' + w));
}

if (errors.length) {
  console.error(`\n✖ ${errors.length} erreur(s) bloquante(s) :`);
  errors.forEach((e) => console.error('  · ' + e));
  console.error('');
  process.exit(1);
}

console.log('\n✔ Données valides.\n');
