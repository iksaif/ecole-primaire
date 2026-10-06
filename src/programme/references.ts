// Références officielles d'une compétence : le texte du programme (BO), la page DU PDF (pas la page imprimée : convention de
// src/data/programme.ts) et l'adresse qui y mène (`#page=`). Une compétence a une seule source ; l'étiquette est courte
// (« BO 41 · p. PDF 26 »), l'adresse complète est dans `source.url`. Pur (lisible par node).
import type { Competence, Source, SourceId } from '../data/programme.ts'
import type { Langue } from '../langues/registre.ts'
import { traduire } from '../langues/traduire.ts'
import type { CleTexte } from '../langues/traduire.ts'

export interface Reference {
  readonly source: SourceId
  /** page du PDF */
  readonly page: number
  /** adresse du PDF à cette page */
  readonly url: string
  readonly extrait: string
}

export const referenceDe = (source: Source): Reference => ({ source: source.texte, page: source.page, url: source.url, extrait: source.extrait })

/** Le nom court d'un texte officiel (« BO 41 ») dans une langue : un `Record` complet des textes, une source ajoutée sans nom ne compile pas. */
export const nomDeSource = (langue: Langue, source: SourceId): string => traduire(langue, `programme.source.${source}` satisfies CleTexte)

/** L'étiquette d'une référence : « BO 41 · p. PDF 26 ». */
export const etiquetteDeReference = (langue: Langue, reference: Reference): string =>
  `${nomDeSource(langue, reference.source)} · ${traduire(langue, 'programme.reference.page', { page: reference.page })}`

/** L'interprétation d'une compétence (ce qui est une lecture du texte, pas le texte), `null` s'il n'y en a pas. */
export const interpretationDe = (competence: Competence): string | null => competence.interpretation ?? null
