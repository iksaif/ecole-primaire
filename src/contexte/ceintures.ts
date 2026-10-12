// Les ceintures de compétences (plan 15), proposées en option : cachées tant que le site ne les propose pas (`ceinturesVisibles`, src/sites.ts)
// ou que l'appareil ne les a pas activées (case des réglages, ou l'ADRESSE SPÉCIALE `?ceintures=oui`, `?ceintures=non` pour les cacher). Même patron que
// le mode enseignant (contexte/enseignant.ts). Désactivées, rien ne change sur le site. Le réglage est mémorisé sur l'appareil (clé `ceintures_actives`).
import { computed, ref } from 'vue'
import type { ComputedRef } from 'vue'
import type { RouteLocationNormalized, RouteLocationRaw } from 'vue-router'
import { SITE } from '../sites.ts'
import type { Site } from '../sites.ts'
import { charger, sauvegarder } from '../utils/index.js'

/** Le paramètre d'adresse qui active (`oui`) ou désactive (`non`) les ceintures sur l'appareil. */
export const PARAMETRE_CEINTURES = 'ceintures'

const actifSurAppareil = ref(charger('ceintures_actives') === true)

/** Les ceintures sont-elles proposées ? Le site les propose d'office, ou l'appareil les a activées. */
export const ceinturesActives: ComputedRef<boolean> = computed(() => SITE.ceinturesVisibles || actifSurAppareil.value)

/** Variante pour un site donné (tests, scripts) : le réglage de l'appareil s'y ajoute. */
export const ceinturesActivesPour = (site: Site): boolean => site.ceinturesVisibles || actifSurAppareil.value

export function changerCeintures(actif: boolean): void {
  actifSurAppareil.value = actif
  sauvegarder('ceintures_actives', actif)
}

/** Ce que l'adresse demande : activer, désactiver, ou rien (`null`). Seules les valeurs `oui` et `non` comptent. */
export function demandeCeintures(query: Readonly<Record<string, unknown>>): boolean | null {
  const v = query[PARAMETRE_CEINTURES]
  const valeur = Array.isArray(v) ? v[0] : v
  if (valeur === 'oui') return true
  if (valeur === 'non') return false
  return null
}

/** À brancher sur `router.beforeEach` : applique `?ceintures=oui|non`, puis renvoie la même adresse sans ce paramètre (`replace`). */
export function appliquerAdresseCeintures(to: RouteLocationNormalized): RouteLocationRaw | undefined {
  const demande = demandeCeintures(to.query)
  if (demande === null) return undefined
  changerCeintures(demande)
  const reste = { ...to.query }
  delete reste[PARAMETRE_CEINTURES]
  return { path: to.path, query: reste, hash: to.hash, replace: true }
}
