# Compte rendu de passe — 18 août 2026

Passe de veille du projet Programmes 2027. **Aucune donnée modifiée.**

## État du dépôt

| | |
|---|---|
| Dernier commit touchant `data/*.json` | 31 juillet 2026 (`aef2411`, `ec5ac56`) |
| Dernier commit, tous fichiers | 8 août 2026 (`51da64d`, correctif CI) |
| Tickets ouverts | #1, #2, #3, #4 |
| Tickets fermés | aucun |
| Version des données | inchangée depuis le corpus initial |

## Ce qui bloque

**1. La boucle attend une décision qui n'est jamais venue.**

Le ticket `[Décision]` #4, ouvert le 10 août, pose huit arbitrages et n'a reçu aucun commentaire. La procédure de veille ne lit que les tickets `[Décision]` **fermés** : sans réponse, chaque passe constate qu'il n'y a rien à appliquer, ne commite rien, et s'arrête.

C'est le comportement prévu. La section « Automatisation » de `MISE-A-JOUR.md` interdit explicitement l'écriture automatique dans `data/*.json` et précise que la tâche hebdomadaire « produit une proposition dans un ticket, et jamais un commit ». Le gel de trois semaines est donc conforme à la règle — mais du dehors, il ne se distingue pas d'un projet abandonné.

Sont bloquées derrière #4 : **33 propositions déjà rédigées et sourcées** (9 Dupont-Aignan, 7 Le Pen / Retailleau / Glucksmann, 17 Attal / Philippe / Egger), décrites dans #1, #2 et #3.

**2. Le connecteur ne peut plus écrire sur les tickets.**

Le connecteur GitHub utilisé par la tâche planifiée dispose des droits `Contents` (ce commit en atteste) mais pas de `Issues`. Toute écriture sur les tickets échoue :

```
POST /repos/maax6/programmes-2027/issues/4/comments   → 403
POST /repos/maax6/programmes-2027/issues/4/reactions  → 403
Resource not accessible by personal access token
```

La passe du **17 août s'est bien exécutée** mais n'a produit ni ticket ni commit : elle a probablement échoué à l'ouverture du ticket et s'est arrêtée sans rien consigner. Ce silence est ce qui a transformé une panne de permission en trois semaines de gel invisible.

## Contradiction à trancher dans la documentation

`MISE-A-JOUR.md` se contredit sur ce point précis :

- « Procédure d'une passe » : *« Chaque passe produit un commit, même si elle ne change rien : un commit “vérification du 1er septembre, aucun changement” vaut mieux qu'un dépôt qui semble abandonné. »*
- « Automatisation » : *« la tâche hebdomadaire produit une proposition dans un ticket, et jamais un commit. »*

La première impose un battement de cœur, la seconde l'interdit à la seule tâche qui s'exécute réellement. Le dépôt a suivi la seconde.

## Ce que ce fichier change

`veille/` accueille désormais un compte rendu par passe, **y compris quand la passe échoue**. Le dépôt devient son propre témoin : une panne du connecteur ne peut plus passer inaperçue, puisqu'un compte rendu manquant se voit dans l'arborescence.

Ce mécanisme ne dépend que du droit `Contents`, déjà disponible. Il ne remplace pas les tickets de décision, qui restent le lieu des arbitrages éditoriaux.

## À décider

1. **Répondre à #4** — une ligne de huit chiffres séparés par des `/`, puis fermer le ticket. Débloque les 33 propositions.
2. **Rétablir `Issues: Read and write`** sur le connecteur, ou déplacer les arbitrages vers un fichier versionné si cette permission n'est pas accessible.
3. **Lever la contradiction** de `MISE-A-JOUR.md` entre commit systématique et interdiction de commit.

---

<sub>Compte rendu produit par la passe automatique du 18 août 2026. Aucune écriture dans `data/*.json`.</sub>
