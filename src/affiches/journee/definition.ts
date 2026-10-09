// La journée : les moments (matin, midi, soir, nuit) ou la journée de l'enfant en six étapes (petit-déjeuner, école, déjeuner, goûter, dîner, dodo),
// dans l'ordre, d'une flèche à la suivante. Repères de temps de la maternelle (moments-journee, chronologie-maternelle). Dessin : cartes.ts.
import { definirAffiche } from '../definir.ts'
import { D, K } from '../../noyau/ids.ts'
import { CODES } from '../../langues/registre.ts'
import type { ReglagesDeAffiche } from '../types.ts'

const definition = definirAffiche({
  id: 'journee',
  domaine: D.tempsEspace,
  emoji: '🌅',
  langues: CODES,
  bilingue: true,
  orientations: ['landscape', 'portrait'],
  formats: ['A4', 'A3'],
  competences: [K.momentsJournee, K.chronologieMaternelle],
  variantes: {
    // PS : le matin et le soir, le jour et la nuit ; MS : le matin, le midi, l'après-midi, le soir, la nuit (BO 2021, p. 24)
    'jour-nuit': { classes: ['ps'], slug: 'affiche-matin-soir-jour-nuit' },
    moments: { classes: ['ms'], slug: 'affiche-moments-de-la-journee' },
    routine: { classes: ['ps', 'ms', 'gs'], slug: 'affiche-ma-journee' },
  },
})

export default definition
export type Reglages = ReglagesDeAffiche<typeof definition>
