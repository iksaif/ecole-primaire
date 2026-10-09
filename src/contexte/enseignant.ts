// Le mode « enseignant », caché par défaut : c'est une idée en construction, pas encore validée avec des enseignants, et ses contenus et ses
// outils demandent une relecture. Il n'est proposé que si le site le décide (`enseignantVisible`, src/sites.ts) ou si l'appareil l'a activé par
// l'ADRESSE SPÉCIALE : n'importe quelle page avec `?enseignant=oui` (désactiver : `?enseignant=non`). Le réglage est mémorisé sur l'appareil
// (clé `enseignant`) ; le paramètre est retiré de l'adresse, et un bandeau le confirme (src/shell/BandeauEnseignant.vue).
// `appliquerAdresseEnseignant` se branche sur le routeur (src/router/index.ts) ; `modeEnseignantActif` est lu par useContexte et les pages.
import { computed, ref } from 'vue'
import type { ComputedRef } from 'vue'
import type { RouteLocationNormalized, RouteLocationRaw } from 'vue-router'
import { SITE } from '../sites.ts'
import type { Site } from '../sites.ts'
import { charger, sauvegarder } from '../utils/index.js'

/** Le paramètre d'adresse qui active (`oui`) ou désactive (`non`) le mode enseignant sur l'appareil. */
export const PARAMETRE_ENSEIGNANT = 'enseignant'

/** L'appareil a activé le mode enseignant (réglage mémorisé). */
const actifSurAppareil = ref(charger('enseignant') === true)

/** Le message à montrer après un changement par l'adresse (`null` : rien). */
export const messageEnseignant = ref<'active' | 'desactive' | null>(null)

/** Le mode enseignant est-il proposé ? Le site le propose d'office, ou l'appareil l'a activé. */
export const modeEnseignantActif: ComputedRef<boolean> = computed(() => SITE.enseignantVisible || actifSurAppareil.value)

/** Variante pour un site donné (tests, scripts) : le réglage de l'appareil s'y ajoute. */
export const enseignantActifPour = (site: Site): boolean => site.enseignantVisible || actifSurAppareil.value

export function changerModeEnseignant(actif: boolean): void {
  actifSurAppareil.value = actif
  sauvegarder('enseignant', actif)
}

/** Ce que l'adresse demande : activer, désactiver, ou rien (`null`). Seules les valeurs `oui` et `non` comptent. */
export function demandeDeLAdresse(query: Readonly<Record<string, unknown>>): boolean | null {
  const v = query[PARAMETRE_ENSEIGNANT]
  const valeur = Array.isArray(v) ? v[0] : v
  if (valeur === 'oui') return true
  if (valeur === 'non') return false
  return null
}

/**
 * À brancher sur `router.beforeEach` : applique `?enseignant=oui|non`, puis renvoie la même adresse sans ce paramètre (`replace`, pas de pile
 * d'historique). Rien pour une adresse sans paramètre ou avec une autre valeur.
 */
export function appliquerAdresseEnseignant(to: RouteLocationNormalized): RouteLocationRaw | undefined {
  const demande = demandeDeLAdresse(to.query)
  if (demande === null) return undefined
  changerModeEnseignant(demande)
  messageEnseignant.value = demande ? 'active' : 'desactive'
  const reste = { ...to.query }
  delete reste[PARAMETRE_ENSEIGNANT]
  return { path: to.path, query: reste, hash: to.hash, replace: true }
}
