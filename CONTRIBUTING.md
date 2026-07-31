# Contribuer

Les corrections sont la raison d'être de ce dépôt. Le corpus est incomplet par construction : signaler ce qui manque ou ce qui est faux est la contribution la plus utile.

Avant toute chose, lisez la [charte éditoriale](CHARTE.md). Elle s'impose aux contributeurs comme aux mainteneurs.

## Trois façons de contribuer

**1. Signaler une erreur ou un manque** — ouvrez un [ticket](../../issues/new/choose). C'est la voie la plus simple et elle est parfaitement suffisante.

**2. Proposer une modification** — modifiez le fichier JSON concerné et ouvrez une pull request.

**3. Améliorer le site** — accessibilité, lisibilité mobile, performance, clarté des libellés. Le code n'a aucune dépendance : gardons-le ainsi.

## La règle non négociable

**Toute donnée doit être accompagnée d'une source vérifiable.** Une contribution sans source est refusée, quelle que soit son évidence apparente. Une source doit comporter :

```json
{ "titre": "...", "url": "https://...", "editeur": "...", "type": "officiel", "consulte_le": "2026-07-31" }
```

`type` vaut `officiel` (document du candidat ou de son équipe) ou `media` (rédaction identifiée).

Les sites agrégateurs de programmes et les encyclopédies collaboratives ne sont **jamais** des sources acceptables. Ils peuvent vous mettre sur une piste : remontez alors jusqu'au document d'origine et citez celui-ci.

## Ajouter une proposition

1. Trouvez le document source officiel.
2. Ajoutez une entrée dans `data/propositions.json` :

```json
{
  "id": "nomcandidat-theme-01",
  "candidat": "id-du-candidat",
  "theme": "id-du-theme",
  "titre": "Titre court, factuel, sans adjectif d'appréciation",
  "resume": "2 à 4 phrases dans le vocabulaire du candidat.",
  "citation": "Verbatim exact si la formulation compte.",
  "chiffrage": "Le chiffrage annoncé par le candidat, ou null",
  "statut_verification": "source-primaire",
  "sources": [ { "...": "..." } ]
}
```

3. Si cette proposition répond à une question clé existante de `data/clivages.json`, renseignez la position du candidat.
4. Lancez `node scripts/validate.mjs`.

**Convention d'identifiant :** `nomdefamille-theme-NN`, en minuscules sans accent.

## Ajouter une question clé

C'est la contribution la plus sensible, parce qu'elle structure la comparaison.

- La question doit admettre des **options mutuellement exclusives**, formulées de façon à ce qu'un lecteur puisse vérifier lui-même le classement à partir de la source.
- Les options doivent couvrir l'éventail réel des positions, pas seulement celles des candidats déjà documentés.
- **Avant d'ouvrir la PR, cherchez la position de tous les candidats principaux sur cette question**, et laissez la case vide si elle n'existe pas. Une question clé ajoutée avec une seule position renseignée déséquilibre la comparaison.
- N'ajoutez jamais un candidat à une option par déduction à partir de son parti ou de ses votes passés.

## Ajouter ou mettre à jour un candidat

Un candidat entre dans `data/candidats.json` dès lors qu'il s'est publiquement déclaré, ou que sa candidature est activement évoquée par des rédactions identifiées. Un candidat qui se retire passe en `"statut": "retire"` avec une `date_retrait` : il n'est **jamais** supprimé.

## Style d'écriture

- Vocabulaire du candidat, pas le vôtre.
- Pas d'adverbes d'appréciation (« seulement », « pas moins de », « à peine »).
- Pas de guillemets ironiques.
- Verbes neutres : « propose », « déclare », « annonce ». Évitez « prétend », « admet », « reconnaît ».
- Si une formulation vous semble impossible à rendre neutre, ajoutez la citation textuelle et laissez le lecteur juger.

## Conflit d'intérêts

Si vous êtes salarié, bénévole, adhérent ou prestataire d'une campagne, d'un parti ou d'un candidat, indiquez-le dans votre pull request. Ce n'est pas disqualifiant, mais cela doit être visible.

## Relecture

Une pull request est fusionnée si :

- toutes les données sont sourcées au niveau requis ;
- `node scripts/validate.mjs` passe ;
- la formulation respecte la charte ;
- l'ajout ne crée pas de déséquilibre de traitement entre candidats.

En cas de désaccord sur une formulation, la discussion se fait publiquement dans la pull request, et la citation textuelle tranche.
