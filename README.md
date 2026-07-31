# Programmes 2027

**Comparer les programmes officiels des candidats à l'élection présidentielle française de 2027.**

Un outil citoyen, ouvert et non partisan. Chaque proposition affichée renvoie à sa source d'origine, son éditeur et sa date de consultation. Ce site ne note pas les candidats, n'évalue pas la faisabilité des mesures et n'émet aucune recommandation de vote.

- **Premier tour :** dimanche 18 avril 2027
- **Second tour :** dimanche 2 mai 2027
- **Site :** https://maax6.github.io/programmes-2027/

---

## L'état des données

Ce dépôt est ouvert **neuf mois avant le premier tour**. À cette date, la grande majorité des candidats déclarés n'a pas publié de programme. Le site reflète cet état de fait plutôt que de le masquer :

| État | Signification |
|---|---|
| `complet` | Programme complet publié |
| `partiel` | Une partie du programme est publiée |
| `orientations` | Grandes lignes ou priorités publiées, sans détail chiffré |
| `corpus-existant` | Programme d'une campagne précédente servant de référence, en cours d'actualisation |
| `aucun-publie-2027` | Rien de publié pour 2027 à ce jour |

Une case vide dans le comparateur signifie **« aucune position publique sourcée trouvée »**, jamais « pas d'avis ». Les cases ne sont jamais remplies par déduction à partir du parti du candidat.

---

## Structure du dépôt

```
.
├── index.html              Application (une seule page, routage par ancre)
├── assets/
│   ├── app.js              Rendu, comparateur, calcul des convergences
│   └── style.css           Styles, thème clair/sombre automatique
├── data/
│   ├── meta.json           Métadonnées de l'élection et du projet
│   ├── themes.json         Nomenclature des thèmes
│   ├── candidats.json      Candidats déclarés, conditionnels, pressentis, retirés
│   ├── propositions.json   Propositions sourcées, une entrée par mesure
│   └── clivages.json       Questions clés et positions documentées
├── scripts/
│   └── validate.mjs        Validation d'intégrité des données (aucune dépendance)
└── .github/workflows/      Déploiement GitHub Pages + validation en intégration continue
```

Aucun framework, aucun build, aucune dépendance npm. Le site est du HTML, du CSS et du JavaScript natif : il fonctionne tel quel sur GitHub Pages et survivra sans maintenance jusqu'au scrutin.

---

## Lancer en local

```bash
git clone https://github.com/maax6/programmes-2027.git
cd programmes-2027
python3 -m http.server 8000
# puis ouvrir http://localhost:8000
```

Un serveur est nécessaire : le site charge ses données via `fetch()`, bloqué en `file://`.

Valider les données après modification :

```bash
node scripts/validate.mjs
```

---

## Modèle de données

### `candidats.json`

```json
{
  "id": "attal-gabriel",
  "nom": "Gabriel Attal",
  "parti": "Renaissance",
  "famille": "centre",
  "statut": "declare",
  "date_declaration": "2026-05-22",
  "etat_programme": "orientations",
  "couleur": "#f2a33c",
  "site_officiel": "https://attalpresident.fr/",
  "programme_url": "https://attalpresident.fr/programme",
  "note": "Contexte factuel court.",
  "sources": [{ "titre": "...", "url": "...", "editeur": "...", "type": "officiel", "consulte_le": "2026-07-31" }]
}
```

`statut` : `declare` · `conditionnel` · `pressenti` · `retire`  
`famille` : `extreme-gauche` · `gauche` · `centre` · `droite` · `extreme-droite` · `divers`

### `propositions.json`

```json
{
  "id": "attal-travail-01",
  "candidat": "attal-gabriel",
  "theme": "travail-salaires",
  "titre": "Titre court et factuel",
  "resume": "Deux à quatre phrases dans le vocabulaire du candidat.",
  "citation": "Verbatim exact, optionnel mais recommandé.",
  "chiffrage": "Le chiffrage annoncé par le candidat, ou null",
  "statut_verification": "source-primaire",
  "sources": [{ "titre": "...", "url": "...", "editeur": "...", "type": "officiel", "consulte_le": "2026-07-31" }]
}
```

`statut_verification` : `source-primaire` (document du candidat) · `source-media` (propos rapportés) · `a-verifier`

### `clivages.json`

Une question clé, des options mutuellement exclusives, et les positions documentées :

```json
{
  "id": "retraites-age",
  "theme": "retraites",
  "question": "Sur quel levier agir pour les retraites ?",
  "options": [{ "id": "retour-60", "label": "Retour à la retraite à 60 ans" }],
  "positions": {
    "melenchon-jean-luc": { "option": "retour-60", "proposition": "melenchon-retraites-01" }
  }
}
```

C'est ce fichier qui alimente la matrice de convergence et les pages « accords / désaccords ». Un candidat n'y est rangé que si une source explicite le permet.

---

## Contribuer

Les corrections sont la raison d'être du dépôt. Voir [CONTRIBUTING.md](CONTRIBUTING.md).

En résumé : ouvrez un ticket avec la source, ou proposez directement une pull request modifiant le JSON concerné. Toute contribution accompagnée d'une **source officielle datée** est traitée en priorité. Toute contribution sans source est refusée, quelle que soit son évidence apparente.

Les règles éditoriales qui s'imposent à tous, y compris aux mainteneurs, sont dans [CHARTE.md](CHARTE.md).

Le rythme et la procédure de mise à jour jusqu'au scrutin sont décrits dans [MISE-A-JOUR.md](MISE-A-JOUR.md).

---

## Licences

- **Code** (`index.html`, `assets/`, `scripts/`) : MIT
- **Données** (`data/`) : CC BY-SA 4.0

Les contenus cités (extraits de programmes, citations) restent la propriété de leurs auteurs et sont reproduits à des fins d'information et de comparaison, avec attribution et lien vers la source.

## Indépendance

Ce projet n'est affilié à aucun candidat, aucun parti, aucune institution et aucun média. Il n'accepte aucun financement d'un candidat, d'un parti ou d'une structure liée à une campagne. Si cela devait changer, ce serait écrit ici en premier.
