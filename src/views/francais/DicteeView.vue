<template>
  <div class="container">
    <h1 class="section-heading">🖊️ {{ t('titre') }}</h1>

    <!-- Config -->
    <ConfigExercice v-if="phase === 'config'" :config="config" v-model:mode="mode" :fiche="fiche"
      :desactive="config.cats.length === 0 || loading" @commencer="demarrer" @regenerer="regenerer">
      <div class="config-section">
        <div class="config-section-title">{{ t('niveau') }}</div>
        <div class="btn-group">
          <button v-for="niv in ['CP','CE1','CE2','CM']" :key="niv"
            class="level-btn" :class="{ active: config.niveau === niv }"
            @click="config.niveau = niv">{{ niv }}</button>
        </div>
      </div>

      <div class="config-section">
        <div class="config-section-title">{{ t('categories', { n: config.niveau }) }}</div>
        <div class="btn-group" style="flex-wrap:wrap;">
          <button v-for="cat in Object.keys(categoriesActuelles)" :key="cat"
            class="cat-btn" :class="{ active: config.cats.includes(cat) }"
            @click="toggleCat(cat)">
            {{ nomCat(cat) }} ({{ categoriesActuelles[cat].length }})
          </button>
        </div>
      </div>

      <div class="config-section">
        <div class="config-section-title">{{ t('mode') }}</div>
        <div class="mode-cards">
          <button class="mode-card" :class="{ active: config.mode === 'mots' }" @click="config.mode = 'mots'">
            <div class="mode-icon">🔤</div>
            <div class="mode-title">{{ t('motsSeuls') }}</div>
            <div class="mode-desc">{{ t('motsSeulsDesc') }}</div>
          </button>
          <button class="mode-card" :class="{ active: config.mode === 'phrases' }" @click="config.mode = 'phrases'">
            <div class="mode-icon">💬</div>
            <div class="mode-title">{{ t('phrases') }}</div>
            <div class="mode-desc">{{ t('phrasesDesc') }}</div>
          </button>
        </div>
      </div>

      <div class="config-section" v-if="mode === 'jouer' && config.mode === 'phrases'">
        <div class="config-section-title">
          {{ t('cleApi') }}
          <span style="font-weight:400;color:#aaa;font-size:.85em"> {{ t('cleApiOpt') }}</span>
        </div>
        <div class="api-row">
          <span v-if="apiKeySaved" class="api-ok">{{ t('cleOk') }}</span>
          <span v-else class="api-ok" style="color:#aaa;">{{ t('cleAucune') }}</span>
          <RouterLink to="/parametres" class="btn btn-ghost" style="font-size:.85rem;">{{ t('parametresParents') }}</RouterLink>
        </div>
      </div>

      <div class="config-section">
        <div class="config-section-title">{{ t('nbMots') }}</div>
        <div class="btn-group">
          <button v-for="n in [5,10,15,0]" :key="n"
            class="level-btn" :class="{ active: config.nb === n }"
            @click="config.nb = n">{{ n === 0 ? t('tous') : n }}</button>
        </div>
      </div>

      <div v-if="mode === 'jouer'" class="config-section">
        <div class="config-section-title">{{ t('vitesse') }}</div>
        <div class="slider-row">
          <span>🐢</span>
          <input type="range" min="0.5" max="1.2" step="0.05" v-model.number="config.vitesse">
          <span>🐇</span>
          <span class="slider-val">{{ config.vitesse }}</span>
        </div>
      </div>

      <div v-if="mode === 'imprimer'" class="config-section">
        <div class="config-section-title">{{ t('pagesFiche') }}</div>
        <div class="btn-group">
          <button class="level-btn" :class="{ active: ficheConfig.liste }" @click="basculerPage('liste')">📋 {{ t('pageListe') }}</button>
          <button class="level-btn" :class="{ active: ficheConfig.dictee }" @click="basculerPage('dictee')">✏️ {{ t('pageDictee') }}</button>
        </div>
      </div>
    </ConfigExercice>

    <!-- Dictée -->
    <template v-if="phase === 'jeu'">
      <div class="score-bar">
        <button class="btn-quitter" @click="arreter(); phase = 'config'" :title="t('quitterDictee')">{{ t('quitter') }}</button>
        <span>{{ t('motN', { n: idx + 1, total: liste.length }) }}</span>
        <span v-if="loading" class="loading-badge"><span class="spinner"></span> {{ t('generation') }}</span>
        <span>✅ {{ nbBonnes }} &nbsp; ❌ {{ nbMauvaises }}</span>
      </div>

      <div class="exercise-box">
        <div class="prog-dots">
          <div v-for="(_, i) in liste" :key="i"
               class="prog-dot" :class="dotClass(i)"></div>
        </div>

        <!-- Contexte phrase -->
        <div v-if="config.mode === 'phrases' && currentPhrase" class="phrase-ctx-container">
          <button v-if="!afficherIndice" class="btn btn-ghost btn-sm" style="margin-bottom: 1.25rem;" @click="afficherIndice = true">
            {{ t('afficherIndice') }}
          </button>
          <div v-else class="phrase-ctx">
            <span v-html="phraseAvecBlanc"></span>
            <button class="btn-masquer-indice" @click="afficherIndice = false" :title="t('masquerIndice')">🙈</button>
          </div>
        </div>

        <button class="btn-ecouter" :class="{ playing: enLecture }" @click="ecouterMot()">
          <span>{{ enLecture ? '⏹' : '🔊' }}</span>
          <span>{{ enLecture ? t('arreter') : (config.mode === 'phrases' ? t('ecouterPhrase') : t('ecouterMot')) }}</span>
        </button>

        <div class="hint-text">{{ t('consigne') }}</div>

        <input ref="inputEl" class="dictee-input" :class="inputClass"
               type="text" v-model="reponse" placeholder="…"
               autocomplete="off" autocorrect="off" autocapitalize="none"
               spellcheck="false" @keydown.enter="validerMot">

        <div class="feedback" :class="feedbackClass">{{ feedbackTxt }}</div>

        <div class="btn-group" style="justify-content:center;margin-top:.75rem;">
          <button class="btn btn-ghost" @click="ecouterMot()">{{ t('reecouter') }}</button>
          <button class="btn btn-primary" @click="validerMot">{{ t('valider') }}</button>
          <button class="btn btn-ghost" @click="passerMot">{{ t('passer') }}</button>
        </div>
      </div>
    </template>

    <!-- Résultats -->
    <div v-if="phase === 'resultats'" class="exercise-box" style="text-align:center;">
      <div class="result-score">{{ nbBonnes }} / {{ liste.length }}</div>
      <div class="result-msg">{{ resultMsg }}</div>

      <table class="correction-table">
        <thead><tr><th>{{ t('attendu') }}</th><th>{{ t('taReponse') }}</th><th></th></tr></thead>
        <tbody>
          <tr v-for="(r, i) in resultats" :key="i" :class="r.ok ? 'ok' : 'erreur'">
            <td class="mot-attendu">{{ r.attendu }}</td>
            <td>{{ r.ok ? '—' : (r.passe ? t('passe') : r.donne) }}</td>
            <td>{{ r.ok ? '✅' : '❌' }}</td>
          </tr>
        </tbody>
      </table>

      <div class="btn-group" style="justify-content:center;">
        <button class="btn btn-primary" @click="demarrer">{{ t('rejouer') }}</button>
        <button class="btn btn-ghost"   @click="phase = 'config'">{{ t('parametres') }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onUnmounted, watch } from 'vue'
import { melanger, charger, sauvegarder, normaliser, confettis } from '../../utils'
import { CATEGORIES, PHRASES_DEFAUT, MOTS_AMBIGUS, NIVEAUX, PHRASES_DEFAUT_ALL } from '../../data/dicteeMots'
import { useTTS } from '../../composables/useTTS'
import { useI18n } from '../../i18n'
import ConfigExercice from '../../components/ConfigExercice.vue'
import { useModeExercice } from '../../composables/useModeExercice'
import { cssPolices, echapper, POLICE_SCRIPT, POLICE_ATTACHE } from '../../utils/impression'

const { t, tr, langue } = useI18n({
  fr: {
    titre: 'Dictée',
    categories: 'Catégories — {n}',
    mode: 'Mode',
    motsSeuls: 'Mots seuls',
    motsSeulsDesc: "L'élève entend le mot et le tape",
    phrases: 'Phrases',
    phrasesDesc: "Un mot dans une phrase, l'élève tape la phrase",
    cleApi: 'Clé API Mistral',
    cleApiOpt: '(optionnel — pour générer des phrases variées)',
    cleOk: '✓ Clé configurée',
    cleAucune: 'Aucune clé — phrases prédéfinies',
    parametresParents: '⚙️ Paramètres parents',
    nbMots: 'Nombre de mots',
    tous: 'Tous',
    vitesse: 'Vitesse de la voix',
    quitterDictee: 'Quitter la dictée',
    motN: 'Mot {n} / {total}',
    generation: 'Génération…',
    afficherIndice: '👁️ Afficher la phrase à trous (indice)',
    masquerIndice: "Masquer l'indice",
    arreter: 'Arrêter',
    ecouterPhrase: 'Écouter la phrase',
    ecouterMot: 'Écouter le mot',
    consigne: 'Écoute bien, puis tape ce que tu entends :',
    reecouter: '🔁 Réécouter',
    attendu: 'Attendu',
    feedbackOk: ['Bravo ! 🎉', 'Parfait ! ⭐', 'Excellent ! 👏'],
    feedbackErr: '❌ La bonne réponse était : « {r} »',
    res100: 'Parfait, zéro faute ! 🏆',
    res80: 'Très bien ! Continue comme ça 🌟',
    res60: 'Bien, mais il y a encore du travail ! 💪',
    res0: 'Courage, relis les mots et réessaie ! 📚',
    // fiche imprimable
    pagesFiche: 'Pages de la fiche',
    pageListe: 'Mots à apprendre',
    pageDictee: 'Dictée à faire avec un adulte',
    fConsigneListe: 'Lis chaque mot, puis recopie-le sur la ligne.',
    fScript: 'Script',
    fAttache: 'Attaché',
    fRecopie: 'Je recopie',
    fConsigneMots: "Écoute bien et écris le mot que l'adulte te dicte.",
    fConsignePhrases: "Écoute bien et écris la phrase que l'adulte te dicte.",
    fADicter: "À dicter par l'adulte, dans l'ordre :",
  },
  br: {
    titre: 'Skrivadeg', // br: à relire (dictée)
    categories: 'Rummadoù — {n}',
    mode: 'Mod',
    motsSeuls: 'Gerioù hepken',
    motsSeulsDesc: 'Ar skoliad a glev ar ger hag e skriv',
    phrases: 'Frazennoù',
    phrasesDesc: 'Ur ger en ur frazenn, ar skoliad a skriv ar frazenn',
    cleApi: "Alc'hwez API Mistral",
    cleApiOpt: "(diret — evit krouiñ frazennoù liesseurt)",
    cleOk: "✓ Alc'hwez kefluniet",
    cleAucune: "Alc'hwez ebet — frazennoù prientet",
    parametresParents: '⚙️ Arventennoù ar gerent',
    nbMots: 'Niver a c\'herioù',
    tous: 'An holl',
    vitesse: 'Tizh ar vouezh',
    quitterDictee: 'Kuitaat ar skrivadeg',
    motN: 'Ger {n} / {total}',
    generation: 'O krouiñ…',
    afficherIndice: '👁️ Diskouez ar frazenn gant toulloù (tun)', // br: à relire (indice)
    masquerIndice: 'Kuzhat an tun',
    arreter: 'Paouez',
    ecouterPhrase: 'Selaou ar frazenn',
    ecouterMot: 'Selaou ar ger',
    consigne: "Selaou mat, ha skriv ar pezh a glevez :",
    reecouter: '🔁 Adselaou',
    attendu: 'Gortozet',
    feedbackOk: ['Brav eo ! 🎉', 'Dispar ! ⭐', 'Mat-tre ! 👏'],
    feedbackErr: '❌ Ar respont mat a oa : « {r} »',
    res100: 'Dispar, fazi ebet ! 🏆',
    res80: "Mat-tre ! Kendalc'h evel-se 🌟",
    res60: "Mat, met labour a zo c'hoazh ! 💪",
    res0: 'Kalon vat, adlenn ar gerioù hag esae en-dro ! 📚',
    // fiche imprimable — br: à relire
    pagesFiche: 'Pajennoù ar fichenn',
    pageListe: 'Gerioù da zeskiñ',
    pageDictee: 'Skrivadeg da ober gant un oadour',
    fConsigneListe: 'Lenn pep ger, hag eilskriv anezhañ war al linenn.',
    fScript: 'Skript',
    fAttache: 'A-stag',
    fRecopie: 'Eilskrivañ a ran',
    fConsigneMots: "Selaou mat ha skriv ar ger a lavar an oadour dit.",
    fConsignePhrases: "Selaou mat ha skriv ar frazenn a lavar an oadour dit.",
    fADicter: "Da lavaret gant an oadour, en urzh :",
  },
})

// Noms des catégories (définis en français dans data/dicteeMots.js)
// br: à relire
const CATEGORIES_BR = {
  'Mots outils': 'Gerioù-benveg',
  'Pronoms': 'Raganvioù',
  'Jours': 'Devezhioù',
  'Nombres': 'Niveroù',
  'Lieux': "Lec'hioù",
  'Transports': 'Treuzdougen',
  'Animaux': 'Loened',
  'Fruits': 'Frouezh',
  'Famille': 'Familh',
  'Verbes': 'Verboù',
  'Déterminants': 'Gerioù-mont',
  'Corps humain': 'Korf mab-den',
  'Maison': 'Ti',
  'École': 'Skol',
  'Verbes courants': 'Verboù boutin',
  'Adjectifs': 'Anvioù-gwan',
  'Saisons': 'Koulzadoù',
  'Aliments': 'Boued',
  'Mots invariables': 'Gerioù digemm',
  'Mots en -tion': 'Gerioù e -tion',
  'Mots en -eur': 'Gerioù e -eur',
  'Nature et environnement': 'Natur hag endro',
  'Vocabulaire scientifique': 'Geriaoueg skiantel',
  'Adverbes': 'Adverboù',
  'Vocabulaire civique': 'Geriaoueg keodedel',
  'Vocabulaire géographique': 'Geriaoueg douaroniel',
  'Mots difficiles courants': 'Gerioù boutin diaes',
  'Connecteurs logiques': 'Gerioù-liamm',
  'Vocabulaire littéraire': 'Geriaoueg lennegel',
  'Mots latins/grecs courants': 'Gerioù latin/gresianek boutin',
}
const nomCat = cat => tr({ fr: cat, br: CATEGORIES_BR[cat] ?? cat })

const config = ref({
  niveau:  charger('dictee_niveau', 'CP'),
  cats:    charger('dictee_cats', Object.keys(CATEGORIES)),
  mode:    charger('dictee_mode', 'mots'),
  nb:      charger('dictee_nb', 10),
  vitesse: charger('dictee_vitesse', 0.75),
})

watch(config, v => {
  sauvegarder('dictee_niveau', v.niveau)
  sauvegarder('dictee_mode', v.mode)
  sauvegarder('dictee_nb', v.nb)
  sauvegarder('dictee_vitesse', v.vitesse)
  sauvegarder('dictee_cats', v.cats)
}, { deep: true })

const apiKeySaved = ref(!!localStorage.getItem('ep_mistral_key'))

const phase = ref('config')
const liste = ref([])
const idx   = ref(0)
const resultats = ref([])
const reponse = ref('')
const afficherIndice = ref(false)
const feedback = ref(null)  // { ok, i } ou { ok: false, r } — texte calculé selon la langue
const feedbackTxt = computed(() => {
  const f = feedback.value
  if (!f) return ''
  return f.ok ? t('feedbackOk')[f.i] : t('feedbackErr', { r: f.r })
})
const feedbackClass = ref('')
const inputClass = ref('')
const loading = ref(false)
const inputEl = ref(null)

const { enLecture, lire, arreter } = useTTS()

const niveauData = computed(() => NIVEAUX[config.value.niveau] ?? NIVEAUX.CP)
const categoriesActuelles = computed(() => niveauData.value.categories)
const ambigsActuels = computed(() => niveauData.value.ambigus)

watch(() => config.value.niveau, () => {
  config.value.cats = Object.keys(categoriesActuelles.value)
})

// ── Getters
const nbBonnes   = computed(() => resultats.value.filter(r => r.ok).length)
const nbMauvaises = computed(() => resultats.value.filter(r => !r.ok).length)
const currentMot    = computed(() => liste.value[idx.value]?.mot ?? '')
const currentPhrase = computed(() => liste.value[idx.value]?.phrase ?? '')

const phraseAvecBlanc = computed(() => {
  const phrase = currentPhrase.value
  const mot = currentMot.value
  if (!phrase || !mot) return phrase
  const re = new RegExp(mot.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
  return phrase.replace(re, `<span class="blank">___</span>`)
})

const resultMsg = computed(() => {
  const pct = nbBonnes.value / liste.value.length * 100
  if (pct === 100) { confettis(50); return t('res100') }
  if (pct >= 80)   { confettis(25); return t('res80') }
  if (pct >= 60)   return t('res60')
  return t('res0')
})

// ── Config
function toggleCat(cat) {
  const cats = config.value.cats
  if (cats.includes(cat)) {
    if (cats.length === 1) return
    config.value.cats = cats.filter(c => c !== cat)
  } else {
    config.value.cats = [...cats, cat]
  }
}

function dotClass(i) {
  if (i === idx.value && phase.value === 'jeu') return 'current'
  const r = resultats.value[i]
  if (!r) return ''
  return r.ok ? 'ok' : 'erreur'
}

// ── Mistral
async function genererPhrase(mot) {
  const apiKey = localStorage.getItem('ep_mistral_key') || ''
  if (!apiKey) return PHRASES_DEFAUT_ALL[mot] || `Je vois ${mot}.`
  try {
    const res = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'mistral-small-latest',
        messages: [{ role: 'user', content:
          `Tu es un assistant pédagogique pour enfants de CP (6-7 ans).\nGénère UNE SEULE phrase courte et simple en français (10 mots maximum) contenant l'expression "${mot}".\nRéponds UNIQUEMENT avec la phrase, sans guillemets ni explication.`
        }],
        temperature: 0.7, max_tokens: 60,
      }),
    })
    if (!res.ok) throw new Error()
    const data = await res.json()
    return data.choices?.[0]?.message?.content?.trim() || PHRASES_DEFAUT_ALL[mot] || `Je vois ${mot}.`
  } catch {
    return PHRASES_DEFAUT_ALL[mot] || `Je vois ${mot}.`
  }
}

// Mots des catégories choisies (sans doublon ; sans les homophones/ambigus en mode « mots seuls »)
function motsChoisis() {
  let pool = []
  config.value.cats.forEach(cat => { if (categoriesActuelles.value[cat]) pool.push(...categoriesActuelles.value[cat]) })
  pool = [...new Set(pool)]
  if (config.value.mode === 'mots') pool = pool.filter(m => !ambigsActuels.value.has(m))
  return pool
}

// ── Démarrage
async function demarrer() {
  if (loading.value) return  // empêche double-clic pendant la génération
  arreter()

  let pool = motsChoisis()

  // Rotation inter-sessions : repousser les mots vus récemment en fin de pool
  const cle = `dictee_vus_${config.value.mode}`
  const vusRecemment = new Set(charger(cle, []))
  const frais  = melanger(pool.filter(m => !vusRecemment.has(m)))
  const anciens = melanger(pool.filter(m =>  vusRecemment.has(m)))
  pool = [...frais, ...anciens]

  if (config.value.nb > 0) pool = pool.slice(0, config.value.nb)

  // Mémoriser les mots utilisés pour la prochaine session
  sauvegarder(cle, pool)

  phase.value = 'jeu'
  idx.value = 0; resultats.value = []

  if (config.value.mode === 'phrases') {
    loading.value = true
    liste.value = []
    for (const mot of pool) {
      const phrase = await genererPhrase(mot)
      liste.value = [...liste.value, { mot, phrase }]
    }
    loading.value = false
  } else {
    liste.value = pool.map(mot => ({ mot, phrase: null }))
  }

  nextTick(() => { afficherMot(); ecouterMot() })
}

// ── Fiche imprimable : liste des mots à apprendre + page de dictée (corrigé à la fin)
const ficheConfig = ref(charger('dictee_fiche', { liste: true, dictee: true }))
watch(ficheConfig, v => sauvegarder('dictee_fiche', v), { deep: true })
function basculerPage(p) {
  const autre = p === 'liste' ? 'dictee' : 'liste'
  if (ficheConfig.value[p] && !ficheConfig.value[autre]) return // au moins une page
  ficheConfig.value[p] = !ficheConfig.value[p]
}

function htmlFiche() {
  let mots = melanger(motsChoisis())
  if (config.value.nb > 0) mots = mots.slice(0, config.value.nb)
  const phrases = config.value.mode === 'phrases'
  const e = echapper
  const titre = `${t('titre')} — ${config.value.niveau}`
  const entete = `<h1>${e(titre)}</h1>
    <p class="entete">${t('prenom')} : ________________________ &nbsp; ${t('date')} : ______________</p>`

  // Page 1 : mots à apprendre, regroupés par catégorie
  const parCat = config.value.cats
    .map(cat => ({ cat, mots: (categoriesActuelles.value[cat] ?? []).filter(m => mots.includes(m)) }))
    .filter(g => g.mots.length)
  const vus = new Set()
  const liste = parCat.map(g => {
    const ms = g.mots.filter(m => !vus.has(m) && vus.add(m))
    if (!ms.length) return ''
    return `<h2>${e(nomCat(g.cat))}</h2>
      <table><tbody>${ms.map(m => `<tr><td class="script">${e(m)}</td><td class="attache">${e(m)}</td><td class="recopie"></td></tr>`).join('')}</tbody></table>`
  }).join('')
  const pageListe = `<section>${entete}
    <p class="consigne">${t('fConsigneListe')}</p>
    <table class="cols"><thead><tr><th>${t('fScript')}</th><th>${t('fAttache')}</th><th>${t('fRecopie')}</th></tr></thead></table>
    ${liste}</section>`

  // Page 2 : lignes numérotées, l'adulte dicte
  const lignes = mots.map((_, i) => `<div class="ligne"><span class="num">${i + 1}.</span><span class="trait"></span></div>`).join('')
  const pageDictee = `<section>${entete}
    <p class="consigne">${t(phrases ? 'fConsignePhrases' : 'fConsigneMots')}</p>
    <div class="${phrases ? 'lignes-phrases' : 'lignes-mots'}">${lignes}</div></section>`

  // Corrigé : ce que l'adulte dicte
  const phraseDe = m => PHRASES_DEFAUT_ALL[m] || `Je vois ${m}.`
  const corrige = `<section><h1>${t('corrige')} — ${e(titre)}</h1>
    <p class="consigne">${t('fADicter')}</p>
    <ol class="corrige">${mots.map(m => `<li>${phrases ? e(phraseDe(m)).replace(e(m), `<b>${e(m)}</b>`) : `<b>${e(m)}</b>`}</li>`).join('')}</ol></section>`

  const pages = [ficheConfig.value.liste && pageListe, ficheConfig.value.dictee && pageDictee, ficheConfig.value.dictee && corrige].filter(Boolean)
  return `<!DOCTYPE html><html lang="${langue.value}"><head>
    <meta charset="UTF-8"><title>${e(titre)}</title>
    <style>
      ${cssPolices()}
      body { font-family: Arial, sans-serif; max-width: 700px; margin: 1.5cm auto; color: #222; }
      section + section { page-break-before: always; break-before: page; }
      h1 { font-size: 1.3rem; border-bottom: 2px solid #333; padding-bottom: .4rem; margin-bottom: .5rem; }
      h2 { font-size: .95rem; margin: 1rem 0 .2rem; background: #f0f3f7; padding: .25rem .6rem; border-radius: 6px; }
      .entete { font-size: .85rem; color: #666; margin-bottom: .8rem; }
      .consigne { font-weight: 700; margin: .6rem 0 1rem; }
      table { width: 100%; border-collapse: collapse; table-layout: fixed; }
      th { font-size: .75rem; color: #777; text-align: left; font-weight: 600; }
      td { padding: .35rem .3rem; vertical-align: bottom; page-break-inside: avoid; }
      .script { font-family: '${POLICE_SCRIPT}', Arial, sans-serif; font-size: 1.35rem; }
      .attache { font-family: '${POLICE_ATTACHE}', cursive; font-size: 1.15rem; }
      .recopie { border-bottom: 1.5px solid #999; }
      .lignes-mots { columns: 2; column-gap: 2.5rem; }
      .ligne { display: flex; align-items: flex-end; gap: .5rem; height: 2.6rem; break-inside: avoid; }
      .lignes-phrases .ligne { height: 3.6rem; }
      .num { font-weight: 700; color: #777; min-width: 1.8rem; }
      .trait { flex: 1; border-bottom: 1.5px solid #999; }
      .corrige { columns: ${phrases ? 1 : 3}; font-size: 1.05rem; line-height: 1.9; font-family: '${POLICE_SCRIPT}', Arial, sans-serif; }
    </style></head><body>
    ${pages.join('\n')}
  </body></html>`
}

const { mode, graine, regenerer } = useModeExercice()
const fiche = computed(() => {
  if (mode.value !== 'imprimer') return ''
  graine.value
  return htmlFiche()
})

function afficherMot() {
  reponse.value = ''; feedback.value = null; feedbackClass.value = ''; inputClass.value = ''
  afficherIndice.value = false
  nextTick(() => inputEl.value?.focus())
}

function ecouterMot() {
  if (enLecture.value) { arreter(); return }
  const { mot, phrase } = liste.value[idx.value] ?? {}
  const texte = (config.value.mode === 'phrases' && phrase) ? phrase : mot
  if (texte) lire(texte, { vitesse: config.value.vitesse })
}

// ── Validation
function validerMot() {
  const { mot, phrase } = liste.value[idx.value]
  const val = reponse.value.trim()
  if (!val) return
  arreter()

  const attendu = (config.value.mode === 'phrases' && phrase) ? phrase : mot
  const ok = normaliser(val) === normaliser(attendu)

  resultats.value = [...resultats.value, { mot, attendu, donne: val, ok }]
  inputClass.value = ok ? 'ok' : 'erreur'

  if (ok) {
    feedback.value = { ok: true, i: Math.floor(Math.random()*3) }
    feedbackClass.value = 'ok'
    setTimeout(suivant, 900)
  } else {
    feedback.value = { ok: false, r: attendu }
    feedbackClass.value = 'erreur'
    setTimeout(() => lire(attendu, { vitesse: config.value.vitesse }), 600)
    setTimeout(suivant, 2400)
  }
}

function passerMot() {
  const { mot, phrase } = liste.value[idx.value]
  const attendu = (config.value.mode === 'phrases' && phrase) ? phrase : mot
  resultats.value = [...resultats.value, { mot, attendu, donne: '(passé)', passe: true, ok: false }]
  arreter()
  suivant()
}

function suivant() {
  idx.value++
  if (idx.value >= liste.value.length) { phase.value = 'resultats' }
  else nextTick(() => { afficherMot(); ecouterMot() })
}

onUnmounted(() => arreter())
</script>

<style scoped>
.cat-btn {
  padding: .35rem .85rem;
  border-radius: 20px;
  border: 2px solid var(--gris-brd);
  background: white;
  font-weight: 600;
  font-size: .85rem;
  cursor: pointer;
  transition: all .15s;
}
.cat-btn:hover  { border-color: var(--bleu); color: var(--bleu); }
.cat-btn.active { background: var(--bleu); border-color: var(--bleu); color: white; }

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
.mode-icon { font-size: 2rem; }
.mode-title { font-weight: 800; font-size: 1rem; margin: .3rem 0 .2rem; }
.mode-desc  { font-size: .8rem; color: #666; }

.api-row { display: flex; gap: .5rem; align-items: center; flex-wrap: wrap; }
.api-input {
  flex: 1; min-width: 200px; border: 2px solid var(--gris-brd);
  border-radius: 8px; padding: .4rem .75rem; font-size: .9rem;
  outline: none; font-family: monospace;
}
.api-input:focus { border-color: var(--bleu); }
.api-ok { font-size: .8rem; font-weight: 700; color: var(--vert); }

.slider-row { display: flex; align-items: center; gap: .75rem; }
.slider-row input[type=range] { flex: 1; }
.slider-val { font-weight: 700; min-width: 2.5rem; text-align: right; }

.phrase-ctx {
  position: relative;
  background: var(--gris-bg); border-radius: 8px;
  padding: 1rem 2.5rem 1rem 1.25rem; font-size: 1.2rem;
  line-height: 1.8; margin: 1rem 0; text-align: center; min-height: 5rem;
  display: flex; align-items: center; justify-content: center;
}
.btn-masquer-indice {
  position: absolute; right: 0.5rem; top: 50%; transform: translateY(-50%);
  background: none; border: none; font-size: 1.2rem; cursor: pointer;
  opacity: 0.6; transition: opacity 0.15s;
}
.btn-masquer-indice:hover { opacity: 1; }
.phrase-ctx-container { margin-bottom: 1rem; text-align: center; }
:deep(.blank) {
  display: inline-block; min-width: 80px;
  border-bottom: 3px solid var(--bleu);
  vertical-align: bottom; font-weight: 700; color: var(--bleu);
}

.btn-ecouter {
  display: flex; align-items: center; justify-content: center; gap: .5rem;
  width: 100%; padding: 1rem; font-size: 1.1rem; font-weight: 800;
  border: none; border-radius: var(--radius);
  background: var(--bleu); color: white; cursor: pointer;
  transition: opacity .15s, transform .1s; margin-bottom: 1rem;
}
.btn-ecouter:hover { opacity: .88; }
.btn-ecouter.playing { background: var(--orange); }

.hint-text { font-size: .85rem; color: #aaa; text-align: center; margin-bottom: .75rem; }

.dictee-input {
  display: block; width: 100%; font-size: 1.6rem; font-weight: 700;
  text-align: center; border: 3px solid var(--gris-brd);
  border-radius: var(--radius); padding: .6rem; outline: none;
  transition: border-color .15s; margin-bottom: .75rem;
}
.dictee-input:focus  { border-color: var(--bleu); }
.dictee-input.ok     { border-color: var(--vert); background: #f0faf0; }
.dictee-input.erreur { border-color: var(--rouge); background: #fef0f0; }
</style>
