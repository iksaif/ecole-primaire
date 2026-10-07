# Affiches au format « définition » (plans 10 et 11)

Une affiche **se déclare** ; sa feuille, son formulaire, son catalogue et ses tests en découlent. Modèle vivant :
`alphabet/` (la première affiche reportée de `main`, pour un cas réel), `exemple/` (la bande numérique, MS et GS : le point de départ), `exemple-jours/` (une langue par feuille, police par type) et
`exemple-riche/` (champs libres, conditions, préréglages, valeurs dynamiques, format fixe, mesure de texte) ; ils sont visibles
sur `/dev/affiches` avec `npm run dev` et absents du build.

```
src/affiches/<id>/
  definition.ts   la déclaration : domaine, compétences, variantes (classes), réglages à choix (données pures)
  dessin.ts       pur : dessin(réglages, { W, H }, T, contexte) → pages (HTML de la zone sous le titre) ; css
  textes.ts       titre, noms des variantes, libellés des réglages, par langue (fr, br)
  index.ts        { definition, rendu, textes } : le module que lisent registre, formulaire, catalogue, tests
src/affiches/index.ts      registre (y ajouter l'affiche) ; dev.ts : les exemples, dev seulement (même rôle que src/exercices/dev.ts)
src/affiches/FormulaireAffiche.vue   le formulaire générique : variante, préréglages, réglages, champs, langue, format, orientation, police, aperçu
src/affiches/GroupeReglages.vue      un groupe du formulaire (titre, aide) ; ChoixReglage et ChoixPolice viennent de src/noyau/
src/affiches/mesure.ts + metriques.ts + mesureNavigateur.ts   la mesure de texte (voir § 2)
src/impression/affiches/cadre.ts   le cadre commun : page, titre, marge, A3 (échelle ×1,41), document imprimable
src/noyau/declaration.ts + politique.ts   ce que partagent `definir` (exercices) et `definirAffiche` : voir « Deux modèles »
```

`src/noyau/` n'importe jamais `src/affiches/` (le formulaire d'affiche est ici, pas dans le noyau) : les couches vont dans un sens.

**Pourquoi `src/affiches/<id>/`** (et pas sous `src/impression/affiches/`) : une affiche est une ressource de même rang
qu'un exercice (domaine, classes, compétences, réglages) ; on retrouve `src/exercices/<id>/` en miroir. `src/impression/`
garde ce qui sert à imprimer : le cadre, les polices, les gabarits.

## 1. La définition

```ts
const lettres = choix([false], { horsProgramme: [{ option: true, raison: '…' }] })   // un réglage = une description

export default definirAffiche({
  id: 'exemple', domaine: D.exemple, orientations: ['landscape', 'portrait'],   // la première est le défaut ; une seule : fixe
  langues: CODES, bilingue: true,                     // plusieurs langues sur la même feuille
  hasard: true,                                       // réglage « graine » + bouton « Nouvelle »
  competences: [K.exempleLire, K.exempleCompter],     // une fois ; chaque variante garde celles de TOUTES ses classes
  reglages: { points: choix([false, true]) },         // commun aux variantes
  formulaire: {
    groupes: [{ id: 'repere', reglages: ['points', 'lettres', 'langues'] }, { id: 'completer', reglages: ['graine'] }],
    visibleSi: { graine: { reglage: 'completer', valeur: true } },
  },
  variantes: () => Object.fromEntries(BANDES.flatMap(b => [false, true].map(completer => [   // variantes calculées
    completer ? `${b.id}-completer` : b.id, { classes: b.classes, reglages: { max: b.max, debut: b.debut, completer, lettres } }]))),
})
```

- `definirAffiche` vérifie tout **à l'import** (domaine, compétences, classes, défaut au programme, raison d'un
  `horsProgramme`, langues du registre, réglages cités par le formulaire…) : une faute échoue avec un message qui dit quoi corriger.
- Des **constantes** `D.…` et `K.…` (`src/noyau/ids.ts`) : une faute de frappe ne compile pas. Les **classes** d'une variante
  sont un tableau (`classes: ['ms']`), jamais du texte. `choix(valeurs, { defaut, bonus, horsProgramme })` (de `src/noyau/definir.ts`, comme les
  exercices) se déclare dans une variante, pas dans les réglages communs (ils dépendent du programme de ses classes).
- Un réglage **sans** `choix` (`max`, `completer`) est une valeur de la variante, que lit le dessin ; l'élève ne le change pas.
- Beaucoup de variantes (un verbe × une série de temps) : chacune déclare sa place, `axes: { verbe: 'etre', temps: 'cycle' }` (toutes les
  variantes, les mêmes axes, jamais deux au même endroit) ; le formulaire montre une rangée de boutons par axe (textes `axe.<axe>` et
  `axe.<axe>.<valeur>`) au lieu de la liste des variantes. Exemple : `conjugaison/`.
- Une variante peut avoir son `format` et son `orientation` par défaut (`format: 'A3'`) : ceux de la fiche publiée ; l'élève les change, et le premier PDF de la page de téléchargement est celui-là.
- Les types suivent : `type Reglages = ReglagesDeAffiche<typeof definition>` donne à `dessin` des réglages typés.
- `variantes` est un objet **ou une fonction pure** qui le produit (classes × un paramètre) ; elle est appelée à l'import, le
  catalogue n'en voit que des données. Une variante peut partir d'une autre : `herite: '<variante>'` (réglages seulement : ni
  `classes`, ni `sauf`, ni `horsProgramme` ne sont hérités). Une compétence travaillée malgré le programme se déclare
  `horsProgramme: [{ competence: K.…, raison }]` (jamais un `option` : c'est une compétence, pas une valeur de réglage) ;
  `autresDomaines` autorise des compétences d'un autre domaine, comme pour un exercice.

### Deux modèles, un noyau commun (et trois différences voulues)

`definir` (exercices) et `definirAffiche` partagent `src/noyau/declaration.ts` (choix, cases, texte, nombre, contrôle du domaine
et des compétences, compétences d'un niveau, héritage, types des réglages) et `src/noyau/politique.ts` (options, bonus, hors
programme, valeurs valides, valeurs reportées d'un niveau à l'autre). Une règle se change là, une fois. Ce qui diffère :

| | exercice | affiche |
|---|---|---|
| une « version » | un **niveau** = une classe ; `niveaux` est un **objet** `{ cp: {…}, ce1: {…} }` | une **variante** = une ou plusieurs classes ; `classes` est un **tableau** `['gs', 'cp']` |
| `sauf` et compétences | une compétence reste si elle est au programme de **la** classe | elle reste seulement si elle est au programme de **toutes** les classes de la variante (`every`) : une affiche GS · CP ne montre pas ce que le CP seul apprend ; `sauf` écarte en plus |
| réglages libres | choix et cases seulement | + champs `texte()` et `nombre()` (un exercice qui en déclare un est refusé) |

Le côté « version » vit sous deux noms exprès : `niveaux` (objet) côté exercice, `classes` (tableau) côté affiche, y compris dans les
entrées de catalogue d'affiche (`classes`) ; le schéma public des fiches (`niveaux`, `src/telechargements/`) reste celui des JSON.

## 2. Le dessin : des pages

`dessin(r, { W, H }, T, contexte)` est une fonction **pure** (pas de Vue, pas de DOM, pas de `Math.random`) qui rend **une liste
de pages** (au moins une) : `string`, ou `{ corps, titre? }` (`titre` absent : celui de l'affiche ; `null` : aucun).
Le cadre s'occupe du reste (titre, marge, A3, `@page`, polices, une feuille par page) ; l'aperçu, le test de mise en page et
le catalogue (`pages`) comptent les pages. `contexte` : `Tde(langue)` (textes dans une autre langue de la feuille),
`police(type?)` (famille CSS choisie), `nomPolice(type?)` (son nom seul), `rng` (le hasard de la graine) et `mesure` (ci-dessous).
Pour un dessin riche, voir `alphabet/` (des cartes en SVG, mesure de texte, une ou plusieurs langues, une page par lettre).

**Mesure de texte** : `contexte.mesure.largeur(texte, police, gras?)` (en em) et `.metriques(police)` (hauteur d'x, de majuscule, de
hampe, de jambage). Le dessin reste pur parce que la mesure lui est **injectée** (`genererAffiche(module, config, polices, mesure)`) :
le navigateur donne le canvas (`mesureNavigateur`, exacte) ; node, le build et les tests donnent `mesureEstimee` : les largeurs des
polices livrées, mesurées une fois dans Chrome (`node scripts/generer/metriques-polices.mjs` refait la table `metriques.ts`). Elle ignore le
crénage et les ligatures : sur les phrases d'essai, **écart de 0,1 % en Andika, 4 % en Luciole, 3 % en Playwrite FR Trad, 8 % en
OpenDyslexic** ; une police inconnue est estimée comme Andika. Donc : un dessin qui ajuste un texte à une largeur garde une marge
(10 %), et le document généré par node (PDF du build) peut différer de quelques pour cent de l'aperçu du navigateur ; sans
ajustement au texte, ils sont identiques. Le test « rien ne sort de la zone » juge les textes avec la mesure estimée.

## 3. Les textes

Clés par convention (`textes.ts` du dossier `affiches/`) : `titre`, `variante.<id>.court|titre|description`, `reglage.<cle>`,
`valeur.<cle>.<valeur>`, `groupe.<id>`, `aide.<cle>` (facultative), `police.<type>`, `prereglage.<id>`. Le **formulaire** les lit dans la
**langue de l'interface** (retombée sur le français) ; le titre et l'aperçu, dans la langue de la feuille. Le test vérifie qu'elles existent dans
chaque langue. Breton : chaque texte est marqué `// br: à relire`.

## 4. Ce qui en découle

- **Formulaire** (`src/affiches/FormulaireAffiche.vue`) : aucun code propre à une affiche. Variante, **préréglages**, **groupes** de
  `definition.formulaire` (ordre, titre, aide), réglages **conditionnels** (`visibleSi` : invisible = défaut, non proposé), **champs
  libres**, langues, polices, graine, **titre personnalisé** (commun à toutes les affiches, échappé, limité à 80 caractères, jamais
  déclaré dans une définition), format et orientation (**seulement s'il y en a plusieurs** de permis), aperçu. Lien :
  `<route>?affiche=<id>&variante=<v>&langues=fr,br` (`lienDe`, « Personnaliser » d'une fiche toute prête). L'adresse de la page suit
  ensuite **tous** les réglages qui s'écartent des défauts de la variante, une clé par réglage (`sections=cent,perso&de=41`,
  `police.script=Luciole`, `titre=…`, `graine=…` ; seulement les polices livrées) : `queryDeReglages` l'écrit, `lireLien(query, definition)`
  la relit avec méfiance (format détaillé en tête de `src/pages/AfficheView.vue`). Le test vérifie que chaque entrée du catalogue
  rouvre les mêmes réglages, et l'aller-retour réglages → adresse → réglages pour chaque jeu de réglages. Un réglage ne peut pas
  porter le nom d'une clé de la feuille (`CLES_DE_LA_FEUILLE`). Réglages mémorisés sous `affiche_<id>`.
- **Langues** : `langues` = langues de contenu. `bilingue: false` (défaut) : une langue par feuille, une entrée de catalogue par
  langue (comme les jours de la semaine). `bilingue: true` : réglage « langues affichées » (une ou plusieurs sur la feuille) ; le catalogue
  publie chaque langue seule puis toutes ensemble (`-fr-br`). Un **site ne publie que les entrées dont toutes les langues
  sont les siennes** : `catalogueDe(modules, site)` lit `site.languesInterface` et `site.languesRegionales` (`src/sites.ts`).
- **Polices** : `police: { mode: 'unique', defaut? }` (un choix pour l'affiche) ou `{ mode: 'parType', types, defauts }`
  (mots en script, tracés en attaché…), via `ChoixPolice` de `src/noyau/`. **Le titre et l'interface restent toujours en Andika.**
- **Hasard** : `hasard: true` seulement si le dessin tire au sort (`contexte.rng`, `creerRng(graine)`) ; sinon aucune graine
  (le test vérifie que le document ne dépend pas de `graine`).
- **Catalogue** (`catalogue.ts`, `entreesDe`) : une entrée par variante et par ensemble de langues, en **données pures**
  (JSON) : `slug, court, titre, description, classes, domaine, genre, competences, langues, pages, config, lien`. Cela suffit
  pour les JSON publics du build. Slug : `affiche-<id>-<variante>` (+ `-<langues>` hors français seul), ou `variante.slug` : une
  affiche reportée de `main` garde son slug publié (`slug: 'affiche-horloge-heures-entieres'`) sans changer son identifiant.
- **Briques partagées** avec le formulaire d'exercice (`CadreExercice`), sans les fusionner : `ChoixReglage`, `GroupeReglages`,
  `ChoixPolice`, `ApercuImpression`, et la politique de `src/noyau/politique.ts` (bonus, hors programme, valeurs reportées).
- **Tests** (`node tests/affiches-modele.test.mjs`, sans Chrome) : déclaration (et ses messages d'erreur), compétences au programme, textes,
  réglages abîmés, visibilité et conditions, champs, valeurs dynamiques, préréglages, format fixe, mesure de texte, lien ↔ formulaire, titre échappé, polices, dessin déterministe, pages, rien ne sort de la zone (chaque page × variante × réglage ×
  format × orientation × langues), catalogue complet, sérialisable et filtré par site, **instantané** `tests/instantanes/affiches.json`
  (`--maj` pour un écart voulu). Formulaire : `TEST_URL=http://localhost:5173/ecole-primaire/ node tests/dev-affiche.test.mjs`.

## 5. Réglages riches (exemple-riche/)

```ts
definirAffiche({
  id: 'exemple-riche', domaine: D.exemple, competences: [K.exempleLire],
  formats: ['A4'], orientations: ['portrait'],            // fixes : ni l'un ni l'autre n'est proposé
  police: { mode: 'parType', types: ['script', 'attache'], defauts: { … } },
  reglages: {
    serie: choix(['alphabet', 'mot', 'nombres']),
    lettres: cases(TOUTES, { defaut: ['a', 'b', 'c'] }),   // choix multiple
    mot: texte({ defaut: 'bonjour', max: 20 }),             // champ texte (longueur maximale)
    de: nombre({ defaut: 0, min: 0, max: 99, pas: 1 }),     // champ nombre (bornes incluses, au pas près depuis min)
  },
  formulaire: { visibleSi: {
    mot: { reglage: 'serie', valeur: 'mot' },                                       // égal
    pointilles: { tous: [{ reglage: 'styles', contient: 'script' },                 // ET
                         { un: [{ reglage: 'serie', valeur: 'alphabet' }, { reglage: 'serie', dans: ['mot'] }] }] },   // OU, dans
    'polices.attache': { reglage: 'styles', contient: 'attache' },                  // un type de police
  } },
  offertes: { lettres: c => alphabetDe(String(c.langue)) },   // valeurs proposées selon les autres réglages
  prereglages: { 'mon-prenom': { serie: 'mot', mot: 'Léa', styles: ['script', 'attache'] } },
  variantes: { ecrire: { classes: ['cp'] } },
})
```

- **Conditions** : `{ reglage, valeur }` (égal), `{ reglage, dans: [...] }` (la valeur est dans la liste), `{ reglage, contient }` (la liste
  choisie contient la valeur : un `cases`, `langues`), `{ tous: [...] }` (ET), `{ un: [...] }` (OU), imbriquées. `reglage` peut aussi
  être `variante`, `langue`, `langues`, `format`, `orientation`. La clé de `visibleSi` est un réglage, ou `polices.<type>`. Les conditions
  sont évaluées dans l'ordre déclaré : mettre une dépendance après ce dont elle dépend.
- **Champs** : `texte({ defaut, max })` (200 caractères au plus par défaut) et `nombre({ defaut, min, max, pas })`. Valeurs lues
  (mémorisées, lien) ramenées aux bornes ; une valeur invalide reprend le défaut. Un texte libre est **à échapper** par le dessin dès
  qu'il va dans du HTML (`echapper` de `src/utils/html.js`) ; le test essaie un texte plein de `<`, `&` et `"`. Une borne qui dépend
  d'un autre champ (de ≤ à) est l'affaire du dessin (ici, il prend le min et le max).
- **Valeurs dynamiques** : `offertes: { <cle>: (config) => valeurs }` restreint un `choix` / `cases` déclaré (le superset) d'après les
  autres réglages (langue, variante…) ; le défaut est gardé s'il reste proposé, sinon la première valeur. Types de police qui
  dépendent d'un réglage : `visibleSi['polices.<type>']`.
- **Format et orientation fixes** : `formats` / `orientations` à une seule valeur ; le formulaire ne les montre pas et toute autre valeur
  lue est refusée. Défaut : `orientations: ['portrait', 'landscape']`, `formats: ['A4', 'A3']`.
- **Préréglages** : `prereglages: { <id>: { <réglage>: valeur, … } }` (texte `prereglage.<id>`) ; un clic pré-remplit le formulaire (valeurs
  validées comme tout réglage lu : `appliquerPrereglage`), qui reste modifiable ; le bouton est « actif » tant que les valeurs sont celles
  du préréglage. Ce ne sont pas des variantes : pas d'entrée de catalogue, pas de classes ni de compétences propres (une entrée de
  catalogue par préréglage reste à décider, quand une affiche en aura besoin : ce serait un lien `&prereglage=<id>`).

## 6. Visible seulement en développement

`dev.ts` n'est atteint que par `import('…/dev.ts')` sous `AVEC_DEV` (`src/dev.ts` : page `/dev/affiches`) ; Vite
supprime ce code du build de production. Domaine et compétences de l'exemple sont fictifs (`D.exemple`, `K.exemple…`).
Vérifier : `npx vite build --outDir /tmp/b --emptyOutDir` puis chercher `exemple` dans `/tmp/b` (rien).

## 7. Créer une affiche

`npm run nouveau -- affiche <id> "<Titre>"` (ou `node scripts/nouveau-affiche.mjs`) copie `exemple/`, change
l'identifiant et le titre, l'inscrit au registre ; reste à mettre de vraies compétences, variantes, dessin et textes. Puis
`node tests/affiches-modele.test.mjs --maj`, `npm run types`, `npm run lint`.

## Décisions (2026-10-05)

Les affiches riches (alphabet, nombres) entrent dans ce modèle (groupes, conditions, langues) · plusieurs pages · bilingue au choix
de chaque affiche · variantes calculées · chaque site publie ses langues · titre personnalisé commun · police unique ou par
type · deux formulaires (affiche, exercice) aux briques partagées · graine seulement pour le hasard · l'entrée de catalogue
suffit aux JSON publics. Détail : `plans/10-qualite-methode.md`, « Modèle cible des affiches ».
