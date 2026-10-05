<template>
  <div class="container">
    <h1 class="section-heading">🧮 {{ t('titre') }}</h1>

    <!-- Config -->
    <ConfigExercice v-if="phase === 'config'" :config="config" v-model:mode="mode" :fiche="fiche" police
      @commencer="jeu.demarrer" @regenerer="nouvelle">
      <ChoixReglage :definition="DEFINITION" cle="niveau" v-model="config.niveau" :titre="t('niveau')" />
      <ChoixReglage :definition="DEFINITION" :niveau="config.niveau" cle="ops" v-model="config.ops" :titre="t('operations')"
        :libelle="op => libelleOp(op, config.niveau, T)" />
      <ChoixReglage v-if="mode === 'jouer'" :definition="DEFINITION" cle="nbQ" v-model="config.nbQ" :titre="t('nbQuestions')" />
      <ChoixReglage v-else :definition="DEFINITION" cle="nbFiche" v-model="config.nbFiche" :titre="t('nbCalculsFiche')" />
      <ChoixReglage v-if="mode === 'jouer'" :definition="DEFINITION" cle="temps" v-model="config.temps" :titre="t('tempsParQuestion')"
        :libelle="s => (s === 0 ? t('sansLimite') : s + ' s')" />
    </ConfigExercice>

    <!-- Exercice -->
    <QuestionJeu v-if="phase === 'jeu' && q" :jeu="jeu">
      <template v-if="config.temps > 0">
        <div class="timer-bar">
          <div class="timer-fill" :class="{ urgent: restant / config.temps < 0.3 }" :style="{ width: (restant / config.temps * 100) + '%' }"></div>
        </div>
        <div class="chrono">⏱ {{ Math.ceil(restant) }}s</div>
      </template>

      <div class="exercise-question" :class="{ long: q.texte.length > 12 }">{{ q.texte }}</div>

      <SaisieReponse v-model="reponse" type="nombre" class="exercise-input" :etat="etat" placeholder="?" :disabled="repondu"
        focus @entree="valider" />

      <div class="feedback" :class="etat">{{ retour?.message }}</div>

      <div v-if="!repondu" class="btn-group" style="justify-content:center;margin-top:1rem;">
        <button class="btn btn-ghost" @click="passer">{{ t('passer') }}</button>
        <button class="btn btn-primary" @click="valider">{{ t('valider') }}</button>
      </div>
    </QuestionJeu>

    <!-- Résultats -->
    <ResultatsJeu v-if="phase === 'resultats'" :bonnes="bonnes" :total="questions.length" :cle-fin="cleFin"
      @rejouer="jeu.recommencer" @reglages="jeu.quitter">
      <TableauCorrection :historique="historique" />
    </ResultatsJeu>
  </div>
</template>

<script setup>
// Calcul mental : la vue ne fait que les réglages, le minuteur et le rendu d'une question. Niveaux, générateur et fiche :
// src/exercices/calcul-mental/ (definition.js, generateur.js, fiche.js).
import { ref, watch } from 'vue'
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
import DEFINITION from '../../exercices/calcul-mental/definition'
import { INTERFACE, TEXTES } from '../../exercices/calcul-mental/textes'
import { questions as genererQuestions, questionsFiche, verifier, libelleOp } from '../../exercices/calcul-mental/generateur'
import { fiche as ficheCalcul } from '../../exercices/calcul-mental/fiche'

const { t } = useI18n(INTERFACE)
const { config, langueContenu } = useReglages(DEFINITION, 'calcul_mental_config')
const T = contenu(TEXTES, () => langueContenu.value).t

// ── Jeu : temps par question (minuteur), une erreur ou un temps écoulé enchaîne seul ──
const reponse = ref('')
const minuteur = useMinuteur()
const { restant } = minuteur

const jeu = useJeu({
  generer: rng => genererQuestions({ niveau: config.value.niveau, reglages: config.value, rng, T }),
  verifier,
  // rep null : passée ou temps écoulé
  messageErreur: (q, rep) => (rep === null ? T('tempsEcoule', { r: q.reponse }) : '❌ ' + t('laBonneReponse', { r: q.reponse })),
  delai: 800,
  apresErreur: 'continuer',
  delaiErreur: 1200,
  // champ vidé (focus : SaisieReponse) ; le minuteur repart pour la nouvelle question
  surQuestion: () => {
    reponse.value = ''
    minuteur.arreter()
    if (config.value.temps > 0) minuteur.demarrer(config.value.temps, { pas: 0.1, surFin: () => jeu.passer({ donne: t('passe') }) })
  },
})
const { phase, questions, q, bonnes, historique, retour, repondu, etat, cleFin } = jeu
watch(phase, p => { if (p !== 'jeu') minuteur.arreter() })

function valider() {
  const val = String(reponse.value).trim()
  if (!val || repondu.value) return
  minuteur.arreter()
  jeu.repondre(val, { donne: val })
}

// passer : la question compte comme une erreur, et on enchaîne aussitôt
function passer() {
  if (repondu.value) return
  minuteur.arreter()
  jeu.passer({ donne: t('passe') })
  jeu.suivante()
}

// ── Fiche imprimable (aperçu + impression gérés par ConfigExercice) ──
const { mode, fiche, nouvelle } = useFicheExercice({
  tirer: rng => questionsFiche({ niveau: config.value.niveau, reglages: config.value, rng, T }),
  mettreEnPage: (questions, police) => ficheCalcul({ questions, reglages: config.value, T, langue: langueContenu.value, ...police }),
})
</script>

<style scoped>
.exercise-question.long { font-size: 2.3rem; }
@media (max-width: 520px) { .exercise-question.long { font-size: 1.7rem; } }
.chrono { font-weight: 700; text-align: center; font-size: .9rem; color: #666; }
</style>
