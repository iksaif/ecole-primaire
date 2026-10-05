<template>
  <!--
    Le formulaire d'une affiche au format « définition » (src/affiches/) : tout vient de la définition, aucun code propre
    à une affiche.
      <FormulaireAffiche :module="afficheDe('exemple')" :depart="{ variante: 'jusqua10' }" />
    Variante, un bouton par valeur de chaque réglage à choix (<ChoixReglage> : « (bonus) », « (hors programme) »),
    langue, format, orientation, police, aperçu et impression. `depart` : réglages du lien (?variante=…&langue=…).
  -->
  <div class="config-box large">
    <div class="config-section" data-reglage="variante">
      <div class="config-section-title">{{ t('version') }}</div>
      <div class="btn-group">
        <button v-for="(v, id) in definition.variantes" :key="id" class="level-btn" :data-valeur="id"
          :class="{ active: config.variante === id }" @click="config = reglagesApresVariante(definition, config, id)">
          {{ T(cleVariante(id, 'court')) }} <small>· {{ v.niveaux.map(n => n.toUpperCase()).join(' · ') }}</small></button>
      </div>
    </div>

    <ChoixReglage v-for="cle in reglagesAChoix" :key="cle" :definition="choix" :niveau="config.variante" :cle="cle"
      :model-value="valeur(cle)" @update:model-value="changer(cle, $event)" :titre="T(cleReglage(cle))" :libelle="v => T(cleValeur(cle, v))" />

    <div class="config-grid">
      <div v-if="definition.langues.length > 1" class="config-section" data-reglage="langue">
        <div class="config-section-title">{{ t('langue') }}</div>
        <div class="btn-group">
          <button v-for="l in definition.langues" :key="l" class="level-btn" :data-valeur="l" :class="{ active: config.langue === l }"
            @click="config.langue = l">{{ l.toUpperCase() }}</button>
        </div>
      </div>
      <div v-if="definition.formats.length > 1" class="config-section" data-reglage="format">
        <div class="config-section-title">{{ t('format') }}</div>
        <div class="btn-group">
          <button v-for="f in definition.formats" :key="f" class="level-btn" :data-valeur="f" :class="{ active: config.format === f }"
            @click="config.format = f">{{ f }}</button>
        </div>
      </div>
      <div class="config-section" data-reglage="orientation">
        <div class="config-section-title">{{ t('orientation') }}</div>
        <div class="btn-group">
          <button v-for="o in ORIENTATIONS" :key="o" class="level-btn" :data-valeur="o" :class="{ active: config.orientation === o }"
            @click="config.orientation = o">{{ t(o === 'landscape' ? 'paysage' : 'portrait') }}</button>
        </div>
      </div>
    </div>

    <div class="config-section">
      <div class="config-section-title">{{ t('polices') }}</div>
      <ChoixPolice />
    </div>

    <ApercuImpression :reglages="config" :html="resultat.html" :format="config.format" :orientation="config.orientation" :nb-pages="resultat.nbPages" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import ApercuImpression from '../components/ApercuImpression.vue'
import ChoixPolice from './ChoixPolice.vue'
import ChoixReglage from './ChoixReglage.vue'
import { usePolices, policeDeFiche } from './polices.ts'
import { chargerReglages, sauvegarder } from '../utils/index.js'
import { useI18n, contenu } from '../i18n/index.js'
import { TEXTES_FORMULAIRE_AFFICHE } from './textes.ts'
import { reglagesDe, reglagesApresVariante, optionsDe, varianteDe, commeExercice, ORIENTATIONS } from '../affiches/outils.ts'
import { genererAffiche } from '../affiches/generer.ts'
import { cleVariante, cleReglage, cleValeur } from '../affiches/textes.ts'
import type { ModuleAffiche } from '../affiches/types.ts'
import type { Reglages, ValeurReglage } from './types.ts'

const props = withDefaults(defineProps<{
  module: ModuleAffiche
  // réglages donnés par le lien : ils l'emportent sur ceux mémorisés
  depart?: Record<string, string>
}>(), { depart: () => ({}) })
const { t } = useI18n(TEXTES_FORMULAIRE_AFFICHE)
const definition = props.module.definition
const choix = commeExercice(definition)

// réglages mémorisés par affiche, ramenés à des valeurs valides (reglagesDe)
const CLE = `affiche_${definition.id.replaceAll('-', '_')}`
const config = ref(reglagesDe(definition, { ...chargerReglages(CLE, reglagesDe(definition)), ...props.depart }))
watch(config, v => sauvegarder(CLE, v), { deep: true })
// les réglages à choix, lus et écrits par clé (leurs clés dépendent de l'affiche)
const valeur = (cle: string): ValeurReglage => (config.value as Reglages)[cle]
const changer = (cle: string, v: ValeurReglage): void => { (config.value as Reglages)[cle] = v }

// textes de l'affiche, dans la langue de l'affiche choisie (titres des réglages, noms des variantes)
const T = (cle: string): string => contenu(props.module.textes, config.value.langue).t(cle)
const reglagesAChoix = computed(() => Object.keys(optionsDe(definition, varianteDe(definition, config.value.variante))))

const polices = usePolices()
const resultat = computed(() => (polices.pret.value
  ? genererAffiche(props.module, config.value, { script: policeDeFiche() })
  : { html: '', nbPages: 1 }))
</script>

<style scoped>
.config-box.large { max-width: 960px; }
.config-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 0 1.5rem; }
.level-btn small { opacity: .7; font-weight: 400; }
</style>
