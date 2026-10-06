# Fiches PDF toutes prêtes : un JSON d'index, un JSON par fiche

Plan 11. Le build écrit des **données**, la page `/telechargements` de l’app les lit ; les pages HTML statiques (référencement) en sont dérivées (section « Pages statiques »).
Les mêmes types (`types.ts`) servent à l'écriture (`scripts/fiches/`) et à la lecture (`useFiches`, les vues).
Données pures, sérialisables ; aucune date, fonction ni `Map`.

## Ce que produit le build

```
<outDir>/fiches/
  index.json                         IndexFiches : liste, filtres, métadonnées de recherche
  <slug>.json                        Entree : tout l'index + description longue, compétences, variantes, réglages, voisines
  <slug>/miniature.jpg               vignette de la grille (≈ 300 px de large)
  <slug>/<variante>-p<N>.jpg         aperçu de la page N d'une variante (≈ 800 px de large)
  <slug>/<variante>-<format>.pdf     PDF d'une variante au format de papier (a4, a3)
```

`npm run fiches -- --mode skoolik --outDir dist-skoolik [--avec-exemples]` (voir `scripts/fiches/commande.ts`).
`--avec-exemples` ajoute les entrées d'exemple (domaine fictif `exemple`), marquées `exemple: true` ; jamais en production.
En développement : `npm run fiches:dev` écrit dans `public/fiches/` (ignoré par git) et `npm run dev` le sert. Attention : `vite build` copie `public/` ; les scripts `build*` enchaînent la commande, qui vide `<outDir>/fiches/` avant d'écrire, donc rien d'exemple ne reste (`build:app` seul peut en garder).

## Choix de rendu

Les modules (générateurs, fiches, dessins d'affiches, `documentFiche`) sont purs : le build les importe directement dans node, sans page de rendu ni `window.__ecolePrimaire`. Chrome ne sert qu'à transformer le HTML en PDF et en images (un navigateur, des onglets en parallèle, `document.fonts.ready`). Andika est embarquée en data: URL. Aperçus : chaque feuille d'une affiche ; pour une fiche d'exercice (flux continu), seulement le haut de la première page (le corrigé sur une autre page compte dans `nbPages` du PDF mais n'a pas d'aperçu).

## Décisions

- **Chemins relatifs à `fiches/`.** `Image.chemin` et `FichierPdf.chemin` valent `<slug>/<fichier>`, jamais `/…` ni `..`.
  La page ajoute `import.meta.env.BASE_URL + 'fiches/'` : le site peut être servi sous n'importe quelle base.
- **Slug = nom du fichier JSON.** Un slug publié ne change pas. Lettres minuscules, chiffres et tirets. Un exercice :
  `exercices-<id>-<classe>[-<fiche>]`, une affiche : `affiche-<id>-<variante>` (ou le slug déclaré par la variante) ;
  une langue autre que le français ajoute `-<code>` (`-br`).
- **Niveaux = tableau de classes** (`Classe`), jamais du texte ; la page fabrique « GS · CP » (`etiquetteClasses`).
- **Usage dérivé du genre** (`usageDe`) : `affiche` → « pour apprendre », `fiche` et `exercice` → « pour s'entraîner ».
- **Textes multilingues** : `Texte = { fr, br?, … }`. Le français est toujours présent (repli). La langue de l'interface
  choisit ; la langue du **contenu** de la fiche est dans `langues`.
- **Une entrée = une fiche dans une langue.** Les fiches par compétence d'un exercice sont des entrées à part dont
  `parent` est le slug du bilan de la classe ; la grille ne montre que les entrées sans parent, la page du bilan liste
  ses enfants (les retrouver dans l'index : `parent === slug`).
- **Variantes** : une affiche en a une ; un exercice en a plusieurs (graines différentes, un PDF chacune). Chaque variante
  a un PDF par format de papier et un aperçu par page (au premier format).
- **Graines fixes** (dérivées du slug) : deux builds donnent les mêmes questions.
- **Filtres et recherche** : `index.filtres` liste ce qui existe (classes, langues, usages, domaines avec noms et liens
  du programme officiel) ; `recherche` est un texte déjà normalisé (minuscules, sans accents) ; `filtrer()` de
  `recherche.ts` applique les critères côté client, sans autre requête.
- **Versionnement** : `index.version` = `VERSION_SCHEMA`. Un changement incompatible incrémente ; la page refuse (message
  clair) un index d'une autre version, ce qui arrive si un navigateur garde une page ancienne devant des données neuves.
  `genereLe` (ISO 8601) sert à l'affichage et au diagnostic ; les URL ne portent pas de hash (servez `index.json` avec
  un cache court).
- **Validation** : `valider.ts` contrôle les données à l'écriture (le build échoue) et à la lecture (la page affiche une
  erreur au lieu de planter).

## Côté page

- `useFiches()` charge `fiches/index.json` une fois (partagé), puis `fiches/<slug>.json` à la demande.
- Pages (plan 13, `src/pages/`) : `FichesPretesView` (`/maths|francais|monde/fiches` : filtres, cartes ou liste), `FichesPretesIndexView`
  (`/telechargements` : A→Z par matière), `FeuilleView` (`/telechargements/<slug>` : aperçu multipage, Télécharger / Imprimer, même fiche
  dans d'autres langues, Personnaliser, compétences, voisines). Logique pure : `pages.ts` ; état : `useFichesPage.ts`, `useFeuille.ts` ;
  impression : `imprimer.ts` (cadre caché sans `sandbox` : Chrome n'affiche pas un PDF dans un cadre à bac à sable).
- Classes et mode de langue viennent du contexte ; le filtre de langue n'existe qu'en mode bilingue. « Même fiche » = entrées de l'index
  de même slug de base (`slugDeBase` : le suffixe `-<langues>` vient de l'entrée). Voisines = `voisines` du catalogue, sans la classe.
- **Index absent** (404, ou réponse HTML d'un serveur de développement sans `public/fiches/`) : état « indisponible » avec un message ;
  en développement, la commande à lancer. **Illisible ou d'une autre version** : état « erreur ». **Site sans entrée** : état « vide »
  (pas une erreur). Un filtre sans résultat : « aucune fiche avec ces filtres », avec un bouton pour tout réinitialiser.

## Hors périmètre pour l'instant

Pas d'image de partage dédiée au site (les pages d'accueil partagent `icone-512.png`, celles des fiches leur miniature).
