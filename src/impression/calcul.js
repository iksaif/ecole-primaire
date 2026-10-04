// Fiches de calcul à imprimer (calcul mental, tables, compléments…) et affiches des tables —
// partagé par l'app et le build des PDF. Programmes 2024 du cycle 2 et 3 (CP → CM2).
// Tirage déterministe : même graine (config.seed) → exactement la même fiche.
import { largeurTexte, dimensionsPage, documentImpression, echapper } from '../utils/impression'
import { contenu } from '../i18n/index.js'
import contenuFr from '../i18n/fr/contenu/calcul.js'
import contenuBr from '../i18n/br/contenu/calcul.js'
import libellesFr from '../i18n/fr/contenu/calcul-libelles.js'
import libellesBr from '../i18n/br/contenu/calcul-libelles.js'
import fichesFr from '../i18n/fr/contenu/calcul-fiches.js'
import fichesBr from '../i18n/br/contenu/calcul-fiches.js'

export const NIVEAUX = ['cp', 'ce1', 'ce2', 'cm1', 'cm2']

// ── Hasard reproductible ──
export function mulberry32(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6D2B79F5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
export const graineAleatoire = () => Math.floor(Math.random() * 2 ** 31) + 1
const entier = (rng, min, max) => min + Math.floor(rng() * (max - min + 1))
const choisir = (rng, t) => t[Math.floor(rng() * t.length)]
function melangerAvec(rng, t) {
  const r = [...t]
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]]
  }
  return r
}
const plage = (de, a, pas = 1) => Array.from({ length: Math.floor((a - de) / pas) + 1 }, (_, k) => de + k * pas)

// Un calcul : texte où chaque « § » est une case réponse, et les réponses dans l'ordre
const B = '§'
const nb = n => n >= 1000 ? n.toLocaleString('fr-FR') : String(n)   // 1 000 (espace insécable fine)
const calc = (t, ...r) => ({ t, r })

// ── Langues des documents ──
// Textes des fiches : catalogues src/i18n/<langue>/contenu/calcul.js, dans la langue du document (config.langue).
// Libellés des réglages (`label` des types, options, tailles…) : clés du catalogue contenu/calcul-libelles.js,
// traduites par libelle(cle, langue) ; un libellé absent du catalogue (« 7 × 6 = … ») s'affiche tel quel.
// Breton : traductions à faire relire par un brittophone (voir README).
export const LANGUES_DOCUMENT = ['fr', 'br']
const LIBELLES = { fr: libellesFr, br: libellesBr }
export const libelle = (v, langue = 'fr') => LIBELLES[langue]?.[v] ?? LIBELLES.fr[v] ?? v
const textes = langue => contenu({ fr: contenuFr, br: contenuBr }, langue)

// « 2, 3 et 4 » : « et » (breton : ha / hag) choisi selon le dernier nombre
const liste = (t, T) => {
  const l = t.map(String)
  if (l.length <= 1) return l[0] ?? ''
  return `${l.slice(0, -1).join(', ')} ${T.t('etNombre', { n: l.at(-1) })} ${l.at(-1)}`
}

// ── Types de calcul ──
// params : options propres au type (choix unique, ou multi = plusieurs valeurs possibles)
// source(p, T) → { tous: [...] } (liste finie) ou { tirer: rng => calcul } (tirage au hasard) ; T = textes de la langue
// (T.t(cle, params), catalogue contenu/calcul.js) ; label : clé du catalogue contenu/calcul-libelles.js
// Les nombres tirés ne dépendent pas de la langue : seule la formulation change.
const TABLES = plage(1, 10).map(n => ({ v: n, label: String(n) }))
const LES_DEUX = 'lesDeux'
const CALCUL = 'calcul'
const NOMBRES = 'nombres'
const jusqua = n => `jusqua_${n}`

export const TYPES = [
  {
    id: 'tables', label: 'type_tables', niveaux: ['ce1', 'ce2', 'cm1', 'cm2'],
    params: [
      { id: 'tables', label: 'tables', multi: true, options: TABLES, defaut: [2, 3, 4, 5] },
      { id: 'forme', label: CALCUL, options: [
        { v: 'produit', label: '7 × 6 = …' },
        { v: 'facteur', label: 'facteurManquant' },
        { v: 'mixte', label: LES_DEUX },
      ], defaut: 'produit' },
      { id: 'ordre', label: 'ordre', options: [
        { v: 'melange', label: 'melangees' }, { v: 'ordre', label: 'dansOrdre' },
      ], defaut: 'melange' },
    ],
    titre: (p, T) => p.tables.length === 1 ? T.t('table', { t: p.tables[0] }) : T.t('tables', { l: liste(p.tables, T) }),
    source(p) {
      const tables = [...p.tables].sort((a, b) => a - b)
      const produits = p.forme !== 'facteur', facteurs = p.forme !== 'produit'
      if (p.ordre === 'ordre') {
        const l = []
        if (produits) for (const t of tables) for (let k = 1; k <= 10; k++) l.push(calc(`${t} × ${k} = ${B}`, t * k))
        if (facteurs) for (const t of tables) for (let k = 1; k <= 10; k++) l.push(calc(`${t} × ${B} = ${t * k}`, k))
        return { tous: l, ordonne: true }
      }
      const l = []
      for (const t of tables) for (let k = 1; k <= 10; k++) {
        if (produits) l.push(calc(`${t} × ${k} = ${B}`, t * k), calc(`${k} × ${t} = ${B}`, t * k))
        if (facteurs) l.push(calc(`${t} × ${B} = ${t * k}`, k), calc(`${B} × ${t} = ${t * k}`, k))
      }
      return { tous: l }
    },
  },
  {
    id: 'tablesAdd', label: 'type_tablesAdd', niveaux: ['cp', 'ce1'],
    params: [
      { id: 'plage', label: 'resultats', options: [
        { v: '10', label: jusqua(10) }, { v: '20', label: 'jusqua20_10plus10' },
      ], defaut: '10' },
      { id: 'forme', label: CALCUL, options: [
        { v: 'somme', label: '4 + 3 = …' },
        { v: 'manquant', label: 'termeManquant' },
        { v: 'mixte', label: LES_DEUX },
      ], defaut: 'somme' },
    ],
    titre: (p, T) => T.t('tablesAdd', { m: p.plage }),
    source(p) {
      const l = []
      for (let a = 1; a <= 10; a++) for (let b = 1; b <= 10; b++) {
        if (p.plage === '10' ? a + b > 10 : false) continue
        if (p.forme !== 'manquant') l.push(calc(`${a} + ${b} = ${B}`, a + b))
        if (p.forme !== 'somme') l.push(calc(`${a} + ${B} = ${a + b}`, b))
      }
      return { tous: l }
    },
  },
  {
    id: 'addition', label: 'type_addition', niveaux: ['cp', 'ce1', 'ce2', 'cm1', 'cm2'],
    params: [{ id: 'plage', label: NOMBRES, options: PLAGES(), defaut: '20' }],
    titre: (p, T) => T.t('additions', { s: titrePlage(p.plage, T) }),
    source(p) {
      if (p.plage === '1000') return { tirer: rng => {
        const a = entier(rng, 100, 899), mode = entier(rng, 0, 2)
        const max = 999 - a
        const b = mode === 0 ? 100 * entier(rng, 1, Math.max(1, Math.floor(max / 100)))
          : mode === 1 ? 10 * entier(rng, 1, Math.floor(max / 10)) : entier(rng, 11, max)
        return a + b <= 1000 ? calc(`${nb(a)} + ${nb(b)} = ${B}`, a + b) : null
      } }
      const l = []
      const [amin, amax, max] = { 10: [0, 10, 10], 20: [1, 19, 20], '100s': [10, 89, 99], '100r': [10, 98, 100] }[p.plage]
      for (let a = amin; a <= amax; a++) for (let b = 1; a + b <= max; b++) {
        const passage = (a % 10) + (b % 10) >= 10
        if (p.plage === '10' && a === 0) continue
        if (p.plage === '20' && a + b < 6) continue
        if (p.plage === '100s' && (passage || b < 2 || a + b < 20)) continue
        if (p.plage === '100r' && (!passage || b < 2 || a % 10 === 0 || b % 10 === 0)) continue
        l.push(calc(`${a} + ${b} = ${B}`, a + b))
      }
      return { tous: l }
    },
  },
  {
    id: 'soustraction', label: 'type_soustraction', niveaux: ['cp', 'ce1', 'ce2', 'cm1', 'cm2'],
    params: [{ id: 'plage', label: NOMBRES, options: PLAGES(), defaut: '20' }],
    titre: (p, T) => T.t('soustractions', { s: titrePlage(p.plage, T) }),
    source(p) {
      if (p.plage === '1000') return { tirer: rng => {
        const a = entier(rng, 150, 999), mode = entier(rng, 0, 2)
        const b = mode === 0 ? 100 * entier(rng, 1, Math.floor(a / 100))
          : mode === 1 ? 10 * entier(rng, 1, Math.floor(a / 10) - 1) : entier(rng, 11, a - 11)
        return b > 0 && b < a ? calc(`${nb(a)} − ${nb(b)} = ${B}`, a - b) : null
      } }
      const l = []
      const [amin, amax] = { 10: [2, 10], 20: [6, 20], '100s': [20, 99], '100r': [21, 100] }[p.plage]
      for (let a = amin; a <= amax; a++) for (let b = 1; b < a; b++) {
        const passage = (a % 10) < (b % 10)
        if (p.plage === '20' && a <= 10 && b > 5) continue
        if (p.plage === '100s' && (passage || b < 2 || a - b < 10)) continue
        if (p.plage === '100r' && (!passage || b < 3)) continue
        l.push(calc(`${a} − ${b} = ${B}`, a - b))
      }
      return { tous: l }
    },
  },
  {
    id: 'complements', label: 'type_complements', niveaux: ['cp', 'ce1', 'ce2', 'cm1'],
    params: [{ id: 'cibles', label: 'complements', multi: true, options: [
      { v: '10', label: 'cible_10' }, { v: '20', label: 'cible_20' },
      { v: 'dizaine', label: 'cible_dizaine' },
      { v: '100d', label: 'cible_100d' },
      { v: '100', label: 'cible_100' },
      { v: '1000', label: 'cible_1000' },
    ], defaut: ['10'] }],
    titre: (p, T) => T.t('complements', { s: liste(p.cibles.map(c => T.t(`cible_${c}`)).filter((x, i, t) => t.indexOf(x) === i), T) }),
    source(p) {
      const l = []
      const ajouter = (a, c) => {
        l.push(calc(`${nb(a)} + ${B} = ${nb(c)}`, c - a))
        l.push(calc(`${B} + ${nb(a)} = ${nb(c)}`, c - a))
      }
      for (const c of p.cibles) {
        if (c === '10') plage(1, 9).forEach(a => ajouter(a, 10))
        if (c === '20') plage(1, 19).forEach(a => ajouter(a, 20))
        if (c === 'dizaine') plage(1, 99).filter(a => a % 10).forEach(a => l.push(calc(`${a} + ${B} = ${Math.ceil(a / 10) * 10}`, Math.ceil(a / 10) * 10 - a)))
        if (c === '100d') plage(10, 90, 10).forEach(a => ajouter(a, 100))
        if (c === '100') plage(1, 99).filter(a => a % 10).forEach(a => l.push(calc(`${a} + ${B} = 100`, 100 - a)))
        if (c === '1000') plage(100, 900, 100).forEach(a => ajouter(a, 1000))
      }
      return { tous: l }
    },
  },
  {
    id: 'doubles', label: 'type_doubles', niveaux: ['cp', 'ce1', 'ce2', 'cm1', 'cm2'],
    params: [
      { id: 'quoi', label: CALCUL, options: [
        { v: 'doubles', label: 'doubles' }, { v: 'moities', label: 'moities' }, { v: 'les2', label: LES_DEUX },
      ], defaut: 'les2' },
      { id: 'plages', label: NOMBRES, multi: true, options: [
        { v: '10', label: 'doubles_10' },
        { v: '20', label: 'doubles_20' },
        { v: 'ronds', label: 'doubles_ronds' },
        { v: '100', label: 'doubles_100' },
      ], defaut: ['10'] },
    ],
    titre: (p, T) => T.t(`doubles_${p.quoi}`),
    source(p, T) {
      const D = new Set(p.plages.flatMap(pl => ({
        10: plage(1, 10), 20: plage(1, 20),
        ronds: [15, 25, 30, 35, 40, 45, 50, 60, 70, 80, 90, 100, 150, 200, 250, 300, 400, 500],
        100: plage(11, 50),
      })[pl]))
      const M = new Set(p.plages.flatMap(pl => ({
        10: plage(2, 20, 2), 20: plage(2, 40, 2),
        ronds: [30, 50, 60, 70, 80, 90, 100, 120, 140, 160, 200, 300, 400, 500, 600, 1000],
        100: plage(22, 100, 2),
      })[pl]))
      const l = []
      if (p.quoi !== 'moities') D.forEach(n => l.push(calc(`${T.t('doubleDe', { n: nb(n) })} = ${B}`, 2 * n)))
      if (p.quoi !== 'doubles') M.forEach(n => l.push(calc(`${T.t('moitieDe', { n: nb(n) })} = ${B}`, n / 2)))
      return { tous: l }
    },
  },
  {
    id: 'dixCent', label: '🔟 + 10, − 10, × 10, × 100', niveaux: ['cp', 'ce1', 'ce2', 'cm1', 'cm2'],
    params: [
      { id: 'ops', label: 'calculs', multi: true, options: [
        { v: '+10', label: '+ 10' }, { v: '-10', label: '− 10' }, { v: '+100', label: '+ 100' }, { v: '-100', label: '− 100' },
        { v: 'x10', label: '× 10' }, { v: 'x100', label: '× 100' },
      ], defaut: ['+10', '-10'] },
      { id: 'plage', label: NOMBRES, options: [
        { v: '100', label: jusqua(100) }, { v: '1000', label: jusqua(1000) }, { v: '10000', label: jusqua(10000) },
      ], defaut: '100' },
    ],
    titre: (p, T) => T.t('calculer', { l: liste(p.ops.map(o => o.replace('x', '× ').replace('-', '− ').replace('+', '+ ')), T) }),
    source(p) {
      const M = +p.plage, M100 = Math.max(M, 1000)
      // [plus petit nombre, plus grand, calcul]
      const R = {
        '+10': [1, M - 10, n => calc(`${nb(n)} + 10 = ${B}`, n + 10)],
        '-10': [10, M, n => calc(`${nb(n)} − 10 = ${B}`, n - 10)],
        '+100': [1, M100 - 100, n => calc(`${nb(n)} + 100 = ${B}`, n + 100)],
        '-100': [100, M100, n => calc(`${nb(n)} − 100 = ${B}`, n - 100)],
        x10: [1, M - 1, n => calc(`${nb(n)} × 10 = ${B}`, n * 10)],
        x100: [1, M / 10 - 1, n => calc(`${nb(n)} × 100 = ${B}`, n * 100)],
      }
      const ops = p.ops.map(o => R[o])
      // grands nombres : tirage au hasard plutôt que la liste complète
      if (ops.reduce((s, [a, b]) => s + b - a + 1, 0) > 3000) return { tirer: rng => {
        const [a, b, f] = choisir(rng, ops)
        return f(entier(rng, a, b))
      } }
      return { tous: ops.flatMap(([a, b, f]) => plage(a, b).map(f)) }
    },
  },
  {
    id: 'neufOnze', label: '9️⃣ + 9, − 9, + 11, − 11', niveaux: ['ce1', 'ce2', 'cm1'],
    params: [
      { id: 'ops', label: 'calculs', multi: true, options: [
        { v: '+9', label: '+ 9' }, { v: '-9', label: '− 9' }, { v: '+11', label: '+ 11' }, { v: '-11', label: '− 11' },
      ], defaut: ['+9', '-9', '+11', '-11'] },
      { id: 'plage', label: NOMBRES, options: [{ v: '100', label: jusqua(100) }, { v: '1000', label: jusqua(1000) }], defaut: '100' },
    ],
    titre: (p, T) => T.t('neufOnze'),
    source(p) {
      const M = +p.plage, l = []
      for (const o of p.ops) {
        const k = Math.abs(+o)
        if (o[0] === '+') plage(3, M - k).forEach(n => l.push(calc(`${nb(n)} + ${k} = ${B}`, n + k)))
        else plage(k + 3, M).forEach(n => l.push(calc(`${nb(n)} − ${k} = ${B}`, n - k)))
      }
      return { tous: l }
    },
  },
  {
    id: 'division', label: 'type_division', niveaux: ['ce2', 'cm1', 'cm2'],
    params: [
      { id: 'tables', label: 'tables', multi: true, options: TABLES.filter(t => t.v >= 2), defaut: [2, 3, 4, 5] },
      { id: 'forme', label: CALCUL, options: [
        { v: 'combien', label: 'division_combien' },
        { v: 'partage', label: 'division_partage' },
        { v: 'signe', label: '42 ÷ 6 = …' },
        { v: 'reste', label: 'division_reste' },
      ], defaut: 'combien' },
    ],
    titre: (p, T) => T.t(p.forme === 'reste' ? 'divReste' : p.forme === 'signe' ? 'divisions' : 'combienTitre'),
    source(p, T) {
      const l = []
      for (const t of p.tables) for (let k = 1; k <= 10; k++) {
        const n = t * k
        if (p.forme === 'combien') l.push(calc(T.t('combien', { t, n }), k))
        if (p.forme === 'partage') l.push(calc(T.t('partage', { n, t }), k))
        if (p.forme === 'signe') l.push(calc(`${n} ÷ ${t} = ${B}`, k))
        if (p.forme === 'reste' && k < 10) for (let r = 0; r < t; r++) l.push(calc(T.t('reste', { a: n + r, t }), k, r))
      }
      return { tous: l }
    },
  },
  {
    id: 'suites', label: 'type_suites', niveaux: ['cp', 'ce1', 'ce2', 'cm1'],
    params: [
      { id: 'pas', label: 'pas', multi: true, options: [2, 5, 10, 25, 50, 100].map(v => ({ v, label: `pas_${v}` })), defaut: [2, 5, 10] },
      { id: 'sens', label: 'sens', options: [
        { v: 'croissant', label: 'croissant' }, { v: 'decroissant', label: 'decroissant' }, { v: 'les2', label: LES_DEUX },
      ], defaut: 'croissant' },
    ],
    titre: (p, T) => T.t('suites'),
    source(p) {
      // début possible selon le pas (de 10 en 10 et de 100 en 100 : départ quelconque, comme 23, 33, 43…)
      const debuts = { 2: plage(0, 30), 5: plage(0, 70, 5), 10: plage(0, 140), 25: plage(0, 300, 25), 50: plage(0, 600, 50), 100: plage(0, 600) }
      return { tirer: rng => {
        const pas = choisir(rng, p.pas)
        const desc = p.sens === 'decroissant' || (p.sens === 'les2' && rng() < 0.5)
        const d = choisir(rng, debuts[pas])
        const termes = plage(0, 5).map(k => d + k * pas)
        if (desc) termes.reverse()
        // on garde les deux premiers (pour voir le pas), deux cases parmi les quatre suivants
        const trous = melangerAvec(rng, [2, 3, 4, 5]).slice(0, 2).sort()
        const t = termes.map((n, i) => trous.includes(i) ? B : nb(n)).join(' – ')
        return calc(t, ...trous.map(i => termes[i]))
      } }
    },
  },
]

function PLAGES() {
  return [
    { v: '10', label: jusqua(10) },
    { v: '20', label: jusqua(20) },
    { v: '100s', label: 'plage_100s' },
    { v: '100r', label: 'plage_100r' },
    { v: '1000', label: jusqua(1000) },
  ]
}
const titrePlage = (v, T) => T.t(`plage_${v}`)

export const typeParId = id => TYPES.find(t => t.id === id)
export const paramsDefaut = () => Object.fromEntries(TYPES.map(t => [t.id, Object.fromEntries(t.params.map(p => [p.id, p.defaut]))]))

// Présélections par niveau (programmes 2024)
export const PRESETS_NIVEAU = {
  cp: { types: ['addition', 'soustraction', 'complements', 'doubles'], params: {
    addition: { plage: '10' }, soustraction: { plage: '10' }, complements: { cibles: ['10'] },
    doubles: { quoi: 'les2', plages: ['10'] }, tablesAdd: { plage: '10', forme: 'somme' }, dixCent: { ops: ['+10', '-10'], plage: '100' },
    suites: { pas: [2, 5, 10], sens: 'croissant' },
  } },
  ce1: { types: ['tables', 'addition', 'soustraction', 'complements', 'doubles'], params: {
    tables: { tables: [2, 3, 4, 5, 10], forme: 'produit', ordre: 'melange' }, addition: { plage: '100s' }, soustraction: { plage: '100s' },
    complements: { cibles: ['dizaine', '100d'] }, doubles: { quoi: 'les2', plages: ['20', 'ronds'] }, tablesAdd: { plage: '20', forme: 'mixte' },
    dixCent: { ops: ['+10', '-10', '+100', '-100', 'x10'], plage: '100' }, neufOnze: { ops: ['+9', '+11'], plage: '100' },
    suites: { pas: [2, 5, 10, 100], sens: 'les2' },
  } },
  ce2: { types: ['tables', 'addition', 'soustraction', 'complements', 'division'], params: {
    tables: { tables: [2, 3, 4, 5, 6, 7, 8, 9], forme: 'mixte', ordre: 'melange' }, addition: { plage: '100r' }, soustraction: { plage: '100r' },
    complements: { cibles: ['100', '1000'] }, doubles: { quoi: 'les2', plages: ['100', 'ronds'] }, dixCent: { ops: ['x10', 'x100', '+100', '-100'], plage: '1000' },
    neufOnze: { ops: ['+9', '-9', '+11', '-11'], plage: '1000' }, division: { tables: [2, 3, 4, 5, 6, 7, 8, 9], forme: 'combien' },
    suites: { pas: [25, 50, 100], sens: 'les2' },
  } },
  cm1: { types: ['tables', 'addition', 'soustraction', 'dixCent', 'division'], params: {
    tables: { tables: [6, 7, 8, 9], forme: 'mixte', ordre: 'melange' }, addition: { plage: '1000' }, soustraction: { plage: '1000' },
    complements: { cibles: ['100', '1000'] }, doubles: { quoi: 'les2', plages: ['ronds'] }, dixCent: { ops: ['x10', 'x100'], plage: '1000' },
    neufOnze: { ops: ['+9', '-9', '+11', '-11'], plage: '1000' }, division: { tables: [2, 3, 4, 5, 6, 7, 8, 9], forme: 'signe' },
    suites: { pas: [25, 50, 100], sens: 'les2' },
  } },
  cm2: { types: ['tables', 'addition', 'soustraction', 'dixCent', 'division'], params: {
    tables: { tables: [6, 7, 8, 9], forme: 'facteur', ordre: 'melange' }, addition: { plage: '1000' }, soustraction: { plage: '1000' },
    complements: { cibles: ['100', '1000'] }, doubles: { quoi: 'les2', plages: ['ronds'] }, dixCent: { ops: ['x10', 'x100'], plage: '10000' },
    neufOnze: { ops: ['+9', '-9', '+11', '-11'], plage: '1000' }, division: { tables: [3, 4, 6, 7, 8, 9], forme: 'reste' },
    suites: { pas: [25, 50, 100], sens: 'les2' },
  } },
}

export const NB_CALCULS = [20, 30, 40, 60]
export const TAILLES = [
  { id: 'grande', label: 'taille_grande', ligne: 17 },
  { id: 'moyenne', label: 'taille_moyenne', ligne: 13.5 },
  { id: 'petite', label: 'taille_petite', ligne: 10.5 },
]
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
  mode: 'fiche',              // 'fiche' | 'affiche'
  langue: 'fr',               // langue du document : 'fr' | 'br'
  niveau: 'ce1',
  types: ['tables'],
  params: paramsDefaut(),
  melanger: true,
  nb: 30,
  colonnes: 2,
  taille: 'moyenne',
  reponse: 'pointilles',      // 'pointilles' | 'cases'
  enTete: true,               // ligne Prénom / Date
  score: true,                // case « … / 30 » en haut à droite
  corrige: false,             // 'non' | 'page' (pages de corrigé) | 'dessous' (en bas, à l'envers) ; true = 'page', false = 'non'
  titre: '',
  seed: null,                 // null → graine au hasard
  // affiches
  affiche: 'multiplication',
  disposition: 'toutes',
  tablesAffiche: plage(1, 10),
  format: 'A4',
  orientation: 'portrait',
}

// Corrigé : true / false (fiches du catalogue, anciennes sauvegardes) ou les choix des options communes des fiches
const CHOIX_CORRIGE = ['non', 'page', 'dessous']
const modeCorrige = v => (v === true ? 'page' : CHOIX_CORRIGE.includes(v) ? v : 'non')

// Complète une config partielle (sauvegarde ancienne, fiche du catalogue…)
export function normaliserConfig(c = {}) {
  const d = paramsDefaut()
  const params = Object.fromEntries(TYPES.map(t => [t.id, { ...d[t.id], ...(c.params?.[t.id] ?? {}) }]))
  // valeurs inconnues → défaut
  for (const t of TYPES) for (const p of t.params) {
    const valides = p.options.map(o => o.v)
    const v = params[t.id][p.id]
    if (p.multi) {
      const ok = Array.isArray(v) ? v.filter(x => valides.includes(x)) : []
      params[t.id][p.id] = ok.length ? ok : [...p.defaut]
    } else if (!valides.includes(v)) params[t.id][p.id] = p.defaut
  }
  const types = (Array.isArray(c.types) ? c.types : DEFAUTS.types).filter(id => typeParId(id))
  return {
    ...DEFAUTS, ...c, params,
    types: types.length ? types : [...DEFAUTS.types],
    nb: NB_CALCULS.includes(+c.nb) ? +c.nb : (+c.nb > 0 ? Math.min(100, Math.floor(+c.nb)) : DEFAUTS.nb),
    colonnes: [2, 3].includes(+c.colonnes) ? +c.colonnes : DEFAUTS.colonnes,
    taille: TAILLES.some(t => t.id === c.taille) ? c.taille : DEFAUTS.taille,
    langue: LANGUES_DOCUMENT.includes(c.langue) ? c.langue : DEFAUTS.langue,
    corrige: modeCorrige(c.corrige),
    tablesAffiche: Array.isArray(c.tablesAffiche) && c.tablesAffiche.length
      ? c.tablesAffiche.filter(n => n >= 1 && n <= 10) : [...DEFAUTS.tablesAffiche],
  }
}

// ── Tirage des calculs d'une fiche (sans doublon) ──
// Renvoie { groupes: [{ type, titre, calculs }], calculs (dans l'ordre de la fiche), demandes, seed }
export function tirerCalculs(config) {
  const c = normaliserConfig(config)
  const seed = c.seed ?? graineAleatoire()
  const rng = mulberry32(seed)
  const vus = new Set()
  const T = textes(c.langue)

  const sources = c.types.map(id => {
    const type = typeParId(id), p = c.params[id]
    const src = type.source(p, T)
    const file = src.tous ? (src.ordonne ? src.tous : melangerAvec(rng, src.tous)) : null
    return { type, p, src, file, pos: 0, calculs: [], epuise: false }
  })
  // un calcul de plus pour ce type (null s'il n'y en a plus de nouveaux)
  function suivant(s) {
    if (s.epuise) return null
    if (s.file) {
      while (s.pos < s.file.length) {
        const x = s.file[s.pos++]
        if (!vus.has(x.t)) return x
      }
    } else {
      for (let essai = 0; essai < 300; essai++) {
        const x = s.src.tirer(rng)
        if (x && !vus.has(x.t)) return x
      }
    }
    s.epuise = true
    return null
  }
  // répartition équitable, puis on comble avec les types qui ont encore des calculs
  const quota = sources.map((_, i) => Math.floor(c.nb / sources.length) + (i < c.nb % sources.length ? 1 : 0))
  sources.forEach((s, i) => {
    while (s.calculs.length < quota[i]) {
      const x = suivant(s)
      if (!x) break
      vus.add(x.t); s.calculs.push({ ...x, type: s.type.id })
    }
  })
  let total = sources.reduce((n, s) => n + s.calculs.length, 0)
  while (total < c.nb && sources.some(s => !s.epuise)) {
    for (const s of sources) {
      if (total >= c.nb) break
      const x = suivant(s)
      if (x) { vus.add(x.t); s.calculs.push({ ...x, type: s.type.id }); total++ }
    }
  }
  // « dans l'ordre » : on garde l'ordre de la table ; sinon on remet dans l'ordre de tirage mélangé
  for (const s of sources) if (s.src.ordonne) {
    const rang = new Map(s.file.map((x, i) => [x.t, i]))
    s.calculs.sort((a, b) => rang.get(a.t) - rang.get(b.t))
  }
  const groupes = sources.filter(s => s.calculs.length).map(s => ({ type: s.type.id, titre: s.type.titre(s.p, T), calculs: s.calculs }))
  let calculs
  if (c.melanger && groupes.length > 1) {
    const ordonnes = sources.filter(s => s.src.ordonne).flatMap(s => s.calculs)
    calculs = [...ordonnes, ...melangerAvec(rng, sources.filter(s => !s.src.ordonne).flatMap(s => s.calculs))]
  } else calculs = groupes.flatMap(g => g.calculs)
  return { groupes, calculs, demandes: c.nb, seed, config: c }
}

// ── Mise en page ──
const MARGE = 12
const COULEURS = ['#e74c3c', '#e67e22', '#d4a00f', '#2ecc71', '#1abc9c', '#3498db', '#9b59b6', '#e84393', '#795548', '#607d8b']

function texteCalcul(x, corrige, largeurCase) {
  let i = 0
  return echapper(x.t).split(B).map((morceau, k, tout) => {
    if (k === tout.length - 1) return morceau
    const r = x.r[i++]
    return `${morceau}<span class="case" style="width:${largeurCase}em">${corrige ? `<b>${nb(r)}</b>` : ''}</span>`
  }).join('')
}

// ── Corrigé compact « en bas, à l'envers » (à découper ou à plier) ──
const CLE_TAILLE = 3.6        // taille du texte (mm)
const CLE_LIGNE = CLE_TAILLE * 1.5
const CLE_TITRE = 6, CLE_COUPE = 9
const CSS_CLE = `
  .cle { margin-top: auto; flex: none; }
  .coupe { height: ${CLE_COUPE}mm; position: relative; }
  .coupe::before { content: ''; position: absolute; left: 0; right: 0; top: 50%; border-top: 0.4mm dashed #999; }
  .coupe::after { content: '✂'; position: absolute; left: 0; top: 50%; transform: translateY(-55%); background: white;
    padding-right: 1mm; color: #777; font-size: 4mm; line-height: 1; }
  .cle-corps { transform: rotate(180deg); color: #444; }
  .cle-titre { height: ${CLE_TITRE}mm; font-size: 4mm; font-weight: 700; display: flex; align-items: center; }
  .cle-grille { display: grid; font-size: ${CLE_TAILLE}mm; line-height: ${CLE_LIGNE}mm; }
  .cle-grille span { white-space: nowrap; overflow: hidden; }
  .cle-grille i { font-style: normal; color: #9aa3ad; }`

// calculs numérotés (x.n) → { h (mm), html(titre) }
function cleCorrige(calculs, largeur, police) {
  const reponse = x => x.r.map(nb).join(' ; ')
  const lMax = Math.max(...calculs.map(x => largeurTexte(`${x.n}. ${reponse(x)}`, police, true))) * CLE_TAILLE + 4
  const parRang = Math.max(1, Math.floor(largeur / lMax))
  const rangs = Math.ceil(calculs.length / parRang)
  const h = CLE_COUPE + CLE_TITRE + rangs * CLE_LIGNE + 1
  const html = titre => `<div class="cle" style="height:${h}mm"><div class="coupe"></div><div class="cle-corps">
      <div class="cle-titre">${echapper(titre)}</div>
      <div class="cle-grille" style="grid-template-columns:repeat(${parRang}, ${largeur / parRang}mm)">${
        calculs.map(x => `<span><i>${x.n}.</i> <b>${echapper(reponse(x))}</b></span>`).join('')}</div></div></div>`
  return { h, html }
}

function genererFiche(c, polices) {
  const police = polices.script
  const tirage = tirerCalculs(c)
  const cfg = tirage.config
  const T = textes(cfg.langue)
  const { w, h } = dimensionsPage('A4', 'portrait')
  const titre = cfg.titre || (tirage.groupes.length === 1 ? tirage.groupes[0].titre : T.t('calculMental'))
  const N = tirage.calculs.length
  const cols = cfg.colonnes
  const taille = TAILLES.find(t => t.id === cfg.taille)

  // largeur des cases : selon la plus longue réponse du même type de calcul
  const largeurCase = {}
  for (const x of tirage.calculs) {
    const l = Math.max(2.2, Math.max(...x.r.map(r => nb(r).length)) * 0.62 + 1)
    largeurCase[x.type] = Math.max(largeurCase[x.type] ?? 0, l)
  }
  const largeurNumero = 2.2 // em, à 0,55 × F
  const wColonne = n => (w - 2 * MARGE - (n - 1) * 6) / n
  // largeur d'un calcul (en em) en remplaçant les cases par leur largeur
  const largeurCalcul = x => {
    const brut = x.t.split(B)
    return brut.reduce((s, m) => s + largeurTexte(m, police), 0) + (brut.length - 1) * (largeurCase[x.type] + 0.3)
  }
  const taillePossible = (x, n, F) => Math.min(F, (wColonne(n) - largeurNumero * 0.55 * F - 3) / largeurCalcul(x))

  // lignes : groupes (titre + calculs) ou tout mélangé
  const blocs = cfg.melanger || tirage.groupes.length === 1
    ? [{ titre: null, calculs: tirage.calculs }]
    : tirage.groupes
  const F0 = taille.ligne * 0.5
  let numero = 0
  const lignes = []
  for (const b of blocs) {
    if (b.titre && blocs.length > 1) lignes.push({ titre: b.titre })
    const numerotes = b.calculs.map(x => ({ ...x, n: ++numero }))
    // calculs longs (suites, divisions avec reste…) : moins de colonnes pour ce groupe
    let n = cols
    if (blocs.length > 1) while (n > 1 && Math.min(...numerotes.map(x => taillePossible(x, n, F0))) < F0 * 0.7) n--
    for (let k = 0; k < numerotes.length; k += n) lignes.push({ calculs: numerotes.slice(k, k + n), cols: n })
  }

  const avecEnTete = cfg.enTete || cfg.score
  const hTitre = 13, hEnTete = avecEnTete ? 11 : 0, hGroupe = 9
  const hPage = h - 2 * MARGE - hTitre - hEnTete - 4
  const nbG = lignes.filter(l => l.titre).length, nbL = Math.max(1, lignes.length - nbG)
  const besoin = R => nbL * R + nbG * hGroupe

  // hauteur des lignes et découpage en pages pour une hauteur disponible donnée
  function mettreEnPage(hDispo) {
    let R = taille.ligne, paginer = false
    if (besoin(R) <= hDispo) R = Math.min(R * 1.5, (hDispo - nbG * hGroupe) / nbL)
    else if (besoin(R * 0.7) <= hDispo) R = (hDispo - nbG * hGroupe) / nbL
    else { paginer = true; R *= 0.85 }
    const pagesLignes = [[]]
    let hCourant = 0
    for (const l of lignes) {
      const hl = l.titre ? hGroupe : R
      if (paginer && hCourant + hl > hDispo + 0.01 && pagesLignes.at(-1).length) {
        pagesLignes.push([]); hCourant = 0
      }
      pagesLignes.at(-1).push(l); hCourant += hl
    }
    // pas de titre de groupe seul en bas de page
    for (let i = 0; i < pagesLignes.length - 1; i++) {
      const p = pagesLignes[i]
      if (p.at(-1)?.titre) pagesLignes[i + 1].unshift(p.pop())
    }
    const hDerniere = pagesLignes.at(-1).reduce((s, l) => s + (l.titre ? hGroupe : R), 0)
    return { R, paginer, pagesLignes, libre: hDispo - hDerniere }
  }

  // corrigé « en bas, à l'envers » : réponses numérotées en grille, sous une ligne de coupe
  const cle = cfg.corrige === 'dessous' ? cleCorrige(lignes.flatMap(l => l.calculs ?? []), w - 2 * MARGE, police) : null
  let miseEnPage = mettreEnPage(hPage)
  let clePage = 'aucune' // 'derniere' (en bas de la dernière page) | 'suivante' (page en plus)
  if (cle) {
    // d'abord : tout sur la même page en réduisant les lignes ; sinon en bas de la dernière page s'il reste
    // de la place ; sinon sur une page en plus
    const reduite = mettreEnPage(hPage - cle.h)
    if (!reduite.paginer) { miseEnPage = reduite; clePage = 'derniere' }
    else clePage = miseEnPage.libre >= cle.h ? 'derniere' : 'suivante'
  }
  const { R, pagesLignes } = miseEnPage
  const F = Math.min(taille.ligne, R) * 0.5   // taille des chiffres (mm)

  function cellule(x, n, corrige) {
    const f = taillePossible(x, n, F)
    return `<div class="calc"><span class="num" style="font-size:${F * 0.55}mm;width:${largeurNumero * F * 0.55}mm">${x.n}</span>`
      + `<span class="txt" style="font-size:${f}mm">${texteCalcul(x, corrige, largeurCase[x.type])}</span></div>`
  }
  function page(ls, corrige, k, avecCle = false) {
    const prenomDate = cfg.enTete ? `
      <span>${T.t('prenom')} : <i class="pointilles" style="width:52mm"></i></span>
      <span>${T.t('date')} : <i class="pointilles" style="width:32mm"></i></span>` : ''
    const score = cfg.score ? `
      <span class="score"${cfg.enTete ? '' : ' style="margin-left:auto"'}>${corrige ? '' : `<i class="pointilles" style="width:12mm"></i> / ${N}`}</span>` : ''
    const enTete = avecEnTete && !corrige ? `<div class="entete" style="height:${hEnTete}mm">${prenomDate}${score}</div>` : ''
    const suite = pagesLignes.length > 1 ? ` <small>(${k + 1}/${pagesLignes.length})</small>` : ''
    return `<div class="contenu" style="inset:${MARGE}mm">
      <h1 style="height:${hTitre}mm">${corrige ? `<span class="rouge">${T.t('corrige')}</span> — ` : ''}${echapper(titre)}${suite}</h1>
      ${enTete}
      ${ls.map(l => l.titre
        ? `<div class="groupe" style="height:${hGroupe}mm">${echapper(l.titre)}</div>`
        : `<div class="rang" style="height:${R}mm">${l.calculs.map(x => `<div class="cell" style="width:${wColonne(l.cols)}mm">${cellule(x, l.cols, corrige)}</div>`).join('')
          }${`<div class="cell vide" style="width:${wColonne(l.cols)}mm"></div>`.repeat(l.cols - l.calculs.length)}</div>`).join('')}${
        avecCle ? cle.html(`${T.t('corrige')} — ${titre}`) : ''}
      </div>`
  }
  const pages = pagesLignes.map((ls, k) => page(ls, false, k, clePage === 'derniere' && k === pagesLignes.length - 1))
  if (clePage === 'suivante') pages.push(`<div class="contenu" style="inset:${MARGE}mm">${cle.html(`${T.t('corrige')} — ${titre}`)}</div>`)
  if (cfg.corrige === 'page') pages.push(...pagesLignes.map((ls, k) => page(ls, true, k)))

  const html = documentImpression({
    titre, format: 'A4', orientation: 'portrait', pages,
    css: `body { font-family: '${police}', Arial, sans-serif; }
  .contenu { position: absolute; display: flex; flex-direction: column; }
  h1 { font-size: 7.5mm; font-weight: 700; text-align: center; line-height: 1; display: flex; align-items: center; justify-content: center; gap: 2mm; flex: none; }
  h1 small { font-size: .55em; color: #888; font-weight: 400; }
  .rouge { color: #c0392b; }
  .entete { display: flex; align-items: center; justify-content: space-between; font-size: 4.6mm; flex: none;
    border-bottom: 0.5mm solid #4a90e2; margin-bottom: 4mm; }
  .pointilles { display: inline-block; border-bottom: 0.35mm dotted #555; height: 1em; vertical-align: baseline; }
  .score { font-weight: 700; font-size: 5.5mm; border: 0.5mm solid #4a90e2; border-radius: 3mm; padding: .5mm 3mm; }
  .score:empty { border: none; }
  .rang { display: flex; gap: 6mm; flex: none; }
  .cell { display: flex; flex: none; align-items: center; border-bottom: 0.25mm solid #e3e6ec; min-width: 0; }
  .cell.vide { border-bottom-color: transparent; }
  .calc { display: flex; align-items: center; white-space: nowrap; min-width: 0; }
  .num { color: #9aa3ad; text-align: right; padding-right: 1.6mm; flex: none; }
  .txt { line-height: 1; letter-spacing: .01em; }
  .case { display: inline-flex; align-items: flex-end; justify-content: center; vertical-align: -0.25em; height: 1.3em;
    margin: 0 .15em; color: #c0392b; line-height: 1;
    ${cfg.reponse === 'cases'
      ? 'border: 0.35mm solid #555; border-radius: 1.2mm; background: #fff;'
      : 'border-bottom: 0.55mm dotted #333;'} }
  .case b { font-weight: 700; padding-bottom: .12em; }
  .groupe { display: flex; flex: none; align-items: flex-end; font-weight: 700; font-size: 4.8mm; color: #e07a1f;
    border-bottom: 0.4mm solid #e07a1f; padding-bottom: .8mm; }${cle ? CSS_CLE : ''}`,
  })
  return { html, nbPages: pages.length, format: 'A4', orientation: 'portrait', nbCalculs: N, demandes: tirage.demandes, seed: tirage.seed }
}

// ── Affiches des tables ──
function genererAffiche(cfg, polices) {
  const police = polices.script
  const mult = cfg.affiche !== 'addition'
  const op = mult ? '×' : '+'
  const f = (a, b) => mult ? a * b : a + b
  const tables = [...cfg.tablesAffiche].sort((a, b) => a - b)
  const { w, h } = dimensionsPage(cfg.format, cfg.orientation)
  const T = textes(cfg.langue)
  const titre = cfg.titre || T.t(mult ? 'afficheMult' : 'afficheAdd')
  const echelle = cfg.format === 'A3' ? 1.41 : 1
  const marge = MARGE * echelle
  const hTitre = 14 * echelle
  const wD = w - 2 * marge, hD = h - 2 * marge - hTitre
  const couleur = t => COULEURS[(t - 1) % COULEURS.length]

  // une ligne de table : 7 × 3 = 21 (colonnes alignées)
  const ligne = (t, k, fs) => `<div class="tl" style="font-size:${fs}mm"><span>${t}</span><span>${op}</span><span>${k}</span><span>=</span><b>${f(t, k)}</b></div>`
  const wLigne = 1.3 + 1 + 1.3 + 1 + 2.2 + 0.4
  const bloc = (t, bw, bh) => {
    const fs = Math.min((bh / 11.6) * 0.72, (bw - 4) / wLigne)
    return `<div class="bloc" style="width:${bw}mm;height:${bh}mm;border-color:${couleur(t)}">
      <div class="bt" style="background:${couleur(t)};font-size:${fs * 1.05}mm;height:${bh / 11.6 * 1.4}mm">${echapper(T.t('tableAffiche', { t }))}</div>
      <div class="bl">${plage(1, 10).map(k => ligne(t, k, fs)).join('')}</div></div>`
  }

  let pages
  if (cfg.disposition === 'une') {
    pages = tables.map(t => `<div class="contenu" style="inset:${marge}mm">${bloc(t, wD, h - 2 * marge)}</div>`)
  } else if (cfg.disposition === 'grille') {
    // tableau à double entrée
    const de = mult ? 1 : 0
    const nums = plage(de, 10)
    const n = nums.length + 1
    const cote = Math.min(wD / n, hD / n)
    const fs = cote * 0.42
    const cell = (contenu, cls, style = '') => `<div class="gc ${cls}" style="width:${cote}mm;height:${cote}mm;${style}">${contenu}</div>`
    let g = cell(op, 'coin')
    nums.forEach(b => { g += cell(b, 'tete', `background:${couleur(b || 10)}`) })
    nums.forEach(a => {
      g += cell(a, 'tete', `background:${couleur(a || 10)}`)
      nums.forEach(b => { g += cell(f(a, b), a === b ? 'diag' : (a + b) % 2 ? '' : 'pair') })
    })
    pages = [`<div class="contenu" style="inset:${marge}mm;justify-content:center"><h1 style="height:${hTitre}mm;font-size:${hTitre * 0.6}mm">${echapper(titre)}</h1>
      <div class="grillep" style="grid-template-columns:repeat(${n}, ${cote}mm);font-size:${fs}mm">${g}</div></div>`]
  } else {
    // toutes les tables sur une page : on choisit la grille qui donne le plus gros texte
    let best = null
    const ecart = 4 * echelle
    for (let cols = 1; cols <= tables.length; cols++) {
      const rangs = Math.ceil(tables.length / cols)
      const bw = (wD - (cols - 1) * ecart) / cols, bh = (hD - (rangs - 1) * ecart) / rangs
      const fs = Math.min((bh / 11.6) * 0.72, (bw - 4) / wLigne)
      if (!best || fs > best.fs) best = { cols, bw, bh, fs }
    }
    pages = [`<div class="contenu" style="inset:${marge}mm"><h1 style="height:${hTitre}mm;font-size:${hTitre * 0.6}mm">${echapper(titre)}</h1>
      <div class="blocs" style="grid-template-columns:repeat(${best.cols}, ${best.bw}mm);gap:${ecart}mm">${tables.map(t => bloc(t, best.bw, best.bh)).join('')}</div></div>`]
  }

  const html = documentImpression({
    titre, format: cfg.format, orientation: cfg.orientation, pages,
    css: `body { font-family: '${police}', Arial, sans-serif; }
  .contenu { position: absolute; display: flex; flex-direction: column; align-items: center; }
  h1 { font-weight: 700; text-align: center; line-height: 1; display: flex; align-items: center; flex: none; }
  .blocs { display: grid; }
  .bloc { border: 0.6mm solid; border-radius: 3mm; overflow: hidden; display: flex; flex-direction: column; background: white; }
  .bt { color: white; font-weight: 700; display: flex; align-items: center; justify-content: center; flex: none; }
  .bl { flex: 1; display: flex; flex-direction: column; justify-content: space-evenly; align-items: center; }
  .tl { display: grid; grid-template-columns: 1.3em 1em 1.3em 1em 2.2em; text-align: center; line-height: 1.1; }
  .tl span:first-child { text-align: right; }
  .tl b { text-align: right; color: #1d4e9e; }
  .grillep { display: grid; border: 0.5mm solid #444; }
  .gc { display: flex; align-items: center; justify-content: center; border: 0.15mm solid #b8bec7; }
  .gc.tete { color: white; font-weight: 700; }
  .gc.coin { background: #444; color: white; font-weight: 700; }
  .gc.pair { background: #f3f6fa; }
  .gc.diag { background: #fff3cd; font-weight: 700; }`,
  })
  return { html, nbPages: pages.length, format: cfg.format, orientation: cfg.orientation }
}

// polices = { script } : famille à utiliser (déjà chargée)
// config.langue : langue du document ('fr' par défaut, 'br') ; les nombres tirés n'en dépendent pas
export function genererCalcul(config, polices) {
  const c = normaliserConfig(config)
  const r = c.mode === 'affiche' ? genererAffiche(c, polices) : genererFiche(c, polices)
  // documentImpression écrit lang="fr" : on indique la vraie langue du document
  return { ...r, html: r.html.replace('<html lang="fr">', `<html lang="${c.langue}">`) }
}

// ── Fiches toutes prêtes (PDF générés au build) ──
const fiche = (types, params, extra = {}) => ({ ...DEFAUTS, mode: 'fiche', types, params, nb: 30, colonnes: 2, taille: 'moyenne', corrige: true, ...extra })
const affiche = extra => ({ ...DEFAUTS, mode: 'affiche', corrige: false, seed: 1, ...extra })
// titre court, titre et description : catalogues contenu/calcul-fiches.js, clés « <id>_court »… (id = slug,
// ou « tableSeule » avec des paramètres pour les fiches d'une seule table)
const tableSeule = t => ({
  slug: `fiche-table-de-multiplication-${t}`,
  cleTextes: 'tableSeule', params: { t, produit: t * 6 },
  niveaux: t <= 5 || t === 10 ? 'CE1 · CE2' : 'CE2 · CM1',
  config: fiche(['tables'], { tables: { tables: [t], forme: 'mixte', ordre: 'melange' } }, { nb: 30, seed: 100 + t }),
})

const FICHES = [
  ...plage(2, 10).map(tableSeule),
  {
    slug: 'fiche-tables-de-multiplication-2-a-5',
    niveaux: 'CE1 · CE2',
    config: fiche(['tables'], { tables: { tables: [2, 3, 4, 5], forme: 'mixte', ordre: 'melange' } }, { nb: 40, seed: 2345 }),
  },
  {
    slug: 'fiche-tables-de-multiplication-6-a-9',
    niveaux: 'CE2 · CM1 · CM2',
    config: fiche(['tables'], { tables: { tables: [6, 7, 8, 9], forme: 'mixte', ordre: 'melange' } }, { nb: 40, seed: 6789 }),
  },
  {
    slug: 'fiche-toutes-les-tables-de-multiplication',
    niveaux: 'CE2 · CM1 · CM2',
    config: fiche(['tables'], { tables: { tables: plage(2, 10), forme: 'produit', ordre: 'melange' } }, { nb: 60, colonnes: 3, seed: 2100 }),
  },
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
  {
    slug: 'fiche-tables-d-addition-cp',
    niveaux: 'CP',
    config: fiche(['tablesAdd'], { tablesAdd: { plage: '10', forme: 'mixte' } }, { taille: 'grande', nb: 30, seed: 1010 }),
  },
  {
    slug: 'fiche-complements-a-10',
    niveaux: 'CP · CE1',
    config: fiche(['complements'], { complements: { cibles: ['10'] } }, { nb: 18, taille: 'grande', seed: 1000 }),
  },
  {
    slug: 'fiche-complements-a-100',
    niveaux: 'CE1 · CE2',
    config: fiche(['complements'], { complements: { cibles: ['100d', '100'] } }, { nb: 30, seed: 1100 }),
  },
  {
    slug: 'fiche-complements-dizaine-superieure',
    niveaux: 'CP · CE1',
    config: fiche(['complements'], { complements: { cibles: ['dizaine'] } }, { nb: 30, seed: 1200 }),
  },
  {
    slug: 'fiche-doubles-et-moities-cp',
    niveaux: 'CP',
    config: fiche(['doubles'], { doubles: { quoi: 'les2', plages: ['10'] } }, { nb: 20, taille: 'grande', seed: 1300 }),
  },
  {
    slug: 'fiche-doubles-et-moities-ce1',
    niveaux: 'CE1 · CE2',
    config: fiche(['doubles'], { doubles: { quoi: 'les2', plages: ['20', 'ronds'] } }, { nb: 30, seed: 1400 }),
  },
  {
    slug: 'fiche-additions-jusqu-a-20',
    niveaux: 'CP · CE1',
    config: fiche(['addition'], { addition: { plage: '20' } }, { nb: 30, seed: 1500 }),
  },
  {
    slug: 'fiche-additions-soustractions-ce1',
    niveaux: 'CE1',
    config: fiche(['addition', 'soustraction'], { addition: { plage: '100s' }, soustraction: { plage: '100s' } }, { nb: 30, seed: 1600 }),
  },
  {
    slug: 'fiche-ajouter-retirer-10',
    niveaux: 'CP · CE1',
    config: fiche(['dixCent'], { dixCent: { ops: ['+10', '-10'], plage: '100' } }, { nb: 30, seed: 1700 }),
  },
  {
    slug: 'fiche-multiplier-par-10-et-100',
    niveaux: 'CE2 · CM1',
    config: fiche(['dixCent'], { dixCent: { ops: ['x10', 'x100'], plage: '1000' } }, { nb: 30, seed: 1800 }),
  },
  {
    slug: 'fiche-ajouter-retirer-9-11',
    niveaux: 'CE1 · CE2',
    config: fiche(['neufOnze'], { neufOnze: { ops: ['+9', '-9', '+11', '-11'], plage: '100' } }, { nb: 30, seed: 1900 }),
  },
  {
    slug: 'fiche-divisions-combien-de-fois',
    niveaux: 'CE2',
    config: fiche(['division'], { division: { tables: [2, 3, 4, 5, 10], forme: 'combien' } }, { nb: 20, seed: 2000 }),
  },
  {
    slug: 'fiche-divisions-tables-cm1',
    niveaux: 'CM1 · CM2',
    config: fiche(['division'], { division: { tables: plage(2, 9), forme: 'signe' } }, { nb: 40, seed: 2200 }),
  },
  {
    slug: 'fiche-suites-de-nombres',
    niveaux: 'CP · CE1',
    config: fiche(['suites'], { suites: { pas: [2, 5, 10], sens: 'les2' } }, { nb: 20, seed: 2300 }),
  },
  {
    slug: 'fiche-calcul-mental-ce1',
    niveaux: 'CE1',
    config: fiche(PRESETS_NIVEAU.ce1.types, PRESETS_NIVEAU.ce1.params, { nb: 40, seed: 2400 }),
  },
]

// Chaque fiche existe en français et en breton (écoles bilingues) : mêmes calculs (même graine), textes
// dans la langue du document.
const SUFFIXE_SLUG = { fr: '', br: '-brezhoneg' }
function textesFiche(cle, params, langue) {
  const C = contenu({ fr: fichesFr, br: fichesBr }, langue)
  return { court: C.t(`${cle}_court`, params), titre: C.t(`${cle}_titre`, params), description: C.t(`${cle}_description`, params) }
}

export const TELECHARGEMENTS_CALCUL = FICHES.flatMap(({ cleTextes, params, ...e }) => LANGUES_DOCUMENT.map(langue => ({
  ...e,
  ...textesFiche(cleTextes ?? e.slug, params, langue),
  slug: e.slug + SUFFIXE_SLUG[langue],
  langues: [langue],
  config: { ...e.config, langue },
}))).map(e => ({ ...e, categorie: 'calcul', type: 'calcul', lien: `/imprimer/calcul?mode=${e.config.mode}` }))
