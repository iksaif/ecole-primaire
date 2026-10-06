// Le catalogue des ressources dans l'app : charge l'index des fiches prêtes (`fiches/index.json`) et les registres, puis expose
// `catalogue`, réactif. Le build du site ne dépend pas de l'index : s'il est absent ou illisible, le catalogue n'a que les
// exercices et les affiches, et `fiches` dit pourquoi (la page « fiches prêtes » affiche le bon message).
//   const { catalogue, fiches, pret } = useRessources()
// Les registres sont chargés à la demande (import dynamique : ils entraînent tous les générateurs, que la page d'accueil n'a pas
// à embarquer). Tout ce qui touche au réseau passe par `src/telechargements/chargement.ts` ; `creerRessources` accepte un faux
// `chercher` et des registres de test.
import { computed, shallowRef } from 'vue'
import type { ComputedRef, ShallowRef } from 'vue'
import { AVEC_DEV } from '../dev.ts'
import { SITE } from '../sites.ts'
import type { Site } from '../sites.ts'
import { chargerIndex } from '../telechargements/chargement.ts'
import type { Chercheur, EtatChargement } from '../telechargements/chargement.ts'
import type { IndexFiches } from '../telechargements/types.ts'
import { construireCatalogue } from './catalogue.ts'
import type { SourcesCatalogue } from './catalogue.ts'
import type { RessourceDeContenu } from './types.ts'

/** Les registres lus par le catalogue. */
export type Registres = Pick<SourcesCatalogue, 'exercices' | 'affiches'>

export interface OptionsRessources {
  /** remplace `fetch` (tests) */
  chercher?: Chercheur
  base?: string
  /** remplace les registres (tests) ; sinon les vrais, chargés à la demande */
  registres?: Registres
  site?: Pick<Site, 'languesInterface' | 'languesRegionales'>
  enDeveloppement?: boolean
}

export interface Ressources {
  /** exercices, affiches et fiches prêtes (vide tant que les registres se chargent) */
  catalogue: ComputedRef<readonly RessourceDeContenu[]>
  /** état de l'index des fiches prêtes : chargement, prêt, absent (build non lancé) ou erreur */
  fiches: ShallowRef<EtatChargement<IndexFiches>>
  /** les registres sont chargés (l'index des fiches peut encore arriver) */
  pret: ComputedRef<boolean>
  /** relit l'index des fiches (bouton « Réessayer ») */
  recharger: () => Promise<void>
}

/** Les vrais registres : un import dynamique chacun ; les exemples (affiches) seulement sous le contrôle de Vite (src/dev.ts). */
async function chargerRegistres(): Promise<Registres> {
  const [{ REGISTRE: exercices }, { REGISTRE: base }] = await Promise.all([import('../exercices/index.ts'), import('../affiches/index.ts')])
  // la condition est écrite ici avec les littéraux de Vite : sans elle, le module des exemples entrerait dans un build de production
  const exemples = (import.meta.env ? (import.meta.env.DEV || import.meta.env.VITE_AVEC_DEV) : AVEC_DEV) ? (await import('../affiches/dev.ts')).EXEMPLES : []
  return { exercices, affiches: [...base, ...exemples] }
}

/** Un catalogue réactif. Chaque appel charge ses données : l'app passe par `useRessources`, qui en partage un seul. */
export function creerRessources({ chercher, base, registres, site = SITE, enDeveloppement = AVEC_DEV }: OptionsRessources = {}): Ressources {
  const lus: ShallowRef<Registres | null> = shallowRef(null)
  const fiches: ShallowRef<EtatChargement<IndexFiches>> = shallowRef({ etat: 'chargement' })

  const recharger = async (): Promise<void> => {
    fiches.value = { etat: 'chargement' }
    fiches.value = await chargerIndex(chercher, base)
  }
  void recharger()
  void (registres ? Promise.resolve(registres) : chargerRegistres()).then(r => { lus.value = r })

  const catalogue = computed(() => (lus.value
    ? construireCatalogue({ ...lus.value, fiches: fiches.value.etat === 'pret' ? fiches.value.donnees : null, site, enDeveloppement })
    : []))
  return { catalogue, fiches, pret: computed(() => lus.value !== null), recharger }
}

let partage: Ressources | null = null

/** Le catalogue de l'app, chargé une fois pour toutes les pages. */
export function useRessources(): Ressources {
  partage ??= creerRessources()
  return partage
}
