<template>
  <div class="container">
    <h1 class="section-heading">✖️ Tables de multiplication</h1>

    <!-- ══ CONFIG ══ -->
    <div v-if="phase === 'config'" class="config-box">

      <div class="config-section">
        <div class="config-section-title">Tables à réviser</div>
        <div class="btn-group" style="flex-wrap:wrap;">
          <button class="level-btn" :class="{ active: toutesSelectionnees }"
                  @click="toggleToutes">Toutes</button>
          <button v-for="n in 12" :key="n"
                  class="level-btn" :class="{ active: config.tables.includes(n) }"
                  @click="toggleTable(n)">× {{ n }}</button>
        </div>
      </div>

      <div class="config-section">
        <div class="config-section-title">Mode</div>
        <div class="mode-cards">
          <button class="mode-card" :class="{ active: config.mode === 'entrainement' }"
               @click="config.mode = 'entrainement'">
            <div class="mode-icon">📖</div>
            <div class="mode-title">Entraînement</div>
            <div class="mode-desc">Vois la table, puis réponds en ordre</div>
          </button>
          <button class="mode-card" :class="{ active: config.mode === 'aleatoire' }"
               @click="config.mode = 'aleatoire'">
            <div class="mode-icon">🎲</div>
            <div class="mode-title">Aléatoire</div>
            <div class="mode-desc">Questions mélangées sur les tables choisies</div>
          </button>
          <button class="mode-card" :class="{ active: config.mode === 'chrono' }"
               @click="config.mode = 'chrono'">
            <div class="mode-icon">⏱️</div>
            <div class="mode-title">Défi chrono</div>
            <div class="mode-desc">Le plus de bonnes réponses en 1 minute</div>
          </button>
        </div>
      </div>

      <div class="config-section" v-if="config.mode !== 'chrono'">
        <div class="config-section-title">Multiplier jusqu'à</div>
        <div class="btn-group">
          <button v-for="m in [10, 12]" :key="m"
                  class="level-btn" :class="{ active: config.jusqu === m }"
                  @click="config.jusqu = m">× {{ m }}</button>
        </div>
      </div>

      <div class="config-section" v-if="config.mode === 'aleatoire'">
        <div class="config-section-title">Nombre de questions</div>
        <div class="btn-group">
          <button v-for="n in [10, 20, 30]" :key="n"
                  class="level-btn" :class="{ active: config.nbQ === n }"
                  @click="config.nbQ = n">{{ n }}</button>
        </div>
      </div>

      <div style="text-align:center;margin-top:1.5rem;">
        <button class="btn btn-primary" style="font-size:1.1rem;"
                :disabled="config.tables.length === 0"
                @click="demarrer">▶ Commencer</button>
      </div>
      <div style="text-align:center;margin-top:.75rem;">
        <button class="btn btn-ghost" style="font-size:.95rem;" @click="imprimerFiche">🖨️ Imprimer une fiche</button>
      </div>
    </div>

    <!-- ══ APPRENTISSAGE (mode entraînement : affiche la table avant) ══ -->
    <div v-if="phase === 'apprendre'" class="exercise-box" style="text-align:center;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.25rem;">
        <button class="btn-quitter" @click="phase = 'config'" title="Quitter">✕ Quitter</button>
        <span style="font-size:.85rem;color:#888;font-weight:600;">
          Table {{ tableIdx + 1 }} / {{ config.tables.length }}
        </span>
      </div>
      <div class="table-title">Table de × {{ tableActuelle }}</div>
      <div class="table-grid">
        <div v-for="i in config.jusqu" :key="i" class="table-row">
          <span class="table-cell-a">{{ tableActuelle }} × {{ i }}</span>
          <span class="table-cell-eq">=</span>
          <span class="table-cell-r">{{ tableActuelle * i }}</span>
        </div>
      </div>
      <button class="btn btn-primary" style="margin-top:1.5rem;" @click="passerApprendre">
        Je la connais → Tester ! ✔
      </button>
    </div>

    <!-- ══ EXERCICE ══ -->
    <template v-if="phase === 'jeu'">
      <div class="score-bar">
        <button class="btn-quitter" @click="phase = 'config'" title="Quitter l'exercice">✕ Quitter</button>
        <span v-if="config.mode === 'chrono'">
          ⏱ <span :style="{ color: tempsRestant <= 10 ? 'var(--rouge)' : 'inherit' }">
            {{ tempsRestant }}s
          </span>
        </span>
        <span v-else-if="config.mode === 'entrainement'">× {{ tableActuelle }} — Q{{ idx + 1 }}/{{ questions.length }}</span>
        <span v-else>Question {{ idx + 1 }} / {{ questions.length }}</span>
        <span>✅ {{ bonnes }} &nbsp; ❌ {{ mauvaises }}</span>
      </div>

      <!-- Barre de temps (chrono) -->
      <div v-if="config.mode === 'chrono'" class="progress-track" style="max-width:680px;margin:0 auto .75rem;">
        <div class="progress-fill" :class="{ urgent: tempsRestant <= 10 }"
             :style="{ width: (tempsRestant / DUREE_CHRONO * 100) + '%',
                       background: tempsRestant <= 10 ? 'var(--rouge)' : undefined }"></div>
      </div>

      <!-- Dots de progression (modes non-chrono) -->
      <div v-if="config.mode !== 'chrono'" class="prog-dots" style="max-width:680px;margin:0 auto;">
        <div v-for="(_, i) in questions" :key="i"
             class="prog-dot" :class="dotClass(i)"></div>
      </div>

      <div class="exercise-box">
        <div class="exercise-question">{{ questions[idx]?.texte }}</div>

        <input ref="inputEl" class="exercise-input" :class="inputClass"
               type="number" inputmode="numeric" placeholder="?"
               v-model="reponse" autocomplete="off" @keydown.enter="valider">

        <div class="feedback" :class="feedbackClass">{{ feedback }}</div>

        <div class="btn-group" style="justify-content:center;margin-top:1rem;">
          <button v-if="config.mode !== 'chrono'" class="btn btn-ghost" @click="passer">Passer ⏭</button>
          <button class="btn btn-primary" @click="valider">Valider ✔</button>
        </div>
      </div>
    </template>

    <!-- ══ RÉSULTATS ══ -->
    <div v-if="phase === 'resultats'" class="exercise-box" style="text-align:center;">
      <div v-if="config.mode === 'chrono'">
        <div class="result-score">{{ bonnes }}</div>
        <div class="result-msg">bonnes réponses en 1 minute ! {{ resultMsgChrono }}</div>
      </div>
      <div v-else>
        <div class="result-score">{{ bonnes }} / {{ questions.length }}</div>
        <div class="result-msg">{{ resultMsg }}</div>
      </div>

      <!-- Tableau des erreurs -->
      <div v-if="erreurs.length > 0" class="erreurs-box">
        <div class="config-section-title" style="margin-bottom:.5rem;">À retravailler :</div>
        <div class="erreurs-grid">
          <div v-for="(e, i) in erreurs" :key="i" class="erreur-item">
            <span class="erreur-question">{{ e.texte }}</span>
            <span class="erreur-reponse">{{ e.reponse }}</span>
          </div>
        </div>
      </div>

      <div class="btn-group" style="justify-content:center;margin-top:1.25rem;">
        <button class="btn btn-primary" @click="demarrer">🔄 Rejouer</button>
        <button v-if="erreurs.length > 0" class="btn btn-warning" @click="rejouerErreurs">
          ❌ Revoir les erreurs
        </button>
        <button class="btn btn-ghost" @click="phase = 'config'">⚙️ Paramètres</button>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, nextTick, onUnmounted, watch } from 'vue'
import { aleatoire, melanger, confettis, sauvegarder, charger } from '../../utils'

const DUREE_CHRONO = 60 // secondes

const config = ref(charger('tables_config', {
  tables: [2, 3, 4, 5, 6, 7, 8, 9],
  mode: 'aleatoire',
  jusqu: 10,
  nbQ: 20,
}))
watch(config, v => sauvegarder('tables_config', v), { deep: true })

const phase = ref('config')
const questions = ref([])
const idx = ref(0)
const bonnes = ref(0)
const mauvaises = ref(0)
const erreurs = ref([])
const reponse = ref('')
const feedback = ref('')
const feedbackClass = ref('')
const inputClass = ref('')
const tempsRestant = ref(DUREE_CHRONO)
const tableActuelle = ref(2)
const tableIdx = ref(0)   // pour le mode entraînement : quelle table on est en train de faire
const inputEl = ref(null)

let timerInterval = null

// ── Config helpers
const toutesSelectionnees = computed(() =>
  config.value.tables.length === 12 && [1,2,3,4,5,6,7,8,9,10,11,12].every(n => config.value.tables.includes(n))
)

function toggleTable(n) {
  const t = config.value.tables
  if (t.includes(n)) {
    if (t.length === 1) return
    config.value.tables = t.filter(x => x !== n)
  } else {
    config.value.tables = [...t, n].sort((a,b) => a-b)
  }
}

function toggleToutes() {
  if (toutesSelectionnees.value) {
    config.value.tables = [2, 3, 4, 5, 6, 7, 8, 9]
  } else {
    config.value.tables = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
  }
}

function dotClass(i) {
  if (i === idx.value && phase.value === 'jeu') return 'current'
  const h = questions.value[i]?._resultat
  if (h === undefined) return ''
  return h ? 'ok' : 'erreur'
}

// ── Génération
function genererQuestions(tables, jusqu, nb, mode) {
  if (mode === 'entrainement') {
    // Pour la table en cours : de 1 à jusqu, dans l'ordre
    const tbl = tables[tableIdx.value]
    return Array.from({ length: jusqu }, (_, i) => ({
      a: tbl, b: i + 1,
      texte: `${tbl} × ${i + 1} = ?`,
      reponse: tbl * (i + 1),
    }))
  }

  // Aléatoire / chrono
  let pool = []
  tables.forEach(t => {
    for (let i = 1; i <= jusqu; i++) {
      pool.push({ a: t, b: i, texte: `${t} × ${i} = ?`, reponse: t * i })
    }
  })
  pool = melanger(pool)
  if (mode === 'aleatoire') pool = pool.slice(0, nb)
  return pool
}

// ── Démarrage
function demarrer(listeForcee) {
  clearInterval(timerInterval)
  idx.value = 0; bonnes.value = 0; mauvaises.value = 0; erreurs.value = []

  if (config.value.mode === 'entrainement') {
    tableIdx.value = 0
    tableActuelle.value = config.value.tables[0]
    phase.value = 'apprendre'
    return
  }

  const qs = listeForcee ?? genererQuestions(
    config.value.tables, config.value.jusqu,
    config.value.nbQ, config.value.mode
  )
  // marquer résultats comme non répondus
  questions.value = qs.map(q => ({ ...q, _resultat: undefined }))
  phase.value = 'jeu'
  nextTick(() => afficherQuestion())

  if (config.value.mode === 'chrono') demarrerChrono()
}

function imprimerFiche() {
  const tablesTriees = config.value.tables.slice().sort((a, b) => a - b)
  const jusqu = config.value.jusqu ?? 10
  const allQ = []
  for (const t of tablesTriees) {
    for (let i = 1; i <= jusqu; i++) {
      allQ.push({ a: t, b: i, r: t * i })
    }
  }
  // Mélanger si plusieurs tables
  if (tablesTriees.length > 1) {
    for (let i = allQ.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const tmp = allQ[i]; allQ[i] = allQ[j]; allQ[j] = tmp
    }
  }

  const titre = tablesTriees.length === 1
    ? `Table de ${tablesTriees[0]}`
    : `Tables : ${tablesTriees.join(', ')}`

  const cols = 2
  const rows = allQ.map((q, i) => `<div class="question">
    <span class="num">${i + 1}.</span>
    <span class="calc">${q.a} × ${q.b} =</span>
    <span class="ligne"></span>
  </div>`).join('')

  const html = `<!DOCTYPE html><html lang="fr"><head>
    <meta charset="UTF-8"><title>${titre}</title>
    <style>
      body { font-family: Arial, sans-serif; max-width: 720px; margin: 1.5cm auto; color: #222; }
      h1 { font-size: 1.25rem; border-bottom: 2px solid #333; padding-bottom: .4rem; margin-bottom: .5rem; }
      .entete { font-size: .85rem; color: #666; margin-bottom: 1.5rem; }
      .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 2rem; }
      .question { display: flex; align-items: baseline; gap: .6rem; margin: .7rem 0; }
      .num { min-width: 1.6rem; font-weight: 700; color: #777; font-size: .9rem; }
      .calc { min-width: 120px; font-weight: 800; font-size: 1.2rem; font-family: monospace; }
      .ligne { flex: 1; border-bottom: 1.5px solid #aaa; }
    </style></head><body>
    <h1>${titre}</h1>
    <p class="entete">× jusqu'à ${jusqu} &nbsp;|&nbsp; ${allQ.length} questions &nbsp;&nbsp;&nbsp; Nom : ________________________________ &nbsp; Date : ______________</p>
    <div class="grid">${rows}</div>
    <script>window.print(); window.close();<\/script>
  </body></html>`

  const w = window.open('', '_blank')
  w.document.write(html)
  w.document.close()
}

function passerApprendre() {
  questions.value = genererQuestions(
    [config.value.tables[tableIdx.value]],
    config.value.jusqu, null, 'entrainement'
  ).map(q => ({ ...q, _resultat: undefined }))
  idx.value = 0
  phase.value = 'jeu'
  nextTick(() => afficherQuestion())
}

function demarrerChrono() {
  tempsRestant.value = DUREE_CHRONO
  timerInterval = setInterval(() => {
    tempsRestant.value--
    if (tempsRestant.value <= 0) {
      clearInterval(timerInterval)
      terminerChrono()
    }
  }, 1000)
}

function terminerChrono() {
  phase.value = 'resultats'
}

// ── Exercice
function afficherQuestion() {
  reponse.value = ''; feedback.value = ''; feedbackClass.value = ''; inputClass.value = ''
  nextTick(() => inputEl.value?.focus())
}

function valider() {
  const val = reponse.value.toString().trim()
  if (!val) return
  const q = questions.value[idx.value]
  if (+val === q.reponse) enregistrerBon(q)
  else enregistrerMauvais(q, +val)
}

function passer() {
  const q = questions.value[idx.value]
  q._resultat = false
  erreurs.value.push(q)
  mauvaises.value++
  suivant()
}

function enregistrerBon(q) {
  q._resultat = true
  inputClass.value = 'ok'
  feedback.value = ['Bravo ! 🎉', 'Parfait ! ⭐', 'Excellent ! 👏', 'Super ! 🌟'][aleatoire(0,3)]
  feedbackClass.value = 'ok'
  bonnes.value++
  if (config.value.mode === 'chrono') {
    setTimeout(() => { suivantChrono() }, 400)
  } else {
    setTimeout(suivant, 700)
  }
}

function enregistrerMauvais(q, val) {
  q._resultat = false
  inputClass.value = 'erreur'
  feedback.value = `❌ ${q.a} × ${q.b} = ${q.reponse}`
  feedbackClass.value = 'erreur'
  mauvaises.value++
  if (!erreurs.value.find(e => e.texte === q.texte)) erreurs.value.push(q)
  if (config.value.mode === 'chrono') {
    setTimeout(() => { suivantChrono() }, 600)
  } else {
    setTimeout(suivant, 1000)
  }
}

function suivant() {
  idx.value++
  if (idx.value >= questions.value.length) {
    finEntrainementOuAleatoire()
  } else {
    afficherQuestion()
  }
}

function suivantChrono() {
  // En chrono, on boucle sur un pool infini
  const pool = genererQuestions(config.value.tables, config.value.jusqu, null, 'aleatoire')
  questions.value = [...questions.value, ...pool]
  idx.value++
  afficherQuestion()
}

function finEntrainementOuAleatoire() {
  if (config.value.mode === 'entrainement') {
    // Passer à la table suivante ou terminer
    tableIdx.value++
    if (tableIdx.value < config.value.tables.length) {
      tableActuelle.value = config.value.tables[tableIdx.value]
      phase.value = 'apprendre'
    } else {
      phase.value = 'resultats'
    }
  } else {
    phase.value = 'resultats'
  }
}

function rejouerErreurs() {
  const liste = melanger(erreurs.value.map(e => ({ ...e, _resultat: undefined })))
  erreurs.value = []
  questions.value = liste
  idx.value = 0; bonnes.value = 0; mauvaises.value = 0
  phase.value = 'jeu'
  nextTick(() => afficherQuestion())
}

// ── Messages résultats
const resultMsg = computed(() => {
  const pct = bonnes.value / questions.value.length * 100
  if (pct === 100) { confettis(50); return 'Parfait, sans faute ! 🏆' }
  if (pct >= 80)   { confettis(25); return 'Très bien ! Continue comme ça 🌟' }
  if (pct >= 60)   return 'Bien ! Revois les erreurs et recommence 💪'
  return 'Continue à t\'entraîner ! 📚'
})

const resultMsgChrono = computed(() => {
  if (bonnes.value >= 50) { confettis(50); return '🏆 Impressionnant !' }
  if (bonnes.value >= 30) { confettis(25); return '🌟 Excellent !' }
  if (bonnes.value >= 20) return '💪 Très bien !'
  return '📚 Continue à t\'entraîner !'
})

onUnmounted(() => clearInterval(timerInterval))
</script>

<style scoped>
.mode-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: .75rem;
}
@media (max-width: 560px) { .mode-cards { grid-template-columns: 1fr; } }

.mode-card {
  border: 3px solid var(--gris-brd); border-radius: var(--radius);
  padding: 1rem; cursor: pointer; transition: all .15s; text-align: center;
  background: white; font-family: inherit; width: 100%;
}
.mode-card:hover  { border-color: var(--bleu); }
.mode-card:focus-visible { outline: 3px solid var(--bleu); outline-offset: 2px; }
.mode-card.active { border-color: var(--bleu); background: #eef5ff; }
.mode-icon  { font-size: 2rem; }
.mode-title { font-weight: 800; font-size: 1rem; margin: .3rem 0 .2rem; }
.mode-desc  { font-size: .8rem; color: #666; }

/* Table d'apprentissage */
.table-title {
  font-size: 1.8rem; font-weight: 900; color: var(--bleu);
  margin-bottom: 1.25rem;
}
.table-grid {
  display: inline-grid;
  grid-template-columns: auto auto auto;
  gap: .3rem 1rem;
  text-align: right;
  margin: 0 auto;
}
.table-row { display: contents; }
.table-cell-a  { font-size: 1.3rem; font-weight: 700; text-align: right; }
.table-cell-eq { font-size: 1.3rem; color: #aaa; text-align: center; }
.table-cell-r  { font-size: 1.3rem; font-weight: 900; color: var(--bleu); text-align: left; }

/* Erreurs */
.erreurs-box {
  background: #fef0f0; border-radius: 8px;
  padding: 1rem; margin: 1rem 0; text-align: left;
}
.erreurs-grid {
  display: flex; flex-wrap: wrap; gap: .5rem;
}
.erreur-item {
  background: white; border-radius: 6px;
  padding: .35rem .75rem; border: 2px solid var(--rouge);
  font-weight: 700; font-size: .95rem;
  display: flex; align-items: center; gap: .4rem;
}
.erreur-question { color: var(--texte); }
.erreur-reponse  { color: var(--bleu); }

.urgent { background: var(--rouge) !important; }
</style>
