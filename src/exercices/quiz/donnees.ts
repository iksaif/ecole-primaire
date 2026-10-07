// Quiz — les thèmes (texte : `theme.<id>`), leur icône, et la banque de questions de chaque langue.
import fr from './questions/fr.ts'
import br from './questions/br.ts'
import type { Banque, QuestionBanque } from './questions/types.ts'

export const THEMES = ['animaux', 'sciences', 'geo-france', 'geo-monde', 'histoire'] as const
export type Theme = (typeof THEMES)[number]

export const ICONES: Readonly<Record<Theme, string>> = { animaux: '🦁', sciences: '🔬', 'geo-france': '🗺️', 'geo-monde': '🌍', histoire: '📜' }

/** Les banques, par langue de contenu ; une langue sans banque, ou un thème non traduit, prend les questions françaises. */
const BANQUES: Readonly<Record<string, Banque>> = { fr, br }

/** Les questions d'un thème dans une langue. */
export function questionsDuTheme(theme: Theme, langue = 'fr'): readonly QuestionBanque[] {
  return BANQUES[langue]?.[theme] ?? fr[theme] ?? []
}
