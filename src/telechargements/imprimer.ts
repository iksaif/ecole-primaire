// Imprimer un PDF de fiche sans le télécharger : un cadre caché (même origine) charge le PDF, puis lance la boîte d'impression
// du navigateur ; rien ne passe par le serveur que le fichier déjà publié. Si le navigateur ne sait pas imprimer un PDF intégré
// (l'impression échoue), le PDF s'ouvre dans un nouvel onglet et on y imprime.
// Pas d'attribut `sandbox` sur ce cadre : Chrome refuse d'afficher un PDF dans un cadre à bac à sable (la visionneuse y devient
// inaccessible et `print()` n'imprime rien) ; le fichier est l'un des nôtres, de la même origine, jamais une adresse extérieure.
import { journaliser } from '../utils/journal.js'

/** Durée de vie du cadre : la boîte d'impression doit avoir fini de lire le document. */
const DUREE_CADRE_MS = 60_000

/** Ce dont la fonction a besoin du navigateur (remplaçable dans un test). */
export interface Navigateur {
  document: Document
  ouvrir: (url: string) => void
}

const navigateurReel = (): Navigateur => ({ document, ouvrir: url => { window.open(url, '_blank', 'noopener') } })

/**
 * Imprime le PDF à cette adresse. `slug` : la fiche, pour la statistique anonyme « fiches imprimées » (src/utils/journal.js).
 * Rend le cadre créé (pour les tests) ; il se retire seul.
 */
export function imprimerPdf(url: string, slug: string, navigateur: Navigateur = navigateurReel()): HTMLIFrameElement {
  journaliser('imprimer', { r: `/telechargements/${slug}` })
  const cadre = navigateur.document.createElement('iframe')
  cadre.setAttribute('aria-hidden', 'true')
  cadre.tabIndex = -1
  cadre.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0'
  cadre.addEventListener('load', () => {
    try {
      cadre.contentWindow?.focus()
      cadre.contentWindow?.print()
    } catch {
      navigateur.ouvrir(url)
    }
  })
  cadre.src = url
  navigateur.document.body.appendChild(cadre)
  setTimeout(() => cadre.remove(), DUREE_CADRE_MS)
  return cadre
}
