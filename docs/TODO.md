# TODO

> Liste de travail interne : idées, bugs, décisions en attente. Rien ici n'est une promesse.
> Ce qui est fait part dans le CHANGELOG et l'historique git ; `src/data/programme.ts` fait foi pour les niveaux.

## Avant la publication (revue du 2026-10-07)

Ordre conseillé : redirections des slugs (bloquant, voir l'entrée « Redirections ») → `npm run test:complet` → `build:vps` puis
`deploy-vps.sh --dry-run` → `deploy/setup-nginx.sh` **avec sudo, par l'utilisateur, avant le premier rsync** (sinon les adresses
propres renvoient une 404 ; le script marche aussi avec l'ancien site) → merge dans `main` → `deploy-vps.sh`. Fait le 2026-10-07 :
mentions légales reportées (`/mentions-legales`), anciennes routes de l'app redirigées. Juste après : soumettre les sitemaps
(Search Console, Bing). Important mais pas bloquant : relecture du breton (`AvisTraduction` doit s'afficher sur skoolik), passe
clavier et lecteur d'écran, doubles et moitiés du CP hors des valeurs du programme (corriger change les fiches : `--maj` justifié).

## Demandes du 2026-10-09

- [x] **Grammaire coupée en cinq exercices** (demande du 2026-10-10, adresses publiées libres) — fait : `grammaire-phrase`, `grammaire-mots` (nature des mots, pronoms), `grammaire-sujet-verbe`, `grammaire-accords`, `grammaire-complements` (CM1-CM2), un par compétence du programme ; moteur commun dans `src/moteurs/grammaire/` ; une vue partagée (`GrammaireExercice.vue`) ; plus de bilan par classe, une fiche par compétence et niveau ; `/francais/grammaire` redirige vers `/francais`. Les tirages sont identiques à ceux d'avant (sauf « nature des mots », qui faisait deux pages), vérifié par comparaison des questions tirées. À faire : tester le jeu à la main ; titres bretons (`grammaire*` à relire) ; l'ancienne adresse `exercices-grammaire-<niveau>` n'existe plus.
- [ ] **Confiance dans les traductions bretonnes : niveau par fiche, réglage visiteur, prompt de tagage** (demande du 2026-10-09) — fait (socle) : échelle 0-4 (`src/langues/confiance.ts`), niveaux par ressource
  (`src/langues/br/confiance.ts`, note obligatoire), champ `confiance` dans l'index des fiches, réglage « Fiabilité des traductions » (page des réglages, défaut 2), exceptions par fiche (`fiche:<slug>`), pastille sur les cartes, « N fiches cachées »
  dans le compteur, **en dev tout est visible et la pastille dit « masquée par le réglage »**, `npm run confiance`, `tests/confiance.test.mjs`, méthode et prompt dans `docs/confiance-breton/`. **Partout** (2026-10-09) : le hook `useAffichable()` (`src/ressources/useAffichable.ts` : `affichable`, `masque`, `filtrer`, `traduite`, `affichables`) est la seule porte des listes (matières, accueil, compétences, programme, recherche, « reprendre », voisines d'une fiche, autres langues d'une fiche, index des fiches) ; règle pure `traductionAssezSure` (`src/ressources/filtres.ts`) : on ne cache que si le mode montre la traduction. **Fait le 2026-10-09** : les 39 ressources sont évaluées (`npm run confiance`) ; 6 ressources à 1 ou 2, 33 à 0 (donc cachées par défaut) ; sources de l'académie de Rennes ajoutées (`docs/programmes/bretonA1A2.md`, `bretonA2B1.md`, `docs/confiance-breton/lexique-academie.md`). **Fait ensuite** : corrections d'après l'académie et Geriafurch (lieskementiñ, skouergorneg, Kelc’h, Klok, segmant, nadoz…), `sources.md`, `prompt-traduire.md` ; couleurs, espace, eau et tables passent à 1. **Reste à faire relire** (liste dans `lexique-academie.md`) : « korn skouer », « hirgarrezeg », « skript », « a-stag », les mutations des nombres, et les 8 ressources dont tous les mots sont attestés mais dont la syntaxe ne l'est pas. **Ancien reste** : refaire l'évaluation avec le lexique de l'académie (plusieurs mots jugés non confirmés y sont attestés : sammadenn, lamadenn, unanenn, kantad, tric’horn, kreion, santim…) ; faire regarder les écarts avec l'académie (liesañ / lieskementiñ, hirgarrez / skouergorneg). **Reste** :
  évaluer les 34 ressources encore à 0 (donc cachées par défaut) avec le prompt ; décider du sort des exercices en ligne (« Faire l'exercice » n'est pas filtré, seules les fiches PDF le sont) ; pastille aussi sur
  la page d'une fiche ; **tagger par texte** (idée 3 du 2026-10-09, plus juste que la ressource ou la fiche) : noter chaque clé de texte breton (niveau, relecteur, date : ce que le document de relecture
  `/dev/relecture-breton` liste déjà par clé), enregistrer pendant le build des PDF les clés lues par chaque fiche (le traducteur `T` d'exercice et les textes d'affiche), et en déduire le niveau de la fiche
  (minimum des clés qu'elle imprime) ; les niveaux par ressource et par fiche deviennent alors un repli ; l'interface du site (`AvisTraduction`) reste hors de cette échelle ; breton des nouveaux textes à relire.
- [x] **Affiche des mois : commencer en janvier, et dire que les saisons ne commencent pas au début d'un mois** (demande du 2026-10-09) — fait (`src/affiches/mois/calendrier.ts`, `saisons.ts`) : l'ordre de l'année par défaut (l'hiver est coupé : janvier-février en haut, décembre en bas, bande de saisons qui change en cours de mois), les changements de saison dits par une note (les repères « vers le 21 mars / 21 juin / 22 septembre / 21 décembre » sur la bande sont **cachés pour l'instant** : `AFFICHER_DATES_DE_CHANGEMENT` dans `src/affiches/mois/saisons.ts`, à passer à `true` pour les remettre) ; la présentation « par saison » est un réglage (« Présentation »).
- [x] **Affiche des mois (`/imprimer/affiches?affiche=mois&variante=gs&attache=true`) : la refaire pour mettre en évidence le lien saison / mois** (demande du 2026-10-09). — fait (`src/affiches/mois/dessin.ts`) : avec les saisons, quatre bandes de couleur, une par saison (🌱 mars-mai, ☀️ juin-août, 🍂 septembre-novembre, ❄️ décembre-février), chacune avec ses trois mois dedans ; en paysage, quatre colonnes ; sans les saisons, la liste de douze mois comme avant. Découpage par mois entiers (météorologique), à faire valider.
- [x] **Pied de page : cacher le lien « Programme » hors du profil enseignant** — fait (`AppFooter.vue`, test dans `pages-shell`).
 (demande du 2026-10-09).
- [x] **Carte « Brezhoneg » : un tout nouveau titre** — fait (provisoire, à confirmer) : le titre est le nom de la langue dans la langue affichée (« Breton »), avec « Brezhoneg » dessous, comme « Maths » et « Matematik ».
- [x] **Visite guidée : seulement à la première visite de l'accueil** (demande du 2026-10-09, qui remplace « aussi sur `/<matière>/fiches` et les sous-pages », essayé puis abandonné parce que plus compliqué) — fait : elle est de nouveau montée par `Accueil.vue`, comme avant.
- [x] **`AGENTS.md` : parler de `main`, plus de `base-saine`** — fait, avec ce qui n'était plus vrai depuis la suppression de l'ancien monde.
- [x] **Mode enseignant : l'activer depuis la page des réglages, avec les notices** — fait : section « Mode enseignant (idée en construction) » dans `/parametres` (case et explication).
- [x] **Mode enseignant, idées 1 et 2 retenues** — fait : pastille « bêta » sur le profil, `BandeauConstruction` sur Programme, compétence et l'accueil de l'enseignant (avec « Donner un avis »).
- [x] **Fiches toutes prêtes : un lien direct vers le filtre « à afficher » (et « pour s'entraîner »)** — fait : `?usage=afficher` ou `?usage=sentrainer` dans l'adresse (écrit aussi quand on clique le filtre).
- [x] **Un lien vers *toutes* les fiches (pas seulement maths / français / monde)** — fait : `/telechargements?toutes=oui&usage=afficher` (toutes les matières, toutes les classes) ; `?usage=` et `?toutes=oui` marchent
  aussi sur `/maths/fiches`, `/francais/fiches` et `/monde/fiches`.
- [x] **« Pour apprendre » → « à afficher »** (moins présomptueux) — fait : « À afficher » (🖼️) pour les affiches dans les filtres, les groupes d'une matière et les pages statiques ; titre de l'accueil « Affiches, fiches à
  imprimer et exercices pour s’entraîner » ; les descriptions de fiches (« pour apprendre à écrire… ») ne changent pas.
- [ ] **Affiche `affiche-formes-planes-cycle-1-2` : la proposer aussi en GS** — essayé puis **annulé le 2026-10-09** (demande de l'utilisateur) : fusionner avec la variante `plan-gs` (identique) demandait qu'une variante repose sur une compétence `horsProgramme` ; la GS garde son affiche `plan-gs`, le CP la sienne.
- [x] **Titre de l'accueil** (validé le 2026-10-09).

- [ ] **Mode « enseignant » : dire clairement que c'est une idée en construction, à valider et à relire** (demande du 2026-10-09) — fait : le mode est **caché par défaut** (`enseignantVisible: false` dans
  `src/sites.ts`) : plus de profil « Enseignant » (menu, accueil, visite guidée) ni d'entrée « Programme » tant que l'appareil ne l'a pas activé par l'adresse spéciale `?enseignant=oui`
  (`?enseignant=non` pour le cacher ; le paramètre est retiré de l'adresse, un bandeau confirme et dit « idée en construction, à relire avec des enseignants » ; `src/contexte/enseignant.ts`,
  `src/shell/BandeauEnseignant.vue`, `tests/enseignant.test.mjs`) ; la description du profil dit « idée en construction, pas encore validée ». **Idées pour aller plus loin, à choisir** : (1) une pastille
  « bêta » ou « en construction » à côté du nom du profil dans la barre ; (2) un bandeau discret sur les pages propres à l'enseignant (Programme, compétence, « Copier le lien pour les familles ») ;
  (3) une phrase sur la page « À propos » et dans « Nouveautés » : ce qui est validé, ce qui ne l'est pas ; (4) un lien « Donner un avis » (mailto) dans le bandeau et sur ces pages ; (5) marquer
  chaque contenu pour enseignants « non relu » tant qu'aucun·e enseignant·e ne l'a relu (liste dans `plans/07-relecture-pedagogique.md`) ; (6) activer le mode par site (skoolik avant ecoleprimaire) ;
  (7) un lien d'activation à donner aux enseignant·es testeurs, avec une page courte qui explique ce qu'on attend d'eux ; (8) retirer le bandeau seulement quand le mode est validé.
- [x] **Menu du profil : retirer la note « Le profil ne change que la disposition… »** (demande du 2026-10-09) — fait.
- [x] **Titre de l'accueil sans « pour l'école »** (demande du 2026-10-09) — fait : « Affiches, fiches et exercices pour apprendre et s’entraîner » (le mode parent devient le mode principal) ; breton à relire.
- [x] **Travailler dans `main`** (demande du 2026-10-09) : plus de branche `base-saine` ; `main` local contient tout (fusion de `origin/main`, 6 commits d'avance, rien de poussé).

## Demandes du 2026-10-08

- [x] **Relecture du breton : séparer le contenu des fiches de l'interface dans le PDF** (demande du 2026-10-08) — fait : deux parties, « Partie 1 — Contenu des fiches : exercices et affiches »
  (690 textes, environ 56 pages) puis « Partie 2 — Interface du site » (945 textes), saut de page entre les deux et un mot sur la priorité ; les sources de la page sont dans le même ordre.

- [x] **Page de développement « Relecture du breton » (PDF à imprimer pour un·e brittophone)** (demande du 2026-10-08) — fait : `/dev/relecture-breton` (développement seulement) liste les textes
  bretons marqués `// br: à relire` (ou tous), de l'interface, des exercices et des affiches, par section à cocher, et prépare un document A4 à imprimer ou à enregistrer en PDF : pour chaque texte,
  la clé, le français, le breton actuel, des lignes de correction (selon la longueur, ou 1 à 5) et des cases « OK » / « à corriger » ; option « une section par page » et clés masquables. Lecture
  des marqueurs partagée avec `npm run i18n` (`src/langues/relecture.ts`, le tableau `i18n:relecture` est inchangé octet pour octet), mise en page `src/impression/relecture.ts`, test
  `tests/relecture-breton.test.mjs`. À peu près 1 600 textes en tout (environ 130 pages) : choisir des sections pour un document plus court.

## Demandes du 2026-10-07

- [ ] 🎨 **Guide d'iconographie (OpenMoji, Phosphor, ARASAAC, Open Doodles ; décisions du 2026-10-07)** : tout est dans `brouillons/iconographie/` (dossier ignoré par git, plan temporaire, sur la machine de travail seulement : `GUIDE.md` = référence ; `FAISABILITE.md` = comment l'implémenter dans le noyau et ordre de migration ; `LICENCE-FICHES.md` ; `maquette/` = pages HTML à ouvrir dans un navigateur). Fait : la licence (fiches en CC BY-NC-SA 4.0, textes et données en CC BY-SA 4.0, images : leur licence — `LICENCE-CONTENU.md`, README, mentions légales alignés) et les propriétés des PDF (`scripts/build/fiches/metadonnees.ts`, `@cantoo/pdf-lib` en dépendance de développement, test `tests/metadonnees-pdf.test.mjs`). **Pas encore fait (rien n'est branché au site)** : (1) le socle `src/images/` (tables typées, `htmlEmoji` / `htmlConsigne` / `htmlIcone`, composants Vue, `fournirImages`, script d'import des assets, compteur `emojisSysteme` de `qualite`) ; (2) le réglage « Images » dans « Sur la fiche » (famille OpenMoji / emojis du système, style couleur / contour) et le réglage « Pictogrammes des consignes » (activé en maternelle, désactivé en élémentaire, jamais dans les PDF publiés) avec la mention « Pictogrammes : Sergio Palao, ARASAAC… » désactivable ; (3) migration par rôle, un commit chacun : interface (sortir les emojis des textes de boutons → Phosphor), domaines et retours, consignes, objets d'exercice au fil des reports, décoration, page Crédits ; (4) valider à la main le lexique ARASAAC provisoire (écoute 6572 et colorie 2348 sont des approximations, dessine 8088 ajouté). **À faire valider** : la relecture juridique (une fiche = collection d'images séparées, `LICENCE-FICHES.md`) et la question des droits sur les commits écrits sous l'adresse d'entreprise (non traitée).
- [ ] **Accueil enseignant : « Préparez vos classes » est prétentieux** (question du 2026-10-07) : enlever le titre et le sous-titre ? (l'assistant de première visite explique déjà le site)
- [ ] **Enregistrements audio pour les textes fixes** (suite de « Meilleure synthèse vocale », faite le 2026-10-07 : choix de voix `src/noyau/voix.ts`, réglage voix et vitesse) : nom et son des lettres, consignes de maternelle, nombres 0-20, jours et mois bretons (une vraie voix bretonne pour les textes vérifiés) ; Opus ~1,5 Mo, servis par le site ; voix humaine cédée en CC BY ou CC0 (OPAB, Diwan) ou Piper (vérifier chaque modèle) ; à trancher : garder le curseur de vitesse propre à la Dictée ?
- [ ] **Redirections des anciennes adresses : pas avant mi-octobre** (décision du 2026-10-07 : personne n'utilise encore le site, on attend que tout se stabilise). À reprendre alors : `exercices-orthographe-cp-cm2` (réglage « CP → CM2 » supprimé) → `exercices-orthographe-ce2-homophones`, et les autres anciens slugs listés plus bas (`-brezhoneg`, alphabet et nombres bretons, `exercices-nombres-<classe>`). Note : le modèle publie un bilan par classe, d'où `exercices-orthographe-cm1` et `-cm2` (mêmes questions que le CE2) ; **revue du 2026-10-07** : 244 slugs de production disparaissent (225 `-brezhoneg` : 156 ont leur `-br`, 64 retombent sur le slug français ; et `exercices-dictee-cm1-cm2` → `-cm1`/`-cm2`, `exercices-quiz-cp-cm2` → `-cp`…`-cm2`, `exercices-orthographe-cp-cm2`, alphabets et nombres bretons) ; les PDF et aperçus ont changé de place (`/telechargements/<slug>/fiche-N.pdf` → `/fiches/<slug>/…`) : une `map` nginx générée depuis l'ancienne liste de slugs + une règle 301 pour les anciens PDF ; listes : ancien build `dist-*/telechargements/` (4 octobre) contre `fichesDesRegistres` ; les anciennes routes de l'app sont redirigées (fait : `src/router/anciennesAdresses.ts`)
- [ ] **Accueil enseignant : « 🔗 Copier le lien pour les familles »** (remarque du 2026-10-07) : pas convaincant tel quel, prend beaucoup de place à l'écran ; à repenser (plus discret, ailleurs ?)
- [ ] **Pour le 2026-10-08 : finir la couverture PS, MS, GS** — plan `plans/14-couverture-maternelle.md` (lots A à G, décisions en § 5)

## Demandes du 2026-10-05

- [ ] **Options « Sur la fiche » et choix de police (demande du 2026-10-06)** : (1) les cinq options (Prénom et date, Sans corrigé, Corrigé sur une autre page, Corrigé en bas à l'envers…) ne tiennent pas sur une ligne, pas très propre ; (2) le lien « Utiliser Belle Allure, Écolier ou une autre police… » ne tient pas compte de ce que la police est déjà installée ou non ; (3) pour une fiche : voir toutes les polices suggérées, et aussi les polices « normales » si on veut ; un **sélecteur de police standard** avec les nôtres en favoris
- [ ] **Avant la publication, petits restes** : une vraie image de partage (`og-image`, aujourd'hui `icone-512.png`) ; `lastmod` du sitemap stable (il change à chaque build) ; supprimer ou aligner `deploy/nginx/*.conf` (encore le routage par `#`) ; `scripts/deploiement/stats-vps.ts` : les routes journalisées ont changé (`/autres` → `/monde`…)
- [ ] **Shell : à confirmer par `npm run test:complet`** les défauts relevés par la critique (contrastes du logo, du lien actif, de l'étiquette « Classe » et du pied de page ; débordement à 320 px) : `<main>` et les titres de document sont faits, axe refuse les violations sérieuses
- [ ] **Fiches toutes prêtes, restes** (`src/telechargements/README.md`) : image de partage ; polices locales non redistribuables (Belle Allure, Écolier) jamais embarquées, à documenter dans l'interface ; le README dit encore « pas d'image de partage »
- [ ] 🌱 **Publier la base saine** : `base-saine` remplace `main` (production) seulement après validation de l'utilisateur ; voir « Avant la publication » en tête de ce fichier
- [ ] **Après le lot C** : Tables CE1 démarre maintenant avec les tables 2, 3, 4, 5 et 10 (avant : 2 à 9 pour tous) ; en PS, `nbQ` est gardé au changement de niveau ; Longueurs n'utilise pas `OrdonnerClics` (on touche les crayons) — à revoir à l'usage
- [ ] **Division posée** non proposée (CM1 et CM2, compétence `division-posee`) : l'exercice `calcul-pose` ne fait que l'addition, la soustraction et la multiplication posées ; la division demande un autre agencement (quotient, reste, étapes). Tables : le défi chrono n'a plus qu'un seul tirage de chaque calcul (jamais deux fois la même question) et s'arrête à la dernière question
- [ ] **Lettres** : ajouter la cursive, le son des lettres et les confusions b/d, p/q (manques relevés par l'audit ; l'exercice ne couvre aujourd'hui que le nom des lettres, GS-CP)
- [ ] **Écarts de programme laissés par la migration du lot B** (changeraient les tirages, donc les fiches publiées → un lot à part avec `--maj`) : Fractions CE2, dénominateurs 7, 9, 11 et 12 jamais tirés ; Mesures CE2, dm, tonne et périmètre absents ; Géométrie, l'angle droit est au programme dès le CE1 mais n'est proposé qu'au CE2
- [ ] **Page programme** : utiliser les mêmes icônes que la page `/imprimer` pour « 📘 Pour apprendre » et « ✏️ Pour s'entraîner »

## Affiches et fiches

- [ ] **« Ce que je sais faire »** : affiches jamais publiées, retirées du dépôt le 2026-10-07 (gardées dans `brouillons/ce-que-je-sais-faire/` : `resume.js`, `savoirs.js`) ; à reporter dans le modèle d'affiche (`src/affiches/`) si on les publie après l'avis d'enseignants
- [ ] **Relire les phrases « Ce que je sais faire »** (`brouillons/ce-que-je-sais-faire/savoirs.js`, ≈ 300 phrases) avant toute publication de ces affiches
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
- [ ] **Liens vers le programme officiel** aussi sur les pages matières et les cartes d'activités (déjà sur
      `/imprimer`, `/telechargements/` et les pages de fiches, via `lienProgramme()`)

## Manques au programme


- [ ] **Le reste du programme dans `programme.js` et la page `/programme`** : ce qui a du sens ici (exercices, fiches, affiches) — cycle 1 « Explorer le monde » (BO n° 19), cycle 2 « Questionner le monde » (vivant, matière, objets ; espace et temps), cycle 3 histoire, géographie, sciences et technologie. Pas l'EPS, ni les arts, ni l'EMC, ni la pédagogie ; pas de langue étrangère pour l'instant (anglais…). Ajouter les textes officiels correspondants dans `docs/programmes/`, puis les domaines et compétences avec leurs sources ; le quiz de culture générale s'y rattachera (aujourd'hui « hors programme »)

- [ ] **Couverture complète PS, MS, GS, CP, CE1** : plans écrits (`plans/10-couverture-ps.md` … `-ce1.md`, chacun avec ses décisions à prendre) ; à exécuter niveau par niveau
  - [ ] Ordre : presets → textes des BO → implémenter les plans **classe par classe** (recommandations des plans retenues par défaut, à noter dans chaque plan)
    - PS : niveau PS (Compter, Comparer, consignes lues) ✓, Formes PS/MS/GS ✓, Motifs ✓, Longueurs ✓ ; reste Graphisme, Catégories, Journée, La valise, Mon prénom, Espace, Syllabes
  - [x] Rapport de couverture trop optimiste : les compétences sont déclarées par exercice (`COMPETENCES_ROUTES`), pas par classe → déclarer par classe (ou dériver des options) ; compter aussi les fiches bilan des exercices
  - [ ] Défauts trouvés par les plans : `<` et `>` dans les fiches Ordonner (CP) — ~~correction de Comparer~~ ✓ ; ~~Formes sans niveau (rectangle en MS, formes toujours dans la même position)~~ ✓ (PS/MS/GS, mode « même forme ») ; Lettres « Reconnaître » compare deux lettres identiques ; fiches d'écriture « GS » avec l'attaché majuscule ; ~~Compter boucle sans fin si le maximum est 3~~ ✓ ; consigne lue à voix haute : Compter, Comparer, Formes ✓ (`ConsigneParlee`), reste Ordonner et Lettres
  - [ ] Données à corriger (plan CP) : ~~`fiche-ajouter-retirer-10` rangée en « multiplier par 10 »~~ ✓ ; ~~`fiche-suites-de-nombres` « CP · CE1 » monte à 190~~ ✓ (CE1) ; ~~Orthographe « Le soli___ brille »~~ ✓ ; doubles et moitiés du CP hors des valeurs du programme
  - [ ] Lecture : le mode « Lecture de textes » n'a aucune question (compréhension non couverte, CP et CE1)



- [ ] **Maths** : rien au CP pour la numération ≤ 100, l'heure entière, les euros, les problèmes ≤ 30 ; calcul mental
      CP (stratégies) ; calcul posé sans niveau (soustraction CP seulement signalée), multiplication posée CE2,
      division CM1, décimaux ; fractions CE2 (7, 9, 12, comparer, additionner) et CM ; problèmes CE2 ≤ 10 000 ;
      mesures CE2 (dm, tonne, périmètre) ; formes : bouton MS/GS, solides du cycle 1 ; maternelle :
      composer/décomposer ; CM1-CM2 : décimaux, grands nombres
- [ ] **Français** : ~~conjugaison -cer/-ger/-eler/-eter/-yer (CM1)~~ ✓ (compétence `conjugaison-radical-variable`, six verbes, fiche « radical variable » CM1 et CM2) ; accord du participe avec le COD (CM2) ;
      grammaire : adverbe (CE2), radical/terminaison/infinitif (CE1), COD/COI, conjonctions, pronoms compléments
      (CM1), attribut, prépositions, subordination, complément du nom (CM2) ; vocabulaire CP et CM ; lecture :
      fluence, compréhension, fiches prégénérées ; lettres : cursive, sons, b/d p/q

## Bugs et dette


- [ ] Géométrie : l'avertissement rouge « Imprimer à 100 %… » est aussi sur la fiche imprimée — le passer en orange dans le formulaire et le retirer de la fiche, comme pour Mesures ?

- [ ] **Build des PDF** : parallélisé (≈ 2 min par site au lieu de ≈ 20) ; reste à ne pas générer deux fois les mêmes PDF pour les deux sites (`build:vps`)

- [ ] Mesures : la question « verres » ne sort qu'une fois par taille de verre, quelle que soit la bouteille (clé de
      dédoublonnage `cont-verres-${c}`) ; la corriger change certaines séries

## Breton et langues régionales

- [ ] Relecture par un brittophone (et un·e enseignant·e) de tout ce qui est marqué `// br: à relire`
      (`npm run i18n:relecture`), en priorité : « pladenn » (disque), noms des domaines (`src/i18n/br/domaines.js`),
      cartes des familles d'affiches, mentions légales et « À propos » — organisée plus tard par l'utilisateur

## Site public

- [ ] Google Search Console et Bing Webmaster : **codes TXT à fournir par l'utilisateur**
      (`scripts/ponctuel/dns-verification.mjs` est prêt), puis soumettre les sitemaps des deux domaines
- [ ] Déploiement automatique sur le VPS depuis GitHub Actions (clé SSH dédiée, rsync) au lieu du script local
- [ ] Accessibilité : passe clavier et lecteur d'écran (boutons-icônes, contrastes, focus), `lang` des contenus
      français dans l'interface bretonne
- [ ] Relecture pédagogique par un·e enseignant·e — points ouverts : « fois plus » et fractions > 1 au CE2,
      formulation des divisions au CE2
- Surveillance (disponibilité, expiration des domaines et des certificats) : Datadog, configuré par l'utilisateur
  dans un autre agent — ne pas y toucher ici
- [x] **/telechargements?usage=afficher : cacher les fiches bilingues quand la langue choisie est seulement le français** (demande du 2026-10-09). — fait (`dansLeMode`, `src/telechargements/pages.ts`) : en mode français, ni fiches bretonnes ni bilingues (sur l'index actuel : 76 « à afficher » en français, 30 bilingues cachées).
- [ ] **Affiches de maternelle + intégration d'OpenMoji** (demande du 2026-10-09) : socle `src/images/` (OpenMoji couleur en SVG intégré, pas de requête réseau), puis bande numérique (MS 1-6, GS 1-10, comptine à 30), solides, journée, corps et cinq sens, hygiène (lavage des mains), repères d'espace, cycles de vie, états de l'eau, couleurs. Ensuite : migrer alphabet et météo vers OpenMoji.
- [x] **Affiches de maternelle : relecture critique** (enfant + enseignant·e, docs/critiques/) de toutes les nouvelles ; **« La journée » : contenu à vérifier avec le programme** (demande du 2026-10-09).
- [x] **Affiches de maternelle + intégration d'OpenMoji** (2026-10-09) : `src/images/` (emojis OpenMoji 15.1.0 couleur, SVG intégrés, `node scripts/generer/images.ts`), `src/affiches/cartes.ts` (cartes communes), affiches `bande-numerique` (MS 1-6, GS 1-10, GS 1-30), `couleurs`, `journee` (PS : matin/soir/jour/nuit ; MS : cinq moments ; PS-GS : ma journée), `corps` (parties, cinq sens), `hygiene` (mains, gestes), `espace`, `cycles` (poule, plante), `eau` (fondre et geler), variante `solides-maternelle` de `formes`. Relecture critique (enfant + enseignant·e) faite : corrigé les images ambiguës (matin/soir, devant/derrière, mains), la vapeur (hors programme du cycle 1 : retirée), les écrans (hors BO : remplacés par « se moucher »), les constellations de la bande (dé puis rangées de cinq).
  - [x] (2026-10-09, suite) Fait : le bonhomme SVG (`corps`, variante `bonhomme` : cou, tronc, ventre, bras, main, jambe, pied, étiquettes reliées), « entre », « à gauche », « à droite » (variante `reperes-plus`, dès la MS : BO p. 27), 10-20-30 pleins sur la bande 1-30, breton vérifié en ligne (Wiktionnaire, 2026-10-09 : couleurs, repères d'espace, moments, parties du corps, cinq sens en partie, états de l'eau ; genre et mutations contrôlés d'après les règles de `src/langues/br/regles.ts`). Les lignes vérifiées portent `// vérifié (Wiktionnaire, 2026-10-09)` ; restent « à relire » les titres, descriptions et réglages (phrases), et les mots sans source : pred-mintin (petit-déjeuner), après-midi, blas (goût), stok (toucher), tronc, savonner, rincer, « se moucher », poussin (yarig), pousse, plante, « l'œuf s'ouvre », noms des solides.
  - [ ] Choix laissés : la plante (graine, pousse, plante en pot, tournesol : un seul type de plante ?) ; « le soir » est encore une scène carrée (couchant sur la ville) ; breton à relire de toutes ces affiches (`npm run i18n:relecture`).
  - [ ] Migrer l'alphabet et la météo (emojis du système → OpenMoji) ; réglage « Images » (famille, style contour) ; page de crédits.
- [ ] **Affiche « Mon corps » (`corps`, variante `bonhomme`) : l'améliorer, voire dessiner nos propres « parties du corps » dans le style d'OpenMoji** (demande du 2026-10-09). Aujourd'hui : un bonhomme SVG simple (`src/affiches/corps/bonhomme.ts`) avec des étiquettes reliées par un trait ; le tronc englobe le ventre, rien ne les sépare à l'œil, et le dessin est plus pauvre que les emojis OpenMoji des autres affiches. Pistes : un bonhomme et des parties (tête, cou, tronc, ventre, bras, main, jambe, pied, dos…) au même style qu'OpenMoji (contour épais sombre, aplats, palette de leur guide) pour que l'affiche et les cartes des « parties du corps » (`parties`) se ressemblent ; distinguer la poitrine du ventre (teinte ou accolade) ; peut-être des SVG à ajouter à `src/images/` comme source propre, avec leur licence (le style d'OpenMoji est CC BY-SA 4.0 : des dessins faits à la main dans ce style nous appartiennent, mais ne pas recopier leurs fichiers sans l'attribution).
- [x] **Emojis maison au style OpenMoji** (2026-10-09) : quand OpenMoji n'a pas l'image, un SVG dans `src/images/maison/<nom>.svg` (règles et marche à suivre : `src/images/maison/README.md`), inscrit dans `src/images/tables.ts` comme `'maison:<nom>'` ; même chaîne que les OpenMoji (`node scripts/generer/images.ts`, `emojiSvg` / `emojiHtml`, `data-image="maison"`). Premiers : le cou, le tronc, le ventre, dans la nouvelle variante `parties-plus` de l'affiche du corps (MS, GS) ; le bonhomme légendé est redessiné au même style (tee-shirt court : le tronc et le ventre se distinguent). Regards critiques faits sur les essais ; restent possibles : le dos (vu de dos), les doigts, les articulations en GS (coude, genou, épaule, poignet, cheville), une fiche « puzzle du corps » à découper (exemple de réussite du BO, p. 31).
- [x] **/maternelle/longueurs?mode=imprimer : « 5 crayons » ne met pas 5 crayons sur la fiche** (demande du 2026-10-09) — corrigé : en « le plus long, le plus court », la fiche et le jeu ne montraient que 2 crayons à tous les niveaux ; maintenant 4 en MS et 5 en GS comme le disent les boutons (2 très différents en PS).
- [ ] **CE1 : une affiche et des exercices sur les pronoms et sur « la phrase »** (selon le BO ; demande du 2026-10-10).
- [x] **Nombre de questions : une option « libre » en plus des choix** (5, 10, 15…), pour tous les exercices (demande du 2026-10-10). Le socle refuse aujourd'hui `nombre()` dans un exercice (src/noyau/declaration.ts) : à ouvrir pour `nb`, avec des bornes. — fait : `choix([…], { libre: NB_LIBRE })` (1 à 50, src/noyau/declaration.ts), bouton « Autre… » et champ borné dans ChoixReglage, valeur validée et mémorisée (politique.ts), sur les 23 exercices (sauf la dictée, dont 0 = toute la liste).
- [x] **Grammaire et breton** (2026-10-10) : la grammaire reste en français seulement (exercices et affiches), pas de version bretonne pour l'instant (la grammaire bretonne serait spécifique).
- [x] **Affiche des pronoms : ajouter « on »** (demande du 2026-10-10) — fait : il, elle, on (une silhouette sans visage, « quelqu'un »), avec ce que chaque pronom remplace ; paysage seulement.
- [x] **Affiche de la phrase : une version sans les types de phrases, plus complète sur ce qu'est une phrase** — fait : variante « Qu'est-ce qu'une phrase ? » (CP, CE1) (majuscule, point, suite de mots dans l'ordre, qui a du sens…) (demande du 2026-10-10).
