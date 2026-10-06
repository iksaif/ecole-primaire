// Lire un `Libelle` (types.ts) dans une langue. Pur.
import { LANGUES, LANGUE_SOURCE } from '../langues/registre.ts'
import type { Langue } from '../langues/registre.ts'
import { lireFeuille, texteDeFeuille } from '../langues/traduire.ts'
import type { Libelle } from './types.ts'

/**
 * Le texte d'un libellé dans une langue : la clé de l'interface (catalogue de la langue, sinon le français ; une clé à
 * paramètres reste telle quelle, un titre n'en a pas), ou le texte de la langue dans les données, sinon le français.
 */
export function texteDe(libelle: Libelle, langue: Langue): string {
  if ('texte' in libelle) return libelle.texte[langue] || libelle.texte[LANGUE_SOURCE]
  const feuille = lireFeuille(LANGUES[langue].textes, libelle.cle) ?? lireFeuille(LANGUES[LANGUE_SOURCE].textes, libelle.cle)
  return texteDeFeuille(feuille, langue) ?? libelle.cle
}

/**
 * La langue dans laquelle `texteDe` lit le libellé : celle demandée, ou le français quand la langue n'a pas ce texte (repli). Sert
 * à marquer `lang="fr"` le texte français affiché dans une page d'une autre langue (lecteurs d'écran, césure) ; `undefined` si
 * c'est déjà la langue de la page.
 */
export function langueDifferente(libelle: Libelle, langue: Langue): Langue | undefined {
  const propre = 'texte' in libelle ? !!libelle.texte[langue] : lireFeuille(LANGUES[langue].textes, libelle.cle) !== undefined
  return propre || langue === LANGUE_SOURCE ? undefined : LANGUE_SOURCE
}
