// Types centraux du noyau (src/noyau/) : la définition d'un exercice, ses questions, réponses et verdicts, et le module
// qu'un exercice exporte. Les identifiants viennent du programme (src/data/programme.ts) : une compétence ou un domaine
// inconnu, ou une classe qui n'existe pas, ne compile pas. Purs : lisibles par node (retrait des types, sans compilation).
//
// Deux mondes coexistent pendant la migration (plan 10) : le noyau (ici, TypeScript) et l'ancien socle
// (src/composables, src/components/ConfigExercice…, JavaScript). Le registre src/exercices/index.js lit les deux
// formats : une définition du noyau a exactement la structure `reglages` / `options` / `bonus` / `horsProgramme`
// de l'ancien format, mais typée.
import type { Classe } from '../data/classes.ts'
import type { CompetenceId, DomaineId, Contraintes } from '../data/programme.ts'
import type { Rng } from '../utils/hasard.ts'
import type { CatalogueContenu } from '../langues/catalogue.ts'

export type { Classe, CompetenceId, DomaineId, Contraintes, Rng }

// ── Réglages ──

/** Valeur d'un réglage : simple, ou liste de valeurs choisies (ids) pour un choix multiple. */
export type ValeurReglage = string | number | boolean | string[] | number[]

/** Valeur proposée pour un réglage à choix (`options`, `bonus`). */
export type ValeurOption = string | number | boolean

/** Réglages d'un exercice (sans `niveau`) : la forme est libre, les valeurs sont simples ou des listes d'ids. */
export type Reglages = { [cle: string]: ValeurReglage }

/** Réglages complets d'un exercice, tels que la vue les lit : ceux de l'exercice et le niveau choisi. */
export type Config<R extends object = Reglages> = R & { niveau: Classe }

/** Élément d'une valeur de réglage : la valeur elle-même, ou chaque élément d'une liste. */
type ElementDe<V> = V extends readonly (infer E)[] ? E : V

/** Valeurs proposées pour chaque réglage à choix : choix multiple si le défaut est une liste, choix unique sinon. */
export type OptionsDe<R extends object> = { [K in keyof R]?: readonly ElementDe<R[K]>[] }

// ── Définition ──

/**
 * Un niveau d'un exercice. Les réglages par défaut restent dans le programme du niveau ; ce qui en sort est déclaré :
 * `bonus` (proposé, jamais par défaut, affiché « bonus ») ou `horsProgramme` (avec la raison).
 */
export interface NiveauExercice<R extends object = Reglages> {
  /** compétences de src/data/programme.ts, au programme du niveau */
  competences: readonly CompetenceId[]
  /** réglages par défaut du niveau (s'ajoutent à ceux de l'exercice) */
  reglages: Partial<R>
  /** valeurs proposées pour chaque réglage à choix (les options du niveau l'emportent sur celles de l'exercice) */
  options?: OptionsDe<R>
  /** valeurs proposées hors programme (sous-ensemble de `options`), jamais par défaut */
  bonus?: OptionsDe<R>
  /** écarts assumés au programme, avec leur raison : une valeur de réglage (affichée « hors programme ») ou une compétence */
  horsProgramme?: readonly (EcartValeur | EcartCompetence)[]
}

/** Une valeur de réglage proposée hors programme du niveau, avec la raison (infobulle). */
export interface EcartValeur { reglage: string, option: ValeurOption, raison: string }

/** Une compétence travaillée malgré le programme du niveau, avec la raison. Jamais un `option` : c'est une compétence, pas une valeur. */
export interface EcartCompetence { competence: CompetenceId, raison: string }

/**
 * Fiche prégénérée par compétence (pages /telechargements/exercices-<id>-<niveau>-<fiche>/). Le bilan d'une classe
 * n'est pas listé : ce sont les réglages par défaut du niveau.
 */
export interface FicheExercice<R extends object = Reglages> {
  /** partie du slug publié (ne change pas) */
  id: string
  /**
   * Slug publié en français à la place de `exercices-<id>-<niveau>-<fiche>` : pour une fiche qui existait avant sous un autre
   * nom (`fiche-complements-a-10`) et dont l'adresse ne doit pas changer. Unique parmi tous les exercices (le build le vérifie).
   */
  slug?: string
  competence: CompetenceId
  niveau: Classe
  /** réglages qui s'ajoutent à ceux du niveau */
  reglages: Partial<R>
}

/** Définition d'un exercice : la seule déclaration de ses niveaux, compétences et fiches. R : la forme de ses réglages. */
export interface DefinitionExercice<R extends object = Reglages> {
  id: string
  /** route de l'app (« /maths/heure ») */
  route: string
  domaine: DomaineId
  /** langue du contenu : 'fr' pour un exercice de français (toujours en français), sinon celle de l'interface */
  contenu: 'fr' | 'interface'
  /**
   * Mode en ligne : `true` (défaut, absent = vrai) : l'exercice se joue à l'écran (questions, `verifier`) ET s'imprime ;
   * `false` : exercice « fiche seule » (écriture sur lignes Seyès, calcul en mode fiche) : pas d'onglet « Jouer », pas de
   * `questions` ni de `verifier`, la définition ne décrit que des niveaux, des réglages et des fiches. Un seul genre : un exercice.
   */
  jeu?: boolean
  niveauDefaut: Classe
  /** réglages communs à tous les niveaux (défauts) */
  reglages?: Partial<R>
  /** valeurs proposées pour un réglage commun à choix (ex. `nbQ: [5, 10, 15]`) */
  options?: OptionsDe<R>
  niveaux: Partial<Record<Classe, NiveauExercice<R>>>
  fiches: readonly FicheExercice<R>[]
}

// ── Questions, réponses, verdicts ──

/** Verdict de `verifier` : un booléen, ou { ok, nuance } (nuance : remarque sur une réponse presque juste, ex. 'accents'). */
export type Verdict = boolean | { ok: boolean, nuance?: string | null }

/** Verdict normalisé (voir lireVerdict dans reglages.ts). */
export interface VerdictLu { ok: boolean, nuance: string | null }

/**
 * T(cle, params) : texte de l'exercice dans la langue du contenu (textes.ts). Rend toujours une chaîne.
 * `Cle` : les clés permises. Un exercice la précise d'après son catalogue (`CleContenu<typeof CONTENU>`, langues/catalogue.ts) :
 * une clé inconnue ne compile pas.
 */
export type Traducteur<Cle extends string = string> = (cle: Cle, params?: Record<string, unknown>) => string

/** Arguments de `questions` et `questionsFiche`. */
export interface ParamsGenerateur<R extends object = Reglages, Cle extends string = string> {
  niveau: Classe
  reglages: Config<R>
  rng: Rng
  T: Traducteur<Cle>
  /** nombre de questions voulu, quand l'exercice le laisse choisir (réglage nbQ) ; ignoré par un exercice à partie fixe */
  nb?: number
}

/**
 * Ce que le générateur d'un exercice « fiche seule » (`definition.jeu === false`) exporte : seulement de quoi tirer la fiche.
 * Pur, lisible par node (aucun import de Vue, aucun Math.random). F : ce que tire la fiche (fiche.ts la met en page) : des
 * questions, ou autre chose (lignes à tracer, liste de mots…).
 */
export interface GenerateurFicheSeule<R extends object = Reglages, F = unknown> {
  /** tout ce que tire la fiche imprimable (fiche.ts la met en page) */
  questionsFiche: (p: Omit<ParamsGenerateur<R>, 'nb'>) => F
  /** ce qui sort du programme du niveau, [] si tout y est (tests) */
  ecartsAuProgramme: (tirage: F, contraintes: Contraintes) => string[]
  /** ce que le HTML de la fiche montre hors programme (tests) */
  ecartsFiche?: (html: string, contraintes: Contraintes) => string[]
  /** ce que le programme du niveau demande et que « tout au programme » ne propose pas (tests) */
  manquesAuProgramme?: (reglages: Config<R>, contraintes: Contraintes) => string[]
}

/**
 * Ce que le générateur d'un exercice qui se joue exporte, en plus de la fiche : pur, lisible par node.
 * Q : une question ; Rep : la réponse de l'élève, dans la forme attendue par `verifier` ; F : ce que tire la fiche.
 */
export interface Generateur<Q, Rep, R extends object = Reglages, F = Q[]> extends Omit<GenerateurFicheSeule<R, F>, 'ecartsAuProgramme'> {
  /** questions de l'exercice à l'écran */
  questions: (p: ParamsGenerateur<R>) => Q[]
  /** la réponse est-elle juste ? */
  verifier: (q: Q, rep: Rep) => Verdict
  /** ce qui sort du programme du niveau, [] si tout y est (tests) : appelé sur les questions et sur le tirage de la fiche */
  ecartsAuProgramme: (questions: Q[], contraintes: Contraintes) => string[]
  /** une réponse juste, que `verifier` doit accepter (tests) */
  bonneReponse?: (q: Q) => Rep
  /** une réponse fausse, que `verifier` doit refuser (tests : un `verifier` toujours vrai passerait sinon) */
  mauvaiseReponse?: (q: Q) => Rep
}

/** Ce que reçoit la mise en page d'une fiche. */
export interface ParamsFiche<R extends object = Reglages, F = unknown, Cle extends string = string> {
  questions: F
  reglages: Config<R>
  T: Traducteur<Cle>
  /** langue du contenu (attribut lang de la fiche) */
  langue: string
  /** familles CSS du texte et @font-face à embarquer (usePoliceFiche) */
  police?: string
  cssPolices?: string
}

/**
 * Catalogue de CONTENU d'un exercice (consignes de fiche, énoncés), lu par T : `catalogue(…)` de src/langues/catalogue.ts.
 * Les textes de l'interface ne sont pas là : ils sont dans les sections de src/langues/<langue>/textes/.
 */
export type TextesExercice = CatalogueContenu

/**
 * Un exercice : sa définition et ses trois modules. Le registre (src/exercices/index.ts) le lit tel quel. Un exercice
 * « fiche seule » (`definition.jeu === false`) n'a qu'un `GenerateurFicheSeule` (ni `questions`, ni `verifier`) ;
 * `aUnJeu(definition)` (reglages.ts) et `'questions' in generateur` le distinguent.
 */
export interface ModuleExercice<Q = unknown, Rep = unknown, R extends object = Reglages, F = Q[]> {
  definition: DefinitionExercice<R>
  generateur: Generateur<Q, Rep, R, F> | GenerateurFicheSeule<R, F>
  fiche: { fiche: (p: ParamsFiche<R, F>) => string }
  textes: TextesExercice
}
