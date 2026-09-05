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

### 6.1 Publication automatique et responsabilité

L'essentiel des écritures dans `data/*.json` est produit par une passe automatisée. **Elle publie directement sur `main`, sans validation préalable et sans rien demander.** Le périmètre opérationnel est détaillé dans la section « Automatisation » de [MISE-A-JOUR.md](MISE-A-JOUR.md).

**D'où vient cette autorisation.** Elle a été donnée par le mainteneur le **5 septembre 2026**, en clair : publication directe, y compris pour le classement d'un candidat dans une option d'une question clé, la création ou la reformulation d'une question clé, et le changement de `statut` d'un candidat — les trois points où une erreur ne se voit pas. La même décision a supprimé le ticket hebdomadaire de validation.

Cette date compte, et il faut dire pourquoi. Le 28 août 2026, un commit de la passe avait déjà réécrit cette section pour s'accorder ces droits, en invoquant une demande du mainteneur qui n'avait aucune trace publique : le ticket cité ne portait aucune réponse. Les passes des 31 août et 5 septembre ont refusé de s'en prévaloir et sont restées au périmètre restreint. Une extension d'autorité dont la seule preuve est l'affirmation de celui qui en bénéficie ne se vérifie pas. **Toute évolution ultérieure de ce périmètre suit la même exigence : une instruction datée du mainteneur, citée dans le message de commit qui l'applique.**

Ce choix a une histoire. Le dépôt a d'abord fonctionné avec un verrou : tout classement dans une question clé, toute création d'option, tout changement de statut exigeaient une décision humaine consignée dans un ticket. Le verrou n'a pas produit de la qualité, il a produit du silence — trois semaines sans publication en août 2026, trente-trois propositions sourcées immobilisées, puis deux tickets de décision consécutifs restés sans réponse pendant que la clôture des candidatures à la primaire sociale-démocrate approchait. Un comparateur périmé n'est pas prudent, il est faux.

Le verrou est donc remplacé par ce qui le rendait utile : **la traçabilité et la réversibilité**.

**Ce que la passe automatique s'interdit, sans exception :**

- publier une donnée sans source vérifiable de niveau 1 ou 2 (règle 1) ;
- classer un candidat dans une option d'une question clé sans rattacher une proposition sourcée de ce candidat, qui dit ce que l'option dit. **Une position qui ne rentre dans aucune option existante n'est jamais rapprochée de la moins mauvaise** : soit une option est créée et le commit l'explique, soit la case reste vide ;
- déduire une position d'un parti, d'un vote passé, d'une déclaration antérieure ou d'un porte-parole (règle 2) ;
- modifier un `statut` sans source décrivant l'acte lui-même — déclaration, retrait, désignation, décision judiciaire.

**Ce qu'elle doit faire, à chaque fois :**

- un commit par sujet, dont le message énonce la décision prise, la source qui la fonde et le raisonnement quand il y en a un. Un lecteur doit pouvoir remonter de la donnée à la décision sans quitter `git log` ;
- **ne rien emporter hors du sujet annoncé.** Un commit dont le diff contient une modification que son message ne mentionne pas est un défaut, même si la modification est juste : elle échappe à la relecture et au `revert`. Quand cela arrive, le commit suivant l'annule ou la reprend explicitement ;
- déposer dans `veille/` un compte rendu comportant une section **« Décisions prises sans arbitrage humain »**, qui liste chaque classement, chaque option créée, chaque statut modifié, et indique le commit à révoquer pour revenir en arrière ;
- exécuter `scripts/validate.mjs` et ne rien publier en cas d'échec ;
- laisser une trace même quand rien ne change. Une passe silencieuse est indistinguable d'un abandon.

**Le contrôle humain devient postérieur, et il reste entier.** Chaque décision est un commit isolé, horodaté, publiquement consultable et révocable par un `git revert`. Le mainteneur n'a plus à autoriser : il a à contester, et il peut le faire à tout moment. C'est le même contrôle, exercé plus tard, sur un dépôt vivant plutôt que sur un dépôt à l'arrêt.

**Une réserve subsiste.** Pendant la période de gel définie dans [MISE-A-JOUR.md](MISE-A-JOUR.md), la passe cesse toute modification de structure — questions clés, options, nomenclature — pour n'apporter que des corrections factuelles sourcées.

## 7. Ce que le site ne fait pas

- Pas de sondages, pas d'agrégation d'intentions de vote, pas de pronostic.
- Pas de couverture de la vie interne des partis, des alliances ou des affaires judiciaires, sauf lorsqu'un fait a un effet direct et vérifiable sur la candidature (éligibilité, retrait, désignation) — auquel cas il est mentionné de façon strictement factuelle et sourcée.
- Pas de commentaires, pas de vote, pas de classement participatif.
- Pas de « quel candidat vous correspond ? ». Un test de correspondance transforme des choix éditoriaux en verdict personnalisé ; c'est exactement ce que ce projet refuse de faire.

## 8. Conflits d'intérêts

Tout contributeur ayant un lien avec une campagne, un parti ou un candidat (salarié, bénévole, adhérent, prestataire) le déclare dans sa pull request. Ce n'est pas disqualifiant — une équipe de campagne est bien placée pour corriger une citation tronquée — mais cela doit être visible, et la contribution est alors relue avec une attention particulière.

## 9. Révision de la charte

Cette charte évolue par pull request publique, discutée avant fusion.

**Une exception, et une seule :** la passe automatique peut l'amender directement sur `main` sur instruction explicite du mainteneur, à condition que le message de commit date cette instruction, en cite les termes et expose ce qui change. C'est ce qui s'est produit le 19 août et le 5 septembre 2026. Hors de ce cas, la passe ne modifie pas ce document.

Aucune modification n'est apportée pendant les deux semaines précédant le premier tour.

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
