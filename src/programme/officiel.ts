// Les adresses de la lecture des textes officiels : la page « Parcourir le programme officiel » (src/pages/ProgrammeOfficielView.vue) et un
// passage lu dans l'app (src/pages/TexteOfficielView.vue). Pur (lisible par node).
import type { SourceId } from '../data/programme.ts'

export const ADRESSE_PROGRAMME_OFFICIEL = '/programme/officiel'

/**
 * Les textes qui ne sont pas des BO : un document de l'académie de Rennes (breton) ou d'Éduscol (programme consolidé). Les reprendre dans l'app
 * demande de confirmer leurs conditions de réutilisation (à faire) : en attendant, ils n'ont pas de lecture dans l'app, seulement le lien vers le PDF.
 */
const TEXTES_A_CONFIRMER: readonly SourceId[] = ['bretonA1', 'bretonCP', 'c1consolide', 'exemplesCM1', 'exemplesCM2', 'exemples6e']

/** Passer à `true` quand les conditions de réutilisation de ces textes sont confirmées, puis relancer `node scripts/generer/programmes.ts`. */
export const LECTURE_DES_TEXTES_A_CONFIRMER = false

/** Ce texte se lit-il dans l'app ? Non pour un texte dont la reprise n'est pas confirmée. */
export const lectureDisponible = (source: SourceId): boolean => LECTURE_DES_TEXTES_A_CONFIRMER || !TEXTES_A_CONFIRMER.includes(source)

/** La page « Parcourir le programme officiel » à l'ancre d'un texte (`#<texte>`, clés de SOURCES). */
export const adresseDuTexteOfficiel = (source: SourceId): string => `${ADRESSE_PROGRAMME_OFFICIEL}#${source}`

/** Une page d'un texte lue dans l'app ; `competence` : celle dont on surligne le passage. */
export function adresseDeLaPage(source: SourceId, page: number, competence?: string): string {
  const chemin = `${ADRESSE_PROGRAMME_OFFICIEL}/${source}/${page}`
  return competence ? `${chemin}?competence=${encodeURIComponent(competence)}` : chemin
}
