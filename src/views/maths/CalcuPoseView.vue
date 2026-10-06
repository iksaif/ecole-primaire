<template>
  <div class="container">
    <h1 class="section-heading">📐 {{ t('calculPose.titre') }}</h1>

    <!-- Config -->
    <CadreExercice v-if="phase === 'config'" v-model:mode="mode" :fiche="fiche" :config="config"
      @commencer="jeu.demarrer" @regenerer="nouvelle">
      <template #default="{ mode: modeCourant }">
        <ChoixReglage :definition="DEFINITION" cle="niveau" v-model="config.niveau" :titre="t('communs.niveau')" />
        <ChoixReglage :definition="DEFINITION" :niveau="config.niveau" cle="op" v-model="config.op" :titre="t('calculPose.operation')"
          :libelle="libelleOp">
          <div v-if="config.niveau === 'cp'" class="aide-config">{{ t('calculPose.aideNiveaux') }}</div>
        </ChoixReglage>
        <ChoixReglage :definition="DEFINITION" :niveau="config.niveau" cle="taille" v-model="config.taille" :titre="t('calculPose.taille')"
          :libelle="n => (n === '1' ? t('calculPose.chiffre1') : t('calculPose.chiffres', { n }))" />
        <ChoixReglage v-if="config.taille !== '1'" :definition="DEFINITION" :niveau="config.niveau" cle="retenue" v-model="config.retenue"
          :titre="t('calculPose.retenue')" :libelle="r => t(r === 'non' ? 'calculPose.sansRetenue' : r === 'oui' ? 'calculPose.avecRetenue' : 'calculPose.melange')" />
        <ChoixReglage v-if="modeCourant === 'jouer'" :definition="DEFINITION" cle="nbQ" v-model="config.nbQ" :titre="t('calculPose.nbExercices')" />
        <ChoixReglage v-else :definition="DEFINITION" cle="nbFiche" v-model="config.nbFiche" :titre="t('calculPose.nbExercices')" />
      </template>
    </CadreExercice>

    <!-- Exercice -->
    <QuestionJeu v-if="phase === 'jeu' && q" :jeu="jeu">
      <!-- Colonne de calcul posé -->
      <div class="pose-container">
        <div class="pose-grid" role="group" :aria-label="q.texte">
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
            <input v-for="(_, ci) in q.chiffresR" :key="'r' + ci" :ref="el => (cases[ci] = el as HTMLInputElement | null)" v-model="chiffres[ci]"
              class="pose-input" :class="etats[ci]" type="text" inputmode="numeric" maxlength="1" autocomplete="off"
              autocorrect="off" spellcheck="false" :disabled="repondu" :aria-label="t('calculPose.chiffreN', { n: ci + 1 })"
              aria-describedby="pose-retour" @input="surSaisie($event, ci)" @keydown="surTouche($event, ci)">
          </div>
        </div>
      </div>

      <RetourReponse id="pose-retour" :message="retour?.message" :etat="etat" />

      <div class="btn-group" style="justify-content:center;margin-top:1rem;">
        <button type="button" class="btn btn-ghost" :disabled="repondu" @click="passer">{{ t('calculPose.passer') }}</button>
        <button type="button" class="btn btn-primary" :disabled="repondu" @click="valider">{{ t('communs.valider') }}</button>
      </div>
    </QuestionJeu>

    <!-- Résultats -->
    <ResultatsJeu v-if="phase === 'resultats'" :bonnes="bonnes" :total="questions.length" :cle-fin="cleFin"
      @rejouer="jeu.recommencer" @reglages="jeu.quitter">
      <TableauCorrection :historique="historique" />
    </ResultatsJeu>
  </div>
</template>

<script setup lang="ts">
// Calcul posé : la vue ne fait que les réglages et la grille de saisie (une case par chiffre). Niveaux, générateur et
// fiche : src/exercices/calcul-pose/ (definition.ts, generateur.ts, fiche.ts).
import { ref, computed, nextTick } from 'vue'
import { useLangue } from '../../langues/useLangue.ts'
import { traducteur } from '../../langues/catalogue.ts'
import CadreExercice from '../../noyau/CadreExercice.vue'
import ChoixReglage from '../../noyau/ChoixReglage.vue'
import QuestionJeu from '../../noyau/QuestionJeu.vue'
import RetourReponse from '../../noyau/RetourReponse.vue'
import ResultatsJeu from '../../noyau/ResultatsJeu.vue'
import TableauCorrection from '../../noyau/TableauCorrection.vue'
import { useReglages } from '../../noyau/useReglages.ts'
import { useFicheExercice } from '../../noyau/useFicheExercice.ts'
import { useJeu } from '../../noyau/useJeu.ts'
import DEFINITION from '../../exercices/calcul-pose/definition.ts'
import { CONTENU } from '../../exercices/calcul-pose/textes.ts'
import { questions as tirer, questionsFiche, verifier, chiffresDonnes, SIGNES } from '../../exercices/calcul-pose/generateur.ts'
import type { Question, Reponse } from '../../exercices/calcul-pose/generateur.ts'
import { fiche as mettreEnPage } from '../../exercices/calcul-pose/fiche.ts'

const { t } = useLangue()
// Réglages mémorisés, ajustés au changement de niveau ; maths : le contenu (fiche) suit la langue de l'interface
const { config, langueContenu } = useReglages(DEFINITION)
const T = traducteur(CONTENU, () => langueContenu.value)
// le libellé de chaque opération : sa clé dans l'interface (calculPose.addition…)
const LIBELLE_OP = { add: 'addition', sou: 'soustraction', mul: 'multiplication', mix: 'melange' } as const
const libelleOp = (o: keyof typeof LIBELLE_OP): string => (o === 'mix' ? '' : `${SIGNES[o]} `) + t(`calculPose.${LIBELLE_OP[o]}`)

// ── Jeu : un calcul à la fois ; erreur : la correction reste affichée un instant, puis on enchaîne ──
const chiffres = ref<string[]>([])   // chiffres saisis, une case par colonne du résultat
const cases: (HTMLInputElement | null)[] = []   // les <input>, pour passer d'une case à l'autre au clavier
const jeu = useJeu<Question, Reponse>({
  generer: rng => tirer({ niveau: config.value.niveau, reglages: config.value, rng, T }),
  verifier,
  messageErreur: (q, rep) => (rep ? '❌ ' + t('calculPose.laBonneReponse', { r: q.reponse }) : ''),
  delai: 900,
  apresErreur: 1400,
  surQuestion: q => {
    chiffres.value = Array(q.cols).fill('')
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

function surSaisie(e: Event, ci: number) {
  const v = (e.target as HTMLInputElement).value.replace(/\D/g, '')
  chiffres.value[ci] = v.slice(-1)
  if (v && ci + 1 < chiffres.value.length) nextTick(() => cases[ci + 1]?.focus())
}
function surTouche(e: KeyboardEvent, ci: number) {
  if (e.key === 'Backspace' && !chiffres.value[ci] && ci > 0) nextTick(() => cases[ci - 1]?.focus())
  if (e.key === 'Enter') valider()
  if (e.key === 'ArrowLeft' && ci > 0) nextTick(() => cases[ci - 1]?.focus())
  if (e.key === 'ArrowRight' && ci < chiffres.value.length - 1) nextTick(() => cases[ci + 1]?.focus())
}

function valider() {
  const rep: Reponse = { chiffres: [...chiffres.value] }
  const donne = chiffresDonnes(rep)
  if (repondu.value || !donne) return
  jeu.repondre(rep, { donne })
}
// passer : la question compte comme une erreur, et on enchaîne aussitôt
function passer() {
  if (repondu.value) return
  jeu.passer({ donne: t('calculPose.passe') })
  jeu.suivante()
}

// ── Fiche imprimable (aperçu et impression : CadreExercice) ──
const { mode, fiche, nouvelle } = useFicheExercice({
  tirer: rng => questionsFiche({ niveau: config.value.niveau, reglages: config.value, rng, T }),
  mettreEnPage: (questions, police) => mettreEnPage({ questions, reglages: config.value, T, langue: langueContenu.value, ...police }),
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
