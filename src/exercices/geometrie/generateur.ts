// La géométrie — générateur : QUOI poser comme questions, et comment les corriger. Pur : aucun import de Vue, aucun Math.random (le hasard
// vient de `rng`), donc lisible par node, par les tests et par le build des fiches.
//   questions({ niveau, reglages, rng, T, nb })   questions de l'exercice à l'écran, sans répétition
//   questionsFiche({ niveau, reglages, rng, T })  tout ce que tire la fiche imprimable (fiche.ts la met en page)
//   verifier(q, rep)                              la réponse est-elle juste ?
//   bonneReponse(q) / mauvaiseReponse(q)          une réponse juste / fausse, dans la forme attendue par verifier (tests)
//   decrire(q, rep, T) / messageErreur(q, rep, T) la réponse donnée en texte (tableau de fin) ; le retour après une erreur
//   ecartsAuProgramme(questions, contraintes)     ce qui sort du programme du niveau (tests)
//   manquesAuProgramme(reglages, contraintes)     ce que le programme demande et que « tout » ne propose pas (tests)
// Un module par famille de questions : quadrillage.ts (symétrie, reproduction, repérage), questionsFigures.ts (figures, solides, angles
// droits, propriétés, cercle), patrons.ts ; données dans donnees.ts, dessins dans dessins.ts. L'ordre des tirages est celui de l'ancienne vue.
import type { Config, Contraintes, ParamsGenerateur, Verdict } from '../../noyau/types.ts'
import type { ReglagesDeDefinition } from '../../noyau/definir.ts'
import { tirerUniques } from '../../noyau/uniques.ts'
import { donneesDe, niveauConnu, PROPRIETES, aChoix, FIGURES, SOLIDES } from './donnees.ts'
import type { TypeExercice } from './donnees.ts'
import { genSymetrie, genReproduction, genReperage, k, dek, nomCase } from './quadrillage.ts'
import { genFigure, genSolide, genAngles, genPropriete, genCercle, construireFigure } from './questionsFigures.ts'
import { genPatron, patrons, normaliserCases, SYMETRIES } from './patrons.ts'
import type { CasePatron } from './patrons.ts'
import type { Cle, Contexte, Question, QAngles, QSymetrie, QReproduction, Reponse, T, TirageFiche } from './types.ts'
import type DEFINITION from './definition.ts'

export type { Question, QAngles, QSymetrie, QReproduction, Reponse, TirageFiche } from './types.ts'
export { construireFigure }
type Reglages = ReglagesDeDefinition<typeof DEFINITION>

// Types d'exercices demandés ET offerts par le niveau (sinon tous ceux du niveau)
const typesDispo = (reglages: Reglages, niv: Contexte['niv']): readonly TypeExercice[] => {
  const t = (reglages.exercices as readonly TypeExercice[]).filter(e => niv.exercices.includes(e))
  return t.length ? t : niv.exercices
}

function genererQuestion(ctx: Contexte, reglages: Reglages, type?: TypeExercice): Question {
  const { rng, niv } = ctx
  const t = type || rng.choisir(typesDispo(reglages, niv))
  if (t === 'symetrie') return genSymetrie(ctx, reglages.axeHorizontal && rng.vrai(0.5))
  if (t === 'reproduction') return genReproduction(ctx)
  if (t === 'reperage') return genReperage(ctx)
  if (t === 'figures') return genFigure(ctx)
  if (t === 'angles') return genAngles(ctx)
  if (t === 'proprietes') return genPropriete(ctx)
  if (t === 'cercle') return genCercle(ctx)
  if (t === 'patrons') return genPatron(ctx)
  return genSolide(ctx)
}

// jamais deux fois la même question (`cle`) ; moins de `nb` si le niveau n'en offre pas autant
const genererSansRepetition = (ctx: Contexte, reglages: Reglages, nb: number, type?: TypeExercice): Question[] =>
  tirerUniques(nb, () => genererQuestion(ctx, reglages, type), { cle: q => q.cle, essais: nb * 50 })

const contexte = (niveau: Config['niveau'], rng: ParamsGenerateur['rng'], T: T): Contexte => ({ rng, T, niv: donneesDe(niveau) })

export const questions = ({ niveau, reglages, rng, T, nb = reglages.nbQ }: ParamsGenerateur<Reglages, Cle>): Question[] =>
  genererSansRepetition(contexte(niveau, rng, T), reglages, nb)

// Symboles du repérage de la fiche (cases à nommer)
export const SYMBOLES = ['★', '●', '▲', '■']

/**
 * Tout ce que tire la fiche : une rubrique par exercice coché (et offert par le niveau), dans l'ordre de la fiche.
 * Rubriques : symetrie, reproduction (listes de questions), reperage { cols, rows, aColorier, symboles, lectures },
 * figures [{ forme, … }], solides [id], angles (questions), proprietes [propriété], cercle { rot }, patrons [{ cases, valide }].
 */
export function questionsFiche({ niveau, reglages, rng, T }: Omit<ParamsGenerateur<Reglages, Cle>, 'nb'>): TirageFiche {
  const ctx = contexte(niveau, rng, T)
  const { niv } = ctx
  const ex = reglages.exercices as readonly TypeExercice[]
  const a = (id: TypeExercice): boolean => ex.includes(id) && niv.exercices.includes(id)
  const x: TirageFiche = { niveau: niveauConnu(niveau) }
  if (a('symetrie')) x.symetrie = genererSansRepetition(ctx, reglages, 3, 'symetrie') as QSymetrie[]
  if (a('reproduction')) x.reproduction = genererSansRepetition(ctx, reglages, 2, 'reproduction') as QReproduction[]
  if (a('reperage')) {
    const { cols, rows } = niv.reperage
    const cases = rng.melanger(Array.from({ length: cols * rows }, (_, i) => k(i % cols, Math.floor(i / cols)))).slice(0, 8)
    x.reperage = {
      cols, rows,
      aColorier: cases.slice(0, 4).map(c => nomCase(...dek(c))),
      symboles: Object.fromEntries(cases.slice(4).map((c, i) => [c, SYMBOLES[i]])),
      lectures: cases.slice(4).map((c, i) => ({ symbole: SYMBOLES[i], nom: nomCase(...dek(c)) })),
    }
  }
  if (a('figures')) x.figures = rng.melanger(niv.figures).map(forme => ({ forme, ...construireFigure(rng, forme) }))
  if (a('solides')) x.solides = rng.melanger(niv.solides)
  if (a('angles')) x.angles = genererSansRepetition(ctx, reglages, 4, 'angles') as QAngles[]
  if (a('proprietes')) x.proprietes = rng.melanger(PROPRIETES.filter(p => !aChoix(p))).slice(0, 6)
  if (a('cercle')) x.cercle = { rot: rng.entier(0, 359) }
  if (a('patrons')) {
    const { valides, invalides } = patrons()
    x.patrons = rng.melanger([...rng.melanger(valides).slice(0, 3).map(h => ({ h, valide: true })),
      ...rng.melanger(invalides).slice(0, 3).map(h => ({ h, valide: false }))])
      .map(({ h, valide }) => ({ cases: normaliserCases(h.map(rng.choisir(SYMETRIES))) as CasePatron[], valide }))
  }
  return x
}

// ── Réponses ──
// rep : { choix: indice } (question à choix) ; { selection: [clés de cases] } (symétrie, reproduction, repérage) ;
// { lettres: ['A', 'C'] ou ['aucun'] } (angles droits)
const memeEnsemble = (a: readonly string[], b: readonly string[]): boolean => a.length === b.length && a.every(x => b.includes(x))
const cellulesDe = (q: Question): string[] => ('cellules' in q ? q.cellules : [])

export function verifier(q: Question, rep: Reponse): Verdict {
  if ('choix' in rep) return 'bonne' in q && rep.choix === q.bonne
  if ('lettres' in rep) return q.type === 'angles' && memeEnsemble(rep.lettres.includes('aucun') ? [] : rep.lettres, q.droits)
  return memeEnsemble([...new Set(rep.selection)], cellulesDe(q))
}

export function bonneReponse(q: Question): Reponse {
  if ('options' in q) return { choix: q.bonne }
  if (q.type === 'angles') return { lettres: q.droits.length ? q.droits : ['aucun'] }
  return { selection: [...cellulesDe(q)] }
}

export function mauvaiseReponse(q: Question): Reponse {
  if ('options' in q) return { choix: (q.bonne + 1) % q.options.length }
  if (q.type === 'angles') return { lettres: q.droits.length ? ['aucun'] : [q.lettres[0]] }
  return { selection: [] }
}

/** Cases justes, en trop et oubliées d'une sélection. */
export function bilanCases(q: Question, selection: readonly string[]): { justes: number, enTrop: number, manquantes: number } {
  const cellules = cellulesDe(q)
  const justes = selection.filter(c => cellules.includes(c)).length
  return { justes, enTrop: selection.length - justes, manquantes: cellules.length - justes }
}

/** La réponse donnée, en texte (colonne « Ta réponse » du tableau de fin). */
export function decrire(q: Question, rep: Reponse, T: T): string {
  if ('choix' in rep) return 'choix' in q ? q.choix[rep.choix] : ''
  if ('lettres' in rep) return rep.lettres.includes('aucun') ? T('aucun') : [...rep.lettres].sort().join(', ')
  if (q.type === 'reperage') return nomCase(...dek(rep.selection[0]))
  const { justes, enTrop } = bilanCases(q, rep.selection)
  return T('casesJustes', { justes, total: cellulesDe(q).length }) + (enTrop ? T('casesEnTrop', { n: enTrop }) : '')
}

/** Retour après une erreur (rep : null si la question est passée). */
export function messageErreur(q: Question, rep: Reponse | null, T: T): string {
  if (!rep) return ''
  if ('choix' in rep) return `❌ ${T('bonneReponse')} : ${'reponse' in q ? q.reponse : ''}`
  if ('lettres' in rep) return q.type === 'angles' && q.droits.length ? T('anglesFaux', { attendu: q.attendu }) : T('anglesAucunFaux')
  if (q.type === 'reperage') return T('reperageFaux', { donne: decrire(q, rep, T), nom: q.nom })
  const { manquantes, enTrop } = bilanCases(q, rep.selection)
  const morceaux = [...(manquantes ? [T('presqueOubliees', { n: manquantes })] : []), ...(enTrop ? [T('presqueEnTrop', { n: enTrop })] : [])]
  return T('presque', { morceaux: morceaux.join(T('presqueEt')) })
}

// ── Programme ──
// Les questions d'un jeu (tableau) ou le tirage d'une fiche, ramenés à une liste de { type, … }
interface Element { type: string, sous?: string, forme?: string, solide?: string, prop?: string }
function elementsDe(x: readonly Question[] | TirageFiche): Element[] {
  if (Array.isArray(x)) return x as Question[]
  const t = x as TirageFiche
  return [
    ...(t.symetrie ?? []), ...(t.reproduction ?? []), ...(t.angles ?? []),
    ...(t.figures ?? []).map(f => ({ type: 'figure', sous: 'nom', forme: f.forme })),
    ...(t.solides ?? []).map(solide => ({ type: 'solide', sous: 'nom', solide })),
    ...(t.proprietes ?? []).map(p => ({ type: 'proprietes', prop: p.id })),
    ...(t.cercle ? [{ type: 'cercle' }] : []),
    ...(t.patrons ?? []).map(() => ({ type: 'patron' })),
    ...(t.reperage ? [{ type: 'reperage' }] : []),
  ]
}

export function ecartsAuProgramme(x: readonly Question[] | TirageFiche, contraintes: Contraintes): string[] {
  const ecarts: string[] = []
  const figures = contraintes.figures ?? [], solides = contraintes.solides ?? []
  const figure = (id: string): void => { if (!figures.includes(id)) ecarts.push(`figure ${id} hors programme`) }
  for (const e of elementsDe(x)) {
    if (e.type === 'figure') figure(FIGURES[e.forme as keyof typeof FIGURES].programme)
    if (e.type === 'cercle') figure('cercle')
    // « Quelle figure a… ? » propose le losange et le triangle rectangle parmi les réponses
    if (e.type === 'proprietes' && (e.prop!.startsWith('q-') || /losange/.test(e.prop!))) figure('losange')
    if (e.type === 'proprietes' && (e.prop!.startsWith('q-') || /trirect/.test(e.prop!))) figure('triangle-rectangle')
    if (e.type === 'solide') {
      if (!solides.includes(e.solide!)) ecarts.push(`solide ${e.solide} hors programme`)
      if ((e.sous === 'faces' || e.sous === 'sommets') && !(contraintes.solidesDecrits ?? []).includes(e.solide!)) ecarts.push(`${e.sous} du ${e.solide} : solide non décrit à ce niveau`)
    }
    if (e.type === 'symetrie' && !contraintes.symetrie) ecarts.push('symétrie hors programme')
    if (e.type === 'patron' && !contraintes.patrons?.includes('cube')) ecarts.push('patron du cube hors programme')
    if (e.type === 'angles' && e.forme === 'losange') figure('losange')
  }
  return [...new Set(ecarts)]
}

export function manquesAuProgramme(reglages: Config<Reglages>, contraintes: Contraintes): string[] {
  const manques: string[] = []
  const ex = reglages.exercices as readonly string[]
  const niv = donneesDe(reglages.niveau)
  if (contraintes.symetrie && !ex.includes('symetrie')) manques.push('symétrie')
  if (contraintes.patrons?.includes('cube') && !ex.includes('patrons')) manques.push('patron du cube')
  for (const s of contraintes.solides ?? []) if (!(s in SOLIDES) || !(niv.solides as readonly string[]).includes(s)) manques.push(`solide ${s}`)
  const offertes = niv.figures.map(f => FIGURES[f].programme)
  // le disque (maternelle, CP) se nomme « cercle » à partir du CE1
  for (const f of contraintes.figures ?? []) if (f !== 'disque' && !offertes.includes(f)) manques.push(`figure ${f}`)
  return manques
}
