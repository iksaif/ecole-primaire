<template>
  <div class="container">
    <h1 class="section-heading">🧩 {{ t('titre') }}</h1>

    <!-- Config -->
    <ConfigExercice v-if="phase === 'config'" :config="config" v-model:mode="mode" :fiche="fiche" police
      @commencer="jeu.demarrer" @regenerer="nouvelle">
      <ChoixReglage :definition="DEFINITION" cle="niveau" v-model="config.niveau" :titre="t('niveau')" />
      <ChoixReglage :definition="DEFINITION" :niveau="config.niveau" cle="categories" v-model="config.categories"
        :titre="t('typesProblemes')" :libelle="c => t(`cat_${c}`)" />
      <ChoixReglage :definition="DEFINITION" :niveau="config.niveau" cle="plage" v-model="config.plage"
        :titre="t('nombres')" :libelle="p => t('jusqua', { n: PLAGES[p] })" />
      <ChoixReglage :definition="DEFINITION" cle="nbQ" v-model="config.nbQ" :titre="t('nbProblemes')" />
    </ConfigExercice>

    <!-- Exercice -->
    <QuestionJeu v-if="phase === 'jeu' && q" :jeu="jeu">
      <div class="enonce">
        <p>{{ q.enonce }}</p>
        <p class="enonce-question">{{ q.question }}</p>
      </div>

      <!-- pas de voix bretonne dans les navigateurs : bouton masqué en breton -->
      <div v-if="langueContenu !== 'br'" style="text-align:center;margin-bottom:1rem;">
        <button class="btn btn-ghost" @click="lireEnonce">{{ enLecture ? t('arreter') : t('lireEnonce') }}</button>
      </div>

      <div class="reponse-ligne">
        <SaisieReponse v-model="reponse" type="nombre" class="exercise-input reponse-input" :etat="etat" placeholder="?"
          :disabled="repondu" focus @entree="entree" />
        <span class="unite">{{ unite(q, q.reponse) }}</span>
      </div>

      <div class="feedback" :class="etat">{{ retour?.message }}</div>
      <div v-if="repondu && !retour.ok" class="calcul-correction">{{ q.calcul }}</div>

      <div class="btn-group" style="justify-content:center;margin-top:1rem;">
        <button class="btn btn-ghost" :disabled="repondu" @click="passer">{{ t('passer') }}</button>
        <button v-if="!repondu" class="btn btn-primary" @click="valider">{{ t('valider') }}</button>
        <button v-else-if="!retour.ok" class="btn btn-primary" @click="jeu.suivante">{{ t('suivant') }}</button>
      </div>
    </QuestionJeu>

    <!-- Résultats -->
    <ResultatsJeu v-if="phase === 'resultats'" :bonnes="bonnes" :total="questions.length" :cle-fin="cleFin"
      @rejouer="jeu.recommencer" @reglages="jeu.quitter">
      <TableauCorrection :historique="historique">
        <template #attendu="{ entree }"><span style="font-weight:800;">{{ entree.question.calcul }}</span><br>→ {{ avecUnite(entree.question, entree.question.reponse) }}</template>
      </TableauCorrection>
    </ResultatsJeu>
  </div>
</template>

<script setup>
// Problèmes : la vue ne fait que les réglages et le rendu d'un problème. Niveaux, générateur et fiche :
// src/exercices/problemes/ (definition.js, generateur.js, fiche.js).
import { ref } from 'vue'
import { useI18n, contenu } from '../../i18n'
import { useTTS } from '../../composables/useTTS'
import ConfigExercice from '../../components/ConfigExercice.vue'
import ChoixReglage from '../../components/ChoixReglage.vue'
import QuestionJeu from '../../components/QuestionJeu.vue'
import ResultatsJeu from '../../components/ResultatsJeu.vue'
import SaisieReponse from '../../components/SaisieReponse.vue'
import TableauCorrection from '../../components/TableauCorrection.vue'
import { useReglages } from '../../composables/useReglages'
import { useFicheExercice } from '../../composables/useFicheExercice'
import { useJeu } from '../../composables/useJeu'
import DEFINITION from '../../exercices/problemes/definition'
import { INTERFACE, TEXTES } from '../../exercices/problemes/textes'
import { questions as genererQuestions, questionsFiche, verifier, unite, avecUnite, PLAGES } from '../../exercices/problemes/generateur'
import { fiche as ficheProblemes } from '../../exercices/problemes/fiche'

const { t } = useI18n(INTERFACE)
// Maths : le contenu (énoncés, fiche) suit la langue de l'interface
const { config, langueContenu } = useReglages(DEFINITION, 'problemes_config')
const T = contenu(TEXTES, () => langueContenu.value).t

const { enLecture, lire, arreter } = useTTS()
const reponse = ref('')

const jeu = useJeu({
  generer: rng => genererQuestions({ niveau: config.value.niveau, reglages: config.value, rng, T }),
  verifier,
  messageErreur: (q, rep) => (rep ? '❌ ' + t('laBonneReponse', { r: avecUnite(q, q.reponse) }) : ''),
  delai: 1200,
  surQuestion: () => { reponse.value = ''; arreter() },
})
const { phase, questions, q, bonnes, historique, retour, repondu, etat, cleFin } = jeu

const lireEnonce = () => (enLecture.value ? arreter() : lire(`${q.value.enonce} ${q.value.question}`))

function valider() {
  const val = String(reponse.value).trim()
  if (repondu.value || val === '') return
  jeu.repondre({ texte: val }, { donne: avecUnite(q.value, +val) })
}
const entree = () => (repondu.value ? !retour.value.ok && jeu.suivante() : valider())
// passer : la question compte comme une erreur, et on enchaîne aussitôt
function passer() {
  if (repondu.value) return
  jeu.passer({ donne: t('passe') })
  jeu.suivante()
}

// ── Fiche imprimable (aperçu + impression gérés par ConfigExercice) ──
const { mode, fiche, nouvelle } = useFicheExercice({
  tirer: rng => questionsFiche({ niveau: config.value.niveau, reglages: config.value, rng, T }),
  mettreEnPage: (questions, police) => ficheProblemes({ questions, reglages: config.value, T, langue: langueContenu.value, ...police }),
})
</script>

<style scoped>
.enonce {
  font-size: 1.35rem; line-height: 1.6; background: var(--gris-bg);
  border-left: 5px solid var(--orange); border-radius: 8px; padding: 1rem 1.25rem; margin: .5rem 0 1rem;
}
.enonce p + p { margin-top: .5rem; }
.enonce-question { font-weight: 800; }
.reponse-ligne { display: flex; align-items: center; justify-content: center; gap: .75rem; }
.reponse-input { max-width: 10rem; }
.unite { font-size: 1.5rem; font-weight: 700; }
.calcul-correction {
  text-align: center; font-size: 1.3rem; font-weight: 800; color: var(--bleu); margin: .25rem 0 .5rem;
}
.btn:disabled { opacity: .45; cursor: default; }
@media (max-width: 520px) {
  .enonce { font-size: 1.15rem; }
}
</style>
