<template>
  <div class="container">
    <h1 class="section-heading">📏 {{ t('titre') }}</h1>

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
          <button class="level-btn" :class="{ active: config.mode === 'comparer' }" @click="config.mode = 'comparer'">↔️ {{ t('comparer') }}</button>
          <button class="level-btn" :class="{ active: config.mode === 'ranger' }" @click="config.mode = 'ranger'">📶 {{ t('ranger') }}</button>
        </div>
      </div>
    </ConfigExercice>

    <template v-if="phase === 'jeu' && q">
      <div class="score-bar">
        <span>{{ t('question', { n: idx + 1, total: questions.length }) }}</span>
        <span>⭐ {{ bonnes }}</span>
      </div>
      <div class="mat-box">
        <ConsigneParlee :key="idx" class="consigne" :texte="consigne" />
        <!-- comparer : on touche le crayon ; ranger : on touche les crayons du plus court au plus long -->
        <div class="crayons">
          <button v-for="(c, i) in q.crayons" :key="i" type="button" class="crayon-btn" :class="etat(i)" :disabled="fini" @click="toucher(i)">
            <svg :viewBox="`0 0 ${LARGEUR} 34`" class="crayon">
              <rect x="2" y="7" :width="c.longueur - 24" height="20" rx="4" :fill="c.couleur" />
              <polygon :points="`${c.longueur - 22},7 ${c.longueur},17 ${c.longueur - 22},27`" fill="#f3d2a2" />
              <polygon :points="`${c.longueur - 7},14 ${c.longueur},17 ${c.longueur - 7},20`" :fill="c.couleur" />
            </svg>
            <span v-if="q.ordre.includes(i)" class="rang">{{ q.ordre.indexOf(i) + 1 }}</span>
          </button>
        </div>
        <div class="feedback" :class="feedbackClass">{{ feedback }}</div>
      </div>
    </template>

    <div v-if="phase === 'resultats'" class="mat-box" style="text-align:center;">
      <div class="mat-score">{{ bonnes }} / {{ questions.length }}</div>
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
import { useI18n } from '../../i18n'
import messagesFr from '../../i18n/fr/views/maternelle/LongueursView.js'
import messagesBr from '../../i18n/br/views/maternelle/LongueursView.js'
import ConfigExercice from '../../components/ConfigExercice.vue'
import ConsigneParlee from '../../components/ConsigneParlee.vue'
import { useModeExercice } from '../../composables/useModeExercice'
import { ligneNomDate } from '../../composables/useOptionsFiche'
import { useClasse } from '../../composables/useClasse'
import { estMaternelle } from '../../data/classes'

const { t, langue } = useI18n({ fr: messagesFr, br: messagesBr })

// Comparer des longueurs (programme.js : comparer-longueurs-maternelle, BO n° 41 p. 69-70) :
// PS : longueurs très différentes (rapport ≥ 2), ranger 3 objets (l'escalier) ; MS : écarts plus petits, 4 objets ;
// GS : écarts fins, 5 objets. Les crayons partent tous du même bord (comparaison directe).
const NIVEAUX_LONG = { ps: { rapport: 2, nb: 3 }, ms: { rapport: 1.35, nb: 4 }, gs: { rapport: 1.15, nb: 5 } }
const LARGEUR = 300
const COULEURS = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#e91e8c']

const classe = useClasse()
const config = ref(chargerReglages('longueurs_config', { niveau: 'ms', mode: 'comparer', nbQ: 6 }))
if (estMaternelle(classe.value)) config.value.niveau = classe.value
watch(config, v => sauvegarder('longueurs_config', v), { deep: true })
function choisirNiveau(n) { config.value.niveau = n }

const phase = ref('config')
const questions = ref([])
const idx = ref(0)
const bonnes = ref(0)
const fini = ref(false)
const feedback = ref('')
const feedbackClass = ref('')
const q = computed(() => questions.value[idx.value])
const consigne = computed(() => (config.value.mode === 'ranger' ? t('consigneRanger') : t(q.value.cherche === 'long' ? 'consigneLong' : 'consigneCourt')))

// longueurs croissantes, chacune au moins `rapport` fois la précédente (en partant de 60 sur 300)
function longueurs(n, rapport) {
  const res = [55 + Math.floor(Math.random() * 20)]
  while (res.length < n) res.push(Math.min(LARGEUR - 4, Math.ceil(res.at(-1) * rapport) + Math.floor(Math.random() * 15)))
  return res
}
function generer() {
  const { rapport, nb } = NIVEAUX_LONG[config.value.niveau] ?? NIVEAUX_LONG.ms
  const n = config.value.mode === 'ranger' ? nb : 2
  const couleurs = melanger(COULEURS)
  const crayons = melanger(longueurs(n, n === 2 ? rapport : Math.min(rapport, 1.3)).map((longueur, i) => ({ longueur, couleur: couleurs[i] })))
  return { crayons, cherche: Math.random() < 0.5 ? 'long' : 'court', ordre: [] }
}

function demarrer() {
  questions.value = Array.from({ length: config.value.nbQ }, generer)
  idx.value = 0; bonnes.value = 0
  phase.value = 'jeu'; reset()
}
function reset() { fini.value = false; feedback.value = ''; feedbackClass.value = '' }
const rangsAttendus = c => [...c.crayons.keys()].sort((a, b) => c.crayons[a].longueur - c.crayons[b].longueur)
function etat(i) {
  if (config.value.mode === 'ranger') return q.value.ordre.includes(i) ? (q.value.ordre[q.value.ordre.indexOf(i)] === rangsAttendus(q.value)[q.value.ordre.indexOf(i)] ? 'bonne' : 'mauvaise') : ''
  if (!fini.value) return ''
  const attendu = rangsAttendus(q.value)[q.value.cherche === 'long' ? q.value.crayons.length - 1 : 0]
  return i === attendu ? 'bonne' : i === q.value.choisi ? 'mauvaise' : ''
}
function terminer(ok) {
  fini.value = true
  if (ok) { bonnes.value++; const b = t('bravo'); feedback.value = b[Math.floor(Math.random() * b.length)]; feedbackClass.value = 'ok' }
  else { feedback.value = t('regarde'); feedbackClass.value = 'erreur' }
  setTimeout(() => { idx.value++; if (idx.value >= questions.value.length) { phase.value = 'resultats'; if (bonnes.value === questions.value.length) confettis(40) } else reset() }, 1500)
}
function toucher(i) {
  if (fini.value) return
  const c = q.value
  if (config.value.mode === 'ranger') {
    if (c.ordre.includes(i)) return
    c.ordre.push(i)
    const attendu = rangsAttendus(c)
    if (c.ordre.at(-1) !== attendu[c.ordre.length - 1]) return terminer(false)
    if (c.ordre.length === c.crayons.length) terminer(true)
    return
  }
  c.choisi = i
  terminer(i === rangsAttendus(c)[c.cherche === 'long' ? c.crayons.length - 1 : 0])
}

// ── Fiche : entourer le plus long (ou le plus court) ; MS et GS : numéroter du plus court au plus long
function htmlFiche() {
  const ranger = config.value.mode === 'ranger' && config.value.niveau !== 'ps'
  // PS : rien à lire, toujours le plus long (la consigne est dite par l'adulte)
  const ps = config.value.niveau === 'ps'
  const qs = Array.from({ length: ranger ? 4 : 6 }, () => ({ ...generer(), ...(ps ? { cherche: 'long' } : {}) }))
  // 0,4 mm par unité : le plus long crayon fait au plus 12 cm
  const crayon = c => `<svg viewBox="0 0 ${LARGEUR} 34" width="${LARGEUR * 0.4}mm" height="${34 * 0.4}mm">
    <rect x="2" y="7" width="${c.longueur - 24}" height="20" rx="4" fill="none" stroke="#222" stroke-width="2.5"/>
    <polygon points="${c.longueur - 22},7 ${c.longueur},17 ${c.longueur - 22},27" fill="none" stroke="#222" stroke-width="2.5"/></svg>`
  const blocs = qs.map((x, i) => `<div class="bloc"><span class="num">${i + 1}.</span><div class="liste">${x.crayons.map(c => `<div class="ligne">${ranger ? '<span class="case"></span>' : ''}${crayon(c)}</div>`).join('')}</div>${ranger || ps ? '' : `<span class="quoi">${t(x.cherche === 'long' ? 'fLong' : 'fCourt')}</span>`}</div>`).join('')
  const titre = t('titre')
  return `<!DOCTYPE html><html lang="${langue.value}"><head>
    <meta charset="UTF-8"><title>${titre}</title>
    <style>
      body { font-family: Arial, sans-serif; max-width: 720px; margin: 1.2cm auto; color: #222; }
      h1 { font-size: 1.3rem; border-bottom: 2px solid #333; padding-bottom: .4rem; margin-bottom: .5rem; }
      .consigne { font-weight: 700; font-size: 1.1rem; margin: .4rem 0 1rem; }
      .bloc { display: flex; align-items: center; gap: .8rem; border: 2px solid #ddd; border-radius: 12px; padding: .5rem .8rem; margin-bottom: .7rem; page-break-inside: avoid; }
      .num { font-weight: 700; color: #999; min-width: 1.4rem; } .liste { flex: 1; }
      .ligne { display: flex; align-items: center; gap: .6rem; height: 11mm; border-left: 3px solid #999; }
      .case { width: 8mm; height: 8mm; border: 2px solid #444; border-radius: 6px; flex: none; margin-left: .4rem; }
      .quoi { font-weight: 700; min-width: 7rem; }
      .ligne { height: 15mm; } .liste { min-width: 0; } .quoi { flex: none; white-space: nowrap; min-width: 0; } .corr { columns: 3; font-size: 1.1rem; line-height: 1.8; }
    </style></head><body>
    <h1>${titre}</h1>
    ${ligneNomDate(langue.value)}
    <p class="consigne">${t(ranger ? 'fConsigneRanger' : ps ? 'fConsignePS' : 'fConsigne')}</p>
    ${blocs}
    <section class="corrige"><h2>${t('corrige')} — ${titre}</h2>
      <div class="corr">${qs.map((x, i) => {
        const rangs = rangsAttendus(x)
        const lettre = x.crayons.map((_, j) => ranger ? rangs.indexOf(j) + 1 : (j === rangs[x.cherche === 'long' ? rangs.length - 1 : 0] ? '◯' : '·'))
        return `<div>${i + 1}. ${lettre.join(' ')}</div>`
      }).join('')}</div></section>
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
.crayons { display: flex; flex-direction: column; gap: .8rem; margin-bottom: 1rem; }
.crayon-btn { position: relative; display: block; width: 100%; padding: .9rem 1rem; border-radius: 14px; border: 4px solid var(--gris-brd); background: white; cursor: pointer; min-height: 5rem; }
.crayon-btn:hover:not(:disabled) { border-color: var(--bleu); }
.crayon-btn.bonne { border-color: var(--vert); background: #f0faf0; }
.crayon-btn.mauvaise { border-color: var(--rouge); background: #fef0f0; }
.crayon { display: block; width: 100%; height: auto; max-height: 4rem; }
.rang { position: absolute; right: .8rem; top: 50%; transform: translateY(-50%); font-size: 1.6rem; font-weight: 900; color: var(--bleu); }
.mat-score { font-size: 4rem; font-weight: 900; }
</style>
