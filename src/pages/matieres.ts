// Les matières qui ont une page de la forme « /<matière> » (la langue régionale a la sienne : /brezhoneg). Pur.
import type { Matiere } from '../data/programme.ts'
import type { CleTexte } from '../langues/traduire.ts'

export const MATIERES_PAGE = ['maths', 'francais', 'monde'] as const satisfies readonly Matiere[]
export type MatierePage = (typeof MATIERES_PAGE)[number]

/** Titre de la page (et du document) d'une matière. */
export const TITRE_MATIERE = {
  maths: 'routeur.titre.maths', francais: 'routeur.titre.francais', monde: 'routeur.titre.monde',
} as const satisfies Readonly<Record<MatierePage, CleTexte>>

/** La matière d'un chemin de route (« /maths »), ou `null`. */
export const matiereDeLaRoute = (chemin: string): MatierePage | null => MATIERES_PAGE.find(m => chemin === `/${m}`) ?? null

export const cheminMatiere = (m: MatierePage): string => `/${m}`
/** Les fiches toutes prêtes d'une matière (page de P7). */
export const cheminFiches = (m: MatierePage): string => `/${m}/fiches`
