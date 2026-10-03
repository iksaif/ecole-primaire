<template>
  <div class="container">
    <h1 class="section-heading">🔢 Les nombres en lettres{{ regionale ? ` — français et ${regionale.nom}` : '' }}</h1>
    <p class="intro">
      Affiches et fiches mémo : unités, dizaines, centaines… écrits en chiffres et en lettres.
      <RouterLink v-if="!regionale" to="/parametres">🏴 Ajouter le breton (paramètres)</RouterLink>
    </p>

    <div class="config-box large">
      <div v-if="regionale" class="config-section">
        <div class="config-section-title">Langues</div>
        <div class="btn-group">
          <button v-for="l in LANGUES" :key="l.id" class="level-btn"
            :class="{ active: config.langue === l.id }" @click="config.langue = l.id">{{ l.label }}</button>
        </div>
      </div>

      <div class="config-section">
        <div class="config-section-title">Nombres à afficher</div>
        <div class="btn-group">
          <button v-for="s in SECTIONS_PRINCIPALES" :key="s.id" class="level-btn"
            :class="{ active: config.sections.includes(s.id) }" @click="basculer(s.id)">{{ s.label }}</button>
        </div>
        <div class="sous-titre-config">Dizaine par dizaine :</div>
        <div class="btn-group">
          <button v-for="s in SECTIONS_DIZAINES" :key="s.id" class="level-btn"
            :class="{ active: config.sections.includes(s.id) }" @click="basculer(s.id)">{{ s.label }}</button>
          <button class="level-btn petit" @click="toutesDizaines">Toutes</button>
        </div>
        <div v-if="config.sections.includes('perso')" class="perso">
          De <input type="number" v-model.number="config.de" min="0" max="9999">
          à <input type="number" v-model.number="config.a" min="0" max="9999">
          de <input type="number" v-model.number="config.pas" min="1" max="1000"> en {{ config.pas }}
          <span class="perso-info">({{ nombresPerso.length }} nombres{{ nombresPerso.length >= 200 ? ', 200 max' : '' }})</span>
        </div>
      </div>

      <div class="config-grid">
        <div class="config-section">
          <div class="config-section-title">Mise en page</div>
          <div class="btn-group">
            <button class="level-btn" :class="{ active: config.miseEnPage === 'affiches' }" @click="config.miseEnPage = 'affiches'">Une affiche par catégorie</button>
            <button class="level-btn" :class="{ active: config.miseEnPage === 'fiche' }" @click="config.miseEnPage = 'fiche'">Tout sur une page</button>
          </div>
        </div>
        <div class="config-section">
          <div class="config-section-title">Format</div>
          <div class="btn-group">
            <button v-for="f in ['A4', 'A3']" :key="f" class="level-btn"
              :class="{ active: config.format === f }" @click="config.format = f">{{ f }}</button>
            <button class="level-btn" :class="{ active: config.orientation === 'portrait' }" @click="config.orientation = 'portrait'">Portrait</button>
            <button class="level-btn" :class="{ active: config.orientation === 'landscape' }" @click="config.orientation = 'landscape'">Paysage</button>
          </div>
        </div>
      </div>

      <div class="config-section">
        <div class="config-section-title">Options</div>
        <label class="case"><input type="checkbox" v-model="config.representation"> Représentation (points pour les unités, barres de dix, plaques de cent)</label>
        <label class="case" v-if="config.langue !== 'br' || !regionale"><input type="checkbox" v-model="config.rectifiee">
          Orthographe rectifiée en français (traits d'union partout : « vingt-et-un », « deux-cent-trois ») — référence à l'école</label>
      </div>

      <div class="config-section">
        <div class="config-section-title">Police</div>
        <ChoixPolice :types="['script']" />
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
import {
  languesDisponibles, SECTIONS, SECTIONS_PRINCIPALES, SECTIONS_DIZAINES, DEFAUTS, nombresPersonnalises, genererNombres,
} from '../../impression/nombres'

const config = ref({ ...DEFAUTS, ...charger('nombres_impression_config', {}) })
const { code: codeRegional, langue: regionale } = useLangueRegionale()
const LANGUES = computed(() => languesDisponibles(codeRegional.value))
watch(config, v => sauvegarder('nombres_impression_config', v), { deep: true })

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
  ? genererNombres({ ...config.value, regionale: codeRegional.value }, { script: polices.script.value })
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
