<template>
  <div v-if="code" class="container" data-page="langue-regionale" :lang="actif ? bcp47 : undefined">
    <h1 class="section-heading"><Drapeau :langue="code" class="drapeau" /> <span :lang="bcp47">{{ nomLocal }}</span></h1>

    <template v-if="actif && donnees">
      <p class="intro">{{ t('regionale.intro', { nom: nomDans, ecoles: donnees.ecoles[langueAffichee] ?? donnees.ecoles[code] ?? '' }) }}</p>
      <p class="voix" :class="{ non: !voixDisponible }"><span aria-hidden="true">🔊</span> {{ voixDisponible ? t('regionale.voixPresente') : t('regionale.voixAbsente') }}</p>
      <LangueRegionaleDonnees :code="code" :donnees="donnees" />
      <section class="groupe" aria-labelledby="ressources-regionale">
        <h2 id="ressources-regionale">{{ t('regionale.ressources', { nom: nomDans }) }}</h2>
        <p v-if="!ressources.length" class="aide">{{ pret ? t('regionale.ressourcesVide', { nom: nomDans }) : t('matiere.chargement') }}</p>
        <ul v-else class="cartes">
          <li v-for="r in ressources" :key="r.id"><CarteRessource :ressource="r" :classes-choisies="contexte.classes" :niveau-titre="3" /></li>
        </ul>
      </section>
    </template>

    <EtatVide v-else emoji="🔒" :titre="t('regionale.inactif')" :texte="t('regionale.inactifAide')">
      <button type="button" class="gros-bouton" @click="activer">{{ t('regionale.activer', { nom: nomDans }) }}</button>
    </EtatVide>
  </div>
</template>

<script setup lang="ts">
// Page d'une langue régionale (/brezhoneg : la langue vient de la route, son adresse du registre de langues). Active quand le mode
// de langue la propose (français + langue, ou langue seule) : alphabet, nombres, jours et mois, et les ressources de la matière
// « regionale » du catalogue. En mode « Français seul », la page est inactive et un bouton active le mode français + langue.
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useContexte } from '../contexte/useContexte.ts'
import { LANGUES, REGIONALES, donneesRegionales } from '../langues/registre.ts'
import { useLangue } from '../langues/useLangue.ts'
import { cheminRegional } from '../router/chemins.ts'
import { filtrerParClasses } from '../ressources/filtres.ts'
import { useRessources } from '../ressources/useRessources.ts'
import CarteRessource from '../ressources/composants/CarteRessource.vue'
import EtatVide from '../ressources/composants/EtatVide.vue'
import { majuscule } from '../ressources/composants/presentation.ts'
import Drapeau from '../shell/Drapeau.vue'
import LangueRegionaleDonnees from './LangueRegionaleDonnees.vue'

const route = useRoute()
const { t, langueAffichee } = useLangue()
const { contexte, choisirMode } = useContexte()
const { catalogue, pret } = useRessources()

const code = computed(() => REGIONALES.find(l => cheminRegional(l) === route.path) ?? null)
const donnees = computed(() => (code.value ? donneesRegionales(code.value) : undefined))
const actif = computed(() => !!code.value && contexte.value.mode !== 'fr' && contexte.value.regionale === code.value)
const bcp47 = computed(() => (code.value ? LANGUES[code.value].bcp47 : ''))
const nomLocal = computed(() => (code.value ? majuscule(LANGUES[code.value].nomLocal) : ''))
const nomDans = computed(() => (code.value ? LANGUES[code.value].nom[langueAffichee.value] : ''))
const voixDisponible = computed(() => (code.value ? LANGUES[code.value].voix.disponible : false))
const ressources = computed(() => filtrerParClasses(catalogue.value.filter(r => r.matiere === 'regionale' && code.value && r.langues.includes(code.value)), contexte.value.classes))
const activer = (): Promise<boolean> => choisirMode('bilingue', code.value ?? undefined)
</script>

<style scoped>
.drapeau { margin-right: .3rem; }
.intro { color: var(--texte-doux); max-width: 640px; margin: -.5rem 0 1rem; }
.voix { font-size: .9rem; color: var(--vert-texte); margin-bottom: 1.5rem; }
.voix.non { color: var(--orange-texte); }
.groupe { margin-bottom: 2rem; }
.groupe h2 { font-size: 1.15rem; margin-bottom: .5rem; }
.aide { color: var(--texte-doux); font-size: .9rem; }
.cartes { list-style: none; display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: .8rem; }
.gros-bouton { background: var(--bleu-fort); color: white; border: none; border-radius: 8px; font: inherit; font-weight: 800; padding: .7rem 1.2rem; min-height: 2.75rem; cursor: pointer; }
</style>
