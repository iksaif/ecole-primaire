<template>
  <nav v-if="groupes.length > 1" class="saut" :aria-label="t('matiere.domaines')">
    <button v-for="g in groupes" :key="g.domaine" type="button" class="pastille" @click="aller(g.domaine)">
      <span aria-hidden="true">{{ EMOJI_DOMAINE[g.domaine] }}</span> {{ nomDomaine(g.domaine, langueAffichee) }}
    </button>
  </nav>
</template>

<script setup lang="ts">
// Pastilles de saut vers les domaines de la page (seulement s'il y en a plusieurs d'affichés) : ouvre le domaine, y fait défiler
// la page et y place le focus (sans animation si le lecteur demande moins de mouvement).
import { nextTick } from 'vue'
import { useLangue } from '../langues/useLangue.ts'
import { EMOJI_DOMAINE } from '../ressources/emojis.ts'
import type { GroupeDomaine } from '../ressources/filtres.ts'
import type { DomaineId } from '../ressources/types.ts'
import { nomDomaine } from '../ressources/composants/presentation.ts'
import { usePlis } from '../ressources/composants/usePlis.ts'

defineProps<{ groupes: readonly GroupeDomaine[] }>()
const { t, langueAffichee } = useLangue()
const plis = usePlis()

async function aller(domaine: DomaineId): Promise<void> {
  plis.definir(domaine, true)
  await nextTick()
  const bloc = document.getElementById(`domaine-${domaine}`)
  if (!bloc) return
  const reduit = matchMedia('(prefers-reduced-motion: reduce)').matches
  bloc.scrollIntoView({ behavior: reduit ? 'auto' : 'smooth', block: 'start' })
  bloc.querySelector<HTMLElement>('summary')?.focus({ preventScroll: true })
}
</script>

<style scoped>
.saut { display: flex; flex-wrap: wrap; gap: .4rem; margin-bottom: 1rem; }
.pastille { border: 2px solid var(--gris-brd); background: white; border-radius: 999px; min-height: 2.75rem; padding: .3rem .9rem; font: inherit; font-weight: 700; font-size: .9rem; color: var(--texte); cursor: pointer; }
.pastille:hover { border-color: var(--bleu-fort); }
</style>
