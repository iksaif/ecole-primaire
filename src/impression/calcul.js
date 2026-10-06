// Affiches des tables d'addition et de multiplication (mode « affiche » de /imprimer/calcul) — partagé par l'app et le build des
// PDF. Les fiches de calcul (tables, compléments, doubles…) ne sont plus ici : elles sont des fiches de l'exercice « calcul
// mental » (src/exercices/calcul-mental/), qui garde leurs adresses publiées. Reste à reporter : ces affiches (plan 11, affiches).
import { contenu } from '../i18n/index.js'
import libellesFr from '../i18n/fr/contenu/calcul-libelles.js'
import libellesBr from '../i18n/br/contenu/calcul-libelles.js'
import fichesFr from '../i18n/fr/contenu/calcul-fiches.js'
import fichesBr from '../i18n/br/contenu/calcul-fiches.js'
import { genererTables } from './affiches/tables.js'
import { DOMAINES_AFFICHES } from './affiches/catalogue.js'

const plage = (de, a, pas = 1) => Array.from({ length: Math.floor((a - de) / pas) + 1 }, (_, k) => de + k * pas)
export const graineAleatoire = () => Math.floor(Math.random() * 2 ** 31) + 1

// ── Langues des documents ──
// Libellés des réglages : clés du catalogue contenu/calcul-libelles.js, traduites par libelle(cle, langue). Breton : traductions
// à faire relire par un brittophone (voir README).
export const LANGUES_DOCUMENT = ['fr', 'br']
const LIBELLES = { fr: libellesFr, br: libellesBr }
export const libelle = (v, langue = 'fr') => LIBELLES[langue]?.[v] ?? LIBELLES.fr[v] ?? v

export const AFFICHES = [
  { id: 'multiplication', label: 'affiche_multiplication' },
  { id: 'addition', label: 'affiche_addition' },
]
export const DISPOSITIONS = [
  { id: 'toutes', label: 'disposition_toutes' },
  { id: 'une', label: 'disposition_une' },
  { id: 'grille', label: 'disposition_grille' },
]

export const DEFAUTS = {
  mode: 'affiche',
  langue: 'fr',               // langue du document : 'fr' | 'br'
  titre: '',
  affiche: 'multiplication',
  disposition: 'toutes',
  tablesAffiche: plage(1, 10),
  format: 'A4',
  orientation: 'portrait',
  corrige: false,
  seed: 1,
}

// Complète une config partielle (sauvegarde ancienne, affiche du catalogue…)
export function normaliserConfig(c = {}) {
  return {
    ...DEFAUTS, ...c, mode: 'affiche',
    langue: LANGUES_DOCUMENT.includes(c.langue) ? c.langue : DEFAUTS.langue,
    tablesAffiche: Array.isArray(c.tablesAffiche) && c.tablesAffiche.length
      ? c.tablesAffiche.filter(n => n >= 1 && n <= 10) : [...DEFAUTS.tablesAffiche],
  }
}

// polices = { script } : famille à utiliser (déjà chargée)
// config.langue : langue du document ('fr' par défaut, 'br')
export function genererCalcul(config, polices) {
  const c = normaliserConfig(config)
  const r = genererTables(c, polices)
  // documentImpression écrit lang="fr" : on indique la vraie langue du document
  return { ...r, html: r.html.replace('<html lang="fr">', `<html lang="${c.langue}">`) }
}

// ── Affiches toutes prêtes (PDF générés au build) ──
const affiche = extra => ({ ...DEFAUTS, ...extra })
// titre court, titre et description : catalogue contenu/calcul-fiches.js, clés « <slug>_court »…

const FICHES = [
  {
    slug: 'affiche-tables-de-multiplication-a4',
    niveaux: 'CE1 · CE2 · CM1 · CM2',
    config: affiche({ affiche: 'multiplication', disposition: 'toutes', format: 'A4', orientation: 'landscape' }),
  },
  {
    slug: 'affiche-tables-de-multiplication-a3',
    niveaux: 'CE1 · CE2 · CM1 · CM2',
    config: affiche({ affiche: 'multiplication', disposition: 'toutes', format: 'A3', orientation: 'landscape' }),
  },
  {
    slug: 'affiches-une-table-de-multiplication-par-page',
    niveaux: 'CE1 · CE2 · CM1',
    config: affiche({ affiche: 'multiplication', disposition: 'une', format: 'A4', orientation: 'portrait' }),
  },
  {
    slug: 'table-de-pythagore-multiplication',
    niveaux: 'CE2 · CM1 · CM2',
    config: affiche({ affiche: 'multiplication', disposition: 'grille', format: 'A4', orientation: 'portrait' }),
  },
  {
    slug: 'affiche-tables-d-addition',
    niveaux: 'CP · CE1',
    config: affiche({ affiche: 'addition', disposition: 'toutes', format: 'A4', orientation: 'landscape' }),
  },
  {
    slug: 'tableau-des-additions-0-a-10',
    niveaux: 'CP · CE1',
    config: affiche({ affiche: 'addition', disposition: 'grille', format: 'A4', orientation: 'portrait' }),
  },
]

// Chaque fiche existe en français et en breton (écoles bilingues) : mêmes calculs (même graine), textes
// dans la langue du document.
const SUFFIXE_SLUG = { fr: '', br: '-brezhoneg' }
function textesFiche(cle, params, langue) {
  const C = contenu({ fr: fichesFr, br: fichesBr }, langue)
  return { court: C.t(`${cle}_court`, params), titre: C.t(`${cle}_titre`, params), description: C.t(`${cle}_description`, params) }
}

// Réglages d'une fiche de calcul toute prête (?preset=<slug> dans le générateur), graine comprise, ou null
export const presetCalcul = slug => (slug && TELECHARGEMENTS_CALCUL.find(t => t.slug === slug)?.config) || null

export const TELECHARGEMENTS_CALCUL = FICHES.flatMap(({ cleTextes, params, ...e }) => LANGUES_DOCUMENT.map(langue => ({
  ...e,
  ...textesFiche(cleTextes ?? e.slug, params, langue),
  slug: e.slug + SUFFIXE_SLUG[langue],
  langues: [langue],
  config: { ...e.config, langue },
}))).map(e => ({
  ...e, categorie: 'calcul', type: 'calcul', lien: `/imprimer/calcul?mode=${e.config.mode}&preset=${e.slug}`,
  // domaine du programme et genre (catalogue unique, plan 09) : affiches des tables ou fiches de calcul
  domaine: DOMAINES_AFFICHES.tables, genre: 'affiche',
  // compétences de programme.js (rapport de couverture)
  competences: [e.config.affiche === 'addition' ? 'tables-addition' : 'tables-multiplication'],
}))
