<template>
  <article class="carte" :data-ressource="ressource.id">
    <span class="icone" aria-hidden="true">{{ ressource.emoji }}</span>
    <component :is="`h${niveauTitre}`" class="titre">
      <RouterLink :to="ressource.route" class="lien">{{ titre }}</RouterLink>
    </component>
    <p v-if="description" class="description">{{ description }}</p>
    <PastillesClasses :classes="ressource.classes" :choisies="classesChoisies" />
    <BadgesRessource :badges="ressource.badges" />
  </article>
</template>

<script setup lang="ts">
// Une ressource en grande carte : icône, titre (le lien, étiré sur toute la carte), description, classes en pastilles (celles des
// classes choisies en évidence), badges en ligne / imprimable. `niveauTitre` : niveau du titre de la carte dans la page.
import { computed } from 'vue'
import { useLangue } from '../../langues/useLangue.ts'
import { texteDe } from '../textes.ts'
import type { Classe, RessourceDeContenu } from '../types.ts'
import BadgesRessource from './BadgesRessource.vue'
import PastillesClasses from './PastillesClasses.vue'

const props = withDefaults(defineProps<{
  ressource: RessourceDeContenu
  classesChoisies: readonly Classe[]
  niveauTitre?: 2 | 3 | 4 | 5
}>(), { niveauTitre: 4 })
const { langueAffichee } = useLangue()
const titre = computed(() => texteDe(props.ressource.titre, langueAffichee.value))
const description = computed(() => (props.ressource.description ? texteDe(props.ressource.description, langueAffichee.value) : null))
</script>

<style scoped>
.carte {
  position: relative; display: flex; flex-direction: column; align-items: center; text-align: center; justify-content: flex-start; gap: .4rem;
  background: white; border-radius: var(--radius); box-shadow: var(--shadow); border-top: 4px solid var(--bleu); padding: .9rem .8rem; height: 100%;
  transition: transform .15s;
}
.carte:hover { transform: translateY(-2px); }
.carte:focus-within { outline: 3px solid var(--bleu-fort); outline-offset: 2px; }
.icone { font-size: 2.2rem; line-height: 1; }
.titre { font-size: 1rem; font-weight: 800; line-height: 1.25; }
.lien { color: var(--texte); text-decoration: none; }
.lien:focus-visible { outline: none; }
.lien::after { content: ''; position: absolute; inset: 0; border-radius: var(--radius); }
.description { font-size: .85rem; color: var(--texte-doux); line-height: 1.3; }
.carte :deep(.pastilles), .carte :deep(.badges) { justify-content: center; }
.carte :deep(.badges) { margin-top: auto; }
</style>
