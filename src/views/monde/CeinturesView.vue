<template>
  <div class="container">
    <h1 class="section-heading"><Icone v-if="DEFINITION.emoji" :nom="DEFINITION.emoji" /> {{ t('ceintures.titre') }}</h1>
    <p class="intro">{{ t('ceintures.intro') }}</p>

    <CadreExercice fiche-seule :mode="mode" :fiche="fiche" :config="config" :police="false" ceintures>
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
      <ChoixReglage v-if="config.support === 'diplome'" :definition="DEFINITION" :niveau="config.niveau" cle="ceinture" v-model="config.ceinture" :titre="t('ceintures.numero')">
        <template #valeur="{ valeur, texte }">{{ texte }} <PastilleCeinture :indice="Number(valeur) - 1" /></template>
      </ChoixReglage>

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
import { useId } from 'vue'
import Icone from '../../images/Icone.vue'
import { useLangue } from '../../langues/useLangue.ts'
import { traducteur } from '../../langues/catalogue.ts'
import CadreExercice from '../../noyau/CadreExercice.vue'
import ChoixReglage from '../../noyau/ChoixReglage.vue'
import PastilleCeinture from '../../ceintures/PastilleCeinture.vue'
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
