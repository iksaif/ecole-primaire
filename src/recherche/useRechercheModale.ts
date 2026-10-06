// Le comportement de la fenêtre de recherche : focus dans le champ à l'ouverture, Tab piégé dans la fenêtre, Échap qui ferme, page
// du dessous figée, fermeture quand on change de page par un autre chemin (précédent du navigateur). Le focus est rendu à
// l'élément déclencheur par `fermerRecherche` (palette.ts).
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { Ref } from 'vue'
import { useRoute } from 'vue-router'
import { ouvreLaRecherche } from './clavier.ts'
import { fermerRecherche, ouvrirRecherche, rechercheOuverte } from './palette.ts'

const FOCALISABLES = 'input, button, a[href], [tabindex]:not([tabindex="-1"])'

export function useRechercheModale(champ: Ref<HTMLInputElement | null>, fenetre: Ref<HTMLElement | null>) {
  const route = useRoute()
  const defilementAvant = ref('')

  /** Les raccourcis qui ouvrent la palette, écoutés sur toute la page tant que l'application est là. */
  const surFrappe = (e: KeyboardEvent): void => {
    const cible = e.target instanceof HTMLElement ? e.target : null
    if (e.defaultPrevented || !ouvreLaRecherche({ key: e.key, ctrlKey: e.ctrlKey, metaKey: e.metaKey, altKey: e.altKey, target: cible })) return
    e.preventDefault()   // Ctrl+K barre d'adresse (Firefox), « / » recherche rapide
    ouvrirRecherche()
  }
  onMounted(() => window.addEventListener('keydown', surFrappe))
  onBeforeUnmount(() => window.removeEventListener('keydown', surFrappe))

  watch(rechercheOuverte, async ouverte => {
    if (ouverte) {
      defilementAvant.value = document.documentElement.style.overflow
      document.documentElement.style.overflow = 'hidden'
      await nextTick()
      champ.value?.focus()
    } else {
      document.documentElement.style.overflow = defilementAvant.value
    }
  })
  watch(() => route.fullPath, () => fermerRecherche(false))

  /** Échap ferme ; Tab et Maj+Tab bouclent sur les éléments de la fenêtre. */
  const surClavier = (e: KeyboardEvent): void => {
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); fermerRecherche(); return }
    if (e.key !== 'Tab' || !fenetre.value) return
    const elements = [...fenetre.value.querySelectorAll<HTMLElement>(FOCALISABLES)].filter(el => !el.hasAttribute('disabled'))
    const premier = elements[0]
    const dernier = elements[elements.length - 1]
    if (!premier || !dernier) return
    if (e.shiftKey && document.activeElement === premier) { e.preventDefault(); dernier.focus() }
    else if (!e.shiftKey && document.activeElement === dernier) { e.preventDefault(); premier.focus() }
    else if (!fenetre.value.contains(document.activeElement)) { e.preventDefault(); premier.focus() }
  }

  return { surClavier }
}
