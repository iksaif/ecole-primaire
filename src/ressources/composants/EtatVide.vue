<template>
  <section class="vide" :aria-labelledby="id">
    <p class="emoji" aria-hidden="true">{{ emoji }}</p>
    <h2 :id="id">{{ titre }}</h2>
    <p v-if="texte" class="texte">{{ texte }}</p>
    <div class="actions"><slot /></div>
  </section>
</template>

<script setup lang="ts">
// État vide expliqué : jamais une page cassée quand une liste n'a (encore) rien à montrer. Les textes sont déjà traduits ; le
// contenu par défaut (slot) accueille un lien ou un bouton.
import { useId } from 'vue'

defineProps<{ emoji: string, titre: string, texte?: string }>()
const id = useId()
</script>

<style scoped>
.vide { text-align: center; background: white; border: 2px dashed var(--gris-brd); border-radius: var(--radius); padding: 1.5rem 1rem; margin: 1rem 0; }
.emoji { font-size: 2rem; }
h2 { font-size: 1.1rem; margin: .3rem 0; }
.texte { color: var(--texte-doux); max-width: 38rem; margin: 0 auto; }
.actions:not(:empty) { margin-top: .8rem; }
</style>
