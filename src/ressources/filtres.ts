// Filtres et regroupements du catalogue : purs, sans état, lisibles par node. Aucun ne modifie ses arguments ; l'ordre d'entrée
// est toujours l'ordre de sortie (pas de tri caché), sauf `grouperParDomaine` (ordre du programme) et `voisines` (par proximité).
import { CYCLE_DE } from '../data/classes.ts'
import { DOMAINES, DOMAINES_EXEMPLE, COMPETENCES, COMPETENCES_EXEMPLE, competenceDe } from '../data/programme.ts'
import type { Domaine } from '../data/programme.ts'
import { LANGUE_SOURCE } from '../langues/registre.ts'
import type { Mode } from '../contexte/types.ts'
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

/** Un domaine de la page d'une matière. */
export interface GroupeDomaine {
  readonly domaine: DomaineId
  /** les ressources du domaine pour les classes choisies, dans l'ordre du catalogue */
  readonly ressources: readonly RessourceDeContenu[]
  /** `ressources` à apprendre (affiches, leçons) */
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
export function grouperParDomaine(ressources: readonly RessourceDeContenu[], { matiere, classes }: { matiere: Matiere, classes: readonly Classe[] }): GroupeDomaine[] {
  const deLaMatiere = ressources.filter(r => r.matiere === matiere)
  const dansLaClasse = new Set(filtrerParClasses(deLaMatiere, classes))
  return domainesDe(matiere, classes).map(d => {
    const duDomaine = deLaMatiere.filter(r => r.domaine === d.id)
    const choisies = duDomaine.filter(r => dansLaClasse.has(r))
    return {
      domaine: d.id as DomaineId, ressources: choisies,
      apprendre: choisies.filter(r => r.usage === 'apprendre'), sentrainer: choisies.filter(r => r.usage === 'sentrainer'),
      horsClasse: duDomaine.length - choisies.length, replie: choisies.length === 0,
    }
  })
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
 * dans l'ordre du programme. Vide pour une compétence inconnue.
 */
export function competencesVoisines(competence: CompetenceId): CompetenceId[] {
  const k = competenceDe(competence)
  if (!k) return []
  const communes = (niveaux: readonly Classe[]): number => niveaux.filter(n => k.niveaux.includes(n)).length
  return [...COMPETENCES, ...COMPETENCES_EXEMPLE]
    .filter(autre => autre.domaine === k.domaine && autre.id !== k.id)
    .sort((a, b) => communes(b.niveaux) - communes(a.niveaux))
    .map(autre => autre.id as CompetenceId)
}
