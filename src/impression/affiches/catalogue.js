// Affiches du programme encore dans l'ancien monde : « Ce que je sais faire » (cachées, RESUMES_VISIBLES). L'affiche de conjugaison est
// reportée (src/affiches/conjugaison/). Variantes, contenu (données pures) et affiches toutes prêtes (PDF générés au build),
// reprises dans le catalogue unique (src/impression/catalogue.js).
// Données sans dépendance au navigateur : importées par les dessins, par l'app et par les tests node.
// Les niveaux suivent src/data/programme.js (tests/logique.test.mjs le vérifie).
import { COMPETENCES, DOMAINES, NIVEAUX } from '../../data/programme.js'
import { savoirsDu } from '../../data/savoirs.js'
import { enClasse } from '../../data/classes.js'

// Domaine du programme (id de DOMAINES, src/data/programme.js) de chaque famille d'affiches
export const DOMAINES_AFFICHES = {
  alphabet: 'lecture',
  // resume : un domaine par affiche (config.domaine)
}

// Affiches « Ce que je sais faire » : cachées pour l'instant (choix de l'utilisateur, 2026-10-04 : attendre l'avis
// d'enseignants) — pas de carte, pas de bouton, pas d'affiche toute prête ; le code reste prêt (passer à true)
export const RESUMES_VISIBLES = false
// les couples domaine × niveau qui ont au moins deux phrases (savoirs.js)
export const RESUMES = DOMAINES.flatMap(d => NIVEAUX.map(niveau => ({ domaine: d.id, niveau, n: savoirsDu(COMPETENCES.filter(k => k.domaine === d.id), niveau).length })))
  .filter(r => r.n >= 2)

// ── Contenu des variantes ────────────────────────────────────────────────────
// ── Les affiches et leurs variantes (choix de la page /imprimer/affiches) ─────
export const AFFICHES_PROGRAMME = [
  ...(RESUMES_VISIBLES ? [{ id: 'resume', label: 'Ce que je sais faire', orientation: 'portrait', domaines: true }] : []),
]

// ── Affiches toutes prêtes (PDF générés au build) ────────────────────────────
// le lien « Personnaliser » ouvre la page de réglage sur cette affiche (et pas sur une autre)
const lienAffiche = c => `/imprimer/affiches?affiche=${c.affiche}${c.variante ? `&variante=${c.variante}` : ''}${c.domaine ? `&domaine=${c.domaine}&niveau=${c.niveau}` : ''}`
// compétences de programme.js d'une affiche du programme (rapport de couverture : `npm run couverture`) ; l'affiche de conjugaison
// est dans src/affiches/conjugaison/
export const competencesAffiche = () => []
const entree = (slug, court, titre, description, niveaux, config) => ({
  slug, court, titre, description, niveaux, config,
  categorie: 'affiches', type: 'affiche', lien: lienAffiche(config), langues: ['fr'],
  domaine: config.domaine ?? DOMAINES_AFFICHES[config.affiche], genre: 'affiche',
  // seulement les compétences au programme d'une des classes de l'affiche (les formes de maternelle : GS)
  competences: competencesAffiche(config).filter(id => COMPETENCES.find(k => k.id === id)?.niveaux.some(n => niveaux.toLowerCase().includes(n))),
})
export const TELECHARGEMENTS_AFFICHES = [
  // « Ce que je sais faire » : un domaine, un niveau
  ...(RESUMES_VISIBLES ? RESUMES : []).map(({ domaine, niveau }) => {
    const d = DOMAINES.find(x => x.id === domaine), N = niveau.toUpperCase()
    return entree(`affiche-ce-que-je-sais-faire-${domaine}-${niveau}`, `${d.court} ${N} : je sais faire`,
      `${d.court} ${enClasse(niveau)} : ce que je sais faire (affiche à cocher)`,
      `Affiche à cocher : tout ce qu'un élève de ${N} apprend en « ${d.court.toLowerCase()} », d'après le programme officiel, une case par compétence.`,
      N, { affiche: 'resume', domaine, niveau })
  }),
]
