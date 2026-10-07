// T(cle, params) d'un exercice ou d'une affiche, pour les consommateurs hors de l'app (build des fiches, tests). Tous les exercices
// sont au format `catalogue(…)` (src/langues/catalogue.ts) ; le build passe encore ici des textes d'affiches qui ne le sont pas
// (`texteMulti`, scripts/build/fiches/registres.ts), lus par l'ancien `contenu` de src/i18n/. Ce pont disparaît avec eux.
import { contenu as contenuAncien } from '../i18n/index.js'
import { estCatalogue, traducteur } from '../langues/catalogue.ts'
import type { TraducteurContenu } from '../langues/catalogue.ts'

export function traducteurExercice(textes: unknown, langue: string): TraducteurContenu {
  return estCatalogue(textes) ? traducteur(textes, langue) : contenuAncien(textes as Record<string, Record<string, unknown>>, langue).t
}
