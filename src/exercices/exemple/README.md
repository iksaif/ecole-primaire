# Exemple d'exercice simple (développement seulement)

**Quand l'utiliser** : l'exercice n'a pas de corpus (des nombres, des figures, des opérations tirés au hasard), son contenu
suit la langue de l'interface, et un seul catalogue de textes suffit. Pour un exercice de français ou à corpus, voir
`../exemple-corpus/`. Point de départ : `npm run nouveau -- exercice <id> "<Titre>" --domaine <domaine> --competences <ids>`
(modèle `simple`, par défaut) ou copier ce dossier. Visible sur `/dev/exemple` avec `npm run dev`, absent du build.
Lire dans cet ordre, chaque fichier commente ses choix :

| Fichier | Rôle |
|---|---|
| `definition.ts` | niveaux, compétences, réglages (`choix`, `cases`, bonus, hors programme), fiches par compétence |
| `generateur.ts` | questions (hasard `rng`), `verifier` (verdict `{ ok, nuance }`), `ecartsAuProgramme`, pur |
| `fiche.ts` | mise en page de la fiche (`documentFiche`, corrigé), pure |
| `textes.ts` | catalogue de **contenu** fr + br (`catalogue(…)` : consigne de fiche, corrigé) ; l'interface est la section `exemple` de `src/langues/<langue>/textes/` |
| `src/views/dev/ExempleView.vue` | la vue, mince : réglages, jeu, fiche |

Ce que l'exemple montre : plusieurs niveaux avec réglages par niveau (`herite`) ; un choix multiple de **nombres**
(`pas`, mémorisé tel quel) et de chaînes (`sens`) ; un **bonus** (`pas` 5 et `sens` « on descend » au CP) ; un réglage
**hors programme** (`pas` 100, `exercices` « trouver la règle » au CP) ; une **compétence hors programme** (`horsProgramme:
[{ competence, raison }]` du niveau CP : l'exercice la travaille malgré le programme, avec la raison ; jamais cochée par
défaut, voir `tests/definir.test.mjs`) ; une fiche par compétence ; un verdict `{ ok, nuance }` ; une union de questions
et des `switch` exhaustifs ; un pluriel dans le texte de la fiche.

Vérifier : `npm run types`, `npm run lint`, `npm run i18n`, `node tests/exercices.test.mjs`,
`npm run instantanes -- --maj <id>` (puis sans `--maj`).

## Pourquoi `definir` : Heure, avant et après

`definition.js` d'Heure décrit chaque réglage dans trois objets parallèles (`options`, `reglages`, `bonus`) et recopie les
listes de compétences de chaque niveau ; `definir` rend exactement la même structure (vérifié : la définition ci-dessous
produit un objet identique à l'ancienne), avec ses erreurs de déclaration expliquées à l'import.

```js
// avant (46 lignes)                                // après (25 lignes)
ce1: {                                              ce1: { reglages: {
  competences: ['heure-entiere', 'heure-demi-quart', //   exercices: cases(['lire', 'placer', 'journee', 'duree'], { defaut: ['lire'] }),
    'durees'],                                       //   precisions: cases(['heure', 'demi', 'quart'], { bonus: ['cinq'] }),
  options: { exercices: ['lire', 'placer',           // } },
    'journee', 'duree'],                             // compétences : déclarées une fois en tête de l'exercice,
    precisions: ['heure', 'demi', 'quart', 'cinq'] },//   chaque niveau reçoit celles de son programme
  reglages: { exercices: ['lire'],
    precisions: ['heure', 'demi', 'quart'] },
  bonus: { precisions: ['cinq'] },
},
```

Les identifiants viennent de constantes (`K.heureEntiere`, `D.grandeursMesures`, `src/noyau/ids.ts`, générées d'après
`programme.ts` par `node scripts/ids.mjs`) : une faute de frappe ne compile pas. Le type des réglages se déduit de la
déclaration : `config.pas` est `1 | 2 | 5 | 10 | 100 | 1000`, `config.typo` ne compile pas.
