<template>
  <div class="container">
    <template v-if="regionale">
      <h1 class="section-heading"><Drapeau :langue="regionale.id" class="drapeau" /> {{ majuscule(regionale.nomLocal) }}</h1>
      <p class="intro">{{ t('intro', { nom: regionale.nom, ecoles: regionale.fiches.ecoles }) }}</p>
      <!-- une section par famille de fiches du catalogue (src/impression/catalogue.js) dans cette langue -->
      <section v-for="g in groupes" :key="g.id" class="groupe">
        <h2>{{ t('groupe_' + g.id) }}</h2>
        <div class="card-grid">
          <RouterLink v-for="f in g.fiches" :key="f.slug" :to="f.lien" class="card">
            <span class="card-icon">{{ g.icon }}</span>
            <span class="card-title">{{ f.court }}</span>
            <span class="card-tag">{{ f.niveaux }}</span>
          </RouterLink>
        </div>
      </section>
      <!-- une fiche par lettre : trop nombreuses pour des cartes -->
      <section v-if="lettres.length" class="groupe">
        <h2>{{ t('groupe_lettres') }}</h2>
        <p class="lettres">
          <RouterLink v-for="f in lettres" :key="f.slug" :to="f.lien" class="lettre">{{ f.lettre }}</RouterLink>
        </p>
      </section>
      <p class="pdf"><a :href="telechargements">{{ t('pdf') }}</a></p>
    </template>
    <template v-else>
      <h1 class="section-heading">{{ t('titreAucune') }}</h1>
      <p class="intro">{{ t('aucune') }} <RouterLink to="/parametres">{{ t('parametres') }}</RouterLink></p>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { TELECHARGEMENTS } from '../impression/catalogue.js'
import { useLangueRegionale } from '../composables/useLangueRegionale'
import { useI18n } from '../i18n'
import Drapeau from '../components/Drapeau.vue'
import messagesFr from '../i18n/fr/views/LangueRegionaleView.js'
import messagesBr from '../i18n/br/views/LangueRegionaleView.js'

const { t } = useI18n({ fr: messagesFr, br: messagesBr })
const { langue: regionale } = useLangueRegionale()
const majuscule = s => s.charAt(0).toUpperCase() + s.slice(1)
const telechargements = `${import.meta.env.BASE_URL}telechargements/`

// fiches de cette langue ; les variantes A3/A4 d'une même affiche n'en font qu'une (le format se règle dans le générateur)
const fiches = computed(() => TELECHARGEMENTS.filter(f => regionale.value && f.langues.includes(regionale.value.id)))
const motLettre = computed(() => regionale.value?.fiches.motLettre)
const estLettre = f => f.slug.startsWith(`fiche-ecriture-${motLettre.value}-`)
const GROUPES = [
  { id: 'affiches', icon: '🖼️', garde: f => f.genre === 'affiche' && !/-a3$/.test(f.slug) && !f.langues.includes('fr') },
  // bilingues : le tableau de 0 à 100 et les grandes affiches, pas les tranches de dix (10-20, 20-30…)
  { id: 'bilingues', icon: '🔢', garde: f => f.genre === 'affiche' && f.langues.includes('fr') && (!/-\d+-\d+$/.test(f.slug) || f.slug.endsWith('-0-100')) },
  { id: 'ecriture', icon: '✏️', garde: f => f.genre !== 'affiche' && !estLettre(f) },
]
const groupes = computed(() => GROUPES.map(g => ({ ...g, fiches: fiches.value.filter(g.garde).map(f => ({ ...f, court: f.court.replace(/ A4$/, '') })) }))
  .filter(g => g.fiches.length))
const lettres = computed(() => fiches.value.filter(estLettre).map(f => ({ ...f, lettre: f.court.split(' ').slice(1).join(' ') })))
</script>

<style scoped>
.drapeau { margin-right: .3rem; }
.intro { color: #555; max-width: 640px; margin: -.5rem 0 1.5rem; }
.groupe { margin-bottom: 2rem; }
.groupe h2 { font-size: 1.15rem; margin-bottom: .75rem; }
.lettres { display: flex; flex-wrap: wrap; gap: .4rem; }
.lettre {
  min-width: 2.6rem; padding: .35rem .6rem; text-align: center; border-radius: 10px; background: white;
  box-shadow: var(--shadow); font-weight: 800; font-size: 1.1rem; color: var(--bleu); text-decoration: none;
}
.lettre:hover { background: var(--bleu); color: white; }
.pdf a { color: var(--orange); font-weight: 700; text-decoration: none; }
</style>
