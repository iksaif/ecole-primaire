// @deprecated — remplacé par src/noyau/useMinuteur.ts, à supprimer avec le dernier exercice migré (plan 10)
// Minuteur à rebours commun (Calcul mental : temps par question ; Tables : chrono d'une minute).
//
//   const minuteur = useMinuteur()
//   minuteur.demarrer(10, { pas: 0.1, surFin: () => … })   // 10 s, mis à jour toutes les 0,1 s ; surFin à 0
//   minuteur.restant.value   // secondes restantes (réactif)     minuteur.arreter()
//
// Un seul compte à rebours à la fois (demarrer relance) ; arrêté tout seul quand la vue est démontée. Le jeu
// (useJeu) ne connaît pas le temps : la vue arrête le minuteur à la réponse et le relance à la question suivante.
import { ref, onUnmounted } from 'vue'

export function useMinuteur() {
  const restant = ref(0)
  let horloge = null
  const arreter = () => { clearInterval(horloge); horloge = null }

  function demarrer(duree, { pas = 1, surFin = null } = {}) {
    arreter()
    restant.value = duree
    horloge = setInterval(() => {
      restant.value = Math.max(0, Math.round((restant.value - pas) * 100) / 100)
      if (restant.value <= 0) { arreter(); surFin?.() }
    }, pas * 1000)
  }

  onUnmounted(arreter)
  return { restant, demarrer, arreter }
}
