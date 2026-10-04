<template>
  <div class="container">
    <h1 class="section-heading">{{ t('titre') }}</h1>
    <p class="intro">{{ t('intro') }}</p>

    <div class="config-box large">
      <div class="config-section">
        <div class="config-section-title">{{ t('affiche') }}</div>
        <div class="btn-group">
          <button v-for="a in AFFICHES_PROGRAMME" :key="a.id" class="level-btn"
            :class="{ active: config.affiche === a.id }" @click="choisir(a.id)">{{ a.label }}</button>
        </div>
      </div>

      <div v-if="definition.variantes" class="config-section">
        <div class="config-section-title">{{ t('version') }}</div>
        <div class="btn-group">
          <button v-for="v in definition.variantes" :key="v.id" class="level-btn"
            :class="{ active: config.variante === v.id }" @click="config.variante = v.id">{{ v.label }} <small>· {{ v.niveaux }}</small></button>
        </div>
      </div>

      <template v-if="config.affiche === 'conjugaison'">
        <div class="config-section">
          <div class="config-section-title">{{ t('verbe') }}</div>
          <div class="btn-group">
            <button v-for="(v, id) in VERBES" :key="id" class="level-btn"
              :class="{ active: config.verbe === id }" @click="config.verbe = id">{{ v.inf }}</button>
          </div>
        </div>
        <div class="config-section">
          <div class="config-section-title">{{ t('temps') }}</div>
          <div class="btn-group">
            <button v-for="choix in ['present', 'cycle', 'cm2']" :key="choix" class="level-btn"
              :class="{ active: choixTemps(config.temps) === choix }" @click="config.temps = TEMPS_DU_CHOIX[choix]">{{ t(TEXTES_TEMPS[choix]) }}</button>
          </div>
        </div>
      </template>

      <template v-if="config.affiche === 'resume'">
        <div class="config-section">
          <div class="config-section-title">{{ t('niveau') }}</div>
          <div class="btn-group">
            <button v-for="n in niveauxResume" :key="n" class="level-btn"
              :class="{ active: config.niveau === n }" @click="choisirResume(config.domaine, n)">{{ n.toUpperCase() }}</button>
          </div>
        </div>
        <div class="config-section">
          <div class="config-section-title">{{ t('domaine') }}</div>
          <div class="btn-group">
            <button v-for="d in domainesResume" :key="d" class="level-btn"
              :class="{ active: config.domaine === d }" @click="choisirResume(d, config.niveau)">{{ nomDomaine(d) }}</button>
          </div>
        </div>
      </template>

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
            <button class="level-btn" :class="{ active: orientation === 'landscape' }" @click="config.orientation = 'landscape'">{{ t('paysage') }}</button>
            <button class="level-btn" :class="{ active: orientation === 'portrait' }" @click="config.orientation = 'portrait'">{{ t('portrait') }}</button>
          </div>
        </div>
      </div>

      <div class="config-section">
        <div class="config-section-title">{{ t('polices') }}</div>
        <ChoixPolice :types="['script']" :attachee="attacheePermise" />
      </div>

      <p class="source">{{ t('source') }}</p>

      <ApercuImpression :reglages="config" :html="html" :format="config.format" :orientation="orientation" :nb-pages="nbPages" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import ApercuImpression from '../../components/ApercuImpression.vue'
import ChoixPolice from '../../components/ChoixPolice.vue'
import { usePolices } from '../../composables/usePolices'
import { useClasse } from '../../composables/useClasse'
import { sauvegarder, charger } from '../../utils'
import { useI18n } from '../../i18n'
import messagesFr from '../../i18n/fr/views/imprimer/AffichesView.js'
import messagesBr from '../../i18n/br/views/imprimer/AffichesView.js'
import { AFFICHES_PROGRAMME, RESUMES, VERBES, TEMPS_DU_CHOIX, choixTemps, DEFAUTS, normaliserConfig, genererAffichesProgramme } from '../../impression/affichesProgramme'
import { NIVEAUX } from '../../data/programme'
import domainesFr from '../../i18n/fr/domaines.js'
import domainesBr from '../../i18n/br/domaines.js'

const TEXTES_TEMPS = { present: 'tempsPresent', cycle: 'tempsCycle', cm2: 'tempsCm2' }

const { t } = useI18n({ fr: messagesFr, br: messagesBr })
const { t: nomDomaine } = useI18n({ fr: domainesFr, br: domainesBr })

const CLE = 'affiches_programme_config'
const config = ref(normaliserConfig(charger(CLE, {}) ?? {}))
watch(config, v => sauvegarder(CLE, v), { deep: true })

// ?affiche=…&variante=…&verbe=…&temps=cm2|present (liens de la page « À imprimer » et des pages de téléchargement)
const route = useRoute()
const classe = useClasse()
watch(() => route.query, q => {
  if (!q.affiche) return
  config.value = normaliserConfig({
    ...DEFAUTS, affiche: q.affiche, variante: q.variante, verbe: q.verbe, temps: ['present', 'cm2'].includes(q.temps) ? TEMPS_DU_CHOIX[q.temps] : null,
    // sans niveau dans le lien : la classe choisie dans la barre du haut (normaliserConfig corrige si elle n'existe pas)
    ...(q.domaine ? { domaine: q.domaine } : {}), ...(q.niveau || classe.value ? { niveau: q.niveau || classe.value } : {}),
    format: config.value.format,
  })
}, { immediate: true })

const definition = computed(() => AFFICHES_PROGRAMME.find(a => a.id === config.value.affiche))
const orientation = computed(() => normaliserConfig(config.value).orientation)
// changer d'affiche remet l'orientation habituelle de cette affiche
function choisir(id) {
  config.value = normaliserConfig({ ...config.value, affiche: id, variante: undefined, orientation: null })
}

// « Ce que je sais faire » : les niveaux qui ont au moins une affiche, puis les domaines de ce niveau
const niveauxResume = NIVEAUX.filter(n => RESUMES.some(r => r.niveau === n))
const domainesResume = computed(() => RESUMES.filter(r => r.niveau === config.value.niveau).map(r => r.domaine))
// garde le domaine s'il existe à ce niveau, sinon le premier domaine du niveau (normaliserConfig)
function choisirResume(domaine, niveau) {
  const ok = RESUMES.some(r => r.domaine === domaine && r.niveau === niveau)
  config.value = normaliserConfig({ ...config.value, niveau, domaine: ok ? domaine : RESUMES.find(r => r.niveau === niveau).domaine })
}

const polices = usePolices()
// une police attachée seulement pour les affiches dont la mise en page tient avec elle (les autres : docs/TODO.md)
const attacheePermise = computed(() => ['conjugaison', 'droite', 'numeration'].includes(config.value.affiche))
const resultat = computed(() => polices.pret.value
  ? genererAffichesProgramme(config.value, { script: polices.policeUnique(attacheePermise.value) })
  : { html: '', nbPages: 1 })
const html = computed(() => resultat.value.html)
const nbPages = computed(() => resultat.value.nbPages)
</script>

<style scoped>
.intro { color: #666; margin: -.5rem 0 1.25rem; }
.config-box.large { max-width: 960px; }
.config-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 0 1.5rem; }
.level-btn small { opacity: .7; font-weight: 400; }
.source { color: #777; font-size: .85rem; margin: .5rem 0 1rem; }
</style>
