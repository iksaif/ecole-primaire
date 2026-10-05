import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { creerRng, graineAleatoire } from '../utils/hasard.js'

// Graine du hasard d'une fiche (plan 10, principe 3) : celle du lien (?graine=N, avant ou après le #), sinon une
// graine tirée au chargement et gardée ; « 🎲 Nouvelle fiche » en tire une autre (nouvelle()).
//
// rngFiche() donne le flux de hasard de la graine courante. Il continue d'une fiche à l'autre tant que la graine ne
// change pas (réglage modifié → fiche suivante du même flux) : c'est ce que faisait le Math.random à graine du build,
// et les fiches prégénérées publiées restent ainsi identiques. Même graine et mêmes clics → même fiche.
export function useGraine() {
  const route = useRoute()
  const lue = Number(new URLSearchParams(window.location.search).get('graine') ?? route.query.graine)
  const graine = ref(Number.isInteger(lue) && lue > 0 ? lue : graineAleatoire())
  let flux = null, fluxDe = null
  function rngFiche() {
    if (fluxDe !== graine.value) { flux = creerRng(graine.value); fluxDe = graine.value }
    return flux
  }
  return { graine, nouvelle: () => { graine.value = graineAleatoire() }, rngFiche }
}
