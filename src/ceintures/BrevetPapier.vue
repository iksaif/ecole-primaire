<template>
  <CadreExercice fiche-seule :imbrique="imbrique" :mode="mode" :fiche="fiche" :config="config" :police="false" :extensions="DEFINITION.extensions" @regenerer="nouvelle">
    <ChoixReglage :definition="DEFINITION" cle="niveau" v-model="config.niveau" :titre="t('communs.niveau')" />
    <!-- la piste : choisie ici sur la page des brevets, imposée par l'exercice dans son onglet -->
    <ChoixReglage v-if="!piste" :definition="DEFINITION" :niveau="config.niveau" cle="piste" v-model="config.piste" :titre="t('ceinturesBrevet.piste')"
      :libelle="nomPiste" />
    <!-- la ceinture : son numéro et sa couleur (palette des réglages communs) -->
    <ChoixReglage :definition="DEFINITION" :niveau="config.niveau" cle="ceinture" v-model="config.ceinture" :titre="t('ceinturesBrevet.ceinture')"
      :libelle="n => String(n)">
      <template #valeur="{ valeur, texte }">{{ texte }} <PastilleCeinture :indice="Number(valeur) - 1" /></template>
    </ChoixReglage>

    <!-- les options de la piste « tables » : seulement quand elle est choisie -->
    <template v-if="config.piste === 'tables'">
      <ChoixReglage :definition="DEFINITION" :niveau="config.niveau" cle="tablesPerso" v-model="config.tablesPerso" :titre="t('ceinturesBrevet.tablesTitre')"
        :libelle="perso => (perso ? t('ceinturesBrevet.tablesPerso') : t('ceinturesBrevet.tablesCeinture'))" />
      <ChoixReglage v-if="config.tablesPerso" :definition="DEFINITION" :niveau="config.niveau" cle="tables" v-model="config.tables" :libelle="n => `×${n}`" />
      <ChoixReglage :definition="DEFINITION" :niveau="config.niveau" cle="divisions" v-model="config.divisions" :titre="t('ceinturesBrevet.divisionsTitre')"
        :libelle="d => t(`ceinturesBrevet.division.${d}`)" />
      <ChoixReglage :definition="DEFINITION" :niveau="config.niveau" cle="jusqu" v-model="config.jusqu" :titre="t('ceinturesBrevet.jusquTitre')" :libelle="n => `× ${n}`" />
    </template>
    <div class="config-section">
      <label :for="`${id}-prenom`" class="config-section-title">{{ t('ceinturesBrevet.prenom') }}</label>
      <input :id="`${id}-prenom`" v-model="config.prenom" type="text" class="zone-texte" maxlength="40">
    </div>
  </CadreExercice>
</template>

<script setup lang="ts">
// Le brevet papier d'une ceinture : le formulaire (piste, ceinture, options des tables) et l'aperçu. Utilisé par la page des brevets (CeinturesBrevetView) et par l'onglet « Ceintures » d'un exercice
// (OngletCeintures) ; `imbrique` : dans l'onglet, le cadre n'a pas sa propre boîte. Les questions sont dans src/ceintures/brevets.ts, la mise en page dans src/exercices/ceintures-brevet/fiche.ts.
// Les brevets de ceintures : une activité de fiches (pas de partie à l'écran). La vue ne fait que les réglages ; les questions sont dans src/ceintures/brevets.ts, la mise
// en page dans src/exercices/ceintures-brevet/fiche.ts et src/ceintures/supports.ts. Seuil, nombre de questions, palette : réglages communs des ceintures.
import { useId, watchEffect } from 'vue'
import type { PisteAvecBrevet } from './brevets.ts'
import { useLangue } from '../langues/useLangue.ts'
import { traducteur } from '../langues/catalogue.ts'
import CadreExercice from '../noyau/CadreExercice.vue'
import ChoixReglage from '../noyau/ChoixReglage.vue'
import PastilleCeinture from './PastilleCeinture.vue'
import { useReglages } from '../noyau/useReglages.ts'
import { useFicheExercice } from '../noyau/useFicheExercice.ts'
import DEFINITION from '../exercices/ceintures-brevet/definition.ts'
import { CONTENU } from '../exercices/ceintures-brevet/textes.ts'
import { questionsFiche } from '../exercices/ceintures-brevet/generateur.ts'
import { fiche as ficheBrevet } from '../exercices/ceintures-brevet/fiche.ts'

const props = defineProps<{ imbrique?: boolean, piste?: PisteAvecBrevet }>()
const id = useId()
const { t } = useLangue()
const { config, langueContenu } = useReglages(DEFINITION)
// dans l'onglet d'un exercice, la piste est celle de l'exercice
watchEffect(() => { if (props.piste) config.value.piste = props.piste })

/** Le nom d'une piste : le titre de son exercice. */
const nomPiste = (p: string | number | boolean): string => (p === 'calcul-mental' ? t('calculMental.titre') : t('tables.titre'))
const T = traducteur(CONTENU, () => langueContenu.value)

const { mode, fiche, nouvelle } = useFicheExercice({
  ficheSeule: true,
  tirer: rng => questionsFiche({ niveau: config.value.niveau, reglages: config.value, rng }),
  mettreEnPage: (tirage, police) => ficheBrevet({ questions: tirage, reglages: config.value, T, langue: langueContenu.value, ...police }),
})
</script>

<style scoped>
.intro { color: var(--texte-doux); margin: 0 0 1rem; max-width: 60rem; }
.zone-texte { width: 100%; max-width: 40rem; font: inherit; padding: .4rem .6rem; border: 1.5px solid var(--gris-brd, #ccc); border-radius: 8px; }
</style>
