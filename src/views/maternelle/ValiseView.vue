<template>
  <div class="container">
    <h1 class="section-heading"><Icone nom="chiffres" /> {{ t('valise.titre') }}</h1>

    <CadreExercice v-if="phase === 'config'" v-model:mode="mode" :fiche="fiche" :config="config" pictogrammes images
      @commencer="jeu.demarrer" @regenerer="nouvelle">
      <template #default="{ mode: modeCourant }">
        <ChoixReglage :definition="DEFINITION" cle="niveau" v-model="config.niveau" :titre="t('communs.niveau')" :libelle="libelleNiveau" :icone="iconeNiveau" />
        <ChoixReglage :definition="DEFINITION" :niveau="config.niveau" cle="types" v-model="config.types" :titre="t('valise.types')"
          :libelles="{ ajoute: t('valise.ajoute'), retire: t('valise.retire'), complete: t('valise.complete'), initial: t('valise.initial') }" />
        <ChoixReglage :definition="DEFINITION" :niveau="config.niveau" cle="nbQ" v-model="config.nbQ" :titre="t('communs.nbQuestions')" />
        <ChoixReglage v-if="modeCourant === 'imprimer' && config.niveau !== 'ps'" :definition="DEFINITION" :niveau="config.niveau"
          cle="reponse" v-model="config.reponse" :titre="t('valise.reponseFiche')" :libelle="r => (r === 'ecrire' ? t('valise.ecrire') : t('valise.entourer'))" :icone="r => (r === 'ecrire' ? 'crayon' : 'cercle')" />
      </template>
    </CadreExercice>

    <!-- Exercice : la scène, puis les nombres à toucher -->
    <QuestionJeu v-if="phase === 'jeu' && q" :jeu="jeu">
      <ConsigneParlee :key="jeu.index.value" class="consigne" :texte="phrase(q)" :verbes="['compte']" :niveau="config.niveau" />
      <div :key="`${jeu.index.value}-${relecture}`" class="scene" :class="{ revele: repondu }" v-html="htmlBande(q, images, repondu)"></div>
      <!-- la bande se déroule une fois ; ce bouton la rejoue (avant la réponse) -->
      <div v-if="!repondu" class="revoir"><button type="button" class="btn btn-secondary" @click="relecture++"><Icone nom="rejouer" /> {{ t('valise.revoir') }}</button></div>

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
import { computed, ref } from 'vue'
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
import { htmlBande } from '../../exercices/valise/bande.ts'
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
// chaque appui sur « Revoir » rejoue l'animation : la bande est redessinée (clé)
const relecture = ref(0)
/** La question dite et écrite : celle de ce problème, en quelques mots. */
const phrase = (q: Question): string => T(`question.${q.type}` as Cle)
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
.revoir { display: flex; justify-content: center; margin: -.75rem 0 1.25rem; }
.consigne { font-size: 1.3rem; font-weight: 800; margin-bottom: 1.25rem; color: var(--texte); }
.scene {
  display: flex; flex-wrap: wrap; justify-content: center; align-items: center; min-height: 8rem;
  margin-bottom: 1.5rem; padding: 1rem; background: var(--gris-bg); border-radius: 12px;
}
.scene :deep(.bande) { display: inline-flex; align-items: center; gap: .8rem; flex-wrap: wrap; justify-content: center; }
.scene :deep(.case) { display: inline-flex; align-items: center; justify-content: center; gap: .2rem; min-width: 6rem; min-height: 5rem; }
.scene :deep(.plateau) { display: inline-flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: .15rem; max-width: 12rem; padding: .5rem .7rem; border: 3px solid #8d5524; border-radius: 12px; background: #fbf3e6; }
.scene :deep(.objet) { font-size: 2.2rem; line-height: 1; }
.scene :deep(.fleche) { font-size: 2rem; color: var(--bleu-fort); }
.scene :deep(.action) { display: inline-flex; align-items: center; gap: .2rem; }
.scene :deep(.signe) { font-size: 2.2rem; font-weight: 800; margin: 0 .4rem; color: var(--bleu-fort); }
.scene :deep(.inconnu) { display: inline-flex; align-items: center; justify-content: center; min-width: 3rem; height: 3rem; font-size: 2rem; font-weight: 800; color: var(--bleu-fort); border: 3px dashed var(--bleu-fort); border-radius: 10px; }
.scene :deep(.valise-fermee) { position: relative; display: inline-block; line-height: 0; }
.scene :deep(.valise) { width: 5.5rem; height: auto; }
.scene :deep(.sur-valise) { position: absolute; left: 50%; top: 52%; transform: translate(-50%, -50%); line-height: 1; font-size: 1.8rem; font-weight: 800; color: #222; background: #fff; border: 3px solid #5d3a1a; border-radius: 8px; padding: .1rem .5rem; white-space: nowrap; }
.scene :deep(.sur-valise .points) { font-size: 1.1rem; letter-spacing: .15rem; min-height: 0; }
/* la bande se déroule : un élément après l'autre, de gauche à droite ; la réponse ouvre la valise (rien ne rejoue : `revele`) */
.scene:not(.revele) :deep(.bande > *) { animation: apparait .45s ease backwards; }
.scene:not(.revele) :deep(.bande > :nth-child(2)) { animation-delay: .3s; }
.scene:not(.revele) :deep(.bande > :nth-child(3)) { animation-delay: .6s; }
.scene:not(.revele) :deep(.bande > :nth-child(4)) { animation-delay: .9s; }
.scene:not(.revele) :deep(.bande > :nth-child(5)) { animation-delay: 1.2s; }
@keyframes apparait { from { opacity: 0; transform: translateY(.4rem) scale(.9); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) { .scene:not(.revele) :deep(.bande > *) { animation: none; } }
:deep(.points) { display: inline-flex; font-size: 1.6rem; letter-spacing: .35rem; color: var(--bleu-fort); min-height: 2.6rem; align-items: center; }
</style>
