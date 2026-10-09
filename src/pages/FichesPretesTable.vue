<template>
  <!-- Les fiches en liste compacte (présentation « Liste ») : une ligne par fiche, le titre ouvre la feuille. Sur téléphone, les lignes
       s'empilent (le tableau devient une liste de blocs, les en-têtes restent lisibles par les lecteurs d'écran). -->
  <div class="tblwrap">
    <table>
      <caption class="sr-only">{{ legende }}</caption>
      <thead>
        <tr>
          <th scope="col">{{ t('fichesPretes.colonnes.titre') }}</th>
          <th scope="col" class="c-dom">{{ t('fichesPretes.colonnes.domaine') }}</th>
          <th scope="col">{{ t('fichesPretes.colonnes.classes') }}</th>
          <th scope="col">{{ t('fichesPretes.colonnes.pages') }}</th>
          <th scope="col"><span class="sr-only">{{ t('fichesPretes.colonnes.actions') }}</span></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="e in entrees" :key="e.slug">
          <td class="c-titre"><div class="titre">
            <RouterLink :to="`/telechargements/${e.slug}`" :lang="langueDuTexte(e.titre, langueAffichee)"><strong>{{ texteDe(e.titre, langueAffichee) }}</strong></RouterLink>
            <FichesPretesLangues :langues="e.langues" regionales /> <PastilleConfiance :niveau="e.confiance ?? null" />
            <span v-if="e.exemple" class="badge">{{ t('fichesPretes.badgeExemple') }}</span>
          </div></td>
          <td class="c-dom">{{ nomDomaine(e) }}</td>
          <td><PastillesClasses :classes="e.niveaux" :choisies="selection" /></td>
          <td class="c-pages">{{ t('fichesPretes.pages', { n: e.nbPages }) }}</td>
          <td class="c-act"><RouterLink class="btn btn-ghost btn-sm" :to="`/telechargements/${e.slug}`" :aria-label="t('fichesPretes.ouvrirTitre', { titre: texteDe(e.titre, langueAffichee) })">{{ t('fichesPretes.ouvrir') }}</RouterLink></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { useLangue } from '../langues/useLangue.ts'
import { langueDuTexte, texteDe } from '../telechargements/recherche.ts'
import type { Classe, EntreeIndex, IndexFiches } from '../telechargements/types.ts'
import PastillesClasses from '../ressources/composants/PastillesClasses.vue'
import FichesPretesLangues from './FichesPretesLangues.vue'
import PastilleConfiance from '../ressources/composants/PastilleConfiance.vue'

const props = withDefaults(defineProps<{
  entrees: readonly EntreeIndex[]
  index: IndexFiches
  legende: string
  selection?: readonly Classe[]
}>(), { selection: () => [] })
const { t, langueAffichee } = useLangue()
const nomDomaine = (e: EntreeIndex): string => {
  const d = props.index.filtres.domaines.find(x => x.id === e.domaine)
  return d ? texteDe(d.nom, langueAffichee.value) : ''
}
</script>

<style scoped>
.tblwrap { background: white; border-radius: var(--radius); box-shadow: var(--shadow); overflow-x: auto; margin-top: .8rem; }
table { width: 100%; border-collapse: collapse; }
th, td { text-align: left; padding: .6rem .8rem; border-bottom: 1px solid var(--gris-bg); vertical-align: middle; }
th { font-size: .8rem; text-transform: uppercase; letter-spacing: .04em; color: var(--texte-doux); }
.titre { display: flex; gap: .5rem; align-items: center; flex-wrap: wrap; }
.c-titre a { color: var(--bleu-fort); }
.badge { font-size: .75rem; background: var(--jaune); border-radius: 20px; padding: .1rem .5rem; }
.btn-sm { padding: .35rem .9rem; font-size: .88rem; min-height: 44px; display: inline-flex; align-items: center; text-decoration: none; }
.c-pages { white-space: nowrap; color: var(--texte-doux); }
@media (max-width: 700px) {
  thead { display: none; }
  table, tbody { display: block; }
  tr { display: grid; grid-template-columns: 1fr auto; gap: .2rem .5rem; padding: .6rem .8rem; border-bottom: 1px solid var(--gris-bg); }
  td { border: 0; padding: 0; }
  .c-dom { display: none; }
  .c-titre { grid-column: 1 / -1; }
  .c-pages { align-self: center; justify-self: end; grid-row: 2; grid-column: 2; }
  .c-act { grid-column: 1 / -1; }
}
</style>
