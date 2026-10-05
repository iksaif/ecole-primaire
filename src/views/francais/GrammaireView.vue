<template>
  <div class="container">
    <h1>🧱 {{ t('titre') }}</h1>

    <!-- ══ CONFIG ══ -->
    <ConfigExercice v-if="phase === 'config'" :config="config" v-model:mode="mode" :fiche="fiche" police
      @commencer="jeu.demarrer" @regenerer="nouvelle">
      <ChoixReglage :definition="DEFINITION" cle="niveau" v-model="config.niveau" :titre="t('niveau')" />
      <ChoixReglage :definition="DEFINITION" :niveau="config.niveau" cle="types" v-model="config.types" :titre="t('exercices')"
        :libelle="ty => t(`type_${ty}`)" :groupes="groupes">
        <template #valeur="{ valeur: ty, texte }"><span class="theme-icon">{{ icones[ty] }}</span> {{ texte }}</template>
        <p class="astuce">{{ t('astuce') }}</p>
      </ChoixReglage>
      <ChoixReglage :definition="DEFINITION" cle="nb" v-model="config.nb" :titre="t('nbQuestions')" />
    </ConfigExercice>

    <!-- ══ EXERCICE ══ -->
    <QuestionJeu v-if="phase === 'jeu' && q" :jeu="jeu">
      <QuestionFrancais :jeu="jeu" :t="t" :libelle="c => tc(t, c)" />
    </QuestionJeu>

    <!-- ══ RÉSULTATS ══ -->
    <ResultatsJeu v-if="phase === 'resultats'" :bonnes="bonnes" :total="questions.length" :cle-fin="cleFin"
      @rejouer="jeu.recommencer" @reglages="jeu.quitter">
      <div class="config-section-title correction-titre">{{ t('correction') }}</div>
      <TableauCorrection :historique="historique">
        <template #question="{ entree }"><div class="corr-consigne">{{ valeur(entree.question.consigne, t) }}</div></template>
        <template #attendu="{ entree }"><span v-html="valeur(entree.question.solution, t)"></span></template>
      </TableauCorrection>
    </ResultatsJeu>
  </div>
</template>

<script setup>
// Grammaire : la vue ne fait que les réglages et le rendu. Niveaux, générateur et fiche : src/exercices/grammaire/
// (definition.js, generateur.js, fiche.js) ; corpus : src/data/grammaire.js ; question à l'écran : QuestionFrancais.vue.
// Exercice de français : la fiche est toujours en français, l'interface (consignes, explications) suit la langue choisie.
import { computed } from 'vue'
import { useI18n, contenu } from '../../i18n'
import ConfigExercice from '../../components/ConfigExercice.vue'
import ChoixReglage from '../../components/ChoixReglage.vue'
import QuestionJeu from '../../components/QuestionJeu.vue'
import ResultatsJeu from '../../components/ResultatsJeu.vue'
import TableauCorrection from '../../components/TableauCorrection.vue'
import QuestionFrancais from './QuestionFrancais.vue'
import { useReglages } from '../../composables/useReglages'
import { useFicheExercice } from '../../composables/useFicheExercice'
import { useJeu } from '../../composables/useJeu'
import DEFINITION, { GROUPES } from '../../exercices/grammaire/definition'
import { INTERFACE, TEXTES } from '../../exercices/grammaire/textes'
import { questions as genererQuestions, questionsFiche, verifier, valeur, tc } from '../../exercices/grammaire/generateur'
import { fiche as ficheGrammaire } from '../../exercices/grammaire/fiche'

const { t } = useI18n(INTERFACE)
// Réglages mémorisés, ajustés au changement de niveau (politique commune : src/composables/useReglages.js).
// Contenu (fiche) : toujours en français.
const { config, langueContenu } = useReglages(DEFINITION, 'grammaire_config')
const T = contenu(TEXTES, () => langueContenu.value).t

const groupes = computed(() => GROUPES.map(g => ({ titre: t(`groupe_${g.id}`), valeurs: g.types.map(x => x.id) })))
const icones = Object.fromEntries(GROUPES.flatMap(g => g.types.map(x => [x.id, x.icone])))

// ── Jeu : on attend « Suivant » après chaque réponse (l'explication se lit) ──
// retour : la bonne réponse après une erreur (l'explication de la question suit, QuestionFrancais)
function messageErreur(q) {
  const bonne = q.mode === 'ordre' ? t('bonnePhrase', { r: valeur(q.solution, t) })
    : q.mode === 'saisie' ? t('bonneReponseEst', { r: q.attendu })
      : q.mode === 'choix' ? t('bonneReponseEst', { r: tc(t, q.attendu) })
        : t('pasToutAFait')
  return `❌ ${bonne}`
}
const jeu = useJeu({
  generer: rng => genererQuestions({ niveau: config.value.niveau, reglages: config.value, rng, nb: config.value.nb }),
  verifier,
  messageErreur,
  // pluriel écrit sans les accents : comptée fausse, avec la bonne graphie
  messageNuance: q => `⚠️ ${t('accents', { r: q.attendu })}`,
  delai: null,
})
const { phase, questions, q, bonnes, historique, cleFin } = jeu

// ── Fiche imprimable (aperçu + impression gérés par ConfigExercice) : graine du lien, sinon tirée ──
const { mode, fiche, nouvelle } = useFicheExercice({
  tirer: rng => questionsFiche({ niveau: config.value.niveau, reglages: config.value, rng }),
  mettreEnPage: (x, police) => ficheGrammaire({ questions: x, T, langue: langueContenu.value, ...police }),
})
</script>

<style scoped>
.container { max-width: 720px; margin: 0 auto; padding: 1rem; }
h1 { color: var(--bleu); margin-bottom: 1rem; }
.theme-icon { font-size: 1.1rem; }
.astuce { font-size: .85rem; color: #777; margin: .5rem 0 0; }
.correction-titre { text-align: left; margin-bottom: .5rem; }
.corr-consigne { font-size: .82rem; color: #666; }
.correction-table :deep(u) { text-decoration-thickness: 2px; }
</style>
