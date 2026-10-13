// Les onglets que les extensions actives ajoutent à la page d'un exercice. `ongletsDe` est pur (lisible par node) ; `useOnglets` lit l'exercice de la route (`meta.exercice`) et l'onglet ouvert (`?mode=<id>`).
import { computed } from 'vue'
import type { ComputedRef } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { extensionsActives } from './activation.ts'
import type { Extension, OngletExercice } from './types.ts'

/** Un onglet d'extension, avec l'extension qui l'apporte. */
export interface OngletDeExtension extends OngletExercice { extension: string }

/** Les onglets des extensions données pour cet exercice (dans l'ordre des extensions). */
export function ongletsDe(extensions: readonly Extension[], exercice: string): OngletDeExtension[] {
  return extensions.flatMap(e => (e.onglets ?? []).filter(o => o.pour(exercice)).map(o => ({ ...o, extension: e.id })))
}

export function useOnglets(): { onglets: ComputedRef<OngletDeExtension[]>, courant: ComputedRef<OngletDeExtension | null>, exercice: ComputedRef<string>, ouvrir: (id: string) => void } {
  const route = useRoute()
  const router = useRouter()
  const exercice = computed(() => (typeof route.meta.exercice === 'string' ? route.meta.exercice : ''))
  const onglets = computed(() => (exercice.value ? ongletsDe(extensionsActives.value, exercice.value) : []))
  const courant = computed(() => onglets.value.find(o => o.id === route.query.mode) ?? null)
  const ouvrir = (id: string): void => { void router.replace({ query: { ...route.query, mode: id } }) }
  return { onglets, courant, exercice, ouvrir }
}
