// Les motifs — générateur (pur : aucun import de Vue, aucun Math.random ; lisible par node).
//   questions({ niveau, reglages, rng, T, nb })   questions de l'exercice à l'écran
//   questionsFiche({ niveau, reglages, rng, T })  tout ce que tire la fiche imprimable (5 frises en PS, sinon 6)
//   verifier(q, rep)                              rep : { choix: indice de la proposition touchée }
//   ecartsAuProgramme(questions, contraintes)     ce qui sort du programme du niveau (tests)
// Les motifs eux-mêmes (types par niveau, suite) : src/utils/motifs.js, pur et testé. rng : src/utils/hasard.js ;
// l'ordre des tirages est celui de l'ancienne vue : mêmes questions, mêmes fiches.
import { question as questionMotif, nbElements, TYPES_DU_NIVEAU } from '../../utils/motifs.js'

// Éléments des frises : couleurs, formes et images (4 par thème : ABCD au plus)
export const THEMES = [
  ['🔴', '🔵', '🟡', '🟢'], ['⭐', '🌙', '☀️', '☁️'], ['🍎', '🍌', '🍇', '🍓'],
  ['🐱', '🐶', '🐰', '🐻'], ['🟥', '🟦', '🟨', '🟩'], ['🌸', '🍀', '🍄', '🌻'],
]

/**
 * Une question : le motif (indices dans `elements`), la place de la case « ? », l'élément attendu et les propositions.
 * PS : 2 choix (les deux éléments du motif) ; sinon les éléments du motif, complétés jusqu'à 3.
 */
export function question({ niveau, reglages, rng }) {
  const m = questionMotif(niveau, reglages.mode, rng)
  const elements = rng.melanger(THEMES[rng.entier(0, THEMES.length - 1)])
  const dans = Array.from({ length: nbElements(m.type) }, (_, i) => i)
  const nb = niveau === 'ps' ? 2 : 3
  const choix = rng.melanger([...dans, ...[0, 1, 2, 3].filter(i => !dans.includes(i))].slice(0, Math.max(nb, dans.length)))
  const propositions = choix.includes(m.attendu) ? choix : [m.attendu, ...choix.slice(1)]
  return {
    ...m, cle: `${m.type}${m.place}${elements.join('')}`, elements, choix: propositions,
    // propositions pour <ChoixReponses> (l'élément en emoji) ; bonne : indice de l'élément attendu
    options: propositions.map(c => ({ label: elements[c], valeur: c })), bonne: propositions.indexOf(m.attendu),
  }
}

export const questions = ({ niveau, reglages, rng, nb = reglages.nbQ }) => Array.from({ length: nb }, () => question({ niveau, reglages, rng }))

// Fiche : frises à continuer ; 5 en PS, 6 sinon (nbQ ne compte pas : une page de frises)
export const questionsFiche = ({ niveau, reglages, rng }) => ({
  niveau, mode: reglages.mode, questions: questions({ niveau, reglages, rng, nb: niveau === 'ps' ? 5 : 6 }),
})

export const verifier = (q, rep) => rep.choix === q.bonne

export function ecartsAuProgramme(x, contraintes) {
  const qs = Array.isArray(x) ? x : x.questions
  const permis = TYPES_DU_NIVEAU[contraintes.niveau] ?? []
  const ecarts = qs.filter(q => !permis.includes(q.type)).map(q => `motif ${q.type} hors programme du niveau`)
  if (contraintes.motifs === 'alternance') ecarts.push(...qs.filter(q => q.type !== 'AB').map(q => `motif ${q.type} : seule l'alternance AB est au programme`))
  return [...new Set(ecarts)]
}
