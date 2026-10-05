// Le breton (orthographe peurunvan) : langue d'interface (traduction automatique, à relire) et langue régionale.
import type { LangueDef } from '../types.ts'
import textes from './textes/index.ts'
import { reglesBr } from './regles.ts'
import { drapeauBr } from './drapeau.ts'
import { donneesBr } from './donnees.ts'

export default {
  code: 'br',
  bcp47: 'br',
  nom: { fr: 'breton', br: 'brezhoneg' },
  nomLocal: 'brezhoneg',
  drapeau: drapeauBr,
  regles: reglesBr,
  textes,
  // les navigateurs n'ont pas de voix bretonne
  // la traduction de l'interface a-t-elle été relue par un locuteur ? (sinon, l'avis de traduction automatique s'affiche)
  traductionRelue: false,
  voix: { disponible: false, bcp47: 'br' },
  donnees: donneesBr,
  programme: null,
} as const satisfies LangueDef
