<template>
  <!--
    Remettre des étiquettes dans l'ordre, par clics successifs (Grammaire : mots d'une phrase ; Vocabulaire : mots à
    ranger). Les étiquettes se placent dans la zone au clic, et se retirent d'un clic ; `valider` donne les indices
    placés, dans l'ordre. Réinitialisé à chaque nouvelle liste d'étiquettes.
      <EtiquettesOrdre :etiquettes="q.etiquettes" fin="." :repondu="repondu" :etat="etat" :vide="t('cliqueEtiquettes')"
        :effacer="t('effacerOrdre')" :valider="t('valider')" @valider="ordre => …" />
  -->
  <div class="ordre-zone" :class="etat">
    <template v-for="(e, k) in placees" :key="'p' + k">
      <span v-if="separateur && k > 0" class="ordre-sep">{{ separateur }}</span>
      <button class="etiquette placee" :disabled="repondu" @click="retirer(k)">{{ etiquettes[e] }}</button>
    </template>
    <span v-if="fin" class="ordre-point">{{ fin }}</span>
    <span v-if="placees.length === 0" class="ordre-vide">{{ vide }}</span>
  </div>
  <div class="etiquettes-reserve">
    <button v-for="(e, k) in etiquettes" :key="'r' + k" class="etiquette" :class="{ cachee: placees.includes(k) }"
      :disabled="repondu || placees.includes(k)" @click="placer(k)">{{ e }}</button>
  </div>
  <div v-if="!repondu" class="actions">
    <button class="btn btn-ghost" :disabled="placees.length === 0" @click="placees = []">{{ effacer }}</button>
    <button class="btn btn-primary" :disabled="placees.length < etiquettes.length" @click="$emit('valider', [...placees])">{{ valider }}</button>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  etiquettes: { type: Array, required: true },
  // signe affiché après les étiquettes placées (le point de la phrase)
  fin: { type: String, default: '' },
  // entre deux étiquettes placées (« → »)
  separateur: { type: String, default: '' },
  repondu: { type: Boolean, default: false },
  // '' | 'ok' | 'erreur' (useJeu : etat)
  etat: { type: String, default: '' },
  vide: { type: String, default: '' },
  effacer: { type: String, default: '' },
  valider: { type: String, default: '' },
})
defineEmits(['valider'])

const placees = ref([])
watch(() => props.etiquettes, () => { placees.value = [] })
const placer = k => { if (!props.repondu && !placees.value.includes(k)) placees.value = [...placees.value, k] }
const retirer = pos => { if (!props.repondu) placees.value = placees.value.filter((_, j) => j !== pos) }
</script>

<style scoped>
.ordre-zone {
  min-height: 3.2rem; border: 2px dashed var(--gris-brd); border-radius: 10px;
  padding: .5rem; display: flex; flex-wrap: wrap; gap: .4rem; align-items: center; margin-bottom: 1rem;
}
.ordre-zone.ok     { border-color: #22c55e; background: #f0fdf4; }
.ordre-zone.erreur { border-color: var(--rouge); background: #fff5f5; }
.ordre-vide { color: #aaa; font-size: .95rem; }
.ordre-sep { color: #aaa; font-weight: 700; }
.ordre-point { font-size: 1.3rem; font-weight: 700; }
.etiquettes-reserve { display: flex; flex-wrap: wrap; gap: .5rem; justify-content: center; }
.etiquette {
  font-size: 1.2rem; font-family: inherit; font-weight: 600;
  padding: .35rem .8rem; border-radius: 8px; border: 2px solid #f39c12;
  background: #fff8ec; cursor: pointer; color: var(--texte);
}
.etiquette.placee { border-color: var(--bleu); background: #eef5ff; }
.etiquette.cachee { visibility: hidden; }
.etiquette:disabled { cursor: default; }
.actions { display: flex; gap: .5rem; justify-content: center; margin-top: 1rem; }
</style>
