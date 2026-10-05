// Catalogues d'interface des composants du noyau, par langue : la section `cadre` du catalogue typé (src/langues/<langue>/textes/cadre.ts).
// Les composants les passent à `useI18n` (src/i18n) tant que leurs textes sont lus par clé simple ; le catalogue commun
// (valider, quitter, bonus…) reste celui de src/i18n/<langue>/commun.js jusqu'à son portage dans src/langues/.
import { LANGUES } from '../langues/registre.ts'

const cadre = { fr: LANGUES.fr.textes.cadre, br: LANGUES.br.textes.cadre }

/** CadreExercice : jouer, imprimer, nouvelle. */
export const TEXTES_CADRE = cadre
/** OptionsFiche : surLaFiche, entete, corrige_*. */
export const TEXTES_OPTIONS_FICHE = cadre
/** ChoixPolice : police, exemple, aide, ajout. */
export const TEXTES_CHOIX_POLICE = cadre
/** FormulaireAffiche : version, langue, format, orientation, paysage, portrait, polices. */
export const TEXTES_FORMULAIRE_AFFICHE = { fr: LANGUES.fr.textes.formulaireAffiche, br: LANGUES.br.textes.formulaireAffiche }
