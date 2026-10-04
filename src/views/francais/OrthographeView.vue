<template>
  <div class="container">
    <h1>🔤 {{ t('titre') }}</h1>

    <!-- ══ CONFIG ══ -->
    <ConfigExercice v-if="phase === 'config'" :config="config" v-model:mode="mode" :fiche="fiche"
      @commencer="demarrer" @regenerer="regenerer">

      <div class="config-section">
        <div class="config-section-title">{{ t('theme') }}</div>
        <div class="theme-grid">
          <button v-for="th in THEMES" :key="th.id"
            class="theme-btn" :class="{ active: config.theme === th.id }"
            @click="config.theme = th.id">
            <span class="theme-icon">{{ th.icon }}</span>
            <span class="theme-label">{{ t('theme_' + th.id) }}</span>
          </button>
        </div>
      </div>

      <div class="config-section">
        <div class="config-section-title">{{ t('nbQuestions') }}</div>
        <div class="btn-group">
          <button v-for="n in [5, 10, 15]" :key="n"
            class="level-btn" :class="{ active: config.nb === n }"
            @click="config.nb = n">{{ n }}</button>
        </div>
      </div>
    </ConfigExercice>

    <!-- ══ EXERCICE ══ -->
    <template v-if="phase === 'jeu' && question">
      <div class="score-bar">
        <button class="btn-quitter" @click="phase = 'config'">{{ t('quitter') }}</button>
        <span>{{ t('question', { n: idx + 1, total: questions.length }) }}</span>
        <span>✅ {{ bonnes }} &nbsp; ❌ {{ mauvaises }}</span>
      </div>

      <div class="prog-dots" style="max-width:680px;margin:0 auto .5rem;">
        <div v-for="(_, i) in questions" :key="i"
             class="prog-dot" :class="dotClass(i)"></div>
      </div>

      <div class="exercise-box">
        <!-- Phrase avec trou -->
        <div class="phrase-display" v-html="phraseCourante"></div>

        <!-- Choix multiples -->
        <div v-if="question.type === 'choix'" class="choix-grid">
          <button v-for="c in question.choix" :key="c"
            class="choix-btn"
            :class="reponduClass(c)"
            :disabled="repondu"
            @click="validerChoix(c)">{{ c }}</button>
        </div>

        <!-- Saisie libre -->
        <div v-else class="saisie-row">
          <input ref="inputEl" class="saisie-input" :class="inputCls"
            v-model="saisie" :disabled="repondu"
            autocomplete="off" spellcheck="false"
            :placeholder="question.indice || t('ecrisLeMot')"
            @keydown.enter="validerSaisie" />
          <button v-if="!repondu" class="btn btn-primary" @click="validerSaisie">{{ t('valider') }}</button>
        </div>

        <div class="feedback" :class="feedbackCls" v-if="repondu">
          {{ feedbackTxt }}
        </div>

        <button v-if="repondu" class="btn btn-primary" style="margin-top:1rem;" @click="suivant">
          {{ idx + 1 < questions.length ? t('suivant') : t('voirResultats') }}
        </button>
      </div>
    </template>

    <!-- ══ RÉSULTATS ══ -->
    <div v-if="phase === 'resultats'" class="exercise-box" style="text-align:center;">
      <div class="result-score">{{ bonnes }} / {{ questions.length }}</div>
      <div class="result-msg">{{ resultMsg }}</div>

      <div v-if="erreurs.length > 0" class="erreurs-box">
        <div class="config-section-title" style="margin-bottom:.5rem;">{{ t('aRetravailler') }}</div>
        <div v-for="(e, i) in erreurs" :key="i" class="erreur-orth">
          <span class="erreur-phrase" v-html="e.phraseFull"></span>
          <span class="erreur-reponse">→ <strong>{{ e.bonne }}</strong></span>
        </div>
      </div>

      <div class="btn-group" style="justify-content:center;margin-top:1.25rem;">
        <button class="btn btn-primary" @click="demarrer">{{ t('rejouer') }}</button>
        <button class="btn btn-ghost" @click="phase = 'config'">{{ t('changer') }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, watch } from 'vue'
import { melanger, confettis, normaliser, sauvegarder, charger } from '../../utils'
import { useI18n } from '../../i18n'
import messagesFr from '../../i18n/fr/views/francais/OrthographeView.js'
import messagesBr from '../../i18n/br/views/francais/OrthographeView.js'
import ConfigExercice from '../../components/ConfigExercice.vue'
import { useModeExercice } from '../../composables/useModeExercice'
import { echapper } from '../../utils/impression'

const { t, tr, langue } = useI18n({ fr: messagesFr, br: messagesBr })

// Explications en breton (les mots français étudiés restent entre guillemets)
// br: à relire — préposition = araogenn, conjonction = stagell, déterminant = ger-mont (incertain), pronom réfléchi = raganv emober (incertain)
const EXPLICATIONS_BR = {
  '"a" = avoir (il a)': '"a" = ar verb "avoir" (il a)',
  '"à" = préposition de lieu': '"à" = araogenn al lec\'h',
  '"a" = avoir (papa a)': '"a" = ar verb "avoir" (papa a)',
  '"ou" = choix (ou bien)': '"ou" = un dibab (ou bien)',
  '"où" = lieu (remplace "à quel endroit")': '"où" = al lec\'h (e-lec\'h "à quel endroit")',
  '"ou" = choix': '"ou" = un dibab',
  '"on" = pronom sujet': '"on" = raganv sujed',
  '"ont" = avoir au pluriel (ils ont)': '"ont" = "avoir" el liester (ils ont)',
  '"on" = pronom (on = nous)': '"on" = raganv (on = nous)',
  '"et" = conjonction (et puis)': '"et" = stagell (et puis)',
  '"est" = être (il est)': '"est" = ar verb "être" (il est)',
  '"et" = conjonction': '"et" = stagell',
  '"sont" = être au pluriel (ils sont)': '"sont" = "être" el liester (ils sont)',
  '"son" = déterminant possessif': '"son" = ger-mont perc\'hennañ',
  '"sont" = être au pluriel': '"sont" = "être" el liester',
  '"ce" = déterminant démonstratif': '"ce" = ger-mont diskouez',
  '"se" = pronom réfléchi': '"se" = raganv emober',
  '"mes" = déterminant possessif (pluriel de mon/ma)': '"mes" = ger-mont perc\'hennañ (liester "mon"/"ma")',
  '"mais" = conjonction d\'opposition': '"mais" = stagell enebiñ',
  'garçon est masculin → petit': '"garçon" a zo gourel → "petit"',
  'fille est féminin → petite': '"fille" a zo benel → "petite"',
  'chien est masculin → content': '"chien" a zo gourel → "content"',
  'chatte est féminin → blanche': '"chatte" a zo benel → "blanche"',
  'un → singulier → château': '"un" → unander → "château"',
  'beaux → pluriel → châteaux': '"beaux" → liester → "châteaux"',
  'chiens est pluriel masculin → gros (invariable en -s)': '"chiens" a zo liester gourel → "gros" (ne cheñch ket, echu gant -s)',
  'voiture est féminin → grosse': '"voiture" a zo benel → "grosse"',
  'Les noms en -eau font leur pluriel en -eaux': 'An anvioù echu gant -eau : liester gant -eaux',
  'Les noms en -eu font leur pluriel en -eux': 'An anvioù echu gant -eu : liester gant -eux',
  'Pluriel irrégulier : genou → genoux': 'Liester direizh : genou → genoux',
  'Les noms en -al font leur pluriel en -aux': 'An anvioù echu gant -al : liester gant -aux',
  '"hibou" s\'écrit avec un h': '"hibou" a vez skrivet gant un h',
  '"oiseau" commence par oi': '"oiseau" a grog gant "oi"',
  '"clown" vient de l\'anglais, avec w': '"clown" a zeu eus ar saozneg, gant ur w',
  '"chanter" s\'écrit ch + ante': '"chanter" a vez skrivet ch + ante',
}
const explication = q => tr({ fr: q.explication, br: EXPLICATIONS_BR[q.explication] ?? q.explication })

// ── Données par thème
const THEMES = [
  { id: 'homophones', icon: '👂', label: 'Homophones' },
  { id: 'accords',    icon: '🤝', label: 'Accords' },
  { id: 'lettres',    icon: '🔡', label: 'Lettres manquantes' },
]

const QUESTIONS = {
  homophones: [
    // a / à
    { phrase: 'Il ___ une belle maison.',     bonne: 'a',   choix: ['a','à'],   explication: '"a" = avoir (il a)' },
    { phrase: 'Elle va ___ l\'école.',        bonne: 'à',   choix: ['a','à'],   explication: '"à" = préposition de lieu' },
    { phrase: 'Papa ___ faim.',               bonne: 'a',   choix: ['a','à'],   explication: '"a" = avoir (papa a)' },
    { phrase: 'Je vais ___ la piscine.',      bonne: 'à',   choix: ['a','à'],   explication: '"à" = préposition de lieu' },
    // ou / où
    { phrase: 'Tu veux du lait ___ du jus ?', bonne: 'ou',  choix: ['ou','où'], explication: '"ou" = choix (ou bien)' },
    { phrase: '___ est mon cartable ?',        bonne: 'Où',  choix: ['Ou','Où'], explication: '"où" = lieu (remplace "à quel endroit")' },
    { phrase: 'Chat ___ chien, j\'aime les deux.', bonne: 'ou', choix: ['ou','où'], explication: '"ou" = choix' },
    // on / ont
    { phrase: '___ mange à midi.',            bonne: 'On',  choix: ['On','Ont'], explication: '"on" = pronom sujet' },
    { phrase: 'Ils ___ fini leurs devoirs.',  bonne: 'ont', choix: ['on','ont'], explication: '"ont" = avoir au pluriel (ils ont)' },
    { phrase: '___ part en vacances demain.', bonne: 'On',  choix: ['On','Ont'], explication: '"on" = pronom (on = nous)' },
    // est / et
    { phrase: 'Le chat ___ la souris.',       bonne: 'et',  choix: ['est','et'], explication: '"et" = conjonction (et puis)' },
    { phrase: 'Il ___ content.',              bonne: 'est', choix: ['est','et'], explication: '"est" = être (il est)' },
    { phrase: 'Le soleil ___ chaud.',         bonne: 'est', choix: ['est','et'], explication: '"est" = être (il est)' },
    { phrase: 'J\'aime les pommes ___ les poires.', bonne: 'et', choix: ['est','et'], explication: '"et" = conjonction' },
    // son / sont
    { phrase: 'Ils ___ partis tôt.',          bonne: 'sont', choix: ['son','sont'], explication: '"sont" = être au pluriel (ils sont)' },
    { phrase: '___ chien s\'appelle Rex.',    bonne: 'Son',  choix: ['Son','Sont'], explication: '"son" = déterminant possessif' },
    { phrase: 'Elles ___ heureuses.',         bonne: 'sont', choix: ['son','sont'], explication: '"sont" = être au pluriel' },
    // ce / se
    { phrase: '___ livre est à moi.',         bonne: 'Ce',  choix: ['Ce','Se'],  explication: '"ce" = déterminant démonstratif' },
    { phrase: 'Il ___ lave les mains.',       bonne: 'se',  choix: ['ce','se'],  explication: '"se" = pronom réfléchi' },
    // mes / mais
    { phrase: 'Je cherche ___ lunettes.',     bonne: 'mes', choix: ['mes','mais'], explication: '"mes" = déterminant possessif (pluriel de mon/ma)' },
    { phrase: 'J\'aime le sport ___ je suis fatigué.', bonne: 'mais', choix: ['mes','mais'], explication: '"mais" = conjonction d\'opposition' },
  ],

  accords: [
    // genre
    { phrase: 'Un ___ garçon.',               bonne: 'petit',    choix: ['petit','petite'],    explication: 'garçon est masculin → petit' },
    { phrase: 'Une ___ fille.',               bonne: 'petite',   choix: ['petit','petite'],    explication: 'fille est féminin → petite' },
    { phrase: 'Un chien ___.',                bonne: 'content',  choix: ['content','contente'], explication: 'chien est masculin → content' },
    { phrase: 'Une chatte ___.',              bonne: 'blanche',  choix: ['blanc','blanche'],   explication: 'chatte est féminin → blanche' },
    { phrase: 'Un beau ___.',                 bonne: 'château',  choix: ['château','châteaux'], explication: 'un → singulier → château' },
    { phrase: 'De beaux ___.',                bonne: 'châteaux', choix: ['château','châteaux'], explication: 'beaux → pluriel → châteaux' },
    // nombre
    { phrase: 'Les ___ chiens aboient.',      bonne: 'gros',     choix: ['gros','grosse'],     explication: 'chiens est pluriel masculin → gros (invariable en -s)' },
    { phrase: 'La ___ voiture est rouge.',    bonne: 'grosse',   choix: ['gros','grosse'],     explication: 'voiture est féminin → grosse' },
    // pluriel des noms
    { phrase: 'Un bateau → des ___.',         bonne: 'bateaux',  choix: ['bateaus','bateaux'], explication: 'Les noms en -eau font leur pluriel en -eaux' },
    { phrase: 'Un jeu → des ___.',            bonne: 'jeux',     choix: ['jeus','jeux'],       explication: 'Les noms en -eu font leur pluriel en -eux' },
    { phrase: 'Un gâteau → des ___.',         bonne: 'gâteaux',  choix: ['gâteaus','gâteaux'], explication: 'Les noms en -eau font leur pluriel en -eaux' },
    { phrase: 'Un genou → des ___.',          bonne: 'genoux',   choix: ['genous','genoux'],   explication: 'Pluriel irrégulier : genou → genoux' },
    { phrase: 'Un animal → des ___.',         bonne: 'animaux',  choix: ['animals','animaux'], explication: 'Les noms en -al font leur pluriel en -aux' },
    { phrase: 'Un journal → des ___.',        bonne: 'journaux', choix: ['journals','journaux'], explication: 'Les noms en -al font leur pluriel en -aux' },
  ],

  lettres: [
    // Doubles consonnes
    { type: 'saisie', phrase: 'Le la___in mange des carottes.', bonne: 'lapin',    indice: 'la___in' },
    { type: 'saisie', phrase: 'La ma___on est grande.',         bonne: 'maison',   indice: 'ma___on' },
    { type: 'saisie', phrase: 'J\'aime le choco___at.',         bonne: 'chocolat', indice: 'choco___at' },
    { type: 'saisie', phrase: 'Le papi___on est joli.',         bonne: 'papillon', indice: 'papi___on' },
    // Mots à compléter (saisie libre du mot entier)
    { type: 'saisie', phrase: 'Je man___ une pomme.',   bonne: 'mange',   indice: 'man___' },
    { type: 'saisie', phrase: 'Il fa___ froid.',         bonne: 'fait',    indice: 'fa___' },
    { type: 'saisie', phrase: 'Elle es___ contente.',    bonne: 'est',     indice: 'es___' },
    { type: 'saisie', phrase: 'Le soli___ brille.',      bonne: 'soleil',  indice: 'soli___' },
    { type: 'saisie', phrase: 'Mon ___ s\'appelle Rex.', bonne: 'chien',   indice: '___ien' },
    { type: 'saisie', phrase: 'La ___ est belle.',       bonne: 'fleur',   indice: '___eur' },
    // Mots avec h muet / h aspiré
    { phrase: 'L\'___ est bleu.',                bonne: 'hibou', choix: ['ibou','hibou'],   explication: '"hibou" s\'écrit avec un h' },
    { phrase: 'L\'___ chante.',                  bonne: 'oiseau', choix: ['wazeau','oiseau'], explication: '"oiseau" commence par oi' },
    // Confusion son c/qu
    { phrase: 'Le ___ rit.',                     bonne: 'clown', choix: ['cloun','clown'],   explication: '"clown" vient de l\'anglais, avec w' },
    { phrase: 'Je ___ une chanson.',             bonne: 'chante', choix: ['chante','shante'], explication: '"chanter" s\'écrit ch + ante' },
  ],
}

// ── État
const config = ref(charger('orthographe_config', { theme: 'homophones', nb: 10 }))
watch(config, v => sauvegarder('orthographe_config', v), { deep: true })
const phase = ref('config')
const questions = ref([])
const idx = ref(0)
const bonnes = ref(0)
const mauvaises = ref(0)
const erreurs = ref([])
const repondu = ref(false)
// feedback mémorisé sous forme de données pour suivre la langue
const feedback = ref(null)
const feedbackTxt = computed(() => {
  const f = feedback.value
  if (!f) return ''
  if (f.ok) return t('feedbackOk')[f.i]
  const exp = f.q.explication ? explication(f.q) : ''
  return t('feedbackErr', { r: f.q.bonne, exp: exp ? ' — ' + exp : '' })
})
const feedbackCls = ref('')
const saisie = ref('')
const inputCls = ref('')
const reponseDonnee = ref('')
const inputEl = ref(null)

const question = computed(() => questions.value[idx.value])

const phraseCourante = computed(() => {
  if (!question.value) return ''
  return question.value.phrase.replace('___', '<span class="trou">___</span>')
})

function demarrer() {
  const pool = melanger([...QUESTIONS[config.value.theme]])
    .slice(0, config.value.nb)
    .map(q => ({
      ...q,
      type: q.type || 'choix',
      _resultat: undefined,
    }))
  questions.value = pool
  idx.value = 0
  bonnes.value = 0; mauvaises.value = 0; erreurs.value = []
  repondu.value = false; feedback.value = null; feedbackCls.value = ''
  saisie.value = ''; inputCls.value = ''; reponseDonnee.value = ''
  phase.value = 'jeu'
  nextTick(() => inputEl.value?.focus())
}

// ── Fiche imprimable : phrases à trous (choix à entourer / mot à compléter), corrigé page 2
function htmlFiche() {
  const e = echapper
  const qs = melanger([...QUESTIONS[config.value.theme]]).slice(0, config.value.nb)
    .map(q => ({ ...q, type: q.type || 'choix' }))
  const trou = '<span class="trou"></span>'
  const groupes = [
    { type: 'choix', consigne: t('fEntoure') },
    { type: 'saisie', consigne: t('fComplete') },
  ].map(g => ({ ...g, qs: qs.filter(q => q.type === g.type) })).filter(g => g.qs.length)
  const enonce = q => {
    if (q.type === 'choix') {
      const choix = melanger([...q.choix]).map(c => `<span class="choix">${e(c)}</span>`).join('<span class="sep">/</span>')
      return e(q.phrase).replace('___', `<span class="paire">${choix}</span>`)
    }
    // mot à compléter : le trou est dans le mot (« la___in ») ou on donne l'indice entre parenthèses
    const p = e(q.phrase).replace('___', trou)
    return q.indice && !q.phrase.includes(q.indice) ? `${p} <span class="indice">(${e(q.indice)})</span>` : p
  }
  const solution = q => q.type === 'saisie' && q.indice && q.phrase.includes(q.indice)
    ? e(q.phrase).replace(e(q.indice), `<b>${e(q.bonne)}</b>`)
    : e(q.phrase).replace('___', `<b>${e(q.bonne)}</b>`)
  let num = 0
  const corps = groupes.map(g => `<h2>${g.consigne}</h2>
    ${g.qs.map(q => `<div class="q"><span class="num">${++num}.</span><span>${enonce(q)}</span></div>`).join('')}`).join('')
  num = 0
  const corrige = groupes.map(g => g.qs.map(q => `<div class="corr"><span class="num">${++num}.</span> ${solution(q)}</div>`).join('')).join('')
  const titre = `${t('titre')} — ${t('theme_' + config.value.theme)}`
  return `<!DOCTYPE html><html lang="${langue.value}"><head>
    <meta charset="UTF-8"><title>${e(titre)}</title>
    <style>
      body { font-family: Arial, sans-serif; max-width: 700px; margin: 1.5cm auto; color: #222; }
      h1 { font-size: 1.3rem; border-bottom: 2px solid #333; padding-bottom: .4rem; margin-bottom: .5rem; }
      h2 { font-size: 1rem; margin: 1.4rem 0 .4rem; background: #f0f3f7; padding: .3rem .6rem; border-radius: 6px; }
      .entete { font-size: .85rem; color: #666; margin-bottom: 1rem; }
      .q { display: flex; gap: .6rem; margin: .9rem 0; font-size: 1.2rem; line-height: 2; page-break-inside: avoid; }
      .num { min-width: 1.6rem; font-weight: 700; color: #777; }
      .paire { white-space: nowrap; margin: 0 .2rem; }
      .choix { display: inline-block; padding: 0 .45rem; font-weight: 700; }
      .sep { color: #aaa; }
      .trou { display: inline-block; min-width: 3.5em; border-bottom: 1.5px solid #888; height: 1.2em; vertical-align: bottom; }
      .indice { color: #777; font-size: .9em; }
      .corrige { page-break-before: always; break-before: page; font-size: 1rem; }
      .corr { margin: .35rem 0; }
      .corr .num { display: inline-block; }
    </style></head><body>
    <h1>${e(titre)}</h1>
    <p class="entete">${t('prenom')} : ________________________ &nbsp; ${t('date')} : ______________</p>
    ${corps}
    <div class="corrige"><h1>${t('corrige')} — ${e(titre)}</h1>${corrige}</div>
  </body></html>`
}

const { mode, graine, regenerer } = useModeExercice()
const fiche = computed(() => {
  if (mode.value !== 'imprimer') return ''
  graine.value
  return htmlFiche()
})

function dotClass(i) {
  const r = questions.value[i]?._resultat
  if (i === idx.value && phase.value === 'jeu') return 'current'
  if (r === undefined) return ''
  return r ? 'ok' : 'erreur'
}

function validerChoix(choix) {
  if (repondu.value) return
  reponseDonnee.value = choix
  enregistrer(normaliser(choix) === normaliser(question.value.bonne))
}

function validerSaisie() {
  if (repondu.value || !saisie.value.trim()) return
  reponseDonnee.value = saisie.value.trim()
  enregistrer(normaliser(saisie.value) === normaliser(question.value.bonne))
}

function enregistrer(ok) {
  question.value._resultat = ok
  repondu.value = true
  if (ok) {
    bonnes.value++
    feedback.value = { ok: true, i: Math.floor(Math.random() * 4) }
    feedbackCls.value = 'ok'
    inputCls.value = 'ok'
  } else {
    mauvaises.value++
    feedback.value = { ok: false, q: question.value }
    feedbackCls.value = 'erreur'
    inputCls.value = 'erreur'
    erreurs.value.push({
      phraseFull: question.value.phrase.replace('___', `<strong>${question.value.bonne}</strong>`),
      bonne: question.value.bonne,
    })
  }
}

function reponduClass(choix) {
  if (!repondu.value) return ''
  if (normaliser(choix) === normaliser(question.value.bonne)) return 'bonne'
  if (normaliser(choix) === normaliser(reponseDonnee.value)) return 'mauvaise'
  return ''
}

function suivant() {
  idx.value++
  if (idx.value >= questions.value.length) {
    phase.value = 'resultats'
    return
  }
  repondu.value = false; feedback.value = null; feedbackCls.value = ''
  saisie.value = ''; inputCls.value = ''; reponseDonnee.value = ''
  nextTick(() => inputEl.value?.focus())
}

const resultMsg = computed(() => {
  const pct = bonnes.value / questions.value.length * 100
  if (pct === 100) { confettis(50); return t('res100') }
  if (pct >= 80)   { confettis(25); return t('res80') }
  if (pct >= 60)   return t('res60')
  return t('res0')
})
</script>

<style scoped>
.container { max-width: 680px; margin: 0 auto; padding: 1rem; }
h1 { color: var(--bleu); margin-bottom: 1rem; }

.config-box { background: white; border-radius: var(--radius); box-shadow: var(--shadow); padding: 1.5rem; }
.config-section { margin-bottom: 1.25rem; }
.config-section-title { font-weight: 700; margin-bottom: .6rem; font-size: .9rem; text-transform: uppercase; letter-spacing: .04em; color: #555; }

.theme-grid { display: flex; flex-wrap: wrap; gap: .5rem; }
.theme-btn {
  background: white; border: 2px solid var(--gris-brd); border-radius: 10px;
  padding: .5rem 1rem; cursor: pointer; font-size: .95rem; font-weight: 600;
  font-family: inherit; transition: all .15s; display: flex; align-items: center; gap: .4rem;
}
.theme-btn:hover  { border-color: var(--bleu); }
.theme-btn:focus-visible { outline: 3px solid var(--bleu); outline-offset: 2px; }
.theme-btn.active { border-color: var(--bleu); background: #eef5ff; }
.theme-icon { font-size: 1.25rem; }

.exercise-box { background: white; border-radius: var(--radius); box-shadow: var(--shadow); padding: 1.5rem; }

.phrase-display {
  font-size: 1.35rem; font-weight: 600; text-align: center;
  margin-bottom: 1.5rem; line-height: 1.6; color: #222;
}
:deep(.trou) { color: #bbb; font-weight: 400; }

.choix-grid {
  display: flex; flex-wrap: wrap; gap: .75rem; justify-content: center;
  margin-bottom: 1rem;
}
.choix-btn {
  min-width: 80px; padding: .6rem 1.4rem;
  border: 2px solid var(--gris-brd); border-radius: 10px;
  font-size: 1.1rem; font-weight: 700; font-family: inherit;
  background: white; cursor: pointer; transition: all .15s;
}
.choix-btn:hover:not(:disabled) { border-color: var(--bleu); background: #eef5ff; }
.choix-btn:focus-visible { outline: 3px solid var(--bleu); outline-offset: 2px; }
.choix-btn.bonne   { border-color: #22c55e; background: #f0fdf4; color: #15803d; }
.choix-btn.mauvaise{ border-color: var(--rouge); background: #fff5f5; color: var(--rouge); }
.choix-btn:disabled { cursor: default; }

.saisie-row { display: flex; gap: .5rem; justify-content: center; margin-bottom: 1rem; }
.saisie-input {
  border: 2px solid #ccc; border-radius: 8px;
  padding: .5rem .9rem; font-size: 1.1rem; font-family: inherit; width: 14rem;
}
.saisie-input:focus { outline: none; border-color: var(--bleu); }
.saisie-input.ok    { border-color: #22c55e; background: #f0fdf4; color: #15803d; }
.saisie-input.erreur{ border-color: var(--rouge); background: #fff5f5; color: var(--rouge); }

.feedback { padding: .6rem 1rem; border-radius: 8px; font-weight: 600; margin-top: .5rem; font-size: .95rem; }
.feedback.ok     { background: #f0fdf4; color: #15803d; }
.feedback.erreur { background: #fff5f5; color: var(--rouge); }

/* Résultats */
.result-score { font-size: 3rem; font-weight: 900; color: var(--bleu); }
.result-msg   { font-size: 1.1rem; margin: .5rem 0 1.5rem; }

.erreurs-box { text-align: left; max-width: 500px; margin: 0 auto; }
.erreur-orth {
  display: flex; align-items: baseline; gap: .75rem; flex-wrap: wrap;
  padding: .4rem 0; border-bottom: 1px solid #f0f0f0; font-size: .9rem;
}
.erreur-phrase { flex: 1; color: #444; }
.erreur-reponse { color: #15803d; white-space: nowrap; }
</style>
