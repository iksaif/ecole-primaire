// Rubriques de la barre de navigation : quelles entrées, vers où, dans quel ordre. Pur (lisible par node).
// Maths · Français · Le Monde · la langue régionale (si elle est active) · Programme (profil enseignant seulement : pour les
// autres, le programme est accessible depuis l'accueil et le pied de page).
import type { Profil } from '../contexte/types.ts'
import type { Langue } from '../langues/registre.ts'
import { cheminRegional } from '../router/chemins.ts'

export type CleRubrique = 'shell.rubriques.maths' | 'shell.rubriques.francais' | 'shell.rubriques.monde' | 'shell.rubriques.programme'

export interface Rubrique {
  readonly id: 'maths' | 'francais' | 'monde' | 'regionale' | 'programme'
  readonly chemin: string
  /** emoji devant le nom ; absent pour la langue régionale (son drapeau le remplace) */
  readonly emoji?: string
  /** clé du nom ; absente pour la langue régionale (son nom, dans elle-même, vient du registre) */
  readonly cle?: CleRubrique
  readonly langue?: Langue
  /** chemins dont la page « appartient » à la rubrique (une page d'exercice garde sa rubrique allumée) */
  readonly sous: readonly string[]
}

export function rubriques(regionale: Langue | null, profil: Profil): Rubrique[] {
  return [
    { id: 'maths', chemin: '/maths', emoji: '🔢', cle: 'shell.rubriques.maths', sous: ['/maths'] },
    { id: 'francais', chemin: '/francais', emoji: '📝', cle: 'shell.rubriques.francais', sous: ['/francais'] },
    { id: 'monde', chemin: '/monde', emoji: '🌍', cle: 'shell.rubriques.monde', sous: ['/monde'] },
    ...(regionale ? [{ id: 'regionale', chemin: cheminRegional(regionale), langue: regionale, sous: [cheminRegional(regionale)] } as const] : []),
    ...(profil === 'enseignant' ? [{ id: 'programme', chemin: '/programme', cle: 'shell.rubriques.programme', sous: ['/programme', '/competence'] } as const] : []),
  ]
}

/** La rubrique est la page courante, ou une page qui en dépend (« /maths/heure » allume « Maths »). */
export const rubriqueActive = (rubrique: Rubrique, chemin: string): boolean =>
  rubrique.sous.some(s => chemin === s || chemin.startsWith(`${s}/`))
