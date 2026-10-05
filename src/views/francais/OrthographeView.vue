<template>
  <div class="container">
    <h1>🔤 {{ t('titre') }}</h1>

    <!-- ══ CONFIG ══ -->
    <ConfigExercice v-if="phase === 'config'" :config="config" v-model:mode="mode" :fiche="fiche" police
      @commencer="jeu.demarrer" @regenerer="nouvelle">
      <!-- niveaux, puis « CP → CM2 » (réglage `tous`, pas une classe) -->
      <ChoixReglage :definition="DEFINITION" cle="niveau" :valeurs="[...Object.keys(DEFINITION.niveaux), 'tous']"
        :model-value="config.tous ? 'tous' : config.niveau" :titre="t('niveau')" :libelle="v => (v === 'tous' ? ETIQUETTE_TOUS : v.toUpperCase())"
        @update:model-value="choisirNiveau" />
      <ChoixReglage :definition="DEFINITION" :niveau="config.tous ? 'tous' : config.niveau" cle="theme" v-model="config.theme"
        :valeurs="config.tous ? THEMES_TOUS : undefined" :titre="t('theme')" :libelle="th => t(`theme_${th}`)">
        <template #valeur="{ valeur: th, texte }"><span class="theme-icon">{{ icones[th] }}</span> {{ texte }}</template>
      </ChoixReglage>
      <ChoixReglage :definition="DEFINITION" cle="nb" v-model="config.nb" :titre="t('nbQuestions')" />
    </ConfigExercice>

    <!-- ══ EXERCICE ══ -->
    <QuestionJeu v-if="phase === 'jeu' && q" :jeu="jeu">
      <QuestionFrancais :jeu="jeu" :t="t" />
    </QuestionJeu>

    <!-- ══ RÉSULTATS ══ -->
    <ResultatsJeu v-if="phase === 'resultats'" :bonnes="bonnes" :total="questions.length" :cle-fin="cleFin"
      @rejouer="jeu.recommencer" @reglages="jeu.quitter">
      <div v-if="erreurs.length" class="erreurs-box">
        <div class="config-section-title">{{ t('aRetravailler') }}</div>
        <div v-for="(h, i) in erreurs" :key="i" class="erreur-orth">
          <span class="erreur-phrase" v-html="phraseCorrigee(h.question)"></span>
          <span class="erreur-reponse">→ <strong>{{ h.question.attendu }}</strong></span>
        </div>
      </div>
    </ResultatsJeu>
  </div>
</template>

<script setup>
// Orthographe : la vue ne fait que les réglages et le rendu. Niveaux, générateur et fiche : src/exercices/orthographe/
// (definition.js, generateur.js, fiche.js) ; corpus : src/data/orthographe.js ; question à l'écran : QuestionFrancais.vue.
// Exercice de français : la fiche est toujours en français, l'interface (retour, explications) suit la langue choisie.
import { computed } from 'vue'
import { useI18n, contenu } from '../../i18n'
import ConfigExercice from '../../components/ConfigExercice.vue'
import ChoixReglage from '../../components/ChoixReglage.vue'
import QuestionJeu from '../../components/QuestionJeu.vue'
import ResultatsJeu from '../../components/ResultatsJeu.vue'
import QuestionFrancais from './QuestionFrancais.vue'
import { reglagesDuNiveau } from '../../exercices/outils'
import { useReglages } from '../../composables/useReglages'
import { useFicheExercice } from '../../composables/useFicheExercice'
import { useJeu } from '../../composables/useJeu'
import DEFINITION, { THEMES } from '../../exercices/orthographe/definition'
import { INTERFACE, TEXTES } from '../../exercices/orthographe/textes'
import { questions as genererQuestions, questionsFiche, verifier } from '../../exercices/orthographe/generateur'
import { fiche as ficheOrthographe } from '../../exercices/orthographe/fiche'

const ETIQUETTE_TOUS = 'CP → CM2'
// « CP → CM2 » propose les trois thèmes, homophones d'abord (c'est la fiche publiée exercices-orthographe-cp-cm2)
const THEMES_TOUS = ['homophones', 'accords', 'lettres']
const icones = Object.fromEntries(THEMES.map(th => [th.id, th.icone]))

const { t } = useI18n(INTERFACE)
// Réglages mémorisés, ajustés au changement de niveau (politique commune : src/composables/useReglages.js).
// Contenu (fiche) : toujours en français.
const { config, langueContenu } = useReglages(DEFINITION, 'orthographe_config')
const T = contenu(TEXTES, () => langueContenu.value).t

// Une classe : réglages du niveau (useReglages) ; « CP → CM2 » : tous les niveaux, thème Homophones d'abord
function choisirNiveau(v) {
  if (v === 'tous') { config.value.tous = true; config.value.theme = THEMES_TOUS[0] } else config.value = reglagesDuNiveau(DEFINITION, { ...config.value, tous: false, niveau: v })
}

// ── Jeu : on attend « Suivant » après chaque réponse (l'explication se lit) ──
const jeu = useJeu({
  generer: rng => genererQuestions({ niveau: config.value.niveau, reglages: config.value, rng, nb: config.value.nb }),
  verifier,
  messageErreur: q => t('feedbackErr', { r: q.attendu, exp: '' }),
  messageNuance: q => `⚠️ ${t('accents', { r: q.attendu })}`,
  delai: null,
})
const { phase, questions, q, bonnes, historique, cleFin } = jeu
const erreurs = computed(() => historique.value.filter(h => !h.ok))
const phraseCorrigee = qu => qu.phrase.replace('___', `<strong>${qu.attendu}</strong>`)

// ── Fiche imprimable (aperçu + impression gérés par ConfigExercice) : graine du lien, sinon tirée ──
const { mode, fiche, nouvelle } = useFicheExercice({
  tirer: rng => questionsFiche({ niveau: config.value.niveau, reglages: config.value, rng }),
  mettreEnPage: (x, police) => ficheOrthographe({ questions: x, T, langue: langueContenu.value, ...police }),
})
</script>

<style scoped>
.container { max-width: 680px; margin: 0 auto; padding: 1rem; }
h1 { color: var(--bleu); margin-bottom: 1rem; }
.theme-icon { font-size: 1.1rem; }

.erreurs-box { text-align: left; max-width: 500px; margin: 0 auto; }
.erreur-orth {
  display: flex; align-items: baseline; gap: .75rem; flex-wrap: wrap;
  padding: .4rem 0; border-bottom: 1px solid #f0f0f0; font-size: .9rem;
}
.erreur-phrase { flex: 1; color: #444; }
.erreur-reponse { color: #15803d; white-space: nowrap; }
</style>
