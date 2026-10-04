<template>
  <div class="container">
    <div class="hero">
      <h1>{{ t('bienvenue') }}</h1>
      <p>{{ t('accroche') }}</p>
      <p v-if="classe" class="hero-filtre">
        {{ t('activitesPour') }} <strong>{{ labelClasse }}</strong> —
        <button class="lien" @click="classe = ''">{{ t('toutesClasses') }}</button>
      </p>
    </div>

    <div v-for="m in matieresVisibles" :key="m.id" class="matiere-section" :class="{ 'imprimer-section': m.id === 'imprimer' }">
      <h2 class="section-heading">
        {{ langue === 'br' ? m.br : m.titre }}
        <RouterLink v-if="m.id === 'imprimer'" to="/imprimer" class="voir-tout">{{ t('voirTout') }}</RouterLink>
      </h2>
      <GrilleActivites :matiere="m.id" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import GrilleActivites from '../components/GrilleActivites.vue'
import { MATIERES, CLASSES, ACTIVITES } from '../data/activites'
import { useClasse } from '../composables/useClasse'
import { useI18n } from '../i18n'
import messagesFr from '../i18n/fr/views/HomeView.js'
import messagesBr from '../i18n/br/views/HomeView.js'

const { t, langue } = useI18n({ fr: messagesFr, br: messagesBr })

const classe = useClasse()
const matieresVisibles = computed(() => MATIERES.filter(m =>
  ACTIVITES.some(a => a.matiere === m.id && (!classe.value || a.niveaux.includes(classe.value)))))
const labelClasse = computed(() => CLASSES.find(c => c.id === classe.value)?.label)
</script>

<style scoped>
.hero {
  text-align: center;
  padding: 2.5rem 1rem 1.5rem;
}
.hero h1 {
  font-size: 2.4rem;
  font-weight: 900;
  color: var(--bleu);
  margin-bottom: .5rem;
}
.hero p {
  font-size: 1.1rem;
  color: #555;
  max-width: 540px;
  margin: 0 auto;
}
.hero-filtre { margin-top: .75rem !important; font-size: 1rem !important; }
.lien { background: none; border: none; color: var(--bleu); font: inherit; text-decoration: underline; cursor: pointer; }
.matiere-section { margin-bottom: 2.5rem; }
.imprimer-section {
  background: #fff8ef; border: 2px dashed #f5c27a; border-radius: var(--radius); padding: 1.25rem 1.25rem 1.5rem;
}
.voir-tout { margin-left: auto; font-size: .9rem; font-weight: 700; color: var(--orange); text-decoration: none; }
</style>
