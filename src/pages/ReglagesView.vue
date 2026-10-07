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
      <h2><IconeMatiere matiere="regionale" :langue="regionale.proposees[0]?.code" /> {{ t('reglages.langues.titre') }}</h2>
      <p class="aide">{{ t('reglages.langues.aide') }}</p>
      <OptionsLangue />
    </section>

    <section class="bloc">
      <h2>🎒 {{ t('reglages.classe.titre') }}</h2>
      <p class="aide">{{ t('reglages.classe.aide') }}</p>
      <CadenasClasse v-if="verrouillee" @ouvert="deverrouillerClasse" />
      <ChoixClasses v-else />
    </section>

    <section class="bloc">
      <h2>👤 {{ t('reglages.profil.titre') }}</h2>
      <p class="aide">{{ t('reglages.profil.aide') }}</p>
      <OptionsProfil />
    </section>

    <section class="bloc">
      <h2>✏️ {{ t('reglages.police.titre') }}</h2>
      <p class="aide">{{ t('reglages.police.aide') }}</p>
      <ChoixPolice />
    </section>

    <section class="bloc" data-section="voix">
      <h2>🔊 {{ t('reglages.voix.titre') }}</h2>
      <p class="aide">{{ t('reglages.voix.aide') }}</p>
      <ReglageVoix />
    </section>

    <section class="bloc">
      <h2>🧭 {{ t('assistant.revoir.titre') }}</h2>
      <p class="aide">{{ t('assistant.revoir.aide') }}</p>
      <button type="button" class="btn btn-ghost" @click="revoirAssistant(router)">{{ t('assistant.revoir.bouton') }}</button>
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
// Réglages de l'appareil : langue d'interface, mode de langue, classe(s), profil (tous par le contexte, comme la barre), police,
// voix et vitesse de la lecture à voix haute (ReglageVoix, mémorisés par useTTS).
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useContexte } from '../contexte/useContexte.ts'
import ChoixPolice from '../noyau/ChoixPolice.vue'
import ReglageVoix from '../noyau/ReglageVoix.vue'
import { useLangue } from '../langues/useLangue.ts'
import { useLangueRegionale } from '../langues/useLangueRegionale.ts'
import CadenasClasse from '../shell/CadenasClasse.vue'
import ChoixClasses from '../shell/ChoixClasses.vue'
import Drapeau from '../shell/Drapeau.vue'
import IconeMatiere from '../shell/IconeMatiere.vue'
import OptionsLangue from '../shell/OptionsLangue.vue'
import OptionsProfil from '../shell/OptionsProfil.vue'
import { revoirAssistant } from '../shell/assistant.ts'

const { t, langue, langues } = useLangue()
const router = useRouter()
const regionale = useLangueRegionale()
const { verrouillee, deverrouillerClasse } = useContexte()
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
h1 { color: var(--bleu-fort); margin-bottom: .25rem; }
.intro { color: var(--texte-doux); margin-bottom: 1.5rem; }
.bloc { background: white; border-radius: var(--radius); box-shadow: var(--shadow); padding: 1.25rem 1.5rem; margin-bottom: 1.25rem; }
h2 { font-size: 1.1rem; margin-bottom: .25rem; }
.aide { color: var(--texte-doux); font-size: .9rem; margin-bottom: .75rem; }
.choix { display: flex; gap: .5rem; flex-wrap: wrap; }
.succes { margin-top: .75rem; font-weight: 600; color: var(--vert-texte); }
.retour { display: inline-block; text-decoration: none; margin-top: .5rem; }
</style>
