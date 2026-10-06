// La monnaie — générateur : QUOI poser comme questions, et comment les corriger. Pur : aucun import de Vue, aucun Math.random
// (le hasard vient de `rng`), donc lisible par node, par les tests et par le build des fiches.
//   questions({ niveau, reglages, rng, T, nb })   questions de l'exercice à l'écran, jamais deux fois la même
//   questionsFiche({ niveau, reglages, rng, T })  tout ce que tire la fiche imprimable (fiche.ts la met en page)
//   verifier(q, rep)                              la réponse est-elle juste ?
//   bonneReponse(q) / mauvaiseReponse(q)          une réponse juste / fausse, dans la forme de verifier (tests)
//   ecartsAuProgramme(questions, contraintes)     ce qui sort du programme du niveau (tests)
// Toutes les sommes sont en CENTIMES entiers. L'ordre des tirages est celui de l'ancienne vue : mêmes questions, mêmes fiches
// à graine égale (tests/instantanes).
import type { Classe, Contraintes, ParamsGenerateur, Traducteur, Verdict } from '../../noyau/types.ts'
import type { ReglagesDeDefinition } from '../../noyau/definir.ts'
import type { Rng } from '../../utils/hasard.ts'
import { tirerUniques } from '../../noyau/uniques.ts'
import type { CleContenu } from '../../langues/catalogue.ts'
import type { ValeurArgent } from '../../dessins/argent.ts'
import DEFINITION from './definition.ts'
import type { CONTENU } from './textes.ts'

type Reglages = ReglagesDeDefinition<typeof DEFINITION>
type Cle = CleContenu<typeof CONTENU>
/** Un type d'exercice : la valeur du réglage `exercices`. */
export type TypeExercice = Reglages['exercices'][number]

/** Pièces et billets de l'euro (en centimes), du plus grand au plus petit */
export const VALEURS: readonly ValeurArgent[] = [20000, 10000, 5000, 2000, 1000, 500, 200, 100, 50, 20, 10, 5, 2, 1]
type Valeurs = readonly ValeurArgent[]

/** Un objet à acheter : son emoji, le nom (`objet.<id>` du catalogue) et son pluriel (« des bonbons qui coûtent »). */
export interface Objet { e: string, id: string, pluriel: boolean }

// ── Les questions ──
// `cle` : ce qui fait deux questions « la même » (jamais deux fois dans une partie ou sur une fiche) ; `texte` et `attendu` :
// la question et sa bonne réponse en une ligne, pour le tableau de correction de fin de partie.
interface Commune { cle: string, texte: string, attendu: string }
export interface QCompter extends Commune { type: 'compter', items: ValeurArgent[], total: number, avecCentimes: boolean }
export interface QComposer extends Commune { type: 'composer', cible: number, solution: ValeurArgent[] }
export interface QMoins extends Commune { type: 'moins', cible: number, solution: ValeurArgent[] }
export interface QRendre extends Commune { type: 'rendre', paye: ValeurArgent, prix: number, cible: number, objet: Objet, solution: ValeurArgent[] }
/** Qui a le plus d'argent : l'un des deux, ou autant. */
export type Choix = 'A' | 'B' | 'egal'
export interface QComparer extends Commune {
  type: 'comparer', itemsA: ValeurArgent[], itemsB: ValeurArgent[], totalA: number, totalB: number, nomA: string, nomB: string, bonne: Choix
}
/** La conversion : 'c2ec' (235 c = ? € ? c), 'ec2c' (2 € 35 c = ? c), 'dec2c' (2,35 € = ? c), 'ec2dec' (2 € 5 c = ? €) */
export type SousConversion = 'c2ec' | 'ec2c' | 'dec2c' | 'ec2dec'
export interface QConvertir extends Commune { type: 'convertir', sous: SousConversion, valeur: number }
export type Question = QCompter | QComposer | QMoins | QRendre | QComparer | QConvertir

/**
 * La réponse de l'élève, dans la forme que `verifier` attend (la vue la construit) : `choix` (comparer), `selection` (composer,
 * moins, rendre : les pièces et billets posés), `texte` (somme ou conversion écrite) ou `e` et `c` (euros et centimes dans deux champs).
 */
export interface Reponse { choix?: Choix, selection?: readonly number[], texte?: string, e?: string, c?: string }

// ── Les données de chaque niveau ──
// notation : 'ec' (« 3 € 50 c ») ou 'les2' (« 3,50 € (3 € 50 c) ») ; saisieDecimale : la somme comptée s'écrit dans un seul champ
// (« 3,50 € »). Sans `centimes` : le niveau n'a que des euros entiers.
interface PlageCompterCentimes { euros: Valeurs, nbEuros: readonly [number, number], maxEuros: number, cents: Valeurs, nbCents: readonly [number, number], maxCents: number }
interface CasRendre { paye: ValeurArgent, rendu: readonly [number, number], pas: number }
interface PlageComparer { valeurs: Valeurs, nb: readonly [number, number], max: number }
interface DonneesNiveau {
  notation: 'ec' | 'les2'
  saisieDecimale: boolean
  compter: { entiers: { valeurs: Valeurs, nb: readonly [number, number], min: number, max: number }, centimes?: PlageCompterCentimes }
  composer: { entiers: { min: number, max: number, pas: number }, centimes?: { euros: readonly [number, number], cents: readonly [number, number] } }
  moins: { minPieces: { entiers: number, centimes?: number } }
  rendre: { entiers: readonly CasRendre[], centimes?: readonly CasRendre[] }
  comparer: { entiers: PlageComparer, centimes?: PlageComparer, probaEgal: number }
  convertir?: { min: number, max: number }
  palette: { entiers: Valeurs, centimes?: Valeurs }
}

const DONNEES: Partial<Record<Classe, DonneesNiveau>> = {
  // CP : montants entiers d'euros, jamais plus de 100 € (programme : c2maths p. 26)
  cp: {
    notation: 'ec',
    saisieDecimale: false,
    compter: { entiers: { valeurs: [100, 200, 500, 1000, 2000], nb: [2, 5], min: 300, max: 5000 } },
    composer: { entiers: { min: 200, max: 5000, pas: 100 } },
    moins: { minPieces: { entiers: 2 } },
    rendre: {
      entiers: [
        { paye: 500,  rendu: [100, 400], pas: 100 },
        { paye: 1000, rendu: [100, 900], pas: 100 },
        { paye: 2000, rendu: [100, 1000], pas: 100 },
      ],
    },
    comparer: { entiers: { valeurs: [100, 200, 500, 1000], nb: [2, 5], max: 3000 }, probaEgal: 0.15 },
    palette: { entiers: [100, 200, 500, 1000, 2000, 5000] },
  },
  ce1: {
    notation: 'ec',
    saisieDecimale: false,
    compter: {
      entiers:  { valeurs: [100, 200, 500, 1000, 2000, 5000], nb: [2, 6], min: 300, max: 9900 },
      centimes: { euros: [100, 200, 500, 1000], nbEuros: [1, 3], maxEuros: 2000,
                  cents: [1, 2, 5, 10, 20, 50], nbCents: [2, 5], maxCents: 99 },
    },
    composer: {
      entiers:  { min: 300, max: 9900, pas: 100 },
      centimes: { euros: [1, 20], cents: [1, 99] },
    },
    moins: { minPieces: { entiers: 2, centimes: 3 } },
    rendre: {
      entiers: [
        { paye: 500,  rendu: [100, 400],  pas: 100 },
        { paye: 1000, rendu: [100, 900],  pas: 100 },
        { paye: 2000, rendu: [100, 1000], pas: 100 },
        { paye: 5000, rendu: [100, 2500], pas: 100 },
      ],
      centimes: [
        { paye: 100, rendu: [5, 95],  pas: 5 },
        { paye: 200, rendu: [5, 95],  pas: 5 },
        { paye: 500, rendu: [5, 250], pas: 5 },
      ],
    },
    comparer: {
      entiers:  { valeurs: [100, 200, 500, 1000, 2000], nb: [2, 6], max: 5000 },
      centimes: { valeurs: [5, 10, 20, 50, 100, 200, 500], nb: [3, 6], max: 1000 },
      probaEgal: 0.15,
    },
    palette: {
      entiers:  [100, 200, 500, 1000, 2000, 5000],
      centimes: [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000],
    },
  },
  // CE2 : euros et centimes, 1 € = 100 c, écriture « 3,50 € », sommes jusqu'à 200 €, billet de 100 €
  ce2: {
    notation: 'les2',
    saisieDecimale: true,
    compter: {
      entiers:  { valeurs: [100, 200, 500, 1000, 2000, 5000, 10000], nb: [3, 8], min: 1000, max: 19900 },
      // plus de 1 € en pièces de centimes : il faut regrouper 100 c = 1 €
      centimes: { euros: [100, 200, 500, 1000, 2000, 5000], nbEuros: [2, 4], maxEuros: 10000,
                  cents: [1, 2, 5, 10, 20, 50], nbCents: [3, 7], maxCents: 250 },
    },
    composer: {
      entiers:  { min: 1000, max: 19900, pas: 100 },
      centimes: { euros: [1, 99], cents: [1, 99] },
    },
    moins: { minPieces: { entiers: 3, centimes: 4 } },
    rendre: {
      entiers: [
        { paye: 2000,  rendu: [100, 1000], pas: 100 },
        { paye: 5000,  rendu: [100, 2500], pas: 100 },
        { paye: 10000, rendu: [100, 5000], pas: 100 },
      ],
      centimes: [
        { paye: 500,  rendu: [5, 300],  pas: 5 },
        { paye: 1000, rendu: [5, 500],  pas: 5 },
        { paye: 2000, rendu: [5, 1000], pas: 5 },
      ],
    },
    comparer: {
      entiers:  { valeurs: [100, 200, 500, 1000, 2000, 5000], nb: [3, 7], max: 20000 },
      centimes: { valeurs: [5, 10, 20, 50, 100, 200, 500, 1000], nb: [4, 7], max: 3000 },
      probaEgal: 0.15,
    },
    convertir: { min: 105, max: 995 },
    palette: {
      entiers:  [100, 200, 500, 1000, 2000, 5000, 10000],
      centimes: [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000],
    },
  },
}

/** Les objets à acheter, rangés par prix plausible : [emoji, id (nom : `objet.<id>` de textes.ts), pluriel]. */
const OBJETS = {
  pasCher:  [['🍎', 'pomme'], ['✏️', 'crayon'], ['🍬', 'bonbons', true], ['🧃', 'jus'], ['🥖', 'baguette']],
  moyen:    [['🍫', 'chocolat'], ['📒', 'cahier'], ['⚽', 'ballon'], ['🖍️', 'feutres', true], ['🚗', 'voiture']],
  cher:     [['🧸', 'ours'], ['🧩', 'puzzle'], ['📕', 'livre'], ['🎨', 'peinture']],
  tresCher: [['🛴', 'trottinette'], ['🛼', 'rollers', true], ['🎲', 'jeu'], ['🎧', 'casque']],
} as const satisfies Record<string, readonly (readonly [string, string, true?])[]>

/** Une donnée absente est une erreur de déclaration, jamais un repli silencieux. */
function requis<T>(valeur: T | undefined, quoi: string): T {
  if (valeur === undefined) throw new Error(`monnaie : ${quoi} absent des données du niveau`)
  return valeur
}

const niveauConnu = (niveau: Classe): Classe => (DEFINITION.niveaux[niveau] ? niveau : DEFINITION.niveauDefaut)
/** Données du niveau (notation, saisie, palettes…) */
export const donnees = (niveau: Classe): DonneesNiveau => requis(DONNEES[niveauConnu(niveau)], `niveau « ${niveau} »`)
// Types d'exercices du niveau (définition) et réglage « centimes » ramené aux options du niveau
const typesDu = (niveau: Classe): readonly TypeExercice[] => DEFINITION.niveaux[niveauConnu(niveau)]?.options?.exercices ?? []
/** Les centimes sont-ils demandés, et possibles à ce niveau ? */
export const avecCentimes = (niveau: Classe, reglages: { centimes?: boolean }): boolean =>
  !!reglages.centimes && !!DEFINITION.niveaux[niveauConnu(niveau)]?.options?.centimes?.includes(true)
/** Pièces et billets proposés (à l'écran et sur la fiche) */
export function palette(niveau: Classe, centimes: boolean): Valeurs {
  const p = donnees(niveau).palette
  return centimes && avecCentimes(niveau, { centimes }) ? requis(p.centimes, 'palette des centimes') : p.entiers
}

// ── Écriture des sommes ──
const NB = ' '   // espace insécable
/** « 3 € », « 50 c », « 3 € 50 c » */
export function formatSomme(c: number): string {
  const e = Math.floor(c / 100)
  const r = c % 100
  if (r === 0) return `${e}${NB}€`
  if (e === 0) return `${r}${NB}c`
  return `${e}${NB}€ ${r}${NB}c`
}
/** « 3,50 € » */
export const formatDecimal = (c: number): string => `${Math.floor(c / 100)},${String(c % 100).padStart(2, '0')}${NB}€`
/** Notation selon le niveau : au CE2 on montre aussi l'écriture à virgule */
export function fmt(c: number, niveau: Classe): string {
  if (donnees(niveau).notation === 'les2' && c % 100 !== 0) return `${formatDecimal(c)} (${formatSomme(c)})`
  return formatSomme(c)
}
/** Lit une somme écrite par l'enfant : « 3,50 », « 3.5 € », « 3 € 50 », « 3 € 50 c », « 350 c », « 7 ». Rend des centimes, ou null. */
export function lireSomme(texte: unknown): number | null {
  const s = String(texte ?? '').toLowerCase().trim()
    .replace(/euros?/g, '€').replace(/centimes?|santim(?:où)?/g, 'c').replace(/\s+/g, ' ')
  let m: RegExpMatchArray | null
  if ((m = s.match(/^(\d{1,4}) ?[,.] ?(\d{1,2}) ?€?$/))) return +m[1] * 100 + (m[2].length === 1 ? +m[2] * 10 : +m[2])
  if ((m = s.match(/^(\d{1,4}) ?€ ?(?:(\d{1,2}) ?c?)?$/))) return +m[1] * 100 + (m[2] ? +m[2] : 0)
  if ((m = s.match(/^(\d{1,5}) ?c$/))) return +m[1]
  if ((m = s.match(/^(\d{1,4})$/))) return +m[1] * 100
  return null
}
/** Nom d'une pièce ou d'un billet (v en centimes) : lecteurs d'écran, infobulles, fiche. */
export const nomArgent = (v: number, T: Traducteur<Cle>): string =>
  (v >= 500 ? T('nomBillet', { v: v / 100 }) : v >= 100 ? T('nomPiece', { v: v / 100 }) : T('nomCentimes', { n: v }))

export const totalDe = (items: readonly number[]): number => items.reduce((s, v) => s + v, 0)
export const trierDesc = <V extends number>(items: readonly V[]): V[] => [...items].sort((a, b) => b - a)
const aleatoirePas = (rng: Rng, min: number, max: number, pas: number): number => min + pas * rng.entier(0, Math.floor((max - min) / pas))

/** Le système de l'euro est « canonique » : l'algorithme glouton donne le nombre minimal de pièces et de billets. */
export function glouton(total: number, valeurs: Valeurs = VALEURS): ValeurArgent[] {
  const r: ValeurArgent[] = []
  let reste = total
  for (const v of trierDesc(valeurs)) while (reste >= v) { r.push(v); reste -= v }
  return r
}

function tirerItems(rng: Rng, valeurs: Valeurs, nbMin: number, nbMax: number): ValeurArgent[] {
  const n = rng.entier(nbMin, nbMax)
  return Array.from({ length: n }, () => rng.choisir(valeurs))
}

// Décomposition aléatoire (pas forcément minimale) d'un total
function decomposerAuHasard(rng: Rng, total: number, valeurs: Valeurs, maxItems: number): ValeurArgent[] {
  const dispo = trierDesc(valeurs)
  for (let essai = 0; essai < 30; essai++) {
    const r: ValeurArgent[] = []
    let reste = total
    while (reste > 0) {
      const possibles = dispo.filter(v => v <= reste).slice(0, 3)
      if (!possibles.length) break
      const v = rng.choisir(possibles)
      r.push(v); reste -= v
    }
    if (reste === 0 && r.length <= maxItems) return trierDesc(r)
  }
  return glouton(total, dispo)
}

// Tire des items dont le total est dans [min, max] (essais bornés, sinon décomposition)
function tirerDansPlage(rng: Rng, valeurs: Valeurs, nbMin: number, nbMax: number, min: number, max: number): ValeurArgent[] {
  for (let essai = 0; essai < 200; essai++) {
    const items = tirerItems(rng, valeurs, nbMin, nbMax)
    const t = totalDe(items)
    if (t >= min && t <= max) return trierDesc(items)
  }
  const pas = Math.min(...valeurs)
  return decomposerAuHasard(rng, aleatoirePas(rng, min, max, pas), valeurs, nbMax)
}

// ── Une question par type ── (ctx : le niveau, ses données, le hasard et les textes)
interface Contexte { rng: Rng, T: Traducteur<Cle>, niveau: Classe, niv: DonneesNiveau }

function genCompter({ rng, T, niveau, niv }: Contexte, centimes: boolean): QCompter {
  let items: ValeurArgent[]
  if (!centimes) {
    const p = niv.compter.entiers
    items = tirerDansPlage(rng, p.valeurs, p.nb[0], p.nb[1], p.min, p.max)
  } else {
    const p = requis(niv.compter.centimes, 'compter avec centimes')
    const euros = tirerDansPlage(rng, p.euros, p.nbEuros[0], p.nbEuros[1], 100, p.maxEuros)
    const cents = tirerDansPlage(rng, p.cents, p.nbCents[0], p.nbCents[1], 1, p.maxCents)
    items = trierDesc([...euros, ...cents])
  }
  const total = totalDe(items)
  return {
    type: 'compter', cle: `compter:${items.join(',')}`, items, total, avecCentimes: centimes,
    texte: T('compterQ', { items: items.map(formatSomme).join(' + ') }),
    attendu: fmt(total, niveau),
  }
}

function cibleComposer({ rng, niv }: Contexte, centimes: boolean): number {
  if (!centimes) {
    const p = niv.composer.entiers
    return aleatoirePas(rng, p.min, p.max, p.pas)
  }
  const p = requis(niv.composer.centimes, 'composer avec centimes')
  return rng.entier(p.euros[0], p.euros[1]) * 100 + rng.entier(p.cents[0], p.cents[1])
}

function genComposer(ctx: Contexte, centimes: boolean): QComposer {
  const cible = cibleComposer(ctx, centimes)
  return {
    type: 'composer', cle: `composer:${cible}`, cible, solution: glouton(cible),
    texte: ctx.T('composerQ', { somme: fmt(cible, ctx.niveau) }), attendu: fmt(cible, ctx.niveau),
  }
}

function genMoins(ctx: Contexte, centimes: boolean): QMoins {
  const min = centimes ? requis(ctx.niv.moins.minPieces.centimes, 'moins avec centimes') : ctx.niv.moins.minPieces.entiers
  let cible = 0
  let solution: ValeurArgent[] = []
  for (let essai = 0; essai < 100; essai++) {
    cible = cibleComposer(ctx, centimes)
    solution = glouton(cible)
    if (solution.length >= min) break
  }
  return {
    type: 'moins', cle: `moins:${cible}`, cible, solution,
    texte: ctx.T('moinsQ', { somme: fmt(cible, ctx.niveau) }),
    attendu: `${solution.length} : ${solution.map(formatSomme).join(' + ')}`,
  }
}

function objetPour(rng: Rng, prix: number): Objet {
  const liste = prix <= 200 ? OBJETS.pasCher : prix <= 1000 ? OBJETS.moyen : prix <= 2000 ? OBJETS.cher : OBJETS.tresCher
  const [e, id, pluriel] = rng.choisir<readonly [string, string, true?]>(liste)
  return { e, id, pluriel: !!pluriel }
}
/** Le nom de l'objet (« une pomme »), dans la langue du contenu. */
export const nomObjet = (objet: Objet, T: Traducteur<Cle>): string => T(`objet.${objet.id}` as Cle)

function genRendre(ctx: Contexte, centimes: boolean): QRendre {
  const { rng, T, niveau, niv } = ctx
  const cas = rng.choisir(centimes ? requis(niv.rendre.centimes, 'rendre avec centimes') : niv.rendre.entiers)
  const rendu = aleatoirePas(rng, cas.rendu[0], cas.rendu[1], cas.pas)
  const prix = cas.paye - rendu
  const objet = objetPour(rng, prix)
  return {
    type: 'rendre', cle: `rendre:${prix}/${cas.paye}`, paye: cas.paye, prix, cible: rendu, objet,
    solution: glouton(rendu),
    texte: T('rendreQ', { e: objet.e, prix: fmt(prix, niveau), paye: formatSomme(cas.paye) }),
    attendu: fmt(rendu, niveau),
  }
}

const COUPLES = [0, 1, 2, 3, 4, 5] as const   // les couples de prénoms de textes.ts (prenoms.p0 … p5)

function genComparer({ rng, T, niveau, niv }: Contexte, centimes: boolean): QComparer {
  const p = centimes ? requis(niv.comparer.centimes, 'comparer avec centimes') : niv.comparer.entiers
  const itemsA = tirerDansPlage(rng, p.valeurs, p.nb[0], p.nb[1], 1, p.max)
  const totalA = totalDe(itemsA)
  let itemsB: ValeurArgent[] | null = null
  if (rng.vrai(niv.comparer.probaEgal)) {
    // Même somme, mais autrement composée
    for (let essai = 0; essai < 10 && !itemsB; essai++) {
      const b = decomposerAuHasard(rng, totalA, p.valeurs, p.nb[1] + 2)
      if (b.join(',') !== itemsA.join(',')) itemsB = b
    }
  }
  if (!itemsB) {
    for (let essai = 0; essai < 100; essai++) {
      itemsB = tirerDansPlage(rng, p.valeurs, p.nb[0], p.nb[1], 1, p.max)
      if (totalDe(itemsB) !== totalA) break
    }
  }
  const b = requis(itemsB ?? undefined, 'porte-monnaie B')
  const totalB = totalDe(b)
  const i = rng.choisir(COUPLES)
  const [nomA, nomB] = rng.melanger([T(`prenoms.p${i}.a`), T(`prenoms.p${i}.b`)])
  const bonne: Choix = totalA > totalB ? 'A' : totalB > totalA ? 'B' : 'egal'
  return {
    type: 'comparer', cle: `comparer:${itemsA.join(',')}|${b.join(',')}`,
    itemsA, itemsB: b, totalA, totalB, nomA, nomB, bonne,
    texte: T('comparerQ', { a: nomA, ta: fmt(totalA, niveau), b: nomB, tb: fmt(totalB, niveau) }),
    attendu: bonne === 'A' ? nomA : bonne === 'B' ? nomB : T('autant'),
  }
}

const SOUS_CONVERSIONS = ['c2ec', 'ec2c', 'dec2c', 'ec2dec'] as const

// CE2 : 1 € = 100 c
function genConvertir({ rng, T, niv }: Contexte): QConvertir {
  const p = niv.convertir ?? { min: 105, max: 995 }
  const sous = rng.choisir(SOUS_CONVERSIONS)
  let valeur = rng.entier(p.min, p.max)
  if (valeur % 100 === 0) valeur += rng.entier(1, 9) * 5
  // pour « 2 € 5 c = 2,05 € », on force souvent un petit nombre de centimes (piège classique)
  if (sous === 'ec2dec' && rng.vrai(0.5)) valeur = Math.floor(valeur / 100) * 100 + rng.entier(1, 9)
  const ec = formatSomme(valeur)
  const dec = formatDecimal(valeur)
  const enonces: Record<SousConversion, readonly [string, string]> = {
    c2ec:   [`${valeur}${NB}c = ? € ? c`, ec],
    ec2c:   [`${ec} = ? c`, `${valeur}${NB}c`],
    dec2c:  [`${dec} = ? c`, `${valeur}${NB}c`],
    ec2dec: [`${ec} = ? € (${T('avecVirgule')})`, dec],
  }
  const [texte, attendu] = enonces[sous]
  return { type: 'convertir', sous, cle: `convertir:${sous}:${valeur}`, valeur, texte, attendu }
}

const GENERATEURS = { compter: genCompter, composer: genComposer, moins: genMoins, rendre: genRendre, comparer: genComparer, convertir: genConvertir } satisfies Record<TypeExercice, (ctx: Contexte, centimes: boolean) => Question>

// `nb` questions des types demandés (ceux du niveau), réparties équitablement puis mélangées, jamais deux fois la même
function genererSansRepetition(ctx: Contexte, typesDemandes: readonly TypeExercice[], nb: number, centimes: boolean): Question[] {
  const offerts = typesDu(ctx.niveau)
  const types = typesDemandes.filter(t => offerts.includes(t))
  if (!types.length) types.push(offerts[0])
  // types mélangés d'abord : avec moins de questions que de types, pas toujours les mêmes oubliés
  const typesMelanges = ctx.rng.melanger(types)
  const liste = ctx.rng.melanger(Array.from({ length: nb }, (_, i) => typesMelanges[i % typesMelanges.length]))
  return tirerUniques(nb, rang => GENERATEURS[liste[rang]](ctx, centimes), { cle: q => q.cle, essais: nb * 50 })
}
/** `nb` questions toutes du même type (la fiche tire une partie par type). */
function genererDuType<T extends TypeExercice>(ctx: Contexte, type: T, nb: number, centimes: boolean): Extract<Question, { type: T }>[] {
  return genererSansRepetition(ctx, [type], nb, centimes) as Extract<Question, { type: T }>[]
}

const contexte = (niveau: Classe, rng: Rng, T: Traducteur<Cle>): Contexte => ({ rng, T, niveau: niveauConnu(niveau), niv: donnees(niveau) })

/** Les questions du jeu (`nb` : le réglage nbQ), jamais deux fois la même. */
export const questions = ({ niveau, reglages, rng, T, nb = reglages.nbQ }: ParamsGenerateur<Reglages, Cle>): Question[] =>
  genererSansRepetition(contexte(niveau, rng, T), reglages.exercices ?? [], nb, avecCentimes(niveau, reglages))

// ── Réponses ──
function verifierConversion(q: QConvertir, rep: Reponse): boolean {
  if (q.sous === 'c2ec') {
    const e = parseInt(rep.e || '0', 10)
    const c = parseInt(rep.c || '0', 10)
    return !isNaN(e) && !isNaN(c) && c < 100 && e * 100 + c === q.valeur
  }
  const t = String(rep.texte ?? '').trim()
  if (q.sous === 'ec2dec') return /^\d+\s*[,.]\s*\d{2}\s*(€|euros?)?$/i.test(t) && lireSomme(t) === q.valeur
  const n = t.replace(/\s*(c|centimes?)$/i, '')
  return /^\d+$/.test(n) && +n === q.valeur
}
/** Somme donnée pour « compter » (en centimes), ou null si elle ne se lit pas. */
export function sommeDonnee(q: QCompter, rep: Reponse): number | null {
  if (rep.texte !== undefined) return lireSomme(rep.texte)
  const e = parseInt(rep.e || '0', 10)
  const c = q.avecCentimes ? parseInt(rep.c || '0', 10) : 0
  if (isNaN(e) || isNaN(c) || e < 0 || c < 0) return null
  return e * 100 + c
}
export function verifier(q: Question, rep: Reponse): Verdict {
  switch (q.type) {
    case 'comparer': return rep.choix === q.bonne
    case 'convertir': return verifierConversion(q, rep)
    // deux champs : pas plus de 99 c
    case 'compter': return sommeDonnee(q, rep) === q.total && !(q.avecCentimes && parseInt(rep.c || '0', 10) >= 100)
    case 'moins': {
      const sel = rep.selection ?? []
      return totalDe(sel) === q.cible && sel.length <= q.solution.length
    }
    case 'composer': case 'rendre': return totalDe(rep.selection ?? []) === q.cible
  }
}
/** Une réponse juste, que `verifier` doit accepter (les tests le vérifient pour chaque question tirée). */
export function bonneReponse(q: Question): Reponse {
  switch (q.type) {
    case 'comparer': return { choix: q.bonne }
    case 'convertir':
      if (q.sous === 'c2ec') return { e: String(Math.floor(q.valeur / 100)), c: String(q.valeur % 100) }
      return { texte: q.sous === 'ec2dec' ? formatDecimal(q.valeur) : `${q.valeur}` }
    case 'compter': return { e: String(Math.floor(q.total / 100)), c: String(q.total % 100) }
    case 'composer': case 'moins': case 'rendre': return { selection: [...q.solution] }
  }
}
/** Une réponse fausse, que `verifier` doit refuser. */
export function mauvaiseReponse(q: Question): Reponse {
  switch (q.type) {
    case 'comparer': return { choix: q.bonne === 'A' ? 'B' : 'A' }
    case 'convertir': return q.sous === 'c2ec' ? { e: String(Math.floor(q.valeur / 100) + 1), c: String(q.valeur % 100) } : { texte: '7' }
    case 'compter': return { e: String(Math.floor(q.total / 100) + 1), c: String(q.total % 100) }
    case 'composer': case 'moins': case 'rendre': return { selection: [] }
  }
}

// ── Fiche ──
/** Entourer pour payer : la somme exacte (`bons`) parmi des pièces et billets en trop (`items`). */
export interface Entoure { cible: number, bons: ValeurArgent[], items: ValeurArgent[] }
/** Le moins de pièces : deux façons de payer la même somme ; `bonne` : la lettre de la plus économe (« A, B » si une seule façon existe). */
export interface MoinsFiche { cible: number, A: ValeurArgent[], B: ValeurArgent[], bonne: string }
/** Les parties de la fiche. */
export interface PartiesFiche { compter: boolean, entoure: boolean, moins: boolean, rendre: boolean, comparer: boolean, convertir: boolean }
/** Tout ce que tire la fiche imprimable. */
export interface TirageFiche {
  niveau: Classe
  centimes: boolean
  /** la somme comptée s'écrit « 3,50 € » (CE2 avec centimes) */
  decimale: boolean
  parties: PartiesFiche
  compter: QCompter[]
  entoure: Entoure[]
  moins: MoinsFiche[]
  comparer: QComparer[]
  rendre: QRendre[]
  convertir: QConvertir[]
}

/**
 * Ce que tire la fiche, dans l'ordre de l'ancienne vue : compter, entourer et rendre sont toujours tirés (même si la partie
 * n'est pas affichée), le reste seulement si la partie est demandée.
 */
export function questionsFiche({ niveau, reglages, rng, T }: Omit<ParamsGenerateur<Reglages, Cle>, 'nb'>): TirageFiche {
  const ctx = contexte(niveau, rng, T)
  const types = typesDu(ctx.niveau)
  // Parties de la fiche selon les exercices choisis (toutes si aucun n'a d'équivalent papier)
  const choisis: readonly TypeExercice[] = reglages.exercices ?? []
  let parties: PartiesFiche = {
    compter: choisis.includes('compter'),
    entoure: choisis.includes('composer'),
    moins: choisis.includes('moins'),
    rendre: choisis.includes('rendre'),
    comparer: choisis.includes('comparer'),
    convertir: choisis.includes('convertir') && types.includes('convertir'),
  }
  if (!Object.values(parties).some(Boolean)) parties = { compter: true, entoure: true, moins: false, rendre: true, comparer: false, convertir: types.includes('convertir') }
  const centimes = avecCentimes(ctx.niveau, reglages)
  const valeursPapier = palette(ctx.niveau, centimes).filter(v => v <= 2000)

  const compter = genererDuType(ctx, 'compter', 6, centimes)

  // Entoure pour payer : la somme exacte parmi des pièces et billets en trop. Une cible déjà tirée est rendue vide, sans autre
  // tirage : tirerUniques la refuse, et le flux du hasard reste celui d'avant.
  const vues = new Set<number>()
  const entoure = tirerUniques(3, (): Entoure => {
    const cible = centimes ? rng.entier(1, 9) * 100 + aleatoirePas(rng, 10, 90, 5) : rng.entier(6, 45) * 100
    if (vues.has(cible)) return { cible, bons: [], items: [] }
    vues.add(cible)
    const bons = decomposerAuHasard(rng, cible, valeursPapier, 6)
    const intrus = tirerItems(rng, valeursPapier, 2, 3)
    return { cible, bons, items: trierDesc([...bons, ...intrus]) }
  }, { cle: e => String(e.cible), essais: 100 })

  // Le moins de pièces : deux façons de payer la même somme, entourer la plus économe
  const moins = parties.moins ? genererDuType(ctx, 'moins', 3, centimes).map((qu): MoinsFiche => {
    let autre: ValeurArgent[] | null = null
    for (let essai = 0; essai < 30 && !autre; essai++) {
      const a = decomposerAuHasard(rng, qu.cible, valeursPapier, qu.solution.length + 4)
      if (a.length > qu.solution.length) autre = trierDesc(a)
    }
    const optimaleEnA = rng.vrai(0.5)
    return { cible: qu.cible, A: optimaleEnA ? qu.solution : autre ?? qu.solution, B: optimaleEnA ? autre ?? qu.solution : qu.solution,
      bonne: !autre ? 'A, B' : optimaleEnA ? 'A' : 'B' }
  }) : []

  const comparer = parties.comparer ? genererDuType(ctx, 'comparer', 3, centimes) : []
  const rendre = genererDuType(ctx, 'rendre', 4, centimes)
  const convertir = parties.convertir ? genererDuType(ctx, 'convertir', 8, centimes) : []
  return { niveau: ctx.niveau, centimes, decimale: centimes && ctx.niv.saisieDecimale, parties, compter, entoure, moins, comparer, rendre, convertir }
}

// ── Programme : ce qui sort des contraintes du niveau (src/data/programme.ts, contraintes « monnaie ») ──
interface Sommes { montants: number[], textes: string[], conversions: number }
function ajouter(res: Sommes, r: Sommes): void {
  res.montants.push(...r.montants); res.textes.push(...r.textes); res.conversions += r.conversions
}
// Sommes (en centimes) et textes présents dans une question de jeu ou dans le tirage d'une fiche
function sommesDe(x: Question | readonly Question[] | TirageFiche): Sommes {
  const res: Sommes = { montants: [], textes: [], conversions: 0 }
  if (Array.isArray(x)) { for (const q of x as readonly Question[]) ajouter(res, sommesDe(q)); return res }
  if ('parties' in x) {
    if (x.parties.compter) ajouter(res, sommesDe(x.compter))
    if (x.parties.entoure) for (const e of x.entoure) res.montants.push(e.cible, ...e.items)
    for (const m of x.moins) res.montants.push(m.cible, ...m.A, ...m.B)
    if (x.parties.rendre) ajouter(res, sommesDe(x.rendre))
    ajouter(res, sommesDe(x.comparer)); ajouter(res, sommesDe(x.convertir))
    return res
  }
  const q = x as Question
  res.textes.push(q.texte, q.attendu)
  switch (q.type) {
    case 'compter': res.montants.push(...q.items, q.total); break
    case 'composer': case 'moins': res.montants.push(q.cible, ...q.solution); break
    case 'rendre': res.montants.push(q.paye, q.prix, q.cible, ...q.solution); break
    case 'comparer': res.montants.push(...q.itemsA, ...q.itemsB, q.totalA, q.totalB); break
    case 'convertir': res.montants.push(q.valeur); res.conversions++; break
  }
  return res
}
/** Ce qui sort du programme du niveau : centimes avant le CE1, plus de 100 €, écriture à virgule avant le CE2. Sur des questions ou sur le tirage d'une fiche. */
export function ecartsAuProgramme(x: readonly Question[] | TirageFiche, contraintes: Contraintes): string[] {
  const m = contraintes.monnaie
  if (!m) return ['monnaie : pas au programme du niveau']
  const ecarts: string[] = []
  const { montants, textes, conversions } = sommesDe(x)
  for (const c of montants) {
    if (!m.centimes && c % 100) ecarts.push(`${formatSomme(c)} : centimes pas au programme`)
    if (m.eurosMax && c > m.eurosMax * 100) ecarts.push(`${formatSomme(c)} : plus de ${m.eurosMax} €`)
  }
  if (!m.centimes && conversions) ecarts.push('conversion 1 € = 100 c : centimes pas au programme')
  if (!m.virgule) for (const t of textes) if (/\d,\d\d/.test(t)) ecarts.push(`« ${t} » : écriture à virgule pas au programme`)
  return [...new Set(ecarts)]
}
