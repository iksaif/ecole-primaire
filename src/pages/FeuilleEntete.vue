<template>
  <!-- Titre de la fiche, classes, et « Même fiche : » les liens vers la même fiche dans les autres langues (les langues viennent
       des entrées de l'index : rien n'est écrit en dur). La langue de la page où l'on est n'est pas un lien (aria-current). -->
  <header v-if="feuille.entree" class="entete">
    <h1 :lang="langueDuTexte(feuille.entree.titre, langueAffichee)">{{ texteDe(feuille.entree.titre, langueAffichee) }}</h1>
    <div class="meta">
      <PastillesClasses :classes="feuille.entree.niveaux" :choisies="[]" />
      <span class="badge">{{ t('feuille.imprimable') }}</span>
      <span v-if="feuille.entree.exemple" class="badge exemple">{{ t('feuille.exemple') }}</span>
    </div>
    <p v-if="feuille.langues.length" class="langues">
      <strong>{{ t('feuille.memeFiche') }}</strong>
      <template v-for="(e, i) in feuille.langues" :key="e.slug">
        <template v-if="i > 0"> · </template>
        <span v-if="e.slug === feuille.entree.slug" class="courante" aria-current="true"><FichesPretesLangues :langues="e.langues" toujours /> {{ nom(e.langues) }}</span>
        <RouterLink v-else class="lg" :to="`/telechargements/${e.slug}`" :hreflang="e.langues.length === 1 ? e.langues[0] : undefined"><FichesPretesLangues :langues="e.langues" toujours /> {{ nom(e.langues) }}</RouterLink>
      </template>
    </p>
    <p class="description" :lang="langueDuTexte(feuille.entree.descriptionLongue, langueAffichee)">{{ texteDe(feuille.entree.descriptionLongue, langueAffichee) }}</p>
  </header>
</template>

<script setup lang="ts">
import { estLangue, nomDeLangue } from '../langues/registre.ts'
import { useLangue } from '../langues/useLangue.ts'
import PastillesClasses from '../ressources/composants/PastillesClasses.vue'
import { langueDuTexte, texteDe } from '../telechargements/recherche.ts'
import type { Feuille } from '../telechargements/useFeuille.ts'
import FichesPretesLangues from './FichesPretesLangues.vue'

defineProps<{ feuille: Feuille }>()
const { t, langueAffichee } = useLangue()
/** « Brezhoneg » pour une langue ; « bilingue » pour une fiche à plusieurs langues */
const nom = (langues: readonly string[]): string => (langues.length === 1 && estLangue(langues[0]) ? nomDeLangue(langues[0], langueAffichee.value) : t('feuille.bilingue'))
</script>

<style scoped>
.entete { display: flex; flex-direction: column; gap: .5rem; }
h1 { font-size: 1.9rem; font-weight: 900; line-height: 1.2; }
.meta { display: flex; flex-wrap: wrap; gap: .5rem; align-items: center; }
.badge { font-size: .78rem; background: var(--gris-bg); border: 1px solid var(--gris-brd); border-radius: 20px; padding: .1rem .6rem; }
.badge.exemple { background: var(--jaune); border-color: var(--jaune); }
.langues { display: flex; flex-wrap: wrap; gap: .3rem; align-items: center; }
.lg { color: var(--bleu-fort); display: inline-flex; gap: .3rem; align-items: center; min-height: 44px; }
.courante { font-weight: 800; border-bottom: 3px solid var(--bleu-fort); display: inline-flex; gap: .3rem; align-items: center; }
.description { color: var(--texte-doux); }
</style>
