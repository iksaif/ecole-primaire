<template>
  <div class="container">
    <h1 class="section-heading">⚖️ {{ t('titre') }}</h1>

    <!-- Config -->
    <ConfigExercice v-if="phase === 'config'" :config="config" v-model:mode="mode" :fiche="fiche"
      @commencer="demarrer" @regenerer="regenerer">
      <div class="config-section">
        <div class="config-section-title">{{ t('niveau') }}</div>
        <div class="btn-group">
          <button class="level-btn" :class="{ active: config.niveau === 'ms' }" @click="config.niveau = 'ms'">
            🌱 {{ t('jusqua', { niv: 'MS', n: 5 }) }}
          </button>
          <button class="level-btn" :class="{ active: config.niveau === 'gs' }" @click="config.niveau = 'gs'">
            🌳 {{ t('jusqua', { niv: 'GS', n: 10 }) }}
          </button>
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
        <div class="consigne">{{ t('consigne') }}</div>

        <div class="groupes">
          <!-- Groupe gauche -->
          <div class="groupe" :class="{ gagnant: repondu && questions[idx].reponse === 'gauche', perdant: repondu && questions[idx].reponse !== 'gauche' && questions[idx].reponse !== 'egal' }">
            <div class="groupe-label">A</div>
            <div class="groupe-objets">
              <span v-for="i in questions[idx].gauche" :key="i" class="objet">
                {{ questions[idx].emoji }}
              </span>
            </div>
            <div class="groupe-nb">{{ questions[idx].gauche }}</div>
          </div>

          <div class="vs">?</div>

          <!-- Groupe droit -->
          <div class="groupe" :class="{ gagnant: repondu && questions[idx].reponse === 'droite', perdant: repondu && questions[idx].reponse !== 'droite' && questions[idx].reponse !== 'egal' }">
            <div class="groupe-label">B</div>
            <div class="groupe-objets">
              <span v-for="i in questions[idx].droite" :key="i" class="objet">
                {{ questions[idx].emoji }}
              </span>
            </div>
            <div class="groupe-nb">{{ questions[idx].droite }}</div>
          </div>
        </div>

        <!-- Boutons réponse -->
        <div class="reponses">
          <button class="rep-btn rep-a" :class="etatBtn('gauche')"
                  :disabled="repondu" @click="repondre('gauche')">
            👈 {{ t('aPlus', { g: 'A' }) }}
          </button>
          <button class="rep-btn rep-egal" :class="etatBtn('egal')"
                  :disabled="repondu" @click="repondre('egal')">
            = {{ t('pareil') }}
          </button>
          <button class="rep-btn rep-b" :class="etatBtn('droite')"
                  :disabled="repondu" @click="repondre('droite')">
            {{ t('aPlus', { g: 'B' }) }} 👉
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
import { aleatoire, confettis } from '../../utils'
import { useI18n } from '../../i18n'
import messagesFr from '../../i18n/fr/views/maternelle/ComparerView.js'
import messagesBr from '../../i18n/br/views/maternelle/ComparerView.js'
import ConfigExercice from '../../components/ConfigExercice.vue'
import { useModeExercice } from '../../composables/useModeExercice'

const { t, langue } = useI18n({ fr: messagesFr, br: messagesBr })

const EMOJIS = ['🍎','⭐','🐱','🌸','🚗','🦋','🍓','🐸','🐠','🌙','🍪','🎈']

const config = ref({ niveau: 'ms', nbQ: 10 })
const phase = ref('config')
const questions = ref([])
const idx = ref(0)
const bonnes = ref(0)
const mauvaises = ref(0)
const repondu = ref(false)
const feedback = ref('')
const feedbackClass = ref('')

function maxNb() { return config.value.niveau === 'ms' ? 5 : 10 }

function generer() {
  const max = maxNb()
  const gauche = aleatoire(1, max)
  const forceEgal = Math.random() < 0.2 // 20% de chance d'être égal
  const droite = forceEgal ? gauche : aleatoire(1, max)
  const emoji = EMOJIS[aleatoire(0, EMOJIS.length - 1)]
  let reponse
  if (gauche > droite) reponse = 'gauche'
  else if (droite > gauche) reponse = 'droite'
  else reponse = 'egal'
  return { gauche, droite, emoji, reponse }
}

// ── Fiche imprimable : deux groupes par ligne, entourer celui qui a le plus (pas d'égalité sur papier)
function htmlFiche() {
  const qs = Array.from({ length: config.value.nbQ }, () => {
    let q
    do { q = generer() } while (q.reponse === 'egal')
    return q
  })
  const groupe = (n, emoji) => `<div class="groupe">${`<span>${emoji}</span>`.repeat(n)}</div>`
  const lignes = qs.map((q, i) => `<div class="ligne"><span class="num">${i + 1}.</span>
    ${groupe(q.gauche, q.emoji)}${groupe(q.droite, q.emoji)}</div>`).join('')
  const titre = t('titre')
  return `<!DOCTYPE html><html lang="${langue.value}"><head>
    <meta charset="UTF-8"><title>${titre}</title>
    <style>
      body { font-family: Arial, sans-serif; max-width: 700px; margin: 1.2cm auto; color: #222; }
      h1 { font-size: 1.3rem; border-bottom: 2px solid #333; padding-bottom: .4rem; margin-bottom: .5rem; }
      .entete { font-size: .85rem; color: #666; margin-bottom: .6rem; }
      .consigne { font-weight: 700; font-size: 1.1rem; margin: .4rem 0 1rem; }
      .ligne { display: flex; align-items: center; gap: 1.5rem; margin-bottom: .8rem; page-break-inside: avoid; }
      .num { font-weight: 700; color: #999; min-width: 1.5rem; }
      .groupe { flex: 1; border: 2px dashed #bbb; border-radius: 18px; padding: .6rem; min-height: 4.2rem;
        display: flex; flex-wrap: wrap; gap: .3rem; justify-content: center; align-content: center; font-size: 1.6rem; line-height: 1.1; }
      .corrige { page-break-before: always; break-before: page; }
      .corr { columns: 3; font-size: 1.1rem; line-height: 2; }
    </style></head><body>
    <h1>${titre}</h1>
    <p class="entete">${t('prenom')} : ________________________ &nbsp; ${t('date')} : ______________</p>
    <p class="consigne">${t('fConsigne')}</p>
    ${lignes}
    <div class="corrige"><h1>${t('corrige')} — ${titre}</h1>
      <div class="corr">${qs.map((q, i) => `<div>${i + 1}. ${q.reponse === 'gauche' ? `<b>${q.gauche}</b> &gt; ${q.droite}` : `${q.gauche} &lt; <b>${q.droite}</b>`}</div>`).join('')}</div></div>
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
  phase.value = 'jeu'
  resetQ()
}

function resetQ() {
  repondu.value = false; feedback.value = ''; feedbackClass.value = ''
}

function etatBtn(val) {
  if (!repondu.value) return ''
  const q = questions.value[idx.value]
  if (val === q.reponse) return 'bonne'
  return ''
}

function repondre(val) {
  if (repondu.value) return
  repondu.value = true
  const q = questions.value[idx.value]
  const ok = val === q.reponse
  if (ok) {
    const b = t('bravo'); feedback.value = b[aleatoire(0, b.length - 1)]
    feedbackClass.value = 'ok'; bonnes.value++
  } else {
    const msg = q.reponse === 'egal' ? t('memeNombre')
              : q.reponse === 'gauche' ? `${t('aPlus', { g: 'A' })} : ${q.gauche} > ${q.droite}`
              : `${t('aPlus', { g: 'B' })} : ${q.droite} > ${q.gauche}`
    feedback.value = `❌ ${msg}`
    feedbackClass.value = 'erreur'; mauvaises.value++
  }
  setTimeout(() => { idx.value++; if (idx.value >= questions.value.length) phase.value = 'resultats'; else resetQ() }, 1200)
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
  padding: 2rem 1.5rem; max-width: 700px; margin: 0 auto; text-align: center;
}
.consigne { font-size: 1.4rem; font-weight: 800; margin-bottom: 1.5rem; }

.groupes {
  display: flex; align-items: center; justify-content: center;
  gap: 1.5rem; margin-bottom: 1.5rem; flex-wrap: wrap;
}

.groupe {
  background: var(--gris-bg); border-radius: 16px;
  padding: 1rem; min-width: 140px; flex: 1; max-width: 220px;
  border: 4px solid var(--gris-brd); transition: border-color .2s, background .2s;
}
.groupe.gagnant { border-color: var(--vert); background: #f0faf0; }
.groupe.perdant { border-color: var(--rouge); background: #fef5f5; opacity: .7; }

.groupe-label { font-size: 1.6rem; font-weight: 900; color: var(--bleu); margin-bottom: .5rem; }
.groupe-objets { display: flex; flex-wrap: wrap; justify-content: center; gap: .25rem; min-height: 3.5rem; align-items: center; }
.objet { font-size: 2rem; }
.groupe-nb { font-size: 2rem; font-weight: 900; margin-top: .5rem; color: var(--texte); }

.vs { font-size: 2.5rem; font-weight: 900; color: #ccc; flex-shrink: 0; }

.reponses {
  display: grid; grid-template-columns: 1fr auto 1fr; gap: .75rem; margin-bottom: 1rem;
}
.rep-btn {
  font-size: 1.1rem; font-weight: 800; padding: .75rem .5rem;
  border-radius: 12px; border: 3px solid var(--gris-brd);
  background: white; cursor: pointer; transition: all .15s;
}
.rep-btn:hover:not(:disabled) { transform: scale(1.04); }
.rep-btn:disabled { cursor: default; }
.rep-a    { border-color: var(--bleu); color: var(--bleu); }
.rep-b    { border-color: var(--violet); color: var(--violet); }
.rep-egal { border-color: var(--orange); color: var(--orange); }
.rep-btn.bonne { background: var(--vert); border-color: var(--vert); color: white; }

.mat-score { font-size: 4rem; font-weight: 900; }
.mat-msg   { font-size: 1.3rem; color: #555; margin: .5rem 0; }
.etoiles   { font-size: 2.5rem; letter-spacing: .2rem; margin: .5rem 0; }
</style>
