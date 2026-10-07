<!--
  Le formulaire d'une affiche au format « définition » (src/affiches/) : tout vient de la définition, aucun code propre
  à une affiche. Il se compose des briques communes du noyau (comme CadreExercice, pour les exercices) :
  ChoixReglage, GroupeReglages, ChoixPolice, ApercuImpression.
    <FormulaireAffiche :module="afficheDe('exemple')" :depart="{ variante: 'jusqua10' }" />
  Variante ; préréglages (jeux de réglages nommés, qui restent modifiables) ; puis les groupes de `definition.formulaire`
  (ordre, titre, aide, « visible si ») : réglages à choix (« (bonus) », « (hors programme) », valeurs qui dépendent des
  autres réglages), champs libres (texte, nombre), langues affichées, polices, hasard ; puis la feuille (langue, format et
  orientation s'ils ne sont pas fixes, titre personnalisé) ; aperçu et impression. `depart` : réglages du lien
  (?variante=…&langues=fr,br).
  Langue : le formulaire (titres, noms des variantes, aides) est dans la langue de l'INTERFACE ; seul l'aperçu est dans
  la langue de l'affiche. Une langue sans traduction d'un texte retombe sur le français.
-->
<template>
  <div class="config-box large">
    <!-- 1. la version : une fiche toute prête (ses réglages de départ) ; 2. le reste : ce qu'on ajuste pour cette version -->
    <section class="bloc bloc-version" data-reglage="variante" :aria-labelledby="`${idBase}-version`">
      <h2 class="bloc-titre" :id="`${idBase}-version`"><span class="num" aria-hidden="true">1</span> {{ t('formulaireAffiche.version') }}</h2>
      <p class="bloc-aide">{{ t('formulaireAffiche.versionAide') }}</p>
      <!-- variantes placées sur des axes (un verbe × une série de temps) : une rangée de boutons par axe -->
      <template v-if="axes.length">
        <div v-for="axe in axes" :key="axe.id" class="axe" role="group" :aria-labelledby="`${idBase}-axe-${axe.id}`" :data-axe="axe.id">
          <div class="axe-titre" :id="`${idBase}-axe-${axe.id}`">{{ T(`axe.${axe.id}`) }}</div>
          <div class="btn-group">
            <button type="button" v-for="valeur in axe.valeurs" :key="valeur" class="level-btn" :data-valeur="valeur"
              :class="{ active: axesCourants[axe.id] === valeur }" :aria-pressed="axesCourants[axe.id] === valeur" @click="choisirSurAxe(axe.id, valeur)">
              {{ T(`axe.${axe.id}.${valeur}`) }}</button>
          </div>
        </div>
        <p class="axe-classes">{{ T(cleVariante(config.variante, 'court')) }} · {{ definition.variantes[config.variante]?.classes.map(n => n.toUpperCase()).join(' · ') }}</p>
      </template>
      <div v-else class="btn-group" role="group" :aria-labelledby="`${idBase}-version`">
        <button type="button" v-for="(v, id) in definition.variantes" :key="id" class="level-btn" :data-valeur="id"
          :class="{ active: config.variante === id }" :aria-pressed="config.variante === id" @click="config = reglagesApresVariante(definition, config, id)">
          {{ T(cleVariante(id, 'court')) }} <small>· {{ v.classes.map(n => n.toUpperCase()).join(' · ') }}</small></button>
      </div>
    </section>

    <section class="bloc bloc-reglages" :aria-labelledby="`${idBase}-reglages`">
    <h2 class="bloc-titre" :id="`${idBase}-reglages`"><span class="num" aria-hidden="true">2</span> {{ t('formulaireAffiche.personnaliser') }}</h2>
    <p class="bloc-aide">{{ t('formulaireAffiche.personnaliserAide') }}</p>

    <GroupeReglages v-if="prereglages.length" id="prereglages" :titre="t('formulaireAffiche.prereglages')" :aide="aide('prereglages')">
      <div class="btn-group" data-reglage="prereglage">
        <button v-for="p in prereglages" :key="p" type="button" class="level-btn" :data-valeur="p" :class="{ active: prereglageActif(definition, config, p) }"
          :aria-pressed="prereglageActif(definition, config, p)" @click="config = appliquerPrereglage(definition, config, p)">{{ T(clePrereglage(p)) }}</button>
      </div>
    </GroupeReglages>

    <component :is="g.id === 'feuille' ? 'div' : GroupeReglages" v-for="g in groupes" :key="g.id ?? 'libre'"
      v-bind="g.id && g.id !== 'feuille' ? { id: g.id, titre: T(cleGroupe(g.id)) } : {}">
      <template v-for="e in g.elements" :key="e.cle">
        <ChoixReglage v-if="e.sorte === 'choix'" :definition="choix" :niveau="config.variante" :cle="e.cle"
          :valeurs="valeursProposees(definition, e.cle, config)"
          :model-value="valeur(e.cle)" :titre="T(cleReglage(e.cle))" :libelle="v => T(cleValeur(e.cle, v))"
          @update:model-value="changer(e.cle, $event)"><p v-if="aide(e.cle)" class="aide-reglage">{{ aide(e.cle) }}</p></ChoixReglage>

        <div v-else-if="e.sorte === 'champ'" class="config-section" :data-groupe="e.cle">
          <label class="config-section-title" :for="idChamp(e.cle)">{{ T(cleReglage(e.cle)) }}</label>
          <input v-if="texteDe(e.cle)" :id="idChamp(e.cle)" class="champ-titre" type="text" :data-reglage="e.cle"
            :value="valeur(e.cle)" :maxlength="texteDe(e.cle)!.max" :aria-describedby="aide(e.cle) ? idChamp(e.cle) + '-aide' : undefined"
            @input="changer(e.cle, ($event.target as HTMLInputElement).value)">
          <input v-else :id="idChamp(e.cle)" class="champ-nombre" type="number" :data-reglage="e.cle" :value="valeur(e.cle)"
            :min="nombreDe(e.cle)!.min" :max="nombreDe(e.cle)!.max" :step="nombreDe(e.cle)!.pas" :aria-describedby="aide(e.cle) ? idChamp(e.cle) + '-aide' : undefined"
            @change="changer(e.cle, ($event.target as HTMLInputElement).valueAsNumber)">
          <p v-if="aide(e.cle)" :id="idChamp(e.cle) + '-aide'" class="aide-reglage">{{ aide(e.cle) }}</p>
        </div>

        <GroupeReglages v-else-if="e.sorte === 'langues'" id="langues" :titre="t('formulaireAffiche.langues')" :aide="aide('langues')">
          <div class="btn-group" data-reglage="langues">
            <button type="button" v-for="l in definition.langues" :key="l" class="level-btn" :data-valeur="l" :class="{ active: config.langues.includes(l) }" :aria-pressed="config.langues.includes(l)"
              @click="basculerLangue(l)">{{ l.toUpperCase() }}</button>
          </div>
        </GroupeReglages>

        <GroupeReglages v-else-if="e.sorte === 'polices'" id="polices" :titre="t('formulaireAffiche.polices')" :aide="aide('polices')">
          <ChoixPolice v-if="definition.police.mode === 'unique'" v-model="config.polices.unique" :libelle="t('formulaireAffiche.policeTexte')" />
          <ChoixPolice v-for="(type, i) in typesParType" v-else :key="type" v-model="config.polices[type]" :type="type"
            :libelle="T(clePolice(type))" :aide="i === 0" />
        </GroupeReglages>

        <GroupeReglages v-else-if="e.sorte === 'graine'" id="graine" :titre="t('formulaireAffiche.hasard')" :aide="aide('graine')">
          <button type="button" class="btn btn-ghost" data-action="nouvelle" @click="config.graine = graineAleatoire()">{{ t('formulaireAffiche.nouvelle') }}</button>
        </GroupeReglages>

        <GroupeReglages v-else id="titre" :titre="t('formulaireAffiche.titre')" :aide="aide('titre')">
          <input v-model="config.titre" class="champ-titre" type="text" :aria-label="t('formulaireAffiche.titre')" :maxlength="LONGUEUR_TITRE" :placeholder="t('formulaireAffiche.titreVide')" data-reglage="titre">
        </GroupeReglages>
      </template>
    </component>

    <div class="config-grid">
      <div v-if="!definition.bilingue && definition.langues.length > 1" class="config-section" data-reglage="langue">
        <div class="config-section-title" :id="`${idBase}-langue`">{{ t('formulaireAffiche.langue') }}</div>
        <div class="btn-group" role="group" :aria-labelledby="`${idBase}-langue`">
          <button type="button" v-for="l in definition.langues" :key="l" class="level-btn" :data-valeur="l" :class="{ active: config.langue === l }" :aria-pressed="config.langue === l"
            @click="config.langue = l; config.langues = [l]">{{ l.toUpperCase() }}</button>
        </div>
      </div>
      <div v-if="definition.formats.length > 1" class="config-section" data-reglage="format">
        <div class="config-section-title" :id="`${idBase}-format`">{{ t('formulaireAffiche.format') }}</div>
        <div class="btn-group" role="group" :aria-labelledby="`${idBase}-format`">
          <button type="button" v-for="f in definition.formats" :key="f" class="level-btn" :data-valeur="f" :class="{ active: config.format === f }" :aria-pressed="config.format === f"
            @click="config.format = f">{{ f }}</button>
        </div>
      </div>
      <div v-if="definition.orientations.length > 1" class="config-section" data-reglage="orientation">
        <div class="config-section-title" :id="`${idBase}-orientation`">{{ t('formulaireAffiche.orientation') }}</div>
        <div class="btn-group" role="group" :aria-labelledby="`${idBase}-orientation`">
          <button type="button" v-for="o in definition.orientations" :key="o" class="level-btn" :data-valeur="o" :class="{ active: config.orientation === o }" :aria-pressed="config.orientation === o"
            @click="config.orientation = o">{{ t(o === 'landscape' ? 'formulaireAffiche.paysage' : 'formulaireAffiche.portrait') }}</button>
        </div>
      </div>
    </div>
    </section>

    <ApercuImpression :reglages="config" :html="resultat.html" :format="config.format" :orientation="config.orientation" :nb-pages="resultat.nbPages" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, useId } from 'vue'
import ApercuImpression from '../noyau/ApercuImpression.vue'
import ChoixPolice from '../noyau/ChoixPolice.vue'
import ChoixReglage from '../noyau/ChoixReglage.vue'
import GroupeReglages from './GroupeReglages.vue'
import { usePolices, disponiblesDe } from '../noyau/polices.ts'
import { chargerReglages, sauvegarder } from '../utils/index.js'
import { useLangue } from '../langues/useLangue.ts'
import { graineAleatoire } from '../utils/hasard.ts'
import {
  reglagesDe, reglagesApresVariante, groupesDuFormulaire, commeExercice, champsDe, valeursProposees, typesDePoliceVisibles,
  appliquerPrereglage, prereglageActif, varianteDe, LONGUEUR_TITRE,
} from './outils.ts'
import { genererAffiche } from './generer.ts'
import { mesureNavigateur } from './mesureNavigateur.ts'
import { cleVariante, cleReglage, cleValeur, cleGroupe, cleAide, clePolice, clePrereglage, traducteurAffiche } from './textes.ts'
import type { ModuleAffiche, TypePolice } from './types.ts'
import type { Reglages, ValeurReglage } from '../noyau/types.ts'

const props = withDefaults(defineProps<{
  module: ModuleAffiche
  // réglages donnés par le lien : ils l'emportent sur ceux mémorisés
  depart?: Record<string, unknown>
}>(), { depart: () => ({}) })
// chaque changement de réglages : la page qui porte le formulaire peut écrire l'adresse (lien partageable)
const emit = defineEmits<{ reglages: [config: Readonly<Record<string, unknown>>] }>()
const { t, langue: langueInterface } = useLangue()
const definition = props.module.definition
const choix = commeExercice(definition)

// réglages mémorisés par affiche, ramenés à des valeurs valides (reglagesDe)
const CLE = `affiche_${definition.id.replaceAll('-', '_')}`
const memorises = reglagesDe(definition, chargerReglages(CLE, reglagesDe(definition)))
// un lien vers une variante (fiche toute prête, adresse partagée) ouvre CETTE fiche, avec ses réglages : seules les polices
// mémorisées sont gardées, pour les types que le lien ne fixe pas
const config = ref(reglagesDe(definition, reglagesDuDepart()))
function reglagesDuDepart(): Record<string, unknown> {
  if (!props.depart.variante) return { ...memorises, ...props.depart }
  const policesDuLien = (props.depart.polices ?? {}) as Readonly<Record<string, unknown>>
  return { ...props.depart, polices: { ...memorises.polices, ...policesDuLien } }
}

// ── Axes des variantes (definition.variantes[…].axes) : les valeurs de chaque axe, dans l'ordre des variantes ──
const axes = computed(() => {
  const variantes = Object.values(definition.variantes)
  const noms = Object.keys(variantes[0]?.axes ?? {})
  return noms.map(id => ({ id, valeurs: [...new Set(variantes.map(v => v.axes?.[id] ?? ''))] }))
})
const axesCourants = computed<Readonly<Record<string, string>>>(() => definition.variantes[config.value.variante]?.axes ?? {})
/** Choisir une valeur sur un axe : la variante qui garde les autres axes ; s'il n'y en a pas, la première qui a cette valeur. */
function choisirSurAxe(axe: string, valeur: string): void {
  const entrees = Object.entries(definition.variantes)
  const voulus = { ...axesCourants.value, [axe]: valeur }
  const memePlace = entrees.find(([, v]) => Object.entries(voulus).every(([a, x]) => v.axes?.[a] === x))
  const premiere = entrees.find(([, v]) => v.axes?.[axe] === valeur)
  const id = (memePlace ?? premiere)?.[0]
  if (id) config.value = reglagesApresVariante(definition, config.value, id)
}
watch(config, v => { sauvegarder(CLE, v); emit('reglages', v) }, { deep: true, immediate: true })
// les réglages à choix, lus et écrits par clé (leurs clés dépendent de l'affiche)
const valeur = (cle: string): ValeurReglage => (config.value as Reglages)[cle]
const changer = (cle: string, v: ValeurReglage): void => { (config.value as Reglages)[cle] = v }
// la visibilité dépend des réglages : un réglage qui disparaît reprend son défaut
watch(() => ({ ...config.value }), c => { if (JSON.stringify(reglagesDe(definition, c)) !== JSON.stringify(c)) config.value = reglagesDe(definition, c) }, { deep: true })

// textes de l'affiche pour le FORMULAIRE (titres des réglages, noms des variantes, aides) : dans la langue de l'interface,
// pas dans celle de la feuille (français si l'affiche n'a pas la traduction). L'aperçu, lui, suit la langue de la feuille.
const T = (cle: string): string => traducteurAffiche(props.module.textes, langueInterface.value)(cle)

const idBase = useId()
const idChamp = (cle: string): string => `${idBase}-${cle}`
const champs = computed(() => champsDe(definition, varianteDe(definition, config.value.variante)))
const texteDe = (cle: string) => { const c = champs.value[cle]; return c?.sorte === 'texte' ? c : null }
const nombreDe = (cle: string) => { const c = champs.value[cle]; return c?.sorte === 'nombre' ? c : null }
const prereglages = Object.keys(definition.prereglages)
const aide = (cle: string): string => { const a = T(cleAide(cle)); return a === cleAide(cle) ? '' : a }
const groupes = computed(() => groupesDuFormulaire(definition, config.value))
const typesParType = computed<readonly TypePolice[]>(() => typesDePoliceVisibles(definition, config.value))

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
const resultat = computed(() => (polices.pret.value ? genererAffiche(props.module, config.value, undefined, mesureNavigateur) : { html: '', nbPages: 1 }))
</script>

<style scoped>
.axe { margin-bottom: .6rem; }
.axe-titre { font-size: .8rem; font-weight: 800; text-transform: uppercase; color: var(--texte-doux); margin-bottom: .3rem; }
.axe-classes { font-size: .85rem; color: var(--texte-doux); margin: .2rem 0 0; }
.config-box.large { max-width: 960px; }
/* deux blocs : la version (une fiche toute prête, sur fond teinté) puis tout ce qui la personnalise */
.bloc-version { background: #eef5fd; border-left: 5px solid var(--bleu-fort); border-radius: var(--radius); padding: 1rem 1.1rem .6rem; margin-bottom: 1.5rem; }
.bloc-reglages { border-top: 2px solid var(--gris-brd); padding-top: 1.1rem; margin-bottom: .5rem; }
.bloc-titre { display: flex; align-items: center; gap: .55rem; font-size: 1.1rem; font-weight: 900; margin: 0 0 .15rem; }
.bloc-titre .num { display: inline-flex; align-items: center; justify-content: center; width: 1.7rem; height: 1.7rem; border-radius: 50%; background: var(--bleu-fort); color: white; font-size: .95rem; }
.bloc-aide { font-size: .88rem; color: var(--texte-doux); margin: 0 0 .8rem; }
.config-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 0 1.5rem; }
.level-btn small { font-weight: 400; }   /* sans opacité : sur le bouton actif (blanc sur bleu foncé) elle passerait sous 4,5:1 */
.champ-titre { font: inherit; width: 100%; max-width: 32rem; padding: .45rem .6rem; border: 2px solid var(--gris-brd); border-radius: 8px; }
.champ-nombre { font: inherit; width: 8rem; padding: .45rem .6rem; border: 2px solid var(--gris-brd); border-radius: 8px; }
.aide-reglage { font-size: .85rem; color: var(--texte-doux); margin: .35rem 0 0; }
</style>
