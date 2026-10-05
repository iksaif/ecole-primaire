// Tables de multiplication — générateur (pur : aucun import de Vue, aucun Math.random ; lisible par node).
//   questions({ niveau, reglages, rng, T, nb })   questions de l'exercice à l'écran, selon reglages.mode :
//       'entrainement' : chaque table choisie, de 1 à `jusqu`, dans l'ordre (`premiere` : début d'une table) ;
//       'aleatoire'    : `nb` calculs tirés parmi ceux des tables choisies ;
//       'chrono'       : tous les calculs mélangés, plusieurs fois (le temps s'arrête avant la fin)
//   questionsFiche({ niveau, reglages, rng, T })  tout ce que tire la fiche imprimable (fiche.js la met en page)
//   verifier(q, rep)  bonneReponse(q)             rep : le nombre tapé
//   ecartsAuProgramme(questions, contraintes)     ce qui sort du programme du niveau (tests)
// rng : src/utils/hasard.js. L'ordre des tirages est celui de l'ancienne vue : mêmes questions, mêmes fiches.

const calcul = (a, b) => ({ cle: `${a}x${b}`, a, b, texte: `${a} × ${b} = ?`, reponse: a * b, attendu: String(a * b) })
const tousLesCalculs = (tables, jusqu) => tables.flatMap(a => Array.from({ length: jusqu }, (_, i) => calcul(a, i + 1)))

export function questions({ reglages, rng, nb = reglages.nbQ }) {
  const { tables, jusqu, mode } = reglages
  if (mode === 'entrainement') {
    return tables.flatMap(a => Array.from({ length: jusqu }, (_, i) => ({ ...calcul(a, i + 1), premiere: i === 0 })))
  }
  if (mode === 'aleatoire') return rng.melanger(tousLesCalculs(tables, jusqu)).slice(0, nb)
  // chrono : un pool mélangé, et deux autres derrière (le défi s'arrête au bout d'une minute)
  return [0, 1, 2].flatMap(() => rng.melanger(tousLesCalculs(tables, jusqu)))
}

// Fiche : les calculs des tables choisies (dans l'ordre ou mélangés), tous ou `nbFiche` d'entre eux
export function questionsFiche({ reglages, rng }) {
  const tables = reglages.tables.slice().sort((a, b) => a - b)
  const jusqu = reglages.jusqu ?? 10
  let tous = []
  for (const a of tables) for (let i = 1; i <= jusqu; i++) tous.push({ a, b: i, r: a * i })
  const nb = reglages.nbFiche
  if (reglages.ordreFiche === 'melange') {
    tous = rng.melanger(tous)
    if (nb > 0) tous = tous.slice(0, nb)
  } else if (nb > 0 && nb < tous.length) {
    // dans l'ordre : on tire les calculs au hasard puis on les remet dans l'ordre des tables
    const choisis = new Set(rng.melanger(tous).slice(0, nb))
    tous = tous.filter(q => choisis.has(q))
  }
  return { tables, jusqu, questions: tous }
}

export const verifier = (q, rep) => String(rep).trim() !== '' && +rep === q.reponse

export const bonneReponse = q => String(q.reponse)

export function ecartsAuProgramme(x, contraintes) {
  const qs = Array.isArray(x) ? x : x.questions
  const max = contraintes.facteurMax
  return [...new Set(qs.filter(q => q.a > max || q.b > max).map(q => `${q.a} × ${q.b} : facteur > ${max} (facteurMax)`))]
}
