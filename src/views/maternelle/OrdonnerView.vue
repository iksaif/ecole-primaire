<template>
  <div class="container">
    <h1 class="section-heading">🔢 {{ t('titre') }}</h1>

    <!-- Config -->
    <ConfigExercice v-if="phase === 'config'" :config="config" v-model:mode="mode" :fiche="fiche" police
      @commencer="jeu.demarrer" @regenerer="nouvelle">
      <ChoixReglage :definition="DEFINITION" cle="niveau" v-model="config.niveau" :titre="t('niveau')"
        :libelle="n => `${n === 'ms' ? '🌱' : '🌳'} ${t('nombresDe', { niv: n.toUpperCase(), n: NOMBRE_MAX[n] })}`" />
      <ChoixReglage :definition="DEFINITION" cle="sens" v-model="config.sens" :titre="t('petitGrand')"
        :libelle="s => ({ croissant: '↗ ', decroissant: '↘ ', mix: '🔀 ' })[s] + t(s === 'mix' ? 'melange' : s)" />
      <ChoixReglage :definition="DEFINITION" cle="taille" v-model="config.taille" :titre="t('combien')" />
      <ChoixReglage :definition="DEFINITION" cle="nbQ" v-model="config.nbQ" :titre="t('nbQuestions')" />
    </ConfigExercice>

    <!-- Exercice -->
    <QuestionJeu v-if="phase === 'jeu' && q" :jeu="jeu">
      <ConsigneParlee :key="jeu.index.value" class="consigne" :texte="t(q.sens === 'croissant' ? 'rangeCroissant' : 'rangeDecroissant')" />

      <OrdonnerClics v-model="ordre" :elements="q.nombres" :verrou="repondu" :etat="etat" @valider="valider">
        <div class="fleche-hint">{{ q.sens === 'croissant' ? '→ ' + t('petitGrandMin') : '→ ' + t('grandPetitMin') }}</div>
      </OrdonnerClics>

      <div class="feedback" :class="etat">{{ retour?.message }}</div>
    </QuestionJeu>

    <!-- Résultats : la maternelle garde les étoiles -->
    <ResultatsEtoiles v-if="phase === 'resultats'" :bonnes="bonnes" :total="questions.length"
      @rejouer="jeu.recommencer" @reglages="jeu.quitter" />
  </div>
</template>

<script setup>
// Ranger les nombres : la vue ne fait que les réglages et le rendu d'une question. Niveaux, générateur et fiche :
// src/exercices/ordonner/ (definition.js, generateur.js, fiche.js). Le rangement par clics : <OrdonnerClics>.
import { ref } from 'vue'
import { useI18n, contenu } from '../../i18n'
import ConfigExercice from '../../components/ConfigExercice.vue'
import ChoixReglage from '../../components/ChoixReglage.vue'
import QuestionJeu from '../../components/QuestionJeu.vue'
import ConsigneParlee from '../../components/ConsigneParlee.vue'
import OrdonnerClics from '../../components/OrdonnerClics.vue'
import ResultatsEtoiles from '../../components/ResultatsEtoiles.vue'
import { useReglages } from '../../composables/useReglages'
import { useFicheExercice } from '../../composables/useFicheExercice'
import { useJeu } from '../../composables/useJeu'
import DEFINITION from '../../exercices/ordonner/definition'
import { INTERFACE, TEXTES } from '../../exercices/ordonner/textes'
import { questions as genererQuestions, questionsFiche, verifier, NOMBRE_MAX } from '../../exercices/ordonner/generateur'
import { fiche as ficheOrdonner } from '../../exercices/ordonner/fiche'

const { t } = useI18n(INTERFACE)
const { config, langueContenu } = useReglages(DEFINITION, 'ordonner_config', { suivreClasse: true })
const T = contenu(TEXTES, () => langueContenu.value).t

// ── Jeu : une seule tentative, puis on enchaîne (maternelle) ──
const ordre = ref([])   // indices des nombres touchés, dans l'ordre des clics
const jeu = useJeu({
  generer: rng => genererQuestions({ niveau: config.value.niveau, reglages: config.value, rng, T }),
  verifier,
  messageErreur: q => `❌ ${t('ordreCorrect', { ordre: q.bonne.join(' → ') })}`,
  apresErreur: 'continuer',
  delai: 1400,
  surQuestion: () => { ordre.value = [] },
})
const { phase, questions, q, bonnes, retour, repondu, etat } = jeu

function valider() {
  if (!repondu.value && ordre.value.length === q.value.nombres.length) jeu.repondre({ ordre: ordre.value.map(i => q.value.nombres[i]) })
}

// ── Fiche imprimable (aperçu + impression gérés par ConfigExercice) ──
const { mode, fiche, nouvelle } = useFicheExercice({
  tirer: rng => questionsFiche({ niveau: config.value.niveau, reglages: config.value, rng, T }),
  mettreEnPage: (questions, police) => ficheOrdonner({ questions, reglages: config.value, T, langue: langueContenu.value, ...police }),
})
</script>

<style scoped>
.consigne { font-size: 1.3rem; font-weight: 800; margin-bottom: 1.25rem; }
.fleche-hint { font-size: .85rem; color: #aaa; margin-bottom: .5rem; }
</style>
