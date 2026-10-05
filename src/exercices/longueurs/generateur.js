// Plus long, plus court — générateur (pur : aucun import de Vue, aucun Math.random ; lisible par node).
//   questions({ niveau, reglages, rng, T, nb })   questions de l'exercice à l'écran
//   questionsFiche({ niveau, reglages, rng, T })  tout ce que tire la fiche imprimable (4 séries à ranger, sinon 6)
//   verifier(q, rep)                              rep : { choix: crayon touché } (comparer) ou { ordre: [crayons touchés] }
//   bonPrefixe(q, ordre)                          les crayons touchés jusqu'ici sont-ils dans le bon ordre ? (ranger)
//   bonneReponse(q)  ecartsAuProgramme(questions, contraintes)
// rng : src/utils/hasard.js. L'ordre des tirages est celui de l'ancienne vue : mêmes questions, mêmes fiches.

// PS : longueurs très différentes (rapport ≥ 2), 3 objets ; MS : écarts plus petits, 4 ; GS : écarts fins, 5
export const NIVEAUX_LONG = { ps: { rapport: 2, nb: 3 }, ms: { rapport: 1.35, nb: 4 }, gs: { rapport: 1.15, nb: 5 } }
export const LARGEUR = 300
const COULEURS = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#e91e8c']

// longueurs croissantes, chacune au moins `rapport` fois la précédente (en partant de 60 sur 300)
function longueurs(n, rapport, rng) {
  const res = [55 + rng.entier(0, 19)]
  while (res.length < n) res.push(Math.min(LARGEUR - 4, Math.ceil(res.at(-1) * rapport) + rng.entier(0, 14)))
  return res
}

// indices des crayons du plus court au plus long
export const rangsAttendus = q => [...q.crayons.keys()].sort((a, b) => q.crayons[a].longueur - q.crayons[b].longueur)
// crayon attendu quand on compare deux crayons
export const attendu = q => rangsAttendus(q)[q.cherche === 'long' ? q.crayons.length - 1 : 0]

export function question({ niveau, reglages, rng }) {
  const { rapport, nb } = NIVEAUX_LONG[niveau]
  const n = reglages.mode === 'ranger' ? nb : 2
  const couleurs = rng.melanger(COULEURS)
  const crayons = rng.melanger(longueurs(n, n === 2 ? rapport : Math.min(rapport, 1.3), rng).map((longueur, i) => ({ longueur, couleur: couleurs[i] })))
  return { cle: crayons.map(c => c.longueur).join('-'), mode: reglages.mode, crayons, cherche: rng.vrai(0.5) ? 'long' : 'court' }
}

export const questions = ({ niveau, reglages, rng, nb = reglages.nbQ }) => Array.from({ length: nb }, () => question({ niveau, reglages, rng }))

// Fiche : entourer le plus long (ou le plus court) ; MS et GS : numéroter du plus court au plus long. PS : toujours le plus long.
export function questionsFiche({ niveau, reglages, rng }) {
  const ranger = reglages.mode === 'ranger' && niveau !== 'ps'
  const qs = Array.from({ length: ranger ? 4 : 6 }, () => ({ ...question({ niveau, reglages, rng }), ...(niveau === 'ps' ? { cherche: 'long' } : {}) }))
  return { niveau, ranger, questions: qs }
}

export const bonPrefixe = (q, ordre) => ordre.every((c, i) => c === rangsAttendus(q)[i])

export function verifier(q, rep) {
  if (q.mode === 'ranger') return rep.ordre.length === q.crayons.length && bonPrefixe(q, rep.ordre)
  return rep.choix === attendu(q)
}

export const bonneReponse = q => (q.mode === 'ranger' ? { ordre: rangsAttendus(q) } : { choix: attendu(q) })

export function ecartsAuProgramme(x, contraintes) {
  const qs = Array.isArray(x) ? x : x.questions
  const max = NIVEAUX_LONG[contraintes.niveau].nb
  return qs.some(q => q.crayons.length > max) ? [`plus de ${max} objets à comparer`] : []
}
