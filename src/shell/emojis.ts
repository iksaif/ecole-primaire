// Emojis des profils (des contenus : OpenMoji à l'étape 4 du guide d'iconographie). La barre, le menu et le pied de page ont des
// icônes d'interface (src/images/icones.ts, <Icone>).
import type { Profil } from '../contexte/types.ts'

export const EMOJI_PROFIL: Readonly<Record<Profil, string>> = { enfant: '🧒', parent: '👨‍👩‍👧', enseignant: '🧑‍🏫' }
