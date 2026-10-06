// « Reprendre » : les derniers exercices ouverts, mémorisés sur l'appareil. Module pur (lisible par node) ; le stockage et
// le branchement sur le routeur sont dans `useRecents.ts`.
//   - on mémorise l'`id` d'une ressource (`exercice:heure`) et l'instant de la dernière ouverture ;
//   - la liste est du plus récent au plus ancien, sans doublon, bornée à `LIMITE_RECENTS` ;
//   - une ressource qui n'existe plus (exercice retiré, exemple hors développement) est ignorée à la lecture, pas effacée.
export interface Recent {
  readonly id: string
  /** instant de la dernière ouverture (ms depuis 1970) */
  readonly ouvert: number
}

export const LIMITE_RECENTS = 6

/** La liste mémorisée, relue avec méfiance : tout ce qui n'est pas `{ id, ouvert }` est écarté. */
export function lireRecents(brut: unknown): Recent[] {
  if (!Array.isArray(brut)) return []
  const lus: Recent[] = []
  for (const e of brut) {
    if (e && typeof e === 'object' && typeof e.id === 'string' && e.id && typeof e.ouvert === 'number' && Number.isFinite(e.ouvert)) lus.push({ id: e.id, ouvert: e.ouvert })
  }
  return lus.slice(0, LIMITE_RECENTS)
}

/** La liste avec `id` en tête (ouvert à `maintenant`), sans son ancienne occurrence, bornée à `limite`. */
export function ajouterRecent(liste: readonly Recent[], id: string, maintenant: number, limite = LIMITE_RECENTS): Recent[] {
  return [{ id, ouvert: maintenant }, ...liste.filter(r => r.id !== id)].slice(0, limite)
}

/** Les récents dont la ressource existe encore. */
export const retenirExistants = (liste: readonly Recent[], existe: (id: string) => boolean): Recent[] => liste.filter(r => existe(r.id))

/** Il y a combien de jours (calendaires, heure locale) : « aujourd'hui », « hier », « il y a n jours ». */
export type Anciennete = { readonly cle: 'aujourdhui' | 'hier' } | { readonly cle: 'jours', readonly n: number }

export function anciennete(ouvert: number, maintenant: number): Anciennete {
  const debut = (t: number): number => new Date(t).setHours(0, 0, 0, 0)
  const jours = Math.round((debut(maintenant) - debut(ouvert)) / 86_400_000)
  if (jours <= 0) return { cle: 'aujourdhui' }
  return jours === 1 ? { cle: 'hier' } : { cle: 'jours', n: jours }
}

/** Entrée du registre d'exercices, pour ce dont le routeur a besoin ici. */
export interface EntreeOuvrable {
  readonly definition: { readonly id: string, readonly route: string }
  readonly exemple?: true
}

/** Adresse d'un exercice → id de sa ressource (`exercice:<id>`), pour les exercices du registre (pas les exemples). */
export function idsParRoute(entrees: readonly EntreeOuvrable[]): Map<string, string> {
  return new Map(entrees.filter(e => !e.exemple).map(e => [e.definition.route, `exercice:${e.definition.id}`]))
}
