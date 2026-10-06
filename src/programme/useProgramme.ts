// État de la page « Programme » : ce que l'adresse dit (matière, domaine, présentation), le contexte (classes, références), les
// lignes du tableau et les actions qui réécrivent l'adresse (`router.replace` : pas d'entrée d'historique pour un filtre).
//   const { etat, lignes, choisirMatiere, … } = useProgramme()
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useContexte } from '../contexte/useContexte.ts'
import { extraireParamsContexte } from '../contexte/url.ts'
import { useRessources } from '../ressources/useRessources.ts'
import { adresseProgramme, completerLien } from './adresse.ts'
import { PARAMS_DE_LA_PAGE, affichageEffectif, ecrireEtatProgramme, lireEtatProgramme } from './etat.ts'
import type { Affichage, EtatProgramme, MatiereProgramme } from './etat.ts'
import { lignesDuProgramme } from './tableau.ts'

export function useProgramme() {
  const route = useRoute()
  const router = useRouter()
  const { contexte, lienTableau } = useContexte()
  const { catalogue } = useRessources()

  const etat = computed<EtatProgramme>(() => lireEtatProgramme(route.query, contexte.value.classes))

  const affichage = computed<Affichage>(() => affichageEffectif(etat.value))
  const lignes = computed(() => (etat.value.domaine ? lignesDuProgramme(etat.value.domaine, contexte.value.classes, catalogue.value) : []))

  /** Réécrit les paramètres propres à la page, en gardant le reste de l'adresse (contexte compris). */
  const ecrire = (suivant: EtatProgramme): Promise<unknown> => {
    const autres = Object.fromEntries(Object.entries(route.query).filter(([k]) => !PARAMS_DE_LA_PAGE.includes(k)))
    return router.replace({ query: { ...autres, ...ecrireEtatProgramme(suivant) } })
  }

  /** Les domaines possibles dépendent de la matière : on retombe sur le premier (la lecture le fait). */
  const choisirMatiere = (matiere: MatiereProgramme): Promise<unknown> => ecrire({ matiere, domaine: null, affichage: etat.value.affichage })
  const choisirDomaine = (domaine: string): Promise<unknown> => ecrire({ ...etat.value, domaine: domaine as EtatProgramme['domaine'] })
  const choisirAffichage = (suivant: Affichage): Promise<unknown> => ecrire({ ...etat.value, affichage: suivant })

  /** Adresse absolue qui rouvre exactement cette vue (classes, matière, domaine, présentation, références). */
  const lienDeCetteVue = (): string =>
    completerLien(lienTableau(), { ...ecrireEtatProgramme({ ...etat.value, affichage: affichage.value }), refs: contexte.value.refs ? '1' : '0' })
  const reportes = computed(() => extraireParamsContexte(route.query))
  const adresseDeCetteVue = computed(() => adresseProgramme(etat.value, contexte.value.classes, reportes.value))

  return { etat, affichage, lignes, reportes, adresseDeCetteVue, choisirMatiere, choisirDomaine, choisirAffichage, lienDeCetteVue }
}
