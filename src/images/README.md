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

## Les icônes d'interface

Ce qui se clique ou qui nomme une notion de l'interface (barre, menu, pied de page, fil d'Ariane, boutons d'action, libellés du
programme, types de la recherche, titres des réglages) passe par `<Icone>`, avec un nom par rôle : une action = une icône, la même
partout. Décision du 2026-10-11 (après un essai de Phosphor, au trait, jugé terne pour des enfants) :

- **par défaut, les emojis de l'appareil**, à la taille du texte, comme avant ;
- au choix, **les dessins OpenMoji du site** (les mêmes sur tous les appareils) : réglage « Icônes du site », onglet « Appareil » de la
  page des réglages (`useIconesInterface`, clé `icones`). Ce réglage est à part de celui des fiches (« Images », OpenMoji par défaut).

- `icones.ts` : `ICONES`, nom → code OpenMoji (`imprimer: '1F5A8'`), une table à part des contenus (`tables.ts`) ; `CARACTERES` : le
  caractère d'une icône qui n'a pas d'emoji (le menu : ☰).
- `donnees/interface.ts` : les dessins OpenMoji, **générés** par `node scripts/generer/icones.ts`. Un lot à part (environ 80 Ko gzip : les identités du catalogue, les retours, les modes des
  exercices ; budget de 100 Ko dans `tests/images.test.mjs`), **chargé seulement si l'on choisit les dessins du site** (`chargerDessinsInterface`,
  `useImagesFiche.ts`) : le paquet principal ne le porte pas. En attendant qu'il arrive, l'icône est l'emoji de l'appareil.
- `<Icone nom="imprimer" />` : décorative à côté d'un texte ; seule dans un bouton, `libelle` (lu par les lecteurs d'écran). Sans
  `taille`, l'emoji suit le texte (le dessin OpenMoji, 1.4em, car sa marge le rend plus petit). Dans du HTML construit en chaîne :
  `iconeHtml(nom, { famille })` ; dans un SVG : `iconeSvg(nom, x, y, taille, famille)` (`icone.ts`).
- Fil d'Ariane, état vide, rubriques : un champ `icone` (une page de l'interface) à côté du champ `emoji` (un contenu).

## Les pictogrammes des consignes (ARASAAC)

Un verbe de consigne = un pictogramme ARASAAC (Sergio Palao, CC BY-NC-SA 4.0, non commercial), le même partout, à gauche du texte
de la consigne, qui reste toujours écrit. Guide : `brouillons/iconographie/GUIDE.md`, § 2.

- `consignes.ts` : `VERBES`, le lexique fermé (verbe → numéro ARASAAC ; provisoire, à relire par une personne), et
  `consignesDe(params)`. Une fiche écrit `${consigne(['compte', 'ecris'], T('consigneEcrire'))}` dans son `<p class="consigne">`, et
  sa vue passe `pictogrammes` à `<CadreExercice>` (le choix apparaît alors dans « Sur la fiche » : `ChoixPictogrammes.vue`).
- **À l'écran** : `<ConsigneParlee :texte :verbes="['compte']" :niveau="config.niveau">` (maternelle) place les pictogrammes entre
  le bouton « Écouter » et le texte, selon le même réglage (`pictogrammesDe`). Les verbes de l'écran : `montre` (toucher la bonne
  réponse), `range`, `compte`, `ecoute`.
- Le réglage (`options_fiche`, `optionsFiche.ts`) : **en maternelle** (défaut, d'après `reglages.niveau`), toujours, jamais.
  **Réglage absent = aucun pictogramme** : les PDF publiés et les instantanés n'en ont jamais (le texte revient à l'identique).
- La ligne de crédit qu'impose leur licence est ajoutée par le cadre (`appliquerOptionsFiche`) dès qu'un pictogramme est sur la
  feuille (`data-image="arasaac"`), avant le corrigé. On peut la retirer (« Mention des pictogrammes ») : un avis rappelle alors de
  citer l'auteur en partageant la fiche.
- `donnees/pictogrammes.ts` : **généré** par `node scripts/generer/pictogrammes.ts` (télécharge les PNG de 500 px dans
  `node_modules/.cache/arasaac`, les réduit à 200 px et les encode en WebP avec Chrome). Couleur, et « nocolor » d'ARASAAC pour le
  style contour. Environ 85 Ko gzip, **chargé seulement quand une fiche montre un pictogramme** (`chargerPictogrammes`). Le site ne
  fait aucune requête vers ARASAAC.
- Un verbe de plus : l'écrire dans `VERBES`, lancer le générateur, **regarder** l'image (un pictogramme peut porter un mot
  espagnol : « barre », 6223, « TACHAR », est écarté pour cela).

## Garde-fous

- `tests/images.test.mjs` vérifie les données, le budget, les dessins maison, les quatre combinaisons et la préférence corrompue.
- `npm run qualite`, compteur `emojisSysteme` : les emojis encore écrits en caractères dans les `.ts` et `.vue` de `src/`. Il ne fait que
  baisser.
- ESLint (`eslint.config.js`, `IMAGES_PAR_LE_CADRE`) : les dessins reçoivent le rendu, ils ne le fabriquent pas.

Licence : OpenMoji, CC BY-SA 4.0 (`LICENCE-CONTENU.md`, page « À propos »). Les dessins maison sont sous la même licence.
