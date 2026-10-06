// Accessibilité de la navigation : à chaque changement de page, le focus va au <main id="contenu"> (le lecteur d'écran annonce
// la nouvelle page). Pas au chargement initial, ni quand seuls les paramètres changent (contexte, filtres : même page).
import { nextTick } from 'vue'
import { START_LOCATION } from 'vue-router'
import type { Router } from 'vue-router'

export const ID_CONTENU = 'contenu'

/** Met le focus sur le contenu principal (sans faire défiler la page). */
export const focaliserContenu = (): void => { document.getElementById(ID_CONTENU)?.focus({ preventScroll: true }) }

export function installerFocus(router: Router): void {
  router.afterEach((to, from, echec) => {
    if (echec || from === START_LOCATION || to.path === from.path) return
    void nextTick(focaliserContenu)
  })
}
