// Calcul posé — générateur (pur : aucun import de Vue, aucun Math.random ; lisible par node).
//   questions({ niveau, reglages, rng, T, nb })   opérations à poser à l'écran, sans répétition
//   questionsFiche({ niveau, reglages, rng, T })  tout ce que tire la fiche imprimable (reglages.nbFiche opérations)
//   verifier(q, rep)                              rep : { chiffres: ['4', '2', …] } (une case par colonne du résultat)
//   bonneReponse(q)                               une réponse juste (tests)
//   ecartsAuProgramme(questions, contraintes)     ce qui sort du programme du niveau (tests)
// rng : src/utils/hasard.js. L'ordre des tirages est celui de l'ancienne vue pour l'addition et la soustraction.

export const SIGNES = { add: '+', sou: '−', mul: '×' }
const OPERATION_DU_SIGNE = { '+': 'addition', '−': 'soustraction', '×': 'multiplication' }

const padChiffres = (n, len) => String(n).padStart(len, ' ').split('')

// Y a-t-il une retenue (addition, multiplication par un chiffre) ou un emprunt (soustraction) dans l'opération ?
function aRetenue(a, b, op) {
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
function operation(op, a, b, cols = null) {
  const reponse = op === 'add' ? a + b : op === 'sou' ? a - b : a * b
  cols ??= String(reponse).length
  return {
    cle: `${a}${SIGNES[op]}${b}`, a, b, op, opLabel: SIGNES[op], reponse, attendu: String(reponse), cols,
    chiffresA: padChiffres(a, cols), chiffresB: padChiffres(b, cols), chiffresR: padChiffres(reponse, cols),
  }
}

function generer({ niveau, reglages, rng }) {
  const op = reglages.op === 'mix' ? (rng() > 0.5 ? 'add' : 'sou') : reglages.op

  // ── 1 chiffre : cas simple, pas de retenue
  if (reglages.taille === '1' && op !== 'mul') {
    let a, b
    if (op === 'add') { a = rng.entier(1, 9); b = rng.entier(1, 9 - a) } else { a = rng.entier(2, 9); b = rng.entier(1, a) }
    return operation(op, a, b)
  }

  const avecRetenue = reglages.retenue === 'oui' || (reglages.retenue === 'mix' && rng() > 0.5)
  if (op === 'mul') {
    // un nombre de 2 ou 3 chiffres (CE2 : au plus 3) multiplié par un seul chiffre
    const taille = Math.min(+reglages.taille, niveau === 'ce2' ? 3 : 4)
    let a, b
    do {
      a = rng.entier(taille === 1 ? 2 : 10 ** (taille - 1), 10 ** taille - 1)
      b = rng.entier(2, 9)
    } while (aRetenue(a, b, 'mul') !== avecRetenue)
    return operation(op, a, b)
  }

  const max = 10 ** +reglages.taille - 1
  const lo = Math.floor(max / 10)
  let a, b
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
  return operation(op, a, b, +reglages.taille)
}

function sansRepetition(nb, contexte) {
  const vus = new Set()
  const result = []
  let essais = 0
  while (result.length < nb && essais < nb * 50) {
    essais++
    const q = generer(contexte)
    if (!vus.has(q.cle)) { vus.add(q.cle); result.push(q) }
  }
  return result
}

export const questions = ({ niveau, reglages, rng, nb = reglages.nbQ }) => sansRepetition(nb, { niveau, reglages, rng })
export const questionsFiche = ({ niveau, reglages, rng }) => sansRepetition(reglages.nbFiche, { niveau, reglages, rng })

// chiffres saisis, sans les cases vides
export const chiffresDonnes = rep => rep.chiffres.join('').replace(/\s/g, '')
export const verifier = (q, rep) => {
  const donne = chiffresDonnes(rep)
  return donne !== '' && donne === q.attendu
}
export const bonneReponse = q => ({ chiffres: q.chiffresR.map(c => c.trim()) })

// opérations au programme du niveau, nombres posés et résultats dans le champ numérique du niveau
export function ecartsAuProgramme(qs, contraintes) {
  const ecarts = []
  for (const q of qs) {
    if (!contraintes.operationsPosees.includes(OPERATION_DU_SIGNE[q.opLabel])) ecarts.push(`${q.a} ${q.opLabel} ${q.b} : opération posée hors programme`)
    const max = Math.max(q.a, q.b, q.reponse)
    if (max > contraintes.nombreMax) ecarts.push(`${q.a} ${q.opLabel} ${q.b} : ${max} > ${contraintes.nombreMax} (nombreMax)`)
    if (q.opLabel === '×' && String(q.a).length > 3 && contraintes.niveau === 'ce2') ecarts.push(`${q.a} × ${q.b} : multiplicande de plus de 3 chiffres au CE2`)
  }
  return ecarts
}
