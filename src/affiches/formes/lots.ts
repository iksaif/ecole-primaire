// Ce que montre chaque variante de l'affiche des figures et des solides : son type et les identifiants de ses dessins
// (src/dessins/figures.ts pour les figures planes, src/dessins/solides.ts pour les solides), dans l'ordre de la feuille.
// Les listes suivent celles de programme.ts par année (CP : disque, carré, rectangle, triangle ; CM1 : + losange, triangles
// particuliers ; CM2 : + trapèze, pentagone, hexagone ; solides : prisme droit au CM1).
import type { FigureIcone } from '../../dessins/figures.ts'
import type { SolideId } from '../../dessins/solides.ts'
import type { NomEmoji } from '../../images/tables.ts'

/**
 * Un lot de solides peut montrer, sous le nom de chacun, un objet de tous les jours (`objets`, un emoji OpenMoji) ; `sansLegende` : pas de
 * ligne « arêtes cachées en pointillés » (maternelle : on nomme et on reconnaît, on ne décrit pas).
 */
export type Lot = { type: 'figures', liste: readonly FigureIcone[] }
  | { type: 'solides', liste: readonly SolideId[], objets?: Readonly<Partial<Record<SolideId, NomEmoji>>>, sansLegende?: boolean }

const FORMES_PLANES: Lot = { type: 'figures', liste: ['disque', 'carre', 'rectangle', 'triangle'] }

export const LOTS: Readonly<Record<string, Lot>> = {
  'plan-cycle2': FORMES_PLANES,
  'plan-gs': FORMES_PLANES,
  'plan-ce1': FORMES_PLANES,
  'plan-cm1': { type: 'figures', liste: ['carre', 'rectangle', 'losange', 'triangle', 'triangle-rectangle', 'isocele', 'equilateral', 'disque'] },
  'plan-cycle3': { type: 'figures', liste: ['carre', 'rectangle', 'losange', 'triangle', 'triangle-rectangle', 'isocele', 'equilateral', 'trapeze', 'pentagone', 'hexagone', 'disque'] },
  // maternelle (MS, GS) : les six solides, chacun avec un objet que l'enfant connaît (la pyramide n'en a pas parmi les emojis)
  'solides-maternelle': { type: 'solides', liste: ['cube', 'pave', 'boule', 'cylindre', 'cone', 'pyramide'], sansLegende: true,
    objets: { cube: 'de', pave: 'boite', boule: 'ballon', cylindre: 'conserve', cone: 'glace' } },
  'solides-ce2': { type: 'solides', liste: ['cube', 'pave', 'boule', 'cylindre', 'cone', 'pyramide'] },
  'solides-cm1': { type: 'solides', liste: ['cube', 'pave', 'prisme', 'pyramide', 'cylindre', 'cone', 'boule'] },
}
