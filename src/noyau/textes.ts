// Catalogues d'interface des composants du noyau, par langue. Les catalogues sont ceux de l'ancien socle (un fichier
// par composant, src/i18n/<langue>/components/) : ils restent partagés tant que les deux mondes coexistent, et ce
// fichier est le seul du noyau à les importer. À déplacer (src/i18n/<langue>/noyau/) avec la suppression de l'ancien socle.
import cadreFr from '../i18n/fr/components/ConfigExercice.js'
import cadreBr from '../i18n/br/components/ConfigExercice.js'
import optionsFicheFr from '../i18n/fr/components/OptionsFiche.js'
import optionsFicheBr from '../i18n/br/components/OptionsFiche.js'
import choixPoliceFr from '../i18n/fr/components/ChoixPolice.js'
import choixPoliceBr from '../i18n/br/components/ChoixPolice.js'

/** CadreExercice : jouer, imprimer, nouvelle. */
export const TEXTES_CADRE = { fr: cadreFr, br: cadreBr }
/** OptionsFiche : surLaFiche, entete, corrige_*. */
export const TEXTES_OPTIONS_FICHE = { fr: optionsFicheFr, br: optionsFicheBr }
/** ChoixPolice : police, exemple, aide, ajout. */
export const TEXTES_CHOIX_POLICE = { fr: choixPoliceFr, br: choixPoliceBr }
