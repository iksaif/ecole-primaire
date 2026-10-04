<template>
  <div class="container">
    <h1 class="section-heading">🧮 {{ t('titre') }}</h1>

    <!-- Config -->
    <ConfigExercice v-if="phase === 'config'" :config="config" v-model:mode="mode" :fiche="fiche"
      @commencer="demarrer" @regenerer="regenerer">
      <div class="config-section">
        <div class="config-section-title">{{ t('niveau') }}</div>
        <div class="btn-group">
          <button v-for="niv in niveaux" :key="niv"
            class="level-btn" :class="{ active: config.niveau === niv }"
            @click="config.niveau = niv">{{ niv.toUpperCase() }}</button>
        </div>
      </div>

      <div class="config-section">
        <div class="config-section-title">{{ t('operations') }}</div>
        <div class="btn-group">
          <button v-for="op in TOUTES_OPS" :key="op"
            class="level-btn" :class="{ active: config.ops.includes(op) }"
            :disabled="!opsDisposPourNiveau.includes(op)"
            @click="toggleOp(op)">{{ libelleOp(op) }}</button>
        </div>
      </div>

      <div v-if="mode === 'jouer'" class="config-section">
        <div class="config-section-title">{{ t('nbQuestions') }}</div>
        <div class="btn-group">
          <button v-for="n in [5,10,20]" :key="n"
            class="level-btn" :class="{ active: config.nbQ === n }"
            @click="config.nbQ = n">{{ n }}</button>
        </div>
      </div>

      <template v-else>
        <div class="config-section">
          <div class="config-section-title">{{ t('nbCalculsFiche') }}</div>
          <div class="btn-group">
            <button v-for="n in NB_FICHE" :key="n"
              class="level-btn" :class="{ active: config.nbFiche === n }"
              @click="config.nbFiche = n">{{ n }}</button>
          </div>
        </div>
        <label class="case-corrige"><input type="checkbox" v-model="config.corrige"> {{ t('corrigePage2') }}</label>
      </template>

      <div v-if="mode === 'jouer'" class="config-section">
        <div class="config-section-title">{{ t('tempsParQuestion') }}</div>
        <div class="btn-group">
          <button v-for="s in [0,10,20,30]" :key="s"
            class="level-btn" :class="{ active: config.temps === s }"
            @click="config.temps = s">{{ s === 0 ? t('sansLimite') : s + ' s' }}</button>
        </div>
      </div>

    </ConfigExercice>

    <!-- Exercice -->
    <template v-if="phase === 'jeu'">
      <div class="score-bar">
        <button class="btn-quitter" @click="quitter" :title="t('quitterTitre')">{{ t('quitter') }}</button>
        <span>{{ t('question', { n: idx + 1, total: questions.length }) }}</span>
        <span>✅ {{ bonnes }} &nbsp; ❌ {{ mauvaises }}</span>
        <span v-if="config.temps > 0" style="font-weight:700;">⏱ {{ Math.ceil(tempsRestant) }}s</span>
      </div>

      <div class="exercise-box">
        <div v-if="config.temps > 0" class="timer-bar">
          <div class="timer-fill" :class="{ urgent: tempsRestant / config.temps < 0.3 }"
               :style="{ width: (tempsRestant / config.temps * 100) + '%' }"></div>
        </div>

        <div class="exercise-question" :class="{ long: questions[idx].texte.length > 12 }">{{ questions[idx].texte }}</div>

        <input ref="inputEl" class="exercise-input" :class="inputClass"
               type="number" inputmode="numeric" placeholder="?"
               v-model="reponse" autocomplete="off" @keydown.enter="valider">

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

      <div style="max-height:240px;overflow-y:auto;text-align:left;border:2px solid var(--gris-brd);border-radius:8px;padding:.5rem;margin:1rem 0;">
        <div v-for="(h, i) in historique" :key="i"
             :class="['hist-item', h.ok ? 'ok' : 'erreur']">
          <span>{{ h.texte.replace('?', h.ok ? '✓' : h.donne ?? '—') }}</span>
          <span>{{ h.ok ? '✅' : t('reponseHist', { r: h.attendu }) }}</span>
        </div>
      </div>

      <div class="btn-group" style="justify-content:center;">
        <button class="btn btn-primary" @click="demarrer">{{ t('rejouer') }}</button>
        <button class="btn btn-ghost"   @click="phase = 'config'">{{ t('parametres') }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onUnmounted, watch } from 'vue'
import { aleatoire, melanger, confettis, sauvegarder, charger } from '../../utils'
import { useI18n } from '../../i18n'
import messagesFr from '../../i18n/fr/views/maths/CalcuMentalView.js'
import messagesBr from '../../i18n/br/views/maths/CalcuMentalView.js'
import ConfigExercice from '../../components/ConfigExercice.vue'
import { useModeExercice } from '../../composables/useModeExercice'

const { t, langue } = useI18n({ fr: messagesFr, br: messagesBr })
// Langue du contenu imprimé : celle de l'interface pour les maths
const langueContenu = computed(() => langue.value)

const OP_DIZ = '± dizaines (45 + 30)'
const OP_911 = '± 9 / ± 11'
const OP_PASSAGE = 'Passage de dizaine (47 + 6)'
const OP_VERS_DIZ = 'Vers la dizaine (37 + ? = 40)'
const TOUTES_OPS = ['+', '−', '×', '÷', 'Compléments à 10', 'Compléments à 100', OP_VERS_DIZ, OP_DIZ, OP_911, OP_PASSAGE,
  'Doubles', 'Moitiés', '× 10 / × 100']
const niveaux = ['cp', 'ce1', 'ce2', 'cm1', 'cm2']
// Libellés affichés : clés du catalogue d'interface (les identifiants d'opérations restent ceux de la config
// enregistrée) ; les opérations sans clé (+, −, ± 9 / ± 11…) s'affichent telles quelles
const LIBELLES_OPS = {
  'Compléments à 10': 'op_complements10',
  'Compléments à 100': 'op_complements100',
  [OP_VERS_DIZ]: 'op_versDizaine',
  [OP_DIZ]: 'op_dizaines',
  [OP_PASSAGE]: 'op_passage',
  'Doubles': 'op_doubles',
  'Moitiés': 'op_moities',
}
const libelleOp = op => (LIBELLES_OPS[op] ? t(LIBELLES_OPS[op]) : op)

function plage(min, max, pas = 1) {
  const t = []
  for (let n = min; n <= max; n += pas) t.push(n)
  return t
}

// mul / div : [min, max] (facteurs dans la plage) ou { tables, max } (tables × 1 à max)
// doubles : nombres dont on demande le double (les moitiés portent sur les doubles correspondants)
// c100 : 'dizaines' (30 + ? = 100) ou 'quelconque' (37 + ? = 100)
// x10 : plages des nombres multipliés par 10 et par 100
// strat : borne max des calculs « stratégiques » (± dizaines, ± 9/11, passage et complément à la dizaine)
const NIVEAUX = {
  cp:  { add: [1,10],  sou: [1,10],  mul: null, div: null,
         doubles: plage(1, 10), c100: null, x10: null, strat: null },
  // CE1 : pas de division (hors programme), tables de 2, 3, 4, 5 et 10
  ce1: { add: [1,20],  sou: [1,20],
         mul: { tables: [2, 3, 4, 5, 10], max: 10 }, div: null,
         doubles: [...plage(1, 20), 25, 30, 35, 40, 45, 50], c100: 'dizaines', x10: { x10: [1, 99], x100: [1, 9] },
         strat: 100 },
  // CE2 : tables de 2 à 9, division = « combien de fois » dans les tables
  ce2: { add: [1,99],  sou: [1,99],
         mul: { tables: [2, 3, 4, 5, 6, 7, 8, 9], max: 10 }, div: { tables: [2, 3, 4, 5, 6, 7, 8, 9], max: 10 },
         doubles: [...plage(1, 50), ...plage(60, 100, 10), ...plage(200, 500, 100)], c100: 'quelconque',
         x10: { x10: [1, 999], x100: [1, 99] }, strat: 1000 },
  cm1: { add: [1,999], sou: [1,999], mul: [2,12], div: [1,12],
         doubles: [...plage(1, 100), ...plage(110, 500, 10), ...plage(600, 1000, 100)], c100: 'quelconque',
         x10: { x10: [1, 999], x100: [1, 999] }, strat: 1000 },
  cm2: { add: [1,999], sou: [1,999], mul: [2,25], div: [1,25],
         doubles: [...plage(1, 100), ...plage(110, 500, 10), ...plage(600, 5000, 100)], c100: 'quelconque',
         x10: { x10: [1, 9999], x100: [1, 999] }, strat: 1000 },
}

// Opération → clé de NIVEAUX qui doit être définie pour que l'opération soit proposée
const CLE_OP = { '×': 'mul', '÷': 'div', 'Compléments à 100': 'c100', 'Doubles': 'doubles', 'Moitiés': 'doubles', '× 10 / × 100': 'x10',
  [OP_DIZ]: 'strat', [OP_911]: 'strat', [OP_PASSAGE]: 'strat', [OP_VERS_DIZ]: 'strat' }
function opDispo(niv, op) {
  if (!TOUTES_OPS.includes(op)) return false
  const cle = CLE_OP[op]
  return !cle || !!niv[cle]
}

// Config sauvegardée : on ignore les valeurs inconnues (anciennes versions)
const NB_FICHE = [10, 20, 30, 40]
const DEFAUT = { niveau: 'ce2', ops: ['+', '−'], nbQ: 10, temps: 10, nbFiche: 20, corrige: true }
const sauvegarde = charger('calcul_mental_config', DEFAUT) || DEFAUT
const niveauCharge = niveaux.includes(sauvegarde.niveau) ? sauvegarde.niveau : DEFAUT.niveau
const opsChargees = (Array.isArray(sauvegarde.ops) ? sauvegarde.ops : [])
  .filter(op => opDispo(NIVEAUX[niveauCharge], op))
const config = ref({
  niveau: niveauCharge,
  ops: opsChargees.length ? opsChargees : ['+'],
  nbQ: [5, 10, 20].includes(sauvegarde.nbQ) ? sauvegarde.nbQ : DEFAUT.nbQ,
  nbFiche: NB_FICHE.includes(sauvegarde.nbFiche) ? sauvegarde.nbFiche : DEFAUT.nbFiche,
  corrige: typeof sauvegarde.corrige === 'boolean' ? sauvegarde.corrige : DEFAUT.corrige,
  temps: [0, 10, 20, 30].includes(sauvegarde.temps) ? sauvegarde.temps : DEFAUT.temps,
})
watch(config, v => sauvegarder('calcul_mental_config', v), { deep: true })

const opsDisposPourNiveau = computed(() => {
  const niv = NIVEAUX[config.value.niveau]
  if (!niv) return TOUTES_OPS
  return TOUTES_OPS.filter(op => opDispo(niv, op))
})

watch(() => config.value.niveau, () => {
  const dispos = opsDisposPourNiveau.value
  const nouvellesOps = config.value.ops.filter(op => dispos.includes(op))
  config.value.ops = nouvellesOps.length > 0 ? nouvellesOps : ['+']
})

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
let timeoutSuivant = null
// Verrou : une seule réponse par question (évite qu'une double Entrée compte deux fois)
let repondu = false

function nettoyer() {
  clearInterval(timerInterval); timerInterval = null
  clearTimeout(timeoutSuivant); timeoutSuivant = null
  repondu = false
}

function quitter() {
  nettoyer()
  phase.value = 'config'
}

function toggleOp(op) {
  const ops = config.value.ops
  if (ops.includes(op)) {
    if (ops.length === 1) return
    config.value.ops = ops.filter(o => o !== op)
  } else {
    config.value.ops = [...ops, op]
  }
}

function complement(total, a) {
  const b = total - a
  return Math.random() < 0.5
    ? { texte: `${a} + ? = ${total}`, reponse: b }
    : { texte: `? + ${b} = ${total}`, reponse: a }
}

function genererQuestion() {
  const niv = NIVEAUX[config.value.niveau]
  const opsDispos = config.value.ops.filter(op => opDispo(niv, op))
  if (opsDispos.length === 0) opsDispos.push('+')
  const op = opsDispos[aleatoire(0, opsDispos.length - 1)]

  if (op === 'Compléments à 10') return complement(10, aleatoire(1, 9))

  if (op === 'Compléments à 100') {
    const a = niv.c100 === 'dizaines' ? aleatoire(1, 9) * 10 : aleatoire(1, 99)
    return complement(100, a)
  }

  if (op === OP_VERS_DIZ) {
    // 37 + ? = 40
    let a
    do { a = aleatoire(11, niv.strat - 1) } while (a % 10 === 0)
    const cible = Math.ceil(a / 10) * 10
    return { texte: `${a} + ? = ${cible}`, reponse: cible - a }
  }

  if (op === OP_DIZ) {
    // 45 + 30, 76 − 20 (nombre non rond ± dizaines entières)
    const N = niv.strat
    let a, d
    if (Math.random() < 0.5) {
      do { a = aleatoire(11, N - 11) } while (a % 10 === 0)
      d = aleatoire(1, Math.min(9, Math.floor((N - 1 - a) / 10))) * 10
      return { texte: `${a} + ${d} = ?`, reponse: a + d }
    }
    do { a = aleatoire(21, N - 1) } while (a % 10 === 0)
    d = aleatoire(1, Math.min(9, Math.floor((a - 1) / 10))) * 10
    return { texte: `${a} − ${d} = ?`, reponse: a - d }
  }

  if (op === OP_911) {
    const n = Math.random() < 0.5 ? 9 : 11
    const a = aleatoire(12, niv.strat - 12)
    return Math.random() < 0.5
      ? { texte: `${a} + ${n} = ?`, reponse: a + n }
      : { texte: `${a} − ${n} = ?`, reponse: a - n }
  }

  if (op === OP_PASSAGE) {
    // 47 + 6 (on dépasse la dizaine) ou 53 − 7 (on redescend sous la dizaine)
    const N = niv.strat
    if (Math.random() < 0.5) {
      let a, b
      do { a = aleatoire(12, N - 10); b = aleatoire(2, 9) } while (a % 10 + b < 10 || a % 10 === 0)
      return { texte: `${a} + ${b} = ?`, reponse: a + b }
    }
    let a, b
    do { a = aleatoire(21, N - 1); b = aleatoire(2, 9) } while (a % 10 >= b)
    return { texte: `${a} − ${b} = ?`, reponse: a - b }
  }

  if (op === 'Doubles') {
    const n = niv.doubles[aleatoire(0, niv.doubles.length - 1)]
    return { texte: t('doubleDe', { n }), reponse: n * 2 }
  }

  if (op === 'Moitiés') {
    const n = niv.doubles[aleatoire(0, niv.doubles.length - 1)]
    return { texte: t('moitieDe', { n: n * 2 }), reponse: n }
  }

  if (op === '× 10 / × 100') {
    const fois100 = Math.random() < 0.5
    const n = aleatoire(...(fois100 ? niv.x10.x100 : niv.x10.x10))
    const m = fois100 ? 100 : 10
    return { texte: `${n} × ${m} = ?`, reponse: n * m }
  }

  let a, b, rep
  if (op === '+') {
    a = aleatoire(...niv.add); b = aleatoire(...niv.add); rep = a + b
  } else if (op === '−') {
    a = aleatoire(...niv.sou); b = aleatoire(1, a); rep = a - b
  } else if (op === '×') {
    if (Array.isArray(niv.mul)) {
      a = aleatoire(...niv.mul); b = aleatoire(...niv.mul)
    } else {
      // tables du niveau : un facteur dans les tables, l'autre de 1 à max, ordre aléatoire
      const t = niv.mul.tables[aleatoire(0, niv.mul.tables.length - 1)]
      const f = aleatoire(1, niv.mul.max)
      ;[a, b] = Math.random() < 0.5 ? [t, f] : [f, t]
    }
    rep = a * b
  } else {
    if (Array.isArray(niv.div)) {
      b = aleatoire(...niv.div); rep = aleatoire(...niv.div)
    } else {
      // partages correspondant aux tables : 35 ÷ 5, 18 ÷ 3…
      b = niv.div.tables[aleatoire(0, niv.div.tables.length - 1)]
      rep = aleatoire(1, niv.div.max)
    }
    a = b * rep
  }
  return { texte: `${a} ${op} ${b} = ?`, reponse: rep }
}

function genererSansRepetition(nb) {
  const vus = new Set()
  const result = []
  let essais = 0
  while (result.length < nb && essais < nb * 50) {
    essais++
    const q = genererQuestion()
    if (!vus.has(q.texte)) { vus.add(q.texte); result.push(q) }
  }
  return result
}

function demarrer() {
  nettoyer()
  questions.value = genererSansRepetition(config.value.nbQ)
  idx.value = 0; bonnes.value = 0; mauvaises.value = 0; historique.value = []
  phase.value = 'jeu'
  nextTick(() => afficherQuestion())
}

// Document HTML de la fiche (aperçu + impression gérés par ConfigExercice)
function htmlFiche() {
  const qs = genererSansRepetition(config.value.nbFiche)
  const niv = config.value.niveau.toUpperCase()
  const ops = config.value.ops.map(libelleOp).join(', ')
  const rows = qs.map((q, i) => {
    const isComplement = !q.texte.endsWith(' = ?')
    const calcText = isComplement
      ? q.texte.replace('?', '___')
      : q.texte.replace(' = ?', ' =')
    const ligneStyle = isComplement ? 'border-bottom: none;' : ''
    return `
      <div class="question">
        <span class="num">${i + 1}.</span>
        <span class="calc">${calcText}</span>
        <span class="ligne" style="${ligneStyle}"></span>
      </div>`
  }).join('')

  const html = `<!DOCTYPE html><html lang="${langueContenu.value}"><head>
    <meta charset="UTF-8"><title>${t('titre')} — ${niv}</title>
    <style>
      body { font-family: Arial, sans-serif; max-width: 680px; margin: 1.5cm auto; color: #222; }
      h1 { font-size: 1.25rem; border-bottom: 2px solid #333; padding-bottom: .4rem; margin-bottom: .5rem; }
      .entete { font-size: .85rem; color: #666; margin-bottom: 1.5rem; }
      .question { display: flex; align-items: baseline; gap: .75rem; margin: .85rem 0; }
      .num { min-width: 1.8rem; font-weight: 700; color: #777; font-size: 1rem; }
      .calc { min-width: 180px; font-weight: 800; font-size: 1.3rem; font-family: monospace; }
      .ligne { flex: 1; border-bottom: 1.5px solid #aaa; min-width: 80px; }
      .deux-colonnes { columns: 2; column-gap: 2.5rem; }
      .deux-colonnes .question { break-inside: avoid; margin: .7rem 0; }
      .corrige { break-before: page; }
      .corrige li { margin: .3rem 0; font-family: monospace; font-size: 1.05rem; }
      .corrige ol { columns: 3; }
    </style></head><body>
    <h1>${t('titre')} — ${niv}</h1>
    <p class="entete">${t('pOperations', { ops })} &nbsp;|&nbsp; ${t('pNbQuestions', { n: qs.length })} &nbsp;&nbsp;&nbsp; ${t('nom')} : ________________________________ &nbsp; ${t('date')} : ______________</p>
    <div class="${qs.length > 20 ? 'deux-colonnes' : ''}">${rows}</div>
    ${config.value.corrige ? `<section class="corrige"><h1>${t('corrige')}</h1><ol>${qs.map(q => `<li>${q.texte.replace('?', `<b>${q.reponse}</b>`)}</li>`).join('')}</ol></section>` : ''}
  </body></html>`

  return html
}

const { mode, graine, regenerer } = useModeExercice()
// recalculée quand les réglages changent ou qu'on demande une nouvelle fiche
const fiche = computed(() => {
  if (mode.value !== 'imprimer') return ''
  graine.value
  return htmlFiche()
})


function afficherQuestion() {
  repondu = false
  reponse.value = ''; feedback.value = ''; feedbackClass.value = ''; inputClass.value = ''
  clearInterval(timerInterval)
  if (config.value.temps > 0) {
    tempsRestant.value = config.value.temps
    timerInterval = setInterval(() => {
      tempsRestant.value -= 0.1
      if (tempsRestant.value <= 0) {
        clearInterval(timerInterval)
        if (!repondu && phase.value === 'jeu') { repondu = true; enregistrerMauvais(true) }
      }
    }, 100)
  }
  nextTick(() => inputEl.value?.focus())
}

function valider() {
  const val = reponse.value.toString().trim()
  if (!val || repondu || phase.value !== 'jeu') return
  repondu = true
  clearInterval(timerInterval)
  const q = questions.value[idx.value]
  if (+val === q.reponse) enregistrerBon()
  else enregistrerMauvais(false, +val)
}

function passer() {
  if (repondu || phase.value !== 'jeu') return
  repondu = true
  clearInterval(timerInterval)
  enregistrerMauvais(true)
}

function enregistrerBon() {
  const q = questions.value[idx.value]
  inputClass.value = 'ok'
  const msgs = t('bravo')
  feedback.value = msgs[aleatoire(0, msgs.length - 1)]
  feedbackClass.value = 'ok'
  bonnes.value++
  historique.value.push({ texte: q.texte, ok: true, attendu: q.reponse })
  timeoutSuivant = setTimeout(suivant, 800)
}

function enregistrerMauvais(timeout, val) {
  const q = questions.value[idx.value]
  inputClass.value = 'erreur'
  feedback.value = timeout
    ? t('tempsEcoule', { r: q.reponse })
    : '❌ ' + t('laBonneReponse', { r: q.reponse })
  feedbackClass.value = 'erreur'
  mauvaises.value++
  historique.value.push({ texte: q.texte, ok: false, attendu: q.reponse, donne: val })
  timeoutSuivant = setTimeout(suivant, 1200)
}

function suivant() {
  clearTimeout(timeoutSuivant); timeoutSuivant = null
  if (phase.value !== 'jeu') return
  idx.value++
  if (idx.value >= questions.value.length) afficherResultats()
  else afficherQuestion()
}

const resultMsg = computed(() => {
  const pct = bonnes.value / questions.value.length * 100
  if (pct === 100) { confettis(50); return t('resultat100') }
  if (pct >= 80)   { confettis(25); return t('resultat80') }
  if (pct >= 60)   return t('resultat60')
  if (pct >= 40)   return t('resultat40')
  return t('resultat0')
})

function afficherResultats() {
  clearInterval(timerInterval)
  phase.value = 'resultats'
}

onUnmounted(nettoyer)
</script>

<style scoped>
.exercise-question.long { font-size: 2.3rem; }
@media (max-width: 520px) { .exercise-question.long { font-size: 1.7rem; } }

.hist-item {
  display: flex; justify-content: space-between;
  padding: .3rem .5rem; border-radius: 6px;
  font-size: .9rem;
}
.hist-item.ok     { background: #f0faf0; }
.hist-item.erreur { background: #fef0f0; }

.level-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  border-color: var(--gris-brd);
}
.level-btn:disabled:hover {
  border-color: var(--gris-brd);
  color: inherit;
}
</style>
