<template>
  <div class="container">
    <h1 class="section-heading">📖 {{ t('titre') }}</h1>

    <CadreExercice v-if="phase === 'config'" v-model:mode="mode" :fiche="fiche" :config="config"
      @commencer="jeu.demarrer" @regenerer="nouvelle">
      <ChoixReglage :definition="DEFINITION" cle="niveau" v-model="config.niveau" :titre="t('niveau')" />
      <ChoixReglage :definition="DEFINITION" :niveau="config.niveau" cle="themes" v-model="config.themes"
        :titre="t('themes')" :libelle="th => t(String(th))" />
      <ChoixReglage v-if="mode === 'jouer'" :definition="DEFINITION" cle="nbQ" v-model="config.nbQ" :titre="t('nbQuestions')" />
    </CadreExercice>

    <QuestionJeu v-if="phase === 'jeu' && q" :jeu="jeu">
      <div class="consigne">{{ t('consigne') }} <strong>{{ q.mot }}</strong> ?</div>
      <!-- un QCM : le composant garde la proposition choisie et colore la bonne réponse -->
      <ChoixReponses :options="q.options" :bonne="q.bonne" :repondu="repondu" @choisir="choisir" />
      <div class="feedback" :class="etat">{{ retour?.message }}</div>
      <div class="btn-group">
        <button v-if="repondu && !retour?.ok" class="btn btn-primary" @click="jeu.suivante">{{ t('suivant') }}</button>
      </div>
    </QuestionJeu>

    <ResultatsJeu v-if="phase === 'resultats'" :bonnes="bonnes" :total="questions.length" :cle-fin="cleFin"
      @rejouer="jeu.recommencer" @reglages="jeu.quitter">
      <TableauCorrection :historique="historique" />
    </ResultatsJeu>
  </div>
</template>

<script setup lang="ts">
// Exemple d'exercice à corpus — la vue. Même squelette que ExempleView.vue ; ici le QCM (ChoixReponses) remplace la saisie.
import { useI18n, contenu } from '../../i18n'
import CadreExercice from '../../noyau/CadreExercice.vue'
import ChoixReglage from '../../noyau/ChoixReglage.vue'
import QuestionJeu from '../../noyau/QuestionJeu.vue'
import ChoixReponses from '../../noyau/ChoixReponses.vue'
import ResultatsJeu from '../../noyau/ResultatsJeu.vue'
import TableauCorrection from '../../noyau/TableauCorrection.vue'
import { useReglages } from '../../noyau/useReglages.ts'
import { useJeu } from '../../noyau/useJeu.ts'
import { useFicheExercice } from '../../noyau/useFicheExercice.ts'
import DEFINITION from '../../exercices/exemple-corpus/definition.ts'
import { INTERFACE, TEXTES } from '../../exercices/exemple-corpus/textes.ts'
import { questions as tirer, questionsFiche, verifier } from '../../exercices/exemple-corpus/generateur.ts'
import type { Question, Reponse } from '../../exercices/exemple-corpus/generateur.ts'
import { fiche as mettreEnPage } from '../../exercices/exemple-corpus/fiche.ts'

const { t } = useI18n(INTERFACE)
// langueContenu vaut toujours 'fr' ici (`contenu: 'fr'`) : T, donné au générateur et à la fiche, lit TEXTES (français)
const { config, langueContenu } = useReglages(DEFINITION)
const T = contenu(TEXTES, () => langueContenu.value).t

const jeu = useJeu<Question, Reponse>({
  generer: rng => tirer({ niveau: config.value.niveau, reglages: config.value, rng, T }),
  verifier,
  messageErreur: q => `❌ ${t('laReponse', { attendu: q.attendu })}`,
})
const { phase, questions, q, bonnes, historique, retour, repondu, etat, cleFin } = jeu

function choisir(i: number) {
  if (q.value) jeu.repondre({ choix: i }, { donne: q.value.options[i].label })
}

const { mode, fiche, nouvelle } = useFicheExercice({
  tirer: rng => questionsFiche({ niveau: config.value.niveau, reglages: config.value, rng, T }),
  mettreEnPage: (questions, police) => mettreEnPage({ questions, reglages: config.value, T, langue: langueContenu.value, ...police }),
})
</script>

<style scoped>
.consigne { font-size: 1.2rem; font-weight: 700; text-align: center; margin: .75rem 0 1.25rem; }
.btn-group { justify-content: center; margin-top: 1rem; }
</style>
