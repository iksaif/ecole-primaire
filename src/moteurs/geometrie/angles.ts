// La géométrie (moteur commun) — deux types de questions du CE1 (c2maths p. 34) :
//   aigus      « L'élève sait dire qu'un angle n'est pas droit sans équerre quand il n'y a aucun doute. Il sait alors dire si l'angle est aigu
//              (plus petit qu'un angle droit) ou obtus (plus grand qu'un angle droit) » : un angle à classer, aigu, droit ou obtus ;
//   justifier  « L'élève sait dire qu'un polygone n'est pas un rectangle en le justifiant par une des propriétés du rectangle : « Ce n'est
//              pas un rectangle car l'un de ses angles n'est pas droit. » » : une figure, « Est-ce un carré / un rectangle ? », la raison.
// Pur ; le dessin de l'angle aussi (une chaîne SVG).
import { avecChoix } from './choix.ts'
import { construireFigure } from './questionsFigures.ts'
import type { Cle, Contexte, QAigu, QJustifier } from './types.ts'

/** Les trois sortes d'angles, dans l'ordre des réponses. */
export const SORTES = ['aigu', 'droit', 'obtus'] as const
export type SorteAngle = typeof SORTES[number]

// des angles loin de l'angle droit (« quand il n'y a aucun doute ») et, au CE2, plus près (l'équerre sert alors)
const MESURES: Readonly<Record<SorteAngle, readonly number[]>> = { aigu: [30, 40, 45, 55, 65], droit: [90], obtus: [115, 125, 135, 145, 155] }
const MESURES_PROCHES: Readonly<Record<SorteAngle, readonly number[]>> = { aigu: [70, 75, 80], droit: [90], obtus: [100, 105, 110] }

/**
 * Aigu, droit ou obtus ? `proches` : des angles près de l'angle droit (CE2 : « en utilisant l'équerre si la réponse n'est pas évidente »).
 * Une fiche impose la sorte (`imposee`, deux de chaque) et, au CE2, la proximité (`procheImpose`).
 */
export function genAigu({ rng, T }: Contexte, proches: boolean, imposee?: SorteAngle, procheImpose?: boolean): QAigu {
  const sorte = imposee ?? rng.choisir(SORTES)
  const proche = procheImpose ?? (proches && rng.vrai(0.5))
  const mesures = proche ? MESURES_PROCHES : MESURES
  const degres = rng.choisir(mesures[sorte])
  const rotation = rng.choisir([0, 20, 45, 90, 160, 200, 270, 310])
  const choix = SORTES.map(s => T(`angle.${s}` as Cle))
  const reponse = T(`angle.${sorte}` as Cle)
  return avecChoix({
    type: 'aigus' as const, sorte, degres, rotation, cle: `aig-${degres}-${rotation}`, texte: T('aiguQ'), attendu: reponse,
  }, choix, reponse)
}

/** Un angle dessiné : deux demi-droites depuis un sommet, et un arc entre elles ; `taille` en pixels (fiche : en unités de la page). */
export function svgAngle(q: Pick<QAigu, 'degres' | 'rotation'>, taille = 200): string {
  const c = 100, long = 92
  const point = (angle: number, r: number): string => {
    const a = ((angle + q.rotation) * Math.PI) / 180
    return `${(c + r * Math.cos(a)).toFixed(1)},${(c - r * Math.sin(a)).toFixed(1)}`
  }
  const [x1, y1] = point(0, long).split(','), [x2, y2] = point(q.degres, long).split(',')
  const [ax, ay] = point(0, 26).split(','), [bx, by] = point(q.degres, 26).split(',')
  const grand = q.degres > 180 ? 1 : 0
  return `<svg viewBox="0 0 200 200" width="${taille}" height="${taille}" xmlns="http://www.w3.org/2000/svg">`
    + `<path d="M${ax} ${ay} A26 26 0 ${grand} 0 ${bx} ${by}" fill="none" stroke="#e8a33d" stroke-width="3"/>`
    + `<path d="M${x1} ${y1} L${c} ${c} L${x2} ${y2}" fill="none" stroke="#2c3e50" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`
    + `<circle cx="${c}" cy="${c}" r="4" fill="#2c3e50"/></svg>`
}

/** Les raisons proposées, dans l'ordre des choix. */
export const RAISONS = ['oui', 'angle', 'cotes', 'nbCotes'] as const
export type Raison = typeof RAISONS[number]

/**
 * Les cas : la figure dessinée, la question posée (carré ou rectangle), la bonne raison ; le losange seulement quand il est au programme.
 * Une seule des propositions doit être vraie (tests/geometrie-justifier.test.mjs) : pas de triangle (« un de ses angles n'est pas droit » y
 * serait vrai aussi), et pour un rectangle, pas de « ses quatre côtés n'ont pas la même longueur » (vrai d'un rectangle).
 */
interface Cas { id: string, forme: Parameters<typeof construireFigure>[1], question: 'carre' | 'rectangle', raison: Raison, losange?: boolean }
const CAS: readonly Cas[] = [
  { id: 'rect-carre', forme: 'rectangle', question: 'carre', raison: 'cotes' },
  { id: 'unangle-rect', forme: 'un_angle', question: 'rectangle', raison: 'angle' },
  { id: 'sansangle-rect', forme: 'sans_angle', question: 'rectangle', raison: 'angle' },
  { id: 'trapeze-rect', forme: 'trapeze_rectangle', question: 'rectangle', raison: 'angle' },
  { id: 'carre-carre', forme: 'carre', question: 'carre', raison: 'oui' },
  { id: 'rect-rect', forme: 'rectangle', question: 'rectangle', raison: 'oui' },
  { id: 'losange-carre', forme: 'losange', question: 'carre', raison: 'angle', losange: true },
]

/** Est-ce un carré / un rectangle ? Oui, ou non et pourquoi. `avecLosange` : le losange est au programme (CE2). */
export function genJustifier(ctx: Contexte, avecLosange: boolean, impose?: string): QJustifier {
  const { rng, T } = ctx
  const cas = CAS.find(c => c.id === impose) ?? rng.choisir(CAS.filter(c => avecLosange || !c.losange))
  const figure = construireFigure(rng, cas.forme)
  const raisons = cas.question === 'rectangle' ? RAISONS.filter(r => r !== 'cotes') : RAISONS
  const choix = raisons.map(r => T(`raison.${r}` as Cle))
  const reponse = T(`raison.${cas.raison}` as Cle)
  return avecChoix({
    type: 'justifier' as const, cas: cas.id, question: cas.question, forme: cas.forme, ...figure, cle: `jus-${cas.id}`,
    texte: T(`justifierQ.${cas.question}` as Cle), attendu: reponse,
  }, choix, reponse)
}
