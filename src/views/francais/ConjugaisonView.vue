<template>
  <div class="container">
    <h1>✍️ {{ t('titre') }}</h1>

    <!-- ══ CONFIG ══ -->
    <ConfigExercice v-if="phase === 'config'" :config="config" v-model:mode="mode" :fiche="fiche"
      :desactive="!paires.length" @commencer="demarrer" @regenerer="regenerer">

      <div class="config-section">
        <div class="config-section-title">{{ t('niveau') }}</div>
        <div class="btn-group">
          <button v-for="n in NIVEAUX" :key="n.id"
            class="level-btn" :class="{ active: config.niveau === n.id }"
            @click="config.niveau = n.id">{{ n.id.toUpperCase() }}</button>
        </div>
      </div>

      <div class="config-section">
        <div class="config-section-title">{{ t('verbeAConjuguer') }}</div>
        <div class="verbe-grid">
          <button v-for="v in verbesDuNiveau" :key="v"
            class="verbe-btn" :class="{ active: config.verbes.includes(v) }"
            @click="basculer('verbes', v)">
            {{ verbeDe(v).inf }}
            <span class="verbe-groupe">{{ t('groupe_' + GROUPE_DE[verbeDe(v).groupe]) }}</span>
          </button>
        </div>
      </div>

      <div class="config-section">
        <div class="config-section-title">{{ t('temps') }}</div>
        <div class="btn-group">
          <button v-for="tp in tempsDuNiveau" :key="tp"
            class="level-btn" :class="{ active: config.temps.includes(tp) }"
            @click="basculer('temps', tp)">{{ nomTemps(tp) }}</button>
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

    </ConfigExercice>

    <!-- ══ EXERCICE ══ -->
    <div v-if="phase === 'jeu'" class="exercise-box">
      <div class="score-bar" style="margin-bottom:1.25rem;">
        <button class="btn-quitter" @click="phase = 'config'">{{ t('quitter') }}</button>
        <span>✅ {{ bonnes }} &nbsp; ❌ {{ mauvaises }}</span>
      </div>

      <div class="conj-header">
        <span class="conj-verb">{{ verbeDe(courant.verbe).inf }}</span>
        <span class="conj-temps">{{ nomTemps(courant.temps) }}</span>
      </div>

      <div class="conj-table">
        <div v-for="(row, i) in conjugaison" :key="i"
             class="conj-row" :class="rowClass(i)">
          <span class="pronom">{{ row.pronom }}</span>

          <!-- mode lacunes : affiche le radical, l'élève tape la terminaison -->
          <template v-if="config.mode === 'lacunes'">
            <span class="radical">{{ row.debut }}</span>
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
import { normaliser, confettis, sauvegarder, chargerReglages, aleatoire, melanger } from '../../utils'
import { formesTemps, verbeDe, TEMPS_CYCLE, TEMPS_CM2 } from '../../data/conjugaison.js'
import { useI18n, enLangue } from '../../i18n'
import messagesFr from '../../i18n/fr/views/francais/ConjugaisonView.js'
import messagesBr from '../../i18n/br/views/francais/ConjugaisonView.js'
import ConfigExercice from '../../components/ConfigExercice.vue'
import { useModeExercice } from '../../composables/useModeExercice'
import { ligneNomDate } from '../../composables/useOptionsFiche'

const { t } = useI18n({ fr: messagesFr, br: messagesBr })

// ── Niveaux : verbes et temps au programme de chaque classe (CONTRAINTES.conjugaison de src/data/programme.js,
// vérifié par tests/programme-francais.test.mjs). Tout ce qu'un niveau propose est au programme, et tout est
// coché par défaut.
//   CP : être et avoir au présent ; CE1 : + 1er groupe, présent, imparfait, futur, passé composé ;
//   CE2 : + 8 verbes irréguliers ; CM1 : + 2e groupe ; CM2 : + passé simple et plus-que-parfait.
const ETRE_AVOIR = ['etre', 'avoir']
const PREMIER = ['chanter', 'jouer', 'parler', 'aimer']
const DEUXIEME = ['finir', 'grandir', 'choisir']
const IRREGULIERS = ['aller', 'faire', 'dire', 'venir', 'pouvoir', 'voir', 'vouloir', 'prendre']
const NIVEAUX = [
  { id: 'cp',  verbes: ETRE_AVOIR,                                     temps: ['present'] },
  { id: 'ce1', verbes: [...ETRE_AVOIR, ...PREMIER],                    temps: TEMPS_CYCLE },
  { id: 'ce2', verbes: [...ETRE_AVOIR, ...PREMIER, ...IRREGULIERS],    temps: TEMPS_CYCLE },
  { id: 'cm1', verbes: [...ETRE_AVOIR, ...PREMIER, ...DEUXIEME, ...IRREGULIERS], temps: TEMPS_CYCLE },
  { id: 'cm2', verbes: [...ETRE_AVOIR, ...PREMIER, ...DEUXIEME, ...IRREGULIERS], temps: [...TEMPS_CYCLE, ...TEMPS_CM2] },
]
const niveauDe = id => NIVEAUX.find(n => n.id === id) ?? NIVEAUX[1]
// groupe (src/data/conjugaison.js) → clé du catalogue groupe_<…>
const GROUPE_DE = { auxiliaire: 'aux', '1er groupe': '1', '2e groupe': '2', '3e groupe': '3' }
const nomTemps = id => t('temps_' + id.replace(/-/g, '_'))
const NB_TABLEAUX = 4    // tableaux par fiche

// ── État (réglages d'une ancienne version : niveau, verbes ou temps hors du niveau → défauts du niveau)
const DEFAUT = { niveau: 'ce1', verbes: [...niveauDe('ce1').verbes], temps: [...niveauDe('ce1').temps], mode: 'lacunes' }
const brut = chargerReglages('conjugaison_config', DEFAUT)
const niv0 = niveauDe(brut.niveau)
const garder = (liste, dispo) => { const l = liste.filter(x => dispo.includes(x)); return l.length ? l : [...dispo] }
const config = ref({
  niveau: niv0.id,
  verbes: garder(brut.verbes, niv0.verbes),
  temps: garder(brut.temps, niv0.temps),
  mode: brut.mode === 'complet' ? 'complet' : 'lacunes',
})
watch(config, v => sauvegarder('conjugaison_config', v), { deep: true })
// changer de niveau coche tout ce qui est au programme de ce niveau
watch(() => config.value.niveau, id => {
  const n = niveauDe(id)
  config.value.verbes = [...n.verbes]
  config.value.temps = [...n.temps]
})
const verbesDuNiveau = computed(() => niveauDe(config.value.niveau).verbes)
const tempsDuNiveau = computed(() => niveauDe(config.value.niveau).temps)
function basculer(cle, x) {
  const l = config.value[cle]
  if (l.includes(x)) { if (l.length > 1) config.value[cle] = l.filter(y => y !== x) }
  else config.value[cle] = [...l, x]
}
// couples (verbe, temps) possibles avec les choix du niveau
const paires = computed(() => {
  const n = niveauDe(config.value.niveau)
  const vs = config.value.verbes.filter(v => n.verbes.includes(v)), ts = config.value.temps.filter(x => n.temps.includes(x))
  return vs.flatMap(verbe => ts.map(temps => ({ verbe, temps })))
})

const phase = ref('config')
const courant = ref({ verbe: 'etre', temps: 'present' })
const reponses   = ref([])
const valide     = ref([])
const inputClass = ref([])
const rowFeedback = ref([])
const bonnes     = ref(0)
const mauvaises  = ref(0)
const inputRefs  = ref([])

// Les six lignes d'un tableau : pronom, forme, début donné (radical ou auxiliaire) et partie à écrire
// (terminaison ou participe passé ; toute la forme quand la terminaison n'est pas régulière, ex. vous êtes)
function lignes(verbe, temps) {
  return formesTemps(verbe, temps).map(([[, pronom], ...segs]) => {
    const k = segs.map(([c]) => c).findLastIndex(c => c === 'ter' || c === 'pp')
    const txt = l => l.map(([, x]) => x).join('')
    return { pronom: pronom.trim(), forme: txt(segs), debut: k > 0 ? txt(segs.slice(0, k)) : '', trou: k > 0 ? txt(segs.slice(k)) : txt(segs) }
  })
}
const conjugaison = computed(() => lignes(courant.value.verbe, courant.value.temps))
const totalLignes = computed(() => conjugaison.value.length)

// « allé(e)s » : allés, allées (et la forme écrite telle quelle)
function accepte(saisie, attendu) {
  const s = normaliser(saisie), a = normaliser(attendu)
  if (s === a) return true
  const motif = a.replace(/[.*+?^${}|[\]\\]/g, '\\$&').replace(/\(e\)/g, 'e?')
  return new RegExp(`^${motif}$`).test(s)
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
  if (!paires.value.length) return
  courant.value = paires.value[aleatoire(0, paires.value.length - 1)]
  inputRefs.value = []
  reponses.value   = Array(6).fill('')
  valide.value     = Array(6).fill(false)
  inputClass.value = Array(6).fill('')
  rowFeedback.value = Array(6).fill('')
  bonnes.value = 0; mauvaises.value = 0
  phase.value = 'jeu'
  nextTick(() => inputRefs.value[0]?.focus())
}

// Tableaux de la fiche : des couples au hasard, en variant les verbes autant que possible
function tableauxFiche() {
  const tous = melanger([...paires.value]), choisis = [], vus = new Set()
  for (const p of tous) if (choisis.length < NB_TABLEAUX && !vus.has(p.verbe)) { choisis.push(p); vus.add(p.verbe) }
  for (const p of tous) if (choisis.length < NB_TABLEAUX && !choisis.includes(p)) choisis.push(p)
  return choisis
}

// Document HTML de la fiche (aperçu + impression gérés par ConfigExercice)
function htmlFiche() {
  const lacunes = config.value.mode === 'lacunes'
  const tableaux = tableauxFiche()
  const titreVerbe = p => `${verbeDe(p.verbe).inf} <small>(${t('groupe_' + GROUPE_DE[verbeDe(p.verbe).groupe])})</small>`
  const boites = tableaux.map(p => {
    const rows = lignes(p.verbe, p.temps).map(l => `<tr>
      <td class="pronom">${l.pronom}</td>
      <td class="forme">${lacunes && l.debut ? `<b>${l.debut}</b>` : ''}<span class="trou ${lacunes ? '' : 'long'}"></span></td>
    </tr>`).join('')
    return `<div class="verb-box" data-verbe="${p.verbe}" data-temps="${p.temps}">
      <div class="verb-title">${titreVerbe(p)}</div>
      <div class="verb-temps">${nomTemps(p.temps)}</div>
      <table>${rows}</table>
    </div>`
  }).join('')
  // Corrigé : les formes attendues, partie à écrire en gras
  const corrige = tableaux.map(p => `<div class="corr"><h3>${verbeDe(p.verbe).inf}, ${nomTemps(p.temps).toLowerCase()}</h3><table>${
    lignes(p.verbe, p.temps).map(l => `<tr><td class="pronom">${l.pronom}</td><td>${lacunes ? l.debut : ''}<b>${lacunes ? l.trou : l.forme}</b></td></tr>`).join('')
  }</table></div>`).join('')

  return `<!DOCTYPE html><html lang="fr"><head>
    <meta charset="UTF-8"><title>${t('titre')} — ${config.value.niveau.toUpperCase()}</title>
    <style>
      body { font-family: Arial, sans-serif; max-width: 720px; margin: 1.5cm auto; color: #222; }
      h1 { font-size: 1.3rem; border-bottom: 2px solid #333; padding-bottom: .4rem; margin-bottom: .5rem; }
      .consigne { font-size: .95rem; margin: 0 0 1rem; }
      .grille { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
      .verb-box { background: #f5f7fa; border: 1.5px solid #ddd; border-radius: 8px; padding: .8rem 1rem; page-break-inside: avoid; }
      .verb-title { font-size: 1.25rem; font-weight: 900; }
      .verb-title small { font-weight: 400; font-size: .7em; color: #777; }
      .verb-temps { font-size: .95rem; color: #555; margin-bottom: .5rem; }
      table { width: 100%; border-collapse: collapse; }
      td { padding: .35rem 0; font-size: 1.05rem; }
      td.pronom { padding-right: .6rem; font-style: italic; color: #555; font-size: .95rem; white-space: nowrap; width: 1%; }
      .trou { display: inline-block; min-width: 70px; border-bottom: 1.5px solid #888; height: 1.1em; vertical-align: bottom; }
      .trou.long { min-width: 150px; }
      section.corrige .corr { display: inline-block; vertical-align: top; width: 48%; margin: 0 1% .6rem 0; }
      section.corrige h3 { font-size: .95rem; margin: .4rem 0 .2rem; }
      section.corrige td { padding: .05rem .6rem .05rem 0; font-size: .9rem; }
    </style></head><body>
    <h1>${t('titre')} — ${config.value.niveau.toUpperCase()}</h1>
    ${ligneNomDate('fr')}
    <p class="consigne">${lacunes ? t('ficheLacunes') : t('ficheComplet')}</p>
    <div class="grille">${boites}</div>
    <section class="corrige"><h2>${t('corrige')}</h2>${corrige}</section>
  </body></html>`
}

const { mode, graine, regenerer } = useModeExercice()
const fiche = computed(() => {
  if (mode.value !== 'imprimer') return ''
  graine.value
  // exercice de français : fiche entièrement en français, même avec une interface bretonne
  return enLangue('fr', htmlFiche)
})

function validerLigne(i) {
  if (valide.value[i]) { focusSuivant(i); return }
  const l = conjugaison.value[i]
  const attendu = config.value.mode === 'lacunes' ? l.trou : l.forme
  const ok = accepte(reponses.value[i] ?? '', attendu)
  valide.value[i] = true
  inputClass.value[i] = ok ? 'ok' : 'erreur'
  rowFeedback.value[i] = ok ? '✅' : `❌ ${l.forme}`
  if (ok) bonnes.value++; else mauvaises.value++
  // afficher la bonne réponse dans l'input si erreur
  if (!ok) reponses.value[i] = attendu
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
