// Emoji d'un domaine du programme : l'icône de ses ressources. Un `Record` complet : un domaine ajouté à programme.ts sans
// emoji ne compile pas. Pur.
import type { DomaineId } from '../data/programme.ts'

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
  exemple: '⭐',   // domaine fictif des exemples (développement)
}
