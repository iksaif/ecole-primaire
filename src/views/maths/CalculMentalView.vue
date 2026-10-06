<template>
  <div class="container">
    <h1 class="section-heading">🧮 {{ t('calculMental.titre') }}</h1>

    <CadreExercice v-if="phase === 'config'" v-model:mode="mode" :fiche="fiche" :config="config"
      @commencer="jeu.demarrer" @regenerer="nouvelle">
      <template #default="{ mode: modeCourant }">
        <ChoixReglage :definition="DEFINITION" cle="niveau" v-model="config.niveau" :titre="t('communs.niveau')" />
        <ChoixReglage :definition="DEFINITION" :niveau="config.niveau" cle="ops" v-model="config.ops" :titre="t('calculMental.operations')"
          :libelle="op => libelleOp(op, config.niveau, T)" />
        <ChoixReglage v-if="avecTables" :definition="DEFINITION" :niveau="config.niveau" cle="tables" v-model="config.tables"
          :titre="t('calculMental.tables')" />
        <ChoixReglage v-if="modeCourant === 'jouer'" :definition="DEFINITION" cle="nbQ" v-model="config.nbQ" :titre="t('communs.nbQuestions')" />
        <ChoixReglage v-else :definition="DEFINITION" cle="nbFiche" v-model="config.nbFiche" :titre="t('calculMental.nbCalculsFiche')" />
        <ChoixReglage v-if="modeCourant === 'jouer'" :definition="DEFINITION" cle="temps" v-model="config.temps" :titre="t('calculMental.tempsParQuestion')"
          :libelle="s => (s === 0 ? t('calculMental.sansLimite') : `${s} s`)" />
      </template>
    </CadreExercice>

    <QuestionJeu v-if="phase === 'jeu' && q" :jeu="jeu">
      <Chronometre v-if="config.temps > 0" :restant="restant" :duree="config.temps" />

      <div class="exercise-question" :class="{ long: q.texte.length > 12 }">{{ q.texte }}</div>

      <SaisieReponse v-model="saisie" type="nombre" class="exercise-input" :etat="etat" placeholder="?" :disabled="repondu"
        focus aria-describedby="calcul-retour" @entree="valider" />

      <RetourReponse id="calcul-retour" :message="retour?.message" :etat="etat" />

      <div v-if="!repondu" class="btn-group actions-question">
        <button type="button" class="btn btn-ghost" @click="passer">{{ t('calculMental.passer') }}</button>
        <button type="button" class="btn btn-primary" @click="valider">{{ t('communs.valider') }}</button>
      </div>
    </QuestionJeu>

    <ResultatsJeu v-if="phase === 'resultats'" :bonnes="bonnes" :total="questions.length" :cle-fin="cleFin"
      @rejouer="jeu.recommencer" @reglages="jeu.quitter">
      <TableauCorrection :historique="historique" />
    </ResultatsJeu>
  </div>
</template>

<script setup lang="ts">
// Calcul mental : la vue ne fait que les réglages, le minuteur et le rendu d'une question. Niveaux, générateur et fiche :
// src/exercices/calcul-mental/ (definition.ts, generateur.ts, fiche.ts).
import { computed, ref, watch } from 'vue'
import { useLangue } from '../../langues/useLangue.ts'
import { traducteur } from '../../langues/catalogue.ts'
import CadreExercice from '../../noyau/CadreExercice.vue'
import ChoixReglage from '../../noyau/ChoixReglage.vue'
import Chronometre from '../../noyau/Chronometre.vue'
import QuestionJeu from '../../noyau/QuestionJeu.vue'
import SaisieReponse from '../../noyau/SaisieReponse.vue'
import RetourReponse from '../../noyau/RetourReponse.vue'
import ResultatsJeu from '../../noyau/ResultatsJeu.vue'
import TableauCorrection from '../../noyau/TableauCorrection.vue'
import { useReglages } from '../../noyau/useReglages.ts'
import { useJeu } from '../../noyau/useJeu.ts'
import { useMinuteur } from '../../noyau/useMinuteur.ts'
import { useFicheExercice } from '../../noyau/useFicheExercice.ts'
import DEFINITION, { DIVISION, FOIS } from '../../exercices/calcul-mental/definition.ts'
import { CONTENU } from '../../exercices/calcul-mental/textes.ts'
import { questions as tirer, questionsFiche, verifier, libelleOp } from '../../exercices/calcul-mental/generateur.ts'
import type { Question, Reponse } from '../../exercices/calcul-mental/generateur.ts'
import { fiche as mettreEnPage } from '../../exercices/calcul-mental/fiche.ts'

const { t } = useLangue()
const { config, langueContenu } = useReglages(DEFINITION)
// T : les textes du contenu (CONTENU, textes.ts : « Double de 7 = ? », libellés des opérations), dans la langue du contenu
const T = traducteur(CONTENU, () => langueContenu.value)

// Les tables se règlent au CE1 et au CE2 (cycle 3 : pas de réglage), quand l'opération en a besoin
const avecTables = computed(() => {
  const ops: readonly string[] = config.value.ops
  return (config.value.niveau === 'ce1' || config.value.niveau === 'ce2') && (ops.includes(FOIS) || ops.includes(DIVISION))
})

// ── Jeu : temps par question (minuteur), une erreur ou un temps écoulé enchaîne seul ──
const saisie = ref<number | ''>('')
const minuteur = useMinuteur()
const { restant } = minuteur

const jeu = useJeu<Question, Reponse>({
  generer: rng => tirer({ niveau: config.value.niveau, reglages: config.value, rng, T }),
  verifier,
  // rep null : passée ou temps écoulé
  messageErreur: (q, rep) => (rep === null ? t('calculMental.tempsEcoule', { r: q.attendu }) : `❌ ${t('calculMental.laBonneReponse', { r: q.attendu })}`),
  delai: 800,
  apresErreur: 1200,
  // champ vidé (focus : SaisieReponse) ; le minuteur repart pour la nouvelle question
  surQuestion: () => {
    saisie.value = ''
    minuteur.arreter()
    if (config.value.temps > 0) minuteur.demarrer(config.value.temps, { pas: 0.1, surFin: () => jeu.passer({ donne: t('calculMental.passe') }) })
  },
})
const { phase, questions, q, bonnes, historique, retour, repondu, etat, cleFin } = jeu
watch(phase, p => { if (p !== 'jeu') minuteur.arreter() })

function valider() {
  if (saisie.value === '' || repondu.value) return
  minuteur.arreter()
  jeu.repondre({ nombre: Number(saisie.value) }, { donne: String(saisie.value) })
}

// passer : la question compte comme une erreur, et on enchaîne aussitôt
function passer() {
  if (repondu.value) return
  minuteur.arreter()
  jeu.passer({ donne: t('calculMental.passe') })
  jeu.suivante()
}

// ── Fiche imprimable (aperçu et impression : CadreExercice) ──
const { mode, fiche, nouvelle } = useFicheExercice({
  tirer: rng => questionsFiche({ niveau: config.value.niveau, reglages: config.value, rng, T }),
  mettreEnPage: (questions, police) => mettreEnPage({ questions, reglages: config.value, T, langue: langueContenu.value, ...police }),
})
</script>

<style scoped>
.exercise-question.long { font-size: 2.3rem; }
@media (max-width: 520px) { .exercise-question.long { font-size: 1.7rem; } }
.actions-question { justify-content: center; margin-top: 1rem; }
</style>
