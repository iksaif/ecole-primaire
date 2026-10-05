// Exemple d'exercice — textes, par langue, lus avec T(cle, params) : T est fourni au générateur et à la fiche, `t` à la vue.
// Ici un seul catalogue (interface et contenu) : l'exercice n'a pas de corpus. Avec des énoncés, des noms ou des phrases
// (ce qu'on ne veut pas mélanger aux textes de l'interface), un second catalogue de contenu : voir heure/textes.js.
// Les textes se trouvent dans src/i18n/<langue>/ ; `npm run i18n` vérifie que fr et br ont les mêmes clés.
import interfaceFr from '../../i18n/fr/views/dev/ExempleView.js'
import interfaceBr from '../../i18n/br/views/dev/ExempleView.js'

export const TEXTES = { fr: interfaceFr, br: interfaceBr }
