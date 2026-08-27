# Plan d'actualisation jusqu'au scrutin

Un comparateur de programmes ne vaut que par sa fraîcheur. Ce document fixe le rythme, la procédure et les points de bascule connus, de juillet 2026 au 2 mai 2027.

---

## Calendrier de la campagne

| Échéance | Date | Effet sur les données |
|---|---|---|
| ~~Parlement du Parti socialiste~~ | 25 août 2026 | *Fait.* PS et Place publique ont ratifié les modalités de la primaire |
| Dépôt des candidatures à la primaire sociale-démocrate | 1er au 15 septembre 2026 | Fige le champ des prétendants socialistes |
| Livre de Bruno Retailleau | fin septembre 2026 (annoncé) | Première matière programmatique d'un candidat majeur non documenté |
| Décision de Bruno Le Maire | octobre 2026 (annoncée) | Statut candidat |
| Primaire de la gauche socialiste et démocratique | 9-10 et 16-17 octobre 2026 | Élimine plusieurs candidatures socialistes, en consacre une |
| Publication des programmes détaillés | hiver 2026-2027 (usage) | Pic de charge principal |
| Période de recueil des parrainages | ~janvier-mars 2027 | Filtre décisif : 500 parrainages, 30 départements minimum, 10 % max par département |
| Publication de la liste officielle par le Conseil constitutionnel | mars 2027 | **Bascule** : passage des « prétendants » aux candidats officiels |
| Professions de foi officielles | avril 2027 | Source de référence absolue, remplace les sites de campagne |
| Campagne officielle | ~début avril 2027 | Gel progressif des modifications de structure |
| **1er tour** | **18 avril 2027** | Réduction à deux candidats |
| **2nd tour** | **2 mai 2027** | Archivage, passage du dépôt en lecture seule |

*Les dates du scrutin ont été confirmées par le gouvernement le 1er juillet 2026 ([LCP](https://lcp.fr/actualites/presidentielle-2027-la-liste-des-candidats-deja-en-lice-et-des-pretendants-436373)). Les dates de la primaire sociale-démocrate ont été arrêtées le 25 août 2026 par le Conseil national du PS et l'Assemblée politique nationale de Place publique ([LCP](https://lcp.fr/actualites/presidentielle-dates-candidats-prix-tout-ce-qu-il-faut-savoir-sur-la-primaire-sociale)). Les autres dates sont indicatives et à réviser à chaque passe.*

---

## Cadence de mise à jour

| Période | Cadence | Portée |
|---|---|---|
| Août 2026 → décembre 2026 | **hebdomadaire**, le lundi | Statuts des candidats, nouveaux programmes publiés, nouvelles questions clés |
| Janvier → mars 2027 | **hebdomadaire**, le lundi | Programmes détaillés, chiffrages, parrainages |
| Liste officielle → 1er tour | **2 à 3 fois par semaine** | Professions de foi, mises à jour, corrections |
| Entre les deux tours | **quotidienne** | Deux candidats seulement, forte visibilité |
| Après le 2 mai 2027 | **gel** | Archive figée, bandeau « données historiques » |

Chaque passe laisse une trace, même si elle ne change rien : un compte rendu dans `veille/` vaut mieux qu'un dépôt qui semble abandonné.

---

## Procédure d'une passe de mise à jour

1. **Relever les statuts.** Parcourir la liste de veille (ci-dessous) et vérifier chaque candidat : déclaré, retiré, désigné, éliminé en primaire.
2. **Vérifier les sites officiels.** Pour chaque candidat dont `programme_url` est renseigné, vérifier que l'URL répond et que le contenu n'a pas changé. Pour ceux dont il est `null`, vérifier si un programme est apparu.
3. **Extraire les nouvelles propositions.** Une entrée par mesure, dans le vocabulaire du candidat, avec citation quand la formulation compte.
4. **Compléter les questions clés.** Pour chaque nouvelle proposition, se demander si elle répond à une question clé existante. Si oui, classer le candidat en rattachant la proposition. Si la position ne rentre dans aucune option, créer l'option ou laisser vide — jamais d'approximation. Si elle appelle une nouvelle question, **chercher activement la position des autres candidats** avant de l'ouvrir (règle 5 de la charte).
5. **Revérifier les entrées `source-media`.** Chercher si un document officiel est paru depuis ; le cas échéant, promouvoir l'entrée en `source-primaire` et remplacer la source.
6. **Contrôler les liens morts.** Assuré par la CI (`scripts/check-links.mjs`), pas par la passe — voir « Automatisation » ci-dessous. Traiter les échecs signalés par le workflow de la semaine précédente.
7. **Regénérer les visuels sociaux** : `node social/generate.mjs --png`. Sans cette étape, les chiffres publiés sur les réseaux seront ceux de la semaine précédente.
8. **Mettre à jour `meta.json`** : `derniere_mise_a_jour` et `version_donnees`.
9. **Valider** : `node scripts/validate.mjs` doit passer sans erreur. En cas d'échec, ne rien pousser.
10. **Commiter** avec un message décrivant ce qui change et pourquoi, et citant la décision appliquée.
11. **Déposer un compte rendu** dans `veille/AAAA-MM-JJ-*.md`, y compris quand la passe échoue ou ne change rien.

---

## Liste de veille

**Sources institutionnelles**

- Conseil constitutionnel — parrainages et liste officielle : https://www.conseil-constitutionnel.fr
- CNCCFP — financement des campagnes : https://www.cnccfp.fr
- Vie publique / Legifrance — textes et décrets de convocation

**Sources de suivi des candidatures**

- LCP — Assemblée nationale, dossier « Présidentielle 2027 » : https://lcp.fr/dossiers/presidentielle-2027-434148
- Rédactions politiques nationales (franceinfo, Public Sénat, France 24, Le Monde, AFP)

**Sites officiels de campagne — du candidat**

| Candidat | Site de campagne |
|---|---|
| Gabriel Attal | https://attalpresident.fr/programme |
| Édouard Philippe | https://www.edouardphilippe.fr/#priorites |
| Jean-Luc Mélenchon | https://melenchon2027.fr/programme2025/livre/ |
| Bruno Retailleau | https://www.avecretailleau.fr/ |
| Marine Le Pen | https://marinelepen.com/ |
| Nicolas Dupont-Aignan | https://www.dupontaignan.fr/ |
| Clara Egger | https://solutiondemocratique.fr/ |

**Sites de parti — à ne pas confondre avec les précédents**

| Parti | Site |
|---|---|
| Rassemblement national | https://rassemblementnational.fr/ |
| Debout la France | https://www.debout-la-france.fr/ |
| Lutte ouvrière | https://www.lutte-ouvriere.org/ |
| Reconquête | https://www.parti-reconquete.fr/ |
| Union populaire républicaine | https://www.upr.fr/ |
| Les Patriotes | https://les-patriotes.fr/ |

À compléter au fil des lancements de sites de campagne.

### Deux leçons de méthode

**Chercher le site du candidat, pas seulement celui du parti.** C'est ainsi que `marinelepen.com` et `dupontaignan.fr` ont été trouvés le 10 août 2026, tous deux absents du dépôt depuis des semaines alors que le site du parti y figurait.

**Les petites formations rendent plus que les grandes.** Leurs candidats publient des documents courts, signés et immédiatement exploitables — tracts, professions de foi, listes de mesures prioritaires. La procédure les traitait comme des sites à faible rendement : sur la passe du 10 août, `dupontaignan.fr` a produit plus d'entrées en source primaire que l'ensemble des sites des candidats majeurs.

### Sources à ne jamais utiliser

Les sites agrégateurs de programmes générés automatiquement, nombreux sur ce créneau : `elyseescope`, `monvote2027`, `sondages-presidentielle2027`, `candidatspresidentielles2027`, `votons-2027`, `testpolitique`, `election-presidentielle-francaise-2027`, `le-francais-moyen`, `candidator` et similaires. Ils contiennent des contradictions internes vérifiables — par exemple des âges de départ à la retraite différents pour le même candidat sur deux pages. Ils dominent souvent la première page des résultats de recherche. Ils peuvent servir de piste, jamais de preuve.

Leur danger n'est pas d'être grossièrement faux : c'est d'afficher des mesures parfois voisines du document officiel, ce qui donne un faux sentiment de vérifiabilité.

**La règle vise le rôle, pas le type de site.** Un site de candidat qui publie un comparateur des programmes des autres candidats — `solutiondemocratique.fr` le fait — est une source de niveau 1 **pour son seul candidat**, et jamais pour les autres.

---

## Dettes connues à combler

Priorités décroissantes, à traiter dès que les sources existent :

1. **Marine Le Pen / RN** — aucun programme 2027 publié, constat revérifié le 27 août 2026 sur `marinelepen.com`. Deux entrées, toutes deux en `source-media`. Un plan d'économies de 125 milliards d'euros est annoncé pour l'ouverture du débat budgétaire, fin septembre : ce sera la première matière chiffrée du Rassemblement national.
2. **Bruno Retailleau** — huit entrées, toutes en `source-media`. Aucun document programmatique sur `avecretailleau.fr`. Projet de réforme des retraites annoncé « dans quelques jours » le 27 août, livre annoncé fin septembre 2026.
3. **Jean-Luc Mélenchon** — le corpus « L'Avenir en commun » 2025 compte plusieurs centaines de mesures ; six entrées intégrées sur 18 chapitres. Le chapitre 17 « Europe » reste à extraire : la position du candidat sur l'Union européenne est aujourd'hui documentée par une déclaration de débat, pas par le programme.
4. **Gauche non-mélenchoniste** — champ clarifié par la primaire de la gauche socialiste et démocratique, dépôt des candidatures du 1er au 15 septembre, scrutin les 9-10 et 16-17 octobre 2026.
5. **Écologistes** — Marine Tondelier entre au corpus le 28 août 2026 avec deux entrées. Aucun programme publié.
6. **`clivages.json`** — 14 questions, objectif 30-40. Deux questions ouvertes le 28 août : « héritages » (7 positions) et « appartenance à l'Union européenne » (2 positions). Trois questions restent sous le seuil de deux positions et n'apparaissent qu'en zone de flou : `code-travail`, `regle-or`, `accord-1968`.
7. **Thèmes faibles** — `logement` : 1 entrée. `sante` : 3. `defense` : 3. Le thème `fiscalite`, à zéro depuis l'origine, a été ouvert le 28 août 2026 et compte 7 entrées.

### Déséquilibre de couverture

Au 28 août 2026 : **96 propositions, 10 candidats documentés sur 35**, dont deux concentrent 61,5 % des entrées. Vingt-cinq candidats n'ont aucune entrée.

La part d'Attal et Philippe ne baisse pas, et c'est un effet de structure : ce sont les deux seuls candidats qui publient des documents programmatiques en continu, et une passe automatique amplifie mécaniquement ceux qui publient. La correction ne peut pas venir de la seule veille des sites de campagne. Elle vient des séquences où tous les candidats parlent du même sujet en même temps — débats, dossiers thématiques de la presse parlementaire, universités d'été — qui documentent plusieurs candidats d'un coup et sur une base comparable. Le débat du Medef du 27 août 2026 a fait entrer deux candidats au corpus et ouvert deux questions clés.

Ce déséquilibre n'est pas un choix éditorial : il reflète l'état de publication des candidats. Il est signalé dans l'avertissement de `meta.json` et doit l'être partout où un tableau comparatif est affiché.

---

## Automatisation

Une passe planifiée s'exécute chaque lundi. Elle relève les statuts, vérifie les sites de campagne connus, extrait les propositions nouvelles, complète les questions clés, met à jour `meta.json`, régénère les visuels et dépose un compte rendu dans `veille/`.

**Elle publie directement sur `main`, sans validation préalable.** La justification de ce choix et les garanties qui l'encadrent sont dans [CHARTE.md](CHARTE.md), section 6.1.

### Ce qu'elle décide elle-même

Tout ce qui relève de la saisie et de la mise en ordre :

- ajout de propositions, en `source-primaire` comme en `source-media` ;
- classement d'un candidat dans une option d'une question clé, **à condition qu'une proposition sourcée de ce candidat soit rattachée au classement** ;
- création, reformulation ou suppression d'une question clé et de ses options ;
- changement de `statut` d'un candidat, **à condition qu'une source décrive l'acte** — déclaration, retrait, désignation, décision judiciaire ;
- corrections d'URL, de `site_officiel`, de `programme_url`, retrait des liens morts ;
- mise à jour de `meta.json`, validation, génération des visuels.

### Les quatre garde-fous

Ils remplacent le verrou d'arbitrage humain. Ils ne sont pas négociables.

1. **Pas de classement par approximation.** Une position qui ne correspond à aucune option existante n'est jamais rapprochée de la moins mauvaise. Ou bien une option est créée et le commit l'explique, ou bien la case reste vide. C'est le seul endroit du dépôt où une erreur produit un tableau propre, faux, et que rien ne signale — la parade n'est pas la validation préalable, c'est le refus de deviner.
2. **Pas de classement sans proposition rattachée.** `scripts/validate.mjs` échoue si une position ne cite pas une proposition existante appartenant au bon candidat. La contrainte est mécanique, pas déclarative.
3. **Traçabilité par commit.** Un commit par sujet, énonçant la décision, sa source et son raisonnement. Le compte rendu de `veille/` comporte une section « Décisions prises sans arbitrage humain » listant chaque décision et le commit à révoquer pour l'annuler.
4. **Réversibilité.** Chaque décision est isolée dans son commit. `git revert` suffit à en annuler une sans toucher aux autres.

### Le ticket hebdomadaire

Le ticket `[Décision]` disparaît. Il est remplacé par un ticket `[Veille]` qui **rend compte** au lieu de demander : ce qui a été publié, ce qui a été décidé et sur quelle base, ce qui reste incertain, l'état des dettes de couverture. Il n'attend aucune réponse et est fermé par la passe suivante.

Une question n'est posée au mainteneur que lorsqu'elle porte sur la ligne éditoriale elle-même — modifier la charte, changer la nature du site — et jamais sur le contenu d'une donnée.

### Contrôle des liens

La passe de veille **ne peut pas** contrôler ses propres sources : son outil de récupération de pages n'accepte que les URL déjà rencontrées dans la conversation ou dans un résultat de recherche, et refuse celles lues depuis `data/*.json`. Ce n'est pas une panne, c'est une limite structurelle constatée les 19 et 27 août 2026.

Le contrôle est donc délégué à la CI, qui n'a pas cette restriction : `scripts/check-links.mjs`, exécuté par `.github/workflows/liens.yml` chaque lundi à 6 h et à chaque modification de `data/`. Le script échoue sur tout code 4xx ou 5xx, signale les redirections sans échouer, et détecte le cas où l'absence totale de réponse trahit un réseau bloqué plutôt que des liens morts.

Ne jamais conclure d'une exécution locale que des liens sont morts : seul le résultat de la CI fait foi.

---

## Gel de fin de campagne

À partir de la publication de la liste officielle par le Conseil constitutionnel :

- les professions de foi officielles deviennent la source de référence ; les sites de campagne passent en source secondaire ;
- les candidats non retenus passent en `retire` et sont conservés, jamais supprimés — l'historique fait partie de l'information ;
- aucune modification de la charte, de la nomenclature des thèmes ou de la formulation des questions clés dans les deux semaines précédant le premier tour : seules les corrections factuelles sourcées sont acceptées ;
- après le second tour, le dépôt passe en archive : bandeau explicite, données figées, tag de version finale.
