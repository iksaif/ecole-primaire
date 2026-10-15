<template>
  <div class="container">
    <h1 class="section-heading"><Icone nom="puzzle" /> {{ t('assemblages.titre') }}</h1>
    <p class="intro">{{ t('assemblages.intro') }}</p>

    <CadreExercice fiche-seule :mode="mode" :fiche="fiche" :config="config" pictogrammes images @regenerer="nouvelle">
      <ChoixReglage :definition="DEFINITION" cle="niveau" v-model="config.niveau" :titre="t('communs.niveau')" :libelle="n => n.toUpperCase()" :icone="iconeNiveau" />
      <ChoixReglage :definition="DEFINITION" :niveau="config.niveau" cle="nbFiche" v-model="config.nbFiche" :titre="t('assemblages.nbModeles')" />
    </CadreExercice>
  </div>
</template>

<script setup lang="ts">
// Assemblages de formes — la vue : mince (exercice « fiche seule », sans jeu). Niveaux, modèles, dessin et fiche sont dans
// src/exercices/assemblages/ (definition.ts, formes.ts, generateur.ts, fiche.ts).
import { useLangue } from '../../langues/useLangue.ts'
import { traducteur } from '../../langues/catalogue.ts'
import Icone from '../../images/Icone.vue'
import CadreExercice from '../../noyau/CadreExercice.vue'
import ChoixReglage from '../../noyau/ChoixReglage.vue'
import { iconeNiveau } from '../../noyau/reglages.ts'
import { useReglages } from '../../noyau/useReglages.ts'
import { useFicheExercice } from '../../noyau/useFicheExercice.ts'
import DEFINITION from '../../exercices/assemblages/definition.ts'
import { CONTENU } from '../../exercices/assemblages/textes.ts'
import { questionsFiche } from '../../exercices/assemblages/generateur.ts'
import { fiche as mettreEnPage } from '../../exercices/assemblages/fiche.ts'

const { t } = useLangue()
// niveau : celui de la barre du haut s'il est de maternelle
const { config, langueContenu } = useReglages(DEFINITION, { suivreClasse: true })
const T = traducteur(CONTENU, () => langueContenu.value)

const { mode, fiche, nouvelle } = useFicheExercice({
  ficheSeule: true,
  tirer: rng => questionsFiche({ niveau: config.value.niveau, reglages: config.value, rng, T }),
  mettreEnPage: (tirage, police) => mettreEnPage({ questions: tirage, reglages: config.value, T, langue: langueContenu.value, ...police }),
})
</script>

<style scoped>
.intro { max-width: 46rem; color: var(--texte-secondaire, #555); margin-bottom: 1rem; }
</style>
