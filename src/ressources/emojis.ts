// Emoji d'un domaine du programme : l'icône de ses ressources. Un `Record` complet : un domaine ajouté à programme.ts sans
// emoji ne compile pas. Pur.
import type { DomaineId } from '../data/programme.ts'
import type { TypeRessource } from './types.ts'

export const EMOJI_DOMAINE: Readonly<Record<DomaineId, string>> = {
  'nombres-calcul': '🔢',
  'grandeurs-mesures': '📏',
  'espace-geometrie': '📐',
  donnees: '📊',
  proportionnalite: '⚖️',
  'pensee-informatique': '💻',
  motifs: '🔷',
  'temps-espace': '🧭',
  lecture: '📖',
  ecriture: '✏️',
  oral: '🗣️',
  vocabulaire: '🔤',
  grammaire: '🧩',
  'culture-litteraire': '📚',
  vivant: '🌱',
  'corps-sante': '🫀',
  matiere: '🧪',
  'objets-techniques': '⚙️',
  histoire: '🏛️',
  geographie: '🗺️',
  emc: '🤝',
  'regionale-oral': '💬',
  'regionale-mots': '🖼️',
  'regionale-sons': '🔡',
  'regionale-culture': '🎶',
  exemple: '⭐',   // domaine fictif des exemples (développement)
}

/** Emoji d'un type de ressource : l'en-tête de ses résultats dans la recherche. */
export const EMOJI_TYPE: Readonly<Record<TypeRessource, string>> = {
  exercice: '🎮',
  affiche: '📘',
  fiche: '📄',
  competence: '🎯',
  page: '🧭',
}
