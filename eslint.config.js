// ESLint : règles de correction seulement (variables inutilisées, affectations inutiles, gabarits Vue invalides…).
// Aucune règle de style ni formateur : le style dense du dépôt est assumé (voir plans/10-qualite-methode.md).
//   npm run lint
import js from '@eslint/js'
import vue from 'eslint-plugin-vue'
import globals from 'globals'

export default [
  { ignores: ['dist*/**', 'node_modules/**', 'public/**', 'plans/**', 'couverture.html', 'i18n-relecture.html'] },
  js.configs.recommended,
  ...vue.configs['flat/essential'],
  {
    files: ['**/*.{js,mjs,vue}'],
    // le même code tourne dans le navigateur (app) et dans node (scripts, tests, build des PDF)
    languageOptions: { ecmaVersion: 'latest', sourceType: 'module', globals: { ...globals.browser, ...globals.node } },
    rules: {
      'no-empty': ['error', { allowEmptyCatch: true }],   // `try { localStorage… } catch {}` : voulu
      'vue/multi-word-component-names': 'off',             // règle de nommage (Drapeau.vue), pas de correction
    },
  },
]
