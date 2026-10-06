<template>
  <div class="container">
    <h1 class="section-heading">✖️ {{ t('tables.titre') }}</h1>

    <!-- ══ CONFIG ══ -->
    <CadreExercice v-if="phase === 'config'" v-model:mode="mode" :fiche="fiche" :config="config" :aleatoire="ficheAleatoire"
      @commencer="jeu.demarrer" @regenerer="nouvelle">
      <template #default="{ mode: modeCourant }">
        <ChoixReglage :definition="DEFINITION" cle="niveau" v-model="config.niveau" :titre="t('communs.niveau')" />
        <!-- le programme s'arrête à 10 × 10 : les tables de 11 et 12 sont un bonus -->
        <ChoixReglage :definition="DEFINITION" :niveau="config.niveau" cle="tables" v-model="config.tables"
          :titre="t('tables.tablesAReviser')" :libelle="n => `× ${n}`">
          <div class="btn-group" style="margin-top:.5rem;">
            <button type="button" class="level-btn" :class="{ active: toutesSelectionnees }" :aria-pressed="toutesSelectionnees" @click="toggleToutes">{{ t('tables.toutes') }}</button>
          </div>
        </ChoixReglage>

        <ChoixReglage v-if="modeCourant === 'jouer'" :definition="DEFINITION" cle="mode" v-model="config.mode" cartes
          :titre="t('tables.mode')" :libelle="m => t(`tables.${m}`)" :icone="m => ICONES[m]" :description="m => t(`tables.${m}Desc`)" />

        <ChoixReglage v-if="modeCourant === 'imprimer' || config.mode !== 'chrono'" :definition="DEFINITION" :niveau="config.niveau"
          cle="jusqu" v-model="config.jusqu" :titre="t('tables.multiplierJusqua')" :libelle="m => `× ${m}`" />
        <ChoixReglage v-if="modeCourant === 'jouer' && config.mode === 'aleatoire'" :definition="DEFINITION" cle="nbQ" v-model="config.nbQ"
          :titre="t('communs.nbQuestions')" />

        <template v-if="modeCourant === 'imprimer'">
          <ChoixReglage :definition="DEFINITION" cle="ordreFiche" v-model="config.ordreFiche" :titre="t('tables.ordreFiche')"
            :libelle="o => t(o === 'ordre' ? 'tables.dansLOrdre' : 'tables.melange')" />
          <ChoixReglage :definition="DEFINITION" cle="nbFiche" v-model="config.nbFiche" :titre="t('tables.nbCalculs')"
            :libelle="n => (n === 0 ? t('tables.toutes') : String(n))" />
        </template>
      </template>
    </CadreExercice>

    <!-- ══ APPRENTISSAGE (mode entraînement : affiche la table avant) ══ -->
    <div v-if="phase === 'jeu' && apprendre && q" class="exercise-box" style="text-align:center;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.25rem;">
        <button type="button" class="btn-quitter" @click="jeu.quitter" :title="t('communs.quitterTitre')">{{ t('communs.quitter') }}</button>
        <span style="font-size:.85rem;color:#666;font-weight:600;">{{ t('tables.tableN', { n: tableN, total: config.tables.length }) }}</span>
      </div>
      <h2 class="table-title">{{ t('tables.tableDe', { n: q.a }) }}</h2>
      <div class="table-grid">
        <div v-for="i in config.jusqu" :key="i" class="table-row">
          <span class="table-cell-a">{{ q.a }} × {{ i }}</span>
          <span class="table-cell-eq">=</span>
          <span class="table-cell-r">{{ q.a * i }}</span>
        </div>
      </div>
      <button type="button" class="btn btn-primary" style="margin-top:1.5rem;" @click="apprendre = false">{{ t('tables.jeLaConnais') }}</button>
    </div>

    <!-- ══ EXERCICE ══ -->
    <template v-else-if="phase === 'jeu' && q">
      <!-- défi chrono : le temps, pas la question -->
      <template v-if="config.mode === 'chrono'">
        <div class="score-bar">
          <button type="button" class="btn-quitter" @click="jeu.quitter" :title="t('communs.quitterTitre')">{{ t('communs.quitter') }}</button>
          <Chronometre :restant="restant" :duree="DUREE_CHRONO" />
          <span role="img" :aria-label="t('communs.scoreSur', { bonnes, total: historique.length })">✅ {{ bonnes }} &nbsp; ❌ {{ mauvaises }}</span>
        </div>
      </template>

      <!-- la question : dans le cadre commun, ou (défi chrono) dans une simple boîte sous le temps -->
      <QuestionJeu v-if="config.mode !== 'chrono'" :jeu="jeu">
        <div class="exercise-question">{{ q.texte }}</div>
        <SaisieReponse v-model="reponse" type="nombre" class="exercise-input" :etat="etat" placeholder="?" :disabled="repondu"
          focus aria-describedby="tables-retour" @entree="valider" />
        <RetourReponse id="tables-retour" :message="retour?.message" :etat="etat" />
        <div class="btn-group" style="justify-content:center;margin-top:1rem;">
          <button type="button" class="btn btn-ghost" :disabled="repondu" @click="passer">{{ t('tables.passer') }}</button>
          <button type="button" class="btn btn-primary" :disabled="repondu" @click="valider">{{ t('communs.valider') }}</button>
        </div>
      </QuestionJeu>
      <div v-else class="exercise-box">
        <div class="exercise-question">{{ q.texte }}</div>
        <SaisieReponse v-model="reponse" type="nombre" class="exercise-input" :etat="etat" placeholder="?" :disabled="repondu"
          focus aria-describedby="tables-retour" @entree="valider" />
        <RetourReponse id="tables-retour" :message="retour?.message" :etat="etat" />
        <div class="btn-group" style="justify-content:center;margin-top:1rem;">
          <button type="button" class="btn btn-primary" :disabled="repondu" @click="valider">{{ t('communs.valider') }}</button>
        </div>
      </div>
    </template>

    <!-- ══ RÉSULTATS ══ -->
    <div v-if="phase === 'resultats' && config.mode === 'chrono'" class="exercise-box resultats-jeu" style="text-align:center;">
      <h2 ref="titreChrono" class="result-score" tabindex="-1">{{ bonnes }}</h2>
      <div class="result-msg">{{ t('tables.bonnesEn1Min') }} {{ messageChrono }}</div>
      <div class="btn-group actions" style="justify-content:center;">
        <button type="button" class="btn btn-primary" @click="jeu.recommencer">{{ t('communs.rejouer') }}</button>
        <button type="button" class="btn btn-ghost" @click="jeu.quitter">{{ t('communs.parametres') }}</button>
      </div>
    </div>
    <ResultatsJeu v-else-if="phase === 'resultats'" :bonnes="bonnes" :total="questions.length" :cle-fin="cleFin"
      @rejouer="jeu.recommencer" @reglages="jeu.quitter">
      <TableauCorrection :historique="historique" />
      <div v-if="mauvaises" class="btn-group" style="justify-content:center;margin-bottom:1rem;">
        <button type="button" class="btn btn-warning" @click="revoirErreurs">{{ t('tables.revoirErreurs') }}</button>
      </div>
    </ResultatsJeu>
  </div>
</template>

<script setup lang="ts">
// Tables de multiplication : la vue ne fait que les réglages, le minuteur du défi et le rendu d'une question. Niveaux,
// générateur et fiche : src/exercices/tables/ (definition.ts, generateur.ts, fiche.ts).
import { ref, computed, watch, nextTick } from 'vue'
import { confettis } from '../../utils/index.js'
import { useLangue } from '../../langues/useLangue.ts'
import { traducteur } from '../../langues/catalogue.ts'
import CadreExercice from '../../noyau/CadreExercice.vue'
import ChoixReglage from '../../noyau/ChoixReglage.vue'
import Chronometre from '../../noyau/Chronometre.vue'
import QuestionJeu from '../../noyau/QuestionJeu.vue'
import ResultatsJeu from '../../noyau/ResultatsJeu.vue'
import RetourReponse from '../../noyau/RetourReponse.vue'
import SaisieReponse from '../../noyau/SaisieReponse.vue'
import TableauCorrection from '../../noyau/TableauCorrection.vue'
import { useReglages } from '../../noyau/useReglages.ts'
import { useFicheExercice } from '../../noyau/useFicheExercice.ts'
import { useJeu } from '../../noyau/useJeu.ts'
import { useMinuteur } from '../../noyau/useMinuteur.ts'
import DEFINITION from '../../exercices/tables/definition.ts'
import { CONTENU } from '../../exercices/tables/textes.ts'
import { questions as tirer, questionsFiche, verifier } from '../../exercices/tables/generateur.ts'
import type { Question, Reponse } from '../../exercices/tables/generateur.ts'
import { fiche as mettreEnPage } from '../../exercices/tables/fiche.ts'

const { t } = useLangue()
// Réglages mémorisés, ajustés au changement de niveau ; maths : le contenu (fiche) suit la langue de l'interface
const { config, langueContenu } = useReglages(DEFINITION)
const T = traducteur(CONTENU, () => langueContenu.value)
const ICONES = { entrainement: '📖', aleatoire: '🎲', chrono: '⏱️' } as const
const DUREE_CHRONO = 60 // secondes

// « Toutes » : les tables du programme, de 1 à 10 (11 et 12 en bonus)
const PROGRAMME = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const
const toutesSelectionnees = computed(() => PROGRAMME.every(n => config.value.tables.includes(n)))
function toggleToutes() {
  config.value.tables = toutesSelectionnees.value ? [...DEFINITION.niveaux[config.value.niveau]?.reglages.tables ?? []] : [...PROGRAMME]
}

// ── Jeu : entraînement (voir la table, puis répondre dans l'ordre), aléatoire, défi chrono d'une minute ──
const reponse = ref<number | ''>('')
const apprendre = ref(false)   // entraînement : la table s'affiche avant ses questions
const aRevoir = ref<Question[] | null>(null)   // « revoir les erreurs » : les calculs ratés, à la place d'un nouveau tirage
const titreChrono = ref<HTMLElement | null>(null)
const minuteur = useMinuteur()
const { restant } = minuteur

const jeu = useJeu<Question, Reponse>({
  generer: rng => {
    if (aRevoir.value) { const liste = rng.melanger(aRevoir.value); aRevoir.value = null; return liste }
    return tirer({ niveau: config.value.niveau, reglages: config.value, rng, T })
  },
  verifier,
  messageErreur: q => `❌ ${t('tables.laBonneReponse', { a: q.a, b: q.b, r: q.reponse })}`,
  apresErreur: 1000,
  delai: 700,
  surQuestion: q => { reponse.value = ''; apprendre.value = !!q.premiere },
})
const { phase, questions, q, bonnes, mauvaises, historique, retour, repondu, etat, cleFin } = jeu
// entraînement : rang de la table en cours
const tableN = computed(() => config.value.tables.indexOf(q.value?.a as never) + 1)

// défi chrono : une minute pour tout, les réponses enchaînent plus vite
watch(phase, p => {
  if (p === 'jeu' && config.value.mode === 'chrono') minuteur.demarrer(DUREE_CHRONO, { surFin: () => { jeu.phase.value = 'resultats' } })
  else minuteur.arreter()
})
const messageChrono = computed(() => t(bonnes.value >= 50 ? 'tables.chrono50' : bonnes.value >= 30 ? 'tables.chrono30' : bonnes.value >= 20 ? 'tables.chrono20' : 'tables.chronoBas'))
watch(phase, p => {
  if (p !== 'resultats' || config.value.mode !== 'chrono') return
  confettis(bonnes.value >= 50 ? 50 : bonnes.value >= 30 ? 25 : 0)
  nextTick(() => titreChrono.value?.focus({ preventScroll: true }))
})

function valider() {
  if (repondu.value || reponse.value === '') return
  const i = jeu.index.value
  const ok = jeu.repondre(Number(reponse.value), { donne: String(reponse.value) })
  if (config.value.mode === 'chrono') setTimeout(() => { if (jeu.index.value === i && phase.value === 'jeu') jeu.suivante() }, ok ? 400 : 600)
}
// passer : la question compte comme une erreur, et on enchaîne aussitôt
function passer() {
  if (repondu.value) return
  jeu.passer({ donne: t('tables.passe') })
  jeu.suivante()
}
function revoirErreurs() {
  aRevoir.value = historique.value.filter(h => !h.ok).map(h => ({ ...h.question, premiere: false }))
  jeu.demarrer()
}

// ── Fiche imprimable (aperçu et impression : CadreExercice) ──
// la fiche ne change au hasard que si les calculs sont mélangés ou tirés parmi tous
const ficheAleatoire = computed(() => config.value.ordreFiche === 'melange' || config.value.nbFiche > 0)
const { mode, fiche, nouvelle } = useFicheExercice({
  tirer: rng => questionsFiche({ niveau: config.value.niveau, reglages: config.value, rng, T }),
  mettreEnPage: (questions, police) => mettreEnPage({ questions, reglages: config.value, T, langue: langueContenu.value, ...police }),
})
</script>

<style scoped>
/* Table d'apprentissage */
.table-title { font-size: 1.8rem; font-weight: 900; color: var(--bleu); margin: 0 0 1.25rem; }
.table-grid { display: inline-grid; grid-template-columns: auto auto auto; gap: .3rem 1rem; text-align: right; margin: 0 auto; }
.table-row { display: contents; }
.table-cell-a  { font-size: 1.3rem; font-weight: 700; text-align: right; }
.table-cell-eq { font-size: 1.3rem; color: #767676; text-align: center; }
.table-cell-r  { font-size: 1.3rem; font-weight: 900; color: var(--bleu); text-align: left; }
</style>
