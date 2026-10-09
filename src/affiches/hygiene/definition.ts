// L'hygiène : se laver les mains en cinq étapes numérotées (d'une flèche à la suivante) ou cinq gestes pour rester en forme (dents, sommeil, mouvement,
// repas, écrans). Programme de la maternelle (hygiene-vie). Dessin : cartes.ts.
import { definirAffiche } from '../definir.ts'
import { D, K } from '../../noyau/ids.ts'
import { CODES } from '../../langues/registre.ts'
import type { ReglagesDeAffiche } from '../types.ts'

const definition = definirAffiche({
  id: 'hygiene',
  domaine: D.corpsSante,
  emoji: '🧼',
  langues: CODES,
  bilingue: true,
  orientations: ['landscape', 'portrait'],
  formats: ['A4', 'A3'],
  competences: [K.hygieneVie],
  variantes: {
    mains: { classes: ['ps', 'ms', 'gs'], slug: 'affiche-se-laver-les-mains' },
    gestes: { classes: ['ps', 'ms', 'gs'], slug: 'affiche-gestes-pour-rester-en-forme' },
  },
})

export default definition
export type Reglages = ReglagesDeAffiche<typeof definition>
