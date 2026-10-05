// Exemple d'exercice à corpus — textes. Deux catalogues, pour deux usages :
//   INTERFACE : les réglages et le jeu, traduits (src/i18n/<langue>/views/dev/ExempleCorpusView.js, `npm run i18n` les compare) ;
//   TEXTES    : le contenu (ici, la fiche), toujours en français : un seul catalogue, jamais traduit, donc ici et pas sous
//               src/i18n/ (qui exige les mêmes clés en français et en breton). Lu par T ; « corrige » vient du catalogue commun.
// Les mots à deviner sont dans un corpus, pas dans un catalogue : src/data/exemple-corpus.ts.
import interfaceFr from '../../i18n/fr/views/dev/ExempleCorpusView.js'
import interfaceBr from '../../i18n/br/views/dev/ExempleCorpusView.js'

export const INTERFACE = { fr: interfaceFr, br: interfaceBr }
export const TEXTES = {
  fr: {
    titre: 'Les synonymes',
    consigneFiche: 'Coche le mot qui veut dire presque la même chose que le mot en gras.',
  },
}
