// Emojis de la barre (ceux de la maquette) : une seule table, pour qu'une même notion garde le même emoji partout.
import type { Profil } from '../contexte/types.ts'

export const EMOJI_PROFIL: Readonly<Record<Profil, string>> = { enfant: '🧒', parent: '👨‍👩‍👧', enseignant: '🧑‍🏫' }
export const EMOJI_BARRE = { recherche: '🔍', langue: '🗣️', classe: '🎒', verrou: '🔒', reglages: '⚙️', dev: '🛠️', fichesPretes: '📄', programme: '📚', menu: '☰', fermer: '✕' } as const
