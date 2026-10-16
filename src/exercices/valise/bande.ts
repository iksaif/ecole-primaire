// La valise — la bande en trois images d'un problème (avant, action, après), pour l'écran et pour la fiche. Pur (lisible par node). Trois cases reliées par
// des flèches ; l'état inconnu est une valise fermée marquée « ? », que la réponse ouvre (`revele`). Les classes sont celles du CSS de l'écran et de la
// fiche : `.bande`, `.case`, `.plateau`, `.objet`, `.fleche`, `.action`, `.signe`, `.inconnu`, `.valise-fermee`.
import { htmlCollection } from '../../dessins/collections.ts'
import type { RenduImages } from '../../images/rendu.ts'
import type { Question } from './generateur.ts'

/** Une valise fermée dessinée (SVG, sans image extérieure) ; `sur` : ce qu'on écrit dessus (« ? » ou le nombre à atteindre). */
const VALISE_FERMEE = '<svg class="valise" viewBox="0 0 80 60" width="64" height="48" aria-hidden="true">'
  + '<path d="M28 14 V8 a4 4 0 0 1 4 -4 h16 a4 4 0 0 1 4 4 V14" fill="none" stroke="#5d3a1a" stroke-width="4"/>'
  + '<rect x="4" y="14" width="72" height="42" rx="7" fill="#c68642" stroke="#5d3a1a" stroke-width="3"/>'
  + '<rect x="4" y="30" width="72" height="4" fill="#5d3a1a" opacity=".35"/>'
  + '<rect x="14" y="38" width="8" height="10" rx="2" fill="#f4d58d" stroke="#5d3a1a" stroke-width="1.5"/>'
  + '<rect x="58" y="38" width="8" height="10" rx="2" fill="#f4d58d" stroke="#5d3a1a" stroke-width="1.5"/></svg>'

/**
 * La bande de la question. `revele` : la réponse est donnée, les « ? » laissent voir ce qu'ils cachaient (la valise s'ouvre : on voit les objets).
 */
export function htmlBande(q: Question, images: RenduImages, revele = false): string {
  const groupe = (n: number): string => htmlCollection(n, q.emoji, images, 'objet')
  const plateau = (n: number): string => `<span class="plateau">${groupe(n)}</span>`
  const ferme = (sur: string): string => `<span class="valise-fermee">${VALISE_FERMEE}<span class="sur-valise">${sur}</span></span>`
  const signe = q.signe === '+' ? '+' : '−'
  /** Un état : les objets (la valise ouverte), ou la valise fermée « ? » tant que la réponse n'est pas donnée. */
  const etat = (n: number | null, inconnu: number): string => (n !== null ? plateau(n) : revele ? plateau(inconnu) : ferme('?'))
  /** Un état connu mais caché dans la valise fermée : le nombre qu'on veut atteindre, en chiffre sur la valise. */
  const but = (n: number): string => ferme(String(n))
  const action = (n: number | null): string => `<span class="action"><span class="signe">${signe}</span>${n !== null ? groupe(n) : revele ? groupe(q.reponse) : '<span class="inconnu">?</span>'}</span>`
  const fleche = '<span class="fleche" aria-hidden="true">➜</span>'
  const case1 = (contenu: string): string => `<span class="case">${contenu}</span>`
  let cases: string[]
  if (q.type === 'complete') cases = [plateau(q.depart ?? 0), action(q.change), q.arrivee !== null ? (revele ? plateau(q.arrivee) : but(q.arrivee)) : '']
  else if (q.type === 'initial') cases = [etat(q.depart, q.reponse), action(q.change), plateau(q.arrivee ?? 0)]
  else cases = [plateau(q.depart ?? 0), action(q.change), etat(q.arrivee, q.reponse)]
  return `<span class="bande">${cases.map(case1).join(fleche)}</span>`
}
