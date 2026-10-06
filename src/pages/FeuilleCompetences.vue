<template>
  <!-- Les compétences du programme que la fiche travaille : chacune mène à sa page (/competence/<id>) ; le libellé est le texte officiel
       (en français), avec le lien vers le programme officiel à la bonne page du PDF. -->
  <section v-if="feuille.entree?.competences.length" class="boite" :aria-labelledby="idTitre">
    <h2 :id="idTitre">{{ t('feuille.competence', { n: feuille.entree.competences.length }) }}</h2>
    <ul>
      <li v-for="k in feuille.entree.competences" :key="k.id">
        <RouterLink :to="`/competence/${k.id}`" lang="fr"><strong>{{ k.libelle }}</strong></RouterLink>
        <span v-if="feuille.domaine" class="domaine"> · {{ feuille.domaine.id ? EMOJI_DOMAINE[feuille.domaine.id] : '' }} {{ texteDe(feuille.domaine.nom, langueAffichee) }} · {{ k.niveaux.map(c => c.toUpperCase()).join(', ') }}</span>
        <template v-if="k.source"> · <a :href="k.source.url" target="_blank" rel="noopener" :aria-label="`${t('feuille.programmePage', { page: k.source.page })} ${t('feuille.nouvelOnglet')}`">{{ t('feuille.programmeOfficiel') }} ↗</a></template>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { useId } from 'vue'
import { useLangue } from '../langues/useLangue.ts'
import { EMOJI_DOMAINE } from '../ressources/emojis.ts'
import { texteDe } from '../telechargements/recherche.ts'
import type { Feuille } from '../telechargements/useFeuille.ts'

defineProps<{ feuille: Feuille }>()
const { t, langueAffichee } = useLangue()
const idTitre = useId()
</script>

<style scoped>
.boite { background: white; border-radius: var(--radius); box-shadow: var(--shadow); padding: 1rem 1.1rem; border-left: 5px solid var(--violet); }
h2 { font-size: 1.05rem; margin-bottom: .4rem; }
ul { list-style: none; display: flex; flex-direction: column; gap: .6rem; }
.domaine { color: var(--texte-doux); font-size: .9rem; }
a { color: var(--bleu-fort); }
</style>
