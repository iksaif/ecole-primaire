<template>
  <div role="group" :aria-label="t('shell.langue.titre')">
    <button v-for="o in options" :key="o.id" type="button" class="option" :aria-pressed="o.actif" @click="choisir(o).then(() => emit('choisi'))">
      <span class="icone" aria-hidden="true"><Drapeau v-for="d in o.drapeaux" :key="d" :langue="d" /></span>
      <span><strong>{{ o.titre }}</strong><small>{{ o.description }}</small></span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { useLangue } from '../langues/useLangue.ts'
import Drapeau from './Drapeau.vue'
import { useModesLangue } from './useModesLangue.ts'

const emit = defineEmits<{ choisi: [] }>()
const { t } = useLangue()
const { options, choisir } = useModesLangue()
</script>
