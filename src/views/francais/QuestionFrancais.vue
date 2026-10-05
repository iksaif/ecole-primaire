<template>
  <!--
    Une question de grammaire ou de vocabulaire (useJeu), dans la boîte de <QuestionJeu> : consigne (et 🔊), phrase,
    réponse selon le mode de la question, retour avec l'explication, « Suivant ».
      <QuestionJeu v-if="phase === 'jeu' && q" :jeu="jeu"><QuestionFrancais :jeu="jeu" :t="t" :libelle="tc" /></QuestionJeu>
    q.mode : 'choix' (<ChoixReponses>, q.options / q.bonne), 'clic' (cliquer des mots : q.tokens / q.cibles),
    'ordre' (étiquettes à remettre dans l'ordre, <EtiquettesOrdre>), 'saisie' (champ, q.attendu). consigne, html,
    explication et solution : texte, ou fonction de t (langue de l'interface). Les réponses données à jeu.repondre sont
    celles que lit `verifier` : { choix }, { selection }, { ordre }, { texte }.
    Textes lus dans le catalogue de la vue (t) : ecouterPhrase, cliqueEtiquettes, effacerOrdre, ecrisReponse, validerCourt,
    suivantFleche ; communs : valider, voirResultats.
  -->
  <div v-if="q.consigne" class="consigne">
    {{ valeur(q.consigne) }}
    <button v-if="q.lecture" class="btn-tts" :class="{ actif: enLecture }" :title="t('ecouterPhrase')" :aria-label="t('ecouterPhrase')"
      @click="lire(q.lecture)">🔊</button>
  </div>

  <div v-if="q.html" class="phrase-display" :class="variante" v-html="valeur(q.html)"></div>

  <ChoixReponses v-if="q.mode === 'choix'" :options="q.options" :bonne="q.bonne" :repondu="repondu" :colonne="q.colonne"
    @choisir="choisir">
    <template #default="{ option }">{{ libelle(option.label) }}</template>
  </ChoixReponses>

  <template v-else-if="q.mode === 'clic'">
    <div class="mots-ligne">
      <template v-for="(tok, i) in q.tokens" :key="i">
        <span v-if="tok.n === 'ponct'" class="mot-ponct" :class="{ colle: tok.m === '.' || tok.m === ',' }">{{ tok.m }}</span>
        <button v-else class="mot-btn" :class="[motClass(i), { elide: tok.m.endsWith('\'') }]" :disabled="repondu"
          @click="basculerMot(i)">{{ tok.m }}</button>
      </template>
    </div>
    <div v-if="!repondu" class="actions">
      <button class="btn btn-primary" :disabled="selection.length === 0" @click="validerClic">{{ t('valider') }}</button>
    </div>
  </template>

  <EtiquettesOrdre v-else-if="q.mode === 'ordre'" :etiquettes="q.etiquettes" :fin="q.fin" :separateur="q.separateur" :repondu="repondu"
    :etat="etat" :vide="t('cliqueEtiquettes')" :effacer="t('effacerOrdre')" :valider="t('valider')" @valider="validerOrdre" />

  <div v-else-if="q.mode === 'saisie'" class="saisie-row">
    <SaisieReponse v-model="saisie" class="saisie-input" :etat="etat" :disabled="repondu" focus :placeholder="q.indice || t('ecrisReponse')"
      @entree="validerSaisie" />
    <button v-if="!repondu" class="btn btn-primary" @click="validerSaisie">{{ t('validerCourt') }}</button>
  </div>

  <div v-if="repondu" class="feedback" :class="etat" v-html="retourHtml"></div>
  <div v-if="repondu" class="actions">
    <button class="btn btn-primary" @click="jeu.suivante">{{ index + 1 < questions.length ? t('suivantFleche') : t('voirResultats') }}</button>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import ChoixReponses from '../../components/ChoixReponses.vue'
import SaisieReponse from '../../components/SaisieReponse.vue'
import EtiquettesOrdre from './EtiquettesOrdre.vue'
import { useTTS } from '../../composables/useTTS'

const props = defineProps({
  // l'objet rendu par useJeu()
  jeu: { type: Object, required: true },
  // t de la vue (langue de l'interface) : textes d'interface, et argument des textes calculés de la question
  t: { type: Function, required: true },
  // libellé d'une proposition (Grammaire : traduit les mots de métalangage ; Vocabulaire : sens propre / figuré)
  libelle: { type: Function, default: x => x },
  // style de la phrase : 'grammaire' (défaut) ou 'vocabulaire'
  variante: { type: String, default: 'grammaire' },
})
const { q, repondu, retour, etat, index, questions } = props.jeu
const { enLecture, lire } = useTTS()

// texte fixe, ou fonction de t (suit la langue de l'interface)
const valeur = x => (typeof x === 'function' ? x(props.t) : x)

// ── réponses ──
const selection = ref([])
const saisie = ref('')
watch(q, () => { selection.value = []; saisie.value = '' })

const choisir = i => props.jeu.repondre({ choix: i }, { donne: props.libelle(q.value.options[i].label) })

function basculerMot(i) {
  if (repondu.value) return
  selection.value = selection.value.includes(i) ? selection.value.filter(x => x !== i) : [...selection.value, i]
}
function motClass(i) {
  const sel = selection.value.includes(i)
  if (!repondu.value) return sel ? 'choisi' : ''
  const cible = q.value.cibles.includes(i)
  if (cible && sel) return 'bonne'
  if (cible) return 'manquee'
  if (sel) return 'mauvaise'
  return ''
}
function validerClic() {
  if (repondu.value || selection.value.length === 0) return
  const sel = [...selection.value].sort((a, b) => a - b)
  props.jeu.repondre({ selection: sel }, { donne: sel.map(i => q.value.tokens[i].m).join(', ') })
}

function validerOrdre(ordre) {
  const phrase = ordre.map(k => q.value.etiquettes[k]).join(q.value.separateur ? ` ${q.value.separateur} ` : ' ')
  props.jeu.repondre({ ordre }, { donne: phrase + (q.value.fin ?? '') })
}

function validerSaisie() {
  if (repondu.value || !saisie.value.trim()) return
  props.jeu.repondre({ texte: saisie.value }, { donne: saisie.value.trim() })
}

// retour : « Bravo ! » ou la bonne réponse (message de la vue), puis l'explication de la question
const retourHtml = computed(() => {
  const expl = q.value.explication ? `<div class="fb-expl">${valeur(q.value.explication)}</div>` : ''
  return (retour.value?.message ?? '') + expl
})
</script>

<style scoped>
.consigne {
  font-weight: 700; color: #555; text-align: center; margin-bottom: 1rem;
  display: flex; align-items: center; justify-content: center; gap: .5rem; flex-wrap: wrap;
}
.btn-tts {
  background: #eef5ff; border: 2px solid var(--bleu); border-radius: 50%;
  width: 2.2rem; height: 2.2rem; cursor: pointer; font-size: 1rem;
}
.btn-tts.actif { background: var(--bleu); }

.phrase-display {
  font-size: 1.4rem; font-weight: 600; text-align: center;
  margin-bottom: 1.5rem; line-height: 1.6; color: #222;
}
.phrase-display :deep(u) { text-decoration-thickness: 3px; text-decoration-color: var(--bleu); text-underline-offset: 4px; }
.phrase-display :deep(strong) { color: var(--bleu); }
.phrase-display :deep(em) { color: #888; font-weight: 400; font-size: .9em; }
.phrase-display :deep(.sens) { font-size: 1rem; color: #666; font-weight: 600; margin-top: .3rem; }
.phrase-display.vocabulaire { font-size: 1.5rem; font-weight: 700; line-height: 1.5; }
.phrase-display.vocabulaire :deep(em) { font-style: normal; font-weight: 600; font-size: 1.15rem; color: inherit; }
:deep(.trou) { color: #bbb; font-weight: 400; }

/* Mots cliquables */
.mots-ligne { display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: .45rem .3rem; font-size: 1.35rem; }
.mot-btn {
  font-size: inherit; font-family: inherit; font-weight: 600;
  padding: .2rem .5rem; border-radius: 8px; border: 2px dashed #cfd8e3;
  background: white; cursor: pointer; color: var(--texte); transition: all .12s;
}
.mot-btn.elide { margin-right: -.3rem; }
.mot-btn:hover:not(:disabled) { border-color: var(--bleu); }
.mot-btn.choisi  { border-style: solid; border-color: var(--bleu); background: #eef5ff; }
.mot-btn.bonne   { border-style: solid; border-color: #22c55e; background: #dcfce7; color: #15803d; }
.mot-btn.manquee { border-style: solid; border-color: #22c55e; color: #15803d; }
.mot-btn.mauvaise { border-style: solid; border-color: var(--rouge); background: #fff5f5; color: var(--rouge); text-decoration: line-through; }
.mot-btn:disabled { cursor: default; }
.mot-ponct { font-weight: 700; }
.mot-ponct.colle { margin-left: -.25rem; }

.saisie-row { display: flex; gap: .5rem; justify-content: center; margin-bottom: 1rem; flex-wrap: wrap; }
.saisie-input {
  border: 2px solid #ccc; border-radius: 8px;
  padding: .5rem .9rem; font-size: 1.15rem; font-family: inherit; width: 16rem; max-width: 100%;
}
.saisie-input:focus { outline: none; border-color: var(--bleu); }
.saisie-input.ok     { border-color: #22c55e; background: #f0fdf4; color: #15803d; }
.saisie-input.presque { border-color: var(--orange); background: #fff8ec; color: #9a5b00; }
.saisie-input.erreur { border-color: var(--rouge); background: #fff5f5; color: var(--rouge); }

.feedback { border-radius: 8px; margin-top: .75rem; font-size: 1.05rem; }
.feedback.ok     { background: #f0fdf4; }
.feedback.presque { background: #fff8ec; }
.feedback.erreur { background: #fff5f5; }
.feedback :deep(.fb-expl) { font-weight: 600; font-size: .92rem; color: #555; margin-top: .3rem; }
.actions { display: flex; justify-content: center; margin-top: 1rem; }
</style>
