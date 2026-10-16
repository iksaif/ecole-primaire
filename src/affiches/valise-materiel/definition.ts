// La valise et les jetons — le MATÉRIEL pour jouer en classe (Eduscol, « éléments de progressivité », juin 2023 : la valise de Gaston, le jeu de la boîte, le jeu du
// trésor et ses dés) : le patron d'une boîte opaque à plier (couvercle rabattable avec sa languette de fermeture, fente pour glisser les jetons sans l'ouvrir, images à
// colorier), une planche de jetons à découper (des images alignées, traits de coupe pour le massicot, en mélange ou d'une seule sorte) et les dés à plier (le dé usuel, le
// dé « 1, 2, 3 », le dé « + / − »). Pour les petits problèmes d'ajout et de retrait de la maternelle. Le jeu en ligne et la fiche à entourer sont l'exercice « La valise »
// (src/exercices/valise/).
// Programme (src/data/programme.ts) : résoudre de petits problèmes avec du matériel, composer et décomposer les petits nombres (PS à GS).
import { definirAffiche, choix, cases } from '../definir.ts'
import { D, K } from '../../noyau/ids.ts'
import { CODES } from '../../langues/registre.ts'
import type { ReglagesDeAffiche } from '../types.ts'

// les jetons : un mélange (par défaut : plusieurs images, pour qu'on ne les confonde pas avec un seul objet) ou la même image partout
const JETONS = ['mix', 'ours', 'pomme', 'etoile', 'fleur', 'chat'] as const

const definition = definirAffiche({
  id: 'valise-materiel',
  domaine: D.nombresCalcul,
  emoji: 'carton',
  orientations: ['landscape', 'portrait'],
  langues: CODES,
  competences: [K.problemesMaternelle, K.composerDecomposer],
  reglages: {},
  // `genre` : ce que dessine la feuille ; les autres réglages sont ceux de la variante qui en a besoin
  variantes: {
    boite: { classes: ['ps', 'ms', 'gs'], slug: 'affiche-valise-boite-et-jetons', reglages: { genre: 'boite', objet: choix(JETONS), decor: choix([true, false]) } },
    jetons: { classes: ['ps', 'ms', 'gs'], slug: 'affiche-valise-jetons', reglages: { genre: 'jetons', objet: choix(JETONS) } },
    des: { classes: ['ps', 'ms', 'gs'], slug: 'affiche-valise-des', reglages: { genre: 'des', des: cases(['usuel', 'un-deux-trois', 'plus-moins']) } },
  },
})

export default definition
export type Reglages = ReglagesDeAffiche<typeof definition>
