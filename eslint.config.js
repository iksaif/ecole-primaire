// ESLint : règles de correction seulement (variables inutilisées, affectations inutiles, gabarits Vue invalides…).
// Aucune règle de style ni formateur : le style dense du dépôt est assumé (voir plans/10-qualite-methode.md).
//   npm run lint
import js from '@eslint/js'
import vue from 'eslint-plugin-vue'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default [
  { ignores: ['dist*/**', 'node_modules/**', 'public/**', 'plans/**', 'couverture.html', 'i18n-relecture.html'] },
  js.configs.recommended,
  ...vue.configs['flat/essential'],
  // TypeScript : seul l'analyseur change (les .ts et les <script lang="ts">) ; les types sont vérifiés par `npm run types`
  { files: ['**/*.ts'], languageOptions: { parser: tseslint.parser } },
  { files: ['**/*.vue'], languageOptions: { parserOptions: { parser: tseslint.parser } } },
  {
    files: ['**/*.{js,mjs,vue}'],
    // le même code tourne dans le navigateur (app) et dans node (scripts, tests, build des PDF)
    languageOptions: { ecmaVersion: 'latest', sourceType: 'module', globals: { ...globals.browser, ...globals.node } },
    rules: {
      'no-empty': ['error', { allowEmptyCatch: true }],   // `try { localStorage… } catch {}` : voulu
      'vue/multi-word-component-names': 'off',             // règle de nommage (Drapeau.vue), pas de correction
    },
  },
  {
    files: ['**/*.ts', '**/*.vue'],
    plugins: { '@typescript-eslint': tseslint.plugin },
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    rules: {
      // la règle de base ne connaît pas les types (un import de type n'est pas « inutilisé »)
      'no-unused-vars': 'off',
      'no-redeclare': 'off',   // les surcharges de fonction (choix, cases) en sont ; TypeScript vérifie les vraies redéclarations
      '@typescript-eslint/no-unused-vars': ['error', { args: 'after-used', argsIgnorePattern: '^_', caughtErrors: 'none' }],
      'no-empty': ['error', { allowEmptyCatch: true }],
      'vue/multi-word-component-names': 'off',
      // erreurs de correction seulement (pas de règle de style)
      '@typescript-eslint/no-misused-new': 'error',
      '@typescript-eslint/no-extra-non-null-assertion': 'error',
      '@typescript-eslint/no-non-null-asserted-optional-chain': 'error',
    },
  },
  {
    // Les deux mondes (plan 10) : le noyau et l'exemple d'exercice n'importent jamais l'ancien socle, qu'on supprimera
    // avec le dernier exercice migré. Les modules partagés (utils/index.js, i18n, utils/impression.js, ApercuImpression,
    // SignalerErreur…) restent permis. data/classes.ts, data/programme.ts, utils/hasard.ts, utils/reponses.ts et
    // impression/document.ts s'importent avec leur extension .ts : leurs anciens chemins .js sont des raccourcis.
    files: ['src/noyau/**', 'src/exercices/exemple/**', 'src/affiches/**'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          { group: ['**/composables/*'], message: "Ancien socle : utiliser src/noyau/ (useJeu, useReglages, useFicheExercice…)." },
          {
            group: ['**/components/ConfigExercice.vue', '**/components/OptionsFiche.vue', '**/components/ChoixReglage.vue', '**/components/ChoixReponses.vue',
              '**/components/SaisieReponse.vue', '**/components/QuestionJeu.vue', '**/components/ResultatsJeu.vue', '**/components/ResultatsEtoiles.vue',
              '**/components/TableauCorrection.vue', '**/components/OrdonnerClics.vue', '**/components/ChoixPolice.vue'],
            message: "Ancien socle : utiliser les composants de src/noyau/ (CadreExercice, ChoixReglage, ChoixReponses…).",
          },
          { group: ['**/exercices/outils', '**/exercices/outils.js'], message: "Ancien socle : utiliser src/noyau/reglages.ts." },
          {
            group: ['**/data/classes', '**/data/classes.js', '**/data/programme', '**/data/programme.js', '**/utils/hasard', '**/utils/hasard.js',
              '**/utils/reponses', '**/utils/reponses.js', '**/impression/document', '**/impression/document.js'],
            message: "Raccourci legacy : importer le module .ts (programme.ts, classes.ts, hasard.ts, reponses.ts, document.ts).",
          },
        ],
      }],
    },
  },
]
