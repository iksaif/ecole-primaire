<template>
  <div class="container">
    <h1 class="section-heading">📐 {{ t('titre') }}</h1>

    <!-- Config -->
    <ConfigExercice v-if="phase === 'config'" :config="config" v-model:mode="mode" :fiche="fiche" police
      @commencer="jeu.demarrer" @regenerer="nouvelle">
      <ChoixReglage :definition="DEFINITION" cle="niveau" v-model="config.niveau" :titre="t('niveau')" />
      <ChoixReglage :definition="DEFINITION" :niveau="config.niveau" cle="op" v-model="config.op" :titre="t('operation')"
        :libelle="o => (o === 'mix' ? '' : SIGNES[o] + ' ') + t(o === 'add' ? 'addition' : o === 'sou' ? 'soustraction' : o === 'mul' ? 'multiplication' : 'melange')">
        <div v-if="config.niveau === 'cp'" class="aide-config">{{ t('aideNiveaux') }}</div>
      </ChoixReglage>
      <ChoixReglage :definition="DEFINITION" :niveau="config.niveau" cle="taille" v-model="config.taille" :titre="t('taille')"
        :libelle="n => (n === '1' ? t('chiffre1') : t('chiffres', { n }))" />
      <ChoixReglage v-if="config.taille !== '1'" :definition="DEFINITION" :niveau="config.niveau" cle="retenue" v-model="config.retenue"
        :titre="t('retenue')" :libelle="r => t(r === 'non' ? 'sansRetenue' : r === 'oui' ? 'avecRetenue' : 'melange')" />
      <ChoixReglage v-if="mode === 'jouer'" :definition="DEFINITION" cle="nbQ" v-model="config.nbQ" :titre="t('nbExercices')" />
      <ChoixReglage v-else :definition="DEFINITION" cle="nbFiche" v-model="config.nbFiche" :titre="t('nbExercices')" />
    </ConfigExercice>

    <!-- Exercice -->
    <QuestionJeu v-if="phase === 'jeu' && q" :jeu="jeu">
      <!-- Colonne de calcul posé -->
      <div class="pose-container">
        <div class="pose-grid">
          <div class="pose-row">
            <span class="pose-sign"></span>
            <span v-for="(d, i) in q.chiffresA" :key="'a' + i" class="pose-cell pose-number">{{ d }}</span>
          </div>
          <div class="pose-row">
            <span class="pose-sign">{{ q.opLabel }}</span>
            <span v-for="(d, i) in q.chiffresB" :key="'b' + i" class="pose-cell pose-number">{{ d }}</span>
          </div>
          <div class="pose-separator" :style="{ 'grid-column': `1 / span ${q.cols + 1}` }"></div>
          <!-- une case par chiffre du résultat -->
          <div class="pose-row">
            <span class="pose-sign"></span>
            <input v-for="(_, ci) in q.chiffresR" :key="'r' + ci" :ref="el => (cases[ci] = el)" v-model="chiffres[ci]"
              class="pose-input" :class="etats[ci]" type="text" inputmode="numeric" maxlength="1" autocomplete="off"
              autocorrect="off" spellcheck="false" :disabled="repondu" :aria-label="t('chiffreN', { n: ci + 1 })"
              @input="surSaisie($event, ci)" @keydown="surTouche($event, ci)">
          </div>
        </div>
      </div>

      <div class="feedback" :class="etat">{{ retour?.message }}</div>

      <div class="btn-group" style="justify-content:center;margin-top:1rem;">
        <button class="btn btn-ghost" :disabled="repondu" @click="passer">{{ t('passer') }}</button>
        <button class="btn btn-primary" :disabled="repondu" @click="valider">{{ t('valider') }}</button>
      </div>
    </QuestionJeu>

    <!-- Résultats -->
    <ResultatsJeu v-if="phase === 'resultats'" :bonnes="bonnes" :total="questions.length" :cle-fin="cleFin"
      @rejouer="jeu.recommencer" @reglages="jeu.quitter">
      <TableauCorrection :historique="historique">
        <template #question="{ entree }">{{ entree.question.a }} {{ entree.question.opLabel }} {{ entree.question.b }}</template>
      </TableauCorrection>
    </ResultatsJeu>
  </div>
</template>

<script setup>
// Calcul posé : la vue ne fait que les réglages et la grille de saisie (une case par chiffre). Niveaux, générateur et
// fiche : src/exercices/calcul-pose/ (definition.js, generateur.js, fiche.js).
import { ref, computed, nextTick } from 'vue'
import { useI18n, contenu } from '../../i18n'
import ConfigExercice from '../../components/ConfigExercice.vue'
import ChoixReglage from '../../components/ChoixReglage.vue'
import QuestionJeu from '../../components/QuestionJeu.vue'
import ResultatsJeu from '../../components/ResultatsJeu.vue'
import TableauCorrection from '../../components/TableauCorrection.vue'
import { useReglages } from '../../composables/useReglages'
import { useFicheExercice } from '../../composables/useFicheExercice'
import { useJeu } from '../../composables/useJeu'
import DEFINITION from '../../exercices/calcul-pose/definition'
import { INTERFACE, TEXTES } from '../../exercices/calcul-pose/textes'
import { questions as genererQuestions, questionsFiche, verifier, chiffresDonnes, SIGNES } from '../../exercices/calcul-pose/generateur'
import { fiche as ficheCalculPose } from '../../exercices/calcul-pose/fiche'

const { t } = useI18n(INTERFACE)
// Maths : le contenu (fiche) suit la langue de l'interface
const { config, langueContenu } = useReglages(DEFINITION, 'calcul_pose_config')
const T = contenu(TEXTES, () => langueContenu.value).t

// ── Jeu : un calcul à la fois ; erreur : la correction reste affichée un instant, puis on enchaîne ──
const chiffres = ref([])   // chiffres saisis, une case par colonne du résultat
const cases = []           // les <input>, pour passer d'une case à l'autre au clavier
const jeu = useJeu({
  generer: rng => genererQuestions({ niveau: config.value.niveau, reglages: config.value, rng, T }),
  verifier,
  messageErreur: (q, rep) => (rep ? '❌ ' + t('laBonneReponse', { r: q.reponse }) : ''),
  delai: 900,
  apresErreur: 'continuer',
  delaiErreur: 1400,
  surQuestion: q => {
    chiffres.value = Array(q?.cols ?? 0).fill('')
    cases.length = 0
    nextTick(() => cases[0]?.focus())
  },
})
const { phase, questions, q, bonnes, historique, retour, repondu, etat, cleFin } = jeu

// couleur de chaque case après la réponse : le chiffre est-il le bon ?
const etats = computed(() => {
  if (!repondu.value || !q.value) return []
  const attendus = q.value.attendu.padStart(q.value.cols, '0').split('')
  const donnes = chiffresDonnes({ chiffres: chiffres.value }).padStart(q.value.cols, '0').split('')
  return attendus.map((c, i) => (donnes[i] === c ? 'ok' : 'erreur'))
})

function surSaisie(e, ci) {
  const v = e.target.value.replace(/\D/g, '')
  chiffres.value[ci] = v.slice(-1)
  if (v && ci + 1 < chiffres.value.length) nextTick(() => cases[ci + 1]?.focus())
}
function surTouche(e, ci) {
  if (e.key === 'Backspace' && !chiffres.value[ci] && ci > 0) nextTick(() => cases[ci - 1]?.focus())
  if (e.key === 'Enter') valider()
  if (e.key === 'ArrowLeft' && ci > 0) nextTick(() => cases[ci - 1]?.focus())
  if (e.key === 'ArrowRight' && ci < chiffres.value.length - 1) nextTick(() => cases[ci + 1]?.focus())
}

function valider() {
  const rep = { chiffres: [...chiffres.value] }
  const donne = chiffresDonnes(rep)
  if (repondu.value || !donne) return
  jeu.repondre(rep, { donne })
}
// passer : la question compte comme une erreur, et on enchaîne aussitôt
function passer() {
  if (repondu.value) return
  jeu.passer({ donne: t('passe') })
  jeu.suivante()
}

// ── Fiche imprimable (aperçu + impression gérés par ConfigExercice) ──
const { mode, fiche, nouvelle } = useFicheExercice({
  tirer: rng => questionsFiche({ niveau: config.value.niveau, reglages: config.value, rng, T }),
  mettreEnPage: (questions, police) => ficheCalculPose({ questions, reglages: config.value, T, langue: langueContenu.value, ...police }),
})
</script>

<style scoped>
.aide-config { font-size: .8rem; color: #888; margin-top: .4rem; }
.pose-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 1.5rem 0;
}

.pose-grid {
  display: inline-grid;
  row-gap: .4rem;
  column-gap: 0;
}

.pose-row {
  display: contents;
}

.pose-sign {
  font-size: 2rem;
  font-weight: 900;
  text-align: center;
  padding: 0 .5rem;
  color: var(--bleu);
  line-height: 1;
}

.pose-cell {
  width: 2.4rem;
  text-align: center;
}

.pose-number {
  font-size: 2rem;
  font-weight: 800;
  line-height: 1.2;
}

.pose-separator {
  height: 3px;
  background: var(--texte);
  border-radius: 2px;
  margin: .3rem 0;
}

.pose-input {
  width: 2.4rem;
  height: 2.8rem;
  font-size: 1.8rem;
  font-weight: 800;
  text-align: center;
  border: 2px solid var(--gris-brd);
  border-radius: 6px;
  outline: none;
  transition: border-color .15s, background .15s;
  background: white;
  padding: 0;
}
.pose-input:focus   { border-color: var(--bleu); box-shadow: 0 0 0 3px rgba(74,144,226,.15); }
.pose-input.ok      { border-color: var(--vert); background: #f0faf0; }
.pose-input.erreur  { border-color: var(--rouge); background: #fef0f0; }

</style>
