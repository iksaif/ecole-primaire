// Tracer à la règle — générateur : QUOI poser comme questions, et comment les corriger. Pur : aucun import de Vue, aucun Math.random (le
// hasard vient de `rng`), donc lisible par node, par les tests et par le build des fiches. Trois types de questions (definition.ts) :
//   alignes     A, B et trois croix : laquelle est alignée avec A et B ? (des millimètres, sur une feuille blanche)
//   completer   un carré dont un côté est tracé, un rectangle dont deux côtés consécutifs sont tracés : placer les sommets qui manquent
//   reproduire  une figure sur papier pointé (ou quadrillé au CE2) : la reproduire en reliant des points
import type { Classe, Contraintes, ParamsGenerateur, Verdict } from '../../noyau/types.ts'
import type { ReglagesDeDefinition } from '../../noyau/definir.ts'
import { tirerUniques } from '../../noyau/uniques.ts'
import type { CleContenu } from '../../langues/catalogue.ts'
import type DEFINITION from './definition.ts'
import type { CONTENU } from './textes.ts'
import { FIGURES, ajoute, encombrement, memeFigure, memePoint, referme, retire, segmentsElementaires } from './figures.ts'
import type { FigureAReproduire, Pt } from './figures.ts'
import { BORNES, FIGURES_A_CONSTRUIRE, constructionJuste, constructionModele } from './construire.ts'
import type { FigureAConstruire, Mesures } from './construire.ts'

type Reglages = ReglagesDeDefinition<typeof DEFINITION>
type Cle = CleContenu<typeof CONTENU>
type Params = ParamsGenerateur<Reglages, Cle>
type Rng = Params['rng']
type T = Params['T']
export type TypeQuestion = 'alignes' | 'completer' | 'reproduire' | 'construire'
export type { Pt } from './figures.ts'

interface Base { cle: string, texte: string, attendu: string }
/**
 * Points alignés : A, B et trois croix (en millimètres, dans le champ CHAMP) ; `bonne` : l'indice de la croix alignée avec A et B, ou
 * AUCUN (3) quand aucune ne l'est (une fois sur quatre : on ne répond pas au hasard « une des trois »).
 */
export interface QAlignes extends Base { type: 'alignes', a: Pt, b: Pt, candidats: Pt[], lettres: string[], bonne: number, options: { label: string }[] }
/** Compléter : les sommets connus, les côtés déjà tracés ; `solutions` : les sommets qui manquent (un carré en a deux possibles). */
export interface QCompleter extends Base {
  type: 'completer', figure: FigureACompleter, support: Support, colonnes: number, lignes: number
  /** triangle rectangle : le sommet de l'angle droit (marqué A) */
  sommetAngleDroit?: Pt
  /** l'angle droit est au programme (à partir du CE1) : le retour peut en parler */
  angleDroit: boolean
  connus: Pt[], cotes: [Pt, Pt][], solutions: Pt[][], aTrouver: number
}
/** Reproduire : le modèle (sommets, la figure se referme) sur une grille de `colonnes` × `lignes` points. */
export interface QReproduire extends Base {
  type: 'reproduire', figure: string, programme: FigureAReproduire['programme'], support: Support, colonnes: number, lignes: number, modele: Pt[]
}
/**
 * Construire (CE1, CE2) : une figure donnée par ses mesures ; `unite` : des carreaux à l'écran, des centimètres sur la fiche (papier uni) ;
 * `codeLongueurs` : coder aussi les côtés de même longueur (CE2, p. 36 ; au CE1 : le code de l'angle droit seulement, p. 34).
 */
export interface QConstruire extends Base {
  type: 'construire', figure: FigureAConstruire, mesures: Mesures, unite: 'carreaux' | 'cm', support: Support, colonnes: number, lignes: number
  codeLongueurs: boolean
}
export type Question = QAlignes | QCompleter | QReproduire | QConstruire

/** La réponse : la lettre choisie (alignés), les points placés (compléter), le tracé, point après point (reproduire). */
export type Reponse = { choix: number } | { points: Pt[] } | { trace: Pt[] }

/** Ce que tire la fiche : une rubrique par type coché, dans l'ordre de la fiche. */
export interface TirageFiche { niveau: Classe, alignes?: QAlignes[], completer?: QCompleter[], reproduire?: QReproduire[], construire?: QConstruire[] }

export type Support = 'pointe' | 'quadrille'

/** Le champ des points alignés, en millimètres (la fiche le dessine à cette taille). */
export const CHAMP = { largeur: 80, hauteur: 60, marge: 6 } as const
const LETTRES = ['C', 'D', 'E']
/** L'indice de la réponse « aucun point n'est aligné ». */
export const AUCUN = 3
const ECART_MIN_POINTS = 9    // mm entre deux points du champ : les croix et leurs lettres ne se touchent pas

interface DonneesNiveau {
  /** points alignés : de combien (mm) une croix non alignée s'écarte de la droite ; les directions de la droite (degrés) */
  ecart: readonly [number, number]
  /** CP : une question sur quatre a un écart fin, pour lequel la règle sert (« quand la réponse n'est pas perceptible de façon évidente », p. 32) */
  ecartFin?: readonly [number, number]
  directions: readonly number[]
  /** papier pointé ou quadrillage, et le nombre de points de la grille */
  support: Support
  colonnes: number
  lignes: number
  /** compléter : des côtés obliques (CE1) */
  obliques: boolean
  /** l'angle droit est au programme (CE1) */
  angleDroit: boolean
  /** reproduire : les figures proposées */
  figures: readonly FigureAReproduire[]
}

// CP : un écart qui se voit (« repérer visuellement des alignements ») ; CE1 : un écart fin, pour lequel la règle sert (« quand la réponse
// n'est pas perceptible de façon évidente »)
const NIVEAUX: Readonly<Record<'cp' | 'ce1' | 'ce2', DonneesNiveau>> = {
  cp: { ecart: [6, 8], ecartFin: [3, 4], directions: [0, 90, 45, -45], support: 'pointe', colonnes: 7, lignes: 6, obliques: false, angleDroit: false, figures: FIGURES.filter(f => f.depuis === 'cp') },
  ce1: {
    ecart: [2.5, 4], directions: [0, 90, 45, -45, 30, -30, 60, -60, 20, -20], support: 'pointe', colonnes: 7, lignes: 6, obliques: true, angleDroit: true, figures: FIGURES.filter(f => f.depuis !== 'ce2'),
  },
  ce2: { ecart: [2.5, 4], directions: [0, 90], support: 'quadrille', colonnes: 7, lignes: 6, obliques: true, angleDroit: true, figures: FIGURES },
}
const donneesDe = (niveau: Classe): DonneesNiveau => NIVEAUX[niveau as keyof typeof NIVEAUX] ?? NIVEAUX.ce1

const arrondi = (x: number): number => Math.round(x * 10) / 10
const pt = (x: number, y: number): Pt => ({ x: arrondi(x), y: arrondi(y) })
const distance = (a: Pt, b: Pt): number => Math.hypot(a.x - b.x, a.y - b.y)
/** Le coin en bas à droite du champ, où la fiche met la case « aucun » : aucune croix n'y tombe. */
export const COIN_AUCUN = { x: CHAMP.largeur - 26, y: CHAMP.hauteur - 11 } as const
const dansLeChamp = (q: Pt): boolean => {
  const dedans = q.x >= CHAMP.marge && q.x <= CHAMP.largeur - CHAMP.marge && q.y >= CHAMP.marge && q.y <= CHAMP.hauteur - CHAMP.marge
  const dansLeCoin = q.x >= COIN_AUCUN.x && q.y >= COIN_AUCUN.y
  return dedans && !dansLeCoin
}

/** Tous les points sont-ils assez loin les uns des autres ? */
function bienEspaces(points: readonly Pt[]): boolean {
  return points.every((a, i) => points.every((b, j) => j <= i || distance(a, b) >= ECART_MIN_POINTS))
}

// ── Points alignés ──

/** Une tentative de placement : A, B, et trois croix le long de (AB), dont deux décalées ; `null` si une croix sort du champ. */
function essaiAlignes(niv: DonneesNiveau, degres: number, bonne: number, rng: Rng): Omit<QAlignes, keyof Base | 'type' | 'lettres' | 'options'> | null {
  const angle = (degres * Math.PI) / 180
  const d = { x: Math.cos(angle), y: -Math.sin(angle) }   // y vers le bas : un angle positif monte vers la droite
  const normale = { x: -d.y, y: d.x }
  const a = pt(rng.entier(CHAMP.marge, CHAMP.largeur - CHAMP.marge), rng.entier(CHAMP.marge, CHAMP.hauteur - CHAMP.marge))
  const ab = rng.entier(12, 20)
  const b = pt(a.x + d.x * ab, a.y + d.y * ab)
  // où tombent les trois croix le long de la droite : avant A, entre A et B, après B
  const places = rng.melanger([-20, -10, ab / 2, ab + 10, ab + 20, ab + 30]).slice(0, 3)
  const fin = niv.ecartFin && rng.vrai(0.25)
  const [min, max] = fin ? niv.ecartFin! : niv.ecart
  const ecart = rng.entier(min * 10, max * 10) / 10
  const candidats = places.map((s, i) => {
    const decalage = i === bonne ? 0 : ecart * (rng.vrai(0.5) ? 1 : -1)
    return pt(a.x + d.x * s + normale.x * decalage, a.y + d.y * s + normale.y * decalage)
  })
  const tous = [a, b, ...candidats]
  if (!tous.every(dansLeChamp) || !bienEspaces(tous)) return null
  return { a, b, candidats, bonne }
}

function genAlignes(niv: DonneesNiveau, rng: Rng, T: T, reponse?: number): QAlignes {
  // la direction est tirée une fois : on ne réessaie que les positions (sinon les directions qui tiennent le mieux dans le champ, les
  // horizontales, l'emporteraient)
  const degres = rng.choisir(niv.directions)
  // la réponse : C, D, E ou « aucun » ; une fiche l'impose (ses réponses sont mélangées et chacune sert)
  const bonne = reponse ?? rng.entier(0, 3)
  let placement = essaiAlignes(niv, degres, bonne, rng)
  for (let essai = 0; !placement && essai < 500; essai++) placement = essaiAlignes(niv, degres, bonne, rng)
  // filet : une droite horizontale au milieu du champ (n'arrive pas avec les tailles ci-dessus, mais une fiche ne doit jamais échouer)
  const p = placement ?? { a: pt(12, 35), b: pt(32, 35), candidats: [pt(50, 35), pt(64, 35 + niv.ecart[0]), pt(76, 35 - niv.ecart[0])], bonne: 0 }
  return {
    type: 'alignes', ...p, lettres: LETTRES, options: [...LETTRES, T('aucun')].map(label => ({ label })),
    cle: `al-${p.a.x},${p.a.y}-${p.b.x},${p.b.y}`, texte: T('alignesQ'), attendu: p.bonne === AUCUN ? T('aucun') : LETTRES[p.bonne],
  }
}

// ── Compléter un carré ou un rectangle ──

/** Un quart de tour (sens des aiguilles d'une montre, y vers le bas), `n` fois. */
function tourne(v: Pt, n: number): Pt {
  let r = v
  for (let i = 0; i < n; i++) r = { x: -r.y, y: r.x }
  return r
}
// côtés obliques du CE1 : un pas de (2, 1), (1, 2)… sur le papier pointé
const DIRECTIONS_OBLIQUES: readonly [number, number][] = [[1, 1], [2, 1], [1, 2]]

/** Les deux côtés issus d'un sommet : `u`, puis `v` (un quart de tour de `u`, de même longueur pour un carré). */
function cotesDeDepart(figure: 'carre' | 'rectangle', oblique: boolean, rng: Rng): [Pt, Pt] {
  if (oblique) {
    const [a, b] = rng.choisir(DIRECTIONS_OBLIQUES)
    const k = figure === 'carre' ? 1 : 2
    return [{ x: a, y: b }, { x: -b * k, y: a * k }]
  }
  if (figure === 'carre') {
    const s = rng.entier(2, 3)
    return [{ x: s, y: 0 }, { x: 0, y: s }]
  }
  const longueur = rng.entier(3, 4), largeur = rng.entier(1, 2)
  return [{ x: longueur, y: 0 }, { x: 0, y: largeur }]
}

function essaiCompleter(figure: 'carre' | 'rectangle', niv: DonneesNiveau, rng: Rng): Pt[] | null {
  const oblique = niv.obliques && rng.vrai(0.5)
  const [u0, v0] = cotesDeDepart(figure, oblique, rng)
  const quart = rng.entier(0, 3)
  const u = tourne(u0, quart)
  const v = rng.vrai(0.5) ? tourne(v0, quart) : tourne({ x: -v0.x, y: -v0.y }, quart)
  const forme = [{ x: 0, y: 0 }, u, ajoute(u, v), v]
  const xs = forme.map(q => q.x), ys = forme.map(q => q.y)
  const xMin = -Math.min(...xs), xMax = niv.colonnes - 1 - Math.max(...xs)
  const yMin = -Math.min(...ys), yMax = niv.lignes - 1 - Math.max(...ys)
  if (xMin > xMax || yMin > yMax) return null
  const origine = { x: rng.entier(xMin, xMax), y: rng.entier(yMin, yMax) }
  return forme.map(q => ajoute(q, origine))
}

/** Les figures à compléter : carré et rectangle (CP, p. 32) ; au CE1, aussi le triangle rectangle (« compléter […] un triangle rectangle », p. 34). */
export type FigureACompleter = 'carre' | 'rectangle' | 'triangleRectangle'
// à tour de rôle (le rang de la question) : une fiche a autant de chaque
const FIGURES_A_COMPLETER: readonly FigureACompleter[] = ['carre', 'rectangle']
const FIGURES_A_COMPLETER_CE1: readonly FigureACompleter[] = ['carre', 'rectangle', 'triangleRectangle']

function genCompleter(niv: DonneesNiveau, rng: Rng, T: T, rang: number): QCompleter {
  const figures = niv.angleDroit ? FIGURES_A_COMPLETER_CE1 : FIGURES_A_COMPLETER
  const figure = figures[rang % figures.length]
  // le triangle rectangle se tire comme un carré : ses deux côtés de l'angle droit ont la même longueur (on compte les points)
  const forme0 = figure === 'rectangle' ? 'rectangle' : 'carre'
  let sommets = essaiCompleter(forme0, niv, rng)
  for (let essai = 0; !sommets && essai < 300; essai++) sommets = essaiCompleter(forme0, niv, rng)
  const forme = sommets ?? [{ x: 1, y: 1 }, { x: 3, y: 1 }, { x: 3, y: 3 }, { x: 1, y: 3 }]
  // on commence le tracé à un sommet tiré : les côtés déjà tracés ne sont pas toujours en haut à gauche
  const debut = rng.entier(0, 3)
  const s = [0, 1, 2, 3].map(i => forme[(debut + i) % 4])
  const commun = {
    type: 'completer' as const, figure, support: niv.support, colonnes: niv.colonnes, lignes: niv.lignes, angleDroit: niv.angleDroit, texte: T(`completerQ.${figure}`),
  }
  const cle = `co-${figure}-${s.map(q => `${q.x},${q.y}`).join(';')}`
  if (figure === 'rectangle') {
    return { ...commun, cle, connus: s.slice(0, 3), cotes: [[s[0], s[1]], [s[1], s[2]]], solutions: [[s[3]]], aTrouver: 1, attendu: nomPoint(s[3]) }
  }
  const dansGrille = (q: Pt): boolean => q.x >= 0 && q.y >= 0 && q.x < niv.colonnes && q.y < niv.lignes
  if (figure === 'triangleRectangle') {
    // l'angle droit en A = s[1], le côté [s0 s1] tracé ; le sommet qui manque : s[2], ou son symétrique de l'autre côté du segment
    const autreCote = retire(s[1], retire(s[2], s[1]))
    const solutions = dansGrille(autreCote) ? [[s[2]], [autreCote]] : [[s[2]]]
    return { ...commun, cle, connus: s.slice(0, 2), cotes: [[s[0], s[1]]], sommetAngleDroit: s[1], solutions, aTrouver: 1, attendu: nomPoint(s[2]) }
  }
  // un carré dont un côté est tracé : deux carrés possibles, de part et d'autre du côté (le second s'il tient dans la grille)
  const autre = [retire(s[1], retire(s[2], s[1])), retire(s[0], retire(s[3], s[0]))]
  const solutions = autre.every(dansGrille) ? [[s[2], s[3]], autre] : [[s[2], s[3]]]
  return { ...commun, cle, connus: s.slice(0, 2), cotes: [[s[0], s[1]]], solutions, aTrouver: 2, attendu: `${nomPoint(s[2])} ${nomPoint(s[3])}` }
}

/** Un point de la grille, en texte (tableau de correction) : colonne et ligne comptées depuis 1. */
const nomPoint = (q: Pt): string => `(${q.x + 1} ; ${q.y + 1})`

// ── Reproduire ──

function genReproduire(niv: DonneesNiveau, rng: Rng, T: T): QReproduire {
  const f = rng.choisir(niv.figures)
  const { largeur, hauteur } = encombrement(f.sommets)
  const origine = { x: rng.entier(0, niv.colonnes - 1 - largeur), y: rng.entier(0, niv.lignes - 1 - hauteur) }
  return {
    type: 'reproduire', figure: f.id, programme: f.programme, support: niv.support, colonnes: niv.colonnes, lignes: niv.lignes,
    modele: f.sommets.map(q => ajoute(q, origine)), cle: `re-${f.id}`, texte: T(`reproduireQ.${niv.support}`), attendu: T('reproduireAttendu'),
  }
}

// ── Construire (CE1, CE2) ──

/** Une construction : la figure à tour de rôle (rectangle, carré, triangle rectangle), des mesures entières dans les bornes. */
function genConstruire(niv: DonneesNiveau, rng: Rng, T: T, rang: number, unite: QConstruire['unite']): QConstruire {
  const figure = FIGURES_A_CONSTRUIRE[rang % FIGURES_A_CONSTRUIRE.length]
  const fiche = niv.support === 'quadrille' ? 'ficheCE2' : 'ficheCE1'
  const bornes = BORNES[unite === 'cm' ? fiche : 'ecran'][figure]
  const a = rng.entier(bornes.a[0], bornes.a[1])
  let b = figure === 'carre' ? a : rng.entier(bornes.b[0], bornes.b[1])
  // un rectangle qui n'est pas un carré
  if (figure === 'rectangle' && b >= a) b = a - 1
  const mesures: Mesures = { a, b }
  const texte = T(`construireQ.${figure}`, { a, b })
  return {
    // à l'écran, toujours le quadrillage (les mesures sont en carreaux) ; le codage des longueurs au CE2 (son papier est le quadrillage)
    type: 'construire', figure, mesures, unite, support: 'quadrille', colonnes: niv.colonnes, lignes: niv.lignes, codeLongueurs: niv.support === 'quadrille',
    cle: `cs-${figure}-${a}-${b}-${unite}`, texte, attendu: T(`construireAttendu.${figure}`, { a, b }),
  }
}

// ── Tirages ──

function question(type: TypeQuestion, niveau: Classe, rng: Rng, T: T, rang: number): Question {
  const niv = donneesDe(niveau)
  if (type === 'alignes') return genAlignes(niv, rng, T)
  if (type === 'completer') return genCompleter(niv, rng, T, rang)
  if (type === 'construire') return genConstruire(niv, rng, T, rang, 'carreaux')
  return genReproduire(niv, rng, T)
}

const typesDe = (reglages: Reglages): readonly TypeQuestion[] => reglages.exercices as readonly TypeQuestion[]

/** Les questions de l'exercice à l'écran ; jamais deux fois la même (moins de `nb` si le niveau n'en offre pas autant). */
export const questions = ({ niveau, reglages, rng, T, nb = reglages.nbQ }: Params): Question[] =>
  tirerUniques(nb, rang => question(rng.choisir(typesDe(reglages)), niveau, rng, T, rang), { cle: q => q.cle, essais: nb * 50 })

// sur une fiche : quatre « alignés » (deux par ligne), quatre « compléter », deux « reproduire » (modèle et grille côte à côte) ; une fiche
// d'un seul type en a assez pour remplir sa page
// « construire » : les trois figures du BO (rectangle, carré, triangle rectangle), en centimètres sur papier uni
const NB_FICHE: Readonly<Record<TypeQuestion, number>> = { alignes: 4, completer: 4, reproduire: 2, construire: 3 }
const NB_FICHE_SEUL: Readonly<Record<TypeQuestion, number>> = { alignes: 6, completer: 6, reproduire: 3, construire: 3 }

/** Ce que tire la fiche : une rubrique par type coché. */
export function questionsFiche({ niveau, reglages, rng, T }: Omit<Params, 'nb'>): TirageFiche {
  const tirage: TirageFiche = { niveau }
  const types = typesDe(reglages)
  const nombres = types.length === 1 ? NB_FICHE_SEUL : NB_FICHE
  const tirerType = <Q extends Question>(type: TypeQuestion): Q[] =>
    tirerUniques(nombres[type], rang => question(type, niveau, rng, T, rang), { cle: q => q.cle, essais: 200 }) as Q[]
  if (types.includes('alignes')) {
    // les réponses de la fiche : C, D, E et « aucun » chacune au moins une fois, dans un ordre mélangé (pas de « c'est toujours E »)
    const n = nombres.alignes
    const reponses = rng.melanger(Array.from({ length: n }, (_, i) => i % 4))
    const niv = donneesDe(niveau)
    tirage.alignes = tirerUniques(n, rang => genAlignes(niv, rng, T, reponses[rang]), { cle: q => q.cle, essais: 200 })
  }
  if (types.includes('completer')) tirage.completer = tirerType<QCompleter>('completer')
  if (types.includes('reproduire')) tirage.reproduire = tirerType<QReproduire>('reproduire')
  if (types.includes('construire')) {
    const niv = donneesDe(niveau)
    tirage.construire = FIGURES_A_CONSTRUIRE.map((_, rang) => genConstruire(niv, rng, T, rang, 'cm'))
  }
  return tirage
}

// ── Réponses ──

const cleDePoints = (points: readonly Pt[]): string => points.map(q => `${q.x},${q.y}`).sort().join(' ')

/** Les points placés sont-ils l'une des solutions (dans n'importe quel ordre) ? */
function bonsSommets(q: QCompleter, points: readonly Pt[]): boolean {
  const uniques = points.filter((a, i) => points.findIndex(b => memePoint(a, b)) === i)
  return q.solutions.some(s => cleDePoints(s) === cleDePoints(uniques))
}

export function verifier(q: Question, rep: Reponse): Verdict {
  if (q.type === 'alignes') return 'choix' in rep && rep.choix === q.bonne
  if (q.type === 'completer') return 'points' in rep && bonsSommets(q, rep.points)
  if (q.type === 'construire') return 'trace' in rep && constructionJuste(q.figure, q.mesures, rep.trace)
  return 'trace' in rep && memeFigure(rep.trace, q.modele)
}

export function bonneReponse(q: Question): Reponse {
  if (q.type === 'alignes') return { choix: q.bonne }
  if (q.type === 'completer') return { points: q.solutions[0] }
  if (q.type === 'construire') return { trace: constructionModele(q.figure, q.mesures) }
  return { trace: referme(q.modele) }
}

export function mauvaiseReponse(q: Question): Reponse {
  if (q.type === 'alignes') return { choix: (q.bonne + 1) % q.options.length }
  if (q.type === 'completer') return { points: q.connus.slice(0, q.aTrouver) }
  if (q.type === 'construire') return { trace: constructionModele(q.figure, { a: q.mesures.a + 1, b: q.mesures.b }) }
  return { trace: q.modele.slice(0, 2) }
}

/** La réponse donnée, en texte (colonne « Ta réponse » du tableau de fin). */
export function decrire(q: Question, rep: Reponse, T: T): string {
  if ('choix' in rep) return q.type === 'alignes' ? q.options[rep.choix].label : ''
  if ('points' in rep) return rep.points.map(nomPoint).join(' ')
  return T('traitsTraces', { n: segmentsElementaires(rep.trace).size })
}

/** Le retour après une erreur : la bonne réponse, et ce qu'il faut regarder. */
export function messageErreur(q: Question, T: T): string {
  if (q.type === 'alignes' && q.bonne === AUCUN) return T('alignesAucunFaux')
  if (q.type === 'alignes') return T('alignesFaux', { lettre: q.attendu })
  if (q.type === 'completer' && q.figure === 'carre' && !q.angleDroit) return T('completerFaux.carreCP')
  if (q.type === 'completer') return T(`completerFaux.${q.figure}`)
  if (q.type === 'construire') return T(`construireFaux.${q.figure}`, { a: q.mesures.a, b: q.mesures.b })
  return T('reproduireFaux')
}

// ── Programme ──

/** Les figures de référence que tirent les questions (ou la fiche) : elles doivent être au programme du niveau. */
function figuresDe(x: readonly Question[] | TirageFiche): string[] {
  const t = x as TirageFiche
  const liste: readonly Question[] = Array.isArray(x) ? x : [...t.completer ?? [], ...t.reproduire ?? [], ...t.construire ?? []]
  return liste.flatMap(q => {
    if (q.type === 'completer') return [q.figure === 'triangleRectangle' ? 'triangle-rectangle' : q.figure]
    if (q.type === 'construire') return [q.figure === 'triangleRectangle' ? 'triangle-rectangle' : q.figure]
    if (q.type === 'reproduire' && q.programme) return [q.programme]
    return []
  })
}

export function ecartsAuProgramme(x: readonly Question[] | TirageFiche, contraintes: Contraintes): string[] {
  const figures = contraintes.figures ?? []
  return [...new Set(figuresDe(x).filter(f => !figures.includes(f)).map(f => `figure ${f} hors programme`))]
}
