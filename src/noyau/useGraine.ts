import { ref } from 'vue'
import type { Ref } from 'vue'
import { useRoute } from 'vue-router'
import { creerRng, graineAleatoire } from '../utils/hasard.ts'
import type { Rng } from '../utils/hasard.ts'

// Graine du hasard d'une fiche : celle du lien (?graine=N, avant ou après le #), sinon une graine tirée au chargement
// et gardée ; « 🎲 Nouvelle fiche » en tire une autre (nouvelle()).
//
// rngFiche() donne le flux de hasard de la graine courante. Il continue d'une fiche à l'autre tant que la graine ne
// change pas (réglage modifié → fiche suivante du même flux) : c'est ce que faisait le Math.random à graine du build,
// et les fiches prégénérées publiées restent ainsi identiques. Même graine et mêmes clics → même fiche.
export function useGraine(): { graine: Ref<number>, nouvelle: () => void, rngFiche: () => Rng } {
  const route = useRoute()
  const lue = Number(new URLSearchParams(window.location.search).get('graine') ?? route.query.graine)
  const graine = ref(Number.isInteger(lue) && lue > 0 ? lue : graineAleatoire())
  let flux: Rng | null = null
  let fluxDe: number | null = null
  function rngFiche(): Rng {
    if (flux === null || fluxDe !== graine.value) { flux = creerRng(graine.value); fluxDe = graine.value }
    return flux
  }
  return { graine, nouvelle: () => { graine.value = graineAleatoire() }, rngFiche }
}
