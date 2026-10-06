# Tests de l'ancien code

Reste ici ce qui sert au premier report d'un exercice ou d'une affiche, et qui n'est pas encore branché sur `tests/lancer.mjs` :

- `affiches.test.mjs` : rien ne dépasse des feuilles d'une affiche (à reprendre pour les affiches reportées).
- `reglages.test.mjs` : les réglages d'un exercice sont complets (à reprendre avec l'exercice reporté).

Le reste a été porté dans la base ou abandonné (étape 3 de la feuille de route, `docs/TODO.md`) : nombres en lettres →
`tests/nombres.test.mjs` ; routes → `tests/routes-langues.test.mjs` ; réglages mémorisés abîmés → `tests/memorises.test.mjs` ;
vie privée → `tests/vie-privee.test.mjs`. Les programmes de maths et de français et le cadre sont couverts par
`tests/exercices.test.mjs` (chaque exercice du registre contre le programme) et par `jeu-dev` / `dev-affiche`.
