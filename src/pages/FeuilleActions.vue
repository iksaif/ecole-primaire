<template>
  <!-- Télécharger et Imprimer : deux boutons séparés. Le choix du format de papier et du sens n'apparaît que si la fiche en déclare plusieurs. -->
  <div v-if="feuille.entree && feuille.variante && feuille.pdf" class="boite">
    <div v-if="feuille.choixDeFormat" class="formats" role="group" :aria-label="t('feuille.format')">
      <span class="lab" aria-hidden="true">{{ t('feuille.format') }}</span>
      <button v-for="f in formats" :key="f" type="button" class="puce" :aria-pressed="f === feuille.pdf.format" @click="feuille.choisirFormat(f)">{{ f }}</button>
    </div>
    <div v-if="feuille.choixDeSens" class="formats" role="group" :aria-label="t('feuille.sens')">
      <span class="lab" aria-hidden="true">{{ t('feuille.sens') }}</span>
      <button v-for="o in sens" :key="o" type="button" class="puce" :aria-pressed="o === feuille.pdf.orientation" @click="feuille.choisirSens(o)">{{ t(`feuille.${o}`) }}</button>
    </div>
    <div class="actions">
      <a class="btn btn-primary" :href="urlFiches(feuille.pdf.chemin)" download>{{ t('feuille.telecharger') }}</a>
      <button type="button" class="btn btn-ghost" @click="imprimerPdf(urlFiches(feuille.pdf.chemin), feuille.entree.slug)">{{ t('feuille.imprimer') }}</button>
    </div>
    <p class="detail">{{ t('feuille.detailPdf', { n: feuille.pdf.nbPages, format: feuille.pdf.format, sens: t(`feuille.${feuille.pdf.orientation}`), taille: taille(feuille.pdf.taille) }) }}</p>
    <p class="detail">{{ t('feuille.imprimerAide') }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useLangue } from '../langues/useLangue.ts'
import { urlFiches } from '../telechargements/chargement.ts'
import { imprimerPdf } from '../telechargements/imprimer.ts'
import { formatsDe, orientationsDe } from '../telechargements/pages.ts'
import type { Feuille } from '../telechargements/useFeuille.ts'

const props = defineProps<{ feuille: Feuille }>()
const { t } = useLangue()
const formats = computed(() => (props.feuille.variante ? formatsDe(props.feuille.variante) : []))
const sens = computed(() => (props.feuille.variante ? orientationsDe(props.feuille.variante) : []))
/** « 85 Ko », « 1,2 Mo » : le séparateur décimal est celui de la langue de l'interface */
const taille = (octets: number): string => (octets >= 1e6 ? `${(octets / 1e6).toLocaleString(undefined, { maximumFractionDigits: 1 })} Mo` : `${Math.max(1, Math.round(octets / 1e3))} Ko`)
</script>

<style scoped>
.boite { background: white; border-radius: var(--radius); box-shadow: var(--shadow); padding: 1rem 1.1rem; display: flex; flex-direction: column; gap: .7rem; }
.formats { display: flex; flex-wrap: wrap; gap: .4rem; align-items: center; }
.lab { font-size: .8rem; font-weight: 800; text-transform: uppercase; letter-spacing: .04em; color: var(--texte-doux); margin-right: .3rem; }
.puce { min-height: 44px; min-width: 44px; padding: .3rem 1rem; border: 2px solid var(--gris-brd); background: white; border-radius: 22px; font-weight: 700; color: var(--texte); }
.puce[aria-pressed="true"] { background: var(--bleu-fort); border-color: var(--bleu-fort); color: white; }
.actions { display: flex; flex-wrap: wrap; gap: .6rem; }
.actions .btn { flex: 1 1 10rem; justify-content: center; min-height: 48px; text-decoration: none; }
.detail { font-size: .85rem; color: var(--texte-doux); }
</style>
