// Sites construits à partir du même code (choisi au build par VITE_SITE, voir .env*).
// Un site ne fixe que son nom, son adresse et des valeurs par défaut : c'est ensuite le réglage
// « 🏴 Langue régionale » de l'utilisateur qui décide d'afficher ou non le breton, partout.
export const SITES = {
  ecoleprimaire: { id: 'ecoleprimaire', nom: 'École Primaire', emoji: '📚', url: 'https://ecoleprimaire.app/',
    langue: 'fr', langueRegionale: '' },
  // Version bretonne : interface en breton et langue régionale activée par défaut
  skoolik: { id: 'skoolik', nom: 'Skoolik', emoji: '📚', url: 'https://skoolik.app/',
    langue: 'br', langueRegionale: 'br' },
}

// Adresse de contact affichée sur le site (redirigée vers la boîte de l'auteur)
export const CONTACT = 'contact@skoolik.app'
// Dépôt du code (contributions, signalements)
export const DEPOT = 'https://github.com/iksaif/ecole-primaire'

export const site = id => SITES[id] ?? SITES.ecoleprimaire

// Site courant dans l'app (import.meta.env n'existe pas côté node : le script de build passe l'id)
export const SITE = site(import.meta.env?.VITE_SITE)
