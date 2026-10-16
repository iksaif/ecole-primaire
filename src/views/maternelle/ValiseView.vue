<template>
  <div class="container">
    <h1 class="section-heading"><Icone nom="chiffres" /> {{ t('valise.titre') }}</h1>

    <CadreExercice v-if="phase === 'config'" v-model:mode="mode" :fiche="fiche" :config="config" pictogrammes images
      @commencer="jeu.demarrer" @regenerer="nouvelle">
      <template #default="{ mode: modeCourant }">
        <ChoixReglage :definition="DEFINITION" cle="niveau" v-model="config.niveau" :titre="t('communs.niveau')" :libelle="libelleNiveau" :icone="iconeNiveau" />
        <ChoixReglage :definition="DEFINITION" :niveau="config.niveau" cle="types" v-model="config.types" :titre="t('valise.types')"
          :libelles="{ ajoute: t('valise.ajoute'), retire: t('valise.retire'), complete: t('valise.complete') }" />
        <ChoixReglage :definition="DEFINITION" :niveau="config.niveau" cle="nbQ" v-model="config.nbQ" :titre="t('communs.nbQuestions')" />
        <ChoixReglage v-if="modeCourant === 'imprimer' && config.niveau !== 'ps'" :definition="DEFINITION" :niveau="config.niveau"
          cle="reponse" v-model="config.reponse" :titre="t('valise.reponseFiche')" :libelle="r => (r === 'ecrire' ? t('valise.ecrire') : t('valise.entourer'))" :icone="r => (r === 'ecrire' ? 'crayon' : 'cercle')" />
      </template>
    </CadreExercice>

    <!-- Exercice : la scène, puis les nombres à toucher -->
    <QuestionJeu v-if="phase === 'jeu' && q" :jeu="jeu">
      <ConsigneParlee :key="jeu.index.value" class="consigne" :texte="phrase(q)" :verbes="['compte']" :niveau="config.niveau" />
      <div :key="jeu.index.value" class="scene" v-html="htmlScene(q, images)"></div>

      <!-- PS : la quantité en constellation de points (pas de chiffre seul) -->
      <ChoixReponses grand :titre="phrase(q)" :options="q.options" :bonne="q.bonne" :repondu="repondu" :libelle="ps ? libelleChoix : null" @choisir="i => jeu.repondre({ choix: i })">
        <template #default="{ option }">
          <span v-if="ps" v-html="htmlConstellation(option.valeur, 'points')"></span>
          <template v-else>{{ option.label }}</template>
        </template>
      </ChoixReponses>

      <RetourReponse :message="retour?.message" :etat="etat" />
    </QuestionJeu>

    <ResultatsEtoiles v-if="phase === 'resultats'" :bonnes="bonnes" :total="questions.length"
      @rejouer="jeu.recommencer" @reglages="jeu.quitter" />
  </div>
</template>

<script setup lang="ts">
// La valise — la vue : mince. Elle règle, pose et affiche ; niveaux, questions, correction, scène et fiche sont dans src/exercices/valise/.
import { computed } from 'vue'
import { useLangue } from '../../langues/useLangue.ts'
import { traducteur } from '../../langues/catalogue.ts'
import type { CleContenu } from '../../langues/catalogue.ts'
import Icone from '../../images/Icone.vue'
import CadreExercice from '../../noyau/CadreExercice.vue'
import ChoixReglage from '../../noyau/ChoixReglage.vue'
import QuestionJeu from '../../noyau/QuestionJeu.vue'
import ChoixReponses from '../../noyau/ChoixReponses.vue'
import ConsigneParlee from '../../noyau/ConsigneParlee.vue'
import RetourReponse from '../../noyau/RetourReponse.vue'
import ResultatsEtoiles from '../../noyau/ResultatsEtoiles.vue'
import { iconeNiveau } from '../../noyau/reglages.ts'
import { useReglages } from '../../noyau/useReglages.ts'
import { useJeu } from '../../noyau/useJeu.ts'
import { useFicheExercice } from '../../noyau/useFicheExercice.ts'
import DEFINITION from '../../exercices/valise/definition.ts'
import { CONTENU } from '../../exercices/valise/textes.ts'
import { questions as tirer, questionsFiche, verifier, TOTAL_MAX } from '../../exercices/valise/generateur.ts'
import type { Question, Reponse } from '../../exercices/valise/generateur.ts'
import { htmlScene, nomObjet } from '../../exercices/valise/objets.ts'
import { fiche as mettreEnPage } from '../../exercices/valise/fiche.ts'
import { htmlConstellation } from '../../dessins/collections.ts'
import { useRenduEcran } from '../../images/useRenduEcran.ts'

type Cle = CleContenu<typeof CONTENU>
// les objets à l'écran : la famille choisie (préférence « Images »), en couleur
const images = useRenduEcran()
const { t } = useLangue()
// niveau : celui de la barre du haut s'il est de maternelle
const { config, langueContenu } = useReglages(DEFINITION, { suivreClasse: true })
const T = traducteur(CONTENU, () => langueContenu.value)
const libelleNiveau = (n: string): string => t('compter.jusqua', { niv: n.toUpperCase(), n: TOTAL_MAX[n as keyof typeof TOTAL_MAX] ?? 0 })
const ps = computed(() => config.value.niveau === 'ps')
/** La question dite et écrite : celle de ce problème, avec le nom des objets. */
const phrase = (q: Question): string => T(`question.${q.type === 'ajoute' && q.cache ? 'ajouteCache' : q.type}` as Cle, { n: q.total, nom: nomObjet(q.objet, langueContenu.value) })
// PS : le bouton est une constellation, son nom pour les lecteurs d'écran est le nombre
const libelleChoix = (i: number): string => String(q.value?.options[i]?.valeur ?? '')

const jeu = useJeu<Question, Reponse>({
  generer: rng => tirer({ niveau: config.value.niveau, reglages: config.value, rng, T }),
  verifier,
  messageErreur: q => t('valise.laReponse', { n: q.reponse }),
  apresErreur: 1200,
  delai: 1200,
})
const { phase, questions, q, bonnes, retour, repondu, etat } = jeu

const { mode, fiche, nouvelle } = useFicheExercice({
  tirer: rng => questionsFiche({ niveau: config.value.niveau, reglages: config.value, rng, T }),
  mettreEnPage: (tirage, police) => mettreEnPage({ questions: tirage, reglages: config.value, T, langue: langueContenu.value, ...police }),
})
</script>

<style scoped>
.consigne { font-size: 1.3rem; font-weight: 800; margin-bottom: 1.25rem; color: var(--texte); }
.scene {
  display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: .5rem; min-height: 6rem;
  margin-bottom: 1.5rem; padding: 1rem; background: var(--gris-bg); border-radius: 12px;
}
.scene :deep(.objet) { font-size: 2.6rem; line-height: 1; }
.scene :deep(.signe) { font-size: 2.2rem; font-weight: 800; margin: 0 .6rem; color: var(--bleu-fort); }
.scene :deep(.enleve) { opacity: .35; position: relative; }
.scene :deep(.enleve)::after { content: '✖'; position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 2.4rem; color: #c62828; opacity: 1; }
.scene :deep(.valise) { display: inline-flex; flex-direction: column; align-items: center; gap: .1rem; }
.scene :deep(.valise-image) { font-size: 3.2rem; line-height: 1; }
.scene :deep(.dans-valise) { display: inline-flex; gap: .15rem; align-items: center; }
.scene :deep(.il-en-faut) { display: inline-flex; }
.scene :deep(.points) { font-size: 1.5rem; letter-spacing: .25rem; color: var(--bleu-fort); }
:deep(.points) { display: inline-flex; font-size: 1.6rem; letter-spacing: .35rem; color: var(--bleu-fort); min-height: 2.6rem; align-items: center; }
</style>
