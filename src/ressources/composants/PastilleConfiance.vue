<template>
  <!-- Le niveau de confiance de la traduction d'une fiche : DÉVELOPPEMENT SEULEMENT (AVEC_DEV), jamais chez les visiteurs. Une jauge de quatre barres
       (0 à 4 pleines) et le nom du niveau ; une fiche que le réglage cacherait y est tout de même, en rouge, marquée « masquée ». -->
  <span v-if="AVEC_DEV && niveau !== null" class="pastille" :class="[`n${niveau}`, { masquee }]" role="img" :aria-label="libelle" :title="libelle">
    <span v-if="masquee" aria-hidden="true">🙈</span>
    <JaugeConfiance :niveau="niveau" />
    <span aria-hidden="true">{{ nom }}</span>
    <span v-if="masquee" aria-hidden="true">· {{ t('confiance.masquee') }}</span>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import JaugeConfiance from './JaugeConfiance.vue'
import { AVEC_DEV } from '../../dev.ts'
import { NOMS_NIVEAU } from '../../langues/confiance.ts'
import type { NiveauConfiance } from '../../langues/confiance.ts'
import { confianceMin } from '../../langues/confianceReglage.ts'
import { REGIONALES, nomDeLangue } from '../../langues/registre.ts'
import { useLangue } from '../../langues/useLangue.ts'

const props = defineProps<{ niveau: NiveauConfiance | null }>()
const { t, langueAffichee } = useLangue()
const langue = computed(() => nomDeLangue(REGIONALES[0], langueAffichee.value))
/** le nom court du niveau (« Mots vérifiés ») */
const nom = computed(() => (props.niveau === null ? '' : t(`confiance.niveaux.${NOMS_NIVEAU[props.niveau]}.court`)))
/** la phrase lue par les lecteurs d'écran et affichée au survol */
const libelle = computed(() => (props.niveau === null ? '' : `${t('confiance.pastille', { niveau: props.niveau })} : ${t(`confiance.niveaux.${NOMS_NIVEAU[props.niveau]}.aide`, { langue: langue.value })}`))
/** le réglage cacherait cette fiche (visible quand même en développement) */
const masquee = computed(() => props.niveau !== null && props.niveau < confianceMin.value)
</script>

<style scoped>
.pastille { display: inline-flex; white-space: nowrap; align-items: center; gap: .35rem; font-size: .78rem; border-radius: 20px; padding: .1rem .6rem .1rem .45rem; color: var(--texte); background: var(--gris-bg); }
.masquee { background: #fde2e2; outline: 2px solid #b3261e; font-weight: 700; }
</style>
