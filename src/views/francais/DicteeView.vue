<template>
  <div class="container">
    <h1 class="section-heading">{{ DEFINITION.emoji }} {{ t('dictee.titre') }}</h1>

    <CadreExercice v-if="phase === 'config'" v-model:mode="mode" :fiche="fiche" :config="config"
      :desactive="chargement" @commencer="commencer" @regenerer="nouvelle">
      <ChoixReglage :definition="DEFINITION" cle="niveau" v-model="config.niveau" :titre="t('communs.niveau')" />
      <ChoixReglage :definition="DEFINITION" :niveau="config.niveau" cle="cats" v-model="config.cats"
        :titre="t('dictee.categories', { n: etiquetteNiveau })" :libelle="cat => `${nomCategorie(cat)} (${corpus.categories[cat]?.length ?? 0})`" />
      <ChoixReglage cartes :definition="DEFINITION" :niveau="config.niveau" cle="mode" v-model="config.mode" :titre="t('dictee.mode')"
        :libelle="m => t(m === 'mots' ? 'dictee.motsSeuls' : 'dictee.phrases')" :icone="m => (m === 'mots' ? '🔤' : '💬')"
        :description="m => t(m === 'mots' ? 'dictee.motsSeulsDesc' : 'dictee.phrasesDesc')" />

      <!-- phrases générées par Mistral : facultatif, avec la clé que l'utilisateur saisit lui-même (mistral.ts) -->
      <div v-if="mode === 'jouer' && config.mode === 'phrases'" class="config-section">
        <div class="config-section-title">{{ t('dictee.cleApi') }} <span class="cle-opt">{{ t('dictee.cleApiOpt') }}</span></div>
        <p class="api-etat" :class="{ aucune: !cleSaisie }">{{ cleSaisie ? t('dictee.cleOk') : t('dictee.cleAucune') }}</p>
        <form class="api-row" @submit.prevent="enregistrerCle">
          <label class="sr-only" for="cle-mistral">{{ t('dictee.cleSaisie') }}</label>
          <input id="cle-mistral" v-model="champCle" type="password" autocomplete="off" :placeholder="t('dictee.cleSaisie')">
          <button type="submit" class="btn btn-ghost" :disabled="!champCle.trim()">{{ t('dictee.cleEnregistrer') }}</button>
          <button v-if="cleSaisie" type="button" class="btn btn-ghost" @click="effacerCle">{{ t('dictee.cleEffacer') }}</button>
        </form>
        <p class="api-aide">{{ t('dictee.cleConfidentialite') }}</p>
      </div>

      <ChoixReglage :definition="DEFINITION" :niveau="config.niveau" cle="nb" v-model="config.nb" :titre="t('dictee.nbMots')" :libelle="n => (n === 0 ? t('dictee.tous') : String(n))" />

      <div v-if="mode === 'jouer'" class="config-section">
        <div class="config-section-title">{{ t('dictee.vitesse') }}</div>
        <div class="slider-row">
          <span aria-hidden="true">🐢</span>
          <input v-model.number="config.vitesse" type="range" min="0.5" max="1.2" step="0.05" :aria-label="t('dictee.vitesse')">
          <span aria-hidden="true">🐇</span>
          <span class="slider-val">{{ config.vitesse }}</span>
        </div>
      </div>

      <div v-if="mode === 'imprimer'" class="config-section">
        <div class="config-section-title">{{ t('dictee.pagesFiche') }}</div>
        <div class="btn-group">
          <button type="button" class="level-btn" :class="{ active: config.liste }" :aria-pressed="config.liste" @click="basculerPage('liste')">📋 {{ t('dictee.pageListe') }}</button>
          <button type="button" class="level-btn" :class="{ active: config.dictee }" :aria-pressed="config.dictee" @click="basculerPage('dictee')">✏️ {{ t('dictee.pageDictee') }}</button>
        </div>
      </div>
      <div v-if="chargement" class="loading-badge" role="status"><span class="spinner"></span> {{ t('dictee.generation') }}</div>
    </CadreExercice>

    <!-- Dictée : un mot (ou une phrase) à écouter, puis à écrire -->
    <QuestionJeu v-if="phase === 'jeu' && q" :jeu="jeu">
      <div v-if="q.mode === 'phrases' && q.phrase" class="phrase-ctx-container">
        <button v-if="!afficherIndice" type="button" class="btn btn-ghost btn-sm indice" @click="afficherIndice = true">{{ t('dictee.afficherIndice') }}</button>
        <div v-else class="phrase-ctx">
          <span v-html="phraseAvecBlanc"></span>
          <button type="button" class="btn-masquer-indice" :title="t('dictee.masquerIndice')" :aria-label="t('dictee.masquerIndice')" @click="afficherIndice = false">🙈</button>
        </div>
      </div>

      <button type="button" class="btn-ecouter" :class="{ playing: enLecture }" @click="ecouter">
        <span aria-hidden="true">{{ enLecture ? '⏹' : '🔊' }}</span>
        <span>{{ enLecture ? t('dictee.arreter') : (q.mode === 'phrases' ? t('dictee.ecouterPhrase') : t('dictee.ecouterMot')) }}</span>
      </button>

      <div class="hint-text">{{ t('dictee.consigne') }}</div>

      <SaisieReponse v-model="reponse" class="dictee-input" :etat="etat" :disabled="repondu" focus placeholder="…" @entree="repondu ? jeu.suivante() : valider()" />

      <RetourReponse :message="retour?.message" :etat="etat" />

      <div class="btn-group actions">
        <template v-if="!repondu">
          <button type="button" class="btn btn-ghost" @click="ecouter">{{ t('dictee.reecouter') }}</button>
          <button type="button" class="btn btn-primary" @click="valider">{{ t('communs.valider') }}</button>
          <button type="button" class="btn btn-ghost" @click="passer">{{ t('dictee.passer') }}</button>
        </template>
        <BoutonSuivant v-else :jeu="jeu" />
      </div>
    </QuestionJeu>

    <ResultatsJeu v-if="phase === 'resultats'" :bonnes="bonnes" :total="questions.length" :cle-fin="cleFin"
      @rejouer="commencer" @reglages="jeu.quitter">
      <TableauCorrection :historique="historique">
        <template #question="{ entree }">{{ rang(entree.question) }}</template>
      </TableauCorrection>
    </ResultatsJeu>
  </div>
</template>

<script setup lang="ts">
// Dictée : la vue ne fait que les réglages, la voix et le rendu. Niveaux, générateur et fiche : src/exercices/dictee/ (definition.ts,
// generateur.ts, fiche.ts) ; phrases générées (facultatif, clé saisie par l'utilisateur) : mistral.ts ; mots : src/data/dicteeMots.js.
// Exercice de français : la fiche et la voix sont toujours en français, l'interface suit la langue choisie.
import { ref, computed, watch, nextTick, onUnmounted } from 'vue'
import { estVide } from '../../utils/reponses.ts'
import { chargerValeur, sauvegarder } from '../../utils/index.js'
import { creerRng, graineAleatoire } from '../../utils/hasard.ts'
import { useLangue } from '../../langues/useLangue.ts'
import { traducteur } from '../../langues/catalogue.ts'
import CadreExercice from '../../noyau/CadreExercice.vue'
import ChoixReglage from '../../noyau/ChoixReglage.vue'
import QuestionJeu from '../../noyau/QuestionJeu.vue'
import BoutonSuivant from '../../noyau/BoutonSuivant.vue'
import ResultatsJeu from '../../noyau/ResultatsJeu.vue'
import SaisieReponse from '../../noyau/SaisieReponse.vue'
import RetourReponse from '../../noyau/RetourReponse.vue'
import TableauCorrection from '../../noyau/TableauCorrection.vue'
import { useTTS } from '../../noyau/useTTS.ts'
import { useReglages } from '../../noyau/useReglages.ts'
import { useFicheExercice } from '../../noyau/useFicheExercice.ts'
import { useJeu } from '../../noyau/useJeu.ts'
import DEFINITION, { corpusDe } from '../../exercices/dictee/definition.ts'
import { CONTENU } from '../../exercices/dictee/textes.ts'
import { questions as tirer, questionsFiche, verifier } from '../../exercices/dictee/generateur.ts'
import type { Question, Reponse } from '../../exercices/dictee/generateur.ts'
import { fiche as ficheDictee, cleCategorie } from '../../exercices/dictee/fiche.ts'
import { cleMistral, enregistrerCleMistral, phraseGeneree } from '../../exercices/dictee/mistral.ts'

const { t } = useLangue()
const { config, langueContenu } = useReglages(DEFINITION)
// T : les textes de la fiche (CONTENU, textes.ts), toujours en français
const T = traducteur(CONTENU, () => langueContenu.value)

const corpus = computed(() => corpusDe(config.value.niveau))
// CM1 et CM2 partagent un corpus : « CM »
const etiquetteNiveau = computed(() => (config.value.niveau.startsWith('cm') ? 'CM' : config.value.niveau.toUpperCase()))
const nomCategorie = (cat: string): string => t(`dictee.cat.${cleCategorie(cat)}` as 'dictee.cat.pronoms')

// ── Clé Mistral : saisie ici, gardée sur l'appareil, jamais affichée ──
const cleSaisie = ref(!!cleMistral())
const champCle = ref('')
function enregistrerCle(): void { enregistrerCleMistral(champCle.value); champCle.value = ''; cleSaisie.value = !!cleMistral() }
function effacerCle(): void { enregistrerCleMistral(''); cleSaisie.value = false }

// ── Voix (toujours en français : la dictée est en français) ──
const { enLecture, parler, arreter } = useTTS()
const reponse = ref<string | number>('')
const afficherIndice = ref(false)
const lire = (texte: string): void => { parler(texte, 'fr', { vitesse: config.value.vitesse }) }
function ecouter(): void {
  if (enLecture.value) { arreter(); return }
  const qu = q.value
  if (qu) lire(qu.phrase ?? qu.mot)
}
const phraseAvecBlanc = computed(() => {
  const qu = q.value
  if (!qu?.phrase) return ''
  const motEchappe = qu.mot.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return qu.phrase.replace(new RegExp(motEchappe, 'gi'), '<span class="blank">___</span>')
})

// ── Jeu : un mot, ou une phrase, à la fois ; erreur : la bonne réponse est lue, puis on continue ──
let preparees: Question[] = []
const chargement = ref(false)
const jeu = useJeu<Question, Reponse>({
  generer: () => preparees,
  verifier,
  messageErreur: (qu, rep) => (rep ? t('dictee.feedbackErr', { r: qu.attendu }) : ''),
  messageNuance: qu => `⚠️ ${t('dictee.accents', { r: qu.attendu })}`,
  surQuestion: () => { reponse.value = ''; afficherIndice.value = false; void nextTick(ecouter) },
  delai: 900,
  apresErreur: 3000,
})
const { phase, questions, q, bonnes, historique, retour, repondu, etat, cleFin } = jeu
// numéro d'un mot dans le tableau de correction
const rang = (qu: Question): number => historique.value.findIndex(h => h.question === qu) + 1

async function commencer(): Promise<void> {
  if (chargement.value) return   // pas de double clic pendant la génération
  arreter()
  // mots récemment vus : repoussés en fin de liste, d'une séance à l'autre
  const cle = `dictee_vus_${config.value.mode}`
  const qs = tirer({ niveau: config.value.niveau, reglages: config.value, rng: creerRng(graineAleatoire()), T, vus: chargerValeur(cle, []) as string[] })
  sauvegarder(cle, qs.map(x => x.mot))
  if (config.value.mode === 'phrases') {
    chargement.value = true
    const phrases = await Promise.all(qs.map(x => phraseGeneree(x.mot)))
    qs.forEach((x, i) => { x.phrase = phrases[i]; x.attendu = phrases[i] })
    chargement.value = false
  }
  preparees = qs
  jeu.demarrer()
}

function valider(): void {
  const texte = String(reponse.value)
  if (repondu.value || estVide(texte)) return
  arreter()
  jeu.repondre({ texte }, { donne: texte.trim() })
}
function passer(): void {
  if (repondu.value) return
  arreter()
  jeu.passer({ donne: t('dictee.passe') })
}

// après une erreur, la bonne réponse est lue
let relecture: ReturnType<typeof setTimeout> | undefined
watch(retour, r => {
  clearTimeout(relecture)
  const qu = q.value
  if (r && !r.ok && r.message && qu) relecture = setTimeout(() => lire(qu.attendu), 600)
})
watch(phase, p => { if (p !== 'jeu') { arreter(); clearTimeout(relecture) } })
onUnmounted(() => { arreter(); clearTimeout(relecture) })

// ── Fiche imprimable : au moins une des deux pages ──
function basculerPage(p: 'liste' | 'dictee'): void {
  const autre = p === 'liste' ? 'dictee' : 'liste'
  if (config.value[p] && !config.value[autre]) return
  config.value[p] = !config.value[p]
}
const { mode, fiche, nouvelle } = useFicheExercice({
  tirer: rng => questionsFiche({ niveau: config.value.niveau, reglages: config.value, rng }),
  mettreEnPage: (tirage, police) => ficheDictee({ questions: tirage, reglages: config.value, T, langue: langueContenu.value, ...police }),
})
</script>

<style scoped>
.cle-opt { font-weight: 400; color: #aaa; font-size: .85em; }
.api-row { display: flex; gap: .5rem; align-items: center; flex-wrap: wrap; }
.api-etat { font-size: .85rem; font-weight: 700; color: var(--vert-texte); margin: 0 0 .4rem; }
.api-etat.aucune { color: var(--texte-doux); }
.api-row input { flex: 1; min-width: 12rem; padding: .4rem .6rem; border: 2px solid var(--gris-brd); border-radius: 8px; font: inherit; }
.api-aide { font-size: .8rem; color: var(--texte-doux); margin: .4rem 0 0; }
.api-row .btn { font-size: .85rem; }

.slider-row { display: flex; align-items: center; gap: .75rem; }
.slider-row input[type=range] { flex: 1; }
.slider-val { font-weight: 700; min-width: 2.5rem; text-align: right; }

.indice { margin-bottom: 1.25rem; }
.phrase-ctx {
  position: relative;
  background: var(--gris-bg); border-radius: 8px;
  padding: 1rem 2.5rem 1rem 1.25rem; font-size: 1.2rem;
  line-height: 1.8; margin: 1rem 0; text-align: center; min-height: 5rem;
  display: flex; align-items: center; justify-content: center;
}
.btn-masquer-indice {
  position: absolute; right: 0.5rem; top: 50%; transform: translateY(-50%);
  background: none; border: none; font-size: 1.2rem; cursor: pointer;
  opacity: 0.6; transition: opacity 0.15s;
}
.btn-masquer-indice:hover { opacity: 1; }
.phrase-ctx-container { margin-bottom: 1rem; text-align: center; }
:deep(.blank) {
  display: inline-block; min-width: 80px;
  border-bottom: 3px solid var(--bleu);
  vertical-align: bottom; font-weight: 700; color: var(--bleu);
}

.btn-ecouter {
  display: flex; align-items: center; justify-content: center; gap: .5rem;
  width: 100%; padding: 1rem; font-size: 1.1rem; font-weight: 800;
  border: none; border-radius: var(--radius);
  background: var(--bleu); color: white; cursor: pointer;
  transition: opacity .15s, transform .1s; margin-bottom: 1rem;
}
.btn-ecouter:hover { opacity: .88; }
.btn-ecouter.playing { background: var(--orange); }

.hint-text { font-size: .85rem; color: #aaa; text-align: center; margin-bottom: .75rem; }

.dictee-input {
  display: block; width: 100%; font-size: 1.6rem; font-weight: 700;
  text-align: center; border: 3px solid var(--gris-brd);
  border-radius: var(--radius); padding: .6rem; outline: none;
  transition: border-color .15s; margin-bottom: .75rem; box-sizing: border-box;
}
.dictee-input:focus  { border-color: var(--bleu); }
.dictee-input.ok     { border-color: var(--vert); background: #f0faf0; }
.dictee-input.presque { border-color: var(--orange); background: #fff8ec; }
.dictee-input.erreur { border-color: var(--rouge); background: #fef0f0; }
.actions { justify-content: center; margin-top: .75rem; }
</style>
