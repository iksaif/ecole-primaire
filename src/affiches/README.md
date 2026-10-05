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
  id: 'exemple', domaine: D.exemple, orientation: 'landscape',
  langues: CODES, bilingue: true,                     // plusieurs langues sur la même feuille
  hasard: true,                                       // réglage « graine » + bouton « Nouvelle »
  competences: [K.exempleLire, K.exempleCompter],     // une fois ; chaque variante garde celles de TOUTES ses classes
  reglages: { points: choix([false, true]) },         // commun aux variantes
  formulaire: {
    groupes: [{ id: 'repere', reglages: ['points', 'lettres', 'langues'] }, { id: 'completer', reglages: ['graine'] }],
    visibleSi: { graine: { reglage: 'completer', valeur: true } },
  },
  variantes: () => Object.fromEntries(BANDES.flatMap(b => [false, true].map(completer => [   // variantes calculées
    completer ? `${b.id}-completer` : b.id, { niveaux: b.niveaux, reglages: { max: b.max, debut: b.debut, completer, lettres } }]))),
})
```

- `definirAffiche` vérifie tout **à l'import** (domaine, compétences, classes, défaut au programme, raison d'un
  `horsProgramme`, langues du registre, réglages cités par le formulaire…) : une faute échoue avec un message qui dit quoi corriger.
- Des **constantes** `D.…` et `K.…` (`src/noyau/ids.ts`) : une faute de frappe ne compile pas. Les **niveaux sont des classes**
  (`['ms']`), jamais du texte. `choix(valeurs, { defaut, bonus, horsProgramme })` (de `src/noyau/definir.ts`, comme les
  exercices) se déclare dans une variante, pas dans les réglages communs (ils dépendent du programme de ses classes).
- Un réglage **sans** `choix` (`max`, `completer`) est une valeur de la variante, que lit le dessin ; l'élève ne le change pas.
- Les types suivent : `type Reglages = ReglagesDeAffiche<typeof definition>` donne à `dessin` des réglages typés.
- `variantes` est un objet **ou une fonction pure** qui le produit (niveaux × un paramètre) ; elle est appelée à l'import, le
  catalogue n'en voit que des données.

## 2. Le dessin : des pages

`dessin(r, { W, H }, T, contexte)` est une fonction **pure** (pas de Vue, pas de DOM, pas de `Math.random`) qui rend **une liste
de pages** (au moins une) : `string`, ou `{ corps, titre? }` (`titre` absent : celui de l'affiche ; `null` : aucun).
Le cadre s'occupe du reste (titre, marge, A3, `@page`, polices, une feuille par page) ; l'aperçu, le test de mise en page et
le catalogue (`pages`) comptent les pages. `contexte` : `Tde(langue)` (textes dans une autre langue de la feuille),
`police(type?)` (famille choisie), `rng` (le hasard de la graine). Pour un dessin riche, voir les affiches de `main`.

## 3. Les textes

Clés par convention (`textes.ts` du dossier `affiches/`) : `titre`, `variante.<id>.court|titre|description`, `reglage.<cle>`,
`valeur.<cle>.<valeur>`, `groupe.<id>`, `aide.<cle>` (facultative), `police.<type>`. Le test vérifie qu'elles existent dans
chaque langue. Breton : chaque texte est marqué `// br: à relire`.

## 4. Ce qui en découle

- **Formulaire** (`src/noyau/FormulaireAffiche.vue`) : aucun code propre à une affiche. Variante, **groupes** de
  `definition.formulaire` (ordre, titre, aide), réglages **conditionnels** (`visibleSi` : invisible = défaut, non proposé), langues,
  polices, graine, **titre personnalisé** (commun à toutes les affiches, échappé, limité à 80 caractères, jamais déclaré dans une
  définition), format, orientation, aperçu. Lien : `<route>?affiche=<id>&variante=<v>&langues=fr,br`. Réglages mémorisés sous `affiche_<id>`.
- **Langues** : `langues` = langues de contenu. `bilingue: false` (défaut) : une langue par feuille, une entrée de catalogue par
  langue (comme l'alphabet). `bilingue: true` : réglage « langues affichées » (une ou plusieurs sur la feuille) ; le catalogue
  publie chaque langue seule puis toutes ensemble (`-fr-br`). Un **site ne publie que les entrées dont toutes les langues
  sont les siennes** : `catalogueDe(modules, site)` lit `site.languesInterface` et `site.languesRegionales` (`src/sites.ts`).
- **Polices** : `police: { mode: 'unique', defaut? }` (un choix pour l'affiche) ou `{ mode: 'parType', types, defauts }`
  (mots en script, tracés en attaché…), via `ChoixPolice` de `src/noyau/`. **Le titre et l'interface restent toujours en Andika.**
- **Hasard** : `hasard: true` seulement si le dessin tire au sort (`contexte.rng`, `creerRng(graine)`) ; sinon aucune graine
  (le test vérifie que le document ne dépend pas de `graine`).
- **Catalogue** (`catalogue.ts`, `entreesDe`) : une entrée par variante et par ensemble de langues, en **données pures**
  (JSON) : `slug, court, titre, description, niveaux (classes), domaine, genre, competences, langues, pages, config, lien`. Cela suffit
  pour les JSON publics du build. Slug : `affiche-<id>-<variante>` (+ `-<langues>` hors français seul), ou `variante.slug` : une
  affiche reportée de `main` garde son slug publié (`slug: 'affiche-horloge-heures-entieres'`) sans changer son identifiant.
- **Briques partagées** avec le formulaire d'exercice (`CadreExercice`), sans les fusionner : `ChoixReglage`, `GroupeReglages`,
  `ChoixPolice`, `ApercuImpression`, `reglages.ts` / `outils.ts` (même politique bonus et hors programme).
- **Tests** (`node tests/affiches-modele.test.mjs`, sans Chrome) : déclaration, compétences au programme, textes, réglages abîmés,
  visibilité, titre échappé, polices, dessin déterministe, pages, rien ne sort de la zone (chaque page × variante × réglage ×
  format × orientation × langues), catalogue complet, sérialisable et filtré par site, **instantané** `tests/instantanes/affiches.json`
  (`--maj` pour un écart voulu). Formulaire : `TEST_URL=http://localhost:5173/ecole-primaire/ node tests/dev-affiche.test.mjs`.

## 5. Visible seulement en développement

`exemples.ts` n'est atteint que par `import('…/exemples.ts')` sous `import.meta.env.DEV` (page `/dev/affiches`) ; Vite
supprime ce code du build de production. Domaine et compétences de l'exemple sont fictifs (`D.exemple`, `K.exemple…`).
Vérifier : `npx vite build --outDir /tmp/b --emptyOutDir` puis chercher `exemple` dans `/tmp/b` (rien).

## 6. Créer une affiche

`npm run nouveau -- affiche <id> "<Titre>"` (ou `node scripts/nouveau-affiche.mjs`) copie `exemple/`, change
l'identifiant et le titre, l'inscrit au registre ; reste à mettre de vraies compétences, variantes, dessin et textes. Puis
`node tests/affiches-modele.test.mjs --maj`, `npm run types`, `npm run lint`.

## Décisions (2026-10-05)

Les affiches riches (alphabet, nombres) entrent dans ce modèle (groupes, conditions, langues) · plusieurs pages · bilingue au choix
de chaque affiche · variantes calculées · chaque site publie ses langues · titre personnalisé commun · police unique ou par
type · deux formulaires (affiche, exercice) aux briques partagées · graine seulement pour le hasard · l'entrée de catalogue
suffit aux JSON publics. Détail : `plans/10-qualite-methode.md`, « Modèle cible des affiches ».
