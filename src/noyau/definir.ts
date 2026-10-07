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
import { plageDeClasses } from '../data/classes.ts'
import type { ClassesDe, NotationClasses } from '../data/classes.ts'
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

/**
 * Plusieurs niveaux identiques d'un coup : `niveaux: { cp: {…}, ...pourClasses('ce1-cm2', { reglages: {…} }) }`. La notation est celle
 * de `plageDeClasses` (`'cp+'`, `'-gs'`, `'ce1-cm1'`, `'cp'`). Chaque classe de la plage reçoit le même niveau (il se combine avec
 * `herite` : `pourClasses('cm1-cm2', herite('ce2', {…}))`). Attention : une classe écrite après la plage l'emporte (ordre des clés).
 */
export const pourClasses = <const N extends NotationClasses, S extends SpecNiveau>(notation: N, niveau: S): { [C in ClassesDe<N>]: S } =>
  Object.fromEntries(plageDeClasses(notation).map(c => [c, niveau])) as { [C in ClassesDe<N>]: S }

/**
 * Une même fiche pour plusieurs classes : `fiches: [...fichesPourClasses('ce1-cm2', { id: 'division', competence: K.sensDivision, reglages: {…} })]`.
 * Les réglages de la fiche sont vérifiés à l'import par `definir` (valeur non proposée = erreur franche), pas par le compilateur
 * (une fiche écrite à la main, elle, est vérifiée aussi par le type). Pas de `slug` sur une fiche de plusieurs classes (il est unique).
 */
export const fichesPourClasses = <R extends object>(notation: NotationClasses, fiche: Omit<FicheExercice<NoInfer<R>>, 'niveau' | 'slug'>): FicheExercice<R>[] =>
  plageDeClasses(notation).map(niveau => ({ ...fiche, niveau }))

/** Ce que `definir` reçoit. C : réglages communs ; N : niveaux. Leurs types donnent celui des réglages (ReglagesDe). */
export interface SpecExercice<C extends SpecReglages, N extends Partial<Record<Classe, SpecNiveau>>> {
  id: string
  /** route de l'app (« /maths/heure ») */
  route: string
  domaine: DomaineId
  /** emoji de la carte du catalogue (💶 pour la monnaie) ; défaut : celui du domaine */
  emoji?: string
  /** 'fr' : exercice de français, contenu toujours en français ; 'interface' (défaut) : le contenu suit la langue de l'interface */
  contenu?: 'fr' | 'interface'
  /** `false` : exercice « fiche seule » (pas de jeu en ligne : ni `questions` ni `verifier`, pas d'onglet « Jouer »). Défaut : `true` */
  jeu?: boolean
  /** `false` : la fiche ne tire rien au hasard : un seul exemplaire par fiche publiée. Défaut : `true` */
  aleatoire?: boolean
  /** `false` : pas de fiche « bilan » par classe, seulement celles de `fiches`. Défaut : `true` */
  bilanParClasse?: boolean
  /** `false` : la fiche n'a rien à corriger (pas de section.corrige) ; ou une fonction des réglages. Défaut : `true` */
  corrige?: boolean | ((reglages: Readonly<Record<string, unknown>>) => boolean)
  /** toutes les compétences de l'exercice (K.…) : chaque niveau garde celles qui sont à son programme */
  competences: readonly CompetenceId[]
  /** domaines, autres que `domaine`, dont l'exercice travaille aussi des compétences (déclaration explicite : ex. orthographe → grammaire) */
  autresDomaines?: readonly DomaineId[]
  /** niveau ouvert par défaut ; par défaut le premier de `niveaux` */
  niveauDefaut?: Classe
  /** réglages communs à tous les niveaux */
  reglages?: C
  niveaux: N
  /** fiches prégénérées, une par compétence et niveau (pages /telechargements/) (`fichesPourClasses` : une fiche pour plusieurs classes) */
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
  const slugsFiches = new Set<string>()
  for (const f of fiches) {
    const niv = niveaux[f.niveau]
    const ou = `fiche « ${f.id} » (${f.niveau})`
    if (typeof f.id !== 'string' || !FORME_ID.test(f.id)) erreur(`${ou} : id invalide (minuscules, chiffres et tirets)`)
    // le slug publié est « exercices-<id>-<niveau>-<fiche> » : deux fiches de même id et de même niveau se confondraient
    const cle = `${f.niveau}/${f.id}`
    if (idsFiches.has(cle)) erreur(`${ou} : id de fiche déjà pris pour ce niveau (le slug publié serait le même)`)
    idsFiches.add(cle)
    if (f.slug !== undefined) {
      if (typeof f.slug !== 'string' || !FORME_ID.test(f.slug)) erreur(`${ou} : slug « ${f.slug} » invalide (minuscules, chiffres et tirets)`)
      if (slugsFiches.has(f.slug)) erreur(`${ou} : slug « ${f.slug} » déjà pris par une autre fiche`)
      slugsFiches.add(f.slug)
    }
    if (!niv) erreur(`${ou} : niveau absent de l'exercice`)
    else if (!niv.competences.includes(f.competence)) erreur(`${ou} : « ${f.competence} » n'est pas une compétence de ${f.niveau} (${niv.competences.join(', ')})`)
    verifierClassesEtLangues(f, ou, niveaux, erreur)
    for (const [cle, v] of Object.entries(f.reglages)) {
      if (v === undefined) continue
      const offertes = niv?.options?.[cle] ?? options[cle]
      if (offertes) {
        for (const x of Array.isArray(v) ? v : [v]) if (!offertes.includes(x)) erreur(`${ou} : ${cle} = « ${x} » n'est pas proposé (${JSON.stringify(offertes)})`)
        continue
      }
      // un réglage sans choix (texte ou nombre libre) : il doit exister, et garder le type de son défaut
      const defaut = niv?.reglages[cle] ?? reglages[cle]
      if (defaut === undefined) erreur(`${ou} : réglage « ${cle} » inconnu`)
      else if (typeof v !== typeof defaut) erreur(`${ou} : ${cle} doit être de type ${typeof defaut}, comme son défaut`)
    }
  }

  // les types de ReglagesDe décrivent ce que les contrôles ci-dessus viennent de vérifier : un seul point de conversion
  return {
    id: spec.id, route: spec.route, domaine: spec.domaine, emoji: spec.emoji, contenu: spec.contenu ?? 'interface', jeu: spec.jeu ?? true, niveauDefaut,
    aleatoire: spec.aleatoire ?? true, bilanParClasse: spec.bilanParClasse ?? true, corrige: spec.corrige ?? true,
    reglages, options, niveaux, fiches,
  } as unknown as DefinitionTypee<ReglagesDe<C, N>>
}

const FORME_LANGUE = /^[a-z]{2,3}$/

/** Les classes d'une fiche pour plusieurs classes (des niveaux de l'exercice, dont le sien), ses compétences explicites et ses langues. */
function verifierClassesEtLangues(f: FicheExercice, ou: string, niveaux: DefinitionExercice['niveaux'], erreur: (m: string) => never): void {
  if (f.classes !== undefined) {
    if (!f.classes.length) erreur(`${ou} : classes vides (sans \`classes\`, la fiche est pour son seul niveau)`)
    if (!f.classes.includes(f.niveau)) erreur(`${ou} : classes ${f.classes.join(', ')} sans son niveau ${f.niveau}`)
    for (const c of f.classes) if (!niveaux[c]) erreur(`${ou} : classe ${c} absente des niveaux de l'exercice`)
  }
  if (f.competences !== undefined) {
    const auProgramme = (f.classes ?? [f.niveau]).flatMap(c => niveaux[c]?.competences ?? [])
    for (const k of f.competences) if (!auProgramme.includes(k)) erreur(`${ou} : « ${k} » n'est une compétence d'aucune de ses classes`)
  }
  if (f.langues !== undefined) {
    if (!f.langues.length) erreur(`${ou} : langues vides`)
    for (const l of f.langues) if (!FORME_LANGUE.test(l)) erreur(`${ou} : langue « ${l} » invalide (un code : fr, br)`)
  }
}

/**
 * Les compétences d'une fiche publiée : la sienne ; pour une fiche de plusieurs classes, toutes celles de l'exercice au programme
 * d'au moins une de ses classes (une fiche d'écriture « GS · CP · CE1 » : le geste d'écriture de GS, la cursive et la copie).
 */
export function competencesDeFiche(definition: DefinitionExercice, fiche: FicheExercice): CompetenceId[] {
  if (fiche.competences) return [...fiche.competences]
  if (!fiche.classes) return [fiche.competence]
  const toutes = fiche.classes.flatMap(c => definition.niveaux[c]?.competences ?? [])
  return [...new Set([fiche.competence, ...toutes])]
}
