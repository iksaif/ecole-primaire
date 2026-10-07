<template>
  <div class="container">
    <h1 class="section-heading">🔢 {{ t('suites.titre') }}</h1>

    <CadreExercice v-if="phase === 'config'" v-model:mode="mode" :fiche="fiche" :config="config"
      @commencer="jeu.demarrer" @regenerer="nouvelle">
      <ChoixReglage :definition="DEFINITION" cle="niveau" v-model="config.niveau" :titre="t('communs.niveau')" />
      <ChoixReglage :definition="DEFINITION" :niveau="config.niveau" cle="exercices" v-model="config.exercices"
        :titre="t('suites.exercices')" :libelles="{ poursuivre: t('suites.poursuivre'), complete: t('suites.complete'), regle: t('suites.regle') }" />
      <ChoixReglage :definition="DEFINITION" :niveau="config.niveau" cle="sens" v-model="config.sens"
        :titre="t('suites.sens')" :libelles="{ monte: t('suites.monte'), descend: t('suites.descend') }" />
      <ChoixReglage :definition="DEFINITION" :niveau="config.niveau" cle="pas" v-model="config.pas"
        :titre="t('suites.pas')" :libelle="p => t('suites.deEnDe', { pas: String(p) })" />
      <ChoixReglage v-if="mode === 'jouer'" :definition="DEFINITION" cle="nbQ" v-model="config.nbQ" :titre="t('communs.nbQuestions')" />
      <ChoixReglage v-else :definition="DEFINITION" cle="nbFiche" v-model="config.nbFiche" :titre="t('suites.nbSuitesFiche')" />
    </CadreExercice>

    <QuestionJeu v-if="phase === 'jeu' && q" :jeu="jeu">
      <ConsigneParlee class="consigne" :texte="t(consignes[q.type])" :auto="false" />
      <div class="suite">
        <template v-for="(n, i) in q.termes" :key="i">
          <SaisieReponse v-if="q.type !== 'regle' && i === q.trous[0]" v-model="saisie" type="nombre"
            class="exercise-input" :etat="etat" :disabled="repondu" focus aria-describedby="suites-retour" @entree="entree" />
          <span v-else class="terme">{{ n }}</span>
        </template>
      </div>
      <SaisieReponse v-if="q.type === 'regle'" v-model="saisie" type="nombre" class="exercise-input"
        :etat="etat" :disabled="repondu" focus aria-describedby="suites-retour" @entree="entree" />

      <RetourReponse id="suites-retour" :message="retour?.message" :etat="etat" />
      <div class="btn-group">
        <button v-if="!repondu" class="btn btn-primary" @click="valider">{{ t('communs.valider') }}</button>
        <button v-else-if="!retour?.ok" class="btn btn-primary" @click="jeu.suivante">{{ t('communs.suivant') }}</button>
      </div>
    </QuestionJeu>

    <ResultatsJeu v-if="phase === 'resultats'" :bonnes="bonnes" :total="questions.length" :cle-fin="cleFin"
      @rejouer="jeu.recommencer" @reglages="jeu.quitter">
      <TableauCorrection :historique="historique" />
    </ResultatsJeu>
  </div>
</template>

<script setup lang="ts">
// Suites de nombres — la vue : mince. Elle règle, pose et affiche ; les niveaux, les questions, la correction et la
// fiche sont dans src/exercices/suites/.
import { ref } from 'vue'
import { useLangue } from '../../langues/useLangue.ts'
import { traducteur } from '../../langues/catalogue.ts'
import CadreExercice from '../../noyau/CadreExercice.vue'
import ChoixReglage from '../../noyau/ChoixReglage.vue'
import QuestionJeu from '../../noyau/QuestionJeu.vue'
import SaisieReponse from '../../noyau/SaisieReponse.vue'
import RetourReponse from '../../noyau/RetourReponse.vue'
import ConsigneParlee from '../../noyau/ConsigneParlee.vue'
import ResultatsJeu from '../../noyau/ResultatsJeu.vue'
import TableauCorrection from '../../noyau/TableauCorrection.vue'
import { useReglages } from '../../noyau/useReglages.ts'
import { useJeu } from '../../noyau/useJeu.ts'
import { useFicheExercice } from '../../noyau/useFicheExercice.ts'
import DEFINITION from '../../exercices/suites/definition.ts'
import { CONTENU } from '../../exercices/suites/textes.ts'
import { questions as tirer, questionsFiche, verifier } from '../../exercices/suites/generateur.ts'
import type { Question, Reponse } from '../../exercices/suites/generateur.ts'
import { fiche as mettreEnPage } from '../../exercices/suites/fiche.ts'

const { t } = useLangue()
// Réglages mémorisés, ajustés au changement de niveau (politique commune du noyau). `config` est typé d'après la définition.
const { config, langueContenu } = useReglages(DEFINITION)
// T : les textes du contenu (CONTENU, textes.ts), dans la langue du contenu (ici celle de l'interface) ; la fiche le reçoit
const T = traducteur(CONTENU, () => langueContenu.value)

// ── Jeu ──
const consignes = { poursuivre: 'suites.consignePoursuivre', complete: 'suites.consigneComplete', regle: 'suites.consigneRegle' } as const
const saisie = ref<number | ''>('')
const jeu = useJeu<Question, Reponse>({
  generer: rng => tirer({ niveau: config.value.niveau, reglages: config.value, rng, T }),
  verifier,
  messageErreur: q => `❌ ${t('suites.laReponse', { attendu: q.attendu })}`,
  messageNuance: q => `🤏 ${t('suites.presque', { pas: q.pas })}`,
  surQuestion: () => { saisie.value = '' },   // le focus : l'attribut `focus` de SaisieReponse
})
const { phase, questions, q, bonnes, historique, retour, repondu, etat, cleFin } = jeu

function valider() {
  if (saisie.value !== '') jeu.repondre({ nombre: Number(saisie.value) }, { donne: String(saisie.value) })
}
// Entrée valide, puis passe à la suite après une erreur (après une bonne réponse, useJeu enchaîne seul)
function entree() {
  if (!repondu.value) valider()
  else if (!retour.value?.ok) jeu.suivante()
}

// ── Fiche imprimable (aperçu et impression : CadreExercice) ──
const { mode, fiche, nouvelle } = useFicheExercice({
  tirer: rng => questionsFiche({ niveau: config.value.niveau, reglages: config.value, rng, T }),
  mettreEnPage: (questions, police) => mettreEnPage({ questions, reglages: config.value, T, langue: langueContenu.value, ...police }),
})
</script>

<style scoped>
.consigne { font-size: 1.2rem; font-weight: 700; text-align: center; margin: .75rem 0 1.25rem; }
.suite { display: flex; align-items: center; justify-content: center; flex-wrap: wrap; gap: .75rem; margin-bottom: 1.25rem; }
.terme { font-size: 1.8rem; font-weight: 800; min-width: 3rem; text-align: center; }
.suite .exercise-input { width: 6rem; text-align: center; font-size: 1.5rem; }
.btn-group { justify-content: center; margin-top: 1rem; }
</style>
