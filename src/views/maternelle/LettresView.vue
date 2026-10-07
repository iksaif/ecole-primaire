<template>
  <div class="container">
    <h1 class="section-heading">{{ DEFINITION.emoji }} {{ t('lettres.titre') }}</h1>

    <CadreExercice v-if="phase === 'config'" v-model:mode="mode" :fiche="fiche" :config="config"
      @commencer="jeu.demarrer" @regenerer="nouvelle">
      <template #default="{ mode: modeCourant }">
        <ChoixReglage :definition="DEFINITION" cle="niveau" v-model="config.niveau" :titre="t('communs.niveau')" />
        <ChoixReglage v-if="modeCourant === 'jouer'" cartes :definition="DEFINITION" :niveau="config.niveau" cle="mode" v-model="config.mode"
          :titre="t('lettres.exercice')" :libelle="m => t(`lettres.mode.${m}`)" :icone="m => ICONES[m]" :description="m => t(`lettres.modeDesc.${m}`)" />
        <ChoixReglage :definition="DEFINITION" :niveau="config.niveau" cle="ecritures" v-model="config.ecritures" :titre="t('lettres.ecritures')"
          :libelle="e => t(`lettres.ecriture.${e}`)" />
        <ChoixReglage :definition="DEFINITION" :niveau="config.niveau" cle="groupe" v-model="config.groupe" :titre="t('lettres.lettres')"
          :libelle="g => t(`lettres.groupe.${g}`)" />
        <ChoixReglage v-if="modeCourant === 'jouer'" :definition="DEFINITION" :niveau="config.niveau" cle="nbQ" v-model="config.nbQ" :titre="t('communs.nbQuestions')" />
        <p v-if="modeCourant === 'imprimer'" class="note-fiche">{{ t('lettres.noteFiche') }}</p>
      </template>
    </CadreExercice>

    <QuestionJeu v-if="phase === 'jeu' && q" :jeu="jeu">
      <div class="question">
        <!-- Écoute et trouve : la voix dit le nom, l'écran ne montre pas la lettre ; sans voix (breton), on montre la lettre dans l'autre écriture -->
        <ConsigneParlee v-if="ecoute" :key="jeu.index.value" class="question-label" :texte="t('lettres.montreMoi', { l: q.nom })">{{ t('lettres.ecouteEtTrouve') }}</ConsigneParlee>
        <template v-else>
          <ConsigneParlee :key="jeu.index.value" class="question-label" :texte="t('lettres.trouveEn', { en: t(`lettres.en.${q.ecriture}`) })" />
          <div class="lettre-display" :class="q.montre.ecriture">{{ q.montre.texte }}</div>
        </template>

        <ChoixReponses grand :titre="consigne" :options="q.options" :bonne="q.bonne" :repondu="repondu" @choisir="i => jeu.repondre({ choix: i })">
          <template #default="{ option }"><span class="lettre-choix" :class="q.ecriture">{{ option.label }}</span></template>
        </ChoixReponses>

        <RetourReponse :message="retour?.message" :etat="etat" />
        <button v-if="repondu" type="button" class="btn btn-primary suite" @click="jeu.suivante">{{ t('communs.suivant') }}</button>
      </div>
    </QuestionJeu>

    <ResultatsJeu v-if="phase === 'resultats'" :bonnes="bonnes" :total="questions.length" :cle-fin="cleFin"
      @rejouer="jeu.recommencer" @reglages="jeu.quitter" />
  </div>
</template>

<script setup lang="ts">
// Les lettres : la vue ne fait que les réglages et le rendu d'une question. Niveaux, générateur et fiche : src/exercices/lettres/
// (definition.ts, generateur.ts, fiche.ts). Le contenu (alphabet, fiche) suit la langue du contenu (textes.ts : alphabet breton en breton).
// Revue du 2026-10-07 (plans/critique-lettres-2026-10-07.md) : nom dit à voix haute, écritures par classe, polices scolaires.
import { computed, watch } from 'vue'
import { useLangue } from '../../langues/useLangue.ts'
import { traducteur } from '../../langues/catalogue.ts'
import CadreExercice from '../../noyau/CadreExercice.vue'
import ChoixReglage from '../../noyau/ChoixReglage.vue'
import QuestionJeu from '../../noyau/QuestionJeu.vue'
import ConsigneParlee from '../../noyau/ConsigneParlee.vue'
import { useTTS } from '../../noyau/useTTS.ts'
import { chargerPolicesEcran, FAMILLE_CURSIVE, FAMILLE_SCRIPT } from '../../noyau/policesEcran.ts'
import ChoixReponses from '../../noyau/ChoixReponses.vue'
import RetourReponse from '../../noyau/RetourReponse.vue'
import ResultatsJeu from '../../noyau/ResultatsJeu.vue'
import { useReglages } from '../../noyau/useReglages.ts'
import { useJeu } from '../../noyau/useJeu.ts'
import { useFicheExercice } from '../../noyau/useFicheExercice.ts'
import DEFINITION from '../../exercices/lettres/definition.ts'
import { CONTENU } from '../../exercices/lettres/textes.ts'
import { questions as tirer, questionsFiche, verifier } from '../../exercices/lettres/generateur.ts'
import type { Question, Reponse } from '../../exercices/lettres/generateur.ts'
import { fiche as ficheLettres } from '../../exercices/lettres/fiche.ts'

const { t, langue } = useLangue()
// les lettres s'affichent dans les écritures de la classe : Andika (capitale, script : a et g à un œil), Playwrite FR Trad (attaché)
chargerPolicesEcran()
const { peutParler, parler } = useTTS()
const { config, langueContenu } = useReglages(DEFINITION, { suivreClasse: true })
// T : les textes du contenu (CONTENU, textes.ts : alphabet, fiche), dans la langue du contenu
const T = traducteur(CONTENU, () => langueContenu.value)
const ICONES = { reconnaitre: '👂', majuscule: '🔠' } as const

// ── Jeu : on attend « Suivant » après chaque réponse ──
const jeu = useJeu<Question, Reponse>({
  generer: rng => tirer({ niveau: config.value.niveau, reglages: config.value, rng, T }),
  verifier,
  messageErreur: q => t('lettres.cetait', { r: q.attendu }),
  delai: null,
})
const { phase, questions, q, bonnes, retour, repondu, etat, cleFin } = jeu
// « Écoute et trouve » a besoin d'une voix dans la langue de l'interface ; sinon, la lettre est montrée dans l'autre écriture
const ecoute = computed(() => q.value?.mode === 'reconnaitre' && peutParler(langue.value))
const consigne = computed(() => (!q.value ? '' : ecoute.value ? t('lettres.ecouteEtTrouve') : t('lettres.trouveEn', { en: t(`lettres.en.${q.value.ecriture}`) })))
// après chaque réponse, la voix dit le nom de la lettre (c'est le moment de l'apprendre)
watch(repondu, r => { if (r && q.value) parler(t('lettres.cEst', { l: q.value.nom }), langue.value) })

// ── Fiche imprimable (aperçu et impression : CadreExercice) : graine du lien, sinon tirée ──
const { mode, fiche, nouvelle } = useFicheExercice({
  tirer: rng => questionsFiche({ niveau: config.value.niveau, reglages: config.value, rng, T }),
  mettreEnPage: (tirage, police) => ficheLettres({ questions: tirage, reglages: config.value, T, langue: langueContenu.value, ...police }),
})
</script>

<style scoped>
.note-fiche { color: #666; font-size: .95rem; margin: 0; }
.question { text-align: center; }
.lettre-display {
  font-size: 5rem; font-weight: 900; color: var(--bleu);
  line-height: 1.15; margin: .5rem 0 1.5rem;
}
/* écritures : capitale et script en Andika, attaché en Playwrite FR Trad (v-bind : familles de policesEcran.ts) */
.lettre-display, .lettre-choix { font-family: v-bind(FAMILLE_SCRIPT); }
.lettre-display.cursive, .lettre-choix.cursive { font-family: v-bind(FAMILLE_CURSIVE); font-weight: 400; }
.lettre-choix { font-size: 2.2rem; font-weight: 700; }
/* la cursive a de grands jambages (p, q, g) : plus d'interligne pour qu'ils restent dans le bouton */
.lettre-choix.cursive { font-size: 1.9rem; line-height: 2.4; display: inline-block; }
.lettre-display.cursive { line-height: 1.6; }
.question-label { font-size: 1rem; font-weight: 600; color: #555; margin-bottom: .75rem; }
.suite { margin-top: 1rem; }
</style>
