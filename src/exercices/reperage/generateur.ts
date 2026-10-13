// Le repérage — générateur : QUOI poser comme questions, et comment les corriger. Pur : aucun import de Vue, aucun Math.random (le hasard
// vient de `rng`), donc lisible par node, par les tests et par le build des fiches. Un robot sur un quadrillage, tourné vers le haut, la
// droite, le bas ou la gauche ; trois instructions : avancer d'une case, pivoter d'un quart de tour à droite, à gauche (c2maths p. 33).
//   suivre   le programme est donné : sur quelle case arrive le robot ?
//   coder    la case d'arrivée (une étoile) est donnée : écrire un programme qui y mène
import type { Classe, ParamsGenerateur, Verdict } from '../../noyau/types.ts'
import type { ReglagesDeDefinition } from '../../noyau/definir.ts'
import { tirerUniques } from '../../noyau/uniques.ts'
import type { CleContenu } from '../../langues/catalogue.ts'
import type DEFINITION from './definition.ts'
import type { CONTENU } from './textes.ts'

type Reglages = ReglagesDeDefinition<typeof DEFINITION>
type Cle = CleContenu<typeof CONTENU>
type Params = ParamsGenerateur<Reglages, Cle>
type Rng = Params['rng']
type T = Params['T']
export type TypeQuestion = 'suivre' | 'coder'

/** Une case du quadrillage : colonne et ligne, depuis 0 en haut à gauche. */
export interface Case { x: number, y: number }
/** Vers où le robot regarde : 0 en haut, 1 à droite, 2 en bas, 3 à gauche. */
export type Direction = 0 | 1 | 2 | 3
export interface Robot { x: number, y: number, dir: Direction }
/** Une instruction ; « avancer » vaut une case (au CE1, plusieurs « avancer » de suite s'écrivent « avancer de n »). */
export type Instruction = 'avancer' | 'droite' | 'gauche'

/** `avancerDe` : le programme s'écrit avec « avancer de n » (CE1). */
interface Base { cle: string, texte: string, attendu: string, colonnes: number, lignes: number, depart: Robot, avancerDe: boolean }
export interface QSuivre extends Base { type: 'suivre', programme: Instruction[], arrivee: Case }
/**
 * `solution` : un programme le plus court possible (le corrigé) ; l'élève peut en écrire un autre. `obstacles` : des rochers (CE1) que le
 * robot ne peut pas traverser : ils allongent le chemin et demandent des virages.
 */
export interface QCoder extends Base { type: 'coder', cible: Case, solution: Instruction[], obstacles: Case[] }
export type Question = QSuivre | QCoder

/** La réponse : la case touchée (suivre), le programme écrit (coder). */
export type Reponse = { case: Case } | { programme: Instruction[] }

/** Ce que tire la fiche : une rubrique par type coché. */
export interface TirageFiche { niveau: Classe, avancerDe: boolean, suivre?: QSuivre[], coder?: QCoder[] }

interface DonneesNiveau {
  colonnes: number
  lignes: number
  /** au plus tant d'instructions, dont tant de virages (c2maths : CP dix et deux, CE1 quinze et quatre) */
  instructionsMax: number
  virages: readonly [number, number]
  /** la plus longue ligne droite d'un programme tiré */
  ligneMax: number
  /** au CE1, « avancer de » : les pas de suite comptent pour une instruction */
  avancerDe: boolean
  /** au CP, le robot part tourné vers le haut : la flèche ↑ « avancer » se lit alors comme sur le quadrillage, et l'on ne travaille qu'une
   *  difficulté à la fois (se mettre à la place du robot vient au premier virage) */
  departVersLeHaut: boolean
  /** « écrire » : au plus tant de rochers, posés pour qu'il faille au moins `viragesVises` virages (CE1 : « quinze instructions, dont quatre
   *  virages ») */
  rochers: number
  viragesVises: number
  /** « écrire » : au moins tant d'instructions dans le plus court programme (une étoile juste devant le robot n'apprend rien) */
  solutionMin: number
}

const NIVEAUX: Readonly<Record<'cp' | 'ce1', DonneesNiveau>> = {
  cp: { colonnes: 5, lignes: 5, instructionsMax: 10, virages: [1, 2], ligneMax: 3, avancerDe: false, departVersLeHaut: true, rochers: 0, viragesVises: 0, solutionMin: 2 },
  ce1: { colonnes: 6, lignes: 6, instructionsMax: 15, virages: [2, 4], ligneMax: 4, avancerDe: true, departVersLeHaut: false, rochers: 5, viragesVises: 3, solutionMin: 4 },
}
const donneesDe = (niveau: Classe): DonneesNiveau => NIVEAUX[niveau as keyof typeof NIVEAUX] ?? NIVEAUX.ce1

// ── Le robot ──

const PAS: Readonly<Record<Direction, Case>> = { 0: { x: 0, y: -1 }, 1: { x: 1, y: 0 }, 2: { x: 0, y: 1 }, 3: { x: -1, y: 0 } }

/** Le robot après une instruction. */
export function apres(robot: Robot, instruction: Instruction): Robot {
  if (instruction === 'droite') return { ...robot, dir: ((robot.dir + 1) % 4) as Direction }
  if (instruction === 'gauche') return { ...robot, dir: ((robot.dir + 3) % 4) as Direction }
  return { ...robot, x: robot.x + PAS[robot.dir].x, y: robot.y + PAS[robot.dir].y }
}

const surUnRocher = (c: Case, obstacles: readonly Case[]): boolean => obstacles.some(o => o.x === c.x && o.y === c.y)

/**
 * Ce que fait un programme : les cases traversées (départ compris), le robot à la fin, s'il est sorti du quadrillage, s'il s'est cogné à un
 * rocher (il s'arrête alors devant).
 */
export function executer(depart: Robot, programme: readonly Instruction[], colonnes: number, lignes: number, obstacles: readonly Case[] = []):
  { chemin: Case[], fin: Robot, sorti: boolean, bloque: boolean } {
  let robot = depart
  const chemin: Case[] = [{ x: depart.x, y: depart.y }]
  for (const instruction of programme) {
    const suivant = apres(robot, instruction)
    if (suivant.x < 0 || suivant.y < 0 || suivant.x >= colonnes || suivant.y >= lignes) return { chemin, fin: suivant, sorti: true, bloque: false }
    if (instruction === 'avancer' && surUnRocher(suivant, obstacles)) return { chemin, fin: robot, sorti: false, bloque: true }
    robot = suivant
    if (instruction === 'avancer') chemin.push({ x: robot.x, y: robot.y })
  }
  return { chemin, fin: robot, sorti: false, bloque: false }
}

/** Le programme comme on l'écrit : au CE1, les « avancer » de suite se regroupent (« avancer de 3 »). */
export function enInstructions(programme: readonly Instruction[], avancerDe: boolean): { instruction: Instruction, n: number }[] {
  const res: { instruction: Instruction, n: number }[] = []
  for (const i of programme) {
    const dernier = res[res.length - 1]
    if (avancerDe && i === 'avancer' && dernier?.instruction === 'avancer') dernier.n++
    else res.push({ instruction: i, n: 1 })
  }
  return res
}

/** Le nombre d'instructions écrites, et de virages. */
const longueur = (programme: readonly Instruction[], avancerDe: boolean): number => enInstructions(programme, avancerDe).length
const virages = (programme: readonly Instruction[]): number => programme.filter(i => i !== 'avancer').length

/** Combien de cases le robot peut avancer avant le bord. */
function casesDevant(robot: Robot, niv: DonneesNiveau): number {
  let n = 0
  for (let r = apres(robot, 'avancer'); r.x >= 0 && r.y >= 0 && r.x < niv.colonnes && r.y < niv.lignes; r = apres(r, 'avancer')) n++
  return n
}

/** Un programme au hasard : des lignes droites et des virages, dans les limites du niveau ; `null` si le robot est coincé contre un bord. */
function programmeAuHasard(niv: DonneesNiveau, depart: Robot, rng: Rng): Instruction[] | null {
  const nbVirages = rng.entier(niv.virages[0], niv.virages[1])
  const programme: Instruction[] = []
  let robot = depart
  for (let v = 0; v <= nbVirages; v++) {
    const libres = casesDevant(robot, niv)
    if (libres === 0) return null
    const n = rng.entier(1, Math.min(libres, niv.ligneMax))
    for (let k = 0; k < n; k++) {
      programme.push('avancer')
      robot = apres(robot, 'avancer')
    }
    if (v === nbVirages) break
    const tour = rng.choisir(['droite', 'gauche'] as const)
    programme.push(tour)
    robot = apres(robot, tour)
  }
  if (longueur(programme, niv.avancerDe) > niv.instructionsMax) return null
  return programme
}

/** Un programme le plus court (en pas) du départ à la cible, par un parcours en largeur des positions du robot. */
export function plusCourt(depart: Robot, cible: Case, colonnes: number, lignes: number, obstacles: readonly Case[] = []): Instruction[] {
  const cle = (r: Robot): string => `${r.x},${r.y},${r.dir}`
  const vus = new Map<string, Instruction[]>([[cle(depart), []]])
  const file: Robot[] = [depart]
  while (file.length) {
    const r = file.shift()!
    const chemin = vus.get(cle(r))!
    if (r.x === cible.x && r.y === cible.y) return chemin
    for (const i of ['avancer', 'droite', 'gauche'] as const) {
      const s = apres(r, i)
      if (s.x < 0 || s.y < 0 || s.x >= colonnes || s.y >= lignes || vus.has(cle(s)) || surUnRocher(s, obstacles)) continue
      vus.set(cle(s), [...chemin, i])
      file.push(s)
    }
  }
  return []
}

/** Le robot au départ : une case au hasard, tourné vers le haut au CP, dans une direction au hasard au CE1. */
function departAuHasard(niv: DonneesNiveau, rng: Rng): Robot {
  const x = rng.entier(0, niv.colonnes - 1), y = rng.entier(0, niv.lignes - 1)
  const dir = niv.departVersLeHaut ? 0 : rng.entier(0, 3) as Direction
  return { x, y, dir }
}

/** Un départ et un programme qui tiennent dans le quadrillage et n'arrivent pas sur la case de départ. */
function tirerTrajet(niv: DonneesNiveau, rng: Rng): { depart: Robot, programme: Instruction[], arrivee: Case } {
  for (let essai = 0; essai < 500; essai++) {
    const depart = departAuHasard(niv, rng)
    const programme = programmeAuHasard(niv, depart, rng)
    if (!programme) continue
    const { fin } = executer(depart, programme, niv.colonnes, niv.lignes)
    if (fin.x !== depart.x || fin.y !== depart.y) return { depart, programme, arrivee: { x: fin.x, y: fin.y } }
  }
  // filet (jamais atteint avec ces tailles) : deux cases tout droit vers la droite
  return { depart: { x: 0, y: 0, dir: 1 }, programme: ['avancer', 'avancer'], arrivee: { x: 2, y: 0 } }
}

/** Une case en texte (tableau de correction) : colonne et ligne comptées depuis 1. */
export const nomCase = (c: Case): string => `(${c.x + 1} ; ${c.y + 1})`
/** Un programme en texte : ↑ avancer, ↱ pivoter à droite, ↰ pivoter à gauche (les flèches des dessins) ; au CE1, ↑3 pour « avancer de 3 ». */
export function enSymboles(programme: readonly Instruction[], avancerDe: boolean): string {
  const symbole: Readonly<Record<Instruction, string>> = { avancer: '↑', droite: '↱', gauche: '↰' }
  return enInstructions(programme, avancerDe).map(({ instruction, n }) => `${symbole[instruction]}${n > 1 ? n : ''}`).join(' ')
}

function genSuivre(niv: DonneesNiveau, rng: Rng, T: T): QSuivre {
  const { depart, programme, arrivee } = tirerTrajet(niv, rng)
  return {
    type: 'suivre', colonnes: niv.colonnes, lignes: niv.lignes, depart, avancerDe: niv.avancerDe, programme, arrivee,
    cle: `su-${depart.x},${depart.y},${depart.dir}-${programme.join('')}`, texte: T('suivreQ'), attendu: nomCase(arrivee),
  }
}

/**
 * Les rochers : on en pose un sur le plus court chemin (jamais sur le trajet tiré, qui reste donc possible), tant que ce chemin a trop peu de
 * virages ; un rocher qui ferait dépasser les limites du BO n'est pas gardé.
 */
function poserRochers(niv: DonneesNiveau, depart: Robot, cible: Case, trajet: readonly Case[], rng: Rng): Case[] {
  const obstacles: Case[] = []
  const surLeTrajet = (c: Case): boolean => trajet.some(t => t.x === c.x && t.y === c.y)
  for (let essai = 0; obstacles.length < niv.rochers && essai < 20; essai++) {
    const court = plusCourt(depart, cible, niv.colonnes, niv.lignes, obstacles)
    if (virages(court) >= niv.viragesVises) break
    const cases = executer(depart, court, niv.colonnes, niv.lignes, obstacles).chemin.slice(1, -1).filter(c => !surLeTrajet(c))
    if (!cases.length) break
    const rocher = rng.choisir(cases)
    const essaye = plusCourt(depart, cible, niv.colonnes, niv.lignes, [...obstacles, rocher])
    const dansLesLimites = longueur(essaye, niv.avancerDe) <= niv.instructionsMax && virages(essaye) <= niv.virages[1]
    if (essaye.length && dansLesLimites) obstacles.push(rocher)
    else break
  }
  return obstacles
}

/** Un « écrire » : un trajet tiré, ses rochers et le plus court programme ; on en retire un tant que ce programme est trop court. */
function tirerCoder(niv: DonneesNiveau, rng: Rng): { depart: Robot, arrivee: Case, obstacles: Case[], solution: Instruction[] } {
  let essai = null as ReturnType<typeof tirerCoderUneFois> | null
  for (let n = 0; n < 50; n++) {
    essai = tirerCoderUneFois(niv, rng)
    if (longueur(essai.solution, niv.avancerDe) >= niv.solutionMin) return essai
  }
  return essai ?? tirerCoderUneFois(niv, rng)
}

function tirerCoderUneFois(niv: DonneesNiveau, rng: Rng): { depart: Robot, arrivee: Case, obstacles: Case[], solution: Instruction[] } {
  const { depart, programme, arrivee } = tirerTrajet(niv, rng)
  const trajet = executer(depart, programme, niv.colonnes, niv.lignes).chemin
  const obstacles = niv.rochers ? poserRochers(niv, depart, arrivee, trajet, rng) : []
  return { depart, arrivee, obstacles, solution: plusCourt(depart, arrivee, niv.colonnes, niv.lignes, obstacles) }
}

function genCoder(niv: DonneesNiveau, rng: Rng, T: T): QCoder {
  const { depart, arrivee, obstacles, solution } = tirerCoder(niv, rng)
  return {
    type: 'coder', colonnes: niv.colonnes, lignes: niv.lignes, depart, avancerDe: niv.avancerDe, cible: arrivee, solution, obstacles,
    cle: `co-${depart.x},${depart.y},${depart.dir}-${arrivee.x},${arrivee.y}`, texte: T('coderQ'), attendu: enSymboles(solution, niv.avancerDe),
  }
}

function question(type: TypeQuestion, niveau: Classe, rng: Rng, T: T): Question {
  const niv = donneesDe(niveau)
  return type === 'suivre' ? genSuivre(niv, rng, T) : genCoder(niv, rng, T)
}

const typesDe = (reglages: Reglages): readonly TypeQuestion[] => reglages.exercices as readonly TypeQuestion[]

/** Les questions de l'exercice à l'écran ; jamais deux fois la même. */
export const questions = ({ niveau, reglages, rng, T, nb = reglages.nbQ }: Params): Question[] =>
  tirerUniques(nb, () => question(rng.choisir(typesDe(reglages)), niveau, rng, T), { cle: q => q.cle, essais: nb * 50 })

// sur une fiche : deux quadrillages par rangée ; quatre de chaque type, six s'il n'y en a qu'un
const NB_FICHE = 4
const NB_FICHE_SEUL = 6

/** Ce que tire la fiche : une rubrique par type coché. */
export function questionsFiche({ niveau, reglages, rng, T }: Omit<Params, 'nb'>): TirageFiche {
  const types = typesDe(reglages)
  const nb = types.length === 1 ? NB_FICHE_SEUL : NB_FICHE
  const tirerType = <Q extends Question>(type: TypeQuestion): Q[] =>
    tirerUniques(nb, () => question(type, niveau, rng, T), { cle: q => q.cle, essais: 200 }) as Q[]
  const tirage: TirageFiche = { niveau, avancerDe: donneesDe(niveau).avancerDe }
  if (types.includes('suivre')) tirage.suivre = tirerType<QSuivre>('suivre')
  if (types.includes('coder')) tirage.coder = tirerType<QCoder>('coder')
  return tirage
}

// ── Réponses ──

/** Le programme écrit mène-t-il le robot sur la cible, sans sortir du quadrillage ? */
function programmeJuste(q: QCoder, programme: readonly Instruction[]): boolean {
  const { fin, sorti, bloque } = executer(q.depart, programme, q.colonnes, q.lignes, q.obstacles)
  return !sorti && !bloque && fin.x === q.cible.x && fin.y === q.cible.y
}

export function verifier(q: Question, rep: Reponse): Verdict {
  if (q.type === 'suivre') return 'case' in rep && rep.case.x === q.arrivee.x && rep.case.y === q.arrivee.y
  return 'programme' in rep && programmeJuste(q, rep.programme)
}

export const bonneReponse = (q: Question): Reponse => (q.type === 'suivre' ? { case: q.arrivee } : { programme: q.solution })

export function mauvaiseReponse(q: Question): Reponse {
  if (q.type === 'suivre') return { case: { x: q.depart.x, y: q.depart.y } }
  return { programme: [] }
}

/** La réponse donnée, en texte (colonne « Ta réponse » du tableau de fin). */
export function decrire(q: Question, rep: Reponse): string {
  if ('case' in rep) return nomCase(rep.case)
  return enSymboles(rep.programme, q.avancerDe)
}

/** Le retour après une erreur. */
export function messageErreur(q: Question, rep: Reponse | null, T: T): string {
  // un robot qui ne regarde pas vers le haut : se mettre à sa place (tourner sa feuille) aide à trouver sa droite et sa gauche
  // l'astuce d'abord : le message de « écrire » finit par « un programme qui marche : », suivi des flèches de la solution
  const tourne = q.depart.dir !== 0 ? `${T('tourneLaTete')} ` : ''
  if (q.type === 'suivre') return `${tourne}${T('suivreFaux')}`
  const fait = rep && 'programme' in rep ? executer(q.depart, rep.programme, q.colonnes, q.lignes, q.obstacles) : null
  if (fait?.sorti) return `${tourne}${T('coderSorti')}`
  if (fait?.bloque) return `${tourne}${T('coderBloque')}`
  return `${tourne}${T('coderFaux')}`
}

/** Les limites du BO : au plus tant d'instructions et de virages par programme donné (et par programme le plus court). */
export function ecartsAuProgramme(x: readonly Question[] | TirageFiche, _contraintes: unknown): string[] {
  const liste: readonly Question[] = Array.isArray(x) ? x : [...(x as TirageFiche).suivre ?? [], ...(x as TirageFiche).coder ?? []]
  const ecarts = liste.flatMap(q => {
    const niv = q.avancerDe ? NIVEAUX.ce1 : NIVEAUX.cp
    const programme = q.type === 'suivre' ? q.programme : q.solution
    const trop = longueur(programme, niv.avancerDe) > niv.instructionsMax || virages(programme) > niv.virages[1]
    return trop ? [`programme de ${longueur(programme, niv.avancerDe)} instructions et ${virages(programme)} virages`] : []
  })
  return [...new Set(ecarts)]
}
