// Problèmes — textes de l'exercice, par langue : interface (consignes, réglages) et contenu (énoncés, données).
import interfaceFr from '../../i18n/fr/views/maths/ProblemesView.js'
import interfaceBr from '../../i18n/br/views/maths/ProblemesView.js'
import contenuFr from '../../i18n/fr/contenu/problemes.js'
import contenuBr from '../../i18n/br/contenu/problemes.js'

export const INTERFACE = { fr: interfaceFr, br: interfaceBr }
export const TEXTES = { fr: { ...interfaceFr, ...contenuFr }, br: { ...interfaceBr, ...contenuBr } }
