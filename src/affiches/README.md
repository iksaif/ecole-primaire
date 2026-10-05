# Affiches au format « définition » (plans 10 et 11)

Une affiche **se déclare** ; sa feuille, son formulaire, son catalogue et ses tests en découlent. Modèle vivant :
`exemple/` (la bande numérique, MS et GS), visible sur `/dev/affiches` avec `npm run dev`, absent du build.

```
src/affiches/<id>/
  definition.ts   la déclaration : domaine, compétences, variantes (classes), réglages à choix (données pures)
  dessin.ts       pur : dessin(réglages, { W, H }, T) → HTML de la zone sous le titre ; css
  textes.ts       titre, noms des variantes, libellés des réglages, par langue (fr, br)
  index.ts        { definition, rendu, textes } : le module que lisent registre, formulaire, catalogue, tests
src/affiches/index.ts      registre (y ajouter l'affiche) ; exemples.ts : les exemples, dev seulement
src/impression/affiches/cadre.ts   le cadre commun : page, titre, marge, A3 (échelle ×1,41), document imprimable
src/noyau/FormulaireAffiche.vue    le formulaire générique : variante, réglages, langue, format, orientation, police, aperçu
```

**Pourquoi `src/affiches/<id>/`** (et pas sous `src/impression/affiches/`) : une affiche est une ressource de même rang
qu'un exercice (domaine, classes, compétences, réglages) ; on retrouve `src/exercices/<id>/` en miroir. `src/impression/`
garde ce qui sert à imprimer : le cadre, les polices, les gabarits.

## 1. La définition

```ts
const lettres = choix([false], { horsProgramme: [{ option: true, raison: '…' }] })   // un réglage = une description

export default definirAffiche({
  id: 'exemple', domaine: D.exemple, orientation: 'landscape', langues: ['fr', 'br'],
  competences: [K.exempleLire, K.exempleCompter],          // une fois ; chaque variante garde celles de TOUTES ses classes
  reglages: { points: choix([false, true]) },              // commun aux variantes
  variantes: {
    jusqua6:  { niveaux: ['ms'], reglages: { max: 6,  debut: 1, lettres } },
    jusqua10: { niveaux: ['gs'], reglages: { max: 10, debut: 0, lettres }, slug: 'affiche-exemple-bande-de-0-a-10' },
  },
})
```

- `definirAffiche` vérifie tout **à l'import** (domaine, compétences, classes, défaut au programme, raison d'un
  `horsProgramme`…) : une faute de déclaration échoue avec un message qui dit quoi corriger.
- Des **constantes** `D.…` et `K.…` (`src/noyau/ids.ts`, générées d'après `programme.ts`) : une faute de frappe ne compile pas.
- Les **niveaux sont des classes** (`['ms']`), jamais du texte : le catalogue en fait « MS », « GS · CP ».
- `choix(valeurs, { defaut, bonus, horsProgramme })` (de `src/noyau/definir.ts`, comme pour les exercices) : valeurs au
  programme, `bonus` au-delà, `horsProgramme` avec la raison (infobulle). Jamais par défaut. Déclarés dans une variante
  (ils dépendent du programme de ses classes), pas dans les réglages communs.
- Un réglage **sans** `choix` (`max`, `debut`) est une valeur de la variante, que lit le dessin ; l'élève ne le change pas.
- Les types suivent : `type Reglages = ReglagesDeAffiche<typeof definition>` donne à `dessin` des réglages typés
  (`r.max` est un nombre, `r.maxx` ne compile pas). Rien n'est répété.

**Avant / après** : la première version de cette définition faisait 53 lignes de JavaScript (`options`, `reglages`,
`bonus` en trois objets, compétences copiées par variante, niveaux, clés de texte) ; elle en fait **20 lignes de code**.

## 2. Le dessin

`dessin(r, { W, H }, T)` est une fonction **pure** (pas de Vue, pas de DOM, pas de `Math.random`) : mêmes réglages, même
HTML. Il remplit la zone `W × H` mm sous le titre ; le cadre s'occupe du reste (titre, marge, A3, `@page`, polices).
Textes : `T('clé')`. Pour un dessin riche, voir les affiches de `main` (horloge : SVG et légende ; droite : textes mesurés dans la
police ; pièces : dessins partagés avec un exercice, `exercices/monnaie/argent.ts`).

## 3. Les textes

Les clés suivent une convention (`textes.ts` du dossier `affiches/`) : `titre`, `variante.<id>.court|titre|description`,
`reglage.<cle>`, `valeur.<cle>.<valeur>`. La définition ne les répète pas ; le test vérifie qu'elles existent dans chaque langue.
Breton : chaque texte est marqué `// br: à relire`.

## 4. Ce qui en découle

- **Formulaire** : `<FormulaireAffiche :module>` ne contient aucun code propre à une affiche. Lien « Personnaliser » :
  `<route>?affiche=<id>&variante=<v>&langue=<l>`. Réglages mémorisés sous `affiche_<id>`.
- **Catalogue** (`catalogue.ts`, `entreesDe`) : une entrée par variante et par langue, en **données pures** (JSON) :
  `slug, court, titre, description, niveaux (classes), domaine, genre, competences, langues, config, lien`. Le build écrit
  `fiches/index.json` et un JSON par entrée à partir de ces entrées. Slug : `affiche-<id>-<variante>` (+ `-<langue>` hors
  français), ou `variante.slug` : **une affiche reportée de `main` garde son slug publié** (`slug: 'affiche-horloge-heures-entieres'`)
  sans changer son identifiant interne.
- **Tests** (`node tests/affiches-modele.test.mjs`, sans Chrome) : déclaration, compétences au programme des classes, textes
  présents, réglages abîmés, changement de variante, dessin déterministe, rien ne sort de la zone (variante × langue × réglage
  × format × orientation), catalogue complet et sérialisable, **instantané** `tests/instantanes/affiches.json` (`--maj` pour un
  écart voulu), et aucun import statique de `exemples.ts`. Le formulaire : `TEST_URL=http://localhost:5173/ecole-primaire/ node tests/dev-affiche.test.mjs`.
  Le test de mise en page Chrome (`tests/affiches.test.mjs`) lira le registre quand le build des fiches sera migré.

## 5. Visible seulement en développement

`exemples.ts` n'est atteint que par `import('…/exemples.ts')` sous `import.meta.env.DEV` (page `/dev/affiches`) ; Vite
supprime ce code du build de production. Domaine et compétences de l'exemple sont fictifs (`D.exemple`, `K.exemple…`).
Vérifier : `npx vite build --outDir /tmp/b --emptyOutDir` puis chercher `exemple` dans `/tmp/b` (rien).

## 6. Créer une affiche

`node scripts/nouveau-affiche.mjs <id> "<Titre>"` (sous-commande `affiche` de `npm run nouveau`) copie `exemple/`, change
l'identifiant et le titre, l'inscrit au registre ; reste à mettre de vraies compétences, variantes, dessin et textes. Puis
`node tests/affiches-modele.test.mjs --maj`, `npm run types`, `npm run lint`.

Questions ouvertes : voir « Modèle cible des affiches » dans `plans/10-qualite-methode.md`.
