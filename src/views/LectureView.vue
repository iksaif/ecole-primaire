<template>
  <div class="container">
    <h1>📖 Lecture</h1>

    <!-- ══ CONFIG ══ -->
    <div v-if="phase === 'config'" class="config-box">

      <div class="config-section">
        <div class="config-section-title">Exercice</div>
        <div class="mode-cards" style="grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));">
          <button class="mode-card" :class="{ active: config.mode === 'syllabes' }" @click="config.mode = 'syllabes'">
            <div class="mode-icon">🔠</div>
            <div class="mode-title">Syllabes</div>
            <div class="mode-desc">Compte et reconstitue les syllabes d'un mot</div>
          </button>
          <button class="mode-card" :class="{ active: config.mode === 'mots' }" @click="config.mode = 'mots'">
            <div class="mode-icon">🧩</div>
            <div class="mode-title">Reconstituer un mot</div>
            <div class="mode-desc">Remets les syllabes dans le bon ordre</div>
          </button>
          <button class="mode-card" :class="{ active: config.mode === 'lecture_texte' }" @click="config.mode = 'lecture_texte'">
            <div class="mode-icon">📖</div>
            <div class="mode-title">Lecture de textes</div>
            <div class="mode-desc">Lis des phrases ou des histoires et écoute les mots</div>
          </button>
        </div>
      </div>

      <div class="config-section">
        <div class="config-section-title">Niveau</div>
        <div class="btn-group">
          <button v-for="n in NIVEAUX" :key="n.id"
            class="level-btn" :class="{ active: config.niveau === n.id }"
            @click="config.niveau = n.id">{{ n.label }}</button>
        </div>
      </div>

      <div class="config-section">
        <div class="config-section-title">Nombre de questions</div>
        <div class="btn-group">
          <button v-for="n in [5, 10, 15]" :key="n"
            class="level-btn" :class="{ active: config.nb === n }"
            @click="config.nb = n">{{ n }}</button>
        </div>
      </div>

      <div style="text-align:center;margin-top:1.5rem;">
        <button class="btn btn-primary" style="font-size:1.1rem;padding:.75rem 2rem;" @click="demarrer">
          ▶ Commencer
        </button>
      </div>
      <div style="text-align:center;margin-top:.75rem;">
        <button class="btn btn-ghost" style="font-size:.95rem;" @click="imprimerFiche" :disabled="printing">
          <span>{{ printing ? '⌛ Génération...' : '🖨️ Imprimer une fiche' }}</span>
        </button>
      </div>
    </div>

    <!-- ══ EXERCICE : Syllabes / Reconstituer / Lecture ══ -->
    <template v-if="phase === 'jeu'">
      <div class="score-bar">
        <button class="btn-quitter" @click="arreter(); phase = 'config'">✕ Quitter</button>
        <span>Question {{ idx + 1 }} / {{ questions.length }}</span>
        <span>✅ {{ bonnes }} &nbsp; ❌ {{ mauvaises }}</span>
      </div>
      <div class="prog-dots" style="max-width:680px;margin:0 auto .5rem;">
        <div v-for="(_, i) in questions" :key="i" class="prog-dot" :class="dotClass(i)"></div>
      </div>

      <div v-if="loading" class="exercise-box" style="text-align:center;padding:3rem;">
        <span class="spinner" style="width:30px;height:30px;border-width:3px;border-top-color:var(--bleu);"></span>
        <div style="margin-top:1rem;color:#888;">Génération de l'histoire...</div>
      </div>

      <div v-else-if="question" class="exercise-box">

        <!-- Mode syllabes : combien de syllabes ? -->
        <template v-if="config.mode === 'syllabes'">
          <div class="question-label">Combien de syllabes dans ce mot ?</div>
          <div class="mot-display">{{ question.mot }}</div>
          <div class="choix-grid">
            <button v-for="c in question.choix" :key="c"
              class="choix-btn" :class="reponduClass(c)"
              :disabled="repondu" @click="validerChoix(c)">{{ c }}</button>
          </div>
          <div v-if="repondu" class="feedback" :class="feedbackCls">
            {{ feedbackTxt }}
            <span v-if="repondu" class="decoupage">
              {{ question.syllabes.join(' · ') }}
            </span>
          </div>
        </template>

        <!-- Mode reconstituer : clique dans le bon ordre -->
        <template v-else-if="config.mode === 'mots'">
          <div class="question-label">Reconstitue le mot en cliquant sur les syllabes dans le bon ordre :</div>
          <div class="assemblage">
            <span v-for="(s, i) in assemblage" :key="i" class="syllabe-assemblee">{{ s }}</span>
            <span v-if="!assemblage.length" class="assemblage-vide">…</span>
          </div>
          <div class="syllabes-choix">
            <button v-for="(s, i) in syllabeMelangees" :key="i"
              class="syllabe-btn"
              :class="{ used: utilisees.has(i), bonne: repondu && !erreurSyll, mauvaise: repondu && erreurSyll }"
              :disabled="repondu || utilisees.has(i)"
              @click="ajouterSyllabe(i, s)">{{ s }}</button>
          </div>
          <div class="saisie-row" style="justify-content:center;gap:.5rem;margin-top:.75rem;">
            <button v-if="!repondu && assemblage.length > 0" class="btn btn-ghost" @click="effacerDerniere">← Effacer</button>
            <button v-if="!repondu && assemblage.length === question.syllabes.length" class="btn btn-primary" @click="validerMot">Valider ✔</button>
          </div>
          <div v-if="repondu" class="feedback" :class="feedbackCls">{{ feedbackTxt }}</div>
        </template>

        <!-- Mode lecture_texte : lecture de phrases/textes -->
        <template v-else-if="config.mode === 'lecture_texte'">
          <div class="question-label">Lis ce texte à haute voix. Clique sur un mot pour l'écouter :</div>
          
          <div class="lecture-texte-box">
            <template v-for="(mot, mid) in motsDeLaQuestion" :key="mid">
              <span class="lecture-word" @click="lireMot(mot)">{{ mot }}</span>
              <span class="space">&nbsp;</span>
            </template>
          </div>

          <div v-if="repondu" class="feedback" :class="feedbackCls">{{ feedbackTxt }}</div>

          <div class="btn-group" style="justify-content:center;margin-top:1.5rem;">
            <button v-if="!repondu" class="btn btn-warning" :class="{ playing: enLecture }" @click="ecouterTout()">
              <span>{{ enLecture ? '⏹' : '🔊' }}</span>
              <span>{{ enLecture ? 'Arrêter' : 'Écouter tout' }}</span>
            </button>
            <button v-if="!repondu" class="btn btn-success" @click="validerLecture">
              J'ai lu ! 👍
            </button>
          </div>
        </template>

        <button v-if="repondu" class="btn btn-primary" style="margin-top:1rem;" @click="suivant">
          {{ idx + 1 < questions.length ? 'Suivant →' : 'Voir les résultats' }}
        </button>
      </div>
    </template>

    <!-- ══ RÉSULTATS ══ -->
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
import { ref, computed, watch, onUnmounted } from 'vue'
import { melanger, confettis, sauvegarder, charger, aleatoire } from '../utils'
import { useTTS } from '../composables/useTTS'

const NIVEAUX = [
  { id: 'cp',  label: 'CP' },
  { id: 'ce1', label: 'CE1' },
  { id: 'ce2', label: 'CE2+' },
]

// Mots avec découpage syllabique
const MOTS_CP = [
  { mot: 'papa',    syllabes: ['pa','pa'] },
  { mot: 'maman',   syllabes: ['ma','man'] },
  { mot: 'bateau',  syllabes: ['ba','teau'] },
  { mot: 'maison',  syllabes: ['mai','son'] },
  { mot: 'lapin',   syllabes: ['la','pin'] },
  { mot: 'soleil',  syllabes: ['so','leil'] },
  { mot: 'nuage',   syllabes: ['nu','age'] },
  { mot: 'école',   syllabes: ['é','cole'] },
  { mot: 'ami',     syllabes: ['a','mi'] },
  { mot: 'image',   syllabes: ['i','mage'] },
  { mot: 'vélo',    syllabes: ['vé','lo'] },
  { mot: 'photo',   syllabes: ['pho','to'] },
  { mot: 'feuille', syllabes: ['feuil','le'] },
  { mot: 'rouge',   syllabes: ['rou','ge'] },
  { mot: 'forêt',   syllabes: ['fo','rêt'] },
]
const MOTS_CE1 = [
  { mot: 'papillon',  syllabes: ['pa','pil','lon'] },
  { mot: 'chocolat',  syllabes: ['cho','co','lat'] },
  { mot: 'éléphant',  syllabes: ['é','lé','phant'] },
  { mot: 'carotte',   syllabes: ['ca','rot','te'] },
  { mot: 'domino',    syllabes: ['do','mi','no'] },
  { mot: 'caméra',    syllabes: ['ca','mé','ra'] },
  { mot: 'tomate',    syllabes: ['to','ma','te'] },
  { mot: 'camion',    syllabes: ['ca','mi','on'] },
  { mot: 'piranha',   syllabes: ['pi','ran','ha'] },
  { mot: 'château',   syllabes: ['châ','teau'] },
  { mot: 'jardin',    syllabes: ['jar','din'] },
  { mot: 'fenêtre',   syllabes: ['fe','nê','tre'] },
  { mot: 'librairie', syllabes: ['li','brai','rie'] },
  { mot: 'montagne',  syllabes: ['mon','ta','gne'] },
]
const MOTS_CE2 = [
  { mot: 'bibliothèque', syllabes: ['bi','bli','o','thè','que'] },
  { mot: 'catégorie',    syllabes: ['ca','té','go','rie'] },
  { mot: 'anniversaire', syllabes: ['an','ni','ver','sai','re'] },
  { mot: 'révolution',   syllabes: ['ré','vo','lu','tion'] },
  { mot: 'dinosaure',    syllabes: ['di','no','sau','re'] },
  { mot: 'encyclopédie', syllabes: ['en','cy','clo','pé','die'] },
  { mot: 'électricité',  syllabes: ['é','lec','tri','ci','té'] },
  { mot: 'photographie', syllabes: ['pho','to','gra','phie'] },
  { mot: 'vocabulaire',  syllabes: ['vo','ca','bu','lai','re'] },
  { mot: 'géographie',   syllabes: ['gé','o','gra','phie'] },
]

// Textes par défaut pour le mode lecture libre (si pas d'API Key ou erreur)
const PHRASES_DEFAUT_CP = [
  "Le petit chat dort sur le tapis chaud.",
  "Maman prépare un bon gâteau au chocolat doux.",
  "Le vélo rouge de Léo est dans le jardin.",
  "Il y a un grand oiseau bleu sur le toit.",
  "Papa joue au ballon avec mon petit frère.",
  "La jolie poule rousse mange du bon pain.",
  "Je vois un grand renard dans la forêt verte.",
  "La banane jaune est très douce et sucrée.",
  "Le poisson rouge nage dans la rivière.",
  "Hugo mange une pomme rouge à l'école."
]

const TEXTES_DEFAUT_CE1 = [
  "C'est l'été. Les enfants jouent joyeusement sur la plage de sable chaud. Ils construisent un magnifique château de sable.",
  "Le petit chien de Rémi a trouvé un vieil os dans le grand jardin. Il court le cacher sous de jolies fleurs.",
  "Ce matin, la maîtresse apporte un nouveau livre d'images. Tous les élèves écoutent l'histoire avec un grand sourire.",
  "Le lapin blanc se promène dans la prairie verte. Soudain, il voit une très grosse carotte et la mange avec joie.",
  "La pluie commence à tomber sur la grande forêt. Les petits oiseaux se cachent sous les feuilles pour rester au sec.",
  "Maman prépare une bonne soupe de légumes chauds pour le dîner. Ça sent vraiment bon dans toute la cuisine !",
  "Le soleil brille fort aujourd'hui. Léa met son chapeau bleu et part faire du vélo avec sa meilleure amie."
]

const TEXTES_DEFAUT_CE2 = [
  "Pendant les vacances d'automne, toute la famille décide de faire une longue et belle randonnée en montagne. Le paysage est magnifique avec toutes ces belles feuilles rouges.",
  "L'électricité est devenue indispensable dans notre vie quotidienne. Elle permet d'allumer la lumière et de faire fonctionner les appareils grâce à un circuit électrique simple.",
  "Dans la grande forêt amazonienne, de nombreux animaux étranges et colorés s'abritent dans les arbres géants. Les scientifiques étudient cette biodiversité incroyable."
]

function getPool(niveau) {
  if (niveau === 'cp')  return MOTS_CP
  if (niveau === 'ce1') return [...MOTS_CP, ...MOTS_CE1]
  return [...MOTS_CE1, ...MOTS_CE2]
}

function obtenirTexteDefaut(niveau) {
  let list = PHRASES_DEFAUT_CP
  if (niveau === 'ce1') list = TEXTES_DEFAUT_CE1
  if (niveau === 'ce2') list = TEXTES_DEFAUT_CE2
  return list[aleatoire(0, list.length - 1)]
}

async function genererTexteMistral(niveau) {
  const apiKey = localStorage.getItem('ep_mistral_key') || ''
  if (!apiKey) return obtenirTexteDefaut(niveau)

  let prompt = ''
  if (niveau === 'cp') {
    prompt = "Génère une phrase simple, mignonne et positive en français, facile à lire pour un enfant de CP (6 ans) en apprentissage de la lecture. Maximum 8 mots. Réponds UNIQUEMENT avec la phrase, sans guillemets ni explication."
  } else if (niveau === 'ce1') {
    prompt = "Génère une très courte histoire simple, mignonne et positive en français (2 ou 3 phrases simples, maximum 25 mots), facile à lire pour un enfant de CE1 (7 ans). Réponds UNIQUEMENT avec l'histoire, sans guillemets ni explication."
  } else {
    prompt = "Génère une courte histoire simple, intéressante et positive en français (3 ou 4 phrases, maximum 40 mots), facile à lire pour un enfant de CE2 (8 ans). Réponds UNIQUEMENT avec l'histoire, sans guillemets ni explication."
  }

  try {
    const res = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'mistral-small-latest',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 80,
      }),
    })
    if (!res.ok) throw new Error()
    const data = await res.json()
    return data.choices?.[0]?.message?.content?.trim() || obtenirTexteDefaut(niveau)
  } catch {
    return obtenirTexteDefaut(niveau)
  }
}

const config = ref(charger('lecture_config', { mode: 'syllabes', niveau: 'cp', nb: 10 }))
watch(config, v => sauvegarder('lecture_config', v), { deep: true })
const phase = ref('config')
const questions = ref([])
const idx = ref(0)
const bonnes = ref(0)
const mauvaises = ref(0)
const repondu = ref(false)
const feedbackTxt = ref('')
const feedbackCls = ref('')
const reponseDonnee = ref(null)
const loading = ref(false)
const printing = ref(false)

// Mode reconstituer
const assemblage = ref([])
const utilisees = ref(new Set())
const syllabeMelangees = ref([])
const erreurSyll = ref(false)

const { enLecture, lire, arreter } = useTTS()

const question = computed(() => questions.value[idx.value])

const motsDeLaQuestion = computed(() => {
  if (!question.value || !question.value.texte) return []
  return question.value.texte.split(' ')
})

async function chargerQuestionLecture(i) {
  const txt = await genererTexteMistral(config.value.niveau)
  questions.value[i] = { texte: txt, _resultat: undefined }
}

async function demarrer() {
  arreter()
  idx.value = 0; bonnes.value = 0; mauvaises.value = 0
  repondu.value = false; feedbackTxt.value = ''; feedbackCls.value = ''
  reponseDonnee.value = null
  resetReconstituer()

  if (config.value.mode === 'lecture_texte') {
    loading.value = true
    questions.value = Array(config.value.nb).fill(null).map(() => ({ texte: '' }))
    await chargerQuestionLecture(0)
    loading.value = false
  } else {
    const pool = melanger(getPool(config.value.niveau)).slice(0, config.value.nb)
    questions.value = pool.map(q => {
      const nb = q.syllabes.length
      const mauvais = [nb - 1, nb + 1, nb + 2].filter(n => n >= 1 && n !== nb)
      const choix = melanger([nb, ...melanger(mauvais).slice(0, 2)]).slice(0, 3)
      return { ...q, choix, _resultat: undefined }
    })
    resetReconstituer()
  }
  phase.value = 'jeu'
}

function melangerDifferent(arr) {
  if (arr.length <= 1) return [...arr]
  let result
  let essais = 0
  do {
    result = melanger([...arr])
    essais++
  } while (essais < 30 && result.every((s, i) => s === arr[i]))
  return result
}

function resetReconstituer() {
  assemblage.value = []
  utilisees.value = new Set()
  erreurSyll.value = false
  if (question.value && config.value.mode !== 'lecture_texte') syllabeMelangees.value = melangerDifferent(question.value.syllabes)
}

function dotClass(i) {
  const r = questions.value[i]?._resultat
  if (i === idx.value && phase.value === 'jeu') return 'current'
  if (r === undefined) return ''
  return r ? 'ok' : 'erreur'
}

function validerChoix(c) {
  if (repondu.value) return
  reponseDonnee.value = c
  const ok = c === question.value.syllabes.length
  enregistrer(ok)
}

function reponduClass(c) {
  if (!repondu.value) return ''
  if (c === question.value.syllabes.length) return 'bonne'
  if (c === reponseDonnee.value) return 'mauvaise'
  return ''
}

function ajouterSyllabe(i, s) {
  assemblage.value.push(s)
  utilisees.value = new Set([...utilisees.value, i])
}

function effacerDerniere() {
  if (!assemblage.value.length) return
  const s = assemblage.value[assemblage.value.length - 1]
  assemblage.value.pop()
  const usedArr = [...utilisees.value]
  const idx2 = usedArr.slice().reverse().find(i => syllabeMelangees.value[i] === s)
  if (idx2 !== undefined) {
    const next = new Set(utilisees.value)
    next.delete(idx2)
    utilisees.value = next
  }
}

function validerMot() {
  if (repondu.value) return
  const ok = assemblage.value.join('') === question.value.mot
  erreurSyll.value = !ok
  enregistrer(ok)
}

function enregistrer(ok) {
  question.value._resultat = ok
  repondu.value = true
  if (ok) {
    bonnes.value++
    feedbackTxt.value = ['Bravo ! 🎉', 'Exact ! ⭐', 'Bien joué ! 👏'][Math.floor(Math.random() * 3)]
    feedbackCls.value = 'ok'
  } else {
    mauvaises.value++
    if (config.value.mode === 'syllabes') {
      feedbackTxt.value = `❌ ${question.value.mot} a ${question.value.syllabes.length} syllabe${question.value.syllabes.length > 1 ? 's' : ''} : ${question.value.syllabes.join(' · ')}`
    } else {
      feedbackTxt.value = `❌ Le bon ordre était : ${question.value.syllabes.join(' · ')} → ${question.value.mot}`
    }
    feedbackCls.value = 'erreur'
  }
}

function lireMot(mot) {
  const motNettoye = mot.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?«»"]/g, "")
  if (motNettoye) lire(motNettoye)
}

function ecouterTout() {
  if (enLecture.value) {
    arreter()
  } else if (question.value && question.value.texte) {
    lire(question.value.texte)
  }
}

function validerLecture() {
  enregistrer(true)
}

async function suivant() {
  arreter()
  idx.value++
  if (idx.value >= questions.value.length) { phase.value = 'resultats'; return }
  repondu.value = false; feedbackTxt.value = ''; feedbackCls.value = ''
  reponseDonnee.value = null
  resetReconstituer()

  if (config.value.mode === 'lecture_texte') {
    loading.value = true
    await chargerQuestionLecture(idx.value)
    loading.value = false
  }
}

const resultMsg = computed(() => {
  const pct = bonnes.value / questions.value.length * 100
  if (pct === 100) { confettis(50); return 'Parfait, sans faute ! 🏆' }
  if (pct >= 80)   { confettis(25); return 'Très bien ! 🌟' }
  if (pct >= 60)   return 'Bien ! Continue à t\'entraîner 💪'
  return 'Courage ! Relis les mots à voix haute 📚'
})

async function imprimerFiche() {
  if (printing.value) return
  printing.value = true

  let items = []
  const nb = config.value.nb
  const niveau = config.value.niveau.toUpperCase()

  if (config.value.mode === 'lecture_texte') {
    const apiPromises = Array(nb).fill(null).map(() => genererTexteMistral(config.value.niveau))
    const list = await Promise.all(apiPromises)
    items = list.map(texte => ({ texte }))
  } else {
    const pool = melanger(getPool(config.value.niveau)).slice(0, nb)
    items = pool.map(q => {
      const nbSyll = q.syllabes.length
      const syllMelangees = melangerDifferent(q.syllabes).join(' - ')
      return { mot: q.mot, syllabes: q.syllabes, nbSyll, syllMelangees }
    })
  }

  let title = ''
  let instructions = ''
  let rowsHtml = ''

  if (config.value.mode === 'lecture_texte') {
    title = `Fiche de Lecture — ${niveau}`
    instructions = `Lis chaque phrase ou histoire à haute voix, puis coche l'étoile :`
    rowsHtml = items.map((it, i) => `
      <div class="lecture-item">
        <span class="num">${i + 1}.</span>
        <div class="text-content">${it.texte}</div>
        <div class="checkbox-star">⭐ [ ]</div>
      </div>
    `).join('')
  } else if (config.value.mode === 'syllabes') {
    title = `Compter les syllabes — ${niveau}`
    instructions = `Écris le nombre de syllabes pour chaque mot :`
    rowsHtml = items.map((it, i) => `
      <div class="syllabe-item">
        <span class="num">${i + 1}.</span>
        <span class="word-text">${it.mot}</span>
        <span class="dots">. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .</span>
        <span class="count-box">_______ syllabes</span>
      </div>
    `).join('')
  } else {
    title = `Reconstituer des mots — ${niveau}`
    instructions = `Remets les syllabes dans le bon ordre pour écrire les mots :`
    rowsHtml = items.map((it, i) => `
      <div class="mots-item">
        <span class="num">${i + 1}.</span>
        <span class="syllabes-list">${it.syllMelangees}</span>
        <span class="arrow">➔</span>
        <span class="write-line">____________________________________</span>
      </div>
    `).join('')
  }

  const html = `<!DOCTYPE html><html lang="fr"><head>
    <meta charset="UTF-8"><title>${title}</title>
    <style>
      body { font-family: Arial, sans-serif; max-width: 680px; margin: 1.5cm auto; color: #222; }
      h1 { font-size: 1.25rem; border-bottom: 2px solid #333; padding-bottom: .4rem; margin-bottom: .5rem; }
      .entete { font-size: .85rem; color: #666; margin-bottom: 2rem; }
      
      /* Style Lecture */
      .lecture-item { display: flex; align-items: flex-start; gap: .75rem; margin: 1.5rem 0; border: 1px solid #ddd; border-radius: 8px; padding: 1rem; background: #fafafa; }
      .lecture-item .num { font-weight: 700; color: #555; }
      .lecture-item .text-content { flex: 1; font-size: 1.15rem; line-height: 1.6; font-weight: 600; }
      .lecture-item .checkbox-star { font-size: 1.1rem; color: #aaa; white-space: nowrap; margin-left: 1rem; }

      /* Style Syllabes */
      .syllabe-item { display: flex; align-items: baseline; gap: .5rem; margin: 1.2rem 0; }
      .syllabe-item .num { font-weight: 700; color: #777; width: 1.5rem; }
      .syllabe-item .word-text { font-size: 1.25rem; font-weight: 800; min-width: 120px; }
      .syllabe-item .dots { flex: 1; color: #aaa; overflow: hidden; white-space: nowrap; }
      .syllabe-item .count-box { font-weight: 700; color: #444; font-size: 1rem; }

      /* Style Mots */
      .mots-item { display: flex; align-items: center; gap: .75rem; margin: 1.2rem 0; }
      .mots-item .num { font-weight: 700; color: #777; width: 1.5rem; }
      .mots-item .syllabes-list { font-size: 1.25rem; font-weight: 800; font-family: monospace; min-width: 150px; background: #f0f4f8; padding: .25rem .5rem; border-radius: 6px; text-align: center; }
      .mots-item .arrow { color: #888; font-weight: bold; }
      .mots-item .write-line { flex: 1; color: #aaa; }
    </style></head><body>
    <h1>${title}</h1>
    <p class="entete">${instructions} &nbsp;&nbsp;&nbsp; Nom : __________________________ &nbsp; Date : ______________</p>
    <div>${rowsHtml}</div>
    <script>window.onafterprint = function() { window.close(); }; window.print();<\/script>
  </body></html>`

  const w = window.open('', '_blank')
  w.document.write(html)
  w.document.close()
  
  printing.value = false
}

onUnmounted(() => arreter())
</script>

<style scoped>
.container { max-width: 680px; margin: 0 auto; padding: 1rem; }
h1 { color: var(--bleu); margin-bottom: 1rem; }

.config-box { background: white; border-radius: var(--radius); box-shadow: var(--shadow); padding: 1.5rem; }
.config-section { margin-bottom: 1.25rem; }
.config-section-title { font-weight: 700; margin-bottom: .6rem; font-size: .9rem; text-transform: uppercase; letter-spacing: .04em; color: #555; }

.mode-cards { display: grid; grid-template-columns: 1fr 1fr; gap: .75rem; }
@media (max-width: 480px) { .mode-cards { grid-template-columns: 1fr; } }
.mode-card {
  border: 3px solid var(--gris-brd); border-radius: var(--radius);
  padding: 1rem; cursor: pointer; transition: all .15s; text-align: center;
  background: white; font-family: inherit; width: 100%;
}
.mode-card:hover  { border-color: var(--bleu); }
.mode-card:focus-visible { outline: 3px solid var(--bleu); outline-offset: 2px; }
.mode-card.active { border-color: var(--bleu); background: #eef5ff; }
.mode-icon  { font-size: 2rem; }
.mode-title { font-weight: 800; font-size: .95rem; margin: .3rem 0 .15rem; }
.mode-desc  { font-size: .78rem; color: #666; }

.exercise-box { background: white; border-radius: var(--radius); box-shadow: var(--shadow); padding: 1.5rem; }

.question-label { font-weight: 600; color: #555; margin-bottom: .75rem; text-align: center; }

.mot-display {
  font-size: 2.5rem; font-weight: 900; text-align: center; color: var(--bleu);
  margin-bottom: 1.25rem; letter-spacing: .05em;
}

.choix-grid { display: flex; gap: .75rem; justify-content: center; margin-bottom: 1rem; }
.choix-btn {
  min-width: 60px; padding: .6rem 1.2rem;
  border: 2px solid var(--gris-brd); border-radius: 10px;
  font-size: 1.4rem; font-weight: 800; font-family: inherit;
  background: white; cursor: pointer; transition: all .15s;
}
.choix-btn:hover:not(:disabled) { border-color: var(--bleu); background: #eef5ff; }
.choix-btn:focus-visible { outline: 3px solid var(--bleu); outline-offset: 2px; }
.choix-btn.bonne   { border-color: #22c55e; background: #f0fdf4; color: #15803d; }
.choix-btn.mauvaise{ border-color: var(--rouge); background: #fff5f5; color: var(--rouge); }
.choix-btn:disabled { cursor: default; }

.decoupage { display: block; margin-top: .4rem; font-weight: 700; font-size: 1rem; color: var(--bleu); }

/* Reconstituer */
.assemblage {
  min-height: 3rem; border: 2px dashed #ccc; border-radius: 10px;
  display: flex; align-items: center; justify-content: center; gap: .25rem;
  margin-bottom: 1rem; padding: .5rem; font-size: 1.5rem; font-weight: 800; color: var(--bleu);
}
.assemblage-vide { color: #ccc; font-weight: 400; font-size: 1.1rem; }
.syllabe-assemblee { letter-spacing: .02em; }

.syllabes-choix { display: flex; flex-wrap: wrap; gap: .5rem; justify-content: center; }
.syllabe-btn {
  padding: .5rem 1rem; border: 2px solid var(--bleu);
  border-radius: 8px; font-size: 1.25rem; font-weight: 700;
  font-family: inherit; background: #eef5ff; color: var(--bleu);
  cursor: pointer; transition: all .15s;
}
.syllabe-btn:hover:not(:disabled):not(.used) { background: var(--bleu); color: white; }
.syllabe-btn:focus-visible { outline: 3px solid var(--bleu); outline-offset: 2px; }
.syllabe-btn.used { opacity: .3; cursor: default; }
.syllabe-btn.bonne   { border-color: #22c55e; background: #f0fdf4; color: #15803d; }
.syllabe-btn.mauvaise{ border-color: var(--rouge); background: #fff5f5; color: var(--rouge); }

.saisie-row { display: flex; gap: .5rem; }

.feedback { padding: .6rem 1rem; border-radius: 8px; font-weight: 600; margin-top: .5rem; font-size: .95rem; }
.feedback.ok     { background: #f0fdf4; color: #15803d; }
.feedback.erreur { background: #fff5f5; color: var(--rouge); }

.result-score { font-size: 3rem; font-weight: 900; color: var(--bleu); }
.result-msg   { font-size: 1.1rem; margin: .5rem 0 1.5rem; }

/* Lecture de textes */
.lecture-texte-box {
  background: #f8f9fa;
  border: 2px solid var(--gris-brd);
  border-radius: var(--radius);
  padding: 1.5rem;
  font-size: 1.6rem;
  line-height: 2.2;
  text-align: justify;
  margin: 1.5rem 0;
  min-height: 8rem;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0 0.15rem;
}
.lecture-word {
  cursor: pointer;
  padding: 0.1rem 0.35rem;
  border-radius: 6px;
  transition: background 0.15s, color 0.15s, transform 0.1s;
  color: var(--texte);
  display: inline-block;
  font-weight: 700;
}
.lecture-word:hover {
  background: var(--bleu);
  color: white;
  transform: scale(1.08);
}
.lecture-word:active {
  transform: scale(0.95);
}
</style>
