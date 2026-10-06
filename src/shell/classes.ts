// Libellé des classes choisies dans la barre : « CE1 », « CE1 · CM1 », « CE1–CM1 » (trois classes de suite ou plus). Pur.
import { NIVEAUX } from '../data/classes.ts'
import type { Classe } from '../data/classes.ts'

export function libelleClasses(classes: readonly Classe[]): string {
  const triees = NIVEAUX.filter(n => classes.includes(n))
  const [premiere] = triees
  const derniere = triees[triees.length - 1]
  if (!premiere || !derniere) return ''
  const deSuite = NIVEAUX.indexOf(derniere) - NIVEAUX.indexOf(premiere) === triees.length - 1
  if (triees.length >= 3 && deSuite) return `${premiere.toUpperCase()}–${derniere.toUpperCase()}`
  return triees.map(c => c.toUpperCase()).join(' · ')
}
