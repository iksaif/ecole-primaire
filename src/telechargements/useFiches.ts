// Les fiches dans la page : `useFiches()` charge l'index une fois (partagé entre les pages), propose filtres et recherche ;
// `useFiche(slug)` charge le JSON d'une fiche. Tout ce qui touche au réseau passe par `chargement.ts` (un faux `chercher`
// suffit pour tester) ; ici, l'état réactif.
//   const { etat, index, criteres, resultats, groupes, effacer } = useFiches()
//   const { etat, entree } = useFiche(() => route.params.slug as string)
import { computed, reactive, shallowRef, watch } from 'vue'
import type { ComputedRef, Reactive, ShallowRef } from 'vue'
import { chargerEntree, chargerIndex } from './chargement.ts'
import type { Chercheur, EtatChargement } from './chargement.ts'
import { CRITERES_VIDES, filtrer, parDomaine } from './recherche.ts'
import type { Criteres } from './recherche.ts'
import type { Entree, EntreeIndex, IndexFiches } from './types.ts'

export interface OptionsFiches {
  /** remplace `fetch` (tests) ; sans lui, l'index est gardé en mémoire d'une page à l'autre */
  chercher?: Chercheur
  base?: string
  /** les entrées montrées (sinon toutes) : la page cache par exemple les fiches en langue régionale non activée */
  visible?: (e: EntreeIndex) => boolean
}

// index déjà chargé (ou en cours), pour que passer de la grille à une fiche et revenir ne le relise pas
let enMemoire: Promise<EtatChargement<IndexFiches>> | null = null
/** Oublie l'index gardé en mémoire (bouton « Réessayer », tests). */
export const oublierIndex = (): void => { enMemoire = null }

export function useFiches({ chercher, base, visible = () => true }: OptionsFiches = {}) {
  const etat: ShallowRef<EtatChargement<IndexFiches>> = shallowRef({ etat: 'chargement' })
  const criteres: Reactive<Criteres> = reactive({ ...CRITERES_VIDES })

  async function charger(): Promise<void> {
    etat.value = { etat: 'chargement' }
    if (chercher) { etat.value = await chargerIndex(chercher, base); return }
    enMemoire ??= chargerIndex(undefined, base)
    const lu = await enMemoire
    if (lu.etat !== 'pret') enMemoire = null   // un échec n'est pas gardé : « Réessayer » relit
    etat.value = lu
  }
  void charger()

  const index: ComputedRef<IndexFiches | null> = computed(() => (etat.value.etat === 'pret' ? etat.value.donnees : null))
  /** index lu mais sans aucune entrée : un site qui n'a encore rien publié (pas une erreur) */
  const vide = computed(() => index.value?.entrees.length === 0)
  const montrables = computed(() => index.value?.entrees.filter(visible) ?? [])
  /** entrées qui répondent aux critères */
  const resultats = computed(() => filtrer(montrables.value, criteres))
  /** les résultats par domaine puis par usage, comme la page les affiche */
  const groupes = computed(() => (index.value ? parDomaine(index.value, resultats.value) : []))
  /** entrées cachées par `visible` (pour proposer de les afficher) */
  const nbMasquees = computed(() => (index.value ? index.value.entrees.filter(e => e.parent === null && !visible(e)).length : 0))
  const filtre = computed(() => Object.entries(criteres).some(([cle, v]) => v !== CRITERES_VIDES[cle as keyof Criteres]))

  const effacer = (): void => { Object.assign(criteres, CRITERES_VIDES) }
  /** une entrée de l'index par son slug */
  const entreeDe = (slug: string): EntreeIndex | undefined => index.value?.entrees.find(e => e.slug === slug)

  return { etat, index, vide, criteres, resultats, groupes, nbMasquees, filtre, effacer, entreeDe, recharger: charger }
}

/** La fiche d'un slug : se recharge quand le slug change. */
export function useFiche(slug: () => string, { chercher, base }: Pick<OptionsFiches, 'chercher' | 'base'> = {}) {
  const etat: ShallowRef<EtatChargement<Entree>> = shallowRef({ etat: 'chargement' })
  const entree: ComputedRef<Entree | null> = computed(() => (etat.value.etat === 'pret' ? etat.value.donnees : null))
  watch(slug, async (s) => {
    etat.value = { etat: 'chargement' }
    const lu = await chargerEntree(s, chercher, base)
    if (s === slug()) etat.value = lu   // une réponse arrivée trop tard (on a changé de fiche) est ignorée
  }, { immediate: true })
  return { etat, entree }
}
