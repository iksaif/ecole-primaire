<template>
  <div class="container">
    <h1 class="section-heading">{{ DEFINITION.emoji }} {{ t('mesures.titre') }}</h1>

    <CadreExercice v-if="phase === 'config'" v-model:mode="mode" :fiche="fiche" :config="config"
      @commencer="jeu.demarrer" @regenerer="nouvelle">
      <template #default="{ mode: modeCourant }">
        <ChoixReglage :definition="DEFINITION" cle="niveau" v-model="config.niveau" :titre="t('communs.niveau')" />
        <ChoixReglage :definition="DEFINITION" :niveau="config.niveau" cle="exercices" v-model="config.exercices"
          :titre="t('communs.exercices')" :libelle="e => t(`mesures.exercices.${e}`)" />
        <ChoixReglage v-if="modeCourant === 'jouer' && config.exercices.includes('regle')" :definition="DEFINITION" cle="decale"
          v-model="config.decale" :titre="t('mesures.segmentsRegle')" :libelle="d => t(d ? 'mesures.pasToujours0' : 'mesures.commencent0')" />
        <ChoixReglage v-if="modeCourant === 'jouer'" :definition="DEFINITION" cle="nbQ" v-model="config.nbQ" :titre="t('communs.nbQuestions')" />
        <template v-if="modeCourant === 'imprimer'">
          <ChoixReglage v-if="config.exercices.includes('regle')" :definition="DEFINITION" cle="nbSegments"
            v-model="config.nbSegments" :titre="t('mesures.nbSegments')" />
          <p class="rappel-100">⚠️ {{ t('mesures.rappel100') }}</p>
        </template>
      </template>
    </CadreExercice>

    <QuestionJeu v-if="phase === 'jeu' && q" :jeu="jeu">
      <div class="consigne">{{ q.consigne }}</div>

      <!-- Dessin généré par le programme (règle, balance, broc, bouteilles) -->
      <div v-if="q.svg" class="illus" v-html="q.svg"></div>
      <div v-if="q.affiche" class="affiche">{{ q.affiche }}</div>

      <!-- Saisie d'un nombre -->
      <div v-if="q.mode === 'nombre'" class="saisie">
        <SaisieReponse v-model="reponse" type="nombre" class="exercise-input" :etat="etat" placeholder="?"
          :disabled="repondu" focus @entree="valider" />
        <span v-if="q.unite" class="unite-label">{{ q.unite }}</span>
      </div>
      <!-- Choix -->
      <ChoixReponses v-else :options="options" :bonne="bonne" :repondu="repondu" :titre="q.consigne" @choisir="choisir" />

      <RetourReponse :message="retour?.message" :etat="etat" />
      <div v-if="repondu && retour && !retour.ok && q.explication" class="explication">💡 {{ q.explication }}</div>

      <div class="btn-group" style="justify-content:center;margin-top:1rem;">
        <template v-if="!repondu">
          <button type="button" class="btn btn-ghost" @click="passer">{{ t('mesures.passer') }}</button>
          <button v-if="q.mode === 'nombre'" type="button" class="btn btn-primary" @click="valider">{{ t('communs.valider') }}</button>
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
// Les mesures : la vue ne fait que les réglages et le rendu d'une question. Niveaux, générateur (un module par type de question) et
// fiche : src/exercices/mesures/.
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
import DEFINITION from '../../exercices/mesures/definition.ts'
import { CONTENU } from '../../exercices/mesures/textes.ts'
import { questions as tirer, questionsFiche, verifier } from '../../exercices/mesures/generateur.ts'
import type { Question, Reponse } from '../../exercices/mesures/generateur.ts'
import { fiche as ficheMesures } from '../../exercices/mesures/fiche.ts'

const { t } = useLangue()
// Réglages mémorisés, ajustés au changement de niveau (useReglages) ; le contenu (énoncés, fiche) suit la langue de l'interface
const { config, langueContenu } = useReglages(DEFINITION)
const T = traducteur(CONTENU, () => langueContenu.value)

// ── Jeu ──
const reponse = ref<string | number>('')

const jeu = useJeu<Question, Reponse>({
  generer: rng => tirer({ niveau: config.value.niveau, reglages: config.value, rng, T, nb: config.value.nbQ }),
  verifier,
  // une question passée n'a pas de ❌ : on enchaîne aussitôt
  messageErreur: (q, rep) => `${rep ? '❌ ' : ''}${t('communs.bonneReponse')} : ${q.attendu}`,
  delai: 900,
  // champ vidé ; le focus : SaisieReponse (attribut focus)
  surQuestion: () => { reponse.value = '' },
})
const { phase, questions, q, bonnes, historique, retour, repondu, etat, cleFin } = jeu

const options = computed(() => (q.value?.choix ?? []).map(label => ({ label })))
const bonne = computed(() => (q.value?.choix ?? []).indexOf(String(q.value?.reponse)))

function valider(): void {
  const qu = q.value
  if (!qu || repondu.value || qu.mode !== 'nombre') return
  const v = String(reponse.value ?? '').trim().replace(',', '.')
  if (v === '') return
  jeu.repondre({ texte: v }, { donne: qu.unite ? `${v} ${qu.unite}` : v })
}

function choisir(i: number): void {
  const choix = q.value?.choix?.[i]
  if (choix === undefined) return
  jeu.repondre({ choix }, { donne: choix })
}

// passer : la question compte comme une erreur, et on enchaîne aussitôt
function passer(): void {
  if (repondu.value) return
  jeu.passer({ donne: t('mesures.passe') })
  jeu.suivante()
}

// ── Fiche imprimable (aperçu et impression : CadreExercice) : graine du lien, sinon tirée ──
const { mode, fiche, nouvelle } = useFicheExercice({
  tirer: rng => questionsFiche({ niveau: config.value.niveau, reglages: config.value, rng, T }),
  mettreEnPage: (tirage, police) => ficheMesures({ questions: tirage, reglages: config.value, T, langue: langueContenu.value, ...police }),
})
</script>

<style scoped>
.rappel-100 { border: 2px solid var(--orange); background: #fff6e8; color: #9a5a00; font-weight: 700; padding: .4rem .7rem; border-radius: 8px; font-size: .9rem; margin: .5rem 0 1rem; }
.consigne {
  font-size: 1.3rem;
  font-weight: 700;
  text-align: center;
  margin: .5rem 0 1rem;
  line-height: 1.4;
}
.illus {
  display: flex;
  justify-content: center;
  margin: .5rem 0 1rem;
}
.illus :deep(svg) { height: auto; }
.affiche {
  font-size: 2rem;
  font-weight: 900;
  text-align: center;
  margin: .5rem 0 1rem;
  white-space: pre-wrap;
}
.saisie {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: .6rem;
}
.saisie .exercise-input {
  width: 9rem;
  display: inline-block;
}
.unite-label {
  font-size: 1.8rem;
  font-weight: 800;
}
.explication {
  background: #fff8e1;
  border-left: 4px solid var(--orange);
  border-radius: 6px;
  padding: .6rem .8rem;
  font-size: 1.05rem;
  margin-top: .5rem;
}
@media (max-width: 520px) {
  .consigne { font-size: 1.1rem; }
  .affiche { font-size: 1.5rem; }
}
</style>
