<template>
  <div class="container">
    <h1 class="section-heading">✖️ {{ t('titre') }}</h1>

    <!-- ══ CONFIG ══ -->
    <ConfigExercice v-if="phase === 'config'" :config="config" v-model:mode="mode" :fiche="fiche" police
      :aleatoire="ficheAleatoire" @commencer="jeu.demarrer" @regenerer="nouvelle">
      <ChoixReglage :definition="DEFINITION" cle="niveau" v-model="config.niveau" :titre="t('niveau')" />
      <!-- le programme s'arrête à 10 × 10 : les tables de 11 et 12 sont un bonus -->
      <ChoixReglage :definition="DEFINITION" :niveau="config.niveau" cle="tables" v-model="config.tables"
        :titre="t('tablesAReviser')" :libelle="n => `× ${n}`">
        <div class="btn-group" style="margin-top:.5rem;">
          <button class="level-btn" :class="{ active: toutesSelectionnees }" @click="toggleToutes">{{ t('toutes') }}</button>
        </div>
      </ChoixReglage>

      <ChoixReglage v-if="mode === 'jouer'" :definition="DEFINITION" cle="mode" v-model="config.mode" cartes
        :titre="t('mode')" :libelle="m => t(m)" :icone="m => ICONES[m]" :description="m => t(m + 'Desc')" />

      <ChoixReglage v-if="mode === 'imprimer' || config.mode !== 'chrono'" :definition="DEFINITION" :niveau="config.niveau"
        cle="jusqu" v-model="config.jusqu" :titre="t('multiplierJusqua')" :libelle="m => `× ${m}`" />
      <ChoixReglage v-if="mode === 'jouer' && config.mode === 'aleatoire'" :definition="DEFINITION" cle="nbQ" v-model="config.nbQ"
        :titre="t('nbQuestions')" />

      <template v-if="mode === 'imprimer'">
        <ChoixReglage :definition="DEFINITION" cle="ordreFiche" v-model="config.ordreFiche" :titre="t('ordreFiche')"
          :libelle="o => t(o === 'ordre' ? 'dansLOrdre' : 'melange')" />
        <ChoixReglage :definition="DEFINITION" cle="nbFiche" v-model="config.nbFiche" :titre="t('nbCalculs')"
          :libelle="n => (n === 0 ? t('toutes') : String(n))" />
      </template>
    </ConfigExercice>

    <!-- ══ APPRENTISSAGE (mode entraînement : affiche la table avant) ══ -->
    <div v-if="phase === 'jeu' && apprendre" class="exercise-box" style="text-align:center;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.25rem;">
        <button class="btn-quitter" @click="jeu.quitter" :title="t('quitterTitre')">{{ t('quitter') }}</button>
        <span style="font-size:.85rem;color:#888;font-weight:600;">{{ t('tableN', { n: tableN, total: config.tables.length }) }}</span>
      </div>
      <div class="table-title">{{ t('tableDe', { n: q.a }) }}</div>
      <div class="table-grid">
        <div v-for="i in config.jusqu" :key="i" class="table-row">
          <span class="table-cell-a">{{ q.a }} × {{ i }}</span>
          <span class="table-cell-eq">=</span>
          <span class="table-cell-r">{{ q.a * i }}</span>
        </div>
      </div>
      <button class="btn btn-primary" style="margin-top:1.5rem;" @click="apprendre = false">{{ t('jeLaConnais') }}</button>
    </div>

    <!-- ══ EXERCICE ══ -->
    <template v-else-if="phase === 'jeu' && q">
      <!-- défi chrono : le temps, pas la question -->
      <template v-if="config.mode === 'chrono'">
        <div class="score-bar">
          <button class="btn-quitter" @click="jeu.quitter" :title="t('quitterTitre')">{{ t('quitter') }}</button>
          <span>⏱ <span :style="{ color: urgent ? 'var(--rouge)' : 'inherit' }">{{ restant }}s</span></span>
          <span>✅ {{ bonnes }} &nbsp; ❌ {{ mauvaises }}</span>
        </div>
        <div class="progress-track" style="max-width:680px;margin:0 auto .75rem;">
          <div class="progress-fill" :class="{ urgent }" :style="{ width: (restant / DUREE_CHRONO * 100) + '%', background: urgent ? 'var(--rouge)' : undefined }"></div>
        </div>
      </template>

      <component :is="config.mode === 'chrono' ? 'div' : QuestionJeu" v-bind="config.mode === 'chrono' ? { class: 'exercise-box' } : { jeu }">
        <div class="exercise-question">{{ q.texte }}</div>
        <SaisieReponse v-model="reponse" type="nombre" class="exercise-input" :etat="etat" placeholder="?" :disabled="repondu"
          focus @entree="valider" />
        <div class="feedback" :class="etat">{{ retour?.message }}</div>
        <div class="btn-group" style="justify-content:center;margin-top:1rem;">
          <button v-if="config.mode !== 'chrono'" class="btn btn-ghost" :disabled="repondu" @click="passer">{{ t('passer') }}</button>
          <button class="btn btn-primary" :disabled="repondu" @click="valider">{{ t('valider') }}</button>
        </div>
      </component>
    </template>

    <!-- ══ RÉSULTATS ══ -->
    <div v-if="phase === 'resultats' && config.mode === 'chrono'" class="exercise-box resultats-jeu" style="text-align:center;">
      <div class="result-score">{{ bonnes }}</div>
      <div class="result-msg">{{ t('bonnesEn1Min') }} {{ messageChrono }}</div>
      <div class="btn-group actions" style="justify-content:center;">
        <button class="btn btn-primary" @click="jeu.recommencer">{{ t('rejouer') }}</button>
        <button class="btn btn-ghost" @click="jeu.quitter">{{ t('parametres') }}</button>
      </div>
    </div>
    <ResultatsJeu v-else-if="phase === 'resultats'" :bonnes="bonnes" :total="questions.length" :cle-fin="cleFin"
      @rejouer="jeu.recommencer" @reglages="jeu.quitter">
      <TableauCorrection :historique="historique" />
      <div v-if="mauvaises" class="btn-group" style="justify-content:center;margin-bottom:1rem;">
        <button class="btn btn-warning" @click="revoirErreurs">{{ t('revoirErreurs') }}</button>
      </div>
    </ResultatsJeu>
  </div>
</template>

<script setup>
// Tables de multiplication : la vue ne fait que les réglages, le minuteur du défi et le rendu d'une question. Niveaux,
// générateur et fiche : src/exercices/tables/ (definition.js, generateur.js, fiche.js).
import { ref, computed, watch } from 'vue'
import { confettis } from '../../utils'
import { useI18n, contenu } from '../../i18n'
import ConfigExercice from '../../components/ConfigExercice.vue'
import ChoixReglage from '../../components/ChoixReglage.vue'
import QuestionJeu from '../../components/QuestionJeu.vue'
import ResultatsJeu from '../../components/ResultatsJeu.vue'
import SaisieReponse from '../../components/SaisieReponse.vue'
import TableauCorrection from '../../components/TableauCorrection.vue'
import { useReglages } from '../../composables/useReglages'
import { useFicheExercice } from '../../composables/useFicheExercice'
import { useJeu } from '../../composables/useJeu'
import { useMinuteur } from '../../composables/useMinuteur'
import DEFINITION from '../../exercices/tables/definition'
import { INTERFACE, TEXTES } from '../../exercices/tables/textes'
import { questions as genererQuestions, questionsFiche, verifier } from '../../exercices/tables/generateur'
import { fiche as ficheTables } from '../../exercices/tables/fiche'

const { t } = useI18n(INTERFACE)
const { config, langueContenu } = useReglages(DEFINITION, 'tables_config')
const T = contenu(TEXTES, () => langueContenu.value).t
const ICONES = { entrainement: '📖', aleatoire: '🎲', chrono: '⏱️' }
const DUREE_CHRONO = 60 // secondes

// « Toutes » : les tables du programme, de 1 à 10 (11 et 12 en bonus)
const toutesSelectionnees = computed(() => [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].every(n => config.value.tables.includes(n)))
function toggleToutes() {
  config.value.tables = toutesSelectionnees.value ? DEFINITION.niveaux[config.value.niveau].reglages.tables : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
}

// ── Jeu : entraînement (voir la table, puis répondre dans l'ordre), aléatoire, défi chrono d'une minute ──
const reponse = ref('')
const apprendre = ref(false)   // entraînement : la table s'affiche avant ses questions
const aRevoir = ref(null)      // « revoir les erreurs » : les calculs ratés, à la place d'un nouveau tirage
const minuteur = useMinuteur()
const { restant } = minuteur
const urgent = computed(() => restant.value <= 10)

const jeu = useJeu({
  generer: rng => {
    if (aRevoir.value) { const liste = rng.melanger(aRevoir.value); aRevoir.value = null; return liste }
    return genererQuestions({ niveau: config.value.niveau, reglages: config.value, rng, T })
  },
  verifier,
  messageErreur: q => `❌ ${q.a} × ${q.b} = ${q.reponse}`,
  apresErreur: 'continuer',
  delai: 700,
  delaiErreur: 1000,
  surQuestion: q => { reponse.value = ''; apprendre.value = !!q?.premiere },
})
const { phase, questions, q, bonnes, mauvaises, historique, retour, repondu, etat, cleFin } = jeu
// entraînement : rang de la table en cours
const tableN = computed(() => config.value.tables.indexOf(q.value?.a) + 1)

// défi chrono : une minute pour tout, les réponses enchaînent plus vite
watch(phase, p => {
  if (p === 'jeu' && config.value.mode === 'chrono') minuteur.demarrer(DUREE_CHRONO, { surFin: () => { jeu.phase.value = 'resultats' } })
  else minuteur.arreter()
})
const messageChrono = computed(() => t(bonnes.value >= 50 ? 'chrono50' : bonnes.value >= 30 ? 'chrono30' : bonnes.value >= 20 ? 'chrono20' : 'chronoBas'))
watch(phase, p => {
  if (p === 'resultats' && config.value.mode === 'chrono') confettis(bonnes.value >= 50 ? 50 : bonnes.value >= 30 ? 25 : 0)
})

function valider() {
  if (repondu.value || String(reponse.value).trim() === '') return
  const i = jeu.index.value
  const ok = jeu.repondre(reponse.value, { donne: String(reponse.value) })
  if (config.value.mode === 'chrono') setTimeout(() => { if (jeu.index.value === i && phase.value === 'jeu') jeu.suivante() }, ok ? 400 : 600)
}
// passer : la question compte comme une erreur, et on enchaîne aussitôt
function passer() {
  if (repondu.value) return
  jeu.passer({ donne: t('passe') })
  jeu.suivante()
}
function revoirErreurs() {
  aRevoir.value = historique.value.filter(h => !h.ok).map(h => ({ ...h.question, premiere: false }))
  jeu.demarrer()
}

// ── Fiche imprimable (aperçu + impression gérés par ConfigExercice) ──
// la fiche ne change au hasard que si les calculs sont mélangés ou tirés parmi tous
const ficheAleatoire = computed(() => config.value.ordreFiche === 'melange' || config.value.nbFiche > 0)
const { mode, fiche, nouvelle } = useFicheExercice({
  tirer: rng => questionsFiche({ niveau: config.value.niveau, reglages: config.value, rng, T }),
  mettreEnPage: (questions, police) => ficheTables({ questions, reglages: config.value, T, langue: langueContenu.value, ...police }),
})
</script>

<style scoped>
/* Table d'apprentissage */
.table-title { font-size: 1.8rem; font-weight: 900; color: var(--bleu); margin-bottom: 1.25rem; }
.table-grid { display: inline-grid; grid-template-columns: auto auto auto; gap: .3rem 1rem; text-align: right; margin: 0 auto; }
.table-row { display: contents; }
.table-cell-a  { font-size: 1.3rem; font-weight: 700; text-align: right; }
.table-cell-eq { font-size: 1.3rem; color: #aaa; text-align: center; }
.table-cell-r  { font-size: 1.3rem; font-weight: 900; color: var(--bleu); text-align: left; }
.urgent { background: var(--rouge) !important; }
</style>
