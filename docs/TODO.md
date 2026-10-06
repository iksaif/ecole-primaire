# TODO

> Liste de travail interne : idées, bugs, décisions en attente. Rien ici n'est une promesse.
> Ce qui est fait part dans le CHANGELOG et l'historique git ; `src/data/programme.ts` fait foi pour les niveaux.

## Demandes du 2026-10-05

- [ ] 🗺️ **Feuille de route de la base saine (2026-10-06)** : (1) **critique** du noyau et des exemples par deux regards en lecture seule (code/API/UX ; faisabilité contre les 22 exercices et les familles d'affiches), puis amélioration ; (2) finir la **structure du site et la navigation** — ⏸️ **PAUSE : on en discute avec l'utilisateur avant d'y toucher** ; (3) remettre les **tests nécessaires**, rapides et avec une bonne gestion des dépendances (ancien `tests/ancien/`) ; (4) **porter un ou deux exercices et affiches**, puis faire le point
- [ ] **Décisions du 2026-10-06 (critique du noyau et des exemples)** : l'Écriture (Seyès) et le Calcul en mode fiche sont des **exercices « fiche seule »** (« pour s'entraîner », sans mode en ligne) ; **Mistral** (Dictée) reste une exception explicite et facultative (rien ne sort sans clé) ; le niveau **« CP → CM2 » de l'orthographe est supprimé** au report (le slug publié `exercices-orthographe-cp-cm2` disparaît ou redirige) ; **contraste** : bleu plus foncé pour le texte, bleu actuel pour les aplats ; la voix (TTS) entre dans le noyau avec repli silencieux (pas de voix bretonne) ; instantanés réactivés à chaque report
- [ ] **À finir au premier report d'un exercice** : (1) `scripts/nouveau.mjs` génère encore vers l'ancien registre (`src/exercices/index.js`) et `src/i18n/` : il échoue proprement sans rien écrire — à réécrire pour inscrire dans un registre typé de la base (un nouvel exercice doit pouvoir se créer en une commande) ; (2) `src/exercices/traducteur.ts` est un pont vers l'ancien `contenu` pour les exercices au format `{ fr, br }`, à supprimer avec le dernier ancien exercice ; (3) les clés `T('…')` des générateurs et fiches ne sont pas typées (vérifiées par test pour les exemples seulement) ; (4) la section de textes `dev` est incluse dans le build de production (quelques textes)
- [ ] **Fiches en JSON — à reprendre plus tard** (`src/telechargements/README.md`, plan 11) : sitemap, `robots.txt`, `404.html`, manifeste, image de partage, JSON-LD et pages HTML par fiche (SEO/accessibilité, à partir des JSON) ; polices locales non redistribuables ; fiches « à la main » (écriture, alphabet, calcul) ; aperçu des fiches d'exercice (la fiche s'écoule : une seule image d'aperçu pour un PDF de 2 pages) ; noms de domaines en breton encore lus dans l'ancien `src/i18n/br/domaines.js` ; `build:app` seul peut garder les fiches de `fiches:dev` copiées depuis `public/`
- [ ] **Décisions du 2026-10-05 sur les exemples (en cours d'application)** — *affiches* : les affiches riches (alphabet, nombres) entrent dans le modèle avec des réglages riches ; plusieurs pages par affiche (le dessin renvoie une liste de pages) ; bilingue au choix de chaque affiche (les nombres : français, breton ou les deux ; l'alphabet : séparé) ; variantes calculées par une fonction (conjugaison) ; chaque site publie les langues qu'il propose ; titre personnalisé = option commune à toutes les affiches ; police : soit un choix unique (avec un défaut possible par affiche), soit un choix par type d'élément, le titre et l'interface restant dans la police de base ; deux composants de formulaire (affiche, exercice) qui partagent leurs briques ; graine seulement pour les affiches qui ont du hasard ; l'entrée du catalogue suffit pour les JSON — *exercices* : réglage à choix multiple de chaînes ou de nombres ; un niveau sans compétence au programme = erreur franche ; **deux exemples d'exercice** (un simple, un avec un corpus séparé de l'interface) ; `horsProgramme` au niveau d'une compétence illustré dans l'exemple
- [ ] 🌱 **BASE SAINE (décision du 2026-10-05, plan 11)** — branche locale `base-saine`, **rien n'est poussé ni déployé tant que ce n'est pas fini** : l'existant (exercices, affiches, impressions, pages) est déconnecté mais conservé ; tout en TypeScript propre ; exemples d'exercice et d'affiche avec de **fausses entrées de programme dev seulement** ; sites typés (skoolik : breton + français, langue régionale breton par défaut) ; langues et traductions typées ; navigation qui marche ; fiches toutes prêtes = `fiches/index.json` + un JSON par entrée, `/telechargements` page normale de l'app (HTML statique/SEO/accessibilité : plus tard) ; puis on reporte les anciens exercices et affiches un par un
- [ ] ⏸️ **GEL DES REFACTORS (décision du 2026-10-05)** : on ne refactore ni les exercices ni les affiches existants (passes de lisibilité, migration des affiches, builders sur les 22 définitions) **tant que les deux exemples de départ ne sont pas très bons** ; ensuite le refactor se fait contre les exemples validés. En attendant : seulement les exemples (`src/exercices/exemple/`, `src/affiches/`), les corrections de bugs et les demandes de contenu
- [ ] **Deux mondes : nouveau socle typé dans `src/noyau/`** (TypeScript, builders, constantes ; décision du 2026-10-05 : les exemples en TS, libs repensées à côté plutôt que migrées en place) ; programme/classes/hasard/réponses/document en `.ts` sur place avec shims `.js` ; migration des 22 exercices et des affiches ensuite, contre les exemples validés ; suppression de l'ancien socle avec le dernier exercice migré (compteur à cliquet « importeurs de l'ancien socle »). Voir plan 10, « Deux mondes en même temps »
- [ ] **Définitions plus concises** (retour de l'utilisateur) : `definir()` + `choix(valeurs, { defaut, bonus })` (un réglage = une description, au lieu de `options` + `reglages` + `bonus` en 3 objets), héritage entre niveaux, validation à l'import ; compétences **par niveau dérivées** de `programme.js` (identiques à la liste déclarée dans 67 niveaux sur 71 ; les 4 écarts sont de vrais manques de couverture) ; constantes `K` (compétences) et `D` (domaines), pas d'`enum` TypeScript ; **TypeScript : décidé** (exemples et nouveau socle en TS, `erasableSyntaxOnly`). À faire d'abord dans les exemples, puis sur les 22 exercices avec un test d'équivalence des définitions normalisées avant/après
- [ ] **5 passes de lisibilité sur les exercices** (plan 10, section « Passes de lisibilité », mesure du 2026-10-05) : contrats et noms homogènes → doublons vers le socle → code mort → les 6 fonctions monstres (`grammaire construireQuestion` 171 lignes, `problemes creer` 260…) → lisibilité fine ; avec des compteurs à cliquet dans `npm run qualite` (jscpd, sonarjs, knip, tsc). ⏸️ gelé jusqu'à la validation des exemples de départ (qui servent de modèle)
- [ ] **Un « exemple d'exercice » et un « exemple d'affiche » comme boilerplate** (après les lots 2d) : complets, minimaux et commentés (définition, générateur pur, fiche, vue mince, instantanés, tests, i18n fr/br ; pour l'affiche : définition, dessin, cadre, niveaux, catalogue), **visibles seulement en mode dev** (cartes et pastille « exemple », absents du build et du sitemap) ; à copier pour créer un nouvel exercice ou une nouvelle affiche ; idéalement un script `npm run nouveau -- exercice <id>` qui copie le modèle et l'inscrit au registre
- [ ] **`scripts/telechargements.mjs` (≈ 900 lignes) est trop gros** : la page `/telechargements/` devrait être une **page normale de l'app** (composant Vue, même en-tête, même i18n, mêmes styles) qui charge un **JSON généré** (`fiches.json`) ; le script ne garde que ce qui demande vraiment Chrome : PDF, vignettes, aperçus, image de partage, et écrit le JSON + le sitemap. À régler en même temps : les pages par fiche (`/telechargements/<slug>/`, utiles au référencement) — soit générées par un petit gabarit à partir du JSON, soit rendues avec les composants Vue en SSR ; garder les URL et les slugs. Voir la phase 4 du plan 10
- [ ] **Durée de `npm test`** : plus de 20 minutes depuis la migration des 22 exercices (3 min avant) → à ramener sous quelques minutes : tests de programme en node (déjà fait pour les exercices), Chrome en parallèle (`@playwright/test`, phase 5 du plan 10), `memorises` limité à un échantillon de pages en CI
- [ ] **Calcul mental** : encore dupliqué entre l'exercice (`src/exercices/calcul-mental/`) et `src/impression/calcul.js` (presets à graine) — à unifier sans changer les fiches publiées de calcul (phase 2e)
- [ ] **Après le lot C** : Tables CE1 démarre maintenant avec les tables 2, 3, 4, 5 et 10 (avant : 2 à 9 pour tous) ; en PS, `nbQ` est gardé au changement de niveau ; Longueurs n'utilise pas `OrdonnerClics` (on touche les crayons) — à revoir à l'usage
- [ ] **Division posée** non proposée au CM1 (calcul posé : addition, soustraction, multiplication seulement)
- [ ] **Lettres** : ajouter la cursive, le son des lettres et les confusions b/d, p/q (manques relevés par l'audit ; l'exercice ne couvre aujourd'hui que le nom des lettres, GS-CP)
- [ ] **Dictée** : CM1 et CM2 ont maintenant deux boutons (avant : un seul « CM ») ; la fiche publiée `exercices-dictee-cm1-cm2` vient du bouton CM1 — vérifier qu'elle reste pertinente pour le CM2
- [ ] **Écarts de programme laissés par la migration du lot B** (changeraient les tirages, donc les fiches publiées → un lot à part avec `--maj`) : Fractions CE2, dénominateurs 7, 9, 11 et 12 jamais tirés ; Mesures CE2, dm, tonne et périmètre absents ; Géométrie, l'angle droit est au programme dès le CE1 mais n'est proposé qu'au CE2
- [ ] (plan 10, phase 2d en cours : 3 agents) **Migrer les 19 exercices restants** vers `src/exercices/` — lot A français, lot B maths avec dessins, lot C calcul et maternelle ; ensuite regarder **Lecture et Quiz** (hors compteur)
- [ ] **Réorganiser la navigation** : ce n'est pas clair aujourd'hui (ex. « Français » n'affiche que des exercices, les affiches et fiches sont ailleurs dans « À imprimer »). Piste : une page par matière/domaine qui regroupe exercices, affiches et fiches (cf. plan 09 : sections par domaine), et repenser la place de « À imprimer » ; à proposer avant de coder
- [ ] **Migrer aussi les affiches vers le même modèle** que les exercices (plan 10) : une définition par affiche (niveaux, compétences de `programme.js`, variantes), un générateur pur, des instantanés en node, et le catalogue dérivé de ces définitions (`src/impression/affiches/`, `alphabet.js`, `nombres.js`, tables de `calcul.js`) ; idem pour les générateurs de « À imprimer » (écriture, calcul, nombres)
- [ ] **Page programme** : utiliser les mêmes icônes que la page `/imprimer` pour « 📘 Pour apprendre » et « ✏️ Pour s'entraîner »
- [ ] **Planche de billets et pièces à découper** (à partir de l'affiche « Pièces et billets », `?affiche=monnaie`) : tailles réelles, traits de coupe, plusieurs exemplaires par valeur, pour jouer à la marchande ; réutiliser `piece`/`billet` de `src/exercices/monnaie/argent.js`
- [x] **Un seul dessin des pièces et des billets** pour l'exercice Monnaie (jeu et fiche) et l'affiche « Pièces et
      billets » : `src/exercices/monnaie/argent.js` (`piece`, `billet`, `svgArgent`), tailles réelles, couleurs des
      vrais billets, 1 € et 2 € bimétal dans le bon sens (l'affiche les avait inversés)

## Affiches et fiches

- [ ] **« Ce que je sais faire » caché** (`RESUMES_VISIBLES = false` dans `affiches/catalogue.js`) en attendant l'avis d'enseignants ; à remettre après relecture
- [ ] **Relire les phrases « Ce que je sais faire »** (`src/data/savoirs.js`, ≈ 300 phrases, une par compétence et
      par niveau) avec un·e enseignant·e ; les compétences qui n'ont qu'une phrase à un niveau n'ont pas d'affiche
      (seuil : 2 phrases, `RESUMES` dans `affiches/catalogue.js`)
- [ ] **Affiches en police attachée** : adapter l'horloge (textes qui se chevauchent), pièces et billets (montants qui
      débordent, équivalences coupées) et figures (textes superposés) en mesurant les textes (`largeurTexte`,
      `metriquesPolice`, `hauteurRendue` dans `affiches/cadre.js`, comme la droite, la numération et la
      conjugaison), puis les ajouter à `attacheePermise` (`AffichesView.vue`)
- [ ] **Test « rien ne se chevauche »** : `tests/affiches.test.mjs` voit ce qui sort de la feuille ou est coupé, pas
      deux blocs l'un sur l'autre ; tester aussi en police attachée et les fiches d'exercices de l'app (A4/A3,
      portrait/paysage)
- [ ] **Nouvelles affiches à proposer** (à valider avec l'utilisateur) :
  - cycle 1 : bande numérique 0–10 (GS), nombres de 1 à 10 (constellations, doigts), solides
  - CP–CE2 : nombres en lettres jusqu'à 50 (CP), doubles et moitiés, compléments à 10 / à la dizaine, figures du
    CE1 et du CE2, diagramme en barres / tableau à double entrée, classes de mots
  - CM1–CM2 : fractions et décimaux, unités de mesure avec leurs relations (sans tableau de conversion), fonctions
    (sujet, COD, COI, attribut, compléments), préfixes, suffixes et familles de mots
- [ ] **Affiche de l'alphabet** : il manque de quoi faire une affiche des lettres spéciales (é è ê ë à â î ï ô ù û ü ÿ ç, œ, æ…), en script et en attaché, majuscules et minuscules
- [ ] **Liens vers le programme officiel** aussi sur les pages matières et les cartes d'activités (déjà sur
      `/imprimer`, `/telechargements/` et les pages de fiches, via `lienProgramme()`)

## Manques au programme

- [x] **Design de l'accueil à retravailler** : l'en-tête empile « Bienvenue », la phrase d'intro, « 🆕 Nouveau… », « 📚 Le programme de la classe… » et « Activités pour le CP — voir toutes les classes » sans hiérarchie claire ; repenser la mise en page (titre, accès au programme, nouveautés, filtre de classe) — fait : « Ma classe » en puces, deux tuiles Programme / Nouveautés

- [x] **Barre de navigation** : Maths / Français / <langue régionale> (Brezhoneg, seulement si une langue régionale est active) / Le Monde — la Lecture passe dans Français, « Autres » (quiz) devient « Le Monde » ; garder « À imprimer » et le choix de classe — fait : page `/langue-regionale` (affiches et fiches du catalogue dans la langue), « Le monde » = `/autres`
- [ ] **Le reste du programme dans `programme.js` et la page `/programme`** : ce qui a du sens ici (exercices, fiches, affiches) — cycle 1 « Explorer le monde » (BO n° 19), cycle 2 « Questionner le monde » (vivant, matière, objets ; espace et temps), cycle 3 histoire, géographie, sciences et technologie. Pas l'EPS, ni les arts, ni l'EMC, ni la pédagogie ; pas de langue étrangère pour l'instant (anglais…). Ajouter les textes officiels correspondants dans `docs/programmes/`, puis les domaines et compétences avec leurs sources ; le quiz de culture générale s'y rattachera (aujourd'hui « hors programme »)
- [x] Page `/programme` : lien direct vers un mode et une classe (`?affichage=tableau`, `?classe=ce1`), l'adresse suit les choix
- [x] Page `/programme` : une section « pas sur ce site pour l'instant » qui liste explicitement ce qui est hors du champ (EPS, arts, EMC, langues vivantes…) et ce qui viendra (le monde, histoire, géographie, sciences)
- [ ] Langue régionale (breton) : son propre programme (langues vivantes régionales) pour plus tard, quand la rubrique <langue régionale> existera

- [ ] **Couverture complète PS, MS, GS, CP, CE1** : plans écrits (`plans/10-couverture-ps.md` … `-ce1.md`, chacun avec ses décisions à prendre) ; à exécuter niveau par niveau
  - [ ] Ordre : presets → textes des BO → implémenter les plans **classe par classe** (recommandations des plans retenues par défaut, à noter dans chaque plan)
    - PS : niveau PS (Compter, Comparer, consignes lues) ✓, Formes PS/MS/GS ✓, Motifs ✓, Longueurs ✓ ; reste Graphisme, Catégories, Journée, La valise, Mon prénom, Espace, Syllabes
  - [x] Rapport de couverture trop optimiste : les compétences sont déclarées par exercice (`COMPETENCES_ROUTES`), pas par classe → déclarer par classe (ou dériver des options) ; compter aussi les fiches bilan des exercices
  - [ ] Défauts trouvés par les plans : `<` et `>` dans les fiches Ordonner (CP) — ~~correction de Comparer~~ ✓ ; ~~Formes sans niveau (rectangle en MS, formes toujours dans la même position)~~ ✓ (PS/MS/GS, mode « même forme ») ; Lettres « Reconnaître » compare deux lettres identiques ; fiches d'écriture « GS » avec l'attaché majuscule ; ~~Compter boucle sans fin si le maximum est 3~~ ✓ ; consigne lue à voix haute : Compter, Comparer, Formes ✓ (`ConsigneParlee`), reste Ordonner et Lettres
  - [ ] Données à corriger (plan CP) : ~~`fiche-ajouter-retirer-10` rangée en « multiplier par 10 »~~ ✓ ; ~~`fiche-suites-de-nombres` « CP · CE1 » monte à 190~~ ✓ (CE1) ; ~~Orthographe « Le soli___ brille »~~ ✓ ; doubles et moitiés du CP hors des valeurs du programme
  - [ ] Lecture : le mode « Lecture de textes » n'a aucune question (compréhension non couverte, CP et CE1)

- [x] Textes des programmes officiels (BO cycle 1, 2, 3) dans le dépôt, en texte / Markdown (`docs/programmes/`), pour coder et vérifier `programme.js`
- [x] Liens vers les générateurs réglés sur la fiche exacte (`?preset=<slug>` pour nombres, alphabet, écriture, calcul) : page `/programme` et bouton « Personnaliser » des pages de téléchargement
- [x] Lien plus visible *vers* la page `/programme` : accueil (sous le titre) et haut des pages Maths et Français (en plus du pied de page, des domaines de « À imprimer » et de « À propos »)
- [x] Page `/programme` : les fiches qui ne diffèrent que par la présentation (format, orientation, disposition) se fondent dans leur générateur (« Affiche de l'alphabet » au lieu de A4 / A3)
- [x] Page `/programme` : les liens mènent aux générateurs (affiches, fiches), pas aux pages de téléchargement
- [x] Page `/programme` : deux sortes seulement — 🎯 exercice (s'imprime aussi ; avec les générateurs de fiches) et 📄 affiche ; pas les fiches toutes prêtes (elles restent dans `npm run couverture`)
- [x] Page `/programme`, tableau : au clic sur une case, montrer clairement où on arrive (mise en évidence de la compétence)
- [x] Page `/programme` : mode d'affichage « tableau » (comme `couverture.html`), en plus de la liste ; page en français seulement pour l'instant (pas de traduction bretonne)
- [x] **Intégrer la couverture au site** : page `/programme` « Le programme, classe par classe » (classe de la barre du haut, compétences sans ressource en grisé), liens depuis « À imprimer », le pied de page et « À propos »

- [x] **Couverture du programme** : `npm run couverture` → `couverture.html` (par domaine : compétence × classe, 🎯 exercice / 📄 fiche / 📘 affiche ; par exercice : options ✓/⚠ et compétences sans option) ; test : chaque option d'exercice correspond à une compétence au programme de sa classe. Les cases rouges du rapport alimentent les « Manques » ci-dessous

- [ ] **Maths** : rien au CP pour la numération ≤ 100, l'heure entière, les euros, les problèmes ≤ 30 ; calcul mental
      CP (stratégies) ; calcul posé sans niveau (soustraction CP seulement signalée), multiplication posée CE2,
      division CM1, décimaux ; fractions CE2 (7, 9, 12, comparer, additionner) et CM ; problèmes CE2 ≤ 10 000 ;
      mesures CE2 (dm, tonne, périmètre) ; formes : bouton MS/GS, solides du cycle 1 ; maternelle :
      composer/décomposer ; CM1-CM2 : décimaux, grands nombres
- [ ] **Français** : conjugaison -cer/-ger/-eler/-eter/-yer (CM1), accord du participe avec le COD (CM2) ;
      grammaire : adverbe (CE2), radical/terminaison/infinitif (CE1), COD/COI, conjonctions, pronoms compléments
      (CM1), attribut, prépositions, subordination, complément du nom (CM2) ; vocabulaire CP et CM ; lecture :
      fluence, compréhension, fiches prégénérées ; lettres : cursive, sons, b/d p/q

## Bugs et dette

- [x] Listes de classes partagées : `src/data/classes.ts` (NIVEAUX, CLASSES, CYCLE_DE, MATERNELLE, CYCLE_2, CYCLE_3, CE, CM, classesEntre, classesDepuis, enClasse) ; programme.js, activites.js, exercices.js, pages de téléchargement et vues s'en servent (les classes propres à une compétence ou à une option restent des données)
- [ ] **Analyse du code et plan d'amélioration** : relire l'ensemble du code actuel (vues, générateurs, catalogues, build, tests) et écrire un plan (`plans/11-qualite-code.md`) : duplications (vues d'exercices, listes de classes, cadres de fiches), composants communs à extraire, données à sortir des vues, cohérence des catalogues et des compétences, performances du build, couverture des tests, dette i18n ; avec l'ordre, l'effort et le risque de chaque étape

- [ ] Géométrie : l'avertissement rouge « Imprimer à 100 %… » est aussi sur la fiche imprimée — le passer en orange dans le formulaire et le retirer de la fiche, comme pour Mesures ?

- [ ] **Build des PDF** : parallélisé (≈ 2 min par site au lieu de ≈ 20) ; reste à ne pas générer deux fois les mêmes PDF pour les deux sites (`build:vps`)

- [ ] Lecture : découpages syllabiques discutables dans les données (« rou-ge », « feuil-le », « é-cole »,
      « nu-age »)
- [ ] Mesures : la question « verres » ne sort qu'une fois par taille de verre, quelle que soit la bouteille (clé de
      dédoublonnage `cont-verres-${c}`) ; la corriger change certaines séries
- [ ] Interface : il reste des tests `langue === 'br'` hors générateurs (GrilleActivites, RechercheGlobale,
      Maths/FrancaisView, EcritureView, AlphabetView, ImprimerView, activites.js `a.br`…) → catalogues
- [ ] Réglages mémorisés : les vues `imprimer/*` et `useOptionsFiche` lisent encore `charger` brut au lieu de
      `chargerReglages`

## Breton et langues régionales

- [ ] Relecture par un brittophone (et un·e enseignant·e) de tout ce qui est marqué `// br: à relire`
      (`npm run i18n:relecture`), en priorité : « pladenn » (disque), noms des domaines (`src/i18n/br/domaines.js`),
      cartes des familles d'affiches, mentions légales et « À propos » — organisée plus tard par l'utilisateur
- [ ] `src/impression/catalogue.js` : les affiches des nombres bilingues sont écrites pour le breton
      (`nombres-francais-breton-…`) ; les générer à partir de la langue régionale, comme `fichesRegionales`
- [ ] Synthèse vocale : pas de voix bretonne dans les navigateurs ; prévoir des enregistrements audio ou une voix
      serveur pour les langues sans TTS

## Site public

- [ ] Google Search Console et Bing Webmaster : **codes TXT à fournir par l'utilisateur**
      (`scripts/dns-verification.mjs` est prêt), puis soumettre les sitemaps des deux domaines
- [ ] Déploiement automatique sur le VPS depuis GitHub Actions (clé SSH dédiée, rsync) au lieu du script local
- [ ] Accessibilité : passe clavier et lecteur d'écran (boutons-icônes, contrastes, focus), `lang` des contenus
      français dans l'interface bretonne
- [ ] Relecture pédagogique par un·e enseignant·e — points ouverts : « fois plus » et fractions > 1 au CE2,
      formulation des divisions au CE2
- Surveillance (disponibilité, expiration des domaines et des certificats) : Datadog, configuré par l'utilisateur
  dans un autre agent — ne pas y toucher ici
