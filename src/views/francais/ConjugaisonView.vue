<template>
  <div class="container">
    <h1>✍️ {{ t('titre') }}</h1>

    <!-- ══ CONFIG ══ -->
    <div v-if="phase === 'config'" class="config-box">

      <div class="config-section">
        <div class="config-section-title">{{ t('verbeAConjuguer') }}</div>
        <div class="verbe-grid">
          <button v-for="v in VERBES" :key="v.inf"
            class="verbe-btn" :class="{ active: config.verbe === v.inf }"
            @click="config.verbe = v.inf">
            {{ v.inf }}
            <span class="verbe-groupe">{{ t('groupe_' + v.groupe) }}</span>
          </button>
        </div>
      </div>

      <div class="config-section">
        <div class="config-section-title">{{ t('temps') }}</div>
        <div class="btn-group">
          <button v-for="tp in TEMPS" :key="tp.id"
            class="level-btn" :class="{ active: config.temps === tp.id }"
            @click="config.temps = tp.id">{{ t('temps_' + tp.id) }}</button>
        </div>
      </div>

      <div class="config-section">
        <div class="config-section-title">{{ t('mode') }}</div>
        <div class="mode-cards">
          <button class="mode-card" :class="{ active: config.mode === 'lacunes' }" @click="config.mode = 'lacunes'">
            <div class="mode-icon">✏️</div>
            <div class="mode-title">{{ t('lacunes') }}</div>
            <div class="mode-desc">{{ t('lacunesDesc') }}</div>
          </button>
          <button class="mode-card" :class="{ active: config.mode === 'complet' }" @click="config.mode = 'complet'">
            <div class="mode-icon">📝</div>
            <div class="mode-title">{{ t('complet') }}</div>
            <div class="mode-desc">{{ t('completDesc') }}</div>
          </button>
        </div>
      </div>

      <div style="text-align:center;margin-top:1.5rem;">
        <button class="btn btn-primary" style="font-size:1.1rem;padding:.75rem 2rem;" @click="demarrer">
          {{ t('commencer') }}
        </button>
      </div>
      <div style="text-align:center;margin-top:.75rem;">
        <button class="btn btn-ghost" style="font-size:.95rem;" @click="imprimerFiche">{{ t('imprimerFiche') }}</button>
      </div>
    </div>

    <!-- ══ EXERCICE ══ -->
    <div v-if="phase === 'jeu'" class="exercise-box">
      <div class="score-bar" style="margin-bottom:1.25rem;">
        <button class="btn-quitter" @click="phase = 'config'">{{ t('quitter') }}</button>
        <span>✅ {{ bonnes }} &nbsp; ❌ {{ mauvaises }}</span>
      </div>

      <div class="conj-header">
        <span class="conj-verb">{{ verbeCourant.inf }}</span>
        <span class="conj-temps">{{ t('temps_' + tempsCourant.id) }}</span>
      </div>

      <div class="conj-table">
        <div v-for="(row, i) in conjugaison" :key="i"
             class="conj-row" :class="rowClass(i)">
          <span class="pronom">{{ row.pronom }}</span>

          <!-- mode lacunes : affiche le radical, l'élève tape la terminaison -->
          <template v-if="config.mode === 'lacunes'">
            <span class="radical">{{ row.radical }}</span>
            <input
              :ref="el => { if (el) inputRefs[i] = el }"
              class="conj-input"
              :class="inputClass[i]"
              v-model="reponses[i]"
              :disabled="valide[i]"
              :placeholder="valide[i] ? '' : '…'"
              autocomplete="off"
              spellcheck="false"
              @keydown.enter="validerLigne(i)"
              @keydown.tab.prevent="focusSuivant(i)"
            />
          </template>

          <!-- mode complet : l'élève tape tout -->
          <template v-else>
            <input
              :ref="el => { if (el) inputRefs[i] = el }"
              class="conj-input conj-input-full"
              :class="inputClass[i]"
              v-model="reponses[i]"
              :disabled="valide[i]"
              :placeholder="valide[i] ? '' : row.pronom + ' …'"
              autocomplete="off"
              spellcheck="false"
              @keydown.enter="validerLigne(i)"
              @keydown.tab.prevent="focusSuivant(i)"
            />
          </template>

          <span class="row-feedback">{{ rowFeedback[i] }}</span>
        </div>
      </div>

      <div style="text-align:center;margin-top:1.25rem;">
        <button class="btn btn-primary" @click="validerTout">{{ t('valider') }}</button>
      </div>
    </div>

    <!-- ══ RÉSULTATS ══ -->
    <div v-if="phase === 'resultats'" class="exercise-box" style="text-align:center;">
      <div class="result-score">{{ bonnes }} / {{ totalLignes }}</div>
      <div class="result-msg">{{ resultMsg }}</div>

      <div class="conj-correction">
        <div class="config-section-title" style="margin-bottom:.5rem;">{{ t('correction') }}</div>
        <div v-for="(row, i) in conjugaison" :key="i" class="correction-row">
          <span class="pronom">{{ row.pronom }}</span>
          <span class="correction-forme" :class="corrClass(i)">{{ row.forme }}</span>
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
import { normaliser, confettis, sauvegarder, charger } from '../../utils'
import { useI18n } from '../../i18n'

const { t, langue } = useI18n({
  fr: {
    titre: 'Conjugaison',
    verbeAConjuguer: 'Verbe à conjuguer',
    'groupe_irrég.': 'irrég.',
    groupe_1er: '1er',
    'groupe_2ème': '2ème',
    temps: 'Temps',
    temps_present: 'Présent',
    temps_passe: 'Passé composé',
    temps_imparfait: 'Imparfait',
    temps_futur: 'Futur',
    mode: 'Mode',
    lacunes: 'Lacunes',
    lacunesDesc: 'Remplis les terminaisons',
    complet: 'Complet',
    completDesc: 'Écris la forme entière',
    correction: 'Correction',
    changer: '⚙️ Changer',
    ficheLacunes: 'Complète les terminaisons',
    ficheComplet: 'Écris les formes complètes',
    res100: 'Parfait, sans faute ! 🏆',
    res80: 'Très bien ! 🌟',
    res50: "Bien ! Continue à t'entraîner 💪",
    res0: 'Courage ! Relis la table de conjugaison et recommence 📚',
  },
  br: {
    titre: 'Displegadur',
    verbeAConjuguer: 'Verb da zisplegañ',
    'groupe_irrég.': 'direizh', // br: à relire
    groupe_1er: '1añ strollad', // br: à relire
    'groupe_2ème': '2vet strollad', // br: à relire
    temps: 'Amzer',
    temps_present: 'Amzer-vremañ',
    temps_passe: 'Tremenet kevrennek', // br: à relire (passé composé)
    temps_imparfait: 'Amzer-dremenet anstrob', // br: à relire (imparfait)
    temps_futur: 'Dazont',
    mode: 'Mod',
    lacunes: 'Toulloù', // br: à relire
    lacunesDesc: 'Leunia an dibennoù',
    complet: 'Klok',
    completDesc: 'Skriv ar stumm a-bezh',
    correction: 'Reizhadenn',
    changer: '⚙️ Cheñch',
    ficheLacunes: 'Leunia an dibennoù',
    ficheComplet: 'Skriv ar stummoù klok',
    res100: 'Dispar, hep fazi ebet ! 🏆',
    res80: 'Mat-tre ! 🌟',
    res50: "Mat ! Kendalc'h da embreger 💪",
    res0: 'Kalon vat ! Adlenn an daolenn-displegañ ha adkrog 📚',
  },
})

// ── Données
const VERBES = [
  { inf: 'être',    groupe: 'irrég.', conj: {
    present:  ['suis','es','est','sommes','êtes','sont'],
    passe:    ['ai été','as été','a été','avons été','avez été','ont été'],
    imparfait:['étais','étais','était','étions','étiez','étaient'],
    futur:    ['serai','seras','sera','serons','serez','seront'],
  }},
  { inf: 'avoir',   groupe: 'irrég.', conj: {
    present:  ['ai','as','a','avons','avez','ont'],
    passe:    ['ai eu','as eu','a eu','avons eu','avez eu','ont eu'],
    imparfait:['avais','avais','avait','avions','aviez','avaient'],
    futur:    ['aurai','auras','aura','aurons','aurez','auront'],
  }},
  { inf: 'aller',   groupe: 'irrég.', conj: {
    present:  ['vais','vas','va','allons','allez','vont'],
    passe:    ['suis allé','es allé','est allé','sommes allés','êtes allés','sont allés'],
    imparfait:['allais','allais','allait','allions','alliez','allaient'],
    futur:    ['irai','iras','ira','irons','irez','iront'],
  }},
  { inf: 'faire',   groupe: 'irrég.', conj: {
    present:  ['fais','fais','fait','faisons','faites','font'],
    passe:    ['ai fait','as fait','a fait','avons fait','avez fait','ont fait'],
    imparfait:['faisais','faisais','faisait','faisions','faisiez','faisaient'],
    futur:    ['ferai','feras','fera','ferons','ferez','feront'],
  }},
  { inf: 'chanter', groupe: '1er', conj: {
    present:  ['chante','chantes','chante','chantons','chantez','chantent'],
    passe:    ['ai chanté','as chanté','a chanté','avons chanté','avez chanté','ont chanté'],
    imparfait:['chantais','chantais','chantait','chantions','chantiez','chantaient'],
    futur:    ['chanterai','chanteras','chantera','chanterons','chanterez','chanteront'],
  }},
  { inf: 'manger',  groupe: '1er', conj: {
    present:  ['mange','manges','mange','mangeons','mangez','mangent'],
    passe:    ['ai mangé','as mangé','a mangé','avons mangé','avez mangé','ont mangé'],
    imparfait:['mangeais','mangeais','mangeait','mangions','mangiez','mangeaient'],
    futur:    ['mangerai','mangeras','mangera','mangerons','mangerez','mangeront'],
  }},
  { inf: 'jouer',   groupe: '1er', conj: {
    present:  ['joue','joues','joue','jouons','jouez','jouent'],
    passe:    ['ai joué','as joué','a joué','avons joué','avez joué','ont joué'],
    imparfait:['jouais','jouais','jouait','jouions','jouiez','jouaient'],
    futur:    ['jouerai','joueras','jouera','jouerons','jouerez','joueront'],
  }},
  { inf: 'finir',   groupe: '2ème', conj: {
    present:  ['finis','finis','finit','finissons','finissez','finissent'],
    passe:    ['ai fini','as fini','a fini','avons fini','avez fini','ont fini'],
    imparfait:['finissais','finissais','finissait','finissions','finissiez','finissaient'],
    futur:    ['finirai','finiras','finira','finirons','finirez','finiront'],
  }},
  { inf: 'venir',   groupe: 'irrég.', conj: {
    present:  ['viens','viens','vient','venons','venez','viennent'],
    passe:    ['suis venu','es venu','est venu','sommes venus','êtes venus','sont venus'],
    imparfait:['venais','venais','venait','venions','veniez','venaient'],
    futur:    ['viendrai','viendras','viendra','viendrons','viendrez','viendront'],
  }},
  { inf: 'pouvoir', groupe: 'irrég.', conj: {
    present:  ['peux','peux','peut','pouvons','pouvez','peuvent'],
    passe:    ['ai pu','as pu','a pu','avons pu','avez pu','ont pu'],
    imparfait:['pouvais','pouvais','pouvait','pouvions','pouviez','pouvaient'],
    futur:    ['pourrai','pourras','pourra','pourrons','pourrez','pourront'],
  }},
]

const PRONOMS = ['je','tu','il / elle','nous','vous','ils / elles']
const TEMPS = [
  { id: 'present',   label: 'Présent' },
  { id: 'passe',     label: 'Passé composé' },
  { id: 'imparfait', label: 'Imparfait' },
  { id: 'futur',     label: 'Futur' },
]

// ── État
const config = ref(charger('conjugaison_config', { verbe: 'être', temps: 'present', mode: 'lacunes' }))
watch(config, v => sauvegarder('conjugaison_config', v), { deep: true })
const phase = ref('config')

const reponses   = ref([])
const valide     = ref([])
const inputClass = ref([])
const rowFeedback = ref([])
const bonnes     = ref(0)
const mauvaises  = ref(0)
const inputRefs  = ref([])

const verbeCourant = computed(() => VERBES.find(v => v.inf === config.value.verbe) ?? VERBES[0])
const tempsCourant = computed(() => TEMPS.find(t => t.id === config.value.temps) ?? TEMPS[0])

const conjugaison = computed(() => {
  const formes = verbeCourant.value.conj[config.value.temps]
  return PRONOMS.map((pronom, i) => {
    const forme = formes[i]
    const radical = config.value.mode === 'lacunes'
      ? detecterRadical(verbeCourant.value.inf, forme, config.value.temps)
      : ''
    const terminaison = forme.slice(radical.length)
    return { pronom, forme, radical, terminaison }
  })
})

const totalLignes = computed(() => conjugaison.value.length)

function detecterRadical(inf, forme, temps) {
  // Passé composé : auxiliaire visible, l'élève tape le participe
  if (temps === 'passe') {
    const lastSpace = forme.lastIndexOf(' ')
    return lastSpace >= 0 ? forme.slice(0, lastSpace + 1) : ''
  }
  // Verbes du 1er groupe (-er) : radical = infinitif sans -er
  if (inf.endsWith('er') && !['être', 'aller'].includes(inf)) {
    const stem = inf.slice(0, -2)
    if (forme.startsWith(stem)) return stem
    // cas manger → mangeons : "mange" affiché
    if (inf.endsWith('ger') && forme.startsWith(inf.slice(0, -3) + 'ge')) return inf.slice(0, -3) + 'ge'
  }
  // Autres verbes : préfixe commun le plus long avec l'infinitif
  let i = 0
  while (i < inf.length && i < forme.length && inf[i] === forme[i]) i++
  return i >= 2 ? forme.slice(0, i) : ''
}

function rowClass(i) {
  if (!valide.value[i]) return ''
  return inputClass.value[i] === 'ok' ? 'row-ok' : 'row-err'
}

function corrClass(i) {
  if (!valide.value[i]) return ''
  return inputClass.value[i] === 'ok' ? 'corr-ok' : 'corr-err'
}

function demarrer() {
  inputRefs.value = []
  reponses.value   = Array(6).fill('')
  valide.value     = Array(6).fill(false)
  inputClass.value = Array(6).fill('')
  rowFeedback.value = Array(6).fill('')
  bonnes.value = 0; mauvaises.value = 0
  phase.value = 'jeu'
  nextTick(() => inputRefs.value[0]?.focus())
}

function imprimerFiche() {
  const verbe = verbeCourant.value
  const tempsObj = tempsCourant.value
  const formes = verbe.conj[config.value.temps]

  const rows = PRONOMS.map((pronom, i) => {
    const forme = formes[i]
    const radical = detecterRadical(verbe.inf, forme, config.value.temps)
    const lacune = config.value.mode === 'lacunes'
      ? `<span style="display:inline-block;min-width:100px;border-bottom:1.5px solid #888;">&nbsp;</span>`
      : `<span style="display:inline-block;min-width:160px;border-bottom:1.5px solid #888;">&nbsp;</span>`
    const gauche = config.value.mode === 'lacunes' && radical
      ? `<span style="font-weight:700;">${radical}</span>`
      : ''
    return `<tr>
      <td style="padding:.5rem 1rem .5rem 0;font-style:italic;color:#555;font-size:1rem;">${pronom}</td>
      <td style="padding:.5rem 0;font-size:1.1rem;">${gauche}${lacune}</td>
    </tr>`
  }).join('')

  const modeLabel = config.value.mode === 'lacunes' ? t('ficheLacunes') : t('ficheComplet')

  const html = `<!DOCTYPE html><html lang="${langue.value}"><head>
    <meta charset="UTF-8"><title>${t('titre')} — ${verbe.inf}</title>
    <style>
      body { font-family: Arial, sans-serif; max-width: 500px; margin: 2cm auto; color: #222; }
      h1 { font-size: 1.3rem; border-bottom: 2px solid #333; padding-bottom: .4rem; margin-bottom: .5rem; }
      .entete { font-size: .85rem; color: #666; margin-bottom: 1.5rem; }
      .verb-box { background: #f5f7fa; border: 1.5px solid #ddd; border-radius: 8px; padding: 1rem 1.5rem; }
      .verb-title { font-size: 1.4rem; font-weight: 900; margin-bottom: .25rem; }
      .verb-temps { font-size: 1rem; color: #555; margin-bottom: 1rem; }
      table { width: 100%; border-collapse: collapse; }
    </style></head><body>
    <h1>${t('titre')}</h1>
    <p class="entete">${modeLabel} &nbsp;&nbsp;&nbsp; ${t('nom')} : __________________________ &nbsp; ${t('date')} : ______________</p>
    <div class="verb-box">
      <div class="verb-title">${verbe.inf} <small style="font-weight:400;font-size:.75em;color:#777;">(${t('groupe_' + verbe.groupe)})</small></div>
      <div class="verb-temps">${t('temps_' + tempsObj.id)}</div>
      <table>${rows}</table>
    </div>
    <script>window.onafterprint = function() { window.close(); }; window.print();<\/script>
  </body></html>`

  const w = window.open('', '_blank')
  if (!w) return
  w.document.write(html)
  w.document.close()
}

function validerLigne(i) {
  if (valide.value[i]) { focusSuivant(i); return }
  const saisie = normaliser(reponses.value[i]?.trim() ?? '')
  const attendu = config.value.mode === 'lacunes'
    ? normaliser(conjugaison.value[i].terminaison)
    : normaliser(conjugaison.value[i].forme)
  const ok = saisie === attendu
  valide.value[i] = true
  inputClass.value[i] = ok ? 'ok' : 'erreur'
  rowFeedback.value[i] = ok ? '✅' : `❌ ${conjugaison.value[i].forme}`
  if (ok) bonnes.value++; else mauvaises.value++
  // afficher la bonne réponse dans l'input si erreur
  if (!ok) reponses.value[i] = config.value.mode === 'lacunes'
    ? conjugaison.value[i].terminaison
    : conjugaison.value[i].forme
  focusSuivant(i)
}

function focusSuivant(i) {
  const next = inputRefs.value.slice(i + 1).find(el => el && !el.disabled)
  if (next) next.focus()
  else if (valide.value.every(Boolean)) setTimeout(() => { phase.value = 'resultats' }, 600)
}

function validerTout() {
  conjugaison.value.forEach((_, i) => { if (!valide.value[i]) validerLigne(i) })
  setTimeout(() => { phase.value = 'resultats' }, 800)
}

const resultMsg = computed(() => {
  const n = bonnes.value; const total = totalLignes.value
  if (n === total) { confettis(40); return t('res100') }
  if (n >= total * 0.8) return t('res80')
  if (n >= total * 0.5) return t('res50')
  return t('res0')
})
</script>

<style scoped>
.container { max-width: 640px; margin: 0 auto; padding: 1rem; }
h1 { color: var(--bleu); margin-bottom: 1rem; }

/* Config */
.config-box { background: white; border-radius: var(--radius); box-shadow: var(--shadow); padding: 1.5rem; }
.config-section { margin-bottom: 1.25rem; }
.config-section-title { font-weight: 700; margin-bottom: .6rem; font-size: .9rem; text-transform: uppercase; letter-spacing: .04em; color: #555; }

.verbe-grid { display: flex; flex-wrap: wrap; gap: .4rem; }
.verbe-btn {
  background: white; border: 2px solid var(--gris-brd); border-radius: 8px;
  padding: .35rem .75rem; cursor: pointer; font-size: .95rem; font-weight: 600;
  font-family: inherit; transition: all .15s; display: flex; align-items: center; gap: .35rem;
}
.verbe-btn:hover  { border-color: var(--bleu); }
.verbe-btn:focus-visible { outline: 3px solid var(--bleu); outline-offset: 2px; }
.verbe-btn.active { border-color: var(--bleu); background: #eef5ff; }
.verbe-groupe { font-size: .7rem; color: #888; font-weight: 400; }

/* Mode cards */
.mode-cards { display: grid; grid-template-columns: 1fr 1fr; gap: .75rem; }
.mode-card {
  border: 3px solid var(--gris-brd); border-radius: var(--radius);
  padding: 1rem; cursor: pointer; transition: all .15s; text-align: center;
  background: white; font-family: inherit; width: 100%;
}
.mode-card:hover  { border-color: var(--bleu); }
.mode-card:focus-visible { outline: 3px solid var(--bleu); outline-offset: 2px; }
.mode-card.active { border-color: var(--bleu); background: #eef5ff; }
.mode-icon  { font-size: 1.75rem; }
.mode-title { font-weight: 800; font-size: .95rem; margin: .3rem 0 .15rem; }
.mode-desc  { font-size: .78rem; color: #666; }

/* Exercise */
.exercise-box { background: white; border-radius: var(--radius); box-shadow: var(--shadow); padding: 1.5rem; }

.conj-header {
  display: flex; align-items: baseline; gap: .75rem; justify-content: center;
  margin-bottom: 1.25rem;
}
.conj-verb  { font-size: 1.5rem; font-weight: 800; color: var(--bleu); }
.conj-temps { font-size: 1rem; color: #888; font-weight: 600; }

.conj-table { display: flex; flex-direction: column; gap: .5rem; }

.conj-row {
  display: flex; align-items: center; gap: .5rem;
  padding: .4rem .6rem; border-radius: 8px; transition: background .2s;
}
.conj-row.row-ok  { background: #f0fdf4; }
.conj-row.row-err { background: #fff5f5; }

.pronom { min-width: 7rem; font-weight: 600; color: #555; font-size: .95rem; }
.radical { font-size: 1rem; font-weight: 600; color: #333; }

.conj-input {
  border: 2px solid #ccc; border-radius: 6px;
  padding: .35rem .6rem; font-size: 1rem; font-family: inherit;
  width: 8rem; transition: border-color .15s;
}
.conj-input-full { width: 12rem; }
.conj-input:focus { outline: none; border-color: var(--bleu); }
.conj-input.ok      { border-color: #22c55e; background: #f0fdf4; color: #15803d; }
.conj-input.erreur  { border-color: var(--rouge); background: #fff5f5; color: var(--rouge); }
.conj-input:disabled { opacity: 1; }

.row-feedback { font-size: .85rem; font-weight: 600; min-width: 7rem; }

/* Résultats */
.result-score { font-size: 3rem; font-weight: 900; color: var(--bleu); }
.result-msg   { font-size: 1.1rem; margin: .5rem 0 1.5rem; }

.conj-correction { margin: 1rem auto; max-width: 320px; text-align: left; }
.correction-row { display: flex; align-items: center; gap: 1rem; padding: .3rem 0; border-bottom: 1px solid #f0f0f0; }
.correction-forme { font-weight: 700; font-size: 1rem; }
.corr-ok  { color: #15803d; }
.corr-err { color: var(--rouge); }

.score-bar {
  display: flex; justify-content: space-between; align-items: center;
  font-weight: 700;
}
</style>
