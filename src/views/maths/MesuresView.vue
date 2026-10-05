<template>
  <div class="container">
    <h1 class="section-heading">📏 {{ t('titre') }}</h1>

    <!-- Config -->
    <ConfigExercice v-if="phase === 'config'" :config="config" v-model:mode="mode" :fiche="fiche" police
      @commencer="jeu.demarrer" @regenerer="nouvelle">
      <ChoixReglage :definition="DEFINITION" cle="niveau" v-model="config.niveau" :titre="t('niveau')" />
      <ChoixReglage :definition="DEFINITION" :niveau="config.niveau" cle="exercices" v-model="config.exercices"
        :titre="t('exercices')" :libelle="e => t(`ex_${e}`)" />
      <ChoixReglage v-if="mode === 'jouer' && config.exercices.includes('regle')" :definition="DEFINITION" cle="decale"
        v-model="config.decale" :titre="t('segmentsRegle')" :libelle="d => t(d ? 'pasToujours0' : 'commencent0')" />
      <ChoixReglage v-if="mode === 'jouer'" :definition="DEFINITION" cle="nbQ" v-model="config.nbQ" :titre="t('nbQuestions')" />
      <template v-if="mode === 'imprimer'">
        <ChoixReglage v-if="config.exercices.includes('regle')" :definition="DEFINITION" cle="nbSegments"
          v-model="config.nbSegments" :titre="t('nbSegments')" />
        <p class="rappel-100">⚠️ {{ t('rappel100') }}</p>
      </template>
    </ConfigExercice>

    <!-- Exercice -->
    <QuestionJeu v-if="phase === 'jeu' && q" :jeu="jeu">
      <div class="consigne">{{ q.consigne }}</div>

      <!-- Dessin généré par le programme (règle, balance, broc, bouteilles) -->
      <div v-if="q.svg" class="illus" v-html="q.svg"></div>
      <div v-if="q.affiche" class="affiche">{{ q.affiche }}</div>

      <!-- Saisie d'un nombre -->
      <div v-if="q.mode === 'nombre'" class="saisie">
        <SaisieReponse v-model="reponse" type="nombre" class="exercise-input" :etat="etat" placeholder="?"
          :disabled="repondu" focus @entree="valider" />
        <span v-if="q.unite" class="unite-label">{{ q.unite }}</span>
      </div>
      <!-- Choix -->
      <ChoixReponses v-else :options="options" :bonne="bonne" :repondu="repondu" @choisir="choisir" />

      <div class="feedback" :class="etat">{{ retour?.message }}</div>
      <div v-if="repondu && !retour.ok && q.explication" class="explication">💡 {{ q.explication }}</div>

      <div class="btn-group" style="justify-content:center;margin-top:1rem;">
        <template v-if="!repondu">
          <button class="btn btn-ghost" @click="passer">{{ t('passer') }}</button>
          <button v-if="q.mode === 'nombre'" class="btn btn-primary" @click="valider">{{ t('valider') }}</button>
        </template>
        <button v-else class="btn btn-primary" @click="jeu.suivante">{{ t('suivant') }}</button>
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
// Les mesures : la vue ne fait que les réglages et le rendu d'une question. Niveaux, générateur (un module par type de
// question) et fiche : src/exercices/mesures/.
import { ref, computed } from 'vue'
import { useI18n, contenu } from '../../i18n'
import ConfigExercice from '../../components/ConfigExercice.vue'
import ChoixReglage from '../../components/ChoixReglage.vue'
import ChoixReponses from '../../components/ChoixReponses.vue'
import QuestionJeu from '../../components/QuestionJeu.vue'
import ResultatsJeu from '../../components/ResultatsJeu.vue'
import SaisieReponse from '../../components/SaisieReponse.vue'
import TableauCorrection from '../../components/TableauCorrection.vue'
import { useReglages } from '../../composables/useReglages'
import { useFicheExercice } from '../../composables/useFicheExercice'
import { useJeu } from '../../composables/useJeu'
import DEFINITION from '../../exercices/mesures/definition'
import { INTERFACE, TEXTES } from '../../exercices/mesures/textes'
import { questions as genererQuestions, questionsFiche, verifier } from '../../exercices/mesures/generateur'
import { fiche as ficheMesures } from '../../exercices/mesures/fiche'

const { t } = useI18n(INTERFACE)
// Réglages mémorisés, ajustés au changement de niveau (politique commune : src/composables/useReglages.js) ; maths :
// le contenu (énoncés, fiche) suit la langue de l'interface
const { config, langueContenu } = useReglages(DEFINITION, 'mesures_config')
const T = contenu(TEXTES, () => langueContenu.value).t

// ── Jeu ──
const reponse = ref('')

const jeu = useJeu({
  generer: rng => genererQuestions({ niveau: config.value.niveau, reglages: config.value, rng, T, nb: config.value.nbQ }),
  verifier,
  // une question passée n'a pas de ❌ : on enchaîne aussitôt
  messageErreur: (q, rep) => `${rep ? '❌ ' : ''}${t('bonneReponse')} : ${q.attendu}`,
  delai: 900,
  // champ vidé ; le focus : SaisieReponse (attribut focus)
  surQuestion: () => { reponse.value = '' },
})
const { phase, questions, q, bonnes, historique, retour, repondu, etat, cleFin } = jeu

const options = computed(() => (q.value?.choix ?? []).map(label => ({ label })))
const bonne = computed(() => (q.value?.choix ?? []).indexOf(q.value?.reponse))

function valider() {
  const qu = q.value
  if (repondu.value || qu.mode !== 'nombre') return
  const v = String(reponse.value ?? '').trim().replace(',', '.')
  if (v === '') return
  jeu.repondre({ texte: v }, { donne: qu.unite ? `${v} ${qu.unite}` : v })
}

function choisir(i) {
  const choix = q.value.choix[i]
  jeu.repondre({ choix }, { donne: choix })
}

// passer : la question compte comme une erreur, et on enchaîne aussitôt
function passer() {
  if (repondu.value) return
  jeu.passer({ donne: t('passe') })
  jeu.suivante()
}

// ── Fiche imprimable (aperçu + impression gérés par ConfigExercice) : graine du lien, sinon tirée ──
const { mode, fiche, nouvelle } = useFicheExercice({
  tirer: rng => questionsFiche({ niveau: config.value.niveau, reglages: config.value, rng, T }),
  mettreEnPage: (questions, police) => ficheMesures({ questions, reglages: config.value, T, langue: langueContenu.value, ...police }),
})
</script>

<style scoped>
.rappel-100 { border: 2px solid var(--orange); background: #fff6e8; color: #9a5a00; font-weight: 700; padding: .4rem .7rem; border-radius: 8px; font-size: .9rem; margin: .5rem 0 1rem; }
.consigne {
  font-size: 1.3rem;
  font-weight: 700;
  text-align: center;
  margin: .5rem 0 1rem;
  line-height: 1.4;
}
.illus {
  display: flex;
  justify-content: center;
  margin: .5rem 0 1rem;
}
.illus :deep(svg) { height: auto; }
.affiche {
  font-size: 2rem;
  font-weight: 900;
  text-align: center;
  margin: .5rem 0 1rem;
  white-space: pre-wrap;
}
.saisie {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: .6rem;
}
.saisie .exercise-input {
  width: 9rem;
  display: inline-block;
}
.unite-label {
  font-size: 1.8rem;
  font-weight: 800;
}
.explication {
  background: #fff8e1;
  border-left: 4px solid var(--orange);
  border-radius: 6px;
  padding: .6rem .8rem;
  font-size: 1.05rem;
  margin-top: .5rem;
}
@media (max-width: 520px) {
  .consigne { font-size: 1.1rem; }
  .affiche { font-size: 1.5rem; }
}
</style>
