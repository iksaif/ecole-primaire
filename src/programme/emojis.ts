// Emojis des pages « Programme » et « Compétence » : ceux de la maquette (une notion = un emoji). Les domaines ont les leurs
// (src/ressources/emojis.ts). Pur.
import type { MatiereProgramme } from './etat.ts'

// langue régionale : 🗣️ quand il faut du texte ; la barre montre son drapeau dessiné (IconeMatiere)
export const EMOJI_MATIERE: Readonly<Record<MatiereProgramme, string>> = { maths: '🔢', francais: '📝', monde: '🌍', regionale: '🗣️' }

export const EMOJI = {
  competence: '🎯',
  programme: '📚',
  classe: '🎒',
  lien: '🔗',
  references: '📖',
  ressources: '🧰',
  interpretation: 'ⓘ',
} as const
