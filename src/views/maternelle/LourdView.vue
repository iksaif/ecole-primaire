<template>
  <div class="container">
    <h1 class="section-heading"><Icone nom="balance" /> {{ t('lourd.titre') }}</h1>

    <CadreExercice v-if="phase === 'config'" v-model:mode="mode" :fiche="fiche" :config="config" pictogrammes images
      @commencer="jeu.demarrer" @regenerer="nouvelle">
      <ChoixReglage :definition="DEFINITION" cle="niveau" v-model="config.niveau" :titre="t('communs.niveau')" :libelle="n => n.toUpperCase()" :icone="iconeNiveau" />
      <ChoixReglage v-if="config.niveau === 'gs'" :definition="DEFINITION" :niveau="config.niveau" cle="types" v-model="config.types" :titre="t('lourd.types')"
        :libelles="{ deux: t('lourd.deux'), trois: t('lourd.trois') }" />
      <ChoixReglage :definition="DEFINITION" :niveau="config.niveau" cle="nbQ" v-model="config.nbQ" :titre="t('communs.nbQuestions')" />
    </CadreExercice>

    <!-- Exercice : la ou les balances, puis les objets à toucher -->
    <QuestionJeu v-if="phase === 'jeu' && q" :jeu="jeu">
      <ConsigneParlee :key="jeu.index.value" class="consigne" :texte="consigne(q, T)" :verbes="['montre']" :niveau="config.niveau" />
      <div :key="jeu.index.value" class="pesees">
        <div v-for="(p, i) in q.pesees" :key="i" class="pesee" v-html="htmlPesee(p, T)"></div>
      </div>
      <ChoixReponses grand :titre="consigne(q, T)" :options="options" :bonne="q.bonne" :repondu="repondu" :libelle="i => nomObjet(q?.options[i] ?? '', T)"
        @choisir="i => jeu.repondre({ choix: i })">
        <template #default="{ option }"><span class="objet"><Emoji :nom="option.emoji" taille="3.2rem" /></span></template>
      </ChoixReponses>
      <RetourReponse :message="retour?.message" :etat="etat" />
    </QuestionJeu>

    <ResultatsEtoiles v-if="phase === 'resultats'" :bonnes="bonnes" :total="questions.length"
      @rejouer="jeu.recommencer" @reglages="jeu.quitter" />
  </div>
</template>

<script setup lang="ts">
// Le plus lourd — la vue : mince. Niveaux, questions, balance, correction et fiche sont dans src/exercices/lourd/.
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
import DEFINITION from '../../exercices/lourd/definition.ts'
import { CONTENU } from '../../exercices/lourd/textes.ts'
import { questions as tirer, questionsFiche, verifier, consigne } from '../../exercices/lourd/generateur.ts'
import type { Question, Reponse } from '../../exercices/lourd/generateur.ts'
import { htmlPesee, nomObjet } from '../../exercices/lourd/dessin.ts'
import { fiche as mettreEnPage } from '../../exercices/lourd/fiche.ts'

const { t } = useLangue()
// niveau : celui de la barre du haut s'il est de maternelle
const { config, langueContenu } = useReglages(DEFINITION, { suivreClasse: true })
const T = traducteur(CONTENU, () => langueContenu.value)

const jeu = useJeu<Question, Reponse>({
  generer: rng => tirer({ niveau: config.value.niveau, reglages: config.value, rng, T }),
  verifier,
  messageErreur: q => t('lourd.laBonne', { nom: nomObjet(q.options[q.bonne], T) }),
  apresErreur: 1200,
  delai: 1200,
})
const { phase, questions, q, bonnes, retour, repondu, etat } = jeu
// les propositions : chaque objet est un bouton (son image)
const options = computed(() => (q.value?.options ?? []).map(emoji => ({ label: nomObjet(emoji, T), emoji })))

const { mode, fiche, nouvelle } = useFicheExercice({
  tirer: rng => questionsFiche({ niveau: config.value.niveau, reglages: config.value, rng, T }),
  mettreEnPage: (tirage, police) => mettreEnPage({ questions: tirage, reglages: config.value, T, langue: langueContenu.value, ...police }),
})
</script>

<style scoped>
.consigne { font-size: 1.3rem; font-weight: 800; margin-bottom: 1rem; color: var(--texte); }
.pesees { display: flex; flex-wrap: wrap; justify-content: center; gap: .5rem; margin-bottom: 1.25rem; }
.pesee { flex: 1 1 15rem; max-width: 22rem; }
.objet { display: inline-flex; }
</style>
