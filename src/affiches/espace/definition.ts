// Les repères d'espace : dans, sur, sous, devant, derrière, à côté. Une carte par repère, avec une petite scène (un chat et une boîte, une table ou un arbre).
// Programme de la maternelle (reperes-espace, PS, MS, GS). Dessin : dessin.ts (cartes : src/affiches/cartes.ts, images OpenMoji : src/images/).
import { definirAffiche } from '../definir.ts'
import { D, K } from '../../noyau/ids.ts'
import { CODES } from '../../langues/registre.ts'
import type { ReglagesDeAffiche } from '../types.ts'

const definition = definirAffiche({
  id: 'espace',
  domaine: D.tempsEspace,
  emoji: '📦',
  langues: CODES,
  bilingue: true,
  orientations: ['landscape', 'portrait'],
  formats: ['A4', 'A3'],
  competences: [K.reperesEspace],
  variantes: {
    reperes: { classes: ['ps', 'ms', 'gs'], slug: 'affiche-reperes-d-espace' },
  },
})

export default definition
export type Reglages = ReglagesDeAffiche<typeof definition>
