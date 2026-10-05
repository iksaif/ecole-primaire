// Les nombres — textes de l'exercice, par langue : interface (consignes, réglages) et contenu (énoncés, fiche).
// Les deux catalogues n'ont aucune clé commune ; le générateur et la fiche les lisent avec T(cle, params).
// `langue` (catalogue de contenu) : langue du contenu, pour écrire les nombres en lettres et accorder les noms.
import interfaceFr from '../../i18n/fr/views/maths/NumerationView.js'
import interfaceBr from '../../i18n/br/views/maths/NumerationView.js'
import contenuFr from '../../i18n/fr/contenu/numeration.js'
import contenuBr from '../../i18n/br/contenu/numeration.js'

export const INTERFACE = { fr: interfaceFr, br: interfaceBr }
export const TEXTES = { fr: { ...interfaceFr, ...contenuFr }, br: { ...interfaceBr, ...contenuBr } }
