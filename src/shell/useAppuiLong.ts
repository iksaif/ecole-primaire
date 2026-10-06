// Appui long : la progression (0 à 1) monte pendant que le geste est tenu ; relâcher avant la fin la remet à zéro, la fin
// appelle `fin()` une seule fois. Sert au cadenas de la classe de l'enfant (2 s). Le temps est mesuré sur l'horloge (pas sur
// le nombre d'images : un onglet ralenti ne rallonge pas le geste).
import { onUnmounted, ref } from 'vue'

export interface Evenements {
  /** le geste commence (annonce) */
  debut?: () => void
  /** le geste s'arrête avant la fin */
  abandon?: () => void
  /** la durée est atteinte */
  fin: () => void
}

export function useAppuiLong(dureeMs: number, evenements: Evenements) {
  const progression = ref(0)
  const actif = ref(false)
  let image = 0
  let depart = 0

  const pas = (): void => {
    progression.value = Math.min(1, (performance.now() - depart) / dureeMs)
    if (progression.value >= 1) {
      actif.value = false
      evenements.fin()
      return
    }
    image = requestAnimationFrame(pas)
  }
  const demarrer = (): void => {
    if (actif.value) return
    actif.value = true
    depart = performance.now()
    progression.value = 0
    evenements.debut?.()
    image = requestAnimationFrame(pas)
  }
  const arreter = (): void => {
    if (!actif.value) return
    cancelAnimationFrame(image)
    actif.value = false
    progression.value = 0
    evenements.abandon?.()
  }
  onUnmounted(() => cancelAnimationFrame(image))
  return { progression, actif, demarrer, arreter }
}
