// L'extension « fiche sur mesure » : une page qui réunit des fiches de plusieurs exercices sur une feuille (src/impression/assemblage.ts). Cachée par défaut (`?assemblage=oui`).
import type { Extension } from '../extensions/types.ts'

export const extension: Extension = {
  id: 'assemblage',
  activation: { titre: 'assemblage.activer.titre', aide: 'assemblage.activer.aide', case: 'assemblage.activer.case', parSite: 'assemblage.activer.parSite' },
  ressources: [],
  reglages: { icone: 'fiches', titre: 'assemblage.reglage.titre', aide: 'assemblage.reglage.aide', composant: () => import('./LienAssemblage.vue') },
  routes: [{ path: '/assemblage', component: () => import('./AssemblageView.vue'), meta: { titre: 'assemblage.titre' } }],
}
