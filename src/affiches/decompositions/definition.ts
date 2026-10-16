// Les décompositions d'un nombre : toutes les façons de faire n avec deux groupes (« 5, c'est 3 et 2 »), un rang par façon, deux couleurs, les
// chiffres en option. Programme (src/data/programme.ts, composer-decomposer) : MS jusqu'à 6, GS jusqu'à 10 ; la GS a deux affiches, celle de 5 (la
// main) et celle de 10 (les deux mains). Dessin : dessin.ts. Pas de signes ni de lettres : la feuille se lit avec les couleurs.
import { definirAffiche, choix } from '../definir.ts'
import { D, K } from '../../noyau/ids.ts'
import { CODES } from '../../langues/registre.ts'
import type { ReglagesDeAffiche } from '../types.ts'

const definition = definirAffiche({
  id: 'decompositions',
  domaine: D.nombresCalcul,
  emoji: 'chiffres',
  langues: CODES,
  orientations: ['portrait', 'landscape'],
  formats: ['A4', 'A3'],
  competences: [K.composerDecomposer],
  reglages: { chiffres: choix([true, false]) },
  variantes: {
    // MS : sans « 0 et 6 » (le zéro est la rangée la plus difficile) ; GS : de « 0 et n » à « n et 0 »
    ms: { classes: ['ms'], slug: 'affiche-decompositions-de-6', reglages: { n: 6, zero: false } },
    'gs-5': { classes: ['gs'], slug: 'affiche-decompositions-de-5', reglages: { n: 5, zero: true } },
    'gs-10': { classes: ['gs'], slug: 'affiche-decompositions-de-10', reglages: { n: 10, zero: true } },
  },
})

export default definition
export type Reglages = ReglagesDeAffiche<typeof definition>
