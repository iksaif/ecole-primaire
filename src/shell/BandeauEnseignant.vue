<template>
  <!-- la confirmation de l'adresse spéciale ?enseignant=oui|non : le mode enseignant est une idée en construction, pas encore validée -->
  <div v-if="message" class="bandeau" :class="message" role="status" data-bandeau-enseignant>
    <div class="texte">
      <strong>{{ t(message === 'active' ? 'shell.enseignant.activeTitre' : 'shell.enseignant.desactiveTitre') }}</strong>
      <span>{{ t(message === 'active' ? 'shell.enseignant.activeTexte' : 'shell.enseignant.desactiveTexte') }}</span>
    </div>
    <div class="actions">
      <button v-if="message === 'active'" type="button" class="btn btn-ghost" @click="desactiver">{{ t('shell.enseignant.desactiver') }}</button>
      <button type="button" class="btn btn-primary" @click="fermer">{{ t('shell.enseignant.compris') }}</button>
    </div>
  </div>
</template>

<script setup lang="ts">
// Le bandeau qui suit `?enseignant=oui` ou `?enseignant=non` (src/contexte/enseignant.ts) : dit ce qui vient de changer, et que le mode enseignant
// est une idée en construction. Il reste jusqu'à ce qu'on le ferme (il ne revient pas au rechargement : l'état est en mémoire seulement).
import { changerModeEnseignant, messageEnseignant } from '../contexte/enseignant.ts'
import { useLangue } from '../langues/useLangue.ts'
import { computed } from 'vue'

const { t } = useLangue()
const message = computed(() => messageEnseignant.value)
const fermer = (): void => { messageEnseignant.value = null }
function desactiver(): void {
  changerModeEnseignant(false)
  messageEnseignant.value = 'desactive'
}
</script>

<style scoped>
.bandeau { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: .75rem 1.25rem; padding: .7rem 1.25rem; font-size: .95rem; }
.bandeau.active { background: #fff4d6; border-bottom: 3px solid #e0a800; color: #4a3600; }
.bandeau.desactive { background: var(--gris-bg); border-bottom: 3px solid var(--gris-brd); }
.texte { display: flex; flex-direction: column; gap: .15rem; max-width: 60rem; }
.actions { display: flex; flex-wrap: wrap; gap: .5rem; }
@media print { .bandeau { display: none; } }
</style>
