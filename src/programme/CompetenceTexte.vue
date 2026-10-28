<template>
  <section aria-labelledby="h-meme-texte" class="bloc">
    <h2 id="h-meme-texte">{{ t('competence.memeTexte.titre') }}</h2>
    <p class="aide">{{ t('competence.memeTexte.aide', { texte: nomDuTexte }) }}</p>
    <div v-if="place.surLaPage.length" class="page">
      <h3>{{ t('competence.memeTexte.page', { page: place.page }) }}</h3>
      <ul class="liste">
        <li v-for="k in place.surLaPage" :key="k.id"><RouterLink :to="vers(k.id)" :lang="LANGUE_SOURCE">{{ k.libelle }}</RouterLink></li>
      </ul>
    </div>
    <div class="pas">
      <RouterLink v-if="place.precedente" class="pas-lien" :to="vers(place.precedente.id)">
        <span class="sens"><span aria-hidden="true">←</span> {{ t('competence.memeTexte.precedente') }} · {{ t('programme.reference.page', { page: place.precedente.source.page }) }}</span>
        <span class="nom" :lang="LANGUE_SOURCE">{{ place.precedente.libelle }}</span>
      </RouterLink>
      <RouterLink v-if="place.suivante" class="pas-lien suivante" :to="vers(place.suivante.id)">
        <span class="sens">{{ t('competence.memeTexte.suivante') }} · {{ t('programme.reference.page', { page: place.suivante.source.page }) }} <span aria-hidden="true">→</span></span>
        <span class="nom" :lang="LANGUE_SOURCE">{{ place.suivante.libelle }}</span>
      </RouterLink>
    </div>
    <p class="toutes"><RouterLink :to="versLeTexte">{{ t('competence.memeTexte.parcourir') }}</RouterLink></p>
  </section>
</template>

<script setup lang="ts">
// Ce qui précède et suit la compétence dans son texte officiel (ordre des pages du PDF), et ce qui est sur la même page.
import { computed } from 'vue'
import { LANGUE_SOURCE } from '../langues/registre.ts'
import { useLangue } from '../langues/useLangue.ts'
import type { DansLeTexte } from './navigation.ts'
import { nomDeSource } from './references.ts'

const props = defineProps<{ place: DansLeTexte, vers: (id: string) => string, versLeTexte: string }>()
const { t, langueAffichee } = useLangue()
const nomDuTexte = computed(() => nomDeSource(langueAffichee.value, props.place.source))
</script>

<style scoped>
.bloc { margin-top: 1.5rem; }
h2 { font-size: 1.15rem; margin-bottom: .3rem; }
h3 { font-size: 1rem; margin: .6rem 0 .3rem; }
.aide { color: var(--texte-doux); margin-bottom: .4rem; }
.liste { list-style: none; display: grid; gap: .3rem; }
.liste a { font-weight: 700; }
.pas { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: .6rem; margin-top: .6rem; }
.pas-lien { display: grid; gap: .15rem; min-height: 44px; padding: .55rem .8rem; background: #fff; border-radius: 10px; box-shadow: var(--shadow); text-decoration: none; }
.pas-lien.suivante { text-align: right; }
.sens { font-size: .8rem; font-weight: 700; color: var(--texte-doux); }
.nom { font-weight: 700; color: var(--bleu-fort); }
.toutes { margin-top: .6rem; font-weight: 700; }
</style>
