// Filtres et regroupements du catalogue : purs, sans état, lisibles par node. Aucun ne modifie ses arguments ; l'ordre d'entrée
// est toujours l'ordre de sortie (pas de tri caché), sauf `grouperParDomaine` (ordre du programme) et `voisines` (par proximité).
import { CYCLE_DE } from '../data/classes.ts'
import { DOMAINES, DOMAINES_EXEMPLE, COMPETENCES, COMPETENCES_EXEMPLE, competenceDe } from '../data/programme.ts'
import type { Domaine } from '../data/programme.ts'
import { LANGUE_SOURCE } from '../langues/registre.ts'
import type { Mode } from '../contexte/types.ts'
import { assezSure } from '../langues/confiance.ts'
import type { NiveauConfiance } from '../langues/confiance.ts'
import type { Classe, CompetenceId, DomaineId, Langue, Matiere, RessourceDeContenu } from './types.ts'

/** Les domaines du programme (ceux des exemples en développement), dans l'ordre du programme. */
const DOMAINES_LISTE: readonly Domaine[] = [...DOMAINES, ...DOMAINES_EXEMPLE]

/** Une ressource d'une des classes données : union des classes, une ressource multi-classes une seule fois. Aucune classe : toutes. */
export function filtrerParClasses<T extends { readonly classes: readonly Classe[] }>(ressources: readonly T[], classes: readonly Classe[]): T[] {
  return classes.length ? ressources.filter(r => r.classes.some(c => classes.includes(c))) : [...ressources]
}

/**
 * Les langues qu'un mode permet d'utiliser : français seul (`fr`), français et langue régionale (`bilingue`), langue régionale
 * seule (`regionale`). Sans langue régionale active, le mode se comporte comme `fr`.
 */
export function languesUtilisables(mode: Mode, regionale: Langue | null): readonly Langue[] {
  if (!regionale || mode === 'fr') return [LANGUE_SOURCE]
  return mode === 'bilingue' ? [LANGUE_SOURCE, regionale] : [regionale]
}

/** Les ressources qui ont au moins une langue utilisable dans ce mode. */
export function filtrerParMode<T extends { readonly langues: readonly Langue[] }>(ressources: readonly T[], mode: Mode, regionale: Langue | null): T[] {
  const utilisables = languesUtilisables(mode, regionale)
  return ressources.filter(r => r.langues.some(l => utilisables.includes(l)))
}

/**
 * La traduction de la ressource est-elle assez sûre pour le seuil ? Seulement si le mode MONTRE la langue régionale de la ressource : en français
 * seul, une ressource traduite en breton reste là, sa traduction n'étant pas lue. Sans seuil, tout passe. Même règle pour les ressources du
 * catalogue et pour les entrées de l'index des fiches (qui portent `langues` et `confiance`).
 */
export function traductionAssezSure(r: AvecTraduction, mode: Mode, regionale: Langue | null, seuil: number | undefined): boolean {
  return !traductionMontree(r, mode, regionale) || assezSure(r.confiance, seuil)
}

/** Ce que la règle lit d'une ressource ou d'une entrée de fiche : ses langues et la confiance dans sa traduction. */
export interface AvecTraduction { readonly langues: readonly string[], readonly confiance?: NiveauConfiance | null }

/** Le mode montre-t-il une langue régionale de cette ressource ? (français seul : non) */
export function traductionMontree(r: AvecTraduction, mode: Mode, regionale: Langue | null): boolean {
  const utilisables: readonly string[] = languesUtilisables(mode, regionale)
  return r.langues.some(l => l !== LANGUE_SOURCE && utilisables.includes(l))
}

/**
 * Le groupe des ressources qui touchent plusieurs domaines de la matière (le quiz du Monde : êtres vivants, matière, géographie,
 * histoire…) : il passe avant les domaines du programme, et ces ressources ne sont pas rangées dans un domaine en particulier. Ce n'est
 * pas un domaine du programme (src/data/programme.ts fait foi) : seulement une place sur la page.
 */
export const PLUSIEURS_DOMAINES = 'plusieurs-domaines'
/** À partir de combien de domaines de la matière une ressource va dans ce groupe. */
const SEUIL_PLUSIEURS = 3

/** Les domaines (de la matière) que travaillent les compétences d'une ressource. */
function domainesTravailles(r: RessourceDeContenu, matiere: Matiere): Set<string> {
  const ids = r.competences.flatMap(k => competenceDe(k)?.domaine ?? [])
  return new Set(ids.filter(id => DOMAINES_LISTE.find(d => d.id === id)?.matiere === matiere))
}
/** Une ressource de plusieurs domaines de la matière (au moins SEUIL_PLUSIEURS). */
export const dePlusieursDomaines = (r: RessourceDeContenu, matiere: Matiere): boolean => domainesTravailles(r, matiere).size >= SEUIL_PLUSIEURS

/** Un domaine de la page d'une matière (ou le groupe PLUSIEURS_DOMAINES). */
export interface GroupeDomaine {
  readonly domaine: DomaineId | typeof PLUSIEURS_DOMAINES
  /** les ressources du domaine pour les classes choisies, dans l'ordre du catalogue */
  readonly ressources: readonly RessourceDeContenu[]
  /** `ressources` à afficher (les affiches) */
  readonly apprendre: readonly RessourceDeContenu[]
  /** `ressources` pour s'entraîner (exercices, fiches) */
  readonly sentrainer: readonly RessourceDeContenu[]
  /** ressources du domaine qui existent pour d'autres classes seulement : le domaine n'est pas masqué, on les annonce */
  readonly horsClasse: number
  /** proposé replié : aucune ressource pour les classes choisies (le lecteur peut l'ouvrir) */
  readonly replie: boolean
}

/** Les domaines d'une matière au programme des classes choisies (aucune classe : de tous les cycles), dans l'ordre du programme. */
export function domainesDe(matiere: Matiere, classes: readonly Classe[]): readonly Domaine[] {
  const cycles = classes.map(c => CYCLE_DE[c])
  return DOMAINES_LISTE.filter(d => d.matiere === matiere && (!cycles.length || d.cycles.some(c => cycles.includes(c))))
}

/**
 * La page d'une matière : un groupe par domaine du programme de la matière aux cycles des classes choisies (jamais inventés :
 * au cycle 1 le français n'a pas Vocabulaire ni Grammaire), dans l'ordre du programme, même sans ressource. Une ressource est
 * dans le groupe de son domaine ; pour les classes choisies (`ressources`) ou hors classe (comptée dans `horsClasse`). Chaque
 * ressource de la matière et d'un domaine listé est donc comptée une fois : `ressources.length + horsClasse`.
 */
/**
 * Une ressource est-elle dans ce domaine ? Celui de son domaine principal ; pour la langue régionale, celui de chacune de ses compétences
 * de cette matière : l'alphabet (domaine principal : lecture) entre aussi dans « les sons et les lettres » du breton, parce qu'en breton
 * il montre l'alphabet breton.
 */
function estDuDomaine(r: RessourceDeContenu, domaine: Domaine): boolean {
  if (r.domaine === domaine.id) return true
  return domaine.matiere === 'regionale' && r.competences.some(k => competenceDe(k)?.domaine === domaine.id)
}

export function grouperParDomaine(ressources: readonly RessourceDeContenu[], { matiere, classes }: { matiere: Matiere, classes: readonly Classe[] }): GroupeDomaine[] {
  const domaines = domainesDe(matiere, classes)
  const deLaMatiere = ressources.filter(r => r.matiere === matiere || domaines.some(d => estDuDomaine(r, d)))
  const dansLaClasse = new Set(filtrerParClasses(deLaMatiere, classes))
  /**
   * Pour les classes choisies ? Ses classes à elle ; dans un domaine de la langue régionale, les classes de ses compétences de ce domaine
   * (l'affiche des nombres va jusqu'au CE2, mais les nombres en breton s'arrêtent au CE1 dans le référentiel).
   */
  const pourLesClasses = (r: RessourceDeContenu, domaine: GroupeDomaine['domaine']): boolean => {
    if (!dansLaClasse.has(r)) return false
    const d = DOMAINES_LISTE.find(x => x.id === domaine)
    if (d?.matiere !== 'regionale' || !classes.length) return true
    const niveaux = r.competences.flatMap(k => (competenceDe(k)?.domaine === d.id ? competenceDe(k)?.niveaux ?? [] : []))
    return niveaux.some(n => classes.includes(n))
  }
  const groupe = (domaine: GroupeDomaine['domaine'], liste: readonly RessourceDeContenu[]): GroupeDomaine => {
    const choisies = liste.filter(r => pourLesClasses(r, domaine))
    return {
      domaine, ressources: choisies,
      apprendre: choisies.filter(r => r.usage === 'apprendre'), sentrainer: choisies.filter(r => r.usage === 'sentrainer'),
      horsClasse: liste.length - choisies.length, replie: choisies.length === 0,
    }
  }
  const transversales = deLaMatiere.filter(r => dePlusieursDomaines(r, matiere))
  const parDomaine = domaines.map(d => groupe(d.id as DomaineId, deLaMatiere.filter(r => estDuDomaine(r, d) && !transversales.includes(r))))
  // le groupe « plusieurs domaines » n'existe que s'il a des ressources pour les classes choisies (il n'est jamais « à venir » ni replié)
  const plusieurs = groupe(PLUSIEURS_DOMAINES, transversales)
  return plusieurs.ressources.length ? [plusieurs, ...parDomaine] : parDomaine
}

/** Les ressources du catalogue qui travaillent une compétence. */
export const ressourcesDeCompetence = <T extends { readonly competences: readonly CompetenceId[] }>(catalogue: readonly T[], competence: CompetenceId): T[] =>
  catalogue.filter(r => r.competences.includes(competence))

/**
 * Les ressources proches d'une ressource, sans elle : d'abord celles qui travaillent la même compétence (les plus de
 * compétences en commun d'abord), puis celles du même domaine ; ordre du catalogue à égalité. La classe n'entre pas en compte :
 * le lecteur y trouve aussi le même exercice dans d'autres classes. `limite` : nombre maximal rendu.
 */
export function voisines<T extends RessourceDeContenu>(ressource: T, catalogue: readonly T[], limite = Infinity): T[] {
  const communes = (r: T): number => r.competences.filter(k => ressource.competences.includes(k)).length
  const autres = catalogue.filter(r => r.id !== ressource.id)
  const memeCompetence = autres.filter(r => communes(r) > 0).sort((a, b) => communes(b) - communes(a))   // tri stable
  const memeDomaine = autres.filter(r => communes(r) === 0 && r.domaine === ressource.domaine)
  return [...memeCompetence, ...memeDomaine].slice(0, limite)
}

/**
 * Les compétences proches d'une compétence, sans elle : celles du même domaine, les plus de classes en commun d'abord, puis
 * dans l'ordre du programme, au plus `limite`. Vide pour une compétence inconnue.
 */
export function competencesVoisines(competence: CompetenceId, limite = Infinity): CompetenceId[] {
  const k = competenceDe(competence)
  if (!k) return []
  const communes = (niveaux: readonly Classe[]): number => niveaux.filter(n => k.niveaux.includes(n)).length
  return [...COMPETENCES, ...COMPETENCES_EXEMPLE]
    .filter(autre => autre.domaine === k.domaine && autre.id !== k.id)
    .sort((a, b) => communes(b.niveaux) - communes(a.niveaux))
    .map(autre => autre.id as CompetenceId)
    .slice(0, limite)
}
