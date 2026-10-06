// L'état de la palette de recherche : le texte tapé, le filtre de classe, les résultats et l'option active.
//   const r = useRecherche()   // r.saisie (v-model du champ), r.groupes, r.actif, r.choisir(ligne)…
// L'index se construit à l'ouverture (catalogue réel, compétences du programme, pages de la table des routes) et se refait si
// le catalogue ou la langue changent ; fermée, la palette ne coûte rien. Le texte est pris en compte après un court délai (la
// frappe reste fluide) ; rouvrir la palette repart de zéro, classe courante seulement.
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useContexte } from '../contexte/useContexte.ts'
import { AVEC_DEV } from '../dev.ts'
import { useLangue } from '../langues/useLangue.ts'
import { ressourcesCompetences } from '../ressources/catalogue.ts'
import { useRessources } from '../ressources/useRessources.ts'
import { deplacer } from './clavier.ts'
import { chercher, construireIndexRecherche } from './index.ts'
import type { EntreeRecherche } from './index.ts'
import { fermerRecherche, rechercheOuverte } from './palette.ts'
import { pagesDuSite } from './pages.ts'
import { aplatir, groupesAffiches } from './resultats.ts'

const DELAI_MS = 90

export function useRecherche() {
  const router = useRouter()
  const { catalogue } = useRessources()
  const { contexte } = useContexte()
  const { langueAffichee, t } = useLangue()

  const saisie = ref('')
  const requete = ref('')
  const toutesLesClasses = ref(false)
  const position = ref(0)

  const index = computed(() => (rechercheOuverte.value
    ? construireIndexRecherche(catalogue.value, ressourcesCompetences(AVEC_DEV), pagesDuSite(router.getRoutes()), langueAffichee.value)
    : []))
  const classes = computed(() => contexte.value.classes)
  const classesTexte = computed(() => classes.value.map(c => c.toUpperCase()).join(', '))
  const trouves = computed(() => chercher(index.value, requete.value, { classes: classes.value, toutesLesClasses: toutesLesClasses.value }))
  const groupes = computed(() => groupesAffiches(trouves.value.groupes))
  const lignes = computed(() => aplatir(groupes.value))
  const masques = computed(() => trouves.value.masques)
  const aRequete = computed(() => requete.value.trim() !== '')
  /** Phrase lue par le lecteur d'écran à chaque changement de résultats. */
  const annonce = computed(() => {
    if (!aRequete.value) return ''
    const n = trouves.value.groupes.reduce((somme, g) => somme + g.resultats.length, 0)
    return t('recherche.nombre', { n }) + (masques.value ? `, ${t('recherche.masques', { n: masques.value })}` : '')
  })

  let minuteur: ReturnType<typeof setTimeout> | undefined
  watch(saisie, v => {
    clearTimeout(minuteur)
    minuteur = setTimeout(() => { requete.value = v }, v.trim() ? DELAI_MS : 0)
  })
  watch([requete, toutesLesClasses], () => { position.value = 0 })
  // la remise à zéro se fait à la fermeture : à l'ouverture le champ est déjà vide quand on commence à taper
  watch(rechercheOuverte, ouverte => {
    if (ouverte) return
    clearTimeout(minuteur)
    saisie.value = ''; requete.value = ''; toutesLesClasses.value = false; position.value = 0
  })

  /** Passe à l'option suivante ou précédente. */
  const aller = (pas: 1 | -1): void => { position.value = deplacer(position.value, lignes.value.length, pas) }
  /** Ouvre une ressource : la palette se ferme, le routeur reporte la classe et le mode de l'adresse courante. */
  const choisir = (entree: EntreeRecherche): void => {
    fermerRecherche(false)
    void router.push(entree.route)
  }
  const choisirActive = (): void => { const l = lignes.value[position.value]; if (l) choisir(l.entree) }

  return { saisie, requete, toutesLesClasses, position, classesTexte, groupes, lignes, masques, aRequete, annonce, aller, choisir, choisirActive }
}
