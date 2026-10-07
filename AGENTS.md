# AGENTS.md — consignes pour les agents de code

Site d'exercices et de fiches à imprimer pour l'école (MS → CM2), en français et en breton. Vue 3 + Vite,
tout tourne dans le navigateur. Deux sites, un seul code : https://ecoleprimaire.app (fr) et
https://skoolik.app (br). Voir `README.md` pour l'organisation générale.

## Langue et style

- Code, commentaires, noms de variables et messages en **français**, comme le code existant. Les messages de
  commit sont en anglais (`feat:`, `fix:`, `refactor:`…).
- Densité de commentaires et idiomes du fichier voisin. Pas de dépendance nouvelle sans raison forte.
- **Code lisible avant tout** : jamais de ternaires imbriqués, de chaînes `typeof … ? … : Array.isArray(…) ? … : … && 'x' in …`,
  ni de one-liners qui font trois choses. Une petite fonction nommée (avec un commentaire d'une ligne), un type explicite pour les
  données qu'on lit, et des étapes sur plusieurs lignes. Si une ligne demande un effort pour être comprise, la réécrire.
- Breton : traduction automatique acceptée, mais **chaque texte breton nouveau est marqué `// br: à relire`**.
  Ne jamais présenter du breton non vérifié comme sûr. Les nombres, l'alphabet, les jours et les mois sont
  vérifiés (Wiktionnaire, Meurgorf, Kervarker) : ne pas les modifier sans source.

## Commandes

```sh
npm run dev               # http://localhost:5173/ecole-primaire/ (souvent déjà lancé : ne pas le relancer)
npm test                  # niveau RAPIDE (~1 min) : node + Chrome sans interface, ports 4190 à 4192 (un seul à la fois) ; PDF, pages statiques et accessibilité sur un échantillon
npm run test:complet      # niveau COMPLET : mêmes tests, PDF et pages statiques de TOUTES les fiches, accessibilité de toutes les routes (avant mise en ligne, après un report ; CI de nuit ; en-tête de tests/lancer.mjs)
npm run lint              # ESLint de correction (eslint.config.js) : doit rester à 0 erreur
npm run types             # vue-tsc strict sur les .ts et <script lang="ts"> (scripts/verifier/types.mjs) : doit rester à 0 erreur
npm run qualite           # compteurs à seuil (scripts/verifier/qualite-seuils.json) : 'br' en dur, vues > 600 lignes…
npm run instantanes       # empreintes des fiches des exercices migrés (node, ~1 s) ; -- --diff <cas>, -- --maj [préfixe]
node scripts/dev/capturer-fiches.ts <route> …   # mêmes empreintes, capturées dans Chrome (vues pas encore migrées)
npm run fiches -- --mode skoolik --outDir dist-skoolik [--avec-exemples] [--echantillon]   # fiches PDF + JSON (src/telechargements/README.md) ; npm run fiches:dev → public/fiches/ pour npm run dev
npm run statique -- --mode skoolik --outDir dist-skoolik [--avec-exemples]   # pages HTML statiques des fiches, sitemap, robots, 404 (après vite build et npm run fiches ; src/telechargements/README.md, « Pages statiques »)
npm run i18n              # clés manquantes fr/br : doit rester à 0 problème
npm run i18n:relecture    # tableau des textes bretons à relire (i18n-relecture.html, non versionné)
scripts/deploiement/deploy-vps.sh     # build des deux sites + rsync (~8 min) — seulement si on te le demande
```

CI : `.github/workflows/tests.yml` (Node 22.18, ubuntu) lance `npm ci`, `lint`, `types`, `qualite` et `npm test` (rapide) sur chaque
push et pull request vers `main`, et `npm run test:complet` chaque nuit et à la demande (job séparé). Un compteur de `qualite` qui s'améliore : `npm run qualite -- --enregistrer`
resserre son seuil (à commiter avec le changement) ; un seuil ne se relâche jamais sans raison écrite.
Chaque `tests/*.test.mjs` finit par `process.exit(nbEchecs() ? 1 : 0)` : `lancer.mjs` ne lit que les codes de sortie.

Un test ciblé sur le serveur de dev : `TEST_URL=http://localhost:5173/ecole-primaire/ node tests/<x>.test.mjs`.
Chrome : `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome` (playwright-core). Un script jetable
qui importe des modules du projet doit être placé **dans le dépôt** le temps de l'exécution, puis supprimé.

## TypeScript

- **Un module nouveau s'écrit en `.ts`** (et un composant nouveau en `<script setup lang="ts">`). Le JavaScript existant
  n'est pas vérifié (`checkJs: false`) et n'est pas converti d'office.
- **Node exécute les `.ts` directement** (retrait des types, sans compilation ; Node >= 22.18, `engines` dans
  `package.json`) : pas de build, mais seulement la syntaxe « effaçable » (`erasableSyntaxOnly`) : **pas d'`enum`, de
  `namespace` ni de propriété de paramètre de constructeur**. Un import de types seuls s'écrit `import type`.
- **Les imports de fichiers `.ts` portent l'extension `.ts`**, partout (Vite, node, vue-tsc) : `from '../data/programme.ts'`.
- `npm run types` doit rester à 0 erreur (CI, et compteur `erreursDeType` de `qualite`). Les erreurs situées dans des
  `.js` (même avec `// @ts-check`, qui reste utile à l'éditeur) sont ignorées : le JS n'est pas vérifié.
- **Deux mondes pendant la migration** (plan 10) : `src/noyau/` (nouveau socle typé : `useJeu`, `useReglages`,
  `useFicheExercice`, `CadreExercice`, `ChoixReglage`…, types dans `src/noyau/types.ts`) et l'ancien socle
  (`src/composables/`, `src/components/ConfigExercice.vue`…, marqué `@deprecated`). `src/noyau/**` et les exemples
  n'importent jamais l'ancien socle (règle ESLint) ; le compteur `importeursAncienSocle` de `qualite` ne doit que
  baisser. `data/classes`, `data/programme`, `utils/hasard`, `utils/reponses` et `impression/document` sont en `.ts` sur
  place, leurs anciens `.js` ne sont que des raccourcis d'une ligne : le code neuf importe le `.ts`.

## Où sont les choses

Branche `base-saine` (plan 11, `plans/11-base-saine.md`) : tout ce qui est nouveau est en TypeScript ; l'ancien monde
(vues d'exercices, impressions, catalogues, `src/i18n/`) est déconnecté mais présent, et `main` reste la production.

- `src/sites.ts` : réglages par site (identité, langues d'interface proposées et par défaut, langue régionale par défaut).
  `src/langues/` : registre typé des langues (`registre.ts`, type `Langue`), règles, nombres, données régionales,
  textes typés (`fr/textes/<section>.ts` = source ; `br/textes/<section>.ts` en `satisfies Traductions<typeof fr>`).
  `useLangue().t('section.cle', params)`. **Aucun `'br'` en dur** hors de ces deux endroits : on interroge le registre
  (`donneesRegionales`, `voix`, `traductionRelue`) ou le réglage. Nouveau texte : dans les deux langues, breton marqué
  `// br: à relire` ; `npm run i18n` compte les passages à relire. Navigation et pages de la base : `src/shell/`, `src/pages/`.
- Tests : `tests/*.test.mjs` = la base ; `tests/ancien/` = tests de l'ancien code (Chrome lents), à reporter avec leur exercice. `tests/lancer.mjs` (en-tête) fixe la règle de dépendances : tests NODE (aucun build, lancés d'emblée) et CHROME (attendent les builds, du plus long au plus court) ; un test nouveau s'inscrit dans l'une des deux listes, et `npm test` affiche les durées (objectif ≤ 1 min).

- `src/exercices/` : **le modèle de tout exercice nouveau ou migré** (plan 10 ; pilote : `heure/`). Un dossier par
  exercice : `definition.js` (niveaux → `competences` de `programme.js`, `reglages` par défaut, `options`, `bonus`,
  `horsProgramme` avec raison ; `fiches` par compétence), `generateur.js` et `fiche.js` purs (lisibles par node),
  `textes.js`. Format : `src/exercices/README.md` et le JSDoc de `src/exercices/index.ts` (registre : y ajouter
  l'exercice). La vue reste mince : `useReglages` + `ConfigExercice`, `useJeu` + `<ResultatsJeu>`, `useFicheExercice`,
  rendu d'une question (`<ChoixReponses>`, `<SaisieReponse>`) ; niveaux affichés = `definition.niveaux`. Hasard : `src/utils/hasard.ts` (`creerRng`), graine des fiches :
  `useGraine` ; gabarit de fiche : `documentFiche` (`src/impression/document.ts`). `tests/exercices.test.mjs` vérifie
  chaque exercice du registre contre le programme.
- `src/affiches/` : **le modèle de toute affiche nouvelle** (plan 10, phase 2e ; aucune affiche existante n'y est encore migrée). Un dossier par affiche en TypeScript : `definition.ts` (`definirAffiche`), `dessin.ts` pur, `textes.ts` ; registre `index.ts`, exemple de départ visible en dev seulement (`exemples.ts`, `/dev/affiches`) ; formulaire générique `src/noyau/FormulaireAffiche.vue`. Format : `src/affiches/README.md`.
- Créer un exercice : `npm run nouveau -- exercice <id> "<Titre>" --domaine <d> --competences <ids> [--modele simple|corpus] [--matiere maths|francais|maternelle]` copie `src/exercices/exemple/` (tutoriel, TypeScript, `definir`), garde les niveaux du modèle où une compétence est au programme, et l'inscrit au registre typé (`src/exercices/index.ts`), à la table des vues (`src/views/exercices.ts`, qui sert la route) et aux textes typés fr/br (breton « à relire ») : il apparaît aussitôt dans le catalogue, la recherche et les fiches PDF. Premier report réel : `calcul-mental/` (plages de classes `pourClasses`, fiches sous leurs adresses historiques `slug`). La page `/dev` (dev seulement) liste les exemples. Voir `src/exercices/README.md`.
- **Regards critiques** : à la création ou au report d'un exercice, d'une fiche à imprimer ou d'une affiche, proposer à l'utilisateur de faire passer deux agents critiques en lecture seule, du point de vue de l'enfant de la classe visée et de l'enseignant·e : prompts prêts dans `docs/critiques/` (`enfant.md`, `enseignant.md` ; mode d'emploi dans le README).
- `src/views/` : une vue par exercice. Le cadre commun `ConfigExercice` gère les onglets « Faire l'exercice »
  et « Imprimer une fiche » (`?mode=imprimer`, `useModeExercice`). La vue fournit `htmlFiche()`.
  - Prénom/date et corrigé : `useOptionsFiche`. La vue écrit `${ligneNomDate(langue)}` et
    `<section class="corrige"><h2>…</h2>…</section>` ; le cadre applique les options. Ne pas recréer
    d'option de corrigé propre à une vue.
  - Réglages mémorisés : `chargerReglages(cle, DEFAUT)` (`src/utils`), jamais `charger` brut pour une config.
- `src/impression/` : générateurs de fiches et d'affiches, partagés par l'app et par le build des PDF.
  `api-build.js` est le point d'entrée du build (`?generation=1`, `window.__ecolePrimaire`).
- `src/langues/` (base saine, TypeScript) : **où écrire un texte**. Interface (noyau, exemples, pages, `/dev`) : une section
  `fr/textes/<section>.ts` + `br/textes/<section>.ts` (`satisfies Traductions<…>`), lue par `useLangue().t('section.cle')` ;
  mots communs du jeu et des fiches : section `communs` ; noms de domaines : `domaines`. Contenu d'un exercice (fiche,
  énoncés) : `catalogue(…)` dans `src/exercices/<id>/textes.ts` (`src/langues/catalogue.ts`, « français seulement » possible).
  Aucun import de `src/i18n/` depuis `src/noyau/`, les exemples, `src/affiches/` et `scripts/build/fiches/` (seul le pont
  `src/exercices/traducteur.ts` lit l'ancien format, pour les exercices pas encore reportés).
- `src/i18n/` (ancien monde, ne pas y ajouter de texte de la base) :
  - catalogues d'interface `fr/…` et `br/…` (un fichier par composant) ;
  - contenu des exercices dans `<langue>/contenu/` ;
  - `regles.js` : règles de langue (mutations bretonnes, ha/hag, élision, pluriels).
  - Pas de `if (langue === 'br')` dans les générateurs : passer par `contenu()` et `regles()`.
  - Exercice de français : contenu et fiche toujours en `fr` (`enLangue('fr', …)`).
- `src/data/programme.ts` : référentiel des programmes officiels (domaines, compétences, contraintes par
  niveau, avec sources). **Il fait foi** pour les niveaux. Une option d'exercice ou une fiche qui sort du
  programme d'un niveau est un bug.
- `src/data/activites.js` : catalogue des activités (niveaux, domaine). `src/data/languesRegionales.js` :
  données des langues régionales.
- `scripts/` : rangé par rôle (`build/` PDF, JSON et pages statiques `/telechargements/` (SEO) et sitemap ; `verifier/`, `generer/`, `deploiement/`, `dev/`, `ponctuel/`), voir `scripts/README.md`.
- `tests/` : `exercices` (définitions, node sans Chrome), `instantanes` (empreintes des fiches, node), `logique`, `routes`, `cadre`, `memorises` (réglages corrompus), `statiques`, `affiches` (rien ne
  dépasse des feuilles), `reglages` (complet).

## Règles

- **Les fiches générées ne doivent pas changer par accident.** Exercices migrés : `npm run instantanes` (aussi dans
  `npm test`) compare chaque fiche (niveau × graine × langue × réglages) à `tests/instantanes/<id>.json`. Migration
  d'une vue : capture « avant » avec `scripts/dev/capturer-fiches.ts`, qui devient l'instantané ; le test doit passer
  sans `--maj`. Écart voulu : `--diff <cas>`, regarder, `--maj`, et le justifier dans le commit (détail :
  `src/exercices/README.md`). Catalogue : comparer `generer(slug)` avant et après.
- **Les slugs publiés ne changent pas** (`/telechargements/<slug>/`, sitemap, liens externes).
- Vie privée : aucune requête vers un autre site, pas de cookie, pas d'identifiant. Le seul signal est
  `src/utils/journal.js`, anonyme et sans IP. **Seule exception, facultative et explicite (décision du
  2026-10-06)** : la Dictée peut demander des phrases à Mistral (api.mistral.ai) avec la clé que l'utilisateur
  saisit lui-même ; sans clé, rien ne sort du navigateur (un test doit le vérifier).
- Polices : seulement celles livrées (OFL / CC BY). Belle Allure et Écolier ne sont pas redistribuables.
- `brouillons/` : plans temporaires, maquettes et études (ignoré par git : jamais commité ni poussé ; ex. `brouillons/iconographie/`).
- `plans/` et `AGENTS.md` sont versionnés depuis le 2026-10-07 (reprise du travail sur plusieurs machines : voir `REPRISE.md`). Ne pas commiter
  `i18n-relecture.html` ni `couverture.html` (générés), ni rien qui contienne un identifiant, un hôte réel ou une clé (`.deploy.env`).
- Commits : auteur `Corentin Chary <corentin.chary@gmail.com>`, signés. Si la signature échoue, ne pas la
  contourner : demander à l'utilisateur.
- Plusieurs agents peuvent travailler en même temps : ne toucher qu'aux fichiers de sa tâche, ne pas lancer
  `npm test` si un autre agent le fait, ne pas commiter sauf demande explicite.
- Les demandes reçues en cours de tâche vont d'abord dans `docs/TODO.md` (versionné ; `TODO.md` à la racine est un lien vers lui).
- SSH vers le serveur : jamais de sonde `nc` sur le port 22 (fail2ban). `sudo` sur le serveur : c'est
  l'utilisateur qui le lance.
