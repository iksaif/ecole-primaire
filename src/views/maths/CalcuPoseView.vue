<template>
  <div class="container">
    <h1 class="section-heading">📐 {{ t('titre') }}</h1>

    <!-- Config -->
    <div v-if="phase === 'config'" class="config-box">
      <div class="config-section">
        <div class="config-section-title">{{ t('operation') }}</div>
        <div class="btn-group">
          <button class="level-btn" :class="{ active: config.op === 'add' }" @click="config.op = 'add'">+ {{ t('addition') }}</button>
          <button class="level-btn" :class="{ active: config.op === 'sou' }" @click="config.op = 'sou'">− {{ t('soustraction') }}</button>
          <button class="level-btn" :class="{ active: config.op === 'mix' }" @click="config.op = 'mix'">{{ t('melange') }}</button>
        </div>
      </div>

      <div class="config-section">
        <div class="config-section-title">{{ t('taille') }}</div>
        <div class="btn-group">
          <button class="level-btn" :class="{ active: config.taille === '1' }" @click="config.taille = '1'">{{ t('chiffre1') }} (GS/CP)</button>
          <button class="level-btn" :class="{ active: config.taille === '2' }" @click="config.taille = '2'">{{ t('chiffres', { n: 2 }) }} (CP)</button>
          <button class="level-btn" :class="{ active: config.taille === '3' }" @click="config.taille = '3'">{{ t('chiffres', { n: 3 }) }} (CE)</button>
          <button class="level-btn" :class="{ active: config.taille === '4' }" @click="config.taille = '4'">{{ t('chiffres', { n: 4 }) }} (CM)</button>
        </div>
      </div>

      <div class="config-section" v-if="config.taille !== '1'">
        <div class="config-section-title">{{ t('retenue') }}</div>
        <div class="btn-group">
          <button class="level-btn" :class="{ active: config.retenue === 'non' }" @click="config.retenue = 'non'">{{ t('sansRetenue') }}</button>
          <button class="level-btn" :class="{ active: config.retenue === 'oui' }" @click="config.retenue = 'oui'">{{ t('avecRetenue') }}</button>
          <button class="level-btn" :class="{ active: config.retenue === 'mix' }" @click="config.retenue = 'mix'">{{ t('melange') }}</button>
        </div>
      </div>

      <div class="config-section">
        <div class="config-section-title">{{ t('nbExercices') }}</div>
        <div class="btn-group">
          <button v-for="n in [3,5,10,20]" :key="n"
            class="level-btn" :class="{ active: config.nbQ === n }"
            @click="config.nbQ = n">{{ n }}</button>
        </div>
      </div>

      <div style="text-align:center;margin-top:1.5rem;">
        <button class="btn btn-primary" style="font-size:1.1rem;" @click="demarrer">{{ t('commencer') }}</button>
      </div>
      <div style="text-align:center;margin-top:.75rem;">
        <button class="btn btn-ghost" style="font-size:.95rem;" @click="imprimerFiche">{{ t('imprimerFiche') }}</button>
      </div>
    </div>

    <!-- Exercice -->
    <template v-if="phase === 'jeu'">
      <div class="score-bar">
        <button class="btn-quitter" @click="quitter" :title="t('quitterTitre')">{{ t('quitter') }}</button>
        <span>{{ t('exercice', { n: idx + 1, total: questions.length }) }}</span>
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
          <button class="btn btn-ghost" @click="passer">{{ t('passer') }}</button>
          <button class="btn btn-primary" @click="valider">{{ t('valider') }}</button>
        </div>
      </div>
    </template>

    <!-- Résultats -->
    <div v-if="phase === 'resultats'" class="exercise-box" style="text-align:center;">
      <div class="result-score">{{ bonnes }} / {{ questions.length }}</div>
      <div class="result-msg">{{ resultMsg }}</div>

      <table class="correction-table">
        <thead><tr><th>{{ t('colCalcul') }}</th><th>{{ t('taReponse') }}</th><th>{{ t('bonneReponse') }}</th><th></th></tr></thead>
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
        <button class="btn btn-primary" @click="demarrer">{{ t('rejouer') }}</button>
        <button class="btn btn-ghost"   @click="phase = 'config'">{{ t('parametres') }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, watch, onUnmounted } from 'vue'
import { aleatoire, confettis, sauvegarder, charger } from '../../utils'
import { useI18n } from '../../i18n'

const { t, langue } = useI18n({
  fr: {
    titre: 'Calcul posé',
    operation: 'Opération',
    addition: 'Addition', soustraction: 'Soustraction', melange: 'Mélangé',
    additions: 'Additions', soustractions: 'Soustractions',
    taille: 'Taille des nombres',
    chiffre1: '1 chiffre', chiffres: '{n} chiffres',
    retenue: 'Retenue', sansRetenue: 'Sans retenue', avecRetenue: 'Avec retenue',
    nbExercices: "Nombre d'exercices",
    colCalcul: 'Calcul',
    resultatBas: "Continue à t'entraîner ! 📚",
    pNbExercices: '{n} exercices',
  },
  br: {
    titre: 'Jedadur lakaet', // br: à relire (« calcul posé »)
    operation: 'Oberiadur',
    addition: 'Sammadenn', soustraction: 'Lamadenn', melange: 'Kemmesket',
    additions: 'Sammadennoù', soustractions: 'Lamadennoù',
    taille: 'Ment an niveroù',
    chiffre1: '1 sifr', chiffres: '{n} sifr',
    retenue: "Dalc'h", sansRetenue: "Hep dalc'h", avecRetenue: "Gant dalc'h", // br: à relire (« dalc'h » = retenue)
    nbExercices: 'Niver a boelladennoù',
    colCalcul: 'Jedadur',
    resultatBas: "Kendalc'h da embreger ! 📚",
    pNbExercices: '{n} poelladenn',
  },
})

const config = ref(charger('calcul_pose_config', { op: 'add', taille: '2', retenue: 'non', nbQ: 5 }))
watch(config, v => sauvegarder('calcul_pose_config', v), { deep: true })
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

// Verrou : empêche une double validation (Entrée répétée) de compter deux fois
let verrou = false
let timeoutSuivant = null

function nettoyer() {
  clearTimeout(timeoutSuivant)
  timeoutSuivant = null
  verrou = false
}

function quitter() {
  nettoyer()
  phase.value = 'config'
}

onUnmounted(nettoyer)

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

  const lo = Math.floor(max / 10)
  let a, b
  if (op === 'add') {
    if (avecRetenue) {
      // Génère deux nombres dont l'addition nécessite une retenue sur au moins un rang
      do {
        // a ≤ max − lo pour que b ∈ [lo, max − a] soit non vide (sinon résultat à cols+1 chiffres)
        a = aleatoire(lo, max - lo)
        b = aleatoire(lo, max - a)
      } while (!aRetenue(a, b, 'add'))
    } else {
      do {
        // a ≤ max − lo pour que b ∈ [lo, max − a] soit non vide (sinon résultat à cols+1 chiffres)
        a = aleatoire(lo, max - lo)
        b = aleatoire(lo, max - a)
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

function genererSansRepetition(nb) {
  const vus = new Set()
  const result = []
  let essais = 0
  while (result.length < nb && essais < nb * 50) {
    essais++
    const q = generer()
    const cle = `${q.a}${q.opLabel}${q.b}`
    if (!vus.has(cle)) { vus.add(cle); result.push(q) }
  }
  return result
}

function demarrer() {
  nettoyer()
  questions.value = genererSansRepetition(config.value.nbQ)
  idx.value = 0; bonnes.value = 0; mauvaises.value = 0; historique.value = []
  phase.value = 'jeu'
  nextTick(initInputs)
}

function imprimerFiche() {
  const qs = genererSansRepetition(config.value.nbQ)
  const tailles = { '1': 'GS / CP', '2': 'CP', '3': 'CE', '4': 'CM' }
  const niveau = tailles[config.value.taille] || ''
  const opLabel = t(config.value.op === 'add' ? 'additions' : config.value.op === 'sou' ? 'soustractions' : 'melange')

  const cards = qs.map(q => {
    const cols = q.cols
    const cell = (ch) => `<td style="width:2.2rem;text-align:center;font-size:1.5rem;font-weight:800;font-family:monospace;">${ch.trim() || '&nbsp;'}</td>`
    const rowA = q.chiffresA.map(cell).join('')
    const rowB = q.chiffresB.map(cell).join('')
    const rowR = q.chiffresR.map(() => `<td style="width:2.2rem;text-align:center;font-size:1.5rem;font-weight:800;border-bottom:2px solid #333;">&nbsp;</td>`).join('')
    const signCell = `<td style="width:1.8rem;text-align:center;font-size:1.5rem;font-weight:900;color:#1a5fb4;vertical-align:middle;">`
    return `<div style="display:inline-block;margin:1rem 1.5rem;vertical-align:top;">
      <table style="border-collapse:collapse;">
        <tr>${signCell}&nbsp;</td>${rowA}</tr>
        <tr>${signCell}${q.opLabel}</td>${rowB}</tr>
        <tr><td colspan="${cols + 1}" style="padding:0;"><hr style="border:none;border-top:2.5px solid #222;margin:4px 0;"/></td></tr>
        <tr>${signCell}&nbsp;</td>${rowR}</tr>
      </table>
    </div>`
  }).join('')

  const html = `<!DOCTYPE html><html lang="${langue.value}"><head>
    <meta charset="UTF-8"><title>${t('titre')} — ${niveau}</title>
    <style>
      body { font-family: Arial, sans-serif; max-width: 720px; margin: 1.5cm auto; color: #222; }
      h1 { font-size: 1.25rem; border-bottom: 2px solid #333; padding-bottom: .4rem; margin-bottom: .5rem; }
      .entete { font-size: .85rem; color: #666; margin-bottom: 1.5rem; }
    </style></head><body>
    <h1>${t('titre')} — ${niveau}</h1>
    <p class="entete">${opLabel} &nbsp;|&nbsp; ${t('pNbExercices', { n: qs.length })} &nbsp;&nbsp;&nbsp; ${t('nom')} : ________________________________ &nbsp; ${t('date')} : ______________</p>
    <div style="text-align:center;">${cards}</div>
    <script>window.onafterprint = function() { window.close(); }; window.print();<\/script>
  </body></html>`

  const w = window.open('', '_blank')
  if (!w) return
  w.document.write(html)
  w.document.close()
}

function initInputs() {
  const cols = questions.value[idx.value]?.cols || 0
  repInputs.value = Array(cols).fill('')
  etats.value = Array(cols).fill('')
  feedback.value = ''; feedbackClass.value = ''
  inputRefs.value = []
  nextTick(() => {
    inputRefs.value[0]?.focus()
  })
}

function onInput(e, ci) {
  const v = e.target.value.replace(/\D/g, '')
  repInputs.value[ci] = v.slice(-1)
  if (v) {
    // Avancer vers la droite
    const next = ci + 1
    if (next < repInputs.value.length) nextTick(() => inputRefs.value[next]?.focus())
  }
}

function onKeydown(e, ci) {
  if (e.key === 'Backspace' && !repInputs.value[ci]) {
    const prev = ci - 1
    if (prev >= 0) nextTick(() => inputRefs.value[prev]?.focus())
  }
  if (e.key === 'Enter') valider()
  if (e.key === 'ArrowLeft' && ci > 0)
    nextTick(() => inputRefs.value[ci - 1]?.focus())
  if (e.key === 'ArrowRight' && ci < repInputs.value.length - 1)
    nextTick(() => inputRefs.value[ci + 1]?.focus())
}

function valider() {
  const q = questions.value[idx.value]
  const attendu = String(q.reponse)
  const donne   = repInputs.value.join('').replace(/\s/g, '')
  if (!donne || verrou || phase.value !== 'jeu') return
  verrou = true

  const ok = donne === attendu
  // Colorier chiffre par chiffre
  const attChiffres = String(q.reponse).padStart(q.cols, '0').split('')
  const donnChiffres = donne.padStart(q.cols, '0').split('')
  etats.value = attChiffres.map((c, i) => donnChiffres[i] === c ? 'ok' : 'erreur')

  if (ok) {
    const bravos = t('bravo')
    feedback.value = bravos[aleatoire(0, bravos.length - 1)]
    feedbackClass.value = 'ok'
    bonnes.value++
  } else {
    feedback.value = '❌ ' + t('laBonneReponse', { r: q.reponse })
    feedbackClass.value = 'erreur'
    mauvaises.value++
  }

  historique.value.push({ a: q.a, b: q.b, opLabel: q.opLabel, attendu, donne, ok })
  timeoutSuivant = setTimeout(suivant, ok ? 900 : 1400)
}

function passer() {
  if (verrou || phase.value !== 'jeu') return
  verrou = true
  const q = questions.value[idx.value]
  historique.value.push({ a: q.a, b: q.b, opLabel: q.opLabel,
                          attendu: String(q.reponse), donne: t('passe'), ok: false })
  mauvaises.value++
  suivant()
}

function suivant() {
  clearTimeout(timeoutSuivant)
  timeoutSuivant = null
  if (phase.value !== 'jeu') return
  verrou = false
  idx.value++
  if (idx.value >= questions.value.length) phase.value = 'resultats'
  else nextTick(initInputs)
}

const resultMsg = computed(() => {
  const pct = bonnes.value / questions.value.length * 100
  if (pct === 100) { confettis(50); return t('resultat100') }
  if (pct >= 80)   { confettis(25); return t('resultat80') }
  if (pct >= 60)   return t('resultat60')
  return t('resultatBas')
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
