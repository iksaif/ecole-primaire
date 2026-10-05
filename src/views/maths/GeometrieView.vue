<template>
  <div class="container">
    <h1 class="section-heading">📐 {{ t('titre') }}</h1>

    <!-- Config -->
    <ConfigExercice v-if="phase === 'config'" :config="config" v-model:mode="mode" :fiche="fiche" police
      @commencer="jeu.demarrer" @regenerer="nouvelle">
      <ChoixReglage :definition="DEFINITION" cle="niveau" v-model="config.niveau" :titre="t('niveau')" />
      <ChoixReglage :definition="DEFINITION" :niveau="config.niveau" cle="exercices" v-model="config.exercices"
        :titre="t('exercices')" :libelle="e => t(`ex_${e}`)" />
      <ChoixReglage v-if="config.exercices.includes('symetrie')" :definition="DEFINITION" :niveau="config.niveau"
        cle="axeHorizontal" v-model="config.axeHorizontal" :titre="t('optionsSym')" :libelle="h => t(h ? 'axeH' : 'axeV')" />
      <ChoixReglage v-if="mode === 'jouer'" :definition="DEFINITION" cle="nbQ" v-model="config.nbQ" :titre="t('nbQuestions')" />
    </ConfigExercice>

    <!-- Exercice -->
    <QuestionJeu v-if="phase === 'jeu' && q" :jeu="jeu">
      <div class="geo-box">
        <div class="consigne">{{ q.consigne ?? q.texte }}</div>

        <!-- Symétrie -->
        <div v-if="q.type === 'symetrie'" class="grilles">
          <div class="grille" :style="styleGrille(q.cols)">
            <template v-for="r in q.rows" :key="'r' + r">
              <div v-for="c in q.cols" :key="r + '-' + c"
                class="case" :class="classeSymetrie(c - 1, r - 1)"
                @click="clicSymetrie(c - 1, r - 1)"></div>
            </template>
            <div class="axe" :class="q.axe === 'v' ? 'axe-v' : 'axe-h'" :style="styleAxe(q)"></div>
          </div>
        </div>

        <!-- Reproduction -->
        <div v-else-if="q.type === 'reproduction'" class="grilles">
          <div class="grille-titre-wrap">
            <div class="grille-titre">{{ t('modele') }}</div>
            <div class="grille" :style="styleGrille(q.cols)">
              <template v-for="r in q.rows" :key="'m' + r">
                <div v-for="c in q.cols" :key="r + '-' + c" class="case"
                  :class="[modeleSet.has(k(c - 1, r - 1)) ? 'modele' : '', k(c - 1, r - 1) === q.repere ? 'repere' : '']"></div>
              </template>
            </div>
          </div>
          <div class="grille-titre-wrap">
            <div class="grille-titre">{{ t('aToi') }}</div>
            <div class="grille" :style="styleGrille(q.cols)">
              <template v-for="r in q.rows" :key="'a' + r">
                <div v-for="c in q.cols" :key="r + '-' + c" class="case cliquable"
                  :class="[etatCase(k(c - 1, r - 1)), k(c - 1, r - 1) === q.repere ? 'repere' : '']"
                  @click="basculer(k(c - 1, r - 1))"></div>
              </template>
            </div>
          </div>
        </div>

        <!-- Repérage -->
        <div v-else-if="q.type === 'reperage'" class="grilles">
          <div class="grille" :style="styleGrille(q.cols + 1)">
            <div class="case entete"></div>
            <div v-for="c in q.cols" :key="'h' + c" class="case entete">{{ LETTRES[c - 1] }}</div>
            <template v-for="r in q.rows" :key="'l' + r">
              <div class="case entete">{{ r }}</div>
              <div v-for="c in q.cols" :key="r + '-' + c" class="case"
                :class="classeReperage(c - 1, r - 1)"
                @click="clicReperage(c - 1, r - 1)"></div>
            </template>
          </div>
        </div>

        <!-- Figures planes, solides, cercle, patrons -->
        <div v-else-if="dessin" class="dessin" v-html="dessin"></div>

        <div v-if="(q.type === 'figure' && q.sous === 'angle') || q.type === 'angles'" class="astuce">
          💡 {{ t('astuceEquerre') }}
        </div>

        <!-- Angles droits : choix multiple de lettres -->
        <div v-if="q.type === 'angles'" class="choix-group">
          <button v-for="l in [...q.lettres].sort()" :key="l" class="choix-btn" :class="classeLettre(l)"
            :disabled="repondu" @click="basculerLettre(l)">{{ l }}</button>
          <button class="choix-btn" :class="classeLettre('aucun')"
            :disabled="repondu" @click="basculerLettre('aucun')">{{ t('aucunBtn') }}</button>
        </div>

        <!-- Choix -->
        <ChoixReponses v-if="q.options" :options="q.options" :bonne="q.bonne" :repondu="repondu"
          @choisir="choisir" />

        <div class="feedback" :class="etat">{{ retour?.message }}</div>

        <div v-if="corrige && !reussi" class="legende">
          <span><i class="pastille juste"></i> {{ t('legJuste') }}</span>
          <span><i class="pastille manquante"></i> {{ t('legOubliee') }}</span>
          <span><i class="pastille entrop"></i> {{ t('legEnTrop') }}</span>
        </div>

        <div class="btn-group" style="justify-content:center;margin-top:1rem;">
          <template v-if="!repondu">
            <button class="btn btn-ghost" @click="passer">{{ t('passer') }}</button>
            <button v-if="estGrille" class="btn btn-ghost" @click="effacer">{{ t('effacer') }}</button>
            <button v-if="!q.options" class="btn btn-primary" @click="valider">{{ t('valider') }}</button>
          </template>
          <button v-else-if="!reussi" class="btn btn-primary" @click="jeu.suivante">{{ t('suivant') }}</button>
        </div>
      </div>
    </QuestionJeu>

    <!-- Résultats -->
    <ResultatsJeu v-if="phase === 'resultats'" :bonnes="bonnes" :total="questions.length" :cle-fin="cleFin"
      @rejouer="jeu.recommencer" @reglages="jeu.quitter">
      <TableauCorrection :historique="historique" />
    </ResultatsJeu>
  </div>
</template>

<script setup>
// La géométrie : la vue ne fait que les réglages et le rendu d'une question (cases à colorier, figures, lettres).
// Niveaux, générateur, dessins et fiche : src/exercices/geometrie/ (definition.js, generateur.js, dessins.js, fiche.js…).
import { ref, computed } from 'vue'
import { useI18n, contenu } from '../../i18n'
import ConfigExercice from '../../components/ConfigExercice.vue'
import ChoixReglage from '../../components/ChoixReglage.vue'
import ChoixReponses from '../../components/ChoixReponses.vue'
import QuestionJeu from '../../components/QuestionJeu.vue'
import ResultatsJeu from '../../components/ResultatsJeu.vue'
import TableauCorrection from '../../components/TableauCorrection.vue'
import { useReglages } from '../../composables/useReglages'
import { useFicheExercice } from '../../composables/useFicheExercice'
import { useJeu } from '../../composables/useJeu'
import DEFINITION from '../../exercices/geometrie/definition'
import { INTERFACE, TEXTES } from '../../exercices/geometrie/textes'
import { questions as genererQuestions, questionsFiche, verifier, decrire, messageErreur } from '../../exercices/geometrie/generateur'
import { LETTRES, k } from '../../exercices/geometrie/quadrillage'
import { svgFigure, svgSolide, svgCercle, svgPatron } from '../../exercices/geometrie/dessins'
import { fiche as ficheGeometrie } from '../../exercices/geometrie/fiche'

const { t } = useI18n(INTERFACE)
// Réglages mémorisés, ajustés au changement de niveau (politique commune : src/composables/useReglages.js) ; maths :
// le contenu (questions, fiche) suit la langue de l'interface
const { config, langueContenu } = useReglages(DEFINITION, 'geometrie_config')
const T = contenu(TEXTES, () => langueContenu.value).t

// ── Jeu ──
const selection = ref({})   // cases (clés « colonne,ligne ») ou lettres cochées

const jeu = useJeu({
  generer: rng => genererQuestions({ niveau: config.value.niveau, reglages: config.value, rng, T, nb: config.value.nbQ }),
  verifier,
  messageErreur: (q, rep) => messageErreur(q, rep, T),
  delai: 900,
  surQuestion: () => { selection.value = {} },
})
const { phase, questions, q, bonnes, historique, retour, repondu, etat, cleFin } = jeu

const reussi = computed(() => !!retour.value?.ok)
// correction case par case, une fois la réponse donnée
const corrige = computed(() => repondu.value && estGrille.value && historique.value.at(-1)?.rep != null)
const estGrille = computed(() => q.value && (q.value.type === 'symetrie' || q.value.type === 'reproduction'
  || (q.value.type === 'reperage' && q.value.sous === 'colorie')))
const modeleSet = computed(() => new Set(q.value?.modele || []))
const cellulesSet = computed(() => new Set(q.value?.cellules || []))
const dessin = computed(() => {
  const x = q.value
  if (!x) return ''
  if (x.type === 'figure') return svgFigure(x, x.sous === 'nom')
  if (x.type === 'solide') return svgSolide(x.solide)
  if (x.type === 'angles') return svgFigure(x, repondu.value && !reussi.value)
  if (x.type === 'cercle') return svgCercle(x)
  if (x.type === 'patron') return svgPatron(x.cases)
  return ''
})

function classeLettre(l) {
  const sel = !!selection.value[l]
  if (!repondu.value) return sel ? 'actif' : ''
  const att = q.value.droits.length ? q.value.droits.includes(l) : l === 'aucun'
  if (att) return sel ? 'bon' : 'manque'
  return sel ? 'faux' : ''
}
function basculerLettre(l) {
  if (repondu.value) return
  if (l === 'aucun') { selection.value = selection.value.aucun ? {} : { aucun: true }; return }
  const s = { ...selection.value }
  delete s.aucun
  if (s[l]) delete s[l]; else s[l] = true
  selection.value = s
}

function styleGrille(cols) {
  return { gridTemplateColumns: `repeat(${cols}, var(--cell))`, '--cell': `clamp(26px, calc((100vw - 4rem) / ${cols}), 40px)` }
}
function styleAxe(x) {
  const n = (x.axe === 'v' ? x.cols : x.rows) / 2
  const pos = `calc(${n} * (var(--cell) + 1px) - 1.5px)`
  return x.axe === 'v' ? { left: pos } : { top: pos }
}

function etatCase(cle) {
  const sel = !!selection.value[cle]
  if (!corrige.value) return sel ? 'coloriee' : ''
  const att = cellulesSet.value.has(cle)
  if (att && sel) return 'juste'
  if (att) return 'manquante'
  if (sel) return 'entrop'
  return ''
}

function cliquableSymetrie(c, r) {
  const x = q.value
  const pos = x.axe === 'v' ? c : r
  const moitie = (x.axe === 'v' ? x.cols : x.rows) / 2
  return x.premier ? pos >= moitie : pos < moitie
}
function classeSymetrie(c, r) {
  const cle = k(c, r)
  if (modeleSet.value.has(cle)) return 'modele'
  if (!cliquableSymetrie(c, r)) return 'inactive'
  return ['cliquable', etatCase(cle)]
}
function clicSymetrie(c, r) {
  if (cliquableSymetrie(c, r)) basculer(k(c, r))
}

function classeReperage(c, r) {
  const x = q.value, cle = k(c, r)
  if (x.sous === 'lire') return cle === x.cible ? 'modele' : ''
  return ['cliquable', etatCase(cle)]
}
function clicReperage(c, r) {
  if (q.value.sous !== 'colorie' || repondu.value) return
  const cle = k(c, r)
  selection.value = selection.value[cle] ? {} : { [cle]: true }
}

function basculer(cle) {
  if (repondu.value) return
  const s = { ...selection.value }
  if (s[cle]) delete s[cle]; else s[cle] = true
  selection.value = s
}

function effacer() {
  if (!repondu.value) selection.value = {}
}

function repondre(rep) {
  jeu.repondre(rep, { donne: decrire(q.value, rep, T) })
}
const choisir = i => repondre({ choix: i })

function valider() {
  if (repondu.value || q.value.options) return
  const sel = Object.keys(selection.value)
  if (!sel.length) return
  repondre(q.value.type === 'angles' ? { lettres: sel } : { selection: sel })
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
  mettreEnPage: (questions, police) => ficheGeometrie({ questions, reglages: config.value, T, langue: langueContenu.value, ...police }),
})
</script>

<style scoped>
.consigne {
  font-size: 1.3rem;
  font-weight: 700;
  text-align: center;
  margin: .5rem 0 1rem;
  line-height: 1.4;
}

.astuce { text-align: center; color: #666; font-size: .95rem; margin-top: .5rem; }

.grilles {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1.25rem;
  margin: .5rem 0;
}
.grille-titre-wrap { display: flex; flex-direction: column; align-items: center; gap: .3rem; }
.grille-titre { font-weight: 800; color: #888; font-size: .9rem; text-transform: uppercase; letter-spacing: .05em; }

.grille {
  display: grid;
  gap: 1px;
  padding: 1px;
  background: #9aa5b1;
  position: relative;
  width: max-content;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
}

.case {
  width: var(--cell);
  height: var(--cell);
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1rem;
  transition: background .1s;
}
.case.cliquable { cursor: pointer; }
.case.cliquable:hover { background: #eef5ff; }
.case.inactive { background: #eef0f2; }
.case.modele   { background: var(--bleu); }
.case.coloriee, .case.cliquable.coloriee:hover { background: var(--orange); }
.case.juste    { background: var(--vert); }
.case.manquante { background: #fff3cd; box-shadow: inset 0 0 0 3px var(--orange); }
.case.manquante::after { content: '•'; color: var(--orange); font-size: 1.4rem; }
.case.entrop   { background: var(--rouge); }
.case.entrop::after { content: '✕'; color: white; }
.case.repere::after { content: '★'; color: #c0392b; font-size: .95rem; }
.case.modele.repere::after { color: white; }
.case.entete { background: var(--gris-bg); color: var(--texte); cursor: default; }

.axe { position: absolute; background: var(--rouge); border-radius: 2px; pointer-events: none; }
.axe-v { width: 4px; top: -10px; bottom: -10px; }
.axe-h { height: 4px; left: -10px; right: -10px; }

.dessin { display: flex; justify-content: center; margin: .5rem 0; }
.dessin :deep(svg) { max-width: 100%; height: auto; }

.choix-group {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: .75rem;
  margin-top: 1rem;
}
.choix-btn {
  min-height: 56px;
  font-size: 1.2rem;
  font-weight: 800;
  border: 3px solid var(--gris-brd);
  border-radius: var(--radius);
  background: white;
  color: var(--texte);
  cursor: pointer;
  transition: border-color .15s, background .15s;
}
.choix-btn:hover:not(:disabled) { border-color: var(--bleu); color: var(--bleu); }
.choix-btn:disabled { cursor: default; }
.choix-btn.bon  { border-color: var(--vert); background: #f0faf0; color: var(--vert); }
.choix-btn.faux { border-color: var(--rouge); background: #fef0f0; color: var(--rouge); }
.choix-btn.actif { border-color: var(--bleu); background: var(--bleu); color: white; }
.choix-btn.manque { border-color: var(--orange); background: #fff3cd; color: var(--texte); }

.legende { display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap; font-size: .9rem; color: #555; }
.pastille { display: inline-block; width: 14px; height: 14px; border-radius: 3px; vertical-align: middle; margin-right: .2rem; }
.pastille.juste { background: var(--vert); }
.pastille.manquante { background: #fff3cd; box-shadow: inset 0 0 0 2px var(--orange); }
.pastille.entrop { background: var(--rouge); }

@media (max-width: 520px) {
  .container :deep(.exercise-box) { padding: 1rem .5rem; }
  .consigne { font-size: 1.1rem; }
}
</style>
