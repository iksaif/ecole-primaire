// Les nombres — générateur : QUOI poser comme questions, et comment les corriger. Pur : aucun import de Vue, aucun Math.random
// (le hasard vient de `rng`), donc lisible par node, par les tests et par le build des fiches.
//   questions({ niveau, reglages, rng, T, nb })   questions de l'exercice à l'écran, jamais deux fois la même
//   questionsFiche({ niveau, reglages, rng, T })  les questions de la fiche imprimable (fiche.ts la met en page)
//   verifier(q, rep)                              la réponse est-elle juste ? rep : { texte } (nombre), { cdu: {champ: chiffre} },
//                                                 { choix } (proposition), { ordre: [nombres] }
//   bonneReponse(q) / mauvaiseReponse(q)          une réponse juste / fausse, dans la forme de verifier (tests)
//   ecartsAuProgramme(questions, contraintes)     ce qui sort du programme du niveau (tests)
// Une fonction par type de question : questions.ts. rng : src/utils/hasard.ts ; T(cle, params) : textes (textes.ts).
// L'ordre des tirages est celui de l'ancienne vue : mêmes questions, mêmes fiches à graine égale (tests/instantanes).
import type { Classe, Contraintes, ParamsGenerateur, Verdict } from '../../noyau/types.ts'
import type { ReglagesDeDefinition } from '../../noyau/definir.ts'
import { tirerUniques } from '../../noyau/uniques.ts'
import type { CleContenu } from '../../langues/catalogue.ts'
import DEFINITION from './definition.ts'
import type { TYPES } from './definition.ts'
import type { CONTENU } from './textes.ts'
import {
  genDecomposer, genRepresentation, genLettresChiffres, genChiffresLettres, genComparer, genSuites, genDroite, genRanger,
} from './questions.ts'
import type { Champ, Chiffres, Contexte, DonneesNiveau, Question } from './questions.ts'

export { fmt, libCdu } from './questions.ts'
export type { Champ, Chiffres, Question, QChoix, QDecomposerCdu, QNombre, QOrdre } from './questions.ts'

type Reglages = ReglagesDeDefinition<typeof DEFINITION>
type Cle = CleContenu<typeof CONTENU>
/** Un type de question : une valeur du réglage `types`. */
export type TypeQuestion = (typeof TYPES)[number]

/** Les unités de numération de la case qu'on remplit, de la plus grande à la plus petite. */
export const LIBELLES_CDU: Readonly<Record<Champ, `lib.${Champ}`>> = {
  milliers: 'lib.milliers', centaines: 'lib.centaines', dizaines: 'lib.dizaines', unites: 'lib.unites',
}

/**
 * La réponse de l'élève, dans la forme que `verifier` attend (la vue la construit) : `texte` (un nombre), `cdu` (un chiffre par
 * unité de numération), `choix` (une proposition) ou `ordre` (les nombres cliqués du plus petit au plus grand).
 */
export interface Reponse { texte?: string, cdu?: Partial<Record<Champ, string | number>>, choix?: string, ordre?: readonly number[] }

// Données par niveau (les plages et les types proposés sont dans la définition) : pas des droites graduées et des
// suites, nombre de nombres à ranger. lettresMax : plus grand nombre écrit en lettres (CP : cinquante).
const DONNEES: Readonly<Record<string, DonneesNiveau>> = {
  cp: {
    pasDroite: { 100: [1, 10] },
    nbRanger: 5,
    lettresMax: 50,
  },
  ce1: {
    pasDroite: { 100: [1, 10], 1000: [1, 10, 100] },
    pasSuites: { 100: [1, 2, 5, 10], 1000: [1, 10, 100] },
    pasPlusMoins: { 100: [10], 1000: [10, 100] },
    nbRanger: 5,
  },
  // (l'échelle 100 n'est atteinte que par un « Nombres jusqu'à » libre sous 100 : mêmes pas qu'au CE1)
  ce2: {
    pasDroite: { 100: [1, 10], 1000: [1, 10, 100], 10000: [10, 100, 1000] },
    pasSuites: { 100: [1, 2, 5, 10], 1000: [1, 10, 100], 10000: [10, 100, 1000] },
    pasPlusMoins: { 100: [10], 1000: [10, 100], 10000: [10, 100, 1000] },
    nbRanger: 5,
  },
}

const GENERATEURS: Readonly<Record<TypeQuestion, (ctx: Contexte) => Question>> = {
  decomposer: genDecomposer,
  representation: genRepresentation,
  lettresChiffres: genLettresChiffres,
  chiffresLettres: genChiffresLettres,
  comparer: genComparer,
  suites: genSuites,
  droite: genDroite,
  ranger: genRanger,
}

const niveauConnu = (niveau: Classe): Classe => (DEFINITION.niveaux[niveau] ? niveau : DEFINITION.niveauDefaut)

/** Plages proposées au niveau (définition) : la plus grande est le plafond du niveau, et le défaut quand la plage demandée est invalide. */
const plagesDu = (niveau: Classe): readonly number[] => DEFINITION.niveaux[niveau]?.options?.plage ?? []

/** La plus petite « Nombres jusqu'à » libre : en dessous, il n'y a presque plus de nombres à tirer (voir `libre` de la définition). */
export const PLAGE_MIN = 20

/**
 * « Nombres jusqu'à N » : N est la borne (un entier de PLAGE_MIN au plafond du niveau) ; son ÉCHELLE est la puissance de dix qui la
 * contient (100, 1000, 10000) : elle donne le nombre de chiffres et les pas des droites et des suites, qui sont écrits pour ces trois
 * échelles. Les générateurs tirent à l'échelle ; ce qui dépasse la borne est écarté (`depasse`).
 */
export const echelleDe = (borne: number): number => (borne <= 100 ? 100 : borne <= 1000 ? 1000 : 10000)

/**
 * Un nombre de la question dépasse-t-il la borne ? (les droites graduées montrent leurs deux extrémités : `valeurs`). Les fausses
 * propositions d'un choix (« chiffres → lettres » : le nombre testé d'abord, puis ses distracteurs) ne comptent pas : une erreur
 * plausible peut être juste au-dessus.
 */
export const depasse = (q: Question, borne: number): boolean => (q.type === 'chiffresLettres' ? q.valeurs.slice(0, 1) : q.valeurs).some(v => v > borne)

/** La borne demandée, ou le plafond du niveau quand elle est invalide ou le dépasse (niveau changé : 10 000 mémorisé au CP). */
export function borneDemandee(plage: unknown, plafond: number): number {
  return typeof plage === 'number' && Number.isInteger(plage) && plage >= PLAGE_MIN && plage <= plafond ? plage : plafond
}

// Répartit les types pour bien mélanger, sans jamais répéter une question
function genererSansRepetition({ niveau, reglages, rng, T }: Pick<ParamsGenerateur<Reglages, Cle>, 'niveau' | 'reglages' | 'rng' | 'T'>, nb: number): Question[] {
  const classe = niveauConnu(niveau)
  const niv = DONNEES[classe]
  if (!niv) throw new Error(`numération : niveau « ${classe} » absent des données`)
  const plages = plagesDu(classe)
  const borne = borneDemandee(reglages.plage, Math.max(...plages))
  const max = echelleDe(borne)
  const types = (reglages.types ?? []).filter(t => GENERATEURS[t])
  if (!types.length) throw new Error('numération : aucun type d’exercice choisi')
  // types mélangés d'abord : avec moins de questions que de types, pas toujours les mêmes oubliés
  const typesMelanges = rng.melanger(types)
  const ordre = rng.melanger(Array.from({ length: nb }, (_, i) => typesMelanges[i % typesMelanges.length]))
  let precedent = -1, echecs = 0
  return tirerUniques(nb, rang => {
    // échecs : tirages ratés d'affilée pour ce rang ; si un type n'a plus de question neuve (peu de droites possibles…), on en prend un autre
    echecs = rang === precedent ? echecs + 1 : 0
    precedent = rang
    const type = echecs > 20 ? types[rng.entier(0, types.length - 1)] : ordre[rang]
    // (un tirage, comme dans l'ancienne vue : le flux de hasard, donc les fiches, ne changent pas)
    const tirage = (): Question => GENERATEURS[rng.choisir([type])]({ rng, T, niv, max, borne })
    let q = tirage()
    // une borne qui n'est pas une puissance de dix : on retire tant qu'un nombre la dépasse (jamais pour 100, 1 000, 10 000 : le premier tirage passe)
    for (let i = 0; i < 400 && depasse(q, borne); i++) q = tirage()
    return q
  }, { cle: q => q.cle, essais: nb * 50 })
}

/** Les questions du jeu (`nb` : le réglage nbQ), jamais deux fois la même. */
export const questions = ({ niveau, reglages, rng, T, nb = reglages.nbQ ?? 10 }: ParamsGenerateur<Reglages, Cle>): Question[] =>
  genererSansRepetition({ niveau, reglages, rng, T }, nb)

/** Les questions de la fiche (le réglage nbFiche). */
export const questionsFiche = ({ niveau, reglages, rng, T }: Omit<ParamsGenerateur<Reglages, Cle>, 'nb'>): Question[] =>
  genererSansRepetition({ niveau, reglages, rng, T }, reglages.nbFiche ?? 10)
export type TirageFiche = Question[]

// ── Réponses ──
export function verifier(q: Question, rep: Reponse): Verdict {
  switch (q.kind) {
    case 'nombre': return +String(rep.texte).trim() === q.reponse
    case 'cdu': return q.champs.every(ch => +(rep.cdu?.[ch] ?? NaN) === q.reponse[ch])
    case 'ordre': return !!rep.ordre && rep.ordre.length === q.reponse.length && rep.ordre.every((n, i) => n === q.reponse[i])
    case 'choix': return rep.choix === q.reponse
  }
}

/** Une réponse juste, que `verifier` doit accepter (les tests le vérifient pour chaque question tirée). */
export function bonneReponse(q: Question): Reponse {
  switch (q.kind) {
    case 'nombre': return { texte: String(q.reponse) }
    case 'cdu': return { cdu: { ...q.reponse } as Chiffres }
    case 'ordre': return { ordre: [...q.reponse] }
    case 'choix': return { choix: q.reponse }
  }
}

/** Une réponse fausse, que `verifier` doit refuser. */
export function mauvaiseReponse(q: Question): Reponse {
  switch (q.kind) {
    case 'nombre': return { texte: String(q.reponse + 1) }
    case 'cdu': return { cdu: Object.fromEntries(q.champs.map(ch => [ch, (q.reponse[ch] ?? 0) + 1])) }
    case 'ordre': return { ordre: [...q.reponse].reverse() }
    case 'choix': return { choix: `${q.reponse}?` }
  }
}

/** Nombres au programme du niveau (nombreMax) et nombres écrits en lettres (nombresEnLettresMax). */
export function ecartsAuProgramme(qs: readonly Question[], contraintes: Contraintes): string[] {
  const ecarts: string[] = []
  const max = contraintes.nombreMax, enLettres = contraintes.nombresEnLettresMax
  for (const q of qs) {
    for (const v of q.valeurs) {
      if (max !== undefined && v > max) ecarts.push(`${q.cle} : ${v} > ${max}`)
      else if (q.enLettres && enLettres !== undefined && v > enLettres) ecarts.push(`${q.cle} : ${v} en lettres > ${enLettres}`)
    }
  }
  return [...new Set(ecarts)]
}
