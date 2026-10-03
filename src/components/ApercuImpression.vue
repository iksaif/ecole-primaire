<template>
  <div class="apercu">
    <div class="apercu-barre">
      <span class="apercu-info">{{ t('apercu') }} — {{ format }} {{ orientation === 'landscape' ? t('paysage') : t('portrait') }}
        <template v-if="nbPages > 1"> · {{ t('pages', { n: nbPages }) }}</template></span>
      <button class="btn btn-primary" :disabled="!html" @click="imprimer">{{ t('imprimer') }}</button>
    </div>
    <div ref="cadre" class="apercu-cadre" :style="{ height: hauteurCadre + 'px' }">
      <iframe v-if="html" :srcdoc="html" :title="t('titreCadre')"
        :style="{ width: largeurPx + 'px', height: hauteurPx + 'px', transform: `scale(${echelle})`, left: decalage + 'px' }"></iframe>
    </div>
    <p class="apercu-note">{{ t('conseil') }}</p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { dimensionsPage, imprimerDocument } from '../utils/impression'
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
})

const MM = 96 / 25.4
const cadre = ref(null)
const largeurCadre = ref(600)

const dims = computed(() => dimensionsPage(props.format, props.orientation))
// marge d'affichage autour des feuilles dans l'iframe
const largeurPx = computed(() => dims.value.w * MM + 24)
const hauteurPx = computed(() => (dims.value.h + 8) * MM * Math.min(props.nbPages, 1.6) + 8)
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
  imprimerDocument(props.html)
}
</script>

<style scoped>
.apercu { margin-top: 1.5rem; }
.apercu-barre {
  display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap;
  margin-bottom: .75rem;
}
.apercu-info { font-weight: 700; color: #666; font-size: .9rem; }
.apercu-cadre {
  background: #e9ecef; border-radius: var(--radius); overflow: hidden; position: relative;
}
.apercu-cadre iframe {
  border: 0; transform-origin: 0 0; position: absolute; top: 0; background: #e9ecef;
}
.apercu-note { font-size: .8rem; color: #888; margin-top: .5rem; text-align: center; }
</style>
