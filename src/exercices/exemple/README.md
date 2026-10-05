# Exemple d'exercice (développement seulement)

Point de départ de tout exercice : `npm run nouveau -- exercice <id> "<Titre>" --domaine <domaine> --competences <ids>`
le copie (ou copier ce dossier à la main). Visible sur `/dev/exemple` avec `npm run dev`, absent du build.
Lire dans cet ordre, chaque fichier commente ses choix :

| Fichier | Rôle |
|---|---|
| `definition.ts` | niveaux, compétences, réglages (`choix`, `cases`, bonus, hors programme), fiches par compétence |
| `generateur.ts` | questions (hasard `rng`), `verifier` (verdict `{ ok, nuance }`), `ecartsAuProgramme`, pur |
| `fiche.ts` | mise en page de la fiche (`documentFiche`, corrigé), pure |
| `textes.ts` | catalogues fr et br (`src/i18n/<langue>/views/dev/ExempleView.js`) |
| `src/views/dev/ExempleView.vue` | la vue, mince : réglages, jeu, fiche |

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
