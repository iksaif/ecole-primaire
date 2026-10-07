<template>
  <div class="container">
    <h1 class="section-heading">{{ DEFINITION.emoji }} {{ t('lettres.titre') }}</h1>

    <CadreExercice v-if="phase === 'config'" v-model:mode="mode" :fiche="fiche" :config="config"
      @commencer="jeu.demarrer" @regenerer="nouvelle">
      <template #default="{ mode: modeCourant }">
        <ChoixReglage :definition="DEFINITION" cle="niveau" v-model="config.niveau" :titre="t('communs.niveau')" />
        <ChoixReglage v-if="modeCourant === 'jouer'" cartes :definition="DEFINITION" :niveau="config.niveau" cle="mode" v-model="config.mode"
          :titre="t('lettres.exercice')" :libelle="m => t(`lettres.mode.${m}`)" :icone="m => ICONES[m]" :description="m => t(`lettres.modeDesc.${m}`)" />
        <ChoixReglage :definition="DEFINITION" :niveau="config.niveau" cle="groupe" v-model="config.groupe" :titre="t('lettres.lettres')"
          :libelle="g => t(`lettres.groupe.${g}`)" />
        <p v-if="modeCourant === 'imprimer'" class="note-fiche">{{ t('lettres.noteFiche') }}</p>
      </template>
    </CadreExercice>

    <QuestionJeu v-if="phase === 'jeu' && q" :jeu="jeu">
      <div class="question">
        <!-- Reconnaître : montre la lettre, choisir parmi 4 ; majuscule / minuscule : la consigne d'abord -->
        <template v-if="q.mode === 'reconnaitre'">
          <div class="lettre-display">{{ q.affiche }}</div>
          <div class="question-label">{{ consigne }}</div>
        </template>
        <template v-else>
          <div class="question-label">{{ consigne }}</div>
          <div class="lettre-display">{{ q.affiche }}</div>
        </template>

        <ChoixReponses grand :titre="consigne" :options="q.options" :bonne="q.bonne" :repondu="repondu" @choisir="i => jeu.repondre({ choix: i })" />

        <RetourReponse :message="retour?.message" :etat="etat" />
        <button v-if="repondu" type="button" class="btn btn-primary suite" @click="jeu.suivante">{{ t('communs.suivant') }}</button>
      </div>
    </QuestionJeu>

    <ResultatsJeu v-if="phase === 'resultats'" :bonnes="bonnes" :total="questions.length" :cle-fin="cleFin"
      @rejouer="jeu.recommencer" @reglages="jeu.quitter" />
  </div>
</template>

<script setup lang="ts">
// Les lettres : la vue ne fait que les réglages et le rendu d'une question. Niveaux, générateur et fiche : src/exercices/lettres/
// (definition.ts, generateur.ts, fiche.ts). Le contenu (alphabet, fiche) suit la langue du contenu (textes.ts : alphabet breton en breton).
import { computed } from 'vue'
import { useLangue } from '../../langues/useLangue.ts'
import { traducteur } from '../../langues/catalogue.ts'
import CadreExercice from '../../noyau/CadreExercice.vue'
import ChoixReglage from '../../noyau/ChoixReglage.vue'
import QuestionJeu from '../../noyau/QuestionJeu.vue'
import ChoixReponses from '../../noyau/ChoixReponses.vue'
import RetourReponse from '../../noyau/RetourReponse.vue'
import ResultatsJeu from '../../noyau/ResultatsJeu.vue'
import { useReglages } from '../../noyau/useReglages.ts'
import { useJeu } from '../../noyau/useJeu.ts'
import { useFicheExercice } from '../../noyau/useFicheExercice.ts'
import DEFINITION from '../../exercices/lettres/definition.ts'
import { CONTENU } from '../../exercices/lettres/textes.ts'
import { questions as tirer, questionsFiche, verifier } from '../../exercices/lettres/generateur.ts'
import type { Question, Reponse } from '../../exercices/lettres/generateur.ts'
import { fiche as ficheLettres } from '../../exercices/lettres/fiche.ts'

const { t } = useLangue()
const { config, langueContenu } = useReglages(DEFINITION, { suivreClasse: true })
// T : les textes du contenu (CONTENU, textes.ts : alphabet, fiche), dans la langue du contenu
const T = traducteur(CONTENU, () => langueContenu.value)
const ICONES = { reconnaitre: '👁️', majuscule: '🔠' } as const

// ── Jeu : on attend « Suivant » après chaque réponse ──
const jeu = useJeu<Question, Reponse>({
  generer: rng => tirer({ niveau: config.value.niveau, reglages: config.value, rng, T }),
  verifier,
  messageErreur: q => t('lettres.cetait', { r: q.attendu }),
  delai: null,
})
const { phase, questions, q, bonnes, retour, repondu, etat, cleFin } = jeu
const consigne = computed(() => (q.value?.question ? t(`lettres.${q.value.question}`) : t('lettres.quelleLettre')))

// ── Fiche imprimable (aperçu et impression : CadreExercice) : graine du lien, sinon tirée ──
const { mode, fiche, nouvelle } = useFicheExercice({
  tirer: rng => questionsFiche({ niveau: config.value.niveau, reglages: config.value, rng, T }),
  mettreEnPage: (tirage, police) => ficheLettres({ questions: tirage, reglages: config.value, T, langue: langueContenu.value, ...police }),
})
</script>

<style scoped>
.note-fiche { color: #666; font-size: .95rem; margin: 0; }
.question { text-align: center; }
.lettre-display {
  font-size: 5rem; font-weight: 900; color: var(--bleu);
  line-height: 1; margin: .5rem 0 1rem;
  font-family: 'Comic Sans MS', 'Chalkboard SE', cursive, sans-serif;
}
.question-label { font-size: 1rem; font-weight: 600; color: #555; margin-bottom: .75rem; }
.suite { margin-top: 1rem; }
</style>
