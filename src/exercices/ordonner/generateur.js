// Ranger les nombres — générateur (pur : aucun import de Vue, aucun Math.random ; lisible par node).
//   questions({ niveau, reglages, rng, T, nb })   questions de l'exercice à l'écran
//   questionsFiche({ niveau, reglages, rng, T })  tout ce que tire la fiche imprimable (les mêmes questions)
//   verifier(q, rep)                              rep : { ordre: [nombres cliqués, dans l'ordre] }
//   bonneReponse(q)                               une réponse juste, dans la forme attendue par verifier (tests)
//   ecartsAuProgramme(questions, contraintes)     ce qui sort du programme du niveau (tests)
// rng : src/utils/hasard.js. L'ordre des tirages est celui de l'ancienne vue : mêmes questions, mêmes fiches.

// Plus grand nombre rangé, par niveau (programme : MS jusqu'à 6, GS jusqu'à 10)
export const NOMBRE_MAX = { ms: 5, gs: 10 }

/** Une question : `taille` nombres tirés entre 1 et le maximum du niveau, en désordre, et leur bon ordre. */
export function question({ niveau, reglages, rng }) {
  const pool = Array.from({ length: NOMBRE_MAX[niveau] }, (_, i) => i + 1)
  const choix = rng.melanger(pool).slice(0, reglages.taille)
  const sens = reglages.sens === 'mix' ? (rng() > 0.5 ? 'croissant' : 'decroissant') : reglages.sens
  const bonne = [...choix].sort((a, b) => (sens === 'croissant' ? a - b : b - a))
  return { cle: `${sens}:${bonne.join('-')}`, nombres: rng.melanger(choix), bonne, sens }
}

export function questions({ niveau, reglages, rng, nb = reglages.nbQ }) {
  return Array.from({ length: nb }, () => question({ niveau, reglages, rng }))
}

export const questionsFiche = ({ niveau, reglages, rng }) => questions({ niveau, reglages, rng })

export const verifier = (q, rep) => rep.ordre.join(',') === q.bonne.join(',')

export const bonneReponse = q => ({ ordre: q.bonne })

export function ecartsAuProgramme(questions, contraintes) {
  const max = Math.max(0, ...questions.flatMap(q => q.nombres))
  return max > contraintes.nombreMax ? [`nombre ${max} > ${contraintes.nombreMax} (nombreMax)`] : []
}
