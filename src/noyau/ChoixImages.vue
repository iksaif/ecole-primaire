<!--
  La préférence « Images » (src/images/preference.ts, mémorisée par useImagesFiche) : la famille des dessins (ceux du site, OpenMoji,
  ou les emojis de l'appareil), puis leur style (couleur, ou contour à colorier), proposé seulement pour les dessins du site.
  Dans « Sur la fiche » (OptionsFiche, si l'exercice a des images) et dans le formulaire des affiches (si l'affiche en a).
  Chaque bouton montre son rendu (le même chat) : on choisit en voyant. Accessibilité : deux groupes de boutons nommés, l'état dans
  aria-pressed, comme les autres réglages à choix ; l'aperçu est décoratif (le libellé dit le choix).
-->
<template>
  <div class="config-section choix-images" data-reglage="images" role="group" :aria-labelledby="idTitre">
    <div :id="idTitre" class="config-section-title">{{ t('cadre.images.titre') }}</div>
    <div class="btn-group" role="group" :aria-label="t('cadre.images.famille')">
      <button v-for="f in FAMILLES_IMAGES" :key="f" type="button" class="level-btn" :data-valeur="f"
        :class="{ active: images.famille === f }" :aria-pressed="images.famille === f" @click="images.famille = f">
        <Emoji nom="chat" :famille="f" taille="1.4em" />{{ t(`cadre.images.${f}`) }}
      </button>
    </div>
    <div v-if="images.famille === 'openmoji'" class="btn-group" role="group" :aria-label="t('cadre.images.style')">
      <button v-for="s in STYLES_IMAGES" :key="s" type="button" class="level-btn" :data-valeur="s"
        :class="{ active: images.style === s }" :aria-pressed="images.style === s" @click="images.style = s">
        <Emoji nom="chat" famille="openmoji" :trait="s" taille="1.4em" />{{ t(`cadre.images.${s}`) }}
      </button>
    </div>
    <p v-else class="note">{{ t('cadre.images.noteSysteme') }}</p>
  </div>
</template>

<script setup lang="ts">
import { useId } from 'vue'
import Emoji from '../images/Emoji.vue'
import { FAMILLES_IMAGES, STYLES_IMAGES } from '../images/preference.ts'
import { useImagesFiche } from '../images/useImagesFiche.ts'
import { useLangue } from '../langues/useLangue.ts'

const { t } = useLangue()
const idTitre = useId()
const images = useImagesFiche()
</script>

<style scoped>
.btn-group + .btn-group { margin-top: .4rem; }
/* dans une grille de réglages (formulaire des affiches) : toute la largeur, les deux choix restent chacun sur une ligne */
.choix-images { grid-column: 1 / -1; }
.level-btn { display: inline-flex; align-items: center; gap: .4rem; }
.note { font-size: .85rem; color: var(--texte-doux); margin: .35rem 0 0; }
</style>
