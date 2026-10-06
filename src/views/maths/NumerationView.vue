<template>
  <div class="container">
    <h1 class="section-heading">🔢 {{ t('numeration.titrePlage', { n: fmt(plageMax) }) }}</h1>

    <!-- Config -->
    <CadreExercice v-if="phase === 'config'" v-model:mode="mode" :fiche="fiche" :config="config"
      @commencer="jeu.demarrer" @regenerer="nouvelle">
      <template #default="{ mode: modeCourant }">
        <ChoixReglage :definition="DEFINITION" cle="niveau" v-model="config.niveau" :titre="t('communs.niveau')" />
        <ChoixReglage :definition="DEFINITION" :niveau="config.niveau" cle="types" v-model="config.types"
          :titre="t('communs.exercices')" :libelle="ty => t(`numeration.type_${ty}`)" />
        <ChoixReglage :definition="DEFINITION" :niveau="config.niveau" cle="plage" v-model="config.plage"
          :titre="t('numeration.nombresJusqua')" :libelle="fmt" />
        <ChoixReglage v-if="modeCourant === 'jouer'" :definition="DEFINITION" cle="nbQ" v-model="config.nbQ" :titre="t('communs.nbQuestions')" />
        <ChoixReglage v-else :definition="DEFINITION" cle="nbFiche" v-model="config.nbFiche" :titre="t('communs.nbQuestions')" />
      </template>
    </CadreExercice>

    <!-- Exercice -->
    <QuestionJeu v-if="phase === 'jeu' && q" :jeu="jeu">
      <div class="consigne">{{ q.consigne }}</div>

      <div v-if="q.kind === 'nombre' && q.svg" class="visuel" v-html="q.svg"></div>
      <div v-if="q.type === 'representation'" class="legende">
        <template v-if="q.kind === 'nombre' && q.milliers">{{ t('numeration.legendeMillier') }} &nbsp;·&nbsp; </template>{{ t('numeration.legende') }}
      </div>

      <div v-if="q.texte" class="exercise-question" :class="{ 'question-lettres': q.texteLong }">{{ q.texte }}</div>

      <!-- Réponse : un nombre -->
      <SaisieReponse v-if="q.kind === 'nombre'" v-model="reponse" type="nombre" class="exercise-input" :etat="etat"
        placeholder="?" :disabled="repondu" focus aria-describedby="numeration-retour" @entree="entree" />

      <!-- Réponse : centaines / dizaines / unités -->
      <div v-else-if="q.kind === 'cdu'" class="cdu-row">
        <label v-for="(champ, ci) in q.champs" :key="champ" class="cdu-champ">
          <SaisieReponse :ref="el => setCduRef(el, ci)" v-model="cdu[champ]" type="texte" class="cdu-input"
            :etat="cduEtats[champ] ?? ''" inputmode="numeric" maxlength="1" :disabled="repondu" :focus="ci === 0"
            :libelle="T(LIBELLES_CDU[champ])" aria-describedby="numeration-retour"
            @input="onCduInput(ci)" @entree="entree" />
          <span class="cdu-label" aria-hidden="true">{{ T(LIBELLES_CDU[champ]) }}</span>
        </label>
      </div>

      <!-- Réponse : choix (QCM, comparaison) -->
      <div v-else-if="q.kind === 'choix'" :class="{ 'choix-signes': q.type === 'comparer', 'choix-lettres': q.type === 'chiffresLettres' }">
        <ChoixReponses :options="q.choix.map(c => ({ label: c }))" :bonne="q.choix.indexOf(q.reponse)" :repondu="repondu" :titre="q.consigne"
          @choisir="choisir" />
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
          <button v-for="n in q.nombres" :key="n" type="button" class="choix-btn"
            :disabled="repondu || ordre.includes(n)" @click="ajouterOrdre(n)">{{ fmt(n) }}</button>
        </div>
        <div style="text-align:center;margin-top:.5rem;">
          <button type="button" class="btn btn-ghost" :disabled="repondu || !ordre.length" @click="ordre.pop()">{{ t('communs.annuler') }}</button>
        </div>
      </div>

      <RetourReponse id="numeration-retour" :message="feedback" :etat="feedbackClass" />

      <div class="btn-group" style="justify-content:center;margin-top:1rem;">
        <template v-if="!repondu">
          <button type="button" class="btn btn-ghost" @click="passer">{{ t('numeration.passer') }}</button>
          <button v-if="q.kind !== 'choix'" type="button" class="btn btn-primary" @click="valider">{{ t('communs.valider') }}</button>
        </template>
        <button v-else-if="!retour?.ok" type="button" class="btn btn-primary" @click="jeu.suivante">{{ t('communs.suivant') }}</button>
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

<script setup lang="ts">
// Les nombres : la vue ne fait que les réglages et le rendu d'une question. Niveaux, générateur (un module par type de question)
// et fiche : src/exercices/numeration/ ; le matériel et la droite graduée : src/dessins/.
import { ref, computed, nextTick } from 'vue'
import { useLangue } from '../../langues/useLangue.ts'
import { traducteur } from '../../langues/catalogue.ts'
import CadreExercice from '../../noyau/CadreExercice.vue'
import ChoixReglage from '../../noyau/ChoixReglage.vue'
import ChoixReponses from '../../noyau/ChoixReponses.vue'
import QuestionJeu from '../../noyau/QuestionJeu.vue'
import ResultatsJeu from '../../noyau/ResultatsJeu.vue'
import RetourReponse from '../../noyau/RetourReponse.vue'
import SaisieReponse from '../../noyau/SaisieReponse.vue'
import TableauCorrection from '../../noyau/TableauCorrection.vue'
import { useReglages } from '../../noyau/useReglages.ts'
import { useFicheExercice } from '../../noyau/useFicheExercice.ts'
import { useJeu } from '../../noyau/useJeu.ts'
import DEFINITION from '../../exercices/numeration/definition.ts'
import { CONTENU } from '../../exercices/numeration/textes.ts'
import { questions as tirer, questionsFiche, verifier, fmt, LIBELLES_CDU, libCdu } from '../../exercices/numeration/generateur.ts'
import type { Champ, Question, Reponse } from '../../exercices/numeration/generateur.ts'
import { fiche as ficheNumeration } from '../../exercices/numeration/fiche.ts'

const { t } = useLangue()
// Réglages mémorisés, ajustés au changement de niveau ; maths : le contenu (nombres en lettres, fiche) suit la langue de l'interface
const { config, langueContenu } = useReglages(DEFINITION)
// T : les textes du contenu (CONTENU, textes.ts : consignes, noms des unités), dans la langue du contenu
const T = traducteur(CONTENU, () => langueContenu.value)

const plageMax = computed(() => DEFINITION.niveaux[config.value.niveau]?.options?.plage?.at(-1) ?? 100)

// ── Jeu ──
const VIDE: Record<Champ, string> = { milliers: '', centaines: '', dizaines: '', unites: '' }
const reponse = ref<string | number>('')
const cdu = ref<Record<Champ, string>>({ ...VIDE })
const cduEtats = ref<Partial<Record<Champ, string>>>({})
const ordre = ref<number[]>([])
const avis = ref('')          // « clique sur tous les nombres » : message, sans compter de réponse
const cduRefs: ({ focus: () => void } | null)[] = []

const jeu = useJeu<Question, Reponse>({
  generer: rng => tirer({ niveau: config.value.niveau, reglages: config.value, rng, T, nb: config.value.nbQ }),
  verifier,
  messageErreur: (q, rep) => (rep ? t('numeration.laBonne', { r: q.attendu }) : ''),
  delai: 900,
  // champs vidés ; le focus : SaisieReponse (attribut focus)
  surQuestion: () => {
    reponse.value = ''
    cdu.value = { ...VIDE }
    cduEtats.value = {}
    ordre.value = []
    avis.value = ''
  },
})
const { phase, questions, q, bonnes, historique, retour, repondu, etat, cleFin } = jeu

const feedback = computed(() => retour.value?.message ?? avis.value)
const feedbackClass = computed(() => etat.value || '')

function setCduRef(el: unknown, ci: number) { if (el) cduRefs[ci] = el as { focus: () => void } }
// un chiffre par case, puis la case suivante
function onCduInput(ci: number) {
  nextTick(() => {
    const qu = q.value
    if (qu?.kind !== 'cdu') return
    const champ = qu.champs[ci]
    const v = String(cdu.value[champ] ?? '').replace(/\D/g, '').slice(-1)
    cdu.value[champ] = v
    if (v && ci + 1 < qu.champs.length) cduRefs[ci + 1]?.focus()
  })
}

// une proposition choisie (QCM, comparaison)
function choisir(i: number) {
  const qu = q.value
  if (qu?.kind !== 'choix') return
  jeu.repondre({ choix: qu.choix[i] }, { donne: qu.choix[i] })
}

function ajouterOrdre(n: number) {
  if (repondu.value || ordre.value.includes(n)) return
  ordre.value.push(n)
  avis.value = ''
}

function entree() {
  if (!repondu.value) valider()
  else if (!retour.value?.ok) jeu.suivante()
}

function valider() {
  if (repondu.value) return
  const qu = q.value
  if (!qu) return
  if (qu.kind === 'nombre') {
    const val = String(reponse.value).trim()
    if (val === '') return
    jeu.repondre({ texte: val }, { donne: val })
  } else if (qu.kind === 'cdu') {
    if (qu.champs.some(ch => cdu.value[ch] === '')) return
    cduEtats.value = Object.fromEntries(qu.champs.map(ch => [ch, +cdu.value[ch] === qu.reponse[ch] ? 'ok' : 'erreur']))
    jeu.repondre({ cdu: { ...cdu.value } }, { donne: qu.champs.map(ch => libCdu(T, +cdu.value[ch], ch)).join(' ') })
  } else if (qu.kind === 'ordre') {
    if (ordre.value.length < qu.nombres.length) { avis.value = t('numeration.cliqueTous'); return }
    jeu.repondre({ ordre: [...ordre.value] }, { donne: ordre.value.map(fmt).join(' < ') })
  }
}

// passer : la question compte comme une erreur, et on enchaîne aussitôt
function passer() {
  if (repondu.value) return
  jeu.passer({ donne: t('numeration.passe') })
  jeu.suivante()
}

// ── Fiche imprimable (aperçu et impression : CadreExercice) : graine du lien, sinon tirée ──
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
