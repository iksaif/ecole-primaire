<template>
  <div class="container">
    <h1 class="section-heading">🔁 {{ t('titre') }}</h1>

    <ConfigExercice v-if="phase === 'config'" :config="config" v-model:mode="mode" :fiche="fiche" police
      @commencer="jeu.demarrer" @regenerer="nouvelle">
      <ChoixReglage :definition="DEFINITION" cle="niveau" v-model="config.niveau" :titre="t('niveau')" :libelle="n => t('niv_' + n)" />
      <ChoixReglage :definition="DEFINITION" cle="mode" v-model="config.mode" :titre="t('exercice')"
        :libelle="m => (m === 'apres' ? '➡️ ' + t('apres') : '🔍 ' + t('trou'))" />
      <ChoixReglage :definition="DEFINITION" cle="nbQ" v-model="config.nbQ" :titre="t('nbQuestions')" />
    </ConfigExercice>

    <QuestionJeu v-if="phase === 'jeu' && q" :jeu="jeu">
      <ConsigneParlee :key="jeu.index.value" class="consigne" :texte="t(config.mode === 'trou' ? 'consigneTrou' : 'consigneApres')" />
      <!-- la frise ; la case « ? » à la place attendue -->
      <div class="frise">
        <template v-for="(e, i) in frise" :key="i">
          <span v-if="i === q.place" class="perle vide" :class="{ trouvee: repondu }">{{ repondu ? q.elements[q.attendu] : '?' }}</span>
          <span v-else class="perle">{{ q.elements[e] }}</span>
        </template>
      </div>
      <ChoixReponses grand :options="q.options" :bonne="q.bonne" :repondu="repondu" @choisir="i => jeu.repondre({ choix: i })" />
      <div class="feedback" :class="etat">{{ retour?.message }}</div>
    </QuestionJeu>

    <!-- Résultats : la maternelle garde les étoiles -->
    <ResultatsEtoiles v-if="phase === 'resultats'" :bonnes="bonnes" :total="questions.length"
      @rejouer="jeu.recommencer" @reglages="jeu.quitter" />
  </div>
</template>

<script setup>
// Les motifs : la vue ne fait que les réglages et le rendu d'une question. Niveaux, générateur et fiche :
// src/exercices/motifs/ (definition.js, generateur.js, fiche.js) ; les motifs eux-mêmes : src/utils/motifs.js.
import { computed } from 'vue'
import { useI18n, contenu } from '../../i18n'
import ConfigExercice from '../../components/ConfigExercice.vue'
import ChoixReglage from '../../components/ChoixReglage.vue'
import QuestionJeu from '../../components/QuestionJeu.vue'
import ChoixReponses from '../../components/ChoixReponses.vue'
import ConsigneParlee from '../../components/ConsigneParlee.vue'
import ResultatsEtoiles from '../../components/ResultatsEtoiles.vue'
import { useReglages } from '../../composables/useReglages'
import { useFicheExercice } from '../../composables/useFicheExercice'
import { useJeu } from '../../composables/useJeu'
import DEFINITION from '../../exercices/motifs/definition'
import { INTERFACE, TEXTES } from '../../exercices/motifs/textes'
import { questions as genererQuestions, questionsFiche, verifier } from '../../exercices/motifs/generateur'
import { fiche as ficheMotifs } from '../../exercices/motifs/fiche'

const { t } = useI18n(INTERFACE)
// niveau : celui de la barre du haut s'il est de maternelle
const { config, langueContenu } = useReglages(DEFINITION, 'motifs_config', { suivreClasse: true })
const T = contenu(TEXTES, () => langueContenu.value).t

// ── Jeu : une seule tentative, puis on enchaîne (maternelle) ──
const jeu = useJeu({
  generer: rng => genererQuestions({ niveau: config.value.niveau, reglages: config.value, rng, T }),
  verifier,
  messageErreur: () => t('regarde'),
  apresErreur: 'continuer',
  delai: 1400,
})
const { phase, questions, q, bonnes, retour, repondu, etat } = jeu
// en mode « après », la frise montre aussi la case « ? » au bout
const frise = computed(() => (q.value.place >= q.value.motif.length ? [...q.value.motif, null] : q.value.motif))

// ── Fiche imprimable (aperçu + impression gérés par ConfigExercice) ──
const { mode, fiche, nouvelle } = useFicheExercice({
  tirer: rng => questionsFiche({ niveau: config.value.niveau, reglages: config.value, rng, T }),
  mettreEnPage: (questions, police) => ficheMotifs({ questions, reglages: config.value, T, langue: langueContenu.value, ...police }),
})
</script>

<style scoped>
.consigne { font-size: 1.4rem; font-weight: 800; margin-bottom: 1.25rem; }
.frise { display: flex; flex-wrap: wrap; justify-content: center; gap: .4rem; padding: 1rem; background: var(--gris-bg); border-radius: 14px; margin-bottom: 1.5rem; }
.perle { font-size: 2.4rem; line-height: 1; width: 3.2rem; height: 3.2rem; display: inline-flex; align-items: center; justify-content: center; }
.perle.vide { border: 3px dashed var(--bleu); border-radius: 50%; color: var(--bleu); font-weight: 900; font-size: 1.8rem; }
.perle.vide.trouvee { border-style: solid; font-size: 2.4rem; }
</style>
