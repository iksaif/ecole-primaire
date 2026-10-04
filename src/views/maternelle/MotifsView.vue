<template>
  <div class="container">
    <h1 class="section-heading">🔁 {{ t('titre') }}</h1>

    <ConfigExercice v-if="phase === 'config'" :config="config" v-model:mode="mode" :fiche="fiche"
      @commencer="demarrer" @regenerer="regenerer">
      <div class="config-section">
        <div class="config-section-title">{{ t('niveau') }}</div>
        <div class="btn-group">
          <button v-for="n in ['ps', 'ms', 'gs']" :key="n" class="level-btn" :class="{ active: config.niveau === n }" @click="choisirNiveau(n)">
            {{ t('niv_' + n) }}
          </button>
        </div>
      </div>
      <div class="config-section">
        <div class="config-section-title">{{ t('exercice') }}</div>
        <div class="btn-group">
          <button class="level-btn" :class="{ active: config.mode === 'apres' }" @click="config.mode = 'apres'">➡️ {{ t('apres') }}</button>
          <button class="level-btn" :class="{ active: config.mode === 'trou' }" @click="config.mode = 'trou'">🔍 {{ t('trou') }}</button>
        </div>
      </div>
      <div class="config-section">
        <div class="config-section-title">{{ t('nbQuestions') }}</div>
        <div class="btn-group">
          <button v-for="n in [5, 10]" :key="n" class="level-btn" :class="{ active: config.nbQ === n }" @click="config.nbQ = n">{{ n }}</button>
        </div>
      </div>
    </ConfigExercice>

    <template v-if="phase === 'jeu' && q">
      <div class="score-bar">
        <span>{{ t('question', { n: idx + 1, total: questions.length }) }}</span>
        <span>⭐ {{ bonnes }}</span>
      </div>
      <div class="mat-box">
        <ConsigneParlee :key="idx" class="consigne" :texte="t(config.mode === 'trou' ? 'consigneTrou' : 'consigneApres')" />
        <!-- la frise ; la case « ? » à la place attendue -->
        <div class="frise">
          <template v-for="(e, i) in frise" :key="i">
            <span v-if="i === q.place" class="perle vide" :class="{ trouvee: repondu }">{{ repondu ? q.elements[q.attendu] : '?' }}</span>
            <span v-else class="perle">{{ q.elements[e] }}</span>
          </template>
        </div>
        <div class="choix-grille" :style="{ gridTemplateColumns: `repeat(${q.choix.length}, 1fr)` }">
          <button v-for="c in q.choix" :key="c" class="choix-btn" :class="etat(c)" :disabled="repondu" @click="repondre(c)">
            {{ q.elements[c] }}
          </button>
        </div>
        <div class="feedback" :class="feedbackClass">{{ feedback }}</div>
      </div>
    </template>

    <div v-if="phase === 'resultats'" class="mat-box" style="text-align:center;">
      <div class="mat-score">{{ bonnes }} / {{ questions.length }}</div>
      <div class="etoiles"><span v-for="i in 5" :key="i">{{ i <= etoilesScore ? '⭐' : '☆' }}</span></div>
      <div class="btn-group" style="justify-content:center;margin-top:1.5rem;">
        <button class="btn btn-primary" @click="demarrer">{{ t('rejouer') }}</button>
        <button class="btn btn-ghost" @click="phase = 'config'">{{ t('parametres') }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { melanger, confettis, chargerReglages, sauvegarder } from '../../utils'
import { question as questionMotif, nbElements, suite } from '../../utils/motifs'
import { useI18n } from '../../i18n'
import messagesFr from '../../i18n/fr/views/maternelle/MotifsView.js'
import messagesBr from '../../i18n/br/views/maternelle/MotifsView.js'
import ConfigExercice from '../../components/ConfigExercice.vue'
import ConsigneParlee from '../../components/ConsigneParlee.vue'
import { useModeExercice } from '../../composables/useModeExercice'
import { ligneNomDate } from '../../composables/useOptionsFiche'
import { useClasse } from '../../composables/useClasse'
import { estMaternelle } from '../../data/classes'

const { t, langue } = useI18n({ fr: messagesFr, br: messagesBr })

// Éléments des frises : couleurs, formes et images (4 par thème : ABCD au plus)
const THEMES = [
  ['🔴', '🔵', '🟡', '🟢'], ['⭐', '🌙', '☀️', '☁️'], ['🍎', '🍌', '🍇', '🍓'],
  ['🐱', '🐶', '🐰', '🐻'], ['🟥', '🟦', '🟨', '🟩'], ['🌸', '🍀', '🍄', '🌻'],
]

// niveau : celui de la barre du haut s'il est de maternelle ; PS : 5 questions, 2 choix
const classe = useClasse()
const config = ref(chargerReglages('motifs_config', { niveau: 'ms', mode: 'apres', nbQ: 10 }))
if (estMaternelle(classe.value)) config.value.niveau = classe.value
if (config.value.niveau === 'ps') config.value.nbQ = 5
watch(config, v => sauvegarder('motifs_config', v), { deep: true })
function choisirNiveau(n) {
  config.value.niveau = n
  if (n === 'ps') config.value.nbQ = 5
}

const phase = ref('config')
const questions = ref([])
const idx = ref(0)
const bonnes = ref(0)
const repondu = ref(false)
const choisie = ref(null)
const feedback = ref('')
const feedbackClass = ref('')
const q = computed(() => questions.value[idx.value])
// en mode « après », la frise montre aussi la case « ? » au bout
const frise = computed(() => (q.value.place >= q.value.motif.length ? [...q.value.motif, null] : q.value.motif))

function generer() {
  const m = questionMotif(config.value.niveau, config.value.mode)
  const elements = melanger(THEMES[Math.floor(Math.random() * THEMES.length)])
  // PS : 2 choix (les deux éléments du motif) ; sinon les éléments du motif, complétés jusqu'à 3
  const dans = Array.from({ length: nbElements(m.type) }, (_, i) => i)
  const nb = config.value.niveau === 'ps' ? 2 : 3
  const choix = melanger([...dans, ...[0, 1, 2, 3].filter(i => !dans.includes(i))].slice(0, Math.max(nb, dans.length)))
  return { ...m, elements, choix: choix.includes(m.attendu) ? choix : [m.attendu, ...choix.slice(1)] }
}

function demarrer() {
  questions.value = Array.from({ length: config.value.nbQ }, generer)
  idx.value = 0; bonnes.value = 0
  phase.value = 'jeu'
  reset()
}
function reset() { repondu.value = false; choisie.value = null; feedback.value = ''; feedbackClass.value = '' }
function etat(c) {
  if (!repondu.value) return ''
  if (c === q.value.attendu) return 'bonne'
  return c === choisie.value ? 'mauvaise' : ''
}
function repondre(c) {
  if (repondu.value) return
  repondu.value = true; choisie.value = c
  if (c === q.value.attendu) { bonnes.value++; const b = t('bravo'); feedback.value = b[Math.floor(Math.random() * b.length)]; feedbackClass.value = 'ok' }
  else { feedback.value = t('regarde'); feedbackClass.value = 'erreur' }
  setTimeout(() => { idx.value++; if (idx.value >= questions.value.length) phase.value = 'resultats'; else reset() }, 1400)
}
const etoilesScore = computed(() => {
  const pct = bonnes.value / questions.value.length
  if (pct === 1) { confettis(40); return 5 }
  return pct >= 0.8 ? 4 : pct >= 0.6 ? 3 : pct >= 0.4 ? 2 : 1
})

// ── Fiche : frises à continuer (cases vides à dessiner ou à remplir de gommettes) ; PS : entourer ce qui vient après
function htmlFiche() {
  const ps = config.value.niveau === 'ps'
  const qs = Array.from({ length: ps ? 5 : 6 }, () => generer())
  const lignes = qs.map((x, i) => {
    const vus = x.place >= x.motif.length ? x.motif : x.motif.map((e, j) => (j === x.place ? null : e))
    const cases = vus.map(e => (e === null ? '<span class="case"></span>' : `<span>${x.elements[e]}</span>`)).join('')
    const fin = x.place >= x.motif.length ? (ps ? `<span class="fleche">→</span>${[...x.choix].map(c => `<span class="choix">${x.elements[c]}</span>`).join('')}` : '<span class="case"></span><span class="case"></span>') : ''
    return `<div class="ligne" data-type="${x.type}"><span class="num">${i + 1}.</span>${cases}${fin}</div>`
  }).join('')
  // corrigé : les deux éléments qui continuent la frise, ou l'élément du trou (PS : celui à entourer)
  const corr = qs.map((x, i) => {
    const deux = x.place >= x.motif.length && !ps
    const attendus = deux ? suite(x.type, x.place + 2).slice(x.place) : [x.attendu]
    return `<div>${i + 1}. ${attendus.map(e => x.elements[e]).join(' ')}</div>`
  }).join('')
  const titre = t('titre')
  return `<!DOCTYPE html><html lang="${langue.value}"><head>
    <meta charset="UTF-8"><title>${titre}</title>
    <style>
      body { font-family: Arial, sans-serif; max-width: 720px; margin: 1.2cm auto; color: #222; }
      h1 { font-size: 1.3rem; border-bottom: 2px solid #333; padding-bottom: .4rem; margin-bottom: .5rem; }
      .consigne { font-weight: 700; font-size: 1.1rem; margin: .4rem 0 1rem; }
      .ligne { display: flex; align-items: center; gap: .35rem; margin-bottom: 1.1rem; font-size: 1.9rem; page-break-inside: avoid; }
      .num { font-size: .9rem; font-weight: 700; color: #999; min-width: 1.6rem; }
      .case { width: 2.4rem; height: 2.4rem; border: 2.5px dashed #444; border-radius: 50%; display: inline-block; }
      .fleche { margin: 0 .6rem; color: #999; } .choix { border: 2px solid #bbb; border-radius: 12px; padding: 0 .3rem; margin-left: .4rem; }
      .corr { columns: 3; font-size: 1.3rem; line-height: 1.9; }
    </style></head><body>
    <h1>${titre}</h1>
    ${ligneNomDate(langue.value)}
    <p class="consigne">${t(ps ? 'fConsignePS' : config.value.mode === 'trou' ? 'fConsigneTrou' : 'fConsigne')}</p>
    ${lignes}
    <section class="corrige"><h2>${t('corrige')} — ${titre}</h2><div class="corr">${corr}</div></section>
  </body></html>`
}
const { mode, graine, regenerer } = useModeExercice()
const fiche = computed(() => {
  if (mode.value !== 'imprimer') return ''
  graine.value
  return htmlFiche()
})
</script>

<style scoped>
.mat-box { background: white; border-radius: var(--radius); box-shadow: var(--shadow); padding: 2rem 1.5rem; max-width: 720px; margin: 0 auto; text-align: center; }
.consigne { font-size: 1.4rem; font-weight: 800; margin-bottom: 1.25rem; }
.frise { display: flex; flex-wrap: wrap; justify-content: center; gap: .4rem; padding: 1rem; background: var(--gris-bg); border-radius: 14px; margin-bottom: 1.5rem; }
.perle { font-size: 2.4rem; line-height: 1; width: 3.2rem; height: 3.2rem; display: inline-flex; align-items: center; justify-content: center; }
.perle.vide { border: 3px dashed var(--bleu); border-radius: 50%; color: var(--bleu); font-weight: 900; font-size: 1.8rem; }
.perle.vide.trouvee { border-style: solid; font-size: 2.4rem; }
.choix-grille { display: grid; gap: .75rem; margin-bottom: 1rem; }
.choix-btn { font-size: 2.8rem; min-height: 6rem; border-radius: 16px; border: 4px solid var(--gris-brd); background: white; cursor: pointer; line-height: 1; }
.choix-btn:hover:not(:disabled) { transform: scale(1.06); border-color: var(--bleu); }
.choix-btn.bonne { border-color: var(--vert); background: #f0faf0; }
.choix-btn.mauvaise { border-color: var(--rouge); background: #fef0f0; }
.mat-score { font-size: 4rem; font-weight: 900; }
.etoiles { font-size: 2.5rem; letter-spacing: .2rem; margin: .5rem 0; }
</style>
