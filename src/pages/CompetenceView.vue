<template>
  <div v-if="competence" class="container" data-page="competence">
    <BandeauConstruction />
    <FilAriane :maillons="maillons" :etiquette="t('competence.fil')" />
    <h1 class="section-heading" :lang="LANGUE_SOURCE"><span aria-hidden="true">{{ EMOJI.competence }}</span> {{ competence.libelle }}</h1>

    <p class="meta">
      <span>{{ EMOJI_DOMAINE[competence.domaine] }} {{ t('competence.domaine') }} : <strong>{{ nomDuDomaine(competence.domaine, langueAffichee) }}</strong></span>
      <RouterLink v-if="matiere" :to="`/${matiere}`">{{ t('competence.voirMatiere') }}</RouterLink>
    </p>
    <p class="meta classes">
      <span><span aria-hidden="true">{{ EMOJI.classe }}</span> {{ t('competence.classes') }} :</span>
      <RouterLink v-for="c in competence.niveaux" :key="c" class="classe" :class="{ choisie: contexte.classes.includes(c) }"
        :to="adresseCompetence(competence.id, c, reportes)" :aria-current="contexte.classes.includes(c) ? 'true' : undefined">{{ c.toUpperCase() }}</RouterLink>
    </p>

    <CompetenceOfficiel :reference="referenceDe(competence.source)" :interpretation="interpretationDe(competence)" />
    <CompetenceRessources :ressources="ressources" :classes="contexte.classes" />

    <section aria-labelledby="h-voisines" class="voisines">
      <h2 id="h-voisines">{{ t('competence.voisines.titre') }} <span class="precision">({{ t('competence.voisines.precision') }})</span></h2>
      <ul v-if="voisines.length" class="liste">
        <li v-for="k in voisines" :key="k.id">
          <RouterLink :to="adresseCompetence(k.id, null, reportes)" :lang="LANGUE_SOURCE"><span aria-hidden="true">{{ EMOJI.competence }}</span> {{ k.libelle }}</RouterLink>
          <span class="niveaux"> · {{ texteClasses(k.niveaux) }}</span>
        </li>
      </ul>
      <p v-else class="vide">{{ t('competence.voisines.aucune') }}</p>
      <p v-if="aPlusDeVoisines" class="toutes"><RouterLink :to="adresseDuProgramme">{{ t('competence.voisines.toutes') }}</RouterLink></p>
    </section>
  </div>
  <div v-else class="container" data-page="competence">
    <h1 class="section-heading">{{ t('competence.inconnue.titre') }}</h1>
    <p>{{ t('competence.inconnue.message') }} <RouterLink to="/programme">{{ t('competence.inconnue.retour') }}</RouterLink></p>
  </div>
</template>

<script setup lang="ts">
// Page d'une compétence (/competence/:id) : le point d'arrivée d'une case du programme. L'intitulé, le domaine, les classes, le
// texte officiel (page du PDF et extrait), toutes les ressources liées, les compétences voisines. Titre du document : l'intitulé.
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useContexte } from '../contexte/useContexte.ts'
import { extraireParamsContexte } from '../contexte/url.ts'
import { texteClasses } from '../data/classes.ts'
import { competenceDe, domaineDe } from '../data/programme.ts'
import type { CompetenceId } from '../data/programme.ts'
import { LANGUE_SOURCE } from '../langues/registre.ts'
import { useLangue } from '../langues/useLangue.ts'
import BandeauConstruction from '../shell/BandeauConstruction.vue'
import FilAriane from '../shell/FilAriane.vue'
import { EMOJI_BARRE } from '../shell/emojis.ts'
import CompetenceOfficiel from '../programme/CompetenceOfficiel.vue'
import CompetenceRessources from '../programme/CompetenceRessources.vue'
import { adresseCompetence, adresseProgramme } from '../programme/adresse.ts'
import { EMOJI } from '../programme/emojis.ts'
import { MATIERES_PROGRAMME } from '../programme/etat.ts'
import { nomDuDomaine } from '../programme/noms.ts'
import { interpretationDe, referenceDe } from '../programme/references.ts'
import { useNonIndexable } from '../router/useNonIndexable.ts'
import { competencesVoisines, ressourcesDeCompetence } from '../ressources/filtres.ts'
import { EMOJI_DOMAINE } from '../ressources/emojis.ts'
import { useRessources } from '../ressources/useRessources.ts'
import { useTitreDePage } from '../router/titres.ts'

const { t, langueAffichee } = useLangue()
const route = useRoute()
const { contexte } = useContexte()
const { catalogue } = useRessources()

const competence = computed(() => competenceDe(String(route.params.id)))
useNonIndexable(() => !competence.value)
const domaine = computed(() => (competence.value ? domaineDe(competence.value.domaine) : null))
// la page de la matière (la langue régionale n'a pas de page de ce nom : pas de lien)
const matiere = computed(() => MATIERES_PROGRAMME.find(m => m === domaine.value?.matiere) ?? null)
const reportes = computed(() => extraireParamsContexte(route.query))
const ressources = computed(() => (competence.value ? ressourcesDeCompetence(catalogue.value, competence.value.id as CompetenceId) : []))
/** nombre de voisines montrées : le reste est dans le programme, filtré sur le domaine */
const LIMITE_VOISINES = 6
const voisines = computed(() => (competence.value ? competencesVoisines(competence.value.id as CompetenceId, LIMITE_VOISINES).map(id => competenceDe(id)).filter(k => k !== null) : []))
const aPlusDeVoisines = computed(() => !!competence.value && competencesVoisines(competence.value.id as CompetenceId).length > LIMITE_VOISINES)
const adresseDuProgramme = computed(() => adresseProgramme(
  { matiere: matiere.value ?? 'maths', domaine: competence.value?.domaine ?? null, affichage: null }, contexte.value.classes, reportes.value))

const maillons = computed(() => [
  { texte: t('competence.accueil'), vers: '/', emoji: EMOJI_BARRE.accueil },
  { texte: t('competence.programme'), vers: adresseDuProgramme.value, emoji: EMOJI_BARRE.programme },
  ...(competence.value ? [{ texte: nomDuDomaine(competence.value.domaine, langueAffichee.value), emoji: EMOJI_DOMAINE[competence.value.domaine] }] : []),
])

useTitreDePage(() => (competence.value ? competence.value.libelle : t('competence.inconnue.titre')))
</script>

<style scoped>
.container :deep(a:not(.classe):not(.case)) { color: var(--bleu-fort); }
.meta { display: flex; flex-wrap: wrap; align-items: center; gap: .4rem .9rem; margin: .4rem 0 .8rem; }
.classes { gap: .4rem; }
.classe { min-width: 2.75rem; min-height: 2.75rem; display: inline-flex; align-items: center; justify-content: center; border-radius: 999px; border: 2px solid var(--gris-brd); background: #fff; font-weight: 700; text-decoration: none; color: var(--texte); }
.classe.choisie { background: var(--bleu-fort); border-color: var(--bleu-fort); color: #fff; }
.voisines { margin-top: 1.5rem; }
.voisines h2 { font-size: 1.15rem; margin-bottom: .5rem; }
.precision { font-size: .9rem; font-weight: 600; color: var(--texte-doux); }
.liste { list-style: none; display: grid; gap: .4rem; }
.liste li { background: #fff; border-radius: 10px; box-shadow: var(--shadow); padding: .6rem .8rem; border-left: 5px solid var(--violet); }
.toutes { margin-top: .6rem; font-weight: 700; }
.niveaux, .vide { color: var(--texte-doux); }
</style>
