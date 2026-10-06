// Déclarer un exercice : `definir({ … })` rend une DefinitionExercice (types.ts), après l'avoir vérifiée à l'import
// (une erreur de déclaration fait échouer l'app ou le test dès le chargement, avec un message qui dit quoi corriger).
//
// Trois commodités par rapport à l'écriture « à la main » des trois structures parallèles `reglages` / `options` / `bonus` :
//   - `choix(valeurs, …)` et `cases(valeurs, …)` : un réglage = une seule description (valeurs, défaut, bonus, hors
//     programme) ; `definir` en tire les trois structures, que le reste du site lit sans changement ;
//   - les compétences sont déclarées une fois pour l'exercice ; chaque niveau reçoit celles dont `niveaux`
//     (programme.ts) contient ce niveau, moins celles qu'il écarte avec `sauf` ;
//   - `herite('ce1', { … })` : un niveau part d'un autre et ne dit que ce qui change.
// Le type des réglages (`R`) est calculé d'après la déclaration, et fermé : `config.pas` est `1 | 2 | 10`, `config.typo` ne
// compile pas (tests/types/ : une faute volontaire doit échouer). Un réglage à choix porte des chaînes, OU des nombres, OU des
// booléens, jamais un mélange (`cases([1, 'a'])` ne compile pas, et `definir` refuse la liste à l'exécution).
// Un exercice réel ne cite jamais K.exemple… ni D.exemple (entrées fictives, développement seulement : voir src/dev.ts).
import { FORME_ID, decrireNiveau, decrireReglagesCommuns, reglagesHerites, verifierClasses, verifierProgramme } from './declaration.ts'
import type { ReglagesDe, SpecReglages } from './declaration.ts'
import type { Classe, CompetenceId, Config, DefinitionExercice, DomaineId, FicheExercice } from './types.ts'

// `choix`, `cases`, `herite`, `decrireChoix`… s'importent d'ici comme avant : la déclaration commune est dans declaration.ts
export { choix, cases, estChoix, decrireChoix } from './declaration.ts'
export type { Choix, ReglagesDe, SpecReglages } from './declaration.ts'

// ── Déclaration ──

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
  /** `false` : exercice « fiche seule » (pas de jeu en ligne : ni `questions` ni `verifier`, pas d'onglet « Jouer »). Défaut : `true` */
  jeu?: boolean
  /** toutes les compétences de l'exercice (K.…) : chaque niveau garde celles qui sont à son programme */
  competences: readonly CompetenceId[]
  /** domaines, autres que `domaine`, dont l'exercice travaille aussi des compétences (déclaration explicite : ex. orthographe → grammaire) */
  autresDomaines?: readonly DomaineId[]
  /** niveau ouvert par défaut ; par défaut le premier de `niveaux` */
  niveauDefaut?: Classe
  /** réglages communs à tous les niveaux */
  reglages?: C
  niveaux: N
  /** fiches prégénérées, une par compétence et niveau (pages /telechargements/) */
  fiches?: readonly FicheExercice<ReglagesDe<C, N>>[]
}

// Les types des réglages, déduits de la déclaration (ReglagesDe), sont dans declaration.ts

/**
 * Ce que rend `definir` : une DefinitionExercice, qui porte en plus le type de ses réglages. Ce champ n'existe pas à
 * l'exécution (undefined) : il sert seulement à retrouver R, que TypeScript ne sait pas déduire de la définition seule.
 */
export interface DefinitionTypee<R extends object> extends DefinitionExercice<R> {
  readonly typeReglages?: R
}
/** Forme des réglages (sans `niveau`) d'une définition construite par `definir` : le `R` de `ModuleExercice<Q, Rep, R>`. */
export type ReglagesDeDefinition<D> = D extends { typeReglages?: infer R extends object } ? R : never
/** Réglages complets d'une définition : `ConfigDe<typeof DEFINITION>` est le type de `config` (réglages + niveau). */
export type ConfigDe<D> = Config<ReglagesDeDefinition<D>>

// ── definir ──

const FORME_ROUTE = /^\/[\w-]+(\/[\w-]+)*$/

export function definir<C extends SpecReglages = {}, N extends Partial<Record<Classe, SpecNiveau>> = {}>(
  spec: SpecExercice<C, N>,
): DefinitionTypee<ReglagesDe<C, N>> {
  const { id } = spec
  const erreur = (message: string): never => { throw new Error(`définir « ${id} » : ${message}`) }

  if (typeof id !== 'string' || !FORME_ID.test(id)) erreur(`id « ${id} » invalide (minuscules, chiffres et tirets : « calcul-mental »)`)
  if (typeof spec.route !== 'string' || !FORME_ROUTE.test(spec.route)) erreur(`route « ${spec.route} » invalide (commence par « / », sans espace : « /maths/heure »)`)
  verifierProgramme(spec, erreur)

  const declares = spec.niveaux as Partial<Record<Classe, SpecNiveau>>
  const classes = Object.keys(declares) as Classe[]
  verifierClasses(classes, 'niveau', erreur)
  if (!classes.length) erreur('aucun niveau')
  const niveauDefaut = spec.niveauDefaut ?? classes[0]
  if (!classes.includes(niveauDefaut)) erreur(`niveauDefaut « ${niveauDefaut} » absent des niveaux`)

  // Les réglages communs (défauts, options), puis chaque niveau (compétences d'après le programme, réglages hérités, écarts)
  const reservees = ['niveau']
  const { reglages, options } = decrireReglagesCommuns(spec.reglages as SpecReglages, { reservees, champs: false, ecartsDans: 'un niveau', erreur })
  const niveaux: DefinitionExercice['niveaux'] = {}
  for (const n of classes) {
    const s = declares[n] as SpecNiveau
    niveaux[n] = decrireNiveau({
      ou: `niveau ${n}`, de: 'l\'exercice', classes: [n], competences: spec.competences, sauf: s.sauf, horsProgramme: s.horsProgramme,
      reglages: reglagesHerites(declares, n, 'niveau', erreur), reservees, champs: false,
    }, erreur).niveau
  }

  // Les fiches par compétence : un niveau et une compétence de l'exercice, des réglages proposés
  const fiches = (spec.fiches ?? []) as readonly FicheExercice[]
  const idsFiches = new Set<string>()
  for (const f of fiches) {
    const niv = niveaux[f.niveau]
    const ou = `fiche « ${f.id} » (${f.niveau})`
    if (typeof f.id !== 'string' || !FORME_ID.test(f.id)) erreur(`${ou} : id invalide (minuscules, chiffres et tirets)`)
    // le slug publié est « exercices-<id>-<niveau>-<fiche> » : deux fiches de même id et de même niveau se confondraient
    const cle = `${f.niveau}/${f.id}`
    if (idsFiches.has(cle)) erreur(`${ou} : id de fiche déjà pris pour ce niveau (le slug publié serait le même)`)
    idsFiches.add(cle)
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
    id: spec.id, route: spec.route, domaine: spec.domaine, contenu: spec.contenu ?? 'interface', jeu: spec.jeu ?? true, niveauDefaut,
    reglages, options, niveaux, fiches,
  } as unknown as DefinitionTypee<ReglagesDe<C, N>>
}
