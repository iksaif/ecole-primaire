# Exercices au format « définition » (plan 10)

> **Pour créer un exercice** : `npm run nouveau -- exercice <id> "<Titre>" --domaine <domaine> --competences <ids>`
> (ou copier `exemple/`, voir `exemple/README.md`). L'exemple est visible avec `npm run dev` sur la page **`/dev`**, qui
> liste tous les exemples ; il n'existe pas en production. Il se déclare avec `definir` (`src/noyau/definir.ts`), en TypeScript.

Un exercice se déclare une fois ; ses niveaux, fiches et tests en découlent. Modèles : `heure/` (pilote),
`monnaie/` (phase 2a, réglage à choix unique, `bonneReponse`) et `conjugaison/` (phase 2b : contenu toujours `fr`,
réponses tapées au clavier comparées par `src/utils/reponses.js`, une partie = les lignes d'un tableau, `ecartsFiche`).

```
src/exercices/<id>/
  definition.js   la déclaration (ci-dessous), données pures
  generateur.js   pur : questions({ niveau, reglages, rng, T, nb? }), questionsFiche(…), verifier(q, rep) → booléen
                  ou { ok, nuance }, ecartsAuProgramme(questions, contraintesDe(niveau))
                  bonneReponse(q), ecartsFiche(html, contraintes), manquesAuProgramme(reglages, contraintes) :
                  facultatifs, vérifiés par les tests s'ils existent
  fiche.js        pur : fiche({ questions, reglages, T, langue, police, cssPolices }) → documentFiche(…)
                  (src/impression/document.js ; police : usePoliceFiche() dans l'app, Andika par défaut)
  textes.js       catalogues par langue (interface + contenu), lus avec T(cle, params)
src/exercices/index.js   registre (imports statiques : app, node et tests) ; outils.js : reglagesDuNiveau…
src/views/…/<Vue>.vue    mince : useReglages + <ConfigExercice police> + <ChoixReglage>, useJeu + <QuestionJeu> +
                         <ResultatsJeu> (+ <TableauCorrection>), useFicheExercice ; rendu d'une question avec
                         <ChoixReponses> (QCM) et <SaisieReponse> (champ)
```

```js
{ id, route, domaine, contenu: 'fr' | 'interface', niveauDefaut, reglages /* communs */, options? /* communes */,
  niveaux: { <classe>: { competences: [ids de programme.js], reglages /* défauts */, options?, bonus?,
                         horsProgramme?: [{ option, raison }] } },
  fiches: [{ id, competence, niveau, reglages }] }   // fiches prégénérées par compétence
```

- `competences` : ids de `src/data/programme.js`, **au programme du niveau** ; `reglages` : défauts, dans le programme.
- `options` : valeurs proposées par réglage à choix : multiple si le défaut est une liste (`exercices: [...]`), unique
  sinon (`centimes: [false, true]`) ; `bonus` : celles hors programme (jamais par défaut, affichées « (bonus) ») ;
  `horsProgramme: [{ reglage, option, raison }]` : tout autre écart (affiché « (hors programme) », raison en infobulle),
  ou `{ option: <compétence>, raison }`. Rien d'autre ne peut sortir du programme.
- `options` communes (hors niveaux) : valeurs proposées pour un réglage commun à choix (`nbQ: [5, 10, 15]`,
  `nbHorloges`, `saisie`) ; `<ChoixReglage>` les lit, une valeur mémorisée hors liste reprend le défaut, et les tests
  essaient chaque valeur (instantanés compris).
- Ajouts de la phase 2d, lot A (français ; tous rétrocompatibles) : `useJeu({ delai: null })` (on attend « Suivant », pour lire
  l'explication) ; `<ChoixReglage :groupes="[{ titre, valeurs }]">` (boutons sous des sous-titres) ; `<ChoixReponses colonne>` ;
  `documentFiche({ h1: null })` (fiche en plusieurs pages qui ont chacune leur titre) ; `src/views/francais/QuestionFrancais.vue`
  et `EtiquettesOrdre.vue` (question de grammaire / vocabulaire : consigne, phrase, choix, mots à cliquer, étiquettes à ranger,
  saisie, retour avec explication ; textes des questions = fonctions de `T`, appelées avec `t` en jeu et `T` (français) sur la fiche).
  Un corpus de français (jamais traduit) va dans `src/data/<exercice>.js`, comme `data/conjugaison.js`.
- `nb` (nombre de questions) est facultatif : un exercice dont la partie est fixée par ses données (6 lignes d'un
  tableau) l'ignore.
- `verifier(q, rep)` rend un booléen, ou `{ ok, nuance }` quand une réponse peut être « presque juste » (nuance
  `'accents'` : `verdictSaisie` de `src/utils/reponses.js`, accents oubliés comptés **faux** par défaut, avec un
  avertissement) ; `useJeu` range la nuance dans `retour` et l'historique, et l'état devient `'presque'` (orange).
- Hasard : `rng` de `src/utils/hasard.js`, jamais `Math.random`. Même graine, mêmes questions, même fiche.
- La vue affiche les niveaux de `definition.niveaux` : on ne déclare pas de niveau ailleurs.
- `tests/exercices.test.mjs` (node, sans Chrome) vérifie chaque exercice du registre, chaque niveau, 5 graines.
- Ajouter un exercice : un dossier ici, une ligne dans `index.js` (le test échoue sinon).

## Migrer un exercice (checklist)

1. **Avant de toucher la vue** : capturer le `srcdoc` des fiches (script jetable dans le dépôt, supprimé ensuite ;
   playwright-core, Chrome, serveur de dev). Pour chaque niveau × 3 graines × 5 à 7 combinaisons de réglages × fr/br :
   `about:blank` puis `?graine=N#/route?mode=imprimer` (sinon même URL = pas de rechargement), `Math.random` remplacé
   par mulberry32(N) comme `scripts/telechargements.mjs`, localStorage vidé, clic du niveau puis des réglages
   (positions relevées en fr, rejouées en br). Vérifier que les captures diffèrent entre elles.
2. **Programme** : lire `src/data/programme.js` (COMPETENCES, CONTRAINTES) pour chaque classe. Un niveau au programme
   absent est un écart : l'ajouter si c'est raisonnable, sinon l'écrire dans le plan. Une option hors programme :
   `bonus` ou `horsProgramme` avec raison, jamais par défaut.
3. **`definition.js`** : niveaux → `competences`, `options`, `reglages` (défauts), `bonus`/`horsProgramme` ; réglages
   communs ; `fiches` = celles de `src/impression/exercices.js` (mêmes `id`, slugs inchangés).
4. **`generateur.js`** pur : recopier la logique de la vue en remplaçant `aleatoire` → `rng.entier`, `pioche` →
   `rng.choisir`, `melanger` → `rng.melanger`, `Math.random() < p` → `rng.vrai(p)`, **dans le même ordre de tirage**
   (y compris les tirages faits pour une partie non affichée). `questionsFiche` renvoie des données, pas du HTML ;
   `ecartsAuProgramme` lit `contraintesDe(niveau)` ; `bonneReponse(q)` si `verifier` n'est pas un simple choix.
   Les options du niveau viennent de la définition (pas de copie). Attention aux caractères invisibles
   (espace insécable : écrire `'\u00a0'`).
5. **`fiche.js`** pur : même corps HTML, via `documentFiche({ titre, langue, police, cssPolices, h1, css, largeur, marge })`
   et `ligneNomDate`. Le CSS de base (body, h1) vient de `documentFiche`.
6. **`textes.js`** : `INTERFACE` et `TEXTES` (interface + contenu, aucune clé commune) ; les catalogues restent dans
   `src/i18n/<langue>/…`. Les textes communs (bonus, quitter, corrigé…) sont dans `commun.js`.
7. **Registre** : 4 lignes dans `index.js`. **`activites.js`** (`niveaux` et compétences par classe depuis la
   définition) et **`impression/exercices.js`** (`classes` depuis `definition.niveaux`, `classes` des fiches depuis
   `definition.fiches`).
8. **Vue mince** (modèles : `HeureView`, `MonnaieView`, `ConjugaisonView`), dans cet ordre :
   - réglages : `const { config, langueContenu } = useReglages(DEFINITION, '<id>_config')` (mémorisation, options du
     niveau et communes, **politique commune au changement de niveau** : choix multiples → défauts du nouveau niveau,
     choix unique gardé s'il est au programme ; pas de `watch` du niveau dans la vue), puis
     `const T = contenu(TEXTES, () => langueContenu.value).t` ; la clé de mémorisation ne change pas ;
   - `<ChoixReglage>` pour le niveau et chaque réglage à choix (`cartes` + `icone` / `description` pour un choix de mode),
     sans `:valeurs` si les valeurs sont dans la définition (`options` du niveau ou communes) ;
   - jeu : `useJeu({ generer: rng => questions({ …, rng }), verifier, messageErreur, delai })` (la graine du jeu est
     tirée par `useJeu`) ; `apresErreur: 'continuer'` pour enchaîner sans bouton (maternelle) ; `serie: true` (ou
     `q => clé`) pour plusieurs questions sur un écran (lignes d'un tableau, Conjugaison) ; classes d'état :
     `jeu.etat` / `etatDe(entrée)` ;
   - rendu : `<QuestionJeu :jeu>` ; `<ChoixReponses :options :bonne :repondu @choisir>` (QCM, `images` pour des
     dessins) ; `<SaisieReponse v-model type="nombre|decimal|texte" :etat :disabled focus @entree>` (pas de `ref` ni de
     `nextTick` pour le focus) ; `<ResultatsJeu>` + `<TableauCorrection :historique>` (slot `#question` pour un dessin) ;
   - fiche : `const { mode, fiche, nouvelle } = useFicheExercice({ tirer: rng => questionsFiche(…), mettreEnPage:
     (questions, police) => fiche({ …, ...police }) })` et `<ConfigExercice police>` ;
   - plus de `Math.random`, d'import `i18n/br/`, de `'br'`, de `chargerReglages` / `sauvegarder` / `useGraine` direct.
9. **Après** : recapturer, comparer le `<body>` (identique attendu ; la police est dans le `<head>`), justifier et
   regarder en image chaque écart. `npm run lint`, `npm run i18n`, `node tests/exercices.test.mjs`, `npm run qualite`
   (puis `-- --enregistrer`), `npm test` (seul), et un passage dans le navigateur : fr/br, jeu et impression, chaque
   niveau, sans erreur JS. Ajouter un cas au test `programme-maths` pour un niveau ajouté. Retirer du test Chrome
   de programme ce que `tests/exercices.test.mjs` couvre désormais (garder un test de rendu minimal, comme
   Conjugaison dans `programme-francais`). `npm run qualite` : `exercicesMigres` monte, `-- --enregistrer`.

Dans le socle depuis la phase 2d : `<OrdonnerClics>` (ranger par clics), `<ResultatsEtoiles>` (fin de la maternelle), `useMinuteur`,
`<ChoixReponses grand>` et `useReglages(…, { suivreClasse: true })` (maternelle). Pas encore extraite : la droite graduée (lot B).

## Vérifier qu'une migration ne change rien

Les fiches d'un exercice migré sont des fonctions pures : `tests/instantanes.test.mjs` (node, ~1 s, sans Chrome)
garde l'empreinte de chacune dans `tests/instantanes/<id>.json`, une ligne par cas
(`"heure/ce1/graine1/fr/defauts": "<sha1>"` : niveau, graines 1 à 3, langues de contenu, réglages `defauts`, `tout`
au programme, `<cle>=<valeur>` pour chaque autre valeur d'un réglage à choix unique — bonus compris — et `fiche-<id>` de
`definition.fiches` : `jeuxDeReglages` de `outils.js`, partagé avec `tests/exercices.test.mjs`). Empreinte du HTML normalisé : espaces regroupés, `@font-face`
retirés (leurs `url(...)` dépendent du build ; le nom de la police reste dans le `font-family`).

1. **Avant** (vue pas encore migrée) : capturer ses fiches dans Chrome, au même format et avec les mêmes clés :
   `node scripts/capturer-fiches.mjs /maths/<id> --reglages cas.json --sortie tests/instantanes/<id>.json`
   (serveur de dev lancé ; `--niveaux CE1,CE2 --graines 1,2,3 --langues fr,br` ; format de `cas.json` et options en tête
   du script). Donner les réglages comme réglages mémorisés de la vue (`"reglages"`) plutôt que par des clics : la
   fiche est alors le premier tirage de la graine, comme en node. Les HTML vont dans `/tmp/instantanes/`.
2. **Migrer**, puis ajouter l'exercice au registre.
3. `npm run instantanes` doit passer **sans `--maj`** : la capture d'avant sert de référence. Pour un exercice déjà
   migré, `npm run instantanes -- --maj <id>` avant de commencer suffit.
4. Écart voulu (ou à comprendre) : `npm run instantanes -- --diff <cas>` (le HTML recalculé et le diff avec celui
   d'avant, dans `/tmp/instantanes/`), regarder, puis `npm run instantanes -- --maj [préfixe]` et justifier l'écart
   dans le message de commit. Un préfixe (`heure/ce1`) limite la vérification ou la mise à jour à ces cas.

`capturer-fiches` sur une route du registre reprend d'office les cas du test et dit combien sont identiques à
l'instantané : c'est aussi le moyen de vérifier que la vue affiche bien la fiche calculée en node.

## TypeScript

Les exercices existants sont en JavaScript (JSDoc dans `index.js`) et le restent jusqu'à leur migration. Un exercice neuf
s'écrit en `.ts` contre `src/noyau/` : `types.ts` (`DefinitionExercice<R>`, `Generateur<Q, Rep, R>`, `ModuleExercice`,
`Verdict`, `Config<R>`…), `reglages.ts` (fonctions pures : `reglagesDuNiveau`, `jeuxDeReglages`…), `useJeu`,
`useReglages`, `useFicheExercice` et les composants `CadreExercice`, `ChoixReglage`, `ChoixReponses`, `SaisieReponse`,
`QuestionJeu`, `ResultatsJeu`, `TableauCorrection`. Les identifiants (compétences, domaines, classes) sont typés d'après
`src/data/programme.ts` : une compétence inconnue ne compile pas. Imports avec l'extension `.ts`, `import type` pour les
types, pas d'`enum` (voir AGENTS.md). Le registre `index.js` lit les définitions des deux mondes (même structure) ;
`npm run types` vérifie le tout.


## Les exemples (développement seulement)

`exemple/` est un exercice complet et minimal, vérifié comme les autres (`tests/exercices.test.mjs`, `tests/instantanes.test.mjs`)
mais **hors du catalogue public** : il est dans `dev.ts` (`REGISTRE_DEV`), pas dans `REGISTRE` (`index.js`), que lisent le build, le
catalogue (`activites.js`), la couverture et `npm run qualite`. Sa page est la route `/dev/exemple`, ajoutée par le routeur seulement sous
`import.meta.env.DEV`. Ses compétences (`K.exemple…`, domaine `D.exemple`) sont des entrées fictives de `programme.ts`
(`COMPETENCES_EXEMPLE`), absentes d'un build de production et de `COMPETENCES`.
