<template>
  <div class="container large">
    <h1 class="section-heading">{{ t('dev.couvertureTitre') }}</h1>
    <p class="intro">{{ t('dev.couvertureIntro') }}</p>

    <!-- totaux : les cases couvertes, et les trous -->
    <div class="totaux">
      <div class="total"><strong>{{ pct(totaux.base, totaux.cases) }}</strong><span>{{ t('dev.couvertureBase', { n: totaux.base, total: totaux.cases }) }}</span></div>
      <div class="total trou"><strong>{{ totaux.cases - totaux.base }}</strong><span>{{ t('dev.couvertureTrous') }}</span></div>
    </div>
    <p v-if="fiches.etat !== 'pret'" class="note">{{ t('dev.couvertureSansFiches') }}</p>

    <div class="filtres" role="group" :aria-label="t('dev.couvertureFiltres')">
      <button v-for="m in ['', ...MATIERES_VUES]" :key="m" type="button" class="level-btn" :class="{ active: matiere === m }" :aria-pressed="matiere === m" @click="matiere = m">
        {{ m ? t(NOM_COURT[m]) : t('dev.couvertureToutes') }}
      </button>
      <span class="sep"></span>
      <button v-for="s in SORTES" :key="s" type="button" class="level-btn" :class="{ active: sorte === s }" :aria-pressed="sorte === s" @click="sorte = s">{{ t(`dev.couvertureSorte.${s}`) }}</button>
      <span class="sep"></span>
      <label class="case"><input v-model="trousSeuls" type="checkbox"> {{ t('dev.couvertureTrousSeuls') }}</label>
    </div>

    <div class="legende">
      <span><i class="pastille couvert"></i>{{ t('dev.couvertureLegende.couvert') }}</span>
      <span><i class="pastille trou"></i>{{ t('dev.couvertureLegende.trou') }}</span>
      <span><i class="pastille hors"></i>{{ t('dev.couvertureLegende.hors') }}</span>
      <span>🎯 {{ t('dev.couvertureSorte.exercice') }} · 🖼️ {{ t('dev.couvertureSorte.affiche') }} · 📄 {{ t('dev.couvertureSorte.fiche') }}</span>
    </div>

    <section v-for="m in matieresAffichees" :key="m.id" class="matiere">
      <h2>{{ t(NOM_COURT[m.id]) }} <small>{{ pct(m.base, m.cases) }}</small></h2>
      <table class="grille">
        <thead>
          <tr><th scope="col">{{ t('dev.couvertureCompetence') }}</th><th v-for="c in NIVEAUX" :key="c" scope="col">{{ c.toUpperCase() }}<small>{{ pct(m.parClasse[c].base, m.parClasse[c].cases) }}</small></th></tr>
        </thead>
        <tbody v-for="d in m.domaines" :key="d.id">
          <tr class="domaine"><th :colspan="NIVEAUX.length + 1" scope="rowgroup">{{ t(`domaines.${d.id}` as 'domaines.lecture') }} <small>{{ pct(d.base, d.cases) }}</small></th></tr>
          <tr v-for="k in d.competences" :key="k.id">
            <th scope="row" class="libelle"><router-link :to="`/competence/${k.id}`">{{ k.libelle }}</router-link><code>{{ k.id }}</code></th>
            <td v-for="c in NIVEAUX" :key="c" :class="k.cases[c].etat" :title="k.cases[c].titre">
              <template v-if="k.cases[c].etat === 'couvert'">
                <span v-if="k.cases[c].n.exercice">🎯{{ k.cases[c].n.exercice }}</span>
                <span v-if="k.cases[c].n.affiche">🖼️{{ k.cases[c].n.affiche }}</span>
                <span v-if="k.cases[c].n.fiche">📄{{ k.cases[c].n.fiche }}</span>
              </template>
              <template v-else-if="k.cases[c].etat === 'trou'">—</template>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<script setup lang="ts">
// Couverture du programme (développement seulement, /dev/couverture) : chaque compétence de src/data/programme.ts × chaque classe où elle
// est au programme, et ce qui la couvre dans le catalogue de la base (src/ressources/ : exercices, affiches, et fiches prêtes si leur
// index est là, `npm run fiches:dev`). Remplace, pour la base, le rapport `npm run couverture` (qui lit l'ancien monde).
import { computed, ref } from 'vue'
import { useLangue } from '../../langues/useLangue.ts'
import { COMPETENCES, DOMAINES } from '../../data/programme.ts'
import { NIVEAUX } from '../../data/classes.ts'
import type { Classe } from '../../data/classes.ts'
import { useRessources } from '../../ressources/useRessources.ts'
import { texteDe } from '../../ressources/textes.ts'
import type { RessourceDeContenu } from '../../ressources/types.ts'
import { NOM_COURT } from '../../pages/matieres.ts'
import type { MatierePage } from '../../pages/matieres.ts'

type Sorte = 'tout' | 'exercice' | 'affiche' | 'fiche'
type Etat = 'couvert' | 'trou' | 'hors'
interface Case { etat: Etat, n: Record<'exercice' | 'affiche' | 'fiche', number>, titre: string }

const { t, langueAffichee } = useLangue()
const { catalogue, fiches: etatFiches } = useRessources()
const fiches = computed(() => etatFiches.value)
const MATIERES_VUES: readonly MatierePage[] = ['maths', 'francais', 'monde']
const SORTES: readonly Sorte[] = ['tout', 'exercice', 'affiche', 'fiche']
const matiere = ref<MatierePage | ''>('')
const sorte = ref<Sorte>('tout')
const trousSeuls = ref(false)
const pct = (n: number, total: number): string => (total ? `${Math.round((n / total) * 100)} %` : '—')

// ressources du catalogue, par compétence et par classe (une ressource couvre une compétence pour chacune de ses classes)
const parCase = computed(() => {
  const m = new Map<string, RessourceDeContenu[]>()
  for (const r of catalogue.value) {
    if (r.exemple || (sorte.value !== 'tout' && r.type !== sorte.value)) continue
    for (const k of r.competences) for (const c of r.classes) m.set(`${k}:${c}`, [...(m.get(`${k}:${c}`) ?? []), r])
  }
  return m
})

function caseDe(k: { id: string, niveaux: readonly Classe[] }, c: Classe): Case {
  const n = { exercice: 0, affiche: 0, fiche: 0 }
  if (!k.niveaux.includes(c)) return { etat: 'hors', n, titre: '' }
  const rs = parCase.value.get(`${k.id}:${c}`) ?? []
  for (const r of rs) n[r.type]++
  if (rs.length) return { etat: 'couvert', n, titre: rs.map(r => `${r.emoji} ${texteDe(r.titre, langueAffichee.value)}`).join('\n') }
  return { etat: 'trou', n, titre: '' }
}

const compte = (cases: Case[]) => ({
  cases: cases.filter(x => x.etat !== 'hors').length,
  base: cases.filter(x => x.etat === 'couvert').length,
})

const matieres = computed(() => MATIERES_VUES.map(id => {
  const domaines = DOMAINES.filter(d => d.matiere === id && !('devSeulement' in d)).map(d => {
    const competences = COMPETENCES.filter(k => k.domaine === d.id && !('devSeulement' in k)).map(k => ({
      id: k.id, libelle: k.libelle, cases: Object.fromEntries(NIVEAUX.map(c => [c, caseDe(k, c)])) as Record<Classe, Case>,
    }))
    return { id: d.id, competences, ...compte(competences.flatMap(k => Object.values(k.cases))) }
  })
  const toutes = domaines.flatMap(d => d.competences)
  const parClasse = Object.fromEntries(NIVEAUX.map(c => [c, compte(toutes.map(k => k.cases[c]))])) as Record<Classe, ReturnType<typeof compte>>
  return { id, domaines, parClasse, ...compte(toutes.flatMap(k => Object.values(k.cases))) }
}))

const totaux = computed(() => matieres.value
  .filter(m => !matiere.value || m.id === matiere.value)
  .reduce((s, m) => ({ cases: s.cases + m.cases, base: s.base + m.base }), { cases: 0, base: 0 }))

// « seulement les trous » : les compétences qui ont au moins une case sans rien de la base
const matieresAffichees = computed(() => matieres.value
  .filter(m => !matiere.value || m.id === matiere.value)
  .map(m => ({ ...m, domaines: m.domaines
    .map(d => ({ ...d, competences: trousSeuls.value ? d.competences.filter(k => Object.values(k.cases).some(x => x.etat === 'trou')) : d.competences }))
    .filter(d => d.competences.length) })))
</script>

<style scoped>
.large { max-width: 1200px; }
.intro, .note { color: var(--texte-doux); margin: -.5rem 0 1rem; }
.note { margin: .5rem 0; font-style: italic; }
.totaux { display: flex; gap: 1rem; flex-wrap: wrap; margin: 1rem 0; }
.total { background: white; box-shadow: var(--shadow); border-radius: var(--radius); padding: .8rem 1.1rem; border-left: 5px solid var(--vert); display: flex; flex-direction: column; min-width: 12rem; }
.total strong { font-size: 1.8rem; }
.total span { font-size: .85rem; color: var(--texte-doux); }
.total.trou { border-left-color: var(--rouge); }
.filtres { display: flex; flex-wrap: wrap; gap: .4rem; align-items: center; margin: .8rem 0; }
.sep { width: 1px; height: 1.6rem; background: var(--gris-brd); margin: 0 .3rem; }
.case { font-size: .9rem; display: inline-flex; gap: .3rem; align-items: center; }
.legende { display: flex; flex-wrap: wrap; gap: 1rem; font-size: .85rem; color: var(--texte-doux); margin-bottom: 1rem; }
.pastille { display: inline-block; width: .9rem; height: .9rem; border-radius: 3px; margin-right: .3rem; vertical-align: -.1rem; }
.matiere h2 { margin: 1.5rem 0 .5rem; }
.matiere h2 small, .domaine small, th small { font-weight: 600; color: var(--texte-doux); font-size: .75rem; margin-left: .4rem; }
th small { display: block; margin: 0; }
.grille { width: 100%; border-collapse: collapse; font-size: .85rem; background: white; }
.grille th, .grille td { border: 1px solid var(--gris-brd); padding: .3rem .4rem; }
.grille thead th { background: var(--gris-bg); position: sticky; top: 0; z-index: 1; }
.domaine th { background: #eef3fa; text-align: left; font-size: .9rem; }
.libelle { text-align: left; font-weight: 500; min-width: 18rem; }
.libelle code { display: block; font-size: .7rem; color: var(--texte-doux); }
td { text-align: center; white-space: nowrap; min-width: 4.2rem; }
td span { margin: 0 .1rem; }
.couvert, .pastille.couvert { background: #e3f6e3; }
.trou, .pastille.trou { background: #fde4e4; color: var(--rouge); }
.hors, .pastille.hors { background: #f4f4f4; }
.pastille.hors { border: 1px solid var(--gris-brd); }
</style>
