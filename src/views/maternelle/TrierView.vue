<template>
  <div class="container">
    <h1 class="section-heading"><Icone nom="puzzle" /> {{ t('trier.titre') }}</h1>

    <CadreExercice v-if="phase === 'config'" v-model:mode="mode" :fiche="fiche" :config="config" pictogrammes images
      @commencer="jeu.demarrer" @regenerer="nouvelle">
      <ChoixReglage :definition="DEFINITION" cle="niveau" v-model="config.niveau" :titre="t('communs.niveau')" :libelle="libelleNiveau" :icone="iconeNiveau" />
      <ChoixReglage :definition="DEFINITION" :niveau="config.niveau" cle="themes" v-model="config.themes" :titre="t('trier.themes')"
        :libelles="{ groupes: t('trier.groupes'), matieres: t('trier.matieres'), deplacements: t('trier.deplacements'), mange: t('trier.mange') }" />
      <ChoixReglage :definition="DEFINITION" :niveau="config.niveau" cle="nbQ" v-model="config.nbQ" :titre="t('communs.nbQuestions')" />
    </CadreExercice>

    <!-- Exercice : une image, deux ou trois boîtes -->
    <QuestionJeu v-if="phase === 'jeu' && q" :jeu="jeu">
      <ConsigneParlee :key="jeu.index.value" class="consigne" :texte="T(`consigne.${q.theme}` as Cle)" :verbes="['montre']" :niveau="config.niveau" />
      <div :key="jeu.index.value" class="image-a-ranger"><Emoji :nom="q.item" taille="6rem" :alt="q.mot" /></div>

      <ChoixReponses grand :titre="T(`consigne.${q.theme}` as Cle)" :options="q.boites" :bonne="q.bonne" :repondu="repondu"
        :libelle="i => q?.boites[i]?.label ?? ''" @choisir="i => jeu.repondre({ choix: i }, { donne: q?.boites[i]?.label })">
        <template #default="{ option }">
          <span class="boite"><Emoji :nom="option.emoji" taille="3rem" /><span class="nom-boite">{{ option.label }}</span></span>
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
// Trier les images — la vue : mince. Elle règle, pose et affiche ; niveaux, questions, correction et fiche sont dans
// src/exercices/trier/ (definition.ts, corpus.ts, generateur.ts, fiche.ts).
import { useLangue } from '../../langues/useLangue.ts'
import { traducteur } from '../../langues/catalogue.ts'
import type { CleContenu } from '../../langues/catalogue.ts'
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
import DEFINITION from '../../exercices/trier/definition.ts'
import { CONTENU } from '../../exercices/trier/textes.ts'
import { questions as tirer, questionsFiche, verifier } from '../../exercices/trier/generateur.ts'
import type { Question, Reponse } from '../../exercices/trier/generateur.ts'
import { fiche as mettreEnPage } from '../../exercices/trier/fiche.ts'

type Cle = CleContenu<typeof CONTENU>
const { t } = useLangue()
// niveau : celui de la barre du haut s'il est de maternelle
const { config, langueContenu } = useReglages(DEFINITION, { suivreClasse: true })
const T = traducteur(CONTENU, () => langueContenu.value)
const libelleNiveau = (n: string): string => n.toUpperCase()

// ── Jeu : une seule tentative, puis on enchaîne (maternelle) ──
const jeu = useJeu<Question, Reponse>({
  generer: rng => tirer({ niveau: config.value.niveau, reglages: config.value, rng, T }),
  verifier,
  messageErreur: q => t('trier.laBonne', { nom: q.attendu }),
  apresErreur: 1200,
  delai: 1200,
})
const { phase, questions, q, bonnes, retour, repondu, etat } = jeu

// ── Fiche imprimable (aperçu et impression : CadreExercice) ──
const { mode, fiche, nouvelle } = useFicheExercice({
  tirer: rng => questionsFiche({ niveau: config.value.niveau, reglages: config.value, rng, T }),
  mettreEnPage: (tirage, police) => mettreEnPage({ questions: tirage, reglages: config.value, T, langue: langueContenu.value, ...police }),
})
</script>

<style scoped>
.consigne { font-size: 1.4rem; font-weight: 800; margin-bottom: 1.25rem; color: var(--texte); }
.image-a-ranger {
  display: flex; justify-content: center; align-items: center; min-height: 8rem; margin-bottom: 1.5rem;
  padding: 1rem; background: var(--gris-bg); border-radius: 12px;
}
.boite { display: flex; flex-direction: column; align-items: center; gap: .35rem; }
.nom-boite { font-size: 1.1rem; font-weight: 800; }
</style>
