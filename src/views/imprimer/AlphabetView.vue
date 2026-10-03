<template>
  <div class="container">
    <h1 class="section-heading">🔤 Affiche de l'alphabet</h1>
    <p class="intro">Les 26 lettres dans les quatre écritures, à afficher au mur ou dans le cahier.</p>

    <div class="config-box large">
      <div class="config-grid">
        <div class="config-section">
          <div class="config-section-title">Format</div>
          <div class="btn-group">
            <button v-for="f in ['A4', 'A3']" :key="f" class="level-btn"
              :class="{ active: config.format === f }" @click="config.format = f">{{ f }}</button>
          </div>
        </div>
        <div class="config-section">
          <div class="config-section-title">Orientation</div>
          <div class="btn-group">
            <button class="level-btn" :class="{ active: config.orientation === 'landscape' }" @click="config.orientation = 'landscape'">Paysage</button>
            <button class="level-btn" :class="{ active: config.orientation === 'portrait' }" @click="config.orientation = 'portrait'">Portrait</button>
          </div>
        </div>
        <div class="config-section">
          <div class="config-section-title">Disposition</div>
          <div class="btn-group">
            <button class="level-btn" :class="{ active: config.disposition === 'grille' }" @click="config.disposition = 'grille'">Tout l'alphabet</button>
            <button class="level-btn" :class="{ active: config.disposition === 'carte' }" @click="config.disposition = 'carte'">Une lettre par page</button>
          </div>
        </div>
      </div>

      <div v-if="regionale" class="config-section">
        <div class="config-section-title">Alphabet</div>
        <div class="btn-group">
          <button class="level-btn" :class="{ active: config.alphabet !== regionale.id }" @click="config.alphabet = 'fr'">Français (26 lettres)</button>
          <button class="level-btn" :class="{ active: config.alphabet === regionale.id }" @click="config.alphabet = regionale.id">
            {{ regionale.drapeau }} {{ regionale.nom[0].toUpperCase() + regionale.nom.slice(1) }} ({{ regionale.alphabet.length }} lettres)</button>
        </div>
      </div>

      <div class="config-section">
        <div class="config-section-title">Écritures affichées</div>
        <div class="btn-group">
          <button v-for="s in STYLES" :key="s.id" class="level-btn"
            :class="{ active: config.styles.includes(s.id) }" @click="basculer(s.id)">{{ s.label }}</button>
        </div>
      </div>

      <div class="config-section">
        <div class="config-section-title">Options</div>
        <label class="case" v-if="!regionale || config.alphabet !== regionale.id"><input type="checkbox" v-model="config.mot"> Un mot et une image pour chaque lettre (A comme abeille 🐝)</label>
        <label class="case"><input type="checkbox" v-model="config.voyelles"> Voyelles en rouge, consonnes en bleu</label>
        <label class="case"><input type="checkbox" v-model="config.lignes"> Lignes d'écriture sous l'attaché (hauteur des lettres)</label>
      </div>

      <div class="config-section">
        <div class="config-section-title">Polices</div>
        <ChoixPolice />
      </div>

      <ApercuImpression :html="html" :format="config.format" :orientation="config.orientation" :nb-pages="nbPages" />
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
import { STYLES, DEFAUTS, genererAlphabet } from '../../impression/alphabet'

const config = ref({ ...DEFAUTS, ...charger('affiche_alphabet_config', {}) })
watch(config, v => sauvegarder('affiche_alphabet_config', v), { deep: true })

function basculer(id) {
  const s = config.value.styles
  const i = s.indexOf(id)
  if (i >= 0) { if (s.length > 1) s.splice(i, 1) } else s.push(id)
}

const polices = usePolices()
const { langue: regionale } = useLangueRegionale()
const resultat = computed(() => polices.pret.value
  ? genererAlphabet({ ...config.value, alphabet: regionale.value?.id === config.value.alphabet ? config.value.alphabet : 'fr' }, { attache: polices.attache.value, script: polices.script.value })
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
