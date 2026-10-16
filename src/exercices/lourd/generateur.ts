// Le plus lourd — générateur : QUOI poser comme questions, et comment les corriger. Pur : aucun import de Vue, aucun Math.random (le hasard
// vient de `rng`), donc lisible par node, par les tests et par le build des fiches.
// « deux » : une balance, deux objets, on demande le plus lourd ou le plus léger. « trois » (GS) : deux balances (le plus léger contre celui du
// milieu, celui du milieu contre le plus lourd) : on en déduit le plus lourd ou le plus léger des trois.
import type { Classe, Contraintes, ParamsGenerateur, Traducteur, Verdict } from '../../noyau/types.ts'
import type { ReglagesDeDefinition } from '../../noyau/definir.ts'
import { tirerUniques } from '../../noyau/uniques.ts'
import type { CleContenu } from '../../langues/catalogue.ts'
import type { NomEmoji } from '../../images/tables.ts'
import type { Rng } from '../../utils/hasard.ts'
import type DEFINITION from './definition.ts'
import type { CONTENU } from './textes.ts'

type Reglages = ReglagesDeDefinition<typeof DEFINITION>
type Cle = CleContenu<typeof CONTENU>
export type TypeQuestion = Reglages['types'][number]

/**
 * Les objets, du plus léger au plus lourd. Deux voisins se distinguent sans hésiter, sauf ceux de `AMBIGUES`. Le ballon de baudruche est grand
 * et léger, la pierre petite et lourde : la taille de l'image ne donne pas toujours la réponse (BO n° 41 p. 70 : distinguer masse et volume).
 */
export const OBJETS: readonly NomEmoji[] = ['plume', 'ballonDeBaudruche', 'souris', 'pomme', 'pierre', 'elephant']
/** Les paires qu'un enfant ne départage pas à coup sûr : jamais sur la même balance. */
const AMBIGUES: readonly (readonly [NomEmoji, NomEmoji])[] = [['plume', 'ballonDeBaudruche'], ['pomme', 'pierre']]
const permis = (a: NomEmoji, b: NomEmoji): boolean => !AMBIGUES.some(([x, y]) => (x === a && y === b) || (x === b && y === a))

/** Une pesée : les deux objets (gauche, droite) et le côté qui descend (1 : la gauche, -1 : la droite). */
export interface Pesee { gauche: NomEmoji, droite: NomEmoji, tilt: 1 | -1 }

export interface Question {
  cle: string
  type: TypeQuestion
  /** ce qu'on cherche : le plus lourd, ou le plus léger */
  mot: 'lourd' | 'leger'
  pesees: Pesee[]
  /** les propositions (les objets), dans le désordre */
  options: NomEmoji[]
  /** indice de la bonne proposition */
  bonne: number
}
export interface Reponse { choix: number }
export interface TirageFiche { niveau: Classe, questions: Question[] }

/** Une pesée de `leger` et `lourd`, l'objet lourd d'un côté tiré au hasard (le plateau du lourd descend). */
function pesee(leger: NomEmoji, lourd: NomEmoji, rng: Rng): Pesee {
  return rng.entier(0, 1) === 0 ? { gauche: lourd, droite: leger, tilt: 1 } : { gauche: leger, droite: lourd, tilt: -1 }
}

/** Deux objets de masses différentes que l'enfant départage : leurs rangs, du plus léger au plus lourd. */
function deuxObjets(rng: Rng): NomEmoji[] {
  for (;;) {
    const rangs = rng.melanger(OBJETS.map((_, i) => i)).slice(0, 2).sort((a, b) => a - b)
    const [a, b] = rangs.map(r => OBJETS[r])
    if (permis(a, b)) return [a, b]
  }
}

/**
 * Trois objets (léger < milieu < lourd) et deux pesées dont on déduit le plus lourd ou le plus léger : soit la chaîne (léger/milieu, milieu/lourd),
 * soit « deux contre un » : pour le plus lourd (léger/lourd, milieu/lourd), pour le plus léger (léger/milieu, léger/lourd). L'ordre des deux est tiré.
 */
function troisObjets(mot: 'lourd' | 'leger', rng: Rng): { objets: NomEmoji[], pesees: Pesee[], variante: string } {
  for (;;) {
    const rangs = rng.melanger(OBJETS.map((_, i) => i)).slice(0, 3).sort((a, b) => a - b)
    const [l, m, h] = rangs.map(r => OBJETS[r])
    const chaine = rng.entier(0, 1) === 0
    let paires: [NomEmoji, NomEmoji][]
    if (chaine) paires = [[l, m], [m, h]]
    else paires = mot === 'lourd' ? [[l, h], [m, h]] : [[l, m], [l, h]]
    if (!paires.every(([x, y]) => permis(x, y))) continue
    const pesees = rng.melanger(paires).map(([leger, lourd]) => pesee(leger, lourd, rng))
    return { objets: [l, m, h], pesees, variante: chaine ? 'chaine' : 'deux-contre-un' }
  }
}

function question(type: TypeQuestion, rng: Rng): Question {
  const mot = rng.choisir(['lourd', 'leger'] as const)
  let objets: NomEmoji[]
  let pesees: Pesee[]
  let variante = 'simple'
  if (type === 'deux') {
    objets = deuxObjets(rng)
    pesees = [pesee(objets[0], objets[1], rng)]
  } else {
    ({ objets, pesees, variante } = troisObjets(mot, rng))
  }
  const attendu = mot === 'lourd' ? objets[objets.length - 1] : objets[0]
  const options = rng.melanger([...objets])
  return { cle: `${type}:${mot}:${variante}:${pesees.map(p => `${p.gauche}>${p.droite}`).join(',')}`, type, mot, pesees, options, bonne: options.indexOf(attendu) }
}

export const questions = ({ reglages, rng, nb = reglages.nbQ }: ParamsGenerateur<Reglages, Cle>): Question[] =>
  tirerUniques(nb, () => question(rng.choisir(reglages.types), rng), { cle: q => q.cle })

export const questionsFiche = (p: Omit<ParamsGenerateur<Reglages, Cle>, 'nb'>): TirageFiche =>
  ({ niveau: p.niveau, questions: questions({ ...p, nb: 6 }) })

/** La question dite : « Quel objet est le plus lourd ? » (« des trois » avec deux balances). */
export const consigne = (q: Question, T: Traducteur<Cle>): string => T(`consigne.${q.mot}${q.type === 'trois' ? '3' : ''}` as Cle)

export const verifier = (q: Question, rep: Reponse): Verdict => rep.choix === q.bonne
export const bonneReponse = (q: Question): Reponse => ({ choix: q.bonne })
export const mauvaiseReponse = (q: Question): Reponse => ({ choix: (q.bonne + 1) % q.options.length })

/** Trois objets à ordonner ne sont pas au programme de la MS (comparer deux objets). */
export function ecartsAuProgramme(x: readonly Question[] | TirageFiche, contraintes: Contraintes): string[] {
  const qs: readonly Question[] = Array.isArray(x) ? x : (x as TirageFiche).questions
  return contraintes.niveau === 'gs' ? [] : qs.filter(q => q.type === 'trois').map(() => 'trois objets avant la GS')
}
