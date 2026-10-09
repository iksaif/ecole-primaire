// Les cycles de vie : de l'œuf à la poule, de la graine à la fleur, en cercle (la flèche revient au début). Programme de la maternelle (cycle-vie-vivants). Dessin : cartes.ts.
import { definirAffiche } from '../definir.ts'
import { D, K } from '../../noyau/ids.ts'
import { CODES } from '../../langues/registre.ts'
import type { ReglagesDeAffiche } from '../types.ts'

const definition = definirAffiche({
  id: 'cycles',
  domaine: D.vivant,
  emoji: '🐣',
  langues: CODES,
  bilingue: true,
  orientations: ['landscape', 'portrait'],
  formats: ['A4', 'A3'],
  competences: [K.cycleVieVivants],
  variantes: {
    poule: { classes: ['ms', 'gs'], slug: 'affiche-cycle-de-vie-de-la-poule' },
    plante: { classes: ['ms', 'gs'], slug: 'affiche-cycle-de-vie-de-la-plante' },
  },
})

export default definition
export type Reglages = ReglagesDeAffiche<typeof definition>
