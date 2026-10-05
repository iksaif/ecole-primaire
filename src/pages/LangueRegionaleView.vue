<template>
  <div class="container" data-page="langue-regionale">
    <template v-if="def && donnees">
      <h1 class="section-heading"><Drapeau :langue="def.code" class="drapeau" /> {{ majuscule(def.nomLocal) }}</h1>
      <p class="intro">{{ t('langueRegionale.intro', { nom: def.nom[langue], ecoles: donnees.ecoles[langue] ?? donnees.ecoles[def.code] ?? '' }) }}</p>
      <p class="voix" :class="{ non: !def.voix.disponible }">🔊 {{ def.voix.disponible ? t('langueRegionale.voixPresente') : t('langueRegionale.voixAbsente') }}</p>

      <section class="groupe">
        <h2>{{ donnees.titreAlphabet }}</h2>
        <p class="aide">{{ t('langueRegionale.alphabetAide', { n: donnees.alphabet.length, plus: donnees.lettresEnPlus.join(', ') }) }}</p>
        <p class="lettres" :lang="def.bcp47">
          <span v-for="l in donnees.alphabet" :key="l" class="lettre">{{ l.charAt(0).toUpperCase() + l.slice(1) }} {{ l }}</span>
        </p>
      </section>

      <section class="groupe">
        <h2>{{ t('langueRegionale.motsIllustres') }}</h2>
        <div class="mots" :lang="def.bcp47">
          <div v-for="l in donnees.alphabet" :key="l" class="mot">
            <span class="emoji" aria-hidden="true">{{ donnees.mots[l]?.[1] }}</span>
            <span><strong>{{ l }}</strong> {{ donnees.mots[l]?.[0] }}</span>
          </div>
        </div>
      </section>

      <section class="groupe">
        <h2>{{ t('langueRegionale.nombres') }}</h2>
        <p class="aide">{{ t('langueRegionale.nombresAide') }}</p>
        <ul class="nombres" :lang="def.bcp47">
          <li v-for="n in NOMBRES" :key="n"><span class="chiffre">{{ n }}</span> {{ donnees.enLettres(n) }}</li>
        </ul>
      </section>

      <section v-for="liste in listesTexte" :key="liste.id" class="groupe">
        <h2>{{ liste.libelle[langue] ?? liste.titre }}</h2>
        <p class="lettres" :lang="def.bcp47"><span v-for="m in liste.mots" :key="m" class="mot-liste">{{ m }}</span></p>
      </section>
    </template>
    <template v-else>
      <h1 class="section-heading">{{ t('langueRegionale.titreAucune') }}</h1>
      <p class="intro">{{ t('langueRegionale.aucune') }} <RouterLink to="/parametres">{{ t('langueRegionale.activer') }}</RouterLink></p>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useLangue } from '../langues/useLangue.ts'
import { useLangueRegionale } from '../langues/useLangueRegionale.ts'
import Drapeau from '../shell/Drapeau.vue'

const { t, langue } = useLangue()
const { def, donnees } = useLangueRegionale()
const majuscule = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1)

// quelques nombres représentatifs : de 1 à 10, les dizaines, 100 et 1000
const NOMBRES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 1000]
// jours et mois (les listes de nombres sont déjà montrées au-dessus)
const listesTexte = computed(() => (donnees.value?.listes ?? []).filter(l => !l.id.startsWith('nombres') && l.id !== 'dizaines'))
</script>

<style scoped>
.drapeau { margin-right: .3rem; }
.intro { color: #555; max-width: 640px; margin: -.5rem 0 1rem; }
.voix { font-size: .9rem; color: #2a7a2a; margin-bottom: 1.5rem; }
.voix.non { color: #8a5a00; }
.groupe { margin-bottom: 2rem; }
.groupe h2 { font-size: 1.15rem; margin-bottom: .5rem; }
.aide { color: #666; font-size: .9rem; margin-bottom: .75rem; }
.lettres { display: flex; flex-wrap: wrap; gap: .4rem; }
.lettre, .mot-liste {
  min-width: 2.6rem; padding: .35rem .7rem; text-align: center; border-radius: 10px; background: white;
  box-shadow: var(--shadow); font-weight: 800; font-size: 1.1rem; color: var(--bleu);
}
.mot-liste { font-weight: 700; color: var(--texte); }
.mots { display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: .5rem; }
.mot { display: flex; align-items: center; gap: .5rem; background: white; border-radius: 10px; box-shadow: var(--shadow); padding: .4rem .7rem; }
.emoji { font-size: 1.6rem; }
.nombres { list-style: none; display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: .4rem .8rem; }
.chiffre { display: inline-block; min-width: 3.2rem; font-weight: 800; color: var(--bleu); }
</style>
