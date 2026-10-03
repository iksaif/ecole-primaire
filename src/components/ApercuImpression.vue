<template>
  <div class="apercu">
    <div class="apercu-barre">
      <span class="apercu-info">{{ t('apercu') }}<template v-if="!fluide"> — {{ format }} {{ orientation === 'landscape' ? t('paysage') : t('portrait') }}
        <template v-if="nbPages > 1"> · {{ t('pages', { n: nbPages }) }}</template></template></span>
      <span class="apercu-actions">
        <slot name="actions" />
        <button class="btn btn-primary" :disabled="!html" @click="imprimer">{{ t('imprimer') }}</button>
      </span>
    </div>
    <div ref="cadre" class="apercu-cadre" :style="{ height: hauteurCadre + 'px' }">
      <iframe v-if="html" :srcdoc="document" :class="{ fluide }" :title="t('titreCadre')"
        :style="{ width: largeurPx + 'px', height: hauteurPx + 'px', transform: `scale(${echelle})`, left: decalage + 'px' }"></iframe>
    </div>
    <p class="apercu-note">{{ t('conseil') }}</p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { dimensionsPage, imprimerDocument } from '../utils/impression'
import { journaliser } from '../utils/journal'
import { useI18n } from '../i18n'

const { t } = useI18n({
  fr: {
    apercu: 'Aperçu', paysage: 'paysage', portrait: 'portrait', pages: '{n} pages',
    titreCadre: 'Aperçu avant impression',
    conseil: "Conseil : dans la fenêtre d'impression, choisis « Taille réelle / 100 % » et désactive « Ajuster à la page ».",
  },
  br: {
    // « pajennoù : 3 » évite la mutation après le chiffre (div bajenn, tri fajenn…)
    apercu: 'Rakwel', paysage: 'gweledva', portrait: 'poltred', pages: 'pajennoù : {n}', // br: à relire (gweledva = paysage)
    titreCadre: 'Rakwel a-raok moullañ',
    // br: à relire — les libellés exacts de la fenêtre d'impression dépendent de la langue du navigateur
    conseil: "Alioù : er prenestr moullañ, dibab ar ment gwir (100 %) ha na azasait ket ouzh ar bajenn.",
  },
})

const props = defineProps({
  html: { type: String, default: '' },
  format: { type: String, default: 'A4' },
  orientation: { type: String, default: 'portrait' },
  nbPages: { type: Number, default: 1 },
  // document qui s'écoule librement (pas de <section class="page"> de taille fixe)
  fluide: { type: Boolean, default: false },
  // réglages de la fiche, envoyés (anonymement) dans les statistiques quand on imprime
  reglages: { type: Object, default: null },
})

// Les anciennes fiches embarquent un script qui lance l'impression à l'ouverture : on le retire
// (l'aperçu ne doit rien imprimer ; le bouton Imprimer s'en charge)
const document = computed(() => props.html.replace(/<script>[^<]*print\(\)[^<]*<\/script>/g, ''))

const route = useRoute()
const MM = 96 / 25.4
const cadre = ref(null)
const largeurCadre = ref(600)

const dims = computed(() => dimensionsPage(props.format, props.orientation))
// marge d'affichage autour des feuilles dans l'iframe
const largeurPx = computed(() => dims.value.w * MM + 24)
const hauteurPx = computed(() => (dims.value.h + 8) * MM * (props.fluide ? 1.25 : Math.min(props.nbPages, 1.6)) + 8)
const echelle = computed(() => Math.min(1, largeurCadre.value / largeurPx.value))
const decalage = computed(() => Math.max(0, (largeurCadre.value - largeurPx.value * echelle.value) / 2))
const hauteurCadre = computed(() => hauteurPx.value * echelle.value)

let obs = null
onMounted(() => {
  obs = new ResizeObserver(([e]) => { largeurCadre.value = e.contentRect.width })
  obs.observe(cadre.value)
})
onUnmounted(() => obs?.disconnect())

function imprimer() {
  imprimerDocument(document.value)
  journaliser('imprimer', { r: route.path, d: props.reglages })
}
</script>

<style scoped>
.apercu { margin-top: 1.5rem; }
.apercu-barre {
  display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap;
  margin-bottom: .75rem;
}
.apercu-actions { display: flex; gap: .5rem; flex-wrap: wrap; }
.apercu-info { font-weight: 700; color: #666; font-size: .9rem; }
.apercu-cadre {
  background: #e9ecef; border-radius: var(--radius); overflow: hidden; position: relative;
}
.apercu-cadre iframe {
  border: 0; transform-origin: 0 0; position: absolute; top: 0; background: #e9ecef;
}
.apercu-cadre iframe.fluide { background: white; }
.apercu-note { font-size: .8rem; color: #888; margin-top: .5rem; text-align: center; }
</style>
