// Les matières qui ont une page de la forme « /<matière> », et la langue régionale (/brezhoneg), page de la matière `regionale`. Pur.
import type { Matiere } from '../data/programme.ts'
import { REGIONALES } from '../langues/registre.ts'
import type { Langue } from '../langues/registre.ts'
import type { CleTexte } from '../langues/traduire.ts'
import { cheminRegional } from '../router/chemins.ts'

export const MATIERES_PAGE = ['maths', 'francais', 'monde'] as const satisfies readonly Matiere[]
export type MatierePage = (typeof MATIERES_PAGE)[number]

/** Titre de la page (et du document) d'une matière. */
export const TITRE_MATIERE = {
  maths: 'routeur.titre.maths', francais: 'routeur.titre.francais', monde: 'routeur.titre.monde',
} as const satisfies Readonly<Record<MatierePage, CleTexte>>

/** Nom court d'une matière (celui de la barre : « Maths », « Le Monde »). */
export const NOM_COURT = {
  maths: 'shell.rubriques.maths', francais: 'shell.rubriques.francais', monde: 'shell.rubriques.monde',
} as const satisfies Readonly<Record<MatierePage, CleTexte>>

/** La matière d'un chemin de route (« /maths »), ou `null`. */
export const matiereDeLaRoute = (chemin: string): MatierePage | null => MATIERES_PAGE.find(m => chemin === `/${m}`) ?? null

/** La langue régionale dont c'est la page (« /brezhoneg »), ou `null`. */
export const langueRegionaleDeLaRoute = (chemin: string): Langue | null => REGIONALES.find(l => cheminRegional(l) === chemin) ?? null

export const cheminMatiere = (m: MatierePage): string => `/${m}`
/** Les fiches toutes prêtes d'une matière (page de P7). */
export const cheminFiches = (m: MatierePage): string => `/${m}/fiches`
