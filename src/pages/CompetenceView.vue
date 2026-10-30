<template>
  <div v-if="competence" class="container" data-page="competence">
    <BandeauConstruction />
    <FilAriane :maillons="maillons" :etiquette="t('competence.fil')" />
    <h1 class="section-heading" :lang="LANGUE_SOURCE"><span aria-hidden="true"><Icone nom="competence" /></span> {{ competence.libelle }}</h1>

    <p class="meta">
      <span><Icone :nom="EMOJI_DOMAINE[competence.domaine]" /> {{ t('competence.domaine') }} : <strong>{{ nomDuDomaine(competence.domaine, langueAffichee) }}</strong></span>
      <RouterLink v-if="matiere" :to="`/${matiere}`">{{ t('competence.voirMatiere') }}</RouterLink>
    </p>
    <CompetencePosition :position="position" :domaine="nomDuDomaine(competence.domaine, langueAffichee)" :vers="versCompetence" />
    <p class="meta classes">
      <span><span aria-hidden="true"><Icone nom="classe" /></span> {{ t('competence.classes') }} :</span>
      <RouterLink v-for="c in competence.niveaux" :key="c" class="classe" :class="{ choisie: contexte.classes.includes(c) }"
        :to="adresseCompetence(competence.id, c, reportes)" :aria-current="contexte.classes.includes(c) ? 'true' : undefined">{{ c.toUpperCase() }}</RouterLink>
    </p>

    <CompetenceOfficiel :reference="referenceDe(competence.source)" :interpretation="interpretationDe(competence)" :lecture="lectureDisponible(competence.source.texte) ? adresseDeLaPage(competence.source.texte, competence.source.page, competence.id) : undefined" />
    <CompetenceRessources :ressources="ressources" :classes="contexte.classes" :competence="competence.libelle" />

    <CompetenceDomaine :position="position" :courante="competence.id" :nombres="nombres" :vers="versCompetence" :vers-le-programme="adresseDuProgramme" />
    <CompetenceAutresClasses :autres="autresClasses" :vers="versCompetenceEnClasse" :vers-le-programme="versProgrammeDeClasse" />
    <CompetenceTexte :place="placeDansLeTexte" :vers="versCompetence" :vers-le-texte="adresseDuTexte" />
  </div>
  <div v-else class="container" data-page="competence">
    <h1 class="section-heading">{{ t('competence.inconnue.titre') }}</h1>
    <p>{{ t('competence.inconnue.message') }} <RouterLink to="/programme">{{ t('competence.inconnue.retour') }}</RouterLink></p>
  </div>
</template>

<script setup lang="ts">
import Icone from '../images/Icone.vue'
// Page d'une compétence (/competence/:id) : le point d'arrivée d'une case du programme. L'intitulé, le domaine, les classes, le
// texte officiel (page du PDF et extrait), toutes les ressources liées, les compétences voisines. Titre du document : l'intitulé.
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useContexte } from '../contexte/useContexte.ts'
import { extraireParamsContexte } from '../contexte/url.ts'
import type { Classe } from '../data/classes.ts'
import { competenceDe, domaineDe } from '../data/programme.ts'
import type { CompetenceId } from '../data/programme.ts'
import { LANGUE_SOURCE } from '../langues/registre.ts'
import { useLangue } from '../langues/useLangue.ts'
import BandeauConstruction from '../shell/BandeauConstruction.vue'
import FilAriane from '../shell/FilAriane.vue'
import type { Maillon } from '../shell/FilAriane.vue'
import CompetenceAutresClasses from '../programme/CompetenceAutresClasses.vue'
import CompetenceDomaine from '../programme/CompetenceDomaine.vue'
import CompetenceOfficiel from '../programme/CompetenceOfficiel.vue'
import CompetencePosition from '../programme/CompetencePosition.vue'
import CompetenceTexte from '../programme/CompetenceTexte.vue'
import { classeDeLecture, dansLesAutresClasses, nombreDeRessources, placeDansLeTexte as placerDansLeTexte, positionDansLeDomaine } from '../programme/navigation.ts'
import CompetenceRessources from '../programme/CompetenceRessources.vue'
import { adresseCompetence, adresseProgramme } from '../programme/adresse.ts'
import { ADRESSE_PROGRAMME_OFFICIEL, adresseDeLaPage, lectureDisponible } from '../programme/officiel.ts'
import { MATIERES_PROGRAMME } from '../programme/etat.ts'
import { nomDuDomaine } from '../programme/noms.ts'
import { interpretationDe, referenceDe } from '../programme/references.ts'
import { useNonIndexable } from '../router/useNonIndexable.ts'
import { ressourcesDeCompetence } from '../ressources/filtres.ts'
import { EMOJI_DOMAINE } from '../ressources/emojis.ts'
import { useAffichable } from '../ressources/useAffichable.ts'
import { useTitreDePage } from '../router/titres.ts'

const { t, langueAffichee } = useLangue()
const route = useRoute()
const { contexte } = useContexte()
const { affichables: catalogue } = useAffichable()

const competence = computed(() => competenceDe(String(route.params.id)))
useNonIndexable(() => !competence.value)
const domaine = computed(() => (competence.value ? domaineDe(competence.value.domaine) : null))
// la page de la matière (la langue régionale n'a pas de page de ce nom : pas de lien)
const matiere = computed(() => MATIERES_PROGRAMME.find(m => m === domaine.value?.matiere) ?? null)
const reportes = computed(() => extraireParamsContexte(route.query))
const ressources = computed(() => (competence.value ? ressourcesDeCompetence(catalogue.value, competence.value.id as CompetenceId) : []))

// ── Se repérer : la classe lue, la place dans le domaine, les autres classes, le texte officiel ──
// (le gabarit n'affiche ces blocs que pour une compétence connue : `competence.value!` y est sûr)
const classe = computed(() => classeDeLecture(competence.value!, contexte.value.classes))
const position = computed(() => positionDansLeDomaine(competence.value!, classe.value))
const autresClasses = computed(() => dansLesAutresClasses(competence.value!.domaine, classe.value))
const placeDansLeTexte = computed(() => placerDansLeTexte(competence.value!))
const nombres = computed(() => nombreDeRessources(catalogue.value))

const versCompetence = (id: string): string => adresseCompetence(id, null, reportes.value)
const versCompetenceEnClasse = (id: string, c: Classe): string => adresseCompetence(id, c, reportes.value)
/** le programme d'une classe, sur le domaine de la compétence */
const versProgrammeDeClasse = (c: Classe): string => adresseProgramme(
  { matiere: matiere.value ?? 'maths', domaine: competence.value?.domaine ?? null, affichage: null }, [c], reportes.value)
const adresseDuProgramme = computed(() => (competence.value
  ? versProgrammeDeClasse(classe.value)
  : adresseProgramme({ matiere: 'maths', domaine: null, affichage: null }, contexte.value.classes, reportes.value)))
const adresseDuTexte = computed(() => `${ADRESSE_PROGRAMME_OFFICIEL}#${competence.value?.source.texte ?? ''}`)

const maillons = computed((): Maillon[] => [
  { texte: t('competence.accueil'), vers: '/', icone: 'accueil' },
  { texte: t('competence.programme'), vers: adresseDuProgramme.value, icone: 'programme' },
  ...(competence.value ? [{ texte: nomDuDomaine(competence.value.domaine, langueAffichee.value), emoji: EMOJI_DOMAINE[competence.value.domaine], vers: adresseDuProgramme.value }] : []),
])

useTitreDePage(() => (competence.value ? competence.value.libelle : t('competence.inconnue.titre')))
</script>

<style scoped>
.container :deep(a:not(.classe):not(.case)) { color: var(--bleu-fort); }
.meta { display: flex; flex-wrap: wrap; align-items: center; gap: .4rem .9rem; margin: .4rem 0 .8rem; }
.classes { gap: .4rem; }
.classe { min-width: 2.75rem; min-height: 2.75rem; display: inline-flex; align-items: center; justify-content: center; border-radius: 999px; border: 2px solid var(--gris-brd); background: #fff; font-weight: 700; text-decoration: none; color: var(--texte); }
.classe.choisie { background: var(--bleu-fort); border-color: var(--bleu-fort); color: #fff; }
</style>
