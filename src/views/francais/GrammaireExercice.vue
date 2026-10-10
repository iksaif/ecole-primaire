<template>
  <div class="container">
    <h1 class="section-heading">{{ definition.emoji }} {{ titrePage }}</h1>

    <CadreExercice v-if="phase === 'config'" v-model:mode="mode" :fiche="fiche" :config="config"
      @commencer="jeu.demarrer" @regenerer="nouvelle">
      <ChoixReglage :definition="definition" cle="niveau" v-model="config.niveau" :titre="t('communs.niveau')" />
      <ChoixReglage :definition="definition" :niveau="config.niveau" cle="types" v-model="config.types" :titre="t('communs.exercices')"
        :libelle="ty => tr(`type_${ty}`)">
        <template #valeur="{ valeur: ty, texte }"><span class="theme-icon">{{ icone(ty) }}</span> {{ texte }}</template>
        <p class="astuce">{{ t('grammaire.astuce') }}</p>
      </ChoixReglage>
      <ChoixReglage :definition="definition" :niveau="config.niveau" cle="nb" v-model="config.nb" :titre="t('communs.nbQuestions')" />
    </CadreExercice>

    <QuestionJeu v-if="phase === 'jeu' && q" :jeu="jeu">
      <!-- la consigne ; 🔊 lit la phrase étudiée (en français) quand il y en a une -->
      <ConsigneParlee v-if="q.lecture" :key="jeu.index.value" class="consigne" :texte="q.lecture" langue="fr" :auto="false">{{ valeur(q.consigne, tr) }}</ConsigneParlee>
      <p v-else class="consigne">{{ valeur(q.consigne, tr) }}</p>

      <div v-if="q.html" class="phrase-display" v-html="valeur(q.html, tr)"></div>

      <ChoixReponses v-if="q.mode === 'choix'" :titre="valeur(q.consigne, tr)" :options="q.options ?? []" :bonne="q.bonne ?? 0" :repondu="repondu"
        :colonne="q.colonne" @choisir="choisir">
        <template #default="{ option }">{{ tc(tr, option.label) }}</template>
      </ChoixReponses>

      <!-- clic : toucher les mots demandés, puis Valider -->
      <template v-else-if="q.mode === 'clic'">
        <div class="mots-ligne" role="group" :aria-label="valeur(q.consigne, tr)">
          <template v-for="(tok, i) in q.tokens" :key="i">
            <span v-if="tok.n === 'ponct'" class="mot-ponct" :class="{ colle: tok.m === '.' || tok.m === ',' }">{{ tok.m }}</span>
            <button v-else type="button" class="mot-btn" :class="[etatMot(i), { elide: tok.m.endsWith('\'') }]" :aria-pressed="selection.includes(i)"
              :disabled="repondu" @click="basculerMot(i)">{{ tok.m }}</button>
          </template>
        </div>
        <div v-if="!repondu" class="actions">
          <button type="button" class="btn btn-primary" :disabled="!selection.length" @click="validerClic">{{ t('communs.valider') }}</button>
        </div>
      </template>

      <!-- ordre : ranger les étiquettes -->
      <OrdonnerClics v-else-if="q.mode === 'ordre'" v-model="ordre" mots :fin="q.fin ?? ''" :elements="q.etiquettes ?? []" :verrou="repondu" :etat="etat" @valider="validerOrdre">
        <p v-if="q.fin" class="fin-phrase">{{ t('grammaire.cliqueEtiquettes') }}</p>
      </OrdonnerClics>

      <div v-else class="saisie-row">
        <SaisieReponse v-model="saisie" class="saisie-input" :etat="etat" :disabled="repondu" focus :placeholder="t('grammaire.ecrisReponse')"
          @entree="repondu ? jeu.suivante() : validerSaisie()" />
        <button v-if="!repondu" type="button" class="btn btn-primary" @click="validerSaisie">{{ t('grammaire.validerCourt') }}</button>
      </div>

      <RetourReponse :message="retour?.message" :etat="etat" />
      <p v-if="repondu && q.explication" class="explication" v-html="valeur(q.explication, tr)"></p>
      <div v-if="repondu" class="actions"><BoutonSuivant :jeu="jeu" /></div>
    </QuestionJeu>

    <ResultatsJeu v-if="phase === 'resultats'" :bonnes="bonnes" :total="questions.length" :cle-fin="cleFin"
      @rejouer="jeu.recommencer" @reglages="jeu.quitter">
      <div class="config-section-title correction-titre">{{ t('grammaire.correction') }}</div>
      <TableauCorrection :historique="historique">
        <template #question="{ entree }"><div class="corr-consigne">{{ valeur(entree.question.consigne, tr) }}</div></template>
        <template #attendu="{ entree }"><span v-html="valeur(entree.question.solution, tr)"></span></template>
      </TableauCorrection>
    </ResultatsJeu>
  </div>
</template>

<script setup lang="ts">
// Grammaire : la vue ne fait que les réglages et le rendu d'une question (choix, clic sur des mots, étiquettes à ranger, saisie). C'est le même
// composant pour les cinq exercices de grammaire (une vue mince par exercice : GrammairePhraseView.vue…), qui lui donnent leur définition, leur
// catalogue de contenu et le nom de leur section de textes (titre de la page). Niveaux et types : src/exercices/grammaire-*/definition.ts ;
// générateur et fiche, communs : src/moteurs/grammaire/ ; corpus : src/data/grammaire.js.
// Exercice de français : la fiche est toujours en français, l'interface (consignes, explications) suit la langue choisie ; les textes
// calculés des questions sont lus avec `tr` (section grammaire).
import { computed, ref } from 'vue'
import { useLangue } from '../../langues/useLangue.ts'
import { traducteur } from '../../langues/catalogue.ts'
import CadreExercice from '../../noyau/CadreExercice.vue'
import ChoixReglage from '../../noyau/ChoixReglage.vue'
import QuestionJeu from '../../noyau/QuestionJeu.vue'
import BoutonSuivant from '../../noyau/BoutonSuivant.vue'
import ChoixReponses from '../../noyau/ChoixReponses.vue'
import OrdonnerClics from '../../noyau/OrdonnerClics.vue'
import SaisieReponse from '../../noyau/SaisieReponse.vue'
import ConsigneParlee from '../../noyau/ConsigneParlee.vue'
import RetourReponse from '../../noyau/RetourReponse.vue'
import ResultatsJeu from '../../noyau/ResultatsJeu.vue'
import TableauCorrection from '../../noyau/TableauCorrection.vue'
import { useReglages } from '../../noyau/useReglages.ts'
import { useJeu } from '../../noyau/useJeu.ts'
import { useFicheExercice } from '../../noyau/useFicheExercice.ts'
import type { DefinitionTypee } from '../../noyau/definir.ts'
import { estVide } from '../../utils/reponses.ts'
import { GROUPES } from '../../moteurs/grammaire/types.ts'
import type { ContenuGrammaire } from '../../moteurs/grammaire/textes.ts'
import { questions as tirer, questionsFiche, verifier, valeur, tc } from '../../moteurs/grammaire/generateur.ts'
import type { Question, Reglages, Reponse, Tr } from '../../moteurs/grammaire/generateur.ts'
import { fiche as ficheGrammaire } from '../../moteurs/grammaire/fiche.ts'

const props = defineProps<{
  definition: DefinitionTypee<Reglages>
  contenu: ContenuGrammaire
  /** la section de textes de l'interface de l'exercice (`grammairePhrase` : son titre) */
  section: string
}>()
const { t } = useLangue()
const { config, langueContenu } = useReglages(props.definition)
// T : les textes de la fiche (le catalogue de l'exercice), toujours en français ; tr : les textes calculés des questions, dans la langue de l'interface
const T = traducteur(props.contenu, () => langueContenu.value)
const tr: Tr = (cle, params) => t(`grammaire.${cle}` as Parameters<typeof t>[0], params as Parameters<typeof t>[1])

const ICONES: Readonly<Record<string, string>> = Object.fromEntries(GROUPES.flatMap(g => g.types.map(x => [x.id, x.icone])))
const icone = (type: unknown): string => ICONES[String(type)] ?? ''
/** le titre de la page : celui de la section de textes de l'exercice */
const titrePage = computed(() => (t as (cle: string) => string)(`${props.section}.titre`))

// retour après une erreur : la bonne réponse (l'explication de la question suit)
function messageErreur(qu: Question): string {
  if (qu.mode === 'ordre') return `❌ ${tr('bonnePhrase', { r: valeur(qu.solution, tr) })}`
  if (qu.mode === 'saisie') return `❌ ${tr('bonneReponseEst', { r: qu.attendu })}`
  if (qu.mode === 'choix') return `❌ ${tr('bonneReponseEst', { r: tc(tr, qu.attendu) })}`
  return `❌ ${tr('pasToutAFait')}`
}

// ── Jeu : passage automatique ; après une erreur, le temps de lire la correction et l'explication ──
const selection = ref<number[]>([])
const ordre = ref<number[]>([])
const saisie = ref<string | number>('')
const jeu = useJeu<Question, Reponse>({
  generer: rng => tirer({ niveau: config.value.niveau, reglages: config.value, rng, T }),
  verifier,
  messageErreur,
  // pluriel écrit sans les accents : compté faux, avec la bonne graphie
  messageNuance: qu => `⚠️ ${tr('accents', { r: qu.attendu })}`,
  surQuestion: () => { selection.value = []; ordre.value = []; saisie.value = '' },
  apresErreur: 5000,
})
const { phase, questions, q, bonnes, historique, retour, repondu, etat, cleFin } = jeu

const choisir = (i: number): void => { jeu.repondre({ choix: i }, { donne: tc(tr, q.value?.options?.[i]?.label ?? '') }) }

// clic : un mot touché est choisi, touché de nouveau il ne l'est plus
function basculerMot(i: number): void {
  if (repondu.value) return
  selection.value = selection.value.includes(i) ? selection.value.filter(x => x !== i) : [...selection.value, i]
}
// état d'un mot : choisi (avant la réponse) ; après : bonne (cible choisie), manquée (cible oubliée), mauvaise (choisie à tort)
function etatMot(i: number): string {
  const choisi = selection.value.includes(i)
  if (!repondu.value) return choisi ? 'choisi' : ''
  const cible = q.value?.cibles?.includes(i) ?? false
  if (cible && choisi) return 'bonne'
  if (cible) return 'manquee'
  if (choisi) return 'mauvaise'
  return ''
}
function validerClic(): void {
  if (repondu.value || !selection.value.length) return
  const sel = [...selection.value].sort((a, b) => a - b)
  jeu.repondre({ selection: sel }, { donne: sel.map(i => q.value?.tokens?.[i]?.m ?? '').join(', ') })
}
function validerOrdre(): void {
  const etiquettes = q.value?.etiquettes ?? []
  jeu.repondre({ ordre: [...ordre.value] }, { donne: ordre.value.map(k => etiquettes[k]).join(' ') + (q.value?.fin ?? '') })
}
function validerSaisie(): void {
  const texte = String(saisie.value)
  if (!repondu.value && !estVide(texte)) jeu.repondre({ texte }, { donne: texte.trim() })
}

// ── Fiche imprimable (aperçu et impression : CadreExercice) : graine du lien, sinon tirée ──
const { mode, fiche, nouvelle } = useFicheExercice({
  tirer: rng => questionsFiche({ niveau: config.value.niveau, reglages: config.value, rng }),
  mettreEnPage: (tirage, police) => ficheGrammaire({ questions: tirage, reglages: config.value, T, langue: langueContenu.value, ...police }),
})
</script>

<style scoped>
.theme-icon { font-size: 1.1rem; }
.astuce { font-size: .85rem; color: #777; margin: .5rem 0 0; }
.consigne { font-weight: 700; color: #555; text-align: center; margin-bottom: 1rem; }
.phrase-display { font-size: 1.4rem; font-weight: 600; text-align: center; margin-bottom: 1.5rem; line-height: 1.6; color: #222; }
.phrase-display :deep(u) { text-decoration-thickness: 3px; text-decoration-color: var(--bleu); text-underline-offset: 4px; }
.phrase-display :deep(strong) { color: var(--bleu-fort); }
.phrase-display :deep(em) { color: #888; font-weight: 400; font-size: .9em; }
.phrase-display :deep(.sens) { font-size: 1rem; color: #666; font-weight: 600; margin-top: .3rem; }
.phrase-display :deep(.trou) { color: #bbb; font-weight: 400; }
.mots-ligne { display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: .45rem .3rem; font-size: 1.35rem; }
.mot-btn { font-size: inherit; font-family: inherit; font-weight: 600; padding: .2rem .5rem; border-radius: 8px; border: 2px dashed #cfd8e3; background: white; cursor: pointer; color: var(--texte); }
.mot-btn.elide { margin-right: -.3rem; }
.mot-btn:hover:not(:disabled) { border-color: var(--bleu); }
.mot-btn.choisi { border-style: solid; border-color: var(--bleu); background: #eef5ff; }
.mot-btn.bonne { border-style: solid; border-color: #22c55e; background: #dcfce7; color: #15803d; }
.mot-btn.manquee { border-style: solid; border-color: #22c55e; color: #15803d; }
.mot-btn.mauvaise { border-style: solid; border-color: var(--rouge); background: #fff5f5; color: var(--rouge); text-decoration: line-through; }
.mot-btn:disabled { cursor: default; }
.mot-ponct { font-weight: 700; }
.mot-ponct.colle { margin-left: -.25rem; }
.fin-phrase { font-size: .85rem; color: var(--texte-doux); text-align: center; margin: .3rem 0; }
.saisie-row { display: flex; gap: .5rem; justify-content: center; margin-bottom: 1rem; flex-wrap: wrap; }
.saisie-input { border: 2px solid #ccc; border-radius: 8px; padding: .5rem .9rem; font-size: 1.15rem; font-family: inherit; width: 16rem; max-width: 100%; }
.saisie-input.ok { border-color: #22c55e; background: #f0fdf4; color: #15803d; }
.saisie-input.presque { border-color: var(--orange); background: #fff8ec; color: #9a5b00; }
.saisie-input.erreur { border-color: var(--rouge); background: #fff5f5; color: var(--rouge); }
.explication { font-weight: 600; font-size: .92rem; color: #555; text-align: center; margin: .3rem 0 0; }
.actions { display: flex; justify-content: center; margin-top: 1rem; }
.correction-titre { text-align: left; margin-bottom: .5rem; }
.corr-consigne { font-size: .82rem; color: #666; }
</style>
