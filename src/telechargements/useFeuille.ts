// L'état de la feuille d'une fiche (/telechargements/<slug>) : la fiche (JSON), l'index (domaine, entrées sœurs), le catalogue
// (fiches voisines, exercice en ligne lié), et ce que le lecteur a choisi : l'exemplaire (variante), la page de l'aperçu, le format.
// Toute la logique de choix est dans pages.ts (pure) ; ici seulement l'état réactif.
//   const feuille = useFeuille(() => String(route.params.slug))
import { computed, reactive, ref, watch } from 'vue'
import { useRessources } from '../ressources/useRessources.ts'
import { memeFiche, matiereDe, pageVoisine, pdfDe, jeuDeLaFiche, proposeUnChoixDeFormat, voisinesDeFiche } from './pages.ts'
import type { EntreeIndex, Format } from './types.ts'
import { useFiche, useFiches } from './useFiches.ts'

export function useFeuille(slug: () => string) {
  const { etat, entree } = useFiche(slug)
  const { etat: etatIndex, index, entreeDe, recharger } = useFiches()
  const { catalogue, pret } = useRessources()

  const iVariante = ref(0)
  const iPage = ref(0)
  const formatChoisi = ref<Format | null>(null)
  // une autre fiche : on repart du début (premier exemplaire, première page, format par défaut)
  watch(slug, () => { iVariante.value = 0; iPage.value = 0; formatChoisi.value = null })

  const variante = computed(() => entree.value?.variantes[iVariante.value] ?? null)
  const nbPages = computed(() => variante.value?.pages.length ?? 0)
  const page = computed(() => variante.value?.pages[iPage.value] ?? null)
  const pdf = computed(() => (variante.value ? pdfDe(variante.value, formatChoisi.value) : null))
  const choixDeFormat = computed(() => !!variante.value && proposeUnChoixDeFormat(variante.value))

  const matiere = computed(() => (entree.value && index.value ? matiereDe(entree.value, index.value) : null))
  const domaine = computed(() => index.value?.filtres.domaines.find(d => d.id === entree.value?.domaine) ?? null)
  /** liens du programme officiel du domaine qui concernent les classes de la fiche */
  const programme = computed(() => domaine.value?.programme.filter(p => p.classes.some(c => entree.value?.niveaux.includes(c))) ?? [])
  const langues = computed(() => (entree.value && index.value ? memeFiche(entree.value, index.value.entrees) : []))

  const voisines = computed(() => (entree.value && pret.value ? voisinesDeFiche(entree.value, catalogue.value) : { competence: [], domaine: [] }))
  const entreesDe = (rs: readonly { slug: string }[]): EntreeIndex[] => rs.flatMap(r => entreeDe(r.slug) ?? [])
  const voisinesCompetence = computed(() => entreesDe(voisines.value.competence))
  const voisinesDomaine = computed(() => entreesDe(voisines.value.domaine))
  const jeu = computed(() => (entree.value && pret.value ? jeuDeLaFiche(entree.value, catalogue.value) ?? null : null))

  const choisirFormat = (f: Format): void => { formatChoisi.value = f }
  const aller = (delta: number): void => { iPage.value = pageVoisine(iPage.value, delta, nbPages.value) }
  const choisirVariante = (k: number): void => { iVariante.value = k; iPage.value = 0 }

  return reactive({
    etat, etatIndex, entree, index, recharger, iVariante, iPage, formatChoisi, variante, nbPages, page, pdf, choixDeFormat, matiere, domaine, programme,
    langues, voisinesCompetence, voisinesDomaine, voisinesPretes: pret, jeu, aller, choisirVariante, choisirFormat,
  })
}

export type Feuille = ReturnType<typeof useFeuille>
