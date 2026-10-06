// Un seul menu déroulant de la barre est ouvert à la fois (langue, classe, profil, menu du téléphone).
// `useMenu(id)` donne à chaque sélecteur son état ouvert/fermé et les gestes communs : Échap ferme et rend le focus au bouton,
// un clic ou le focus hors du menu le ferme.
import { computed, onMounted, onUnmounted, ref } from 'vue'

export type MenuId = 'langue' | 'classe' | 'profil' | 'menu'

/** Le menu ouvert, ou `null`. Partagé : en ouvrir un en ferme un autre. */
export const menuOuvert = ref<MenuId | null>(null)

export function useMenu(id: MenuId) {
  const racine = ref<HTMLElement | null>(null)
  const bouton = ref<HTMLElement | null>(null)
  const ouvert = computed(() => menuOuvert.value === id)
  const ouvrir = (): void => { menuOuvert.value = id }
  const fermer = (rendreLeFocus = false): void => {
    if (!ouvert.value) return
    menuOuvert.value = null
    if (rendreLeFocus) bouton.value?.focus()
  }
  const basculer = (): void => { menuOuvert.value = ouvert.value ? null : id }
  const dehors = (e: Event): void => { if (ouvert.value && e.target instanceof Node && !racine.value?.contains(e.target)) menuOuvert.value = null }
  /** à brancher sur `@keydown` de la racine */
  const touche = (e: KeyboardEvent): void => { if (e.key === 'Escape' && ouvert.value) { e.stopPropagation(); fermer(true) } }
  /** à brancher sur `@focusout` de la racine : Tab hors du menu le ferme */
  const sortie = (e: FocusEvent): void => { if (ouvert.value && e.relatedTarget instanceof Node && !racine.value?.contains(e.relatedTarget)) menuOuvert.value = null }
  onMounted(() => document.addEventListener('pointerdown', dehors))
  onUnmounted(() => document.removeEventListener('pointerdown', dehors))
  return { racine, bouton, ouvert, ouvrir, fermer, basculer, touche, sortie }
}
