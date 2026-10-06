<template>
  <section class="monde" aria-labelledby="quiz-titre">
    <p class="intro">{{ t('monde.intro') }}</p>
    <div class="quiz">
      <h2 id="quiz-titre"><span aria-hidden="true">❓</span> {{ t('monde.quizTitre') }}</h2>
      <p class="badge">{{ t('monde.quizBadge') }}</p>
      <p class="absent">{{ t('monde.quizAbsent') }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
// Ce que Le Monde ajoute à la page de matière : le petit quiz de culture générale (hors programme). Le catalogue range les
// ressources par domaine du programme : le quiz n'en a pas et n'y est pas (src/ressources/catalogue.ts), donc l'état honnête.
import { useLangue } from '../langues/useLangue.ts'

const { t } = useLangue()
</script>

<style scoped>
.intro { color: var(--texte-doux); margin-bottom: 1rem; }
.quiz { background: white; border-radius: var(--radius); box-shadow: var(--shadow); border-top: 4px solid var(--violet); padding: 1rem; margin-bottom: 1.25rem; }
h2 { font-size: 1.1rem; }
.badge { display: inline-block; font-size: .75rem; font-weight: 700; background: #eceff1; color: #455a64; border-radius: 999px; padding: .1rem .6rem; margin: .3rem 0; }
.absent { color: var(--texte-doux); }
</style>
