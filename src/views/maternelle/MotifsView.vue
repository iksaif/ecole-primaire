<template>
  <div class="container">
    <h1 class="section-heading">{{ DEFINITION.emoji }} {{ t('motifs.titre') }}</h1>

    <CadreExercice v-if="phase === 'config'" v-model:mode="mode" :fiche="fiche" :config="config"
      @commencer="jeu.demarrer" @regenerer="nouvelle">
      <ChoixReglage :definition="DEFINITION" cle="niveau" v-model="config.niveau" :titre="t('communs.niveau')" :libelle="libelleNiveau" />
      <ChoixReglage :definition="DEFINITION" :niveau="config.niveau" cle="mode" v-model="config.mode" :titre="t('motifs.exercice')"
        :libelle="m => (m === 'apres' ? '➡️ ' + t('motifs.apres') : '🔍 ' + t('motifs.trou'))" />
      <ChoixReglage :definition="DEFINITION" :niveau="config.niveau" cle="nbQ" v-model="config.nbQ" :titre="t('communs.nbQuestions')" />
    </CadreExercice>

    <QuestionJeu v-if="phase === 'jeu' && q" :jeu="jeu">
      <ConsigneParlee :key="jeu.index.value" class="consigne" :texte="t(config.mode === 'trou' ? 'motifs.consigneTrou' : 'motifs.consigneApres')" />
      <!-- la frise ; la case « ? » à la place attendue -->
      <div class="frise">
        <template v-for="(e, i) in frise" :key="i">
          <span v-if="i === q.place" class="perle vide" :class="{ trouvee: repondu }">{{ repondu ? q.elements[q.attendu] : '?' }}</span>
          <span v-else class="perle">{{ e === null ? '' : q.elements[e] }}</span>
        </template>
      </div>
      <ChoixReponses grand :titre="t(config.mode === 'trou' ? 'motifs.consigneTrou' : 'motifs.consigneApres')" :options="q.options" :bonne="q.bonne" :repondu="repondu"
        @choisir="i => jeu.repondre({ choix: i })" />
      <RetourReponse :message="retour?.message" :etat="etat" />
    </QuestionJeu>

    <!-- Résultats : la maternelle garde les étoiles -->
    <ResultatsEtoiles v-if="phase === 'resultats'" :bonnes="bonnes" :total="questions.length"
      @rejouer="jeu.recommencer" @reglages="jeu.quitter" />
  </div>
</template>

<script setup lang="ts">
// Les motifs : la vue ne fait que les réglages et le rendu d'une question. Niveaux, générateur et fiche : src/exercices/motifs/
// (definition.ts, generateur.ts, fiche.ts) ; les motifs eux-mêmes (types par niveau, suites) : motifs.ts.
import { computed } from 'vue'
import { useLangue } from '../../langues/useLangue.ts'
import { traducteur } from '../../langues/catalogue.ts'
import CadreExercice from '../../noyau/CadreExercice.vue'
import ChoixReglage from '../../noyau/ChoixReglage.vue'
import QuestionJeu from '../../noyau/QuestionJeu.vue'
import ChoixReponses from '../../noyau/ChoixReponses.vue'
import ConsigneParlee from '../../noyau/ConsigneParlee.vue'
import RetourReponse from '../../noyau/RetourReponse.vue'
import ResultatsEtoiles from '../../noyau/ResultatsEtoiles.vue'
import { useReglages } from '../../noyau/useReglages.ts'
import { useJeu } from '../../noyau/useJeu.ts'
import { useFicheExercice } from '../../noyau/useFicheExercice.ts'
import DEFINITION from '../../exercices/motifs/definition.ts'
import { CONTENU } from '../../exercices/motifs/textes.ts'
import { questions as tirer, questionsFiche, verifier } from '../../exercices/motifs/generateur.ts'
import type { Question, Reponse } from '../../exercices/motifs/generateur.ts'
import { fiche as ficheMotifs } from '../../exercices/motifs/fiche.ts'

const { t } = useLangue()
// niveau : celui de la barre du haut s'il est de maternelle
const { config, langueContenu } = useReglages(DEFINITION, { suivreClasse: true })
// T : les textes du contenu (CONTENU, textes.ts : fiche), dans la langue du contenu
const T = traducteur(CONTENU, () => langueContenu.value)

const libelleNiveau = (n: string): string => t(`motifs.niveau.${n as 'ps' | 'ms' | 'gs'}`)

// ── Jeu : une seule tentative, puis on enchaîne (maternelle) ──
const jeu = useJeu<Question, Reponse>({
  generer: rng => tirer({ niveau: config.value.niveau, reglages: config.value, rng, T }),
  verifier,
  messageErreur: () => t('motifs.regarde'),
  apresErreur: 1400,
  delai: 1400,
})
const { phase, questions, q, bonnes, retour, repondu, etat } = jeu
// en mode « après », la frise montre aussi la case « ? » au bout
const frise = computed<(number | null)[]>(() => (q.value ? (q.value.place >= q.value.motif.length ? [...q.value.motif, null] : q.value.motif) : []))

// ── Fiche imprimable (aperçu et impression : CadreExercice) : graine du lien, sinon tirée ──
const { mode, fiche, nouvelle } = useFicheExercice({
  tirer: rng => questionsFiche({ niveau: config.value.niveau, reglages: config.value, rng, T }),
  mettreEnPage: (tirage, police) => ficheMotifs({ questions: tirage, reglages: config.value, T, langue: langueContenu.value, ...police }),
})
</script>

<style scoped>
.consigne { font-size: 1.4rem; font-weight: 800; margin-bottom: 1.25rem; }
.frise { display: flex; flex-wrap: wrap; justify-content: center; gap: .4rem; padding: 1rem; background: var(--gris-bg); border-radius: 14px; margin-bottom: 1.5rem; }
.perle { font-size: 2.4rem; line-height: 1; width: 3.2rem; height: 3.2rem; display: inline-flex; align-items: center; justify-content: center; }
.perle.vide { border: 3px dashed var(--bleu); border-radius: 50%; color: var(--bleu); font-weight: 900; font-size: 1.8rem; }
.perle.vide.trouvee { border-style: solid; font-size: 2.4rem; }
</style>
