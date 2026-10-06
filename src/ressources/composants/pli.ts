// État de pli des domaines d'une page de matière, mémorisé par domaine. Pur (lisible par node) ; le stockage est dans `usePlis.ts`.
// Un domaine est proposé ouvert s'il a des ressources pour les classes choisies, replié sinon ; ce que le lecteur a ouvert ou
// refermé lui-même l'emporte (et reste vrai quand il change de classe).
import type { DomaineId } from '../types.ts'

export type Plis = Readonly<Partial<Record<string, boolean>>>

/** L'état mémorisé, relu avec méfiance : seuls les booléens sont gardés. */
export function lirePlis(brut: unknown): Plis {
  if (!brut || typeof brut !== 'object' || Array.isArray(brut)) return {}
  return Object.fromEntries(Object.entries(brut).filter(([, v]) => typeof v === 'boolean'))
}

/** Le domaine est-il ouvert ? Le choix du lecteur d'abord, sinon : ouvert quand il n'est pas replié par défaut. */
export const estOuvert = (domaine: DomaineId, replieParDefaut: boolean, plis: Plis): boolean => plis[domaine] ?? !replieParDefaut

export const avecPli = (plis: Plis, domaine: DomaineId, ouvert: boolean): Plis => ({ ...plis, [domaine]: ouvert })
