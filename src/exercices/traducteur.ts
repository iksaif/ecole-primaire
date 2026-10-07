// T(cle, params) d'un exercice ou d'une affiche, pour les consommateurs hors de l'app (build des fiches, tests) : un catalogue
// d'exercice (`catalogue(…)`, src/langues/catalogue.ts), ou les textes d'une affiche (src/affiches/textes.ts, `texteMulti` du build).
import { estCatalogue, traducteur } from '../langues/catalogue.ts'
import type { TraducteurContenu } from '../langues/catalogue.ts'
import { traducteurAffiche } from '../affiches/textes.ts'
import type { TextesAffiche } from '../affiches/types.ts'

export function traducteurExercice(textes: unknown, langue: string): TraducteurContenu {
  return estCatalogue(textes) ? traducteur(textes, langue) : traducteurAffiche(textes as TextesAffiche, langue) as TraducteurContenu
}
