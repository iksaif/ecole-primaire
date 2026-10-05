<template>
  <div class="container">
    <h1>🔡 {{ t('titre') }}</h1>

    <!-- ══ CONFIG ══ -->
    <ConfigExercice v-if="phase === 'config'" :config="config" v-model:mode="mode" :fiche="fiche" police
      @commencer="jeu.demarrer" @regenerer="nouvelle">
      <ChoixReglage :definition="DEFINITION" cle="niveau" v-model="config.niveau" :titre="t('niveau')" />
      <ChoixReglage v-if="mode === 'jouer'" cartes :definition="DEFINITION" :niveau="config.niveau" cle="mode" v-model="config.mode"
        :titre="t('exercice')" :libelle="m => t(m === 'reconnaitre' ? 'reconnaitre' : 'majMin')" :icone="m => (m === 'reconnaitre' ? '👁️' : '🔠')"
        :description="m => t(m === 'reconnaitre' ? 'reconnaitreDesc' : 'majMinDesc')" />
      <ChoixReglage :definition="DEFINITION" :niveau="config.niveau" cle="groupe" v-model="config.groupe" :titre="t('lettres')" :libelle="g => t(g)" />
      <p v-if="mode === 'imprimer'" class="note-fiche">{{ t('noteFiche') }}</p>
    </ConfigExercice>

    <!-- ══ EXERCICE ══ -->
    <QuestionJeu v-if="phase === 'jeu' && q" :jeu="jeu">
      <div class="question">
        <!-- Reconnaître : montre la lettre, choisir parmi 4 -->
        <template v-if="q.mode === 'reconnaitre'">
          <div class="lettre-display">{{ q.affiche }}</div>
          <div class="question-label">{{ t('quelleLettre') }}</div>
        </template>
        <!-- Majuscule / minuscule -->
        <template v-else>
          <div class="question-label">{{ t(q.question) }}</div>
          <div class="lettre-display">{{ q.affiche }}</div>
        </template>

        <ChoixReponses grand :options="q.options" :bonne="q.bonne" :repondu="repondu" @choisir="i => jeu.repondre({ choix: i })" />

        <div v-if="repondu" class="feedback" :class="etat">{{ retour.message }}</div>
        <button v-if="repondu" class="btn btn-primary suite" @click="jeu.suivante">
          {{ index + 1 < questions.length ? t('suivantFleche') : t('voirResultats') }}
        </button>
      </div>
    </QuestionJeu>

    <!-- ══ RÉSULTATS ══ -->
    <ResultatsJeu v-if="phase === 'resultats'" :bonnes="bonnes" :total="questions.length" :cle-fin="cleFin"
      @rejouer="jeu.recommencer" @reglages="jeu.quitter" />
  </div>
</template>

<script setup>
// Les lettres : la vue ne fait que les réglages et le rendu. Niveaux, générateur et fiche : src/exercices/lettres/
// (definition.js, generateur.js, fiche.js). Le contenu (alphabet, fiche) suit la langue de l'interface : celui d'une langue
// régionale s'il existe (src/i18n/<langue>/contenu/lettres.js). Fin de partie : message commun (GS et CP).
import { useI18n, contenu } from '../../i18n'
import ConfigExercice from '../../components/ConfigExercice.vue'
import ChoixReglage from '../../components/ChoixReglage.vue'
import ChoixReponses from '../../components/ChoixReponses.vue'
import QuestionJeu from '../../components/QuestionJeu.vue'
import ResultatsJeu from '../../components/ResultatsJeu.vue'
import { useReglages } from '../../composables/useReglages'
import { useFicheExercice } from '../../composables/useFicheExercice'
import { useJeu } from '../../composables/useJeu'
import DEFINITION from '../../exercices/lettres/definition'
import { INTERFACE, TEXTES } from '../../exercices/lettres/textes'
import { questions as genererQuestions, questionsFiche, verifier } from '../../exercices/lettres/generateur'
import { fiche as ficheLettres } from '../../exercices/lettres/fiche'

const { t } = useI18n(INTERFACE)
// Réglages mémorisés, ajustés au changement de niveau (politique commune : src/composables/useReglages.js)
const { config, langueContenu } = useReglages(DEFINITION, 'lettres_config')
const T = contenu(TEXTES, () => langueContenu.value).t

// ── Jeu : on attend « Suivant » après chaque réponse ──
const jeu = useJeu({
  generer: rng => genererQuestions({ niveau: config.value.niveau, reglages: config.value, rng, T }),
  verifier,
  messageErreur: q => `❌ ${t('cetait', { r: q.attendu })}`,
  delai: null,
})
const { phase, questions, q, index, bonnes, retour, repondu, etat, cleFin } = jeu

// ── Fiche imprimable (aperçu + impression gérés par ConfigExercice) : graine du lien, sinon tirée ──
const { mode, fiche, nouvelle } = useFicheExercice({
  tirer: rng => questionsFiche({ niveau: config.value.niveau, reglages: config.value, rng, T }),
  mettreEnPage: (x, police) => ficheLettres({ questions: x, T, langue: langueContenu.value, ...police }),
})
</script>

<style scoped>
.container { max-width: 560px; margin: 0 auto; padding: 1rem; }
h1 { color: var(--bleu); margin-bottom: 1rem; }
.note-fiche { color: #666; font-size: .95rem; margin: 0; }

.question { text-align: center; }
.lettre-display {
  font-size: 5rem; font-weight: 900; color: var(--bleu);
  line-height: 1; margin: .5rem 0 1rem;
  font-family: 'Comic Sans MS', 'Chalkboard SE', cursive, sans-serif;
}
.question-label { font-size: 1rem; font-weight: 600; color: #555; margin-bottom: .75rem; }
.feedback { padding: .6rem 1rem; border-radius: 8px; margin-top: .5rem; font-size: .95rem; }
.feedback.ok     { background: #f0fdf4; }
.feedback.erreur { background: #fff5f5; }
.suite { margin-top: 1rem; }
</style>
