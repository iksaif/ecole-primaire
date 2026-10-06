<template>
  <!-- Télécharger et Imprimer : deux boutons séparés. Le choix du format de papier n'apparaît que si la fiche en déclare plusieurs. -->
  <div v-if="feuille.entree && feuille.variante && feuille.pdf" class="boite">
    <div v-if="feuille.choixDeFormat" class="formats" role="group" :aria-label="t('feuille.format')">
      <span class="lab" aria-hidden="true">{{ t('feuille.format') }}</span>
      <button v-for="p in feuille.variante.pdfs" :key="p.format" type="button" class="puce" :aria-pressed="p.format === feuille.pdf.format" @click="feuille.choisirFormat(p.format)">{{ p.format }}</button>
    </div>
    <div class="actions">
      <a class="btn btn-primary" :href="urlFiches(feuille.pdf.chemin)" download>{{ t('feuille.telecharger') }}</a>
      <button type="button" class="btn btn-ghost" @click="imprimerPdf(urlFiches(feuille.pdf.chemin), feuille.entree.slug)">{{ t('feuille.imprimer') }}</button>
    </div>
    <p class="detail">{{ t('feuille.detailPdf', { n: feuille.pdf.nbPages, format: feuille.pdf.format, taille: taille(feuille.pdf.taille) }) }}</p>
    <p class="detail">{{ t('feuille.imprimerAide') }}</p>
  </div>
</template>

<script setup lang="ts">
import { useLangue } from '../langues/useLangue.ts'
import { urlFiches } from '../telechargements/chargement.ts'
import { imprimerPdf } from '../telechargements/imprimer.ts'
import type { Feuille } from '../telechargements/useFeuille.ts'

defineProps<{ feuille: Feuille }>()
const { t } = useLangue()
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
