<template>
  <!--
    Le formulaire d'une affiche au format « définition » (src/affiches/) : tout vient de la définition, aucun code propre
    à une affiche. Il se compose des briques communes du noyau (comme CadreExercice, pour les exercices) :
    ChoixReglage, GroupeReglages, ChoixPolice, ApercuImpression.
      <FormulaireAffiche :module="afficheDe('exemple')" :depart="{ variante: 'jusqua10' }" />
    Variante ; puis les groupes de `definition.formulaire` (ordre, titre, aide, « visible si ») : réglages à choix
    (« (bonus) », « (hors programme) »), langues affichées, polices, hasard ; puis la feuille (langue, format,
    orientation, titre personnalisé) ; aperçu et impression. `depart` : réglages du lien (?variante=…&langues=fr,br).
  -->
  <div class="config-box large">
    <div class="config-section" data-reglage="variante">
      <div class="config-section-title">{{ t('formulaireAffiche.version') }}</div>
      <div class="btn-group">
        <button v-for="(v, id) in definition.variantes" :key="id" class="level-btn" :data-valeur="id"
          :class="{ active: config.variante === id }" @click="config = reglagesApresVariante(definition, config, id)">
          {{ T(cleVariante(id, 'court')) }} <small>· {{ v.niveaux.map(n => n.toUpperCase()).join(' · ') }}</small></button>
      </div>
    </div>

    <component :is="g.id === 'feuille' ? 'div' : GroupeReglages" v-for="g in groupes" :key="g.id ?? 'libre'"
      v-bind="g.id && g.id !== 'feuille' ? { id: g.id, titre: T(cleGroupe(g.id)) } : {}">
      <template v-for="e in g.elements" :key="e.cle">
        <ChoixReglage v-if="e.sorte === 'choix'" :definition="choix" :niveau="config.variante" :cle="e.cle"
          :model-value="valeur(e.cle)" :titre="T(cleReglage(e.cle))" :libelle="v => T(cleValeur(e.cle, v))"
          @update:model-value="changer(e.cle, $event)"><p v-if="aide(e.cle)" class="aide-reglage">{{ aide(e.cle) }}</p></ChoixReglage>

        <GroupeReglages v-else-if="e.sorte === 'langues'" id="langues" :titre="t('formulaireAffiche.langues')" :aide="aide('langues')">
          <div class="btn-group" data-reglage="langues">
            <button v-for="l in definition.langues" :key="l" class="level-btn" :data-valeur="l" :class="{ active: config.langues.includes(l) }"
              @click="basculerLangue(l)">{{ l.toUpperCase() }}</button>
          </div>
        </GroupeReglages>

        <GroupeReglages v-else-if="e.sorte === 'polices'" id="polices" :titre="t('formulaireAffiche.polices')" :aide="aide('polices')">
          <ChoixPolice v-if="definition.police.mode === 'unique'" v-model="config.polices.unique" :libelle="t('formulaireAffiche.policeTexte')" />
          <ChoixPolice v-for="(type, i) in typesParType" v-else :key="type" v-model="config.polices[type]" :type="type"
            :libelle="T(clePolice(type))" :aide="i === 0" />
        </GroupeReglages>

        <GroupeReglages v-else-if="e.sorte === 'graine'" id="graine" :titre="t('formulaireAffiche.hasard')" :aide="aide('graine')">
          <button class="btn btn-ghost" data-action="nouvelle" @click="config.graine = graineAleatoire()">{{ t('formulaireAffiche.nouvelle') }}</button>
        </GroupeReglages>

        <GroupeReglages v-else id="titre" :titre="t('formulaireAffiche.titre')" :aide="aide('titre')">
          <input v-model="config.titre" class="champ-titre" type="text" :maxlength="LONGUEUR_TITRE" :placeholder="t('formulaireAffiche.titreVide')" data-reglage="titre">
        </GroupeReglages>
      </template>
    </component>

    <div class="config-grid">
      <div v-if="!definition.bilingue && definition.langues.length > 1" class="config-section" data-reglage="langue">
        <div class="config-section-title">{{ t('formulaireAffiche.langue') }}</div>
        <div class="btn-group">
          <button v-for="l in definition.langues" :key="l" class="level-btn" :data-valeur="l" :class="{ active: config.langue === l }"
            @click="config.langue = l; config.langues = [l]">{{ l.toUpperCase() }}</button>
        </div>
      </div>
      <div v-if="definition.formats.length > 1" class="config-section" data-reglage="format">
        <div class="config-section-title">{{ t('formulaireAffiche.format') }}</div>
        <div class="btn-group">
          <button v-for="f in definition.formats" :key="f" class="level-btn" :data-valeur="f" :class="{ active: config.format === f }"
            @click="config.format = f">{{ f }}</button>
        </div>
      </div>
      <div class="config-section" data-reglage="orientation">
        <div class="config-section-title">{{ t('formulaireAffiche.orientation') }}</div>
        <div class="btn-group">
          <button v-for="o in ORIENTATIONS" :key="o" class="level-btn" :data-valeur="o" :class="{ active: config.orientation === o }"
            @click="config.orientation = o">{{ t(o === 'landscape' ? 'formulaireAffiche.paysage' : 'formulaireAffiche.portrait') }}</button>
        </div>
      </div>
    </div>

    <ApercuImpression :reglages="config" :html="resultat.html" :format="config.format" :orientation="config.orientation" :nb-pages="resultat.nbPages" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import ApercuImpression from '../components/ApercuImpression.vue'
import ChoixPolice from './ChoixPolice.vue'
import ChoixReglage from './ChoixReglage.vue'
import GroupeReglages from './GroupeReglages.vue'
import { usePolices, disponiblesDe } from './polices.ts'
import { chargerReglages, sauvegarder } from '../utils/index.js'
import { useLangue } from '../langues/useLangue.ts'
import { graineAleatoire } from '../utils/hasard.ts'
import { reglagesDe, reglagesApresVariante, groupesDuFormulaire, commeExercice, ORIENTATIONS, LONGUEUR_TITRE } from '../affiches/outils.ts'
import { genererAffiche } from '../affiches/generer.ts'
import { cleVariante, cleReglage, cleValeur, cleGroupe, cleAide, clePolice, traducteurAffiche } from '../affiches/textes.ts'
import type { ModuleAffiche, TypePolice } from '../affiches/types.ts'
import type { Reglages, ValeurReglage } from './types.ts'

const props = withDefaults(defineProps<{
  module: ModuleAffiche
  // réglages donnés par le lien : ils l'emportent sur ceux mémorisés
  depart?: Record<string, unknown>
}>(), { depart: () => ({}) })
const { t } = useLangue()
const definition = props.module.definition
const choix = commeExercice(definition)

// réglages mémorisés par affiche, ramenés à des valeurs valides (reglagesDe)
const CLE = `affiche_${definition.id.replaceAll('-', '_')}`
const config = ref(reglagesDe(definition, { ...chargerReglages(CLE, reglagesDe(definition)), ...props.depart }))
watch(config, v => sauvegarder(CLE, v), { deep: true })
// les réglages à choix, lus et écrits par clé (leurs clés dépendent de l'affiche)
const valeur = (cle: string): ValeurReglage => (config.value as Reglages)[cle]
const changer = (cle: string, v: ValeurReglage): void => { (config.value as Reglages)[cle] = v }
// la visibilité dépend des réglages : un réglage qui disparaît reprend son défaut
watch(() => ({ ...config.value }), c => { if (JSON.stringify(reglagesDe(definition, c)) !== JSON.stringify(c)) config.value = reglagesDe(definition, c) }, { deep: true })

// textes de l'affiche, dans la langue de l'affiche (titres des réglages, noms des variantes)
const T = (cle: string): string => traducteurAffiche(props.module.textes, config.value.langue)(cle)
const aide = (cle: string): string => { const a = T(cleAide(cle)); return a === cleAide(cle) ? '' : a }
const groupes = computed(() => groupesDuFormulaire(definition, config.value))
const typesParType = computed<readonly TypePolice[]>(() => (definition.police.mode === 'parType' ? definition.police.types : []))

// affiche bilingue : au moins une langue reste affichée, dans l'ordre de la définition
function basculerLangue(l: string): void {
  const choisies = config.value.langues.includes(l) ? config.value.langues.filter(x => x !== l) : [...config.value.langues, l]
  if (!choisies.length) return
  const langues = definition.langues.filter(x => choisies.includes(x))
  config.value.langues = langues
  config.value.langue = langues[0]
}

// une police mémorisée qui n'existe plus (autre ordinateur…) reprend le défaut de l'affiche
const polices = usePolices()
const scripts = disponiblesDe('script'), attaches = disponiblesDe('attache')
watch([polices.pret, scripts, attaches], () => {
  if (!polices.pret.value) return
  config.value = reglagesDe(definition, config.value, [...scripts.value, ...attaches.value].map(p => p.id))
}, { immediate: true })
const resultat = computed(() => (polices.pret.value ? genererAffiche(props.module, config.value) : { html: '', nbPages: 1 }))
</script>

<style scoped>
.config-box.large { max-width: 960px; }
.config-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 0 1.5rem; }
.level-btn small { opacity: .7; font-weight: 400; }
.champ-titre { font: inherit; width: 100%; max-width: 32rem; padding: .45rem .6rem; border: 2px solid var(--gris-brd); border-radius: 8px; }
.aide-reglage { font-size: .85rem; color: #777; margin: .35rem 0 0; }
</style>
