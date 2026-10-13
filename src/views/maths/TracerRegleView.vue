<template>
  <div class="container">
    <h1 class="section-heading"><Icone nom="regle" /> {{ t('tracerRegle.titre') }}</h1>

    <CadreExercice v-if="phase === 'config'" v-model:mode="mode" :fiche="fiche" :config="config" @commencer="jeu.demarrer" @regenerer="nouvelle">
      <template #default="{ mode: modeCourant }">
        <ChoixReglage :definition="DEFINITION" cle="niveau" v-model="config.niveau" :titre="t('communs.niveau')" />
        <ChoixReglage v-if="plusieursTypes" :definition="DEFINITION" :niveau="config.niveau" cle="exercices" v-model="config.exercices"
          :titre="t('communs.exercices')" :libelle="libelleType" />
        <ChoixReglage v-if="modeCourant === 'jouer'" :definition="DEFINITION" :niveau="config.niveau" cle="nbQ" v-model="config.nbQ" :titre="t('communs.nbQuestions')" />
      </template>
    </CadreExercice>

    <QuestionJeu v-if="phase === 'jeu' && q" :jeu="jeu">
      <!-- lue à voix haute : la consigne et la phrase d'aide ; écrite : la consigne (l'aide est juste en dessous) -->
      <ConsigneParlee class="consigne" :texte="`${q.texte} ${aide}`" :auto="false">{{ q.texte }}</ConsigneParlee>

      <!-- Points alignés : on peut poser la règle sur deux points, puis on choisit la lettre -->
      <template v-if="q.type === 'alignes'">
        <p class="aide">{{ aide }}</p>
        <svg class="champ" :viewBox="`0 0 ${CHAMP.largeur} ${CHAMP.hauteur}`" role="group" :aria-label="q.texte">
          <rect x="0.3" y="0.3" :width="CHAMP.largeur - 0.6" :height="CHAMP.hauteur - 0.6" rx="2" class="bord" />
          <line v-if="droiteRegle" v-bind="droiteRegle" class="regle" />
          <line v-if="repondu" v-bind="droiteAB" class="droite-juste" />
          <g v-for="(p, i) in pointsAlignes" :key="i">
            <path :d="`M${p.x - 1.8} ${p.y}H${p.x + 1.8}M${p.x} ${p.y - 1.8}V${p.y + 1.8}`" class="croix" :class="{ posee: regle.includes(i) }" />
            <text :x="p.x + 2.4" :y="p.y - 2" class="lettre">{{ p.lettre }}</text>
            <circle v-if="repondu && i === q.bonne + 2" :cx="p.x" :cy="p.y" r="3.6" class="entoure" />
            <circle :cx="p.x" :cy="p.y" r="5" class="cible" role="button" tabindex="0" :aria-label="p.lettre"
              @click="poserRegle(i)" @keydown.enter.prevent="poserRegle(i)" @keydown.space.prevent="poserRegle(i)" />
          </g>
        </svg>
        <div class="btn-group centre">
          <button v-if="regle.length" type="button" class="btn btn-ghost" @click="regle = []">{{ t('tracerRegle.enleverRegle') }}</button>
        </div>
        <ChoixReponses :titre="q.texte" :options="q.options" :bonne="q.bonne" :repondu="repondu" @choisir="i => repondre({ choix: i })" />
      </template>

      <!-- Compléter : on touche les sommets qui manquent -->
      <template v-else-if="q.type === 'completer'">
        <p class="aide">{{ aide }}</p>
        <svg class="grille" :viewBox="viewBoxGrille(q.colonnes, q.lignes)" role="group" :aria-label="q.texte">
          <GrilleDePoints :support="q.support" :colonnes="q.colonnes" :lignes="q.lignes" />
          <polygon v-if="repondu" :points="polygone(solutionMontree)" class="figure-juste" />
          <line v-for="([a, b], i) in q.cotes" :key="'c' + i" :x1="X(a.x)" :y1="X(a.y)" :x2="X(b.x)" :y2="X(b.y)" class="cote" />
          <circle v-for="(p, i) in q.connus" :key="'s' + i" :cx="X(p.x)" :cy="X(p.y)" r="1.8" class="sommet" />
          <text v-if="q.sommetAngleDroit" :x="X(q.sommetAngleDroit.x) + 2.4" :y="X(q.sommetAngleDroit.y) - 2.4" class="lettre-a">A</text>
          <circle v-for="(p, i) in places" :key="'p' + i" :cx="X(p.x)" :cy="X(p.y)" r="2.2" class="place" />
          <PointsCliquables :colonnes="q.colonnes" :lignes="q.lignes" :actif="!repondu" @toucher="placer" />
        </svg>
      </template>

      <!-- Construire (CE2) : une figure donnée par ses mesures, tracée sur le quadrillage -->
      <template v-else-if="q.type === 'construire'">
        <p class="aide">{{ aide }}</p>
        <svg class="grille" :viewBox="viewBoxGrille(q.colonnes, q.lignes)" role="group" :aria-label="q.texte">
          <GrilleDePoints :support="q.support" :colonnes="q.colonnes" :lignes="q.lignes" />
          <polygon v-if="constructionJusteMontree.length" :points="polygone(constructionJusteMontree)" class="figure-juste" />
          <polyline v-if="trace.length > 1" :points="polygone(trace)" class="trace" :class="etat" />
          <circle v-if="trace.length" :cx="X(trace[trace.length - 1].x)" :cy="X(trace[trace.length - 1].y)" r="2" class="crayon" />
          <PointsCliquables :colonnes="q.colonnes" :lignes="q.lignes" :actif="!repondu" @toucher="relier" />
        </svg>
      </template>

      <!-- Reproduire : le modèle, et la grille où l'on relie les points -->
      <template v-else>
        <p class="aide">{{ aide }}</p>
        <div class="deux-grilles">
          <figure>
            <figcaption>{{ T('modele') }}</figcaption>
            <svg class="grille" :viewBox="viewBoxGrille(q.colonnes, q.lignes)" role="img" :aria-label="T('modele')">
              <GrilleDePoints :support="q.support" :colonnes="q.colonnes" :lignes="q.lignes" />
              <polygon :points="polygone(q.modele)" class="figure-modele" />
            </svg>
          </figure>
          <figure>
            <figcaption>{{ t('geometrie.aToi') }}</figcaption>
            <svg class="grille" :viewBox="viewBoxGrille(q.colonnes, q.lignes)" role="group" :aria-label="q.texte">
              <GrilleDePoints :support="q.support" :colonnes="q.colonnes" :lignes="q.lignes" />
              <polygon v-if="modeleSurLaGrille.length" :points="polygone(modeleSurLaGrille)" class="figure-juste" />
              <polyline v-if="trace.length > 1" :points="polygone(trace)" class="trace" :class="etat" />
              <line v-for="([a, b], i) in traitsEnTrop" :key="'t' + i" :x1="X(a.x)" :y1="X(a.y)" :x2="X(b.x)" :y2="X(b.y)" class="trait-en-trop" />
              <circle v-if="trace.length" :cx="X(trace[trace.length - 1].x)" :cy="X(trace[trace.length - 1].y)" r="2" class="crayon" />
              <PointsCliquables :colonnes="q.colonnes" :lignes="q.lignes" :actif="!repondu" @toucher="relier" />
            </svg>
          </figure>
        </div>
      </template>

      <RetourReponse :message="retour?.message" :etat="etat" />
      <div class="btn-group centre">
        <template v-if="!repondu">
          <button type="button" class="btn btn-ghost" @click="passer">{{ t('communs.passer') }} <Icone nom="passer" /></button>
          <template v-if="q.type === 'completer'">
            <button type="button" class="btn btn-ghost" :disabled="!places.length" @click="places = places.slice(0, -1)">{{ t('tracerRegle.enlever') }}</button>
            <button type="button" class="btn btn-primary" :disabled="places.length !== q.aTrouver" @click="repondre({ points: places })">{{ t('communs.valider') }} <Icone nom="valide" /></button>
          </template>
          <template v-if="q.type === 'reproduire' || q.type === 'construire'">
            <button type="button" class="btn btn-ghost" :disabled="!trace.length" @click="trace = trace.slice(0, -1)">{{ t('tracerRegle.annuler') }}</button>
            <button type="button" class="btn btn-ghost" :disabled="!trace.length" @click="trace = []"><Icone nom="effacer" /> {{ t('geometrie.effacer') }}</button>
            <button type="button" class="btn btn-primary" :disabled="trace.length < 3" @click="repondre({ trace })">{{ t('communs.valider') }} <Icone nom="valide" /></button>
          </template>
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
// Tracer à la règle : la vue règle, pose et affiche ; les niveaux, les questions, la correction et la fiche sont dans
// src/exercices/tracer-regle/. À l'écran, on touche des points (souris, doigt, ou clavier : Tab puis Entrée) ; sur la fiche, on trace.
import { computed, defineComponent, h, ref } from 'vue'
import type { PropType } from 'vue'
import Icone from '../../images/Icone.vue'
import { useLangue } from '../../langues/useLangue.ts'
import { traducteur } from '../../langues/catalogue.ts'
import CadreExercice from '../../noyau/CadreExercice.vue'
import ChoixReglage from '../../noyau/ChoixReglage.vue'
import ChoixReponses from '../../noyau/ChoixReponses.vue'
import ConsigneParlee from '../../noyau/ConsigneParlee.vue'
import QuestionJeu from '../../noyau/QuestionJeu.vue'
import BoutonSuivant from '../../noyau/BoutonSuivant.vue'
import RetourReponse from '../../noyau/RetourReponse.vue'
import ResultatsJeu from '../../noyau/ResultatsJeu.vue'
import TableauCorrection from '../../noyau/TableauCorrection.vue'
import { useReglages } from '../../noyau/useReglages.ts'
import { useJeu } from '../../noyau/useJeu.ts'
import { useFicheExercice } from '../../noyau/useFicheExercice.ts'
import DEFINITION from '../../exercices/tracer-regle/definition.ts'
import { CONTENU } from '../../exercices/tracer-regle/textes.ts'
import { CHAMP, questions as tirer, questionsFiche, verifier, decrire, messageErreur } from '../../exercices/tracer-regle/generateur.ts'
import type { Pt, Question, Reponse, Support } from '../../exercices/tracer-regle/generateur.ts'
import { memePoint, referme, segmentsElementaires } from '../../exercices/tracer-regle/figures.ts'
import { fiche as mettreEnPage } from '../../exercices/tracer-regle/fiche.ts'
import { constructionModele } from '../../exercices/tracer-regle/construire.ts'
import { droiteDansLeChamp } from '../../exercices/tracer-regle/dessin.ts'

const { t } = useLangue()
const { config, langueContenu } = useReglages(DEFINITION)
const T = traducteur(CONTENU, () => langueContenu.value)

/** le nom d'un type de questions (réglage `exercices`) */
const libelleType = (type: unknown): string => (t as (cle: string) => string)(`tracerRegle.exercices.${String(type)}`)
// un seul type de questions au niveau (CE2 : reproduire) : pas de réglage à montrer
const plusieursTypes = computed(() => (DEFINITION.niveaux[config.value.niveau]?.options?.exercices?.length ?? 0) > 1)

// ── Les grilles : un point tous les 10 (unités du viewBox), une marge de 5 ──
const X = (n: number): number => 5 + n * 10
const viewBoxGrille = (colonnes: number, lignes: number): string => `0 0 ${(colonnes - 1) * 10 + 10} ${(lignes - 1) * 10 + 10}`
const polygone = (points: readonly Pt[]): string => points.map(p => `${X(p.x)},${X(p.y)}`).join(' ')

/** Le papier : des points, ou les lignes d'un quadrillage. */
const GrilleDePoints = defineComponent({
  props: { support: { type: String as PropType<Support>, required: true }, colonnes: { type: Number, required: true }, lignes: { type: Number, required: true } },
  setup(props) {
    return () => {
      const enfants = []
      if (props.support === 'quadrille') {
        for (let c = 0; c < props.colonnes; c++) enfants.push(h('line', { x1: X(c), y1: X(0), x2: X(c), y2: X(props.lignes - 1), class: 'ligne-quadrillage' }))
        for (let l = 0; l < props.lignes; l++) enfants.push(h('line', { x1: X(0), y1: X(l), x2: X(props.colonnes - 1), y2: X(l), class: 'ligne-quadrillage' }))
      } else {
        for (let l = 0; l < props.lignes; l++) for (let c = 0; c < props.colonnes; c++) enfants.push(h('circle', { cx: X(c), cy: X(l), r: 0.9, class: 'point-grille' }))
      }
      return h('g', enfants)
    }
  },
})

/** Les zones à toucher, une par point de la grille (plus grandes que le point : un doigt d'enfant), au clavier aussi. */
const PointsCliquables = defineComponent({
  props: { colonnes: { type: Number, required: true }, lignes: { type: Number, required: true }, actif: { type: Boolean, required: true } },
  emits: ['toucher'],
  setup(props, { emit }) {
    return () => {
      const cibles = []
      for (let l = 0; l < props.lignes; l++) {
        for (let c = 0; c < props.colonnes; c++) {
          const toucher = (e?: Event) => { e?.preventDefault(); if (props.actif) emit('toucher', { x: c, y: l }) }
          cibles.push(h('circle', {
            cx: X(c), cy: X(l), r: 4.6, class: 'cible', role: 'button', tabindex: props.actif ? 0 : -1,
            'aria-label': t('tracerRegle.point', { n: `${c + 1}, ${l + 1}` }),
            onClick: () => toucher(),
            onKeydown: (e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') toucher(e) },
          }))
        }
      }
      return h('g', cibles)
    }
  },
})

// ── Jeu ──
const regle = ref<number[]>([])     // alignés : les deux points (indices) sur lesquels la règle est posée
const places = ref<Pt[]>([])        // compléter : les sommets placés
const trace = ref<Pt[]>([])         // reproduire : les points reliés, dans l'ordre

const jeu = useJeu<Question, Reponse>({
  generer: rng => tirer({ niveau: config.value.niveau, reglages: config.value, rng, T }),
  verifier,
  messageErreur: q => messageErreur(q, T),
  delai: 900,
  surQuestion: () => { regle.value = []; places.value = []; trace.value = [] },
})
const { phase, questions, q, bonnes, historique, retour, repondu, etat, cleFin } = jeu

function repondre(rep: Reponse): void {
  if (q.value && !repondu.value) jeu.repondre(rep, { donne: decrire(q.value, rep, T) })
}
// passer : la question compte comme une erreur, et on enchaîne aussitôt
function passer(): void {
  if (repondu.value) return
  jeu.passer({ donne: t('geometrie.passe') })
  jeu.suivante()
}

// alignés : A, B, puis les trois croix, avec leur lettre
const pointsAlignes = computed(() => {
  const x = q.value
  if (x?.type !== 'alignes') return []
  return [{ ...x.a, lettre: 'A' }, { ...x.b, lettre: 'B' }, ...x.candidats.map((c, i) => ({ ...c, lettre: x.lettres[i] }))]
})
/** La droite qui passe par deux points, d'un bord du champ à l'autre (le même calcul que la fiche). */
const droitePar = droiteDansLeChamp
const droiteRegle = computed(() => {
  const pts = pointsAlignes.value
  return regle.value.length === 2 ? droitePar(pts[regle.value[0]], pts[regle.value[1]]) : null
})
const droiteAB = computed(() => (q.value?.type === 'alignes' ? droitePar(q.value.a, q.value.b) : null))
/** Poser la règle : le premier point touché, puis le second ; un troisième la repose à partir de lui. */
function poserRegle(i: number): void {
  if (regle.value.length === 2 || regle.value.includes(i)) regle.value = [i]
  else regle.value = [...regle.value, i]
}

// compléter : toucher un point le place (ou le retire)
function placer(p: Pt): void {
  const x = q.value
  if (x?.type !== 'completer' || repondu.value) return
  if (x.connus.some(s => memePoint(s, p))) return
  const deja = places.value.findIndex(s => memePoint(s, p))
  // on ne place pas plus de points qu'il n'en manque ; la réponse part avec le bouton Valider (un doigt qui glisse se rattrape)
  if (deja >= 0) places.value = places.value.filter((_, i) => i !== deja)
  else if (places.value.length < x.aTrouver) places.value = [...places.value, p]
}
// après la réponse : la solution que l'élève a trouvée, sinon la première
const solutionMontree = computed((): Pt[] => {
  const x = q.value
  if (x?.type !== 'completer') return []
  const trouvee = x.solutions.find(s => s.every(p => places.value.some(m => memePoint(m, p))))
  return [...x.connus, ...(trouvee ?? x.solutions[0])]
})

/** La phrase d'aide du type de question (affichée sous la consigne et lue avec elle). */
const aide = computed((): string => {
  const type = q.value?.type
  if (type === 'alignes') return t('tracerRegle.aideRegle')
  if (type === 'completer') return t('tracerRegle.aideCompleter')
  // construire, sur le quadrillage : on touche les coins des carreaux
  if (type === 'construire') return t('tracerRegle.aideConstruire')
  return t('tracerRegle.aideTrace')
})

/** Reproduire, après une erreur : le modèle sur la grille de l'enfant, calé sur le coin de son tracé (ou à sa place s'il ne tient pas). */
const modeleSurLaGrille = computed((): Pt[] => {
  const x = q.value
  if (x?.type !== 'reproduire' || !repondu.value || etat.value === 'ok') return []
  if (!trace.value.length) return x.modele
  const coin = (pts: readonly Pt[]): Pt => ({ x: Math.min(...pts.map(p => p.x)), y: Math.min(...pts.map(p => p.y)) })
  const decalage = { x: coin(trace.value).x - coin(x.modele).x, y: coin(trace.value).y - coin(x.modele).y }
  const deplace = x.modele.map(p => ({ x: p.x + decalage.x, y: p.y + decalage.y }))
  const tient = deplace.every(p => p.x >= 0 && p.y >= 0 && p.x < x.colonnes && p.y < x.lignes)
  return tient ? deplace : x.modele
})

/** Construire, après une erreur : une figure juste, posée à partir du premier point de l'enfant (ou dans le coin si elle n'y tient pas). */
const constructionJusteMontree = computed((): Pt[] => {
  const x = q.value
  if (x?.type !== 'construire' || !repondu.value || etat.value === 'ok') return []
  const modele = constructionModele(x.figure, x.mesures).slice(0, -1)
  const depart = trace.value[0] ?? { x: 0, y: 0 }
  const pose = modele.map(p => ({ x: p.x + depart.x, y: p.y + depart.y }))
  const tient = pose.every(p => p.x < x.colonnes && p.y < x.lignes)
  return tient ? pose : modele
})

/** Reproduire, après une erreur : les traits de l'enfant qui ne sont pas dans le modèle (posé sur sa grille), en rouge. */
const traitsEnTrop = computed((): [Pt, Pt][] => {
  if (!modeleSurLaGrille.value.length) return []
  const attendus = segmentsElementaires(referme(modeleSurLaGrille.value))
  const lire = (cle: string): [Pt, Pt] => {
    const [x1, y1, x2, y2] = cle.split(/[-,]/).map(Number)
    return [{ x: x1, y: y1 }, { x: x2, y: y2 }]
  }
  return [...segmentsElementaires(trace.value)].filter(s => !attendus.has(s)).map(lire)
})

// reproduire : toucher un point le relie au précédent ; revenir au premier point ferme la figure et valide
function relier(p: Pt): void {
  if ((q.value?.type !== 'reproduire' && q.value?.type !== 'construire') || repondu.value) return
  const dernier = trace.value[trace.value.length - 1]
  if (dernier && memePoint(dernier, p)) return
  trace.value = [...trace.value, p]
  if (trace.value.length > 3 && memePoint(trace.value[0], p)) repondre({ trace: trace.value })
}

// ── Fiche imprimable ──
const { mode, fiche, nouvelle } = useFicheExercice({
  tirer: rng => questionsFiche({ niveau: config.value.niveau, reglages: config.value, rng, T }),
  mettreEnPage: (tirage, police) => mettreEnPage({ questions: tirage, reglages: config.value, T, langue: langueContenu.value, ...police }),
})
</script>

<style scoped>
.consigne { font-size: 1.25rem; font-weight: 700; text-align: center; margin: .5rem 0 .5rem; }
.aide { text-align: center; color: var(--texte-doux, #666); margin: 0 0 .5rem; }
.centre { justify-content: center; margin-top: .75rem; }
.champ { display: block; width: min(100%, 34rem); margin: 0 auto; touch-action: manipulation; user-select: none; }
.grille { display: block; width: min(100%, 22rem); margin: 0 auto; touch-action: manipulation; user-select: none; }
.deux-grilles { display: flex; flex-wrap: wrap; justify-content: center; gap: 1rem; }
.deux-grilles figure { margin: 0; flex: 1 1 15rem; max-width: 22rem; }
.deux-grilles figcaption { text-align: center; font-weight: 800; color: #888; font-size: .9rem; text-transform: uppercase; letter-spacing: .05em; }
.bord { fill: white; stroke: #bbb; stroke-width: .5; }
.croix { stroke: #222; stroke-width: .55; stroke-linecap: round; }
.croix.posee { stroke: var(--bleu-fort, #1d4e9e); stroke-width: .9; }
.lettre { font-size: 4.4px; font-weight: 800; fill: #222; pointer-events: none; }
.regle { stroke: #e8a33d; stroke-width: 2.2; stroke-opacity: .45; }
.droite-juste { stroke: var(--vert, #2f9e44); stroke-width: .6; }
.entoure { fill: none; stroke: var(--vert, #2f9e44); stroke-width: .6; }
/* les points et les zones à toucher sont dessinés par GrilleDePoints et PointsCliquables (composants internes) : :deep */
:deep(.cible) { fill: transparent; cursor: pointer; outline: none; }
:deep(.cible:focus-visible) { stroke: var(--bleu-fort, #1d4e9e); stroke-width: .6; }
:deep(.point-grille) { fill: #666; }
:deep(.ligne-quadrillage) { stroke: #b6bfc9; stroke-width: .3; }
.cote { stroke: #222; stroke-width: 1; stroke-linecap: round; }
.sommet { fill: #222; }
.place { fill: var(--orange, #f08c00); }
.lettre-a { font-size: 5px; font-weight: 800; fill: #222; pointer-events: none; }
.figure-juste { fill: rgba(47, 158, 68, .12); stroke: var(--vert, #2f9e44); stroke-width: .8; stroke-dasharray: 2 1.5; }
.figure-modele { fill: rgba(29, 78, 158, .08); stroke: #1d4e9e; stroke-width: 1; stroke-linejoin: round; }
.trace { fill: none; stroke: var(--orange, #f08c00); stroke-width: 1; stroke-linejoin: round; stroke-linecap: round; }
.trace.ok { stroke: var(--vert, #2f9e44); }
.trace.erreur { stroke: var(--rouge, #c92a2a); }
.crayon { fill: var(--orange, #f08c00); }
.trait-en-trop { stroke: var(--rouge, #c92a2a); stroke-width: 2.2; stroke-linecap: round; }
</style>
