// L'affiche « Figures et solides » (reportée de `main`, src/impression/affiches/formes.js) : les figures planes (avec leurs côtés égaux,
// leurs angles droits et leurs côtés parallèles) ou les solides (arêtes cachées en pointillés), chacun avec son nom et ses propriétés,
// selon le programme de la classe. Les dessins sont partagés avec les exercices « Les formes » et « Géométrie » (src/dessins/).
// Programme (src/data/programme.ts) : figures planes — CP : disque, carré, rectangle, triangle ; CE1 : + cercle, triangle rectangle ;
// CE2 : + losange ; CM1 : + triangles isocèle et équilatéral ; CM2 : + trapèze, pentagone, hexagone ; solides — prisme droit au CM1.
// Les slugs publiés sont ceux de `main` (`affiche-solides-ce2`…) ; le breton ajoute `-br`.
import { definirAffiche, choix } from '../definir.ts'
import { D, K } from '../../noyau/ids.ts'
import { CODES } from '../../langues/registre.ts'
import type { ReglagesDeAffiche } from '../types.ts'

// Les propriétés que l'affiche montre en plus des noms et des formes : angles droits, côtés égaux, côtés parallèles (figures), faces et
// sommets (solides). Un interrupteur par propriété (un choix multiple ne peut pas être décoché en entier). Au programme de la classe :
// coché par défaut, décochable ; sinon décoché par défaut et proposé « bonus » (le programme ne le demande pas à ce niveau).
//   CP : décrire les figures sans propriété précise ; CE1 : angle droit (équerre, code de l'angle droit) ; CM1 : côtés égaux (isocèle,
//   équilatéral) ; CM2 : côtés parallèles (trapèze) ; solides : faces, sommets et arêtes dès le CE1 (programme.ts).
const AU_PROGRAMME = choix([true, false])
const BONUS = choix([false], { bonus: [true] })

const definition = definirAffiche({
  id: 'formes',
  domaine: D.espaceGeometrie,
  emoji: '🔷',   // celui de l'ancienne entrée « Figures et solides » (src/data/activites.js)
  // portrait seulement (une grille de cartes), A4 ou A3 ; une langue par feuille
  orientations: ['portrait'],
  langues: CODES,
  // chaque variante garde celles qui sont au programme de TOUTES ses classes
  competences: [K.figuresPlanes, K.solides, K.formesMaternelle, K.solidesMaternelle],
  formulaire: { groupes: [{ id: 'proprietes', reglages: ['angles', 'cotes', 'paralleles', 'rayon', 'faces'] }] },
  variantes: {
    // les quatre formes de référence : au CP (figures planes) ; en GS elles se nomment (formes de la maternelle) : pas de propriétés
    'plan-cycle2': { classes: ['cp'], slug: 'affiche-formes-planes-cycle-1-2', sauf: [K.solides], reglages: { angles: BONUS, cotes: BONUS, paralleles: BONUS, rayon: BONUS } },
    'plan-gs': { classes: ['gs'], sauf: [K.solides, K.figuresPlanes], reglages: { angles: BONUS, cotes: BONUS, paralleles: BONUS, rayon: BONUS } },
    // les mêmes quatre formes au CE1, qui apprend à vérifier un angle droit à l'équerre
    'plan-ce1': { classes: ['ce1'], sauf: [K.solides], reglages: { angles: AU_PROGRAMME, cotes: BONUS, paralleles: BONUS, rayon: BONUS } },
    'plan-cm1': { classes: ['cm1'], slug: 'affiche-figures-planes-cm1', sauf: [K.solides], reglages: { angles: AU_PROGRAMME, cotes: AU_PROGRAMME, paralleles: BONUS, rayon: AU_PROGRAMME } },
    'plan-cycle3': { classes: ['cm2'], slug: 'affiche-figures-planes-cycle-3', sauf: [K.solides], reglages: { angles: AU_PROGRAMME, cotes: AU_PROGRAMME, paralleles: AU_PROGRAMME, rayon: AU_PROGRAMME } },
    // maternelle : les six solides à reconnaître et à nommer, chacun avec un objet de tous les jours ; ni faces ni arêtes (elles viennent au CE1)
    'solides-maternelle': { classes: ['ms', 'gs'], slug: 'affiche-solides-maternelle', sauf: [K.figuresPlanes, K.solides, K.formesMaternelle], reglages: { faces: BONUS } },
    'solides-ce2': { classes: ['ce1', 'ce2'], slug: 'affiche-solides-ce2', sauf: [K.figuresPlanes], reglages: { faces: AU_PROGRAMME } },
    'solides-cm1': { classes: ['cm1', 'cm2'], slug: 'affiche-solides-cm1', sauf: [K.figuresPlanes], reglages: { faces: AU_PROGRAMME } },
  },
})

export default definition
export type Reglages = ReglagesDeAffiche<typeof definition>
