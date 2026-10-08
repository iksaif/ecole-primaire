<template>
  <div class="container large">
    <h1 class="section-heading">{{ t('relecture.titre') }}</h1>
    <p class="intro">{{ t('relecture.intro') }}</p>

    <div class="reglages">
      <fieldset>
        <legend>{{ t('relecture.quoi') }}</legend>
        <label><input v-model="quoi" type="radio" value="relire"> {{ t('relecture.aRelire') }}</label>
        <label><input v-model="quoi" type="radio" value="tous"> {{ t('relecture.tous') }}</label>
      </fieldset>

      <fieldset>
        <legend>{{ t('relecture.sources') }}</legend>
        <label v-for="s in SOURCES" :key="s.id"><input v-model="origines" type="checkbox" :value="s.id"> {{ t(s.cle) }}</label>
      </fieldset>

      <fieldset>
        <legend>{{ t('relecture.mise') }}</legend>
        <label>{{ t('relecture.lignes') }}
          <select v-model="lignes">
            <option value="auto">{{ t('relecture.auto') }}</option>
            <option v-for="n in [1, 2, 3, 4, 5]" :key="n" :value="n">{{ n }}</option>
          </select>
        </label>
        <label><input v-model="cases" type="checkbox"> {{ t('relecture.cases') }}</label>
        <label><input v-model="cles" type="checkbox"> {{ t('relecture.cles') }}</label>
        <label><input v-model="parSection" type="checkbox"> {{ t('relecture.parSection') }}</label>
      </fieldset>
    </div>

    <details class="sections">
      <summary>{{ t('relecture.sectionsCompte', { n: selection.sections }) }}</summary>
      <p class="actions">
        <button type="button" class="level-btn" @click="exclues.clear()">{{ t('relecture.toutes') }}</button>
        <button type="button" class="level-btn" @click="toutesLesSections.forEach(id => exclues.add(id))">{{ t('relecture.aucune') }}</button>
      </p>
      <ul>
        <li v-for="[id, n] in candidatsParSection" :key="id">
          <label><input type="checkbox" :checked="!exclues.has(id)" @change="basculer(id)"> {{ id }} <small>({{ n }})</small></label>
        </li>
      </ul>
    </details>

    <p class="compte"><strong>{{ t('relecture.compte', { n: selection.lignes.length }) }}</strong> — {{ t('relecture.compteParties', { fiches: selection.fiches, ui: selection.lignes.length - selection.fiches }) }}</p>
    <p v-if="!selection.lignes.length" class="vide">{{ t('relecture.vide') }}</p>
    <ApercuImpression v-else :html="html" format="A4" orientation="portrait" fluide />
  </div>
</template>

<script setup lang="ts">
// Relecture du breton (développement seulement, /dev/relecture-breton) : les textes bretons à relire, sortis en document à imprimer ou à
// enregistrer en PDF pour un·e brittophone, avec de la place pour écrire la correction. Les textes viennent de relectureDonnees.ts, la lecture
// des marqueurs de src/langues/relecture.ts (comme `npm run i18n`), la mise en page de src/impression/relecture.ts.
import { computed, reactive, ref } from 'vue'
import ApercuImpression from '../../noyau/ApercuImpression.vue'
import { useLangue } from '../../langues/useLangue.ts'
import { documentRelecture } from '../../impression/relecture.ts'
import { SITE } from '../../sites.ts'
import { lignesDuSite } from './relectureDonnees.ts'
import type { LigneRelecture, OrigineRelecture } from '../../langues/relecture.ts'

const { t } = useLangue()

const SOURCES: { id: OrigineRelecture, cle: 'relecture.source.interface' | 'relecture.source.exercice' | 'relecture.source.affiche' }[] = [
  { id: 'exercice', cle: 'relecture.source.exercice' },
  { id: 'affiche', cle: 'relecture.source.affiche' },
  { id: 'interface', cle: 'relecture.source.interface' },
]

const toutes = lignesDuSite()

const quoi = ref<'relire' | 'tous'>('relire')
const origines = ref<OrigineRelecture[]>(SOURCES.map(s => s.id))
const lignes = ref<number | 'auto'>('auto')
const cases = ref(true)
const cles = ref(true)
const parSection = ref(false)
// les sections décochées, par identifiant `origine · section`
const exclues = reactive(new Set<string>())

const idSection = (l: LigneRelecture): string => `${l.origine} · ${l.section}`

/** Toutes les sections du site (même celles qu'aucun choix ne retient aujourd'hui) : « tout décocher » les exclut toutes. */
const toutesLesSections = [...new Set(toutes.map(idSection))]

/** Les textes que `quoi` et `origines` retiennent, avant le choix des sections. */
const candidats = computed(() => toutes.filter(l =>
  origines.value.includes(l.origine) && (quoi.value === 'tous' || l.aRelire)))

/** Les sections qui ont au moins un candidat, avec leur nombre de textes. */
const candidatsParSection = computed((): [string, number][] => {
  const comptes = new Map<string, number>()
  for (const l of candidats.value) comptes.set(idSection(l), (comptes.get(idSection(l)) ?? 0) + 1)
  return [...comptes]
})

function basculer(id: string): void {
  if (exclues.has(id)) exclues.delete(id)
  else exclues.add(id)
}

const selection = computed(() => {
  const retenues = candidats.value.filter(l => !exclues.has(idSection(l)))
  const sections = new Set(retenues.map(idSection)).size
  const fiches = retenues.filter(l => l.origine !== 'interface').length
  return { lignes: retenues, sections, fiches }
})

const html = computed(() => documentRelecture(selection.value.lignes, {
  lignes: lignes.value, cases: cases.value, cles: cles.value, parSection: parSection.value, contact: SITE.contact,
}))
</script>

<style scoped>
.intro { color: var(--texte-doux); margin: -.5rem 0 1rem; max-width: 60rem; }
.reglages { display: flex; flex-wrap: wrap; gap: 1rem; margin-bottom: 1rem; }
fieldset { border: 1px solid var(--gris-brd); border-radius: var(--radius); padding: .5rem .9rem .7rem; background: white; display: flex; flex-direction: column; gap: .3rem; }
legend { font-weight: 700; padding: 0 .3rem; }
label { display: flex; align-items: center; gap: .4rem; }
.sections { margin: 0 0 1rem; background: white; border: 1px solid var(--gris-brd); border-radius: var(--radius); padding: .5rem .9rem; }
.sections summary { cursor: pointer; font-weight: 700; }
.sections ul { list-style: none; columns: 3 14rem; margin: .5rem 0 0; padding: 0; }
.sections small { color: var(--texte-doux); }
.actions { display: flex; gap: .5rem; margin: .6rem 0 0; }
.compte { margin: .5rem 0; }
.vide { color: var(--texte-doux); }
</style>
