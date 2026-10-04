# TODO

> Liste de travail interne : idées, bugs, décisions en attente. Rien ici n'est une promesse.
> Ce qui est fait part dans le CHANGELOG et l'historique git ; `src/data/programme.js` fait foi pour les niveaux.

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

- [ ] **Couverture complète PS, MS, GS, CP, CE1** : un plan par niveau (`plans/10-couverture-<niveau>.md`) à partir de `npm run couverture` ; la PS n'existe pas encore dans `programme.js` ni dans le site

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
