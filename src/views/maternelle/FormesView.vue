<template>
  <div class="container">
    <h1>🔷 Les formes</h1>

    <div v-if="phase === 'config'" class="config-box">
      <div class="config-section">
        <div class="config-section-title">Exercice</div>
        <div class="mode-cards">
          <button class="mode-card" :class="{ active: config.mode === 'reconnaitre' }" @click="config.mode = 'reconnaitre'">
            <div class="mode-icon">👁️</div>
            <div class="mode-title">Reconnaître</div>
            <div class="mode-desc">Trouve le nom de la forme</div>
          </button>
          <button class="mode-card" :class="{ active: config.mode === 'compter' }" @click="config.mode = 'compter'">
            <div class="mode-icon">🔢</div>
            <div class="mode-title">Compter les côtés</div>
            <div class="mode-desc">Combien de côtés a cette forme ?</div>
          </button>
          <button class="mode-card" :class="{ active: config.mode === 'trouver' }" @click="config.mode = 'trouver'">
            <div class="mode-icon">🔍</div>
            <div class="mode-title">Trouver la forme</div>
            <div class="mode-desc">Montre la forme qu'on te demande</div>
          </button>
        </div>
      </div>

      <div style="text-align:center;margin-top:1.5rem;">
        <button class="btn btn-primary" style="font-size:1.1rem;padding:.75rem 2rem;" @click="demarrer">
          ▶ Commencer
        </button>
      </div>
    </div>

    <template v-if="phase === 'jeu' && question">
      <div class="score-bar">
        <button class="btn-quitter" @click="phase = 'config'">✕ Quitter</button>
        <span>{{ idx + 1 }} / {{ questions.length }}</span>
        <span>✅ {{ bonnes }} &nbsp; ❌ {{ mauvaises }}</span>
      </div>
      <div class="prog-dots" style="max-width:680px;margin:0 auto .5rem;">
        <div v-for="(_, i) in questions" :key="i" class="prog-dot" :class="dotClass(i)"></div>
      </div>

      <div class="exercise-box" style="text-align:center;">

        <!-- Reconnaître : montre la forme SVG, trouve le nom -->
        <template v-if="config.mode === 'reconnaitre'">
          <div class="question-label">Comment s'appelle cette forme ?</div>
          <div class="forme-display" v-html="question.svg"></div>
          <div class="choix-grid-formes">
            <button v-for="c in question.choixObj" :key="c.nom"
              class="choix-forme-nommee" :class="reponduClass(c.nom)"
              :disabled="repondu" @click="valider(c.nom)">
              <span v-html="c.svgSmall"></span>
              <span class="choix-nom">{{ c.nom }}</span>
            </button>
          </div>
        </template>

        <!-- Compter les côtés -->
        <template v-if="config.mode === 'compter'">
          <div class="question-label">Combien de côtés a cette forme ?</div>
          <div class="forme-display" v-html="question.svg"></div>
          <div class="choix-grid choix-nb">
            <button v-for="c in question.choixNb" :key="c"
              class="choix-btn" :class="reponduClassNb(c)"
              :disabled="repondu" @click="validerNb(c)">{{ c }}</button>
          </div>
        </template>

        <!-- Trouver la forme : donne le nom, choisit le bon SVG -->
        <template v-if="config.mode === 'trouver'">
          <div class="question-label">Montre le / la <strong>{{ question.nom }}</strong></div>
          <div class="formes-grid">
            <button v-for="(f, i) in question.choixFormes" :key="i"
              class="forme-btn" :class="reponduClassForme(i)"
              :disabled="repondu" @click="validerForme(i, f)">
              <span v-html="f.svg"></span>
            </button>
          </div>
        </template>

        <div class="feedback" :class="feedbackCls" v-if="repondu">{{ feedbackTxt }}</div>
        <button v-if="repondu" class="btn btn-primary" style="margin-top:1rem;" @click="suivant">
          {{ idx + 1 < questions.length ? 'Suivant →' : 'Voir les résultats' }}
        </button>
      </div>
    </template>

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
import { melanger, confettis, sauvegarder, charger } from '../../utils'

// ── Formes géométriques avec SVG inline
const FORMES = [
  {
    nom: 'cercle', cotes: 0,
    svg: `<svg viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="40" fill="#4a90e2" opacity=".85"/></svg>`,
  },
  {
    nom: 'carré', cotes: 4,
    svg: `<svg viewBox="0 0 100 100" width="100" height="100"><rect x="15" y="15" width="70" height="70" fill="#e74c3c" opacity=".85"/></svg>`,
  },
  {
    nom: 'triangle', cotes: 3,
    svg: `<svg viewBox="0 0 100 100" width="100" height="100"><polygon points="50,10 90,90 10,90" fill="#2ecc71" opacity=".85"/></svg>`,
  },
  {
    nom: 'rectangle', cotes: 4,
    svg: `<svg viewBox="0 0 100 100" width="100" height="100"><rect x="10" y="25" width="80" height="50" fill="#f39c12" opacity=".85"/></svg>`,
  },
  {
    nom: 'losange', cotes: 4,
    svg: `<svg viewBox="0 0 100 100" width="100" height="100"><polygon points="50,5 95,50 50,95 5,50" fill="#9b59b6" opacity=".85"/></svg>`,
  },
  {
    nom: 'pentagone', cotes: 5,
    svg: `<svg viewBox="0 0 100 100" width="100" height="100"><polygon points="50,5 97,35 79,90 21,90 3,35" fill="#1abc9c" opacity=".85"/></svg>`,
  },
  {
    nom: 'hexagone', cotes: 6,
    svg: `<svg viewBox="0 0 100 100" width="100" height="100"><polygon points="50,5 93,27.5 93,72.5 50,95 7,72.5 7,27.5" fill="#e67e22" opacity=".85"/></svg>`,
  },
  {
    nom: 'ovale', cotes: 0,
    svg: `<svg viewBox="0 0 100 100" width="100" height="100"><ellipse cx="50" cy="50" rx="45" ry="28" fill="#e91e63" opacity=".85"/></svg>`,
  },
]

const config = ref(charger('formes_config', { mode: 'reconnaitre' }))
watch(config, v => sauvegarder('formes_config', v), { deep: true })

const phase = ref('config')
const questions = ref([])
const idx = ref(0)
const bonnes = ref(0)
const mauvaises = ref(0)
const repondu = ref(false)
const feedbackTxt = ref('')
const feedbackCls = ref('')
const reponseDonnee = ref(null)

const question = computed(() => questions.value[idx.value])

function autresFormes(exclure, n) {
  return melanger(FORMES.filter(f => f.nom !== exclure)).slice(0, n)
}

function demarrer() {
  const qs = melanger([...FORMES]).map(f => {
    const nbCotes = f.cotes
    const faussesCotes = melanger([0,1,2,3,4,5,6,7,8].filter(n => n !== nbCotes)).slice(0, 3)
    const choixNb = melanger([nbCotes, ...faussesCotes])

    const autresFm = autresFormes(f.nom, 3)
    const choixFormes = melanger([f, ...autresFm])
    const idxBonne = choixFormes.findIndex(x => x.nom === f.nom)

    const choixFormeNommee = melanger([f, ...autresFormes(f.nom, 3)])
    const choixObj = choixFormeNommee.map(x => ({
      nom: x.nom,
      svgSmall: x.svg.replace(/width="100" height="100"/, 'width="60" height="60"'),
    }))
    return {
      ...f,
      choix: choixObj.map(x => x.nom),
      choixObj,
      choixNb,
      choixFormes,
      idxBonne,
      _resultat: undefined,
    }
  })
  questions.value = qs
  idx.value = 0; bonnes.value = 0; mauvaises.value = 0
  repondu.value = false; feedbackTxt.value = ''; feedbackCls.value = ''; reponseDonnee.value = null
  phase.value = 'jeu'
}

function dotClass(i) {
  const r = questions.value[i]?._resultat
  if (i === idx.value) return 'current'
  if (r === undefined) return ''
  return r ? 'ok' : 'erreur'
}

function enregistrer(ok) {
  question.value._resultat = ok
  repondu.value = true
  if (ok) {
    bonnes.value++
    feedbackTxt.value = ['Bravo ! 🎉', 'Exact ! ⭐', 'Super ! 👏'][Math.floor(Math.random() * 3)]
    feedbackCls.value = 'ok'
  } else {
    mauvaises.value++
    feedbackCls.value = 'erreur'
  }
}

function valider(c) {
  if (repondu.value) return
  reponseDonnee.value = c
  const ok = c === question.value.nom
  if (!ok) feedbackTxt.value = `❌ C'est un ${question.value.nom}`
  enregistrer(ok)
}

function validerNb(c) {
  if (repondu.value) return
  reponseDonnee.value = c
  const ok = c === question.value.cotes
  if (!ok) feedbackTxt.value = `❌ Un ${question.value.nom} a ${question.value.cotes === 0 ? 'aucun côté droit' : question.value.cotes + ' côté' + (question.value.cotes > 1 ? 's' : '')}`
  enregistrer(ok)
}

function validerForme(i, f) {
  if (repondu.value) return
  reponseDonnee.value = i
  const ok = i === question.value.idxBonne
  if (!ok) feedbackTxt.value = `❌ C'était ${question.value.nom === 'ovale' || question.value.nom === 'hexagone' ? "l'" : 'le / la '}${question.value.nom}`
  enregistrer(ok)
}

function reponduClass(c) {
  if (!repondu.value) return ''
  if (c === question.value.nom) return 'bonne'
  if (c === reponseDonnee.value) return 'mauvaise'
  return ''
}

function reponduClassNb(c) {
  if (!repondu.value) return ''
  if (c === question.value.cotes) return 'bonne'
  if (c === reponseDonnee.value) return 'mauvaise'
  return ''
}

function reponduClassForme(i) {
  if (!repondu.value) return ''
  if (i === question.value.idxBonne) return 'bonne'
  if (i === reponseDonnee.value) return 'mauvaise'
  return ''
}

function suivant() {
  idx.value++
  if (idx.value >= questions.value.length) { phase.value = 'resultats'; return }
  repondu.value = false; feedbackTxt.value = ''; feedbackCls.value = ''; reponseDonnee.value = null
}

const resultMsg = computed(() => {
  const pct = bonnes.value / questions.value.length * 100
  if (pct === 100) { confettis(50); return 'Parfait ! Tu connais toutes les formes ! 🏆' }
  if (pct >= 75)   { confettis(25); return 'Très bien ! 🌟' }
  if (pct >= 50)   return 'Bien ! Regarde les formes autour de toi 💪'
  return 'Courage ! Observe les formes dans la classe 📐'
})
</script>

<style scoped>
.container { max-width: 600px; margin: 0 auto; padding: 1rem; }
h1 { color: var(--bleu); margin-bottom: 1rem; }

.config-box { background: white; border-radius: var(--radius); box-shadow: var(--shadow); padding: 1.5rem; }
.config-section { margin-bottom: 1.25rem; }
.config-section-title { font-weight: 700; margin-bottom: .6rem; font-size: .9rem; text-transform: uppercase; letter-spacing: .04em; color: #555; }

.mode-cards { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: .6rem; }
@media (max-width: 480px) { .mode-cards { grid-template-columns: 1fr; } }
.mode-card {
  border: 3px solid var(--gris-brd); border-radius: var(--radius);
  padding: .75rem; cursor: pointer; transition: all .15s; text-align: center;
  background: white; font-family: inherit; width: 100%;
}
.mode-card:hover { border-color: var(--bleu); }
.mode-card:focus-visible { outline: 3px solid var(--bleu); outline-offset: 2px; }
.mode-card.active { border-color: var(--bleu); background: #eef5ff; }
.mode-icon { font-size: 1.5rem; }
.mode-title { font-weight: 800; font-size: .85rem; margin: .2rem 0 .1rem; }
.mode-desc { font-size: .72rem; color: #666; }

.exercise-box { background: white; border-radius: var(--radius); box-shadow: var(--shadow); padding: 1.5rem; }
.question-label { font-size: 1.1rem; font-weight: 600; color: #444; margin-bottom: 1rem; }

.forme-display { display: flex; justify-content: center; margin-bottom: 1.25rem; }
.forme-display svg { filter: drop-shadow(0 4px 8px rgba(0,0,0,.15)); }

.choix-grid { display: flex; flex-wrap: wrap; gap: .6rem; justify-content: center; margin-bottom: .5rem; }

.choix-grid-formes { display: grid; grid-template-columns: 1fr 1fr; gap: .6rem; margin-bottom: .5rem; max-width: 380px; margin-left: auto; margin-right: auto; }
.choix-forme-nommee {
  display: flex; flex-direction: column; align-items: center; gap: .2rem;
  padding: .5rem .75rem; border: 2px solid var(--gris-brd); border-radius: 12px;
  background: white; cursor: pointer; transition: all .15s; font-family: inherit;
}
.choix-forme-nommee:hover:not(:disabled) { border-color: var(--bleu); background: #eef5ff; }
.choix-forme-nommee:focus-visible { outline: 3px solid var(--bleu); outline-offset: 2px; }
.choix-forme-nommee.bonne    { border-color: #22c55e; background: #f0fdf4; }
.choix-forme-nommee.mauvaise { border-color: var(--rouge); background: #fff5f5; }
.choix-forme-nommee:disabled { cursor: default; }
.choix-nom { font-size: .85rem; font-weight: 700; color: #444; }
.choix-nb { gap: .5rem; }
.choix-btn {
  padding: .55rem 1.1rem; border: 2px solid var(--gris-brd); border-radius: 10px;
  font-size: 1rem; font-weight: 700; font-family: inherit;
  background: white; cursor: pointer; transition: all .15s;
}
.choix-btn:hover:not(:disabled) { border-color: var(--bleu); background: #eef5ff; }
.choix-btn:focus-visible { outline: 3px solid var(--bleu); outline-offset: 2px; }
.choix-btn.bonne   { border-color: #22c55e; background: #f0fdf4; color: #15803d; }
.choix-btn.mauvaise{ border-color: var(--rouge); background: #fff5f5; color: var(--rouge); }
.choix-btn:disabled { cursor: default; }

/* Trouver la forme */
.formes-grid { display: grid; grid-template-columns: 1fr 1fr; gap: .75rem; margin-bottom: .5rem; }
.forme-btn {
  border: 3px solid var(--gris-brd); border-radius: 12px;
  padding: .5rem; background: white; cursor: pointer; transition: all .15s;
  display: flex; align-items: center; justify-content: center;
}
.forme-btn:hover:not(:disabled) { border-color: var(--bleu); background: #eef5ff; }
.forme-btn:focus-visible { outline: 3px solid var(--bleu); outline-offset: 2px; }
.forme-btn.bonne   { border-color: #22c55e; background: #f0fdf4; }
.forme-btn.mauvaise{ border-color: var(--rouge); background: #fff5f5; }
.forme-btn:disabled { cursor: default; }

.feedback { padding: .6rem 1rem; border-radius: 8px; font-weight: 600; margin-top: .5rem; }
.feedback.ok     { background: #f0fdf4; color: #15803d; }
.feedback.erreur { background: #fff5f5; color: var(--rouge); }

.result-score { font-size: 3rem; font-weight: 900; color: var(--bleu); }
.result-msg   { font-size: 1.1rem; margin: .5rem 0 1.5rem; }
</style>
