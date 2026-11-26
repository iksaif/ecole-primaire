// Statistiques d'usage anonymes, sans cookie ni identifiant : un signal vers /journal (même domaine),
// que nginx écrit dans un journal dédié SANS adresse IP (voir deploy/setup-nginx.sh). Sert à savoir
// quelles pages sont utilisées et quelles fiches sont imprimées (pour les pré-générer).
// L'origine de la visite (moteur de recherche, réseau, site de l'éducation, direct, autre) n'est envoyée qu'une fois, avec la première page vue : une catégorie,
// jamais l'adresse du site d'où l'on vient (origine.ts).
// Rien n'est envoyé en développement, pendant la génération des PDF, ni si le navigateur demande
// à ne pas être suivi (Do Not Track / Global Privacy Control).
import { origineDe } from './origine.ts'
import { SITES } from '../sites.ts'

const actif = import.meta.env.PROD
  && typeof navigator !== 'undefined'
  && !new URLSearchParams(location.search).has('generation')
  && navigator.doNotTrack !== '1'
  && !navigator.globalPrivacyControl

let origineEnvoyee = false
/** L'origine de la visite à la première page vue, puis rien (elle ne change pas d'une page à l'autre). */
export function origineDeLEntree() {
  if (!actif || origineEnvoyee) return undefined
  origineEnvoyee = true
  const hotes = Object.values(SITES).map(s => new URL(s.url).hostname)
  return origineDe(document.referrer, hotes)
}

export function journaliser(evenement, donnees = {}) {
  if (!actif) return
  try {
    const p = new URLSearchParams({ e: evenement })
    for (const [k, v] of Object.entries(donnees)) {
      if (v === undefined || v === null || v === '') continue
      p.set(k, (typeof v === 'object' ? JSON.stringify(v) : String(v)).slice(0, 1500))
    }
    const url = `${import.meta.env.BASE_URL}journal?${p}`
    if (!navigator.sendBeacon?.(url)) fetch(url, { method: 'POST', keepalive: true }).catch(() => {})
  } catch { /* les statistiques ne doivent jamais gêner l'utilisation */ }
}
