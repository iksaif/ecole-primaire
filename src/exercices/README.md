# Exercices (modèle de la base saine, plan 11)

Un exercice est un dossier de `src/exercices/`, écrit en **TypeScript**, déclaré une fois avec `definir` : ses niveaux, fiches
et tests en découlent. Deux modèles complets à copier, visibles avec `npm run dev` sur **`/dev`** (absents d'un build de
production) :
- `exemple/` : simple (suites de nombres, un catalogue de textes) ; `exemple/README.md` explique chaque mécanisme ;
- `exemple-corpus/` : français, corpus dans `src/data/`, contenu toujours en français (QCM).

**Créer un exercice** : `npm run nouveau -- exercice <id> "<Titre>" --domaine <domaine> --competences <id,id> [--modele simple|corpus]
[--matiere maths|francais|maternelle]`. Il copie le modèle, la vue, les textes d'interface, et inscrit l'exercice aux repères
`// nouveau:…` de `src/exercices/index.ts` (le registre), `src/router/index.ts` et `src/langues/{fr,br}/textes/index.ts`.
Il faut ensuite adapter niveaux et compétences (un niveau sans compétence au programme est refusé à l'import).

```
src/exercices/<id>/
  definition.ts   la déclaration (`definir`) : niveaux → compétences du programme, réglages, bonus, hors programme, fiches
  generateur.ts   pur : questions, questionsFiche, verifier, ecartsAuProgramme, bonneReponse, mauvaiseReponse
  fiche.ts        pur : fiche({ questions, reglages, T, langue, police, cssPolices }) → documentFiche(…)
  textes.ts       catalogue de CONTENU (`catalogue(…)`) lu par T ; l'interface est dans src/langues/<langue>/textes/<id>.ts
  index.ts        le module { definition, generateur, fiche, textes } (satisfies ModuleExercice)
src/views/<matiere>/<Id>View.vue   la vue, mince
```

Le registre est **un seul fichier** : `src/exercices/index.ts` (`REGISTRE`). L'app, le build des fiches (`scripts/fiches/`), les
tests et `/dev` le lisent. Les exemples y sont marqués `exemple: true` et chargés par import dynamique en développement
seulement (`src/dev.ts`). Les 22 anciens exercices (JavaScript) sont dans `ancien.js` tant qu'ils ne sont pas reportés.

## La définition

```ts
export default definir({
  id: 'heure', route: '/maths/heure', domaine: D.grandeursMesures,   // id : minuscules et tirets ; route : « /… »
  contenu: 'interface',      // 'fr' : exercice de français, toujours en français
  jeu: true,                 // false : exercice « fiche seule » (voir plus bas)
  competences: [K.heureEntiere, K.heureDemiQuart],   // toutes ; chaque niveau garde celles de son programme
  autresDomaines: [],        // domaines des autres compétences, déclarés
  reglages: { nbQ: choix([5, 10, 15], { defaut: 10 }) },   // communs à tous les niveaux
  niveaux: {
    cp: { reglages: { exercices: cases(['lire', 'placer']) } },
    ce1: herite('cp', { reglages: { precisions: cases(['heure', 'demi'], { bonus: ['cinq'] }) } }),
  },
  fiches: [{ id: 'lire', competence: K.heureEntiere, niveau: 'ce1', reglages: { exercices: ['lire'] } }],
})
```

- `choix(valeurs, { defaut?, bonus?, horsProgramme? })` : un réglage à choix unique ; `cases(valeurs, …)` : choix multiple
  (tout coché par défaut). **Une seule sorte de valeurs par réglage** : chaînes, nombres ou booléens, jamais un mélange
  (`cases([1, 'a'])` ne compile pas ; `definir` refuse la liste). Un réglage simple (texte libre, liste de mots, nombre) s'écrit
  tel quel (`texte: ''`, `mots: ['papa']`) : il n'a pas d'options.
- `bonus` : valeur proposée, au-delà du programme, jamais cochée (« bonus ») ; `horsProgramme: [{ option, raison }]` : écart
  assumé (« hors programme », raison en infobulle). Au niveau : `horsProgramme: [{ competence: K.…, raison }]` pour une compétence
  travaillée malgré le programme.
- `definir` vérifie à l'import (erreur claire avec le chemin « niveau ce1, réglage « a » ») : id et id de fiche (forme, unicité par
  niveau), route, compétences connues, **du domaine de l'exercice** (ou d'`autresDomaines`), pas de doublon, niveaux couverts, défauts
  au programme, `horsProgramme` non redondant avec le programme, fiches cohérentes avec les options.
- **Le type des réglages est fermé** : `ConfigDe<typeof DEFINITION>` donne `config.pas : (1 | 2 | 10)[]`, `config.typo` ne
  compile pas (`tests/definir.types.ts` : ce que le compilateur doit refuser).
- Les identifiants viennent de `K` (compétences) et `D` (domaines) de `src/noyau/ids.ts` (généré : `node scripts/ids.mjs`).
  `K.exemple…` et `D.exemple` sont fictifs : un exercice réel qui les cite échoue à l'import en production
  (`tests/production.test.mjs`).

### Exercice « fiche seule » (écriture, calcul en mode fiche)

Un exercice qui n'a pas de mode en ligne se déclare `jeu: false` : pas de `questions` ni de `verifier` (type `GenerateurFicheSeule` :
`questionsFiche` et `ecartsAuProgramme`), la vue utilise `<CadreExercice fiche-seule>` et `useFicheExercice({ …, ficheSeule: true })`
(le mode est toujours « imprimer »). Même modèle, pas de troisième genre ; `aUnJeu(definition)` (`reglages.ts`) le dit.

## Le générateur et la fiche

Purs (lisibles par node : aucun import de Vue, aucun `Math.random`). `questions({ niveau, reglages, rng, T, nb })`,
`questionsFiche({ niveau, reglages, rng, T })`, `verifier(q, rep)` → booléen ou `{ ok, nuance }` (nuance : « presque juste »).
`bonneReponse(q)` et `mauvaiseReponse(q)` : une réponse juste et une fausse, que les tests essaient sur chaque question (un
`verifier` toujours vrai échoue). `ecartsAuProgramme(questions, contraintesDe(niveau))` : ce qui sort du programme.
`T` est typé par le catalogue (`CleContenu<typeof CONTENU>`) : une clé inconnue ne compile pas. Hasard : `rng` de
`src/utils/hasard.ts` (`rng.choisir([])` lève). Les fiches sont mises en page par `documentFiche` (`src/impression/document.ts`).

## La vue

```ts
const { config, langueContenu } = useReglages(DEFINITION)   // mémorisés sous <id>_config ; options { cle?, suivreClasse? }
const jeu = useJeu<Question, Reponse>({ generer: rng => questions({ …, rng }), verifier, messageErreur, delai: 1600 })
const { mode, fiche, nouvelle } = useFicheExercice({ tirer: rng => questionsFiche({ …, rng }), mettreEnPage: (q, police) => fiche({ …, ...police }) })
```
```html
<CadreExercice v-model:mode="mode" :fiche="fiche" :config="config" @commencer="jeu.demarrer" @regenerer="nouvelle">
  <ChoixReglage :definition="DEFINITION" cle="niveau" v-model="config.niveau" … />   <!-- cle et v-model typés -->
</CadreExercice>
<QuestionJeu :jeu> … <ChoixReponses> | <SaisieReponse> … </QuestionJeu>
<ResultatsJeu …><TableauCorrection :historique /></ResultatsJeu>
```
- `useReglages` : charge avec les clés de **tous** les niveaux (un réglage propre à un niveau n'est pas perdu au rechargement),
  répare une sauvegarde corrompue, et applique la **politique de changement de niveau** commune (`reglagesApresNiveau` :
  choix multiples → défauts du nouveau niveau ; choix unique gardé s'il est au programme ; bonus et hors programme jamais
  reportés ; une clé que le nouveau niveau ne connaît pas est retirée ; un niveau absent de l'exercice lève une erreur).
- `useJeu` : `apresErreur: 'attendre'` (bouton « Suivant », défaut) ou un nombre de ms ; `delai: null` (jamais seul après une
  bonne réponse) ; `serie: true | q => clé` (plusieurs questions par écran). `demarrer` **lève** si `generer` rend `[]`
  (jamais d'écran blanc).
- **Fiche reproductible** : le tirage est une fonction de la graine et des réglages (un `rng` neuf à chaque calcul). La graine
  vient de `?graine=N` ; « Nouvelle fiche » en tire une autre et l'écrit dans l'URL. Jouer → Imprimer → Jouer → Imprimer donne la
  même fiche (`tests/jeu-dev.test.mjs`).
- Textes : l'**interface** dans `src/langues/<langue>/textes/<id>.ts` (`t('<id>.titre')`, français source, breton
  `satisfies Traductions<…>`) ; le **contenu** dans `textes.ts` (`catalogue(…)`), lu par `T`. Breton nouveau : `// br: à relire`.

## Tests

- `tests/definir.test.mjs`, `tests/definir.types.ts` : la déclaration (erreurs, types refusés).
- `tests/noyau.test.mjs` : la logique (réglages mémorisés, corrompus, changement de niveau, bonne et mauvaise réponse, partie vide,
  graine), avec les composables Vue dans node (localStorage factice).
- `tests/exercices.test.mjs` : chaque exercice du registre (et de `ancien.js`), chaque niveau, 5 graines, contre le programme.
- `tests/instantanes.test.mjs` : empreinte de chaque fiche (`tests/instantanes/<id>.json`) ; `npm run instantanes -- --maj <id>`
  une fois la fiche stable, `--diff <cas>` pour un écart voulu (à justifier dans le commit).
- `tests/jeu-dev.test.mjs`, `tests/dev-affiche.test.mjs` : le jeu et la fiche dans Chrome, sur un site construit avec les pages
  de développement (`VITE_AVEC_DEV=1`, port 4192, `tests/lancer.mjs`) ; sur le serveur de dev : `TEST_URL=http://localhost:5173/ecole-primaire/ node tests/jeu-dev.test.mjs`.
- `tests/production.test.mjs` : aucun exemple (ids, textes, chunks `/dev`, JSON de `public/fiches/`) dans les builds de production.

## Reporter un ancien exercice (de `ancien.js` vers la base)

1. Capturer les fiches de l'ancienne version (`scripts/capturer-fiches.mjs`, voir `npm run instantanes`) : elles deviennent les
   instantanés ; la fiche reportée doit les retrouver sans `--maj`.
2. `npm run nouveau -- exercice …`, puis recopier la logique : `aleatoire` → `rng.entier`, `pioche` → `rng.choisir`, `Math.random() < p` →
   `rng.vrai(p)`, **dans le même ordre de tirage**. Les niveaux et compétences viennent du programme (`src/data/programme.ts`) ;
   les écarts sont `bonus` ou `horsProgramme` avec leur raison.
3. Rebrancher la route, retirer l'exercice de `ancien.js`, supprimer l'ancien fichier ; `npm run qualite` : les compteurs de l'ancien
   monde ne font que baisser (`-- --enregistrer`).
4. `npm run types && npm run lint && npm run i18n && npm test`, puis un passage dans le navigateur (fr et br, jeu et impression).
