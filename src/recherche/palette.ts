// État de la palette de recherche : ouverte ou fermée, et l'élément qui l'a ouverte (le focus lui est rendu à la fermeture).
// La barre appelle `ouvrirRecherche()` depuis son bouton 🔍 ; `Recherche.vue` (monté une fois dans l'application) affiche la
// modale quand `rechercheOuverte` est vrai et installe les raccourcis (Ctrl+K, ⌘K, /).
//   import { ouvrirRecherche, rechercheOuverte } from '../recherche/palette.ts'
//   <button :aria-expanded="rechercheOuverte" aria-haspopup="dialog" @click="ouvrirRecherche()">🔍</button>
import { readonly, ref } from 'vue'

const ouverte = ref(false)
let declencheur: HTMLElement | null = null

/** La palette est affichée (réactif, en lecture seule). */
export const rechercheOuverte = readonly(ouverte)

/** Ouvre la palette ; l'élément qui avait le focus est mémorisé pour le lui rendre à la fermeture. */
export function ouvrirRecherche(): void {
  if (ouverte.value) return
  declencheur = document.activeElement instanceof HTMLElement ? document.activeElement : null
  ouverte.value = true
}

/** Ferme la palette. `rendreLeFocus: false` quand on part vers une autre page (le routeur place le focus sur le contenu). */
export function fermerRecherche(rendreLeFocus = true): void {
  if (!ouverte.value) return
  ouverte.value = false
  const cible = declencheur
  declencheur = null
  if (rendreLeFocus && cible?.isConnected) cible.focus()
}
