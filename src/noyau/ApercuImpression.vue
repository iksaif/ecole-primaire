<template>
  <div ref="racine" class="apercu" :class="{ 'page-entiere': pageEntiere }">
    <div class="apercu-barre">
      <span class="apercu-info">{{ t('cadre.apercu.titre') }}<template v-if="!fluide"> — {{ format }} {{ orientation === 'landscape' ? t('cadre.apercu.paysage') : t('cadre.apercu.portrait') }}
        <template v-if="nbPages > 1"> · {{ t('fichesPretes.pages', { n: nbPages }) }}</template></template></span>
      <span class="apercu-actions">
        <slot name="actions" />
        <button type="button" class="btn btn-primary" :disabled="!html" @click="imprimer"><Icone nom="imprimer" /> {{ t('ressource.imprimer') }}</button>
      </span>
    </div>
    <div ref="cadre" class="apercu-cadre" :style="{ height: hauteurCadre + 'px' }">
      <iframe v-if="html" ref="iframe" :srcdoc="document" sandbox="allow-same-origin" :class="{ fluide }" :title="t('cadre.apercu.titreCadre')"
        :style="{ width: largeurPx + 'px', height: hauteurIframe + 'px', transform: `scale(${echelle})`, left: decalage + 'px' }" @load="marquerSautsDePage"></iframe>
    </div>
    <p class="apercu-note">{{ t('cadre.apercu.conseil') }}</p>
    <!-- l'aperçu est plus bas dans la page (écran moyen ou étroit) : une barre en bas de l'écran pour y aller, ou imprimer tout de suite -->
    <div v-if="barreVisible" class="barre-flottante" role="region" :aria-label="t('cadre.apercu.barre')">
      <button type="button" class="btn btn-ghost" @click="allerAApercu"><Icone nom="yeux" /> {{ t('cadre.apercu.voir') }}</button>
      <button type="button" class="btn btn-primary" :disabled="!html" @click="imprimer"><Icone nom="imprimer" /> {{ t('ressource.imprimer') }}</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import Icone from '../images/Icone.vue'
// L'aperçu d'un document à imprimer (fiche d'exercice, affiche) et son bouton Imprimer. L'iframe d'aperçu est en bac à sable sans
// allow-scripts : la fiche n'exécute aucun script ; allow-same-origin laisse charger les polices du site (l'impression passe par un
// autre iframe : imprimerDocument). Imprimer envoie un signal anonyme (journal.js : la page et les réglages, jamais d'identifiant).
// `pageEntiere` (à côté des réglages, grand écran) : une page tient entière dans la hauteur de la fenêtre. Sinon, tant que l'aperçu est
// plus bas dans la page, une barre en bas de l'écran propose « Voir l'aperçu » et Imprimer.
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
  /** la première page tient entière dans la hauteur de la fenêtre (aperçu à côté des réglages : CadreExercice) */
  pageEntiere?: boolean
}>(), { html: '', format: 'A4', orientation: 'portrait', nbPages: 1, fluide: false, reglages: null, pageEntiere: false })

const { t } = useLangue()
// les anciennes fiches embarquaient un script qui lançait l'impression à l'ouverture : on le retire (le bouton Imprimer s'en charge)
const document = computed(() => props.html.replace(/<script>[^<]*print\(\)[^<]*<\/script>/g, ''))

const route = useRoute()
const MM = 96 / 25.4
const cadre = ref<HTMLElement | null>(null)
const largeurCadre = ref(600)
const hauteurFenetre = ref(typeof window === 'undefined' ? 900 : window.innerHeight)
// page entière : place laissée au-dessus et au-dessous de l'aperçu (barre du site, boutons, conseil), et hauteur minimale
const RESERVE_FENETRE = 190
const HAUTEUR_MIN = 360

const dims = computed(() => dimensionsPage(props.format, props.orientation))
// marge d'affichage autour des feuilles dans l'iframe
const largeurPx = computed(() => dims.value.w * MM + 24)
const hauteurPx = computed(() => (dims.value.h + 8) * MM * (props.fluide ? 1.25 : Math.min(props.nbPages, 1.6)) + 8)
// Page entière : la hauteur visible est celle de la fenêtre, et l'échelle fait tenir une page (le reste défile dans l'aperçu)
const hauteurVisible = computed(() => Math.max(HAUTEUR_MIN, hauteurFenetre.value - RESERVE_FENETRE))
const hauteurPage = computed(() => (dims.value.h + 8) * MM)
const echelle = computed(() => {
  const enLargeur = Math.min(1, largeurCadre.value / largeurPx.value)
  if (!props.pageEntiere) return enLargeur
  return Math.min(enLargeur, hauteurVisible.value / hauteurPage.value)
})
const decalage = computed(() => Math.max(0, (largeurCadre.value - largeurPx.value * echelle.value) / 2))
// page entière : la hauteur de la fenêtre, sans dépasser celle du document réduit (une page en paysage est moins haute)
const hauteurCadre = computed(() => {
  const hauteurReduite = hauteurPx.value * echelle.value
  if (!props.pageEntiere) return hauteurReduite
  return Math.min(hauteurVisible.value, hauteurReduite)
})
// hauteur de l'iframe, avant réduction : en page entière, elle remplit le cadre
const hauteurIframe = computed(() => (props.pageEntiere ? hauteurCadre.value / echelle.value : hauteurPx.value))

// Document fluide : l'aperçu montre où l'impression passe à une nouvelle feuille (corrigé sur une autre page, pages de la dictée,
// pièces à découper…), une bande grise « Page 2 » avant chaque élément qui demande un saut de page (lu dans son style calculé : la
// fiche n'a rien à déclarer). Seulement à l'écran : l'impression passe par un autre document (imprimerDocument).
const iframe = ref<HTMLIFrameElement | null>(null)
const CSS_SAUT = `@media screen { .saut-apercu { width: 100vw; margin: 1cm calc(50% - 50vw); padding: 6px 0; background: #e9ecef;
  color: #555; font: 600 12px system-ui, sans-serif; text-align: center; } } @media print { .saut-apercu { display: none; } }`

/** L'élément commence-t-il une nouvelle feuille à l'impression ? */
function commenceUnePage(style: CSSStyleDeclaration): boolean {
  return style.breakBefore === 'page' || style.pageBreakBefore === 'always'
}

function marquerSautsDePage(): void {
  const doc = iframe.value?.contentDocument
  const fenetre = doc?.defaultView
  if (!props.fluide || !doc?.body || !fenetre) return
  const style = doc.createElement('style')
  style.textContent = CSS_SAUT
  doc.head.append(style)
  const sauts = [...doc.body.querySelectorAll<HTMLElement>('*')].filter(e => commenceUnePage(fenetre.getComputedStyle(e)))
  sauts.forEach((element, i) => {
    const bande = doc.createElement('div')
    bande.className = 'saut-apercu'
    bande.textContent = t('cadre.apercu.page', { n: i + 2 })
    element.before(bande)
  })
}

// La barre en bas de l'écran : tant que l'aperçu commence sous le bas de la fenêtre (jamais à côté des réglages : il y est visible)
const racine = ref<HTMLElement | null>(null)
const apercuPlusBas = ref(false)
const barreVisible = computed(() => !props.pageEntiere && apercuPlusBas.value)
function allerAApercu(): void {
  racine.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

let obs: ResizeObserver | null = null
let visibilite: IntersectionObserver | null = null
const suivreFenetre = () => { hauteurFenetre.value = window.innerHeight }
onMounted(() => {
  obs = new ResizeObserver(([e]) => { largeurCadre.value = e.contentRect.width })
  if (cadre.value) obs.observe(cadre.value)
  window.addEventListener('resize', suivreFenetre)
  if (racine.value && typeof IntersectionObserver !== 'undefined') {
    visibilite = new IntersectionObserver(([e]) => { apercuPlusBas.value = !e.isIntersecting && e.boundingClientRect.top > 0 })
    visibilite.observe(racine.value)
  }
})
onUnmounted(() => {
  obs?.disconnect()
  visibilite?.disconnect()
  window.removeEventListener('resize', suivreFenetre)
})

function imprimer(): void {
  imprimerDocument(document.value)
  journaliser('imprimer', { r: route.path, d: props.reglages })
}
</script>

<style scoped>
.apercu { margin-top: 1.5rem; }
/* page entière : à côté des réglages (.cote-a-cote, style.css), en haut de sa colonne */
.apercu.page-entiere { margin-top: 0; }
.apercu-barre { display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap; margin-bottom: .75rem; }
.apercu-actions { display: flex; gap: .5rem; flex-wrap: wrap; }
.apercu-info { font-weight: 700; color: var(--texte-doux); font-size: .9rem; }
.apercu-cadre { background: #e9ecef; border-radius: var(--radius); overflow: hidden; position: relative; }
.apercu-cadre iframe { border: 0; transform-origin: 0 0; position: absolute; top: 0; background: #e9ecef; }
.apercu-cadre iframe.fluide { background: white; }
/* en bas de l'écran, centrée, au-dessus du contenu ; jamais plus large que l'écran (16 px de marge sur un téléphone) */
.barre-flottante {
  position: fixed; bottom: 16px; left: 50%; transform: translateX(-50%); z-index: 20; display: flex; gap: .5rem;
  max-width: calc(100vw - 32px); padding: .5rem; background: white; border-radius: 14px; box-shadow: 0 4px 18px rgba(0, 0, 0, .18);
}
.barre-flottante .btn { white-space: nowrap; }
.apercu-note { font-size: .8rem; color: var(--texte-doux); margin-top: .5rem; text-align: center; }
</style>
