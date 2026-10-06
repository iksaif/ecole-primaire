// Adresses des pages « Programme » et « Compétence », pures (lisibles par node). Un lien interne reporte les paramètres de
// contexte de l'adresse courante (langue, vue, références) : on ne les perd pas en changeant de page.
import type { Classe } from '../data/classes.ts'
import { chaineDeQuery } from '../contexte/url.ts'
import { ecrireEtatProgramme } from './etat.ts'
import type { EtatProgramme } from './etat.ts'

/** Paramètres de contexte à reporter (sortie d'`extraireParamsContexte`). */
export type ParamsReportes = Readonly<Record<string, string>>

/** `/competence/<id>?classes=<classe>` : la classe est dans l'adresse (la page la met en avant) ; sans classe, celle du contexte. */
export function adresseCompetence(id: string, classe: Classe | null, reportes: ParamsReportes = {}): string {
  const query = classe ? { ...reportes, classes: classe } : { ...reportes }
  return `/competence/${encodeURIComponent(id)}${chaineDeQuery(query)}`
}

/** `/programme?matiere=…&domaine=…&classes=…` : le tableau d'une matière et d'un domaine pour des classes. */
export function adresseProgramme(etat: EtatProgramme, classes: readonly Classe[], reportes: ParamsReportes = {}): string {
  return `/programme${chaineDeQuery({ ...reportes, classes: classes.join(','), ...ecrireEtatProgramme(etat) })}`
}

/**
 * Un lien à partager dit tout de la vue : les paramètres absents du lien sont ajoutés tels quels. Sans cela le destinataire
 * retomberait sur ses propres défauts (références d'office pour un enseignant, liste sur un petit écran…).
 */
export function completerLien(lien: string, parametres: Readonly<Record<string, string>>): string {
  const [chemin = '', requete = ''] = lien.split('?')
  const presents = new Set(requete.split('&').filter(Boolean).map(p => p.split('=')[0]))
  const ajouts = Object.entries(parametres).filter(([k]) => !presents.has(k)).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
  const tout = [...requete.split('&').filter(Boolean), ...ajouts].join('&')
  return tout ? `${chemin}?${tout}` : chemin
}
