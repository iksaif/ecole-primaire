// Statistiques d'usage anonymes, sans cookie ni identifiant : un signal vers /journal (même domaine),
// que nginx écrit dans un journal dédié SANS adresse IP (voir deploy/setup-nginx.sh). Sert à savoir
// quelles pages sont utilisées et quelles fiches sont imprimées (pour les pré-générer).
// Rien n'est envoyé en développement, pendant la génération des PDF, ni si le navigateur demande
// à ne pas être suivi (Do Not Track / Global Privacy Control).
const actif = import.meta.env.PROD
  && typeof navigator !== 'undefined'
  && !new URLSearchParams(location.search).has('generation')
  && navigator.doNotTrack !== '1'
  && !navigator.globalPrivacyControl

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
