<template>
  <div class="apercu">
    <div class="apercu-barre">
      <span class="apercu-info">{{ t('cadre.apercu.titre') }}<template v-if="!fluide"> — {{ format }} {{ orientation === 'landscape' ? t('cadre.apercu.paysage') : t('cadre.apercu.portrait') }}
        <template v-if="nbPages > 1"> · {{ t('fichesPretes.pages', { n: nbPages }) }}</template></template></span>
      <span class="apercu-actions">
        <slot name="actions" />
        <button type="button" class="btn btn-primary" :disabled="!html" @click="imprimer">{{ t('cadre.apercu.imprimer') }}</button>
      </span>
    </div>
    <div ref="cadre" class="apercu-cadre" :style="{ height: hauteurCadre + 'px' }">
      <iframe v-if="html" :srcdoc="document" sandbox="allow-same-origin" :class="{ fluide }" :title="t('cadre.apercu.titreCadre')"
        :style="{ width: largeurPx + 'px', height: hauteurPx + 'px', transform: `scale(${echelle})`, left: decalage + 'px' }"></iframe>
    </div>
    <p class="apercu-note">{{ t('cadre.apercu.conseil') }}</p>
  </div>
</template>

<script setup lang="ts">
// L'aperçu d'un document à imprimer (fiche d'exercice, affiche) et son bouton Imprimer. L'iframe d'aperçu est en bac à sable sans
// allow-scripts : la fiche n'exécute aucun script ; allow-same-origin laisse charger les polices du site (l'impression passe par un
// autre iframe : imprimerDocument). Imprimer envoie un signal anonyme (journal.js : la page et les réglages, jamais d'identifiant).
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { dimensionsPage, imprimerDocument } from '../utils/impression.js'
import { journaliser } from '../utils/journal.js'
import { useLangue } from '../langues/useLangue.ts'

const props = withDefaults(defineProps<{
  html?: string
  format?: string
  orientation?: string
  nbPages?: number
  /** document qui s'écoule librement (pas de <section class="page"> de taille fixe) */
  fluide?: boolean
  /** réglages de la fiche, envoyés (anonymement) dans les statistiques quand on imprime */
  reglages?: object | null
}>(), { html: '', format: 'A4', orientation: 'portrait', nbPages: 1, fluide: false, reglages: null })

const { t } = useLangue()
// les anciennes fiches embarquaient un script qui lançait l'impression à l'ouverture : on le retire (le bouton Imprimer s'en charge)
const document = computed(() => props.html.replace(/<script>[^<]*print\(\)[^<]*<\/script>/g, ''))

const route = useRoute()
const MM = 96 / 25.4
const cadre = ref<HTMLElement | null>(null)
const largeurCadre = ref(600)

const dims = computed(() => dimensionsPage(props.format, props.orientation))
// marge d'affichage autour des feuilles dans l'iframe
const largeurPx = computed(() => dims.value.w * MM + 24)
const hauteurPx = computed(() => (dims.value.h + 8) * MM * (props.fluide ? 1.25 : Math.min(props.nbPages, 1.6)) + 8)
const echelle = computed(() => Math.min(1, largeurCadre.value / largeurPx.value))
const decalage = computed(() => Math.max(0, (largeurCadre.value - largeurPx.value * echelle.value) / 2))
const hauteurCadre = computed(() => hauteurPx.value * echelle.value)

let obs: ResizeObserver | null = null
onMounted(() => {
  obs = new ResizeObserver(([e]) => { largeurCadre.value = e.contentRect.width })
  if (cadre.value) obs.observe(cadre.value)
})
onUnmounted(() => obs?.disconnect())

function imprimer(): void {
  imprimerDocument(document.value)
  journaliser('imprimer', { r: route.path, d: props.reglages })
}
</script>

<style scoped>
.apercu { margin-top: 1.5rem; }
.apercu-barre { display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap; margin-bottom: .75rem; }
.apercu-actions { display: flex; gap: .5rem; flex-wrap: wrap; }
.apercu-info { font-weight: 700; color: var(--texte-doux); font-size: .9rem; }
.apercu-cadre { background: #e9ecef; border-radius: var(--radius); overflow: hidden; position: relative; }
.apercu-cadre iframe { border: 0; transform-origin: 0 0; position: absolute; top: 0; background: #e9ecef; }
.apercu-cadre iframe.fluide { background: white; }
.apercu-note { font-size: .8rem; color: var(--texte-doux); margin-top: .5rem; text-align: center; }
</style>
