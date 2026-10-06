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
  horloge: 'grandeurs-mesures',
  conjugaison: 'grammaire', formes: 'espace-geometrie',
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
// Figures et solides : ids des dessins (affiches/formes.js). Les listes suivent celles de programme.js par année.
export const LOTS_FORMES = {
  'plan-cycle2': { titre: 'Les formes planes', type: 'figures', liste: ['disque', 'carre', 'rectangle', 'triangle'] },
  'plan-cm1': { titre: 'Les figures planes', type: 'figures', liste: ['carre', 'rectangle', 'losange', 'triangle', 'triangle-rectangle', 'isocele', 'equilateral', 'disque'] },
  'plan-cycle3': { titre: 'Les figures planes', type: 'figures', liste: ['carre', 'rectangle', 'losange', 'triangle', 'triangle-rectangle', 'isocele', 'equilateral', 'trapeze', 'pentagone', 'hexagone', 'disque'] },
  'solides-ce2': { titre: 'Les solides', type: 'solides', liste: ['cube', 'pave', 'boule', 'cylindre', 'cone', 'pyramide'] },
  'solides-cm1': { titre: 'Les solides', type: 'solides', liste: ['cube', 'pave', 'prisme', 'pyramide', 'cylindre', 'cone', 'boule'] },
}

// ── Les affiches et leurs variantes (choix de la page /imprimer/affiches) ─────
// horloge : precision = ce que l'affiche fait lire ('entiere' | 'quart' | 'minute', comme heure dans programme.js)
export const AFFICHES_PROGRAMME = [
  { id: 'horloge', label: "L'horloge", orientation: 'landscape', variantes: [
    { id: 'heures', label: 'Les heures entières', niveaux: 'CP', precision: 'entiere' },
    { id: 'quarts', label: 'Les demies et les quarts', niveaux: 'CE1', precision: 'quart' },
    { id: 'minutes', label: 'Les heures et les minutes', niveaux: 'CE2', precision: 'minute' } ] },
  { id: 'conjugaison', label: 'Conjugaison', orientation: 'portrait', verbes: true },
  ...(RESUMES_VISIBLES ? [{ id: 'resume', label: 'Ce que je sais faire', orientation: 'portrait', domaines: true }] : []),
  { id: 'formes', label: 'Figures et solides', orientation: 'portrait', variantes: [
    { id: 'plan-cycle2', label: 'Formes planes', niveaux: 'GS · CP · CE1' }, { id: 'plan-cm1', label: 'Figures planes', niveaux: 'CM1' },
    { id: 'plan-cycle3', label: 'Figures planes (+ trapèze, polygones)', niveaux: 'CM2' },
    { id: 'solides-ce2', label: 'Solides', niveaux: 'CE1 · CE2' }, { id: 'solides-cm1', label: 'Solides (avec le prisme)', niveaux: 'CM1 · CM2' } ] },
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
    case 'horloge': return { heures: ['heure-entiere'], quarts: ['heure-demi-quart'], minutes: ['heure-minutes'] }[c.variante] ?? []
    case 'conjugaison': return { present: ['conjugaison-present-etre-avoir'], cm2: ['conjugaison-passe-simple'] }[choixTemps(c.temps)] ?? COMPETENCES_GROUPE[VERBES[c.verbe]?.groupe] ?? []
    case 'formes': return c.variante?.startsWith('solides') ? ['solides', 'solides-maternelle'] : ['figures-planes', 'formes-maternelle']
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
  entree('affiche-horloge-heures-entieres', 'Horloge : heures', "Affiche de l'horloge : lire les heures entières", "L'horloge à aiguilles pour lire et positionner les heures entières, avec des moments de la journée (programme du CP).", 'CP', { affiche: 'horloge', variante: 'heures' }),
  entree('affiche-horloge-quarts-demies', 'Horloge : quarts et demies', "Affiche de l'horloge : et quart, et demie, moins le quart", "L'horloge à aiguilles pour lire les heures entières, les demi-heures et les quarts d'heure, avec les heures de l'après-midi (programme du CE1).", 'CE1', { affiche: 'horloge', variante: 'quarts' }),
  entree('affiche-horloge-heures-minutes', 'Horloge : minutes', "Affiche de l'horloge : heures, minutes, quart et demie", "L'horloge avec les minutes, « et quart », « et demie » et « moins le quart », et l'affichage numérique 24 h (programme du CE2).", 'CE2', { affiche: 'horloge', variante: 'minutes' }),
  // chaque verbe : les 4 temps du cycle 2, puis passé simple et plus-que-parfait (CM2)
  ...Object.keys(VERBES).flatMap(v => [conjugaison(v, CONJUGAISONS[0]), conjugaison(v, CONJUGAISONS[1])]),
  // être et avoir au présent seul : le CP n'apprend que ce temps
  ...['etre', 'avoir'].map(v => conjugaison(v, CONJUGAISONS[2])),
  entree('affiche-formes-planes-cycle-1-2', 'Formes planes', 'Affiche des formes planes : disque, carré, rectangle, triangle', 'Les quatre formes planes de référence du cycle 2, avec leurs côtés et leurs angles droits.', 'GS · CP · CE1', { affiche: 'formes', variante: 'plan-cycle2' }),
  entree('affiche-figures-planes-cm1', 'Figures planes CM1', 'Affiche des figures planes du CM1', 'Carré, rectangle, losange, triangle rectangle, isocèle, équilatéral et disque, avec leurs propriétés (programme du CM1).', 'CM1', { affiche: 'formes', variante: 'plan-cm1' }),
  entree('affiche-figures-planes-cycle-3', 'Figures planes CM2', 'Affiche des figures planes du cycle 3 (CM2)', 'Triangle rectangle, isocèle, équilatéral, losange, trapèze, pentagone, hexagone… avec leurs propriétés (programme du CM2).', 'CM2', { affiche: 'formes', variante: 'plan-cycle3' }),
  entree('affiche-solides-ce2', 'Solides', 'Affiche des solides : cube, pavé, boule, cylindre, cône, pyramide', 'Les six solides du programme du CE1 et du CE2 avec le nombre et la nature de leurs faces, sommets et arêtes.', 'CE1 · CE2', { affiche: 'formes', variante: 'solides-ce2' }),
  // « Ce que je sais faire » : un domaine, un niveau
  ...(RESUMES_VISIBLES ? RESUMES : []).map(({ domaine, niveau }) => {
    const d = DOMAINES.find(x => x.id === domaine), N = niveau.toUpperCase()
    return entree(`affiche-ce-que-je-sais-faire-${domaine}-${niveau}`, `${d.court} ${N} : je sais faire`,
      `${d.court} ${enClasse(niveau)} : ce que je sais faire (affiche à cocher)`,
      `Affiche à cocher : tout ce qu'un élève de ${N} apprend en « ${d.court.toLowerCase()} », d'après le programme officiel, une case par compétence.`,
      N, { affiche: 'resume', domaine, niveau })
  }),
  entree('affiche-solides-cm1', 'Solides et prisme', 'Affiche des solides avec le prisme droit', 'Cube, pavé, prisme droit, pyramide, cylindre, cône et boule (programme du CM1).', 'CM1 · CM2', { affiche: 'formes', variante: 'solides-cm1' }),
]
