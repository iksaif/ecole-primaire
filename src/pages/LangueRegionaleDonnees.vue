<template>
  <section class="groupe">
    <h2>{{ donnees.titreAlphabet }}</h2>
    <p class="aide">{{ t('regionale.alphabetAide', { n: donnees.alphabet.length, plus: donnees.lettresEnPlus.join(', ') }) }}</p>
    <p class="lettres" :lang="bcp47">
      <span v-for="l in donnees.alphabet" :key="l" class="lettre">{{ l.charAt(0).toUpperCase() + l.slice(1) }} {{ l }}</span>
    </p>
  </section>

  <section class="groupe">
    <h2>{{ t('regionale.motsIllustres') }}</h2>
    <ul class="mots" :lang="bcp47">
      <li v-for="l in donnees.alphabet" :key="l" class="mot">
        <span class="emoji" aria-hidden="true">{{ donnees.mots[l]?.[1] }}</span>
        <span><strong>{{ l }}</strong> {{ donnees.mots[l]?.[0] }}</span>
      </li>
    </ul>
  </section>

  <section class="groupe">
    <h2>{{ t('regionale.nombres') }}</h2>
    <p class="aide">{{ t('regionale.nombresAide') }}</p>
    <ul class="nombres" :lang="bcp47">
      <li v-for="n in NOMBRES" :key="n"><span class="chiffre">{{ n }}</span> {{ donnees.enLettres(n) }}</li>
    </ul>
  </section>

  <section v-for="liste in listes" :key="liste.id" class="groupe">
    <h2>{{ liste.libelle[langueAffichee] ?? liste.titre }}</h2>
    <ul class="lettres" :lang="bcp47"><li v-for="m in liste.mots" :key="m" class="mot-liste">{{ m }}</li></ul>
  </section>
</template>

<script setup lang="ts">
// Apprendre une langue régionale : alphabet, un mot par lettre, nombres en lettres, jours et mois. Toutes les données viennent du
// registre de langues (src/langues/<code>/donnees.ts, vérifiées par le projet) : rien n'est écrit ici.
import { computed } from 'vue'
import { LANGUES } from '../langues/registre.ts'
import type { DonneesRegionales } from '../langues/types.ts'
import { useLangue } from '../langues/useLangue.ts'
import type { Langue } from '../langues/registre.ts'

const props = defineProps<{ code: Langue, donnees: DonneesRegionales }>()
const { t, langueAffichee } = useLangue()
const bcp47 = computed(() => LANGUES[props.code].bcp47)
// quelques nombres représentatifs : de 1 à 10, les dizaines, 100 et 1000
const NOMBRES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 1000]
// jours et mois (les nombres sont déjà montrés au-dessus)
const listes = computed(() => props.donnees.listes.filter(l => !l.id.startsWith('nombres') && l.id !== 'dizaines'))
</script>

<style scoped>
.groupe { margin-bottom: 2rem; }
.groupe h2 { font-size: 1.15rem; margin-bottom: .5rem; }
.aide { color: var(--texte-doux); font-size: .9rem; margin-bottom: .75rem; }
.lettres { list-style: none; display: flex; flex-wrap: wrap; gap: .4rem; }
.lettre, .mot-liste { min-width: 2.6rem; padding: .35rem .7rem; text-align: center; border-radius: 10px; background: white; box-shadow: var(--shadow); font-weight: 800; font-size: 1.1rem; color: var(--bleu-fort); }
.mot-liste { font-weight: 700; color: var(--texte); }
.mots { list-style: none; display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: .5rem; }
.mot { display: flex; align-items: center; gap: .5rem; background: white; border-radius: 10px; box-shadow: var(--shadow); padding: .4rem .7rem; }
.emoji { font-size: 1.6rem; }
.nombres { list-style: none; display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: .4rem .8rem; }
.chiffre { display: inline-block; min-width: 3.2rem; font-weight: 800; color: var(--bleu-fort); }
</style>
