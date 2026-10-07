# Plan 10 — Méthode qualité : exercices, niveaux, programme, langues

**But** : beaucoup d'exercices, pour des niveaux différents, qui découlent d'un programme officiel (national et,
demain, ceux des langues régionales), et qui restent cohérents et de bonne qualité dans plusieurs langues.

Ce plan s'appuie sur 4 audits en lecture seule menés le 2026-10-05 : architecture des exercices, langues,
chaîne programme → catalogue → build, outillage. Leurs constats chiffrés sont résumés ci-dessous.

## Diagnostic (résumé des audits)

1. **Le programme n'est pas la source unique.**
   - Aucune vue ne lit `programme.js`. Les bornes sont recopiées dans chaque vue, puis vérifiées après coup par
     des tests Chrome qui lisent le texte des fiches avec des regex.
   - Les niveaux sont déclarés à **8 endroits**, sous trois formes : tableau, texte « CE1 · CE2 » relu par
     6 parseurs, regex sur les boutons.
   - Les compétences sont rattachées à la main dans 7 tables. 35 des 107 compétences ne sont citées nulle part.
   - Écarts réels :
     - doubles et moitiés du calcul mental en CE1 ;
     - heure absente au CP ;
     - calcul posé sans fiche CE2 ni CM2 ;
     - le test des listes de compétences saute des cas.
2. **Les générateurs sont enfermés dans les vues.**
   - 24 vues, 16 000 lignes ; Grammaire seule en fait 1 607.
   - Le jeu, la fiche HTML et son CSS sont recopiés 24 fois, avec des dérives : Arial au lieu d'Andika,
     confettis dans un `computed`, clés de messages différentes.
   - Le hasard n'a pas de graine dans l'app (87 `Math.random`).
   - Les PDF d'exercices sont produits **en cliquant sur l'interface dans Chrome**. Pour le breton, le build
     rejoue des positions de boutons relevées sur la page française.
3. **Les langues sont codées en dur.**
   - 9 mécanismes de traduction coexistent, dont 6 redondants.
   - 94 `'br'` en dur dans 31 fichiers, et 53 fichiers importent `i18n/br/…`.
   - La langue régionale est liée à la langue de l'interface. La « langue du contenu » n'existe que de nom.
   - Une langue régionale n'est qu'un sac de listes : pas de programme, pas d'activités, pas de site.
   - La relecture n'a ni statut par texte, ni retour automatique.
4. **Aucun garde-fou automatique.**
   - Pas de linter et pas de CI de tests. ESLint en mode correction trouve 32 erreurs réelles.
   - Le runner de tests peut rater un échec : aucun `exit(1)`, et il cherche un « ✗ » dans un flux découpé.
   - 30 `waitForTimeout` fixes.
   - Pas de reprise sur un chunk périmé après un déploiement, ce qui peut donner une page blanche.
   - Du code mort, par exemple `ComingSoonView`.

**À garder** :
- `classes.js` ;
- `programme.js` avec ses sources ;
- `couverture.js` ;
- le contrat `.entete` / `section.corrige` ;
- `ConfigExercice` et `useOptionsFiche` ;
- `regles()` et `Intl.PluralRules` ;
- le noyau i18n sans dépendance, lisible en node ;
- `?preset=` et `?graine` ;
- `mulberry32` (`calcul.js`) ;
- **`utils/motifs.js` + MotifsView**, le meilleur modèle actuel : générateur pur, niveaux sourcés, testé en
  node ;
- le test « rien ne dépasse » et les tests de programme par classe.

## La méthode : 5 principes

1. **Une activité se déclare, tout le reste en découle.** Chaque exercice a une *définition* qui contient, par
   niveau, les compétences de `programme.js` qu'il couvre, les réglages qui les produisent, et ce qui est
   « bonus » ou « hors programme ». On en dérive les boutons de niveau, les fiches prégénérées, le catalogue, la couverture et les
   tests. On ne déclare plus de niveau ailleurs.
   **On peut dévier du programme, mais toujours explicitement.** Une option hors programme est permise si elle est
   déclarée (`bonus`, ou `horsProgramme` avec une raison), jamais cochée par défaut, et visible comme telle ; les
   tests la tolèrent parce qu'elle est déclarée. Au départ, **priorité à la couverture** : remplir les 35
   compétences sans activité et les niveaux manquants (CP, CM1-CM2), suivi par `couverture.js` (objectif chiffré,
   qui ne peut que monter).
2. **Logique pure, vue mince.**
   - Générateur et fiche sont des fonctions pures, importables en node, testées en millisecondes :
     `(réglages, rng, T) → questions` puis `questions → fiche`.
   - La vue ne fait que le rendu d'une question.
   - Le jeu (score, retour, fin, timers) et le gabarit de fiche sont communs.
3. **Le hasard a toujours une graine.** Un seul `utils/hasard.js` (`mulberry32`). La graine vient de `?graine=`
   ou est tirée puis gardée. Même graine, même fiche, dans l'app comme au build.
4. **Aucune langue en dur.**
   - Une langue est un dossier qui se déclare : interface, contenu, règles, données sourcées, voix, programme
     propre, activités propres, site.
   - Trois notions distinctes : langue de l'**interface**, langue du **contenu** (fonction de l'activité : `fr`
     pour le français, sinon l'interface) et langues **régionales actives**.
   - Hors du dossier des langues, aucun code de langue n'est écrit en dur.
5. **Les règles sont vérifiées par des machines, pas par la mémoire.** CI sur chaque push. Lint de
   correction. Compteurs qui ne peuvent que baisser : `'br'` en dur, niveaux en texte, vues de plus de
   600 lignes. Tests de contraintes sur les réglages, avant même le rendu.

## Modèle cible

```
src/exercices/<id>/
  definition.js   { id, route, domaine, niveaux: { cp: { reglages, competences, bonus? }, … },
                    fiches: [{ id, competence, reglages }], contenu: 'fr' | 'interface' }
  generateur.js   pur : questions({ niveau, reglages, rng, T, R }) → [{ enonce, attendu, verifier, corrige }]
  fiche.js        pur : fiche({ questions, T }) → { titre, consigne, corps, corrige, css }
  Vue.vue         rendu d'une question ; s'appuie sur useJeu() et <ResultatsJeu>
src/exercices/index.js   registre (import.meta.glob + équivalent node pour le build)
src/impression/document.js   documentFiche() : police, en-tête, section.corrige, CSS de base communs

src/langues/<code>/
  index.js        { code, bcp47, nom, interface, contenu, regles, donnees, voix, programme?, activites?, site? }
  ui/…  contenu/…  regles.js  donnees.js (sources)  programme.js (même format que le national)
```

- **Niveaux** : la définition donne les réglages, et le test vérifie `bornes(reglages) ≤ contraintesDe(niveau)`.
  Les réglages ne sont pas encore *calculés* depuis `CONTRAINTES` : on garde un choix pédagogique explicite,
  mais il est vérifié par machine.
- **Build** : les fiches d'exercices sont produites par `fiche(generateur(reglages, rng(graine)))`, sans clic,
  dans toutes les langues de contenu. Chrome ne sert plus qu'à convertir le HTML en PDF et en image.
- **Pages statiques** : rendues avec les composants Vue en SSR (`renderToString` via `ssrLoadModule`), ce qui
  réutilise `AppNav`, l'i18n et les styles. Le script de build est découpé en modules : pdf, pages, sitemap,
  images.
- **Programme régional** : même format que `programme.js` (SOURCES, DOMAINES, COMPETENCES, CONTRAINTES). Il est
  fusionné avec des ids préfixés (`br:mutations`). Les domaines ont `matiere: 'langue-regionale'`.

## Bibliothèques

| Choix | Décision |
|---|---|
| ESLint + eslint-plugin-vue, règles de **correction** seulement | **oui** (phase 0) |
| Prettier, formateur global | non : le style dense est assumé, et cela casserait `git blame` (236 fichiers touchés) |
| CI GitHub Actions (Node 22) | **oui** (phase 0) |
| `node:test` pour l'unitaire | **oui** ; Vitest seulement si on teste un jour des `.vue` |
| @playwright/test à la place du runner maison | **oui** (phase 5) : attentes automatiques, parallélisme, traces |
| TypeScript pour tout module nouveau (`src/noyau/`, programme, hasard, réponses, document) ; JSDoc dans le JS existant | **oui** (décision du 2026-10-05) ; `checkJs` reste désactivé : le JS n'est pas vérifié |
| Vue SSR pour les pages `/telechargements` | **oui** (phase 4) |
| Fluent (`@fluent/bundle`) + Weblate pour la relecture | **plus tard** (phase 3b), après la structure ; Weblate demande un compte (décision de l'utilisateur) |
| **VueUse** (`@vueuse/core`, tree-shaké) : `useLocalStorage(…, { mergeDefaults })` à la place de chargerReglages + watch + sauvegarder (20 vues), `useTimeoutFn` (timers nettoyés), `useEventListener` | **non** (évalué en phase 1, voir ci-dessous) |
| Pinia, seedrandom, composants headless, Paged.js, vite-ssg, vue-i18n, i18next | non : pas de besoin réel, ou contraire à l'esprit du projet |

## Phases

**Phase 0 — garde-fous** (≈ 1 jour, sans changer le comportement) — ✅ **fait le 2026-10-05** (non commité) :
- [x] CI GitHub Actions (`.github/workflows/tests.yml`) : `npm ci`, `lint`, `qualite`, `npm test`, en Node 22 ;
  `deploy.yml` passé en Node 22.
- [x] Runner : chaque fichier finit par `process.exit(nbEchecs() ? 1 : 0)`, et `lancer.mjs` ne lit que les codes
  de sortie.
- [x] ESLint de correction (`eslint.config.js`), bloquant en CI ; 26 erreurs corrigées (+ `multi-word-component-names`
  désactivée : règle de nommage).
- [x] `vite:preloadError` et `router.onError` qui rechargent la page (une fois par minute), `errorHandler` minimal.
- [x] Code mort supprimé : `ComingSoonView` et ses catalogues, `ELEMENTAIRE` ; `echapper` dans `utils/html.js`
  (module pur), importé partout.
- [x] Libellés accessibles des 5 boutons sans nom (HeureView, FormesView), fr + br.
- [x] `npm run qualite` (`scripts/qualite.mjs`, seuils dans `scripts/qualite-seuils.json`). Chiffres de départ :

  | compteur | départ | sens |
  |---|---|---|
  | `'br'` en dur (src + scripts, hors `i18n/` et `languesRegionales.js`) | 101 | max |
  | fichiers qui importent `i18n/br/` (hors `i18n/`) | 52 | max |
  | niveaux écrits en texte (« CE1 · CE2 », « ^CP → CM2$ ») | 55 | max |
  | vues de plus de 600 lignes | 10 | max |
  | `Math.random` dans `src/views/` | 88 | max |
  | `waitForTimeout` dans `tests/` | 26 | max |
  | couverture du programme (compétence × classe avec une ressource) | 53,2 % (191 / 359) | min |

**Phase 1 — socle exercice** (≈ 1 jour) — ✅ **fait le 2026-10-05** (non commité) :
- [x] `src/utils/hasard.js` (`mulberry32`, `creerRng(graine | source)` → `rng()`, `entier`, `choisir`, `melanger`, `vrai` ;
  `graineAleatoire`), `// @ts-check`. Mêmes tirages que `aleatoire` / `melanger` / `pioche` : un générateur migré
  rejoue exactement le même flux.
- [x] `src/impression/document.js` : `documentFiche({ titre, langue, corps, css, h1, police, cssPolices, largeur, marge })`
  et `ligneNomDate(langue)` (pure, sans Vue ; à terme `useOptionsFiche` la réexportera).
- [x] `src/composables/useJeu.js` (phase, questions, score, historique, retour ; `repondre`, `passer`, `suivante`,
  `recommencer`, `quitter` ; message de fin et confettis dans un `watch`, minuteur arrêté au démontage) et
  `src/components/ResultatsJeu.vue` (score, message, slot de correction, rejouer, réglages).
- [x] `src/composables/useGraine.js` : graine de `?graine=` (avant ou après le `#`), sinon tirée et gardée ;
  « 🎲 Nouvelle fiche » en tire une autre.
- [x] Registre `src/exercices/index.js` (imports statiques : app, node, tests), format documenté dans
  `src/exercices/README.md` et en JSDoc (`DefinitionExercice`) ; `src/exercices/outils.js` (`reglagesDuNiveau`,
  `toutAuProgramme`, `estBonus`).
- [x] Pilote **Heure** : `src/exercices/heure/` (`definition`, `generateur`, `fiche`, `horloge`, `textes`), niveau **CP**
  ajouté (heures entières, aiguilles ≤ 12 h). `activites.js` et `impression/exercices.js` lisent la définition (niveaux,
  compétences, classes de la fiche « durées ») ; fiche CP prégénérée (`exercices-heure-cp`, fr et br).
  **HeureView : 1 104 → 562 lignes** (plus de `Math.random`, plus d'import `i18n/br/`, plus de `'br'` en dur).
- [x] `tests/exercices.test.mjs` (node, ~1,5 s, sans Chrome) : définition, compétences au programme du niveau, questions
  et fiches dans `contraintesDe(niveau)` (5 graines × défauts / toutes options au programme / fiches par compétence ×
  fr, br), `.entete`, `section.corrige`, même graine → même fiche. Cas CP ajouté à `programme-maths`.
- [x] Garde-fou HTML : 40 fiches (CE1, CE2, 4 graines, 5 combinaisons de réglages, fr et br) capturées avant et après :
  **corps identique** dans les 40 cas. Seul écart : `h1` 1,25 → 1,3 rem (CSS de base commun), regardé en image.

Décisions de la phase 1 :
- **VueUse : non.** `useLocalStorage(…, { mergeDefaults })` fusionne sans vérifier les types : il faudrait un
  `serializer` qui refait `chargerReglages`, donc pas de code en moins ; `useTimeoutFn` n'économise que 2 lignes dans
  `useJeu` (le minuteur y est déjà nettoyé). Pas de dépendance pour si peu.
- **Police : Arial par défaut, pour l'instant.** `documentFiche` a une option `police` (`POLICE_SCOLAIRE` = Andika) et
  `cssPolices` (les `@font-face`, fournis par l'appelant : `cssPolices()` lit `window`). Passer toutes les fiches en
  Andika les changerait toutes : **décision de l'utilisateur**, à prendre une fois, pour tous les exercices migrés.
- **Graine et fiches publiées** : `rngFiche()` (useGraine) garde un flux par graine, qui continue quand on change un
  réglage, comme le `Math.random` à graine du build. C'est ce qui garde les fiches prégénérées identiques (le build
  clique le niveau après un premier rendu). Même graine + mêmes clics → même fiche. Quand le build appellera
  `fiche(questionsFiche(…, creerRng(graine)))` directement (phase 4), on pourra passer à « une graine = une fiche »
  (un flux neuf par rendu), au prix d'un changement des fiches publiées des niveaux non par défaut.
- Le jeu tire sa propre graine à chaque partie (`creerRng(graineAleatoire())`) : la graine de la page sert aux fiches.
- `ResultatsJeu` lit les textes du catalogue commun (`resultat100`…, `rejouer`, `parametres`, nouveau `scoreSur`),
  partagés avec les vues non migrées : pas de catalogue propre (il aurait dupliqué ces textes et ajouté un import
  `i18n/br/`).

Reste pour la phase 2 (à ajouter au socle au fil des migrations) :
- ~~réglages à choix~~, ~~`ligneNomDate` unique~~, ~~barre de progression~~, ~~`T` hors Vite~~ : faits en phase 2a ;
- `useJeu` : un mode « une seule tentative sans correction » (maternelle) à prévoir ;
- les fiches par compétence de la définition ne sont pas encore lues par le build (toujours `impression/exercices.js`
  et ses clics) : phase 4 ;
- `couverture.js` ne lit pas encore les définitions.

**Phase 2 — migration des exercices** (ordre décidé le 2026-10-05) :
- 2a : socle complété + **Monnaie** (en cours) ;
- garde-fou des migrations ✅ (2026-10-05) : **instantanés de fiches** en node (`tests/instantanes.test.mjs`,
  `tests/instantanes/<id>.json` : sha1 du HTML normalisé par niveau × graine × langue × réglages, `--diff`, `--maj` ;
  ~0,5 s, dans `npm test`) et capture partagée des vues pas encore migrées au même format
  (`scripts/capturer-fiches.mjs` : 60 fiches Heure en ~5 s, contre ~56 s pour un script jetable à clics et attentes
  fixes ; les 60 empreintes Chrome = celles de node). Heure enregistré ; Monnaie : `--maj monnaie` une fois fini ;
- 2b ✅ : un exercice **de nature différente** pour éprouver le socle — **Conjugaison** (contenu toujours `fr`, saisie
  texte avec tolérance accents/majuscules, données partagées `src/data/conjugaison.js`, niveaux CP→CM2) ;
  **Phase 2b — résultat** (2026-10-05, non commité) :
  - `src/exercices/conjugaison/` (`definition`, `generateur`, `fiche`, `textes`) ; **ConjugaisonView : 439 → 221 lignes**.
    Niveaux CP → CM2 conformes à `CONTRAINTES.conjugaison` (temps, groupes, 8 irréguliers), vérifiés en node
    (`ecartsAuProgramme` et `ecartsFiche` sur `data-verbe` / `data-temps`). `activites.js` et `impression/exercices.js`
    lisent la définition (catalogue et `EXERCICES` identiques avant/après, comparés en JSON).
  - Garde-fou : 258 fiches capturées avant (5 niveaux × 3 graines × fr/br × 8-9 cas : défauts, complet, choix de verbes et
    de temps en lacunes et en complet, chaque fiche par temps) : **258/258 identiques** à police égale (Arial) ; seul écart
    voulu : Andika (font-family du body), regardé en image. `tests/instantanes/conjugaison.json` (84 cas) est la référence ;
    la vue dans Chrome redonne les 84 empreintes, en fr et en br (contenu toujours fr).
  - `src/utils/reponses.js` (pur, `tests/reponses.test.mjs`) : `normaliserSaisie` (casse, espaces dont insécables,
    apostrophes ’ ‘ ʼ ´ `, tirets, NFC), `sansAccents` (+ œ, æ), `comparerReponse(saisie, attendus) → 'juste' | 'accents' | 'faux'`.
  - Compteurs `qualite` inchangés : l'ancienne vue n'avait ni `Math.random` (elle passait par `aleatoire`), ni `'br'`, ni
    plus de 600 lignes ; son import `i18n/br/` est passé dans `textes.js` (comme Monnaie).
  - **Décisions à confirmer (utilisateur)** :
    - accents oubliés comptés **justes** avec la remarque « Presque ! Attention aux accents » et la bonne graphie dans le
      champ (clavier d'enfant). Revers : « j'ai chante » est accepté pour « chanté » (participe passé / présent) ;
      → **décidé (2026-10-05)** : accents oubliés comptés **faux**, avec l'avertissement et la bonne graphie (fait en 2c) ;
    - au CP, le mode « lacunes » (défaut) fait écrire la fin de « je sui… », « il es… » : c'est du radical / terminaison,
      compétence du CE1. Garder, ou mettre le CP en « complet » par défaut (les fiches CP changeraient) ?
      → **décidé (2026-10-05)** : CP en « complet » par défaut, « lacunes » en bonus (fait en 2c) ;
    - le jeu valide les lignes **dans l'ordre** (avant : n'importe quelle ligne, Tab pour sauter) ; message de fin commun
      (seuils 100/80/60/40 au lieu de 100/80/50) ; boutons de verbes au style `level-btn`.

  **Notes pour 2c — ce que Conjugaison a dû réinventer, ou que le socle impose à tort** :
  1. **Question à plusieurs champs** (un tableau de 6 lignes) : `useJeu` ne connaît qu'une question à la fois. Contourné :
     une question par ligne, la vue dessine tout le tableau, « Valider » boucle sur `repondre` + `suivante`. Manque un
     mode « série » (plusieurs réponses saisies, validées ensemble ou ligne à ligne). Servira à Grammaire (accords),
     Calcul posé et Tables.
  2. **Enchaînement** : `useJeu` attend « Suivant » après une erreur et ne passe seul qu'après une bonne réponse. Ici, on
     continue aussitôt dans les deux cas (appel manuel de `suivante`), sauf à la dernière ligne (bouton « Voir les
     résultats »). Option à prévoir : `apresErreur: 'attendre' | 'continuer'`.
  3. **Retour « presque juste »** : `verifier` rend un booléen. Il faut un 2e appel (`jugement`) et ranger le verdict dans
     l'historique ; le message « bravo » de `useJeu` ne sert pas. Proposition : `verifier` peut rendre
     `{ ok, nuance }`, que `useJeu` range et que `QuestionJeu` / `ResultatsJeu` affichent (couleur orange commune).
  4. **Saisie de texte** : comparaison (fait : `utils/reponses.js`), mais aussi le champ (autocomplete, spellcheck,
     autocapitalize off, Entrée, focus au `nextTick` via des refs), recopié dans Monnaie et ici. → composant
     `<SaisieReponse>` ou `useSaisie`. Dictée, Orthographe, Vocabulaire en auront besoin.
  5. **Langue de contenu imposée** : la vue recalcule `langueContenu` à la main (même ligne que Monnaie). Pas de catalogue
     de contenu séparé : le catalogue d'interface français sert de contenu, et les clés bretonnes `ficheLacunes`,
     `ficheComplet` sont mortes mais exigées par `npm run i18n` (parité fr/br). → `useTextesExercice(DEFINITION, …)` qui
     rend `t`, `T` et `langueContenu`, et un catalogue « fr seulement » reconnu par `npm run i18n`.
  6. **Réglage à choix présenté en cartes** (icône + description : mode lacunes / complet) : `ChoixReglage` ne fait que des
     boutons, la vue garde ses cartes. Ajouté au socle : slot `#valeur` (libellé enrichi : verbe + groupe) et
     `data-reglage` / `data-valeur` (tests sans regex sur les libellés). Reste : une variante `cartes`.
  7. **Réglages mémorisés + changement de niveau** : `chargerReglages` + `reglagesDuNiveau` + `sauvegarder` + `watch` du
     niveau, réécrits dans chaque vue, avec deux politiques (Monnaie garde l'intersection, Conjugaison recoche tout).
     → `useReglages(DEFINITION, cle, { niveau: 'garder' | 'defauts' })`.
  8. **`nb` imposé** : `questions({ nb })` n'a pas de sens ici (6 lignes, fixées par les données) ; le test passe `nb: 10`.
     À rendre facultatif dans le format.
  9. **Instantanés** : `casDe` ne prend que défauts / tout / fiches ; un réglage à choix unique non défaut (mode
     « complet ») n'a pas d'empreinte node (vérifié ici par la capture). → ajouter ses valeurs comme
     `tests/exercices.test.mjs` le fait déjà.
  10. **Tests Chrome redondants** : la partie Conjugaison de `programme-francais.test.mjs` est maintenant couverte en node
      (`ecartsFiche`) ; à retirer en phase 5. Ses sélecteurs lisent désormais `data-valeur`.
  11. **Compteurs** : aucun ne mesure l'avancement de la migration (cette vue n'en bougeait aucun). → compteur « vues hors
      registre » (ou « vues qui importent `utils` aleatoire / melanger »), qui ne peut que baisser.
- 2c : **passe « qu'est-ce qui devrait être commun »** : comparer Heure, Monnaie, Conjugaison et balayer les vues
  restantes (saisie, QCM, tableau de correction, minuteur, consigne parlée, mode maternelle « une tentative »,
  réglages) ; extraire ce qui sert à ≥ 3 exercices ; mettre à jour la checklist ;

  **Phase 2c — résultat** (2026-10-05, non commité) :

  *Motifs × vues* (19 vues restantes balayées + les 3 migrées ; ✓ = présent ; « commun » = ≥ 3 exercices) :

  | motif | vues (restantes) | + migrées | total | commun ? |
  |---|---|---|---|---|
  | QCM par boutons | Comparer, Formes, Longueurs, Motifs, Compter, Lettres, Vocabulaire, Orthographe, Grammaire, Problèmes, Numération, Fractions, Géométrie | Heure | 14 | **extrait** : `<ChoixReponses>` |
  | saisie de nombre | Problèmes, Tables, Fractions, Mesures, Numération, Calcul posé, Calcul mental | Heure, Monnaie | 9 | **extrait** : `<SaisieReponse type="nombre">` |
  | saisie de texte (tolérance accents) | Orthographe, Grammaire, Dictée | Conjugaison | 4 | **extrait** : `<SaisieReponse type="texte">` + `verdictSaisie` |
  | série (plusieurs réponses par écran) | Numération (C/D/U), Calcul posé (chiffres d'une opération : une seule question) | Conjugaison | 2-3 | **extrait** (demandé) : `useJeu({ serie })` |
  | ordonner par clics successifs (pas de glisser) | Ordonner, Longueurs, Vocabulaire, Grammaire, Numération | — | 5 | commun, **non extrait** (aucun exercice migré pour l'éprouver) : voir lots |
  | cliquer une forme / une case | Longueurs, Formes, Fractions, Géométrie | (Heure : glisser les aiguilles) | 4 | non : 4 mécaniques différentes (crayons, formes, parts, cases) |
  | construire (palette) | — | Monnaie | 1 | non |
  | minuteur | Tables (chrono 60 s), Calcul mental (temps par question) | — | 2 | non (candidat, même lot) |
  | consigne lue (`ConsigneParlee`, `useTTS`) | 5 maternelles ; Dictée, Grammaire, Vocabulaire, Problèmes (+ Lecture) | Heure | 10 | **existe déjà** (`ConsigneParlee`, `useTTS`) : rien à extraire |
  | mode maternelle (une tentative, suite seule, pas d'écrit) | les 7 maternelles | — | 7 | **extrait** : `useJeu({ apresErreur: 'continuer', delaiErreur })` ; fin « étoiles » : décision |
  | cartes de choix (`.mode-card`) | Formes, Lettres, Dictée, Tables (+ Lecture) | Conjugaison | 6 | **extrait** : `<ChoixReglage cartes>` |
  | tableau de correction | Vocabulaire, Grammaire, Dictée, Problèmes, Fractions, Mesures, Numération, Calcul posé, Géométrie (+ 2) | Heure, Monnaie | 13 | **extrait** : `<TableauCorrection>` |
  | réglages mémorisés + changement de niveau | 8 vues « garder l'intersection », Orthographe et Dictée « remettre les défauts », Fractions mixte | les 3 | 14 | **extrait** : `useReglages` (une politique) |
  | nombre de questions validé | toutes (`NB_JOUER`, `NB_FICHE`, `[5,10,15]`) | Heure, Monnaie | ~18 | **extrait** : `options` communes de la définition |
  | langue du contenu | fr imposé : 4 français (+ Lecture) ; contenu fr/br : Problèmes, Fractions, Mesures, Numération, Géométrie, Formes, Compter ; Lettres : alphabet de la langue | les 3 | 22 | **extrait** : `langueContenuDe` / `useReglages().langueContenu` |
  | fiche (mode, graine, police, tirage) | toutes (`htmlFiche` local, CSS recopié) | les 3 (recopié 3 fois) | 22 | **extrait** : `useFicheExercice` |
  | dessin : droite graduée | Fractions, Numération | (affiche `droite.js`) | 3 | commun, **non extrait** : voir lots (lot B) |
  | dessin : règle, balance, broc | Mesures | — | 1 | non |
  | dessin : quadrillage, figures, solides | Géométrie | (affiche `formes.js`) | 2 | non (candidat lot B) |
  | dessin : formes simples (disque, carré…) | Formes | (affiche `formes.js`) | 2 | non |
  | données partagées | `utils/nombres.js` (Numération ↔ impression/nombres, affiches) ; `utils/motifs.js` (Motifs) ; `data/dicteeMots.js` (Dictée) ; `languesRegionales.js` (Lettres) ; `contenu/*.js` fr/br | `data/conjugaison.js` | — | rien à extraire : déjà des modules |

  *Extrait dans le socle* (et appliqué aux 3 exercices migrés) :
  - `verifier(q, rep)` → booléen **ou** `{ ok, nuance }` ; `lireVerdict` (`outils.js`) lit les deux ; `useJeu` range `nuance`
    dans `retour` et l'historique, et expose `etat` / `etatDe(entrée)` : `'' | 'ok' | 'presque' | 'erreur'` (classes
    communes `.exercise-input`, `.feedback`, `.prog-dot`, `.correction-table tr` ; `presque` = orange) ; option
    `messageNuance(q, nuance)`.
  - `verdictSaisie(saisie, attendus, { accents: 'refuser' | 'accepter' })` (`utils/reponses.js`) : `'accents'` → `ok: false`
    par défaut (décision du 2026-10-05), `nuance: 'accents'`.
  - `useJeu` : `generer(rng)` (la graine du jeu est tirée par `useJeu`) ; `serie: true | q => clé` (plusieurs questions sur
    un écran, `jeu.ecran`, une réponse passe aussitôt à la ligne suivante) ; `apresErreur: 'attendre' | 'continuer'` et
    `delaiErreur` (enchaîner sans bouton).
  - `<SaisieReponse>` : `type` nombre / decimal / texte (clavier numérique ou décimal sur mobile), pas d'autocomplétion ni de
    correcteur ni de majuscule auto, Entrée → `@entree`, `focus` (au montage et quand le champ redevient actif), `etat`.
  - `<ChoixReponses>` : grille de propositions, bonne / choisie / grisées après la réponse ; variante `images` (dessins).
  - `<TableauCorrection :historique>` : question / ta réponse / bonne réponse / ✅❌, slots `#question` et `#attendu` ;
    `colQuestion` passé au catalogue commun.
  - `useReglages(definition, cle)` → `{ config, langueContenu }` : `chargerReglages` + `reglagesDuNiveau` + sauvegarde +
    **une politique de changement de niveau** (`reglagesApresNiveau`, `outils.js`) : choix multiples → défauts du nouveau
    niveau ; choix unique gardé s'il est proposé **et au programme** (un bonus n'est jamais reporté) ; le reste gardé.
  - Définition : `options` communes (`nbQ: [5, 10, 15]`, `nbHorloges`, `saisie`) lues par `<ChoixReglage>` et validées par
    `reglagesDuNiveau` ; `nb` facultatif dans `questions()` ; `manquesAuProgramme(reglages, contraintes)` facultatif (tout
    le programme du niveau est-il proposé ?).
  - `<ChoixReglage cartes :icone :description>` (CSS des cartes dans le composant).
  - `useFicheExercice({ tirer, mettreEnPage })` → `{ mode, fiche, nouvelle }` (mode, graine, police, tirage séparé de la
    mise en page).
  - Tests : `jeuxDeReglages(definition, niveau, { horsProgramme })` (`outils.js`), partagé par `exercices.test` et les
    instantanés, qui couvrent maintenant chaque valeur non par défaut des choix uniques (bonus compris pour les
    instantanés) : 222 → 375 cas. Programme de Conjugaison : node seulement (`manquesAuProgramme` reprend « temps / groupes
    du programme absents ») ; en Chrome, un test de rendu (CP, CM2 : réglages de la définition, fiche affichée).
  - `npm run qualite` : compteur **`exercicesMigres`** (min, 3 / 22 : activités `fiche: true` sous /maths, /francais,
    /maternelle présentes dans le registre).
  - Vues : Heure 411 lignes, Monnaie 401, Conjugaison 168 (−193 lignes en tout).

  *Changements visibles* :
  - Conjugaison : accents oubliés comptés **faux**, ligne en orange « ⚠️ Attention aux accents : ai chanté » (décision) ;
    CP en mode « complet » par défaut, « lacunes » proposé en **bonus** au CP (décision) : les 6 fiches CP défaut / tout
    changent (`conjugaison/cp/*/defauts|tout` ; la fiche « lacunes » d'avant = le nouveau cas `mode=lacunes`, vérifié), et
    la fiche publiée `exercices-conjugaison-cp` changera au prochain build ; points de progression orange pour une ligne
    « accents » ; titre « Mode » au style des autres titres de réglage (#888 au lieu de #555).
  - Heure et Monnaie : changer de niveau remet les **exercices** aux défauts du nouveau niveau (avant : on gardait ceux qui
    existaient) ; Monnaie garde « centimes » s'il est au programme (comme avant) ; Heure valide aussi le nombre de questions
    mémorisé.
  - Champs : `autocomplete`, `autocorrect`, `autocapitalize`, `spellcheck` coupés partout (Heure n'en avait aucun).
  - Fiches de Heure et de Monnaie : **identiques** (aucune empreinte existante n'a changé).

  *Candidats non extraits* (moins de 3 exercices, ou pas encore d'exercice migré pour les éprouver) :
  - **ordonner par clics** (5 exercices, 3 lots) : à créer une fois, par le lot C avec Ordonner (le plus simple) ;
    Grammaire, Vocabulaire, Numération et Longueurs le reprennent ensuite (voir lots) ;
  - **droite graduée** (Fractions, Numération, affiche `droite.js`) : module de dessin pur partagé, par le lot B ;
  - minuteur (Tables, Calcul mental : même lot C) ; fin « étoiles » de la maternelle (décision) ; quadrillage / figures
    (Géométrie, affiche formes) ; boutons Passer / Valider / Suivant et zone de retour (Heure, Monnaie : 2, et une
    différence : Monnaie enchaîne aussitôt après « Passer ») ; CSS `.consigne` (Heure, Monnaie) ;
  - catalogue « fr seulement » reconnu par `npm run i18n` (note 5 de 2b : clés bretonnes mortes de Conjugaison) : 1 exercice.

  *Lots proposés pour 2d* (19 exercices, ~12 300 lignes ; du plus gros au plus petit dans chaque lot) :

  | lot | exercices (lignes) | total | motifs | dépendances |
  |---|---|---|---|---|
  | **A — français** | Grammaire (1 606), Vocabulaire (1 078), Dictée (551), Orthographe (513), Lettres (308) | ~4 060 | QCM, saisie texte (`verdictSaisie`), ordonner (Grammaire, Vocabulaire), clic sur des mots, 🔊 `useTTS`, cartes (Dictée, Lettres) ; contenu `fr` (sauf Lettres : alphabet de la langue) | corpus en dur → `i18n/fr/contenu/` ; `data/dicteeMots.js`, clé Mistral (Dictée) ; `languesRegionales.js` + polices (Lettres) ; **ordonner** : attendre le composant du lot C, ou migrer ces deux-là en dernier |
  | **B — maths, dessins** | Géométrie (1 217), Mesures (1 175), Numération (867), Fractions (844) | ~4 100 | QCM, saisie nombre, cliquer (cases, parts), série C/D/U (Numération), ordonner (Numération) ; contenu fr/br + `regles()` | **droite graduée** à créer (Fractions + Numération, affiche `droite.js`) ; `utils/nombres.js` (partagé avec `impression/nombres.js` et 3 affiches : instantanés des affiches à garder identiques) ; `contenu/{geometrie,mesures,fractions}.js` |
  | **C — calcul et maternelle** | Problèmes (664), Tables (568), Calcul mental (539), Calcul posé (530), Formes (500), Compter (347), Comparer (301), Ordonner (295), Motifs (202), Longueurs (199) | ~4 150 | saisie nombre, minuteur (Tables, Calcul mental), opération posée ; maternelle : une tentative (`apresErreur: 'continuer'`), `ConsigneParlee`, `useClasse`, cartes (Formes, Tables), ordonner (Ordonner, Longueurs) | commencer par **Ordonner** : crée le composant « ordonner » pour A et B ; `utils/motifs.js` (déjà pur, testé) ; `impression/calcul.js` et `affiches/tables.js` (pas d'import croisé aujourd'hui) ; `contenu/{problemes,formes,compter}.js` |

  Hors compte : Lecture (708 lignes, exercice avec niveaux, contenu `fr`) et Quiz culture générale (`/autres`) ne sont pas
  sous /maths, /francais, /maternelle : décision ci-dessous.

  *Décisions à prendre (utilisateur)* :
  - **politique de changement de niveau** retenue : « choix multiples → défauts du nouveau niveau, choix unique gardé s'il
    est au programme ». La plupart des vues restantes gardent l'intersection : elles changeront de comportement en 2d ;
  - **accents refusés** affichés en orange (« presque ») plutôt qu'en rouge, mais comptés faux : garder ? Option « accepter
    les réponses sans accents » : `verdictSaisie` la permet, aucun réglage n'est proposé (à ajouter si Dictée/Orthographe
    en ont besoin) ;
  - **maternelle** : garder la fin « étoiles » (resultat5/4/3/0) ou passer au message commun (resultat100…) ;
  - **exercices sans niveau** : Tables, Calcul posé, Lettres (et Ordonner en partie) : quels niveaux déclarer (le format
    exige `niveaux` + `competences`) ;
  - **Lecture** et **Quiz** : à migrer aussi (compteur 3 / 24), ou hors du plan ;
  - Monnaie « Passer » enchaîne aussitôt, Heure attend « Suivant » : unifier ?
- 2d : migration des exercices restants en parallèle (3 agents, par matière), avec la checklist.

  **Phase 2d — lot C (calcul et maternelle)** (2026-10-05, non commité) :

  | exercice | vue avant → après | fiches | niveaux déclarés |
  |---|---|---|---|
  | Ordonner | 295 → 82 | 84/84 identiques (corps et `<head>`, à police égale) | MS, GS (`bande-numerique`) ; sens / taille / nbQ en options communes |
  | Compter | 347 → 103 | 66/66 identiques | PS, MS, GS ; PS : réponse « entourer » seule (constellations), 5 questions par défaut |
  | Comparer | 301 → 133 | 54/54 identiques | PS, MS, GS |
  | Motifs | 202 → 81 | 72/72 identiques | PS, MS, GS ; `src/utils/motifs.js` inchangé (le générateur reçoit `rng` comme `alea`) |
  | Longueurs | 199 → 105 | 54/54 identiques | PS, MS, GS ; modes comparer / ranger |
  | Formes | 500 → 106 | 60/60 identiques | PS, MS, GS (un bouton par niveau, déjà le cas) ; modes de jeu par niveau (`options.mode`) |
  | Tables | 568 → 197 | `<body>` identique sur 66 cas ; `<head>` : règle `h1 { font-size: 1.25rem }` ajoutée après le h1 de base (1,3 rem) de `documentFiche`, donc empreintes recalculées | **CE1, CE2, CM1, CM2** déduits du programme (`tables-multiplication`) ; tables 1 à 10 au programme, 11 et 12 et « jusqu'à × 12 » en `bonus` ; sélection de départ CE1 : 2, 3, 4, 5 et 10 (avant : 2 à 9 pour tous) |
  | Problèmes, Calcul mental, Calcul posé | 664 → 130, 539 → 120, 530 → 208 | voir les en-têtes de leurs `definition.js` | Calcul posé : CP à CM2 (multiplication posée au CE2, CM1, CM2 ; division posée non proposée) ; Problèmes CE2 jusqu'à 10 000 (test ajouté) |

  *Composants et éléments du socle ajoutés* :
  - `OrdonnerClics.vue` (ranger par clics : indices cliqués dans `v-model`, cases de réponse, Annuler / Valider, slots
    `#element` / `#place`) : utilisé par Ordonner ; Longueurs ne l'utilise pas (on touche les crayons eux-mêmes, validation
    immédiate, rang affiché sur le crayon) : à confirmer pour Vocabulaire, Grammaire, Numération ;
  - `ResultatsEtoiles.vue` (fin « étoiles » de la maternelle ; textes `etoiles5…etoilesSur` dans `commun.js`) ; la maternelle
    passe par `useJeu({ apresErreur: 'continuer' })`, une seule tentative, pas de saisie texte ;
  - `ChoixReponses` : prop `grand` (une rangée de gros boutons) ; `useReglages(def, cle, { suivreClasse: true })` (la classe
    de la barre du haut devient le niveau, maternelle) ; `useMinuteur` (Calcul mental et Tables, par l'autre agent) ;
  - `ChoixReglage cartes` pour les modes de Formes et de Tables.

  *Écarts de programme* : Tables n'avait pas de niveau (déduits, voir tableau) ; Formes avait déjà un bouton par niveau ;
  Longueurs / Compter / Comparer / Motifs / Ordonner : aucun écart (Ordonner MS : nombres jusqu'à 5, le programme va à 6).

  *Changements visibles* : fin « étoiles » commune à toute la maternelle (message de Compter « on peut encore progresser »
  aligné sur « on va s'entraîner encore »), avec en-tête commun (Quitter, ✅ ❌, points de progression) ; Formes : fin par étoiles
  au lieu des messages res100…, et on enchaîne seul après une réponse (plus de bouton « Suivant ») ; Tables : « Passer »
  enchaîne aussitôt, la fin des modes entraînement / aléatoire utilise le message commun et le tableau de correction (liste
  des erreurs d'avant remplacée), « Revoir les erreurs » conservé ; changer de niveau en maternelle ne remet plus le nombre
  de questions à 5 en PS (un réglage commun est gardé : le défaut PS ne vaut que pour une première ouverture) ;
  réglages mémorisés nouveaux (`ordonner_config`, `compter_config`, `comparer_config`) ; Compter : l'ancienne clé
  `compter_fiche` n'est plus lue.

  *Ce qui n'a pas été fait* : unification de Calcul mental avec `src/impression/calcul.js` (presets à graine) : non faite,
  `calcul.js` n'a pas été modifié (ses fiches publiées sont donc inchangées par construction) ; à faire en phase 2e avec les
  fiches de calcul « À imprimer ». Minuteur : `useMinuteur` partagé par Calcul mental et Tables.

  *Décisions à prendre* : valeur de `nbQ` en PS après un changement de niveau (garder ou forcer 5) ; Longueurs avec
  `OrdonnerClics` (variante sans zone ni bouton) ; sélection de départ CE1 de Tables (2, 3, 4, 5, 10) acceptée ?

Détail initial de la phase 2 :, par lots, vue par vue :
- Ordre : d'abord les plus gros (Grammaire, Géométrie, Mesures, Monnaie, Vocabulaire), puis les autres.
- Les corpus en dur (Grammaire, Vocabulaire) passent dans `i18n/<langue>/contenu/`.
- **Garde-fou** : HTML identique à graine fixe (le `rng` du nouveau code est branché sur le même
  `Math.random` à graine que le build), ou écart justifié et regardé.
- Les écarts de programme connus sont corrigés au passage : doubles et moitiés CE1, calcul posé CE2/CM2.

**Phase 2e — affiches et générateurs « À imprimer »** (demande du 2026-10-05) : même modèle que les exercices —
définition (niveaux, compétences, variantes), générateur pur, instantanés en node, catalogue dérivé ; s'applique à
`src/impression/affiches/*`, `alphabet.js`, `nombres.js`, aux tables de `calcul.js`, et aux générateurs écriture /
calcul / nombres.

**Phase 3 — langues** :
- 3a :
  - registre `src/langues/` ;
  - catalogues chargés par chemin (`useI18n('views/heure')`) ;
  - suppression des tables `{fr,br}`, `*_BR` et `a.br` (passage en clés) ;
  - séparation interface / contenu / régionales ;
  - compteur `'br'` à 0, puis bloquant.
- 3b : Fluent `.ftl` + Weblate, si l'utilisateur le valide.
- 3c : format du programme régional, branché sur `programme.js` et la page programme.

**Phase 4 — catalogue et build** :
- La définition des activités est la seule source : niveaux en tableaux, compétences par niveau, couverture
  dérivée.
- Fiches produites sans clic, par appel direct.
- **Page `/telechargements/` = page normale de l'app** qui charge un `fiches.json` généré ; le script de build se réduit à PDF, vignettes, aperçus, image de partage, JSON et sitemap. Pages par fiche (SEO) : gabarit minimal ou SSR Vue à partir du JSON, mêmes URL (demande du 2026-10-05).
- `telechargements.mjs` découpé en modules ; pages statiques en Vue SSR.
- Les slugs ne changent pas (comparaison avant/après).

**Phase 5 — tests** :
- Bout en bout avec @playwright/test (attentes d'état, `data-test`), en parallèle.
- Les tests de programme passent en unitaire node ; Chrome reste pour le rendu et les liens.

### Phase 2d — lot A (français : Grammaire, Vocabulaire, Dictée, Orthographe, Lettres) — fait (2026-10-05, non commité)

*Lignes de la vue avant → après* (le reste est dans `src/exercices/<id>/` et `src/data/`) : Grammaire 1 606 → 97 ; Vocabulaire
1 078 → 86 ; Dictée 551 → 283 ; Orthographe 513 → 105 ; Lettres 308 → 100. Communs : `QuestionFrancais.vue` (176) et
`EtiquettesOrdre.vue` (71) dans `src/views/francais/`. Corpus déplacés dans `src/data/grammaire.js` (522), `vocabulaire.js`,
`orthographe.js` plutôt que dans `i18n/fr/contenu/` : donnée pure de français étudié, jamais traduite, lue par le générateur
sans `T` (comme `data/conjugaison.js` et `data/dicteeMots.js`). Lettres : l'alphabet de la langue vient du catalogue de
contenu `src/i18n/<langue>/contenu/lettres.js` (`T('alphabet')`), donc aucun test de langue dans le générateur.

*Garde-fou* : captures « avant » dans Chrome (`capturer-fiches`, cas = réglages du registre + un cas par type de question,
fr et br), comparées à police égale (Arial) aux fiches recalculées en node. Résultat : **Grammaire 576/576**, **Vocabulaire
210/210**, **Orthographe 240/240** (dont « CP → CM2 » et les 3 thèmes), **Lettres 60/60** identiques (HTML entier) ; **Dictée
240/240 pour le `<body>`** (le `<head>` ne diffère que par l'ordre de la règle `h1`, commune). Instantanés enregistrés
(`tests/instantanes/{grammaire,vocabulaire,orthographe,dictee,lettres}.json`, 408 cas) ; la vue dans Chrome redonne les mêmes
empreintes (`capturer-fiches` sur la route : 102/102, 45/45, 111/111, 60/60). Seul écart voulu : police Andika (défaut commun).

*Niveaux et programme* (audit français inchangé ; `programme-francais.test.mjs` au vert) :
- Grammaire CE1, CE2, CM1, CM2 ; types au programme du niveau (compléments au CM1, phrase complexe et CC au CM2) ; défaut
  « Trouver le verbe » (fiches publiées). `ecartsAuProgramme` vérifie en node : type du niveau, natures de mots (`classesMots`),
  pas de pluriel en -x au CE1 (`pluriels`), accords réguliers sans féminin « audible » (`feminins`). Les anciens tests Chrome
  (RESERVE, pluriels CE1, accord CE1) sont remplacés par ce contrôle, sur 5 graines × chaque jeu de réglages.
- Vocabulaire CE1, CE2 ; « Mots qui se disent pareil » reste en bonus au CE2 (affiché « (bonus) » au lieu de « pour aller plus loin »).
- Orthographe CP → CM2 : le « CP → CM2 » n'est pas une classe : réglage `tous` (bonus, jamais coché), bouton dans la rangée des
  niveaux ; les homophones sont `horsProgramme` (avec raison) du CE2 au CM2 ; slug `exercices-orthographe-cp-cm2` inchangé.
  Les compétences annoncées restent celles d'avant (CM : accords seulement ; couverture inchangée).
- Dictée CP, CE1, CE2, CM1, CM2 : CM1 et CM2 ont un même corpus. Avant : un bouton « CM ». Maintenant : deux boutons CM1 et CM2
  (une définition par classe, comme `activites.js`), mais la fiche garde le titre « Dictée — CM » et la fiche publiée
  `exercices-dictee-cm1-cm2` est produite par le bouton CM1 (`impression/exercices.js`).
- Lettres GS et CP (niveaux déduits de `nom-lettres` : GS « l'alphabet, capitale / scripte / cursive », CP « reconnaître et nommer »).
  L'exercice est gardé tel quel : rien ne dépasse le programme de ces deux niveaux, donc ni bonus ni hors programme ; il n'a pas de
  sens en PS (prénom en capitales) ni en MS (lettres du prénom) et n'y est pas proposé. Manquent (audit) : cursive, son des lettres,
  confusions b/d, p/q.

*Écarts de comportement* (vus et assumés) :
- Changement de niveau : politique commune (choix multiples → défauts du nouveau niveau ; thème d'Orthographe gardé s'il est au
  programme du nouveau niveau, avant : premier thème). Les anciens réglages mémorisés restent lus (même clé et même forme)
  sauf Dictée : un seul `dictee_config` remplace `dictee_niveau`, `_cats`, `_mode`, `_nb`, `_vitesse`, `_fiche` (réglages remis aux
  défauts une fois ; `dictee_vus_*` conservé).
- Accents oubliés : comptés faux avec « ⚠️ Attention aux accents : … » (pluriel de Grammaire, Orthographe, Dictée). Avant : Dictée et
  Grammaire comparaient les accents sans avertissement (faux aussi), Orthographe aussi.
- « Suivant » après chaque réponse en Grammaire, Vocabulaire, Orthographe et Lettres (avant aussi) : `useJeu({ delai: null })`.
  Dictée : bonne réponse → mot suivant après 0,9 s, erreur → réponse lue puis suite après 2,4 s, « Passer » enchaîne aussitôt.
- Écran de fin : message commun (`resultat100…`, 5 paliers) et `TableauCorrection` (colonnes Question / Ta réponse / Bonne réponse) ;
  Orthographe garde « À retravailler ». Lettres (GS-CP) n'avait pas la fin « étoiles » : elle prend le message commun du primaire.
- Dictée en mode phrases avec clé Mistral : les phrases sont demandées **toutes ensemble avant le début** (en parallèle, bouton
  désactivé et « Génération… »), avant : une par une pendant le jeu. Sans clé : les phrases prédéfinies, tout de suite.
- Boutons de types : `level-btn` avec icône (avant : `theme-btn`) ; sous-titres de groupes conservés (`groupes`).

*Socle ajouté ou réclamé* (rétrocompatible) :
- `useJeu({ delai: null })` : jamais de suite automatique, on attend `jeu.suivante` ; `delaiErreur: null` idem.
- `<ChoixReglage :groupes>` (rangées de boutons sous des sous-titres), `<ChoixReponses colonne>`, `documentFiche({ h1: null })`.
- `tests/exercices.test.mjs` : une compétence peut être d'un autre domaine de la **même matière** (Orthographe : domaine
  vocabulaire, compétence accords-gn de la grammaire).
- `src/views/francais/QuestionFrancais.vue` + `EtiquettesOrdre.vue` : question de grammaire / vocabulaire / orthographe.
  **`OrdonnerClics` (lot C) n'a pas été repris** : il est conçu pour des nombres (cases de 4 rem, boutons ronds de 4,5 rem) et ne
  convient pas à des mots de longueur variable ; `EtiquettesOrdre` (texte, `fin`, `separateur`) reste local. À unifier plus tard
  avec une variante « mots » d'`OrdonnerClics`.
- Réclamé : une fin « étoiles » commune pour la maternelle (pas utilisée ici) ; `catalogue « fr seulement »` de `npm run i18n`
  (les clés bretonnes `fiche_*` de Grammaire, Vocabulaire, Dictée ne servent qu'au jeu : elles sont traduites, rien de mort).

*Reste / décisions* : (1) CM1/CM2 en Dictée : deux boutons ou un seul « CM » ? (2) Orthographe : thème gardé au changement de niveau
(politique commune) ou retour au premier thème comme avant ? (3) `Lettres` : ajouter la cursive et le son des lettres (audit) ?
(4) Fiches prégénérées : celles de Grammaire, Vocabulaire, Orthographe, Lettres ne changent pas (même ordre de tirage) ;
Dictée idem ; tous les corps sont identiques, seule la police change (Andika) au prochain build.

## Vérification

- À chaque lot : `npm test` (et CI) au vert, `npm run qualite` sans régression, comparaison HTML à graine fixe
  pour tout refactor.
- **Aucun slug publié ne disparaît.**
- Fin de phase 2 : aucune vue de plus de 600 lignes, et `Math.random` absent des vues.
- Couverture du programme (part des compétences × niveaux avec au moins une activité) suivie dans
  `npm run qualite`, et qui ne peut que monter.
- Fin de phase 3 : 0 `'br'` en dur. Ajouter une langue de test fictive (`xx`) ne touche que `src/langues/xx/`.

## Décisions à prendre (utilisateur)

- Weblate (hébergé gratuit pour le libre, ou sur le VPS) et passage à Fluent : maintenant, ou une fois qu'un
  relecteur est trouvé ?
- Phase 2 : accepter que certaines fiches prégénérées changent (hasard réorganisé), si on ne peut pas garder
  le HTML identique ?


## Décisions de l'utilisateur après la phase 2c (2026-10-05)

1. Changement de niveau : les réglages repartent des valeurs du nouveau niveau, un bonus n'est jamais reporté.
2. Maternelle : on garde la fin « étoiles » (composant commun) ; le primaire garde le message de fin commun.
3. Exercices sans niveaux (Tables, Calcul posé, Lettres, Ordonner en partie) : niveaux déduits du programme, et
   **on garde l'exercice parce que les enfants l'aiment bien** ; ce qui dépasse le programme est `bonus` ou
   `horsProgramme`, jamais par défaut.
4. Lecture et Quiz : hors du compteur pour l'instant, à reprendre une fois la migration terminée.
5. « Passer » : on enchaîne tout de suite, partout.
6. Pas d'option « accepter les réponses sans accents » pour l'instant.

## Phase 2d — lot B (maths avec dessins : Géométrie, Mesures, Numération, Fractions) — 2026-10-05, non commité

| vue | avant | après (vue) | modules `src/exercices/<id>/` | fiches |
|---|---|---|---|---|
| Géométrie | 1 217 | 371 | definition, generateur, quadrillage, figures, patrons, donnees, dessins, fiche, textes (~890) | `<body>` identique : 120 / 120 (CE1, CE2, fr, br) |
| Mesures | 1 175 | 176 | definition, generateur, longueurs, masses, contenances, calendrier, donnees, dessins, fiche, textes (~980) | `<body>` identique : 114 / 114 (+ 12 cas calendrier) |
| Numération | 867 | 235 | definition, generateur, questions, base10, droite, fiche, textes | instantané 258 / 258 (CP ajouté) |
| Fractions | 844 | 227 | definition, generateur, questions, formes, droite, fiche, textes | instantané 162 / 162 |

- **Écarts de fiche (justifiés)** : seul le `<head>` change (police choisie dans « Sur la fiche », Andika par défaut, au lieu d'Arial codé en dur ; CSS de base de `documentFiche`). Géométrie regardée en image (CE2, tout) : mise en page identique. Les instantanés sont donc ceux d'après (`--maj`), le corps étant vérifié identique à la capture d'avant.
- **Dessins partagés** : `src/impression/dessins/droite.js` (droite graduée pure : graduations, étiquettes, flèches), utilisée par Numération et Fractions. **L'affiche `affiches/droite.js` n'en dépend pas** et reste inchangée (feuille décorée : bandes, nombres en lettres, polices mesurées ; seul le calcul des positions serait commun) : `tests/affiches.test.mjs` au vert (276 / 276). Géométrie : figures, solides, patrons, quadrillage dans `geometrie/dessins.js` ; `affiches/formes.js` dessine d'autres icônes (colorées à la volée) : rien à partager proprement. Règle, balance, broc (Mesures) : `mesures/dessins.js`, un seul usage.
- **Niveaux / programme** : inchangés pour Géométrie, Mesures et Fractions ; **Numération : niveau CP ajouté** (nombres ≤ 100, en lettres ≤ 50, sans suites), fiches CP nouvelles ; le calendrier de Mesures reste `horsProgramme` (avec raison). Écarts non traités, à décider : Fractions CE2 (dénominateurs 7, 9, 11, 12 jamais tirés), Mesures CE2 (dm, tonne, périmètre : changerait les tirages, donc les fiches : lot distinct avec `--maj`), `angle-droit` est au programme dès le CE1 (Géométrie ne le propose qu'au CE2).
- **Socle** : aucun composant changé. Géométrie : `axeHorizontal` est un réglage **commun** de la définition (sinon `chargerReglages` perd la clé, absente des défauts du CE1) tout en n'étant proposé qu'au CE2 ; clés `et` / `ou` ajoutées aux catalogues de contenu de Mesures (le générateur n'a plus que `T`). Les questions à choix portent `options` / `bonne` (indice) pour `<ChoixReponses>`.
- **Changements visibles** : QCM en grille de 2 colonnes (`<ChoixReponses>`, les propositions non choisies sont grisées) ; « Passer » enchaîne tout de suite (plus de correction d'une question passée) ; changer de niveau remet les exercices aux défauts ; CE1 de Mesures : le bouton « Contenances » (grisé) disparaît.
- **Qualité** : les `'br'` en dur et l'import `i18n/br/` supplémentaires constatés par `npm run qualite` ne viennent pas du lot B (aucun `'br'` dans les dossiers `src/exercices/{geometrie,mesures,numeration,fractions}` ni leurs vues ; les imports bretons sont dans `textes.js`, comme les modèles) mais de scripts jetables d'autres lots (`scripts/_pb.mjs`, `scripts/_ordonner.mjs`, `scripts/_cm.mjs` : à supprimer par leurs auteurs).
- **Vérifié** : lint (0 erreur hors scripts jetables des autres lots), `npm run i18n` (0), `node tests/exercices.test.mjs` (les 4 passent), instantanés, `programme-maths`, `affiches` ; jeu et fiche dans Chrome, fr et br, chaque niveau (Géométrie, Mesures, Numération, Fractions), sans erreur JS.

## Après la phase 2d : exemples de départ (demande du 2026-10-05)

Un **exemple d'exercice** et un **exemple d'affiche**, complets, minimaux et commentés, servent de boilerplate :
- exercice : `src/exercices/exemple/` (définition avec niveaux et compétences, générateur pur, fiche, textes fr/br,
  vue mince avec les composants du socle, instantanés, cas dans `exercices.test.mjs`) ;
- affiche : un module de `src/impression/affiches/` avec sa définition (niveaux, compétences, variantes), son
  dessin pur, le cadre commun et son entrée de catalogue (phase 2e, quand les affiches seront migrées) ;
- **visibles uniquement en développement** : `import.meta.env.DEV`, sans trace dans le build de production ni dans
  le sitemap (même mécanisme que la pastille « migré / à migrer ») ;
- un script `npm run nouveau -- exercice <id>` qui copie le modèle, remplace l'identifiant et l'inscrit au
  registre (à évaluer : seulement si ça évite de vraies erreurs).


## Passes de lisibilité sur les exercices (mesure du 2026-10-05)

Mesure faite sur 150 fichiers (22 exercices, socle, vues), rapports bruts dans `/tmp/audit-lisibilite/rapports/`.
Constats : duplication 3,2 % (19 clones de ≥ 8 lignes, surtout entre vues) ; 45 fonctions de complexité
cyclomatique > 10 (max 51 : `grammaire/generateur.js construireQuestion`, 171 lignes) ; 25 de complexité cognitive
> 15 ; 16 fonctions > 50 lignes (`problemes creer` : 260) ; 6 fichiers > 300 lignes ; 70 conditionnels imbriqués ;
aucun cycle d'import ; 59 erreurs `tsc --checkJs` dont 27 réelles ; contrats d'exercice incohérents (`bonneReponse`
absent de 3 exercices, `ecartsAuProgramme(x)` nommé 4 façons, `questionsFiche` tableau ou objet).

Critères objectifs retenus (compteurs à cliquet dans `npm run qualite`, règles ESLint en `warn` comptées) :
duplication (jscpd, clones ≥ 8 lignes), complexité cyclomatique et cognitive (ESLint + sonarjs), longueur de
fonction et de fichier, imbrication (conditionnels, profondeur), paramètres > 5, chaînes dupliquées, code mort
(knip), types (`tsc --checkJs` sur une liste de fichiers). Reste subjectif : qualité des noms, découpage d'un
`switch`, commentaires périmés, nombres magiques (le compteur `no-magic-numbers` est du bruit ici).

Passes, dans l'ordre (chacune finit par `npm run instantanes` vert et un compteur qui baisse) :
1. **Contrats et noms homogènes** : `bonneReponse` partout, `ecartsAuProgramme(questions, contraintes)`,
   `function` ou `const =>` une seule forme, `questionsFiche` de forme documentée, `@typedef` central
   (`Question`, `Reponse`, `Definition`), JSDoc de `documentFiche` ; tsc lâche à 0 erreur utile.
2. **Doublons vers le socle** : blocs de vues répétés (CalcuPose/Geometrie/Mesures/Monnaie,
   Fractions/Numeration, Grammaire/Vocabulaire), `fmt`, motifs `grammaire`/`vocabulaire` ; clones ≥ 8 lignes ≤ 5.
3. **Code mort** : exports et alias inutilisés (knip avec la config Vite), alias `INTERFACE`/`TEXTES` doublons.
4. **Les monstres** : `grammaire construireQuestion`, `problemes creer`, `heure verifier`/`genererQuestion`,
   `calcul-mental calculer`, `numeration genSuites`/`distracteurs`, `mesures genComparer`/`genCalendrier` ;
   cyclomatique ≤ 15, fonctions ≤ 80 lignes, fichiers d'exercices ≤ 300. **Risque : l'ordre des tirages du `rng`**
   (donc les fiches) : `npm run instantanes` après chaque fonction.
5. **Lisibilité fine** : constantes nommées, objets au lieu de paramètres positionnels (`pb`, `tirerDansPlage`,
   `base10`), ternaires imbriqués ≤ 10, commentaires d'historique de migration retirés, `@ts-check` partout dans
   `src/exercices`.
Outils à ajouter : `eslint-plugin-sonarjs`, `jscpd`, `knip` (≈ 30 s de CI en plus).


## Gel des refactors (décision du 2026-10-05)

Les passes de lisibilité, la phase 2e (affiches) et toute réécriture des définitions existantes sont **suspendues
tant que les deux exemples de départ (exercice et affiche) ne sont pas validés** par l'utilisateur. Le refactor se
fera ensuite contre les exemples, ce qui le rend plus simple. Les exemples intègrent d'abord les retours sur les
définitions : builders avec défauts (`definir`, `choix`), compétences par niveau dérivées de `programme.js`,
constantes `K` et `D`, validation à l'import ; la question « plus de TypeScript ? » reste à trancher.
Garde-fou prévu pour le jour du refactor : un test qui compare la définition **normalisée** de chaque exercice
avant et après (JSON identique), en plus de `npm run instantanes`.


## Modèle cible des affiches (demande du 2026-10-05)

Exemple et modèle : `src/affiches/` (README.md dans le dossier ; TypeScript ; `definirAffiche` + `choix` ; exemple `src/affiches/exemple/`,
visible sur `/dev/affiches` en développement seulement ; catalogue dérivé en données pures, sérialisables en JSON). Une affiche se **déclare** (`definition`), se **dessine** (`rendu.dessin`, pur) et s'**habille**
du cadre commun (`impression/affiches/cadre.ts`) ; formulaire, catalogue (slug, titre, niveaux, compétences, lien),
test de programme et instantané en découlent. Emplacement `src/affiches/<id>/` en miroir de `src/exercices/<id>/` : une affiche
est une ressource de même rang qu'un exercice (domaine, niveaux, compétences), et `src/impression/` reste le cadre et les
générateurs de fiches. Préparatifs faits : `src/utils/page.ts` (formats et `documentImpression`, purs ; les @font-face sont
fournis par `utils/impression.js` à son chargement), pour que le cadre et les tests tournent sous node.

Décisions de l'utilisateur (2026-10-05), appliquées dans `src/affiches/` :
1. Les affiches riches (alphabet, nombres) entrent dans le modèle : le formulaire générique a des groupes, un ordre, des aides et des
   réglages conditionnels (`formulaire.groupes`, `visibleSi`).
2. Plusieurs pages : `dessin` rend une liste de pages ; cadre, aperçu, test de mise en page et catalogue (`pages`) les comptent.
3. Bilingue au choix de chaque affiche : `langues` + `bilingue` (langues affichées sur la feuille) ou une entrée par langue.
4. `variantes` accepte une fonction pure (sérialisée à l'arrivée).
5. Chaque site publie les langues qu'il propose (`catalogueDe(modules, site)`).
6. Titre personnalisé : option commune du cadre, jamais redéclarée.
7. Police : `{ mode: 'unique', defaut? }` ou `{ mode: 'parType', types, defauts }` ; titre et interface toujours en Andika.
8. Deux formulaires (affiche, exercice) qui partagent leurs briques (`ChoixReglage`, `GroupeReglages`, `ChoixPolice`, aperçu).
9. Graine seulement pour les affiches à hasard (`hasard: true`, `creerRng`).
10. L'entrée de catalogue suffit pour les JSON publics.
