<template>
  <div v-if="matiere" class="container" :data-page="regionale ? 'langue-regionale' : matiere" :lang="regionale && actif ? bcp47 : undefined">
    <FilAriane :maillons="maillons" :etiquette="t('matiere.fil')" />
    <h1 class="titre"><span aria-hidden="true">{{ EMOJI_MATIERE[matiere] }}</span> <span :lang="regionale ? bcp47 : undefined">{{ nom }}</span></h1>

    <EtatVide v-if="regionale && !actif" :emoji="EMOJI_BARRE.verrou" :titre="t('regionale.inactif')" :texte="t('regionale.inactifAide')">
      <button type="button" class="gros-bouton" @click="activer">{{ t('regionale.activer', { nom: nomDans }) }}</button>
    </EtatVide>

    <template v-else>
      <p v-if="regionale" class="intro">{{ t('regionale.intro', { nom: nomDans }) }}</p>
      <aside v-if="pageMatiere" class="fiches-pretes">
        <span class="emoji" aria-hidden="true">{{ EMOJI_ACCUEIL.fiches }}</span>
        <p><strong>{{ t('matiere.fichesTitre') }}</strong><br>{{ t('matiere.fichesTexte') }}</p>
        <RouterLink :to="cheminFiches(pageMatiere)" class="gros-bouton">{{ EMOJI_ACCUEIL.fiches }} {{ t('matiere.fichesBouton') }}</RouterLink>
      </aside>

      <MondeIntro v-if="matiere === 'monde'" />

      <MatiereBarre :classes="classes" :total="total" :toutes="toutes" @basculer="toutes = !toutes" />
      <SautDomaines :groupes="avecRessources" />

      <p v-if="!pret" class="chargement" role="status">{{ t('matiere.chargement') }}</p>
      <EtatVide v-else-if="!avecRessources.length" :emoji="EMOJI_ACCUEIL.aVenir" :titre="t(regionale ? 'regionale.videTitre' : 'matiere.videTitre')"
        :texte="regionale ? t('regionale.videTexte', { nom: nomDans }) : t('matiere.videTexte')" />
      <GroupeDomaine v-for="g in avecRessources" :key="g.domaine" :groupe="g" :classes="classes" :vue="vue" />

      <MatiereAVenir v-if="pret && aVenir.length" :domaines="aVenir" :classes="classesVisees" />
    </template>
  </div>
</template>

<script setup lang="ts">
// Page d'une matière (/maths, /francais, /monde, et la langue régionale /brezhoneg : la matière vient de la route). Les domaines
// sont ceux du programme des cycles des classes choisies (grouperParDomaine) : ceux qui ont des ressources s'affichent en cartes ou
// en liste, les autres en « à venir ». Une ressource n'y est qu'une fois, avec ses classes en pastilles ; les classes choisies
// filtrent (union) et sont mises en évidence ; « Toutes les classes » montre tout sans changer la classe choisie.
// La langue régionale est une matière comme les autres (sans encart « fiches toutes prêtes » : elle n'a pas de sous-page) ; en
// mode « Français seul » la page est inactive et un bouton active le mode français + langue.
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useContexte } from '../contexte/useContexte.ts'
import { CLASSES } from '../data/classes.ts'
import { LANGUES } from '../langues/registre.ts'
import { useLangue } from '../langues/useLangue.ts'
import { filtrerParMode, grouperParDomaine } from '../ressources/filtres.ts'
import { useRessources } from '../ressources/useRessources.ts'
import FilAriane from '../shell/FilAriane.vue'
import { EMOJI_BARRE } from '../shell/emojis.ts'
import EtatVide from '../ressources/composants/EtatVide.vue'
import GroupeDomaine from '../ressources/composants/GroupeDomaine.vue'
import { EMOJI_ACCUEIL, EMOJI_MATIERE, majuscule } from '../ressources/composants/presentation.ts'
import { NOM_COURT, cheminFiches, langueRegionaleDeLaRoute, matiereDeLaRoute } from './matieres.ts'
import MatiereAVenir from './MatiereAVenir.vue'
import MatiereBarre from './MatiereBarre.vue'
import MondeIntro from './MondeIntro.vue'
import SautDomaines from './SautDomaines.vue'

const route = useRoute()
const { t, langueAffichee } = useLangue()
const { contexte, choisirMode } = useContexte()
const { catalogue, pret } = useRessources()
const toutes = ref(false)
const vue = computed(() => contexte.value.vue)

const code = computed(() => langueRegionaleDeLaRoute(route.path))
const pageMatiere = computed(() => matiereDeLaRoute(route.path))
const matiere = computed(() => (code.value ? 'regionale' : pageMatiere.value))
const regionale = computed(() => matiere.value === 'regionale')
const actif = computed(() => !!code.value && contexte.value.mode !== 'fr' && contexte.value.regionale === code.value)
const bcp47 = computed(() => (code.value ? LANGUES[code.value].bcp47 : ''))
const nomDans = computed(() => (code.value ? LANGUES[code.value].nom[langueAffichee.value] : ''))
const nom = computed(() => (code.value ? majuscule(LANGUES[code.value].nomLocal) : pageMatiere.value ? t(NOM_COURT[pageMatiere.value]) : ''))
const maillons = computed(() => [
  { texte: t('matiere.accueil'), vers: '/', emoji: EMOJI_BARRE.accueil },
  { texte: nom.value, emoji: matiere.value ? EMOJI_MATIERE[matiere.value] : undefined },
])
const classes = computed(() => contexte.value.classes)
const classesVisees = computed(() => (toutes.value ? CLASSES.map(c => c.id) : classes.value))
// la page de matière est celle des ressources qu'on personnalise (exercices, générateurs de fiches, affiches) : les fiches toutes prêtes
// ont leur sous-page (/maths/fiches), et un exercice et son générateur de fiche ne font qu'une carte, à deux badges
const personnalisables = computed(() => catalogue.value.filter(r => r.type !== 'fiche'))
const groupes = computed(() => (matiere.value
  ? grouperParDomaine(filtrerParMode(personnalisables.value, contexte.value.mode, contexte.value.regionale), { matiere: matiere.value, classes: classesVisees.value })
  : []))
// un domaine sans aucune ressource (pour aucune classe) est « à venir » ; avec des ressources d'autres classes seulement, il reste un groupe replié
const avecRessources = computed(() => groupes.value.filter(g => g.ressources.length + g.horsClasse > 0))
const aVenir = computed(() => groupes.value.filter(g => !g.ressources.length && !g.horsClasse).map(g => g.domaine))
const total = computed(() => avecRessources.value.reduce((n, g) => n + g.ressources.length, 0))
const activer = (): Promise<boolean> => choisirMode('bilingue', code.value ?? undefined)
</script>

<style scoped>
.titre { font-size: 2rem; font-weight: 900; margin-bottom: 1rem; }
.fiches-pretes {
  display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; background: #fff8e6; border: 2px solid #f3d38a; border-radius: var(--radius);
  padding: .8rem 1rem; margin-bottom: 1.25rem;
}
.fiches-pretes .emoji { font-size: 2rem; }
.fiches-pretes p { flex: 1 1 16rem; }
.gros-bouton {
  background: var(--bleu-fort); color: white; text-decoration: none; font-weight: 800; border-radius: 8px; padding: .6rem 1rem;
  min-height: 2.75rem; display: inline-flex; align-items: center;
}
button.gros-bouton { border: none; font: inherit; font-weight: 800; padding: .7rem 1.2rem; cursor: pointer; }
.intro { color: var(--texte-doux); max-width: 640px; margin: -.5rem 0 1rem; }
.chargement { color: var(--texte-doux); margin: 1rem 0; }
</style>
