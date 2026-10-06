<template>
  <div class="container">
    <h1 class="section-heading">{{ t('dev.composantsTitre') }}</h1>
    <p class="intro">{{ t('dev.composantsIntro') }}</p>

    <h2>{{ t('dev.composantsFicheSeule') }}</h2>
    <p class="aide">{{ t('dev.composantsFicheSeuleAide') }}</p>
    <CadreExercice mode="imprimer" fiche-seule :aleatoire="false" :police="false" :fiche="fiche" />

    <h2>{{ t('dev.composantsChrono') }}</h2>
    <div class="demo chrono">
      <button type="button" class="btn btn-primary" @click="minuteur.demarrer(DUREE)">{{ t('dev.composantsDemarrer') }}</button>
      <Chronometre :restant="minuteur.restant.value" :duree="DUREE" />
    </div>

    <h2>{{ t('dev.composantsOrdonner') }}</h2>
    <div class="demo">
      <p>{{ t('dev.composantsOrdonnerConsigne') }}</p>
      <OrdonnerClics v-model="ordre" :elements="NOMBRES" :etat="etat" :verrou="juste" @valider="verifier">
        <template #element="{ element }">{{ element }}</template>
      </OrdonnerClics>
      <RetourReponse :message="message" :etat="etat" />
    </div>

    <h2>{{ t('dev.composantsConsigne') }}</h2>
    <div class="demo">
      <ConsigneParlee :texte="t('dev.composantsConsigneFr')" langue="fr" :auto="false" />
      <ConsigneParlee :texte="t('dev.composantsConsigneBr')" langue="br" :auto="false" />
    </div>
  </div>
</template>

<script setup lang="ts">
// Les composants optionnels du noyau, un par un (route /dev/composants, dev seulement). Chacun a son mode d'emploi en tête de fichier.
import { ref, computed, watch } from 'vue'
import { useLangue } from '../../langues/useLangue.ts'
import CadreExercice from '../../noyau/CadreExercice.vue'
import Chronometre from '../../noyau/Chronometre.vue'
import OrdonnerClics from '../../noyau/OrdonnerClics.vue'
import ConsigneParlee from '../../noyau/ConsigneParlee.vue'
import RetourReponse from '../../noyau/RetourReponse.vue'
import { useMinuteur } from '../../noyau/useMinuteur.ts'

const { t, langue } = useLangue()

// Une fiche qui ne dépend pas du hasard : un document HTML complet (documentFiche, pour une vraie fiche)
const fiche = computed(() => `<!doctype html><html lang="${langue.value}"><body><h1>${t('dev.composantsFicheTexte')}</h1></body></html>`)

// Chronomètre : useMinuteur compte à rebours, Chronometre affiche
const DUREE = 10
const minuteur = useMinuteur()

// Ranger par clics : `ordre` = les indices touchés ; la réponse = ordre.map(i => NOMBRES[i])
const NOMBRES = [30, 10, 20]
const ordre = ref<number[]>([])
const verifie = ref(false)
const juste = computed(() => verifie.value && ordre.value.map(i => NOMBRES[i]).every((n, k, l) => k === 0 || n > l[k - 1]))
const etat = computed(() => (!verifie.value ? '' : juste.value ? 'ok' : 'erreur'))
const message = computed(() => (!verifie.value ? '' : t(juste.value ? 'dev.composantsOrdonnerJuste' : 'dev.composantsOrdonnerFaux')))
function verifier() { verifie.value = true }
// toucher ou annuler un élément efface le verdict précédent
watch(ordre, () => { verifie.value = false })
</script>

<style scoped>
.intro, .aide { color: var(--texte-doux); margin: 0 0 1rem; }
h2 { font-size: 1.1rem; margin: 1.5rem 0 .5rem; }
.demo { background: white; border-radius: var(--radius); padding: 1rem; display: flex; flex-direction: column; gap: 1rem; }
.chrono { align-items: flex-start; }
.chrono .chronometre { align-self: stretch; }
</style>
