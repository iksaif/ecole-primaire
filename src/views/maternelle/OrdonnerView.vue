<template>
  <div class="container">
    <h1 class="section-heading">{{ DEFINITION.emoji }} {{ t('ranger.titre') }}</h1>

    <CadreExercice v-if="phase === 'config'" v-model:mode="mode" :fiche="fiche" :config="config"
      @commencer="jeu.demarrer" @regenerer="nouvelle">
      <ChoixReglage :definition="DEFINITION" cle="niveau" v-model="config.niveau" :titre="t('communs.niveau')" :libelle="libelleNiveau" />
      <ChoixReglage :definition="DEFINITION" :niveau="config.niveau" cle="sens" v-model="config.sens" :titre="t('ranger.petitGrand')"
        :libelle="s => `${ICONES_SENS[s]} ${t(`ranger.${s === 'mix' ? 'melange' : s}`)}`" />
      <ChoixReglage :definition="DEFINITION" :niveau="config.niveau" cle="taille" v-model="config.taille" :titre="t('ranger.combien')" />
      <ChoixReglage :definition="DEFINITION" :niveau="config.niveau" cle="nbQ" v-model="config.nbQ" :titre="t('communs.nbQuestions')" />
    </CadreExercice>

    <!-- Exercice -->
    <QuestionJeu v-if="phase === 'jeu' && q" :jeu="jeu">
      <ConsigneParlee :key="jeu.index.value" class="consigne" :texte="t(q.sens === 'croissant' ? 'ranger.rangeCroissant' : 'ranger.rangeDecroissant')" />

      <OrdonnerClics v-model="ordre" :elements="q.nombres" :verrou="repondu" :etat="etat" @valider="valider">
        <div class="fleche-hint">{{ q.sens === 'croissant' ? '→ ' + t('ranger.petitGrandMin') : '→ ' + t('ranger.grandPetitMin') }}</div>
      </OrdonnerClics>

      <RetourReponse :message="retour?.message" :etat="etat" />
    </QuestionJeu>

    <!-- Résultats : la maternelle garde les étoiles -->
    <ResultatsEtoiles v-if="phase === 'resultats'" :bonnes="bonnes" :total="questions.length"
      @rejouer="jeu.recommencer" @reglages="jeu.quitter" />
  </div>
</template>

<script setup lang="ts">
// Ranger les nombres : la vue ne fait que les réglages et le rendu d'une question. Niveaux, générateur et fiche :
// src/exercices/ranger/ (definition.ts, generateur.ts, fiche.ts). Le rangement par clics : <OrdonnerClics>.
import { ref } from 'vue'
import { useLangue } from '../../langues/useLangue.ts'
import { traducteur } from '../../langues/catalogue.ts'
import CadreExercice from '../../noyau/CadreExercice.vue'
import ChoixReglage from '../../noyau/ChoixReglage.vue'
import QuestionJeu from '../../noyau/QuestionJeu.vue'
import ConsigneParlee from '../../noyau/ConsigneParlee.vue'
import OrdonnerClics from '../../noyau/OrdonnerClics.vue'
import RetourReponse from '../../noyau/RetourReponse.vue'
import ResultatsEtoiles from '../../noyau/ResultatsEtoiles.vue'
import { useReglages } from '../../noyau/useReglages.ts'
import { useJeu } from '../../noyau/useJeu.ts'
import { useFicheExercice } from '../../noyau/useFicheExercice.ts'
import DEFINITION from '../../exercices/ranger/definition.ts'
import { CONTENU } from '../../exercices/ranger/textes.ts'
import { questions as tirer, questionsFiche, verifier, NOMBRE_MAX } from '../../exercices/ranger/generateur.ts'
import type { Question, Reponse } from '../../exercices/ranger/generateur.ts'
import { fiche as ficheOrdonner } from '../../exercices/ranger/fiche.ts'

const { t } = useLangue()
// clé historique des réglages mémorisés : l'exercice s'appelle « ranger » (adresse des fiches publiées), pas « ordonner »
const { config, langueContenu } = useReglages(DEFINITION, { cle: 'ordonner_config', suivreClasse: true })
const T = traducteur(CONTENU, () => langueContenu.value)
const ICONES_SENS: Readonly<Record<string, string>> = { croissant: '↗', decroissant: '↘', mix: '🔀' }
const libelleNiveau = (n: string): string => `${n === 'ms' ? '🌱' : '🌳'} ${t('ranger.nombresDe', { niv: n.toUpperCase(), n: NOMBRE_MAX[n as keyof typeof NOMBRE_MAX] ?? 0 })}`

// ── Jeu : une seule tentative, puis on enchaîne (maternelle) ──
const ordre = ref<number[]>([])   // indices des nombres touchés, dans l'ordre des clics
const jeu = useJeu<Question, Reponse>({
  generer: rng => tirer({ niveau: config.value.niveau, reglages: config.value, rng, T }),
  verifier,
  messageErreur: q => `❌ ${t('ranger.ordreCorrect', { ordre: q.bonne.join(' → ') })}`,
  apresErreur: 1400,
  delai: 1400,
  surQuestion: () => { ordre.value = [] },
})
const { phase, questions, q, bonnes, retour, repondu, etat } = jeu

function valider() {
  const qu = q.value
  if (!qu || repondu.value || ordre.value.length !== qu.nombres.length) return
  jeu.repondre({ ordre: ordre.value.map(i => qu.nombres[i]) })
}

// ── Fiche imprimable (aperçu et impression : CadreExercice) : graine du lien, sinon tirée ──
const { mode, fiche, nouvelle } = useFicheExercice({
  tirer: rng => questionsFiche({ niveau: config.value.niveau, reglages: config.value, rng, T }),
  mettreEnPage: (tirage, police) => ficheOrdonner({ questions: tirage, reglages: config.value, T, langue: langueContenu.value, ...police }),
})
</script>

<style scoped>
.consigne { font-size: 1.3rem; font-weight: 800; margin-bottom: 1.25rem; }
.fleche-hint { font-size: .85rem; color: var(--texte-doux); margin-bottom: .5rem; }
</style>
