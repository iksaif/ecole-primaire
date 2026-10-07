// Écriture — ce que la fiche écrit : la liste des éléments (une lettre, un mot, un paragraphe), dans l'ordre. Rien n'est tiré au hasard
// (`aleatoire: false`) : la même configuration donne toujours la même fiche. La mise en page (lignes, pages) est dans fiche.ts.
import type { Contraintes, ParamsGenerateur } from '../../noyau/types.ts'
import type { ReglagesEcriture } from './donnees.ts'

/** Un élément à écrire : une lettre (ou un chiffre, un digramme) de la grille, ou une ligne de mots ou de texte. */
export interface Element { texte: string, lettre: boolean }
export type TirageFiche = Element[]

/** Les lignes non vides d'un texte saisi (un mot ou un paragraphe par ligne). */
const lignesDe = (texte: string): string[] => String(texte).split('\n').map(s => s.trim()).filter(Boolean)

export function questionsFiche({ reglages }: Omit<ParamsGenerateur<ReglagesEcriture>, 'nb'>): TirageFiche {
  if (reglages.contenu === 'lettres') return reglages.lettres.map(texte => ({ texte, lettre: true }))
  const saisi = reglages.contenu === 'mots' ? reglages.mots : reglages.texte
  return lignesDe(saisi).map(texte => ({ texte, lettre: false }))
}

/**
 * Écarts au programme : aucun n'est vérifié pour l'instant. La fiche ne choisit rien (l'enseignant·e choisit les écritures et les
 * lettres) ; le programme de cursive (minuscules au CP, majuscules au CE1) porterait sur les écritures proposées par classe.
 */
export const ecartsAuProgramme = (_tirage: TirageFiche, _contraintes: Contraintes): string[] => []
