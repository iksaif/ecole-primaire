<template>
  <div class="container">
    <h1>🌍 {{ t('titre') }}</h1>

    <!-- ══ CONFIG ══ -->
    <ConfigExercice v-if="phase === 'config'" :config="config" v-model:mode="mode" :fiche="fiche"
      @commencer="demarrer" @regenerer="regenerer">

      <div class="config-section">
        <div class="config-section-title">{{ t('theme') }}</div>
        <div class="theme-grid">
          <button v-for="th in THEMES" :key="th.id"
            class="theme-btn" :class="{ active: config.theme === th.id }"
            @click="config.theme = th.id">
            <span class="theme-icon">{{ th.icon }}</span>
            <span class="theme-label">{{ t(`theme_${th.id}`) }}</span>
            <span class="theme-niveau">{{ th.niveau }}</span>
          </button>
        </div>
      </div>

      <div class="config-section">
        <div class="config-section-title">{{ t('nbQuestions') }}</div>
        <div class="btn-group">
          <button v-for="n in [5, 10, 15]" :key="n"
            class="level-btn" :class="{ active: config.nb === n }"
            @click="config.nb = n">{{ n }}</button>
        </div>
      </div>
    </ConfigExercice>

    <!-- ══ EXERCICE ══ -->
    <template v-if="phase === 'jeu' && question">
      <div class="score-bar">
        <button class="btn-quitter" @click="phase = 'config'">{{ t('quitter') }}</button>
        <span>{{ t('question', { n: idx + 1, total: questions.length }) }}</span>
        <span>✅ {{ bonnes }} &nbsp; ❌ {{ mauvaises }}</span>
      </div>
      <div class="prog-dots" style="max-width:680px;margin:0 auto .5rem;">
        <div v-for="(_, i) in questions" :key="i" class="prog-dot" :class="dotClass(i)"></div>
      </div>

      <div class="exercise-box">
        <div class="question-text">{{ question.q }}</div>

        <div class="choix-grid" :class="{ 'choix-2': question.choix.length === 2 }">
          <button v-for="c in question.choix" :key="c"
            class="choix-btn" :class="reponduClass(c)"
            :disabled="repondu" @click="valider(c)">{{ c }}</button>
        </div>

        <div class="feedback" :class="feedbackCls" v-if="repondu">
          {{ feedbackTxt }}
          <span v-if="question.info && !estOk" class="feedback-info">{{ question.info }}</span>
        </div>

        <button v-if="repondu" class="btn btn-primary" style="margin-top:1rem;" @click="suivant">
          {{ idx + 1 < questions.length ? t('suivant') : t('voirResultats') }}
        </button>
      </div>
    </template>

    <!-- ══ RÉSULTATS ══ -->
    <div v-if="phase === 'resultats'" class="exercise-box" style="text-align:center;">
      <div class="result-score">{{ bonnes }} / {{ questions.length }}</div>
      <div class="result-msg">{{ resultMsg }}</div>

      <div v-if="erreurs.length > 0" class="erreurs-box">
        <div class="config-section-title" style="margin-bottom:.5rem;">{{ t('aRetenir') }}</div>
        <div v-for="(e, i) in erreurs" :key="i" class="erreur-quiz">
          <span class="erreur-q">{{ e.q }}</span>
          <span class="erreur-r">→ <strong>{{ e.bonne }}</strong></span>
        </div>
      </div>

      <div class="btn-group" style="justify-content:center;margin-top:1.25rem;">
        <button class="btn btn-primary" @click="demarrer">{{ t('rejouer') }}</button>
        <button class="btn btn-ghost" @click="phase = 'config'">{{ t('changer') }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { melanger, confettis, sauvegarder, charger } from '../utils'
import { useI18n } from '../i18n'
import messagesFr from '../i18n/fr/views/AutresView.js'
import messagesBr from '../i18n/br/views/AutresView.js'
import quizFr from '../i18n/fr/contenu/quiz.js'
import quizBr from '../i18n/br/contenu/quiz.js'
import ConfigExercice from '../components/ConfigExercice.vue'
import { useModeExercice } from '../composables/useModeExercice'
import { echapper } from '../utils/impression'

const { t, langue } = useI18n({ fr: messagesFr, br: messagesBr })

// Thèmes ; libellé = clé theme_<id> du catalogue d'interface
const THEMES = [
  { id: 'geo-france',  icon: '🗺️', niveau: 'CE2→CM2' },
  { id: 'geo-monde',   icon: '🌍', niveau: 'CM1→CM2' },
  { id: 'sciences',    icon: '🔬', niveau: 'CE1→CM2' },
  { id: 'histoire',    icon: '📜', niveau: 'CM1→CM2' },
  { id: 'animaux',     icon: '🦁', niveau: 'CP→CE2' },
]

// ── Banque de questions (contenu, dans la langue de l'interface) : src/i18n/<langue>/contenu/quiz.js.
// Une question non traduite est absente du catalogue de la langue : elle n'est proposée qu'en français.
const QUIZ = { fr: quizFr, br: quizBr }
const questionsDu = theme => QUIZ[langue.value]?.[theme] ?? []

// ── État
const config = ref(charger('autres_config', { theme: 'animaux', nb: 10 }))
watch(config, v => sauvegarder('autres_config', v), { deep: true })
const phase = ref('config')
const questions = ref([])
const idx = ref(0)
const bonnes = ref(0)
const mauvaises = ref(0)
const erreurs = ref([])
const repondu = ref(false)
const feedbackTxt = ref('')
const feedbackCls = ref('')
const estOk = ref(false)
const reponseDonnee = ref('')

const question = computed(() => questions.value[idx.value])

function demarrer() {
  const pool = melanger(questionsDu(config.value.theme))
    .slice(0, config.value.nb)
    .map(q => ({ ...q, choix: melanger([...q.choix]), _resultat: undefined }))
  questions.value = pool
  idx.value = 0; bonnes.value = 0; mauvaises.value = 0; erreurs.value = []
  repondu.value = false; feedbackTxt.value = ''; feedbackCls.value = ''
  reponseDonnee.value = ''
  phase.value = 'jeu'
}

// ── Fiche imprimable : questions + choix à entourer, corrigé page 2
function htmlFiche() {
  const e = echapper
  const qs = melanger(questionsDu(config.value.theme))
    .slice(0, config.value.nb)
    .map(q => ({ ...q, choix: melanger([...q.choix]) }))
  const th = THEMES.find(x => x.id === config.value.theme)
  const titre = `${t('titre')} — ${t(`theme_${th.id}`)}`
  const corps = qs.map((q, i) => `<div class="q"><div class="enonce"><span class="num">${i + 1}.</span> ${e(q.q)}</div>
    <div class="choix">${q.choix.map(c => `<span>${e(c)}</span>`).join('')}</div></div>`).join('')
  const corrige = qs.map((q, i) => `<div class="corr"><span class="num">${i + 1}.</span> <b>${e(q.bonne)}</b>${q.info ? ` <em>— ${e(q.info)}</em>` : ''}</div>`).join('')
  return `<!DOCTYPE html><html lang="${langue.value}"><head>
    <meta charset="UTF-8"><title>${e(titre)}</title>
    <style>
      body { font-family: Arial, sans-serif; max-width: 700px; margin: 1.5cm auto; color: #222; }
      h1 { font-size: 1.3rem; border-bottom: 2px solid #333; padding-bottom: .4rem; margin-bottom: .5rem; }
      .entete { font-size: .85rem; color: #666; margin-bottom: .6rem; }
      .consigne { font-weight: 700; margin: .4rem 0 1rem; }
      .q { margin-bottom: 1rem; page-break-inside: avoid; }
      .enonce { font-size: 1.1rem; font-weight: 700; margin-bottom: .35rem; }
      .num { color: #777; }
      .choix { display: flex; flex-wrap: wrap; gap: .4rem 1.6rem; padding-left: 1.6rem; font-size: 1.05rem; }
      .choix span { padding: .1rem .5rem; }
      .corrige { page-break-before: always; break-before: page; }
      .corr { margin: .35rem 0; }
      em { color: #666; font-size: .9em; }
    </style></head><body>
    <h1>${e(titre)}</h1>
    <p class="entete">${t('prenom')} : ________________________ &nbsp; ${t('date')} : ______________</p>
    <p class="consigne">${t('fConsigne')}</p>
    ${corps}
    <div class="corrige"><h1>${t('corrige')} — ${e(titre)}</h1>${corrige}</div>
  </body></html>`
}

const { mode, graine, regenerer } = useModeExercice()
const fiche = computed(() => {
  if (mode.value !== 'imprimer') return ''
  graine.value
  return htmlFiche()
})

function dotClass(i) {
  const r = questions.value[i]?._resultat
  if (i === idx.value && phase.value === 'jeu') return 'current'
  if (r === undefined) return ''
  return r ? 'ok' : 'erreur'
}

function valider(choix) {
  if (repondu.value) return
  reponseDonnee.value = choix
  const ok = choix === question.value.bonne
  question.value._resultat = ok
  repondu.value = true
  estOk.value = ok
  if (ok) {
    bonnes.value++
    const b = t('bravoQuiz'); feedbackTxt.value = b[Math.floor(Math.random() * b.length)]
    feedbackCls.value = 'ok'
  } else {
    mauvaises.value++
    feedbackTxt.value = `❌ ${t('mauvaise', { r: question.value.bonne })}`
    feedbackCls.value = 'erreur'
    erreurs.value.push({ q: question.value.q, bonne: question.value.bonne })
  }
}

function reponduClass(c) {
  if (!repondu.value) return ''
  if (c === question.value.bonne) return 'bonne'
  if (c === reponseDonnee.value) return 'mauvaise'
  return ''
}

function suivant() {
  idx.value++
  if (idx.value >= questions.value.length) { phase.value = 'resultats'; return }
  repondu.value = false; feedbackTxt.value = ''; feedbackCls.value = ''
  reponseDonnee.value = ''; estOk.value = false
}

const resultMsg = computed(() => {
  const pct = bonnes.value / questions.value.length * 100
  if (pct === 100) { confettis(50); return t('res100') }
  if (pct >= 80)   { confettis(25); return t('res80') }
  if (pct >= 60)   return t('res60')
  return t('res0')
})
</script>

<style scoped>
.container { max-width: 680px; margin: 0 auto; padding: 1rem; }
h1 { color: var(--bleu); margin-bottom: 1rem; }

.config-box { background: white; border-radius: var(--radius); box-shadow: var(--shadow); padding: 1.5rem; }
.config-section { margin-bottom: 1.25rem; }
.config-section-title { font-weight: 700; margin-bottom: .6rem; font-size: .9rem; text-transform: uppercase; letter-spacing: .04em; color: #555; }

.theme-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: .5rem; }
.theme-btn {
  background: white; border: 2px solid var(--gris-brd); border-radius: 10px;
  padding: .6rem .75rem; cursor: pointer; font-family: inherit; transition: all .15s;
  display: flex; flex-direction: column; align-items: center; gap: .15rem; text-align: center;
}
.theme-btn:hover  { border-color: var(--bleu); }
.theme-btn:focus-visible { outline: 3px solid var(--bleu); outline-offset: 2px; }
.theme-btn.active { border-color: var(--bleu); background: #eef5ff; }
.theme-icon  { font-size: 1.75rem; }
.theme-label { font-weight: 700; font-size: .9rem; }
.theme-niveau { font-size: .72rem; color: #999; }

.exercise-box { background: white; border-radius: var(--radius); box-shadow: var(--shadow); padding: 1.5rem; }
.question-text { font-size: 1.25rem; font-weight: 700; text-align: center; margin-bottom: 1.5rem; line-height: 1.4; color: #222; }

.choix-grid { display: grid; grid-template-columns: 1fr 1fr; gap: .65rem; margin-bottom: 1rem; }
.choix-grid.choix-2 { grid-template-columns: 1fr 1fr; max-width: 360px; margin-left: auto; margin-right: auto; }
@media (max-width: 480px) { .choix-grid { grid-template-columns: 1fr; } }

.choix-btn {
  padding: .65rem 1rem; border: 2px solid var(--gris-brd); border-radius: 10px;
  font-size: .95rem; font-weight: 600; font-family: inherit;
  background: white; cursor: pointer; transition: all .15s; text-align: left; line-height: 1.3;
}
.choix-btn:hover:not(:disabled) { border-color: var(--bleu); background: #eef5ff; }
.choix-btn:focus-visible { outline: 3px solid var(--bleu); outline-offset: 2px; }
.choix-btn.bonne   { border-color: #22c55e; background: #f0fdf4; color: #15803d; }
.choix-btn.mauvaise{ border-color: var(--rouge); background: #fff5f5; color: var(--rouge); }
.choix-btn:disabled { cursor: default; }

.feedback { padding: .6rem 1rem; border-radius: 8px; font-weight: 600; margin-top: .5rem; font-size: .95rem; }
.feedback.ok     { background: #f0fdf4; color: #15803d; }
.feedback.erreur { background: #fff5f5; color: var(--rouge); }
.feedback-info { display: block; font-weight: 400; font-size: .85rem; margin-top: .25rem; color: #555; }

.result-score { font-size: 3rem; font-weight: 900; color: var(--bleu); }
.result-msg   { font-size: 1.1rem; margin: .5rem 0 1.5rem; }

.erreurs-box { text-align: left; max-width: 560px; margin: 0 auto; }
.erreur-quiz {
  display: flex; gap: .75rem; align-items: baseline; flex-wrap: wrap;
  padding: .4rem 0; border-bottom: 1px solid #f0f0f0; font-size: .9rem;
}
.erreur-q  { flex: 1; color: #444; }
.erreur-r  { color: #15803d; white-space: nowrap; }
</style>
