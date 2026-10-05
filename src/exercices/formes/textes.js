// Les formes — textes de l'exercice, par langue : interface (consignes, réglages) et contenu (noms des formes, qui
// suivent la langue de l'interface). Aucune clé commune ; lus avec T(cle, params).
import interfaceFr from '../../i18n/fr/views/maternelle/FormesView.js'
import interfaceBr from '../../i18n/br/views/maternelle/FormesView.js'
import contenuFr from '../../i18n/fr/contenu/formes.js'
import contenuBr from '../../i18n/br/contenu/formes.js'

export const INTERFACE = { fr: interfaceFr, br: interfaceBr }
export const TEXTES = { fr: { ...interfaceFr, ...contenuFr }, br: { ...interfaceBr, ...contenuBr } }
