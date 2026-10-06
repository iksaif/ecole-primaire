<template>
  <div class="cadenas" role="dialog" :aria-label="t('shell.cadenas.titre')">
    <h3>{{ EMOJI_BARRE.verrou }} {{ t('shell.cadenas.titre') }}</h3>
    <p>{{ t('shell.cadenas.consigne') }}</p>
    <button ref="bouton" type="button" class="appui" :aria-label="t('shell.cadenas.bouton')"
      @pointerdown.prevent="demarrer" @pointerup="arreter" @pointercancel="arreter" @pointerleave="arreter" @contextmenu.prevent
      @keydown.space.prevent="touche" @keyup.space.prevent="arreter" @blur="arreter">
      <svg viewBox="0 0 64 64" width="88" height="88" aria-hidden="true">
        <circle cx="32" cy="32" r="26" class="fond" />
        <circle cx="32" cy="32" r="26" class="anneau" :stroke-dasharray="CIRCONFERENCE" :stroke-dashoffset="CIRCONFERENCE * (1 - progression)" transform="rotate(-90 32 32)" />
        <text x="32" y="40" text-anchor="middle" font-size="24">{{ EMOJI_BARRE.verrou }}</text>
      </svg>
    </button>
    <p class="aide">{{ t('shell.cadenas.aide') }}</p>
    <!-- annonces pour les lecteurs d'écran : début, abandon, réussite -->
    <p class="sr-only" role="status" aria-live="polite" data-annonce>{{ annonce }}</p>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useLangue } from '../langues/useLangue.ts'
import { EMOJI_BARRE } from './emojis.ts'
import { useAppuiLong } from './useAppuiLong.ts'

const emit = defineEmits<{ ouvert: [] }>()
const { t } = useLangue()
const CIRCONFERENCE = 163.4
const DUREE_MS = 2000
const bouton = ref<HTMLButtonElement | null>(null)
const annonce = ref('')

const { progression, demarrer, arreter } = useAppuiLong(DUREE_MS, {
  debut: () => { annonce.value = t('shell.cadenas.enCours') },
  abandon: () => { annonce.value = t('shell.cadenas.tropTot') },
  fin: () => { annonce.value = t('shell.cadenas.ouvert'); emit('ouvert') },
})
/** maintenir la barre d'espace : l'auto-répétition du clavier ne redémarre pas le geste */
const touche = (e: KeyboardEvent): void => { if (!e.repeat) demarrer() }
// le focus arrive sur le bouton à l'ouverture (clavier : espace maintenu directement)
onMounted(() => bouton.value?.focus())
</script>

<style scoped>
.cadenas { text-align: left; }
h3 { font-size: .8rem; text-transform: uppercase; letter-spacing: .05em; color: var(--texte-doux); margin-bottom: .4rem; }
p { font-size: .9rem; margin-bottom: .4rem; }
.appui { display: block; margin: .3rem auto; border: none; background: none; border-radius: 50%; cursor: pointer; touch-action: none; user-select: none; -webkit-user-select: none; -webkit-touch-callout: none; }
.fond { fill: #fff8e1; stroke: var(--gris-brd); stroke-width: 6; }
.anneau { fill: none; stroke: var(--vert-texte); stroke-width: 6; stroke-linecap: round; }
.aide { text-align: center; font-size: .78rem; color: var(--texte-doux); }
</style>
