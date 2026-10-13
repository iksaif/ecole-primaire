// La géométrie — questions sur les figures et les solides : nom, côtés, angle droit, solides, angles droits (lettres aux sommets),
// propriétés, cercle. Pur ; l'ordre des tirages est celui de l'ancienne vue (mêmes fiches).
import type { Rng } from '../../noyau/types.ts'
import { avecChoix } from './choix.ts'
import {
  FIGURES, NOMS_CONCURRENTS, TRIANGLES, ROTATIONS, ROTATIONS_CARRE, FORMES_LIBRES, SOLIDES, PROPRIETES, NATURES, aChoix,
} from './donnees.ts'
import type { FormeAngles, FormeFigure, FormeLibre, Propriete, SolideGeo } from './donnees.ts'
import type { Cle, Contexte, Figure, QAngles, QCercle, QFigure, QPropriete, QSolide } from './types.ts'

const LETTRES_POINTS = 'ABCDEFGHKLMN'.split('')

type Pt = readonly [number, number]
function angleSommet(pts: readonly Pt[], i: number): number {
  const n = pts.length
  const P = pts[i], A = pts[(i + n - 1) % n], B = pts[(i + 1) % n]
  const u = [A[0] - P[0], A[1] - P[1]], v = [B[0] - P[0], B[1] - P[1]]
  const cos = (u[0] * v[0] + u[1] * v[1]) / (Math.hypot(u[0], u[1]) * Math.hypot(v[0], v[1]))
  return Math.acos(Math.max(-1, Math.min(1, cos))) * 180 / Math.PI
}

const estLibre = (forme: FormeAngles): forme is FormeLibre => forme in FORMES_LIBRES

/**
 * Une figure dessinée dans 200 × 200 : { points, rayon, anglesDroits } (cercle : rayon seul). `presqueCarre` (CP) : un rectangle sur deux est
 * presque un carré (une longueur 1,2 à 1,4 fois la largeur), pour qu'on regarde vraiment les côtés.
 */
export function construireFigure(rng: Rng, forme: FormeAngles, presqueCarre = false): Figure {
  let pts: [number, number][]
  if (forme === 'cercle' || forme === 'disque') return { points: [], rayon: rng.entier(55, 70), anglesDroits: [] }
  if (forme === 'carre') { const s = rng.entier(80, 100) / 2; pts = [[-s, -s], [s, -s], [s, s], [-s, s]] }
  else if (forme === 'rectangle' && presqueCarre && rng.vrai(0.5)) {
    const h = rng.entier(70, 85) / 2, w = (h * rng.entier(120, 140)) / 100
    pts = [[-w, -h], [w, -h], [w, h], [-w, h]]
  }
  else if (forme === 'rectangle') { const w = rng.entier(120, 145) / 2, h = rng.entier(55, 75) / 2; pts = [[-w, -h], [w, -h], [w, h], [-w, h]] }
  else if (forme === 'losange') { const a = rng.entier(60, 72), b = rng.entier(34, 44); pts = [[0, -a], [b, 0], [0, a], [-b, 0]] }
  else if (forme === 'triangle_rectangle') { const a = rng.entier(90, 130), b = rng.entier(70, 110); pts = [[0, 0], [a, 0], [0, -b]] }
  else if (estLibre(forme)) pts = rng.choisir(FORMES_LIBRES[forme]).map(([x, y]) => [x, y] as [number, number])
  else pts = rng.choisir(TRIANGLES).map(([x, y]) => [x, y] as [number, number])
  const ang = rng.choisir(forme === 'carre' ? ROTATIONS_CARRE : ROTATIONS) * Math.PI / 180
  pts = pts.map(([x, y]) => [x * Math.cos(ang) - y * Math.sin(ang), x * Math.sin(ang) + y * Math.cos(ang)])
  // Centrer dans 200 × 200 et réduire si besoin (≤ 160)
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1])
  const larg = Math.max(...xs) - Math.min(...xs), haut = Math.max(...ys) - Math.min(...ys)
  const ech = Math.min(1, 160 / Math.max(larg, haut))
  const cx = (Math.max(...xs) + Math.min(...xs)) / 2, cy = (Math.max(...ys) + Math.min(...ys)) / 2
  pts = pts.map(([x, y]) => [100 + (x - cx) * ech, 100 + (y - cy) * ech])
  const anglesDroits = pts.map((_, i) => i).filter(i => Math.abs(angleSommet(pts, i) - 90) < 0.5)
  return { points: pts, rayon: 0, anglesDroits }
}

const nomFigure = ({ T }: Contexte, id: FormeFigure): string => T(`figure.${id}` as Cle)
const nomSolide = ({ T }: Contexte, id: SolideGeo): string => T(`solide.${id}` as Cle)

/** Ce qu'on peut demander d'une figure : son nom ; d'un polygone, aussi ses côtés, ses sommets et (à partir du CE1) s'il a un angle droit. */
function questionsDeFigure(forme: FormeFigure, angleDroit: boolean): QFigure['sous'][] {
  if (forme === 'cercle' || forme === 'disque') return ['nom']
  const sous: QFigure['sous'][] = ['nom', 'cotes', 'sommets']
  if (angleDroit) sous.push('angle')
  return sous
}

/** Figure : son nom, son nombre de côtés ou de sommets, ou si elle a un angle droit. */
export function genFigure(ctx: Contexte): QFigure {
  const { rng, T, niv } = ctx
  const forme = rng.choisir(niv.figures)
  const sous = rng.choisir(questionsDeFigure(forme, niv.angleDroit))
  const f = FIGURES[forme]
  const nom = (id: FormeFigure): string => nomFigure(ctx, id)
  const base = { type: 'figure' as const, sous, forme, cle: `fig-${sous}-${forme}`, ...construireFigure(rng, forme, niv.ficheGuidee) }
  if (sous === 'nom') {
    // les noms « aussi justes » (un carré est un rectangle) : écartés, sauf au CP, où l'on distingue le carré du rectangle
    const exclus = niv.sansInclusion ? [] : NOMS_CONCURRENTS[forme] || []
    const autres = rng.melanger(niv.figures.filter(x => x !== forme && !exclus.includes(x))).slice(0, 3)
    return avecChoix({ ...base, texte: T('figureNomQ'), attendu: nom(forme) },
      rng.melanger([forme, ...autres].map(nom)), nom(forme))
  }
  const attendu = (rep: string): string => `${rep} (${nom(forme)})`
  if (sous === 'cotes') return avecChoix({ ...base, texte: T('figureCotesQ'), attendu: attendu(String(f.cotes)) }, ['3', '4', '5', '6'], String(f.cotes))
  // un polygone a autant de sommets que de côtés
  if (sous === 'sommets') return avecChoix({ ...base, texte: T('figureSommetsQ'), attendu: attendu(String(f.cotes)) }, ['3', '4', '5', '6'], String(f.cotes))
  const reponse = f.angleDroit ? T('oui') : T('non')
  return avecChoix({ ...base, texte: T('figureAngleQ'), attendu: attendu(reponse) }, [T('oui'), T('non')], reponse)
}

/** Solide : son nom, s'il roule, son nombre de faces ou de sommets. */
export function genSolide(ctx: Contexte): QSolide {
  const { rng, T, niv } = ctx
  const solide = rng.choisir(niv.solides)
  const s = SOLIDES[solide]
  const nom = (id: SolideGeo): string => nomSolide(ctx, id)
  const sousDispo: QSolide['sous'][] = ['rouler']
  if (!niv.solidesNommes || niv.solidesNommes.includes(solide)) sousDispo.unshift('nom')
  // reconnaître sans nommer (CP : cylindre et cône sont « à reconnaître ») : « Lequel est un cylindre ? », avec des dessins
  else sousDispo.unshift('lequel')
  if (niv.solidesComptage.includes(solide)) sousDispo.push(...niv.comptes)
  const sous = rng.choisir(sousDispo)
  const base = { type: 'solide' as const, sous, solide, cle: `sol-${sous}-${solide}` }
  if (sous === 'nom') {
    const autres = rng.melanger(niv.solides.filter(x => x !== solide)).slice(0, 3)
    return avecChoix({ ...base, texte: T('solideNomQ'), attendu: nom(solide) },
      rng.melanger([solide, ...autres].map(nom)), nom(solide))
  }
  const attendu = (rep: string): string => `${rep} (${nom(solide)})`
  if (sous === 'rouler') {
    const reponse = s.roule ? T('oui') : T('non')
    return avecChoix({ ...base, texte: T('solideRoulerQ'), attendu: attendu(reponse) }, [T('oui'), T('non')], reponse)
  }
  if (sous === 'lequel') {
    const proposes = rng.melanger([solide, ...rng.melanger(niv.solides.filter(x => x !== solide)).slice(0, 3)])
    return avecChoix({ ...base, proposes, texte: T('solideLequelQ', { nom: nom(solide) }), attendu: nom(solide) }, proposes.map(nom), nom(solide))
  }
  if (sous === 'nature') {
    const reponse = T(`nature.${s.nature!}` as Cle)
    return avecChoix({ ...base, texte: T('solideNatureQ'), attendu: attendu(reponse) }, NATURES.map(n => T(`nature.${n}` as Cle)), reponse)
  }
  if (sous === 'aretes') return avecChoix({ ...base, texte: T('solideAretesQ'), attendu: attendu(String(s.aretes)) }, ['6', '8', '10', '12'], String(s.aretes))
  const reponse = String(sous === 'faces' ? s.faces : s.sommets)
  return avecChoix({ ...base, texte: T(sous === 'faces' ? 'solideFacesQ' : 'solideSommetsQ'), attendu: attendu(reponse) }, ['4', '5', '6', '8'], reponse)
}

/** CE2 : angles droits (lettres aux sommets). `droits` : les lettres des sommets à angle droit, triées. */
export function genAngles({ rng, T, niv }: Contexte): QAngles {
  const forme = rng.choisir(niv.anglesFormes!)
  const fig = construireFigure(rng, forme)
  const n = fig.points.length
  const decal = rng.entier(0, n - 1)
  const lettres = fig.points.map((_, i) => 'ABCD'[(i + decal) % n])
  const droits = fig.anglesDroits.map(i => lettres[i]).sort()
  return {
    type: 'angles', forme, cle: `ang-${forme}-${decal}`, ...fig, lettres, droits,
    texte: T('anglesQ'), attendu: droits.length ? droits.join(', ') : T('aucun'),
  }
}

// Les quatre figures d'une question à choix de propriété, dans l'ordre de `Propriete.figure` (donnees.ts)
const FIGURES_A_CHOIX = ['carre', 'rectangle', 'losange', 'triangleRectangle'] as const
const choixFigures = (T: Contexte['T']): string[] => FIGURES_A_CHOIX.map(id => T(`choixFigure.${id}`))

/** Les propriétés d'un niveau (au CE1 : celles du carré, du rectangle et du triangle rectangle, sans losange). */
export const proprietesDe = (niv: Contexte['niv']): readonly Propriete[] =>
  (niv.proprietes ? PROPRIETES.filter(p => niv.proprietes!.includes(p.id)) : PROPRIETES)

/** Propriétés des figures (« Vrai ou faux ? » ou, au CE2, question à choix parmi les figures). */
export function genPropriete({ rng, T, niv }: Contexte): QPropriete {
  const p = rng.choisir(proprietesDe(niv))
  const texte = T(`propriete.${p.id}` as Cle)
  if (aChoix(p)) {
    const choix = choixFigures(T)
    return avecChoix({ type: 'proprietes' as const, prop: p.id, cle: 'prop-' + p.id, texte, attendu: choix[p.figure!] }, rng.melanger(choix), choix[p.figure!])
  }
  const [vrai, faux] = [T('vrai'), T('faux')]
  const reponse = p.vrai ? vrai : faux
  return avecChoix({ type: 'proprietes' as const, prop: p.id, cle: 'prop-' + p.id, texte: `${T('vraiOuFaux')} ${texte}`, attendu: reponse }, [vrai, faux], reponse)
}

/** CE2 : cercle (centre, rayon, diamètre, mesures). */
export function genCercle({ rng, T, niv }: Contexte): QCercle {
  const sous = rng.choisir(['centre', 'segment', 'segment', 'lequel', 'mesure', 'mesure'] as const)
  const [a, b, c, d, e] = rng.melanger(LETTRES_POINTS).slice(0, 5)
  const base = { type: 'cercle' as const, sous, rot: rng.entier(0, 359), pts: { a, b, c, d, e } }
  if (sous === 'centre') {
    const choix = [T('centreChoix.centre'), T('centreChoix.rayon'), T('centreChoix.diametre'), T('centreChoix.sommet')]
    return avecChoix({ ...base, cle: 'cer-centre', texte: T('centreQ'), attendu: choix[0] }, rng.melanger(choix), choix[0])
  }
  if (sous === 'segment') {
    const cible = rng.choisir(['rayon', 'diametre'] as const)
    const nom = cible === 'rayon' ? `[O${a}]` : `[${b}${c}]`
    const choix = [T('segmentChoix.rayon'), T('segmentChoix.diametre'), T('segmentChoix.cote')]   // [rayon, diamètre, côté]
    const reponse = choix[cible === 'rayon' ? 0 : 1]
    return avecChoix({ ...base, cible, cle: 'cer-seg-' + cible, texte: T('segmentQ', { nom }), attendu: reponse }, [...choix], reponse)
  }
  if (sous === 'lequel') {
    const cible = rng.choisir(['rayon', 'diametre'] as const)
    const segs = { rayon: `[O${a}]`, diametre: `[${b}${c}]`, corde: `[${d}${e}]` }
    return avecChoix({ ...base, cible, cle: 'cer-lequel-' + cible, texte: T(cible === 'rayon' ? 'lequelRayonQ' : 'lequelDiametreQ'), attendu: segs[cible] },
      rng.melanger(Object.values(segs)), segs[cible])
  }
  const r = rng.entier(...niv.rayons!)
  const versDiam = rng.vrai(0.5)
  const bonne = versDiam ? 2 * r : r
  const cands = versDiam ? [r, r + 1, 3 * r, 4 * r, 2 * r + 2] : [2 * r, 4 * r, r + 1, r + 2, 3 * r]
  const autres = [...new Set(cands.filter(x => x !== bonne))].slice(0, 3)
  return avecChoix({
    ...base, r, cle: `cer-mes-${versDiam ? 'd' : 'r'}-${r}`,
    texte: versDiam ? T('mesureDiametreQ', { r }) : T('mesureRayonQ', { d: 2 * r }), attendu: bonne + ' cm',
  }, rng.melanger([bonne, ...autres]).map(x => x + ' cm'), bonne + ' cm')
}
