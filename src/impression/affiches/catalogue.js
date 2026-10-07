// Affiches du programme : variantes, contenu (données pures) et affiches toutes prêtes (PDF générés au build),
// reprises dans le catalogue unique (src/impression/catalogue.js).
// Données sans dépendance au navigateur : importées par les dessins, par l'app et par les tests node.
// Les niveaux suivent src/data/programme.js (tests/logique.test.mjs le vérifie).
import { VERBES, TEMPS_CM2 } from '../../data/conjugaison.js'
import { COMPETENCES, DOMAINES, NIVEAUX } from '../../data/programme.js'
import { savoirsDu } from '../../data/savoirs.js'
import { enClasse } from '../../data/classes.js'

// Domaine du programme (id de DOMAINES, src/data/programme.js) de chaque famille d'affiches
export const DOMAINES_AFFICHES = {
  alphabet: 'lecture',
  conjugaison: 'grammaire',
  // resume : un domaine par affiche (config.domaine)
}

// Affiches « Ce que je sais faire » : cachées pour l'instant (choix de l'utilisateur, 2026-10-04 : attendre l'avis
// d'enseignants) — pas de carte, pas de bouton, pas d'affiche toute prête ; le code reste prêt (passer à true)
export const RESUMES_VISIBLES = false
// les couples domaine × niveau qui ont au moins deux phrases (savoirs.js)
export const RESUMES = DOMAINES.flatMap(d => NIVEAUX.map(niveau => ({ domaine: d.id, niveau, n: savoirsDu(COMPETENCES.filter(k => k.domaine === d.id), niveau).length })))
  .filter(r => r.n >= 2)

// Temps d'une affiche de conjugaison : les 4 temps du cycle 2 (null), le présent seul (CP), ou ceux du CM2
export const TEMPS_PRESENT = ['present']
export { TEMPS_CM2 }
export const choixTemps = temps => (!temps?.length ? 'cycle' : temps.includes('passe-simple') ? 'cm2' : temps.length === 1 && temps[0] === 'present' ? 'present' : 'cycle')
export const TEMPS_DU_CHOIX = { cycle: null, present: TEMPS_PRESENT, cm2: TEMPS_CM2 }

// ── Contenu des variantes ────────────────────────────────────────────────────
// ── Les affiches et leurs variantes (choix de la page /imprimer/affiches) ─────
export const AFFICHES_PROGRAMME = [
  { id: 'conjugaison', label: 'Conjugaison', orientation: 'portrait', verbes: true },
  ...(RESUMES_VISIBLES ? [{ id: 'resume', label: 'Ce que je sais faire', orientation: 'portrait', domaines: true }] : []),
]

// Niveaux d'une affiche de conjugaison selon le verbe et les temps (programme.js, contraintes « conjugaison ») :
// CP être et avoir au présent ; CE1 être, avoir et 1er groupe aux 4 temps ; CE2 + 8 irréguliers ; CM1 + 2e groupe ;
// CM2 passé simple et plus-que-parfait
const NIVEAUX_GROUPE = { auxiliaire: 'CE1 · CE2 · CM1 · CM2', '1er groupe': 'CE1 · CE2 · CM1 · CM2', '3e groupe': 'CE2 · CM1 · CM2', '2e groupe': 'CM1 · CM2' }
export const niveauxConjugaison = (verbe, temps) => ({ present: 'CP · CE1', cm2: 'CM2' }[choixTemps(temps)] ?? NIVEAUX_GROUPE[VERBES[verbe].groupe])

// ── Affiches toutes prêtes (PDF générés au build) ────────────────────────────
// le lien « Personnaliser » ouvre la page de réglage sur cette affiche (et pas sur une autre)
const lienAffiche = c => `/imprimer/affiches?affiche=${c.affiche}${c.variante ? `&variante=${c.variante}` : ''}${c.verbe ? `&verbe=${c.verbe}` : ''}${c.temps ? `&temps=${choixTemps(c.temps)}` : ''}${c.domaine ? `&domaine=${c.domaine}&niveau=${c.niveau}` : ''}`
// compétences de programme.js d'une affiche du programme (rapport de couverture : `npm run couverture`)
const COMPETENCES_GROUPE = { auxiliaire: ['conjugaison-present-etre-avoir', 'conjugaison-4-temps'], '1er groupe': ['conjugaison-4-temps'], '3e groupe': ['conjugaison-irreguliers'], '2e groupe': ['conjugaison-2e-groupe'] }
export function competencesAffiche(c) {
  switch (c.affiche) {
    case 'conjugaison': return { present: ['conjugaison-present-etre-avoir'], cm2: ['conjugaison-passe-simple'] }[choixTemps(c.temps)] ?? COMPETENCES_GROUPE[VERBES[c.verbe]?.groupe] ?? []
    default: return []
  }
}
const entree = (slug, court, titre, description, niveaux, config) => ({
  slug, court, titre, description, niveaux, config,
  categorie: 'affiches', type: 'affiche', lien: lienAffiche(config), langues: ['fr'],
  domaine: config.domaine ?? DOMAINES_AFFICHES[config.affiche], genre: 'affiche',
  // seulement les compétences au programme d'une des classes de l'affiche (les formes de maternelle : GS)
  competences: competencesAffiche(config).filter(id => COMPETENCES.find(k => k.id === id)?.niveaux.some(n => niveaux.toLowerCase().includes(n))),
})
// suffixe du slug, titre court, fin du titre, description, temps (null : les 4 temps du cycle 2)
const CONJUGAISONS = [
  ['', v => `Conjugaison : ${v.inf}`, 'présent, imparfait, futur, passé composé',
    v => `Affiche de conjugaison du verbe ${v.inf} au présent, à l'imparfait, au futur et au passé composé de l'indicatif, avec le radical et la terminaison en couleur.`, null],
  ['-passe-simple', v => `${v.inf} : passé simple`, 'passé simple et plus-que-parfait',
    v => `Affiche de conjugaison du verbe ${v.inf} au passé simple et au plus-que-parfait de l'indicatif (programme du CM2).`, TEMPS_CM2],
  ['-present', v => `${v.inf} : présent`, 'le présent',
    v => `Affiche de conjugaison du verbe ${v.inf} au présent de l'indicatif, avec le radical et la terminaison en couleur (programme du CP).`, TEMPS_PRESENT],
]
const conjugaison = (id, [suffixe, court, fin, description, temps]) => entree(`affiche-conjugaison-${id}${suffixe}`, court(VERBES[id]),
  `Conjugaison du verbe ${VERBES[id].inf} : ${fin}`, description(VERBES[id]), niveauxConjugaison(id, temps),
  { affiche: 'conjugaison', verbe: id, ...(temps ? { temps } : {}) })

export const TELECHARGEMENTS_AFFICHES = [
  // chaque verbe : les 4 temps du cycle 2, puis passé simple et plus-que-parfait (CM2)
  ...Object.keys(VERBES).flatMap(v => [conjugaison(v, CONJUGAISONS[0]), conjugaison(v, CONJUGAISONS[1])]),
  // être et avoir au présent seul : le CP n'apprend que ce temps
  ...['etre', 'avoir'].map(v => conjugaison(v, CONJUGAISONS[2])),
  // « Ce que je sais faire » : un domaine, un niveau
  ...(RESUMES_VISIBLES ? RESUMES : []).map(({ domaine, niveau }) => {
    const d = DOMAINES.find(x => x.id === domaine), N = niveau.toUpperCase()
    return entree(`affiche-ce-que-je-sais-faire-${domaine}-${niveau}`, `${d.court} ${N} : je sais faire`,
      `${d.court} ${enClasse(niveau)} : ce que je sais faire (affiche à cocher)`,
      `Affiche à cocher : tout ce qu'un élève de ${N} apprend en « ${d.court.toLowerCase()} », d'après le programme officiel, une case par compétence.`,
      N, { affiche: 'resume', domaine, niveau })
  }),
]
