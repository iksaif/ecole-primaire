<template>
  <div class="container">
    <h1 class="section-heading">🖊️ {{ t('titre') }}</h1>

    <!-- Config -->
    <ConfigExercice v-if="phase === 'config'" :config="config" v-model:mode="mode" :fiche="fiche" police
      :desactive="chargement" @commencer="commencer" @regenerer="nouvelle">
      <ChoixReglage :definition="DEFINITION" cle="niveau" v-model="config.niveau" :titre="t('niveau')" />
      <ChoixReglage :definition="DEFINITION" :niveau="config.niveau" cle="cats" v-model="config.cats"
        :titre="t('categories', { n: etiquetteNiveau })" :libelle="cat => `${nomCat(t, cat)} (${corpus.categories[cat].length})`" />
      <ChoixReglage cartes :definition="DEFINITION" :niveau="config.niveau" cle="mode" v-model="config.mode" :titre="t('mode')"
        :libelle="m => t(m === 'mots' ? 'motsSeuls' : 'phrases')" :icone="m => (m === 'mots' ? '🔤' : '💬')"
        :description="m => t(m === 'mots' ? 'motsSeulsDesc' : 'phrasesDesc')" />

      <div class="config-section" v-if="mode === 'jouer' && config.mode === 'phrases'">
        <div class="config-section-title">
          {{ t('cleApi') }}
          <span class="cle-opt"> {{ t('cleApiOpt') }}</span>
        </div>
        <div class="api-row">
          <span class="api-ok" :class="{ aucune: !cleMistral }">{{ cleMistral ? t('cleOk') : t('cleAucune') }}</span>
          <RouterLink to="/parametres" class="btn btn-ghost">{{ t('parametresParents') }}</RouterLink>
        </div>
      </div>

      <ChoixReglage :definition="DEFINITION" cle="nb" v-model="config.nb" :titre="t('nbMots')" :libelle="n => (n === 0 ? t('tous') : n)" />

      <div v-if="mode === 'jouer'" class="config-section">
        <div class="config-section-title">{{ t('vitesse') }}</div>
        <div class="slider-row">
          <span>🐢</span>
          <input type="range" min="0.5" max="1.2" step="0.05" v-model.number="config.vitesse">
          <span>🐇</span>
          <span class="slider-val">{{ config.vitesse }}</span>
        </div>
      </div>

      <div v-if="mode === 'imprimer'" class="config-section">
        <div class="config-section-title">{{ t('pagesFiche') }}</div>
        <div class="btn-group">
          <button class="level-btn" :class="{ active: config.liste }" @click="basculerPage('liste')">📋 {{ t('pageListe') }}</button>
          <button class="level-btn" :class="{ active: config.dictee }" @click="basculerPage('dictee')">✏️ {{ t('pageDictee') }}</button>
        </div>
      </div>
      <div v-if="chargement" class="loading-badge"><span class="spinner"></span> {{ t('generation') }}</div>
    </ConfigExercice>

    <!-- Dictée : un mot (ou une phrase) à écouter, puis à écrire -->
    <QuestionJeu v-if="phase === 'jeu' && q" :jeu="jeu">
      <!-- Contexte phrase -->
      <div v-if="q.mode === 'phrases' && q.phrase" class="phrase-ctx-container">
        <button v-if="!afficherIndice" class="btn btn-ghost btn-sm indice" @click="afficherIndice = true">{{ t('afficherIndice') }}</button>
        <div v-else class="phrase-ctx">
          <span v-html="phraseAvecBlanc"></span>
          <button class="btn-masquer-indice" @click="afficherIndice = false" :title="t('masquerIndice')" :aria-label="t('masquerIndice')">🙈</button>
        </div>
      </div>

      <button class="btn-ecouter" :class="{ playing: enLecture }" @click="ecouter">
        <span>{{ enLecture ? '⏹' : '🔊' }}</span>
        <span>{{ enLecture ? t('arreter') : (q.mode === 'phrases' ? t('ecouterPhrase') : t('ecouterMot')) }}</span>
      </button>

      <div class="hint-text">{{ t('consigne') }}</div>

      <SaisieReponse v-model="reponse" class="dictee-input" :etat="etat" :disabled="repondu" focus placeholder="…" @entree="valider" />

      <div class="feedback" :class="etat">{{ retour?.message }}</div>

      <div class="btn-group actions">
        <button class="btn btn-ghost" @click="ecouter">{{ t('reecouter') }}</button>
        <button class="btn btn-primary" :disabled="repondu" @click="valider">{{ t('valider') }}</button>
        <button class="btn btn-ghost" :disabled="repondu" @click="passer">{{ t('passer') }}</button>
      </div>
    </QuestionJeu>

    <!-- Résultats -->
    <ResultatsJeu v-if="phase === 'resultats'" :bonnes="bonnes" :total="questions.length" :cle-fin="cleFin"
      @rejouer="commencer" @reglages="jeu.quitter">
      <TableauCorrection :historique="historique">
        <template #question="{ entree }">{{ historique.indexOf(entree) + 1 }}</template>
      </TableauCorrection>
    </ResultatsJeu>
  </div>
</template>

<script setup>
// Dictée : la vue ne fait que les réglages, la voix et le rendu. Niveaux, générateur et fiche : src/exercices/dictee/
// (definition.js, generateur.js, fiche.js) ; mots : src/data/dicteeMots.js. Exercice de français : la fiche est toujours
// en français, l'interface suit la langue choisie.
import { ref, computed, watch, nextTick, onUnmounted } from 'vue'
import { estVide } from '../../utils/reponses'
import { chargerValeur, sauvegarder } from '../../utils'
import { creerRng, graineAleatoire } from '../../utils/hasard'
import { useTTS } from '../../composables/useTTS'
import { useI18n, contenu } from '../../i18n'
import ConfigExercice from '../../components/ConfigExercice.vue'
import ChoixReglage from '../../components/ChoixReglage.vue'
import QuestionJeu from '../../components/QuestionJeu.vue'
import ResultatsJeu from '../../components/ResultatsJeu.vue'
import SaisieReponse from '../../components/SaisieReponse.vue'
import TableauCorrection from '../../components/TableauCorrection.vue'
import { useReglages } from '../../composables/useReglages'
import { useFicheExercice } from '../../composables/useFicheExercice'
import { useJeu } from '../../composables/useJeu'
import DEFINITION, { corpusDe } from '../../exercices/dictee/definition'
import { INTERFACE, TEXTES } from '../../exercices/dictee/textes'
import { questions as genererQuestions, questionsFiche, verifier, phraseDe } from '../../exercices/dictee/generateur'
import { fiche as ficheDictee, nomCat } from '../../exercices/dictee/fiche'

const { t } = useI18n(INTERFACE)
// Réglages mémorisés, ajustés au changement de niveau (politique commune : src/composables/useReglages.js) ; contenu
// (fiche) : toujours en français
const { config, langueContenu } = useReglages(DEFINITION, 'dictee_config')
const T = contenu(TEXTES, () => langueContenu.value).t

const corpus = computed(() => corpusDe(config.value.niveau))
// CM1 et CM2 partagent un corpus : « CM »
const etiquetteNiveau = computed(() => (config.value.niveau.startsWith('cm') ? 'CM' : config.value.niveau.toUpperCase()))
const cleMistral = ref(!!localStorage.getItem('ep_mistral_key'))

// ── Voix ──
const { enLecture, lire, arreter } = useTTS()
const reponse = ref('')
const afficherIndice = ref(false)
function ecouter() {
  if (enLecture.value) { arreter(); return }
  const qu = q.value
  if (qu) lire(qu.phrase ?? qu.mot, { vitesse: config.value.vitesse })
}
const phraseAvecBlanc = computed(() => {
  const { phrase, mot } = q.value ?? {}
  if (!phrase || !mot) return phrase
  return phrase.replace(new RegExp(mot.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), '<span class="blank">___</span>')
})

// ── Phrases générées (clé Mistral des parents, facultative) : à défaut, celles de src/data/dicteeMots.js ──
async function genererPhrase(mot) {
  const apiKey = localStorage.getItem('ep_mistral_key') || ''
  if (!apiKey) return phraseDe(mot)
  try {
    const res = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'mistral-small-latest',
        messages: [{ role: 'user', content:
          `Tu es un assistant pédagogique pour enfants de CP (6-7 ans).\nGénère UNE SEULE phrase courte et simple en français (10 mots maximum) contenant l'expression "${mot}".\nRéponds UNIQUEMENT avec la phrase, sans guillemets ni explication.`
        }],
        temperature: 0.7, max_tokens: 60,
      }),
    })
    if (!res.ok) throw new Error()
    const data = await res.json()
    return data.choices?.[0]?.message?.content?.trim() || phraseDe(mot)
  } catch {
    return phraseDe(mot)
  }
}

// ── Jeu : un mot, ou une phrase, à la fois ; bonne réponse : mot suivant après 0,9 s ; erreur : la réponse est lue puis
// on continue après 2,4 s ; « Passer » enchaîne aussitôt ──
let preparees = []
const chargement = ref(false)
const jeu = useJeu({
  generer: () => preparees,
  verifier,
  messageErreur: (qu, rep) => (rep ? t('feedbackErr', { r: qu.attendu }) : ''),
  messageNuance: qu => `⚠️ ${t('accents', { r: qu.attendu })}`,
  surQuestion: () => { reponse.value = ''; afficherIndice.value = false; nextTick(ecouter) },
  delai: 900,
  apresErreur: 'continuer',
  delaiErreur: 2400,
})
const { phase, questions, q, bonnes, historique, retour, repondu, etat, cleFin } = jeu

async function commencer() {
  if (chargement.value) return  // empêche le double clic pendant la génération
  arreter()
  // mots récemment vus : repoussés en fin de liste, d'une séance à l'autre
  const cle = `dictee_vus_${config.value.mode}`
  const qs = genererQuestions({ niveau: config.value.niveau, reglages: config.value, rng: creerRng(graineAleatoire()), vus: chargerValeur(cle, []) })
  sauvegarder(cle, qs.map(x => x.mot))
  if (config.value.mode === 'phrases') {
    chargement.value = true
    const phrases = await Promise.all(qs.map(x => genererPhrase(x.mot)))
    qs.forEach((x, i) => { x.phrase = x.attendu = phrases[i] })
    chargement.value = false
  }
  preparees = qs
  jeu.demarrer()
}

function valider() {
  if (repondu.value || estVide(reponse.value)) return
  arreter()
  jeu.repondre({ texte: reponse.value }, { donne: reponse.value.trim() })
}
function passer() {
  if (repondu.value) return
  arreter()
  jeu.passer({ donne: t('passe') })
  jeu.suivante()
}

// après une erreur, la bonne réponse est lue
let relecture = null
watch(retour, r => {
  clearTimeout(relecture)
  if (r && !r.ok && r.message) relecture = setTimeout(() => lire(q.value.attendu, { vitesse: config.value.vitesse }), 600)
})
watch(phase, p => { if (p !== 'jeu') { arreter(); clearTimeout(relecture) } })
onUnmounted(() => { arreter(); clearTimeout(relecture) })

// ── Fiche imprimable : au moins une des deux pages ──
function basculerPage(p) {
  const autre = p === 'liste' ? 'dictee' : 'liste'
  if (config.value[p] && !config.value[autre]) return
  config.value[p] = !config.value[p]
}
const { mode, fiche, nouvelle } = useFicheExercice({
  tirer: rng => questionsFiche({ niveau: config.value.niveau, reglages: config.value, rng }),
  mettreEnPage: (x, police) => ficheDictee({ questions: x, T, langue: langueContenu.value, ...police }),
})
</script>

<style scoped>
.container { max-width: 640px; margin: 0 auto; padding: 1rem; }
.cle-opt { font-weight: 400; color: #aaa; font-size: .85em; }
.api-row { display: flex; gap: .5rem; align-items: center; flex-wrap: wrap; }
.api-ok { font-size: .8rem; font-weight: 700; color: var(--vert); }
.api-ok.aucune { color: #aaa; }
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
