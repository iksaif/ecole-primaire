// Le corps : les parties du corps (douze cartes) ou les cinq sens avec leur organe. Programme de la maternelle (parties-corps, cinq-sens). Dessin : cartes.ts.
import { definirAffiche } from '../definir.ts'
import { D, K } from '../../noyau/ids.ts'
import { CODES } from '../../langues/registre.ts'
import type { ReglagesDeAffiche } from '../types.ts'

const definition = definirAffiche({
  id: 'corps',
  domaine: D.corpsSante,
  emoji: '🧍',
  langues: CODES,
  bilingue: true,
  orientations: ['landscape', 'portrait'],
  formats: ['A4', 'A3'],
  competences: [K.partiesCorps, K.cinqSens],
  variantes: {
    parties: { classes: ['ps', 'ms', 'gs'], slug: 'affiche-parties-du-corps' },
    // MS, GS : le corps entier avec le cou, le tronc et le ventre (puzzle du corps, BO 2021 p. 40)
    bonhomme: { classes: ['ms', 'gs'], slug: 'affiche-le-corps-humain' },
    sens: { classes: ['ps', 'ms', 'gs'], slug: 'affiche-les-cinq-sens' },
  },
})

export default definition
export type Reglages = ReglagesDeAffiche<typeof definition>
