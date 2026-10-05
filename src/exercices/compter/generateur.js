// Compter les objets — générateur (pur : aucun import de Vue, aucun Math.random ; lisible par node).
//   questions({ niveau, reglages, rng, T, nb })   questions de l'exercice à l'écran
//   questionsFiche({ niveau, reglages, rng, T })  tout ce que tire la fiche imprimable (les mêmes questions)
//   verifier(q, rep)                              rep : { choix: indice de la proposition touchée }
//   ecartsAuProgramme(questions, contraintes)     ce qui sort du programme du niveau (tests)
// rng : src/utils/hasard.js. L'ordre des tirages est celui de l'ancienne vue : mêmes questions, mêmes fiches.

// Objets à compter ; leur nom (contenu, langue de l'interface) : src/i18n/<langue>/contenu/compter.js
export const OBJETS = [
  { emoji: '🍎', id: 'pomme' },
  { emoji: '⭐', id: 'etoile' },
  { emoji: '🐱', id: 'chat' },
  { emoji: '🌸', id: 'fleur' },
  { emoji: '🚗', id: 'voiture' },
  { emoji: '🦋', id: 'papillon' },
  { emoji: '🐸', id: 'grenouille' },
  { emoji: '🍓', id: 'fraise' },
  { emoji: '🐠', id: 'poisson' },
  { emoji: '🌙', id: 'lune' },
]

// Plus grand nombre compté (programme : PS 3, « voire 4 » pas systématique ; MS 6 ; GS 10)
export const NOMBRE_MAX = { ps: 3, ms: 6, gs: 10 }

/**
 * Une question : `nb` objets à compter et des propositions. PS : toujours 1, 2, 3 (affichés en points) ; sinon la
 * bonne réponse et jusqu'à 3 distracteurs proches (à 3 près), tirés parmi ceux qui existent.
 */
export function question({ niveau, rng }) {
  const max = NOMBRE_MAX[niveau]
  const nb = rng.entier(1, max)
  const objet = OBJETS[rng.entier(0, OBJETS.length - 1)]
  let choix
  if (niveau === 'ps') choix = [1, 2, 3]
  else {
    const proches = rng.melanger(Array.from({ length: max }, (_, i) => i + 1).filter(d => d !== nb && Math.abs(d - nb) <= 3))
    choix = rng.melanger([nb, ...proches.slice(0, 3)])
  }
  return {
    cle: `${objet.id}${nb}`, nb, emoji: objet.emoji, objet: objet.id, choix, reponse: nb,
    // propositions pour <ChoixReponses> : la valeur est le nombre (affichée en chiffre, ou en points en PS)
    options: choix.map(c => ({ label: String(c), valeur: c })), bonne: choix.indexOf(nb),
  }
}

export const questions = ({ niveau, reglages, rng, nb = reglages.nbQ }) => Array.from({ length: nb }, () => question({ niveau, rng }))

export const questionsFiche = ({ niveau, reglages, rng }) => ({ niveau, reponse: reglages.reponse, questions: questions({ niveau, reglages, rng }) })

export const verifier = (q, rep) => rep.choix === q.bonne

export function ecartsAuProgramme(x, contraintes) {
  const qs = Array.isArray(x) ? x : x.questions
  const max = Math.max(0, ...qs.flatMap(q => [q.nb, ...q.choix]))
  return max > contraintes.nombreMax ? [`nombre ${max} > ${contraintes.nombreMax} (nombreMax)`] : []
}
