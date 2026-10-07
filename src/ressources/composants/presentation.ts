// Présentation commune des ressources : emojis (une seule table par notion), genre affiché, noms de domaine, adresses d'action.
// Pur (lisible par node).
import type { RouteLocationRaw } from 'vue-router'
import type { Vue } from '../../contexte/types.ts'
import { domaineDe } from '../../data/programme.ts'
import { CYCLE_DE } from '../../data/classes.ts'
import { LANGUES, LANGUE_SOURCE } from '../../langues/registre.ts'
import { lireFeuille } from '../../langues/traduire.ts'
import type { Classe, DomaineId, Langue, Matiere, RessourceDeContenu, Usage } from '../types.ts'

// langue régionale : 🗣️ quand il faut du texte ; les pages montrent son drapeau dessiné (IconeMatiere : le Gwenn-ha-du n'existe pas en emoji)
export const EMOJI_MATIERE: Readonly<Record<Matiere, string>> = { maths: '🔢', francais: '📝', monde: '🌍', regionale: '🗣️' }
export const EMOJI_BADGE = { jeu: '🎮', imprimable: '🖨️' } as const
export const EMOJI_USAGE: Readonly<Record<Usage, string>> = { apprendre: '📘', sentrainer: '✏️' }
export const EMOJI_VUE: Readonly<Record<Vue, string>> = { cartes: '▦', liste: '☰' }
export const EMOJI_ACCUEIL = { programme: '📚', fiches: '📄', reprendre: '▶️', copier: '🔗', classe: '🎒', aVenir: '🚧' } as const

/** « CE1 + CE2 » */
export const classesEnTexte = (classes: readonly Classe[]): string => classes.map(c => c.toUpperCase()).join(' + ')

export const majuscule = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1)

/** Genre affiché d'une ressource de contenu (clé de `ressource.genre.*`). */
export type Genre = 'exercice' | 'generateur' | 'affiche' | 'fiche'
export const genreDe = (r: RessourceDeContenu): Genre => (r.type === 'exercice' ? (r.badges.jeu ? 'exercice' : 'generateur') : r.type)
export const cleGenre = (g: Genre): `ressource.genre.${Genre}` => `ressource.genre.${g}`

/** Le nom d'un domaine dans une langue d'interface (catalogue `domaines`), à défaut son nom court du programme. */
/** Le titre d'un groupe de la page d'une matière : le nom du domaine, ou « Plusieurs domaines » (filtres.ts, PLUSIEURS_DOMAINES). */
export function nomGroupe(id: string, langue: Langue): string {
  if (id !== 'plusieurs-domaines') return nomDomaine(id as DomaineId, langue)
  const feuille = lireFeuille(LANGUES[langue].textes, 'ressource.plusieursDomaines') ?? lireFeuille(LANGUES[LANGUE_SOURCE].textes, 'ressource.plusieursDomaines')
  return typeof feuille === 'string' ? feuille : id
}
/** L'emoji d'un groupe : celui du domaine, ou 🧭 pour « Plusieurs domaines ». */
export const emojiGroupe = (id: string, emojis: Readonly<Record<string, string>>): string => (id === 'plusieurs-domaines' ? '🧭' : emojis[id] ?? '')

export function nomDomaine(id: DomaineId, langue: Langue): string {
  const feuille = lireFeuille(LANGUES[langue].textes, `domaines.${id}`) ?? lireFeuille(LANGUES[LANGUE_SOURCE].textes, `domaines.${id}`)
  return typeof feuille === 'string' ? feuille : domaineDe(id)?.court ?? id
}

/** Les cycles d'un domaine qui concernent les classes choisies (aucune classe : tous ceux du domaine). */
export function cyclesDuDomaine(id: DomaineId, classes: readonly Classe[]): number[] {
  const cycles = domaineDe(id)?.cycles ?? []
  const voulus = classes.map(c => CYCLE_DE[c])
  return cycles.filter(c => !voulus.length || voulus.includes(c))
}

/** L'adresse « Imprimer » d'une ressource : l'onglet d'impression d'un exercice ; rien pour les autres (leur page est déjà la feuille). */
export function lienImprimer(r: RessourceDeContenu): RouteLocationRaw | null {
  return r.type === 'exercice' && r.badges.imprimable ? { path: r.route, query: { mode: 'imprimer' } } : null
}

/**
 * L'adresse d'une ressource, ouverte dans une langue de contenu (page de la langue régionale) : `contenu=` pour un exercice
 * (src/noyau/langueContenu.ts), `langues=` pour une affiche (lireLien) ; sans langue, son adresse telle quelle.
 */
export function lienDansLaLangue(ressource: Pick<RessourceDeContenu, 'route' | 'type'>, langue?: Langue): string {
  if (!langue) return ressource.route
  const param = ressource.type === 'affiche' ? 'langues' : 'contenu'
  const separateur = ressource.route.includes('?') ? '&' : '?'
  return `${ressource.route}${separateur}${param}=${langue}`
}
