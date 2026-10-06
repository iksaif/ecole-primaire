import { ref, watch } from 'vue'
import type { Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { graineAleatoire } from '../utils/hasard.ts'

/** Une graine valide (entier ≥ 1) lue d'un lien (`?graine=12`), sinon null. */
export function lireGraine(valeur: unknown): number | null {
  const v = Array.isArray(valeur) ? valeur[0] : valeur
  const n = typeof v === 'string' && v.trim() !== '' ? Number(v) : typeof v === 'number' ? v : NaN
  return Number.isInteger(n) && n > 0 ? n : null
}

// Graine du hasard d'une fiche. Le tirage est une FONCTION de la graine et des réglages (useFicheExercice recrée un `rng`
// à chaque calcul) : Jouer → Imprimer → Jouer → Imprimer redonne la même fiche, et un lien `?graine=N` aussi.
//   - lecture : `?graine=N` de la route, sinon avant le # (`/?graine=N#/…`, utilisé par le build et les tests), sinon une
//     graine tirée une fois à l'ouverture de la page ;
//   - « Nouvelle fiche » (`nouvelle()`) tire une autre graine et l'écrit dans l'URL (`?graine=N`) : le lien se partage, le
//     rechargement garde la fiche. La graine suit l'URL (retour arrière, lien modifié à la main).
export function useGraine(): { graine: Ref<number>, nouvelle: () => void } {
  const route = useRoute()
  const router = useRouter()
  const avantLeDiese = lireGraine(new URLSearchParams(window.location.search).get('graine'))
  const ouverture = avantLeDiese ?? graineAleatoire()
  const courante = ref(lireGraine(route.query.graine) ?? ouverture)
  watch(() => route.query.graine, v => { const g = lireGraine(v); if (g !== null) courante.value = g })
  function nouvelle() {
    const g = graineAleatoire()
    courante.value = g
    router.replace({ query: { ...route.query, graine: String(g) } })
  }
  return { graine: courante, nouvelle }
}
