<template>
  <!-- Quatre barres de hauteur croissante, `niveau` pleines (0 à 4) : le niveau de confiance d'une traduction, d'un coup d'œil. Décorative : le
       niveau est dit en toutes lettres à côté (pastille, réglage). -->
  <span class="jauge" :class="`n${niveau}`" aria-hidden="true"><i v-for="barre in 4" :key="barre" :class="{ pleine: barre <= niveau }" /></span>
</template>

<script setup lang="ts">
import type { NiveauConfiance } from '../../langues/confiance.ts'

defineProps<{ niveau: NiveauConfiance }>()
</script>

<style scoped>
.jauge { display: inline-flex; align-items: flex-end; gap: 2px; height: .9rem; flex: none; }
.jauge i { display: block; width: 4px; border-radius: 1px; background: rgba(0, 0, 0, .18); }
.jauge i:nth-child(1) { height: 25%; }
.jauge i:nth-child(2) { height: 50%; }
.jauge i:nth-child(3) { height: 75%; }
.jauge i:nth-child(4) { height: 100%; }
.n0 i.pleine { background: #c0392b; }
.n1 i.pleine { background: #e67e22; }
.n2 i.pleine { background: #d4a017; }
.n3 i.pleine, .n4 i.pleine { background: #2e8b57; }
</style>
