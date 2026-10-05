// Lire l'heure — textes de l'exercice, par langue : interface (consignes, réglages) et contenu (énoncés, fiche).
// Les deux catalogues n'ont aucune clé commune ; le générateur et la fiche les lisent avec T(cle, params).
import interfaceFr from '../../i18n/fr/views/maths/HeureView.js'
import interfaceBr from '../../i18n/br/views/maths/HeureView.js'
import contenuFr from '../../i18n/fr/contenu/heure.js'
import contenuBr from '../../i18n/br/contenu/heure.js'

export const INTERFACE = { fr: interfaceFr, br: interfaceBr }
export const TEXTES = { fr: { ...interfaceFr, ...contenuFr }, br: { ...interfaceBr, ...contenuBr } }
