<template>
  <div class="container">
    <h1 class="section-heading">🔢 {{ t('titre') }}</h1>

    <!-- Config -->
    <div v-if="phase === 'config'" class="config-box">
      <div class="config-section">
        <div class="config-section-title">{{ t('niveau') }}</div>
        <div class="btn-group">
          <button class="level-btn" :class="{ active: config.niveau === 'ms' }" @click="config.niveau = 'ms'">
            🌱 {{ t('jusqua', { niv: 'MS', n: 6 }) }}
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
      <div style="text-align:center;margin-top:1.5rem;">
        <button class="btn btn-primary" style="font-size:1.2rem;padding:.85rem 2.5rem;" @click="demarrer">
          {{ t('commencer') }}
        </button>
      </div>
    </div>

    <!-- Exercice -->
    <template v-if="phase === 'jeu'">
      <div class="score-bar">
        <span>{{ t('question', { n: idx + 1, total: questions.length }) }}</span>
        <span>⭐ {{ bonnes }} &nbsp; 💔 {{ mauvaises }}</span>
      </div>

      <div class="mat-box">
        <!-- Objets à compter -->
        <div class="consigne">{{ t('combien', { nom: tr(questions[idx].noms) }) }}</div>
        <div class="objets-grille">
          <span v-for="i in questions[idx].nb" :key="i" class="objet" :class="animClass">
            {{ questions[idx].emoji }}
          </span>
        </div>

        <!-- Choix de réponse -->
        <div class="choix-grille">
          <button v-for="c in questions[idx].choix" :key="c"
            class="choix-btn"
            :class="etatChoix(c)"
            :disabled="repondu"
            @click="repondre(c)">
            {{ c }}
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

const { t, tr } = useI18n({
  fr: {
    titre: 'Compter les objets',
    jusqua: "{niv} — jusqu'à {n}",
    combien: 'Combien y a-t-il de {nom} ?',
    ilYAvait: 'Il y avait {n} {emoji}',
    resultat5: 'Parfait ! Bravo ! 🏆', resultat4: 'Très bien ! 🌟', resultat3: 'Bien ! Continue ! 💪',
    resultat0: 'On peut encore progresser ! 📚',
  },
  br: {
    titre: 'Kontañ an traoù',
    jusqua: '{niv} — betek {n}',
    // « pet » + anv unan : Pet aval a zo ?
    combien: 'Pet {nom} a zo ?',
    ilYAvait: '{n} {emoji} a oa',
    resultat5: 'Dispar ! Brav eo ! 🏆', resultat4: 'Mat-tre ! 🌟', resultat3: "Mat ! Kendalc'h ! 💪",
    resultat0: "Gallout a reer ober gwelloc'h c'hoazh ! 📚",
  },
})

const OBJETS = [
  // br : anv unan (singulier) après « pet »
  { emoji: '🍎', nom: 'pomme',     pluriel: 'pommes',      br: 'aval' },
  { emoji: '⭐', nom: 'étoile',    pluriel: 'étoiles',     br: 'steredenn' },
  { emoji: '🐱', nom: 'chat',      pluriel: 'chats',       br: 'kazh' },
  { emoji: '🌸', nom: 'fleur',     pluriel: 'fleurs',      br: 'bleunienn' },
  { emoji: '🚗', nom: 'voiture',   pluriel: 'voitures',    br: 'karr' },
  { emoji: '🦋', nom: 'papillon',  pluriel: 'papillons',   br: 'balafenn' },
  { emoji: '🐸', nom: 'grenouille',pluriel: 'grenouilles', br: 'glesker' }, // br: à relire (ou « ran »)
  { emoji: '🍓', nom: 'fraise',    pluriel: 'fraises',     br: 'sivienn' },
  { emoji: '🐠', nom: 'poisson',   pluriel: 'poissons',    br: 'pesk' },
  { emoji: '🌙', nom: 'lune',      pluriel: 'lunes',       br: 'loar' },
]

const config = ref({ niveau: 'ms', nbQ: 10 })
const phase = ref('config')
const questions = ref([])
const idx = ref(0)
const bonnes = ref(0)
const mauvaises = ref(0)
const repondu = ref(false)
const reponseChoisie = ref(null)
const feedback = ref('')
const feedbackClass = ref('')
const animClass = ref('')

function maxNb() { return config.value.niveau === 'ms' ? 6 : 10 }

function generer() {
  const max = maxNb()
  const nb = aleatoire(1, max)
  const objet = OBJETS[aleatoire(0, OBJETS.length - 1)]

  // 4 choix : la bonne réponse + 3 distracteurs proches
  const mauvais = new Set()
  while (mauvais.size < 3) {
    const d = aleatoire(Math.max(1, nb - 3), Math.min(max, nb + 3))
    if (d !== nb) mauvais.add(d)
  }
  const choix = melanger([nb, ...mauvais])

  return { nb, emoji: objet.emoji, nomPluriel: objet.pluriel, noms: { fr: objet.pluriel, br: objet.br }, choix, reponse: nb }
}

function demarrer() {
  questions.value = Array.from({ length: config.value.nbQ }, generer)
  idx.value = 0; bonnes.value = 0; mauvaises.value = 0
  phase.value = 'jeu'
  resetQuestion()
}

function resetQuestion() {
  repondu.value = false; reponseChoisie.value = null
  feedback.value = ''; feedbackClass.value = ''
  animClass.value = 'pop-in'
  setTimeout(() => { animClass.value = '' }, 400)
}

function etatChoix(c) {
  if (!repondu.value) return ''
  const q = questions.value[idx.value]
  if (c === q.reponse) return 'bonne'
  if (c === reponseChoisie.value) return 'mauvaise'
  return ''
}

function repondre(c) {
  if (repondu.value) return
  repondu.value = true
  reponseChoisie.value = c
  const q = questions.value[idx.value]
  if (c === q.reponse) {
    const b = t('bravo'); feedback.value = b[aleatoire(0, b.length - 1)]
    feedbackClass.value = 'ok'
    bonnes.value++
  } else {
    feedback.value = t('ilYAvait', { n: q.reponse, emoji: q.emoji })
    feedbackClass.value = 'erreur'
    mauvaises.value++
  }
  setTimeout(suivant, 1200)
}

function suivant() {
  idx.value++
  if (idx.value >= questions.value.length) phase.value = 'resultats'
  else resetQuestion()
}

const etoilesScore = computed(() => {
  const pct = bonnes.value / questions.value.length
  if (pct === 1)   return 5
  if (pct >= 0.8)  return 4
  if (pct >= 0.6)  return 3
  if (pct >= 0.4)  return 2
  return 1
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
  background: white;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 2rem 1.5rem;
  max-width: 640px;
  margin: 0 auto;
  text-align: center;
}

.consigne {
  font-size: 1.4rem;
  font-weight: 800;
  margin-bottom: 1.25rem;
  color: var(--texte);
}

.objets-grille {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: .5rem;
  min-height: 6rem;
  align-items: center;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: var(--gris-bg);
  border-radius: 12px;
}

.objet {
  font-size: 2.6rem;
  line-height: 1;
  transition: transform .15s;
}
.objet:hover { transform: scale(1.1); }

@keyframes popIn {
  from { transform: scale(0); opacity: 0; }
  to   { transform: scale(1); opacity: 1; }
}
.pop-in .objet { animation: popIn .3s ease backwards; }
.pop-in .objet:nth-child(2)  { animation-delay: .05s; }
.pop-in .objet:nth-child(3)  { animation-delay: .10s; }
.pop-in .objet:nth-child(4)  { animation-delay: .15s; }
.pop-in .objet:nth-child(5)  { animation-delay: .20s; }
.pop-in .objet:nth-child(6)  { animation-delay: .25s; }
.pop-in .objet:nth-child(7)  { animation-delay: .30s; }
.pop-in .objet:nth-child(8)  { animation-delay: .35s; }
.pop-in .objet:nth-child(9)  { animation-delay: .40s; }
.pop-in .objet:nth-child(10) { animation-delay: .45s; }

.choix-grille {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: .75rem;
  margin-bottom: 1rem;
}

.choix-btn {
  font-size: 2.2rem;
  font-weight: 900;
  padding: .75rem;
  border-radius: 16px;
  border: 4px solid var(--gris-brd);
  background: white;
  cursor: pointer;
  transition: transform .1s, border-color .15s, background .15s;
  line-height: 1;
}
.choix-btn:hover:not(:disabled) { transform: scale(1.08); border-color: var(--bleu); }
.choix-btn:active:not(:disabled) { transform: scale(.95); }
.choix-btn:disabled { cursor: default; }
.choix-btn.bonne   { border-color: var(--vert);  background: #f0faf0; }
.choix-btn.mauvaise { border-color: var(--rouge); background: #fef0f0; }

.mat-score { font-size: 4rem; font-weight: 900; }
.mat-msg   { font-size: 1.3rem; color: #555; margin: .5rem 0; }
.etoiles   { font-size: 2.5rem; letter-spacing: .2rem; margin: .5rem 0; }
</style>
