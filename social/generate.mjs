#!/usr/bin/env node
/**
 * Programmes 2027 — générateur de visuels pour les réseaux sociaux.
 *
 * Produit des SVG 1080×1350 (format 4:5, celui qui occupe le plus d'écran sur
 * Instagram) directement à partir des fichiers data/*.json. Les visuels restent
 * donc toujours synchronisés avec les données et leurs sources.
 *
 * Usage :
 *   node social/generate.mjs              # tout générer
 *   node social/generate.mjs carrousels   # un seul type
 *   node social/generate.mjs --png        # convertir en PNG (ImageMagick requis)
 *
 * Types : carrousels · fiches · flou · veille
 *
 * Aucune dépendance npm. La conversion PNG optionnelle utilise `convert`
 * (ImageMagick) ou `rsvg-convert` s'ils sont installés.
 */

import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'social', 'out');

const W = 1080, H = 1350;

/* ---------------------------------------------------------------- palette */

const C = {
  bg: '#101319',
  bgAlt: '#171b23',
  card: '#1d222c',
  ink: '#f4f6fa',
  inkSoft: '#a8b0be',
  inkFaint: '#6f7889',
  line: '#2b313c',
  accent: '#7fb3e3',
  ok: '#5fc98f',
  warn: '#e8b866',
  diff: '#ea8a8a'
};

const FONT = "'DejaVu Sans','Liberation Sans','Helvetica Neue',Arial,sans-serif";
const MONO = "'DejaVu Sans Mono','Liberation Mono',monospace";

/* -------------------------------------------------------------- utilitaires */

const data = (f) => JSON.parse(readFileSync(join(ROOT, 'data', `${f}.json`), 'utf8'));

const esc = (s) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&apos;');

/** Largeur moyenne d'un glyphe, en fraction de la taille de police.
 *  Calibré sur DejaVu Sans, qui est large : mieux vaut surévaluer et couper
 *  une ligne plus tôt que laisser un titre déborder du visuel. */
const RATIO = { 700: 0.65, 600: 0.61, 400: 0.57 };

/** Découpe un texte en lignes tenant dans `width` pixels. */
function wrap(text, width, size, weight = 400) {
  const max = Math.floor(width / (size * (RATIO[weight] ?? 0.55)));
  const lines = [];
  let cur = '';
  for (const word of String(text).split(/\s+/)) {
    if (!cur.length) { cur = word; continue; }
    if ((cur + ' ' + word).length <= max) cur += ' ' + word;
    else { lines.push(cur); cur = word; }
  }
  if (cur) lines.push(cur);
  return lines;
}

/** Bloc de texte multiligne. Renvoie { svg, height }. */
function block(text, { x, y, width, size, weight = 400, fill = C.ink, lh = 1.3, maxLines = 99, anchor = 'start' }) {
  let lines = wrap(text, width, size, weight);
  if (lines.length > maxLines) {
    lines = lines.slice(0, maxLines);
    lines[maxLines - 1] = lines[maxLines - 1].replace(/\s+\S*$/, '') + '…';
  }
  const step = size * lh;
  const svg = lines.map((l, i) =>
    `<text x="${x}" y="${y + size * 0.82 + i * step}" font-family="${FONT}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}">${esc(l)}</text>`
  ).join('\n');
  return { svg, height: lines.length * step };
}

function pill(text, { x, y, fill = C.accent, bg = 'rgba(127,179,227,.14)', size = 26 }) {
  const w = text.length * size * 0.58 + 40;
  return {
    svg: `<rect x="${x}" y="${y}" width="${w}" height="${size * 1.85}" rx="${size}" fill="${bg}" stroke="${fill}" stroke-opacity=".45"/>
<text x="${x + 20}" y="${y + size * 1.26}" font-family="${FONT}" font-size="${size}" font-weight="600" fill="${fill}">${esc(text)}</text>`,
    width: w,
    height: size * 1.85
  };
}

function frame(inner, { bg = C.bg } = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<rect width="${W}" height="${H}" fill="${bg}"/>
${inner}
</svg>`;
}

/** Bandeau de marque en pied de visuel. */
function footer(note = 'programmes-2027 · données sourcées, méthodologie publique') {
  return `<line x1="80" y1="${H - 132}" x2="${W - 80}" y2="${H - 132}" stroke="${C.line}" stroke-width="2"/>
<text x="80" y="${H - 88}" font-family="${FONT}" font-size="26" font-weight="700" fill="${C.ink}">PROGRAMMES 2027</text>
<text x="80" y="${H - 54}" font-family="${FONT}" font-size="22" fill="${C.inkFaint}">${esc(note)}</text>`;
}

function header(kicker, { color = C.accent } = {}) {
  // Le crénage élargi est rendu différemment selon le moteur SVG : on réduit la
  // taille sur les libellés longs pour ne jamais déborder de la zone utile.
  const txt = kicker.toUpperCase();
  const size = txt.length > 22 ? 20 : txt.length > 16 ? 24 : 27;
  const ls = txt.length > 22 ? 2 : 3;
  return `<rect x="80" y="96" width="72" height="8" rx="4" fill="${color}"/>
<text x="80" y="164" font-family="${FONT}" font-size="${size}" font-weight="700" fill="${color}" letter-spacing="${ls}">${esc(txt)}</text>`;
}

const write = (dir, name, svg) => {
  mkdirSync(join(OUT, dir), { recursive: true });
  writeFileSync(join(OUT, dir, `${name}.svg`), svg);
  return join(dir, `${name}.svg`);
};

/* ------------------------------------------------------------- chargement */

const meta = data('meta');
const themes = data('themes');
const candidats = data('candidats');
const propositions = data('propositions');
const clivages = data('clivages');

const cand = (id) => candidats.find((c) => c.id === id);
const theme = (id) => themes.find((t) => t.id === id) || { nom: id };
const propsOf = (id) => propositions.filter((p) => p.candidat === id);

const joursAvant = Math.max(0, Math.ceil(
  (new Date(meta.election.premier_tour + 'T00:00:00') - new Date()) / 86400000
));

/* ------------------------------------------------------- 1. carrousels */

function carrousels() {
  const faits = [];

  for (const cl of clivages) {
    const entries = Object.entries(cl.positions || {});
    if (entries.length < 2) continue; // traité par le format « zones de flou »

    const dir = `carrousel-${cl.id}`;
    // Purge les diapositives précédentes : le nombre d'options peut avoir changé.
    try { rmSync(join(OUT, dir), { recursive: true, force: true }); } catch { /* système de fichiers en lecture seule */ }
    const slides = [];

    /* — couverture — */
    {
      let y = 300;
      const q = block(cl.question, { x: 80, y, width: W - 160, size: 82, weight: 700, lh: 1.18 });
      y += q.height + 60;
      const s = block(
        `${entries.length} candidat${entries.length > 1 ? 's' : ''} ont une position publique documentée sur cette question.`,
        { x: 80, y, width: W - 160, size: 36, fill: C.inkSoft, lh: 1.4 }
      );
      slides.push(frame(`${header(theme(cl.theme).nom)}
${q.svg}
${s.svg}
<text x="80" y="${H - 200}" font-family="${FONT}" font-size="30" font-weight="600" fill="${C.accent}">Faites glisser →</text>
${footer()}`));
    }

    /* — une diapositive par option retenue — */
    const groupes = {};
    entries.forEach(([cid, p]) => { (groupes[p.option] ||= []).push(cid); });

    for (const [optId, cids] of Object.entries(groupes)) {
      const label = cl.options.find((o) => o.id === optId)?.label || optId;
      let y = 260;
      const t = block(label, { x: 80, y, width: W - 160, size: 66, weight: 700, lh: 1.2 });
      y += t.height + 70;

      const cartes = cids.map((cid) => {
        const c = cand(cid);
        const p = propositions.find((x) => x.id === cl.positions[cid].proposition);
        const src = p?.sources?.[0];
        const h = 176;
        const svg = `<rect x="80" y="${y}" width="${W - 160}" height="${h}" rx="18" fill="${C.card}"/>
<rect x="80" y="${y}" width="10" height="${h}" rx="5" fill="${c?.couleur || C.accent}"/>
<text x="122" y="${y + 62}" font-family="${FONT}" font-size="42" font-weight="700" fill="${C.ink}">${esc(c?.nom || cid)}</text>
<text x="122" y="${y + 106}" font-family="${FONT}" font-size="28" fill="${C.inkSoft}">${esc(c?.parti || '')}</text>
<text x="122" y="${y + 148}" font-family="${MONO}" font-size="23" fill="${C.inkFaint}">source : ${esc(src?.editeur || 'voir le site')}</text>`;
        y += h + 20;
        return svg;
      }).join('\n');

      slides.push(frame(`${header(theme(cl.theme).nom)}
${t.svg}
${cartes}
${footer('Sources complètes en légende et sur le site')}`));
    }

    /* — ce que personne ne dit — */
    {
      const muets = candidats.filter((c) =>
        c.statut === 'declare' && !(cl.positions || {})[c.id]
      );
      let y = 280;
      const t = block('Et les autres ?', { x: 80, y, width: W - 160, size: 76, weight: 700 });
      y += t.height + 44;
      const s = block(
        `${muets.length} candidats déclarés n'ont aucune position publique documentée sur cette question.`,
        { x: 80, y, width: W - 160, size: 38, fill: C.inkSoft, lh: 1.4 }
      );
      y += s.height + 56;

      const liste = muets.slice(0, 9).map((c) => {
        const svg = `<circle cx="94" cy="${y + 14}" r="9" fill="${c.couleur}"/>
<text x="122" y="${y + 26}" font-family="${FONT}" font-size="34" fill="${C.ink}">${esc(c.nom)}</text>`;
        y += 56;
        return svg;
      }).join('\n');

      const reste = muets.length > 9
        ? `<text x="122" y="${y + 26}" font-family="${FONT}" font-size="30" fill="${C.inkFaint}">et ${muets.length - 9} autres…</text>`
        : '';

      slides.push(frame(`${header('Zone de flou', { color: C.warn })}
${t.svg}
${s.svg}
${liste}
${reste}
${footer('Une case vide ≠ pas d’avis. C’est une position non publiée.')}`, { bg: C.bgAlt }));
    }

    /* — méthode — */
    slides.push(frame(`${header('Méthode', { color: C.ok })}
${block('D’où viennent ces informations ?', { x: 80, y: 260, width: W - 160, size: 62, weight: 700, lh: 1.2 }).svg}
${block('Chaque position affichée provient d’un document publié par le candidat ou de propos rapportés par une rédaction identifiée. Rien n’est déduit de son parti ou de ses votes passés.', { x: 80, y: 430, width: W - 160, size: 34, fill: C.inkSoft, lh: 1.45 }).svg}
${block('Les données sont publiques, versionnées et corrigeables par n’importe qui. Aucune évaluation, aucun classement, aucune recommandation de vote.', { x: 80, y: 700, width: W - 160, size: 34, fill: C.inkSoft, lh: 1.45 }).svg}
${pill('Lien dans la bio', { x: 80, y: 950, fill: C.ok, bg: 'rgba(95,201,143,.14)', size: 32 }).svg}
${footer()}`, { bg: C.bgAlt }));

    slides.forEach((svg, i) => faits.push(write(dir, String(i + 1).padStart(2, '0'), svg)));
  }

  return faits;
}

/* ---------------------------------------------------------- 2. fiches */

function fiches() {
  const faits = [];
  const eligibles = candidats.filter((c) => propsOf(c.id).length > 0);

  for (const c of eligibles) {
    const ps = propsOf(c.id).slice(0, 3);
    let y = 250;

    const n = block(c.nom, { x: 80, y, width: W - 160, size: 84, weight: 700, lh: 1.1 });
    y += n.height + 16;
    const p = block(c.parti, { x: 80, y, width: W - 160, size: 38, fill: C.inkSoft });
    y += p.height + 50;

    const etat = {
      'complet': ['Programme complet publié', C.ok],
      'partiel': ['Programme partiel', C.ok],
      'orientations': ['Orientations publiées', C.warn],
      'corpus-existant': ['Corpus programmatique existant', C.warn],
      'aucun-publie-2027': ['Aucun programme 2027 publié', C.inkFaint]
    }[c.etat_programme] || ['—', C.inkFaint];

    const badge = pill(etat[0], { x: 80, y, fill: etat[1], bg: 'rgba(255,255,255,.06)', size: 28 });
    y += badge.height + 40;

    // Le pied de page doit décrire la nature réelle des sources affichées :
    // un candidat sans document de campagne ne doit pas laisser croire qu'il en a un.
    const toutesOfficielles = ps.every((p) => p.statut_verification === 'source-primaire');
    const aucuneOfficielle = ps.every((p) => p.statut_verification !== 'source-primaire');
    const noteSource = toutesOfficielles
      ? 'Propositions issues de ses documents de campagne'
      : aucuneOfficielle
        ? 'Propos rapportés par des médias — aucun document de campagne publié'
        : 'Documents de campagne et propos rapportés par des médias';

    const total = propsOf(c.id).length;
    const compte = block(
      total > ps.length
        ? `${total} propositions sourcées — les ${ps.length} premières`
        : `${total} proposition${total > 1 ? 's' : ''} sourcée${total > 1 ? 's' : ''}`,
      { x: 80, y, width: W - 160, size: 28, fill: C.inkFaint }
    );
    y += compte.height + 40;

    const mesures = ps.map((prop, i) => {
      const t = block(prop.titre, { x: 136, y: y + 8, width: W - 240, size: 36, weight: 600, lh: 1.28, maxLines: 3 });
      const num = `<text x="80" y="${y + 38}" font-family="${MONO}" font-size="34" font-weight="700" fill="${c.couleur}">${i + 1}</text>`;
      let inner = num + '\n' + t.svg;
      let hh = t.height;
      if (prop.chiffrage) {
        const ch = block(prop.chiffrage, { x: 136, y: y + hh + 20, width: W - 240, size: 28, fill: C.accent, maxLines: 2 });
        inner += '\n' + ch.svg;
        hh += ch.height + 20;
      }
      y += hh + 46;
      return inner;
    }).join('\n');

    faits.push(write('fiches', `fiche-${c.id}`, frame(`${header('Fiche candidat', { color: c.couleur })}
${n.svg}
${p.svg}
${badge.svg}
${compte.svg}
${mesures}
${footer(noteSource)}`)));
  }

  return faits;
}

/* ------------------------------------------------------------ 3. flou */

function flou() {
  const muettes = clivages.filter((cl) => Object.keys(cl.positions || {}).length < 2);
  if (!muettes.length) return [];

  let y = 280;
  const t = block('Ce dont personne ne parle', { x: 80, y, width: W - 160, size: 84, weight: 700, lh: 1.14 });
  y += t.height + 44;
  const s = block(
    `${muettes.length} questions sur lesquelles moins de deux candidats ont pris une position publique documentée.`,
    { x: 80, y, width: W - 160, size: 36, fill: C.inkSoft, lh: 1.4 }
  );
  y += s.height + 60;

  // On ne dépasse jamais le filet du pied de page : on empile tant qu'il reste
  // de la place, puis on renvoie le reste vers un compteur.
  const LIMITE = H - 200;
  const morceaux = [];
  let affichees = 0;
  for (const cl of muettes) {
    const q = block(cl.question, { x: 122, y, width: W - 240, size: 34, weight: 600, lh: 1.28, maxLines: 2 });
    if (y + q.height + 66 > LIMITE) break;
    morceaux.push(
      `<rect x="80" y="${y + 10}" width="18" height="18" rx="4" fill="${C.warn}" fill-opacity=".8"/>\n` +
      q.svg + '\n' +
      `<text x="122" y="${y + q.height + 26}" font-family="${FONT}" font-size="25" fill="${C.inkFaint}">${esc(theme(cl.theme).nom)}</text>`
    );
    y += q.height + 66;
    affichees++;
  }
  const reste = muettes.length > affichees
    ? `<text x="122" y="${y + 26}" font-family="${FONT}" font-size="28" fill="${C.inkFaint}">et ${muettes.length - affichees} autres questions sans réponse…</text>`
    : '';

  const svg = frame(`${header('Zones de flou', { color: C.warn })}
${t.svg}
${s.svg}
${morceaux.join('\n')}
${reste}
${footer('Le silence d’un candidat est une information, pas un oubli')}`, { bg: C.bgAlt });

  return [write('flou', `zones-de-flou-${meta.derniere_mise_a_jour}`, svg)];
}

/* ---------------------------------------------------------- 4. veille */

function veille() {
  const declares = candidats.filter((c) => c.statut === 'declare').length;
  const avecProg = candidats.filter((c) =>
    ['complet', 'partiel', 'orientations', 'corpus-existant'].includes(c.etat_programme)
  ).length;
  const officielles = propositions.filter((p) => p.statut_verification === 'source-primaire').length;

  const stats = [
    [`J−${joursAvant}`, 'avant le 1er tour'],
    [String(candidats.length), 'candidats et prétendants suivis'],
    [String(declares), 'candidatures déclarées'],
    [`${avecProg}/${candidats.length}`, 'ont publié des éléments de programme'],
    [String(propositions.length), `propositions sourcées, dont ${officielles} officielles`]
  ];

  let y = 268;
  const t = block('Où en est la campagne', { x: 80, y, width: W - 160, size: 80, weight: 700, lh: 1.15 });
  y += t.height + 14;
  const d = block(`Mise à jour du ${meta.derniere_mise_a_jour}`, { x: 80, y, width: W - 160, size: 30, fill: C.inkFaint });
  y += d.height + 46;

  // Pas de retour à la ligne ici : les libellés sont tronqués s'ils débordent,
  // pour ne jamais chevaucher le pied de page.
  const corps = stats.map(([big, lab]) => {
    const l = block(lab, { x: 80, y: y + 72, width: W - 160, size: 30, fill: C.inkSoft, maxLines: 1 });
    const svg = `<text x="80" y="${y + 54}" font-family="${MONO}" font-size="62" font-weight="700" fill="${C.accent}">${esc(big)}</text>\n${l.svg}`;
    y += 132;
    return svg;
  }).join('\n');

  const svg = frame(`${header('Point hebdo')}
${t.svg}
${d.svg}
${corps}
${footer('Chiffres générés automatiquement depuis les données du dépôt')}`);

  return [write('veille', `veille-${meta.derniere_mise_a_jour}`, svg)];
}

/* ------------------------------------------------------------- export PNG */

function toPng(fichiers) {
  let bin = null, style = null;
  for (const [cmd, kind] of [['rsvg-convert', 'rsvg'], ['convert', 'magick']]) {
    try { execFileSync('which', [cmd], { stdio: 'ignore' }); bin = cmd; style = kind; break; } catch { /* absent */ }
  }
  if (!bin) {
    console.log('\n  PNG ignoré : ni rsvg-convert ni ImageMagick trouvés.');
    console.log('  Les SVG s’importent directement dans Figma, Canva ou Illustrator.');
    return 0;
  }
  let n = 0;
  for (const f of fichiers) {
    const src = join(OUT, f), dst = src.replace(/\.svg$/, '.png');
    try {
      if (style === 'rsvg') execFileSync(bin, ['-w', String(W), '-h', String(H), src, '-o', dst]);
      else execFileSync(bin, ['-density', '144', '-background', 'none', src, '-resize', `${W}x${H}`, dst]);
      n++;
    } catch (e) {
      console.error(`  ✖ ${f} : ${e.message.split('\n')[0]}`);
    }
  }
  return n;
}

/* ------------------------------------------------------------------ main */

const args = process.argv.slice(2);
const wantPng = args.includes('--png');
const types = args.filter((a) => !a.startsWith('--'));
const veut = (t) => !types.length || types.includes(t);

console.log('\nProgrammes 2027 — génération des visuels sociaux\n');

let tous = [];
if (veut('carrousels')) { const f = carrousels(); console.log(`  ${String(f.length).padStart(3)}  diapositives de carrousel`); tous = tous.concat(f); }
if (veut('fiches'))     { const f = fiches();     console.log(`  ${String(f.length).padStart(3)}  fiches candidat`);          tous = tous.concat(f); }
if (veut('flou'))       { const f = flou();       console.log(`  ${String(f.length).padStart(3)}  visuel « zones de flou »`); tous = tous.concat(f); }
if (veut('veille'))     { const f = veille();     console.log(`  ${String(f.length).padStart(3)}  point hebdomadaire`);       tous = tous.concat(f); }

if (wantPng) {
  const n = toPng(tous);
  if (n) console.log(`\n  ${n} PNG générés.`);
}

console.log(`\n✔ ${tous.length} visuels dans social/out/ (1080×1350).`);
console.log('  Légendes et règles de publication : social/LIGNE-EDITORIALE.md\n');

if (!existsSync(join(ROOT, 'social', 'LIGNE-EDITORIALE.md'))) {
  console.warn('  ⚠ LIGNE-EDITORIALE.md introuvable — les règles de publication sont manquantes.\n');
}
