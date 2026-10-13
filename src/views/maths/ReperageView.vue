<template>
  <div class="container">
    <h1 class="section-heading"><Icone nom="punaise" /> {{ t('reperage.titre') }}</h1>

    <CadreExercice v-if="phase === 'config'" v-model:mode="mode" :fiche="fiche" :config="config" @commencer="jeu.demarrer" @regenerer="nouvelle">
      <template #default="{ mode: modeCourant }">
        <ChoixReglage :definition="DEFINITION" cle="niveau" v-model="config.niveau" :titre="t('communs.niveau')" />
        <ChoixReglage :definition="DEFINITION" :niveau="config.niveau" cle="exercices" v-model="config.exercices"
          :titre="t('communs.exercices')" :libelle="libelleType" />
        <ChoixReglage v-if="modeCourant === 'jouer'" :definition="DEFINITION" :niveau="config.niveau" cle="nbQ" v-model="config.nbQ" :titre="t('communs.nbQuestions')" />
      </template>
    </CadreExercice>

    <QuestionJeu v-if="phase === 'jeu' && q" :jeu="jeu">
      <ConsigneParlee class="consigne" :texte="q.texte" :auto="false" />

      <!-- le quadrillage : le robot, l'étoile (coder), le chemin après la réponse ; « suivre » : on touche la case d'arrivée -->
      <svg class="plan" :viewBox="`-0.5 -0.5 ${q.colonnes * CASE + 1} ${q.lignes * CASE + 1}`" role="group" :aria-label="q.texte">
        <g v-html="dessinPlan" />
        <template v-if="q.type === 'suivre'">
          <rect v-for="c in cases" :key="`${c.x},${c.y}`" :x="c.x * CASE" :y="c.y * CASE" :width="CASE" :height="CASE"
            class="case-cible" :class="{ choisie: choisie && choisie.x === c.x && choisie.y === c.y }"
            role="button" :tabindex="repondu ? -1 : 0" :aria-label="t('reperage.caseDe', { n: `${c.x + 1}, ${c.y + 1}` })"
            @click="toucher(c)" @keydown.enter.prevent="toucher(c)" @keydown.space.prevent="toucher(c)" />
        </template>
      </svg>

      <!-- le programme : donné (suivre), ou écrit avec les boutons (coder) -->
      <div class="programme" :aria-label="t('reperage.programme')">
        <span v-for="(ins, i) in programmeAffiche" :key="i" class="instruction" v-html="caseInstruction(ins.instruction, ins.n, 11)" />
        <span v-if="q.type === 'coder' && !programme.length" class="vide">{{ t('reperage.vide') }}</span>
      </div>
      <div v-if="q.type === 'coder' && !repondu" class="boutons-programme">
        <button v-for="i in INSTRUCTIONS" :key="i" type="button" class="btn btn-ghost" @click="programme = [...programme, i]">
          <span class="mini" v-html="caseInstruction(i, 1, 7)" /> {{ t(`reperage.${i}`) }}
        </button>
        <button type="button" class="btn btn-ghost" :disabled="!programme.length" @click="programme = programme.slice(0, -1)">{{ t('reperage.annuler') }}</button>
      </div>

      <RetourReponse :message="retour?.message" :etat="etat" />
      <!-- « écrire », après une erreur : un programme qui marche, avec les mêmes flèches que les boutons (son chemin est en vert sur le plan) -->
      <div v-if="solutionMontree.length" class="programme solution">
        <span v-for="(ins, i) in solutionMontree" :key="i" class="instruction" v-html="caseInstruction(ins.instruction, ins.n, 11)" />
      </div>
      <div class="btn-group centre">
        <template v-if="!repondu">
          <button type="button" class="btn btn-ghost" @click="passer">{{ t('communs.passer') }} <Icone nom="passer" /></button>
          <button v-if="q.type === 'coder'" type="button" class="btn btn-primary" :disabled="!programme.length" @click="repondre({ programme })">
            {{ t('reperage.lancer') }} <Icone nom="valide" />
          </button>
        </template>
        <BoutonSuivant v-else :jeu="jeu" />
      </div>
    </QuestionJeu>

    <ResultatsJeu v-if="phase === 'resultats'" :bonnes="bonnes" :total="questions.length" :cle-fin="cleFin"
      @rejouer="jeu.recommencer" @reglages="jeu.quitter">
      <TableauCorrection :historique="historique" />
    </ResultatsJeu>
  </div>
</template>

<script setup lang="ts">
// Le repérage : la vue règle, pose et affiche ; les niveaux, les questions, la correction, les dessins et la fiche sont dans
// src/exercices/reperage/. « Suivre » : on touche la case d'arrivée ; « coder » : on écrit le programme avec trois boutons, puis on lance le
// robot (son chemin se dessine).
import { computed, onUnmounted, ref } from 'vue'
import Icone from '../../images/Icone.vue'
import { useLangue } from '../../langues/useLangue.ts'
import { traducteur } from '../../langues/catalogue.ts'
import CadreExercice from '../../noyau/CadreExercice.vue'
import ChoixReglage from '../../noyau/ChoixReglage.vue'
import ConsigneParlee from '../../noyau/ConsigneParlee.vue'
import QuestionJeu from '../../noyau/QuestionJeu.vue'
import BoutonSuivant from '../../noyau/BoutonSuivant.vue'
import RetourReponse from '../../noyau/RetourReponse.vue'
import ResultatsJeu from '../../noyau/ResultatsJeu.vue'
import TableauCorrection from '../../noyau/TableauCorrection.vue'
import { useReglages } from '../../noyau/useReglages.ts'
import { useJeu } from '../../noyau/useJeu.ts'
import { useFicheExercice } from '../../noyau/useFicheExercice.ts'
import DEFINITION from '../../exercices/reperage/definition.ts'
import { CONTENU } from '../../exercices/reperage/textes.ts'
import { questions as tirer, questionsFiche, verifier, decrire, messageErreur, executer, enInstructions } from '../../exercices/reperage/generateur.ts'
import type { Case, Instruction, Question, Reponse } from '../../exercices/reperage/generateur.ts'
import { CASE, caseColoriee, caseInstruction, chemin, etoile, quadrillage, robot, rocher } from '../../exercices/reperage/dessin.ts'
import { fiche as mettreEnPage } from '../../exercices/reperage/fiche.ts'

const { t } = useLangue()
const { config, langueContenu } = useReglages(DEFINITION)
const T = traducteur(CONTENU, () => langueContenu.value)
const INSTRUCTIONS: readonly Instruction[] = ['avancer', 'droite', 'gauche']

/** le nom d'un type de questions (réglage `exercices`) */
const libelleType = (type: unknown): string => (t as (cle: string) => string)(`reperage.exercices.${String(type)}`)

// ── Jeu ──
const choisie = ref<Case | null>(null)       // suivre : la case touchée
const programme = ref<Instruction[]>([])     // coder : le programme écrit

const jeu = useJeu<Question, Reponse>({
  generer: rng => tirer({ niveau: config.value.niveau, reglages: config.value, rng, T }),
  verifier,
  messageErreur: (q, rep) => messageErreur(q, rep, T),
  // pas d'enchaînement automatique : on regarde le robot rejouer le programme jusqu'au bout, puis « Suivant »
  delai: null,
  surQuestion: () => { choisie.value = null; programme.value = []; arreterAnimation() },
})
const { phase, questions, q, bonnes, historique, retour, repondu, etat, cleFin } = jeu

function repondre(rep: Reponse): void {
  if (!q.value || repondu.value) return
  jeu.repondre(rep, { donne: decrire(q.value, rep) })
  animer(programmeJoue.value.length)
}
// passer : la question compte comme une erreur, et on enchaîne aussitôt
function passer(): void {
  if (repondu.value) return
  jeu.passer({ donne: t('geometrie.passe') })
  jeu.suivante()
}
function toucher(c: Case): void {
  if (repondu.value) return
  choisie.value = c
  repondre({ case: c })
}

/** Les cases du quadrillage (les zones à toucher de « suivre »). */
const cases = computed((): Case[] => {
  const x = q.value
  if (!x) return []
  return Array.from({ length: x.colonnes * x.lignes }, (_, i) => ({ x: i % x.colonnes, y: Math.floor(i / x.colonnes) }))
})

/** Le programme affiché : celui à suivre, ou celui que l'élève écrit (au CE1, « avancer de n »). */
const programmeAffiche = computed(() => {
  const x = q.value
  if (!x) return []
  return enInstructions(x.type === 'suivre' ? x.programme : programme.value, x.avancerDe)
})

/** « Écrire », après une erreur (ou une question passée) : le programme du corrigé, en instructions. */
const solutionMontree = computed(() => {
  const x = q.value
  if (x?.type !== 'coder' || !repondu.value || etat.value === 'ok') return []
  return enInstructions(x.solution, x.avancerDe)
})

// ── L'animation : après la réponse, le robot rejoue le programme case par case (celui de l'enfant pour « écrire », le bon pour « suivre ») ──
const pasAnime = ref<number | null>(null)   // instructions déjà jouées ; null : pas d'animation en cours
let minuteur: ReturnType<typeof setInterval> | null = null
function arreterAnimation(): void {
  if (minuteur) clearInterval(minuteur)
  minuteur = null
  pasAnime.value = null
}
function animer(nb: number): void {
  arreterAnimation()
  pasAnime.value = 0
  minuteur = setInterval(() => {
    if (pasAnime.value === null || pasAnime.value >= nb) arreterAnimation()
    else pasAnime.value++
  }, 260)
}
onUnmounted(arreterAnimation)

/** Le programme que le robot joue après la réponse. */
const programmeJoue = computed((): Instruction[] => {
  const x = q.value
  if (!x) return []
  return x.type === 'suivre' ? x.programme : programme.value
})

/** Le dessin du plan : rochers, étoile, robot ; après la réponse, le trajet joué (animé), puis la solution en vert si c'était faux. */
const dessinPlan = computed((): string => {
  const x = q.value
  if (!x) return ''
  const obstacles = x.type === 'coder' ? x.obstacles : []
  const decor = `${obstacles.map(rocher).join('')}${x.type === 'coder' ? etoile(x.cible) : ''}`
  if (!repondu.value) return `${quadrillage(x.colonnes, x.lignes)}${decor}${robot(x.depart)}`
  const joues = pasAnime.value === null ? programmeJoue.value : programmeJoue.value.slice(0, pasAnime.value)
  const fait = executer(x.depart, joues, x.colonnes, x.lignes, obstacles)
  const fin: string[] = []
  const animationFinie = pasAnime.value === null
  if (x.type === 'suivre' && animationFinie) fin.push(caseColoriee(x.arrivee, '#b2f2bb'))
  const couleur = x.type === 'suivre' || etat.value === 'ok' ? '#2f9e44' : '#c92a2a'
  fin.push(chemin(fait.chemin, couleur))
  // la solution, par-dessus le trajet raté (il ne la cache plus)
  if (x.type === 'coder' && animationFinie && etat.value !== 'ok') fin.push(chemin(executer(x.depart, x.solution, x.colonnes, x.lignes, obstacles).chemin, '#2f9e44'))
  // le départ reste marqué : un robot pâle, dans son sens de départ (on relit la solution depuis là)
  fin.push(`<g opacity="0.35">${robot(x.depart)}</g>`)
  // le robot là où il est arrivé (devant le rocher s'il s'est cogné ; à sa dernière case s'il est sorti)
  const ici = fait.sorti ? { ...fait.chemin[fait.chemin.length - 1], dir: fait.fin.dir } : fait.fin
  return `${quadrillage(x.colonnes, x.lignes)}${fin.join('')}${decor}${robot(ici)}`
})

// ── Fiche imprimable ──
const { mode, fiche, nouvelle } = useFicheExercice({
  tirer: rng => questionsFiche({ niveau: config.value.niveau, reglages: config.value, rng, T }),
  mettreEnPage: (tirage, police) => mettreEnPage({ questions: tirage, reglages: config.value, T, langue: langueContenu.value, ...police }),
})
</script>

<style scoped>
.consigne { font-size: 1.25rem; font-weight: 700; text-align: center; margin: .5rem 0 .75rem; }
.centre { justify-content: center; margin-top: .75rem; }
.plan { display: block; width: min(100%, 22rem); margin: 0 auto; touch-action: manipulation; user-select: none; }
.case-cible { fill: transparent; cursor: pointer; outline: none; }
.case-cible:hover { fill: rgba(29, 78, 158, .08); }
.case-cible:focus-visible { stroke: var(--bleu-fort, #1d4e9e); stroke-width: .8; }
.case-cible.choisie { fill: rgba(240, 140, 0, .35); }
.programme { display: flex; flex-wrap: wrap; justify-content: center; gap: .25rem; margin: .9rem auto .5rem; min-height: 2.6rem; max-width: 34rem; }
.instruction :deep(svg) { display: block; }
.vide { color: var(--texte-doux, #666); align-self: center; }
.solution { margin-top: .25rem; }
.boutons-programme { display: flex; flex-wrap: wrap; justify-content: center; gap: .5rem; }
.boutons-programme .mini { display: inline-block; vertical-align: middle; }
.boutons-programme .mini :deep(svg) { display: block; }
</style>
