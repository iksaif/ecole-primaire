<template>
  <div class="container">
    <h1 class="section-heading">🖨️ Fiches à imprimer</h1>
    <p class="intro">Fiches et affiches prêtes à imprimer, avec aperçu. Tout fonctionne sans connexion.</p>
    <GrilleActivites matiere="imprimer" />

    <a :href="telechargements" class="bandeau-pdf">
      📥 <span><strong>Fiches toutes prêtes en PDF</strong> — lettres une à une, alphabet, jours, mois, nombres en breton… à télécharger directement.</span>
    </a>

    <template v-if="avecFiche.length">
    <h2 class="section-heading" style="margin-top:2.5rem;">📄 Fiches d'exercices</h2>
    <p class="intro">Ces exercices ont aussi un bouton « 🖨️ Imprimer une fiche » (avec de nouvelles questions à chaque fois) :</p>
    <div class="card-grid">
      <RouterLink v-for="a in avecFiche" :key="a.to" :to="a.to" class="card" :class="a.matiere">
        <span class="card-icon">{{ a.icon }}</span>
        <span class="card-title">{{ a.titre }}</span>
        <span class="card-tag">{{ etiquetteNiveaux(a.niveaux) }}</span>
      </RouterLink>
    </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import GrilleActivites from '../../components/GrilleActivites.vue'
import { ACTIVITES, etiquetteNiveaux } from '../../data/activites'
import { useClasse } from '../../composables/useClasse'

const classe = useClasse()
// pages statiques générées au build (scripts/telechargements.mjs)
const telechargements = `${import.meta.env.BASE_URL}telechargements/`
const avecFiche = computed(() => ACTIVITES.filter(a => a.fiche && (!classe.value || a.niveaux.includes(classe.value))))
</script>

<style scoped>
.intro { color: #666; margin: -.5rem 0 1.25rem; }
.bandeau-pdf {
  display: flex; gap: .75rem; align-items: center; margin-top: 1.5rem; padding: 1rem 1.25rem;
  background: #fff8ef; border: 2px dashed #f5c27a; border-radius: var(--radius); color: var(--texte); text-decoration: none; font-size: 1.05rem;
}
.bandeau-pdf:hover { background: #fff1dc; }
</style>
