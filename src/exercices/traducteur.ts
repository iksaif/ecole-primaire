// T(cle, params) d'un exercice, pour les consommateurs hors de l'app (build des fiches, tests) qui lisent aussi les exercices
// de l'ancien registre (src/exercices/index.js) : leurs textes sont encore deux catalogues `{ fr, br }` de src/i18n/, lus par
// l'ancien `contenu`. Un exercice du nouveau format (`catalogue(…)`, src/langues/catalogue.ts) passe par `traducteur`.
// Ce pont disparaît avec le dernier exercice de l'ancien format ; l'app, elle, n'en a pas besoin.
import { contenu as contenuAncien } from '../i18n/index.js'
import { estCatalogue, traducteur } from '../langues/catalogue.ts'
import type { TraducteurContenu } from '../langues/catalogue.ts'

export function traducteurExercice(textes: unknown, langue: string): TraducteurContenu {
  return estCatalogue(textes) ? traducteur(textes, langue) : contenuAncien(textes as Record<string, Record<string, unknown>>, langue).t
}
