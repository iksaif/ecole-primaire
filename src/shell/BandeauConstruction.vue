<template>
  <!-- une ligne discrète sur les pages propres à l'enseignant : le mode est une idée en construction, pas encore validée ni relue -->
  <p v-if="visible" class="construction" role="note" data-construction>
    <span aria-hidden="true">🚧</span>
    <span>{{ t('shell.enseignant.enConstruction') }} <a :href="lienAvis">{{ t('shell.enseignant.donnerAvis') }}</a></span>
  </p>
</template>

<script setup lang="ts">
// Rappel affiché sur les pages de l'enseignant (Programme, compétence, accueil avec « Copier le lien pour les familles ») tant que le mode
// enseignant est actif ET que c'est le profil choisi : ni pour un parent qui consulte le programme, ni sur un site où le mode est caché.
import { computed } from 'vue'
import { useContexte } from '../contexte/useContexte.ts'
import { modeEnseignantActif } from '../contexte/enseignant.ts'
import { useLangue } from '../langues/useLangue.ts'
import { SITE } from '../sites.ts'

const { t } = useLangue()
const { contexte } = useContexte()
const visible = computed(() => modeEnseignantActif.value && contexte.value.profil === 'enseignant')
const lienAvis = computed(() => `mailto:${SITE.contact}?subject=${encodeURIComponent(t('shell.enseignant.avisSujet'))}`)
</script>

<style scoped>
.construction { display: flex; gap: .5rem; align-items: baseline; margin: 0 0 1rem; padding: .5rem .8rem; border-left: 4px solid #e0a800; background: #fff8e1; color: #4a3600; font-size: .9rem; border-radius: 0 8px 8px 0; }
.construction a { color: #4a3600; font-weight: 700; white-space: nowrap; }
@media print { .construction { display: none; } }
</style>
