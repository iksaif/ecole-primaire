<template>
  <div class="container reglages" data-page="reglages">
    <h1>{{ t('reglages.titre') }}</h1>
    <p class="intro">{{ t('reglages.intro') }}</p>

    <section v-if="langues.length > 1" class="bloc">
      <h2>{{ t('reglages.interface.titre') }}</h2>
      <p class="aide">{{ t('reglages.interface.aide') }}</p>
      <div class="choix">
        <button v-for="l in langues" :key="l.code" class="level-btn" :class="{ active: langue === l.code }" :aria-pressed="langue === l.code" @click="langue = l.code">
          <Drapeau :langue="l.code" /> {{ majuscule(l.nomLocal) }}
        </button>
      </div>
    </section>

    <section v-if="regionale.proposees.length" class="bloc">
      <h2>🏴 {{ t('reglages.regionale.titre') }}</h2>
      <p class="aide">{{ t('reglages.regionale.aide') }}</p>
      <div class="choix">
        <button class="level-btn" :class="{ active: !regionale.reglage.value }" :aria-pressed="!regionale.reglage.value" @click="regionale.reglage.value = ''">{{ t('reglages.regionale.aucune') }}</button>
        <button v-for="l in regionale.proposees" :key="l.code" class="level-btn" :class="{ active: regionale.reglage.value === l.code }"
          :aria-pressed="regionale.reglage.value === l.code" @click="regionale.reglage.value = l.code">
          <Drapeau :langue="l.code" /> {{ majuscule(l.nomLocal) }} ({{ l.nom[langue] }})
        </button>
      </div>
      <p v-if="!regionale.reglage.value && regionale.code.value" class="aide">{{ t('reglages.regionale.imposee') }}</p>
    </section>

    <section class="bloc">
      <h2>🎒 {{ t('reglages.classe.titre') }}</h2>
      <p class="aide">{{ t('reglages.classe.aide') }}</p>
      <div class="choix">
        <button v-for="c in CLASSES" :key="c.id" class="level-btn" :class="{ active: classe === c.id }" :aria-pressed="classe === c.id" @click="classe = classe === c.id ? '' : c.id">{{ c.label }}</button>
        <button class="level-btn" :class="{ active: !classe }" :aria-pressed="!classe" @click="classe = ''">{{ t('nav.toutes') }}</button>
      </div>
    </section>

    <section class="bloc">
      <h2>✏️ {{ t('reglages.police.titre') }}</h2>
      <p class="aide">{{ t('reglages.police.aide') }}</p>
      <ChoixPolice />
    </section>

    <section class="bloc">
      <h2>🗑️ {{ t('reglages.remise.titre') }}</h2>
      <p class="aide">{{ t('reglages.remise.aide') }}</p>
      <button class="btn btn-danger" @click="toutReinitialiser">{{ t('reglages.remise.bouton') }}</button>
      <p v-if="message" class="succes" role="status">{{ message }}</p>
    </section>

    <RouterLink to="/" class="btn btn-ghost retour">{{ t('reglages.retour') }}</RouterLink>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { CLASSES } from '../data/classes.ts'
import { useClasse } from '../noyau/useClasse.ts'
import ChoixPolice from '../noyau/ChoixPolice.vue'
import { useLangue } from '../langues/useLangue.ts'
import { useLangueRegionale } from '../langues/useLangueRegionale.ts'
import Drapeau from '../shell/Drapeau.vue'

const { t, langue, langues } = useLangue()
const regionale = useLangueRegionale()
const classe = useClasse()
const majuscule = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1)

const message = ref('')
function toutReinitialiser(): void {
  if (!confirm(t('reglages.remise.confirmer'))) return
  // tout ce que l'app mémorise commence par `ep_` (utils/index.js) ; les préférences en mémoire reprennent leurs valeurs par défaut
  const cles = Object.keys(localStorage).filter(k => k.startsWith('ep_'))
  cles.forEach(k => localStorage.removeItem(k))
  message.value = t('reglages.remise.fait', { n: cles.length })
  setTimeout(() => { location.reload() }, 1200)
}
</script>

<style scoped>
.reglages { max-width: 680px; }
h1 { color: var(--bleu); margin-bottom: .25rem; }
.intro { color: #555; margin-bottom: 1.5rem; }
.bloc { background: white; border-radius: var(--radius); box-shadow: var(--shadow); padding: 1.25rem 1.5rem; margin-bottom: 1.25rem; }
h2 { font-size: 1.1rem; margin-bottom: .25rem; }
.aide { color: #666; font-size: .9rem; margin-bottom: .75rem; }
.choix { display: flex; gap: .5rem; flex-wrap: wrap; }
.succes { margin-top: .75rem; font-weight: 600; color: #2a7a2a; }
.retour { display: inline-block; text-decoration: none; margin-top: .5rem; }
</style>
