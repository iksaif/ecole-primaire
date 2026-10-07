<template>
  <div class="container">
    <h1 class="section-heading">{{ DEFINITION.emoji }} {{ t('vocabulaire.titre') }}</h1>

    <CadreExercice v-if="phase === 'config'" v-model:mode="mode" :fiche="fiche" :config="config"
      @commencer="jeu.demarrer" @regenerer="nouvelle">
      <ChoixReglage :definition="DEFINITION" cle="niveau" v-model="config.niveau" :titre="t('communs.niveau')" />
      <ChoixReglage :definition="DEFINITION" :niveau="config.niveau" cle="types" v-model="config.types" :titre="t('vocabulaire.exercices')"
        :libelle="ty => tr(`type_${ty}`)" :groupes="groupes">
        <template #valeur="{ valeur: ty, texte }"><span class="theme-icon">{{ ICONES[ty] }}</span> {{ texte }}</template>
        <p class="astuce">{{ t('vocabulaire.astuce') }}</p>
      </ChoixReglage>
      <ChoixReglage :definition="DEFINITION" :niveau="config.niveau" cle="nb" v-model="config.nb" :titre="t('communs.nbQuestions')" />
    </CadreExercice>

    <QuestionJeu v-if="phase === 'jeu' && q" :jeu="jeu">
      <ConsigneParlee :key="jeu.index.value" class="consigne" :texte="valeur(q.consigne, tr)" :auto="false" />
      <div v-if="q.html" class="phrase-display" v-html="valeur(q.html, tr)"></div>

      <OrdonnerClics v-if="q.mode === 'ordre'" mots v-model="ordre" :elements="q.etiquettes ?? []" separateur="→" :verrou="repondu" :etat="etat"
        @valider="validerOrdre" />
      <ChoixReponses v-else :titre="valeur(q.consigne, tr)" :options="q.options ?? []" :bonne="q.bonne ?? 0" :repondu="repondu" :colonne="q.colonne"
        @choisir="choisir">
        <template #default="{ option }">{{ libelleChoix(tr, option.label) }}</template>
      </ChoixReponses>

      <RetourReponse :message="retour?.message" :etat="etat" />
      <p v-if="repondu && q.explication" class="explication" v-html="valeur(q.explication, tr)"></p>
      <div v-if="repondu" class="actions"><BoutonSuivant :jeu="jeu" /></div>
    </QuestionJeu>

    <ResultatsJeu v-if="phase === 'resultats'" :bonnes="bonnes" :total="questions.length" :cle-fin="cleFin"
      @rejouer="jeu.recommencer" @reglages="jeu.quitter">
      <div class="config-section-title correction-titre">{{ t('vocabulaire.correction') }}</div>
      <TableauCorrection :historique="historique">
        <template #question="{ entree }"><div class="corr-consigne">{{ valeur(entree.question.consigne, tr) }}</div></template>
        <template #attendu="{ entree }"><span v-html="valeur(entree.question.solution, tr)"></span></template>
      </TableauCorrection>
    </ResultatsJeu>
  </div>
</template>

<script setup lang="ts">
// Vocabulaire : la vue ne fait que les réglages et le rendu d'une question. Niveaux, générateur et fiche : src/exercices/vocabulaire/
// (definition.ts, generateur.ts, fiche.ts) ; corpus : src/data/vocabulaire.js. Exercice de français : la fiche est toujours en français,
// l'interface (consignes, explications) suit la langue choisie ; les textes calculés des questions sont lus avec `tr` (section vocabulaire).
import { ref, computed } from 'vue'
import { useLangue } from '../../langues/useLangue.ts'
import { traducteur } from '../../langues/catalogue.ts'
import CadreExercice from '../../noyau/CadreExercice.vue'
import ChoixReglage from '../../noyau/ChoixReglage.vue'
import QuestionJeu from '../../noyau/QuestionJeu.vue'
import BoutonSuivant from '../../noyau/BoutonSuivant.vue'
import ChoixReponses from '../../noyau/ChoixReponses.vue'
import OrdonnerClics from '../../noyau/OrdonnerClics.vue'
import ConsigneParlee from '../../noyau/ConsigneParlee.vue'
import RetourReponse from '../../noyau/RetourReponse.vue'
import ResultatsJeu from '../../noyau/ResultatsJeu.vue'
import TableauCorrection from '../../noyau/TableauCorrection.vue'
import { useReglages } from '../../noyau/useReglages.ts'
import { useJeu } from '../../noyau/useJeu.ts'
import { useFicheExercice } from '../../noyau/useFicheExercice.ts'
import DEFINITION, { GROUPES } from '../../exercices/vocabulaire/definition.ts'
import { CONTENU } from '../../exercices/vocabulaire/textes.ts'
import { questions as tirer, questionsFiche, verifier, valeur, libelleChoix } from '../../exercices/vocabulaire/generateur.ts'
import type { Question, Reponse, Tr } from '../../exercices/vocabulaire/generateur.ts'
import { fiche as ficheVocabulaire } from '../../exercices/vocabulaire/fiche.ts'

const { t } = useLangue()
const { config, langueContenu } = useReglages(DEFINITION)
// T : les textes de la fiche (CONTENU, textes.ts), toujours en français ; tr : les textes calculés des questions, dans la langue de l'interface
const T = traducteur(CONTENU, () => langueContenu.value)
const tr: Tr = (cle, params) => t(`vocabulaire.${cle}` as Parameters<typeof t>[0], params as Parameters<typeof t>[1])

const groupes = computed(() => GROUPES.map(g => ({ titre: tr(`g_${g.id}`), valeurs: g.types.map(x => x.id) })))
const ICONES: Readonly<Record<string, string>> = Object.fromEntries(GROUPES.flatMap(g => g.types.map(x => [x.id, x.icone])))

// ── Jeu : passage automatique ; après une erreur, le temps de lire la correction et l'explication ──
const ordre = ref<number[]>([])
const jeu = useJeu<Question, Reponse>({
  generer: rng => tirer({ niveau: config.value.niveau, reglages: config.value, rng, T }),
  verifier,
  messageErreur: q => (q.mode === 'ordre' ? tr('fbOrdre', { r: q.attendu }) : tr('fbChoix', { r: libelleChoix(tr, q.attendu) })),
  surQuestion: () => { ordre.value = [] },
  apresErreur: 5000,
})
const { phase, questions, q, bonnes, historique, retour, repondu, etat, cleFin } = jeu
const choisir = (i: number): void => { jeu.repondre({ choix: i }, { donne: libelleChoix(tr, q.value?.options?.[i]?.label ?? '') }) }
function validerOrdre(): void {
  const etiquettes = q.value?.etiquettes ?? []
  jeu.repondre({ ordre: [...ordre.value] }, { donne: ordre.value.map(k => etiquettes[k]).join(' → ') })
}

// ── Fiche imprimable (aperçu et impression : CadreExercice) : graine du lien, sinon tirée ──
const { mode, fiche, nouvelle } = useFicheExercice({
  tirer: rng => questionsFiche({ niveau: config.value.niveau, reglages: config.value, rng }),
  mettreEnPage: (tirage, police) => ficheVocabulaire({ questions: tirage, reglages: config.value, T, langue: langueContenu.value, ...police }),
})
</script>

<style scoped>
.theme-icon { font-size: 1.1rem; }
.astuce { font-size: .85rem; color: #777; margin: .5rem 0 0; }
.consigne { font-weight: 700; color: #555; margin-bottom: 1rem; }
.phrase-display { font-size: 1.5rem; font-weight: 700; text-align: center; margin-bottom: 1.5rem; line-height: 1.5; color: #222; }
.phrase-display :deep(em) { font-style: normal; font-weight: 600; font-size: 1.15rem; }
.phrase-display :deep(strong) { color: var(--bleu-fort); }
.phrase-display :deep(.sens) { font-size: 1rem; color: #666; font-weight: 600; margin-top: .3rem; }
.phrase-display :deep(.trou) { color: #bbb; font-weight: 400; }
.explication { font-weight: 600; font-size: .92rem; color: #555; text-align: center; margin: .3rem 0 0; }
.actions { display: flex; justify-content: center; margin-top: 1rem; }
.correction-titre { text-align: left; margin-bottom: .5rem; }
.corr-consigne { font-size: .82rem; color: #666; }
</style>
