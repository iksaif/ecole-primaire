<template>
  <div class="container">
    <h1>📖 Lecture</h1>

    <!-- ══ CONFIG ══ -->
    <div v-if="phase === 'config'" class="config-box">

      <div class="config-section">
        <div class="config-section-title">Exercice</div>
        <div class="mode-cards">
          <button class="mode-card" :class="{ active: config.mode === 'syllabes' }" @click="config.mode = 'syllabes'">
            <div class="mode-icon">🔠</div>
            <div class="mode-title">Syllabes</div>
            <div class="mode-desc">Compte et reconstitue les syllabes d'un mot</div>
          </button>
          <button class="mode-card" :class="{ active: config.mode === 'mots' }" @click="config.mode = 'mots'">
            <div class="mode-icon">🧩</div>
            <div class="mode-title">Reconstituer un mot</div>
            <div class="mode-desc">Remets les syllabes dans le bon ordre</div>
          </button>
        </div>
      </div>

      <div class="config-section">
        <div class="config-section-title">Niveau</div>
        <div class="btn-group">
          <button v-for="n in NIVEAUX" :key="n.id"
            class="level-btn" :class="{ active: config.niveau === n.id }"
            @click="config.niveau = n.id">{{ n.label }}</button>
        </div>
      </div>

      <div class="config-section">
        <div class="config-section-title">Nombre de questions</div>
        <div class="btn-group">
          <button v-for="n in [5, 10, 15]" :key="n"
            class="level-btn" :class="{ active: config.nb === n }"
            @click="config.nb = n">{{ n }}</button>
        </div>
      </div>

      <div style="text-align:center;margin-top:1.5rem;">
        <button class="btn btn-primary" style="font-size:1.1rem;padding:.75rem 2rem;" @click="demarrer">
          ▶ Commencer
        </button>
      </div>
    </div>

    <!-- ══ EXERCICE : Syllabes ══ -->
    <template v-if="phase === 'jeu' && question">
      <div class="score-bar">
        <button class="btn-quitter" @click="phase = 'config'">✕ Quitter</button>
        <span>Question {{ idx + 1 }} / {{ questions.length }}</span>
        <span>✅ {{ bonnes }} &nbsp; ❌ {{ mauvaises }}</span>
      </div>
      <div class="prog-dots" style="max-width:680px;margin:0 auto .5rem;">
        <div v-for="(_, i) in questions" :key="i" class="prog-dot" :class="dotClass(i)"></div>
      </div>

      <div class="exercise-box">

        <!-- Mode syllabes : combien de syllabes ? -->
        <template v-if="config.mode === 'syllabes'">
          <div class="question-label">Combien de syllabes dans ce mot ?</div>
          <div class="mot-display">{{ question.mot }}</div>
          <div class="choix-grid">
            <button v-for="c in question.choix" :key="c"
              class="choix-btn" :class="reponduClass(c)"
              :disabled="repondu" @click="validerChoix(c)">{{ c }}</button>
          </div>
          <div v-if="repondu" class="feedback" :class="feedbackCls">
            {{ feedbackTxt }}
            <span v-if="repondu" class="decoupage">
              {{ question.syllabes.join(' · ') }}
            </span>
          </div>
        </template>

        <!-- Mode reconstituer : clique dans le bon ordre -->
        <template v-else>
          <div class="question-label">Reconstitue le mot en cliquant sur les syllabes dans le bon ordre :</div>
          <div class="assemblage">
            <span v-for="(s, i) in assemblage" :key="i" class="syllabe-assemblee">{{ s }}</span>
            <span v-if="!assemblage.length" class="assemblage-vide">…</span>
          </div>
          <div class="syllabes-choix">
            <button v-for="(s, i) in syllabeMelangees" :key="i"
              class="syllabe-btn"
              :class="{ used: utilisees.has(i), bonne: repondu && !erreurSyll, mauvaise: repondu && erreurSyll }"
              :disabled="repondu || utilisees.has(i)"
              @click="ajouterSyllabe(i, s)">{{ s }}</button>
          </div>
          <div class="saisie-row" style="justify-content:center;gap:.5rem;margin-top:.75rem;">
            <button v-if="!repondu && assemblage.length > 0" class="btn btn-ghost" @click="effacerDerniere">← Effacer</button>
            <button v-if="!repondu && assemblage.length === question.syllabes.length" class="btn btn-primary" @click="validerMot">Valider ✔</button>
          </div>
          <div v-if="repondu" class="feedback" :class="feedbackCls">{{ feedbackTxt }}</div>
        </template>

        <button v-if="repondu" class="btn btn-primary" style="margin-top:1rem;" @click="suivant">
          {{ idx + 1 < questions.length ? 'Suivant →' : 'Voir les résultats' }}
        </button>
      </div>
    </template>

    <!-- ══ RÉSULTATS ══ -->
    <div v-if="phase === 'resultats'" class="exercise-box" style="text-align:center;">
      <div class="result-score">{{ bonnes }} / {{ questions.length }}</div>
      <div class="result-msg">{{ resultMsg }}</div>
      <div class="btn-group" style="justify-content:center;margin-top:1.25rem;">
        <button class="btn btn-primary" @click="demarrer">🔄 Rejouer</button>
        <button class="btn btn-ghost" @click="phase = 'config'">⚙️ Changer</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { melanger, confettis, sauvegarder, charger } from '../utils'

const NIVEAUX = [
  { id: 'cp',  label: 'CP' },
  { id: 'ce1', label: 'CE1' },
  { id: 'ce2', label: 'CE2+' },
]

// Mots avec découpage syllabique
const MOTS_CP = [
  { mot: 'papa',    syllabes: ['pa','pa'] },
  { mot: 'maman',   syllabes: ['ma','man'] },
  { mot: 'bateau',  syllabes: ['ba','teau'] },
  { mot: 'maison',  syllabes: ['mai','son'] },
  { mot: 'lapin',   syllabes: ['la','pin'] },
  { mot: 'soleil',  syllabes: ['so','leil'] },
  { mot: 'nuage',   syllabes: ['nu','age'] },
  { mot: 'école',   syllabes: ['é','cole'] },
  { mot: 'ami',     syllabes: ['a','mi'] },
  { mot: 'image',   syllabes: ['i','mage'] },
  { mot: 'vélo',    syllabes: ['vé','lo'] },
  { mot: 'photo',   syllabes: ['pho','to'] },
  { mot: 'feuille', syllabes: ['feuil','le'] },
  { mot: 'rouge',   syllabes: ['rou','ge'] },
  { mot: 'forêt',   syllabes: ['fo','rêt'] },
]
const MOTS_CE1 = [
  { mot: 'papillon',  syllabes: ['pa','pil','lon'] },
  { mot: 'chocolat',  syllabes: ['cho','co','lat'] },
  { mot: 'éléphant',  syllabes: ['é','lé','phant'] },
  { mot: 'carotte',   syllabes: ['ca','rot','te'] },
  { mot: 'domino',    syllabes: ['do','mi','no'] },
  { mot: 'caméra',    syllabes: ['ca','mé','ra'] },
  { mot: 'tomate',    syllabes: ['to','ma','te'] },
  { mot: 'camion',    syllabes: ['ca','mi','on'] },
  { mot: 'piranha',   syllabes: ['pi','ran','ha'] },
  { mot: 'château',   syllabes: ['châ','teau'] },
  { mot: 'jardin',    syllabes: ['jar','din'] },
  { mot: 'fenêtre',   syllabes: ['fe','nê','tre'] },
  { mot: 'librairie', syllabes: ['li','brai','rie'] },
  { mot: 'montagne',  syllabes: ['mon','ta','gne'] },
]
const MOTS_CE2 = [
  { mot: 'bibliothèque', syllabes: ['bi','bli','o','thè','que'] },
  { mot: 'catégorie',    syllabes: ['ca','té','go','rie'] },
  { mot: 'anniversaire', syllabes: ['an','ni','ver','sai','re'] },
  { mot: 'révolution',   syllabes: ['ré','vo','lu','tion'] },
  { mot: 'dinosaure',    syllabes: ['di','no','sau','re'] },
  { mot: 'encyclopédie', syllabes: ['en','cy','clo','pé','die'] },
  { mot: 'électricité',  syllabes: ['é','lec','tri','ci','té'] },
  { mot: 'photographie', syllabes: ['pho','to','gra','phie'] },
  { mot: 'vocabulaire',  syllabes: ['vo','ca','bu','lai','re'] },
  { mot: 'géographie',   syllabes: ['gé','o','gra','phie'] },
]

function getPool(niveau) {
  if (niveau === 'cp')  return MOTS_CP
  if (niveau === 'ce1') return [...MOTS_CP, ...MOTS_CE1]
  return [...MOTS_CE1, ...MOTS_CE2]
}

const config = ref(charger('lecture_config', { mode: 'syllabes', niveau: 'cp', nb: 10 }))
watch(config, v => sauvegarder('lecture_config', v), { deep: true })
const phase = ref('config')
const questions = ref([])
const idx = ref(0)
const bonnes = ref(0)
const mauvaises = ref(0)
const repondu = ref(false)
const feedbackTxt = ref('')
const feedbackCls = ref('')
const reponseDonnee = ref(null)

// Mode reconstituer
const assemblage = ref([])
const utilisees = ref(new Set())
const syllabeMelangees = ref([])
const erreurSyll = ref(false)

const question = computed(() => questions.value[idx.value])

function demarrer() {
  const pool = melanger(getPool(config.value.niveau)).slice(0, config.value.nb)
  questions.value = pool.map(q => {
    const nb = q.syllabes.length
    const mauvais = [nb - 1, nb + 1, nb + 2].filter(n => n >= 1 && n !== nb)
    const choix = melanger([nb, ...melanger(mauvais).slice(0, 2)]).slice(0, 3)
    return { ...q, choix, _resultat: undefined }
  })
  idx.value = 0; bonnes.value = 0; mauvaises.value = 0
  repondu.value = false; feedbackTxt.value = ''; feedbackCls.value = ''
  reponseDonnee.value = null
  resetReconstituer()
  phase.value = 'jeu'
}

function melangerDifferent(arr) {
  if (arr.length <= 1) return [...arr]
  let result
  let essais = 0
  do {
    result = melanger([...arr])
    essais++
  } while (essais < 30 && result.every((s, i) => s === arr[i]))
  return result
}

function resetReconstituer() {
  assemblage.value = []
  utilisees.value = new Set()
  erreurSyll.value = false
  if (question.value) syllabeMelangees.value = melangerDifferent(question.value.syllabes)
}

function dotClass(i) {
  const r = questions.value[i]?._resultat
  if (i === idx.value && phase.value === 'jeu') return 'current'
  if (r === undefined) return ''
  return r ? 'ok' : 'erreur'
}

function validerChoix(c) {
  if (repondu.value) return
  reponseDonnee.value = c
  const ok = c === question.value.syllabes.length
  enregistrer(ok)
}

function reponduClass(c) {
  if (!repondu.value) return ''
  if (c === question.value.syllabes.length) return 'bonne'
  if (c === reponseDonnee.value) return 'mauvaise'
  return ''
}

function ajouterSyllabe(i, s) {
  assemblage.value.push(s)
  utilisees.value = new Set([...utilisees.value, i])
}

function effacerDerniere() {
  if (!assemblage.value.length) return
  const s = assemblage.value[assemblage.value.length - 1]
  assemblage.value.pop()
  // retrouver le dernier index utilisé pour cette syllabe
  const usedArr = [...utilisees.value]
  const idx2 = usedArr.slice().reverse().find(i => syllabeMelangees.value[i] === s)
  if (idx2 !== undefined) {
    const next = new Set(utilisees.value)
    next.delete(idx2)
    utilisees.value = next
  }
}

function validerMot() {
  if (repondu.value) return
  const ok = assemblage.value.join('') === question.value.mot
  erreurSyll.value = !ok
  enregistrer(ok)
}

function enregistrer(ok) {
  question.value._resultat = ok
  repondu.value = true
  if (ok) {
    bonnes.value++
    feedbackTxt.value = ['Bravo ! 🎉', 'Exact ! ⭐', 'Bien joué ! 👏'][Math.floor(Math.random() * 3)]
    feedbackCls.value = 'ok'
  } else {
    mauvaises.value++
    if (config.value.mode === 'syllabes') {
      feedbackTxt.value = `❌ ${question.value.mot} a ${question.value.syllabes.length} syllabe${question.value.syllabes.length > 1 ? 's' : ''} : ${question.value.syllabes.join(' · ')}`
    } else {
      feedbackTxt.value = `❌ Le bon ordre était : ${question.value.syllabes.join(' · ')} → ${question.value.mot}`
    }
    feedbackCls.value = 'erreur'
  }
}

function suivant() {
  idx.value++
  if (idx.value >= questions.value.length) { phase.value = 'resultats'; return }
  repondu.value = false; feedbackTxt.value = ''; feedbackCls.value = ''
  reponseDonnee.value = null
  resetReconstituer()
}

const resultMsg = computed(() => {
  const pct = bonnes.value / questions.value.length * 100
  if (pct === 100) { confettis(50); return 'Parfait, sans faute ! 🏆' }
  if (pct >= 80)   { confettis(25); return 'Très bien ! 🌟' }
  if (pct >= 60)   return 'Bien ! Continue à t\'entraîner 💪'
  return 'Courage ! Relis les mots à voix haute 📚'
})
</script>

<style scoped>
.container { max-width: 680px; margin: 0 auto; padding: 1rem; }
h1 { color: var(--bleu); margin-bottom: 1rem; }

.config-box { background: white; border-radius: var(--radius); box-shadow: var(--shadow); padding: 1.5rem; }
.config-section { margin-bottom: 1.25rem; }
.config-section-title { font-weight: 700; margin-bottom: .6rem; font-size: .9rem; text-transform: uppercase; letter-spacing: .04em; color: #555; }

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
.mode-icon  { font-size: 2rem; }
.mode-title { font-weight: 800; font-size: .95rem; margin: .3rem 0 .15rem; }
.mode-desc  { font-size: .78rem; color: #666; }

.exercise-box { background: white; border-radius: var(--radius); box-shadow: var(--shadow); padding: 1.5rem; }

.question-label { font-weight: 600; color: #555; margin-bottom: .75rem; text-align: center; }

.mot-display {
  font-size: 2.5rem; font-weight: 900; text-align: center; color: var(--bleu);
  margin-bottom: 1.25rem; letter-spacing: .05em;
}

.choix-grid { display: flex; gap: .75rem; justify-content: center; margin-bottom: 1rem; }
.choix-btn {
  min-width: 60px; padding: .6rem 1.2rem;
  border: 2px solid var(--gris-brd); border-radius: 10px;
  font-size: 1.4rem; font-weight: 800; font-family: inherit;
  background: white; cursor: pointer; transition: all .15s;
}
.choix-btn:hover:not(:disabled) { border-color: var(--bleu); background: #eef5ff; }
.choix-btn:focus-visible { outline: 3px solid var(--bleu); outline-offset: 2px; }
.choix-btn.bonne   { border-color: #22c55e; background: #f0fdf4; color: #15803d; }
.choix-btn.mauvaise{ border-color: var(--rouge); background: #fff5f5; color: var(--rouge); }
.choix-btn:disabled { cursor: default; }

.decoupage { display: block; margin-top: .4rem; font-weight: 700; font-size: 1rem; color: var(--bleu); }

/* Reconstituer */
.assemblage {
  min-height: 3rem; border: 2px dashed #ccc; border-radius: 10px;
  display: flex; align-items: center; justify-content: center; gap: .25rem;
  margin-bottom: 1rem; padding: .5rem; font-size: 1.5rem; font-weight: 800; color: var(--bleu);
}
.assemblage-vide { color: #ccc; font-weight: 400; font-size: 1.1rem; }
.syllabe-assemblee { letter-spacing: .02em; }

.syllabes-choix { display: flex; flex-wrap: wrap; gap: .5rem; justify-content: center; }
.syllabe-btn {
  padding: .5rem 1rem; border: 2px solid var(--bleu);
  border-radius: 8px; font-size: 1.25rem; font-weight: 700;
  font-family: inherit; background: #eef5ff; color: var(--bleu);
  cursor: pointer; transition: all .15s;
}
.syllabe-btn:hover:not(:disabled):not(.used) { background: var(--bleu); color: white; }
.syllabe-btn:focus-visible { outline: 3px solid var(--bleu); outline-offset: 2px; }
.syllabe-btn.used { opacity: .3; cursor: default; }
.syllabe-btn.bonne   { border-color: #22c55e; background: #f0fdf4; color: #15803d; }
.syllabe-btn.mauvaise{ border-color: var(--rouge); background: #fff5f5; color: var(--rouge); }

.saisie-row { display: flex; gap: .5rem; }

.feedback { padding: .6rem 1rem; border-radius: 8px; font-weight: 600; margin-top: .5rem; font-size: .95rem; }
.feedback.ok     { background: #f0fdf4; color: #15803d; }
.feedback.erreur { background: #fff5f5; color: var(--rouge); }

.result-score { font-size: 3rem; font-weight: 900; color: var(--bleu); }
.result-msg   { font-size: 1.1rem; margin: .5rem 0 1.5rem; }
</style>
