// La géométrie (moteur commun des exercices figures, solides, symétrie…) — générateur : QUOI poser comme questions, et comment les corriger.
// Pur : aucun import de Vue, aucun Math.random (le hasard vient de `rng`), donc lisible par node, par les tests et par le build des fiches.
// Chaque exercice (src/exercices/<id>/generateur.ts) reprend les fonctions sans état et appelle `moteurGeometrie(…)` avec sa définition :
//   questions({ niveau, reglages, rng, T, nb })   questions de l'exercice à l'écran, sans répétition
//   questionsFiche({ niveau, reglages, rng, T })  tout ce que tire la fiche imprimable (fiche.ts la met en page)
//   manquesAuProgramme(reglages, contraintes)     ce que le programme demande, dans les familles de l'exercice, et qu'il ne propose pas (tests)
//   verifier(q, rep)                              la réponse est-elle juste ?
//   bonneReponse(q) / mauvaiseReponse(q)          une réponse juste / fausse, dans la forme attendue par verifier (tests)
//   decrire(q, rep, T) / messageErreur(q, rep, T) la réponse donnée en texte (tableau de fin) ; le retour après une erreur
//   ecartsAuProgramme(questions, contraintes)     ce qui sort du programme du niveau (tests)
// Un module par famille de questions : quadrillage.ts (symétrie), questionsFigures.ts (figures, solides, angles
// droits, propriétés, cercle), patrons.ts ; données dans donnees.ts, dessins dans dessins.ts. L'ordre des tirages est celui de l'ancienne vue.
import type { Classe, Config, Contraintes, ParamsGenerateur, Verdict } from '../../noyau/types.ts'
import { tirerUniques } from '../../noyau/uniques.ts'
import { donneesDe, niveauConnu, aChoix, FIGURES, SOLIDES } from './donnees.ts'
import type { TypeExercice } from './donnees.ts'
import { genSymetrie } from './quadrillage.ts'
import { genFigure, genSolide, genAngles, genPropriete, genCercle, construireFigure, proprietesDe } from './questionsFigures.ts'
import { genPatron, patrons, normaliserCases, SYMETRIES } from './patrons.ts'
import { genAigu, genJustifier, SORTES as SORTES_ANGLE } from './angles.ts'
import type { CasePatron } from './patrons.ts'
import type { Cle, Contexte, Question, QAngles, QJustifier, QSymetrie, Reponse, T, TirageFiche } from './types.ts'

export type { Question, QAngles, QSymetrie, Reponse, TirageFiche } from './types.ts'
export { construireFigure }
/** Les réglages que lit le moteur (ceux des exercices de géométrie). */
export type Reglages = { exercices: readonly string[], nbQ: number, axeHorizontal?: boolean }

// Types d'exercices demandés ET offerts par le niveau (sinon tous ceux du niveau)
const typesDispo = (reglages: Reglages, niv: Contexte['niv']): readonly TypeExercice[] => {
  const t = (reglages.exercices as readonly TypeExercice[]).filter(e => niv.exercices.includes(e))
  return t.length ? t : niv.exercices
}

function genererQuestion(ctx: Contexte, reglages: Reglages, type?: TypeExercice): Question {
  const { rng, niv } = ctx
  const t = type || rng.choisir(typesDispo(reglages, niv))
  if (t === 'symetrie') return genSymetrie(ctx, (reglages.axeHorizontal ?? false) && rng.vrai(0.5))
  if (t === 'figures') return genFigure(ctx)
  if (t === 'angles') return genAngles(ctx)
  if (t === 'proprietes') return genPropriete(ctx)
  if (t === 'cercle') return genCercle(ctx)
  if (t === 'patrons') return genPatron(ctx)
  // CE2 : des angles plus proches de l'angle droit (l'équerre sert) et le losange parmi les figures à justifier
  if (t === 'aigus') return genAigu(ctx, niv.figures.includes('losange'))
  if (t === 'justifier') return genJustifier(ctx, niv.figures.includes('losange'))
  return genSolide(ctx)
}

// jamais deux fois la même question (`cle`) ; moins de `nb` si le niveau n'en offre pas autant
const genererSansRepetition = (ctx: Contexte, reglages: Reglages, nb: number, type?: TypeExercice): Question[] =>
  tirerUniques(nb, () => genererQuestion(ctx, reglages, type), { cle: q => q.cle, essais: nb * 50 })

/** Les types de questions qu'un exercice propose à un niveau (sa définition). */
export type TypesDuNiveau = (niveau: Classe) => readonly TypeExercice[]

/** Ce que le moteur lit d'une définition : la liste `exercices` que chaque niveau propose. */
interface DefinitionLue { niveaux: Partial<Record<Classe, { options?: { exercices?: readonly unknown[] } }>> }

/** Les types de questions d'un niveau, lus dans la définition d'un exercice (`niveaux.<n>.options.exercices`). */
export function typesDeDefinition(definition: DefinitionLue): TypesDuNiveau {
  return niveau => (definition.niveaux[niveau]?.options?.exercices ?? []) as readonly TypeExercice[]
}

const contexte = (niveau: Config['niveau'], rng: ParamsGenerateur['rng'], T: T, typesDe: TypesDuNiveau): Contexte =>
  ({ rng, T, niv: donneesDe(niveau, typesDe(niveauConnu(niveau))) })

const questionsDe = (typesDe: TypesDuNiveau) => ({ niveau, reglages, rng, T, nb = reglages.nbQ }: ParamsGenerateur<Reglages, Cle>): Question[] =>
  genererSansRepetition(contexte(niveau, rng, T, typesDe), reglages, nb)

/**
 * Tout ce que tire la fiche : une rubrique par exercice coché (et offert par le niveau), dans l'ordre de la fiche.
 * Rubriques : symetrie (liste de questions),
 * figures [{ forme, … }], solides [id], angles (questions), proprietes [propriété], cercle { rot }, patrons [{ cases, valide }].
 */
const questionsFicheDe = (typesDe: TypesDuNiveau) => ({ niveau, reglages, rng, T }: Omit<ParamsGenerateur<Reglages, Cle>, 'nb'>): TirageFiche => {
  const ctx = contexte(niveau, rng, T, typesDe)
  const { niv } = ctx
  const ex = reglages.exercices as readonly TypeExercice[]
  const a = (id: TypeExercice): boolean => ex.includes(id) && niv.exercices.includes(id)
  const x: TirageFiche = { niveau: niveauConnu(niveau) }
  if (a('symetrie')) x.symetrie = genererSansRepetition(ctx, reglages, 3, 'symetrie') as QSymetrie[]
  // CP : chaque figure deux fois (des orientations et des tailles différentes), et le tableau côtés / sommets
  const doubler = <F>(liste: readonly F[]): F[] => (niv.ficheGuidee ? [...liste, ...liste] : [...liste])
  if (a('figures')) x.figures = rng.melanger(doubler(niv.figures)).map(forme => ({ forme, ...construireFigure(rng, forme, niv.ficheGuidee) }))
  // les noms à écrire : au CP, ceux que le programme fait nommer (cube, pavé, boule)
  if (a('solides')) x.solides = rng.melanger(doubler(niv.solidesNommes ?? niv.solides))
  // CP : « entoure les solides qui roulent » (cylindre, cône, boule : à reconnaître)
  if (a('solides') && niv.ficheGuidee) x.rouler = rng.melanger(niv.solides)
  if (a('angles')) x.angles = genererSansRepetition(ctx, reglages, 6, 'angles') as QAngles[]
  if (a('proprietes')) x.proprietes = rng.melanger(proprietesDe(niv).filter(p => !aChoix(p))).slice(0, 6)
  if (a('cercle')) x.cercle = { rot: rng.entier(0, 359) }
  if (a('aigus')) {
    // deux angles de chaque sorte, dans le désordre ; au CE2, les aigus et les obtus près de l'angle droit (l'équerre sert)
    const proches = niv.figures.includes('losange')
    const sortes = rng.melanger([...SORTES_ANGLE, ...SORTES_ANGLE])
    x.aigus = sortes.map(s => genAigu(ctx, proches, s, proches && s !== 'droit'))
  }
  if (a('justifier')) {
    x.justifier = genererSansRepetition(ctx, reglages, 4, 'justifier') as QJustifier[]
    // au CE2, au moins un losange (« Ce n'est pas un carré car l'un de ses angles n'est pas un angle droit », p. 36)
    if (niv.figures.includes('losange') && !x.justifier.some(q => q.forme === 'losange')) x.justifier[x.justifier.length - 1] = genJustifier(ctx, true, 'losange-carre')
  }
  if (a('patrons')) {
    const { valides, invalides } = patrons()
    x.patrons = rng.melanger([...rng.melanger(valides).slice(0, 3).map(h => ({ h, valide: true })),
      ...rng.melanger(invalides).slice(0, 3).map(h => ({ h, valide: false }))])
      .map(({ h, valide }) => ({ cases: normaliserCases(h.map(rng.choisir(SYMETRIES))) as CasePatron[], valide }))
  }
  return x
}

// ── Réponses ──
// rep : { choix: indice } (question à choix) ; { selection: [clés de cases] } (symétrie) ;
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
  const { justes, enTrop } = bilanCases(q, rep.selection)
  return T('casesJustes', { justes, total: cellulesDe(q).length }) + (enTrop ? T('casesEnTrop', { n: enTrop }) : '')
}

/** Retour après une erreur (rep : null si la question est passée). */
export function messageErreur(q: Question, rep: Reponse | null, T: T): string {
  if (!rep) return ''
  if ('choix' in rep) return `${T('bonneReponse')} : ${'reponse' in q ? q.reponse : ''}`
  if ('lettres' in rep) return q.type === 'angles' && q.droits.length ? T('anglesFaux', { attendu: q.attendu }) : T('anglesAucunFaux')
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
    ...(t.symetrie ?? []), ...(t.angles ?? []), ...(t.justifier ?? []),
    ...(t.figures ?? []).map(f => ({ type: 'figure', sous: 'nom', forme: f.forme })),
    ...(t.solides ?? []).map(solide => ({ type: 'solide', sous: 'nom', solide })),
    ...(t.proprietes ?? []).map(p => ({ type: 'proprietes', prop: p.id })),
    ...(t.cercle ? [{ type: 'cercle' }] : []),
    ...(t.patrons ?? []).map(() => ({ type: 'patron' })),
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
    if ((e.type === 'angles' || e.type === 'justifier') && e.forme === 'losange') figure('losange')
  }
  return [...new Set(ecarts)]
}

/** Les familles du programme qu'un exercice couvre : on ne lui reproche que les manques de ses familles. */
export type Famille = 'symetrie' | 'patrons' | 'solides' | 'figures'

const manquesDe = (typesDe: TypesDuNiveau, familles: readonly Famille[]) => (reglages: Config<Reglages>, contraintes: Contraintes): string[] => {
  const manques: string[] = []
  const ex = reglages.exercices as readonly string[]
  const niv = donneesDe(reglages.niveau, typesDe(niveauConnu(reglages.niveau)))
  const couvre = (f: Famille): boolean => familles.includes(f)
  if (couvre('symetrie') && contraintes.symetrie && !ex.includes('symetrie')) manques.push('symétrie')
  if (couvre('patrons') && contraintes.patrons?.includes('cube') && !ex.includes('patrons')) manques.push('patron du cube')
  if (couvre('solides')) for (const s of contraintes.solides ?? []) if (!(s in SOLIDES) || !(niv.solides as readonly string[]).includes(s)) manques.push(`solide ${s}`)
  if (couvre('figures')) {
    const offertes = niv.figures.map(f => FIGURES[f].programme)
    // le disque (maternelle, CP) se nomme « cercle » à partir du CE1
    for (const f of contraintes.figures ?? []) if (f !== 'disque' && !offertes.includes(f)) manques.push(`figure ${f}`)
  }
  return manques
}

/**
 * Ce qui dépend de l'exercice : les types de questions de ses niveaux (`typesDe`, lu dans sa définition) et les familles du programme
 * qu'il couvre (`familles`). Les autres fonctions du moteur sont les mêmes pour tous.
 */
export function moteurGeometrie(typesDe: TypesDuNiveau, familles: readonly Famille[]) {
  return { questions: questionsDe(typesDe), questionsFiche: questionsFicheDe(typesDe), manquesAuProgramme: manquesDe(typesDe, familles) }
}
