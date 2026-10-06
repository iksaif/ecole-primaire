// Le développement : les exemples (exercices, affiches), leurs textes, les fausses entrées du programme et les pages /dev
// n'existent que si AVEC_DEV est vrai. Un build de production le remplace par `false` (Vite), et le code mort est retiré :
// ni les textes ni les modules des exemples n'y entrent (test : tests/production.test.mjs).
//   - `npm run dev` : vrai ;
//   - `npm run build` / build:ecoleprimaire / build:skoolik : faux ;
//   - un build qui garde les exemples (tests de fumée du jeu dans Chrome) : `VITE_AVEC_DEV=1 vite build …` ;
//   - node (tests, scripts) : vrai ; `EP_PROD=1 node …` simule la production (un exercice réel qui cite K.exemple… doit échouer).
// ATTENTION : pour qu'un `import()` de page ou de module d'exemple disparaisse d'un build (pas même un chunk orphelin), la
// condition doit être écrite DANS le module qui contient l'import, avec les littéraux de Vite :
//     if (import.meta.env.DEV || import.meta.env.VITE_AVEC_DEV) { …import('./dev.ts')… }
// Une constante importée d'un autre module (AVEC_DEV) est repliée trop tard : le chunk existerait quand même. AVEC_DEV sert aux
// données (programme, textes) et à node.
// Pur : lisible par node (`import.meta.env` n'existe que dans Vite).
export const AVEC_DEV: boolean = import.meta.env
  ? (import.meta.env.DEV || !!import.meta.env.VITE_AVEC_DEV)   // littéraux remplacés par Vite : le code mort se retire
  : (typeof process === 'undefined' || process.env.EP_PROD !== '1')
