// L'état d'une page de fiches prêtes (liste d'une matière, index global) : l'index des fiches, les critères de filtre, les
// résultats. Les classes viennent du contexte (adresse d'abord) ; « toutes les classes » est un choix de la page seule. Les
// autres critères (texte, domaine, langue) restent à la page : ils ne sont ni dans l'adresse ni mémorisés. L'usage (`?usage=afficher|sentrainer`) et « toutes les
// classes » (`?toutes=oui`) sont dans l'adresse : un lien direct vers un filtre (src/telechargements/pages.ts).
//   const page = useFichesPage(() => 'maths')   // ou () => null : toutes les matières
//   page.resultats, page.criteres, page.choisirClasse(c), page.effacer()
import { computed, reactive, ref, watch } from 'vue'
import type { ComputedRef, Reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useContexte } from '../contexte/useContexte.ts'
import { AVEC_DEV } from '../dev.ts'
import { confianceMin } from '../langues/confianceReglage.ts'
import type { Classe, EntreeIndex, Matiere } from './types.ts'
import { useFiches } from './useFiches.ts'
import { CRITERES_PAGE_VIDES, domainesProposes, filtrerFiches, languesProposees, toutesLesClassesDeLAdresse, usageDeLAdresse, usageEnAdresse } from './pages.ts'
import type { CriteresPage } from './pages.ts'

export interface OptionsFichesPage {
  /** montrer d'abord les fiches de toutes les classes (l'index global), au lieu de celles du contexte */
  toutesLesClasses?: boolean
}

/** Les critères que l'utilisateur règle dans la page (les classes sont à part). */
type CriteresSaisis = Omit<CriteresPage, 'classes'>

export function useFichesPage(matiere: () => Matiere | null, { toutesLesClasses = false }: OptionsFichesPage = {}) {
  const { etat, index, vide, recharger } = useFiches()
  const { contexte, choisirClasses, ajouterClasse, retirerClasse, plusieursClasses, verrouillee } = useContexte()
  const route = useRoute()
  const router = useRouter()
  const saisis: Reactive<CriteresSaisis> = reactive({ texte: CRITERES_PAGE_VIDES.texte, usage: usageDeLAdresse(route.query.usage), domaine: CRITERES_PAGE_VIDES.domaine, langue: CRITERES_PAGE_VIDES.langue })
  const toutes = ref(toutesLesClasses || toutesLesClassesDeLAdresse(route.query.toutes))
  // une adresse qu'on ouvre ou qu'on suit (précédent, lien) règle les critères ; un choix de la page écrit l'adresse (ci-dessous)
  watch(() => route.query.usage, v => { saisis.usage = usageDeLAdresse(v) })
  watch(() => route.query.toutes, v => { toutes.value = toutesLesClasses || toutesLesClassesDeLAdresse(v) })
  /** Écrit des paramètres de la page dans l'adresse (`undefined` : le retire), sans toucher aux autres ; `replace` : pas de pile d'historique. */
  async function ecrireAdresse(parametres: Readonly<Record<string, string | undefined>>): Promise<void> {
    const query = { ...route.query }
    for (const [cle, valeur] of Object.entries(parametres)) {
      if (valeur === undefined) delete query[cle]
      else query[cle] = valeur
    }
    await router.replace({ query })
  }

  const modeEtLangue = computed(() => ({ mode: contexte.value.mode, regionale: contexte.value.regionale }))
  const classes = computed<readonly Classe[]>(() => (toutes.value ? [] : contexte.value.classes))
  /** niveau de confiance minimum appliqué ; en développement, rien n'est caché (les cartes marquent ce que le réglage cacherait) */
  const seuilConfiance = computed(() => (AVEC_DEV ? 0 : confianceMin.value))
  const avec = (c: Partial<CriteresPage>): CriteresPage => ({ ...saisis, classes: classes.value, confianceMin: seuilConfiance.value, ...c })

  /** les fiches de la matière dans le mode, pour les classes choisies, sans le filtre de langue (qui en fixe les choix) */
  const avantLangue = computed<EntreeIndex[]>(() => (index.value ? filtrerFiches(index.value, matiere(), avec({ langue: '' }), modeEtLangue.value) : []))
  const langues = computed(() => languesProposees(avantLangue.value, contexte.value.mode))
  const domaines = computed(() => (index.value ? domainesProposes(index.value, matiere(), avantLangue.value) : []))
  /** les critères en vigueur : un choix qui n'est plus proposé (changement de mode, de classe) ne filtre plus */
  const criteres = computed<CriteresPage>(() => avec({
    langue: langues.value.includes(saisis.langue) ? saisis.langue : '',
    domaine: domaines.value.some(d => (d.id ?? 'hors-programme') === saisis.domaine) ? saisis.domaine : '',
  }))
  const resultats: ComputedRef<EntreeIndex[]> = computed(() => (index.value ? filtrerFiches(index.value, matiere(), criteres.value, modeEtLangue.value) : []))
  /** fiches cachées par le réglage de fiabilité des traductions (pour le dire, et proposer de le changer) */
  const nbMasqueesConfiance = computed(() => {
    if (!index.value) return 0
    const toutes = filtrerFiches(index.value, matiere(), avec({ ...criteres.value, confianceMin: 0 }), modeEtLangue.value)
    return toutes.length - resultats.value.length
  })
  const filtre = computed(() => !!(saisis.texte || saisis.usage || criteres.value.domaine || criteres.value.langue) || toutes.value !== toutesLesClasses)

  /** classes mises en évidence sur les cartes : celles du contexte, sauf si la page montre toutes les classes */
  const selection = computed<readonly Classe[]>(() => (toutes.value ? [] : contexte.value.classes))
  /** les langues des fiches ne s'affichent que si le mode en propose plusieurs */
  const bilingue = computed(() => contexte.value.mode === 'bilingue')
  const classeActive = (c: Classe): boolean => !toutes.value && contexte.value.classes.includes(c)
  /** Choisit la classe : un parent n'en a qu'une ; un enseignant ajoute ou retire (jamais moins d'une). */
  async function choisirClasse(c: Classe): Promise<void> {
    if (verrouillee.value) return
    const etaitToutes = toutes.value
    const dejaLa = classeActive(c)
    toutes.value = false
    await ecrireAdresse({ toutes: undefined })
    if (plusieursClasses.value && !etaitToutes) await (dejaLa ? retirerClasse(c) : ajouterClasse(c))
    else await choisirClasses([c])
  }
  const choisirToutes = (): void => {
    toutes.value = true
    void ecrireAdresse({ toutes: toutesLesClasses ? undefined : 'oui' })
  }
  /** Règle un ou plusieurs critères saisis (texte, usage, domaine, langue). */
  const regler = (c: Partial<CriteresSaisis>): void => {
    Object.assign(saisis, c)
    if (c.usage !== undefined) void ecrireAdresse({ usage: usageEnAdresse(c.usage) })
  }
  function effacer(): void {
    saisis.texte = ''; saisis.usage = ''; saisis.domaine = ''; saisis.langue = ''
    toutes.value = toutesLesClasses
    void ecrireAdresse({ usage: undefined, toutes: undefined })
  }

  // `reactive` : les composants reçoivent l'objet en entier et lisent `page.resultats`, sans `.value`
  return reactive({ etat, index, vide, recharger, contexte, saisis, criteres, resultats, filtre, nbMasqueesConfiance, langues, domaines, toutes, selection, bilingue, classeActive, choisirClasse, choisirToutes, regler, effacer, verrouillee })
}

export type PageFiches = ReturnType<typeof useFichesPage>
