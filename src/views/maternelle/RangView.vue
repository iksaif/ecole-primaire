<template>
  <div class="container">
    <h1 class="section-heading"><Icone nom="chiffres" /> {{ t('rang.titre') }}</h1>

    <CadreExercice v-if="phase === 'config'" v-model:mode="mode" :fiche="fiche" :config="config" pictogrammes images
      @commencer="jeu.demarrer" @regenerer="nouvelle">
      <ChoixReglage :definition="DEFINITION" cle="niveau" v-model="config.niveau" :titre="t('communs.niveau')" :libelle="libelleNiveau" :icone="iconeNiveau" />
      <ChoixReglage :definition="DEFINITION" :niveau="config.niveau" cle="nbQ" v-model="config.nbQ" :titre="t('communs.nbQuestions')" />
    </CadreExercice>

    <!-- Exercice : une file d'objets, l'enfant touche celui qu'on dit -->
    <QuestionJeu v-if="phase === 'jeu' && q" :jeu="jeu">
      <ConsigneParlee :key="jeu.index.value" class="consigne" :texte="consigne(q, T)" :verbes="['montre']" :niveau="config.niveau" />
      <div class="file-et-depart">
      <span class="depart" aria-hidden="true">➜</span>
      <ChoixReponses :key="jeu.index.value" grand class="file" :titre="consigne(q, T)" :options="places" :bonne="q.attendu" :repondu="repondu"
        :libelle="i => t('rang.place', { n: i + 1 })" @choisir="i => jeu.repondre({ place: i })">
        <template #default><Emoji :nom="q.emoji" taille="3rem" /></template>
      </ChoixReponses>
      </div>
      <RetourReponse :message="retour?.message" :etat="etat" />
    </QuestionJeu>

    <ResultatsEtoiles v-if="phase === 'resultats'" :bonnes="bonnes" :total="questions.length"
      @rejouer="jeu.recommencer" @reglages="jeu.quitter" />
  </div>
</template>

<script setup lang="ts">
// Le premier, le dernier — la vue : mince. Niveaux, questions, correction et fiche sont dans src/exercices/rang/.
import { computed } from 'vue'
import { useLangue } from '../../langues/useLangue.ts'
import { traducteur } from '../../langues/catalogue.ts'
import Icone from '../../images/Icone.vue'
import Emoji from '../../images/Emoji.vue'
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
import DEFINITION from '../../exercices/rang/definition.ts'
import { CONTENU } from '../../exercices/rang/textes.ts'
import { questions as tirer, questionsFiche, verifier, consigne, FILE_MAX } from '../../exercices/rang/generateur.ts'
import type { Question, Reponse } from '../../exercices/rang/generateur.ts'
import { fiche as mettreEnPage } from '../../exercices/rang/fiche.ts'

const { t } = useLangue()
// niveau : celui de la barre du haut s'il est de maternelle
const { config, langueContenu } = useReglages(DEFINITION, { suivreClasse: true })
const T = traducteur(CONTENU, () => langueContenu.value)
const libelleNiveau = (n: string): string => t('rang.jusqua', { niv: n.toUpperCase(), n: FILE_MAX[n as keyof typeof FILE_MAX] ?? 0 })

const jeu = useJeu<Question, Reponse>({
  generer: rng => tirer({ niveau: config.value.niveau, reglages: config.value, rng, T }),
  verifier,
  messageErreur: q => t('rang.laBonne', { n: q.attendu + 1 }),
  apresErreur: 1200,
  delai: 1200,
})
const { phase, questions, q, bonnes, retour, repondu, etat } = jeu
// une proposition par place de la file
const places = computed(() => Array.from({ length: q.value?.longueur ?? 0 }, (_, i) => ({ label: String(i + 1) })))

const { mode, fiche, nouvelle } = useFicheExercice({
  tirer: rng => questionsFiche({ niveau: config.value.niveau, reglages: config.value, rng, T }),
  mettreEnPage: (tirage, police) => mettreEnPage({ questions: tirage, reglages: config.value, T, langue: langueContenu.value, ...police }),
})
</script>

<style scoped>
.consigne { font-size: 1.4rem; font-weight: 800; margin-bottom: 1.25rem; color: var(--texte); }
/* une file : tous les objets sur une rangée, serrés (jusqu'à dix) */
.file-et-depart { display: flex; align-items: center; gap: .5rem; }
.file-et-depart .file { flex: 1; }
.depart { font-size: 2rem; color: var(--bleu-fort); }
.file :deep(.choix-btn) { padding: .6rem .2rem; min-width: 0; }
</style>
