<template>
  <div class="container">
    <h1 class="section-heading">🧮 {{ t('titre') }}</h1>
    <p class="intro">{{ t('intro') }}</p>

    <div class="config-box large">
      <div class="config-section">
        <div class="config-section-title">{{ t('affiche') }}</div>
        <div class="btn-group">
          <button v-for="a in AFFICHES" :key="a.id" class="level-btn"
            :class="{ active: config.affiche === a.id }" @click="config.affiche = a.id">{{ lib(a.label) }}</button>
        </div>
      </div>
      <div class="config-section">
        <div class="config-section-title">{{ t('disposition') }}</div>
        <div class="btn-group">
          <button v-for="d in DISPOSITIONS" :key="d.id" class="level-btn"
            :class="{ active: config.disposition === d.id }" @click="config.disposition = d.id">{{ lib(d.label) }}</button>
        </div>
      </div>
      <div v-if="config.disposition !== 'grille'" class="config-section">
        <div class="config-section-title">{{ t('tables') }}</div>
        <div class="btn-group">
          <button v-for="n in 10" :key="n" class="level-btn"
            :class="{ active: config.tablesAffiche.includes(n) }" @click="basculerTable(n)">{{ n }}</button>
          <button class="level-btn petit" @click="config.tablesAffiche = Array.from({ length: 10 }, (_, k) => k + 1)">{{ t('toutes') }}</button>
        </div>
      </div>
      <div class="config-section">
        <div class="config-section-title">{{ t('format') }}</div>
        <div class="btn-group">
          <button v-for="f in ['A4', 'A3']" :key="f" class="level-btn"
            :class="{ active: config.format === f }" @click="config.format = f">{{ f }}</button>
          <button class="level-btn" :class="{ active: config.orientation === 'portrait' }" @click="config.orientation = 'portrait'">{{ t('portrait') }}</button>
          <button class="level-btn" :class="{ active: config.orientation === 'landscape' }" @click="config.orientation = 'landscape'">{{ t('paysage') }}</button>
        </div>
      </div>
      <div class="config-section">
        <div class="config-section-title">{{ t('police') }}</div>
        <ChoixPolice :types="['script']" />
      </div>

      <ApercuImpression :reglages="reglages" :html="resultat.html" :format="resultat.format" :orientation="resultat.orientation" :nb-pages="resultat.nbPages" />
    </div>
  </div>
</template>

<script setup>
// Affiches des tables (le mode « fiche » est devenu l'exercice calcul mental : src/exercices/calcul-mental/).
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import ApercuImpression from '../../components/ApercuImpression.vue'
import ChoixPolice from '../../components/ChoixPolice.vue'
import { usePolices } from '../../composables/usePolices'
import { sauvegarder, charger } from '../../utils'
import { useI18n } from '../../i18n'
import messagesFr from '../../i18n/fr/views/imprimer/CalculView.js'
import messagesBr from '../../i18n/br/views/imprimer/CalculView.js'
import { AFFICHES, DISPOSITIONS, normaliserConfig, genererCalcul, libelle, presetCalcul } from '../../impression/calcul'

// Breton : traduction à faire relire par un brittophone
const { t, langue } = useI18n({ fr: messagesFr, br: messagesBr })
const lib = v => libelle(v, langue.value)

const CLE = 'calcul_impression_config'
const config = ref(normaliserConfig(charger(CLE, {}) ?? {}))
watch(config, v => sauvegarder(CLE, v), { deep: true })
// ?preset=<slug> (pages de téléchargement, page « Le programme ») : l'affiche exacte
const route = useRoute()
watch(() => route.query.preset, s => { const p = presetCalcul(s); if (p) config.value = normaliserConfig(p) }, { immediate: true })

function basculerTable(n) {
  const l = config.value.tablesAffiche
  const i = l.indexOf(n)
  if (i >= 0) { if (l.length > 1) l.splice(i, 1) }
  else { l.push(n); l.sort((a, b) => a - b) }
}

const reglages = computed(() => config.value)
const polices = usePolices()
const resultat = computed(() => polices.pret.value
  ? genererCalcul({ ...reglages.value, langue: langue.value }, { script: polices.policeUnique() })
  : { html: '', nbPages: 1, format: 'A4', orientation: 'portrait' })
</script>

<style scoped>
.intro { color: #666; margin: -.5rem 0 1.25rem; }
.config-box.large { max-width: 960px; }
.level-btn.petit { font-size: .78rem; padding: .3rem .6rem; }
</style>
