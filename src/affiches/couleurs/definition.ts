// Les couleurs : une carte par couleur (un aplat, avec un objet de cette couleur). Vocabulaire de la maternelle (PS, MS, GS) ; en français, en breton, ou les deux.
// Les huit couleurs de base, ou avec le noir, le blanc et le gris. Dessin : cartes.ts (images OpenMoji : src/images/).
import { definirAffiche, choix } from '../definir.ts'
import { D, K } from '../../noyau/ids.ts'
import { CODES } from '../../langues/registre.ts'
import type { ReglagesDeAffiche } from '../types.ts'

const definition = definirAffiche({
  id: 'couleurs',
  domaine: D.oral,
  emoji: '🎨',
  langues: CODES,
  bilingue: true,
  orientations: ['landscape', 'portrait'],
  formats: ['A4', 'A3'],
  competences: [K.vocabulaireMaternelle],
  reglages: { neutres: choix([false, true]) },
  variantes: {
    couleurs: { classes: ['ps', 'ms', 'gs'], slug: 'affiche-couleurs' },
  },
})

export default definition
export type Reglages = ReglagesDeAffiche<typeof definition>
