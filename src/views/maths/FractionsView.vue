<template>
  <div class="container">
    <h1 class="section-heading">{{ DEFINITION.emoji }} {{ t('fractions.titre') }}</h1>

    <CadreExercice v-if="phase === 'config'" v-model:mode="mode" :fiche="fiche" :config="config"
      @commencer="jeu.demarrer" @regenerer="nouvelle">
      <ChoixReglage :definition="DEFINITION" cle="niveau" v-model="config.niveau" :titre="t('communs.niveau')" />
      <ChoixReglage :definition="DEFINITION" :niveau="config.niveau" cle="types" v-model="config.types"
        :titre="t('communs.exercices')" :libelle="ty => t(`fractions.types.${ty}`)" />
      <ChoixReglage :definition="DEFINITION" :niveau="config.niveau" cle="mode" v-model="config.mode"
        :titre="t('fractions.fractions')" :libelle="m => t(`fractions.modes.${m}`)" />
      <ChoixReglage v-if="mode === 'jouer'" :definition="DEFINITION" cle="nbQ" v-model="config.nbQ" :titre="t('communs.nbQuestions')" />
      <ChoixReglage v-else :definition="DEFINITION" cle="nbFiche" v-model="config.nbFiche" :titre="t('communs.nbQuestions')" />
    </CadreExercice>

    <QuestionJeu v-if="phase === 'jeu' && q" :jeu="jeu">
      <div class="consigne">
        {{ q.consigne }}
        <span v-if="q.fracConsigne" class="frac frac-moyenne">
          <span>{{ q.fracConsigne.n }}</span><span>{{ q.fracConsigne.d }}</span>
        </span>
        <template v-if="q.consigneFin">{{ q.consigneFin }}</template>
      </div>

      <!-- Forme (affichée ou à colorier) -->
      <div v-if="forme" class="visuel">
        <svg :viewBox="forme.viewBox" :width="forme.largeur" class="forme-svg" role="img" :aria-label="T(forme.type)"
             :class="{ cliquable: q.kind === 'parts' && !repondu }">
          <path v-for="(part, i) in forme.parts" :key="i" :d="part"
                :fill="estColoriee(i) ? COULEUR : '#ffffff'" stroke="#2c3e50" stroke-width="2.5"
                stroke-linejoin="round" @click="basculerPart(i)"/>
        </svg>
        <div v-if="q.kind === 'parts'" class="aide">
          {{ t('fractions.aideColorier', { n: coloriees.length, total: forme.parts.length }) }}
        </div>
        <svg v-if="formeAide" :viewBox="formeAide.viewBox" :width="formeAide.largeur" class="forme-svg" style="display:block;margin:.5rem auto 0;">
          <path v-for="(part, i) in formeAide.parts" :key="i" :d="part" fill="#ffffff" stroke="#2c3e50" stroke-width="2.5"/>
        </svg>
      </div>

      <!-- Droite graduée : lecture -->
      <div v-if="q.kind === 'choix' && q.svg" class="visuel" v-html="q.svg"></div>

      <!-- Droite graduée : placer en touchant une graduation (zones de touche : data-i) -->
      <div v-if="q.kind === 'placer'" class="visuel" v-html="droitePlacer" @click="cliqueDroite"></div>

      <!-- Jetons pour « la moitié de… » -->
      <div v-if="q.kind === 'nombre' && q.jetons" class="visuel" v-html="q.jetons"></div>

      <div v-if="q.kind === 'choix' && q.fracAffichee" class="exercise-question">
        <span class="frac frac-grande"><span>{{ q.fracAffichee.n }}</span><span>{{ q.fracAffichee.d }}</span></span>
      </div>
      <div v-if="q.kind === 'nombre' && q.egalite" class="exercise-question">
        <span class="frac frac-grande"><span>{{ q.egalite.gauche.n }}</span><span>{{ q.egalite.gauche.d }}</span></span>
        <span style="margin:0 .75rem;">=</span>
        <span class="frac frac-grande"><span>{{ q.egalite.droite.n }}</span><span>{{ q.egalite.droite.d }}</span></span>
      </div>
      <div v-if="(q.kind === 'choix' || q.kind === 'nombre') && q.texte" class="exercise-question question-texte">{{ q.texte }}</div>

      <!-- Réponse : nombre -->
      <SaisieReponse v-if="q.kind === 'nombre'" v-model="reponse" type="nombre" class="exercise-input" :etat="etat"
        placeholder="?" :disabled="repondu" focus @entree="entree" />

      <!-- Réponse : QCM (fractions, lettres) -->
      <div v-else-if="q.kind === 'choix'" :class="{ 'choix-lettres': q.choixEn === 'lettres' }">
        <ChoixReponses :options="optionsChoix" :bonne="bonneChoix" :repondu="repondu"
          :titre="q.consigne" @choisir="choisirReponse">
          <template #default="{ option }">
            <span v-if="q.choixEn === 'frac'" class="frac frac-moyenne"><span>{{ option.c.n }}</span><span>{{ option.c.d }}</span></span>
            <span v-else>{{ enLettres(T, option.c) }}</span>
          </template>
        </ChoixReponses>
      </div>

      <RetourReponse :message="retour?.message" :etat="etat" />

      <div class="btn-group" style="justify-content:center;margin-top:1rem;">
        <template v-if="!repondu">
          <button type="button" class="btn btn-ghost" @click="passer">{{ t('fractions.passer') }}</button>
          <button v-if="q.kind === 'parts'" type="button" class="btn btn-ghost" :disabled="!coloriees.length" @click="coloriees = []">{{ t('fractions.effacer') }}</button>
          <button v-if="q.kind !== 'choix'" type="button" class="btn btn-primary" @click="valider">{{ t('communs.valider') }}</button>
        </template>
        <BoutonSuivant v-else :jeu="jeu" />
      </div>
    </QuestionJeu>

    <ResultatsJeu v-if="phase === 'resultats'" :bonnes="bonnes" :total="questions.length" :cle-fin="cleFin"
      @rejouer="jeu.recommencer" @reglages="jeu.quitter">
      <TableauCorrection :historique="historique">
        <template #question="{ entree: h }">{{ h.question.libelle }}</template>
      </TableauCorrection>
    </ResultatsJeu>
  </div>
</template>

<script setup lang="ts">
// Les fractions : la vue ne fait que les réglages et le rendu d'une question. Niveaux, générateur (un module par type de question),
// formes, droite graduée (dessin partagé : src/dessins/droite.ts) et fiche : src/exercices/fractions/.
import { ref, computed } from 'vue'
import { useLangue } from '../../langues/useLangue.ts'
import { traducteur } from '../../langues/catalogue.ts'
import CadreExercice from '../../noyau/CadreExercice.vue'
import ChoixReglage from '../../noyau/ChoixReglage.vue'
import ChoixReponses from '../../noyau/ChoixReponses.vue'
import QuestionJeu from '../../noyau/QuestionJeu.vue'
import BoutonSuivant from '../../noyau/BoutonSuivant.vue'
import RetourReponse from '../../noyau/RetourReponse.vue'
import ResultatsJeu from '../../noyau/ResultatsJeu.vue'
import SaisieReponse from '../../noyau/SaisieReponse.vue'
import TableauCorrection from '../../noyau/TableauCorrection.vue'
import { useReglages } from '../../noyau/useReglages.ts'
import { useFicheExercice } from '../../noyau/useFicheExercice.ts'
import { useJeu } from '../../noyau/useJeu.ts'
import DEFINITION from '../../exercices/fractions/definition.ts'
import { CONTENU } from '../../exercices/fractions/textes.ts'
import { questions as tirer, questionsFiche, verifier, cle, enLettres, ordinal } from '../../exercices/fractions/generateur.ts'
import type { Question, Reponse } from '../../exercices/fractions/generateur.ts'
import type { QChoix } from '../../exercices/fractions/questions.ts'
import { svgDroiteFraction } from '../../exercices/fractions/droite.ts'
import { fiche as ficheFractions } from '../../exercices/fractions/fiche.ts'

const { t } = useLangue()
// Réglages mémorisés, ajustés au changement de niveau (useReglages) ; le contenu (fractions en lettres, fiche) suit la langue de l'interface
const { config, langueContenu } = useReglages(DEFINITION)
const T = traducteur(CONTENU, () => langueContenu.value)

const COULEUR = '#f39c12'

// ── Jeu ──
const reponse = ref<string | number>('')
const coloriees = ref<number[]>([])
const placement = ref<number | null>(null)

const jeu = useJeu<Question, Reponse>({
  generer: rng => tirer({ niveau: config.value.niveau, reglages: config.value, rng, T, nb: config.value.nbQ }),
  verifier,
  messageErreur: (q, rep) => (rep ? t('fractions.laBonne', { r: q.attendu }) : ''),
  delai: 900,
  // champs vidés ; le focus : SaisieReponse (attribut focus)
  surQuestion: () => { reponse.value = ''; coloriees.value = []; placement.value = null },
})
const { phase, questions, q, bonnes, historique, retour, repondu, etat, cleFin } = jeu
const dernierOk = computed(() => !!retour.value?.ok)

// forme dessinée : propre au type de question (disque, rectangle, barre) ; `formeAide` : la barre partagée en parts de la fraction égale
const forme = computed(() => (q.value && 'forme' in q.value ? q.value.forme ?? null : null))
const formeAide = computed(() => (q.value?.kind === 'nombre' ? q.value.formeAide ?? null : null))
// les propositions d'un QCM (le libellé est lu par les lecteurs d'écran ; l'affichage est celui du slot)
const optionsChoix = computed(() => (q.value?.kind === 'choix' ? q.value.choix.map(c => ({ c, label: cle(c) })) : []))
const bonneChoix = computed(() => (q.value?.kind === 'choix' ? q.value.choix.findIndex(c => cle(c) === cle((q.value as QChoix).reponse)) : -1))
const estColoriee = (i: number): boolean => {
  const qu = q.value
  if (!qu) return false
  return qu.kind === 'parts' ? coloriees.value.includes(i) : 'colorees' in qu && !!qu.colorees?.includes(i)
}

function basculerPart(i: number): void {
  if (q.value?.kind !== 'parts' || repondu.value) return
  coloriees.value = coloriees.value.includes(i) ? coloriees.value.filter(x => x !== i) : [...coloriees.value, i]
}

// droite à placer : flèche bleue posée par l'élève, puis verte (juste) ou rouge ; la bonne graduation est rappelée en vert
const droitePlacer = computed(() => {
  const qu = q.value
  if (qu?.kind !== 'placer') return ''
  const juste = qu.reponse.n
  const fausse = repondu.value && placement.value !== juste
  const couleur = !repondu.value ? '#4a90e2' : fausse ? '#e74c3c' : '#5cb85c'
  return svgDroiteFraction(qu.droite, { fleche: placement.value, couleur, juste: fausse ? juste : null, zones: !repondu.value })
})
function cliqueDroite(e: MouseEvent): void {
  const i = (e.target as HTMLElement | null)?.dataset?.i
  if (i !== undefined && !repondu.value) placement.value = +i
}

function choisirReponse(i: number): void {
  const qu = q.value
  if (qu?.kind !== 'choix') return
  const c = qu.choix[i]
  jeu.repondre({ choix: c }, { donne: qu.choixEn === 'lettres' ? enLettres(T, c) : cle(c) })
}

function entree(): void {
  if (!repondu.value) valider()
  else if (!dernierOk.value) jeu.suivante()
}

function valider(): void {
  const qu = q.value
  if (!qu || repondu.value) return
  if (qu.kind === 'nombre') {
    const val = String(reponse.value).trim()
    if (val === '') return
    jeu.repondre({ texte: val }, { donne: val })
  } else if (qu.kind === 'placer') {
    if (placement.value === null) return
    jeu.repondre({ graduation: placement.value }, { donne: t('fractions.graduation', { o: ordinal(T, placement.value) }) })
  } else if (qu.kind === 'parts') {
    if (!coloriees.value.length) return
    const n = coloriees.value.length
    jeu.repondre({ parts: n }, { donne: T('partsSur', { n, d: qu.reponse.d }) })
  }
}

// passer : la question compte comme une erreur, et on enchaîne aussitôt
function passer(): void {
  if (repondu.value) return
  jeu.passer({ donne: t('fractions.passe') })
  jeu.suivante()
}

// ── Fiche imprimable (aperçu et impression : CadreExercice) : graine du lien, sinon tirée ──
const { mode, fiche, nouvelle } = useFicheExercice({
  tirer: rng => questionsFiche({ niveau: config.value.niveau, reglages: config.value, rng, T }),
  mettreEnPage: (tirage, police) => ficheFractions({ questions: tirage, reglages: config.value, T, langue: langueContenu.value, ...police }),
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
