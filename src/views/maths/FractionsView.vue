<template>
  <div class="container">
    <h1 class="section-heading">🍕 {{ t('titre') }}</h1>

    <!-- Config -->
    <ConfigExercice v-if="phase === 'config'" :config="config" v-model:mode="mode" :fiche="fiche"
      @commencer="jeu.demarrer" @regenerer="nouvelle">
      <ChoixReglage :definition="DEFINITION" cle="niveau" v-model="config.niveau" :titre="t('niveau')" />
      <ChoixReglage :definition="DEFINITION" :niveau="config.niveau" cle="types" v-model="config.types"
        :titre="t('exercices')" :libelle="ty => t(`type_${ty}`)" />
      <ChoixReglage :definition="DEFINITION" :niveau="config.niveau" cle="mode" v-model="config.mode"
        :titre="t('fractions')" :libelle="m => t(`mode_${m}`)" />
      <ChoixReglage v-if="mode === 'jouer'" :definition="DEFINITION" cle="nbQ" v-model="config.nbQ" :titre="t('nbQuestions')" />
      <ChoixReglage v-else :definition="DEFINITION" cle="nbFiche" v-model="config.nbFiche" :titre="t('nbQuestions')" />
    </ConfigExercice>

    <!-- Exercice -->
    <QuestionJeu v-if="phase === 'jeu' && q" :jeu="jeu">
      <div class="consigne">
        {{ q.consigne }}
        <span v-if="q.fracConsigne" class="frac frac-moyenne">
          <span>{{ q.fracConsigne.n }}</span><span>{{ q.fracConsigne.d }}</span>
        </span>
        <template v-if="q.consigneFin">{{ q.consigneFin }}</template>
      </div>

      <!-- Forme (affichée ou à colorier) -->
      <div v-if="q.forme" class="visuel">
        <svg :viewBox="q.forme.viewBox" :width="q.forme.largeur" class="forme-svg"
             :class="{ cliquable: q.kind === 'parts' && !repondu }">
          <path v-for="(part, i) in q.forme.parts" :key="i" :d="part"
                :fill="estColoriee(i) ? COULEUR : '#ffffff'" stroke="#2c3e50" stroke-width="2.5"
                stroke-linejoin="round" @click="basculerPart(i)"/>
        </svg>
        <div v-if="q.kind === 'parts'" class="aide">
          {{ t('aideColorier', { n: coloriees.length, total: q.forme.parts.length }) }}
        </div>
        <svg v-if="q.formeAide" :viewBox="q.formeAide.viewBox" :width="q.formeAide.largeur" class="forme-svg" style="display:block;margin:.5rem auto 0;">
          <path v-for="(part, i) in q.formeAide.parts" :key="i" :d="part" fill="#ffffff" stroke="#2c3e50" stroke-width="2.5"/>
        </svg>
      </div>

      <!-- Droite graduée : lecture -->
      <div v-if="q.svg" class="visuel" v-html="q.svg"></div>

      <!-- Droite graduée : placer en touchant une graduation (zones de touche : data-i) -->
      <div v-if="q.kind === 'placer'" class="visuel" v-html="droitePlacer" @click="cliqueDroite"></div>

      <!-- Jetons pour « la moitié de… » -->
      <div v-if="q.jetons" class="visuel" v-html="q.jetons"></div>

      <div v-if="q.fracAffichee" class="exercise-question">
        <span class="frac frac-grande"><span>{{ q.fracAffichee.n }}</span><span>{{ q.fracAffichee.d }}</span></span>
      </div>
      <div v-if="q.egalite" class="exercise-question">
        <span class="frac frac-grande"><span>{{ q.egalite.gauche.n }}</span><span>{{ q.egalite.gauche.d }}</span></span>
        <span style="margin:0 .75rem;">=</span>
        <span class="frac frac-grande"><span>{{ q.egalite.droite.n }}</span><span>{{ q.egalite.droite.d }}</span></span>
      </div>
      <div v-if="q.texte" class="exercise-question question-texte">{{ q.texte }}</div>

      <!-- Réponse : nombre -->
      <SaisieReponse v-if="q.kind === 'nombre'" v-model="reponse" type="nombre" class="exercise-input" :etat="etat"
        placeholder="?" :disabled="repondu" focus @entree="entree" />

      <!-- Réponse : QCM (fractions, lettres) -->
      <div v-else-if="q.kind === 'choix'" :class="{ 'choix-lettres': q.choixEn === 'lettres' }">
        <ChoixReponses :options="q.choix.map(c => ({ c }))" :bonne="q.choix.findIndex(c => cle(c) === cle(q.reponse))" :repondu="repondu"
          @choisir="choisirReponse">
          <template #default="{ option }">
            <span v-if="q.choixEn === 'frac'" class="frac frac-moyenne"><span>{{ option.c.n }}</span><span>{{ option.c.d }}</span></span>
            <span v-else>{{ enLettres(T, option.c) }}</span>
          </template>
        </ChoixReponses>
      </div>

      <div class="feedback" :class="etat">{{ retour?.message }}</div>

      <div class="btn-group" style="justify-content:center;margin-top:1rem;">
        <template v-if="!repondu">
          <button class="btn btn-ghost" @click="passer">{{ t('passer') }}</button>
          <button v-if="q.kind === 'parts'" class="btn btn-ghost" :disabled="!coloriees.length" @click="coloriees = []">{{ t('effacer') }}</button>
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
// Les fractions : la vue ne fait que les réglages et le rendu d'une question. Niveaux, générateur (un module par type
// de question), formes, droite graduée (dessin partagé) et fiche : src/exercices/fractions/.
import { ref, computed } from 'vue'
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
import DEFINITION from '../../exercices/fractions/definition'
import { INTERFACE, TEXTES } from '../../exercices/fractions/textes'
import { questions as genererQuestions, questionsFiche, verifier, cle, tn, enLettres, ordinal } from '../../exercices/fractions/generateur'
import { svgDroiteFraction } from '../../exercices/fractions/droite'
import { fiche as ficheFractions } from '../../exercices/fractions/fiche'

const { t } = useI18n(INTERFACE)
// Réglages mémorisés, ajustés au changement de niveau (politique commune : src/composables/useReglages.js) ; maths :
// le contenu (fractions en lettres, fiche) suit la langue de l'interface
const { config, langueContenu } = useReglages(DEFINITION, 'fractions_config')
const T = contenu(TEXTES, () => langueContenu.value).t

const COULEUR = '#f39c12'

// ── Jeu ──
const reponse = ref('')
const coloriees = ref([])
const placement = ref(null)

const jeu = useJeu({
  generer: rng => genererQuestions({ niveau: config.value.niveau, reglages: config.value, rng, T, nb: config.value.nbQ }),
  verifier,
  messageErreur: (q, rep) => (rep ? t('laBonne', { r: q.attendu }) : ''),
  delai: 900,
  // champs vidés ; le focus : SaisieReponse (attribut focus)
  surQuestion: () => { reponse.value = ''; coloriees.value = []; placement.value = null },
})
const { phase, questions, q, bonnes, historique, retour, repondu, etat, cleFin } = jeu

const estColoriee = i => (q.value.kind === 'parts' ? coloriees.value.includes(i) : q.value.colorees?.includes(i))

function basculerPart(i) {
  if (q.value.kind !== 'parts' || repondu.value) return
  coloriees.value = coloriees.value.includes(i) ? coloriees.value.filter(x => x !== i) : [...coloriees.value, i]
}

// droite à placer : flèche bleue posée par l'élève, puis verte (juste) ou rouge ; la bonne graduation est rappelée en vert
const droitePlacer = computed(() => {
  if (q.value?.kind !== 'placer') return ''
  const juste = q.value.reponse.n
  const fausse = repondu.value && placement.value !== juste
  const couleur = !repondu.value ? '#4a90e2' : fausse ? '#e74c3c' : '#5cb85c'
  return svgDroiteFraction(q.value.droite, { fleche: placement.value, couleur, juste: fausse ? juste : null, zones: !repondu.value })
})
function cliqueDroite(e) {
  const i = e.target.dataset?.i
  if (i !== undefined && !repondu.value) placement.value = +i
}

function choisirReponse(i) {
  const c = q.value.choix[i]
  jeu.repondre({ choix: c }, { donne: q.value.choixEn === 'lettres' ? enLettres(T, c) : cle(c) })
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
  } else if (qu.kind === 'placer') {
    if (placement.value === null) return
    jeu.repondre({ graduation: placement.value }, { donne: t('graduation', { o: ordinal(T, placement.value) }) })
  } else if (qu.kind === 'parts') {
    if (!coloriees.value.length) return
    const n = coloriees.value.length
    jeu.repondre({ parts: n }, { donne: tn(T, 'partsSur', n, { d: qu.reponse.d }) })
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
  mettreEnPage: (questions, police) => ficheFractions({ questions, reglages: config.value, T, langue: langueContenu.value, ...police }),
})
</script>

<style scoped>
.consigne {
  text-align: center; font-size: 1.2rem; font-weight: 700; color: #555; margin: .5rem 0;
  display: flex; align-items: center; justify-content: center; gap: .35rem; flex-wrap: wrap;
}
.visuel { text-align: center; margin: 1rem 0; }
.forme-svg { max-width: 100%; height: auto; }
.forme-svg.cliquable path { cursor: pointer; }
.forme-svg.cliquable path:hover { opacity: .85; }
.aide { font-size: .9rem; color: #777; margin-top: .3rem; }
.question-texte { font-size: 2rem; letter-spacing: 0; }

.frac {
  display: inline-flex; flex-direction: column; align-items: center; vertical-align: middle;
  font-weight: 900; line-height: 1.1;
}
.frac > span:first-child { border-bottom: 3px solid currentColor; padding: 0 .25em; }
.frac-grande  { font-size: 3rem; }
.frac-moyenne { font-size: 1.5rem; }

/* lecture en lettres : une proposition par ligne */
.choix-lettres :deep(.choix-grille) { grid-template-columns: 1fr; max-width: 360px; margin-left: auto; margin-right: auto; }
.btn:disabled { opacity: .45; cursor: default; }
</style>
