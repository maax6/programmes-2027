# Charte éditoriale

Ce document engage les mainteneurs autant que les contributeurs. Il prime sur toute considération de rapidité, d'audience ou de complétude.

## 1. Rien sans source

Aucune donnée n'est publiée sans au moins une source vérifiable comportant : titre, URL, éditeur, date de consultation.

Hiérarchie des sources, dans cet ordre :

1. **Officielle primaire** — document publié par le candidat ou son équipe : site de campagne, programme, profession de foi, discours retranscrit intégralement, communiqué.
2. **Média identifié** — entretien, compte rendu ou verbatim publié par une rédaction identifiable. Utilisable, marqué `source-media`.
3. **Agrégateur ou site tiers** — **jamais comme source unique.** Les sites comparateurs, générateurs de contenu et encyclopédies collaboratives peuvent servir de piste, jamais de preuve. Toute donnée qui n'a pu être remontée à un niveau 1 ou 2 est rejetée.

Cette règle vise le **rôle** joué par un site, pas son type. Un site de candidat qui publie un comparateur des programmes des autres candidats est une source de niveau 1 **pour son seul candidat**, et jamais pour les autres, quelle que soit la qualité apparente de sa page comparative.

Une source qui disparaît doit être remplacée ou l'entrée retirée. Le lien vers une archive est acceptable si l'original a été supprimé, à condition de le signaler.

## 2. Le vide est une information

L'absence de position est affichée comme telle. Elle n'est jamais comblée :

- par le programme du parti du candidat ;
- par ses positions passées ;
- par ses votes parlementaires ;
- par ce que « tout le monde sait » de sa famille politique.

Un candidat qui ne s'est pas prononcé publiquement sur une question apparaît comme non documenté. C'est souvent l'information la plus utile pour un électeur.

Un site qui annonce un programme ne vaut pas programme publié. Tant qu'aucune page de programme n'est accessible, `programme_url` reste vide.

## 3. Pas de reformulation orientée

Les résumés reprennent le vocabulaire du candidat, y compris quand ce vocabulaire est lui-même un choix politique. Quand une formulation est disputée ou porteuse d'enjeu, la citation textuelle est affichée à côté du résumé pour que le lecteur juge de l'écart.

Interdits : adverbes d'appréciation (« seulement », « pas moins de », « prétend »), guillemets ironiques, verbes de posture (« affirme », « prétend », « admet ») quand « propose » ou « déclare » suffit.

## 4. Pas d'évaluation

Le site ne dit pas si une mesure est bonne, réaliste, finançable, constitutionnelle ou compatible avec le droit européen. Il ne note pas les candidats. Il ne classe pas les programmes. Il n'émet aucune recommandation de vote.

Le chiffrage affiché est **celui annoncé par le candidat**, présenté comme tel. Un chiffrage indépendant (Cour des comptes, institut, presse spécialisée) peut être ajouté à condition d'être clairement identifié comme provenant d'un tiers, avec sa source.

Lorsqu'une source consacre son angle à l'évaluation d'une mesure — sa faisabilité, son coût, sa constitutionnalité — seul l'énoncé de la mesure est repris. L'analyse ne l'est pas, même attribuée.

## 5. Traitement symétrique

Tous les candidats sont soumis :

- aux mêmes règles de sourcing ;
- au même niveau de détail attendu ;
- à la même exigence de neutralité de formulation ;
- au même effort de recherche.

Aucune exception liée aux sondages, à la famille politique ou aux opinions des contributeurs. Un candidat marginal mal documenté est un défaut du projet, pas un choix éditorial.

Concrètement : lorsqu'une proposition est ajoutée pour un candidat sur un thème, l'ajout d'une question clé correspondante impose de chercher activement la position des autres candidats sur cette même question, et de laisser la case vide si elle n'existe pas.

La symétrie s'applique aussi aux statuts : deux candidats dans une situation identique portent le même statut, sauf source établissant la différence.

## 6. Traçabilité

Toutes les données vivent dans des fichiers JSON versionnés. Chaque modification est un commit horodaté, publiquement consultable et réversible. Aucune modification silencieuse : une correction de fond mentionne dans son message de commit ce qui était faux et pourquoi.

### 6.1 Saisie automatique et arbitrage humain

Une partie des écritures dans `data/*.json` est produite par une passe automatisée. Son périmètre est fixé ici et détaillé dans la section « Automatisation » de [MISE-A-JOUR.md](MISE-A-JOUR.md).

**Ce qui peut être commité automatiquement**, parce qu'aucun jugement éditorial n'y intervient :

- l'ajout de propositions en `source-primaire`, reprises du document du candidat ;
- les corrections d'URL, de `site_officiel` et de `programme_url` ;
- le retrait ou le remplacement des liens morts ;
- la mise à jour de `meta.json`.

**Ce qui exige une décision humaine explicite**, consignée dans un ticket public :

- le classement d'un candidat dans une option d'une question clé ;
- la création, la suppression ou la reformulation d'une question clé ou d'une de ses options ;
- tout changement de `statut` d'un candidat.

Ces trois réserves ne sont pas de précaution : ce sont les seuls endroits du dépôt où une erreur produit un tableau propre, faux, et que rien ne signale.

Tout commit automatique cite la décision qu'il applique et le ticket dont elle provient, afin qu'un lecteur puisse remonter de la donnée à l'arbitrage qui l'a autorisée. Une passe qui ne produit aucun changement dépose malgré tout un compte rendu dans `veille/` : un dépôt silencieux ne doit pas pouvoir être confondu avec un dépôt à jour.

## 7. Ce que le site ne fait pas

- Pas de sondages, pas d'agrégation d'intentions de vote, pas de pronostic.
- Pas de couverture de la vie interne des partis, des alliances ou des affaires judiciaires, sauf lorsqu'un fait a un effet direct et vérifiable sur la candidature (éligibilité, retrait, désignation) — auquel cas il est mentionné de façon strictement factuelle et sourcée.
- Pas de commentaires, pas de vote, pas de classement participatif.
- Pas de « quel candidat vous correspond ? ». Un test de correspondance transforme des choix éditoriaux en verdict personnalisé ; c'est exactement ce que ce projet refuse de faire.

## 8. Conflits d'intérêts

Tout contributeur ayant un lien avec une campagne, un parti ou un candidat (salarié, bénévole, adhérent, prestataire) le déclare dans sa pull request. Ce n'est pas disqualifiant — une équipe de campagne est bien placée pour corriger une citation tronquée — mais cela doit être visible, et la contribution est alors relue avec une attention particulière.

## 9. Révision de la charte

Cette charte peut évoluer par pull request publique, discutée avant fusion. Aucune modification n'est apportée pendant les deux semaines précédant le premier tour.

## 10. Réseaux sociaux — écarts assumés

Le projet publie sur les réseaux sociaux. Le format y impose des contraintes que le site n'a pas, et il serait malhonnête de prétendre appliquer la charte à l'identique. Les écarts sont donc listés ici, publiquement, plutôt que pratiqués en silence.

**Ce qui est allégé :**

- la source complète (titre, URL, éditeur, date) est reportée **en légende** au lieu d'être affichée sur le visuel, qui ne porte que le nom de l'éditeur ;
- les propositions sont réduites à leur titre, sans le résumé ;
- une sélection est opérée (les trois premières propositions d'un candidat) là où le site les affiche toutes ;
- les accroches peuvent être plus directes que la formulation strictement descriptive de la règle 3.

**Ce qui ne l'est jamais :** les règles 1 (rien sans source), 2 (le vide est une information), 4 (pas d'évaluation) et 5 (traitement symétrique) s'appliquent intégralement. Concrètement, un visuel comparatif comporte toujours une vue des candidats qui ne se sont pas prononcés, et aucun contenu ne recommande, ne note ni ne classe.

**Contrainte technique tenant lieu de garantie :** tous les visuels sont générés depuis `data/*.json` par `social/generate.mjs`. Aucun visuel n'est fabriqué à la main. Un chiffre publié sur un réseau social est donc, par construction, celui du dépôt à la date de génération.

Les règles opérationnelles détaillées sont dans [social/LIGNE-EDITORIALE.md](social/LIGNE-EDITORIALE.md).
