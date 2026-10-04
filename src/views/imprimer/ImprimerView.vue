<template>
  <div class="container">
    <h1 class="section-heading">{{ t('titre') }}</h1>
    <p class="intro">{{ t('intro') }} {{ t('introDomaines', { bouton: t('imprimerFiche') }) }}</p>

    <a :href="telechargements" class="bandeau-pdf">
      📥 <span><strong>{{ t('pdfTitre') }}</strong> — {{ t('pdfTexte') }}</span>
    </a>

    <!-- barre collée en haut : tous les domaines d'un coup d'œil (clic → on y descend) et filtres, comme /telechargements/ -->
    <div class="outils">
      <nav class="sommaire" :aria-label="t('sommaire')">
        <span v-for="g in groupes" :key="g.matiere" class="groupe">
          <span class="lib">{{ g.titre }}</span>
          <button v-for="s in g.sections" :key="s.id" type="button" class="puce" :class="{ actif: courant === s.id }" @click="aller(s.id)">
            {{ s.nom }} <small>{{ s.apprendre.length + s.entrainer.length }}</small>
          </button>
        </span>
      </nav>
      <div class="filtres">
        <span class="filtre">
          <button v-for="u in USAGES" :key="u" type="button" :class="{ actif: usage === u }" @click="usage = u">{{ t(u || 'tout') }}</button>
        </span>
        <span class="filtre">
          <span class="lib">{{ t('classe') }}</span>
          <button type="button" :class="{ actif: !classe }" @click="classe = ''">{{ t('toutes') }}</button>
          <button v-for="c in CLASSES" :key="c.id" type="button" :class="{ actif: classe === c.id }" @click="classe = c.id">{{ c.label }}</button>
        </span>
      </div>
    </div>

    <!-- une section par domaine du programme (maths, puis français, puis le reste) -->
    <section v-for="s in sections" :id="`domaine-${s.id}`" :key="s.id" class="domaine" :data-domaine="s.id">
      <h2 class="section-heading rubrique">
        <span :title="s.officiel">{{ s.nom }}</span>
        <a v-if="s.lien" :href="s.lien" class="programme" target="_blank" rel="noopener" :title="s.officiel">{{ t('programmeOfficiel') }} ↗</a>
        <RouterLink v-if="s.lien" :to="{ path: '/programme', query: { domaine: s.id } }" class="competences">{{ t('competences') }}</RouterLink>
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
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { ACTIVITES, CLASSES, MATIERES as TITRES_MATIERES, etiquetteNiveaux } from '../../data/activites'
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

// filtre « pour apprendre » (affiches) / « pour s'entraîner » (fiches) ; '' : tout
const USAGES = ['', 'apprendre', 'entrainer']
const usage = ref('')

const sections = computed(() => {
  const visible = a => !classe.value || a.niveaux.includes(classe.value)
  // affiches (pour apprendre), dont une carte par famille d'affiches du programme
  const apprendre = ACTIVITES.filter(a => a.matiere === 'imprimer' && a.genre === 'affiche' && visible(a))
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
      matiere: d?.matiere ?? 'autres',
      apprendre: usage.value === 'entrainer' ? [] : apprendre.filter(a => (a.domaine ?? null) === id),
      entrainer: usage.value === 'apprendre' ? [] : entrainer.filter(a => (a.domaine ?? null) === id),
    }
  }).filter(s => s.apprendre.length || s.entrainer.length)
})

// sommaire : les domaines regroupés par matière (Mathématiques, Français, Culture générale)
const groupes = computed(() => MATIERES.map(m => {
  const def = TITRES_MATIERES.find(x => x.id === m)
  const nom = (langue.value === 'br' ? def.br : def.titre)
  return { matiere: m, titre: m === 'autres' ? '' : nom, sections: sections.value.filter(s => s.matiere === m) }
}).filter(g => g.sections.length))

// domaine à l'écran (mis en avant dans le sommaire) et défilement vers un domaine
const courant = ref(null)
function aller(id) {
  const el = document.getElementById(`domaine-${id}`)
  if (!el) return
  // juste sous la barre collée (sa hauteur dépend de la largeur de l'écran)
  const outils = document.querySelector('.outils')
  const barre = outils && getComputedStyle(outils).position === 'sticky' ? outils.offsetHeight : 0
  window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - barre - 8, behavior: 'smooth' })
}
function suivre() {
  const barre = document.querySelector('.outils')?.getBoundingClientRect().bottom ?? 0
  const vus = sections.value.filter(s => (document.getElementById(`domaine-${s.id}`)?.getBoundingClientRect().top ?? Infinity) <= barre + 40)
  courant.value = window.scrollY > 0 ? vus.at(-1)?.id ?? null : null
}
onMounted(() => window.addEventListener('scroll', suivre, { passive: true }))
onUnmounted(() => window.removeEventListener('scroll', suivre))
</script>

<style scoped>
.intro { color: #666; margin: -.5rem 0 1.25rem; }
.outils {
  position: sticky; top: 0; z-index: 5; background: var(--gris-bg); margin: 1.25rem -1rem 0; padding: .6rem 1rem;
  border-bottom: 1px solid var(--gris-brd); display: flex; flex-direction: column; gap: .5rem;
}
.sommaire { display: flex; flex-wrap: wrap; gap: .4rem 1.25rem; }
.groupe, .filtre { display: flex; flex-wrap: wrap; align-items: center; gap: .3rem; }
.filtres { display: flex; flex-wrap: wrap; gap: .4rem 1.25rem; }
.lib { font-size: .75rem; font-weight: 800; color: #888; text-transform: uppercase; margin-right: .15rem; }
.puce, .filtre button {
  border: 2px solid var(--gris-brd); background: white; border-radius: 20px; padding: .2rem .75rem;
  font: inherit; font-size: .88rem; font-weight: 700; cursor: pointer; color: var(--texte);
}
.puce small { color: #999; font-weight: 600; margin-left: .15rem; }
.puce:hover, .filtre button:hover { border-color: var(--bleu); }
.puce.actif { border-color: var(--orange); background: #fff8ef; }
.filtre button.actif { background: var(--bleu); border-color: var(--bleu); color: white; }
/* téléphone : la barre prendrait la moitié de l'écran, elle reste en haut de la page sans suivre */
@media (max-width: 720px) {
  .outils { position: static; margin: 1rem 0 0; padding: .5rem 0; }
}

.rubrique { margin-top: 1.5rem; display: flex; flex-wrap: wrap; align-items: baseline; gap: .25rem 1rem; }
.programme, .competences { font-size: .85rem; font-weight: 400; color: #888; }
.usage { font-size: 1rem; font-weight: 800; color: #777; margin: 1.25rem 0 .75rem; }
.vide { color: #888; font-style: italic; }
.bandeau-pdf {
  display: flex; gap: .75rem; align-items: center; margin-top: 1.5rem; padding: 1rem 1.25rem;
  background: #fff8ef; border: 2px dashed #f5c27a; border-radius: var(--radius); color: var(--texte); text-decoration: none; font-size: 1.05rem;
}
.bandeau-pdf:hover { background: #fff1dc; }
</style>
