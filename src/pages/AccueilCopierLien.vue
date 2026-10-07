<template>
  <div class="copier">
    <button type="button" class="gros-bouton" @click="copier"><span aria-hidden="true">{{ EMOJI_ACCUEIL.copier }}</span> {{ t('accueil.copier') }}</button>
    <p class="aide">{{ t('accueil.copierAide', { classes: texteClasses(contexte.classes) }) }}</p>
    <p class="etat" role="status" aria-live="polite">{{ message }}<template v-if="lien"> <code>{{ lien }}</code></template></p>
  </div>
</template>

<script setup lang="ts">
// « Copier le lien pour les familles » (enseignant) : l'adresse de la page avec la classe et le mode de langue, copiée dans le
// presse-papiers ; le résultat est annoncé (`aria-live`). Si le navigateur refuse la copie, le lien est écrit pour qu'on le copie à la main.
import { ref } from 'vue'
import { useContexte } from '../contexte/useContexte.ts'
import { useLangue } from '../langues/useLangue.ts'
import { texteClasses } from '../data/classes.ts'
import { EMOJI_ACCUEIL } from '../ressources/composants/presentation.ts'

const { t } = useLangue()
const { contexte, lienFamilles } = useContexte()
const message = ref('')
const lien = ref('')
async function copier(): Promise<void> {
  const adresse = lienFamilles()
  try {
    await navigator.clipboard.writeText(adresse)
    message.value = t('accueil.copie', { classes: texteClasses(contexte.value.classes) })
    lien.value = ''
  } catch {
    message.value = t('accueil.copieEchec')
    lien.value = adresse
  }
}
</script>

<style scoped>
.copier { text-align: center; margin: 1rem 0; }
.gros-bouton { background: var(--bleu-fort); color: white; border: none; border-radius: 8px; font: inherit; font-weight: 800; padding: .7rem 1.2rem; min-height: 2.75rem; cursor: pointer; }
.aide { color: var(--texte-doux); font-size: .9rem; margin-top: .4rem; }
.etat { min-height: 1.4em; font-weight: 700; color: var(--vert-texte); overflow-wrap: anywhere; }
code { font-weight: 400; color: var(--texte); }
</style>
