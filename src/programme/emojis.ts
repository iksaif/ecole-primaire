// Emojis des matières sur les pages « Programme » et « Compétence » (des contenus). Les libellés de ces pages ont des icônes
// d'interface (Phosphor : src/images/icones.ts) ; les domaines ont leurs emojis (src/ressources/emojis.ts). Pur.
import type { MatiereProgramme } from './etat.ts'

// langue régionale : 🗣️ quand il faut du texte ; la barre montre son drapeau dessiné (IconeMatiere)
export const EMOJI_MATIERE: Readonly<Record<MatiereProgramme, string>> = { maths: '🔢', francais: '📝', monde: '🌍', regionale: '🗣️' }
