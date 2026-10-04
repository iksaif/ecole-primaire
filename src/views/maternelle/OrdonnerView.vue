<template>
  <div class="container">
    <h1 class="section-heading">🔢 {{ t('titre') }}</h1>

    <!-- Config -->
    <ConfigExercice v-if="phase === 'config'" :config="config" v-model:mode="mode" :fiche="fiche"
      @commencer="demarrer" @regenerer="regenerer">
      <div class="config-section">
        <div class="config-section-title">{{ t('niveau') }}</div>
        <div class="btn-group">
          <button class="level-btn" :class="{ active: config.niveau === 'ms' }" @click="config.niveau = 'ms'">
            🌱 {{ t('nombresDe', { niv: 'MS', n: 5 }) }}
          </button>
          <button class="level-btn" :class="{ active: config.niveau === 'gs' }" @click="config.niveau = 'gs'">
            🌳 {{ t('nombresDe', { niv: 'GS', n: 10 }) }}
          </button>
        </div>
      </div>
      <div class="config-section">
        <div class="config-section-title">{{ t('petitGrand') }}</div>
        <div class="btn-group">
          <button class="level-btn" :class="{ active: config.sens === 'croissant' }" @click="config.sens = 'croissant'">
            ↗ {{ t('croissant') }}
          </button>
          <button class="level-btn" :class="{ active: config.sens === 'decroissant' }" @click="config.sens = 'decroissant'">
            ↘ {{ t('decroissant') }}
          </button>
          <button class="level-btn" :class="{ active: config.sens === 'mix' }" @click="config.sens = 'mix'">
            🔀 {{ t('melange') }}
          </button>
        </div>
      </div>
      <div class="config-section">
        <div class="config-section-title">{{ t('combien') }}</div>
        <div class="btn-group">
          <button v-for="n in [3, 4, 5]" :key="n"
            class="level-btn" :class="{ active: config.taille === n }" @click="config.taille = n">{{ n }}</button>
        </div>
      </div>
      <div class="config-section">
        <div class="config-section-title">{{ t('nbQuestions') }}</div>
        <div class="btn-group">
          <button v-for="n in [5, 10]" :key="n"
            class="level-btn" :class="{ active: config.nbQ === n }" @click="config.nbQ = n">{{ n }}</button>
        </div>
      </div>
    </ConfigExercice>

    <!-- Exercice -->
    <template v-if="phase === 'jeu'">
      <div class="score-bar">
        <span>{{ t('question', { n: idx + 1, total: questions.length }) }}</span>
        <span>⭐ {{ bonnes }} &nbsp; 💔 {{ mauvaises }}</span>
      </div>

      <div class="mat-box">
        <div class="consigne">
          {{ sensCourant === 'croissant' ? '⬆️ ' + t('rangeCroissant') : '⬇️ ' + t('rangeDecroissant') }}
        </div>

        <!-- Zone de réponse (nombres cliqués dans l'ordre) -->
        <div class="reponse-zone">
          <div v-for="(n, i) in selection" :key="i"
               class="reponse-slot filled"
               :class="{ 'erreur-slot': validé && !reponseOk }">
            {{ n }}
          </div>
          <!-- Slots vides restants -->
          <div v-for="i in (questions[idx].nombres.length - selection.length)" :key="'v'+i"
               class="reponse-slot vide">
            _
          </div>
        </div>

        <div class="fleche-hint">
          {{ sensCourant === 'croissant' ? '→ ' + t('petitGrandMin') : '→ ' + t('grandPetitMin') }}
        </div>

        <!-- Nombres à choisir (désordre) -->
        <div class="nombres-grille">
          <button v-for="n in questions[idx].nombres" :key="n"
            class="nombre-btn"
            :class="{ selectionne: selection.includes(n) }"
            :disabled="selection.includes(n) || validé"
            @click="choisir(n)">
            {{ n }}
          </button>
        </div>

        <div class="btn-row-small">
          <button class="btn btn-ghost" @click="effacer" :disabled="selection.length === 0 || validé">
            ✏️ {{ t('effacerTxt') }}
          </button>
          <button class="btn btn-primary" @click="valider"
                  :disabled="selection.length < questions[idx].nombres.length || validé">
            {{ t('valider') }}
          </button>
        </div>

        <div class="feedback" :class="feedbackClass">{{ feedback }}</div>
      </div>
    </template>

    <!-- Résultats -->
    <div v-if="phase === 'resultats'" class="mat-box" style="text-align:center;">
      <div class="mat-score">{{ bonnes }} / {{ questions.length }}</div>
      <div class="mat-msg">{{ resultMsg }}</div>
      <div class="etoiles">
        <span v-for="i in 5" :key="i">{{ i <= etoilesScore ? '⭐' : '☆' }}</span>
      </div>
      <div class="btn-group" style="justify-content:center;margin-top:1.5rem;">
        <button class="btn btn-primary" @click="demarrer">{{ t('rejouer') }}</button>
        <button class="btn btn-ghost"   @click="phase = 'config'">{{ t('parametres') }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { aleatoire, melanger, confettis } from '../../utils'
import { useI18n } from '../../i18n'
import messagesFr from '../../i18n/fr/views/maternelle/OrdonnerView.js'
import messagesBr from '../../i18n/br/views/maternelle/OrdonnerView.js'
import ConfigExercice from '../../components/ConfigExercice.vue'
import { useModeExercice } from '../../composables/useModeExercice'
import { ligneNomDate } from '../../composables/useOptionsFiche'

const { t, langue } = useI18n({ fr: messagesFr, br: messagesBr })

const config = ref({ niveau: 'ms', sens: 'croissant', taille: 4, nbQ: 10 })
const phase = ref('config')
const questions = ref([])
const idx = ref(0)
const bonnes = ref(0)
const mauvaises = ref(0)
const selection = ref([])
const validé = ref(false)
const reponseOk = ref(false)
const feedback = ref('')
const feedbackClass = ref('')

function maxNb() { return config.value.niveau === 'ms' ? 5 : 10 }

function genererSens() {
  return config.value.sens === 'mix'
    ? (Math.random() > .5 ? 'croissant' : 'decroissant')
    : config.value.sens
}

const sensCourant = computed(() => questions.value[idx.value]?.sens ?? 'croissant')

function generer() {
  const max = maxNb()
  const pool = Array.from({ length: max }, (_, i) => i + 1)
  const choix = melanger(pool).slice(0, config.value.taille)
  const sens = genererSens()
  const bonne = [...choix].sort((a, b) => sens === 'croissant' ? a - b : b - a)
  return { nombres: melanger(choix), bonne, sens }
}

// ── Fiche imprimable : nombres en désordre à recopier dans l'ordre (avec corrigé)
function htmlFiche() {
  const qs = Array.from({ length: config.value.nbQ }, generer)
  const lignes = qs.map((q, i) => {
    const cr = q.sens === 'croissant'
    return `<div class="item"><div class="sens">${i + 1}. ${cr ? '⬆️ ' + t('rangeCroissant') : '⬇️ ' + t('rangeDecroissant')}</div>
      <div class="ligne"><div class="nombres">${q.nombres.map(n => `<span>${n}</span>`).join('')}</div>
      <div class="cases">${q.nombres.map(() => '<span class="case"></span>').join(`<span class="signe">${cr ? '&lt;' : '&gt;'}</span>`)}</div></div></div>`
  }).join('')
  const titre = t('titre')
  return `<!DOCTYPE html><html lang="${langue.value}"><head>
    <meta charset="UTF-8"><title>${titre}</title>
    <style>
      body { font-family: Arial, sans-serif; max-width: 700px; margin: 1.2cm auto; color: #222; }
      h1 { font-size: 1.3rem; border-bottom: 2px solid #333; padding-bottom: .4rem; margin-bottom: .5rem; }
      .consigne { font-weight: 700; font-size: 1.1rem; margin: .4rem 0 1rem; }
      .item { margin-bottom: 1rem; page-break-inside: avoid; }
      .sens { font-size: .9rem; color: #555; font-weight: 700; margin-bottom: .3rem; }
      .ligne { display: flex; align-items: center; gap: 1.5rem; flex-wrap: wrap; }
      .nombres { display: flex; gap: .5rem; }
      .nombres span { font-size: 1.6rem; font-weight: 800; border: 2px solid #999; border-radius: 50%; width: 2.6rem; height: 2.6rem;
        display: inline-flex; align-items: center; justify-content: center; }
      .cases { display: flex; align-items: center; gap: .3rem; }
      .case { width: 2.8rem; height: 2.8rem; border: 2.5px solid #444; border-radius: 8px; display: inline-block; }
      .signe { font-size: 1.3rem; color: #888; font-weight: 700; }
      .corr { font-size: 1.1rem; line-height: 2; }
    </style></head><body>
    <h1>${titre}</h1>
    ${ligneNomDate(langue.value)}
    <p class="consigne">${t('fConsigne')}</p>
    ${lignes}
    <section class="corrige"><h2>${t('corrige')} — ${titre}</h2>
      <div class="corr">${qs.map((q, i) => `<div>${i + 1}. ${q.bonne.join(q.sens === 'croissant' ? ' &lt; ' : ' &gt; ')}</div>`).join('')}</div></section>
  </body></html>`
}

const { mode, graine, regenerer } = useModeExercice()
const fiche = computed(() => {
  if (mode.value !== 'imprimer') return ''
  graine.value
  return htmlFiche()
})

function demarrer() {
  questions.value = Array.from({ length: config.value.nbQ }, generer)
  idx.value = 0; bonnes.value = 0; mauvaises.value = 0
  phase.value = 'jeu'; resetQ()
}

function resetQ() {
  selection.value = []; validé.value = false; reponseOk.value = false
  feedback.value = ''; feedbackClass.value = ''
}

function choisir(n) {
  if (selection.value.includes(n) || validé.value) return
  selection.value = [...selection.value, n]
}

function effacer() {
  selection.value = selection.value.slice(0, -1)
}

function valider() {
  const q = questions.value[idx.value]
  if (selection.value.length < q.nombres.length) return
  validé.value = true
  const ok = selection.value.join(',') === q.bonne.join(',')
  reponseOk.value = ok
  if (ok) {
    const b = t('bravo'); feedback.value = b[aleatoire(0, b.length - 1)]
    feedbackClass.value = 'ok'; bonnes.value++
  } else {
    feedback.value = `❌ ${t('ordreCorrect', { ordre: q.bonne.join(' → ') })}`
    feedbackClass.value = 'erreur'; mauvaises.value++
  }
  setTimeout(() => { idx.value++; if (idx.value >= questions.value.length) phase.value = 'resultats'; else resetQ() }, 1400)
}

const etoilesScore = computed(() => {
  const p = bonnes.value / questions.value.length
  return p === 1 ? 5 : p >= .8 ? 4 : p >= .6 ? 3 : p >= .4 ? 2 : 1
})
const resultMsg = computed(() => {
  const e = etoilesScore.value
  if (e === 5) { confettis(50); return t('resultat5') }
  if (e >= 4)  { confettis(25); return t('resultat4') }
  if (e >= 3)  return t('resultat3')
  return t('resultat0')
})
</script>

<style scoped>
.mat-box {
  background: white; border-radius: var(--radius); box-shadow: var(--shadow);
  padding: 2rem 1.5rem; max-width: 640px; margin: 0 auto; text-align: center;
}
.consigne { font-size: 1.3rem; font-weight: 800; margin-bottom: 1.25rem; }

.reponse-zone {
  display: flex; gap: .75rem; justify-content: center;
  margin-bottom: .5rem; flex-wrap: wrap;
}
.reponse-slot {
  width: 4rem; height: 4rem; border-radius: 12px; display: flex;
  align-items: center; justify-content: center;
  font-size: 2rem; font-weight: 900;
  border: 3px solid var(--gris-brd);
}
.reponse-slot.vide  { color: #ccc; border-style: dashed; }
.reponse-slot.filled { border-color: var(--bleu); background: #eef5ff; color: var(--bleu); }
.reponse-slot.erreur-slot { border-color: var(--rouge); background: #fef0f0; color: var(--rouge); }

.fleche-hint { font-size: .85rem; color: #aaa; margin-bottom: 1.25rem; }

.nombres-grille {
  display: flex; gap: 1rem; justify-content: center;
  flex-wrap: wrap; margin-bottom: 1.25rem;
}
.nombre-btn {
  width: 4.5rem; height: 4.5rem; font-size: 2.2rem; font-weight: 900;
  border-radius: 50%; border: 4px solid var(--orange);
  background: white; cursor: pointer; transition: all .15s; color: var(--orange);
}
.nombre-btn:hover:not(:disabled) { background: #fff5e0; transform: scale(1.08); }
.nombre-btn.selectionne { opacity: .3; cursor: default; }
.nombre-btn:disabled:not(.selectionne) { cursor: default; }

.btn-row-small { display: flex; gap: .75rem; justify-content: center; margin-bottom: .75rem; }

.mat-score { font-size: 4rem; font-weight: 900; }
.mat-msg   { font-size: 1.3rem; color: #555; margin: .5rem 0; }
.etoiles   { font-size: 2.5rem; letter-spacing: .2rem; margin: .5rem 0; }
</style>
