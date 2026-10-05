# Exemple d'exercice à corpus (développement seulement)

**Quand l'utiliser** : l'exercice de français (ou de lecture, de vocabulaire…) tire ses questions d'un **corpus** de mots ou de
phrases, et son contenu est **toujours en français**, même avec l'interface en breton (`contenu: 'fr'`). Pour un exercice de
calcul sans corpus, voir `../exemple/`. Point de départ : `npm run nouveau -- exercice <id> "<Titre>" --domaine <domaine>
--competences <ids> --modele corpus [--matiere francais]`. Visible sur `/dev/exemple-corpus`, absent du build.

Ce qui le distingue de l'exemple simple :

| Sujet | Où |
|---|---|
| le corpus (français seulement, jamais traduit) | `src/data/exemple-corpus.ts` : données pures, partageables avec une affiche ; chaque entrée dit à partir de quelle classe elle est proposée |
| deux catalogues de textes | interface traduite dans `src/i18n/<langue>/views/dev/ExempleCorpusView.js` ; contenu de la fiche en français, dans `textes.ts` |
| contenu toujours `fr` | `definition.ts` : `contenu: 'fr'` ; la vue et les tests lisent `T` en français |
| QCM | `<ChoixReponses>` dans la vue ; la réponse est l'indice choisi ; `verifier` rend un booléen |
| programme | `ecartsAuProgramme` compare la classe prévue pour chaque mot au niveau joué |

Le niveau ne change ici que les mots tirés : une entrée du corpus du CE1 sert aussi au CE2.
