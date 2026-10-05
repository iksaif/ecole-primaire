<template>
  <!-- La page d'une fiche : /telechargements/:slug. Lit fiches/<slug>.json (aperçu des pages, PDF, compétences) et, pour les
       fiches par compétence et les voisines, l'index. -->
  <div class="container">
    <nav class="fil" :aria-label="t('telechargements.titre')">
      <router-link to="/telechargements">{{ t('telechargements.retour') }}</router-link>
      <template v-if="domaine"> › <span>{{ texteDe(domaine.nom, langue) }}</span></template>
    </nav>

    <p v-if="etat.etat === 'chargement'" class="message" role="status">{{ t('telechargements.chargement') }}</p>

    <div v-else-if="etat.etat === 'absent'" class="message" role="alert">
      <p>{{ t('telechargements.introuvable') }}</p>
      <router-link class="btn btn-ghost" to="/telechargements">{{ t('telechargements.retour') }}</router-link>
    </div>

    <div v-else-if="etat.etat === 'erreur'" class="message" role="alert">
      <p>{{ t('telechargements.erreur', { message: etat.message }) }}</p>
      <router-link class="btn btn-ghost" to="/telechargements">{{ t('telechargements.retour') }}</router-link>
    </div>

    <template v-else-if="entree && variante && page">
      <h1 :lang="langueDuTexte(entree.titre, langue)">{{ texteDe(entree.titre, langue) }}</h1>
      <p class="intro" :lang="langueDuTexte(entree.descriptionLongue, langue)">{{ texteDe(entree.descriptionLongue, langue) }}</p>

      <div class="fiche">
        <div class="apercu">
          <div v-if="entree.variantes.length > 1" class="pager" role="group" :aria-label="t('telechargements.apercu')">
            <button v-for="(v, k) in entree.variantes" :key="v.id" type="button" :aria-pressed="k === iVariante" @click="choisirVariante(k)">
              {{ v.titre ? texteDe(v.titre, langue) : t('telechargements.fiche', { n: k + 1 }) }}
            </button>
          </div>
          <img :src="urlFiches(page.chemin)" :width="page.largeur" :height="page.hauteur" :alt="`${t('telechargements.apercu')} : ${texteDe(entree.titreCourt, langue)}`">
          <div v-if="variante.pages.length > 1" class="pager pages" role="group" :aria-label="t('telechargements.apercu')">
            <button type="button" :disabled="iPage === 0" :aria-label="t('telechargements.precedent')" @click="iPage--">◀</button>
            <span class="position" aria-live="polite">{{ t('telechargements.page', { n: iPage + 1, total: variante.pages.length }) }}</span>
            <button type="button" :disabled="iPage === variante.pages.length - 1" :aria-label="t('telechargements.suivant')" @click="iPage++">▶</button>
          </div>
        </div>

        <div class="actions">
          <a class="btn btn-warning" :href="urlFiches(variante.pdfs[0].chemin)" download>📥 {{ t('telechargements.telecharger') }}</a>
          <a v-for="p in variante.pdfs.slice(1)" :key="p.format" class="btn btn-ghost" :href="urlFiches(p.chemin)" download>📥 {{ t('telechargements.telechargerFormat', { format: p.format }) }}</a>
          <button type="button" class="btn btn-ghost" @click="imprimer(urlFiches(variante.pdfs[0].chemin))">🖨️ {{ t('telechargements.imprimer') }}</button>
          <router-link v-if="entree.personnaliser" class="btn btn-ghost" :to="{ path: entree.personnaliser.route, query: entree.personnaliser.requete }">✏️ {{ t('telechargements.personnaliser') }}</router-link>
          <p class="aide">{{ t('telechargements.imprimerAide') }} {{ t('telechargements.personnaliserAide') }}</p>

          <dl class="infos">
            <dt>{{ t('telechargements.classes') }}</dt>
            <dd>{{ etiquetteClasses(entree.niveaux, NIVEAUX) }}</dd>
            <dt>{{ t('telechargements.infos') }}</dt>
            <dd>
              {{ t('telechargements.pages', { n: variante.pdfs[0].nbPages }) }}
              <template v-if="entree.nbVariantes > 1"> · {{ t('telechargements.variantes', { n: entree.nbVariantes }) }}</template>
            </dd>
            <dt>{{ t('telechargements.formats') }}</dt>
            <dd>{{ variante.pdfs.map(p => `${p.format} (${ko(p.taille)})`).join(' · ') }}</dd>
            <template v-if="entree.langues.length > 1 || entree.langues[0] !== 'fr'">
              <dt>{{ t('telechargements.langues') }}</dt>
              <dd>{{ entree.langues.map(nomLangue).join(' · ') }}</dd>
            </template>
            <template v-if="domaine">
              <dt>{{ t('telechargements.domaine') }}</dt>
              <dd>
                {{ texteDe(domaine.nom, langue) }}
                <template v-for="p in programmeDuDomaine" :key="p.url">
                  — <a :href="p.url" target="_blank" rel="noopener" :title="p.nom">{{ t('telechargements.programmeOfficiel') }}</a>
                </template>
              </dd>
            </template>
          </dl>
        </div>
      </div>

      <section v-if="entree.competences.length" class="bloc">
        <h2>{{ t('telechargements.competences') }}</h2>
        <ul>
          <li v-for="k in entree.competences" :key="k.id" lang="fr">
            {{ k.libelle }}
            <a v-if="k.source" :href="k.source.url" target="_blank" rel="noopener" class="source">({{ t('telechargements.sourceProgramme', { page: k.source.page }) }})</a>
          </li>
        </ul>
      </section>

      <section v-if="parent" class="bloc">
        <p><router-link :to="`/telechargements/${parent.slug}`">↩ {{ t('telechargements.bilan') }}</router-link></p>
      </section>
      <section v-if="enfants.length" class="bloc">
        <h2>{{ t('telechargements.parCompetence') }}</h2>
        <p class="aide">{{ t('telechargements.parCompetenceAide') }}</p>
        <div class="grille"><CarteFiche v-for="e in enfants" :key="e.slug" :entree="e" /></div>
      </section>
      <section v-if="voisines.length" class="bloc">
        <h2>{{ t('telechargements.voisines') }}</h2>
        <div class="grille"><CarteFiche v-for="e in voisines" :key="e.slug" :entree="e" /></div>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { NIVEAUX } from '../data/classes.ts'
import { useLangue } from '../langues/useLangue.ts'
import { estLangue, nomDeLangue } from '../langues/registre.ts'
import { urlFiches } from '../telechargements/chargement.ts'
import CarteFiche from '../telechargements/CarteFiche.vue'
import { etiquetteClasses, langueDuTexte, texteDe } from '../telechargements/recherche.ts'
import type { EntreeIndex } from '../telechargements/types.ts'
import { useFiche, useFiches } from '../telechargements/useFiches.ts'

const { t, langue } = useLangue()
const route = useRoute()
const slug = computed(() => String(route.params.slug ?? ''))
const { etat, entree } = useFiche(() => slug.value)
const { index, entreeDe } = useFiches()

// variante (une des fiches d'un exercice) et page affichées ; on repart de la première quand la fiche change
const iVariante = ref(0)
const iPage = ref(0)
watch(slug, () => { iVariante.value = 0; iPage.value = 0 })
const choisirVariante = (k: number): void => { iVariante.value = k; iPage.value = 0 }
const variante = computed(() => entree.value?.variantes[iVariante.value])
const page = computed(() => variante.value?.pages[iPage.value] ?? variante.value?.pages[0])

const domaine = computed(() => (entree.value && index.value ? index.value.filtres.domaines.find(d => d.id === entree.value!.domaine) : undefined))
// liens du programme officiel qui concernent les classes de la fiche
const programmeDuDomaine = computed(() => domaine.value?.programme.filter(p => p.classes.some(c => entree.value?.niveaux.includes(c))) ?? [])
const parent = computed(() => (entree.value?.parent ? entreeDe(entree.value.parent) : undefined))
const enfants = computed<EntreeIndex[]>(() => index.value?.entrees.filter(e => e.parent === slug.value) ?? [])
const voisines = computed<EntreeIndex[]>(() => (entree.value?.voisines ?? []).flatMap(s => { const e = entreeDe(s); return e && e.slug !== entree.value?.parent ? [e] : [] }))

const nomLangue = (l: string): string => (estLangue(l) ? nomDeLangue(l, langue.value) : l)
const ko = (octets: number): string => (octets >= 1e6 ? `${(octets / 1e6).toFixed(1)} Mo` : `${Math.max(1, Math.round(octets / 1e3))} Ko`)

// Imprime le PDF sans le télécharger (iframe cachée) ; sans réussite (navigateur qui n'imprime pas un PDF intégré), l'ouvre
function imprimer(url: string): void {
  const f = document.createElement('iframe')
  f.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0'
  f.src = url
  f.onload = () => {
    try { f.contentWindow?.focus(); f.contentWindow?.print() } catch { window.open(url, '_blank') }
    setTimeout(() => f.remove(), 60000)
  }
  document.body.appendChild(f)
}
</script>

<style scoped>
.fil { font-size: .85rem; color: #777; margin-bottom: 1rem; }
.fil a { color: #777; }
.message { color: #555; margin: 2rem 0; display: flex; flex-direction: column; gap: .75rem; align-items: flex-start; }
h1 { font-size: 1.7rem; margin-bottom: .5rem; }
.intro { color: #555; max-width: 760px; }
.fiche { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr); gap: 2rem; align-items: start; margin-top: 1.5rem; }
.apercu { background: white; border-radius: var(--radius); box-shadow: var(--shadow); padding: .75rem; }
.apercu img { width: 100%; height: auto; display: block; border: 1px solid var(--gris-brd); }
.pager { display: flex; gap: .35rem; flex-wrap: wrap; align-items: center; margin: .6rem 0; }
.pager button { border: 2px solid var(--gris-brd); background: white; border-radius: 8px; padding: .35rem .8rem; font: inherit; font-weight: 800; cursor: pointer; color: var(--texte); }
.pager button[aria-pressed="true"] { background: var(--bleu); border-color: var(--bleu); color: white; }
.pager button:disabled { opacity: .4; cursor: default; }
.position { font-weight: 700; color: #555; padding: 0 .4rem; }
.actions { display: flex; flex-direction: column; gap: .75rem; align-items: stretch; }
.actions .btn { justify-content: center; text-align: center; text-decoration: none; }
.aide { font-size: .9rem; color: #666; }
.infos { display: grid; grid-template-columns: max-content 1fr; gap: .3rem 1rem; font-size: .95rem; color: #555; }
.infos dt { font-weight: 700; }
.bloc { margin-top: 2rem; }
.bloc h2 { font-size: 1.2rem; margin-bottom: .5rem; }
.bloc ul { padding-left: 1.2rem; line-height: 1.6; }
.source { font-size: .8rem; color: #777; }
.grille { display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 1rem; margin-top: .75rem; }
@media (max-width: 720px) { .fiche { grid-template-columns: 1fr; } }
</style>
