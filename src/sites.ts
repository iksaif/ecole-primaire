// Les sites construits à partir du même code, choisis au build par le mode Vite (`--mode skoolik`, voir .env.*).
// Un site fixe son identité (nom, adresse, textes), les langues qu'il propose et ses valeurs par défaut ; ensuite le
// réglage de l'utilisateur (langue d'interface, langue régionale) décide, et c'est lui qui est mémorisé.
// Pur : lisible par node (le script de build passe l'identifiant du site ; `import.meta.env` n'existe que dans Vite).
import type { Langue } from './langues/registre.ts'

export interface Site {
  /** identifiant (clé de SITES, valeur de VITE_SITE) */
  id: string
  nom: string
  /** icône du logo dans l'en-tête */
  emoji: string
  /** <title> et titre de partage */
  titre: string
  description: string
  /** adresse publique, avec la barre finale */
  url: string
  /** couleur du navigateur (<meta name="theme-color">) */
  couleur: string
  /** langues d'interface proposées (au moins une) */
  languesInterface: readonly Langue[]
  /** langue d'interface par défaut (une de `languesInterface`) */
  langueInterface: Langue
  /** langues régionales qu'on peut activer dans les réglages */
  languesRegionales: readonly Langue[]
  /** langue régionale active par défaut ('' : aucune) */
  langueRegionale: Langue | ''
  /** adresse de contact affichée (redirigée vers la boîte de l'auteur) */
  contact: string
  /** dépôt du code (contributions, signalements) */
  depot: string
}

const DEPOT = 'https://github.com/iksaif/ecole-primaire'
const CONTACT = 'contact@skoolik.app'

export const SITES = {
  ecoleprimaire: {
    id: 'ecoleprimaire',
    nom: 'École Primaire',
    emoji: '📚',
    titre: 'École Primaire — Maternelle et élémentaire : exercices et fiches à imprimer',
    description: 'Exercices interactifs et fiches à imprimer gratuites pour la maternelle et l’élémentaire : écriture, alphabet, calcul, maths, français. Sans compte, sans publicité.',
    url: 'https://ecoleprimaire.app/',
    couleur: '#4a90e2',
    // interface en français ; le breton (traduction automatique) est proposé, la langue régionale s'active dans les réglages
    languesInterface: ['fr', 'br'],
    langueInterface: 'fr',
    languesRegionales: ['br'],
    langueRegionale: '',
    contact: CONTACT,
    depot: DEPOT,
  },
  // Version bretonne : interface en breton (français disponible) et breton actif d'office
  skoolik: {
    id: 'skoolik',
    nom: 'Skoolik',
    emoji: '📚',
    titre: 'Skoolik — Poelladennoù ha fichennoù da voullañ',
    description: 'Poelladennoù ha fichennoù digoust da voullañ, e galleg hag e brezhoneg — exercices et fiches à imprimer pour les écoles bilingues : écriture, alphabet breton, calcul, nombres.',
    url: 'https://skoolik.app/',
    couleur: '#4a90e2',
    languesInterface: ['fr', 'br'],
    langueInterface: 'fr',   // décision du 2026-10-06 : interface en français, breton + français pour les contenus (changeable dans les réglages)
    languesRegionales: ['br'],
    langueRegionale: 'br',
    contact: CONTACT,
    depot: DEPOT,
  },
} as const satisfies Record<string, Site>

export type SiteId = keyof typeof SITES

export const estSite = (id: unknown): id is SiteId => typeof id === 'string' && Object.hasOwn(SITES, id)

/** Le site d'un identifiant ; `ecoleprimaire` si l'identifiant est absent ou inconnu. */
export const site = (id?: string): Site => (estSite(id) ? SITES[id] : SITES.ecoleprimaire)

/** Site courant dans l'app (`import.meta.env` n'existe pas dans node : le script de build passe l'identifiant à `site()`). */
export const SITE: Site = site(import.meta.env?.VITE_SITE)

