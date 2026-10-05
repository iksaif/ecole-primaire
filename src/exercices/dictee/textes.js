// Dictée — textes de l'exercice. INTERFACE : réglages et jeu, dans la langue de l'interface. TEXTES : contenu de la
// fiche, toujours en français (exercice de français, `contenu: 'fr'`) : le catalogue français de l'interface porte aussi
// les textes de la fiche (consignes, noms de catégories `cat_…`), lus avec T(cle) ; « corrige » vient du commun.
import interfaceFr from '../../i18n/fr/views/francais/DicteeView.js'
import interfaceBr from '../../i18n/br/views/francais/DicteeView.js'

export const INTERFACE = { fr: interfaceFr, br: interfaceBr }
export const TEXTES = { fr: interfaceFr }
