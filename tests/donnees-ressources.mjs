// Jeux de données des tests du catalogue et de la recherche : les exemples (exercices et affiches, développement ; jamais les exercices réels) et un petit
// index de fiches prêtes factices (les entrées « réelles » couvrent plusieurs domaines et classes).
import { REGISTRE as EXERCICES } from '../src/exercices/index.ts'
import { EXEMPLES as AFFICHES } from '../src/affiches/dev.ts'
import { NIVEAUX } from '../src/data/classes.ts'
import { SITES } from '../src/sites.ts'
import { construireCatalogue } from '../src/ressources/catalogue.ts'

const t = (fr, br) => ({ fr, ...(br ? { br } : {}) })
const entree = (slug, niveaux, domaine, extra = {}) => ({
  slug, titre: t(`Fiche ${slug}`, `Fichenn ${slug}`), titreCourt: t(slug), description: t(`Description de ${slug}`), niveaux, domaine,
  genre: 'fiche', usage: 'sentrainer', langues: ['fr'], nbPages: 1, nbVariantes: 1, taillePdf: 1, parent: null, personnaliser: null,
  exemple: false, recherche: slug, miniature: { chemin: `${slug}/m.jpg`, largeur: 1, hauteur: 1 }, ...extra,
})

/** Index factice : fiches d'exercices d'exemple (compétences retrouvées par le slug), d'une affiche, et des fiches « réelles ». */
const entrees = [
  entree('exercices-exemple-ce1', ['ce1'], 'exemple', { genre: 'exercice' }),
  entree('exercices-exemple-ce1-regle', ['ce1'], 'exemple', { genre: 'exercice', parent: 'exercices-exemple-ce1' }),
  entree('exercices-exemple-ce1-br', ['ce1'], 'exemple', { genre: 'exercice', langues: ['br'] }),
  entree('affiche-exemple-jusqua6-fr-br', ['ms'], 'exemple', { genre: 'affiche', usage: 'apprendre', langues: ['fr', 'br'] }),
  entree('numeration-cp', ['cp'], 'nombres-calcul'),
  entree('numeration-ce1-ce2', ['ce1', 'ce2'], 'nombres-calcul'),
  entree('fractions-cm1', ['cm1'], 'nombres-calcul'),
  entree('lecture-gs', ['gs'], 'lecture', { usage: 'apprendre', genre: 'affiche', langues: ['br'] }),
  entree('vivant-ps', ['ps', 'ms'], 'vivant', { usage: 'apprendre', genre: 'affiche' }),
  entree('culture-generale', ['cm2'], null),
  entree('langue-inconnue', ['cp'], 'nombres-calcul', { langues: ['xx'] }),
  entree('exemple-declare', ['cp'], 'nombres-calcul', { exemple: true }),
]

export const FICHES = {
  version: 1, genereLe: '2026-01-01T00:00:00.000Z', site: 'test', entrees,
  filtres: { classes: NIVEAUX, langues: [], usages: ['apprendre', 'sentrainer'], domaines: [...new Set(entrees.map(e => e.domaine))].map(id => ({ id })) },
}

export const SITE_FR = { languesInterface: ['fr'], languesRegionales: [] }
export const SITE_BR = SITES.ecoleprimaire

// seulement les exemples : les exercices réels du registre (calcul mental…) ont leur propre test (tests/ressources.test.mjs, « registre réel »)
export const sources = (extra = {}) => ({ exercices: EXERCICES.filter(e => e.exemple), affiches: AFFICHES, fiches: FICHES, site: SITE_BR, enDeveloppement: true, ...extra })
export const catalogueDeTest = (extra = {}) => construireCatalogue(sources(extra))
