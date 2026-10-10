// Ce que `definir` (exercices, src/noyau/definir.ts) et `definirAffiche` (affiches, src/affiches/definir.ts) ont en commun :
// les réglages à choix et les champs libres (`choix`, `cases`, `texte`, `nombre`), leur vérification, le contrôle du domaine et
// des compétences, les compétences d'un niveau (ou d'une variante) d'après le programme, l'héritage, et les types des réglages
// calculés d'après la déclaration. Une règle de déclaration se change ici, une fois : les deux modèles ne la recopient pas.
//
// Ce qui diffère volontairement (documenté dans les README) :
//   - `classes` : un niveau d'exercice est UNE classe ; une variante d'affiche en a plusieurs. Une compétence reste dans une
//     variante seulement si elle est au programme de TOUTES ses classes (`every`) : une affiche pour GS et CP ne montre pas
//     ce que le CP seul apprend. Pour un exercice (une classe), c'est l'égalité simple.
//   - les champs libres (`texte`, `nombre`) n'existent que pour les affiches ; un exercice qui en déclare un est refusé.
import { domaineDe, competenceDe } from '../data/programme.ts'
import { NIVEAUX } from '../data/classes.ts'
import type { Classe, CompetenceId, DomaineId, NiveauExercice, Reglages, ValeurOption, ValeurReglage } from './types.ts'

// ── Réglages à choix ──

const MARQUE = Symbol('choix')

/** Ce que tout réglage à choix a, quelle que soit la valeur : sert de type attendu (sans faire élargir `T` par l'inférence). */
interface ChoixQuelconque {
  readonly [MARQUE]: true
  /** valeurs au programme */
  readonly valeurs: readonly ValeurOption[]
  /** valeurs proposées en plus, hors programme du niveau : jamais par défaut, affichées « (bonus) » */
  readonly bonus: readonly ValeurOption[]
  /** valeurs proposées en plus, hors programme, avec la raison (infobulle), affichées « (hors programme) » */
  readonly horsProgramme: readonly { option: ValeurOption, raison: string }[]
  /** un nombre entier libre en plus des valeurs (bouton « Autre »), bornes incluses : le nombre de questions */
  readonly libre?: Libre
}

/** Un nombre entier libre, entre deux bornes incluses. */
export interface Libre { readonly min: number, readonly max: number }

/** Le nombre de questions libre de tous les exercices : de 1 à 50, en plus des choix proposés (bouton « Autre… »). */
export const NB_LIBRE: Libre = { min: 1, max: 50 }

// Sans `defaut` : s'il y était, TypeScript en tirerait un `T` élargi à ValeurOption pour chaque appel de choix().
type ChoixLu = ChoixQuelconque & { readonly defaut: ValeurOption | ValeurOption[] }

/** Un réglage à choix, décrit une fois. T : le type de sa valeur (une valeur, ou une liste pour un choix multiple). */
export interface Choix<T extends ValeurOption | ValeurOption[]> extends ChoixQuelconque {
  readonly defaut: T
}

interface Ecarts<B, H> {
  bonus?: readonly B[]
  horsProgramme?: readonly { option: H, raison: string }[]
}

type OptionsChoix<V, B, H> = { defaut?: NoInfer<V> } & Ecarts<B, H>
/** Un choix de nombres peut aussi proposer un nombre libre : `choix([5, 10, 15], { libre: { min: 1, max: 60 } })`. */
type OptionsChoixNombre<V, B, H> = OptionsChoix<V, B, H> & { libre?: Libre }
type OptionsCases<V, B, H> = { defaut?: readonly NoInfer<V>[] } & Ecarts<B, H>

/**
 * Choix unique : `choix([2, 5, 10])`, défaut = la première valeur (`defaut` pour une autre). Les `const` ci-dessous
 * font déduire les littéraux (`2 | 5 | 10`, pas `number`), donc des réglages typés au plus juste. Une seule sorte de
 * valeur par réglage : chaînes, nombres ou booléens (les surcharges refusent `choix([1, 'a'])`).
 */
export function choix<const V extends string, const B extends string = never, const H extends string = never>(valeurs: readonly V[], options?: OptionsChoix<V, B, H>): Choix<V | B | H>
export function choix<const V extends number, const B extends number = never, const H extends number = never>(valeurs: readonly V[], options: OptionsChoixNombre<V, B, H> & { libre: Libre }): Choix<number>
export function choix<const V extends number, const B extends number = never, const H extends number = never>(valeurs: readonly V[], options?: OptionsChoix<V, B, H>): Choix<V | B | H>
export function choix<const V extends boolean, const B extends boolean = never, const H extends boolean = never>(valeurs: readonly V[], options?: OptionsChoix<V, B, H>): Choix<V | B | H>
export function choix(valeurs: readonly ValeurOption[], { defaut = valeurs[0], bonus = [], horsProgramme = [], libre }: { defaut?: ValeurOption, libre?: Libre } & Ecarts<ValeurOption, ValeurOption> = {}): Choix<ValeurOption> {
  return { [MARQUE]: true, valeurs, defaut, bonus, horsProgramme, ...(libre ? { libre } : {}) }
}

/** Choix multiple (cases à cocher) : `cases(['lire', 'placer'])`, tout coché par défaut (`defaut` pour une partie). Chaînes OU nombres. */
export function cases<const V extends string, const B extends string = never, const H extends string = never>(valeurs: readonly V[], options?: OptionsCases<V, B, H>): Choix<(V | B | H)[]>
export function cases<const V extends number, const B extends number = never, const H extends number = never>(valeurs: readonly V[], options?: OptionsCases<V, B, H>): Choix<(V | B | H)[]>
export function cases(valeurs: readonly (string | number)[], { defaut = valeurs, bonus = [], horsProgramme = [] }: { defaut?: readonly (string | number)[] } & Ecarts<string | number, string | number> = {}): Choix<(string | number)[]> {
  return { [MARQUE]: true, valeurs, defaut: [...defaut], bonus, horsProgramme }
}

export const estChoix = (v: unknown): v is ChoixQuelconque => typeof v === 'object' && v !== null && MARQUE in v

/** Forme d'un identifiant d'exercice, d'affiche, de fiche ou de préréglage (il finit dans une URL ou un slug). */
export const FORME_ID = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/

// ── Champs libres (affiches) ──

const MARQUE_CHAMP = Symbol('champ')

/** Un champ texte : `texte({ max: 40 })`. Le dessin lit une chaîne (à échapper s'il la met dans du HTML : `echapper`). */
export interface ChampTexte {
  readonly [MARQUE_CHAMP]: 'texte'
  readonly defaut: string
  readonly max: number
}
/** Un champ nombre : `nombre({ defaut: 1, min: 0, max: 100, pas: 1 })`, bornes incluses, valeurs au pas près depuis `min`. */
export interface ChampNombre {
  readonly [MARQUE_CHAMP]: 'nombre'
  readonly defaut: number
  readonly min: number
  readonly max: number
  readonly pas: number
}
/** Un champ libre tel que les définitions le portent (sans le défaut, qui est dans `reglages`). */
export type Champ = { sorte: 'texte', max: number } | { sorte: 'nombre', min: number, max: number, pas: number }

/** Champ texte libre, vide par défaut, 200 caractères au plus. */
export const texte = ({ defaut = '', max = 200 }: { defaut?: string, max?: number } = {}): ChampTexte => ({ [MARQUE_CHAMP]: 'texte', defaut, max })
/** Champ nombre libre. */
export const nombre = ({ defaut, min, max, pas = 1 }: { defaut: number, min: number, max: number, pas?: number }): ChampNombre =>
  ({ [MARQUE_CHAMP]: 'nombre', defaut, min, max, pas })
export const estChamp = (v: unknown): v is ChampTexte | ChampNombre => typeof v === 'object' && v !== null && MARQUE_CHAMP in v

// ── Déclaration ──

export type Reglage = ValeurReglage | ChoixQuelconque | ChampTexte | ChampNombre
export type SpecReglages = Record<string, Reglage>

// ── Types des réglages, déduits de la déclaration ──

// valeur d'un réglage : celle du choix, ou la valeur simple
type ValeurDe<V> = V extends Choix<infer T> ? T : V extends ChampTexte ? string : V extends ChampNombre ? number : V
type Valeurs<S> = { [K in keyof S]: ValeurDe<S[K]> }
// réglages déclarés par les niveaux : pour chaque clé, l'union des valeurs qu'elle a d'un niveau à l'autre
export type ReglagesDesNiveaux<N> = N[keyof N] extends infer L ? L extends { reglages: infer G } ? G : never : never
type Cles<G> = G extends unknown ? keyof G : never
type ValeurDeCle<G, K extends PropertyKey> = G extends unknown ? (K extends keyof G ? ValeurDe<G[K]> : never) : never
type DesNiveaux<G> = { [K in Cles<G>]: ValeurDeCle<G, K> }
/** Forme des réglages d'un exercice : ceux de l'exercice et ceux de ses niveaux. */
export type ReglagesDe<C, N> = Valeurs<C> & DesNiveaux<ReglagesDesNiveaux<N>>


/** Un réglage à choix, vérifié, en trois structures : défaut, options proposées (valeurs, bonus et hors programme), écarts. */
export function decrireChoix(cle: string, choix: ChoixQuelconque, ou: string, erreur: (message: string) => never) {
  const v = choix as ChoixLu   // ChoixQuelconque n'a pas `defaut` (voir plus haut) ; tout choix construit par choix() ou cases() en a un
  const lieu = `${ou}, réglage « ${cle} »`
  if (!v.valeurs.length) erreur(`${lieu} : aucune valeur`)
  const proposees = [...v.valeurs, ...v.bonus, ...v.horsProgramme.map(h => h.option)]
  const invalide = proposees.find(x => typeof x === 'number' && !Number.isFinite(x))
  if (invalide !== undefined) erreur(`${lieu} : « ${invalide} » n'est pas un nombre fini`)
  const sortes = [...new Set(proposees.map(x => typeof x))]
  if (sortes.length > 1) erreur(`${lieu} : des valeurs de sortes différentes (${sortes.join(', ')}) : chaînes, nombres ou booléens, pas un mélange (« 1 » et 1 sont deux valeurs)`)
  const doublon = proposees.find((x, i) => proposees.indexOf(x) !== i)
  if (doublon !== undefined) erreur(`${lieu} : « ${doublon} » proposé deux fois (valeurs, bonus et horsProgramme sont disjoints)`)
  for (const d of Array.isArray(v.defaut) ? v.defaut : [v.defaut]) {
    if (!v.valeurs.includes(d)) erreur(`${lieu} : le défaut « ${d} » n'est pas parmi les valeurs au programme ${JSON.stringify(v.valeurs)} (un bonus n'est jamais par défaut)`)
  }
  if (Array.isArray(v.defaut) && !v.defaut.length) erreur(`${lieu} : défaut vide`)
  for (const h of v.horsProgramme) if (!h.raison) erreur(`${lieu} : horsProgramme « ${h.option} » sans raison`)
  if (v.libre) verifierLibre(v.libre, proposees, lieu, erreur)
  return { defaut: v.defaut as ValeurReglage, options: proposees as ValeurOption[], libre: v.libre }
}


/** Un nombre libre : des bornes entières, min ≤ max, et toutes les valeurs proposées (des nombres entiers) entre les deux. */
function verifierLibre(libre: Libre, proposees: readonly ValeurOption[], lieu: string, erreur: (message: string) => never): void {
  const { min, max } = libre
  if (!Number.isInteger(min) || !Number.isInteger(max) || min > max) erreur(`${lieu} : libre { min: ${min}, max: ${max} } : deux entiers, min ≤ max`)
  for (const x of proposees) {
    if (typeof x !== 'number' || !Number.isInteger(x)) erreur(`${lieu} : un nombre libre ne va qu'avec des valeurs entières (« ${x} »)`)
    else if (x < min || x > max) erreur(`${lieu} : « ${x} » hors des bornes du nombre libre (${min} à ${max})`)
  }
}

/** Un champ libre, vérifié : son défaut (dans `reglages`) et sa description (dans `champs`). */
export function decrireChamp(cle: string, c: ChampTexte | ChampNombre, ou: string, erreur: (message: string) => never): { defaut: string | number, champ: Champ } {
  const lieu = `${ou}, champ « ${cle} »`
  if (typeof c.defaut === 'string') {
    const t = c as ChampTexte
    if (!Number.isInteger(t.max) || t.max < 1) erreur(`${lieu} : max doit être un entier d'au moins 1`)
    if (t.defaut.length > t.max) erreur(`${lieu} : le défaut dépasse max (${t.max} caractères)`)
    return { defaut: t.defaut, champ: { sorte: 'texte', max: t.max } }
  }
  const n = c as ChampNombre
  if (![n.defaut, n.min, n.max, n.pas].every(Number.isFinite)) erreur(`${lieu} : defaut, min, max et pas sont des nombres finis`)
  if (n.min > n.max) erreur(`${lieu} : min (${n.min}) dépasse max (${n.max})`)
  if (n.pas <= 0) erreur(`${lieu} : le pas doit être positif`)
  if (n.defaut < n.min || n.defaut > n.max) erreur(`${lieu} : le défaut ${n.defaut} est hors de ${n.min}…${n.max}`)
  if (Math.abs(Math.round((n.defaut - n.min) / n.pas) * n.pas - (n.defaut - n.min)) > 1e-9) erreur(`${lieu} : le défaut ${n.defaut} n'est pas à un pas (${n.pas}) du minimum ${n.min}`)
  return { defaut: n.defaut, champ: { sorte: 'nombre', min: n.min, max: n.max, pas: n.pas } }
}

// ── Programme : domaine et compétences ──

/** Erreur d'identifiant inconnu : les entrées fictives « exemple… » ne servent qu'en développement. */
export function inconnu(nature: 'domaine' | 'compétence', x: string, erreur: (message: string) => never): never {
  return erreur(`${nature} « ${x} » inconnu${nature === 'domaine' ? '' : 'e'} de programme.ts${x.startsWith('exemple') ? ` (les entrées « exemple… » sont fictives : développement seulement, jamais dans un exercice réel ni en production : src/dev.ts)` : ''}`)
}

/** Domaine, autres domaines et compétences d'une déclaration : connus de programme.ts, sans doublon, du bon domaine. */
export function verifierProgramme(spec: { domaine: DomaineId, autresDomaines?: readonly DomaineId[], competences: readonly CompetenceId[] }, erreur: (message: string) => never): void {
  if (!domaineDe(spec.domaine)) inconnu('domaine', spec.domaine, erreur)
  for (const d of spec.autresDomaines ?? []) if (!domaineDe(d)) inconnu('domaine', d, erreur)
  for (const k of spec.competences) {
    const comp = competenceDe(k)
    if (!comp) inconnu('compétence', k, erreur)
    else if (comp.domaine !== spec.domaine && !(spec.autresDomaines ?? []).includes(comp.domaine)) {
      erreur(`compétence « ${k} » : du domaine « ${comp.domaine} », pas de « ${spec.domaine} ». Si cela travaille vraiment ce domaine, le déclarer : autresDomaines: [D.…]`)
    }
  }
  const dupliquee = spec.competences.find((k, i) => spec.competences.indexOf(k) !== i)
  if (dupliquee) erreur(`compétence « ${dupliquee} » déclarée deux fois`)
}

/** Les classes d'une déclaration sont des classes qui existent, et il y en a au moins une. */
export function verifierClasses(classes: readonly string[], nature: string, erreur: (message: string) => never): void {
  for (const n of classes) if (!(NIVEAUX as readonly string[]).includes(n)) erreur(`${nature} « ${n} » inconnu (classes : ${NIVEAUX.join(', ')})`)
}

// ── Réglages communs, niveaux, héritage ──

type Options = Record<string, ValeurOption[]>
/** Ce que décrit un ensemble de réglages : défauts, options des réglages à choix, champs libres. */
export interface ReglagesDecrits { reglages: Reglages, options: Options, champs: Record<string, Champ>, libres: Record<string, Libre> }

/**
 * Réglages d'un ensemble (communs, ou d'un niveau) : une valeur simple est un défaut ; un `choix` ou `cases` donne défaut et
 * options ; un champ libre donne défaut et description. `ecarts` : bonus et hors programme ne se déclarent pas ici (null :
 * ils sont permis, ce sont ceux d'un niveau, qui les retrouve dans `bonus` et `horsProgramme`).
 */
function decrireReglages(spec: SpecReglages, ou: string, { reservees, champs, ecartsDans, erreur }: {
  reservees: readonly string[], champs: boolean, ecartsDans: string | null, erreur: (message: string) => never
}, bonus?: Record<string, ValeurOption[]>, hors?: Record<string, unknown>[]): ReglagesDecrits {
  const res: ReglagesDecrits = { reglages: {}, options: {}, champs: {}, libres: {} }
  for (const [cle, v] of Object.entries(spec)) {
    if (reservees.includes(cle)) erreur(`« ${cle} » est réservé`)
    if (estChamp(v)) {
      if (!champs) erreur(`${ou}, réglage « ${cle} » : un champ libre (texte, nombre) n'existe que pour une affiche`)
      const d = decrireChamp(cle, v, ou, erreur)
      res.reglages[cle] = d.defaut
      res.champs[cle] = d.champ
      continue
    }
    if (!estChoix(v)) { res.reglages[cle] = v; continue }
    if (ecartsDans && (v.bonus.length || v.horsProgramme.length)) erreur(`réglage commun « ${cle} » : bonus et horsProgramme se déclarent dans ${ecartsDans} (ils dépendent du programme)`)
    const d = decrireChoix(cle, v, ou, erreur)
    res.reglages[cle] = d.defaut
    res.options[cle] = d.options
    if (d.libre) res.libres[cle] = d.libre
    if (bonus && v.bonus.length) bonus[cle] = [...v.bonus]
    for (const h of v.horsProgramme) hors?.push({ reglage: cle, ...h })
  }
  return res
}

/** Réglages communs : défauts, options et champs (pas de bonus ni de hors programme, qui dépendent du niveau). */
export const decrireReglagesCommuns = (spec: SpecReglages | undefined, p: { reservees: readonly string[], champs: boolean, ecartsDans: string, erreur: (message: string) => never }): ReglagesDecrits =>
  decrireReglages(spec ?? {}, 'réglages communs', p)

/** Ce qu'un niveau ou une variante déclare, sous le nom qu'on lui donne (`ou`) dans les messages. */
export interface ParamsNiveau {
  /** « niveau cp », « variante jusqua10 » */
  ou: string
  /** « l'exercice », « l'affiche » */
  de: string
  /** classes du niveau : une pour un exercice, une ou plusieurs pour une variante d'affiche */
  classes: readonly Classe[]
  /** toutes les compétences de l'exercice ou de l'affiche */
  competences: readonly CompetenceId[]
  /** compétences écartées malgré le programme */
  sauf?: readonly CompetenceId[]
  /** compétences travaillées hors programme, avec leur raison */
  horsProgramme?: readonly { competence: CompetenceId, raison: string }[]
  /** ses réglages (l'héritage est déjà résolu : reglagesHerites) */
  reglages: SpecReglages
  reservees: readonly string[]
  /** les champs libres sont-ils permis ? */
  champs: boolean
}

/**
 * Un niveau ou une variante : ses compétences d'après le programme (celles de l'exercice qui sont au programme de toutes ses
 * classes, moins `sauf`, plus celles déclarées hors programme), puis ses réglages, options, bonus et écarts de programme.
 */
export function decrireNiveau(p: ParamsNiveau, erreur: (message: string) => never): { niveau: NiveauExercice, champs: Record<string, Champ> } {
  const { ou } = p
  for (const k of p.sauf ?? []) if (!p.competences.includes(k)) erreur(`${ou} : sauf « ${k} » n'est pas une compétence de ${p.de}`)
  const competences: CompetenceId[] = p.competences.filter(k => !p.sauf?.includes(k) && p.classes.every(n => competenceDe(k)!.niveaux.includes(n)))
  if (!competences.length) {
    erreur(`${ou} : aucune compétence de ${p.de} n'est au programme de ${p.classes.join(', ')} (${p.competences.map(k => `${k} : ${competenceDe(k)!.niveaux.join(', ')}`).join(' ; ')}). Retirer ce niveau, ou ajouter une compétence`)
  }
  const hors: Record<string, unknown>[] = []
  for (const h of p.horsProgramme ?? []) {
    if (!competenceDe(h.competence)) inconnu('compétence', h.competence, erreur)
    if (!h.raison) erreur(`${ou} : horsProgramme « ${h.competence} » sans raison`)
    if (competences.includes(h.competence)) erreur(`${ou} : horsProgramme « ${h.competence} » est déjà au programme de ce niveau (ou déclarée deux fois) : horsProgramme ne sert qu'aux compétences qui n'y sont pas`)
    if (!competenceDe(h.competence)!.niveaux.length) erreur(`${ou} : compétence « ${h.competence} » sans niveau`)
    competences.push(h.competence)
    hors.push({ competence: h.competence, raison: h.raison })
  }
  const bonus: Record<string, ValeurOption[]> = {}
  const d = decrireReglages(p.reglages, ou, { reservees: p.reservees, champs: p.champs, ecartsDans: null, erreur }, bonus, hors)
  const niveau: NiveauExercice = { competences, reglages: d.reglages, options: d.options }
  if (Object.keys(d.libres).length) niveau.libres = d.libres
  if (Object.keys(bonus).length) niveau.bonus = bonus
  if (hors.length) niveau.horsProgramme = hors as never
  return { niveau, champs: d.champs }
}

/**
 * Les réglages d'un niveau (ou d'une variante) avec ceux dont il hérite : `herite: 'ce1'` part des réglages de CE1 et
 * ne dit que ce qui change. Ni `sauf` ni `horsProgramme` ne sont hérités.
 */
export function reglagesHerites<K extends string>(declares: Readonly<Partial<Record<K, { reglages?: SpecReglages, herite?: K }>>>, cle: K, nature: string, erreur: (message: string) => never, chemin: K[] = []): SpecReglages {
  const s = declares[cle]
  if (!s) return erreur(`${nature} « ${cle} » : hérité mais pas déclaré`)
  if (!s.herite) return s.reglages ?? {}
  if (chemin.includes(cle)) return erreur(`héritage circulaire : ${[...chemin, cle].join(' → ')}`)
  return { ...reglagesHerites(declares, s.herite, nature, erreur, [...chemin, cle]), ...s.reglages }
}
