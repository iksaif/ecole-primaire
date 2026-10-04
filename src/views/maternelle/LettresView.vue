<template>
  <div class="container">
    <h1>🔡 {{ t('titre') }}</h1>

    <!-- ══ CONFIG ══ -->
    <ConfigExercice v-if="phase === 'config'" :config="config" v-model:mode="mode" :fiche="fiche"
      @commencer="demarrer" @regenerer="regenerer">
      <div v-if="mode === 'jouer'" class="config-section">
        <div class="config-section-title">{{ t('exercice') }}</div>
        <div class="mode-cards">
          <button class="mode-card" :class="{ active: config.mode === 'reconnaitre' }" @click="config.mode = 'reconnaitre'">
            <div class="mode-icon">👁️</div>
            <div class="mode-title">{{ t('reconnaitre') }}</div>
            <div class="mode-desc">{{ t('reconnaitreDesc') }}</div>
          </button>
          <button class="mode-card" :class="{ active: config.mode === 'majuscule' }" @click="config.mode = 'majuscule'">
            <div class="mode-icon">🔠</div>
            <div class="mode-title">{{ t('majMin') }}</div>
            <div class="mode-desc">{{ t('majMinDesc') }}</div>
          </button>
        </div>
      </div>

      <div class="config-section">
        <div class="config-section-title">{{ t('lettres') }}</div>
        <div class="btn-group">
          <button class="level-btn" :class="{ active: config.groupe === 'voyelles' }" @click="config.groupe = 'voyelles'">{{ t('voyelles') }}</button>
          <button class="level-btn" :class="{ active: config.groupe === 'consonnes' }" @click="config.groupe = 'consonnes'">{{ t('consonnes') }}</button>
          <button class="level-btn" :class="{ active: config.groupe === 'toutes' }" @click="config.groupe = 'toutes'">{{ t('toutes') }}</button>
        </div>
      </div>
      <p v-if="mode === 'imprimer'" class="note-fiche">{{ t('noteFiche') }}</p>
    </ConfigExercice>

    <!-- ══ EXERCICE ══ -->
    <template v-if="phase === 'jeu' && question">
      <div class="score-bar">
        <button class="btn-quitter" @click="phase = 'config'">{{ t('quitter') }}</button>
        <span>{{ idx + 1 }} / {{ questions.length }}</span>
        <span>✅ {{ bonnes }} &nbsp; ❌ {{ mauvaises }}</span>
      </div>
      <div class="prog-dots" style="max-width:680px;margin:0 auto .5rem;">
        <div v-for="(_, i) in questions" :key="i" class="prog-dot" :class="dotClass(i)"></div>
      </div>

      <div class="exercise-box" style="text-align:center;">
        <!-- Reconnaître : montre la lettre, choisir parmi 4 -->
        <template v-if="config.mode === 'reconnaitre'">
          <div class="lettre-display">{{ question.lettre }}</div>
          <div class="question-label">{{ t('quelleLettre') }}</div>
          <div class="choix-lettres">
            <button v-for="c in question.choix" :key="c"
              class="choix-lettre-btn" :class="reponduClass(c)"
              :disabled="repondu" @click="valider(c)">{{ c }}</button>
          </div>
        </template>

        <!-- Majuscule / Minuscule -->
        <template v-else>
          <div class="question-label">{{ t(question.question) }}</div>
          <div class="lettre-display">{{ question.affiche }}</div>
          <div class="choix-lettres">
            <button v-for="c in question.choix" :key="c"
              class="choix-lettre-btn" :class="reponduClass(c)"
              :disabled="repondu" @click="valider(c)">{{ c }}</button>
          </div>
        </template>

        <div class="feedback" :class="feedbackCls" v-if="repondu">{{ feedbackTxt }}</div>
        <button v-if="repondu" class="btn btn-primary" style="margin-top:1rem;" @click="suivant">
          {{ idx + 1 < questions.length ? t('suivant') : t('voirResultats') }}
        </button>
      </div>
    </template>

    <!-- ══ RÉSULTATS ══ -->
    <div v-if="phase === 'resultats'" class="exercise-box" style="text-align:center;">
      <div class="result-score">{{ bonnes }} / {{ questions.length }}</div>
      <div class="result-msg">{{ resultMsg }}</div>
      <div class="btn-group" style="justify-content:center;margin-top:1.25rem;">
        <button class="btn btn-primary" @click="demarrer">{{ t('rejouer') }}</button>
        <button class="btn btn-ghost" @click="phase = 'config'">{{ t('changer') }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { melanger, confettis, sauvegarder, charger } from '../../utils'
import { useI18n } from '../../i18n'
import messagesFr from '../../i18n/fr/views/maternelle/LettresView.js'
import messagesBr from '../../i18n/br/views/maternelle/LettresView.js'
import ConfigExercice from '../../components/ConfigExercice.vue'
import { useModeExercice } from '../../composables/useModeExercice'
import { cssPolices, echapper, POLICE_SCRIPT } from '../../utils/impression'
import { langueRegionale } from '../../data/languesRegionales'

const VOYELLES   = ['A','E','I','O','U','Y']
const CONSONNES  = ['B','C','D','F','G','H','J','K','L','M','N','P','Q','R','S','T','V','W','X','Z']
const TOUTES     = [...VOYELLES, ...CONSONNES]

// Breton : lizherenneg peurunvan (ch et c'h sont des lettres ; pas de c, q, x).
// Majuscule d'un digramme : Ch, C'h (première lettre seulement).
const majuscule = l => l.charAt(0).toUpperCase() + l.slice(1)
const ALPHABET_BR  = langueRegionale('br').alphabet.map(majuscule)
const VOYELLES_BR  = ALPHABET_BR.filter(l => VOYELLES.includes(l))
const CONSONNES_BR = ALPHABET_BR.filter(l => !VOYELLES.includes(l))

const { t, langue } = useI18n({ fr: messagesFr, br: messagesBr })

const config = ref(charger('lettres_config', { mode: 'reconnaitre', groupe: 'toutes' }))
watch(config, v => sauvegarder('lettres_config', v), { deep: true })
const phase = ref('config')
const questions = ref([])
const idx = ref(0)
const bonnes = ref(0)
const mauvaises = ref(0)
const repondu = ref(false)
const feedbackTxt = ref('')
const feedbackCls = ref('')
const reponseDonnee = ref('')

const question = computed(() => questions.value[idx.value])

function getPool() {
  const br = langue.value === 'br'
  if (config.value.groupe === 'voyelles') return br ? VOYELLES_BR : VOYELLES
  if (config.value.groupe === 'consonnes') return br ? CONSONNES_BR : CONSONNES
  return br ? ALPHABET_BR : TOUTES
}

function fausses(pool, exclure, n) {
  return melanger(pool.filter(l => l !== exclure)).slice(0, n)
}

function demarrer() {
  const pool = getPool()
  const qs = melanger([...pool]).slice(0, 15).map(lettre => {
    if (config.value.mode === 'reconnaitre') {
      // montre la minuscule, choisit la majuscule (ou l'inverse)
      const afficheMaj = Math.random() < 0.5
      const affiche = afficheMaj ? lettre : lettre.toLowerCase()
      const choix = melanger([lettre, ...fausses(pool, lettre, 3)])
      return { lettre, affiche, choix, bonne: lettre, _resultat: undefined }
    } else {
      // montre majuscule → trouver minuscule, ou inverse
      const versMin = Math.random() < 0.5
      const affiche = versMin ? lettre : lettre.toLowerCase()
      const bonne   = versMin ? lettre.toLowerCase() : lettre
      const pool2   = versMin ? pool.map(l => l.toLowerCase()) : pool
      const choix   = melanger([bonne, ...fausses(pool2, bonne, 3)])
      const question = versMin ? 'quelleMinuscule' : 'quelleMajuscule'
      return { lettre, affiche, choix, bonne, question, _resultat: undefined }
    }
  })
  questions.value = qs
  idx.value = 0; bonnes.value = 0; mauvaises.value = 0
  repondu.value = false; feedbackTxt.value = ''; feedbackCls.value = ''; reponseDonnee.value = ''
  phase.value = 'jeu'
}

// ── Fiche imprimable : relier majuscules et minuscules, par blocs de 6 lettres
function htmlFiche() {
  const e = echapper
  const pool = melanger([...getPool()])
  const nbBlocs = Math.ceil(pool.length / 6)
  // répartition équilibrée (26 lettres → 6 + 5 + 5 + 5 + 5)
  const blocs = Array.from({ length: nbBlocs }, (_, i) => pool.filter((_, j) => j % nbBlocs === i))
  const html = blocs.map(b => {
    const droite = melanger([...b])
    return `<div class="bloc">
      <div class="col">${b.map(l => `<div class="l"><span>${e(l)}</span><i></i></div>`).join('')}</div>
      <div class="col min">${droite.map(l => `<div class="l"><i></i><span>${e(l.toLowerCase())}</span></div>`).join('')}</div>
    </div>`
  }).join('')
  const titre = t('titre')
  return `<!DOCTYPE html><html lang="${langue.value}"><head>
    <meta charset="UTF-8"><title>${titre}</title>
    <style>
      ${cssPolices()}
      body { font-family: Arial, sans-serif; max-width: 700px; margin: 1.2cm auto; color: #222; }
      h1 { font-size: 1.3rem; border-bottom: 2px solid #333; padding-bottom: .4rem; margin-bottom: .5rem; }
      .entete { font-size: .85rem; color: #666; margin-bottom: .6rem; }
      .consigne { font-weight: 700; font-size: 1.1rem; margin: .4rem 0 1rem; }
      .blocs { display: grid; grid-template-columns: 1fr 1fr; gap: 1.2rem 2.5rem; }
      .bloc { display: flex; justify-content: space-between; border: 2px solid #ccc; border-radius: 14px; padding: .6rem 1rem; page-break-inside: avoid; }
      .col { display: flex; flex-direction: column; gap: .35rem; }
      .l { display: flex; align-items: center; gap: .7rem; font-family: '${POLICE_SCRIPT}', Arial, sans-serif; font-size: 2rem; font-weight: 700; line-height: 1.25; }
      .l span { min-width: 1.6em; text-align: center; }
      .l i { width: .5rem; height: .5rem; border-radius: 50%; background: #333; display: inline-block; }
    </style></head><body>
    <h1>${titre}</h1>
    <p class="entete">${t('prenom')} : ________________________ &nbsp; ${t('date')} : ______________</p>
    <p class="consigne">${t('fConsigne')}</p>
    <div class="blocs">${html}</div>
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
  if (i === idx.value) return 'current'
  if (r === undefined) return ''
  return r ? 'ok' : 'erreur'
}

function valider(c) {
  if (repondu.value) return
  reponseDonnee.value = c
  const ok = c === question.value.bonne
  question.value._resultat = ok
  repondu.value = true
  if (ok) {
    bonnes.value++
    const b = t('bravo'); feedbackTxt.value = b[Math.floor(Math.random() * b.length)]
    feedbackCls.value = 'ok'
  } else {
    mauvaises.value++
    feedbackTxt.value = `❌ ${t('cetait', { r: question.value.bonne })}`
    feedbackCls.value = 'erreur'
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
  repondu.value = false; feedbackTxt.value = ''; feedbackCls.value = ''; reponseDonnee.value = ''
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
.container { max-width: 560px; margin: 0 auto; padding: 1rem; }
h1 { color: var(--bleu); margin-bottom: 1rem; }

.config-box { background: white; border-radius: var(--radius); box-shadow: var(--shadow); padding: 1.5rem; }
.config-section { margin-bottom: 1.25rem; }
.config-section-title { font-weight: 700; margin-bottom: .6rem; font-size: .9rem; text-transform: uppercase; letter-spacing: .04em; color: #555; }

.mode-cards { display: grid; grid-template-columns: 1fr 1fr; gap: .75rem; }
.mode-card {
  border: 3px solid var(--gris-brd); border-radius: var(--radius);
  padding: 1rem; cursor: pointer; transition: all .15s; text-align: center;
  background: white; font-family: inherit; width: 100%;
}
.mode-card:hover  { border-color: var(--bleu); }
.mode-card:focus-visible { outline: 3px solid var(--bleu); outline-offset: 2px; }
.mode-card.active { border-color: var(--bleu); background: #eef5ff; }
.mode-icon  { font-size: 1.75rem; }
.mode-title { font-weight: 800; font-size: .9rem; margin: .25rem 0 .15rem; }
.mode-desc  { font-size: .75rem; color: #666; }

.exercise-box { background: white; border-radius: var(--radius); box-shadow: var(--shadow); padding: 1.5rem; }

.lettre-display {
  font-size: 5rem; font-weight: 900; color: var(--bleu);
  line-height: 1; margin: .5rem 0 1rem;
  font-family: 'Comic Sans MS', 'Chalkboard SE', cursive, sans-serif;
}
.question-label { font-size: 1rem; font-weight: 600; color: #555; margin-bottom: .75rem; }

.choix-lettres { display: flex; flex-wrap: wrap; gap: .6rem; justify-content: center; margin-bottom: .5rem; }
.choix-lettre-btn {
  width: 68px; height: 68px;
  border: 3px solid var(--gris-brd); border-radius: 12px;
  font-size: 2rem; font-weight: 900; font-family: inherit;
  background: white; cursor: pointer; transition: all .15s;
  display: flex; align-items: center; justify-content: center;
}
.choix-lettre-btn:hover:not(:disabled) { border-color: var(--bleu); background: #eef5ff; }
.choix-lettre-btn:focus-visible { outline: 3px solid var(--bleu); outline-offset: 2px; }
.choix-lettre-btn.bonne   { border-color: #22c55e; background: #f0fdf4; color: #15803d; }
.choix-lettre-btn.mauvaise{ border-color: var(--rouge); background: #fff5f5; color: var(--rouge); }
.choix-lettre-btn:disabled { cursor: default; }

.feedback { padding: .6rem 1rem; border-radius: 8px; font-weight: 600; margin-top: .5rem; font-size: .95rem; }
.feedback.ok     { background: #f0fdf4; color: #15803d; }
.feedback.erreur { background: #fff5f5; color: var(--rouge); }

.result-score { font-size: 3rem; font-weight: 900; color: var(--bleu); }
.result-msg   { font-size: 1.1rem; margin: .5rem 0 1.5rem; }
.note-fiche { color: #666; font-size: .95rem; margin: 0; }
</style>
