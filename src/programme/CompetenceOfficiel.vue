<template>
  <section class="officiel" aria-labelledby="h-officiel">
    <h2 id="h-officiel"><span aria-hidden="true"><Icone nom="programme" /></span> {{ t('competence.officiel.titre') }}</h2>
    <p class="texte" :lang="LANGUE_SOURCE"><strong>{{ SOURCES[reference.source].titre }}</strong></p>
    <p>
      <a :href="reference.url" target="_blank" rel="noopener noreferrer">{{ etiquette }}<span class="sr-only"> ({{ t('competence.officiel.ouvre') }})</span></a>
      <span aria-hidden="true"> ↗</span>
      <RouterLink v-if="lecture" class="lire" :to="lecture">{{ t('competence.lecteur.lire') }}</RouterLink>
    </p>
    <blockquote :lang="LANGUE_SOURCE"><span class="sr-only">{{ t('competence.officiel.extrait') }} : </span>« {{ reference.extrait }} »</blockquote>
    <p v-if="interpretation" class="interpretation" :lang="LANGUE_SOURCE"><strong>{{ t('competence.interpretation') }} :</strong> {{ interpretation }}</p>
  </section>
</template>

<script setup lang="ts">
import Icone from '../images/Icone.vue'
// Le texte officiel d'une compétence : son nom, le lien vers le PDF à la bonne page (page DU PDF) et l'extrait cité par
// src/data/programme.ts ; ce qui est une interprétation de ce texte est dit à part.
import { computed } from 'vue'
import { SOURCES } from '../data/programme.ts'
import { LANGUE_SOURCE } from '../langues/registre.ts'
import { useLangue } from '../langues/useLangue.ts'
import { etiquetteDeReference } from './references.ts'
import type { Reference } from './references.ts'

const props = defineProps<{ reference: Reference, interpretation: string | null, lecture?: string }>()
const { t, langueAffichee } = useLangue()
const etiquette = computed(() => etiquetteDeReference(langueAffichee.value, props.reference))
</script>

<style scoped>
.officiel { background: #fff; border-radius: var(--radius); box-shadow: var(--shadow); padding: 1rem 1.1rem; margin-bottom: 1.2rem; display: grid; gap: .5rem; }
h2 { font-size: 1.05rem; }
.lire { margin-left: 1rem; font-weight: 700; }
blockquote { border-left: 4px solid var(--bleu); padding: .2rem .8rem; color: #444; font-size: .92rem; }
.interpretation { background: #fff8e6; border-left: 4px solid var(--orange); border-radius: 6px; padding: .5rem .7rem; font-size: .9rem; }
</style>
