# Les images du site (`src/images/`)

Les emojis des fiches, des affiches et de l'écran passent tous par ici. On obtient ainsi le même dessin à l'écran, dans l'aperçu et
dans le PDF, et l'utilisateur peut choisir ses images comme il choisit sa police.

## Ce qu'il y a dans le dossier

| Fichier | Rôle |
| --- | --- |
| `tables.ts` | `EMOJIS` : le vocabulaire, un nom par emoji (`pomme: '1F34E'`). Le type `NomEmoji` est tiré de ces noms, donc une faute de frappe ne compile pas. |
| `preference.ts` | La préférence « Images » : `famille` (`openmoji` : les dessins du site, ou `systeme` : les emojis de l'appareil) et `style` (`couleur`, ou `contour` à colorier). `assainirImages` relit une valeur mémorisée avec méfiance. |
| `rendu.ts` | `creerRenduImages(preference)` → `{ svg(nom, x, y, taille), html(nom, taille?, alt?) }`. Pour une fiche : `imagesDe(params)`. |
| `systeme.ts` | Le caractère emoji d'un code (`2600` → ☀️, avec FE0F là où il le faut), pour la famille « système ». |
| `donnees/couleur.ts`, `donnees/contour.ts` | Les dessins, en SVG intégré au code. **Générés** par `node scripts/generer/images.ts` : ne pas les modifier à la main. |
| `maison/` | Nos dessins au style OpenMoji, quand OpenMoji n'a pas l'image voulue (`maison/README.md`). |
| `useImagesFiche.ts` | La préférence mémorisée (clé `images`). Ce module est léger : il n'importe aucun dessin. |
| `Emoji.vue` | Un emoji à l'écran : `<Emoji nom="pomme" />`. Il suit la famille choisie et reste toujours en couleur. |

Le choix se fait dans `src/noyau/ChoixImages.vue`. Il apparaît dans « Sur la fiche » (`<CadreExercice images>`) et dans le
formulaire d'une affiche, dès que son dessin a rendu au moins un emoji (`avecImages`).

## Dessiner un emoji

- **Affiche** : le dessin reçoit le rendu dans son contexte : `ctx.images.svg('chat', x, y, cote)` dans un SVG, ou
  `ctx.images.html('pomme', '12mm')` dans du HTML.
- **Fiche d'exercice** : `const images = imagesDe(params)`, puis `images.html('pomme', '12mm', 'pomme')`. Il faut aussi passer
  `images` à `<CadreExercice>` pour que le choix apparaisse dans « Sur la fiche ». Les PDF publiés et les instantanés ne reçoivent pas
  de préférence : `imagesDe` rend alors le défaut, OpenMoji en couleur.
- **Écran** : `<Emoji nom="…" />`.
- Un dessin ne fabrique jamais le rendu lui-même et ne lit jamais les données. La règle ESLint `no-restricted-imports` l'interdit dans
  `src/affiches/`, `src/exercices/` et `src/moteurs/`. Sans cette règle, la préférence de l'utilisateur ne l'atteindrait pas.
- `alt` : le mot visé, lu par les lecteurs d'écran. Sans `alt`, l'image est décorative, parce que le mot est écrit à côté.
- Sans `taille`, `html` suit le texte (1em). En famille « système », il rend alors **le caractère seul, sans balise**. C'est ce qui
  permet de migrer un exercice sans changer ses fiches : en famille « système », elles restent identiques à leurs instantanés.

## Ajouter un emoji

1. L'écrire dans `tables.ts`, avec un nom qui garde un seul sens. Le code est le nom du fichier OpenMoji 15.1 : majuscules, points de
   code séparés par `-`, sans `FE0F`. On le trouve sur [openmoji.org](https://openmoji.org).
2. Lancer `node scripts/generer/images.ts`. Le script télécharge le dessin une fois dans `node_modules/.cache/openmoji/`. Il échoue si
   le code n'existe pas.
3. Lancer `node tests/images.test.mjs`, puis **regarder** le dessin dans les deux styles.

## Les deux familles, les deux styles

- **OpenMoji couleur** (défaut) : le dessin d'origine.
- **OpenMoji contour** : le générateur le **déduit de la couleur**. Tout aplat ou trait de couleur devient blanc, et le noir reste noir.
  L'intérieur reste donc blanc et opaque, comme le papier : un chat posé devant un mur le cache encore. Les fichiers « black »
  d'OpenMoji ne servent pas, parce qu'ils sont transparents. Un dessin maison peut fournir sa propre retouche, `maison/<nom>.contour.svg`.
  Les dessins propres à une affiche (une table, un solide) ne sont pas concernés : ils gardent leurs couleurs.
- **Emojis du système** : le caractère, dans la police d'emojis de l'appareil. Il est centré dans le même carré qu'un OpenMoji, ce qui
  garde la mise en page. Il n'y a pas de contour. Un emoji sans caractère dans le système (dessin maison, extra d'OpenMoji comme la
  pyramide `E20F`) reste dessiné par OpenMoji, en couleur.
- `data-image="openmoji|maison"` marque chaque dessin. Les propriétés des PDF lisent cette marque pour les crédits
  (`scripts/build/fiches/metadonnees.ts`). Un emoji du système n'est pas marqué : il n'a pas de crédit à donner.

## Poids

Les données ne vont que dans les paquets qui en rendent : le générateur des affiches (les pages de catalogue le chargent aussi, pour
compter les pages) et `ChoixImages`, que `OptionsFiche` charge à la demande. Un exercice sans images ne les charge pas. Le
**budget** est de 150 Ko gzip par style (`tests/images.test.mjs`) ; le 2026-10-10, on était à ~48 Ko par style pour 75 emojis.
Au-delà du budget, il faudra découper le générateur : le contour à la demande, puis un lot par domaine. Les appelants ne changeront
pas, puisqu'ils ne voient que le rendu. Pour l'interface (domaines, retours), prévoir un lot séparé et court, sinon les dessins
entreraient dans le paquet principal.

## Garde-fous

- `tests/images.test.mjs` vérifie les données, le budget, les dessins maison, les quatre combinaisons et la préférence corrompue.
- `npm run qualite`, compteur `emojisSysteme` : les emojis encore écrits en caractères dans les `.ts` et `.vue` de `src/`. Il ne fait que
  baisser.
- ESLint (`eslint.config.js`, `IMAGES_PAR_LE_CADRE`) : les dessins reçoivent le rendu, ils ne le fabriquent pas.

Licence : OpenMoji, CC BY-SA 4.0 (`LICENCE-CONTENU.md`, page « À propos »). Les dessins maison sont sous la même licence.
