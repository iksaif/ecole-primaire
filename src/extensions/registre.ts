// Le registre des extensions : l'UNIQUE endroit qui les liste (comme src/exercices/index.ts pour les exercices). Les parties communes (noyau, ressources, réglages…)
// le parcourent et ne nomment jamais une extension : `tests/extensions.test.mjs` le vérifie. Une extension de plus : un dossier, son `extension.ts`, une ligne ici.
import { extension as ceintures } from '../ceintures/extension.ts'
import type { Extension } from './types.ts'

export const EXTENSIONS: readonly Extension[] = [ceintures]

const parId = new Map(EXTENSIONS.map(e => [e.id, e]))

export const extensionParId = (id: string): Extension | undefined => parId.get(id)

/** L'extension qui ajoute cette ressource au catalogue (`exercice:<id>`), s'il y en a une. */
export function extensionDeRessource(ressource: string): Extension | undefined {
  return EXTENSIONS.find(e => e.ressources.includes(ressource))
}

/** Problèmes du registre (identifiants invalides ou en double, ressource revendiquée deux fois) : liste vide si tout va bien. */
export function problemesRegistre(extensions: readonly Extension[]): string[] {
  const problemes: string[] = []
  const ids = new Set<string>()
  const ressources = new Map<string, string>()
  for (const e of extensions) {
    if (!/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(e.id)) problemes.push(`${e.id} : identifiant invalide (minuscules, chiffres et tirets)`)
    if (ids.has(e.id)) problemes.push(`${e.id} : identifiant en double`)
    ids.add(e.id)
    for (const r of e.ressources) {
      if (!/^(exercice|affiche):/.test(r)) problemes.push(`${e.id} : ressource « ${r} » (exercice:<id> ou affiche:<id> attendu)`)
      const deja = ressources.get(r)
      if (deja) problemes.push(`${r} : revendiquée par « ${deja} » et « ${e.id} »`)
      ressources.set(r, e.id)
    }
  }
  return problemes
}
