<template>
  <div class="container">
    <h1>{{ t('titre') }}</h1>
    <p class="intro">{{ t('intro') }}</p>

    <section class="card">
      <h2>🏴 {{ t('langueRegionale') }}</h2>
      <p class="hint">{{ t('langueRegionaleAide') }}</p>
      <p v-if="langue === 'br'" class="hint">{{ t('langueRegionaleBr') }}</p>
      <div class="langues">
        <button class="level-btn" :class="{ active: !langueCode }" @click="langueCode = ''">{{ t('aucune') }}</button>
        <button v-for="l in LANGUES_REGIONALES" :key="l.id" class="level-btn"
          :class="{ active: langueCode === l.id }" @click="langueCode = l.id">
          {{ l.drapeau }} {{ langue === 'br' ? l.nomLocal[0].toUpperCase() + l.nomLocal.slice(1) : l.nom[0].toUpperCase() + l.nom.slice(1) + ' (' + l.nomLocal + ')' }}
        </button>
      </div>
    </section>

    <section class="card">
      <h2>🤖 {{ t('cleMistral') }}</h2>
      <p class="hint">
        {{ t('cleMistralAide') }} <a href="https://console.mistral.ai/" target="_blank" rel="noopener">console.mistral.ai</a>.
      </p>
      <div class="field">
        <label for="cle-mistral">{{ t('cleApi') }}</label>
        <div class="input-row">
          <input
            id="cle-mistral"
            :type="montrerCle ? 'text' : 'password'"
            v-model="cleMistral"
            :placeholder="t('clePlaceholder')"
            autocomplete="off"
            spellcheck="false"
          />
          <button class="btn btn-secondary" @click="montrerCle = !montrerCle" :title="montrerCle ? t('masquer') : t('afficher')">
            {{ montrerCle ? '🙈' : '👁️' }}
          </button>
        </div>
      </div>
      <div class="actions">
        <button class="btn btn-primary" @click="sauvegarderCle">{{ t('enregistrer') }}</button>
        <button class="btn btn-danger" @click="supprimerCle" v-if="cleEnregistree">{{ t('supprimerCle') }}</button>
      </div>
      <p class="success" v-if="messageSucces">{{ messageSucces }}</p>
    </section>

    <section class="card">
      <h2>🗑️ {{ t('reset') }}</h2>
      <p class="hint">{{ t('resetAide') }}</p>
      <button class="btn btn-danger" @click="confirmerReset">{{ t('toutReset') }}</button>
      <p class="success" v-if="messageReset">{{ messageReset }}</p>
    </section>

    <div class="back">
      <RouterLink to="/" class="btn btn-secondary">{{ t('retour') }}</RouterLink>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { LANGUES_REGIONALES } from '../data/languesRegionales'
import { useLangueRegionale } from '../composables/useLangueRegionale'
import { useI18n } from '../i18n'
import messagesFr from '../i18n/fr/views/ParentSettingsView.js'
import messagesBr from '../i18n/br/views/ParentSettingsView.js'

const { reglage: langueCode } = useLangueRegionale()
const { t, langue } = useI18n({ fr: messagesFr, br: messagesBr })

const CLE_KEY = 'ep_mistral_key'

const cleMistral    = ref('')
const montrerCle    = ref(false)
const cleEnregistree = ref(false)
const messageSucces = ref('')
const messageReset  = ref('')

onMounted(() => {
  const saved = localStorage.getItem(CLE_KEY)
  if (saved) { cleMistral.value = saved; cleEnregistree.value = true }
})

function sauvegarderCle() {
  const val = cleMistral.value.trim()
  if (val) {
    localStorage.setItem(CLE_KEY, val)
    cleEnregistree.value = true
    messageSucces.value = t('cleOk')
  } else {
    supprimerCle()
  }
  setTimeout(() => { messageSucces.value = '' }, 3000)
}

function supprimerCle() {
  localStorage.removeItem(CLE_KEY)
  cleMistral.value = ''
  cleEnregistree.value = false
  messageSucces.value = t('cleSupprimee')
  setTimeout(() => { messageSucces.value = '' }, 3000)
}

function confirmerReset() {
  if (!confirm(t('confirmer'))) return
  const keysToRemove = Object.keys(localStorage).filter(k => k.startsWith('ep_'))
  keysToRemove.forEach(k => localStorage.removeItem(k))
  messageReset.value = t('resetOk', { n: keysToRemove.length })
  cleEnregistree.value = false
  cleMistral.value = ''
  setTimeout(() => { messageReset.value = '' }, 4000)
}
</script>

<style scoped>
.container { max-width: 640px; margin: 2rem auto; padding: 0 1rem; }
h1 { color: var(--bleu); margin-bottom: .25rem; }
.intro { color: #555; margin-bottom: 2rem; }

.card {
  background: white;
  border-radius: 12px;
  box-shadow: var(--shadow);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}
h2 { margin-top: 0; font-size: 1.15rem; color: var(--texte); }
.hint { color: #666; font-size: .9rem; margin-bottom: 1rem; }
.hint a { color: var(--bleu); }

.field { margin-bottom: 1rem; }
.field label { display: block; font-weight: 600; margin-bottom: .35rem; font-size: .9rem; }
.input-row { display: flex; gap: .5rem; }
.input-row input {
  flex: 1;
  padding: .5rem .75rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: .95rem;
  font-family: monospace;
}
.input-row input:focus { outline: 2px solid var(--bleu); border-color: transparent; }

.actions { display: flex; gap: .75rem; flex-wrap: wrap; }
.success { margin-top: .75rem; font-weight: 600; color: #2a7a2a; }

.btn-danger {
  background: #e53e3e;
  color: white;
  border: none;
  padding: .5rem 1.1rem;
  border-radius: 8px;
  font-size: .95rem;
  font-weight: 600;
  cursor: pointer;
  transition: background .15s;
}
.btn-danger:hover { background: #c53030; }

.back { margin-top: 1rem; }
.langues { display: flex; gap: .5rem; flex-wrap: wrap; }
</style>
