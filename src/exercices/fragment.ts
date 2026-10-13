// La fiche d'un exercice du registre sous forme de fragment (src/impression/fragment.ts), pour l'assemblage de fiches : les mêmes `questionsFiche` et `fiche` que l'app et le build
// des PDF, avec les réglages d'un niveau (défauts, plus ceux qu'on donne). Pur (lisible par node). Un exercice sans fiche (pas de `questionsFiche`) n'est pas assemblable.
import { reglagesDuNiveau } from '../noyau/reglages.ts'
import { creerRng } from '../utils/hasard.ts'
import { fragmentDe } from '../impression/fragment.ts'
import type { Fragment } from '../impression/fragment.ts'
import { traducteurExercice } from './traducteur.ts'
import type { ModuleQuelconque } from './index.ts'

export interface DemandeFragment {
  niveau: string
  graine: number
  langue: string
  /** réglages à reprendre aux défauts du niveau (valeurs valides, ramenées aux options proposées) */
  reglages?: Record<string, unknown>
  /** la préférence des extensions (ParamsFiche.extensions) */
  extensions?: Readonly<Record<string, unknown>>
}

/** L'exercice a-t-il une fiche que l'on peut assembler ? */
export const estAssemblable = (m: ModuleQuelconque): boolean => typeof m.generateur?.questionsFiche === 'function' && typeof m.fiche?.fiche === 'function'

/** Le fragment de la fiche d'un exercice : mêmes appels que le build des PDF (`questionsFiche` puis `fiche`). */
export function fragmentDeExercice(m: ModuleQuelconque, { niveau, graine, langue, reglages = {}, extensions }: DemandeFragment): Fragment {
  const config = reglagesDuNiveau(m.definition, { ...reglages, niveau })
  const T = traducteurExercice(m.textes, langue)
  const questions = m.generateur.questionsFiche({ niveau: config.niveau, reglages: config, rng: creerRng(graine), T, langue })
  return fragmentDe(() => m.fiche.fiche({ questions, reglages: config, T, langue, extensions }))
}
