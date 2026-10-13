<!--
  L'onglet « Ceintures » de la page d'un exercice qui a une piste (extension.ts) : le brevet papier d'une ceinture de cette piste. C'est un ASSEMBLAGE (brevet.ts) : un en-tête de ceinture,
  la fiche de l'exercice avec les réglages de la ceinture, le cadre du résultat, un corrigé. La classe est celle de l'exercice (lue dans ses réglages mémorisés, modifiable ici).
  `exercice` : l'identifiant de l'exercice du registre. Les couleurs, le seuil et le nombre de questions : réglages communs des ceintures (« Sur la fiche », page des réglages).
-->
<template>
  <section class="onglet-ceintures">
    <p class="intro">{{ t('ceintures.ongletIntro') }}</p>
    <CadreExercice v-if="module && piste" fiche-seule imbrique mode="imprimer" :fiche="fiche" :police="true" :extensions="['ceintures']" @regenerer="nouvelle">
      <div class="config-section" role="group" :aria-labelledby="`${id}-classe`" data-reglage="niveau">
        <div :id="`${id}-classe`" class="config-section-title">{{ t('fichesPretes.classe') }}</div>
        <div class="btn-group">
          <button v-for="n in classes" :key="n" type="button" class="level-btn" :class="{ active: niveau === n }" :aria-pressed="niveau === n" :data-valeur="n"
            @click="choix.niveau = n">{{ n.toUpperCase() }}</button>
        </div>
      </div>

      <!-- la ceinture : son numéro et sa couleur ; une ceinture qui n'existe pas dans cette classe est grisée -->
      <div class="config-section" role="group" :aria-labelledby="`${id}-ceinture`" data-reglage="ceinture">
        <div :id="`${id}-ceinture`" class="config-section-title">{{ t('ceintures.choixCeinture') }}</div>
        <div class="btn-group">
          <button v-for="k in nbCeintures" :key="k - 1" type="button" class="level-btn" :class="{ active: indice === k - 1 }" :aria-pressed="indice === k - 1" :data-valeur="k"
            :disabled="!disponible(k - 1)" @click="choix.ceinture = k">{{ k }} <PastilleCeinture :indice="k - 1" /></button>
        </div>
      </div>

      <!-- les options de la piste « tables » : ses propres tables, et jusqu'où multiplier -->
      <template v-if="piste.id === 'tables'">
        <div class="config-section" role="group" :aria-labelledby="`${id}-tables`" data-reglage="tablesPerso">
          <div :id="`${id}-tables`" class="config-section-title">{{ t('ceintures.tablesTitre') }}</div>
          <div class="btn-group">
            <button type="button" class="level-btn" :class="{ active: !choix.tablesPerso }" :aria-pressed="!choix.tablesPerso" data-valeur="false" @click="choix.tablesPerso = false">{{ t('ceintures.tablesCeinture') }}</button>
            <button type="button" class="level-btn" :class="{ active: choix.tablesPerso }" :aria-pressed="choix.tablesPerso" data-valeur="true" @click="choix.tablesPerso = true">{{ t('ceintures.tablesPerso') }}</button>
          </div>
          <div v-if="choix.tablesPerso" class="btn-group" data-reglage="tables">
            <button v-for="n in TABLES" :key="n" type="button" class="level-btn" :class="{ active: choix.tables.includes(n) }" :aria-pressed="choix.tables.includes(n)" :data-valeur="n"
              @click="basculerTable(n)">×{{ n }}<span v-if="n > 10"> ({{ t('communs.bonus') }})</span></button>
          </div>
        </div>
        <div class="config-section" role="group" :aria-labelledby="`${id}-jusqu`" data-reglage="jusqu">
          <div :id="`${id}-jusqu`" class="config-section-title">{{ t('ceintures.jusquTitre') }}</div>
          <div class="btn-group">
            <button v-for="n in [10, 12]" :key="n" type="button" class="level-btn" :class="{ active: choix.jusqu === n }" :aria-pressed="choix.jusqu === n" :data-valeur="n"
              @click="choix.jusqu = n">× {{ n }}<span v-if="n > 10"> ({{ t('communs.bonus') }})</span></button>
          </div>
        </div>
      </template>
    </CadreExercice>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, useId, watch } from 'vue'
import { useLangue } from '../langues/useLangue.ts'
import CadreExercice from '../noyau/CadreExercice.vue'
import { useGraine } from '../noyau/useGraine.ts'
import { usePoliceFiche } from '../noyau/polices.ts'
import { langueContenuDe } from '../noyau/reglages.ts'
import { cleReglages } from '../noyau/useReglages.ts'
import { contextesDeFiche } from '../extensions/contexte.ts'
import { charger, chargerReglages, sauvegarder } from '../utils/index.js'
import PastilleCeinture from './PastilleCeinture.vue'
import { brevetPapier } from './brevet.ts'
import { reglagesCeintures } from './extension.ts'
import { ceintureDisponible, pisteDeExercice } from './pistes.ts'
import { nbCeinturesDe } from './reglages.ts'
import type { Classe } from '../data/classes.ts'
import type { ModuleQuelconque } from '../exercices/index.ts'

const props = defineProps<{ exercice: string }>()
const id = useId()
const { t, langue } = useLangue()
const { graine, nouvelle } = useGraine()
const police = usePoliceFiche()
const TABLES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

const piste = computed(() => pisteDeExercice(props.exercice))
// le registre est un chunk à part (src/router/index.ts) : chargé à l'ouverture de l'onglet
const registre = ref<readonly ModuleQuelconque[]>([])
void import('../exercices/index.ts').then(({ REGISTRE }) => { registre.value = REGISTRE })
const module = computed(() => registre.value.find(m => m.definition.id === props.exercice) ?? null)
/** Les classes d'un exercice du registre. */
const classesDe = (exercice: string): Classe[] => Object.keys(registre.value.find(m => m.definition.id === exercice)?.definition.niveaux ?? {}) as Classe[]
// les classes proposées : celles de l'exercice de la page
const classes = computed(() => classesDe(props.exercice))

// ce qu'on a choisi, mémorisé sur l'appareil ; la classe est reprise de l'exercice à chaque ouverture de l'onglet (modifiable ici)
const choix = ref(chargerReglages('ceintures_brevet', { niveau: '' as string, ceinture: 1, tablesPerso: false, tables: [2, 5, 10] as number[], jusqu: 10 }))
watch(choix, v => sauvegarder('ceintures_brevet', v), { deep: true })
watch(module, m => {
  if (!m) return
  const deLExercice = charger<{ niveau?: unknown }>(cleReglages(m.definition))?.niveau
  const connus = Object.keys(m.definition.niveaux)
  choix.value.niveau = typeof deLExercice === 'string' && connus.includes(deLExercice) ? deLExercice : m.definition.niveauDefaut
}, { immediate: true })

const niveau = computed(() => (classes.value.includes(choix.value.niveau as Classe) ? choix.value.niveau as Classe : classes.value[0]))
// les ceintures montrées : celles de la piste, le nombre choisi dans les réglages communs et les couleurs de la palette (src/ceintures/reglages.ts)
const nbCeintures = computed(() => (piste.value ? nbCeinturesDe(reglagesCeintures(contextesDeFiche()), piste.value.ceintures.length) : 0))
const disponible = (k: number): boolean => !!piste.value && k < nbCeintures.value && ceintureDisponible(piste.value, k, niveau.value, classesDe)
// la ceinture choisie, ou la première qui existe dans cette classe
const indice = computed(() => {
  const voulue = Math.min(Math.max(choix.value.ceinture, 1), Math.max(nbCeintures.value, 1)) - 1
  if (disponible(voulue)) return voulue
  return Math.max(0, Array.from({ length: nbCeintures.value }, (_, k) => k).findIndex(k => disponible(k)))
})
function basculerTable(n: number): void {
  const liste = choix.value.tables
  const suivante = liste.includes(n) ? liste.filter(x => x !== n) : [...liste, n]
  if (suivante.length) choix.value.tables = suivante.sort((a, b) => a - b)   // au moins une table reste cochée
}

const fiche = computed(() => {
  const m = module.value, p = piste.value
  if (!m || !p) return ''
  const extensions = contextesDeFiche()
  const surcharges = p.id === 'tables' ? { ...(choix.value.tablesPerso ? { tables: choix.value.tables } : {}), jusqu: choix.value.jusqu } : {}
  return brevetPapier({
    modules: registre.value, piste: p, indice: indice.value, niveau: niveau.value, graine: graine.value, langue: langueContenuDe(m.definition, langue.value),
    ceintures: reglagesCeintures(extensions), extensions, reglages: surcharges, ...police.value,
  })
})
</script>

<style scoped>
.intro { color: var(--texte-doux); margin: 0 0 1rem; font-size: .95rem; }
.btn-group + .btn-group { margin-top: .4rem; }
.level-btn:disabled { opacity: .45; cursor: not-allowed; }
</style>
