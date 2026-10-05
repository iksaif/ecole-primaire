# Exercices au format « définition » (plan 10)

Un exercice se déclare une fois ; ses niveaux, fiches et tests en découlent. Modèle : `heure/`.

```
src/exercices/<id>/
  definition.js   la déclaration (ci-dessous), données pures
  generateur.js   pur : questions({ niveau, reglages, rng, T, nb }), questionsFiche(…), verifier(q, rep),
                  ecartsAuProgramme(questions, contraintesDe(niveau))
  fiche.js        pur : fiche({ questions, reglages, T, langue }) → documentFiche(…) (src/impression/document.js)
  textes.js       catalogues par langue (interface + contenu), lus avec T(cle, params)
src/exercices/index.js   registre (imports statiques : app, node et tests) ; outils.js : reglagesDuNiveau…
src/views/…/<Vue>.vue    mince : réglages + ConfigExercice, useJeu + <ResultatsJeu>, rendu d'une question
```

```js
{ id, route, domaine, contenu: 'fr' | 'interface', niveauDefaut, reglages /* communs */,
  niveaux: { <classe>: { competences: [ids de programme.js], reglages /* défauts */, options?, bonus?,
                         horsProgramme?: [{ option, raison }] } },
  fiches: [{ id, competence, niveau, reglages }] }   // fiches prégénérées par compétence
```

- `competences` : ids de `src/data/programme.js`, **au programme du niveau** ; `reglages` : défauts, dans le programme.
- `options` : valeurs proposées par réglage à choix multiple ; `bonus` : celles hors programme (jamais par défaut,
  affichées « bonus ») ; `horsProgramme` : tout autre écart, avec sa raison. Rien d'autre ne peut sortir du programme.
- Hasard : `rng` de `src/utils/hasard.js`, jamais `Math.random`. Même graine, mêmes questions, même fiche.
- La vue affiche les niveaux de `definition.niveaux` : on ne déclare pas de niveau ailleurs.
- `tests/exercices.test.mjs` (node, sans Chrome) vérifie chaque exercice du registre, chaque niveau, 5 graines.
- Ajouter un exercice : un dossier ici, une ligne dans `index.js` (le test échoue sinon).
