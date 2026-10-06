<template>
  <div class="container">
    <h1 class="section-heading">🔢 {{ t('exemple.titre') }}</h1>

    <CadreExercice v-if="phase === 'config'" v-model:mode="mode" :fiche="fiche" :config="config"
      @commencer="jeu.demarrer" @regenerer="nouvelle">
      <ChoixReglage :definition="DEFINITION" cle="niveau" v-model="config.niveau" :titre="t('communs.niveau')" />
      <ChoixReglage :definition="DEFINITION" :niveau="config.niveau" cle="exercices" v-model="config.exercices"
        :titre="t('exemple.exercices')" :libelles="{ regle: t('exemple.regle'), complete: t('exemple.complete') }" />
      <ChoixReglage :definition="DEFINITION" :niveau="config.niveau" cle="sens" v-model="config.sens"
        :titre="t('exemple.sens')" :libelles="{ monte: t('exemple.monte'), descend: t('exemple.descend') }" />
      <ChoixReglage :definition="DEFINITION" :niveau="config.niveau" cle="pas" v-model="config.pas"
        :titre="t('exemple.pas')" :libelle="p => t('exemple.deEnDe', { pas: String(p) })" />
      <ChoixReglage v-if="mode === 'jouer'" :definition="DEFINITION" cle="nbQ" v-model="config.nbQ" :titre="t('communs.nbQuestions')" />
    </CadreExercice>

    <QuestionJeu v-if="phase === 'jeu' && q" :jeu="jeu">
      <ConsigneParlee class="consigne" :texte="t(q.type === 'complete' ? 'exemple.consigneComplete' : 'exemple.consigneRegle')" :auto="false" />
      <div class="suite">
        <template v-for="(n, i) in q.termes" :key="i">
          <SaisieReponse v-if="q.type === 'complete' && i === q.trou" v-model="saisie" type="nombre"
            class="exercise-input" :etat="etat" :disabled="repondu" focus aria-describedby="exemple-retour" @entree="entree" />
          <span v-else class="terme">{{ n }}</span>
        </template>
      </div>
      <SaisieReponse v-if="q.type === 'regle'" v-model="saisie" type="nombre" class="exercise-input"
        :etat="etat" :disabled="repondu" focus aria-describedby="exemple-retour" @entree="entree" />

      <RetourReponse id="exemple-retour" :message="retour?.message" :etat="etat" />
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
// Exemple d'exercice — la vue : mince. Elle règle, pose et affiche ; les niveaux, les questions, la correction et la
// fiche sont dans src/exercices/exemple/. Hors du noyau (src/noyau/), elle n'importe que le site (i18n).
// Cadre de la page : réglages et fiche (CadreExercice), une question (QuestionJeu), la fin de partie (ResultatsJeu).
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
import DEFINITION from '../../exercices/exemple/definition.ts'
import { CONTENU } from '../../exercices/exemple/textes.ts'
import { questions as tirer, questionsFiche, verifier } from '../../exercices/exemple/generateur.ts'
import type { Question, Reponse } from '../../exercices/exemple/generateur.ts'
import { fiche as mettreEnPage } from '../../exercices/exemple/fiche.ts'

const { t } = useLangue()
// Réglages mémorisés, ajustés au changement de niveau (politique commune du noyau). `config` est typé d'après la définition.
const { config, langueContenu } = useReglages(DEFINITION)
// T : les textes du contenu (CONTENU, textes.ts), dans la langue du contenu (ici celle de l'interface) ; le générateur et la fiche le reçoivent
// Libellés des choix : `libelles` de ChoixReglage, un texte de l'interface (section `exemple`) par valeur de réglage (une valeur oubliée ne compile pas)
const T = traducteur(CONTENU, () => langueContenu.value)

// ── Jeu ──
const saisie = ref<number | ''>('')
const jeu = useJeu<Question, Reponse>({
  generer: rng => tirer({ niveau: config.value.niveau, reglages: config.value, rng, T }),
  verifier,
  messageErreur: q => `❌ ${t('exemple.laReponse', { attendu: q.attendu })}`,
  messageNuance: q => `🤏 ${t('exemple.presque', { pas: q.pas })}`,
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
