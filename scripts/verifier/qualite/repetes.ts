// Compteur (max : ne peut que baisser) :
//   textesRepetes   textes identiques présents 3 fois ou plus dans les catalogues : interface (src/langues/<langue>/textes/), affiches
//                   (textes.ts de chaque affiche) et contenus d'exercices (catalogue de chaque exercice). Un texte répété a sa place
//                   dans un endroit commun : la section `communs` des textes d'interface (où traducteurAffiche se rabat), un module
//                   partagé (listeMots.ts pour les affiches de listes de mots), ou une seule clé lue partout. Ajouté le 2026-10-07 à
//                   145 : il ne doit que baisser. Les textes très courts (moins de 4 caractères : « CP », « €ref ») ne comptent pas.
//   Le détail : `node scripts/verifier/qualite/repetes.ts` liste chaque texte et où il est.
import { LANGUES, CODES } from '../../../src/langues/registre.ts'
import { REGISTRE as AFFICHES } from '../../../src/affiches/index.ts'
import { REGISTRE as EXERCICES } from '../../../src/exercices/index.ts'
import type { Compteur } from './compteur.ts'

/** À partir de combien d'occurrences un texte est compté comme répété. */
const REPETE = 3
/** Longueur minimale d'un texte pris en compte. */
const LONGUEUR_MIN = 4

/** Chaque texte (une feuille de catalogue), avec tous les endroits où il apparaît (`interface:fr.cadre.mistral.titre`). */
function occurrences(): Map<string, string[]> {
  const vus = new Map<string, string[]>()
  const parcourir = (arbre: unknown, ou: string): void => {
    if (typeof arbre === 'string') {
      const texte = arbre.trim()
      if (texte.length >= LONGUEUR_MIN) vus.set(texte, [...(vus.get(texte) ?? []), ou])
      return
    }
    if (arbre && typeof arbre === 'object') for (const [cle, v] of Object.entries(arbre)) parcourir(v, `${ou}.${cle}`)
  }
  for (const l of CODES) parcourir((LANGUES[l] as { textes: unknown }).textes, `interface:${l}`)
  for (const a of AFFICHES) for (const [l, t] of Object.entries(a.textes)) parcourir(t, `affiche:${a.definition.id}:${l}`)
  for (const e of EXERCICES) {
    const catalogue = e.textes as { source: unknown, traductions?: Record<string, unknown> }
    parcourir(catalogue.source, `exercice:${e.definition.id}:fr`)
    for (const [l, t] of Object.entries(catalogue.traductions ?? {})) parcourir(t, `exercice:${e.definition.id}:${l}`)
  }
  return vus
}

/** Les textes répétés, les plus répétés d'abord. */
export function textesRepetes(): [texte: string, endroits: string[]][] {
  return [...occurrences()].filter(([, endroits]) => endroits.length >= REPETE).sort((a, b) => b[1].length - a[1].length)
}

export const compteursRepetes: Record<'textesRepetes', Compteur> = {
  textesRepetes: () => {
    const repetes = textesRepetes()
    const [texte, endroits] = repetes[0] ?? ['', []]
    return { valeur: repetes.length, detail: repetes.length ? `le plus répété : « ${texte} » (${endroits.length} fois) ; liste : node scripts/verifier/qualite/repetes.ts` : '' }
  },
}

// lancé directement : la liste complète
if (import.meta.url === `file://${process.argv[1]}`) {
  for (const [texte, endroits] of textesRepetes()) console.log(`${endroits.length}× « ${texte} »\n    ${endroits.join('\n    ')}`)
}
