<template>
  <div class="container">
    <h1 class="section-heading"><Icone v-if="DEFINITION.emoji" :nom="DEFINITION.emoji" /> {{ t('ceintures.titre') }}</h1>
    <p class="intro">{{ t('ceintures.intro') }}</p>

    <CadreExercice fiche-seule :mode="mode" :fiche="fiche" :config="config" :police="false" :extensions="DEFINITION.extensions">
      <ChoixReglage :definition="DEFINITION" cle="niveau" v-model="config.niveau" :titre="t('communs.niveau')" />
      <ChoixReglage cartes :definition="DEFINITION" :niveau="config.niveau" cle="support" v-model="config.support" :titre="t('ceintures.supportTitre')"
        :libelle="s => t(`ceintures.support.${s}`)" :description="s => t(`ceintures.supportDesc.${s}`)" />
      <ChoixReglage :definition="DEFINITION" :niveau="config.niveau" cle="piste" v-model="config.piste" :titre="t('ceintures.pisteTitre')"
        :libelle="nomPiste" />

      <!-- piste libre : le titre et les objectifs (un par ligne, un par ceinture) -->
      <template v-if="config.piste === 'libre'">
        <div class="config-section">
          <label :for="`${id}-intitule`" class="config-section-title">{{ t('ceintures.intituleTitre') }}</label>
          <input :id="`${id}-intitule`" v-model="config.intitule" type="text" class="zone-texte" :placeholder="t('ceintures.intituleAuto')">
        </div>
        <div class="config-section">
          <label :for="`${id}-objectifs`" class="config-section-title">{{ t('ceintures.objectifsTitre') }}</label>
          <textarea :id="`${id}-objectifs`" v-model="config.objectifs" rows="6" class="zone-texte"></textarea>
        </div>
      </template>

      <ChoixReglage v-if="config.support === 'bandes'" :definition="DEFINITION" :niveau="config.niveau" cle="copies" v-model="config.copies" :titre="t('ceintures.copies')" />
      <!-- la ceinture du diplôme : son numéro et sa couleur ; autant de choix que la piste, le réglage commun et la palette en montrent -->
      <div v-if="config.support === 'diplome'" class="config-section" role="group" :aria-labelledby="`${id}-numero`" data-reglage="ceinture">
        <div :id="`${id}-numero`" class="config-section-title">{{ t('ceintures.numero') }}</div>
        <div class="btn-group">
          <button v-for="k in nbCeintures" :key="k" type="button" class="level-btn" :class="{ active: ceintureDuDiplome === k }" :aria-pressed="ceintureDuDiplome === k" :data-valeur="k"
            @click="config.ceinture = k as typeof config.ceinture">{{ k }} <PastilleCeinture :indice="k - 1" /></button>
        </div>
      </div>

      <div class="config-section">
        <label :for="`${id}-prenom`" class="config-section-title">{{ t('ceintures.prenomTitre') }}</label>
        <input :id="`${id}-prenom`" v-model="config.prenom" type="text" class="zone-texte" maxlength="40">
      </div>
    </CadreExercice>
  </div>
</template>

<script setup lang="ts">
// Les ceintures : une activité de fiches (pas de partie à l'écran). La vue ne fait que les réglages ; le contenu (pistes, objectifs) est dans
// src/exercices/ceintures/ et les supports (livret, bandes, diplôme, passeport) dans src/ceintures/supports.ts. La palette, le dessin et le noir et blanc
// sont les réglages communs des ceintures (« Sur la fiche », page des réglages).
import { computed, useId } from 'vue'
import Icone from '../../images/Icone.vue'
import { useLangue } from '../../langues/useLangue.ts'
import { traducteur } from '../../langues/catalogue.ts'
import CadreExercice from '../../noyau/CadreExercice.vue'
import ChoixReglage from '../../noyau/ChoixReglage.vue'
import PastilleCeinture from '../../ceintures/PastilleCeinture.vue'
import { reglagesCeintures } from '../../ceintures/extension.ts'
import { nbCeinturesDe } from '../../ceintures/reglages.ts'
import { PISTES, objectifsDe } from '../../ceintures/pistes.ts'
import { contextesDeFiche } from '../../extensions/contexte.ts'
import { useReglages } from '../../noyau/useReglages.ts'
import { useFicheExercice } from '../../noyau/useFicheExercice.ts'
import DEFINITION from '../../exercices/ceintures/definition.ts'
import { CONTENU } from '../../exercices/ceintures/textes.ts'
import { questionsFiche } from '../../exercices/ceintures/generateur.ts'
import { fiche as ficheCeintures } from '../../exercices/ceintures/fiche.ts'

const id = useId()
const { t } = useLangue()
const { config, langueContenu } = useReglages(DEFINITION)
const T = traducteur(CONTENU, () => langueContenu.value)

// les ceintures montrées : celles de la piste (ou les objectifs écrits), le nombre choisi dans les réglages communs et les couleurs de la palette
const nbCeintures = computed(() => {
  const nbPiste = config.value.piste === 'libre' ? objectifsDe(config.value.objectifs).length : PISTES[config.value.piste].paliers.length
  return nbCeinturesDe(reglagesCeintures(contextesDeFiche()), nbPiste)
})
const ceintureDuDiplome = computed(() => Math.min(config.value.ceinture, nbCeintures.value))

/** Le nom d'une piste : le titre de son exercice, ou « Mes objectifs » pour la piste libre. */
function nomPiste(piste: string | number | boolean): string {
  if (piste === 'tables') return t('tables.titre')
  if (piste === 'calcul-mental') return t('calculMental.titre')
  if (piste === 'lettres') return t('lettres.titre')
  return t('ceintures.pisteLibre')
}

const { mode, fiche } = useFicheExercice({
  ficheSeule: true,
  tirer: rng => questionsFiche({ niveau: config.value.niveau, reglages: config.value, rng, T }),
  mettreEnPage: (tirage, police) => ficheCeintures({ questions: tirage, reglages: config.value, T, langue: langueContenu.value, ...police }),
})
</script>

<style scoped>
.intro { color: var(--texte-doux); margin: 0 0 1rem; max-width: 60rem; }
.zone-texte { width: 100%; max-width: 40rem; font: inherit; padding: .4rem .6rem; border: 1.5px solid var(--gris-brd, #ccc); border-radius: 8px; }
</style>
