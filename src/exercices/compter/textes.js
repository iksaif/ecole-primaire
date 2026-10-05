// Compter les objets — textes de l'exercice, par langue : interface (consignes, réglages) et contenu (nom des objets
// comptés, qui suit la langue de l'interface). Aucune clé commune ; lus avec T(cle, params).
import interfaceFr from '../../i18n/fr/views/maternelle/CompterView.js'
import interfaceBr from '../../i18n/br/views/maternelle/CompterView.js'
import contenuFr from '../../i18n/fr/contenu/compter.js'
import contenuBr from '../../i18n/br/contenu/compter.js'

export const INTERFACE = { fr: interfaceFr, br: interfaceBr }
export const TEXTES = { fr: { ...interfaceFr, ...contenuFr }, br: { ...interfaceBr, ...contenuBr } }
