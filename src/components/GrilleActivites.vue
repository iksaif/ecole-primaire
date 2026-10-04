<template>
  <template v-for="g in groupes" :key="g.titre">
    <h3 v-if="g.titre" class="domaine">{{ g.titre }}</h3>
    <div class="card-grid">
      <RouterLink v-for="a in g.activites" :key="a.to" :to="a.to" class="card" :class="a.matiere">
        <span class="card-icon">{{ a.icon }}</span>
        <span class="card-title">{{ langue === 'br' && a.br ? a.br.titre : a.titre }}</span>
        <span class="card-desc">{{ description(a) }}</span>
        <span class="card-tag">{{ etiquetteNiveaux(a.niveaux) }}</span>
      </RouterLink>
    </div>
  </template>
  <p v-if="!groupes.length" class="vide">{{ t('vide') }}</p>
</template>

<script setup>
import { computed } from 'vue'
import { ACTIVITES, DOMAINES_BR, etiquetteNiveaux } from '../data/activites'
import { useI18n } from '../i18n'
import messagesFr from '../i18n/fr/components/GrilleActivites.js'
import messagesBr from '../i18n/br/components/GrilleActivites.js'
import { useLangueRegionale } from '../composables/useLangueRegionale'
import { useClasse } from '../composables/useClasse'

const props = defineProps({
  matiere: { type: String, required: true },
  parDomaine: { type: Boolean, default: false },
})
const classe = useClasse()
const { code: regionale } = useLangueRegionale()
// description dans la langue de l'interface, variante « langue régionale » si elle est active
function description(a) {
  const d = langue.value === 'br' && a.br ? a.br : a
  return (regionale.value && d.descRegionale) || d.desc
}
const { t, langue } = useI18n({ fr: messagesFr, br: messagesBr })

const groupes = computed(() => {
  const liste = ACTIVITES.filter(a => a.matiere === props.matiere && (!classe.value || a.niveaux.includes(classe.value)))
  if (!liste.length) return []
  if (!props.parDomaine) return [{ titre: '', activites: liste }]
  const parDomaine = new Map()
  for (const a of liste) {
    const d = a.domaine ?? ''
    if (!parDomaine.has(d)) parDomaine.set(d, [])
    parDomaine.get(d).push(a)
  }
  return [...parDomaine].map(([titre, activites]) => ({ titre: langue.value === 'br' ? DOMAINES_BR[titre] ?? titre : titre, activites }))
})
</script>

<style scoped>
.domaine { font-size: 1rem; font-weight: 800; color: #777; margin: 1.5rem 0 .75rem; text-transform: uppercase; letter-spacing: .04em; }
.domaine:first-child { margin-top: 0; }
.vide { color: #888; font-style: italic; }
</style>
