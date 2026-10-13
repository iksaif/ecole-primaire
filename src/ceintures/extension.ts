// L'extension « ceintures » : ce qu'elle accroche aux parties communes (src/extensions/types.ts). Tout le reste de la fonctionnalité est dans ce dossier.
import { assainirCeintures } from './reglages.ts'
import { useCeintures } from './useCeintures.ts'
import type { Extension } from '../extensions/types.ts'
import type { ReglagesCeintures } from './types.ts'

export const extension: Extension = {
  id: 'ceintures',
  activation: { titre: 'ceintures.activer.titre', aide: 'ceintures.activer.aide', case: 'ceintures.activer.case', parSite: 'ceintures.activer.parSite' },
  // les activités que l'extension ajoute au catalogue : masquées des listes tant qu'elle n'est pas active
  ressources: ['exercice:ceintures', 'exercice:ceintures-brevet'],
  optionsFiche: () => import('./ChoixCeintures.vue'),
  contexteFiche: () => useCeintures().value,
  reglages: { icone: 'trophee', titre: 'ceintures.reglage.titre', aide: 'ceintures.reglage.aide', composant: () => import('./ReglagesCeintures.vue') },
}

/** Les réglages communs des ceintures que reçoit une fiche (`ParamsFiche.extensions`) ; absents (build des PDF publiés, instantanés) : le défaut. */
export function reglagesCeintures(extensions: Readonly<Record<string, unknown>> | undefined): ReglagesCeintures {
  return assainirCeintures(extensions?.ceintures)
}
