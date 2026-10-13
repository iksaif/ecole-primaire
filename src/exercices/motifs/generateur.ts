// Les motifs — générateur : QUOI poser comme questions, et comment les corriger. Pur : aucun import de Vue, aucun Math.random (le hasard
// vient de `rng`), donc lisible par node, par les tests et par le build des fiches.
//   questions({ niveau, reglages, rng, T, nb })   questions de l'exercice à l'écran, jamais deux fois la même
//   questionsFiche({ niveau, reglages, rng, T })  tout ce que tire la fiche imprimable (5 frises en PS, sinon 6)
//   verifier(q, rep)                              rep : { choix: indice de la proposition touchée }
//   bonneReponse(q) / mauvaiseReponse(q)          une réponse juste / fausse, dans la forme de verifier (tests)
//   ecartsAuProgramme(questions, contraintes)     ce qui sort du programme du niveau (tests)
// Les motifs eux-mêmes (types par niveau, suite) : motifs.ts, pur et testé. L'ordre des tirages est celui de l'ancienne vue.
import type { Classe, Contraintes, ParamsGenerateur, Rng, Verdict } from '../../noyau/types.ts'
import type { ReglagesDeDefinition } from '../../noyau/definir.ts'
import { tirerUniques } from '../../noyau/uniques.ts'
import type { CleContenu } from '../../langues/catalogue.ts'
import { TYPES_DU_NIVEAU, nbElements, questionMotif } from './motifs.ts'
import type { ModeMotif, QuestionMotif } from './motifs.ts'
import type DEFINITION from './definition.ts'
import type { CONTENU } from './textes.ts'
import type { NomEmoji } from '../../images/tables.ts'
import { caractereEmoji } from '../../images/systeme.ts'

type Reglages = ReglagesDeDefinition<typeof DEFINITION>
type Cle = CleContenu<typeof CONTENU>

/**
 * Un thème de frise : 4 éléments (ABCD au plus), des emojis du vocabulaire (src/images/tables.ts). `sorte` dit ce qu'en fait l'enfant
 * sur la fiche : « couleur », une forme qu'il colorie (la case a le contour de la forme) ; « dessin », assez simple pour être dessiné ;
 * « image », trop dure à dessiner pour un GS : elle se découpe en bas de la fiche.
 */
export interface Theme { elements: readonly NomEmoji[], sorte: 'couleur' | 'dessin' | 'image', forme: FormeCase }
/** La forme de la case vide sur la fiche : celle des éléments à colorier, une place carrée aux coins arrondis sinon. */
export type FormeCase = 'rond' | 'carre' | 'coeur' | 'place'

// l'ordre des trois premiers est celui de l'ancienne liste (jeu à l'écran) ; les thèmes sont tous proposés à l'écran
export const THEMES: readonly Theme[] = [
  { elements: ['rondRouge', 'rondBleu', 'rondJaune', 'rondVert'], sorte: 'couleur', forme: 'rond' },
  { elements: ['etoile', 'lune', 'soleil', 'nuage'], sorte: 'dessin', forme: 'place' },
  { elements: ['pomme', 'banane', 'raisin', 'fraise'], sorte: 'image', forme: 'place' },
  { elements: ['chat', 'chiot', 'lapin', 'ours'], sorte: 'image', forme: 'place' },
  { elements: ['carreRouge', 'carreBleu', 'carreJaune', 'carreVert'], sorte: 'couleur', forme: 'carre' },
  { elements: ['fleur', 'trefle', 'champignon', 'tournesol'], sorte: 'image', forme: 'place' },
  { elements: ['coeurRouge', 'coeurBleu', 'coeurJaune', 'coeurVert'], sorte: 'couleur', forme: 'coeur' },
  { elements: ['rondRouge', 'carreRouge', 'triangleRouge', 'coeurRouge'], sorte: 'dessin', forme: 'place' },
]
const DE_SORTE = (sorte: Theme['sorte']): readonly Theme[] => THEMES.filter(t => t.sorte === sorte)

/**
 * Une proposition de réponse : son libellé (le caractère de l'élément : le nom du bouton, lu par les lecteurs d'écran ; le jeu dessine
 * l'élément) et son indice dans la liste d'éléments de la question.
 */
export interface Proposition { label: string, valeur: number }

/**
 * Une question : le motif (indices dans `elements`), la place de la case « ? », l'élément attendu et les propositions.
 * PS : 2 choix (les deux éléments du motif) ; sinon les éléments du motif, complétés jusqu'à 3. `cle` : ce qui fait deux questions
 * « la même » (le motif, la case, et les éléments qu'on voit, quel que soit l'ordre des propositions).
 */
export interface Question extends QuestionMotif {
  cle: string
  elements: NomEmoji[]
  /** ce que l'enfant fait de ces éléments sur la fiche, et la forme de la case vide */
  sorte: Theme['sorte']
  forme: FormeCase
  /** indices des éléments proposés */
  choix: number[]
  options: Proposition[]
  /** indice de la bonne proposition */
  bonne: number
}
/** La réponse de l'élève : l'indice de la proposition touchée. */
export interface Reponse { choix: number }
/** Ce que tire la fiche : le niveau, le mode, ce que fait l'enfant (dessine, colorie ; PS : entoure) et les frises. */
export interface TirageFiche { niveau: Classe, mode: ModeMotif, fiche: 'dessine' | 'colorie', questions: Question[] }

/** Une question ; `themes` : ceux parmi lesquels tirer (tous à l'écran ; sur la fiche, ceux de ce que fait l'enfant). */
export function question({ niveau, mode, rng, themes = THEMES }: { niveau: Classe, mode: ModeMotif, rng: Rng, themes?: readonly Theme[] }): Question {
  const m = questionMotif(niveau, mode, rng)
  const theme = themes[rng.entier(0, themes.length - 1)]
  const elements = rng.melanger(theme.elements)
  const dans = Array.from({ length: nbElements(m.type) }, (_, i) => i)
  const nb = niveau === 'ps' ? 2 : 3
  const choix = rng.melanger([...dans, ...[0, 1, 2, 3].filter(i => !dans.includes(i))].slice(0, Math.max(nb, dans.length)))
  const propositions = choix.includes(m.attendu) ? choix : [m.attendu, ...choix.slice(1)]
  const vus = elements.slice(0, dans.length).join('')
  return {
    ...m, cle: `${m.type}${m.place}${vus}/${propositions.map(c => elements[c]).sort().join('')}`, elements, sorte: theme.sorte, forme: theme.forme, choix: propositions,
    // propositions pour <ChoixReponses> (libellé : le caractère de l'élément) ; bonne : indice de l'élément attendu
    options: propositions.map(c => ({ label: caractereEmoji(elements[c]), valeur: c })), bonne: propositions.indexOf(m.attendu),
  }
}

export const questions = ({ niveau, reglages, rng, nb = reglages.nbQ }: ParamsGenerateur<Reglages, Cle>): Question[] =>
  tirerUniques(nb, () => question({ niveau, mode: reglages.mode, rng }), { cle: q => q.cle })

/**
 * Les thèmes de la ligne `rang` de la fiche. PS (entourer) : tous. « colorie » : les formes de couleur. « dessine » : des dessins simples
 * et des formes de couleur, et une ligne sur trois d'images (à découper en bas de la fiche : pas plus de deux lignes, pour que la bande
 * reste courte).
 */
function themesDeLaLigne(niveau: Classe, fiche: TirageFiche['fiche'], rang: number): readonly Theme[] {
  if (niveau === 'ps') return THEMES
  if (fiche === 'colorie') return DE_SORTE('couleur')
  if (rang % 3 === 2) return DE_SORTE('image')
  return [...DE_SORTE('dessin'), ...DE_SORTE('couleur')]
}

// Fiche : frises à continuer ; 5 en PS, 6 sinon (nbQ ne compte pas : une page de frises)
export function questionsFiche({ niveau, reglages, rng }: Omit<ParamsGenerateur<Reglages, Cle>, 'nb'>): TirageFiche {
  const fiche = reglages.fiche
  const nb = niveau === 'ps' ? 5 : 6
  const tirees = tirerUniques(nb, rang => question({ niveau, mode: reglages.mode, rng, themes: themesDeLaLigne(niveau, fiche, rang) }), { cle: q => q.cle })
  return { niveau, mode: reglages.mode, fiche, questions: tirees }
}

export const verifier = (q: Question, rep: Reponse): Verdict => rep.choix === q.bonne

export const bonneReponse = (q: Question): Reponse => ({ choix: q.bonne })
export const mauvaiseReponse = (q: Question): Reponse => ({ choix: (q.bonne + 1) % q.choix.length })

export function ecartsAuProgramme(x: readonly Question[] | TirageFiche, contraintes: Contraintes): string[] {
  const qs = Array.isArray(x) ? x : (x as TirageFiche).questions
  const permis = TYPES_DU_NIVEAU[contraintes.niveau] ?? []
  const ecarts = qs.filter(q => !permis.includes(q.type)).map(q => `motif ${q.type} hors programme du niveau`)
  if (contraintes.motifs === 'alternance') ecarts.push(...qs.filter(q => q.type !== 'AB').map(q => `motif ${q.type} : seule l'alternance AB est au programme`))
  return [...new Set(ecarts)]
}
