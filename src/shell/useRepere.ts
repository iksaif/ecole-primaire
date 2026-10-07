// Position d'un repère de la barre du haut (`data-repere`), pour que l'assistant l'entoure d'un halo et place sa bulle
// juste en dessous, la pointe sous le repère. Recalculée au redimensionnement et au défilement (la barre est collante :
// elle reste en haut, mais sa hauteur change d'une largeur à l'autre).
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import type { ComputedRef, Ref } from 'vue'
import type { Repere } from './assistant.ts'

/** Rectangle d'un repère à l'écran (pixels de la fenêtre). */
export interface Cadre {
  readonly haut: number
  readonly gauche: number
  readonly largeur: number
  readonly hauteur: number
}

/** Placement de la bulle sous le repère. */
export interface PlacementBulle {
  readonly haut: number
  readonly gauche: number
  readonly largeur: number
  /** abscisse de la pointe, depuis le bord gauche de la bulle */
  readonly pointe: number
}

const MARGE = 16
const LARGEUR_BULLE = 440
const ECART_POINTE = 14

/** Un élément visible : affiché (pas `display: none`) et de taille non nulle. */
function estVisible(el: Element): boolean {
  const r = el.getBoundingClientRect()
  return r.width > 0 && r.height > 0
}

/** Le premier repère visible de la liste, et son élément. */
function premierVisible(reperes: readonly Repere[]): { repere: Repere, el: Element } | null {
  for (const repere of reperes) {
    const el = document.querySelector(`[data-repere="${repere}"]`)
    if (el && estVisible(el)) return { repere, el }
  }
  return null
}

/** La bulle sous le cadre, dans la fenêtre (marges de 16 px), la pointe au milieu du repère. */
export function placerBulle(cadre: Cadre, largeurFenetre: number): PlacementBulle {
  const largeur = Math.min(LARGEUR_BULLE, largeurFenetre - 2 * MARGE)
  const milieu = cadre.gauche + cadre.largeur / 2
  const gaucheVoulue = milieu - largeur / 2
  const gauche = Math.min(Math.max(gaucheVoulue, MARGE), largeurFenetre - MARGE - largeur)
  const pointe = Math.min(Math.max(milieu - gauche, 24), largeur - 24)
  return { haut: cadre.haut + cadre.hauteur + ECART_POINTE, gauche, largeur, pointe }
}

export interface UtilisationRepere {
  /** le repère montré (le premier visible de la liste), ou `null` : aucun, la fenêtre est centrée */
  repere: Ref<Repere | null>
  cadre: Ref<Cadre | null>
  bulle: ComputedRef<PlacementBulle | null>
}

export function useRepere(reperes: Ref<readonly Repere[]>): UtilisationRepere {
  const repere = ref<Repere | null>(null)
  const cadre = ref<Cadre | null>(null)
  const largeurFenetre = ref(typeof innerWidth === 'number' ? innerWidth : 1280)

  // le repère change de taille (« CE1 » devient « CE1 + CE2 ») : mesurer à nouveau
  const observateur = typeof ResizeObserver === 'function' ? new ResizeObserver(() => { mesurer() }) : null
  let observe: Element | null = null
  const suivre = (el: Element | null): void => {
    if (el === observe) return
    if (observe) observateur?.unobserve(observe)
    if (el) observateur?.observe(el)
    observe = el
  }

  const mesurer = (): void => {
    largeurFenetre.value = innerWidth
    const trouve = premierVisible(reperes.value)
    suivre(trouve?.el ?? null)
    repere.value = trouve?.repere ?? null
    if (!trouve) { cadre.value = null; return }
    const r = trouve.el.getBoundingClientRect()
    cadre.value = { haut: r.top, gauche: r.left, largeur: r.width, hauteur: r.height }
  }
  // l'étape change (ou le profil, qui ajoute « Programme » à la barre) : mesurer après le rendu
  watch(reperes, () => { void nextTick(mesurer) })
  onMounted(() => {
    void nextTick(mesurer)
    addEventListener('resize', mesurer)
    addEventListener('scroll', mesurer, { passive: true })
  })
  onUnmounted(() => {
    removeEventListener('resize', mesurer)
    removeEventListener('scroll', mesurer)
    observateur?.disconnect()
  })
  const bulle = computed(() => (cadre.value ? placerBulle(cadre.value, largeurFenetre.value) : null))
  return { repere, cadre, bulle }
}
