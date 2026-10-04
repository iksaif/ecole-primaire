<template>
  <div class="container" lang="fr">
    <h1 class="section-heading">{{ t('titre') }}</h1>
    <p class="intro">{{ t('intro') }}</p>

    <div class="outils">
      <div class="filtre">
        <button v-for="m in ['liste', 'tableau']" :key="m" type="button" :class="{ actif: affichage === m }" @click="affichage = m">{{ t(m) }}</button>
      </div>
      <div v-if="affichage === 'liste'" class="filtre">
        <span class="lib">{{ t('classe') }}</span>
        <button v-for="c in CLASSES" :key="c.id" type="button" :class="{ actif: niveau === c.id }" @click="classe = c.id">{{ c.label }}</button>
      </div>
      <p class="legende">🎯 {{ t('exercice') }} · 📄 {{ t('affiche') }}</p>
    </div>

    <!-- tableau : chaque domaine, compétence × classe (comme le rapport `npm run couverture`) -->
    <template v-if="affichage === 'tableau'">
      <p class="legende">{{ t('legendeTableau') }}</p>
      <section v-for="d in tableau" :key="d.id" class="domaine">
        <h2 class="section-heading rubrique">{{ d.nom }} <small class="officiel">{{ t('cases', { n: d.cases }) }} · {{ t('sansRien', { n: d.rien }) }}</small></h2>
        <div class="defile">
          <table class="grille">
            <tr><th></th><th v-for="n in NIVEAUX" :key="n">{{ n.toUpperCase() }}</th></tr>
            <tr v-for="k in d.competences" :key="k.id">
              <th>{{ k.libelle }}</th>
              <td v-for="c in k.cellules" :key="c.niveau" :class="c.classe" :title="c.titre" @click="c.classe !== 'hors' && ouvrir(c.niveau, k.id)">{{ c.icones }}</td>
            </tr>
          </table>
        </div>
      </section>
    </template>

    <template v-for="g in (affichage === 'liste' ? groupes : [])" :key="g.matiere">
      <section v-for="d in g.domaines" :id="`programme-${d.id}`" :key="d.id" class="domaine">
        <h2 class="section-heading rubrique">
          <span :title="d.officiel">{{ d.nom }}</span>
          <a v-if="d.lien" :href="d.lien" class="officiel" target="_blank" rel="noopener" :title="d.officiel">{{ t('programmeOfficiel') }} ↗</a>
        </h2>
        <ul class="competences">
          <li v-for="k in d.competences" :id="`competence-${k.id}`" :key="k.id" :class="{ vide: !k.nb, surligne: surlignee === k.id }" tabindex="-1">
            <span class="libelle" lang="fr">{{ k.libelle }}</span>
            <span v-if="!k.nb" class="rien">{{ t('rien') }}</span>
            <span v-else class="ressources">
              <template v-for="s in SORTES" :key="s.id">
                <span v-for="r in k.par[s.id].slice(0, ouvertes.has(k.id) ? undefined : 3)" :key="r.route" class="puce" :class="s.id">
                  <RouterLink :to="r.route">{{ s.icone }} {{ titre(r) }}</RouterLink>
                </span>
              </template>
              <button v-if="k.cache && !ouvertes.has(k.id)" type="button" class="plus" @click="ouvertes.add(k.id)">{{ t('plus', { n: k.cache }) }}</button>
            </span>
          </li>
        </ul>
      </section>
    </template>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { ACTIVITES, CLASSES } from '../data/activites'
import { COMPETENCES, DOMAINES, NIVEAUX, nomOfficiel, lienProgramme } from '../data/programme'
import { ressourcesDe } from '../impression/couverture'
import { useClasse } from '../composables/useClasse'
import { chargerValeur, sauvegarder } from '../utils'
import { useI18n } from '../i18n'
import messagesFr from '../i18n/fr/views/ProgrammeView.js'
import messagesBr from '../i18n/br/views/ProgrammeView.js'
import domainesFr from '../i18n/fr/domaines.js'
import domainesBr from '../i18n/br/domaines.js'

const { t, langue } = useI18n({ fr: messagesFr, br: messagesBr })
const { t: nomDomaine } = useI18n({ fr: domainesFr, br: domainesBr })
// deux sortes : les exercices (à l'écran, ils s'impriment aussi ; avec les générateurs de fiches) et les affiches
// (générateurs et affiches toutes prêtes). Les fiches toutes prêtes n'y sont pas (rapport `npm run couverture`).
const SORTES = [{ id: 'exercice', icone: '🎯' }, { id: 'affiche', icone: '📄' }]
// Tout mène à l'app : un exercice, ou le générateur réglé sur l'affiche (lien du catalogue) ; une seule puce par lien,
// avec le titre de l'activité quand le lien est celui d'une carte (« Nombres en lettres »), sinon celui de l'affiche
const versApp = liste => {
  const vus = new Map()
  for (const r of liste) {
    const route = r.route ?? r.lien
    if (!route || vus.has(route)) continue
    const a = ACTIVITES.find(x => x.to === route)
    vus.set(route, { ...r, route, titre: a?.titre ?? r.titre })
  }
  return [...vus.values()]
}
const ressources = (competence, n) => {
  const par = ressourcesDe(competence, n)
  return { exercice: versApp([...par.exercice, ...par.fiche.filter(r => r.generateur)]), affiche: versApp(par.affiche) }
}

// la classe de la barre du haut ; sans classe choisie, le CE1 (on montre toujours une classe)
const classe = useClasse()
const niveau = computed(() => classe.value || 'ce1')

// titre d'une ressource de l'app dans la langue de l'interface
const titre = r => (langue.value === 'br' && ACTIVITES.find(a => a.to === r.route)?.br?.titre) || r.titre

// compétences repliées au-delà de 3 ressources par sorte (« + 4 autres »)
const ouvertes = reactive(new Set())

// par matière (maths, français, autres), les domaines qui ont des compétences dans cette classe
const ORDRE = ['maths', 'francais', 'autres']
const groupes = computed(() => ORDRE.map(m => ({
  matiere: m,
  domaines: DOMAINES.filter(d => d.matiere === m).map(d => {
    const competences = COMPETENCES.filter(k => k.domaine === d.id && k.niveaux.includes(niveau.value)).map(k => {
      const par = ressources(k.id, niveau.value)
      const nb = par.exercice.length + par.affiche.length
      const cache = SORTES.reduce((n, s) => n + Math.max(0, par[s.id].length - 3), 0)
      return { id: k.id, libelle: k.libelle, par, nb, cache }
    })
    return { id: d.id, nom: nomDomaine(d.id), officiel: nomOfficiel(d.id, niveau.value), lien: lienProgramme(d.id, niveau.value), competences }
  }).filter(d => d.competences.length),
})).filter(g => g.domaines.length))

// affichage : liste (une classe) ou tableau (toutes les classes) ; dernier choix gardé dans ce navigateur
const affichage = ref(chargerValeur('programme_affichage', 'liste'))
watch(affichage, v => sauvegarder('programme_affichage', v))

// tableau : pour chaque domaine, chaque compétence × classe (gris hors programme, rouge rien, jaune une sorte, vert plus)
const ICONES = Object.fromEntries(SORTES.map(s => [s.id, s.icone]))
const tableau = computed(() => DOMAINES.map(d => {
  let cases = 0, rien = 0
  const competences = COMPETENCES.filter(k => k.domaine === d.id).map(k => ({
    id: k.id, libelle: k.libelle,
    cellules: NIVEAUX.map(niveau => {
      if (!k.niveaux.includes(niveau)) return { niveau, classe: 'hors', icones: '', titre: '' }
      cases++
      const par = ressources(k.id, niveau)
      const sortes = Object.keys(ICONES).filter(s => par[s].length)
      if (!sortes.length) rien++
      return {
        niveau, classe: !sortes.length ? 'rien' : sortes.length >= 2 ? 'bien' : 'peu',
        icones: sortes.length ? sortes.map(s => ICONES[s]).join('') : '—',
        titre: sortes.map(s => `${ICONES[s]} ${par[s].map(r => r.titre).join(', ')}`).join('\n'),
      }
    }),
  }))
  return { id: d.id, nom: nomDomaine(d.id), competences, cases, rien }
}).filter(d => d.competences.length))

// clic sur une case : la liste de cette classe, à la compétence, mise en évidence quelques secondes (et le focus)
const surlignee = ref(null)
let minuteur = null
async function ouvrir(niveau, id) {
  classe.value = niveau
  affichage.value = 'liste'
  await nextTick()
  const li = document.getElementById(`competence-${id}`)
  li?.scrollIntoView({ block: 'center' })
  li?.focus({ preventScroll: true })
  surlignee.value = id
  clearTimeout(minuteur)
  minuteur = setTimeout(() => { surlignee.value = null }, 3000)
}

// ?domaine=… (liens de la page « À imprimer ») : on descend jusqu'au domaine, après le retour en haut du routeur
const route = useRoute()
onMounted(async () => {
  if (!route.query.domaine) return
  await nextTick()
  setTimeout(() => document.getElementById(`programme-${route.query.domaine}`)?.scrollIntoView({ block: 'start' }), 50)
})
</script>

<style scoped>
.intro { color: #666; margin: -.5rem 0 1rem; }
.outils { display: flex; flex-wrap: wrap; align-items: center; gap: .5rem 1.5rem; margin-bottom: .5rem; }
.filtre { display: flex; flex-wrap: wrap; align-items: center; gap: .3rem; }
.lib { font-size: .75rem; font-weight: 800; color: #888; text-transform: uppercase; margin-right: .15rem; }
.filtre button {
  border: 2px solid var(--gris-brd); background: white; border-radius: 20px; padding: .2rem .75rem;
  font: inherit; font-size: .88rem; font-weight: 700; cursor: pointer; color: var(--texte);
}
.filtre button.actif { background: var(--bleu); border-color: var(--bleu); color: white; }
.legende { color: #888; font-size: .85rem; margin: 0; }
.rubrique { margin-top: 1.75rem; display: flex; flex-wrap: wrap; align-items: baseline; gap: .25rem 1rem; }
.officiel { font-size: .85rem; font-weight: 400; color: #888; }
.competences { list-style: none; padding: 0; margin: 0; background: white; border-radius: var(--radius); box-shadow: var(--shadow); }
.competences li { padding: .65rem 1rem; border-bottom: 1px solid var(--gris-brd); display: flex; flex-direction: column; gap: .35rem; }
.competences li:last-child { border-bottom: none; }
.competences li { transition: background-color 1s ease, box-shadow 1s ease; outline: none; }
.competences li.surligne { background: #fff1c2; box-shadow: inset 4px 0 0 var(--orange); transition: none; }
.libelle { font-weight: 600; }
.vide .libelle { color: #999; font-weight: 500; }
.rien { color: #aaa; font-size: .85rem; font-style: italic; }
.ressources { display: flex; flex-wrap: wrap; gap: .3rem; }
.puce a {
  display: inline-block; font-size: .82rem; padding: .15rem .6rem; border-radius: 14px; text-decoration: none; color: var(--texte);
  background: var(--gris-bg); border: 1px solid var(--gris-brd);
}
.puce.exercice a { background: #eaf2fd; border-color: #c6dbf7; }
.puce.affiche a { background: #fff6e8; border-color: #f5d9a8; }
.puce a:hover { border-color: var(--bleu); }
.defile { overflow-x: auto; background: white; border-radius: var(--radius); box-shadow: var(--shadow); }
.grille { border-collapse: collapse; width: 100%; font-size: .85rem; }
.grille th, .grille td { border: 1px solid #e3e6ea; padding: .3rem .4rem; }
.grille tr > th:first-child { text-align: left; font-weight: 500; min-width: 16rem; }
.grille td { text-align: center; white-space: nowrap; cursor: pointer; min-width: 3.2rem; }
.grille td.hors { background: #f3f4f6; cursor: default; }
.grille td.rien { background: #fde2e1; color: #b42318; font-weight: 700; }
.grille td.peu { background: #fff4d6; } .grille td.bien { background: #ddf3e4; }
.grille td:not(.hors):hover { outline: 2px solid var(--bleu); outline-offset: -2px; }
.plus { border: none; background: none; color: var(--bleu); font: inherit; font-size: .82rem; cursor: pointer; padding: .15rem .3rem; }
</style>
