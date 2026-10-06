<template>
  <div class="barre" role="group" :aria-label="t('programme.classes.legende')">
    <span class="legende" aria-hidden="true">{{ EMOJI.classe }} {{ t('programme.classes.legende') }}</span>
    <button v-for="c in NIVEAUX" :key="c" type="button" class="puce" :aria-pressed="contexte.classes.includes(c)" :disabled="verrouillee" @click="choisir(c)">{{ c.toUpperCase() }}</button>
    <span v-if="verrouillee" class="note">{{ t('programme.classes.verrouillee') }}</span>
  </div>
</template>

<script setup lang="ts">
// Les classes du contexte : une seule pour un parent ou un enfant, plusieurs (union) pour un enseignant. Tout passe par `useContexte`.
import { NIVEAUX } from '../data/classes.ts'
import type { Classe } from '../data/classes.ts'
import { useContexte } from '../contexte/useContexte.ts'
import { useLangue } from '../langues/useLangue.ts'
import { EMOJI } from './emojis.ts'

const { t } = useLangue()
const { contexte, verrouillee, plusieursClasses, choisirClasses, ajouterClasse, retirerClasse } = useContexte()

const choisir = (c: Classe): Promise<boolean> => {
  if (!plusieursClasses.value) return choisirClasses([c])
  return contexte.value.classes.includes(c) ? retirerClasse(c) : ajouterClasse(c)
}
</script>

<style scoped>
.barre { display: flex; flex-wrap: wrap; align-items: center; gap: .4rem; }
.legende { font-weight: 700; margin-right: .2rem; }
.puce { min-width: 2.75rem; min-height: 2.75rem; padding: .3rem .7rem; border-radius: 999px; border: 2px solid var(--gris-brd); background: #fff; font-weight: 700; cursor: pointer; color: var(--texte); }
.puce:hover:not(:disabled) { border-color: var(--bleu); color: var(--bleu-fort); }
.puce[aria-pressed='true'] { background: var(--bleu-fort); border-color: var(--bleu-fort); color: #fff; }
.puce:disabled { cursor: not-allowed; opacity: .75; }
.note { font-size: .85rem; color: var(--texte-doux); }
</style>
