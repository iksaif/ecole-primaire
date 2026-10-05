// Les lettres — textes de l'exercice, par langue : interface (réglages, jeu) et contenu (alphabet de la langue, titre et
// consigne de la fiche). Les deux catalogues n'ont aucune clé commune ; le générateur et la fiche les lisent avec T(cle).
import interfaceFr from '../../i18n/fr/views/maternelle/LettresView.js'
import interfaceBr from '../../i18n/br/views/maternelle/LettresView.js'
import contenuFr from '../../i18n/fr/contenu/lettres.js'
import contenuBr from '../../i18n/br/contenu/lettres.js'

export const INTERFACE = { fr: interfaceFr, br: interfaceBr }
export const TEXTES = { fr: { ...interfaceFr, ...contenuFr }, br: { ...interfaceBr, ...contenuBr } }
