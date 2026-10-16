// Trier les images — le corpus : pour chaque thème, les « boîtes » où l'on range (une image et un nom chacune) et les images à ranger.
// Pur (lisible par node). Les mots (nom d'une image, d'une boîte) sont dans le catalogue de contenu : `mot.<emoji>` et `boite.<id>`.
import type { NomEmoji } from '../../images/tables.ts'
import type { CompetenceId } from '../../noyau/types.ts'
import { K } from '../../noyau/ids.ts'

export const THEMES = ['groupes', 'matieres', 'deplacements', 'mange'] as const
export type ThemeId = (typeof THEMES)[number]

/** Une image à ranger : sa boîte, et les boîtes qu'on ne lui propose jamais comme leurre (« l'ours mange aussi du poisson »). */
export interface Entree { item: NomEmoji, boite: string, pas?: readonly string[] }

export interface Theme {
  /** la compétence du programme que ce thème travaille */
  competence: CompetenceId
  /** les boîtes : leur identifiant (le nom est `boite.<id>`) et l'image qui les représente */
  boites: Readonly<Record<string, NomEmoji>>
  entrees: readonly Entree[]
}

const e = (item: NomEmoji, boite: string, pas?: readonly string[]): Entree => ({ item, boite, pas })

export const CORPUS: Readonly<Record<ThemeId, Theme>> = {
  // Ranger des images par catégorie (oral : categories-mots) ; chaque boîte porte une image d'exemple qui n'est jamais une des images à ranger
  groupes: {
    competence: K.categoriesMots,
    boites: { animaux: 'koala', fruits: 'pasteque', vehicules: 'taxi', vetements: 'chapeau' },
    entrees: [
      e('chien', 'animaux'), e('chat', 'animaux'), e('lapin', 'animaux'), e('vache', 'animaux'), e('cochon', 'animaux'), e('lion', 'animaux'),
      e('pomme', 'fruits'), e('banane', 'fruits'), e('fraise', 'fruits'), e('orange', 'fruits'), e('raisin', 'fruits'), e('citron', 'fruits'),
      e('voiture', 'vehicules'), e('bus', 'vehicules'), e('velo', 'vehicules'), e('avion', 'vehicules'), e('bateau', 'vehicules'),
      e('tshirt', 'vetements'), e('pantalon', 'vetements'), e('robe', 'vetements'), e('echarpe', 'vetements'), e('chaussette', 'vetements'), e('chaussure', 'vetements'),
    ],
  },
  // De quoi est fait un objet (objets : materiaux-objets) ; seulement des objets dont la matière ne fait pas de doute pour un enfant
  matieres: {
    competence: K.materiauxObjets,
    boites: { bois: 'arbre', metal: 'engrenage', tissu: 'pelote', papier: 'pageBlanche', verre: 'fenetre', plastique: 'flacon' },
    entrees: [
      e('chaise', 'bois'), e('porte', 'bois'), e('buche', 'bois'),
      e('cle', 'metal'), e('conserve', 'metal'), e('ancre', 'metal'), e('ecrou', 'metal'),
      e('chaussette', 'tissu'), e('echarpe', 'tissu'), e('tshirt', 'tissu'), e('pantalon', 'tissu'), e('robe', 'tissu'),
      e('journal', 'papier'), e('enveloppe', 'papier'), e('cahier', 'papier'), e('livre', 'papier'),
      e('ampoule', 'verre'), e('pot', 'verre'), e('verreAVin', 'verre'),
      e('seau', 'plastique'), e('gobelet', 'plastique'), e('brosseADents', 'plastique'),
    ],
  },
  // Comment un animal se déplace (le vivant : deplacements-animaux)
  deplacements: {
    competence: K.deplacementsAnimaux,
    boites: { vole: 'plume', nage: 'vague', marche: 'pas' },
    entrees: [
      e('papillon', 'vole'), e('abeille', 'vole'), e('hibou', 'vole'), e('aigle', 'vole'),
      e('poisson', 'nage'), e('baleine', 'nage'), e('dauphin', 'nage'), e('requin', 'nage'),
      e('chien', 'marche'), e('vache', 'marche'), e('cheval', 'marche'), e('elephant', 'marche'), e('girafe', 'marche'), e('ours', 'marche'),
    ],
  },
  // Ce que mange un animal (le vivant : besoins-vivants, la nourriture) : les boîtes sont des aliments. Pour chaque animal, les aliments qu'il
  // mange aussi (ou qu'un enfant pourrait lui donner) ne sont jamais proposés comme leurre : une seule bonne réponse.
  mange: {
    competence: K.besoinsVivants,
    boites: { carotte: 'carotte', os: 'os', poisson: 'poisson', herbe: 'herbe', graine: 'graine', banane: 'banane', fromage: 'fromage', miel: 'miel', salade: 'salade', viande: 'viande' },
    entrees: [
      e('lapin', 'carotte', ['herbe', 'salade', 'graine', 'banane']), e('chien', 'os', ['viande', 'poisson', 'fromage']),
      e('chat', 'poisson', ['fromage', 'viande']), e('vache', 'herbe', ['carotte', 'graine', 'salade']),
      e('cheval', 'herbe', ['carotte', 'graine', 'banane', 'salade']), e('ours', 'miel', ['poisson', 'viande', 'banane']),
      e('souris', 'fromage', ['graine', 'miel', 'banane']), e('poule', 'graine', ['herbe', 'salade']),
      e('singe', 'banane', ['graine', 'salade']), e('canard', 'graine', ['herbe', 'salade', 'poisson']),
      e('tortue', 'salade', ['herbe', 'carotte', 'banane']), e('lion', 'viande', ['os', 'poisson']),
    ],
  },
}
