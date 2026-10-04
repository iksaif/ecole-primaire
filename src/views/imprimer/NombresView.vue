<template>
  <div class="container">
    <h1 class="section-heading">{{ t('titre') }}{{ regionale ? t('titreRegional', { nom: regionale.nom, nomLocal: regionale.nomLocal }) : '' }}</h1>
    <p class="intro">
      {{ t('intro') }}
      <RouterLink v-if="!regionale" to="/parametres">{{ t('ajouterBreton') }}</RouterLink>
    </p>

    <div class="config-box large">
      <div v-if="regionale" class="config-section">
        <div class="config-section-title">{{ t('langues') }}</div>
        <div class="btn-group">
          <button v-for="l in LANGUES" :key="l.id" class="level-btn"
            :class="{ active: config.langue === l.id }" @click="config.langue = l.id">{{ libelleLangue(l) }}</button>
        </div>
      </div>

      <div class="config-section">
        <div class="config-section-title">{{ t('aAfficher') }}</div>
        <div class="btn-group">
          <button v-for="s in SECTIONS_PRINCIPALES" :key="s.id" class="level-btn"
            :class="{ active: config.sections.includes(s.id) }" @click="basculer(s.id)">{{ libelleSection(s) }}</button>
        </div>
        <div class="sous-titre-config">{{ t('parDizaine') }}</div>
        <div class="btn-group">
          <button v-for="s in SECTIONS_DIZAINES" :key="s.id" class="level-btn"
            :class="{ active: config.sections.includes(s.id) }" @click="basculer(s.id)">{{ s.label }}</button>
          <button class="level-btn petit" @click="toutesDizaines">{{ t('toutes') }}</button>
        </div>
        <div v-if="config.sections.includes('perso')" class="perso">
          {{ t('de') }} <input type="number" v-model.number="config.de" min="0" max="9999">
          {{ t('a') }} <input type="number" v-model.number="config.a" min="0" max="9999">
          {{ t('pas') }} <input type="number" v-model.number="config.pas" min="1" max="1000"> {{ t('enPas', { pas: config.pas }) }}
          <span class="perso-info">({{ t('nbNombres', { n: nombresPerso.length }) }}{{ nombresPerso.length >= 200 ? t('max') : '' }})</span>
        </div>
      </div>

      <div class="config-grid">
        <div class="config-section">
          <div class="config-section-title">{{ t('miseEnPage') }}</div>
          <div class="btn-group">
            <button class="level-btn" :class="{ active: config.miseEnPage === 'affiches' }" @click="config.miseEnPage = 'affiches'">{{ t('affiches') }}</button>
            <button class="level-btn" :class="{ active: config.miseEnPage === 'fiche' }" @click="config.miseEnPage = 'fiche'">{{ t('fiche') }}</button>
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
      </div>

      <div class="config-section">
        <div class="config-section-title">{{ t('options') }}</div>
        <label class="case"><input type="checkbox" v-model="config.representation"> {{ t('representation') }}</label>
        <label class="case" v-if="config.langue !== 'br' || !regionale"><input type="checkbox" v-model="config.rectifiee">
          {{ t('rectifiee') }}</label>
      </div>

      <div class="config-section">
        <div class="config-section-title">{{ t('police') }}</div>
        <ChoixPolice :types="['script']" />
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
import messagesFr from '../../i18n/fr/views/imprimer/NombresView.js'
import messagesBr from '../../i18n/br/views/imprimer/NombresView.js'
import {
  languesDisponibles, SECTIONS, SECTIONS_PRINCIPALES, SECTIONS_DIZAINES, DEFAUTS, nombresPersonnalises, genererNombres,
} from '../../impression/nombres'

const config = ref({ ...DEFAUTS, ...charger('nombres_impression_config', {}) })
const { code: codeRegional, langue: regionale } = useLangueRegionale()
const LANGUES = computed(() => languesDisponibles(codeRegional.value))
watch(config, v => sauvegarder('nombres_impression_config', v), { deep: true })

const { t, langue } = useI18n({ fr: messagesFr, br: messagesBr })
const majuscule = s => s[0].toUpperCase() + s.slice(1)
// Libellés des choix de langues (languesDisponibles, en français dans src/impression/nombres.js)
function libelleLangue(l) {
  const r = regionale.value
  if (!r) return t('francais')
  const nom = langue.value === 'br' ? r.nomLocal : majuscule(r.nom)
  return { bilingue: t('bilingue', { nom }), fr: t('francaisSeul'), br: t('regionalSeul', { nom: majuscule(nom) }) }[l.id] ?? l.label
}
const libelleSection = s => (langue.value !== 'br' ? s.label
  : s.id === 'perso' ? 'Diouzh da zibab…' // br: à relire (personnalisé)
  : s.labelBr ?? s.br ?? s.label)

function basculer(id) {
  const s = config.value.sections
  const i = s.indexOf(id)
  if (i >= 0) { if (s.length > 1) s.splice(i, 1) }
  else {
    s.push(id)
    s.sort((a, b) => SECTIONS.findIndex(x => x.id === a) - SECTIONS.findIndex(x => x.id === b))
  }
}

function toutesDizaines() {
  const ids = SECTIONS_DIZAINES.map(s => s.id)
  const toutes = ids.every(id => config.value.sections.includes(id))
  const autres = config.value.sections.filter(id => !ids.includes(id))
  config.value.sections = toutes ? (autres.length ? autres : ['unites']) : SECTIONS.map(s => s.id).filter(id => autres.includes(id) || ids.includes(id))
}

const nombresPerso = computed(() => nombresPersonnalises(config.value))

const polices = usePolices()
const resultat = computed(() => polices.pret.value
  ? genererNombres({ ...config.value, regionale: codeRegional.value, langueTextes: langue.value }, { script: polices.script.value })
  : { html: '', nbPages: 1 })
const html = computed(() => resultat.value.html)
const nbPages = computed(() => resultat.value.nbPages)
</script>

<style scoped>
.intro { color: #666; margin: -.5rem 0 1.25rem; }
.config-box.large { max-width: 960px; }
.config-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 0 1.5rem; }
.case { display: flex; align-items: center; gap: .5rem; margin: .35rem 0; font-size: .95rem; cursor: pointer; }
.sous-titre-config { font-size: .85rem; font-weight: 700; color: #888; margin: .75rem 0 .4rem; }
.level-btn.petit { font-size: .78rem; }
.perso { margin-top: .75rem; display: flex; align-items: center; gap: .4rem; flex-wrap: wrap; font-weight: 600; }
.perso input { width: 5.5rem; font: inherit; padding: .3rem .5rem; border: 2px solid var(--gris-brd); border-radius: 6px; }
.perso-info { color: #888; font-weight: 400; font-size: .85rem; }
</style>
