// Les états de l'eau : la glace, l'eau, la vapeur, avec la double flèche de ce qui fond et de ce qui gèle. Programme de la maternelle (eau-etats). Dessin : cartes.ts.
import { definirAffiche } from '../definir.ts'
import { D, K } from '../../noyau/ids.ts'
import { CODES } from '../../langues/registre.ts'
import type { ReglagesDeAffiche } from '../types.ts'

const definition = definirAffiche({
  id: 'eau',
  domaine: D.matiere,
  emoji: '💧',
  langues: CODES,
  bilingue: true,
  orientations: ['landscape', 'portrait'],
  formats: ['A4', 'A3'],
  competences: [K.eauEtats],
  variantes: {
    etats: { classes: ['ms', 'gs'], slug: 'affiche-les-etats-de-l-eau' },
  },
})

export default definition
export type Reglages = ReglagesDeAffiche<typeof definition>
