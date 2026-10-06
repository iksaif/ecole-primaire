// Liens à partager, purs (lisibles par node) : une adresse absolue qui reconstruit la même vue chez le destinataire.
//   lienPourLesFamilles : la classe et le mode de langue (l'enseignant envoie « la page de ma classe » aux parents) ;
//   lienDuTableau       : tout le contexte (vue, références officielles) pour partager l'état d'un tableau.
// Les paramètres de la page elle-même (graine d'une fiche, filtres d'un tableau) sont conservés ; les valeurs égales aux
// défauts du SITE ne sont pas écrites, la classe l'est toujours (le destinataire n'a pas la même classe mémorisée).
import { SITES } from '../sites.ts'
import type { Site } from '../sites.ts'
import { defautsContexte } from './regles.ts'
import { chaineDeQuery, ecrireContexteDansLAdresse, fusionnerParamsContexte } from './url.ts'
import type { ContexteAdresse, QueryBrute } from './url.ts'

/** La page à partager : son chemin (« /maths ») et ses paramètres propres. */
export interface RoutePartagee {
  readonly path: string
  readonly query?: QueryBrute
}

export interface OptionsPartage {
  /** adresse absolue de la racine de l'app, avec la barre finale (`location.origin + import.meta.env.BASE_URL`) */
  readonly racine: string
  /** le site dont on prend les défauts (par défaut ecoleprimaire) */
  readonly site?: Site
}

function lien(route: RoutePartagee, parametres: Record<string, string>, racine: string): string {
  const query = fusionnerParamsContexte(route.query ?? {}, parametres)
  return `${racine.replace(/\/?$/, '/')}${route.path.replace(/^\//, '')}${chaineDeQuery(query)}`
}

/** Adresse d'une page « pour les familles » : la classe et le mode de langue, sans les préférences d'affichage. */
export function lienPourLesFamilles(route: RoutePartagee, contexte: ContexteAdresse, options: OptionsPartage): string {
  const defauts = { ...defautsContexte(options.site ?? SITES.ecoleprimaire), classes: [] }
  // vue et références sont des préférences d'affichage : leurs défauts sont ceux de l'expéditeur, donc jamais écrits
  return lien(route, ecrireContexteDansLAdresse(contexte, { ...defauts, vue: contexte.vue, refs: contexte.refs }), options.racine)
}

/** Adresse d'un tableau (programme, fiches) tel qu'on le voit : classes, langue, vue, références officielles. */
export function lienDuTableau(route: RoutePartagee, contexte: ContexteAdresse, options: OptionsPartage): string {
  const defauts = { ...defautsContexte(options.site ?? SITES.ecoleprimaire), classes: [] }
  return lien(route, ecrireContexteDansLAdresse(contexte, defauts), options.racine)
}
