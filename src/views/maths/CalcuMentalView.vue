<template>
  <div class="container">
    <h1 class="section-heading">🧮 Calcul mental</h1>

    <!-- Config -->
    <div v-if="phase === 'config'" class="config-box">
      <div class="config-section">
        <div class="config-section-title">Niveau</div>
        <div class="btn-group">
          <button v-for="niv in niveaux" :key="niv"
            class="level-btn" :class="{ active: config.niveau === niv }"
            @click="config.niveau = niv">{{ niv.toUpperCase() }}</button>
        </div>
      </div>

      <div class="config-section">
        <div class="config-section-title">Opérations</div>
        <div class="btn-group">
          <button v-for="op in TOUTES_OPS" :key="op"
            class="level-btn" :class="{ active: config.ops.includes(op) }"
            @click="toggleOp(op)">{{ op }}</button>
        </div>
      </div>

      <div class="config-section">
        <div class="config-section-title">Nombre de questions</div>
        <div class="btn-group">
          <button v-for="n in [5,10,20]" :key="n"
            class="level-btn" :class="{ active: config.nbQ === n }"
            @click="config.nbQ = n">{{ n }}</button>
        </div>
      </div>

      <div class="config-section">
        <div class="config-section-title">Temps par question</div>
        <div class="btn-group">
          <button v-for="t in [0,10,20,30]" :key="t"
            class="level-btn" :class="{ active: config.temps === t }"
            @click="config.temps = t">{{ t === 0 ? 'Sans limite' : t + ' s' }}</button>
        </div>
      </div>

      <div style="text-align:center;margin-top:1.5rem;">
        <button class="btn btn-primary" style="font-size:1.1rem;" @click="demarrer">▶ Commencer</button>
      </div>
    </div>

    <!-- Exercice -->
    <template v-if="phase === 'jeu'">
      <div class="score-bar">
        <span>Question {{ idx + 1 }} / {{ questions.length }}</span>
        <span>✅ {{ bonnes }} &nbsp; ❌ {{ mauvaises }}</span>
        <span v-if="config.temps > 0" style="font-weight:700;">⏱ {{ Math.ceil(tempsRestant) }}s</span>
      </div>

      <div class="exercise-box">
        <div v-if="config.temps > 0" class="timer-bar">
          <div class="timer-fill" :class="{ urgent: tempsRestant / config.temps < 0.3 }"
               :style="{ width: (tempsRestant / config.temps * 100) + '%' }"></div>
        </div>

        <div class="exercise-question">{{ questions[idx].texte }}</div>

        <input ref="inputEl" class="exercise-input" :class="inputClass"
               type="number" inputmode="numeric" placeholder="?"
               v-model="reponse" autocomplete="off" @keydown.enter="valider">

        <div class="feedback" :class="feedbackClass">{{ feedback }}</div>

        <div class="btn-group" style="justify-content:center;margin-top:1rem;">
          <button class="btn btn-ghost" @click="passer">Passer ⏭</button>
          <button class="btn btn-primary" @click="valider">Valider ✔</button>
        </div>
      </div>
    </template>

    <!-- Résultats -->
    <div v-if="phase === 'resultats'" class="exercise-box" style="text-align:center;">
      <div class="result-score">{{ bonnes }} / {{ questions.length }}</div>
      <div class="result-msg">{{ resultMsg }}</div>

      <div style="max-height:240px;overflow-y:auto;text-align:left;border:2px solid var(--gris-brd);border-radius:8px;padding:.5rem;margin:1rem 0;">
        <div v-for="(h, i) in historique" :key="i"
             :class="['hist-item', h.ok ? 'ok' : 'erreur']">
          <span>{{ h.texte.replace('?', h.ok ? '✓' : h.donne ?? '—') }}</span>
          <span>{{ h.ok ? '✅' : `❌ (réponse : ${h.attendu})` }}</span>
        </div>
      </div>

      <div class="btn-group" style="justify-content:center;">
        <button class="btn btn-primary" @click="demarrer">🔄 Rejouer</button>
        <button class="btn btn-ghost"   @click="phase = 'config'">⚙️ Paramètres</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onUnmounted } from 'vue'
import { aleatoire, melanger, confettis } from '../../utils'

const TOUTES_OPS = ['+', '−', '×', '÷']
const niveaux = ['cp', 'ce1', 'ce2', 'cm1', 'cm2']

const NIVEAUX = {
  cp:  { add: [1,10],  sou: [1,10],  mul: null,    div: null },
  ce1: { add: [1,20],  sou: [1,20],  mul: [2,5],   div: [1,5] },
  ce2: { add: [1,99],  sou: [1,99],  mul: [2,9],   div: [1,9] },
  cm1: { add: [1,999], sou: [1,999], mul: [2,12],  div: [1,12] },
  cm2: { add: [1,999], sou: [1,999], mul: [2,25],  div: [1,25] },
}

const config = ref({ niveau: 'ce2', ops: ['+', '−'], nbQ: 10, temps: 10 })
const phase = ref('config')
const questions = ref([])
const idx = ref(0)
const bonnes = ref(0)
const mauvaises = ref(0)
const historique = ref([])
const reponse = ref('')
const feedback = ref('')
const feedbackClass = ref('')
const inputClass = ref('')
const tempsRestant = ref(0)
const inputEl = ref(null)

let timerInterval = null

function toggleOp(op) {
  const ops = config.value.ops
  if (ops.includes(op)) {
    if (ops.length === 1) return
    config.value.ops = ops.filter(o => o !== op)
  } else {
    config.value.ops = [...ops, op]
  }
}

function genererQuestion() {
  const niv = NIVEAUX[config.value.niveau]
  const opsDispos = config.value.ops.filter(op => {
    if (op === '×' && !niv.mul) return false
    if (op === '÷' && !niv.div) return false
    return true
  })
  const op = opsDispos[aleatoire(0, opsDispos.length - 1)]

  let a, b, rep
  if (op === '+') {
    a = aleatoire(...niv.add); b = aleatoire(...niv.add); rep = a + b
  } else if (op === '−') {
    a = aleatoire(...niv.sou); b = aleatoire(1, a); rep = a - b
  } else if (op === '×') {
    a = aleatoire(...niv.mul); b = aleatoire(...niv.mul); rep = a * b
  } else {
    b = aleatoire(...niv.div); rep = aleatoire(...niv.div); a = b * rep
  }
  return { texte: `${a} ${op} ${b} = ?`, reponse: rep }
}

function demarrer() {
  clearInterval(timerInterval)
  questions.value = Array.from({ length: config.value.nbQ }, genererQuestion)
  idx.value = 0; bonnes.value = 0; mauvaises.value = 0; historique.value = []
  phase.value = 'jeu'
  nextTick(() => afficherQuestion())
}

function afficherQuestion() {
  reponse.value = ''; feedback.value = ''; feedbackClass.value = ''; inputClass.value = ''
  clearInterval(timerInterval)
  if (config.value.temps > 0) {
    tempsRestant.value = config.value.temps
    timerInterval = setInterval(() => {
      tempsRestant.value -= 0.1
      if (tempsRestant.value <= 0) { clearInterval(timerInterval); enregistrerMauvais(true) }
    }, 100)
  }
  nextTick(() => inputEl.value?.focus())
}

function valider() {
  const val = reponse.value.toString().trim()
  if (!val) return
  clearInterval(timerInterval)
  const q = questions.value[idx.value]
  if (+val === q.reponse) enregistrerBon()
  else enregistrerMauvais(false, +val)
}

function passer() {
  clearInterval(timerInterval)
  enregistrerMauvais(true)
}

function enregistrerBon() {
  const q = questions.value[idx.value]
  inputClass.value = 'ok'
  const msgs = ['Bravo ! 🎉', 'Excellent ! ⭐', 'Parfait ! 👏', 'Super ! 🌟']
  feedback.value = msgs[aleatoire(0, msgs.length - 1)]
  feedbackClass.value = 'ok'
  bonnes.value++
  historique.value.push({ texte: q.texte, ok: true, attendu: q.reponse })
  setTimeout(suivant, 800)
}

function enregistrerMauvais(timeout, val) {
  const q = questions.value[idx.value]
  inputClass.value = 'erreur'
  feedback.value = timeout
    ? `⏰ Temps écoulé ! La réponse était ${q.reponse}`
    : `❌ La bonne réponse était ${q.reponse}`
  feedbackClass.value = 'erreur'
  mauvaises.value++
  historique.value.push({ texte: q.texte, ok: false, attendu: q.reponse, donne: val })
  setTimeout(suivant, 1200)
}

function suivant() {
  idx.value++
  if (idx.value >= questions.value.length) afficherResultats()
  else afficherQuestion()
}

const resultMsg = computed(() => {
  const pct = bonnes.value / questions.value.length * 100
  if (pct === 100) { confettis(50); return 'Parfait, sans faute ! 🏆' }
  if (pct >= 80)   { confettis(25); return 'Très bien ! Continue comme ça 🌟' }
  if (pct >= 60)   return 'Bien ! Tu peux encore progresser 💪'
  if (pct >= 40)   return 'Courage, continue à t\'entraîner ! 🤓'
  return 'N\'abandonne pas, pratique encore ! 📚'
})

function afficherResultats() {
  clearInterval(timerInterval)
  phase.value = 'resultats'
}

onUnmounted(() => clearInterval(timerInterval))
</script>

<style scoped>
.hist-item {
  display: flex; justify-content: space-between;
  padding: .3rem .5rem; border-radius: 6px;
  font-size: .9rem;
}
.hist-item.ok     { background: #f0faf0; }
.hist-item.erreur { background: #fef0f0; }
</style>
