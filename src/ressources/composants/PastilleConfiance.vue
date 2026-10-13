<template>
  <!-- Le niveau de confiance de la traduction d'une fiche : DÉVELOPPEMENT SEULEMENT (AVEC_DEV), jamais chez les visiteurs. Une jauge de quatre barres
       (0 à 4 pleines) et le nom du niveau ; une fiche que le réglage cacherait y est tout de même, en rouge, marquée « masquée ». -->
  <span v-if="AVEC_DEV && niveau !== null" class="pastille" :class="[`n${niveau}`, { masquee }]" role="img" :aria-label="libelle" :title="libelle">
    <Icone v-if="masquee" nom="singeYeux" />
    <JaugeConfiance :niveau="niveau" />
    <span aria-hidden="true">{{ nom }}</span>
    <span v-if="masquee" aria-hidden="true">· {{ t('confiance.masquee') }}</span>
  </span>
</template>

<script setup lang="ts">
import Icone from '../../images/Icone.vue'
import { computed } from 'vue'
import JaugeConfiance from './JaugeConfiance.vue'
import { AVEC_DEV } from '../../dev.ts'
import { NOMS_NIVEAU } from '../../langues/confiance.ts'
import type { NiveauConfiance } from '../../langues/confiance.ts'
import type { EtatTraduction } from '../filtres.ts'
import { REGIONALES, nomDeLangue } from '../../langues/registre.ts'
import { useLangue } from '../../langues/useLangue.ts'

// `etat` : ce que le réglage fait de l'élément dans cette page (useAffichable().etat) : rien, ou le cache (en rouge, « masquée »)
const props = withDefaults(defineProps<{ niveau: NiveauConfiance | null, etat?: EtatTraduction }>(), { etat: 'sure' })
const { t, langueAffichee } = useLangue()
const langue = computed(() => nomDeLangue(REGIONALES[0], langueAffichee.value))
/** le nom court du niveau (« Mots vérifiés ») */
const nom = computed(() => (props.niveau === null ? '' : t(`confiance.niveaux.${NOMS_NIVEAU[props.niveau]}.court`)))
/** la phrase lue par les lecteurs d'écran et affichée au survol */
const libelle = computed(() => (props.niveau === null ? '' : `${t('confiance.pastille', { niveau: props.niveau })} : ${t(`confiance.niveaux.${NOMS_NIVEAU[props.niveau]}.aide`, { langue: langue.value })}`))
/** le réglage cacherait cet élément (visible quand même en développement) */
const masquee = computed(() => props.etat === 'masquee')
</script>

<style scoped>
.pastille { display: inline-flex; white-space: nowrap; align-items: center; gap: .35rem; font-size: .78rem; border-radius: 20px; padding: .1rem .6rem .1rem .45rem; color: var(--texte); background: var(--gris-bg); }
.masquee { background: #fde2e2; outline: 2px solid #b3261e; font-weight: 700; }
</style>
