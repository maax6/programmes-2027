# Propositions — un fichier par candidat

Ce répertoire est la **source de vérité** des propositions.

- `_index.json` liste les identifiants de candidats à charger, dans l'ordre.
- `<candidat>.json` contient les entrées de ce seul candidat. Le champ
  `candidat` de chaque entrée doit correspondre au nom du fichier ;
  `scripts/build-propositions.mjs` échoue sinon.

## Pourquoi ce découpage

Le fichier unique `data/propositions.json` a dépassé 85 Ko en août 2026.
À cette taille, la passe de veille automatique ne peut plus le réécrire
d'un bloc de façon fiable : l'écriture est tronquée. Le découpage ramène
chaque écriture hebdomadaire à un ou deux fichiers de moins de 30 Ko, et
limite le diff aux candidats qui ont bougé.

## L'agrégat

`data/propositions.json` existe toujours, mais c'est un **artefact**. Il est
lu par `assets/app.js` et `social/generate.mjs`, qui ont besoin d'un seul
appel. Il est reconstruit et commité par le workflow
`.github/workflows/aggregat.yml` à chaque modification de ce répertoire.

**Ne le modifiez jamais à la main.** Toute édition manuelle sera écrasée à
la prochaine exécution. Pour vérifier qu'il est à jour :

```
node scripts/build-propositions.mjs --check
```

`scripts/validate.mjs` lit les fichiers par candidat, pas l'agrégat : la
validation porte donc toujours sur la source.
