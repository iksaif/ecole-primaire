// Le français : langue source de l'interface et du contenu.
import type { LangueDef } from '../types.ts'
import textes from './textes/index.ts'
import { reglesFr } from './regles.ts'
import { drapeauFr } from './drapeau.ts'

export default {
  code: 'fr',
  bcp47: 'fr-FR',
  nom: { fr: 'français', br: 'galleg' }, // br: à relire
  nomLocal: 'français',
  drapeau: drapeauFr,
  regles: reglesFr,
  textes,
  // la traduction de l'interface a-t-elle été relue par un locuteur ? (sinon, l'avis de traduction automatique s'affiche)
  traductionRelue: true,
  voix: { disponible: true, bcp47: 'fr-FR' },
  programme: null,
} as const satisfies LangueDef
