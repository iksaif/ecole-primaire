// Calcul posé — générateur : QUOI poser comme opérations, et comment les corriger. Pur : aucun import de Vue, aucun Math.random
// (le hasard vient de `rng`), donc lisible par node, par les tests et par le build des fiches.
//   questions({ niveau, reglages, rng, T, nb })   opérations à poser à l'écran, jamais deux fois la même
//   questionsFiche({ niveau, reglages, rng, T })  tout ce que tire la fiche imprimable (reglages.nbFiche opérations)
//   verifier(q, rep)                              rep : { chiffres: ['4', '2', …] } (une case par colonne du résultat)
//   bonneReponse(q) / mauvaiseReponse(q)          une réponse juste / fausse (tests)
//   ecartsAuProgramme(questions, contraintes)     ce qui sort du programme du niveau (tests)
// L'ordre des tirages est celui de l'ancienne vue : mêmes opérations, mêmes fiches à graine égale (tests/instantanes).
import type { Contraintes, ParamsGenerateur, Verdict } from '../../noyau/types.ts'
import type { ReglagesDeDefinition } from '../../noyau/definir.ts'
import { tirerUniques } from '../../noyau/uniques.ts'
import type DEFINITION from './definition.ts'

type Reglages = ReglagesDeDefinition<typeof DEFINITION>
type Parametres = Omit<ParamsGenerateur<Reglages>, 'nb'>
/** Une opération posée : l'identifiant du réglage `op`. */
export type Operation = 'add' | 'sou' | 'mul'

export const SIGNES: Readonly<Record<Operation, string>> = { add: '+', sou: '−', mul: '×' }
const OPERATION_DU_SIGNE: Readonly<Record<string, string>> = { '+': 'addition', '−': 'soustraction', '×': 'multiplication' }

/**
 * Une opération à poser. `chiffresA`, `chiffresB`, `chiffresR` : un chiffre par colonne (cases vides en tête : « ' ' ») ; `cols` :
 * le nombre de colonnes (celles du résultat) ; `texte` et `attendu` : l'opération et son résultat en une ligne (tableau de correction) ;
 * `cle` : ce qui en fait « la même » opération.
 */
export interface Question {
  cle: string, a: number, b: number, op: Operation, opLabel: string, reponse: number, texte: string, attendu: string, cols: number,
  chiffresA: string[], chiffresB: string[], chiffresR: string[]
}
/** La réponse de l'élève : un chiffre par case du résultat (cases vides : ''). */
export interface Reponse { chiffres: readonly string[] }

const padChiffres = (n: number, len: number): string[] => String(n).padStart(len, ' ').split('')

// Y a-t-il une retenue (addition, multiplication par un chiffre) ou un emprunt (soustraction) dans l'opération ?
function aRetenue(a: number, b: number, op: Operation): boolean {
  const sA = String(a).split('').map(Number).reverse()
  const sB = String(b).split('').map(Number).reverse()
  const len = Math.max(sA.length, sB.length)
  let carry = 0
  for (let i = 0; i < len; i++) {
    const da = sA[i] || 0, db = sB[i] || 0
    if (op === 'add') {
      const s = da + db + carry
      carry = Math.floor(s / 10)
      if (carry) return true
    } else if (op === 'mul') {
      carry = Math.floor((da * b + carry) / 10)
      if (carry) return true
    } else {
      const d = da - db - carry
      carry = d < 0 ? 1 : 0
      if (carry) return true
    }
  }
  return false
}

// cols : colonnes du calcul posé (par défaut, celles du résultat : peut dépasser celles des opérandes, 5 + 8 = 13)
function operation(op: Operation, a: number, b: number, cols: number | null = null): Question {
  const reponse = op === 'add' ? a + b : op === 'sou' ? a - b : a * b
  const colonnes = cols ?? String(reponse).length
  return {
    cle: `${a}${SIGNES[op]}${b}`, a, b, op, opLabel: SIGNES[op], reponse, texte: `${a} ${SIGNES[op]} ${b}`, attendu: String(reponse), cols: colonnes,
    chiffresA: padChiffres(a, colonnes), chiffresB: padChiffres(b, colonnes), chiffresR: padChiffres(reponse, colonnes),
  }
}

function generer({ niveau, reglages, rng }: Parametres): Question {
  const op: Operation = reglages.op === 'mix' ? (rng() > 0.5 ? 'add' : 'sou') : reglages.op
  const taille = Number(reglages.taille)

  // ── 1 chiffre : cas simple, pas de retenue
  if (taille === 1 && op !== 'mul') {
    let a: number, b: number
    if (op === 'add') { a = rng.entier(1, 9); b = rng.entier(1, 9 - a) } else { a = rng.entier(2, 9); b = rng.entier(1, a) }
    return operation(op, a, b)
  }

  const avecRetenue = reglages.retenue === 'oui' || (reglages.retenue === 'mix' && rng() > 0.5)
  if (op === 'mul') {
    // un nombre de 2 ou 3 chiffres (CE2 : au plus 3) multiplié par un seul chiffre
    const t = Math.min(taille, niveau === 'ce2' ? 3 : 4)
    let a: number, b: number
    do {
      a = rng.entier(t === 1 ? 2 : 10 ** (t - 1), 10 ** t - 1)
      b = rng.entier(2, 9)
    } while (aRetenue(a, b, 'mul') !== avecRetenue)
    return operation(op, a, b)
  }

  const max = 10 ** taille - 1
  const lo = Math.floor(max / 10)
  let a: number, b: number
  if (op === 'add') {
    do {
      // a ≤ max − lo pour que b ∈ [lo, max − a] soit non vide (sinon résultat à cols+1 chiffres)
      a = rng.entier(lo, max - lo)
      b = rng.entier(lo, max - a)
    } while (aRetenue(a, b, 'add') !== avecRetenue)
  } else {
    // Soustraction : a >= b >= 0, résultat positif
    do {
      a = rng.entier(Math.floor(max / 2), max)
      b = rng.entier(1, a)
    } while (aRetenue(a, b, 'sou') !== avecRetenue)
  }
  return operation(op, a, b, taille)
}

// `nb` opérations toutes différentes (moins si le réglage n'en offre pas autant) ; 50 tirages par opération demandée
const sansRepetition = (nb: number, contexte: Parametres): Question[] => tirerUniques(nb, () => generer(contexte), { cle: q => q.cle, essais: nb * 50 })

export const questions = ({ niveau, reglages, rng, T, nb = reglages.nbQ }: ParamsGenerateur<Reglages>): Question[] => sansRepetition(nb, { niveau, reglages, rng, T })
export const questionsFiche = (p: Parametres): Question[] => sansRepetition(p.reglages.nbFiche, p)

// chiffres saisis, sans les cases vides
export const chiffresDonnes = (rep: Reponse): string => rep.chiffres.join('').replace(/\s/g, '')
export const verifier = (q: Question, rep: Reponse): Verdict => {
  const donne = chiffresDonnes(rep)
  return donne !== '' && donne === q.attendu
}
export const bonneReponse = (q: Question): Reponse => ({ chiffres: q.chiffresR.map(c => c.trim()) })
/** Une réponse fausse : le dernier chiffre du résultat change. */
export const mauvaiseReponse = (q: Question): Reponse => {
  const chiffres = q.chiffresR.map(c => c.trim())
  const dernier = chiffres.length - 1
  chiffres[dernier] = String((Number(chiffres[dernier]) + 1) % 10)
  return { chiffres }
}

// opérations au programme du niveau, nombres posés et résultats dans le champ numérique du niveau
export function ecartsAuProgramme(qs: readonly Question[], contraintes: Contraintes): string[] {
  const ecarts: string[] = []
  const posees = contraintes.operationsPosees ?? []
  for (const q of qs) {
    if (!posees.includes(OPERATION_DU_SIGNE[q.opLabel])) ecarts.push(`${q.a} ${q.opLabel} ${q.b} : opération posée hors programme`)
    const max = Math.max(q.a, q.b, q.reponse)
    if (contraintes.nombreMax !== undefined && max > contraintes.nombreMax) ecarts.push(`${q.a} ${q.opLabel} ${q.b} : ${max} > ${contraintes.nombreMax} (nombreMax)`)
    if (q.opLabel === '×' && String(q.a).length > 3 && contraintes.niveau === 'ce2') ecarts.push(`${q.a} × ${q.b} : multiplicande de plus de 3 chiffres au CE2`)
  }
  return ecarts
}
