// Les formes — générateur : QUOI poser comme questions, et comment les corriger. Pur : aucun import de Vue, aucun Math.random (le hasard
// vient de `rng`), donc lisible par node, par les tests et par le build des fiches.
//   questions({ niveau, reglages, rng, T })   une série de questions : chaque forme du niveau deux fois, jamais deux fois de suite et jamais
//                                             deux fois la même (la forme montrée change de taille, de couleur et d'orientation) ; chaque
//                                             question porte les propositions des 4 modes (`modes`)
//   questionsFiche({ niveau, reglages, rng, T })  tout ce que tire la fiche imprimable (formes à colorier, puis à compter)
//   verifier(q, rep)                          rep : { mode, choix: indice de la proposition touchée }
//   bonneReponse(q) / mauvaiseReponse(q)  ecartsAuProgramme(questions, contraintes)
// Le nombre de questions est fixé par le niveau (6 en PS et MS, 8 en GS) : `nb` est ignoré. Les formes se dessinent dans
// src/dessins/figures.ts (partagé avec la géométrie et l'affiche des figures planes).
import type { Classe, Contraintes, ParamsGenerateur, Rng, Verdict } from '../../noyau/types.ts'
import type { ReglagesDeDefinition } from '../../noyau/definir.ts'
import { tirerUniques } from '../../noyau/uniques.ts'
import type { CleContenu } from '../../langues/catalogue.ts'
import { FORMES_MATERNELLE_IDS, svgForme } from '../../dessins/figures.ts'
import type { FormeMaternelle } from '../../dessins/figures.ts'
import type DEFINITION from './definition.ts'
import type { CONTENU } from './textes.ts'

type Reglages = ReglagesDeDefinition<typeof DEFINITION>
type Cle = CleContenu<typeof CONTENU>
export type ModeForme = Reglages['mode']

// Programme du cycle 1 : triangle, carré, disque (4 ans), puis rectangle (5 ans) ; la forme pleine est un disque (le cercle est son
// contour, au CE1). Losange, pentagone, hexagone : cycle 3 ; l'ovale n'est pas une figure. Nombre de côtés de chaque forme :
export const COTES: Readonly<Record<FormeMaternelle, number>> = { disque: 0, carre: 4, triangle: 3, rectangle: 4 }

/** Les formes du niveau, dans l'ordre du tirage : le rectangle arrive en GS. */
export const formesDuNiveau = (niveau: Classe): FormeMaternelle[] => (niveau === 'gs' ? [...FORMES_MATERNELLE_IDS] : FORMES_MATERNELLE_IDS.filter(f => f !== 'rectangle'))

const TEINTES = ['#4a90e2', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6', '#16a085']

/** Une forme de taille, de couleur et d'orientation variées (on reconnaît la forme malgré le déplacement, p. 68). */
function variante(f: FormeMaternelle, rng: Rng): string {
  const taille = 70 + rng.entier(0, 29)
  const angle = f === 'disque' ? 0 : rng.entier(0, 60) - 30
  return svgForme(f, { taille, angle, fond: TEINTES[rng.entier(0, TEINTES.length - 1)] })
}

const autresFormes = (niveau: Classe, exclure: FormeMaternelle, n: number, rng: Rng): FormeMaternelle[] =>
  rng.melanger(formesDuNiveau(niveau).filter(f => f !== exclure)).slice(0, n)

// ── Les propositions de chaque mode ──
/** Une forme dessinée (modes « meme » et « trouver »). */
export interface OptionImage { svg: string, label?: string }
/** Une forme dessinée et son nom (mode « reconnaitre »). */
export interface OptionNommee { id: FormeMaternelle, svg: string, label?: string }
/** Un nombre de côtés (mode « compter »). */
export interface OptionNombre { label: string }
export interface Propositions<O> { options: O[], bonne: number }

/**
 * Une question : une forme (`svg` : celle qu'on montre, avec sa taille, sa couleur et son orientation) et les propositions des quatre
 * modes. `cle` : ce qui fait deux questions « la même » (la forme et son dessin).
 */
export interface Question {
  cle: string
  id: FormeMaternelle
  cotes: number
  svg: string
  modes: {
    meme: Propositions<OptionImage>
    reconnaitre: Propositions<OptionNommee>
    compter: Propositions<OptionNombre>
    trouver: Propositions<OptionImage>
  }
}
/** La réponse de l'élève : le mode de la question et l'indice de la proposition touchée. */
export interface Reponse { mode: ModeForme, choix: number }
/** Une forme à colorier de la fiche. */
export interface FormeFiche { forme: FormeMaternelle, taille: number, angle: number }
/** Ce que tire la fiche : le niveau, la forme modèle (PS : colorier les formes pareilles) et les formes. */
export interface TirageFiche { niveau: Classe, modele?: FormeMaternelle, formes: FormeFiche[] }

function question(f: FormeMaternelle, niveau: Classe, rng: Rng): Question {
  const cotes = COTES[f]
  const faussesCotes = rng.melanger([0, 1, 2, 3, 4, 5, 6, 7, 8].filter(n => n !== cotes)).slice(0, 3)
  const choixNb = rng.melanger([cotes, ...faussesCotes])
  const choixFormes = rng.melanger([f, ...autresFormes(niveau, f, 3, rng)])
  const choixNommees = rng.melanger([f, ...autresFormes(niveau, f, 3, rng)])
  const memes = rng.melanger([{ ok: true, svg: variante(f, rng) }, ...autresFormes(niveau, f, 2, rng).map(o => ({ ok: false, svg: variante(o, rng) }))])
  const svg = variante(f, rng)
  return {
    cle: `${f}${svg}`, id: f, cotes, svg,
    // propositions et bonne réponse de chaque mode
    modes: {
      meme: { options: memes.map(m => ({ svg: m.svg })), bonne: memes.findIndex(m => m.ok) },
      reconnaitre: { options: choixNommees.map(x => ({ id: x, svg: svgForme(x, { taille: 60 }) })), bonne: choixNommees.indexOf(f) },
      compter: { options: choixNb.map(c => ({ label: String(c) })), bonne: choixNb.indexOf(cotes) },
      trouver: { options: choixFormes.map(x => ({ svg: svgForme(x) })), bonne: choixFormes.indexOf(f) },
    },
  }
}

export function questions({ niveau, rng }: ParamsGenerateur<Reglages, Cle>): Question[] {
  // chaque forme du niveau deux fois, jamais deux fois de suite
  let tirage: FormeMaternelle[], essais = 0
  const formes = formesDuNiveau(niveau)
  do { tirage = rng.melanger([...formes, ...formes]) } while (tirage.some((f, i) => f === tirage[i - 1]) && ++essais < 50)
  return tirerUniques(tirage.length, rang => question(tirage[rang], niveau, rng), { cle: q => q.cle })
}

/** Le nom, dans la langue du contenu, d'une forme (« carré »). */
export const nomForme = (T: ParamsGenerateur<Reglages, Cle>['T'], f: FormeMaternelle): string => T(`forme.${f}` as Cle)

// ── Fiche : formes à colorier selon une légende, puis à compter ; PS : colorier les formes pareilles au modèle ──
export const COULEURS_FICHE: readonly { forme: FormeMaternelle, couleur: 'rouge' | 'bleu' | 'vert' | 'jaune', hex: string }[] = [
  { forme: 'disque', couleur: 'rouge', hex: '#e53935' },
  { forme: 'carre', couleur: 'bleu', hex: '#1e88e5' },
  { forme: 'triangle', couleur: 'vert', hex: '#43a047' },
  { forme: 'rectangle', couleur: 'jaune', hex: '#fdd835' },
]

export function questionsFiche({ niveau, rng }: Omit<ParamsGenerateur<Reglages, Cle>, 'nb'>): TirageFiche {
  const noms = formesDuNiveau(niveau)
  const une = (): FormeMaternelle => noms[rng.entier(0, noms.length - 1)]
  if (niveau === 'ps') {
    const modele = une()
    const tirage = rng.melanger([modele, modele, modele, ...Array.from({ length: 9 }, une)])
    return { niveau, modele, formes: tirage.map(forme => ({ forme, taille: 70 + rng.entier(0, 29), angle: forme === 'disque' ? 0 : rng.entier(0, 60) - 30 })) }
  }
  // 20 formes : au moins 2 de chaque, le reste au hasard (MS : sans le rectangle, qui arrive en GS)
  const tirage = rng.melanger([...noms, ...noms, ...Array.from({ length: 20 - 2 * noms.length }, une)])
  return { niveau, formes: tirage.map(forme => ({ forme, taille: 62 + rng.entier(0, 29), angle: forme === 'disque' ? 0 : rng.entier(0, 30) - 15 })) }
}

export const verifier = (q: Question, rep: Reponse): Verdict => rep.choix === q.modes[rep.mode].bonne

export const bonneReponse = (q: Question): Reponse => ({ mode: 'meme', choix: q.modes.meme.bonne })
export const mauvaiseReponse = (q: Question): Reponse => ({ mode: 'meme', choix: (q.modes.meme.bonne + 1) % q.modes.meme.options.length })

export function ecartsAuProgramme(x: readonly Question[] | TirageFiche, contraintes: Contraintes): string[] {
  const ids = Array.isArray(x) ? (x as readonly Question[]).map(q => q.id) : (x as TirageFiche).formes.map(f => f.forme)
  const permis = (contraintes.niveau === 'ps' ? contraintes.formesTriees : contraintes.figures) ?? []
  return [...new Set(ids.filter(id => !permis.includes(id)))].map(id => `forme ${id} hors programme du niveau`)
}
