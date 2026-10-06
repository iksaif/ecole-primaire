<template>
  <!-- indicateur discret : l'élément natif <details> s'ouvre au clavier et s'annonce sans aria supplémentaire -->
  <details class="lecture">
    <summary :title="t('programme.interpretation.resume')"><span aria-hidden="true">{{ EMOJI.interpretation }}</span><span class="sr-only">{{ t('programme.interpretation.resume') }}</span></summary>
    <p :lang="LANGUE_SOURCE"><strong>{{ t('programme.interpretation.titre') }} :</strong> {{ texte }}</p>
  </details>
</template>

<script setup lang="ts">
// Une compétence dont la lecture du texte est une interprétation (ex. Le monde : textes applicables en 2027) le dit ici.
import { LANGUE_SOURCE } from '../langues/registre.ts'
import { useLangue } from '../langues/useLangue.ts'
import { EMOJI } from './emojis.ts'

defineProps<{ texte: string }>()
const { t } = useLangue()
</script>

<style scoped>
.lecture { display: inline-block; vertical-align: middle; margin-left: .3rem; font-weight: 400; text-align: left; }
.lecture summary { cursor: pointer; list-style: none; display: inline-flex; align-items: center; justify-content: center; min-width: 1.6rem; min-height: 1.6rem; border-radius: 50%; background: #eef5fd; color: var(--bleu-fort); font-weight: 700; }
.lecture summary::-webkit-details-marker { display: none; }
.lecture p { margin-top: .3rem; padding: .5rem .6rem; background: #fff8e6; border-left: 4px solid var(--orange); border-radius: 6px; font-size: .82rem; color: var(--texte); max-width: 26rem; }
</style>
