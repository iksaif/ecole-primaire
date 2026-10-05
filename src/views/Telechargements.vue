<template>
  <!-- La page /telechargements : les fiches PDF toutes prêtes. Elle lit fiches/index.json (écrit par `npm run fiches`) ;
       tout ce qui s'affiche vient de ces données et des textes `telechargements.*`. -->
  <div class="container">
    <h1 class="section-heading">{{ t('telechargements.titre') }}</h1>
    <p class="intro">{{ t('telechargements.intro') }}</p>

    <p v-if="etat.etat === 'chargement'" class="message" role="status">{{ t('telechargements.chargement') }}</p>

    <div v-else-if="etat.etat === 'absent'" class="message" role="alert">
      <p>{{ t('telechargements.absent') }}</p>
      <p v-if="dev" class="aide">{{ t('telechargements.absentDev') }}</p>
      <button type="button" class="btn btn-ghost" @click="recharger">{{ t('telechargements.reessayer') }}</button>
    </div>

    <div v-else-if="etat.etat === 'erreur'" class="message" role="alert">
      <p>{{ t('telechargements.erreur', { message: etat.message }) }}</p>
      <button type="button" class="btn btn-ghost" @click="recharger">{{ t('telechargements.reessayer') }}</button>
    </div>

    <p v-else-if="vide" class="message" role="status">{{ t('telechargements.vide') }}</p>

    <template v-else-if="index">
      <form class="outils" role="search" @submit.prevent>
        <label class="recherche">
          <span class="visuel-cache">{{ t('telechargements.rechercher') }}</span>
          <input v-model="criteres.texte" type="search" autocomplete="off" :placeholder="t('telechargements.rechercher')">
        </label>
        <div class="filtres" role="group" :aria-label="t('telechargements.filtres')">
          <div v-if="index.filtres.usages.length > 1" class="filtre" role="group" :aria-label="t('telechargements.usage')">
            <button type="button" :aria-pressed="criteres.usage === ''" @click="criteres.usage = ''">{{ t('telechargements.tout') }}</button>
            <button v-for="u in index.filtres.usages" :key="u" type="button" :aria-pressed="criteres.usage === u" @click="criteres.usage = u">{{ t(`telechargements.${u}`) }}</button>
          </div>
          <div class="filtre" role="group" :aria-label="t('telechargements.classe')">
            <span class="lib" aria-hidden="true">{{ t('telechargements.classe') }}</span>
            <button type="button" :aria-pressed="criteres.classe === ''" @click="criteres.classe = ''">{{ t('telechargements.toutes') }}</button>
            <button v-for="c in index.filtres.classes" :key="c" type="button" :aria-pressed="criteres.classe === c" @click="criteres.classe = c">{{ c.toUpperCase() }}</button>
          </div>
          <div v-if="languesProposees.length > 1" class="filtre" role="group" :aria-label="t('telechargements.langue')">
            <span class="lib" aria-hidden="true">{{ t('telechargements.langue') }}</span>
            <button type="button" :aria-pressed="criteres.langue === ''" @click="criteres.langue = ''">{{ t('telechargements.toutes') }}</button>
            <button v-for="l in languesProposees" :key="l" type="button" :aria-pressed="criteres.langue === l" @click="criteres.langue = l">{{ nomLangue(l) }}</button>
          </div>
          <label v-if="index.filtres.domaines.length > 1" class="filtre">
            <span class="lib">{{ t('telechargements.domaine') }}</span>
            <select v-model="criteres.domaine">
              <option value="">{{ t('telechargements.tout') }}</option>
              <option v-for="d in index.filtres.domaines" :key="d.id ?? 'hors-programme'" :value="d.id ?? 'hors-programme'">{{ texteDe(d.nom, langue) }}</option>
            </select>
          </label>
        </div>
        <p class="compteur" role="status" aria-live="polite">{{ t('telechargements.compteur', { n: resultats.length }) }}</p>
      </form>

      <p v-if="nbMasquees && regionaleProposee" class="regionale">
        <button type="button" class="lien" @click="activerRegionale">{{ t('telechargements.voirRegionale', { langue: nomLangue(regionaleProposee) }) }}</button>
      </p>

      <div v-if="!resultats.length" class="message" role="status">
        <p>{{ t('telechargements.aucune') }}</p>
        <button v-if="filtre" type="button" class="btn btn-ghost" @click="effacer">{{ t('telechargements.effacer') }}</button>
      </div>

      <section v-for="g in groupes" :key="g.domaine.id ?? 'hors-programme'" class="domaine" :aria-labelledby="`d-${g.domaine.id ?? 'hp'}`">
        <h2 :id="`d-${g.domaine.id ?? 'hp'}`">
          {{ texteDe(g.domaine.nom, langue) }}
          <span v-for="p in g.domaine.programme" :key="p.url" class="programme">
            <a :href="p.url" target="_blank" rel="noopener" :title="p.nom">{{ t('telechargements.programmeOfficiel') }}<template v-if="g.domaine.programme.length > 1"> ({{ etiquetteClasses(p.classes, NIVEAUX) }})</template></a>
          </span>
        </h2>
        <template v-for="u in USAGES" :key="u">
          <div v-if="g.entrees.some(e => e.usage === u)" class="groupe">
            <h3>{{ t(`telechargements.${u}`) }}</h3>
            <div class="grille">
              <CarteFiche v-for="e in g.entrees.filter(x => x.usage === u)" :key="e.slug" :entree="e" />
            </div>
          </div>
        </template>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { NIVEAUX } from '../data/classes.ts'
import { chargerValeur } from '../utils/index.js'
import { useLangue } from '../langues/useLangue.ts'
import { useLangueRegionale } from '../langues/useLangueRegionale.ts'
import { estLangue, estRegionale, nomDeLangue } from '../langues/registre.ts'
import type { Langue } from '../langues/registre.ts'
import CarteFiche from '../telechargements/CarteFiche.vue'
import { etiquetteClasses, texteDe } from '../telechargements/recherche.ts'
import { USAGES } from '../telechargements/types.ts'
import type { Classe } from '../telechargements/types.ts'
import { useFiches } from '../telechargements/useFiches.ts'

const { t, langue } = useLangue()
const regionale = useLangueRegionale()
const route = useRoute()
const dev = import.meta.env.DEV

// une langue du contenu est « régionale » si le registre des langues la tient pour telle
const regionaleDe = (l: string): boolean => estLangue(l) && estRegionale(l)
// Une fiche dans une langue régionale n'est montrée que si cette langue est active (réglage de l'utilisateur ou du site)
const { etat, index, vide, criteres, resultats, groupes, nbMasquees, filtre, effacer, recharger } = useFiches({
  visible: e => e.langues.every(l => !regionaleDe(l) || l === regionale.code.value),
})
const nomLangue = (l: string): string => (estLangue(l) ? nomDeLangue(l, langue.value) : l)
const languesProposees = computed(() => (index.value?.filtres.langues ?? []).filter(l => !regionaleDe(l) || l === regionale.code.value))
// la langue régionale qu'on peut activer d'un clic : la première proposée par le site
const regionaleProposee = computed<Langue | ''>(() => (regionale.code.value ? '' : regionale.proposees[0]?.code ?? ''))
const activerRegionale = (): void => { if (regionaleProposee.value) regionale.reglage.value = regionaleProposee.value }

// départ : ?q= et ?classe= du lien, sinon la classe choisie dans les réglages
onMounted(() => {
  const q = route.query.q
  if (typeof q === 'string') criteres.texte = q
})
watch(index, i => {
  if (!i) return
  const demandee = typeof route.query.classe === 'string' ? route.query.classe : chargerValeur<string>('classe', '')
  const classe = i.filtres.classes.find((c): c is Classe => c === demandee)
  if (classe) criteres.classe = classe
}, { immediate: true })
</script>

<style scoped>
.intro { color: #555; max-width: 760px; margin-bottom: 1rem; }
.message { color: #555; margin: 2rem 0; display: flex; flex-direction: column; gap: .75rem; align-items: flex-start; }
.aide { font-size: .9rem; color: #777; }
.visuel-cache { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }
.outils { position: sticky; top: 0; z-index: 5; background: var(--gris-bg); padding: .75rem 0; display: flex; flex-direction: column; gap: .6rem; }
.recherche input { width: 100%; font: inherit; font-size: 1.05rem; padding: .7rem 1rem; border: 2px solid var(--gris-brd); border-radius: var(--radius); background: white; }
.recherche input:focus { outline: none; border-color: var(--bleu); }
.filtres { display: flex; gap: .5rem 1.25rem; flex-wrap: wrap; align-items: center; }
.filtre { display: flex; gap: .3rem; flex-wrap: wrap; align-items: center; }
.lib { font-size: .75rem; font-weight: 800; color: #888; text-transform: uppercase; margin-right: .2rem; }
.filtre button { border: 2px solid var(--gris-brd); background: white; border-radius: 20px; padding: .25rem .8rem; font: inherit; font-size: .9rem; font-weight: 700; cursor: pointer; color: var(--texte); }
.filtre button[aria-pressed="true"] { background: var(--bleu); border-color: var(--bleu); color: white; }
.filtre select { font: inherit; padding: .25rem .5rem; border: 2px solid var(--gris-brd); border-radius: 10px; background: white; }
.compteur { font-size: .85rem; color: #777; }
.regionale { margin: .5rem 0; }
.lien { background: none; border: none; font: inherit; color: var(--bleu); text-decoration: underline; cursor: pointer; padding: 0; }
.domaine { margin-top: 2.5rem; }
.domaine h2 { font-size: 1.35rem; display: flex; flex-wrap: wrap; align-items: baseline; gap: .25rem 1rem; }
.programme { font-size: .85rem; font-weight: 400; }
.programme a { color: #777; }
.groupe h3 { font-size: 1.05rem; margin: 1.25rem 0 .6rem; color: #555; }
.grille { display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 1rem; }
</style>
