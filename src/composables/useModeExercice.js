// @deprecated — remplacé par src/noyau/useFicheExercice.ts (useModeExercice), à supprimer avec le dernier exercice migré (plan 10)
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

// Mode d'une page d'exercice : 'jouer' (faire l'exercice à l'écran) ou 'imprimer' (fiche papier).
// Porté par l'URL (?mode=imprimer) : la page « À imprimer » y mène directement, et changer de
// mode garde tous les réglages (ils restent dans la config de la vue).
export function useModeExercice({ imprimable = true } = {}) {
  const route = useRoute()
  const router = useRouter()
  const mode = computed({
    get: () => (imprimable && route.query.mode === 'imprimer' ? 'imprimer' : 'jouer'),
    set: m => router.replace({ query: { ...route.query, mode: m === 'imprimer' ? 'imprimer' : undefined } }),
  })
  // Change à chaque « 🎲 Nouvelle fiche » : à lire dans le computed de la fiche pour la regénérer
  const graine = ref(0)
  return {
    mode,
    graine,
    regenerer: () => { graine.value++ },
    enJeu: computed(() => mode.value === 'jouer'),
    enImpression: computed(() => mode.value === 'imprimer'),
  }
}
