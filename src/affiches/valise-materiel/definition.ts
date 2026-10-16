// La valise et les jetons — le MATÉRIEL pour jouer en classe (Eduscol, « éléments de progressivité », juin 2023 : la valise de Gaston, le jeu de la boîte) :
// le patron d'une boîte opaque à plier (avec son couvercle rabattable : on ne voit pas dedans) et une planche de jetons à découper (des images alignées,
// traits de coupe pour le massicot). Pour les petits problèmes d'ajout et de retrait de la maternelle : « j'ai trois jetons dans ma boîte, j'en ajoute
// un… ». Le jeu en ligne et la fiche à entourer sont l'exercice « La valise » (src/exercices/valise/).
// Programme (src/data/programme.ts) : résoudre de petits problèmes avec du matériel, composer et décomposer les petits nombres (PS à GS).
import { definirAffiche, choix } from '../definir.ts'
import { D, K } from '../../noyau/ids.ts'
import { CODES } from '../../langues/registre.ts'
import type { ReglagesDeAffiche } from '../types.ts'

const definition = definirAffiche({
  id: 'valise-materiel',
  domaine: D.nombresCalcul,
  emoji: 'carton',
  orientations: ['landscape', 'portrait'],
  langues: CODES,
  competences: [K.problemesMaternelle, K.composerDecomposer],
  // les jetons : l'image de la planche (le même objet partout : on compte sans se laisser distraire)
  reglages: { objet: choix(['ours', 'pomme', 'etoile', 'fleur', 'chat']) },
  // `patron` : la page de la boîte à plier avant celle des jetons ; sans lui, la planche de jetons seule
  variantes: {
    boite: { classes: ['ps', 'ms', 'gs'], slug: 'affiche-valise-boite-et-jetons', reglages: { patron: true } },
    jetons: { classes: ['ps', 'ms', 'gs'], slug: 'affiche-valise-jetons', reglages: { patron: false } },
  },
})

export default definition
export type Reglages = ReglagesDeAffiche<typeof definition>
