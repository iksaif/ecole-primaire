<template>
  <div v-if="options.length > 1" class="choix-langue" role="group" :aria-label="t('shell.langue.titre')">
    <span class="titre"><span aria-hidden="true">{{ EMOJI_BARRE.langue }}</span> {{ t('shell.langue.titre') }}</span>
    <button v-for="o in options" :key="o.id" type="button" class="puce" :class="{ active: o.actif }" :aria-pressed="o.actif" @click="choisir(o)">{{ o.titre }}</button>
  </div>
</template>

<script setup lang="ts">
// Le choix du mode de langue sur l'accueil (Français · Français + langue régionale · langue régionale seule), sous le choix de
// classe ; rien si le site ne propose aucune langue régionale. Même source que le sélecteur de la barre (useModesLangue).
import { useModesLangue } from '../shell/useModesLangue.ts'
import { EMOJI_BARRE } from '../shell/emojis.ts'
import { useLangue } from '../langues/useLangue.ts'

const { t } = useLangue()
const { options, choisir } = useModesLangue()
</script>

<style scoped>
.choix-langue { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: .4rem; background: white; box-shadow: var(--shadow); border-radius: 999px; padding: .5rem 1rem; margin-top: .6rem; }
.titre { font-weight: 800; margin-right: .4rem; }
.puce { border: 2px solid var(--gris-brd); background: white; border-radius: 999px; min-height: 2.75rem; padding: .3rem .9rem; font: inherit; font-weight: 800; font-size: .9rem; color: var(--texte); cursor: pointer; }
.puce:hover { border-color: var(--vert-texte); }
.puce.active { background: var(--vert-texte); border-color: var(--vert-texte); color: white; }
@media (max-width: 600px) { .choix-langue { border-radius: var(--radius); } }
</style>
