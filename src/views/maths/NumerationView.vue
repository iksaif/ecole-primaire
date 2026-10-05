<template>
  <div class="container">
    <h1 class="section-heading">🔢 {{ t('titre', { n: fmt(plageMax) }) }}</h1>

    <!-- Config -->
    <ConfigExercice v-if="phase === 'config'" :config="config" v-model:mode="mode" :fiche="fiche"
      @commencer="jeu.demarrer" @regenerer="nouvelle">
      <ChoixReglage :definition="DEFINITION" cle="niveau" v-model="config.niveau" :titre="t('niveau')" />
      <ChoixReglage :definition="DEFINITION" :niveau="config.niveau" cle="types" v-model="config.types"
        :titre="t('exercices')" :libelle="ty => t(`type_${ty}`)" />
      <ChoixReglage :definition="DEFINITION" :niveau="config.niveau" cle="plage" v-model="config.plage"
        :titre="t('nombresJusqua')" :libelle="fmt" />
      <ChoixReglage v-if="mode === 'jouer'" :definition="DEFINITION" cle="nbQ" v-model="config.nbQ" :titre="t('nbQuestions')" />
      <ChoixReglage v-else :definition="DEFINITION" cle="nbFiche" v-model="config.nbFiche" :titre="t('nbQuestions')" />
    </ConfigExercice>

    <!-- Exercice -->
    <QuestionJeu v-if="phase === 'jeu' && q" :jeu="jeu">
      <div class="consigne">{{ q.consigne }}</div>

      <div v-if="q.svg" class="visuel" v-html="q.svg"></div>
      <div v-if="q.type === 'representation'" class="legende">
        <template v-if="q.milliers">{{ t('legendeMillier') }} &nbsp;·&nbsp; </template>{{ t('legende') }}
      </div>

      <div v-if="q.texte" class="exercise-question" :class="{ 'question-lettres': q.texteLong }">{{ q.texte }}</div>

      <!-- Réponse : un nombre -->
      <SaisieReponse v-if="q.kind === 'nombre'" v-model="reponse" type="nombre" class="exercise-input" :etat="etat"
        placeholder="?" :disabled="repondu" focus @entree="entree" />

      <!-- Réponse : centaines / dizaines / unités -->
      <div v-else-if="q.kind === 'cdu'" class="cdu-row">
        <label v-for="(champ, ci) in q.champs" :key="champ" class="cdu-champ">
          <SaisieReponse :ref="el => setCduRef(el, ci)" v-model="cdu[champ]" type="texte" class="cdu-input"
            :etat="cduEtats[champ] ?? ''" inputmode="numeric" maxlength="1" :disabled="repondu" :focus="ci === 0"
            @input="onCduInput(ci)" @entree="entree" />
          <span class="cdu-label">{{ t(LIBELLES_CDU[champ]) }}</span>
        </label>
      </div>

      <!-- Réponse : choix (QCM, comparaison) -->
      <div v-else-if="q.kind === 'choix'" :class="{ 'choix-signes': q.type === 'comparer', 'choix-lettres': q.type === 'chiffresLettres' }">
        <ChoixReponses :options="q.choix.map(c => ({ label: c }))" :bonne="q.choix.indexOf(q.reponse)" :repondu="repondu"
          @choisir="i => jeu.repondre({ choix: q.choix[i] }, { donne: q.choix[i] })" />
      </div>

      <!-- Réponse : ranger dans l'ordre (clics successifs) -->
      <div v-else-if="q.kind === 'ordre'">
        <div class="ordre-ligne">
          <span v-for="(_, i) in q.nombres" :key="'s' + i" class="ordre-case"
            :class="repondu ? (ordre[i] === q.reponse[i] ? 'ok' : 'erreur') : ''">
            {{ ordre[i] !== undefined ? fmt(ordre[i]) : '' }}
          </span>
        </div>
        <div class="ordre-choix">
          <button v-for="n in q.nombres" :key="n" class="choix-btn"
            :disabled="repondu || ordre.includes(n)" @click="ajouterOrdre(n)">{{ fmt(n) }}</button>
        </div>
        <div style="text-align:center;margin-top:.5rem;">
          <button class="btn btn-ghost" :disabled="repondu || !ordre.length" @click="ordre.pop()">{{ t('annuler') }}</button>
        </div>
      </div>

      <div class="feedback" :class="feedbackClass">{{ feedback }}</div>

      <div class="btn-group" style="justify-content:center;margin-top:1rem;">
        <template v-if="!repondu">
          <button class="btn btn-ghost" @click="passer">{{ t('passer') }}</button>
          <button v-if="q.kind !== 'choix'" class="btn btn-primary" @click="valider">{{ t('valider') }}</button>
        </template>
        <button v-else-if="!retour.ok" class="btn btn-primary" @click="jeu.suivante">{{ t('suivant') }}</button>
      </div>
    </QuestionJeu>

    <!-- Résultats -->
    <ResultatsJeu v-if="phase === 'resultats'" :bonnes="bonnes" :total="questions.length" :cle-fin="cleFin"
      @rejouer="jeu.recommencer" @reglages="jeu.quitter">
      <TableauCorrection :historique="historique">
        <template #question="{ entree: h }">{{ h.question.libelle }}</template>
      </TableauCorrection>
    </ResultatsJeu>
  </div>
</template>

<script setup>
// Les nombres : la vue ne fait que les réglages et le rendu d'une question. Niveaux, générateur (un module par type
// de question) et fiche : src/exercices/numeration/.
import { ref, computed, nextTick } from 'vue'
import { useI18n, contenu } from '../../i18n'
import ConfigExercice from '../../components/ConfigExercice.vue'
import ChoixReglage from '../../components/ChoixReglage.vue'
import ChoixReponses from '../../components/ChoixReponses.vue'
import QuestionJeu from '../../components/QuestionJeu.vue'
import ResultatsJeu from '../../components/ResultatsJeu.vue'
import SaisieReponse from '../../components/SaisieReponse.vue'
import TableauCorrection from '../../components/TableauCorrection.vue'
import { useReglages } from '../../composables/useReglages'
import { useFicheExercice } from '../../composables/useFicheExercice'
import { useJeu } from '../../composables/useJeu'
import DEFINITION from '../../exercices/numeration/definition'
import { INTERFACE, TEXTES } from '../../exercices/numeration/textes'
import { questions as genererQuestions, questionsFiche, verifier, fmt, LIBELLES_CDU, libCdu } from '../../exercices/numeration/generateur'
import { fiche as ficheNumeration } from '../../exercices/numeration/fiche'

const { t } = useI18n(INTERFACE)
// Réglages mémorisés, ajustés au changement de niveau (politique commune : src/composables/useReglages.js) ; maths :
// le contenu (nombres en lettres, fiche) suit la langue de l'interface
const { config, langueContenu } = useReglages(DEFINITION, 'numeration_config')
const T = contenu(TEXTES, () => langueContenu.value).t

const plageMax = computed(() => DEFINITION.niveaux[config.value.niveau].options.plage.at(-1))

// ── Jeu ──
const reponse = ref('')
const cdu = ref({ milliers: '', centaines: '', dizaines: '', unites: '' })
const cduEtats = ref({})
const ordre = ref([])
const avis = ref('')          // « clique sur tous les nombres » : message, sans compter de réponse
const cduRefs = []

const jeu = useJeu({
  generer: rng => genererQuestions({ niveau: config.value.niveau, reglages: config.value, rng, T, nb: config.value.nbQ }),
  verifier,
  messageErreur: (q, rep) => (rep ? t('laBonne', { r: q.attendu }) : ''),
  delai: 900,
  // champs vidés ; le focus : SaisieReponse (attribut focus)
  surQuestion: () => {
    reponse.value = ''
    cdu.value = { milliers: '', centaines: '', dizaines: '', unites: '' }
    cduEtats.value = {}
    ordre.value = []
    avis.value = ''
  },
})
const { phase, questions, q, bonnes, historique, retour, repondu, etat, cleFin } = jeu

const feedback = computed(() => retour.value?.message ?? avis.value)
const feedbackClass = computed(() => etat.value || '')

function setCduRef(el, ci) { if (el) cduRefs[ci] = el }
// un chiffre par case, puis la case suivante
function onCduInput(ci) {
  nextTick(() => {
    const champ = q.value.champs[ci]
    const v = String(cdu.value[champ] ?? '').replace(/\D/g, '').slice(-1)
    cdu.value[champ] = v
    if (v && ci + 1 < q.value.champs.length) cduRefs[ci + 1]?.focus()
  })
}

function ajouterOrdre(n) {
  if (repondu.value || ordre.value.includes(n)) return
  ordre.value.push(n)
  avis.value = ''
}

function entree() {
  if (!repondu.value) valider()
  else if (!retour.value.ok) jeu.suivante()
}

function valider() {
  if (repondu.value) return
  const qu = q.value
  if (qu.kind === 'nombre') {
    const val = String(reponse.value).trim()
    if (val === '') return
    jeu.repondre({ texte: val }, { donne: val })
  } else if (qu.kind === 'cdu') {
    if (qu.champs.some(ch => cdu.value[ch] === '')) return
    cduEtats.value = Object.fromEntries(qu.champs.map(ch => [ch, +cdu.value[ch] === qu.reponse[ch] ? 'ok' : 'erreur']))
    jeu.repondre({ cdu: { ...cdu.value } }, { donne: qu.champs.map(ch => libCdu(T, +cdu.value[ch], ch)).join(' ') })
  } else if (qu.kind === 'ordre') {
    if (ordre.value.length < qu.nombres.length) { avis.value = t('cliqueTous'); return }
    jeu.repondre({ ordre: [...ordre.value] }, { donne: ordre.value.map(fmt).join(' < ') })
  }
}

// passer : la question compte comme une erreur, et on enchaîne aussitôt
function passer() {
  if (repondu.value) return
  jeu.passer({ donne: t('passe') })
  jeu.suivante()
}

// ── Fiche imprimable (aperçu + impression gérés par ConfigExercice) : graine du lien, sinon tirée ──
const { mode, fiche, nouvelle } = useFicheExercice({
  tirer: rng => questionsFiche({ niveau: config.value.niveau, reglages: config.value, rng, T }),
  mettreEnPage: (questions, police) => ficheNumeration({ questions, reglages: config.value, T, langue: langueContenu.value, ...police }),
})
</script>

<style scoped>
.consigne {
  text-align: center; font-size: 1.15rem; font-weight: 700; color: #555; margin: .5rem 0;
}
.visuel { text-align: center; margin: 1rem 0; overflow-x: auto; }
.legende { text-align: center; font-size: .9rem; color: #777; margin-bottom: .5rem; }
.question-lettres { font-size: 1.8rem; letter-spacing: 0; line-height: 1.3; }

.cdu-row { display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap; margin: 1rem 0; }
.cdu-champ { display: flex; flex-direction: column; align-items: center; gap: .3rem; }
.cdu-input {
  width: 4rem; height: 4rem; font-size: 2.2rem; font-weight: 800; text-align: center;
  border: 3px solid var(--gris-brd); border-radius: var(--radius); outline: none; background: white;
}
.cdu-input:focus  { border-color: var(--bleu); }
.cdu-input.ok     { border-color: var(--vert); background: #f0faf0; }
.cdu-input.erreur { border-color: var(--rouge); background: #fef0f0; }
.cdu-label { font-weight: 700; color: #666; }

/* comparer : trois grands signes ; écriture en lettres : une proposition par ligne */
.choix-signes :deep(.choix-grille) { grid-template-columns: repeat(3, 1fr); }
.choix-signes :deep(.choix-btn) { font-size: 2.2rem; }
.choix-lettres :deep(.choix-grille) { grid-template-columns: 1fr; max-width: 420px; margin-left: auto; margin-right: auto; }

.ordre-ligne { display: flex; justify-content: center; gap: .5rem; flex-wrap: wrap; margin: 1rem 0; }
.ordre-case {
  min-width: 4.2rem; height: 3.2rem; display: inline-flex; align-items: center; justify-content: center;
  font-size: 1.4rem; font-weight: 800; border: 3px dashed var(--gris-brd); border-radius: 8px;
}
.ordre-case.ok     { border: 3px solid var(--vert); background: #f0faf0; }
.ordre-case.erreur { border: 3px solid var(--rouge); background: #fef0f0; }
.ordre-choix { display: flex; flex-wrap: wrap; gap: .75rem; justify-content: center; margin: 1rem 0; }
.choix-btn {
  min-width: 4.5rem; min-height: 3.5rem; padding: .5rem 1.2rem;
  font-size: 1.5rem; font-weight: 800; background: white; color: var(--texte);
  border: 3px solid var(--gris-brd); border-radius: var(--radius); cursor: pointer;
  transition: border-color .15s, background .15s;
}
.choix-btn:hover:not(:disabled) { border-color: var(--bleu); }
.choix-btn:disabled { opacity: .45; cursor: default; }
.btn:disabled { opacity: .45; cursor: default; }
</style>
