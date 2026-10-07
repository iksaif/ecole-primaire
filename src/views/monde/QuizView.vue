<template>
  <div class="container">
    <h1 class="section-heading">{{ DEFINITION.emoji }} {{ t('quiz.titre') }}</h1>

    <CadreExercice v-if="phase === 'config'" v-model:mode="mode" :fiche="fiche" :config="config" @commencer="jeu.demarrer" @regenerer="nouvelle">
      <ChoixReglage :definition="DEFINITION" cle="niveau" v-model="config.niveau" :titre="t('communs.niveau')" />
      <ChoixReglage :definition="DEFINITION" :niveau="config.niveau" cle="theme" v-model="config.theme" :titre="t('quiz.theme')"
        :libelle="th => t(`quiz.themes.${th}`)">
        <template #valeur="{ valeur: th, texte }"><span aria-hidden="true">{{ ICONES[th] }}</span> {{ texte }}</template>
      </ChoixReglage>
      <ChoixReglage :definition="DEFINITION" :niveau="config.niveau" cle="nb" v-model="config.nb" :titre="t('quiz.nbQuestions')" />
    </CadreExercice>

    <QuestionJeu v-if="phase === 'jeu' && q" :jeu="jeu">
      <p class="question" :lang="langueContenu">{{ q.texte }}</p>
      <ChoixReponses :titre="q.texte" :options="q.options" :bonne="q.bonne" :repondu="repondu"
        @choisir="i => jeu.repondre({ choix: i }, { donne: q?.options[i]?.label ?? '' })" />
      <RetourReponse :message="retour?.message" :etat="etat" />
      <p v-if="repondu && etat === 'erreur' && q.info" class="info" :lang="langueContenu">{{ q.info }}</p>
      <div v-if="repondu" class="actions"><BoutonSuivant :jeu="jeu" /></div>
    </QuestionJeu>

    <ResultatsJeu v-if="phase === 'resultats'" :bonnes="bonnes" :total="questions.length" :cle-fin="cleFin"
      @rejouer="jeu.recommencer" @reglages="jeu.quitter">
      <div v-if="erreurs.length" class="erreurs">
        <div class="config-section-title">{{ t('quiz.aRetenir') }}</div>
        <div v-for="(h, i) in erreurs" :key="i" class="erreur" :lang="langueContenu">
          <span class="erreur-q">{{ h.question.texte }}</span>
          <span class="erreur-r">→ <strong>{{ h.question.attendu }}</strong></span>
        </div>
      </div>
    </ResultatsJeu>
  </div>
</template>

<script setup lang="ts">
// Quiz : la vue ne fait que les réglages et le rendu d'une question. Thèmes par classe, générateur et fiche : src/exercices/quiz/ ;
// questions : src/exercices/quiz/questions/ (une banque par langue de contenu).
import { computed } from 'vue'
import { useLangue } from '../../langues/useLangue.ts'
import { traducteur } from '../../langues/catalogue.ts'
import CadreExercice from '../../noyau/CadreExercice.vue'
import ChoixReglage from '../../noyau/ChoixReglage.vue'
import QuestionJeu from '../../noyau/QuestionJeu.vue'
import BoutonSuivant from '../../noyau/BoutonSuivant.vue'
import ChoixReponses from '../../noyau/ChoixReponses.vue'
import RetourReponse from '../../noyau/RetourReponse.vue'
import ResultatsJeu from '../../noyau/ResultatsJeu.vue'
import { useReglages } from '../../noyau/useReglages.ts'
import { useJeu } from '../../noyau/useJeu.ts'
import { useFicheExercice } from '../../noyau/useFicheExercice.ts'
import DEFINITION from '../../exercices/quiz/definition.ts'
import { CONTENU } from '../../exercices/quiz/textes.ts'
import { ICONES } from '../../exercices/quiz/donnees.ts'
import { questions as tirer, questionsFiche, verifier } from '../../exercices/quiz/generateur.ts'
import type { Question, Reponse } from '../../exercices/quiz/generateur.ts'
import { fiche as ficheQuiz } from '../../exercices/quiz/fiche.ts'

const { t } = useLangue()
const { config, langueContenu } = useReglages(DEFINITION)
const T = traducteur(CONTENU, () => langueContenu.value)

const jeu = useJeu<Question, Reponse>({
  generer: rng => tirer({ niveau: config.value.niveau, reglages: config.value, rng, T, langue: langueContenu.value }),
  verifier,
  messageErreur: qu => t('quiz.mauvaise', { r: qu.attendu }),
  apresErreur: 5000,
})
const { phase, questions, q, bonnes, historique, retour, repondu, etat, cleFin } = jeu
const erreurs = computed(() => historique.value.filter(h => !h.ok))

const { mode, fiche, nouvelle } = useFicheExercice({
  tirer: rng => questionsFiche({ niveau: config.value.niveau, reglages: config.value, rng, T, langue: langueContenu.value }),
  mettreEnPage: (tirage, police) => ficheQuiz({ questions: tirage, reglages: config.value, T, langue: langueContenu.value, ...police }),
})
</script>

<style scoped>
.question { font-size: 1.3rem; font-weight: 700; text-align: center; margin: 0 0 1.5rem; line-height: 1.4; }
.info { text-align: center; color: var(--texte-doux); font-size: .92rem; margin: .3rem 0 0; }
.actions { display: flex; justify-content: center; margin-top: 1rem; }
.erreurs { text-align: left; max-width: 520px; margin: 0 auto; }
.erreur { display: flex; align-items: baseline; gap: .75rem; flex-wrap: wrap; padding: .4rem 0; border-bottom: 1px solid #f0f0f0; font-size: .9rem; }
.erreur-q { flex: 1; }
.erreur-r { color: var(--vert-texte); }
</style>
