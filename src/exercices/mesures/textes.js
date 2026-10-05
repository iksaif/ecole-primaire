// Les mesures — textes de l'exercice, par langue : interface (consignes, réglages) et contenu (énoncés, fiche).
// Les deux catalogues n'ont aucune clé commune ; le générateur et la fiche les lisent avec T(cle, params).
import interfaceFr from '../../i18n/fr/views/maths/MesuresView.js'
import interfaceBr from '../../i18n/br/views/maths/MesuresView.js'
import contenuFr from '../../i18n/fr/contenu/mesures.js'
import contenuBr from '../../i18n/br/contenu/mesures.js'

export const INTERFACE = { fr: interfaceFr, br: interfaceBr }
export const TEXTES = { fr: { ...interfaceFr, ...contenuFr }, br: { ...interfaceBr, ...contenuBr } }
