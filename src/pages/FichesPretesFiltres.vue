<template>
  <!-- Recherche et filtres des fiches : classe (celle du contexte, ou toutes), usage, domaine, et langue seulement en mode bilingue
       (sinon la langue est imposée par le mode). Des boutons à état (aria-pressed) pour les choix courts, une liste pour les domaines. -->
  <form class="filtres" role="search" :aria-label="t('fichesPretes.filtres')" @submit.prevent>
    <div class="ligne">
      <label class="lab" :for="idRecherche">{{ t('fichesPretes.rechercher') }}</label>
      <input :id="idRecherche" :value="page.saisis.texte" class="recherche" type="search" autocomplete="off" :placeholder="t('fichesPretes.exemple')" @input="page.regler({ texte: valeurDe($event) })">
    </div>

    <div class="ligne" role="group" :aria-label="t('fichesPretes.classe')">
      <span class="lab" aria-hidden="true">{{ t('fichesPretes.classe') }}</span>
      <button v-for="c in NIVEAUX" :key="c" type="button" class="puce" :aria-pressed="page.classeActive(c)" :disabled="page.verrouillee" @click="page.choisirClasse(c)">{{ c.toUpperCase() }}</button>
      <button type="button" class="puce" :aria-pressed="page.toutes" :disabled="page.verrouillee" @click="page.choisirToutes()">{{ t('fichesPretes.toutesClasses') }}</button>
    </div>

    <div class="ligne" role="group" :aria-label="t('fichesPretes.usage')">
      <span class="lab" aria-hidden="true">{{ t('fichesPretes.usage') }}</span>
      <button type="button" class="puce" :aria-pressed="page.saisis.usage === ''" @click="page.regler({ usage: '' })">{{ t('fichesPretes.tous') }}</button>
      <button v-for="u in USAGES" :key="u" type="button" class="puce" :aria-pressed="page.saisis.usage === u" @click="page.regler({ usage: u })">{{ t(u === 'apprendre' ? 'fichesPretes.apprendre' : 'fichesPretes.sentrainer') }}</button>
    </div>

    <div class="ligne">
      <template v-if="page.domaines.length">
        <label class="lab" :for="idDomaine">{{ t('fichesPretes.domaine') }}</label>
        <select :id="idDomaine" :value="page.criteres.domaine" class="menu" @change="page.regler({ domaine: valeurDe($event) })">
          <option value="">{{ t('fichesPretes.tousDomaines') }}</option>
          <option v-for="d in page.domaines" :key="d.id ?? 'hors-programme'" :value="d.id ?? 'hors-programme'">{{ texteDe(d.nom, langueAffichee) }}</option>
        </select>
      </template>
      <div v-if="page.langues.length" class="groupe" role="group" :aria-label="t('fichesPretes.langue')">
        <span class="lab" aria-hidden="true">{{ t('fichesPretes.langue') }}</span>
        <button type="button" class="puce" :aria-pressed="page.criteres.langue === ''" @click="page.regler({ langue: '' })">{{ t('fichesPretes.toutesLangues') }}</button>
        <button v-for="l in page.langues" :key="l" type="button" class="puce" :aria-pressed="page.criteres.langue === l" @click="page.regler({ langue: l })">
          <FichesPretesLangues :langues="languesDuChoix(l)" toujours /><span aria-hidden="true">{{ codeDuChoix(l) }}</span><span class="sr-only">{{ nomDuChoix(l) }}</span>
        </button>
      </div>
    </div>
  </form>
</template>

<script setup lang="ts">
import { useId } from 'vue'
import { NIVEAUX } from '../data/classes.ts'
import { LANGUE_SOURCE, estLangue, nomDeLangue } from '../langues/registre.ts'
import { useLangue } from '../langues/useLangue.ts'
import { texteDe } from '../telechargements/recherche.ts'
import { USAGES } from '../telechargements/types.ts'
import type { PageFiches } from '../telechargements/useFichesPage.ts'
import FichesPretesLangues from './FichesPretesLangues.vue'

const { page } = defineProps<{ page: PageFiches }>()
const { t, langueAffichee } = useLangue()
const idRecherche = useId()
const idDomaine = useId()
/** la valeur d'un champ (texte ou liste) qui vient de changer */
const valeurDe = (e: Event): string => (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement ? e.target.value : '')
/** les langues d'un choix : celle du code, ou le français et la langue régionale pour « bilingue » */
const languesDuChoix = (valeur: string): string[] => (estLangue(valeur) ? [valeur] : [LANGUE_SOURCE, page.contexte.regionale].filter((l): l is string => !!l))
/** « FR », « BR », « FR + BR » (comme la maquette) : visibles ; le nom complet est lu par les lecteurs d'écran */
const codeDuChoix = (valeur: string): string => languesDuChoix(valeur).map(l => l.toUpperCase()).join(' + ')
/** « Brezhoneg » pour une langue (dans la langue de l'interface), « Bilingue » pour les fiches à deux langues */
const nomDuChoix = (valeur: string): string => (estLangue(valeur) ? nomDeLangue(valeur, langueAffichee.value) : t('fichesPretes.bilingue'))
</script>

<style scoped>
.filtres { background: white; border-radius: var(--radius); box-shadow: var(--shadow); padding: 1rem 1.1rem; display: flex; flex-direction: column; gap: .7rem; }
.ligne, .groupe { display: flex; flex-wrap: wrap; align-items: center; gap: .4rem .5rem; }
.groupe { margin-left: .6rem; }
.lab { font-size: .8rem; font-weight: 800; text-transform: uppercase; letter-spacing: .04em; color: var(--texte-doux); min-width: 5.2rem; }
.recherche { flex: 1 1 14rem; min-height: 44px; padding: .5rem 1rem; border: 2px solid var(--gris-brd); border-radius: var(--radius); background: white; }
.recherche:focus { border-color: var(--bleu-fort); }
.menu { min-height: 44px; padding: .3rem .6rem; border: 2px solid var(--gris-brd); border-radius: 10px; background: white; max-width: 100%; }
.puce { min-height: 44px; padding: .3rem 1rem; border: 2px solid var(--gris-brd); background: white; border-radius: 22px; font-weight: 700; font-size: .9rem; color: var(--texte); display: inline-flex; align-items: center; gap: .3rem; }
.puce:hover:not(:disabled) { border-color: var(--bleu); }
.puce[aria-pressed="true"] { background: var(--bleu-fort); border-color: var(--bleu-fort); color: white; }
.puce:disabled { opacity: .6; cursor: default; }
@media (max-width: 520px) { .lab { min-width: 100%; } .groupe { margin-left: 0; } }
</style>
