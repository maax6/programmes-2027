#!/usr/bin/env node
/**
 * Reconstruit l'agrégat data/propositions.json depuis data/propositions/*.json.
 *
 * Source de vérité : les fichiers par candidat, listés dans
 * data/propositions/_index.json. L'agrégat est un artefact : il existe parce
 * que le site (assets/app.js) et le générateur de visuels le lisent en un
 * seul appel, mais il ne doit jamais être édité à la main.
 *
 * Usage :
 *   node scripts/build-propositions.mjs          # écrit l'agrégat
 *   node scripts/build-propositions.mjs --check  # vérifie sans écrire, code 1 si écart
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIR = join(ROOT, 'data', 'propositions');
const CIBLE = join(ROOT, 'data', 'propositions.json');
const CHECK = process.argv.includes('--check');

const index = JSON.parse(readFileSync(join(DIR, '_index.json'), 'utf8'));
if (!Array.isArray(index)) {
  console.error('data/propositions/_index.json : tableau de noms attendu');
  process.exit(1);
}

const tout = [];
for (const nom of index) {
  const chemin = join(DIR, `${nom}.json`);
  if (!existsSync(chemin)) {
    console.error(`data/propositions/${nom}.json est listé dans _index.json mais absent`);
    process.exit(1);
  }
  const lot = JSON.parse(readFileSync(chemin, 'utf8'));
  if (!Array.isArray(lot)) {
    console.error(`data/propositions/${nom}.json : tableau attendu`);
    process.exit(1);
  }
  for (const p of lot) {
    if (p.candidat !== nom) {
      console.error(`data/propositions/${nom}.json : l'entrée « ${p.id} » appartient à « ${p.candidat} »`);
      process.exit(1);
    }
  }
  tout.push(...lot);
}

const rendu = JSON.stringify(tout, null, 2) + '\n';

if (CHECK) {
  const actuel = existsSync(CIBLE) ? readFileSync(CIBLE, 'utf8') : null;
  if (actuel === rendu) {
    console.log(`✔ data/propositions.json est à jour (${tout.length} entrées).`);
    process.exit(0);
  }
  console.error('\n✖ data/propositions.json ne correspond pas aux fichiers par candidat.');
  console.error('  L\'agrégat est un artefact : ne le modifiez pas à la main.');
  console.error('  Lancez « node scripts/build-propositions.mjs » et commitez le résultat.\n');
  process.exit(1);
}

writeFileSync(CIBLE, rendu);
console.log(`✔ data/propositions.json reconstruit : ${tout.length} entrées, ${index.length} candidats.`);
