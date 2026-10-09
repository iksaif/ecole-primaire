# Confiance dans les traductions bretonnes

Chaque exercice et chaque affiche qui a du texte en breton porte un **niveau de confiance de 0 à 4**. Le visiteur choisit le niveau minimum
des fiches qu'il veut voir (page des réglages, section « Fiabilité des traductions ») ; par défaut **2** (mots vérifiés). En développement (`npm run dev`),
tout reste visible et une pastille « masquée par le réglage » marque ce qui serait caché.

| Niveau | Nom (clé) | Sens |
|---|---|---|
| **4** | `enseignant` | Relue et validée par un·e enseignant·e de breton. |
| **3** | `brittophone` | Relue par une personne qui parle breton. |
| **2** | `dictionnaire` | Mots et expressions simples, **chacun vérifié** dans un dictionnaire ou une source en ligne. **Défaut du réglage.** |
| **1** | `simple` | Traduction automatique de mots et de phrases très courts : très probablement correcte. **Défaut du réglage.** |
| **0** | `automatique` | Traduction automatique non vérifiée (phrases longues, grammaire), ou **jamais évaluée**. |

Où c'est écrit : l'échelle est dans `src/langues/confiance.ts`, les niveaux dans `src/langues/br/confiance.ts` (une entrée par ressource :
`exercice:<id>` ou `affiche:<id>`, avec une date, qui a évalué et une **note obligatoire** qui dit pourquoi). Une ressource absente vaut 0.

**Exceptions par fiche** : une entrée `'fiche:<slug publié>'` (avec le suffixe de langue, ex. `fiche:affiche-mois-gs-br`) l'emporte sur le niveau de sa ressource. À écrire
seulement quand une fiche est nettement plus sûre (ou moins sûre) que le reste : par exemple une fiche qui n'imprime que des mots vérifiés, dans une ressource qui
contient aussi des phrases automatiques. Un slug qui n'existe pas arrête le build des fiches ; il faut le corriger si le slug a changé.
`npm run confiance` affiche le tableau et ce qui reste à évaluer ; `tests/confiance.test.mjs` vérifie la table.

## Méthode pour trouver le niveau

On évalue ce qui est **imprimé sur la fiche** (ou affiché dans l'exercice) : consignes, mots, phrases, corrigés. Les titres et descriptions du catalogue
ne comptent que s'ils sont longs. Le niveau d'une ressource est celui de son **maillon le plus faible**.

### 1. Une relecture humaine l'emporte (niveaux 3 et 4)

Si une personne a relu **tous** les textes de la ressource : niveau 3 (brittophone) ou 4 (enseignant·e). On note le rôle (`relecteur`), jamais le nom, et la date.
Si les textes ont changé depuis la date (`git log -- src/exercices/<id>/textes.ts`), la relecture ne couvre plus que ce qui n'a pas changé : on réévalue le reste
comme une traduction non relue, et le niveau retombe à 2 au plus.

### 2. Sinon, classer chaque texte imprimé

| Classe | Texte | Condition |
|---|---|---|
| **A** | un mot ou une expression figée (nombre, jour, mois, lettre, couleur, partie du corps, unité…) | **trouvé dans au moins une source fiable** (Wiktionnaire, Geriadur ar Brezhoneg, Kervarker, Meurgorf, TermBret/Termofis, programmes de l'académie de Rennes) ; la source est citée dans la note. |
| **B** | une phrase ou un groupe très court (≤ 5 mots), sans mutation à deviner, sans verbe conjugué ni accord | le sens est transparent, chaque mot est de classe A. |
| **C** | tout le reste : phrase longue, verbe conjugué, mutation, pluriel irrégulier, genre, nombre qui s'accorde, tournure idiomatique, vocabulaire pédagogique (« consigne », « corrigé », « entoure »…) | non vérifiable sans locuteur. |

### 3. Le niveau

- **2** : tous les textes sont de classe A.
- **1** : aucun texte de classe C (des A et des B).
- **0** : au moins un texte de classe C (ou ressource jamais regardée).

Score indicatif pour comparer deux ressources : `(2·nA + 1·nB) / (2·N)` (N textes imprimés), de 0 à 1. Il ne remplace pas la règle du maillon faible :
un seul texte de classe C met la ressource à 0, parce que c'est lui que l'enfant ou l'enseignant·e lira de travers.

### 4. Pièges

- Un mot de classe A **dans une phrase** devient de classe B ou C : la mutation (`ar c'hi` / `ur c'hi`, `daou vloaz`) dépend du mot d'avant.
- Les nombres, l'alphabet, les jours et les mois sont déjà vérifiés (AGENTS.md) : ne pas les changer sans source.
- Une traduction automatique **qui se contente de recopier le français** ou d'inventer un calque est de classe C, même courte.
- Ne jamais monter un niveau « pour que la fiche s'affiche » : le réglage existe pour que l'enseignant·e décide en connaissance de cause.

## Évaluer ou réévaluer

Le prompt est dans [`prompt.md`](prompt.md). Il se lance sur une ou plusieurs ressources, en lecture seule pour le code (il ne modifie que
`src/langues/br/confiance.ts`) et rend les entrées à coller.
