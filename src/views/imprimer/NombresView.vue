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
import { useI18n } from '../../i18n'
import {
  languesDisponibles, SECTIONS, SECTIONS_PRINCIPALES, SECTIONS_DIZAINES, DEFAUTS, nombresPersonnalises, genererNombres,
} from '../../impression/nombres'

const config = ref({ ...DEFAUTS, ...charger('nombres_impression_config', {}) })
const { code: codeRegional, langue: regionale } = useLangueRegionale()
const LANGUES = computed(() => languesDisponibles(codeRegional.value))
watch(config, v => sauvegarder('nombres_impression_config', v), { deep: true })

const { t, langue } = useI18n({
  fr: {
    titre: '🔢 Les nombres en lettres',
    titreRegional: ' — français et {nom}',
    intro: 'Affiches et fiches mémo : unités, dizaines, centaines… écrits en chiffres et en lettres.',
    ajouterBreton: '🏴 Ajouter le breton (paramètres)',
    langues: 'Langues',
    bilingue: 'Français + {nom}', francaisSeul: 'Français seul', regionalSeul: '{nom} seul', francais: 'Français',
    aAfficher: 'Nombres à afficher',
    parDizaine: 'Dizaine par dizaine :',
    toutes: 'Toutes',
    de: 'De', a: 'à', pas: 'de', enPas: 'en {pas}',
    nbNombres: '{n} nombres', max: ', 200 max',
    miseEnPage: 'Mise en page',
    affiches: 'Une affiche par catégorie',
    fiche: 'Tout sur une page',
    format: 'Format', portrait: 'Portrait', paysage: 'Paysage',
    options: 'Options',
    representation: 'Représentation (points pour les unités, barres de dix, plaques de cent)',
    rectifiee: "Orthographe rectifiée en français (traits d'union partout : « vingt-et-un », « deux-cent-trois ») — référence à l'école",
    police: 'Police',
  },
  br: {
    titre: '🔢 An niveroù e lizherennoù',
    titreRegional: ' — e galleg hag e {nomLocal}',
    intro: 'Skritelloù ha fichennoù-eñvor : unanennoù, degadoù, kantadoù… skrivet e sifroù hag e lizherennoù.', // br: à relire (fiches mémo)
    ajouterBreton: '🏴 Ouzhpennañ ar brezhoneg (arventennoù)',
    langues: 'Yezhoù',
    bilingue: 'Galleg + {nom}', francaisSeul: 'Galleg hepken', regionalSeul: '{nom} hepken', francais: 'Galleg',
    aAfficher: 'Niveroù da ziskouez',
    parDizaine: 'Degad dre zegad :',
    toutes: 'An holl',
    // br: à relire — « Eus 20 da 29, a 1 da 1 »
    de: 'Eus', a: 'da', pas: ', a', enPas: 'da {pas}',
    nbNombres: '{n} niver', max: ", 200 d'ar muiañ",
    miseEnPage: 'Pajennaozañ', // br: à relire
    affiches: 'Ur skritell dre rummad',
    fiche: 'Pep tra war ur bajenn',
    format: 'Furmad', portrait: 'Poltred', paysage: 'Gweledva', // br: à relire (gweledva = paysage)
    options: 'Dibarzhioù',
    representation: 'Skeudenn an niver (pikoù evit an unanennoù, barrennoù dek, plakennoù kant)', // br: à relire
    rectifiee: 'Reizhskrivadur nevez e galleg (tiredoù e pep lec\'h : « vingt-et-un », « deux-cent-trois ») — an hini a vez implijet er skol', // br: à relire
    police: 'Nodrezh', // br: à relire (nodrezh = police de caractères)
  },
})
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
