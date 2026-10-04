<template>
  <div class="container">
    <h1 class="section-heading">{{ t('titre') }}</h1>
    <p class="intro">{{ t('intro') }} {{ t('introDomaines', { bouton: t('imprimerFiche') }) }}</p>

    <a :href="telechargements" class="bandeau-pdf">
      📥 <span><strong>{{ t('pdfTitre') }}</strong> — {{ t('pdfTexte') }}</span>
    </a>

    <!-- une section par domaine du programme (maths, puis français, puis le reste) -->
    <section v-for="s in sections" :key="s.id" class="domaine" :data-domaine="s.id">
      <h2 class="section-heading rubrique">
        <span :title="s.officiel">{{ s.nom }}</span>
        <a v-if="s.lien" :href="s.lien" class="programme" target="_blank" rel="noopener" :title="s.officiel">{{ t('programmeOfficiel') }} ↗</a>
      </h2>
      <template v-if="s.apprendre.length">
        <h3 class="usage">{{ t('apprendre') }}</h3>
        <div class="card-grid apprendre">
          <RouterLink v-for="a in s.apprendre" :key="a.to" :to="a.to" class="card" :class="a.matiere">
            <span class="card-icon">{{ a.icon }}</span>
            <span class="card-title">{{ titre(a) }}</span>
            <span class="card-desc">{{ description(a) }}</span>
            <span class="card-tag">{{ etiquetteNiveaux(a.niveaux) }}</span>
          </RouterLink>
        </div>
      </template>
      <template v-if="s.entrainer.length">
        <h3 class="usage">{{ t('entrainer') }}</h3>
        <div class="card-grid entrainer">
          <RouterLink v-for="a in s.entrainer" :key="a.to" :to="a.lien" class="card" :class="a.matiere">
            <span class="card-icon">{{ a.icon }}</span>
            <span class="card-title">{{ titre(a) }}</span>
            <span class="card-desc">{{ a.exercice ? t('ficheExercice') : description(a) }}</span>
            <span class="card-tag">{{ etiquetteNiveaux(a.niveaux) }}</span>
          </RouterLink>
        </div>
      </template>
    </section>
    <p v-if="!sections.length" class="vide">{{ t('vide') }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ACTIVITES, etiquetteNiveaux } from '../../data/activites'
import { DOMAINES, nomOfficiel, lienProgramme } from '../../data/programme'
import { useClasse } from '../../composables/useClasse'
import { useLangueRegionale } from '../../composables/useLangueRegionale'
import { useI18n } from '../../i18n'
import messagesFr from '../../i18n/fr/views/imprimer/ImprimerView.js'
import messagesBr from '../../i18n/br/views/imprimer/ImprimerView.js'
import domainesFr from '../../i18n/fr/domaines.js'
import domainesBr from '../../i18n/br/domaines.js'

const { t, langue } = useI18n({ fr: messagesFr, br: messagesBr })
const { t: nomDomaine } = useI18n({ fr: domainesFr, br: domainesBr })

const classe = useClasse()
const { code: regionale } = useLangueRegionale()
// pages statiques générées au build (scripts/telechargements.mjs)
const telechargements = `${import.meta.env.BASE_URL}telechargements/`

const titre = a => (langue.value === 'br' && a.br ? a.br.titre : a.titre)
function description(a) {
  const d = langue.value === 'br' && a.br ? a.br : a
  return (regionale.value && d.descRegionale) || d.desc
}

// maths, puis français, puis le reste ; les activités hors programme (culture générale) à la fin
const MATIERES = ['maths', 'francais', 'autres']
const ORDRE = [...DOMAINES].sort((a, b) => MATIERES.indexOf(a.matiere) - MATIERES.indexOf(b.matiere)).map(d => d.id)
// classe de référence pour le nom officiel et le lien quand aucune classe n'est choisie (cycle 2 d'abord)
const REFERENCE = { 2: 'ce1', 3: 'cm1', 1: 'gs' }

const sections = computed(() => {
  const visible = a => !classe.value || a.niveaux.includes(classe.value)
  // affiches (pour apprendre) ; la carte unique des affiches du programme (`resume`) est remplacée par ses familles
  const apprendre = ACTIVITES.filter(a => a.matiere === 'imprimer' && a.genre === 'affiche' && !a.resume && visible(a))
  // générateurs de fiches, puis exercices de l'app en mode impression (pour s'entraîner)
  const entrainer = [
    ...ACTIVITES.filter(a => a.matiere === 'imprimer' && a.genre === 'fiche' && visible(a)).map(a => ({ ...a, lien: a.to })),
    ...ACTIVITES.filter(a => a.fiche && visible(a)).map(a => ({ ...a, lien: { path: a.to, query: { mode: 'imprimer' } }, exercice: true })),
  ]
  return [...ORDRE, null].map(id => {
    const d = DOMAINES.find(x => x.id === id)
    const ref = d && (classe.value && lienProgramme(id, classe.value) ? classe.value : REFERENCE[[2, 3, 1].find(c => d.cycles.includes(c))])
    return {
      id: id ?? 'hors-programme',
      nom: id ? nomDomaine(id) : t('horsProgramme'),
      officiel: id ? nomOfficiel(id, ref) : '',
      lien: id ? lienProgramme(id, ref) : null,
      apprendre: apprendre.filter(a => (a.domaine ?? null) === id),
      entrainer: entrainer.filter(a => (a.domaine ?? null) === id),
    }
  }).filter(s => s.apprendre.length || s.entrainer.length)
})
</script>

<style scoped>
.intro { color: #666; margin: -.5rem 0 1.25rem; }
.rubrique { margin-top: 2.5rem; display: flex; flex-wrap: wrap; align-items: baseline; gap: .25rem 1rem; }
.programme { font-size: .85rem; font-weight: 400; color: #888; }
.usage { font-size: 1rem; font-weight: 800; color: #777; margin: 1.25rem 0 .75rem; }
.vide { color: #888; font-style: italic; }
.bandeau-pdf {
  display: flex; gap: .75rem; align-items: center; margin-top: 1.5rem; padding: 1rem 1.25rem;
  background: #fff8ef; border: 2px dashed #f5c27a; border-radius: var(--radius); color: var(--texte); text-decoration: none; font-size: 1.05rem;
}
.bandeau-pdf:hover { background: #fff1dc; }
</style>
