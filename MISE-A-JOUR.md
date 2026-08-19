# Plan d'actualisation jusqu'au scrutin

Un comparateur de programmes ne vaut que par sa fraîcheur. Ce document fixe le rythme, la procédure et les points de bascule connus, de juillet 2026 au 2 mai 2027.

---

## Calendrier de la campagne

| Échéance | Date | Effet sur les données |
|---|---|---|
| Parlement du Parti socialiste | 25 août 2026 | Arrête les modalités et le calendrier de la primaire |
| Dépôt des candidatures à la primaire PS | 15 septembre 2026 (évoqué, non arrêté) | Fige le champ des prétendants socialistes |
| Livre de Bruno Retailleau | fin septembre 2026 (annoncé) | Première matière programmatique d'un candidat majeur non documenté |
| Décision de Bruno Le Maire | octobre 2026 (annoncée) | Statut candidat |
| Primaire fermée du Parti socialiste | octobre 2026 (date à confirmer) | Élimine plusieurs candidatures socialistes, en consacre une |
| Publication des programmes détaillés | hiver 2026-2027 (usage) | Pic de charge principal |
| Période de recueil des parrainages | ~janvier-mars 2027 | Filtre décisif : 500 parrainages, 30 départements minimum, 10 % max par département |
| Publication de la liste officielle par le Conseil constitutionnel | mars 2027 | **Bascule** : passage des « prétendants » aux candidats officiels |
| Professions de foi officielles | avril 2027 | Source de référence absolue, remplace les sites de campagne |
| Campagne officielle | ~début avril 2027 | Gel progressif des modifications de structure |
| **1er tour** | **18 avril 2027** | Réduction à deux candidats |
| **2nd tour** | **2 mai 2027** | Archivage, passage du dépôt en lecture seule |

*Les dates du scrutin ont été confirmées par le gouvernement le 1er juillet 2026 ([LCP](https://lcp.fr/actualites/presidentielle-2027-la-liste-des-candidats-deja-en-lice-et-des-pretendants-436373)). Les dates de la primaire socialiste sont rapportées par la presse et **ne sont arrêtées par aucune source de niveau 1** à ce jour. Les autres dates sont indicatives et à réviser à chaque passe.*

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
4. **Compléter les questions clés.** Pour chaque nouvelle proposition, se demander si elle répond à une question clé existante. Si oui, **verser la position au ticket de décision** — le classement ne s'écrit jamais sans arbitrage humain. Si elle crée une nouvelle question, **chercher activement la position des autres candidats** avant de la proposer (règle 5 de la charte).
5. **Revérifier les entrées `source-media`.** Chercher si un document officiel est paru depuis ; le cas échéant, promouvoir l'entrée en `source-primaire` et remplacer la source.
6. **Contrôler les liens morts.** Contrôle des URL modifiées ou signalées par le ticket de veille.
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

1. **Marine Le Pen / RN** — aucun programme 2027 publié, constat vérifié le 10 août sur les deux sites. Une entrée en `source-media` sur les retraites. Candidate majeure : le déséquilibre reste le défaut le plus visible du corpus.
2. **Bruno Retailleau** — quatre entrées, toutes en `source-media`. Aucun document programmatique publié sur son site officiel. Livre annoncé fin septembre 2026.
3. **Jean-Luc Mélenchon** — le corpus « L'Avenir en commun » 2025 compte plusieurs centaines de mesures. Quatre entrées intégrées sur 18 chapitres. Le chapitre 17 « Europe » est prioritaire : il débloquerait un clivage sur l'appartenance à l'Union européenne.
4. **Gauche non-mélenchoniste** — issue de la primaire PS inconnue ; champ clarifié d'ici fin octobre 2026.
5. **Écologistes** — stratégie en cours de redéfinition après l'abandon de la primaire.
6. **`clivages.json` trop court** — 12 questions, objectif 30-40. Un clivage « appartenance à l'Union européenne » est à portée, à deux extractions près (Mélenchon chapitre 17, Attal tribune du 24 juin 2026).
7. **Thèmes non couverts** — `fiscalite` reste à zéro entrée. `logement` et `sante` en comptent une chacune. `education` a été renforcé par l'intégration du ticket #1.

### Déséquilibre de couverture

Au 19 août 2026, après intégration des tickets #1, #2 et #3 : 62 propositions, 8 candidats documentés sur 35, dont deux concentrent 61 % des entrées. Vingt-sept candidats n'ont aucune entrée.

Ce déséquilibre n'est pas un choix éditorial : il reflète l'état de publication des candidats. Il est signalé dans l'avertissement de `meta.json` et doit l'être partout où un tableau comparatif est affiché.

---

## Automatisation

Une passe planifiée s'exécute chaque lundi. Elle relève les statuts, vérifie les sites de campagne connus, extrait les propositions nouvelles, contrôle les liens et dépose un compte rendu dans `veille/`.

### Ce qu'elle peut commiter elle-même

Parce qu'aucun jugement éditorial n'y intervient :

- l'ajout de propositions en `source-primaire`, reprises du document publié par le candidat ;
- les corrections d'URL, de `site_officiel` et de `programme_url` ;
- le retrait ou le remplacement des liens morts ;
- la mise à jour de `meta.json` ;
- la validation de schéma et d'intégrité référentielle (`scripts/validate.mjs`) ;
- la génération des visuels sociaux (`social/generate.mjs`).

### Ce qui exige une décision humaine

Consignée dans un ticket public `[Décision]` :

- **le classement d'un candidat dans une option d'une question clé** ;
- **la création, la suppression ou la reformulation d'une question clé ou d'une de ses options** ;
- **tout changement de `statut` d'un candidat** ;
- l'extraction et la reformulation définitives des propositions issues d'une source média.

Une erreur de classement sur un sujet politique se propage vite et se corrige lentement. Ce sont les seuls endroits du dépôt où une erreur produit un tableau propre, faux, et que rien ne signale.

### Traçabilité des passes automatiques

- tout commit automatique cite la décision appliquée et le ticket dont elle provient ;
- une passe qui ne change rien dépose malgré tout un compte rendu dans `veille/` ;
- une passe qui échoue dépose un compte rendu décrivant l'échec. Une panne silencieuse est indistinguable d'un abandon : c'est ce qui s'est produit entre le 31 juillet et le 19 août 2026, où une permission manquante a interrompu la chaîne sans laisser de trace pendant trois semaines.

---

## Gel de fin de campagne

À partir de la publication de la liste officielle par le Conseil constitutionnel :

- les professions de foi officielles deviennent la source de référence ; les sites de campagne passent en source secondaire ;
- les candidats non retenus passent en `retire` et sont conservés, jamais supprimés — l'historique fait partie de l'information ;
- aucune modification de la charte, de la nomenclature des thèmes ou de la formulation des questions clés dans les deux semaines précédant le premier tour : seules les corrections factuelles sourcées sont acceptées ;
- après le second tour, le dépôt passe en archive : bandeau explicite, données figées, tag de version finale.
