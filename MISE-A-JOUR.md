# Plan d'actualisation jusqu'au scrutin

Un comparateur de programmes ne vaut que par sa fraîcheur. Ce document fixe le rythme, la procédure et les points de bascule connus, de juillet 2026 au 2 mai 2027.

---

## Calendrier de la campagne

| Échéance | Date | Effet sur les données |
|---|---|---|
| Décision de Bruno Le Maire | octobre 2026 (annoncée) | Statut candidat |
| Primaire fermée du Parti socialiste | automne 2026 (date à confirmer) | Élimine plusieurs candidatures socialistes, en consacre une |
| Publication des programmes détaillés | hiver 2026-2027 (usage) | Pic de charge principal |
| Période de recueil des parrainages | ~janvier-mars 2027 | Filtre décisif : 500 parrainages, 30 départements minimum, 10 % max par département |
| Publication de la liste officielle par le Conseil constitutionnel | mars 2027 | **Bascule** : passage des « prétendants » aux candidats officiels |
| Professions de foi officielles | avril 2027 | Source de référence absolue, remplace les sites de campagne |
| Campagne officielle | ~début avril 2027 | Gel progressif des modifications de structure |
| **1er tour** | **18 avril 2027** | Réduction à deux candidats |
| **2nd tour** | **2 mai 2027** | Archivage, passage du dépôt en lecture seule |

*Les dates du scrutin ont été confirmées par le gouvernement le 1er juillet 2026 ([LCP](https://lcp.fr/actualites/presidentielle-2027-la-liste-des-candidats-deja-en-lice-et-des-pretendants-436373)). Les autres dates sont indicatives et à réviser à chaque passe.*

---

## Cadence de mise à jour

| Période | Cadence | Portée |
|---|---|---|
| Août 2026 → décembre 2026 | **hebdomadaire**, le lundi | Statuts des candidats, nouveaux programmes publiés, nouvelles questions clés |
| Janvier → mars 2027 | **hebdomadaire**, le lundi | Programmes détaillés, chiffrages, parrainages |
| Liste officielle → 1er tour | **2 à 3 fois par semaine** | Professions de foi, mises à jour, corrections |
| Entre les deux tours | **quotidienne** | Deux candidats seulement, forte visibilité |
| Après le 2 mai 2027 | **gel** | Archive figée, bandeau « données historiques » |

Chaque passe produit un commit, même si elle ne change rien : un commit « vérification du 1er septembre, aucun changement » vaut mieux qu'un dépôt qui semble abandonné.

**Passe automatisée.** Une tâche planifiée s'exécute chaque lundi matin : elle relève les statuts, vérifie les sites de campagne connus et ouvre un ticket `[Veille] Semaine du <date>` contenant les entrées JSON prêtes à intégrer. Elle **n'écrit jamais dans les fichiers de données** — le ticket est une proposition, l'intégration reste humaine. Voir la section « Automatisation » plus bas.

---

## Procédure d'une passe de mise à jour

1. **Relever les statuts.** Parcourir la liste de veille (ci-dessous) et vérifier chaque candidat : déclaré, retiré, désigné, éliminé en primaire.
2. **Vérifier les sites officiels.** Pour chaque candidat dont `programme_url` est renseigné, vérifier que l'URL répond et que le contenu n'a pas changé. Pour ceux dont il est `null`, vérifier si un programme est apparu.
3. **Extraire les nouvelles propositions.** Une entrée par mesure, dans le vocabulaire du candidat, avec citation quand la formulation compte.
4. **Compléter les questions clés.** Pour chaque nouvelle proposition, se demander si elle répond à une question clé existante. Si oui, renseigner la position. Si elle en crée une nouvelle, **chercher activement la position des autres candidats sur cette question** avant de l'ajouter (règle 5 de la charte).
5. **Revérifier les entrées `source-media`.** Chercher si un document officiel est paru depuis ; le cas échéant, promouvoir l'entrée en `source-primaire` et remplacer la source.
6. **Contrôler les liens morts.** Contrôle des URL modifiées ou signalées par le ticket de veille.
7. **Regénérer les visuels sociaux** : `node social/generate.mjs --png`. Sans cette étape, les chiffres publiés sur les réseaux seront ceux de la semaine précédente.
8. **Mettre à jour `meta.json`** : `derniere_mise_a_jour` et `version_donnees`.
9. **Valider** : `node scripts/validate.mjs` doit passer sans erreur.
10. **Commiter** avec un message décrivant ce qui change et pourquoi.

---

## Liste de veille

**Sources institutionnelles**

- Conseil constitutionnel — parrainages et liste officielle : https://www.conseil-constitutionnel.fr
- CNCCFP — financement des campagnes : https://www.cnccfp.fr
- Vie publique / Legifrance — textes et décrets de convocation

**Sources de suivi des candidatures**

- LCP — Assemblée nationale, dossier « Présidentielle 2027 » : https://lcp.fr/dossiers/presidentielle-2027-434148
- Rédactions politiques nationales (franceinfo, Public Sénat, France 24, Le Monde, AFP)

**Sites officiels de campagne connus**

| Candidat | Site |
|---|---|
| Gabriel Attal | https://attalpresident.fr/programme |
| Édouard Philippe | https://www.edouardphilippe.fr/#priorites |
| Jean-Luc Mélenchon | https://melenchon2027.fr/programme2025/livre/ |
| Bruno Retailleau | https://www.avecretailleau.fr/ |
| Marine Le Pen / RN | https://rassemblementnational.fr/ |
| Nathalie Arthaud / LO | https://www.lutte-ouvriere.org/ |
| Nicolas Dupont-Aignan / DLF | https://www.debout-la-france.fr/ |
| Éric Zemmour / Reconquête | https://www.parti-reconquete.fr/ |
| François Asselineau / UPR | https://www.upr.fr/ |
| Florian Philippot / Les Patriotes | https://les-patriotes.fr/ |
| Clara Egger / Solution démocratique | https://solutiondemocratique.fr/ |

À compléter au fil des lancements de sites de campagne.

**Ne jamais utiliser comme source** : les sites agrégateurs de programmes générés automatiquement, nombreux sur ce créneau. Ils contiennent des contradictions internes vérifiables (par exemple des âges de départ à la retraite différents pour le même candidat sur deux pages). Ils peuvent servir de piste de recherche, jamais de preuve.

---

## Dettes connues à combler

Priorités décroissantes, à traiter dès que les sources existent :

1. **Marine Le Pen / RN** — aucun programme 2027 publié à ce jour. Candidate majeure : le déséquilibre de couverture est le défaut le plus visible du corpus actuel.
2. **Bruno Retailleau** — candidat désigné d'un grand parti, aucun document programmatique publié sur son site officiel ; seuls des propos d'entretien sont disponibles.
3. **Jean-Luc Mélenchon** — le corpus « L'Avenir en commun » 2025 compte plusieurs centaines de mesures. Seules quatre entrées phares sont intégrées : extraction chapitre par chapitre à mener.
4. **Gauche non-mélenchoniste** — issue de la primaire PS inconnue ; positions à collecter une fois le champ clarifié.
5. **Écologistes** — stratégie en cours de redéfinition après l'abandon de la primaire.
6. **Questions clés** — le fichier `clivages.json` est volontairement court. Le porter à 30-40 questions couvrant tous les thèmes, en ne les ajoutant qu'accompagnées d'un effort de recherche symétrique.
7. **Thèmes non couverts** — logement, santé, fiscalité et éducation n'ont presque aucune donnée.

---

## Automatisation

Ce qui **peut** être automatisé sans risque :

- validation de schéma et d'intégrité référentielle (`scripts/validate.mjs`, exécuté en CI) ;
- détection de liens morts dans les sources ;
- détection de changement sur les pages `programme_url` (hash du contenu) pour déclencher une relecture humaine ;
- **collecte hebdomadaire** : une tâche planifiée ouvre chaque lundi un ticket `[Veille] Semaine du <date>` avec les changements de statut, les programmes nouvellement publiés, les propositions candidates au format JSON, les liens morts et l'état des dettes de couverture ;
- génération des visuels sociaux depuis les données (`social/generate.mjs`).

Ce qui **ne doit pas** être automatisé :

- l'écriture directe dans `data/*.json` ;
- l'extraction et la reformulation définitives des propositions ;
- le classement d'un candidat dans une option d'une question clé ;
- la publication d'une donnée sans relecture humaine.

Une erreur de classement sur un sujet politique se propage vite et se corrige lentement. Le coût d'une passe manuelle est très inférieur au coût d'une erreur. C'est pourquoi la tâche hebdomadaire produit une **proposition** dans un ticket, et jamais un commit.

---

## Gel de fin de campagne

À partir de la publication de la liste officielle par le Conseil constitutionnel :

- les professions de foi officielles deviennent la source de référence ; les sites de campagne passent en source secondaire ;
- les candidats non retenus passent en `retire` et sont conservés, jamais supprimés — l'historique fait partie de l'information ;
- aucune modification de la charte, de la nomenclature des thèmes ou de la formulation des questions clés dans les deux semaines précédant le premier tour : seules les corrections factuelles sourcées sont acceptées ;
- après le second tour, le dépôt passe en archive : bandeau explicite, données figées, tag de version finale.
