# Plan d'actualisation jusqu'au scrutin

Un comparateur de programmes ne vaut que par sa fraîcheur. Ce document fixe le rythme, la procédure et les points de bascule connus, de juillet 2026 au 2 mai 2027.

---

## Calendrier de la campagne

| Échéance | Date | Effet sur les données |
|---|---|---|
| ~~Parlement du Parti socialiste~~ | 25 août 2026 | *Fait.* PS et Place publique ont ratifié les modalités de la primaire |
| Officialisation de Fabien Roussel | 6 septembre 2026 (annoncée) | Statut candidat, après vote des militants PCF |
| Dépôt des candidatures à la primaire sociale-démocrate | 1er au 15 septembre 2026 | Fige le champ des prétendants socialistes |
| Livre de Bruno Retailleau | fin septembre 2026 (annoncé) | Première matière programmatique d'un candidat majeur non documenté |
| Plan d'économies de Marine Le Pen (125 Md€) | fin septembre 2026 (annoncé) | Première matière chiffrée du Rassemblement national |
| Décision de Bruno Le Maire | octobre 2026 (annoncée) | Statut candidat |
| Primaire de la gauche socialiste et démocratique | 9-10 et 16-17 octobre 2026 | Élimine plusieurs candidatures socialistes, en consacre une |
| Programme de Jean-Luc Mélenchon | novembre 2026 (annoncé) | Actualisation 2027 de « L'Avenir en commun » |
| Décision de François Hollande | décembre 2026 (annoncée) | Statut candidat |
| Publication des programmes détaillés | hiver 2026-2027 (usage) | Pic de charge principal |
| Période de recueil des parrainages | ~janvier-mars 2027 | Filtre décisif : 500 parrainages, 30 départements minimum, 10 % max par département |
| Publication de la liste officielle par le Conseil constitutionnel | mars 2027 | **Bascule** : passage des « prétendants » aux candidats officiels |
| Professions de foi officielles | avril 2027 | Source de référence absolue, remplace les sites de campagne |
| Campagne officielle | ~début avril 2027 | Gel progressif des modifications de structure |
| **1er tour** | **18 avril 2027** | Réduction à deux candidats |
| **2nd tour** | **2 mai 2027** | Archivage, passage du dépôt en lecture seule |

*Les dates du scrutin ont été confirmées par le gouvernement le 1er juillet 2026 ([LCP](https://lcp.fr/actualites/presidentielle-2027-la-liste-des-candidats-deja-en-lice-et-des-pretendants-436373)). Les dates de la primaire sociale-démocrate ont été arrêtées le 25 août 2026 par le Conseil national du PS et l'Assemblée politique nationale de Place publique ([LCP](https://lcp.fr/actualites/presidentielle-dates-candidats-prix-tout-ce-qu-il-faut-savoir-sur-la-primaire-sociale)). Le scrutin est électronique et **ouvert deux jours par tour** : du vendredi 9 octobre 8 h au samedi 10 octobre 20 h, puis du vendredi 16 octobre 8 h au samedi 17 octobre 20 h. C'est ce qui explique que certains comptes rendus le résument par une seule date et d'autres par deux ; l'article de recensement de LCP écrit « 10 et 11 octobre », c'est la seule source discordante et elle n'est pas retenue. Les autres dates sont indicatives et à réviser à chaque passe.*

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

1. **Relever les statuts.** Parcourir la liste de veille (ci-dessous) et vérifier chaque candidat : déclaré, retiré, désigné, éliminé en primaire. Vérifier aussi que le dépôt ne manque pas un candidat que la source de recensement liste déjà — c'est ainsi que Francis Lalanne est resté absent pendant cinq semaines.
2. **Chercher le site du candidat, pas celui du parti.** Avant toute autre chose, prendre un candidat dont le `site_officiel` porte une adresse de parti et chercher s'il a ouvert un site à son nom. Cinq fiches sont dans ce cas au 5 septembre 2026 : **Arthaud** (`lutte-ouvriere.org`), **Zemmour** (`parti-reconquete.fr`), **Philippot** (`les-patriotes.fr`), **Asselineau** (`upr.fr`), **Roussel** (`pcf.fr`). C'est le gisement le plus sûr du projet et il ne demande aucun arbitrage (voir « Deux leçons de méthode »).
3. **Vérifier les sites officiels connus.** Pour chaque candidat dont `programme_url` est renseigné, vérifier que l'URL répond et que le contenu n'a pas changé. Pour ceux dont il est `null`, vérifier si un programme est apparu.
4. **Extraire les nouvelles propositions.** Une entrée par mesure, dans le vocabulaire du candidat, avec citation quand la formulation compte.
5. **Compléter les questions clés.** Pour chaque nouvelle proposition, se demander si elle répond à une question clé existante. Si oui, classer le candidat en rattachant la proposition. Si la position ne rentre dans aucune option, créer l'option ou laisser vide — jamais d'approximation. Si elle appelle une nouvelle question, **chercher activement la position des autres candidats** avant de l'ouvrir (règle 5 de la charte).
6. **Revérifier les entrées `source-media`.** Chercher si un document officiel est paru depuis ; le cas échéant, promouvoir l'entrée en `source-primaire` et remplacer la source.
7. **Contrôler les liens morts.** Assuré par la CI (`scripts/check-links.mjs`), pas par la passe — voir « Automatisation » ci-dessous. Traiter les échecs signalés par le workflow de la semaine précédente.
8. **Regénérer les visuels sociaux** : `node social/generate.mjs --png`. Sans cette étape, les chiffres publiés sur les réseaux seront ceux de la semaine précédente.
9. **Mettre à jour `meta.json`** : `derniere_mise_a_jour` et `version_donnees`.
10. **Valider** : `node scripts/validate.mjs` doit passer sans erreur. En cas d'échec, ne rien pousser.
11. **Commiter** un sujet par commit, avec un message décrivant ce qui change et pourquoi. **Relire le diff avant de pousser** : un commit ne doit rien contenir que son message n'annonce.
12. **Déposer un compte rendu** dans `veille/AAAA-MM-JJ-*.md`, y compris quand la passe échoue ou ne change rien.

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
| Marine Tondelier | https://marinetondelier.fr/ |
| Nicolas Dupont-Aignan | https://www.dupontaignan.fr/ |
| Clara Egger | https://solutiondemocratique.fr/ |
| Fabien Verdier | https://fabienverdier.fr/ |

**Sites de parti — à ne pas confondre avec les précédents**

| Parti | Site |
|---|---|
| Rassemblement national | https://rassemblementnational.fr/ |
| Debout la France | https://www.debout-la-france.fr/ |
| Les Écologistes | https://lesecologistes.fr/ |
| Lutte ouvrière | https://www.lutte-ouvriere.org/ |
| Reconquête | https://www.parti-reconquete.fr/ |
| Union populaire républicaine | https://www.upr.fr/ |
| Les Patriotes | https://les-patriotes.fr/ |
| Parti communiste français | https://www.pcf.fr/ |
| La France humaniste | https://lafrancehumaniste.fr/ |

À compléter au fil des lancements de sites de campagne.

### Deux leçons de méthode

**Chercher le site du candidat, pas seulement celui du parti.** C'est ainsi que `marinelepen.com` et `dupontaignan.fr` ont été trouvés le 10 août 2026, puis `marinetondelier.fr` le 5 septembre — trois fois la même erreur, sur des fiches qui portaient l'adresse du parti. La leçon est désormais l'étape 2 de la procédure, avec la liste nominative des fiches restant à examiner : une leçon qu'on écrit sans l'inscrire dans la procédure ne s'applique pas.

**Les petites formations rendent plus que les grandes.** Leurs candidats publient des documents courts, signés et immédiatement exploitables — tracts, professions de foi, notes de blog, listes de mesures prioritaires. Quatre passes de suite, le gain de couverture est venu d'un site que le dépôt ne connaissait pas : `dupontaignan.fr` le 10 août, `lafrancehumaniste.fr` le 31 août, `marinetondelier.fr` et `fabienverdier.fr` le 5 septembre. Aucun candidat majeur n'a publié de document nouveau sur la même période. La veille des grands sites de campagne est le travail le moins rentable de la procédure ; elle reste nécessaire, elle ne doit pas être prioritaire.

### Sources à ne jamais utiliser

Les sites agrégateurs de programmes générés automatiquement, nombreux sur ce créneau : `elyseescope`, `monvote2027`, `sondages-presidentielle2027`, `candidatspresidentielles2027`, `votons-2027`, `testpolitique`, `election-presidentielle-francaise-2027`, `le-francais-moyen`, `objectif2027`, `candidator` et similaires. Ils contiennent des contradictions internes vérifiables — par exemple des âges de départ à la retraite différents pour le même candidat sur deux pages. Ils dominent souvent la première page des résultats de recherche. Ils peuvent servir de piste, jamais de preuve.

Leur danger n'est pas d'être grossièrement faux : c'est d'afficher des mesures parfois voisines du document officiel, ce qui donne un faux sentiment de vérifiabilité. Exemple relevé le 5 septembre 2026 : une recherche sur le programme de Marine Tondelier renvoie six agrégateurs en premières positions, dont l'un annonce « 161 mesures sourcées, dont 34 phares » — un décompte qu'aucun document consultable ne confirme.

**La règle vise le rôle, pas le type de site.** Un site de candidat qui publie un comparateur des programmes des autres candidats — `solutiondemocratique.fr` le fait — est une source de niveau 1 **pour son seul candidat**, et jamais pour les autres.

---

## Dettes connues à combler

Priorités décroissantes, à traiter dès que les sources existent :

1. **Marine Le Pen / RN** — aucun programme 2027 publié, constat revérifié le 5 septembre 2026 sur `marinelepen.com`. Deux entrées, toutes deux en `source-media`. Un plan d'économies de 125 milliards d'euros est annoncé pour l'ouverture du débat budgétaire, fin septembre : ce sera la première matière chiffrée du Rassemblement national.
2. **Bruno Retailleau** — huit entrées, toutes en `source-media`. Aucun document programmatique sur `avecretailleau.fr`. Projet de réforme des retraites annoncé « dans quelques jours » le 27 août, toujours pas publié au 5 septembre ; livre annoncé fin septembre 2026.
3. **Jean-Luc Mélenchon** — le corpus « L'Avenir en commun » 2025 compte plusieurs centaines de mesures ; six entrées intégrées sur 18 chapitres. Le candidat annonce son programme 2027 « prêt » en novembre 2026.
4. **Cinq `site_officiel` portant une adresse de parti** — Arthaud, Zemmour, Philippot, Asselineau, Roussel. Voir l'étape 2 de la procédure. Aucun arbitrage requis, rendement historiquement élevé.
5. **Candidats déclarés sans aucune entrée** — dix au 5 septembre : Arthaud, Batho, Bouamrane, Cazeneuve, Bertrand, Lisnard, Philippot, Asselineau, Mikolajczak, Lalanne. Cazeneuve est le cas le plus gênant : il s'exprime publiquement et régulièrement, mais sur des questions d'alliance que la règle 7 exclut.
6. **`clivages.json`** — 15 questions, objectif 30-40. Trois questions restent sous le seuil de deux positions et n'apparaissent qu'en zone de flou : `code-travail`, `regle-or`, `accord-1968`.
7. **Thèmes faibles** — `logement` : 2 entrées. `defense` : 3. `sante` : 4. `europe-international` : 4.

### Déséquilibre de couverture

Au 5 septembre 2026 : **107 propositions, 12 candidats documentés sur 38**, dont deux concentrent 56,1 % des entrées. Vingt-six candidats n'ont aucune entrée.

La part d'Attal et Philippe baisse depuis trois passes — 63 %, puis 61,5 %, 58,4 % et 56,1 % — et il faut être précis sur la cause, parce qu'elle commande la stratégie de veille. Elle ne baisse pas parce que les autres candidats majeurs se sont mis à publier : aucun ne l'a fait. Elle baisse parce que chaque passe a trouvé un document que le dépôt ignorait, sur un site de candidat modeste ou nouveau. La correction ne vient donc pas de la veille des grands sites de campagne, qui ne produit rien depuis le 27 août.

Elle vient de deux gisements, dans cet ordre de rendement :

1. **les sites de candidats que le dépôt ne connaît pas encore** — voir l'étape 2 de la procédure ;
2. **les séquences où tous les candidats parlent du même sujet en même temps** — débats, dossiers thématiques de la presse parlementaire, universités d'été — qui documentent plusieurs candidats d'un coup et sur une base comparable. Le débat du Medef du 27 août a fait entrer deux candidats au corpus et ouvert deux questions clés ; le débat de Sens du 29 août a fourni la matière de la question `comptes-publics`.

Ce déséquilibre n'est pas un choix éditorial : il reflète l'état de publication des candidats. Il est signalé dans l'avertissement de `meta.json` et doit l'être partout où un tableau comparatif est affiché.

---

## Automatisation

Une passe planifiée s'exécute chaque lundi. Elle relève les statuts, cherche les sites de campagne inconnus, vérifie les sites connus, extrait les propositions nouvelles, complète les questions clés, met à jour `meta.json`, régénère les visuels et dépose un compte rendu dans `veille/`.

**Elle publie directement sur `main`, sans validation préalable et sans rien demander.** L'origine de cette autorisation — une instruction du mainteneur datée du 5 septembre 2026 — et les garanties qui l'encadrent sont dans [CHARTE.md](CHARTE.md), section 6.1.

### Ce qu'elle décide elle-même

Tout ce qui relève de la saisie et de la mise en ordre :

- ajout de propositions, en `source-primaire` comme en `source-media` ;
- classement d'un candidat dans une option d'une question clé, **à condition qu'une proposition sourcée de ce candidat soit rattachée au classement** ;
- création, reformulation ou suppression d'une question clé et de ses options ;
- création d'une fiche candidat et changement de `statut`, **à condition qu'une source décrive l'acte** — déclaration, retrait, désignation, décision judiciaire ;
- corrections d'URL, de `site_officiel`, de `programme_url`, retrait des liens morts ;
- mise à jour de `meta.json`, validation, génération des visuels.

### Les quatre garde-fous

Ils remplacent le verrou d'arbitrage humain. Ils ne sont pas négociables.

1. **Pas de classement par approximation.** Une position qui ne correspond à aucune option existante n'est jamais rapprochée de la moins mauvaise. Ou bien une option est créée et le commit l'explique, ou bien la case reste vide. C'est le seul endroit du dépôt où une erreur produit un tableau propre, faux, et que rien ne signale — la parade n'est pas la validation préalable, c'est le refus de deviner.
2. **Pas de classement sans proposition rattachée.** `scripts/validate.mjs` échoue si une position ne cite pas une proposition existante appartenant au bon candidat. La contrainte est mécanique, pas déclarative.
3. **Traçabilité par commit.** Un commit par sujet, énonçant la décision, sa source et son raisonnement, et **ne contenant rien que son message n'annonce**. Le compte rendu de `veille/` comporte une section « Décisions prises sans arbitrage humain » listant chaque décision et le commit à révoquer pour l'annuler.
4. **Réversibilité.** Chaque décision est isolée dans son commit. `git revert` suffit à en annuler une sans toucher aux autres.

### Le compte rendu hebdomadaire

**La passe n'ouvre aucun ticket et n'attend aucune réponse.** Le ticket `[Décision]`, puis le ticket `[Veille]` qui devait lui succéder, sont l'un et l'autre supprimés : deux tickets de décision consécutifs sont restés sans réponse en août et septembre 2026 pendant que des échéances de calendrier passaient, et un ticket que personne ne lit est un point de blocage déguisé en garantie.

La sortie narrative de la passe est le fichier `veille/AAAA-MM-JJ-veille.md`. Il rend compte au lieu de demander : ce qui a été publié et sous quel commit, ce qui a été décidé et sur quelle base, ce qui a été délibérément écarté et pourquoi, ce qui reste incertain, les limites rencontrées, l'état des dettes de couverture. Il comporte obligatoirement la section « Décisions prises sans arbitrage humain » exigée par le garde-fou 3.

Le mainteneur conteste par `git revert`, ou en le disant. Il n'a rien à valider.

**Une seule chose sort encore de ce cadre :** une évolution du périmètre de la passe elle-même, ou de la nature du site. Elle exige une instruction explicite du mainteneur, datée et citée dans le message de commit qui l'applique (charte, règle 9). La passe ne se l'accorde jamais à elle-même.

### Contrôle des liens

La passe de veille **ne peut pas** contrôler ses propres sources : son outil de récupération de pages n'accepte que les URL déjà rencontrées dans la conversation ou dans un résultat de recherche, et refuse celles lues depuis `data/*.json`. Ce n'est pas une panne, c'est une limite structurelle constatée les 19 et 27 août 2026.

Le contrôle est donc délégué à la CI, qui n'a pas cette restriction : `scripts/check-links.mjs`, exécuté par `.github/workflows/liens.yml` chaque lundi à 6 h et à chaque modification de `data/`. Le script échoue sur tout code 4xx ou 5xx, signale les redirections sans échouer, et détecte le cas où l'absence totale de réponse trahit un réseau bloqué plutôt que des liens morts.

Ne jamais conclure d'une exécution locale que des liens sont morts : seul le résultat de la CI fait foi. **Le rapport du workflow doit être relevé à chaque passe** — il ne l'a pas été les 31 août et 5 septembre 2026.

---

## Gel de fin de campagne

À partir de la publication de la liste officielle par le Conseil constitutionnel :

- les professions de foi officielles deviennent la source de référence ; les sites de campagne passent en source secondaire ;
- les candidats non retenus passent en `retire` et sont conservés, jamais supprimés — l'historique fait partie de l'information ;
- aucune modification de la charte, de la nomenclature des thèmes ou de la formulation des questions clés dans les deux semaines précédant le premier tour : seules les corrections factuelles sourcées sont acceptées ;
- après le second tour, le dépôt passe en archive : bandeau explicite, données figées, tag de version finale.
