<template>
  <div class="container">
    <h1 class="section-heading">🔢 Ranger les nombres</h1>

    <!-- Config -->
    <div v-if="phase === 'config'" class="config-box">
      <div class="config-section">
        <div class="config-section-title">Niveau</div>
        <div class="btn-group">
          <button class="level-btn" :class="{ active: config.niveau === 'ms' }" @click="config.niveau = 'ms'">
            🌱 MS — nombres 1 à 5
          </button>
          <button class="level-btn" :class="{ active: config.niveau === 'gs' }" @click="config.niveau = 'gs'">
            🌳 GS — nombres 1 à 10
          </button>
        </div>
      </div>
      <div class="config-section">
        <div class="config-section-title">Du plus petit au plus grand</div>
        <div class="btn-group">
          <button class="level-btn" :class="{ active: config.sens === 'croissant' }" @click="config.sens = 'croissant'">
            ↗ Croissant
          </button>
          <button class="level-btn" :class="{ active: config.sens === 'decroissant' }" @click="config.sens = 'decroissant'">
            ↘ Décroissant
          </button>
          <button class="level-btn" :class="{ active: config.sens === 'mix' }" @click="config.sens = 'mix'">
            🔀 Mélangé
          </button>
        </div>
      </div>
      <div class="config-section">
        <div class="config-section-title">Combien de nombres à ranger ?</div>
        <div class="btn-group">
          <button v-for="n in [3, 4, 5]" :key="n"
            class="level-btn" :class="{ active: config.taille === n }" @click="config.taille = n">{{ n }}</button>
        </div>
      </div>
      <div class="config-section">
        <div class="config-section-title">Nombre de questions</div>
        <div class="btn-group">
          <button v-for="n in [5, 10]" :key="n"
            class="level-btn" :class="{ active: config.nbQ === n }" @click="config.nbQ = n">{{ n }}</button>
        </div>
      </div>
      <div style="text-align:center;margin-top:1.5rem;">
        <button class="btn btn-primary" style="font-size:1.2rem;padding:.85rem 2.5rem;" @click="demarrer">
          ▶ Commencer
        </button>
      </div>
    </div>

    <!-- Exercice -->
    <template v-if="phase === 'jeu'">
      <div class="score-bar">
        <span>Question {{ idx + 1 }} / {{ questions.length }}</span>
        <span>⭐ {{ bonnes }} &nbsp; 💔 {{ mauvaises }}</span>
      </div>

      <div class="mat-box">
        <div class="consigne">
          {{ sensCourant === 'croissant' ? '⬆️ Range du plus petit au plus grand' : '⬇️ Range du plus grand au plus petit' }}
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
          {{ sensCourant === 'croissant' ? '→ du plus petit au plus grand' : '→ du plus grand au plus petit' }}
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
            ✏️ Effacer
          </button>
          <button class="btn btn-primary" @click="valider"
                  :disabled="selection.length < questions[idx].nombres.length || validé">
            Valider ✔
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
        <button class="btn btn-primary" @click="demarrer">🔄 Rejouer</button>
        <button class="btn btn-ghost"   @click="phase = 'config'">⚙️ Paramètres</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { aleatoire, melanger, confettis } from '../../utils'

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
    feedback.value = ['Bravo ! 🎉', 'Super ! ⭐', 'Parfait ! 🌟'][aleatoire(0,2)]
    feedbackClass.value = 'ok'; bonnes.value++
  } else {
    feedback.value = `❌ L'ordre correct : ${q.bonne.join(' → ')}`
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
  if (e === 5) { confettis(50); return 'Parfait ! Bravo ! 🏆' }
  if (e >= 4)  { confettis(25); return 'Très bien ! 🌟' }
  if (e >= 3)  return 'Bien ! Continue ! 💪'
  return 'On va s\'entraîner encore ! 📚'
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
