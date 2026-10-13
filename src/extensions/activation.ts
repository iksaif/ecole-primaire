// L'activation des extensions, en option et cachée par défaut (patron du mode enseignant, contexte/enseignant.ts, rendu générique) : une extension est proposée si le site
// la propose d'office (`extensionsVisibles`, src/sites.ts) ou si l'appareil l'a activée : case dans l'onglet « Appareil » des réglages, ou ADRESSE SPÉCIALE `?<id>=oui`
// (`?<id>=non` pour la cacher). Le réglage de chaque appareil est mémorisé sous la clé `extension_<id>`. Désactivée, une extension ne change rien sur le site.
import { computed, ref } from 'vue'
import type { ComputedRef } from 'vue'
import type { RouteLocationNormalized, RouteLocationRaw } from 'vue-router'
import { SITE } from '../sites.ts'
import type { Site } from '../sites.ts'
import { charger, sauvegarder } from '../utils/index.js'
import { EXTENSIONS, extensionDeRessource } from './registre.ts'
import type { Extension } from './types.ts'

const cle = (id: string): string => `extension_${id.replaceAll('-', '_')}`

/** Les extensions que cet appareil a activées (réglage mémorisé). */
const surAppareil = ref<Record<string, boolean>>(Object.fromEntries(EXTENSIONS.map(e => [e.id, charger(cle(e.id)) === true])))

/** Le site propose-t-il cette extension d'office ? */
export const proposeeParLeSite = (id: string, site: Site = SITE): boolean => site.extensionsVisibles.includes(id)

/** Variante pour un site donné (tests, scripts) : le réglage de l'appareil s'y ajoute. */
export const extensionActivePour = (id: string, site: Site): boolean => proposeeParLeSite(id, site) || surAppareil.value[id] === true

/** L'extension est-elle proposée ? À lire dans un `computed` ou un gabarit : le réglage est réactif. */
export const extensionActive = (id: string): boolean => extensionActivePour(id, SITE)

/** Les extensions proposées (le site les propose, ou l'appareil les a activées). */
export const extensionsActives: ComputedRef<readonly Extension[]> = computed(() => EXTENSIONS.filter(e => extensionActive(e.id)))

export function changerExtension(id: string, actif: boolean): void {
  surAppareil.value = { ...surAppareil.value, [id]: actif }
  sauvegarder(cle(id), actif)
}

/** Une ressource d'une extension est-elle montrée dans les listes ? (toute ressource qui n'est celle d'aucune extension : oui) */
export function ressourceMontree(ressource: string): boolean {
  const e = extensionDeRessource(ressource)
  return !e || extensionActive(e.id)
}

/** Ce que l'adresse demande pour une extension : activer, désactiver, ou rien (`null`). Seules les valeurs `oui` et `non` comptent. */
export function demandeDeLAdresse(query: Readonly<Record<string, unknown>>, id: string): boolean | null {
  const v = query[id]
  const valeur = Array.isArray(v) ? v[0] : v
  if (valeur === 'oui') return true
  if (valeur === 'non') return false
  return null
}

/**
 * À brancher sur `router.beforeEach` : applique `?<id>=oui|non` pour chaque extension, puis renvoie la même adresse sans ces paramètres (`replace`, pas de pile
 * d'historique). Rien pour une adresse sans paramètre d'extension.
 */
export function appliquerAdresseExtensions(to: RouteLocationNormalized): RouteLocationRaw | undefined {
  const demandes = EXTENSIONS.map(e => ({ id: e.id, demande: demandeDeLAdresse(to.query, e.id) })).filter(d => d.demande !== null)
  if (!demandes.length) return undefined
  const reste = { ...to.query }
  for (const { id, demande } of demandes) {
    changerExtension(id, demande === true)
    delete reste[id]
  }
  return { path: to.path, query: reste, hash: to.hash, replace: true }
}
