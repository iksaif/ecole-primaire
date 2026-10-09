// Règles du contexte, pures (lisibles par node) : défauts par site, ce qu'un profil permet, migration des anciens réglages.
// `useContexte.ts` les applique à l'état de l'application ; les tests les vérifient sans Vue ni navigateur.
import type { Classe } from '../data/classes.ts'
import type { Langue } from '../langues/registre.ts'
import type { Site } from '../sites.ts'
import { CLASSE_DE_DEPART, normaliserClasses } from './url.ts'
import type { DefautsContexte } from './url.ts'
import { PROFILS } from './types.ts'
import type { Mode, Profil } from './types.ts'

/** Réglages mémorisés sur l'appareil (`null` : jamais choisi, donc le défaut du site). */
export interface Memorise {
  readonly classes: readonly Classe[] | null
  readonly mode: Mode | null
  readonly regionale: Langue | null
  readonly vue: 'cartes' | 'liste' | null
  readonly refs: boolean | null
}

export const MEMORISE_VIDE: Memorise = { classes: null, mode: null, regionale: null, vue: null, refs: null }

/** Profil d'un appareil neuf. */
export const PROFIL_PAR_DEFAUT: Profil = 'parent'

/** Mode de langue d'un site : le breton est actif d'office quand le site en désigne un (skoolik : bilingue), sinon le français. */
export const modeDuSite = (site: Site): Mode => (site.langueRegionale ? 'bilingue' : 'fr')

/**
 * Les défauts d'un site, puis ce que l'appareil a mémorisé par-dessus. `profil` : les références officielles du tableau du
 * programme sont affichées d'office pour un enseignant (et seulement lui) tant qu'il n'a rien choisi.
 */
export function defautsContexte(site: Site, memo: Memorise = MEMORISE_VIDE, profil?: Profil): DefautsContexte {
  const regionales: readonly Langue[] = site.languesRegionales
  const classes = normaliserClasses(memo.classes ?? [])
  const regionale = memo.regionale && regionales.includes(memo.regionale) ? memo.regionale : (site.langueRegionale || null)
  // un site sans langue régionale ne connaît que le français seul, quoi qu'on ait mémorisé
  const mode = regionales.length && memo.mode ? memo.mode : modeDuSite(site)
  return {
    classes: classes.length ? classes : [CLASSE_DE_DEPART],
    mode: regionales.length ? mode : 'fr',
    regionale,
    languesRegionales: regionales,
    vue: memo.vue ?? 'cartes',
    refs: memo.refs ?? profil === 'enseignant',
  }
}

/**
 * Les profils proposés : le mode enseignant est une idée en construction, caché tant que le site ne le propose pas d'office et que
 * l'appareil ne l'a pas activé (adresse spéciale, src/contexte/enseignant.ts).
 */
export const profilsProposes = (enseignantActif: boolean): readonly Profil[] =>
  enseignantActif ? PROFILS : PROFILS.filter(p => p !== 'enseignant')

/** Le profil qui s'applique : un profil « enseignant » mémorisé redevient le profil d'un appareil neuf tant que le mode est caché. */
export const profilEffectif = (memorise: Profil, enseignantActif: boolean): Profil =>
  profilsProposes(enseignantActif).includes(memorise) ? memorise : PROFIL_PAR_DEFAUT

/** Tout profil choisit plusieurs classes (un parent a parfois plusieurs enfants), sauf l'enfant : une seule, verrouillée. */
export const plusieursClasses = (profil: Profil): boolean => profil !== 'enfant'

/**
 * Les classes qu'un profil retient d'une demande : toutes (sans doublon, de PS à CM2) pour un parent ou un enseignant, la
 * dernière demandée pour un enfant. Vide si la demande ne contient aucune classe valide.
 */
export function classesPourProfil(profil: Profil, demandees: readonly unknown[]): Classe[] {
  const valides = normaliserClasses(demandees)
  if (plusieursClasses(profil)) return valides
  const derniere = [...demandees].reverse().find(d => valides.some(c => c === d))
  return valides.filter(c => c === derniere)
}

/** Anciennes clés mémorisées (`classe`, `langue_regionale`) : ce qu'elles disent du contexte. */
export function classesMigrees(classes: unknown, classe: unknown): Classe[] {
  const liste = Array.isArray(classes) ? normaliserClasses(classes) : []
  return liste.length ? liste : normaliserClasses([classe])
}

/** Ancien réglage « langue régionale » : une langue choisie = bilingue, « aucune » = français seul, absent = rien à dire. */
export function modeMigre(ancienneRegionale: unknown): Mode | null {
  if (ancienneRegionale === '') return 'fr'
  return typeof ancienneRegionale === 'string' ? 'bilingue' : null
}
