<template>
  <div class="container">
    <h1 class="section-heading">{{ DEFINITION.emoji }} {{ t('lecture.titre') }}</h1>

    <CadreExercice v-if="phase === 'config'" v-model:mode="mode" :fiche="fiche" :config="config" @commencer="jeu.demarrer" @regenerer="nouvelle">
      <ChoixReglage :definition="DEFINITION" cle="niveau" v-model="config.niveau" :titre="t('communs.niveau')" />
      <ChoixReglage cartes :definition="DEFINITION" :niveau="config.niveau" cle="mode" v-model="config.mode" :titre="t('lecture.mode')"
        :libelle="m => t(`lecture.${m}`)" :icone="m => ICONES[m]" :description="m => t(`lecture.${m}Desc`)" />
      <ChoixReglage :definition="DEFINITION" :niveau="config.niveau" cle="nb" v-model="config.nb" :titre="t('lecture.nbQuestions')" />
      <!-- histoires générées par Mistral : facultatif, avec la clé que l'utilisateur saisit lui-même (src/noyau/mistral.ts) -->
      <CleMistral v-if="mode === 'jouer' && config.mode === 'texte'" :utilite="t('lecture.cleApiOpt')" :sans-cle="t('lecture.cleAucune')" />
    </CadreExercice>

    <QuestionJeu v-if="phase === 'jeu' && q" :jeu="jeu">
      <!-- compter les syllabes -->
      <template v-if="q.mode === 'syllabes'">
        <p class="consigne">{{ t('lecture.combienSyllabes') }}</p>
        <div class="mot">{{ q.mot }}</div>
        <ChoixReponses grand :titre="t('lecture.combienSyllabes')" :options="q.options" :bonne="q.bonne" :repondu="repondu"
          @choisir="i => jeu.repondre({ choix: i }, { donne: q?.mode === 'syllabes' ? q.options[i].label : '' })" />
      </template>

      <!-- reconstituer le mot -->
      <template v-else-if="q.mode === 'mots'">
        <p class="consigne">{{ t('lecture.consigneMots') }}</p>
        <OrdonnerClics v-model="ordre" mots :elements="q.melangees" :verrou="repondu" :etat="etat" @valider="validerOrdre" />
      </template>

      <!-- lire à voix haute : chaque mot se fait entendre ; le texte vient de Mistral si une clé est saisie -->
      <template v-else>
        <p class="consigne">{{ t('lecture.consigneTexte') }}</p>
        <p v-if="enGeneration" class="generation" aria-live="polite">{{ t('lecture.generation') }}</p>
        <p v-else class="texte" lang="fr">
          <template v-for="(m, i) in motsDuTexte" :key="i"><button type="button" class="mot-texte" @click="ecouter(m)">{{ m }}</button>{{ ' ' }}</template>
        </p>
        <div v-if="!repondu && !enGeneration" class="actions">
          <button type="button" class="btn btn-warning" @click="ecouterTout">{{ enLecture ? '⏹ ' + t('lecture.arreter') : '🔊 ' + t('lecture.ecouterTout') }}</button>
          <button type="button" class="btn btn-success" @click="jeu.repondre({ lu: true }, { donne: '' })">{{ t('lecture.jaiLu') }}</button>
        </div>
      </template>

      <RetourReponse :message="retour?.message" :etat="etat" />
      <div v-if="repondu" class="actions"><BoutonSuivant :jeu="jeu" /></div>
    </QuestionJeu>

    <ResultatsJeu v-if="phase === 'resultats'" :bonnes="bonnes" :total="questions.length" :cle-fin="cleFin"
      @rejouer="jeu.recommencer" @reglages="jeu.quitter" />
  </div>
</template>

<script setup lang="ts">
// Lecture : la vue ne fait que les réglages et le rendu d'une question. Niveaux, générateur et fiche : src/exercices/lecture/
// (definition.ts, generateur.ts, fiche.ts) ; textes générés (facultatif, clé saisie par l'utilisateur) : mistral.ts. Exercice de français :
// le contenu est toujours en français.
import { ref, computed, watch, onUnmounted } from 'vue'
import { useLangue } from '../../langues/useLangue.ts'
import { traducteur } from '../../langues/catalogue.ts'
import CadreExercice from '../../noyau/CadreExercice.vue'
import ChoixReglage from '../../noyau/ChoixReglage.vue'
import QuestionJeu from '../../noyau/QuestionJeu.vue'
import BoutonSuivant from '../../noyau/BoutonSuivant.vue'
import ChoixReponses from '../../noyau/ChoixReponses.vue'
import OrdonnerClics from '../../noyau/OrdonnerClics.vue'
import RetourReponse from '../../noyau/RetourReponse.vue'
import ResultatsJeu from '../../noyau/ResultatsJeu.vue'
import CleMistral from '../../noyau/CleMistral.vue'
import { useReglages } from '../../noyau/useReglages.ts'
import { useJeu } from '../../noyau/useJeu.ts'
import { useFicheExercice } from '../../noyau/useFicheExercice.ts'
import { useTTS } from '../../noyau/useTTS.ts'
import DEFINITION from '../../exercices/lecture/definition.ts'
import { CONTENU } from '../../exercices/lecture/textes.ts'
import { questions as tirer, questionsFiche, verifier } from '../../exercices/lecture/generateur.ts'
import type { Question, Reponse } from '../../exercices/lecture/generateur.ts'
import { fiche as ficheLecture } from '../../exercices/lecture/fiche.ts'
import { texteGenere } from '../../exercices/lecture/mistral.ts'

const ICONES: Readonly<Record<string, string>> = { syllabes: '🔠', mots: '🧩', texte: '📖' }

const { t } = useLangue()
const { config, langueContenu } = useReglages(DEFINITION)
const T = traducteur(CONTENU, () => langueContenu.value)
const { enLecture, parler, arreter } = useTTS()

/** Le message après une erreur : le bon découpage, ou le bon ordre. */
function messageErreur(qu: Question): string {
  if (qu.mode === 'syllabes') return t('lecture.erreurSyllabes', { mot: qu.mot, n: qu.syllabes.length, syll: qu.syllabes.join(' · ') })
  if (qu.mode === 'mots') return t('lecture.erreurOrdre', { mot: qu.mot, syll: qu.syllabes.join(' · ') })
  return ''
}

// ── Jeu ──
const ordre = ref<number[]>([])
// le texte lu : celui du corpus, remplacé par celui de Mistral quand une clé est saisie
const texteAffiche = ref('')
const enGeneration = ref(false)
let demande = 0
async function preparerTexte(qu: Question): Promise<void> {
  if (qu.mode !== 'texte') return
  texteAffiche.value = qu.texte
  const numero = ++demande
  enGeneration.value = true
  const texte = await texteGenere(config.value.niveau, qu.texte)
  // une réponse arrivée après la question suivante est ignorée
  if (numero !== demande) return
  texteAffiche.value = texte
  enGeneration.value = false
}

const jeu = useJeu<Question, Reponse>({
  generer: rng => tirer({ niveau: config.value.niveau, reglages: config.value, rng, T }),
  verifier,
  messageErreur,
  surQuestion: qu => { ordre.value = []; arreter(); void preparerTexte(qu) },
  apresErreur: 5000,
})
const { phase, questions, q, bonnes, retour, repondu, etat, cleFin } = jeu

function validerOrdre(): void {
  if (q.value?.mode !== 'mots') return
  const melangees = q.value.melangees
  const syllabes = ordre.value.map(i => melangees[i])
  jeu.repondre({ syllabes }, { donne: syllabes.join('') })
}

const motsDuTexte = computed(() => texteAffiche.value.split(' ').filter(Boolean))
/** Un mot du texte, sans sa ponctuation, lu par la voix. */
function ecouter(mot: string): void {
  const nettoye = mot.replace(/[.,;:!?«»"()]/g, '')
  if (nettoye) parler(nettoye, 'fr')
}
function ecouterTout(): void {
  if (enLecture.value) arreter()
  else parler(texteAffiche.value, 'fr')
}
watch(phase, p => { if (p !== 'jeu') arreter() })
onUnmounted(() => arreter())

// ── Fiche imprimable : graine du lien, sinon tirée ──
const { mode, fiche, nouvelle } = useFicheExercice({
  tirer: rng => questionsFiche({ niveau: config.value.niveau, reglages: config.value, rng, T }),
  mettreEnPage: (tirage, police) => ficheLecture({ questions: tirage, reglages: config.value, T, langue: langueContenu.value, ...police }),
})
</script>

<style scoped>
.consigne { font-weight: 600; color: var(--texte-doux); text-align: center; margin: 0 0 .75rem; }
.mot { font-size: 2.5rem; font-weight: 900; text-align: center; color: var(--bleu-fort); margin-bottom: 1.25rem; letter-spacing: .05em; }
.texte { font-size: 1.5rem; line-height: 2; text-align: center; max-width: 36rem; margin: 0 auto 1rem; }
.mot-texte { font: inherit; background: none; border: none; padding: 0 .1rem; border-radius: 6px; cursor: pointer; color: inherit; }
.mot-texte:hover, .mot-texte:focus-visible { background: #fff3c4; }
.generation { text-align: center; color: var(--texte-doux); }
.actions { display: flex; justify-content: center; gap: .75rem; margin-top: 1rem; flex-wrap: wrap; }
</style>
