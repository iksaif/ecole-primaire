<template>
  <div class="container">
    <h1 class="section-heading">{{ DEFINITION.emoji }} {{ t('compter.titre') }}</h1>

    <CadreExercice v-if="phase === 'config'" v-model:mode="mode" :fiche="fiche" :config="config"
      @commencer="jeu.demarrer" @regenerer="nouvelle">
      <template #default="{ mode: modeCourant }">
        <ChoixReglage :definition="DEFINITION" cle="niveau" v-model="config.niveau" :titre="t('communs.niveau')" :libelle="libelleNiveau" />
        <ChoixReglage :definition="DEFINITION" :niveau="config.niveau" cle="nbQ" v-model="config.nbQ" :titre="t('communs.nbQuestions')" />
        <ChoixReglage v-if="modeCourant === 'imprimer' && config.niveau !== 'ps'" :definition="DEFINITION" :niveau="config.niveau"
          cle="reponse" v-model="config.reponse" :titre="t('compter.reponseFiche')" :libelle="r => (r === 'ecrire' ? '✏️ ' + t('compter.ecrire') : '⭕ ' + t('compter.entourer'))" />
      </template>
    </CadreExercice>

    <!-- Exercice -->
    <QuestionJeu v-if="phase === 'jeu' && q" :jeu="jeu">
      <!-- Objets à compter -->
      <ConsigneParlee :key="jeu.index.value" class="consigne" :texte="t('compter.combien', { nom: nomObjet(q.objet, T) })" />
      <div :key="jeu.index.value" class="objets-grille" v-html="htmlCollection(q.nb, q.emoji, 'objet')"></div>

      <!-- Choix de réponse ; PS : la quantité en constellation de points (pas de chiffre seul) -->
      <ChoixReponses grand :titre="t('compter.combien', { nom: nomObjet(q.objet, T) })" :options="q.options" :bonne="q.bonne" :repondu="repondu" :libelle="ps ? libelleChoix : null" @choisir="i => jeu.repondre({ choix: i })">
        <template #default="{ option }">
          <span v-if="ps" v-html="htmlConstellation(option.valeur, 'points')"></span>
          <template v-else>{{ option.label }}</template>
        </template>
      </ChoixReponses>

      <RetourReponse :message="retour?.message" :etat="etat" />
    </QuestionJeu>

    <!-- Résultats : la maternelle garde les étoiles -->
    <ResultatsEtoiles v-if="phase === 'resultats'" :bonnes="bonnes" :total="questions.length"
      @rejouer="jeu.recommencer" @reglages="jeu.quitter" />
  </div>
</template>

<script setup lang="ts">
// Compter les objets : la vue ne fait que les réglages et le rendu d'une question. Niveaux, générateur et fiche :
// src/exercices/compter/ (definition.ts, generateur.ts, fiche.ts) ; les objets et les points : src/dessins/collections.ts.
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
import DEFINITION from '../../exercices/compter/definition.ts'
import { CONTENU } from '../../exercices/compter/textes.ts'
import { questions as tirer, questionsFiche, verifier, nomObjet, NOMBRE_MAX } from '../../exercices/compter/generateur.ts'
import type { Question, Reponse } from '../../exercices/compter/generateur.ts'
import { fiche as ficheCompter } from '../../exercices/compter/fiche.ts'
import { htmlCollection, htmlConstellation } from '../../dessins/collections.ts'

const { t } = useLangue()
// niveau : celui de la barre du haut s'il est de maternelle
const { config, langueContenu } = useReglages(DEFINITION, { suivreClasse: true })
// T : les textes du contenu (CONTENU, textes.ts : nom des objets, fiche), dans la langue du contenu
const T = traducteur(CONTENU, () => langueContenu.value)
const ICONES: Readonly<Record<string, string>> = { ps: '🐣', ms: '🌱', gs: '🌳' }
const libelleNiveau = (n: string): string => `${ICONES[n] ?? ''} ${t('compter.jusqua', { niv: n.toUpperCase(), n: NOMBRE_MAX[n as keyof typeof NOMBRE_MAX] ?? 0 })}`
const ps = computed(() => config.value.niveau === 'ps')
// PS : le bouton est une constellation, son nom pour les lecteurs d'écran est le nombre
const libelleChoix = (i: number): string => String(q.value?.options[i]?.valeur ?? '')

// ── Jeu : une seule tentative, puis on enchaîne (maternelle) ──
const jeu = useJeu<Question, Reponse>({
  generer: rng => tirer({ niveau: config.value.niveau, reglages: config.value, rng, T }),
  verifier,
  messageErreur: q => t('compter.ilYAvait', { n: q.reponse, emoji: q.emoji }),
  apresErreur: 1200,
  delai: 1200,
})
const { phase, questions, q, bonnes, retour, repondu, etat } = jeu

// ── Fiche imprimable (aperçu et impression : CadreExercice) : graine du lien, sinon tirée ──
const { mode, fiche, nouvelle } = useFicheExercice({
  tirer: rng => questionsFiche({ niveau: config.value.niveau, reglages: config.value, rng, T }),
  mettreEnPage: (tirage, police) => ficheCompter({ questions: tirage, reglages: config.value, T, langue: langueContenu.value, ...police }),
})
</script>

<style scoped>
.consigne { font-size: 1.4rem; font-weight: 800; margin-bottom: 1.25rem; color: var(--texte); }
.objets-grille {
  display: flex; flex-wrap: wrap; justify-content: center; gap: .5rem; min-height: 6rem; align-items: center;
  margin-bottom: 1.5rem; padding: 1rem; background: var(--gris-bg); border-radius: 12px;
}
.objets-grille :deep(.objet) { font-size: 2.6rem; line-height: 1; transition: transform .15s; animation: popIn .3s ease backwards; }
.objets-grille :deep(.objet:hover) { transform: scale(1.1); }
@keyframes popIn {
  from { transform: scale(0); opacity: 0; }
  to   { transform: scale(1); opacity: 1; }
}
.objets-grille :deep(.objet:nth-child(2))  { animation-delay: .05s; }
.objets-grille :deep(.objet:nth-child(3))  { animation-delay: .10s; }
.objets-grille :deep(.objet:nth-child(4))  { animation-delay: .15s; }
.objets-grille :deep(.objet:nth-child(5))  { animation-delay: .20s; }
.objets-grille :deep(.objet:nth-child(6))  { animation-delay: .25s; }
.objets-grille :deep(.objet:nth-child(7))  { animation-delay: .30s; }
.objets-grille :deep(.objet:nth-child(8))  { animation-delay: .35s; }
.objets-grille :deep(.objet:nth-child(9))  { animation-delay: .40s; }
.objets-grille :deep(.objet:nth-child(10)) { animation-delay: .45s; }
:deep(.points) { display: inline-flex; font-size: 1.6rem; letter-spacing: .35rem; color: var(--bleu-fort); min-height: 2.6rem; align-items: center; }
</style>
