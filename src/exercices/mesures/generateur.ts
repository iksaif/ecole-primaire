// Les mesures — générateur : QUOI poser comme questions, et comment les corriger. Pur : aucun import de Vue, aucun Math.random (le hasard
// vient de `rng`), donc lisible par node, par les tests et par le build des fiches.
//   questions({ niveau, reglages, rng, T, nb })   questions de l'exercice à l'écran, jamais deux fois la même
//   questionsFiche({ niveau, reglages, rng, T })  tout ce que tire la fiche imprimable (fiche.ts la met en page)
//   verifier(q, rep)                              rep : { texte } (nombre, virgule acceptée) ou { choix } (proposition)
//   bonneReponse(q) / mauvaiseReponse(q)          une réponse juste / fausse, dans la forme de verifier (tests)
//   ecartsAuProgramme(questions, contraintes)     unités hors programme du niveau (tests)
//   manquesAuProgramme(reglages, contraintes)     ce que le programme demande et que « tout » ne propose pas (tests)
// Une question par type d'exercice : règle, unité, conversion, comparer (longueurs.ts), masse (masses.ts), contenance (contenances.ts),
// calendrier (calendrier.ts). Données par niveau : donnees.ts. L'ordre des tirages est celui de l'ancienne vue : mêmes fiches.
import type { Classe, Contraintes, ParamsGenerateur, Verdict } from '../../noyau/types.ts'
import type { Rng } from '../../utils/hasard.ts'
import { tirerUniques } from '../../noyau/uniques.ts'
import { DONNEES } from './donnees.ts'
import { genRegle, genUnite, genConversion, genComparer } from './longueurs.ts'
import { genMasse } from './masses.ts'
import { genContenance } from './contenances.ts'
import { genCalendrier } from './calendrier.ts'
import type { Contexte, DonneesNiveau, Question, Reglages, T, TypeQuestion } from './types.ts'

export type { Question } from './types.ts'

/** La réponse de l'élève : un nombre tapé, ou la proposition choisie. */
export type Reponse = { texte: string } | { choix: string }

/** Les segments de la fiche : à mesurer (`choisis`, en cm ou, au CE2, en mm) et à tracer (`aTracer`). */
export interface SegmentsFiche { mm: boolean, choisis: number[], aTracer: number[] }
/** Ce que tire la fiche : les segments (si l'exercice « règle » est choisi) et quelques questions par exercice. */
export interface Tirage {
  niveau: Classe
  unites: readonly string[]
  regle: SegmentsFiche | null
  blocs: { type: TypeQuestion, questions: Question[] }[]
}

const GENERATEURS: Readonly<Record<TypeQuestion, (ctx: Contexte) => Question>> = {
  regle: genRegle, unite: genUnite, conversion: genConversion, comparer: genComparer,
  masse: genMasse, contenance: genContenance, calendrier: genCalendrier,
}

function donneesDe(niveau: Classe): DonneesNiveau {
  const niv = DONNEES[niveau]
  if (!niv) throw new Error(`mesures : niveau « ${niveau} » inconnu`)
  return niv
}

// Un type est proposé au niveau s'il a de quoi tirer des questions (pas de contenances avant le CE2)
const propose = (niv: DonneesNiveau, type: TypeQuestion): boolean => type !== 'contenance' || !!niv.contenances

// Répartit les questions entre les exercices choisis (ceux du niveau), sans répétition (essais bornés)
function genererSerie(ctx: Contexte, choisis: readonly TypeQuestion[], nb: number, typesForces?: readonly TypeQuestion[]): Question[] {
  let types = (typesForces ?? choisis).filter(t => propose(ctx.niv, t))
  if (!types.length) types = ['regle']
  const ordre = ctx.rng.melanger(types)
  const res = tirerUniques(nb, rang => GENERATEURS[ordre[rang % ordre.length]](ctx), { cle: q => q.cle, essais: nb * 80 })
  return typesForces ? res : ctx.rng.melanger(res)
}

const contexte = (niveau: Classe, reglages: Reglages, rng: Rng, T: T): Contexte => ({ rng, T, reglages, niv: donneesDe(niveau) })

export const questions = ({ niveau, reglages, rng, T, nb = reglages.nbQ }: ParamsGenerateur<Reglages>): Question[] =>
  genererSerie(contexte(niveau, reglages, rng, T), reglages.exercices, nb)

// ── Fiche : segments à mesurer et à tracer, puis quelques questions par exercice ──
// [type, nombre de questions]
const BLOCS: readonly (readonly [TypeQuestion, number])[] = [['conversion', 6], ['unite', 6], ['comparer', 4], ['masse', 2], ['contenance', 2], ['calendrier', 4]]

function segmentsFiche(rng: Rng, niv: DonneesNiveau, nbSeg: number): SegmentsFiche {
  const f = niv.fiche
  if (f.mm) {
    // CE2 : longueurs en cm et mm (en mm, entre 3 cm et 12 cm), surtout pas des cm entiers
    const longueurs: number[] = []
    for (let L = f.segMin * 10; L <= f.segMax * 10; L++) if (L % 10 !== 0 || L % 30 === 0) longueurs.push(L)
    const choisis = rng.melanger(longueurs).slice(0, nbSeg)
    const aTracer = rng.melanger(longueurs.filter(L => L <= 100 && !choisis.includes(L))).slice(0, 2)
    return { mm: true, choisis, aTracer }
  }
  const longueurs: number[] = []
  for (let L = f.segMin; L <= f.segMax; L++) longueurs.push(L)
  const choisis = rng.melanger(longueurs).slice(0, nbSeg)
  const aTracer = rng.melanger(longueurs.filter(L => L <= 10 && !choisis.includes(L)).concat([5, 8]))
    .filter((v, i, a) => a.indexOf(v) === i).slice(0, 2)
  return { mm: false, choisis, aTracer }
}

export function questionsFiche({ niveau, reglages, rng, T }: Omit<ParamsGenerateur<Reglages>, 'nb'>): Tirage {
  const ctx = contexte(niveau, reglages, rng, T)
  const ex: readonly TypeQuestion[] = reglages.exercices.filter(e => propose(ctx.niv, e))
  return {
    niveau, unites: ctx.niv.unites,
    regle: ex.includes('regle') ? segmentsFiche(rng, ctx.niv, reglages.nbSegments) : null,
    blocs: BLOCS.filter(([type]) => ex.includes(type)).map(([type, nb]) => ({ type, questions: genererSerie(ctx, reglages.exercices, nb, [type]) })),
  }
}

// ── Réponses ──
// rep : { texte } (nombre tapé, virgule acceptée) ou { choix } (proposition choisie)
export function verifier(q: Question, rep: Reponse): Verdict {
  if (q.mode === 'nombre') {
    const v = String('texte' in rep ? rep.texte : '').trim().replace(',', '.')
    return v !== '' && Number(v) === q.reponse
  }
  return 'choix' in rep && rep.choix === q.reponse
}
export const bonneReponse = (q: Question): Reponse => (q.mode === 'nombre' ? { texte: String(q.reponse) } : { choix: String(q.reponse) })
export const mauvaiseReponse = (q: Question): Reponse =>
  (q.mode === 'nombre' ? { texte: String(Number(q.reponse) + 1) } : { choix: (q.choix ?? []).find(c => c !== q.reponse) ?? '' })

// ── Programme : unités des énoncés, des réponses et des propositions ──
const UNITE = '(mm|cm|dm|km|m|mg|g|kg|t|mL|cL|dL|L)'
const APRES_NOMBRE = new RegExp(`\\d[\\s\\u00a0]*${UNITE}(?![\\p{L}\\d])`, 'gu')
const SEULE = new RegExp(`^${UNITE}$`)
// unités écrites dans une question : après un nombre (« 3 cm », « 500 g »), ou seules (propositions, unité attendue)
function unitesDe(q: Question): string[] {
  const textes = [q.texte, q.affiche, q.attendu, q.explication]
  const seules = [q.unite, q.attendu, ...(q.mode === 'choix' && ['unite', 'contenance'].includes(q.type) ? q.choix ?? [] : [])]
  return [...new Set([
    ...textes.filter((t): t is string => !!t).flatMap(t => [...t.matchAll(APRES_NOMBRE)].map(m => m[1])),
    ...seules.filter((t): t is string => !!t).map(t => t.match(SEULE)?.[1]).filter((u): u is string => !!u),
  ])]
}
export function ecartsAuProgramme(x: readonly Question[] | Tirage, k: Contraintes): string[] {
  const permises = [...(k.unitesLongueur ?? []), ...(k.unitesMasse ?? []), ...(k.unitesContenance ?? [])]
  const ecarts: string[] = []
  // le calendrier ne parle d'aucune unité de mesure
  for (const q of Array.isArray(x) ? x as readonly Question[] : (x as Tirage).blocs.flatMap(b => b.questions)) {
    if (q.type === 'calendrier') continue
    for (const u of unitesDe(q)) if (!permises.includes(u)) ecarts.push(`${u} : unité hors programme (${q.type})`)
    if (q.type === 'contenance' && !k.unitesContenance?.length) ecarts.push('contenances : pas au programme du niveau')
  }
  return [...new Set(ecarts)]
}
export function manquesAuProgramme(reglages: Pick<Reglages, 'exercices'>, k: Contraintes): string[] {
  const ex: readonly TypeQuestion[] = reglages.exercices
  const manques: string[] = []
  if (k.unitesLongueur?.length && !ex.includes('regle')) manques.push('longueurs : mesurer à la règle')
  if (k.unitesMasse?.length && !ex.includes('masse')) manques.push('masses : balance')
  if (k.unitesContenance?.length && !ex.includes('contenance')) manques.push('contenances')
  return manques
}
