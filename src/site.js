// Sites construits à partir du même code (choisi au build par VITE_SITE, voir .env*).
export const SITES = {
  ecoleprimaire: { id: 'ecoleprimaire', nom: 'École Primaire', emoji: '📚', langue: 'fr', langueRegionale: '', fiches: ['fr'] },
  // Version bretonne : breton activé par défaut ; l'interface reste en français tant que la traduction n'est pas faite
  // fiches : langues des fiches publiées (écoles bilingues → français et breton)
  skoolik: { id: 'skoolik', nom: 'Skoolik', emoji: '📚', langue: 'br', langueRegionale: 'br', fiches: ['fr', 'br'] },
}

// Adresse de contact affichée sur le site (redirigée vers la boîte de l'auteur)
export const CONTACT = 'contact@skoolik.app'
// Dépôt du code (contributions, signalements)
export const DEPOT = 'https://github.com/iksaif/ecole-primaire'

export const site = id => SITES[id] ?? SITES.ecoleprimaire

// Site courant dans l'app (import.meta.env n'existe pas côté node : le script de build passe l'id)
export const SITE = site(import.meta.env?.VITE_SITE)
