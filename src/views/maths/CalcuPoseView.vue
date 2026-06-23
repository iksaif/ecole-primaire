<template>
  <div class="container">
    <h1 class="section-heading">📐 Calcul posé</h1>

    <!-- Config -->
    <div v-if="phase === 'config'" class="config-box">
      <div class="config-section">
        <div class="config-section-title">Opération</div>
        <div class="btn-group">
          <button class="level-btn" :class="{ active: config.op === 'add' }" @click="config.op = 'add'">+ Addition</button>
          <button class="level-btn" :class="{ active: config.op === 'sou' }" @click="config.op = 'sou'">− Soustraction</button>
          <button class="level-btn" :class="{ active: config.op === 'mix' }" @click="config.op = 'mix'">Mélangé</button>
        </div>
      </div>

      <div class="config-section">
        <div class="config-section-title">Taille des nombres</div>
        <div class="btn-group">
          <button class="level-btn" :class="{ active: config.taille === '1' }" @click="config.taille = '1'">1 chiffre (GS/CP)</button>
          <button class="level-btn" :class="{ active: config.taille === '2' }" @click="config.taille = '2'">2 chiffres (CP)</button>
          <button class="level-btn" :class="{ active: config.taille === '3' }" @click="config.taille = '3'">3 chiffres (CE)</button>
          <button class="level-btn" :class="{ active: config.taille === '4' }" @click="config.taille = '4'">4 chiffres (CM)</button>
        </div>
      </div>

      <div class="config-section" v-if="config.taille !== '1'">
        <div class="config-section-title">Retenue</div>
        <div class="btn-group">
          <button class="level-btn" :class="{ active: config.retenue === 'non' }" @click="config.retenue = 'non'">Sans retenue</button>
          <button class="level-btn" :class="{ active: config.retenue === 'oui' }" @click="config.retenue = 'oui'">Avec retenue</button>
          <button class="level-btn" :class="{ active: config.retenue === 'mix' }" @click="config.retenue = 'mix'">Mélangé</button>
        </div>
      </div>

      <div class="config-section">
        <div class="config-section-title">Nombre d'exercices</div>
        <div class="btn-group">
          <button v-for="n in [3,5,10]" :key="n"
            class="level-btn" :class="{ active: config.nbQ === n }"
            @click="config.nbQ = n">{{ n }}</button>
        </div>
      </div>

      <div style="text-align:center;margin-top:1.5rem;">
        <button class="btn btn-primary" style="font-size:1.1rem;" @click="demarrer">▶ Commencer</button>
      </div>
    </div>

    <!-- Exercice -->
    <template v-if="phase === 'jeu'">
      <div class="score-bar">
        <span>Exercice {{ idx + 1 }} / {{ questions.length }}</span>
        <span>✅ {{ bonnes }} &nbsp; ❌ {{ mauvaises }}</span>
      </div>

      <div class="exercise-box">
        <!-- Colonne de calcul posé -->
        <div class="pose-container">
          <div class="pose-op-label">{{ questions[idx].opLabel }}</div>
          <div class="pose-grid">
            <!-- Ligne A -->
            <div class="pose-row">
              <span class="pose-sign"></span>
              <span v-for="(d, i) in questions[idx].chiffresA" :key="'a'+i" class="pose-cell pose-number">{{ d }}</span>
            </div>
            <!-- Ligne B -->
            <div class="pose-row">
              <span class="pose-sign">{{ questions[idx].opLabel }}</span>
              <span v-for="(d, i) in questions[idx].chiffresB" :key="'b'+i" class="pose-cell pose-number">{{ d }}</span>
            </div>
            <!-- Séparateur -->
            <div class="pose-separator" :style="{ 'grid-column': `1 / span ${questions[idx].cols + 1}` }"></div>
            <!-- Inputs réponse -->
            <div class="pose-row">
              <span class="pose-sign"></span>
              <input
                v-for="(_, ci) in questions[idx].chiffresR"
                :key="'r'+ci"
                :ref="el => setInputRef(el, ci)"
                v-model="repInputs[ci]"
                class="pose-input"
                :class="{ ok: etats[ci] === 'ok', erreur: etats[ci] === 'erreur' }"
                type="text" inputmode="numeric" maxlength="1"
                @input="onInput($event, ci)"
                @keydown="onKeydown($event, ci)"
              >
            </div>
          </div>

          <!-- Retenues (visualisation optionnelle) -->
          <div v-if="showReports" class="reports-row">
            <span v-for="(r, i) in reports" :key="i" class="report-cell">{{ r || '' }}</span>
          </div>
        </div>

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

      <table class="correction-table">
        <thead><tr><th>Calcul</th><th>Ta réponse</th><th>Bonne réponse</th><th></th></tr></thead>
        <tbody>
          <tr v-for="(h, i) in historique" :key="i" :class="h.ok ? 'ok' : 'erreur'">
            <td>{{ h.a }} {{ h.opLabel }} {{ h.b }}</td>
            <td>{{ h.donne }}</td>
            <td class="mot-attendu">{{ h.attendu }}</td>
            <td>{{ h.ok ? '✅' : '❌' }}</td>
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
import { ref, computed, nextTick } from 'vue'
import { aleatoire, confettis } from '../../utils'

const config = ref({ op: 'add', taille: '2', retenue: 'non', nbQ: 5 })
const phase = ref('config')
const questions = ref([])
const idx = ref(0)
const bonnes = ref(0)
const mauvaises = ref(0)
const historique = ref([])
const repInputs = ref([])
const etats = ref([])
const feedback = ref('')
const feedbackClass = ref('')
const showReports = ref(false)
const reports = ref([])
const inputRefs = ref([])

function setInputRef(el, ci) {
  if (el) inputRefs.value[ci] = el
}

function maxVal() {
  return Math.pow(10, +config.value.taille) - 1
}

function generer() {
  const op = config.value.op === 'mix'
    ? (Math.random() > 0.5 ? 'add' : 'sou')
    : config.value.op

  // ── 1 chiffre : cas simple, pas de retenue
  if (config.value.taille === '1') {
    let a, b
    if (op === 'add') {
      a = aleatoire(1, 9); b = aleatoire(1, 9 - a)
    } else {
      a = aleatoire(2, 9); b = aleatoire(1, a)
    }
    const res = op === 'add' ? a + b : a - b
    const cols = String(res).length  // peut être 1 ou 2 (ex: 5+8=13)
    return {
      a, b, op, opLabel: op === 'add' ? '+' : '−', reponse: res, cols,
      chiffresA: padChiffres(a, cols), chiffresB: padChiffres(b, cols),
      chiffresR: padChiffres(res, cols),
    }
  }

  const max = maxVal()
  const avecRetenue = config.value.retenue === 'oui'
                    || (config.value.retenue === 'mix' && Math.random() > 0.5)

  let a, b
  if (op === 'add') {
    if (avecRetenue) {
      // Génère deux nombres dont l'addition nécessite une retenue sur au moins un rang
      do {
        a = aleatoire(Math.floor(max / 10), max)
        b = aleatoire(Math.floor(max / 10), max - a)
      } while (!aRetenue(a, b, 'add'))
    } else {
      do {
        a = aleatoire(Math.floor(max / 10), max)
        b = aleatoire(Math.floor(max / 10), max - a)
      } while (aRetenue(a, b, 'add'))
    }
  } else {
    // Soustraction : a >= b >= 0, résultat positif
    if (avecRetenue) {
      do {
        a = aleatoire(Math.floor(max / 2), max)
        b = aleatoire(1, a)
      } while (!aRetenue(a, b, 'sou'))
    } else {
      do {
        a = aleatoire(Math.floor(max / 2), max)
        b = aleatoire(1, a)
      } while (aRetenue(a, b, 'sou'))
    }
  }

  const res = op === 'add' ? a + b : a - b
  const cols = +config.value.taille
  return {
    a, b, op,
    opLabel: op === 'add' ? '+' : '−',
    reponse: res,
    cols,
    chiffresA: padChiffres(a, cols),
    chiffresB: padChiffres(b, cols),
    chiffresR: padChiffres(res, cols),
  }
}

function aRetenue(a, b, op) {
  const sA = String(a).split('').map(Number).reverse()
  const sB = String(b).split('').map(Number).reverse()
  const len = Math.max(sA.length, sB.length)
  let carry = 0
  for (let i = 0; i < len; i++) {
    const da = sA[i] || 0, db = sB[i] || 0
    if (op === 'add') {
      const s = da + db + carry
      carry = Math.floor(s / 10)
      if (carry) return true
    } else {
      let d = da - db - carry
      carry = d < 0 ? 1 : 0
      if (carry) return true
    }
  }
  return false
}

function padChiffres(n, len) {
  return String(n).padStart(len, ' ').split('')
}

function demarrer() {
  questions.value = Array.from({ length: config.value.nbQ }, generer)
  idx.value = 0; bonnes.value = 0; mauvaises.value = 0; historique.value = []
  phase.value = 'jeu'
  nextTick(initInputs)
}

function initInputs() {
  const cols = questions.value[idx.value]?.cols || 0
  repInputs.value = Array(cols).fill('')
  etats.value = Array(cols).fill('')
  feedback.value = ''; feedbackClass.value = ''
  inputRefs.value = []
  nextTick(() => {
    // Focus on rightmost (units) cell
    inputRefs.value[cols - 1]?.focus()
  })
}

function onInput(e, ci) {
  const v = e.target.value.replace(/\D/g, '')
  repInputs.value[ci] = v.slice(-1) // garde 1 chiffre max
  if (v) {
    // Déplacer vers la gauche
    const prev = ci - 1
    if (prev >= 0) nextTick(() => inputRefs.value[prev]?.focus())
  }
}

function onKeydown(e, ci) {
  if (e.key === 'Backspace' && !repInputs.value[ci]) {
    const next = ci + 1
    if (next < repInputs.value.length) nextTick(() => inputRefs.value[next]?.focus())
  }
  if (e.key === 'Enter') valider()
  if (e.key === 'ArrowLeft' && ci > 0)       nextTick(() => inputRefs.value[ci - 1]?.focus())
  if (e.key === 'ArrowRight' && ci < repInputs.value.length - 1)
    nextTick(() => inputRefs.value[ci + 1]?.focus())
}

function valider() {
  const q = questions.value[idx.value]
  const attendu = String(q.reponse)
  const donne   = repInputs.value.join('').replace(/\s/g, '')
  if (!donne) return

  const ok = donne === attendu
  // Colorier chiffre par chiffre
  const attChiffres = String(q.reponse).padStart(q.cols, '0').split('')
  const donnChiffres = donne.padStart(q.cols, '0').split('')
  etats.value = attChiffres.map((c, i) => donnChiffres[i] === c ? 'ok' : 'erreur')

  if (ok) {
    feedback.value = ['Bravo ! 🎉', 'Parfait ! ⭐', 'Excellent ! 👏'][aleatoire(0,2)]
    feedbackClass.value = 'ok'
    bonnes.value++
  } else {
    feedback.value = `❌ La bonne réponse était ${q.reponse}`
    feedbackClass.value = 'erreur'
    mauvaises.value++
  }

  historique.value.push({ a: q.a, b: q.b, opLabel: q.opLabel, attendu, donne, ok })
  setTimeout(suivant, ok ? 900 : 1400)
}

function passer() {
  const q = questions.value[idx.value]
  historique.value.push({ a: q.a, b: q.b, opLabel: q.opLabel,
                          attendu: String(q.reponse), donne: '(passé)', ok: false })
  mauvaises.value++
  suivant()
}

function suivant() {
  idx.value++
  if (idx.value >= questions.value.length) phase.value = 'resultats'
  else nextTick(initInputs)
}

const resultMsg = computed(() => {
  const pct = bonnes.value / questions.value.length * 100
  if (pct === 100) { confettis(50); return 'Parfait, sans faute ! 🏆' }
  if (pct >= 80)   { confettis(25); return 'Très bien ! Continue comme ça 🌟' }
  if (pct >= 60)   return 'Bien ! Tu peux encore progresser 💪'
  return 'Continue à t\'entraîner ! 📚'
})
</script>

<style scoped>
.pose-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 1.5rem 0;
}

.pose-op-label { display: none; }

.pose-grid {
  display: inline-grid;
  row-gap: .4rem;
  column-gap: 0;
}

.pose-row {
  display: contents;
}

.pose-sign {
  font-size: 2rem;
  font-weight: 900;
  text-align: center;
  padding: 0 .5rem;
  color: var(--bleu);
  line-height: 1;
}

.pose-cell {
  width: 2.4rem;
  text-align: center;
}

.pose-number {
  font-size: 2rem;
  font-weight: 800;
  line-height: 1.2;
}

.pose-separator {
  height: 3px;
  background: var(--texte);
  border-radius: 2px;
  margin: .3rem 0;
}

.pose-input {
  width: 2.4rem;
  height: 2.8rem;
  font-size: 1.8rem;
  font-weight: 800;
  text-align: center;
  border: 2px solid var(--gris-brd);
  border-radius: 6px;
  outline: none;
  transition: border-color .15s, background .15s;
  background: white;
  padding: 0;
}
.pose-input:focus   { border-color: var(--bleu); box-shadow: 0 0 0 3px rgba(74,144,226,.15); }
.pose-input.ok      { border-color: var(--vert); background: #f0faf0; }
.pose-input.erreur  { border-color: var(--rouge); background: #fef0f0; }

.reports-row {
  display: flex;
  gap: 0;
  font-size: .8rem;
  color: #e74c3c;
  font-weight: 800;
  margin-top: .25rem;
}
.report-cell { width: 2.4rem; text-align: center; }
</style>
