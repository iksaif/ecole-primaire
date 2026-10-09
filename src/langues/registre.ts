// Registre des langues : la SEULE liste de codes de langue du code. `Langue` en est dérivé ; pour ajouter une langue,
// créer src/langues/<code>/ (index.ts, textes/, regles.ts…) et l'ajouter ici. Le compilateur dit alors tout ce qui manque
// (les autres langues ont-elles un nom pour la nouvelle ? ses textes ont-ils les mêmes clés que le français ?).
// Aucun `=== 'br'` ailleurs : on interroge le registre (`donnees`, `voix`, `traductionAutomatique`…).
import type { LangueDef, Regles } from './types.ts'
import fr from './fr/index.ts'
import br from './br/index.ts'
import { cleRessource, niveauDeFiche } from './confiance.ts'
import type { NiveauConfiance, TableConfiance } from './confiance.ts'

export const LANGUES = { fr, br } as const

/** Code d'une langue du registre : 'fr' | 'br'. */
export type Langue = keyof typeof LANGUES

// vérifie que chaque langue respecte LangueDef (et donne son nom dans toutes les langues)
const _verification: { [L in Langue]: LangueDef<Langue> } = LANGUES
void _verification

/** Langue source de l'interface : celle des textes d'origine et du repli. */
export const LANGUE_SOURCE = 'fr' satisfies Langue

/** Les codes, dans l'ordre du registre. */
export const CODES = Object.keys(LANGUES) as Langue[]

export const estLangue = (v: unknown): v is Langue => typeof v === 'string' && Object.hasOwn(LANGUES, v)

/** Une langue du registre. */
export const langue = (code: Langue): LangueDef<Langue> => LANGUES[code]

/** Règles d'écriture d'une langue (mutations, ha/hag, élision, pluriels). */
export const regles = (code: Langue): Regles => LANGUES[code].regles

/** Langues régionales : celles qui apportent des données (alphabet, nombres…). */
export const REGIONALES: readonly Langue[] = CODES.filter(c => 'donnees' in LANGUES[c])
export const estRegionale = (code: Langue): boolean => REGIONALES.includes(code)

/** Données d'une langue régionale, ou undefined si la langue n'en a pas. */
export const donneesRegionales = (code: Langue) => ('donnees' in LANGUES[code] ? (LANGUES[code] as LangueDef<Langue>).donnees : undefined)

/** Nom d'une langue dans une langue d'interface (« breton » en français, « brezhoneg » en breton). */
export const nomDeLangue = (code: Langue, dans: Langue): string => LANGUES[code].nom[dans]

/**
 * Le niveau de confiance (0 à 4) de la traduction d'une fiche dans une langue : l'exception de la fiche (`slug`, avec son suffixe de langue) si
 * elle existe, sinon le niveau de sa ressource. `null` pour la langue source, qui n'est pas une traduction.
 */
export function confianceDe(code: Langue, genre: 'exercice' | 'affiche', id: string, slug = ''): NiveauConfiance | null {
  if (code === LANGUE_SOURCE) return null
  const table: TableConfiance = (LANGUES[code] as LangueDef<Langue>).confiance ?? {}
  return niveauDeFiche(table, cleRessource(genre, id), slug)
}

/**
 * Le niveau de confiance d'une fiche selon les langues de son contenu : le plus bas parmi les traductions qu'elle contient (maillon le plus
 * faible) ; `null` si elle est en langue source seule.
 */
export function confianceFiche(langues: readonly string[], genre: 'exercice' | 'affiche', id: string, slug = ''): NiveauConfiance | null {
  const niveaux = langues.filter(estLangue).map(l => confianceDe(l, genre, id, slug)).filter((n): n is NiveauConfiance => n !== null)
  return niveaux.length ? (Math.min(...niveaux) as NiveauConfiance) : null
}
