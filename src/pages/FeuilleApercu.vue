<template>
  <!-- L'aperçu des pages de la fiche : l'image, ◀ ▶ (et les flèches du clavier), « Page 2 sur 3 » annoncé aux lecteurs d'écran, et un choix
       d'exemplaire quand un exercice a plusieurs fiches. Les boutons restent focalisables aux extrémités (aria-disabled). -->
  <section class="apercu" :aria-label="t('feuille.apercu')" :aria-describedby="idAide" @keydown.left.prevent="feuille.aller(-1)" @keydown.right.prevent="feuille.aller(1)">
    <p :id="idAide" class="sr-only">{{ t('feuille.apercuAide') }}</p>
    <div v-if="feuille.entree && feuille.entree.variantes.length > 1" class="exemplaires" role="group" :aria-label="t('feuille.fiches')">
      <button v-for="(v, k) in feuille.entree.variantes" :key="v.id" type="button" class="puce" :aria-pressed="k === feuille.iVariante" @click="feuille.choisirVariante(k)">
        {{ v.titre ? texteDe(v.titre, langueAffichee) : t('feuille.fiche', { n: k + 1 }) }}
      </button>
    </div>
    <div v-if="feuille.page && feuille.entree" class="feuille">
      <img :src="urlFiches(feuille.page.chemin)" :width="feuille.page.largeur" :height="feuille.page.hauteur"
        :alt="t('feuille.apercuPage', { titre: texteDe(feuille.entree.titre, langueAffichee), n: feuille.iPage + 1, total: feuille.nbPages })">
    </div>
    <div v-if="feuille.nbPages > 1" class="pager">
      <button type="button" class="rond" :aria-label="t('feuille.precedente')" :aria-disabled="feuille.iPage === 0" @click="feuille.aller(-1)">◀</button>
      <span class="position" role="status" aria-live="polite">{{ t('feuille.page', { n: feuille.iPage + 1, total: feuille.nbPages }) }}</span>
      <button type="button" class="rond" :aria-label="t('feuille.suivante')" :aria-disabled="feuille.iPage === feuille.nbPages - 1" @click="feuille.aller(1)">▶</button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useId } from 'vue'
import { useLangue } from '../langues/useLangue.ts'
import { urlFiches } from '../telechargements/chargement.ts'
import { texteDe } from '../telechargements/recherche.ts'
import type { Feuille } from '../telechargements/useFeuille.ts'

defineProps<{ feuille: Feuille }>()
const { t, langueAffichee } = useLangue()
const idAide = useId()
</script>

<style scoped>
.apercu { background: #e3e8ee; border-radius: var(--radius); padding: 1rem; display: flex; flex-direction: column; align-items: center; gap: .8rem; }
.exemplaires { display: flex; flex-wrap: wrap; gap: .4rem; justify-content: center; }
.puce { min-height: 44px; padding: .3rem 1rem; border: 2px solid var(--gris-brd); background: white; border-radius: 22px; font-weight: 700; color: var(--texte); }
.puce[aria-pressed="true"] { background: var(--bleu-fort); border-color: var(--bleu-fort); color: white; }
.feuille { width: 100%; display: flex; justify-content: center; }
.feuille img { max-width: 100%; height: auto; max-height: 560px; width: auto; box-shadow: 0 4px 16px rgba(0, 0, 0, .25); background: white; }
.pager { display: flex; align-items: center; gap: .8rem; font-weight: 700; }
.rond { width: 2.75rem; height: 2.75rem; border-radius: 50%; border: 2px solid var(--gris-brd); background: white; font-size: 1rem; color: var(--texte); }
.rond[aria-disabled="true"] { opacity: .45; cursor: default; }
</style>
