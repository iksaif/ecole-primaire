// Slugs publiés des fiches d'un exercice (pages /telechargements/<slug>/) : une seule règle, lue par le build des fiches
// (scripts/fiches/registres.ts) et par le catalogue des ressources (src/ressources/catalogue.ts). Pur : lisible par node.
//   bilan d'une classe          exercices-<id>-<niveau>
//   fiche par compétence        exercices-<id>-<niveau>-<fiche>, ou le `slug` déclaré par la fiche (adresse historique)
// Une langue autre que le français ajoute `-<code>` : c'est le build qui le fait (suffixeLangue).
import type { Classe, FicheExercice } from './types.ts'

/** Slug (français) du bilan d'une classe. */
export const slugBilan = (id: string, niveau: Classe): string => `exercices-${id}-${niveau}`

/** Slug (français) d'une fiche par compétence : son `slug` déclaré, sinon `exercices-<id>-<niveau>-<fiche>`. */
export const slugFiche = (id: string, fiche: Pick<FicheExercice, 'id' | 'niveau' | 'slug'>): string =>
  fiche.slug ?? `${slugBilan(id, fiche.niveau)}-${fiche.id}`
