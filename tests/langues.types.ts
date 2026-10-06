// Vérifications de TYPES (jamais exécutées : `npm run types` les compile) : une clé inconnue, un paramètre manquant ou en
// trop, un catalogue qui diverge du français sont des erreurs de compilation. Chaque `@ts-expect-error` doit rester une
// erreur : si le typage se relâche, c'est la ligne qui devient l'erreur (« unused @ts-expect-error »).
import { traduire } from '../src/langues/traduire.ts'
import type { Traductions } from '../src/langues/types.ts'
import type { Langue } from '../src/langues/registre.ts'
import { catalogue, contenuDe } from '../src/langues/catalogue.ts'

export function verifications() {
  traduire('fr', 'nav.accueil')
  traduire('br', 'reglages.remise.fait', { n: 2 })
  traduire('fr', 'langueRegionale.intro', { nom: 'breton', ecoles: 'les écoles' })
  // @ts-expect-error clé inconnue
  traduire('fr', 'nav.inconnue')
  // @ts-expect-error section inconnue
  traduire('fr', 'rien.du.tout')
  // @ts-expect-error paramètre manquant
  traduire('fr', 'langueRegionale.intro', { nom: 'breton' })
  // @ts-expect-error paramètres obligatoires
  traduire('fr', 'langueRegionale.intro')
  // @ts-expect-error le pluriel demande n
  traduire('fr', 'reglages.remise.fait')
  // @ts-expect-error paramètre en trop
  traduire('fr', 'nav.accueil', { n: 1 })
  // @ts-expect-error langue hors registre
  traduire('de', 'nav.accueil')
  const ok: Langue = 'br'
  void ok
  // @ts-expect-error code de langue inconnu
  const mauvais: Langue = 'xx'
  void mauvais
}

// Un catalogue qui diverge du français ne compile pas
type Source = { a: 'un', b: { c: 'deux {n}', d: { one: 'x', other: 'y' } } }
export const bon = { a: 'un', b: { c: 'ar {n}', d: { one: 'u', two: 'd', other: 'o' } } } satisfies Traductions<Source>
// @ts-expect-error clé manquante
export const manque = { a: 'un', b: { c: 'x' } } satisfies Traductions<Source>
// @ts-expect-error clé en trop
export const enTrop = { a: 'un', z: 'trop', b: { c: 'x', d: { other: 'y' } } } satisfies Traductions<Source>
// @ts-expect-error un pluriel doit rester un pluriel
export const forme = { a: 'un', b: { c: 'x', d: 'pas un pluriel' } } satisfies Traductions<Source>

// Catalogue de contenu d'un exercice : français seul, ou avec une traduction qui doit suivre le français
export const frSeul = catalogue({ titre: 'a', consigne: { one: 'x', other: 'y {n}' } })
export const avecBr = catalogue({ titre: 'a', corrige: 'c {pas}' }, { br: { titre: 'b', corrige: 'd {pas}' } })
// @ts-expect-error clé manquante dans la traduction
catalogue({ titre: 'a', autre: 'b' }, { br: { titre: 'x' } })
// @ts-expect-error clé en trop dans la traduction
catalogue({ titre: 'a' }, { br: { titre: 'x', trop: 'y' } })
// @ts-expect-error un pluriel doit rester un pluriel
catalogue({ n: { one: 'a', other: 'b' } }, { br: { n: 'pas un pluriel' } })
// @ts-expect-error langue hors registre
catalogue({ titre: 'a' }, { de: { titre: 'x' } })
export function contenuTypé() {
  contenuDe(frSeul, 'fr').t('titre')
  contenuDe(frSeul, 'fr').t('consigne', { n: 3 })
  contenuDe(avecBr, 'br').t('corrige', { pas: 2 })
  // @ts-expect-error clé inconnue du catalogue
  contenuDe(frSeul, 'fr').t('inconnue')
  // @ts-expect-error paramètre manquant
  contenuDe(avecBr, 'fr').t('corrige')
}
