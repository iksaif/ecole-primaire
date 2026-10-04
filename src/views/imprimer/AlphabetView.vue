<template>
  <div class="container">
    <h1 class="section-heading">{{ t('titre') }}</h1>
    <p class="intro">{{ t('intro') }}</p>

    <div class="config-box large">
      <div class="config-grid">
        <div class="config-section">
          <div class="config-section-title">{{ t('format') }}</div>
          <div class="btn-group">
            <button v-for="f in ['A4', 'A3']" :key="f" class="level-btn"
              :class="{ active: config.format === f }" @click="config.format = f">{{ f }}</button>
          </div>
        </div>
        <div class="config-section">
          <div class="config-section-title">{{ t('orientation') }}</div>
          <div class="btn-group">
            <button class="level-btn" :class="{ active: config.orientation === 'landscape' }" @click="config.orientation = 'landscape'">{{ t('paysage') }}</button>
            <button class="level-btn" :class="{ active: config.orientation === 'portrait' }" @click="config.orientation = 'portrait'">{{ t('portrait') }}</button>
          </div>
        </div>
        <div class="config-section">
          <div class="config-section-title">{{ t('disposition') }}</div>
          <div class="btn-group">
            <button class="level-btn" :class="{ active: config.disposition === 'grille' }" @click="config.disposition = 'grille'">{{ t('grille') }}</button>
            <button class="level-btn" :class="{ active: config.disposition === 'carte' }" @click="config.disposition = 'carte'">{{ t('carte') }}</button>
          </div>
        </div>
      </div>

      <div v-if="regionale" class="config-section">
        <div class="config-section-title">{{ t('alphabet') }}</div>
        <div class="btn-group">
          <button class="level-btn" :class="{ active: config.alphabet !== regionale.id }" @click="config.alphabet = 'fr'">{{ t('francais') }}</button>
          <button class="level-btn" :class="{ active: config.alphabet === regionale.id }" @click="config.alphabet = regionale.id">
            {{ regionale.drapeau }} {{ t('regional', { nom: majuscule(langue === 'br' ? regionale.nomLocal : regionale.nom), n: regionale.alphabet.length }) }}</button>
        </div>
      </div>

      <div class="config-section">
        <div class="config-section-title">{{ t('ecritures') }}</div>
        <div class="btn-group">
          <button v-for="s in STYLES" :key="s.id" class="level-btn"
            :class="{ active: config.styles.includes(s.id) }" @click="basculer(s.id)">{{ langue === 'br' ? s.br : s.label }}</button>
        </div>
      </div>

      <div class="config-section">
        <div class="config-section-title">{{ t('options') }}</div>
        <label class="case"><input type="checkbox" v-model="config.mot"> {{ t('mot') }}</label>
        <label class="case"><input type="checkbox" v-model="config.voyelles"> {{ t('voyelles') }}</label>
        <label class="case"><input type="checkbox" v-model="config.lignes"> {{ t('lignes') }}</label>
      </div>

      <div class="config-section">
        <div class="config-section-title">{{ t('polices') }}</div>
        <ChoixPolice />
      </div>

      <ApercuImpression :reglages="config" :html="html" :format="config.format" :orientation="config.orientation" :nb-pages="nbPages" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import ApercuImpression from '../../components/ApercuImpression.vue'
import ChoixPolice from '../../components/ChoixPolice.vue'
import { usePolices } from '../../composables/usePolices'
import { useLangueRegionale } from '../../composables/useLangueRegionale'
import { sauvegarder, charger } from '../../utils'
import { useI18n } from '../../i18n'
import messagesFr from '../../i18n/fr/views/imprimer/AlphabetView.js'
import messagesBr from '../../i18n/br/views/imprimer/AlphabetView.js'
import { STYLES, DEFAUTS, genererAlphabet } from '../../impression/alphabet'

const config = ref({ ...DEFAUTS, ...charger('affiche_alphabet_config', {}) })
watch(config, v => sauvegarder('affiche_alphabet_config', v), { deep: true })

const { t, langue } = useI18n({ fr: messagesFr, br: messagesBr })
const majuscule = s => s[0].toUpperCase() + s.slice(1)

function basculer(id) {
  const s = config.value.styles
  const i = s.indexOf(id)
  if (i >= 0) { if (s.length > 1) s.splice(i, 1) } else s.push(id)
}

const polices = usePolices()
const { langue: regionale } = useLangueRegionale()
const resultat = computed(() => polices.pret.value
  ? genererAlphabet({ ...config.value, langue: langue.value, alphabet: regionale.value?.id === config.value.alphabet ? config.value.alphabet : 'fr' }, { attache: polices.attache.value, script: polices.script.value })
  : { html: '', nbPages: 1 })
const html = computed(() => resultat.value.html)
const nbPages = computed(() => resultat.value.nbPages)
</script>

<style scoped>
.intro { color: #666; margin: -.5rem 0 1.25rem; }
.config-box.large { max-width: 960px; }
.config-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 0 1.5rem; }
.case { display: flex; align-items: center; gap: .5rem; margin: .35rem 0; font-size: .95rem; cursor: pointer; }
</style>
