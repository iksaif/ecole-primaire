// Emojis de la barre (ceux de la maquette) : une seule table, pour qu'une même notion garde le même emoji partout.
import type { Profil } from '../contexte/types.ts'

export const EMOJI_PROFIL: Readonly<Record<Profil, string>> = { enfant: '🧒', parent: '👨‍👩‍👧', enseignant: '🧑‍🏫' }
export const EMOJI_BARRE = { recherche: '🔍', langue: '🗣️', classe: '🎒', verrou: '🔒', reglages: '⚙️', accueil: '🏠', tous: '🌐', dev: '🛠️', fichesPretes: '📄', programme: '📚', menu: '☰', fermer: '✕' } as const
/** Emojis des liens du pied de page qui n'ont pas de rubrique (le programme et les fiches prêtes gardent ceux de la barre). */
export const EMOJI_PIED = { nouveautes: '🆕', apropos: 'ℹ️', signaler: '🐞', depot: '💻', contact: '✉️', mentions: '⚖️' } as const
