# TODO

> Liste de travail interne : idées, bugs, décisions en attente. Rien ici n'est une promesse.

## ⭐ À FAIRE EN PREMIER — Demande du 2026-10-04 (affiches)

- [ ] **Idées d'affiches en lien avec le programme** (cycles 1 à 3) : inventaire des affiches existantes, puis propositions à valider
  - [x] textes officiels relus (2026-10-04) : BO n°41 du 31/10/2024 (cycle 1 langage + maths, cycle 2 français + maths), BO n°16 du 17/04/2025 (cycle 3 français + maths). **Non relu** : programme complet du cycle 1 (BO n°19 du 07/05/2026) et repères annuels Éduscol
  - ⚠️ **Contraintes corrigées par le référentiel `src/data/programme.js` (2026-10-04)** — la liste ci-dessous contient des erreurs, c'est `programme.js` qui fait foi : heure CE1 = demi-heures et quarts seulement (minutes au CE2) ; fractions CE1 = 2, 3, 4, 5, 6, 8, 10 (≤ 1) ; solides : pyramide dès le CE1, patron du cube au CE2 ; figures : trapèze, pentagone, hexagone au CM2 seulement, losange et symétrie au CE2 ; conjugaison : CP être/avoir au présent, 8 irréguliers dès le CE2. Écarts des activités : voir `plans/09-domaines-programme.md`, « Étape 1 — résultat » (→ étape 2)
  - **Contraintes du programme à respecter** (à ne pas contredire dans les affiches) :
    - pas de tableau de conversion aux cycles 2 et 3 → afficher les relations entre unités (1 m = 100 cm), pas un tableau à colonnes
    - critères de divisibilité : seulement 2, 5 et 10
    - champ numérique : CP ≤ 100, CE1 ≤ 1 000, CM1 ≤ 999 999 (6 chiffres), CM2 ≤ 9 chiffres (millions)
    - fractions : CE1 moitié/demi/quart ; CE2 dénominateur ≤ 12 et ≤ 1 ; CM1 ≤ 20 ; CM2 ≤ 60
    - heure : CP heures entières ; dès le CE1 heures + minutes (« et demie », « moins le quart », durées)
    - solides : CE2 cube, boule, pavé, cône, pyramide, cylindre (faces, sommets, arêtes) ; CM1 + prisme droit, patron du cube
    - figures : CP disque, carré, rectangle, triangle ; cycle 3 + triangle rectangle/isocèle/équilatéral, losange, trapèze, (CM2) pentagone, hexagone
    - conjugaison : cycle 2 être/avoir + 1er groupe (présent, imparfait, futur, passé composé) ; CM1 + 2e groupe et faire, aller, dire, venir, pouvoir, voir, vouloir, prendre ; CM2 + passé simple, plus-que-parfait ; 6e impératif, conditionnel
  - Affiches candidates (à valider avec l'utilisateur), classées par niveau visé :
    - cycle 1 : lettres de l'alphabet (noms, capitales, cursive dès la MS), nombres de 1 à 10 en chiffres (constellations, doigts), formes planes et solides
    - CP–CE2 : droite numérique (0–100, 0–1 000), tables d'addition (CP) et de multiplication (CE1–CE2) [existe], doubles et moitiés (valeurs du programme), compléments à 10 / à la dizaine, horloge (heures entières puis minutes), pièces et billets en euros + centimes, formes planes et solides, diagramme en barres / tableau à double entrée, conjugaison être/avoir/1er groupe, classes de mots (déterminant, nom, adjectif, verbe, pronom)
    - CM1–CM2 : tableau de numération (jusqu'aux centaines de milliers, puis millions), fractions et décimaux (dixièmes, centièmes), unités de longueur/masse/contenance/aire avec relations (sans tableau de conversion), figures et solides (prisme, patron du cube), conjugaison (verbes irréguliers listés), fonctions (sujet, COD, COI, attribut, compléments), préfixes/suffixes/familles de mots
    - à confirmer avant de faire : homophones grammaticaux (a/à, et/est, on/ont, son/sont) — pas de liste explicite trouvée dans le programme du cycle 3 relu ; vérifier les repères annuels
- [ ] **Réorganiser le code qui génère les affiches** (à voir) : inventorier où elles sont aujourd'hui (`alphabet.js`, `nombres.js`, `calcul.js` mode affiche, nouveau `affichesProgramme.js`), voir ce qui est commun (cadre, titre, mise en page, catalogue) et proposer un regroupement
- [ ] **Refonte « affiches » / « maths » / « programme »** — étapes 2 ✓, 3 ✓, 4 ✓ (domaine + genre partout) et 6 ✓ (`/imprimer` et `/telechargements/` par domaine) ; **reste l'étape 5** (fiches par compétence, bilans, affiches résumé) **et l'étape 7** (retirer la carte « Affiches du programme » de l'accueil, fondre `TELECHARGEMENTS_PROGRAMME` dans le catalogue, README/CHANGELOG) ; étape 1 ✓ (`src/data/programme.js` : 14 domaines, 102 compétences, contraintes MS→CM2, sources) — **plan écrit : `plans/09-domaines-programme.md`** (3 décisions à prendre par l'utilisateur en fin de plan) : la distinction « Affiches du programme » vs reste n'a pas de sens, presque tout suit le programme → ne plus avoir de catégorie « programme » à part ; organiser **par domaine du programme** (nombres et calcul, grandeurs et mesures, espace et géométrie, français…) et, dans chaque domaine, affiche + fiches + exercices liés. À faire en code (un seul générateur d'affiches, catalogue par domaine) **et** dans l'affichage (`/imprimer`, pages `/telechargements/`). Le titre « 🖼️ Affiches à accrocher » est à revoir avec ça
  - **commité (95f05eb), `npm test` ✓, textes bretons ajoutés (à relire)** — état au moment de la pause : `src/impression/affichesProgramme.js` (6 affiches : droite numérique, numération, horloge, euros, conjugaison ×24, figures et solides ; rendu vérifié en PNG), `src/data/conjugaison.js` (+ tests dans `tests/logique.test.mjs`), vue `AffichesView.vue` + route, `genre` ('affiche'/'fiche') sur les activités et rubriques dans `ImprimerView`, liens `?mode=` (calcul) / `?mise=` (nombres) / `?affiche=…` ; le bloc de tests de liens pour `tests/statiques.test.mjs` n'a **pas** été écrit ; `npm test` lancé mais résultat non lu
  - textes bretons à fournir (relecteur) : `g_programme`, `AffichesView` (intro, version, verbe, temps…), `ImprimerView` (affichesIntro, fichesIntroGenerale) — `npm run i18n` les signale
  - **DUMP du travail en cours (2026-10-04) — pour une session multi-agents**
    - **Fichiers créés** (non commités) : `src/impression/affichesProgramme.js` (générateur), `src/data/conjugaison.js` (données pures, testables avec node), `src/views/imprimer/AffichesView.vue`, `src/i18n/fr/views/imprimer/AffichesView.js`, `src/i18n/br/views/imprimer/AffichesView.js` (seulement les mots déjà attestés dans `AlphabetView` : furmad, tuadur, gweledva, poltred, nodrezhoù)
    - **Fichiers modifiés par moi** (à distinguer des modifications de l'autre session) : `src/impression/api-build.js` (générateur `programme`, liste `PROGRAMME` fr seul), `src/impression/catalogue.js` (catégorie `programme`, `lien` des nombres = `/imprimer/nombres?mise=<miseEnPage>`), `src/impression/calcul.js` (`lien` = `/imprimer/calcul?mode=<mode>`), `scripts/telechargements.mjs` (`classer()` : `programme` → apprendre/programme ; `GROUPES.apprendre` + `programme` ; lien « Personnaliser » : `&` au lieu de `?` si le lien a déjà une requête), `src/i18n/fr/pages-statiques.js` (`g_programme`), `src/data/activites.js` (champ `genre`, carte « Affiches des tables » → `/imprimer/calcul?mode=affiche`, carte « Fiches de calcul » → `?mode=fiche`, carte « Affiches du programme », traductions BR indexées par chemin sans requête, pas de BR pour la carte « Affiches des tables »), `src/components/GrilleActivites.vue` (prop `genre`), `src/views/imprimer/ImprimerView.vue` (+ `fr/br ImprimerView.js` : rubriques affiches / fiches), `src/views/imprimer/CalculView.vue` (`?mode=affiche|fiche` via `watch(route.query.mode, …, { immediate })`), `src/views/imprimer/NombresView.vue` (`?mise=affiches|fiche`), `src/router/index.js` (`/imprimer/affiches`), `tests/outils.mjs` (`ROUTES`), `tests/logique.test.mjs` (27 vérifications de conjugaison + lien des nombres)
    - **Contenu du générateur** : `AFFICHES_PROGRAMME` (liste + variantes pour la vue), `genererAffichesProgramme(config, { script })`, `normaliserConfig`, `DEFAUTS`, `TELECHARGEMENTS_PROGRAMME` (38 affiches : droite 0-20/0-100/0-1 000 ; numération ce1/cm1/cm2 ; horloge heures/minutes ; euros / euros et centimes ; conjugaison ×12 verbes × 2 (4 temps du cycle, puis passé simple + plus-que-parfait CM2) ; formes planes cycle 2, figures planes cycle 3, solides CE2, solides CM1). Chaque entrée a un `lien` du type `/imprimer/affiches?affiche=conjugaison&verbe=aller&temps=cm2`. Tout est en français seulement (`langues: ['fr']`)
    - **Comment rendre les affiches en PNG pour les vérifier** : script jetable (supprimé) = `createServer` de vite en mode middleware + `ssrLoadModule('/src/impression/affichesProgramme.js')`, `globalThis.window = { location: { href: 'http://localhost/', origin: 'http://localhost' } }`, `genererAffichesProgramme(t.config, { script: 'Arial' })`, `page.setContent(html)` avec `playwright-core` + Chrome (`/Applications/Google Chrome.app/...`), capture de `.page`. Sortie dans `/tmp/aff/*.png` (peut avoir disparu). Node seul ne suffit pas : les imports sans extension (`../utils/impression`) ne se résolvent pas, d'où `src/data/conjugaison.js`
    - **Défauts connus à corriger dans les affiches** : le prisme droit et le cube ont des arêtes cachées en pointillés un peu approximatives ; ~~l'horloge « minutes » superpose les nombres verts et les aiguilles~~ (✓ nombres au-dessus, liseré blanc) ; le prisme a un trait gris clair en trop ; le trapèze n'a pas de marque de parallélisme ; la droite numérique 0-1 000 n'a pas été regardée après le dernier réglage d'échelle ; pas de rendu A3 vérifié ; `droite` utilise `enLettresFr` qui s'arrête à 999 999 (OK jusqu'à 1 000) ; pièces : « c » pour centime
    - **Contraintes du programme à respecter** : voir la liste plus haut (pas de tableau de conversion, divisibilité par 2/5/10 seulement, champ numérique par niveau, fractions, heure, solides, figures, conjugaison)
    - **À faire pour finir la tâche en cours** : (1) lire le résultat de `npm test` (relancer : l'ancien run a été interrompu) ; (2) écrire dans `tests/statiques.test.mjs`, avant la section « Vie privée », un bloc « Liens : une affiche ne mène jamais à un exercice » : sur `/imprimer`, 1re grille `.container > .card-grid` = affiches (aucun lien `mode=fiche` ni `/ecriture`), 2e grille = fiches ; `?mode=fiche` puis `?mode=affiche` sur `/imprimer/calcul` (le bouton actif change, même composant, navigation seulement) ; `?mise=` sur nombres ; `/imprimer/affiches?affiche=conjugaison&verbe=aller` ; sur les pages `/telechargements/affiche-tables-de-multiplication-a4/` (→ `mode=affiche`), `fiche-table-de-multiplication-7` (→ `mode=fiche`), `affiche-conjugaison-aller` (→ `affiche=conjugaison&verbe=aller`) vérifier le `href` de `.btn-perso` ; (3) vérifier visuellement `/imprimer` (localhost:5173/ecole-primaire/#/imprimer) en fr et en br, aucune erreur JS ; (4) vérifier que la recherche (`RechercheGlobale`, clé = `a.to`) trouve bien les deux cartes de calcul ; (5) `npm run i18n` : doit ne signaler que les textes bretons attendus ; (6) tester l'impression réelle (PDF) d'une affiche de chaque type avec `node scripts/telechargements.mjs --mode ecoleprimaire --outDir dist-test --sans-exercices`
    - **Décisions / pièges** : ne jamais inventer de breton (réutiliser les formes attestées, sinon retomber sur le français, ce que `traduire` fait déjà) ; ne pas casser `HomeView` (utilise `GrilleActivites` sans `genre`) ; les liens contenant déjà `?` ne doivent pas recevoir un second `?` ; le test « pas de mot français en breton » (`routes.test.mjs`, `MOTS_FR`) tourne sur toutes les `ROUTES`, dont la nouvelle ; la vue des affiches mémorise ses réglages sous `affiches_programme_config` (localStorage) mais le lien `?affiche=` l'emporte
    - **Pour la refonte demandée** (par domaine du programme, plus de catégorie « programme » séparée) : regrouper `alphabet.js`, `nombres.js`, le mode affiche de `calcul.js` et `affichesProgramme.js` derrière un cadre commun (titre, marges, échelle A3, `documentImpression`, catalogue), une entrée de catalogue = `{ domaine, niveau, genre: 'affiche'|'fiche'|'exercice', lien }`, et un seul sélecteur d'affiches dans l'app ; supprimer la rubrique `programme` de `CATEGORIES`/`classer()`/`GROUPES` une fois les entrées redistribuées par domaine
- [x] **Page `/imprimer` : bien séparer « affiches » et « exercices »** (commit 95f05eb, test des liens ✓) + vérifier que chaque lien arrive au bon endroit (un lien « affiche » ne doit jamais ouvrir un exercice/une fiche) : cartes de la grille, fiches à imprimer, pages statiques `/telechargements/` ; ajouter un test des liens
- [ ] **Liens vers le programme officiel dans le site** (Éduscol / education.gouv.fr) : par cycle/niveau, par exemple sur les cartes d'activités, les fiches et la page « À propos »

## Demandes du 2026-10-04 (fiches)

- [x] Sélecteur de police : cacher « ➕ Utiliser Belle Allure, Écolier ou une autre police… » quand Belle Allure est déjà là (installée ou ajoutée)
- [x] Mentions légales, section « Contenus » : ajouter des liens (GitHub, licences, polices) — et texte aligné sur les licences (CC BY-SA 4.0 / AGPL 3.0) au lieu de « usage personnel et en classe »
- [x] README et page « À propos » : liens vers Belle Allure (conseillée, mais à installer soi-même : licence non redistribuable)
- [ ] Une fois tout ça fini (et testé) : redéployer les deux sites sur le VPS, avec toutes les fiches (build complet, PDF régénérés)
- [x] Page `/imprimer` : en arrivant on croit qu'il n'y a que « Nombres et calcul » → donner accès à toutes les catégories de haut niveau dès l'arrivée, puis naviguer vers ce qu'on veut, sans se perdre ; ajouter les filtres comme sur `/telechargements/` (choix : sommaire + tout sur la page, barre collée en haut)
- [x] Alphabet breton (`/imprimer/alphabet`) : pas de mot illustré pour le Z — « zebr » 🦓 (zèbre, m., pl. zebred) : Wiktionnaire breton, Favereau (geriafurch.bzh), traductions de « zèbre » du Wiktionnaire ; l'ancien refus venait de l'homographe « zebr » (forme mutée de debr)
- [x] Page `/telechargements/affiche-conjugaison-pouvoir-passe-simple/` : du texte n'est pas affiché (sans doute pareil sur les autres affiches de conjugaison au passé simple / plus-que-parfait) — la 6e ligne était coupée sur toutes les affiches à 2 temps (interligne naturel d'Andika ≈ 1,7) ; interligne explicite, taille selon la police (hauteur et largeur mesurées) ; vérifié : 12 verbes × 3 jeux de temps × 5 polices × A4/A3 × portrait/paysage
- [x] Affiche « Tableau de numération » (`/imprimer/affiches?affiche=numeration`) : pouvoir choisir Belle Allure et les autres polices attachées (en option) — libellés et interlignes mesurés, hauteur réelle mesurée hors écran (`hauteurRendue`, `affiches/cadre.js`) ; vérifié en Andika, Playwrite, Belle Allure, OpenDyslexic × 3 variantes × A4/A3 × portrait/paysage — voir l'item « Affiches en police attachée »
- [x] Sélecteur de police des affiches et fiches : un seul choix (« Police ») quand le document n'utilise qu'un type, script + attaché seulement quand il utilise les deux (affiches du programme : script seul ; alphabet et écriture : selon les écritures choisies) ; avec un seul choix, on peut aussi prendre une police attachée, mais la meilleure police « normale » (script) reste celle par défaut — fait : choix `unique` dans `usePolices` ; l'attachée n'est proposée que pour la conjugaison et la droite numérique (la droite mesure maintenant ses nombres et ses noms : plus de chevauchement, aussi en Andika portrait)
- [ ] Affiches en police attachée : adapter (numération ✓) horloge (textes qui se chevauchent), pièces et billets (montants qui débordent, équivalences coupées), figures (textes superposés) — mesurer les textes avec `largeurTexte` / `metriquesPolice` comme `affiches/droite.js`, puis les ajouter à `attacheePermise` (`AffichesView.vue`) ; ajouter un test « rien ne se chevauche » en attaché
- [x] Affiche « Pièces et billets » : la pièce de 2 € est tronquée ; quand on affiche pièces et billets ensemble, des tailles relatives qui ont à peu près du sens (pièces plus petites que les billets, 2 € plus grande que 1 €…) — vraies dimensions (diamètres, formats des billets), pièces agrandies ×2 par rapport aux billets, billets sur 2 rangées, montants et équivalences mesurés ; vérifié en Andika, Luciole, OpenDyslexic, A4/A3, portrait/paysage
- [x] Mesures : l'avertissement « Imprimer à 100 % (taille réelle)… » en orange (pas en rouge) dans le formulaire, et plus sur la fiche imprimée elle-même
- [x] **Options communes à toutes les fiches d'exercice**, dans le formulaire de chaque exercice (mode impression), dernier choix mémorisé : « Prénom et date » oui/non, corrigé « sans / sur une autre page / en bas à l'envers » — cadre `useOptionsFiche` + `ConfigExercice` ✓, 22 vues migrées ✓, corrigés ajoutés (Mesures, Monnaie, Géométrie, Conjugaison, Lecture, Lettres) ✓ (commit fb2eddf). Seulement le générateur, pas les fiches prégénérées. 
- [x] Générateurs `/imprimer/*` : aligner sur les options communes ✓ (composant `OptionsFiche.vue` ; Calcul : score en option, corrigé « en bas à l'envers » compact ; Écriture : Prénom/date ; fiches prégénérées identiques) + trapèze (marques de parallélisme) et prisme (arêtes cachées) ✓ — non commité
- [ ] **Vérifier compétences et étapes du programme pour chaque activité** (programmes officiels, cycles 1 à 3) ; vérifier que les options des formulaires et les fiches prégénérées y correspondent. Les fiches prégénérées devraient probablement être organisées **par compétence, puis un bilan**, avec une **affiche / un résumé de ce qu'il faut savoir**
- [x] Réglages mémorisés fragiles → `chargerReglages` / `chargerValeur` + `tests/memorises.test.mjs` ✓ (reste : vues `imprimer/*` et `useOptionsFiche` encore sur `charger`) : plusieurs vues lisent `charger(cle, defaut)` sans fusionner avec les valeurs par défaut → une config incomplète ou ancienne dans localStorage peut bloquer la page (vu sur Autres). Fusionner `{ ...DEFAUT, ...charger(...) }` partout (+ test)
- [x] Affiche (droite graduée, `src/impression/affichesProgramme.js`) : légende en paragraphe sous le dessin ✓ — le texte « Chaque dizaine est un trait long. Entre deux dizaines, je compte de 1 en 1. Le trait moyen est le milieu (5). » dépasse de l'affiche ; idem sur la droite 0–1 000 : « Chaque centaine est un trait long, chaque dizaine un petit trait. Entre 0 et 1 000, il y a 10 centaines. » → vérifier toutes les légendes des droites (retour à la ligne / taille)
- [x] Affiche « La droite numérique de 0 à 20 » (taille des nombres selon l'écart ✓) (`src/impression/affichesProgramme.js`) : les nombres à partir de 10 sont illisibles
- [x] **Passe « rien ne dépasse » sur toutes les affiches** — test `tests/affiches.test.mjs` (dans `npm test`) : les 188 fiches et affiches toutes prêtes + affiches du programme dans l'autre orientation et en A3 (264 documents) ; a trouvé et corrigé le tableau de numération CE1 en paysage. Reste : les chevauchements entre éléments (le test voit ce qui sort de la feuille ou est coupé, pas deux blocs l'un sur l'autre), et les fiches d'exercices de l'app (A4 et A3, portrait et paysage) : alphabet, nombres, tables, affiches du programme. Idéalement un test automatique (comparer la boîte de chaque élément à celle de `.page`)
  - aussi les éléments **cachés ou superposés à l'intérieur** de la feuille, pas seulement ce qui sort : ex. conjugaison en **paysage** cache des éléments au milieu → tester chaque affiche dans les deux orientations (le test peut chercher les éléments qui se chevauchent, ou dont le contenu déborde de leur boîte : `scrollHeight > clientHeight` avec `overflow: hidden`)
- [x] **Affiches de conjugaison : couleurs partout** ✓ (terminaisons régulières des formes irrégulières colorées : je vai·s, ils v·ont ; exceptions en couleur du radical : il va, vous êtes) (radical / terminaison / auxiliaire / participe) — le présent n'est pas coloré (vu sur « aller », verbe irrégulier) ; vérifier chaque verbe × chaque temps, et décider comment colorer les formes irrégulières (je vais, ils vont)
- [x] **Décisions (audit français, plan 09 étape 2)** ✓ (2026-10-04, sources dans plan 09 « Décisions français ») :
  - [x] Orthographe : niveaux CP, CE1, CE2, CM1, CM2 et « CP → CM2 ». Pluriels en -x, -al/-aux, *genou*, et féminins irréguliers (*blanche*, *grosse*) à partir du CE2 ; CP-CE1 : -e et -s. La fiche `exercices-orthographe-cp-cm2` vient du bouton « CP → CM2 » (homophones, même titre) ; nouvelles fiches `cp`, `ce1`, `ce2` (Accords)
  - [x] Homophones grammaticaux : absents des programmes en vigueur (cycle 2 et cycle 3) et des exemples de réussite Éduscol (CM1, CM2, 6e). Ils étaient dans le programme de 2015 et ont disparu en 2020. Décision : « pour aller plus loin » du CE2 au CM2, jamais par défaut (`HORS_PROGRAMME`)
  - [x] Dictée « Verbes courants » : déplacée du CE1 au CE2 (8 irréguliers du programme : il fait, va, dit, voit, vient, prend, peut, veut ; il doit / sait / tient retirés). Le CE1 mémorise des mots irréguliers, pas des formes verbales
  - [x] Vocabulaire CE2 « Homonymes » : le mot n'est que dans la terminologie du cycle 3. Renommé « Mots qui se disent pareil » et marqué « pour aller plus loin ». Grammaire CE1 « Accorder l'adjectif » : seulement -e et -s (*beaux*, *belle*, *blanche*, *gentille*, *neuve*, *longue*, *grosse* restent au CE2)
- [ ] **Manques au programme (maths)** : rien au CP pour numération ≤ 100, heure entière, euros, problèmes ≤ 30 ; calcul mental CP (stratégies) ; calcul posé sans niveau (soustraction CP seulement signalée), multiplication posée CE2, division CM1, décimaux ; fractions CE2 (7, 9, 12, comparer, additionner) et CM ; problèmes CE2 ≤ 10 000 ; mesures CE2 (dm, tonne, périmètre) ; formes : bouton MS/GS, solides du cycle 1 ; maternelle : composer/décomposer ; CM1-CM2 : décimaux, grands nombres. Affiches : bande 0–10 (GS), nombres en lettres CP ≤ 50, figures CE1/CE2
- [ ] Breton à relire en priorité : « pladenn » (disque), noms des domaines (`src/i18n/br/domaines.js`), cartes des familles d'affiches — relecture (breton + enseignant·e) organisée plus tard par l'utilisateur
- [ ] **Manques au programme (français)** : conjugaison -cer/-ger/-eler/-eter/-yer (CM1), accord du participe avec COD (CM2) ; grammaire : adverbe (CE2), radical/terminaison/infinitif (CE1), COD/COI, conjonctions, pronoms compléments (CM1), attribut, prépositions, subordination, complément du nom (CM2) ; vocabulaire CP et CM ; lecture : fluence, compréhension, fiches prégénérées ; lettres : cursive, sons, b/d p/q
- [ ] Lecture : découpages syllabiques discutables dans les données (« rou-ge », « feuil-le », « é-cole », « nu-age ») — repris tels quels dans le nouveau corrigé
- [x] Fiches de français avec l'interface en breton (`enLangue('fr', htmlFiche)`) ✓ : titres et consignes suivent la langue de l'interface, mais le contenu (et maintenant la ligne Prénom/Date) est en français → tout mettre en français sur la fiche
- [ ] Mesures : la question « verres » ne sort qu'une fois par taille de verre, quelle que soit la bouteille (clé de dédoublonnage `cont-verres-${c}`) ; la corriger change certaines séries
- [ ] Interface : il reste ~27 tests `langue === 'br'` hors générateurs (GrilleActivites, RechercheGlobale, Maths/FrancaisView, EcritureView, AlphabetView, ImprimerView, activites.js `a.br`…) → catalogues

## En cours (demande du 2026-10-04 : plans 01, 05, 08 + favicon ; plans/ non versionné)

- [x] Plan 08-A — tests dans le dépôt (`tests/`, `npm test`, `npm run test:complet`)
- [ ] Plan 01 — traduction propre : catalogues d'interface ✓, règles de langue ✓, vérificateur + export relecture ✓, pages statiques ✓, langues régionales génériques ✓, nombres ✓ ; contenu des générateurs ✓ (fiches identiques avant/après, déployé)
- [x] Plan 01 (suite) — bibliothèques évaluées (plans/01, section « Bibliothèques ») : noyau maison + Intl.PluralRules adoptés ; Fluent si relecture collaborative
- [x] Plan 05 — image de partage, balises og, JSON-LD, manifeste ; `scripts/dns-verification.mjs` prêt
  - [ ] Search Console / Bing : **codes TXT à fournir par l'utilisateur**, puis soumettre les sitemaps
- [x] Plan 08-B/C — page « Nouveautés » (CHANGELOG.md) + bouton « Signaler une erreur »
- [x] Nouveau favicon (+ icônes PNG / Apple, manifeste)

## Demandes du 2026-10-03

- [x] **Affiche de l'alphabet breton** : mots illustrés (aval 🍎, bara 🍞… — vérifiés dans le Wiktionnaire ; Z sans mot)
- [x] **Fiches de plusieurs pages** : aperçu de chaque page, « ◀ Page 3 / 26 ▶ », flèches du clavier, badge 📄 26 sur la carte
- [x] Fiches contenant du breton (bretonnes ou bilingues) affichées seulement si la langue régionale est active
- [x] **Plans écrits pour chaque point restant** : voir `plans/README.md` (exécution plus tard)

- [x] **Pages de téléchargement** (`scripts/telechargements.mjs`) :
  - [x] filtres : classe, langue des fiches, « 📘 Pour apprendre » / « ✏️ Pour s'entraîner »
  - [x] sélecteur FR / BR de l'interface des pages statiques, partagé avec l'app (même clé localStorage)
  - [x] fiches d'exercices pré-générées : chaque exercice × chaque classe, 4 variantes avec pagination (fr + br)
  - [x] recherche sur l'index (champ + raccourcis `/` et Ctrl/⌘+K)
  - [x] intro de l'index : breton mentionné seulement si la langue régionale est active
  - [x] calcul mental pré-généré : opérations choisies par classe
- [x] **Langue régionale = le contexte, partout** (pas le domaine) :
  - [x] le réglage « 🏴 Langue régionale » (Paramètres) décide de l'affichage du breton dans l'app ET les pages
        statiques (fiches bretonnes, mentions « français et breton », titres, intros)
  - [x] défaut : breton activé sur skoolik.app, désactivé sur ecoleprimaire.app ; ensuite c'est le choix de l'utilisateur
  - [x] les deux sites publient les mêmes fiches (fr + br) ; les pages statiques suivent le réglage (lien « afficher le breton »)
  - [x] `.env` / `src/site.js` : ne garder que nom, URL et valeurs par défaut (plus de `fiches: [...]` par site)
  - [x] app : textes qui parlent du breton (carte « Nombres en lettres ») selon le réglage
- [x] **Recherche dans l'app** (🔍, `/`, Ctrl/⌘+K) : activités, pages d'impression, fiches pré-générées (`telechargements/fiches.json`)
- [x] **Journaux d'usage sans cookie** :
  - [x] signal léger (même domaine, sans identifiant) à chaque page vue et à chaque fiche imprimée (+ réglages) — `src/utils/journal.js`
  - [x] nginx : `location = /journal` → 204, journal dédié sans IP (JSON)
  - [x] `setup-nginx.sh` relancé avec sudo : /journal actif (204), journal sans IP vérifié
  - [x] script de stats : `node scripts/stats-vps.mjs [jours]`
  - [x] mentions légales et README : statistiques anonymes décrites
- [x] **Pages de fiches (retours)** :
  - [x] retirer « ✔️ Gratuit, sans inscription »
  - [x] bouton « 🖨️ Imprimer » sous « Télécharger le PDF »
  - [x] affiche de l'alphabet breton : ajouter un mot exemple illustré par lettre — liste de mots bretons
        simples + emoji à vérifier (dictionnaire) avant publication ; aujourd'hui volontairement absent faute de mots vérifiés
- [x] **Push** sur `main` (redirection GitHub Pages active)
- [x] Formulation « maternelle et élémentaire » (et pas « maternelle et école primaire »)

- [ ] **Refaire proprement la traduction** (l'actuelle est très bricolée) — distinguer deux niveaux :
  - **interface** (boutons, consignes, menus, pages statiques) : langue choisie par le visiteur (FR / BR) ;
  - **contenu** (énoncés générés, mots, nombres, fiches, documents imprimés) : langue de l'exercice ou de la
    fiche, qui peut différer de l'interface (ex. interface en breton, cours de français au contenu français ;
    fiche bilingue ; consignes bretonnes sur un contenu français).
  - aujourd'hui : messages `{ fr, br }` dispersés dans chaque composant, `if (langue === 'br')` dans les
    générateurs, chaînes dupliquées dans `scripts/telechargements.mjs`, `duo()` pour les pages statiques,
    libellés traduits par des tables ad hoc (Orthographe, Dictée, quiz…) → difficile à relire et à étendre.
  - piste : catalogues de messages par langue et par domaine (`src/i18n/<langue>/<module>.js` ou JSON),
    clés partagées entre l'app, les générateurs de fiches et le script de build ; une fonction de traduction
    unique avec pluriels et règles propres à la langue (mutations bretonnes, accord après un nombre) ;
    pour le contenu, des générateurs paramétrés par langue plutôt que des branches `fr/br` ;
    fichiers faciles à faire relire par un brittophone (format plat, contexte en commentaire).
  - à faire avant d'ajouter une autre langue régionale (voir section ci-dessous).

## Généraliser « français + breton » en « français + langue régionale »

Aujourd'hui le breton est la seule langue régionale, et plusieurs endroits le supposent encore.
Objectif : ajouter une langue (occitan, alsacien, basque, corse, catalan…) en ne touchant qu'aux données.

- [ ] Interface : `src/i18n` connaît `fr` et `br` en dur (`LANGUES_INTERFACE`, messages `{ fr, br }` dans chaque
      composant). Passer à « une clé par langue » sans supposer `br`, et prévoir le repli `fr`.
- [ ] `src/data/languesRegionales.js` est la bonne base (alphabet, nombres en lettres, listes de mots) :
      y rattacher aussi le code de la langue d'interface, le drapeau (composant `Drapeau.vue` en dur pour
      le Gwenn-ha-du), le nom local et le titre de l'alphabet.
- [ ] `src/impression/nombres.js` : `langue: 'br'` signifie « langue régionale seule » ; renommer en
      `regionale` et utiliser `config.regionale` partout (légende, titres).
- [ ] `src/impression/catalogue.js` : les fiches bretonnes sont écrites à la main (`BR`, `lettresBretonnes`,
      `breton`) ; les générer à partir de la langue régionale (alphabet, listes, nombres).
- [ ] `src/site.js` : un site = une langue d'interface + des langues de fiches ; nom/domaine par langue.
- [ ] Vues d'exercices : les textes bretons sont dans chaque composant ; les sortir dans des fichiers par
      langue (`src/i18n/<langue>/…`) quand une 3e langue arrive, pour pouvoir les faire traduire/relire
      sans toucher au code.
- [ ] Synthèse vocale : pas de voix bretonne dans les navigateurs ; prévoir des enregistrements audio
      ou une voix serveur pour les langues sans TTS.
- [ ] Relecture de toute la traduction bretonne par un brittophone (commentaires `// br: à relire`).

## Site public — check-list

Fait :
- [x] HTTPS + HSTS, redirections http/www, certificats Let's Encrypt auto-renouvelés (certbot.timer)
- [x] Mentions légales et confidentialité (`/mentions-legales`), pied de page avec contact
- [x] Pas de cookie, pas de mesure d'audience, pas de compte → pas de bandeau cookies nécessaire
- [x] Sitemap + robots.txt par domaine, pages statiques indexables pour les fiches, canonical, Open Graph
- [x] Email : redirections contact@/bonjour@/admin@/webmaster@/postmaster@/abuse@, SPF, DKIM, DMARC
- [x] DNS : CAA Let's Encrypt
- [x] Cache long sur les fichiers avec empreinte, gzip
- [x] Avis de traduction automatique (breton) avec adresse de retour
- [x] Page À propos : section « Contribuer » (dépôt GitHub, issues, relecture bretonne)

À faire :
- [x] Appliquer la nouvelle config nginx (en-têtes de sécurité, CSP, page 404) :
      `scp deploy/setup-nginx.sh utilisateur@serveur:setup-ecoleprimaire.sh && ssh -t utilisateur@serveur sudo bash setup-ecoleprimaire.sh`
- [ ] Google Search Console (et Bing Webmaster) : déclarer les deux domaines et leurs sitemaps
- [x] GitHub Pages : redirection vers https://ecoleprimaire.app (au prochain push sur `main`)
- [ ] Déploiement automatique sur le VPS depuis GitHub Actions (clé SSH dédiée, rsync) au lieu du script local
- [ ] Surveillance : **Datadog**, configuré par l'utilisateur dans un autre agent (ne pas y toucher ici) — sonde de disponibilité (UptimeRobot, Uptime Kuma…) + alerte d'expiration des
      domaines (renouvellement auto désactivé) et des certificats
- [x] Licence : AGPL-3.0 pour le code, CC BY-SA 4.0 pour le contenu
- [ ] Image Open Graph (aperçu lors d'un partage) pour l'accueil de chaque site
- [ ] Accessibilité : passe clavier / lecteur d'écran (boutons-icônes, contrastes, focus), `lang` des
      contenus français dans l'interface bretonne
- [ ] Relecture pédagogique par un·e enseignant·e (programme 2024) — points ouverts : « fois plus » et
      fractions > 1 au CE2, formulation des divisions au CE2
- [ ] Page « Nouveautés » / changelog et formulaire de retour simple (mailto suffit pour commencer)
- [x] Mesure d'audience respectueuse si besoin (GoatCounter / Plausible auto-hébergé, sans cookie),
      à mentionner alors dans les mentions légales
