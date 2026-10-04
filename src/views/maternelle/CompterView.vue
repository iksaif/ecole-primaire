<template>
  <div class="container">
    <h1 class="section-heading">🔢 {{ t('titre') }}</h1>

    <!-- Config -->
    <ConfigExercice v-if="phase === 'config'" :config="config" v-model:mode="mode" :fiche="fiche"
      @commencer="demarrer" @regenerer="regenerer">
      <div class="config-section">
        <div class="config-section-title">{{ t('niveau') }}</div>
        <div class="btn-group">
          <button class="level-btn" :class="{ active: config.niveau === 'ps' }" @click="choisirNiveau('ps')">
            🐣 {{ t('jusqua', { niv: 'PS', n: 3 }) }}
          </button>
          <button class="level-btn" :class="{ active: config.niveau === 'ms' }" @click="choisirNiveau('ms')">
            🌱 {{ t('jusqua', { niv: 'MS', n: 6 }) }}
          </button>
          <button class="level-btn" :class="{ active: config.niveau === 'gs' }" @click="choisirNiveau('gs')">
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
      <div v-if="mode === 'imprimer' && config.niveau !== 'ps'" class="config-section">
        <div class="config-section-title">{{ t('reponseFiche') }}</div>
        <div class="btn-group">
          <button class="level-btn" :class="{ active: ficheConfig.reponse === 'ecrire' }" @click="ficheConfig.reponse = 'ecrire'">✏️ {{ t('ecrire') }}</button>
          <button class="level-btn" :class="{ active: ficheConfig.reponse === 'entourer' }" @click="ficheConfig.reponse = 'entourer'">⭕ {{ t('entourer') }}</button>
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
        <!-- Objets à compter -->
        <ConsigneParlee class="consigne" :texte="t('combien', { nom: C.t(questions[idx].objet) })" />
        <div class="objets-grille">
          <span v-for="i in questions[idx].nb" :key="i" class="objet" :class="animClass">
            {{ questions[idx].emoji }}
          </span>
        </div>

        <!-- Choix de réponse -->
        <div class="choix-grille" :class="{ ps: config.niveau === 'ps' }" :style="{ gridTemplateColumns: `repeat(${questions[idx].choix.length}, 1fr)` }">
          <button v-for="c in questions[idx].choix" :key="c"
            class="choix-btn"
            :class="etatChoix(c)"
            :disabled="repondu"
            @click="repondre(c)">
            <!-- PS : la quantité en constellation de points (pas de chiffre seul) -->
            <span v-if="config.niveau === 'ps'" class="points"><span v-for="i in c" :key="i">●</span></span>
            <template v-else>{{ c }}</template>
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
import { ref, computed, watch } from 'vue'
import { aleatoire, melanger, confettis, chargerReglages, sauvegarder } from '../../utils'
import { useI18n, contenu } from '../../i18n'
import messagesFr from '../../i18n/fr/views/maternelle/CompterView.js'
import messagesBr from '../../i18n/br/views/maternelle/CompterView.js'
import objetsFr from '../../i18n/fr/contenu/compter.js'
import objetsBr from '../../i18n/br/contenu/compter.js'
import ConfigExercice from '../../components/ConfigExercice.vue'
import ConsigneParlee from '../../components/ConsigneParlee.vue'
import { useClasse } from '../../composables/useClasse'
import { estMaternelle } from '../../data/classes'
import { useModeExercice } from '../../composables/useModeExercice'
import { ligneNomDate } from '../../composables/useOptionsFiche'

const { t, langue } = useI18n({ fr: messagesFr, br: messagesBr })
const C = contenu({ fr: objetsFr, br: objetsBr }, () => langue.value)

// Objets à compter ; leur nom (contenu, langue de l'interface) est dans src/i18n/<langue>/contenu/compter.js
const OBJETS = [
  { emoji: '🍎', id: 'pomme' },
  { emoji: '⭐', id: 'etoile' },
  { emoji: '🐱', id: 'chat' },
  { emoji: '🌸', id: 'fleur' },
  { emoji: '🚗', id: 'voiture' },
  { emoji: '🦋', id: 'papillon' },
  { emoji: '🐸', id: 'grenouille' },
  { emoji: '🍓', id: 'fraise' },
  { emoji: '🐠', id: 'poisson' },
  { emoji: '🌙', id: 'lune' },
]

// niveau : celui de la barre du haut s'il est de maternelle ; PS : 5 questions (enfants de 3 ans)
const classe = useClasse()
const config = ref({ niveau: estMaternelle(classe.value) ? classe.value : 'ms', nbQ: classe.value === 'ps' ? 5 : 10 })
function choisirNiveau(n) {
  config.value.niveau = n
  if (n === 'ps') config.value.nbQ = 5
}
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

// PS : jusqu'à 3 (« voire 4 » : pas systématique) ; MS : 6 ; GS : 10 (programme.js, contraintes nombreMax)
function maxNb() { return { ps: 3, ms: 6, gs: 10 }[config.value.niveau] ?? 6 }

function generer() {
  const max = maxNb()
  const nb = aleatoire(1, max)
  const objet = OBJETS[aleatoire(0, OBJETS.length - 1)]

  // PS : toutes les valeurs (1, 2, 3) dans l'ordre ; sinon la bonne réponse et 3 distracteurs proches, tirés parmi
  // ceux qui existent (pas de boucle sans fin quand il y en a peu)
  if (config.value.niveau === 'ps') return { nb, emoji: objet.emoji, objet: objet.id, choix: [1, 2, 3], reponse: nb }
  const proches = melanger(Array.from({ length: max }, (_, i) => i + 1).filter(d => d !== nb && Math.abs(d - nb) <= 3))
  const choix = melanger([nb, ...proches.slice(0, 3)])

  return { nb, emoji: objet.emoji, objet: objet.id, choix, reponse: nb }
}

// ── Fiche imprimable : collections à compter, nombre à écrire ou à entourer (avec corrigé)
const ficheConfig = ref(chargerReglages('compter_fiche', { reponse: 'ecrire' }))
watch(ficheConfig, v => sauvegarder('compter_fiche', v), { deep: true })

function htmlFiche() {
  const qs = Array.from({ length: config.value.nbQ }, generer)
  // PS : on entoure toujours la bonne constellation (jamais de chiffre à écrire)
  const ps = config.value.niveau === 'ps'
  const ecrire = !ps && ficheConfig.value.reponse === 'ecrire'
  const pointsDe = n => `<span class="pts">${'●'.repeat(n)}</span>`
  const cases = qs.map((q, i) => `<div class="item"><span class="num">${i + 1}</span>
    <div class="objets">${`<span>${q.emoji}</span>`.repeat(q.nb)}</div>
    ${ecrire ? '<div class="case"></div>'
      : `<div class="choix${ps ? ' ps' : ''}">${[...q.choix].sort((a, b) => a - b).map(c => `<span>${ps ? pointsDe(c) : c}</span>`).join('')}</div>`}
  </div>`).join('')
  const titre = t('titre')
  return `<!DOCTYPE html><html lang="${langue.value}"><head>
    <meta charset="UTF-8"><title>${titre}</title>
    <style>
      body { font-family: Arial, sans-serif; max-width: 700px; margin: 1.2cm auto; color: #222; }
      h1 { font-size: 1.3rem; border-bottom: 2px solid #333; padding-bottom: .4rem; margin-bottom: .5rem; }
      .consigne { font-weight: 700; font-size: 1.1rem; margin: .4rem 0 1rem; }
      .grille { display: grid; grid-template-columns: 1fr 1fr; gap: .8rem; }
      .item { border: 2px solid #bbb; border-radius: 14px; padding: .6rem; display: flex; align-items: center; gap: .6rem; page-break-inside: avoid; position: relative; min-height: 6.2rem; }
      .num { position: absolute; top: .3rem; left: .5rem; font-size: .8rem; font-weight: 700; color: #999; }
      .objets { flex: 1; display: flex; flex-wrap: wrap; gap: .25rem; justify-content: center; font-size: 1.7rem; line-height: 1.1; }
      .case { width: 3.2rem; height: 3.2rem; border: 2.5px solid #444; border-radius: 8px; flex-shrink: 0; }
      .choix { display: grid; grid-template-columns: 1fr 1fr; gap: .2rem .6rem; font-size: 1.5rem; font-weight: 800; flex-shrink: 0; }
      .choix span { min-width: 1.5rem; text-align: center; }
      .corr { columns: 4; font-size: 1.15rem; line-height: 2; }
      .choix.ps { grid-template-columns: 1fr; gap: .5rem; } .pts { font-size: 1.1rem; letter-spacing: .15rem; }
    </style></head><body>
    <h1>${titre}</h1>
    ${ligneNomDate(langue.value)}
    <p class="consigne">${t(ecrire ? 'fConsigneEcrire' : 'fConsigneEntourer')}</p>
    <div class="grille">${cases}</div>
    <section class="corrige"><h2>${t('corrige')} — ${titre}</h2>
      <div class="corr">${qs.map((q, i) => `<div>${i + 1}. <b>${q.nb}</b></div>`).join('')}</div></section>
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
/* PS : gros boutons, points comme sur un dé */
.choix-grille.ps .choix-btn { min-height: 6rem; }
.points { display: inline-flex; gap: .35rem; font-size: 1.6rem; color: var(--bleu); min-height: 2.6rem; align-items: center; }

.mat-score { font-size: 4rem; font-weight: 900; }
.mat-msg   { font-size: 1.3rem; color: #555; margin: .5rem 0; }
.etoiles   { font-size: 2.5rem; letter-spacing: .2rem; margin: .5rem 0; }
</style>
