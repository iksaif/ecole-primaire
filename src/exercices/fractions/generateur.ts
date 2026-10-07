// Les fractions — générateur : QUOI poser comme questions, et comment les corriger. Pur : aucun import de Vue, aucun Math.random
// (le hasard vient de `rng`), donc lisible par node, par les tests et par le build des fiches.
//   questions({ niveau, reglages, rng, T, nb })   questions de l'exercice à l'écran, jamais deux fois la même
//   questionsFiche({ niveau, reglages, rng, T })  les questions de la fiche imprimable (fiche.ts la met en page)
//   verifier(q, rep)                              rep : { texte } (nombre), { choix } (proposition), { parts } (nombre de parts
//                                                 coloriées), { graduation } (rang sur la droite)
//   bonneReponse(q) / mauvaiseReponse(q)          une réponse juste / fausse, dans la forme de verifier (tests)
//   ecartsAuProgramme(questions, contraintes)     ce qui sort du programme du niveau (tests)
// Une fonction par type de question : questions.ts. L'ordre des tirages est celui de l'ancienne vue : mêmes fiches à graine égale.
import type { Classe, Contraintes, ParamsGenerateur, Verdict } from '../../noyau/types.ts'
import type { ReglagesDeDefinition } from '../../noyau/definir.ts'
import { tirerUniques } from '../../noyau/uniques.ts'
import type DEFINITION from './definition.ts'
import { genIdentifier, genColorier, genLettres, genPartDe, genEgales, genDroite, genPlacer, cle } from './questions.ts'
import type { Contexte, DonneesNiveau, Fraction, Question, TypeQuestion } from './questions.ts'

export { cle, enLettres, ordinal } from './questions.ts'
export type { Fraction, Question } from './questions.ts'

type Reglages = ReglagesDeDefinition<typeof DEFINITION>

/** La réponse de l'élève selon le type de question. */
export type Reponse = { texte: string } | { choix: Fraction } | { parts: number } | { graduation: number }

// Données par niveau (programme : fractions ≤ 1 au cycle 2, dénominateurs 2, 3, 4, 5, 6, 8, 10). Les types proposés sont dans la
// définition. partDe : « la moitié de 8 » (calcul mental du cycle 2) : totaux possibles ; le tiers ou le quart d'une quantité
// (fraction opérateur) est au programme du CM1.
const DONNEES: Readonly<Partial<Record<Classe, DonneesNiveau>>> = {
  ce1: {
    denominateurs: [2, 3, 4, 5, 6, 8, 10],
    partDe: { 2: { max: 20, extra: [30, 40, 50, 60, 80, 100] } },
  },
  ce2: {
    denominateurs: [2, 3, 4, 5, 6, 8, 10],
    droiteUnites: [1],             // droite graduée de 0 à 1 (fractions ≤ 1)
    partDe: { 2: { max: 40, extra: [50, 60, 80, 100, 200, 500] } },
  },
}

const GENERATEURS: Readonly<Record<TypeQuestion, (ctx: Contexte) => Question>> = {
  identifier: genIdentifier, colorier: genColorier, lettres: genLettres, partDe: genPartDe,
  egales: genEgales, droite: genDroite, placer: genPlacer,
}

function genererSansRepetition({ rng, T, niveau, reglages }: ParamsGenerateur<Reglages>, nb: number): Question[] {
  const niv = DONNEES[niveau]
  if (!niv) throw new Error(`fractions : niveau « ${niveau} » inconnu`)
  const mode = reglages.mode === 'unitaires' ? 'unitaires' : 'toutes'
  const types: TypeQuestion[] = reglages.types.length ? [...reglages.types] : ['identifier']
  // types mélangés d'abord : avec moins de questions que de types, pas toujours les mêmes oubliés
  const typesMelanges = rng.melanger(types)
  const ordre = rng.melanger(Array.from({ length: nb }, (_, i) => typesMelanges[i % typesMelanges.length]))
  const vus = new Set<string>()
  let echecs = 0
  return tirerUniques(nb, rang => {
    const type = echecs > 20 ? types[rng.entier(0, types.length - 1)] : ordre[rang]
    const q = GENERATEURS[type]({ rng, T, niv, mode })
    if (vus.has(q.cle)) echecs++
    else { vus.add(q.cle); echecs = 0 }
    return q
  }, { cle: q => q.cle, essais: nb * 50 })
}

export const questions = (p: ParamsGenerateur<Reglages>): Question[] => genererSansRepetition(p, p.nb ?? p.reglages.nbQ)
export const questionsFiche = (p: Omit<ParamsGenerateur<Reglages>, 'nb'>): Question[] => genererSansRepetition(p, p.reglages.nbFiche)

export function verifier(q: Question, rep: Reponse): Verdict {
  if (q.kind === 'nombre') return 'texte' in rep && +String(rep.texte).trim() === q.reponse
  if (q.kind === 'parts') return 'parts' in rep && rep.parts === q.reponse.n
  if (q.kind === 'placer') return 'graduation' in rep && rep.graduation === q.reponse.n
  return 'choix' in rep && cle(rep.choix) === cle(q.reponse)
}

export function bonneReponse(q: Question): Reponse {
  if (q.kind === 'nombre') return { texte: String(q.reponse) }
  if (q.kind === 'parts') return { parts: q.reponse.n }
  if (q.kind === 'placer') return { graduation: q.reponse.n }
  return { choix: q.reponse }
}

export function mauvaiseReponse(q: Question): Reponse {
  if (q.kind === 'nombre') return { texte: String(q.reponse + 1) }
  if (q.kind === 'parts') return { parts: q.reponse.n + 1 }
  if (q.kind === 'placer') return { graduation: q.reponse.n + 1 }
  return { choix: q.choix.find(c => cle(c) !== cle(q.reponse)) ?? { n: q.reponse.n + 1, d: q.reponse.d } }
}

// Fractions demandées ou affichées (pas les propositions) : dénominateur au programme, fraction ≤ 1.
// Écart connu, non corrigé (les fiches resteraient identiques sinon) : le distracteur « inversion » (3/4 → 4/3) peut montrer
// une fraction > 1 parmi les propositions.
export function ecartsAuProgramme(qs: readonly Question[], contraintes: Contraintes): string[] {
  const k = contraintes.fractions
  if (!k) return ['fractions : pas au programme du niveau']
  const ecarts: string[] = []
  for (const q of qs) for (const f of q.fractions) {
    const ok = k.denominateurs ? k.denominateurs.includes(f.d) : f.d <= (k.denominateurMax ?? Infinity)
    if (!ok) ecarts.push(`${cle(f)} : dénominateur ${f.d}`)
    if (!k.superieuresA1 && f.n > f.d) ecarts.push(`${cle(f)} : fraction > 1`)
  }
  return [...new Set(ecarts)]
}
