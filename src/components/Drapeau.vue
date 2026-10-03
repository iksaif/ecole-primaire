<template>
  <!-- Drapeaux en SVG : le Gwenn-ha-du n'existe pas en emoji -->
  <svg v-if="langue === 'br'" class="drapeau" viewBox="0 0 18 12" role="img" aria-label="Drapeau breton">
    <rect width="18" height="12" fill="#fff" />
    <!-- 9 bandes de 12/9 de haut : noires aux rangs 0, 2, 4, 6, 8 -->
    <rect v-for="k in 5" :key="k" x="0" :y="(k - 1) * 2 * 12 / 9" width="18" :height="12 / 9" fill="#000" />
    <rect width="8" :height="5 * 12 / 9" fill="#fff" />
    <g fill="#000">
      <path v-for="(p, i) in hermines" :key="i" :d="`M${p[0]} ${p[1]}l.45 1.3h-.9z`" />
    </g>
  </svg>
  <svg v-else class="drapeau" viewBox="0 0 3 2" role="img" aria-label="Drapeau français">
    <rect width="1" height="2" fill="#0055a4" />
    <rect x="1" width="1" height="2" fill="#fff" />
    <rect x="2" width="1" height="2" fill="#ef4135" />
  </svg>
</template>

<script setup>
defineProps({ langue: { type: String, default: 'fr' } })
// Moucheture d'hermine simplifiée (3 rangées) dans le canton
const hermines = [[1.3, .9], [3.9, .9], [6.5, .9], [2.6, 3], [5.2, 3], [1.3, 5], [3.9, 5], [6.5, 5]]
</script>

<style scoped>
.drapeau { width: 1.5em; height: 1em; border-radius: 2px; box-shadow: 0 0 0 1px rgba(0,0,0,.15); vertical-align: middle; }
</style>
