<template>
  <div class="container">
    <h1 class="section-heading">🧩 {{ t('problemes.titre') }}</h1>

    <CadreExercice v-if="phase === 'config'" v-model:mode="mode" :fiche="fiche" :config="config" police
      @commencer="jeu.demarrer" @regenerer="nouvelle">
      <ChoixReglage :definition="DEFINITION" cle="niveau" v-model="config.niveau" :titre="t('communs.niveau')" />
      <ChoixReglage :definition="DEFINITION" :niveau="config.niveau" cle="categories" v-model="config.categories"
        :titre="t('problemes.typesProblemes')" :libelle="c => t(`problemes.cat_${c}`)" />
      <ChoixReglage :definition="DEFINITION" :niveau="config.niveau" cle="plage" v-model="config.plage"
        :titre="t('problemes.nombres')" :libelle="jusqua" />
      <ChoixReglage :definition="DEFINITION" cle="nbQ" v-model="config.nbQ" :titre="t('problemes.nbProblemes')" />
    </CadreExercice>

    <QuestionJeu v-if="phase === 'jeu' && q" :jeu="jeu">
      <div class="enonce">
        <p>{{ q.enonce }}</p>
        <p class="enonce-question">{{ q.question }}</p>
      </div>
      <!-- la voix : seulement dans une langue qui en a une (le bouton se masque sinon) -->
      <ConsigneParlee class="lecture" :texte="`${q.enonce} ${q.question}`" :auto="false" />

      <div class="reponse-ligne">
        <SaisieReponse v-model="saisie" type="nombre" class="exercise-input reponse-input" :etat="etat" placeholder="?"
          :disabled="repondu" focus aria-describedby="probleme-retour" @entree="entree" />
        <span class="unite">{{ unite(q, q.reponse) }}</span>
      </div>

      <RetourReponse id="probleme-retour" :message="retour?.message" :etat="etat" />
      <div v-if="repondu && !retour?.ok" class="calcul-correction">{{ q.calcul }}</div>

      <div class="btn-group actions-question">
        <button type="button" class="btn btn-ghost" :disabled="repondu" @click="passer">{{ t('problemes.passer') }}</button>
        <button v-if="!repondu" type="button" class="btn btn-primary" @click="valider">{{ t('communs.valider') }}</button>
        <button v-else-if="!retour?.ok" type="button" class="btn btn-primary" @click="jeu.suivante">{{ t('communs.suivant') }}</button>
      </div>
    </QuestionJeu>

    <ResultatsJeu v-if="phase === 'resultats'" :bonnes="bonnes" :total="questions.length" :cle-fin="cleFin"
      @rejouer="jeu.recommencer" @reglages="jeu.quitter">
      <TableauCorrection :historique="historique">
        <template #attendu="{ entree: ligne }"><span class="attendu-calcul">{{ ligne.question.calcul }}</span><br>→ {{ avecUnite(ligne.question, ligne.question.reponse) }}</template>
      </TableauCorrection>
    </ResultatsJeu>
  </div>
</template>

<script setup lang="ts">
// Problèmes : la vue ne fait que les réglages et le rendu d'un problème. Niveaux, générateur, modèles d'énoncés et fiche :
// src/exercices/problemes/ (definition.ts, generateur.ts, modeles-*.ts, fiche.ts) ; les textes : textes.ts.
import { ref } from 'vue'
import { useLangue } from '../../langues/useLangue.ts'
import { traducteur } from '../../langues/catalogue.ts'
import CadreExercice from '../../noyau/CadreExercice.vue'
import ChoixReglage from '../../noyau/ChoixReglage.vue'
import ConsigneParlee from '../../noyau/ConsigneParlee.vue'
import QuestionJeu from '../../noyau/QuestionJeu.vue'
import ResultatsJeu from '../../noyau/ResultatsJeu.vue'
import RetourReponse from '../../noyau/RetourReponse.vue'
import SaisieReponse from '../../noyau/SaisieReponse.vue'
import TableauCorrection from '../../noyau/TableauCorrection.vue'
import { useReglages } from '../../noyau/useReglages.ts'
import { useFicheExercice } from '../../noyau/useFicheExercice.ts'
import { useJeu } from '../../noyau/useJeu.ts'
import DEFINITION from '../../exercices/problemes/definition.ts'
import { CONTENU } from '../../exercices/problemes/textes.ts'
import { PLAGES } from '../../exercices/problemes/donnees.ts'
import type { Plage } from '../../exercices/problemes/donnees.ts'
import { questions as tirer, questionsFiche, verifier, unite, avecUnite } from '../../exercices/problemes/generateur.ts'
import type { Question, Reponse } from '../../exercices/problemes/generateur.ts'
import { fiche as mettreEnPage } from '../../exercices/problemes/fiche.ts'

const { t } = useLangue()
const { config, langueContenu } = useReglages(DEFINITION)
// Maths : le contenu (énoncés, fiche) suit la langue de l'interface
const T = traducteur(CONTENU, () => langueContenu.value)

// « Jusqu'à 100 » : le libellé d'une plage (la valeur du réglage est son identifiant)
const jusqua = (p: unknown): string => t('problemes.jusqua', { n: PLAGES[p as Plage] })

const saisie = ref<number | ''>('')
const jeu = useJeu<Question, Reponse>({
  generer: rng => tirer({ niveau: config.value.niveau, reglages: config.value, rng, T }),
  verifier,
  messageErreur: (q, rep) => (rep ? `❌ ${t('problemes.laBonneReponse', { r: avecUnite(q, q.reponse) })}` : ''),
  delai: 1200,
  surQuestion: () => { saisie.value = '' },
})
const { phase, questions, q, bonnes, historique, retour, repondu, etat, cleFin } = jeu

function valider() {
  if (repondu.value || saisie.value === '') return
  const val = String(saisie.value).trim()
  jeu.repondre({ texte: val }, { donne: avecUnite(q.value!, Number(val)) })
}
const entree = () => (repondu.value ? !retour.value?.ok && jeu.suivante() : valider())
// passer : la question compte comme une erreur, et on enchaîne aussitôt
function passer() {
  if (repondu.value) return
  jeu.passer({ donne: t('problemes.passe') })
  jeu.suivante()
}

// ── Fiche imprimable (aperçu et impression : CadreExercice) ──
const { mode, fiche, nouvelle } = useFicheExercice({
  tirer: rng => questionsFiche({ niveau: config.value.niveau, reglages: config.value, rng, T }),
  mettreEnPage: (questions, police) => mettreEnPage({ questions, reglages: config.value, T, langue: langueContenu.value, ...police }),
})
</script>

<style scoped>
.enonce {
  font-size: 1.35rem; line-height: 1.6; background: var(--gris-bg);
  border-left: 5px solid var(--orange); border-radius: 8px; padding: 1rem 1.25rem; margin: .5rem 0 1rem;
}
.enonce p + p { margin-top: .5rem; }
.enonce-question { font-weight: 800; }
.lecture { text-align: center; margin-bottom: 1rem; }
.reponse-ligne { display: flex; align-items: center; justify-content: center; gap: .75rem; }
.reponse-input { max-width: 10rem; }
.unite { font-size: 1.5rem; font-weight: 700; }
.calcul-correction { text-align: center; font-size: 1.3rem; font-weight: 800; color: var(--bleu); margin: .25rem 0 .5rem; }
.attendu-calcul { font-weight: 800; }
.actions-question { justify-content: center; margin-top: 1rem; }
.btn:disabled { opacity: .45; cursor: default; }
@media (max-width: 520px) { .enonce { font-size: 1.15rem; } }
</style>
