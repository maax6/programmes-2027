# Ligne éditoriale — réseaux sociaux

Ce document complète [CHARTE.md](../CHARTE.md), section 10. En cas de contradiction, **la charte l'emporte**.

Le compte social sert à amener des gens vers des données sourcées. Il n'a pas d'existence propre : tout ce qu'il publie doit être vérifiable sur le site, et tout visuel est généré depuis `data/*.json` par `social/generate.mjs`. Aucun visuel n'est fabriqué à la main — c'est ce qui garantit qu'un chiffre affiché sur Instagram est le même que celui du dépôt.

---

## Ce qui est allégé par rapport à la charte

Le format impose des contraintes que le site n'a pas. Ces écarts sont assumés et bornés :

| Sur le site | Sur les réseaux |
|---|---|
| Source complète (titre, URL, éditeur, date) affichée sous chaque proposition | Nom de l'éditeur sur le visuel, **source complète en légende** |
| Résumé de 2 à 4 phrases | Titre de la mesure seul, formulation raccourcie |
| Aucune hiérarchie entre les propositions | Sélection des 3 premières propositions d'un candidat |
| Ton strictement descriptif | Accroches plus directes autorisées (« Ce dont personne ne parle ») |

## Ce qui n'est jamais allégé

Ces quatre points ne bougent pas, quel que soit le format :

1. **Aucune donnée non sourcée ne sort.** Si la source ne tient pas en légende, le post ne se fait pas.
2. **Traitement symétrique.** Un carrousel qui montre la position de deux candidats montre aussi, sur une diapositive dédiée, ceux qui ne se sont pas prononcés. Le générateur produit cette diapositive automatiquement : ne la supprimez pas au montage.
3. **Aucune évaluation, aucune recommandation de vote.** Pas de « bonne » ou « mauvaise » mesure, pas de classement, pas de test « quel candidat vous correspond ».
4. **Aucune déduction.** Une case vide reste vide. On ne comble jamais avec le programme du parti.

## Interdits de format

- Pas de sondages ni d'intentions de vote, y compris en story.
- Pas de photos de candidats. Le compte parle de mesures, pas de personnes — et cela évite les problèmes de droits.
- Pas de montage opposant deux candidats en « duel ». La comparaison se fait par question, jamais par affrontement.
- Pas de réponse polémique en commentaire. Une contestation factuelle se traite par un lien vers la source, ou par l'ouverture d'un ticket public si elle est fondée.
- Pas de contenu dans les deux semaines précédant le premier tour autre que des corrections factuelles (charte, section 9).

---

## Formats et cadence

Quatre formats, produits par `node social/generate.mjs` :

| Format | Dossier | Rythme | Rôle |
|---|---|---|---|
| **Carrousel comparatif** | `out/carrousel-<clivage>/` | 2 par semaine | Le cœur du compte. Une question clé, les positions documentées, ceux qui se taisent, la méthode. |
| **Point hebdo** | `out/veille/` | 1 par semaine, le lundi | État de la campagne en chiffres, généré depuis les données après la passe de veille. |
| **Zones de flou** | `out/flou/` | 1 tous les 15 jours | Les questions sans réponse. Format le plus difficile à accuser de partialité. |
| **Fiche candidat** | `out/fiches/` | au fil des publications | Publiée **uniquement** quand un candidat publie ou complète son programme. |

**Règle de séquencement des fiches candidat.** Une fiche n'est jamais publiée seule dans la semaine. Publier une fiche Attal un mardi et rien d'autre revient à offrir une exposition gratuite à un candidat. Regroupez : soit plusieurs fiches le même jour, soit une fiche accompagnée d'un carrousel où d'autres candidats apparaissent.

À ce jour, seuls 4 candidats sur 35 ont assez de données pour une fiche. C'est un déséquilibre réel du corpus, pas un choix éditorial — il est listé dans [MISE-A-JOUR.md](../MISE-A-JOUR.md) et doit être rappelé en légende tant qu'il dure.

---

## Structure d'une légende

```
[Accroche : la question, telle qu'elle figure sur le visuel]

[1 à 3 phrases factuelles, sans adjectif d'appréciation]

Sources :
· <Candidat> — <Titre du document>, <éditeur>, consulté le <date>
  <URL>
· <Candidat> — …

<N> candidats déclarés n'ont aucune position publique documentée
sur cette question à ce jour.

Données complètes, méthodologie et code source : lien en bio.
Une erreur ? Le dépôt est public, les corrections sourcées sont
traitées en priorité.

#presidentielle2027 #politique #France
```

Les hashtags restent sobres et non partisans. Jamais de hashtag de campagne, de slogan ni de nom de candidat seul en hashtag.

---

## Bio recommandée

```
Programmes 2027
Ce que les candidats proposent, avec les sources.
Aucune évaluation, aucune recommandation de vote.
Données publiques et corrigeables ↓
```

Le lien pointe vers le site, pas vers un agrégateur de liens : un intermédiaire de plus est un point de défiance de plus.

---

## Transparence du compte

À publier en post épinglé au lancement, et à tenir à jour :

- qui édite le compte ;
- l'absence de financement par un candidat, un parti ou une structure de campagne ;
- le lien vers la charte et vers le dépôt ;
- la procédure de correction.

Un comparateur qui demande de la transparence aux candidats se l'applique d'abord à lui-même. C'est aussi la seule défense utile le jour où un camp accusera le compte d'être orienté — et ce jour arrivera.

---

## Production

```bash
node social/generate.mjs            # tous les visuels, en SVG
node social/generate.mjs --png      # + conversion PNG (ImageMagick ou rsvg-convert)
node social/generate.mjs carrousels # un seul type
```

Sortie dans `social/out/`, au format 1080×1350 (4:5). Les SVG s'importent tels quels dans Figma, Canva ou Illustrator si vous voulez retoucher — mais toute retouche qui modifie une donnée affichée doit d'abord passer par le JSON, sinon le visuel et le site divergent.

`social/out/` est ignoré par git : les visuels se regénèrent, ils n'ont pas à être versionnés.
