// Sites construits à partir du même code (choisi au build par VITE_SITE, voir .env*).
export const SITES = {
  ecoleprimaire: { id: 'ecoleprimaire', nom: 'École Primaire', emoji: '📚', langue: 'fr', langueRegionale: '' },
  // Version bretonne : breton activé par défaut ; l'interface reste en français tant que la traduction n'est pas faite
  skoolik: { id: 'skoolik', nom: 'Skoolik', emoji: '📚', langue: 'br', langueRegionale: 'br' },
}

export const site = id => SITES[id] ?? SITES.ecoleprimaire

// Site courant dans l'app (import.meta.env n'existe pas côté node : le script de build passe l'id)
export const SITE = site(import.meta.env?.VITE_SITE)
