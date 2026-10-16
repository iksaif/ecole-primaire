# TODO

> Liste de travail interne : idées, bugs, décisions en attente. Rien ici n'est une promesse.
> Ce qui est fait part dans le CHANGELOG et l'historique git (`git log -- docs/TODO.md`) ; `src/data/programme.ts` fait foi pour les niveaux.
> Les chantiers longs ont leur plan dans `plans/` (index : `plans/README.md`). Nettoyé le 2026-10-13.

## Publication et site

- [ ] **Redirections des anciennes adresses** (décision du 2026-10-07 : pas avant mi-octobre, quand tout est stable). 244 slugs de production
  ont disparu : 225 `-brezhoneg` (156 ont leur `-br`, 64 retombent sur le slug français), `exercices-dictee-cm1-cm2` → `-cm1` / `-cm2`,
  `exercices-quiz-cp-cm2` → `-cp`…`-cm2`, `exercices-orthographe-cp-cm2` → `exercices-orthographe-ce2-homophones`, alphabets et nombres
  bretons, `exercices-nombres-<classe>` → `exercices-numeration-<classe>` ; depuis : `exercices-grammaire-<niveau>` (grammaire coupée) et
  `exercices-geometrie-ce1`, `-ce2`, `-ce2-reperage` (géométrie coupée). Les PDF et aperçus ont changé de place
  (`/telechargements/<slug>/fiche-N.pdf` → `/fiches/<slug>/…`). Moyen : une `map` nginx générée depuis l'ancienne liste (ancien build
  `dist-*/telechargements/` du 4 octobre contre `fichesDesRegistres`) et une règle 301 pour les anciens PDF. Les anciennes routes de l'app
  sont déjà redirigées (`src/router/anciennesAdresses.ts`).
- [ ] **Petits restes** : une vraie image de partage (`og-image`, aujourd'hui `icone-512.png` ; plan 05) ; `lastmod` du sitemap stable (il
  change à chaque build) ; supprimer ou aligner `deploy/nginx/*.conf` (encore le routage par `#`) ; `scripts/deploiement/stats-vps.ts` : les
  routes journalisées ont changé (`/autres` → `/monde`…) ; le README des fiches dit encore « pas d'image de partage ».
- [ ] Google Search Console et Bing Webmaster : **codes TXT à fournir par l'utilisateur** (`scripts/ponctuel/dns-verification.mjs` est
  prêt), puis soumettre les sitemaps des deux domaines (plan 05).
- [ ] Déploiement automatique sur le VPS depuis GitHub Actions (plan 02).
- [ ] **Build des PDF** : ne pas générer deux fois les mêmes PDF pour les deux sites (`build:vps`).
- [ ] Accessibilité : passe clavier et lecteur d'écran, SVG interactifs au clavier, `lang` des contenus français dans l'interface bretonne
  (plan 06).
- Surveillance (disponibilité, expiration des domaines et des certificats) : Datadog, configuré par l'utilisateur dans un autre agent — ne
  pas y toucher ici.

## Breton et langues régionales

- [ ] **Relecture par un·e brittophone** (et un·e enseignant·e) de tout ce qui est marqué `// br: à relire` (`npm run i18n:relecture`,
  `/dev/relecture-breton`), organisée plus tard par l'utilisateur. En priorité : « pladenn » (disque), noms des domaines, cartes des
  familles d'affiches, mentions légales et « À propos », titres `grammaire*`, les textes nouveaux de la géométrie (cinq exercices,
  2026-10-13), les mots sans source des affiches de maternelle (pred-mintin, blas, stok, yarig, noms des solides…).
- [ ] **Confiance dans les traductions bretonnes** (socle fait le 2026-10-09 : `src/langues/confiance.ts`, `src/langues/br/confiance.ts`,
  réglage « Fiabilité des traductions », `useAffichable()`, `npm run confiance`, `docs/confiance-breton/`). Reste :
  - faire relire « korn skouer », « hirgarrezeg », « skript », « a-stag », les mutations des nombres, et les 8 ressources dont les mots sont
    attestés mais pas la syntaxe (`lexique-academie.md`) ; regarder les écarts avec l'académie (liesañ / lieskementiñ, hirgarrez / skouergorneg) ;
  - refaire l'évaluation avec le lexique de l'académie, puis évaluer les ressources encore à 0 (cachées par défaut) ;
  - décider du sort des exercices en ligne (« Faire l'exercice » n'est pas filtré, seules les fiches PDF le sont) ; pastille aussi sur la
    page d'une fiche ;
  - **tagger par texte** (idée du 2026-10-09) : noter chaque clé bretonne (niveau, relecteur, date), enregistrer au build les clés lues par
    chaque fiche, et en déduire le niveau de la fiche (minimum de ses clés) ; les niveaux par ressource deviennent un repli.
- [ ] **Enregistrements audio pour les textes fixes** : nom et son des lettres, consignes de maternelle, nombres 0-20, jours et mois bretons
  (une vraie voix bretonne pour les textes vérifiés) ; Opus ~1,5 Mo servis par le site ; voix humaine en CC BY ou CC0 (OPAB, Diwan) ou
  Piper (vérifier chaque modèle). À trancher : garder le curseur de vitesse propre à la Dictée ?
- Décision (2026-10-10) : la grammaire reste en français seulement (exercices et affiches), pas de version bretonne pour l'instant.

## Mode enseignant et interface

- [ ] **Mode enseignant** (caché par défaut, `?enseignant=oui` ; pastille « bêta » et `BandeauConstruction` faits). Idées restantes, à
  choisir : une phrase sur « À propos » et dans « Nouveautés » (ce qui est validé, ce qui ne l'est pas) ; un lien « Donner un avis » sur
  toutes ses pages ; marquer chaque contenu pour enseignants « non relu » (plan 07) ; activer le mode par site (skoolik d'abord) ; un lien
  d'activation pour des enseignant·es testeurs, avec une page courte ; retirer le bandeau quand le mode est validé.
- [ ] Accueil enseignant : « Préparez vos classes » est prétentieux (enlever titre et sous-titre ?) ; « 🔗 Copier le lien pour les
  familles » prend trop de place, à repenser.
- [ ] **Options « Sur la fiche » et police** : les cinq options ne tiennent pas sur une ligne ; le lien « Utiliser Belle Allure, Écolier ou
  une autre police… » ne sait pas si la police est installée ; un sélecteur de police standard, avec les nôtres en favoris. Les polices
  locales non redistribuables (Belle Allure, Écolier : usage local seulement, `polices-locales/`) ne sont jamais embarquées : à dire dans
  l'interface.
- [ ] Page programme : les mêmes icônes que `/imprimer` pour « À afficher » et « Pour s'entraîner ».
- [ ] **Formulaire des fiches, suite** (après la mise en page en deux colonnes et le formulaire plus lisible du 2026-10-16) : une vraie case
  à cocher pour les réglages oui / non (« Afficher les minutes », « Prénom et date », « Mention des pictogrammes ») ; un titre propre au
  mode impression (« Que veux-tu trier ? » parle à l'enfant ; la description « L'élève entend le mot et le tape » de la dictée) ;
  « Présentation de la fiche » repliable ; l'aperçu page par page (« Corrigé sur une autre page » s'affiche aujourd'hui sous les
  exercices), fiche et corrigé côte à côte sur un très grand écran ; une barre « Voir l'aperçu ↓ / Imprimer » sur écran moyen ; la même
  mise en page pour les affiches (`FormulaireAffiche.vue`) ; les rangées de boutons faites main dans les vues (« Pages de la fiche » de la
  dictée, « Aide » de l'heure…) n'ont pas le nouveau style des choix multiples (`ChoixReglage`) : les y faire passer.

## Images et iconographie

- [ ] **Guide d'iconographie** (`brouillons/iconographie/`, hors git : `GUIDE.md`, `ETAPES.md`). Fait : licence, métadonnées des PDF, socle
  `src/images/`, icônes d'interface, pictogrammes ARASAAC des consignes. Reste : migration par rôle (domaines et retours, objets d'exercice au
  fil des reports, décoration), page Crédits, migrer l'alphabet et la météo vers OpenMoji ; pictogrammes écartés à chercher le jour où une
  fiche en a besoin (« barre », « souligne »). **À faire valider** : la relecture juridique (une fiche = collection d'images séparées,
  `LICENCE-FICHES.md`) et les droits sur les commits écrits sous l'adresse d'entreprise.
- [ ] **Affiche « Mon corps »** : dessiner nos propres parties du corps au style OpenMoji (le dos, les doigts, les articulations en GS), et
  peut-être une fiche « puzzle du corps » à découper (BO p. 31).
- [ ] Affiches de maternelle, choix laissés : la plante du cycle de vie (un seul type ?) ; « le soir » est encore une scène carrée.

## Affiches et fiches

- [ ] **« Ce que je sais faire »** : affiches retirées du dépôt (gardées dans `brouillons/ce-que-je-sais-faire/`, ≈ 300 phrases à relire) ;
  à reporter dans `src/affiches/` si on les publie après l'avis d'enseignants.
- [ ] **Affiches en police attachée** : adapter l'horloge, pièces et billets, figures (textes qui se chevauchent ou débordent) en mesurant
  les textes (`largeurTexte`, `metriquesPolice`, `hauteurRendue`), puis les ajouter à `attacheePermise`.
- [ ] **Test « rien ne se chevauche »** : `tests/affiches.test.mjs` voit ce qui sort de la feuille, pas deux blocs l'un sur l'autre ; tester
  aussi en police attachée et les fiches d'exercices (A4/A3, portrait/paysage).
- [ ] **Nouvelles affiches à proposer** (à valider) : nombres de 1 à 10 (constellations, doigts) ; nombres en lettres jusqu'à 50 (CP),
  doubles et moitiés, compléments à 10 / à la dizaine, diagramme en barres / tableau à double entrée, classes de mots ; CM1-CM2 : fractions
  et décimaux, unités de mesure, fonctions (sujet, COD, COI, attribut, compléments), préfixes, suffixes et familles de mots.
- [ ] Liens vers le programme officiel aussi sur les pages matières et les cartes d'activités.

## Exercices et programme

- [ ] **Couverture** : CP-CE2 → plan `10-couverture-elementaire.md` ; maternelle → plan 14 ; CM1-CM2 : pas encore de plan (plan 09).
- [ ] **Ceintures de compétences** (demande du 2026-10-12) : paliers de couleur validés par un brevet, portée configurable, seuils réglables,
  suivi sur l'appareil + export/import. `plans/15-ceintures.md`, maquettes `brouillons/ceintures/maquettes.html`.
  - [ ] Plus tard (2026-10-13) : voir si les ceintures deviennent un **onglet de l'exercice** qui évalue déjà la compétence (tables de
    multiplication…) plutôt que des activités à part : `plans/15-ceintures.md` §13.
  - [x] Décision (2026-10-13) : **pas de fiches toutes prêtes** pour les ceintures pour l'instant (aucune page `/telechargements/`, PDF ni
    sitemap) ; l'impression se fait depuis les pages des activités. Garde-fou : `tests/extensions.test.mjs`. À rouvrir si on veut les
    publier (`plans/15-ceintures.md` §18).
- [ ] **Écarts de programme connus** (les corriger change des fiches publiées : `--maj` justifié) : doubles et moitiés du CP hors des valeurs
  du programme ; Fractions CE2, dénominateurs 7, 9, 11 et 12 jamais tirés ; Mesures CE2, dm, tonne et périmètre absents ; fiches d'écriture
  « GS » avec l'attaché majuscule (plan 14).
- [ ] **Division posée** (CM1, CM2) : `calcul-pose` ne fait que l'addition, la soustraction et la multiplication.
- [ ] **Lettres** : cursive, son des lettres, confusions b/d, p/q ; fiche à refaire et ouverture à la MS (`plans/critique-lettres-2026-10-07.md`).
- [ ] Lecture : le mode « Lecture de textes » n'a aucune question (compréhension, CP et CE1 ; plan 10-couverture-elementaire).
- [ ] Consigne lue à voix haute : reste Ordonner.
- [x] **Motifs : des frises qu'on ne peut pas deviner** (demande du 2026-10-13) — fait : sur la fiche, les cases à continuer finissent
  la période ou le groupe (après A B AA BB AAA, trois cases) ; le trou de l'évolutif n'est plus en dernier ; test `motifs` ; le nombre de
  questions n'est plus proposé à l'impression (la fiche a toujours une page de frises).
- [ ] Grammaire (coupée en cinq le 2026-10-10) : tester le jeu à la main.
- [ ] Géométrie : l'avertissement rouge « Imprimer à 100 %… » est aussi sur la fiche imprimée — le passer en orange dans le formulaire et
  le retirer de la fiche, comme pour Mesures ? Le reste : `plans/16-geometrie.md`, § 2.
- [ ] À revoir à l'usage : Tables CE1 démarre avec les tables 2, 3, 4, 5 et 10 ; en PS, `nbQ` est gardé au changement de niveau ; Longueurs
  n'utilise pas `OrdonnerClics`.
- [ ] Relecture pédagogique par un·e enseignant·e (plan 07) : « fois plus » et fractions > 1 au CE2, formulation des divisions au CE2…

## Bugs et dette

- [ ] Mesures : la question « verres » ne sort qu'une fois par taille de verre, quelle que soit la bouteille (clé de dédoublonnage
  `cont-verres-${c}`) ; la corriger change certaines séries.
