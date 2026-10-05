// Chargement des JSON des fiches (fiches/index.json, fiches/<slug>.json) : pur et sans Vue, donc lisible par node (test avec
// un faux `fetch`). Le résultat dit pourquoi les données manquent, pour que la page affiche le bon message :
//   absent   : le fichier n'existe pas (404, ou un serveur qui répond par sa page HTML) : le build n'a pas été lancé ;
//   erreur   : le fichier existe mais est illisible, d'une autre version, ou le réseau a échoué.
import { DOSSIER_FICHES, FICHIER_INDEX } from './types.ts'
import type { Entree, IndexFiches } from './types.ts'
import { lireEntree, lireIndex } from './valider.ts'

export type EtatChargement<T> =
  | { etat: 'chargement' }
  | { etat: 'pret', donnees: T }
  | { etat: 'absent' }
  | { etat: 'erreur', message: string }

/** `fetch`, ou ce qui en tient lieu dans un test. */
export type Chercheur = (url: string) => Promise<Pick<Response, 'ok' | 'status' | 'headers' | 'json'>>

/** Base de l'app (Vite : `import.meta.env.BASE_URL`, avec la barre finale) ; '/' hors de Vite. */
export const baseApp = (): string => import.meta.env?.BASE_URL ?? '/'

/** Adresse d'un fichier des fiches : `urlFiches('index.json')`, `urlFiches(image.chemin)`. */
export const urlFiches = (chemin = '', base: string = baseApp()): string => `${base}${DOSSIER_FICHES}/${chemin}`

/** Lit un JSON et le vérifie avec `lire` (qui lève ErreurSchema). Ne lève jamais : tout est dans le résultat. */
export async function chargerJson<T>(url: string, lire: (donnees: unknown) => T, chercher: Chercheur = fetch): Promise<EtatChargement<T>> {
  let reponse
  try {
    reponse = await chercher(url)
  } catch (e) {
    return { etat: 'erreur', message: e instanceof Error ? e.message : String(e) }
  }
  if (reponse.status === 404 || reponse.status === 403) return { etat: 'absent' }
  if (!reponse.ok) return { etat: 'erreur', message: `HTTP ${reponse.status}` }
  // un serveur de développement répond à un chemin inconnu par la page de l'app : ce n'est pas du JSON, c'est « absent »
  if (reponse.headers.get('content-type')?.includes('text/html')) return { etat: 'absent' }
  try {
    return { etat: 'pret', donnees: lire(await reponse.json()) }
  } catch (e) {
    return { etat: 'erreur', message: e instanceof Error ? e.message : String(e) }
  }
}

export const chargerIndex = (chercher?: Chercheur, base?: string): Promise<EtatChargement<IndexFiches>> =>
  chargerJson(urlFiches(FICHIER_INDEX, base), lireIndex, chercher)

export const chargerEntree = (slug: string, chercher?: Chercheur, base?: string): Promise<EtatChargement<Entree>> =>
  chargerJson(urlFiches(`${encodeURIComponent(slug)}.json`, base), lireEntree, chercher)
