// Déclarer un exercice : `definir({ … })` rend une DefinitionExercice (types.ts), après l'avoir vérifiée à l'import
// (une erreur de déclaration fait échouer l'app ou le test dès le chargement, avec un message qui dit quoi corriger).
//
// Trois commodités par rapport à l'écriture « à la main » des trois structures parallèles `reglages` / `options` / `bonus` :
//   - `choix(valeurs, …)` et `cases(valeurs, …)` : un réglage = une seule description (valeurs, défaut, bonus, hors
//     programme) ; `definir` en tire les trois structures, que le reste du site lit sans changement ;
//   - les compétences sont déclarées une fois pour l'exercice ; chaque niveau reçoit celles dont `niveaux`
//     (programme.ts) contient ce niveau, moins celles qu'il écarte avec `sauf` ;
//   - `herite('ce1', { … })` : un niveau part d'un autre et ne dit que ce qui change.
// Le type des réglages (`R`) est calculé d'après la déclaration : `config.pas` est `1 | 2 | 10`, `config.typo` ne compile pas.
import { domaineDe, competenceDe } from '../data/programme.ts'
import { NIVEAUX } from '../data/classes.ts'
import type { Classe, CompetenceId, Config, DefinitionExercice, DomaineId, FicheExercice, Reglages, ValeurOption, ValeurReglage } from './types.ts'

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
}

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

/**
 * Choix unique : `choix([2, 5, 10])`, défaut = la première valeur (`defaut` pour une autre). Les `const` ci-dessous
 * font déduire les littéraux (`2 | 5 | 10`, pas `number`), donc des réglages typés au plus juste.
 */
export function choix<const V extends ValeurOption, const B extends ValeurOption = never, const H extends ValeurOption = never>(
  valeurs: readonly V[],
  { defaut = valeurs[0], bonus = [], horsProgramme = [] }: { defaut?: NoInfer<V> } & Ecarts<B, H> = {},
): Choix<V | B | H> {
  return { [MARQUE]: true, valeurs, defaut, bonus, horsProgramme }
}

/** Choix multiple (cases à cocher) : `cases(['lire', 'placer'])`, tout coché par défaut (`defaut` pour une partie). */
export function cases<const V extends string | number, const B extends string | number = never, const H extends string | number = never>(
  valeurs: readonly V[],
  { defaut = valeurs, bonus = [], horsProgramme = [] }: { defaut?: readonly NoInfer<V>[] } & Ecarts<B, H> = {},
): Choix<(V | B | H)[]> {
  return { [MARQUE]: true, valeurs, defaut: [...defaut], bonus, horsProgramme }
}

export const estChoix = (v: unknown): v is ChoixQuelconque => typeof v === 'object' && v !== null && MARQUE in v

// ── Déclaration ──

type Reglage = ValeurReglage | ChoixQuelconque
export type SpecReglages = Record<string, Reglage>

/** Un niveau : ses réglages propres (ils l'emportent sur ceux de l'exercice) et ses exceptions de programme. */
export interface SpecNiveau {
  reglages?: SpecReglages
  /** compétences de l'exercice qui sont au programme de ce niveau mais que l'exercice n'y travaille pas */
  sauf?: readonly CompetenceId[]
  /** compétences travaillées malgré le programme (avec la raison) ; rare */
  horsProgramme?: readonly { competence: CompetenceId, raison: string }[]
  /** niveau dont celui-ci part (voir herite) ; ni `sauf` ni `horsProgramme` ne sont hérités */
  herite?: Classe
}

/** `ce2: herite('ce1', { reglages: { pas: choix([2, 5, 10, 100]) } })` : les réglages de CE1, sauf ceux qu'on redit. */
export const herite = <S extends SpecNiveau>(de: Classe, niveau: S): S & { herite: Classe } => ({ ...niveau, herite: de })

/** Ce que `definir` reçoit. C : réglages communs ; N : niveaux. Leurs types donnent celui des réglages (ReglagesDe). */
export interface SpecExercice<C extends SpecReglages, N extends Partial<Record<Classe, SpecNiveau>>> {
  id: string
  /** route de l'app (« /maths/heure ») */
  route: string
  domaine: DomaineId
  /** 'fr' : exercice de français, contenu toujours en français ; 'interface' (défaut) : le contenu suit la langue de l'interface */
  contenu?: 'fr' | 'interface'
  /** toutes les compétences de l'exercice (K.…) : chaque niveau garde celles qui sont à son programme */
  competences: readonly CompetenceId[]
  /** niveau ouvert par défaut ; par défaut le premier de `niveaux` */
  niveauDefaut?: Classe
  /** réglages communs à tous les niveaux */
  reglages?: C
  niveaux: N
  /** fiches prégénérées, une par compétence et niveau (pages /telechargements/) */
  fiches?: readonly FicheExercice<ReglagesDe<C, N>>[]
}

// ── Types des réglages, déduits de la déclaration ──

// valeur d'un réglage : celle du choix, ou la valeur simple
type ValeurDe<V> = V extends Choix<infer T> ? T : V
type Valeurs<S> = { [K in keyof S]: ValeurDe<S[K]> }
// réglages déclarés par les niveaux : pour chaque clé, l'union des valeurs qu'elle a d'un niveau à l'autre
type ReglagesDesNiveaux<N> = N[keyof N] extends infer L ? L extends { reglages: infer G } ? G : never : never
type Cles<G> = G extends unknown ? keyof G : never
type ValeurDeCle<G, K extends PropertyKey> = G extends unknown ? (K extends keyof G ? ValeurDe<G[K]> : never) : never
type DesNiveaux<G> = { [K in Cles<G>]: ValeurDeCle<G, K> }
/** Forme des réglages d'un exercice : ceux de l'exercice et ceux de ses niveaux. */
export type ReglagesDe<C, N> = Valeurs<C> & DesNiveaux<ReglagesDesNiveaux<N>> & Reglages

/**
 * Ce que rend `definir` : une DefinitionExercice, qui porte en plus le type de ses réglages. Ce champ n'existe pas à
 * l'exécution (undefined) : il sert seulement à retrouver R, que TypeScript ne sait pas déduire de la définition seule.
 */
export interface DefinitionTypee<R extends Reglages> extends DefinitionExercice<R> {
  readonly typeReglages?: R
}
/** Forme des réglages (sans `niveau`) d'une définition construite par `definir` : le `R` de `ModuleExercice<Q, Rep, R>`. */
export type ReglagesDeDefinition<D> = D extends { typeReglages?: infer R extends Reglages } ? R : never
/** Réglages complets d'une définition : `ConfigDe<typeof DEFINITION>` est le type de `config` (réglages + niveau). */
export type ConfigDe<D> = Config<ReglagesDeDefinition<D>>

/**
 * Un réglage à choix, vérifié, en trois structures : défaut, options proposées (valeurs, bonus et hors programme), écarts.
 * Partagé par `definir` et par `definirAffiche` (src/affiches/definir.ts). `erreur` lève l'erreur de déclaration.
 */
export function decrireChoix(cle: string, choix: ChoixQuelconque, ou: string, erreur: (message: string) => never) {
  const v = choix as ChoixLu   // ChoixQuelconque n'a pas `defaut` (voir plus haut) ; tout choix construit par choix() ou cases() en a un
  const lieu = `${ou}, réglage « ${cle} »`
  if (!v.valeurs.length) erreur(`${lieu} : aucune valeur`)
  const proposees = [...v.valeurs, ...v.bonus, ...v.horsProgramme.map(h => h.option)]
  const doublon = proposees.find((x, i) => proposees.indexOf(x) !== i)
  if (doublon !== undefined) erreur(`${lieu} : « ${doublon} » proposé deux fois (valeurs, bonus et horsProgramme sont disjoints)`)
  for (const d of Array.isArray(v.defaut) ? v.defaut : [v.defaut]) {
    if (!v.valeurs.includes(d)) erreur(`${lieu} : le défaut « ${d} » n'est pas parmi les valeurs au programme ${JSON.stringify(v.valeurs)} (un bonus n'est jamais par défaut)`)
  }
  if (Array.isArray(v.defaut) && !v.defaut.length) erreur(`${lieu} : défaut vide`)
  for (const h of v.horsProgramme) if (!h.raison) erreur(`${lieu} : horsProgramme « ${h.option} » sans raison`)
  return { defaut: v.defaut as ValeurReglage, options: proposees as ValeurOption[] }
}

// ── definir ──

type Options = Record<string, ValeurOption[]>
type EcartHors = { reglage?: string, option: ValeurOption, raison: string }

export function definir<C extends SpecReglages = {}, N extends Partial<Record<Classe, SpecNiveau>> = {}>(
  spec: SpecExercice<C, N>,
): DefinitionTypee<ReglagesDe<C, N>> {
  const { id } = spec
  const erreur = (message: string): never => { throw new Error(`définir « ${id} » : ${message}`) }

  if (!domaineDe(spec.domaine)) erreur(`domaine « ${spec.domaine} » inconnu de programme.ts`)
  for (const k of spec.competences) if (!competenceDe(k)) erreur(`compétence « ${k} » inconnue de programme.ts`)
  const dupliquee = spec.competences.find((k, i) => spec.competences.indexOf(k) !== i)
  if (dupliquee) erreur(`compétence « ${dupliquee} » déclarée deux fois`)

  const declares = spec.niveaux as Partial<Record<Classe, SpecNiveau>>
  const classes = Object.keys(declares) as Classe[]
  for (const n of classes) if (!NIVEAUX.includes(n)) erreur(`niveau « ${n} » inconnu (classes : ${NIVEAUX.join(', ')})`)
  if (!classes.length) erreur('aucun niveau')
  const niveauDefaut = spec.niveauDefaut ?? classes[0]
  if (!classes.includes(niveauDefaut)) erreur(`niveauDefaut « ${niveauDefaut} » absent des niveaux`)

  // Un réglage à choix, vérifié, en trois structures : défaut, options proposées, écarts au programme
  const decrire = (cle: string, v: ChoixQuelconque, ou: string) => decrireChoix(cle, v, ou, erreur)

  // Les réglages communs : valeurs par défaut, et options des réglages à choix
  const reglages: Reglages = {}
  const options: Options = {}
  for (const [cle, v] of Object.entries((spec.reglages ?? {}) as SpecReglages)) {
    if (cle === 'niveau') erreur('« niveau » est réservé')
    if (!estChoix(v)) { reglages[cle] = v; continue }
    if (v.bonus.length || v.horsProgramme.length) erreur(`réglage commun « ${cle} » : bonus et horsProgramme se déclarent dans un niveau (ils dépendent du programme)`)
    const d = decrire(cle, v, 'réglages communs')
    reglages[cle] = d.defaut
    options[cle] = d.options
  }

  // Un niveau : ses réglages, ceux dont il hérite, ses compétences
  function reglagesDe(n: Classe, chemin: Classe[] = []): SpecReglages {
    const s = declares[n]
    if (!s) return erreur(`niveau « ${n} » : hérité mais pas déclaré`)
    if (!s.herite) return s.reglages ?? {}
    if (chemin.includes(n)) return erreur(`héritage circulaire : ${[...chemin, n].join(' → ')}`)
    return { ...reglagesDe(s.herite, [...chemin, n]), ...s.reglages }
  }

  const niveaux: DefinitionExercice['niveaux'] = {}
  for (const n of classes) {
    const s = declares[n] as SpecNiveau
    const ou = `niveau ${n}`
    for (const k of s.sauf ?? []) if (!spec.competences.includes(k)) erreur(`${ou} : sauf « ${k} » n'est pas une compétence de l'exercice`)
    const competences: CompetenceId[] = spec.competences.filter(k => !s.sauf?.includes(k) && competenceDe(k)!.niveaux.includes(n))
    if (!competences.length) {
      erreur(`${ou} : aucune compétence de l'exercice n'est au programme de ${n} (${spec.competences.map(k => `${k} : ${competenceDe(k)!.niveaux.join(', ')}`).join(' ; ')}). Retirer ce niveau, ou ajouter une compétence`)
    }
    const horsProgramme: EcartHors[] = []
    for (const h of s.horsProgramme ?? []) {
      if (!competenceDe(h.competence)) erreur(`${ou} : compétence « ${h.competence} » inconnue de programme.ts`)
      if (!h.raison) erreur(`${ou} : horsProgramme « ${h.competence} » sans raison`)
      competences.push(h.competence)
      horsProgramme.push({ option: h.competence, raison: h.raison })
    }
    const niv: DefinitionExercice['niveaux'][Classe] & {} = { competences, reglages: {}, options: {} }
    const bonus: Record<string, ValeurOption[]> = {}
    for (const [cle, v] of Object.entries(reglagesDe(n))) {
      if (cle === 'niveau') erreur('« niveau » est réservé')
      if (!estChoix(v)) { niv.reglages[cle] = v; continue }
      const d = decrire(cle, v, ou)
      niv.reglages[cle] = d.defaut
      niv.options![cle] = d.options
      if (v.bonus.length) bonus[cle] = [...v.bonus]
      for (const h of v.horsProgramme) horsProgramme.push({ reglage: cle, ...h })
    }
    if (Object.keys(bonus).length) niv.bonus = bonus
    if (horsProgramme.length) niv.horsProgramme = horsProgramme
    niveaux[n] = niv
  }

  // Les fiches par compétence : un niveau et une compétence de l'exercice, des réglages proposés
  const fiches = (spec.fiches ?? []) as readonly FicheExercice[]
  for (const f of fiches) {
    const niv = niveaux[f.niveau]
    const ou = `fiche « ${f.id} » (${f.niveau})`
    if (!niv) erreur(`${ou} : niveau absent de l'exercice`)
    else if (!niv.competences.includes(f.competence)) erreur(`${ou} : « ${f.competence} » n'est pas une compétence de ${f.niveau} (${niv.competences.join(', ')})`)
    for (const [cle, v] of Object.entries(f.reglages)) {
      if (v === undefined) continue
      const offertes = niv?.options?.[cle] ?? options[cle]
      if (!offertes) erreur(`${ou} : réglage « ${cle} » sans choix déclaré`)
      for (const x of Array.isArray(v) ? v : [v]) if (!offertes?.includes(x)) erreur(`${ou} : ${cle} = « ${x} » n'est pas proposé (${JSON.stringify(offertes)})`)
    }
  }

  // les types de ReglagesDe décrivent ce que les contrôles ci-dessus viennent de vérifier : un seul point de conversion
  return {
    id: spec.id, route: spec.route, domaine: spec.domaine, contenu: spec.contenu ?? 'interface', niveauDefaut,
    reglages, options, niveaux, fiches,
  } as unknown as DefinitionTypee<ReglagesDe<C, N>>
}
