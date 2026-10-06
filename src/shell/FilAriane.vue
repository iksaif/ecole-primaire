<template>
  <!-- Fil d'Ariane : des liens, puis la page courante (sans lien, aria-current). Un maillon sans `vers` est du texte ;
       `emoji` est décoratif (comme la maquette : 🏠 Accueil › 🔢 Maths › 📄 Fiches toutes prêtes). -->
  <nav class="fil" :aria-label="etiquette">
    <ol>
      <li v-for="(m, i) in maillons" :key="i">
        <RouterLink v-if="m.vers" :to="m.vers"><span v-if="m.emoji" class="emoji" aria-hidden="true">{{ m.emoji }}</span>{{ m.texte }}</RouterLink>
        <span v-else class="courant" :aria-current="i === maillons.length - 1 ? 'page' : undefined" :lang="m.langue"><span v-if="m.emoji" class="emoji" aria-hidden="true">{{ m.emoji }}</span>{{ m.texte }}</span>
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
export interface Maillon { texte: string, vers?: string, langue?: string, emoji?: string }
defineProps<{ maillons: readonly Maillon[], etiquette: string }>()
</script>

<style scoped>
.fil { font-size: .9rem; margin-bottom: 1rem; }
ol { list-style: none; display: flex; flex-wrap: wrap; align-items: center; gap: .25rem .15rem; }
li { display: inline-flex; align-items: center; }
li + li::before { content: '›'; margin: 0 .3rem; color: var(--texte-doux); font-weight: 800; }
a, .courant { display: inline-flex; align-items: center; gap: .3rem; padding: .3rem .65rem; border-radius: 999px; min-height: 32px; }
a { color: var(--bleu-fort); text-decoration: none; font-weight: 700; background: white; box-shadow: var(--shadow); }
a:hover { text-decoration: underline; }
.courant { color: var(--texte); font-weight: 800; }
.emoji { font-size: 1rem; line-height: 1; }
</style>
