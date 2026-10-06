<template>
  <!-- « Personnaliser » (l'exercice ou l'affiche, avec les réglages de cette fiche) et « Faire en ligne » (le jeu lié, s'il existe). -->
  <div v-if="feuille.entree && (feuille.entree.personnaliser || feuille.jeu)" class="boite">
    <div class="liens">
      <RouterLink v-if="feuille.entree.personnaliser" class="btn btn-ghost" :to="{ path: feuille.entree.personnaliser.route, query: feuille.entree.personnaliser.requete }">{{ t('feuille.personnaliser') }}</RouterLink>
      <RouterLink v-if="feuille.jeu" class="btn btn-ghost" :to="feuille.jeu.route">{{ t('feuille.enLigne') }}</RouterLink>
    </div>
    <p v-if="feuille.entree.personnaliser" class="aide">{{ t('feuille.personnaliserAide') }}</p>
  </div>
</template>

<script setup lang="ts">
import { useLangue } from '../langues/useLangue.ts'
import type { Feuille } from '../telechargements/useFeuille.ts'

defineProps<{ feuille: Feuille }>()
const { t } = useLangue()
</script>

<style scoped>
.boite { background: white; border-radius: var(--radius); box-shadow: var(--shadow); padding: 1rem 1.1rem; }
.liens { display: flex; flex-wrap: wrap; gap: .6rem; }
.liens .btn { text-decoration: none; min-height: 48px; }
.aide { font-size: .85rem; color: var(--texte-doux); margin-top: .6rem; }
</style>
