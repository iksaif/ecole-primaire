<template>
  <div class="container">
    <h1 class="section-heading">🔢 {{ t('titre') }}</h1>

    <!-- Config -->
    <ConfigExercice v-if="phase === 'config'" :config="config" v-model:mode="mode" :fiche="fiche" police
      @commencer="jeu.demarrer" @regenerer="nouvelle">
      <ChoixReglage :definition="DEFINITION" cle="niveau" v-model="config.niveau" :titre="t('niveau')"
        :libelle="n => `${ICONES[n]} ${t('jusqua', { niv: n.toUpperCase(), n: NOMBRE_MAX[n] })}`" />
      <ChoixReglage :definition="DEFINITION" cle="nbQ" v-model="config.nbQ" :titre="t('nbQuestions')" />
      <ChoixReglage v-if="mode === 'imprimer' && config.niveau !== 'ps'" :definition="DEFINITION" :niveau="config.niveau"
        cle="reponse" v-model="config.reponse" :titre="t('reponseFiche')" :libelle="r => (r === 'ecrire' ? '✏️ ' + t('ecrire') : '⭕ ' + t('entourer'))" />
    </ConfigExercice>

    <!-- Exercice -->
    <QuestionJeu v-if="phase === 'jeu' && q" :jeu="jeu">
      <!-- Objets à compter -->
      <ConsigneParlee :key="jeu.index.value" class="consigne" :texte="t('combien', { nom: T(q.objet) })" />
      <div :key="jeu.index.value" class="objets-grille">
        <span v-for="i in q.nb" :key="i" class="objet">{{ q.emoji }}</span>
      </div>

      <!-- Choix de réponse ; PS : la quantité en constellation de points (pas de chiffre seul) -->
      <ChoixReponses grand :options="q.options" :bonne="q.bonne" :repondu="repondu" @choisir="i => jeu.repondre({ choix: i })">
        <template #default="{ option }">
          <span v-if="config.niveau === 'ps'" class="points"><span v-for="i in option.valeur" :key="i">●</span></span>
          <template v-else>{{ option.label }}</template>
        </template>
      </ChoixReponses>

      <div class="feedback" :class="etat">{{ retour?.message }}</div>
    </QuestionJeu>

    <!-- Résultats : la maternelle garde les étoiles -->
    <ResultatsEtoiles v-if="phase === 'resultats'" :bonnes="bonnes" :total="questions.length"
      @rejouer="jeu.recommencer" @reglages="jeu.quitter" />
  </div>
</template>

<script setup>
// Compter les objets : la vue ne fait que les réglages et le rendu d'une question. Niveaux, générateur et fiche :
// src/exercices/compter/ (definition.js, generateur.js, fiche.js).
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
import DEFINITION from '../../exercices/compter/definition'
import { INTERFACE, TEXTES } from '../../exercices/compter/textes'
import { questions as genererQuestions, questionsFiche, verifier, NOMBRE_MAX } from '../../exercices/compter/generateur'
import { fiche as ficheCompter } from '../../exercices/compter/fiche'

const { t } = useI18n(INTERFACE)
// niveau : celui de la barre du haut s'il est de maternelle
const { config, langueContenu } = useReglages(DEFINITION, 'compter_config', { suivreClasse: true })
const T = contenu(TEXTES, () => langueContenu.value).t
const ICONES = { ps: '🐣', ms: '🌱', gs: '🌳' }

// ── Jeu : une seule tentative, puis on enchaîne (maternelle) ──
const jeu = useJeu({
  generer: rng => genererQuestions({ niveau: config.value.niveau, reglages: config.value, rng, T }),
  verifier,
  messageErreur: q => t('ilYAvait', { n: q.reponse, emoji: q.emoji }),
  apresErreur: 'continuer',
  delai: 1200,
})
const { phase, questions, q, bonnes, retour, repondu, etat } = jeu

// ── Fiche imprimable (aperçu + impression gérés par ConfigExercice) ──
const { mode, fiche, nouvelle } = useFicheExercice({
  tirer: rng => questionsFiche({ niveau: config.value.niveau, reglages: config.value, rng, T }),
  mettreEnPage: (questions, police) => ficheCompter({ questions, reglages: config.value, T, langue: langueContenu.value, ...police }),
})
</script>

<style scoped>
.consigne { font-size: 1.4rem; font-weight: 800; margin-bottom: 1.25rem; color: var(--texte); }
.objets-grille {
  display: flex; flex-wrap: wrap; justify-content: center; gap: .5rem; min-height: 6rem; align-items: center;
  margin-bottom: 1.5rem; padding: 1rem; background: var(--gris-bg); border-radius: 12px;
}
.objet { font-size: 2.6rem; line-height: 1; transition: transform .15s; animation: popIn .3s ease backwards; }
.objet:hover { transform: scale(1.1); }
@keyframes popIn {
  from { transform: scale(0); opacity: 0; }
  to   { transform: scale(1); opacity: 1; }
}
.objet:nth-child(2)  { animation-delay: .05s; }
.objet:nth-child(3)  { animation-delay: .10s; }
.objet:nth-child(4)  { animation-delay: .15s; }
.objet:nth-child(5)  { animation-delay: .20s; }
.objet:nth-child(6)  { animation-delay: .25s; }
.objet:nth-child(7)  { animation-delay: .30s; }
.objet:nth-child(8)  { animation-delay: .35s; }
.objet:nth-child(9)  { animation-delay: .40s; }
.objet:nth-child(10) { animation-delay: .45s; }
.points { display: inline-flex; gap: .35rem; font-size: 1.6rem; color: var(--bleu); min-height: 2.6rem; align-items: center; }
</style>
