<template>
  <template v-for="g in groupes" :key="g.titre">
    <h3 v-if="g.titre" class="domaine">{{ g.titre }}</h3>
    <p v-if="g.affiches.length" class="affiches-domaine">{{ t('affiches') }}
      <template v-for="(a, i) in g.affiches" :key="a.to">{{ i ? ' · ' : '' }}<RouterLink :to="a.to">{{ langue === 'br' && a.br ? a.br.titre : a.titre }}</RouterLink></template>
    </p>
    <div class="card-grid">
      <RouterLink v-for="a in g.activites" :key="a.to" :to="a.to" class="card" :class="a.matiere">
        <span class="card-icon">{{ a.icon }}</span>
        <span class="card-title">{{ langue === 'br' && a.br ? a.br.titre : a.titre }}</span>
        <span class="card-desc">{{ description(a) }}</span>
        <span class="card-tag">{{ etiquetteNiveaux(a.niveaux) }}</span>
        <component :is="PastilleMigration" v-if="PastilleMigration && a.fiche" :route="a.to" />
      </RouterLink>
    </div>
  </template>
  <p v-if="!groupes.length" class="vide">{{ t('vide') }}</p>
</template>

<script setup>
import { computed, defineAsyncComponent } from 'vue'
import { ACTIVITES, DOMAINES_BR, etiquetteNiveaux } from '../data/activites'
import { useI18n } from '../i18n'
import messagesFr from '../i18n/fr/components/GrilleActivites.js'
import messagesBr from '../i18n/br/components/GrilleActivites.js'
import { useLangueRegionale } from '../composables/useLangueRegionale'
import { useClasse } from '../composables/useClasse'

const props = defineProps({
  matiere: { type: String, required: true },
  parDomaine: { type: Boolean, default: false },
  genre: { type: String, default: '' },   // 'affiche' ou 'fiche' (page « À imprimer »)
})
const classe = useClasse()
// mode dev seulement (absent du build) : pastille « migré / à migrer » vers src/exercices/ (plan 10)
const PastilleMigration = import.meta.env.DEV ? defineAsyncComponent(() => import('./PastilleMigration.vue')) : null
const { code: regionale } = useLangueRegionale()
// description dans la langue de l'interface, variante « langue régionale » si elle est active
function description(a) {
  const d = langue.value === 'br' && a.br ? a.br : a
  return (regionale.value && d.descRegionale) || d.desc
}
const { t, langue } = useI18n({ fr: messagesFr, br: messagesBr })

const visible = a => !classe.value || a.niveaux.includes(classe.value)
const groupes = computed(() => {
  // les cartes `detail` (une par famille d'affiches) ne sont que sur la page « À imprimer », rangées par domaine
  const liste = ACTIVITES.filter(a => a.matiere === props.matiere && !a.detail && (!props.genre || a.genre === props.genre) && visible(a))
  if (!liste.length) return []
  if (!props.parDomaine) return [{ titre: '', activites: liste, affiches: [] }]
  const parRubrique = new Map()
  for (const a of liste) {
    const r = a.rubrique ?? ''
    if (!parRubrique.has(r)) parRubrique.set(r, [])
    parRubrique.get(r).push(a)
  }
  // lien discret vers les affiches du domaine du programme (une seule fois par domaine, sous sa première rubrique)
  const dejaVus = new Set()
  return [...parRubrique].map(([titre, activites]) => {
    const domaines = new Set(activites.map(a => a.domaine).filter(d => d && !dejaVus.has(d)))
    domaines.forEach(d => dejaVus.add(d))
    const affiches = ACTIVITES.filter(a => a.matiere === 'imprimer' && a.genre === 'affiche' && domaines.has(a.domaine) && visible(a))
    return { titre: langue.value === 'br' ? DOMAINES_BR[titre] ?? titre : titre, activites, affiches }
  })
})
</script>

<style scoped>
.card { position: relative; }
.domaine { font-size: 1rem; font-weight: 800; color: #777; margin: 1.5rem 0 .75rem; text-transform: uppercase; letter-spacing: .04em; }
.domaine:first-child { margin-top: 0; }
.affiches-domaine { font-size: .85rem; color: #888; margin: -.4rem 0 .75rem; }
.affiches-domaine a { color: #888; }
.vide { color: #888; font-style: italic; }
</style>
