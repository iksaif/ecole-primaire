<template>
  <div class="container">
    <h1 class="section-heading">🖊️ Dictée</h1>

    <!-- Config -->
    <div v-if="phase === 'config'" class="config-box">
      <div class="config-section">
        <div class="config-section-title">Niveau</div>
        <div class="btn-group">
          <button v-for="niv in ['CP','CE1','CE2','CM']" :key="niv"
            class="level-btn" :class="{ active: config.niveau === niv }"
            @click="config.niveau = niv">{{ niv }}</button>
        </div>
      </div>

      <div class="config-section">
        <div class="config-section-title">{{ `Catégories — ${config.niveau}` }}</div>
        <div class="btn-group" style="flex-wrap:wrap;">
          <button v-for="cat in Object.keys(categoriesActuelles)" :key="cat"
            class="cat-btn" :class="{ active: config.cats.includes(cat) }"
            @click="toggleCat(cat)">
            {{ cat }} ({{ categoriesActuelles[cat].length }})
          </button>
        </div>
      </div>

      <div class="config-section">
        <div class="config-section-title">Mode</div>
        <div class="mode-cards">
          <button class="mode-card" :class="{ active: config.mode === 'mots' }" @click="config.mode = 'mots'">
            <div class="mode-icon">🔤</div>
            <div class="mode-title">Mots seuls</div>
            <div class="mode-desc">L'élève entend le mot et le tape</div>
          </button>
          <button class="mode-card" :class="{ active: config.mode === 'phrases' }" @click="config.mode = 'phrases'">
            <div class="mode-icon">💬</div>
            <div class="mode-title">Phrases</div>
            <div class="mode-desc">Un mot dans une phrase, l'élève tape la phrase</div>
          </button>
        </div>
      </div>

      <div class="config-section" v-if="config.mode === 'phrases'">
        <div class="config-section-title">
          Clé API Mistral
          <span style="font-weight:400;color:#aaa;font-size:.85em"> (optionnel — pour générer des phrases variées)</span>
        </div>
        <div class="api-row">
          <span v-if="apiKeySaved" class="api-ok">✓ Clé configurée</span>
          <span v-else class="api-ok" style="color:#aaa;">Aucune clé — phrases prédéfinies</span>
          <RouterLink to="/parametres" class="btn btn-ghost" style="font-size:.85rem;">⚙️ Paramètres parents</RouterLink>
        </div>
      </div>

      <div class="config-section">
        <div class="config-section-title">Nombre de mots</div>
        <div class="btn-group">
          <button v-for="n in [5,10,15,0]" :key="n"
            class="level-btn" :class="{ active: config.nb === n }"
            @click="config.nb = n">{{ n === 0 ? 'Tous' : n }}</button>
        </div>
      </div>

      <div class="config-section">
        <div class="config-section-title">Vitesse de la voix</div>
        <div class="slider-row">
          <span>🐢</span>
          <input type="range" min="0.5" max="1.2" step="0.05" v-model.number="config.vitesse">
          <span>🐇</span>
          <span class="slider-val">{{ config.vitesse }}</span>
        </div>
      </div>

      <div style="text-align:center;margin-top:1.5rem;">
        <button class="btn btn-primary" style="font-size:1.1rem;padding:.75rem 2rem;"
                @click="demarrer" :disabled="config.cats.length === 0 || loading">
          ▶ Commencer la dictée
        </button>
      </div>
    </div>

    <!-- Dictée -->
    <template v-if="phase === 'jeu'">
      <div class="score-bar">
        <button class="btn-quitter" @click="arreter(); phase = 'config'" title="Quitter la dictée">✕ Quitter</button>
        <span>Mot {{ idx + 1 }} / {{ liste.length }}</span>
        <span v-if="loading" class="loading-badge"><span class="spinner"></span> Génération…</span>
        <span>✅ {{ nbBonnes }} &nbsp; ❌ {{ nbMauvaises }}</span>
      </div>

      <div class="exercise-box">
        <div class="prog-dots">
          <div v-for="(_, i) in liste" :key="i"
               class="prog-dot" :class="dotClass(i)"></div>
        </div>

        <!-- Contexte phrase -->
        <div v-if="config.mode === 'phrases' && currentPhrase" class="phrase-ctx-container">
          <button v-if="!afficherIndice" class="btn btn-ghost btn-sm" style="margin-bottom: 1.25rem;" @click="afficherIndice = true">
            👁️ Afficher la phrase à trous (indice)
          </button>
          <div v-else class="phrase-ctx">
            <span v-html="phraseAvecBlanc"></span>
            <button class="btn-masquer-indice" @click="afficherIndice = false" title="Masquer l'indice">🙈</button>
          </div>
        </div>

        <button class="btn-ecouter" :class="{ playing: enLecture }" @click="ecouterMot()">
          <span>{{ enLecture ? '⏹' : '🔊' }}</span>
          <span>{{ enLecture ? 'Arrêter' : (config.mode === 'phrases' ? 'Écouter la phrase' : 'Écouter le mot') }}</span>
        </button>

        <div class="hint-text">Écoute bien, puis tape ce que tu entends :</div>

        <input ref="inputEl" class="dictee-input" :class="inputClass"
               type="text" v-model="reponse" placeholder="…"
               autocomplete="off" autocorrect="off" autocapitalize="none"
               spellcheck="false" @keydown.enter="validerMot">

        <div class="feedback" :class="feedbackClass">{{ feedback }}</div>

        <div class="btn-group" style="justify-content:center;margin-top:.75rem;">
          <button class="btn btn-ghost" @click="ecouterMot()">🔁 Réécouter</button>
          <button class="btn btn-primary" @click="validerMot">Valider ✔</button>
          <button class="btn btn-ghost" @click="passerMot">Passer ⏭</button>
        </div>
      </div>
    </template>

    <!-- Résultats -->
    <div v-if="phase === 'resultats'" class="exercise-box" style="text-align:center;">
      <div class="result-score">{{ nbBonnes }} / {{ liste.length }}</div>
      <div class="result-msg">{{ resultMsg }}</div>

      <table class="correction-table">
        <thead><tr><th>Attendu</th><th>Ta réponse</th><th></th></tr></thead>
        <tbody>
          <tr v-for="(r, i) in resultats" :key="i" :class="r.ok ? 'ok' : 'erreur'">
            <td class="mot-attendu">{{ r.attendu }}</td>
            <td>{{ r.ok ? '—' : r.donne }}</td>
            <td>{{ r.ok ? '✅' : '❌' }}</td>
          </tr>
        </tbody>
      </table>

      <div class="btn-group" style="justify-content:center;">
        <button class="btn btn-primary" @click="demarrer">🔄 Rejouer</button>
        <button class="btn btn-ghost"   @click="phase = 'config'">⚙️ Paramètres</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onUnmounted, watch } from 'vue'
import { melanger, charger, sauvegarder, normaliser, confettis } from '../../utils'
import { CATEGORIES, PHRASES_DEFAUT, MOTS_AMBIGUS, NIVEAUX, PHRASES_DEFAUT_ALL } from '../../data/dicteeMots'
import { useTTS } from '../../composables/useTTS'

const config = ref({
  niveau:  charger('dictee_niveau', 'CP'),
  cats:    charger('dictee_cats', Object.keys(CATEGORIES)),
  mode:    charger('dictee_mode', 'mots'),
  nb:      charger('dictee_nb', 10),
  vitesse: charger('dictee_vitesse', 0.75),
})

watch(config, v => {
  sauvegarder('dictee_niveau', v.niveau)
  sauvegarder('dictee_mode', v.mode)
  sauvegarder('dictee_nb', v.nb)
  sauvegarder('dictee_vitesse', v.vitesse)
  sauvegarder('dictee_cats', v.cats)
}, { deep: true })

const apiKeySaved = ref(!!localStorage.getItem('ep_mistral_key'))

const phase = ref('config')
const liste = ref([])
const idx   = ref(0)
const resultats = ref([])
const reponse = ref('')
const afficherIndice = ref(false)
const feedback = ref('')
const feedbackClass = ref('')
const inputClass = ref('')
const loading = ref(false)
const inputEl = ref(null)

const { enLecture, lire, arreter } = useTTS()

const niveauData = computed(() => NIVEAUX[config.value.niveau] ?? NIVEAUX.CP)
const categoriesActuelles = computed(() => niveauData.value.categories)
const ambigsActuels = computed(() => niveauData.value.ambigus)

watch(() => config.value.niveau, () => {
  config.value.cats = Object.keys(categoriesActuelles.value)
})

// ── Getters
const nbBonnes   = computed(() => resultats.value.filter(r => r.ok).length)
const nbMauvaises = computed(() => resultats.value.filter(r => !r.ok).length)
const currentMot    = computed(() => liste.value[idx.value]?.mot ?? '')
const currentPhrase = computed(() => liste.value[idx.value]?.phrase ?? '')

const phraseAvecBlanc = computed(() => {
  const phrase = currentPhrase.value
  const mot = currentMot.value
  if (!phrase || !mot) return phrase
  const re = new RegExp(mot.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
  return phrase.replace(re, `<span class="blank">___</span>`)
})

const resultMsg = computed(() => {
  const pct = nbBonnes.value / liste.value.length * 100
  if (pct === 100) { confettis(50); return 'Parfait, zéro faute ! 🏆' }
  if (pct >= 80)   { confettis(25); return 'Très bien ! Continue comme ça 🌟' }
  if (pct >= 60)   return 'Bien, mais il y a encore du travail ! 💪'
  return 'Courage, relis les mots et réessaie ! 📚'
})

// ── Config
function toggleCat(cat) {
  const cats = config.value.cats
  if (cats.includes(cat)) {
    if (cats.length === 1) return
    config.value.cats = cats.filter(c => c !== cat)
  } else {
    config.value.cats = [...cats, cat]
  }
}

function dotClass(i) {
  if (i === idx.value && phase.value === 'jeu') return 'current'
  const r = resultats.value[i]
  if (!r) return ''
  return r.ok ? 'ok' : 'erreur'
}

// ── Mistral
async function genererPhrase(mot) {
  const apiKey = localStorage.getItem('ep_mistral_key') || ''
  if (!apiKey) return PHRASES_DEFAUT_ALL[mot] || `Je vois ${mot}.`
  try {
    const res = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'mistral-small-latest',
        messages: [{ role: 'user', content:
          `Tu es un assistant pédagogique pour enfants de CP (6-7 ans).\nGénère UNE SEULE phrase courte et simple en français (10 mots maximum) contenant l'expression "${mot}".\nRéponds UNIQUEMENT avec la phrase, sans guillemets ni explication.`
        }],
        temperature: 0.7, max_tokens: 60,
      }),
    })
    if (!res.ok) throw new Error()
    const data = await res.json()
    return data.choices?.[0]?.message?.content?.trim() || PHRASES_DEFAUT_ALL[mot] || `Je vois ${mot}.`
  } catch {
    return PHRASES_DEFAUT_ALL[mot] || `Je vois ${mot}.`
  }
}

// ── Démarrage
async function demarrer() {
  if (loading.value) return  // empêche double-clic pendant la génération
  arreter()

  let pool = []
  config.value.cats.forEach(cat => { if (categoriesActuelles.value[cat]) pool.push(...categoriesActuelles.value[cat]) })
  pool = [...new Set(pool)]

  // En mode "mots seuls", exclure les homophones/ambigus
  if (config.value.mode === 'mots') {
    pool = pool.filter(m => !ambigsActuels.value.has(m))
  }

  // Rotation inter-sessions : repousser les mots vus récemment en fin de pool
  const cle = `dictee_vus_${config.value.mode}`
  const vusRecemment = new Set(charger(cle, []))
  const frais  = melanger(pool.filter(m => !vusRecemment.has(m)))
  const anciens = melanger(pool.filter(m =>  vusRecemment.has(m)))
  pool = [...frais, ...anciens]

  if (config.value.nb > 0) pool = pool.slice(0, config.value.nb)

  // Mémoriser les mots utilisés pour la prochaine session
  sauvegarder(cle, pool)

  phase.value = 'jeu'
  idx.value = 0; resultats.value = []

  if (config.value.mode === 'phrases') {
    loading.value = true
    liste.value = []
    for (const mot of pool) {
      const phrase = await genererPhrase(mot)
      liste.value = [...liste.value, { mot, phrase }]
    }
    loading.value = false
  } else {
    liste.value = pool.map(mot => ({ mot, phrase: null }))
  }

  nextTick(() => { afficherMot(); ecouterMot() })
}

function afficherMot() {
  reponse.value = ''; feedback.value = ''; feedbackClass.value = ''; inputClass.value = ''
  afficherIndice.value = false
  nextTick(() => inputEl.value?.focus())
}

function ecouterMot() {
  if (enLecture.value) { arreter(); return }
  const { mot, phrase } = liste.value[idx.value] ?? {}
  const texte = (config.value.mode === 'phrases' && phrase) ? phrase : mot
  if (texte) lire(texte, { vitesse: config.value.vitesse })
}

// ── Validation
function validerMot() {
  const { mot, phrase } = liste.value[idx.value]
  const val = reponse.value.trim()
  if (!val) return
  arreter()

  const attendu = (config.value.mode === 'phrases' && phrase) ? phrase : mot
  const ok = normaliser(val) === normaliser(attendu)

  resultats.value = [...resultats.value, { mot, attendu, donne: val, ok }]
  inputClass.value = ok ? 'ok' : 'erreur'

  if (ok) {
    feedback.value = ['Bravo ! 🎉', 'Parfait ! ⭐', 'Excellent ! 👏'][Math.floor(Math.random()*3)]
    feedbackClass.value = 'ok'
    setTimeout(suivant, 900)
  } else {
    feedback.value = `❌ La bonne réponse était : « ${attendu} »`
    feedbackClass.value = 'erreur'
    setTimeout(() => lire(attendu, { vitesse: config.value.vitesse }), 600)
    setTimeout(suivant, 2400)
  }
}

function passerMot() {
  const { mot, phrase } = liste.value[idx.value]
  const attendu = (config.value.mode === 'phrases' && phrase) ? phrase : mot
  resultats.value = [...resultats.value, { mot, attendu, donne: '(passé)', ok: false }]
  arreter()
  suivant()
}

function suivant() {
  idx.value++
  if (idx.value >= liste.value.length) { phase.value = 'resultats' }
  else nextTick(() => { afficherMot(); ecouterMot() })
}

onUnmounted(() => arreter())
</script>

<style scoped>
.cat-btn {
  padding: .35rem .85rem;
  border-radius: 20px;
  border: 2px solid var(--gris-brd);
  background: white;
  font-weight: 600;
  font-size: .85rem;
  cursor: pointer;
  transition: all .15s;
}
.cat-btn:hover  { border-color: var(--bleu); color: var(--bleu); }
.cat-btn.active { background: var(--bleu); border-color: var(--bleu); color: white; }

.mode-cards { display: grid; grid-template-columns: 1fr 1fr; gap: .75rem; }
@media (max-width: 480px) { .mode-cards { grid-template-columns: 1fr; } }

.mode-card {
  border: 3px solid var(--gris-brd); border-radius: var(--radius);
  padding: 1rem; cursor: pointer; transition: all .15s; text-align: center;
  background: white; font-family: inherit; width: 100%;
}
.mode-card:hover  { border-color: var(--bleu); }
.mode-card:focus-visible { outline: 3px solid var(--bleu); outline-offset: 2px; }
.mode-card.active { border-color: var(--bleu); background: #eef5ff; }
.mode-icon { font-size: 2rem; }
.mode-title { font-weight: 800; font-size: 1rem; margin: .3rem 0 .2rem; }
.mode-desc  { font-size: .8rem; color: #666; }

.api-row { display: flex; gap: .5rem; align-items: center; flex-wrap: wrap; }
.api-input {
  flex: 1; min-width: 200px; border: 2px solid var(--gris-brd);
  border-radius: 8px; padding: .4rem .75rem; font-size: .9rem;
  outline: none; font-family: monospace;
}
.api-input:focus { border-color: var(--bleu); }
.api-ok { font-size: .8rem; font-weight: 700; color: var(--vert); }

.slider-row { display: flex; align-items: center; gap: .75rem; }
.slider-row input[type=range] { flex: 1; }
.slider-val { font-weight: 700; min-width: 2.5rem; text-align: right; }

.phrase-ctx {
  position: relative;
  background: var(--gris-bg); border-radius: 8px;
  padding: 1rem 2.5rem 1rem 1.25rem; font-size: 1.2rem;
  line-height: 1.8; margin: 1rem 0; text-align: center; min-height: 5rem;
  display: flex; align-items: center; justify-content: center;
}
.btn-masquer-indice {
  position: absolute; right: 0.5rem; top: 50%; transform: translateY(-50%);
  background: none; border: none; font-size: 1.2rem; cursor: pointer;
  opacity: 0.6; transition: opacity 0.15s;
}
.btn-masquer-indice:hover { opacity: 1; }
.phrase-ctx-container { margin-bottom: 1rem; text-align: center; }
:deep(.blank) {
  display: inline-block; min-width: 80px;
  border-bottom: 3px solid var(--bleu);
  vertical-align: bottom; font-weight: 700; color: var(--bleu);
}

.btn-ecouter {
  display: flex; align-items: center; justify-content: center; gap: .5rem;
  width: 100%; padding: 1rem; font-size: 1.1rem; font-weight: 800;
  border: none; border-radius: var(--radius);
  background: var(--bleu); color: white; cursor: pointer;
  transition: opacity .15s, transform .1s; margin-bottom: 1rem;
}
.btn-ecouter:hover { opacity: .88; }
.btn-ecouter.playing { background: var(--orange); }

.hint-text { font-size: .85rem; color: #aaa; text-align: center; margin-bottom: .75rem; }

.dictee-input {
  display: block; width: 100%; font-size: 1.6rem; font-weight: 700;
  text-align: center; border: 3px solid var(--gris-brd);
  border-radius: var(--radius); padding: .6rem; outline: none;
  transition: border-color .15s; margin-bottom: .75rem;
}
.dictee-input:focus  { border-color: var(--bleu); }
.dictee-input.ok     { border-color: var(--vert); background: #f0faf0; }
.dictee-input.erreur { border-color: var(--rouge); background: #fef0f0; }
</style>
