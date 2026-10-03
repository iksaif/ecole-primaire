// Fiches de calcul à imprimer (calcul mental, tables, compléments…) et affiches des tables —
// partagé par l'app et le build des PDF. Programmes 2024 du cycle 2 et 3 (CP → CM2).
// Tirage déterministe : même graine (config.seed) → exactement la même fiche.
import { largeurTexte, dimensionsPage, documentImpression, echapper } from '../utils/impression'

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

// ── Types de calcul ──
// params : options propres au type (choix unique, ou multi = plusieurs valeurs possibles)
// source(p) → { tous: [...] } (liste finie) ou { tirer: rng => calcul } (tirage au hasard)
const TABLES = plage(1, 10).map(n => ({ v: n, label: String(n) }))

export const TYPES = [
  {
    id: 'tables', label: '✖️ Tables de multiplication', niveaux: ['ce1', 'ce2', 'cm1', 'cm2'],
    params: [
      { id: 'tables', label: 'Tables', multi: true, options: TABLES, defaut: [2, 3, 4, 5] },
      { id: 'forme', label: 'Calcul', options: [
        { v: 'produit', label: '7 × 6 = …' }, { v: 'facteur', label: 'Facteur manquant 7 × … = 42' }, { v: 'mixte', label: 'Les deux' },
      ], defaut: 'produit' },
      { id: 'ordre', label: 'Ordre', options: [{ v: 'melange', label: 'Mélangées' }, { v: 'ordre', label: "Dans l'ordre" }], defaut: 'melange' },
    ],
    titre: p => p.tables.length === 1 ? `Table de ${p.tables[0]}` : `Tables de ${listeEt(p.tables)}`,
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
    id: 'tablesAdd', label: "➕ Tables d'addition", niveaux: ['cp', 'ce1'],
    params: [
      { id: 'plage', label: 'Résultats', options: [{ v: '10', label: 'jusqu\'à 10' }, { v: '20', label: 'jusqu\'à 20 (10 + 10)' }], defaut: '10' },
      { id: 'forme', label: 'Calcul', options: [
        { v: 'somme', label: '4 + 3 = …' }, { v: 'manquant', label: 'Terme manquant 4 + … = 7' }, { v: 'mixte', label: 'Les deux' },
      ], defaut: 'somme' },
    ],
    titre: p => `Tables d'addition (résultats jusqu'à ${p.plage})`,
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
    id: 'addition', label: '➕ Additions', niveaux: ['cp', 'ce1', 'ce2', 'cm1', 'cm2'],
    params: [{ id: 'plage', label: 'Nombres', options: PLAGES('addition'), defaut: '20' }],
    titre: p => `Additions ${PLAGES('addition').find(o => o.v === p.plage).titre}`,
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
    id: 'soustraction', label: '➖ Soustractions', niveaux: ['cp', 'ce1', 'ce2', 'cm1', 'cm2'],
    params: [{ id: 'plage', label: 'Nombres', options: PLAGES('soustraction'), defaut: '20' }],
    titre: p => `Soustractions ${PLAGES('soustraction').find(o => o.v === p.plage).titre}`,
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
    id: 'complements', label: '🎯 Compléments', niveaux: ['cp', 'ce1', 'ce2', 'cm1'],
    params: [{ id: 'cibles', label: 'Compléments', multi: true, options: [
      { v: '10', label: 'à 10' }, { v: '20', label: 'à 20' }, { v: 'dizaine', label: 'à la dizaine (37 + … = 40)' },
      { v: '100d', label: 'à 100 (dizaines : 30 + … = 100)' }, { v: '100', label: 'à 100 (37 + … = 100)' },
      { v: '1000', label: 'à 1 000 (centaines)' },
    ], defaut: ['10'] }],
    titre: p => `Compléments ${listeEt(p.cibles.map(c => ({ 10: 'à 10', 20: 'à 20', dizaine: 'à la dizaine', '100d': 'à 100', 100: 'à 100', 1000: 'à 1 000' })[c]).filter((x, i, t) => t.indexOf(x) === i))}`,
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
    id: 'doubles', label: '👯 Doubles et moitiés', niveaux: ['cp', 'ce1', 'ce2', 'cm1', 'cm2'],
    params: [
      { id: 'quoi', label: 'Calcul', options: [{ v: 'doubles', label: 'Doubles' }, { v: 'moities', label: 'Moitiés' }, { v: 'les2', label: 'Les deux' }], defaut: 'les2' },
      { id: 'plages', label: 'Nombres', multi: true, options: [
        { v: '10', label: 'Doubles jusqu\'à 10, moitiés jusqu\'à 20' }, { v: '20', label: 'Doubles jusqu\'à 20, moitiés jusqu\'à 40' },
        { v: 'ronds', label: 'Nombres ronds (15, 25, 30, 50…)' }, { v: '100', label: 'Doubles jusqu\'à 50, moitiés jusqu\'à 100' },
      ], defaut: ['10'] },
    ],
    titre: p => ({ doubles: 'Doubles', moities: 'Moitiés', les2: 'Doubles et moitiés' })[p.quoi],
    source(p) {
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
      if (p.quoi !== 'moities') D.forEach(n => l.push(calc(`double de ${nb(n)} = ${B}`, 2 * n)))
      if (p.quoi !== 'doubles') M.forEach(n => l.push(calc(`moitié de ${nb(n)} = ${B}`, n / 2)))
      return { tous: l }
    },
  },
  {
    id: 'dixCent', label: '🔟 + 10, − 10, × 10, × 100', niveaux: ['cp', 'ce1', 'ce2', 'cm1', 'cm2'],
    params: [
      { id: 'ops', label: 'Calculs', multi: true, options: [
        { v: '+10', label: '+ 10' }, { v: '-10', label: '− 10' }, { v: '+100', label: '+ 100' }, { v: '-100', label: '− 100' },
        { v: 'x10', label: '× 10' }, { v: 'x100', label: '× 100' },
      ], defaut: ['+10', '-10'] },
      { id: 'plage', label: 'Nombres', options: [
        { v: '100', label: 'jusqu\'à 100' }, { v: '1000', label: 'jusqu\'à 1 000' }, { v: '10000', label: 'jusqu\'à 10 000' },
      ], defaut: '100' },
    ],
    titre: p => `Calculer ${listeEt(p.ops.map(o => o.replace('x', '× ').replace('-', '− ').replace('+', '+ ')))}`,
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
      { id: 'ops', label: 'Calculs', multi: true, options: [
        { v: '+9', label: '+ 9' }, { v: '-9', label: '− 9' }, { v: '+11', label: '+ 11' }, { v: '-11', label: '− 11' },
      ], defaut: ['+9', '-9', '+11', '-11'] },
      { id: 'plage', label: 'Nombres', options: [{ v: '100', label: 'jusqu\'à 100' }, { v: '1000', label: 'jusqu\'à 1 000' }], defaut: '100' },
    ],
    titre: p => `Ajouter et retirer 9 et 11`,
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
    id: 'division', label: '➗ Divisions et partages', niveaux: ['ce2', 'cm1', 'cm2'],
    params: [
      { id: 'tables', label: 'Tables', multi: true, options: TABLES.filter(t => t.v >= 2), defaut: [2, 3, 4, 5] },
      { id: 'forme', label: 'Calcul', options: [
        { v: 'combien', label: 'Combien de fois 6 dans 42 ?' }, { v: 'partage', label: '42 partagé en 6' },
        { v: 'signe', label: '42 ÷ 6 = …' }, { v: 'reste', label: '45 ÷ 6 = … reste …' },
      ], defaut: 'combien' },
    ],
    titre: p => p.forme === 'reste' ? 'Divisions avec reste' : p.forme === 'signe' ? 'Divisions' : 'Combien de fois ?',
    source(p) {
      const l = []
      for (const t of p.tables) for (let k = 1; k <= 10; k++) {
        const n = t * k
        if (p.forme === 'combien') l.push(calc(`Combien de fois ${t} dans ${n} ? ${B}`, k))
        if (p.forme === 'partage') l.push(calc(`${n} partagé en ${t} → ${B} chacun`, k))
        if (p.forme === 'signe') l.push(calc(`${n} ÷ ${t} = ${B}`, k))
        if (p.forme === 'reste' && k < 10) for (let r = 0; r < t; r++) l.push(calc(`${n + r} ÷ ${t} = ${B} reste ${B}`, k, r))
      }
      return { tous: l }
    },
  },
  {
    id: 'suites', label: '🔢 Suites de nombres', niveaux: ['cp', 'ce1', 'ce2', 'cm1'],
    params: [
      { id: 'pas', label: 'De … en …', multi: true, options: [
        { v: 2, label: '2 en 2' }, { v: 5, label: '5 en 5' }, { v: 10, label: '10 en 10' },
        { v: 25, label: '25 en 25' }, { v: 50, label: '50 en 50' }, { v: 100, label: '100 en 100' },
      ], defaut: [2, 5, 10] },
      { id: 'sens', label: 'Sens', options: [{ v: 'croissant', label: 'En avançant' }, { v: 'decroissant', label: 'À reculons' }, { v: 'les2', label: 'Les deux' }], defaut: 'croissant' },
    ],
    titre: p => `Suites de nombres`,
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
    { v: '10', label: 'jusqu\'à 10', titre: 'jusqu\'à 10' },
    { v: '20', label: 'jusqu\'à 20', titre: 'jusqu\'à 20' },
    { v: '100s', label: 'jusqu\'à 100 sans passage de dizaine', titre: 'jusqu\'à 100 (sans retenue)' },
    { v: '100r', label: 'jusqu\'à 100 avec passage de dizaine', titre: 'jusqu\'à 100 (avec retenue)' },
    { v: '1000', label: `jusqu'à 1 000`, titre: `jusqu'à 1 000` },
  ]
}

function listeEt(t) {
  const l = t.map(String)
  return l.length <= 1 ? (l[0] ?? '') : `${l.slice(0, -1).join(', ')} et ${l.at(-1)}`
}

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
  { id: 'grande', label: 'Grande', ligne: 17 },
  { id: 'moyenne', label: 'Moyenne', ligne: 13.5 },
  { id: 'petite', label: 'Petite', ligne: 10.5 },
]
export const AFFICHES = [
  { id: 'multiplication', label: '✖️ Tables de multiplication' },
  { id: 'addition', label: "➕ Tables d'addition" },
]
export const DISPOSITIONS = [
  { id: 'toutes', label: 'Toutes les tables sur une page' },
  { id: 'une', label: 'Une table par page' },
  { id: 'grille', label: 'Tableau à double entrée (Pythagore)' },
]

export const DEFAUTS = {
  mode: 'fiche',              // 'fiche' | 'affiche'
  niveau: 'ce1',
  types: ['tables'],
  params: paramsDefaut(),
  melanger: true,
  nb: 30,
  colonnes: 2,
  taille: 'moyenne',
  reponse: 'pointilles',      // 'pointilles' | 'cases'
  enTete: true,
  corrige: false,
  titre: '',
  seed: null,                 // null → graine au hasard
  // affiches
  affiche: 'multiplication',
  disposition: 'toutes',
  tablesAffiche: plage(1, 10),
  format: 'A4',
  orientation: 'portrait',
}

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

  const sources = c.types.map(id => {
    const type = typeParId(id), p = c.params[id]
    const src = type.source(p)
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
  const groupes = sources.filter(s => s.calculs.length).map(s => ({ type: s.type.id, titre: s.type.titre(s.p), calculs: s.calculs }))
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

function genererFiche(c, polices) {
  const police = polices.script
  const tirage = tirerCalculs(c)
  const cfg = tirage.config
  const { w, h } = dimensionsPage('A4', 'portrait')
  const titre = cfg.titre || (tirage.groupes.length === 1 ? tirage.groupes[0].titre : 'Calcul mental')
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

  const hTitre = 13, hEnTete = cfg.enTete ? 11 : 0, hGroupe = 9
  const hDispo = h - 2 * MARGE - hTitre - hEnTete - 4
  const nbG = lignes.filter(l => l.titre).length, nbL = Math.max(1, lignes.length - nbG)
  const besoin = R => nbL * R + nbG * hGroupe
  let R = taille.ligne, paginer = false
  if (besoin(R) <= hDispo) R = Math.min(R * 1.5, (hDispo - nbG * hGroupe) / nbL)
  else if (besoin(R * 0.7) <= hDispo) R = (hDispo - nbG * hGroupe) / nbL
  else { paginer = true; R *= 0.85 }
  const F = Math.min(taille.ligne, R) * 0.5   // taille des chiffres (mm)

  // découpage en pages
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

  function cellule(x, n, corrige) {
    const f = taillePossible(x, n, F)
    return `<div class="calc"><span class="num" style="font-size:${F * 0.55}mm;width:${largeurNumero * F * 0.55}mm">${x.n}</span>`
      + `<span class="txt" style="font-size:${f}mm">${texteCalcul(x, corrige, largeurCase[x.type])}</span></div>`
  }
  function page(ls, corrige, k) {
    const enTete = cfg.enTete && !corrige ? `<div class="entete" style="height:${hEnTete}mm">
      <span>Prénom : <i class="pointilles" style="width:52mm"></i></span>
      <span>Date : <i class="pointilles" style="width:32mm"></i></span>
      <span class="score">${corrige ? '' : `<i class="pointilles" style="width:12mm"></i> / ${N}`}</span></div>` : ''
    const suite = pagesLignes.length > 1 ? ` <small>(${k + 1}/${pagesLignes.length})</small>` : ''
    return `<div class="contenu" style="inset:${MARGE}mm">
      <h1 style="height:${hTitre}mm">${corrige ? '<span class="rouge">Corrigé</span> — ' : ''}${echapper(titre)}${suite}</h1>
      ${enTete}
      ${ls.map(l => l.titre
        ? `<div class="groupe" style="height:${hGroupe}mm">${echapper(l.titre)}</div>`
        : `<div class="rang" style="height:${R}mm">${l.calculs.map(x => `<div class="cell" style="width:${wColonne(l.cols)}mm">${cellule(x, l.cols, corrige)}</div>`).join('')
          }${`<div class="cell vide" style="width:${wColonne(l.cols)}mm"></div>`.repeat(l.cols - l.calculs.length)}</div>`).join('')}
      </div>`
  }
  const pages = pagesLignes.map((ls, k) => page(ls, false, k))
  if (cfg.corrige) pages.push(...pagesLignes.map((ls, k) => page(ls, true, k)))

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
    border-bottom: 0.4mm solid #e07a1f; padding-bottom: .8mm; }`,
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
  const titre = cfg.titre || (mult ? 'Les tables de multiplication' : "Les tables d'addition")
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
      <div class="bt" style="background:${couleur(t)};font-size:${fs * 1.05}mm;height:${bh / 11.6 * 1.4}mm">Table de ${t}</div>
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
export function genererCalcul(config, polices) {
  const c = normaliserConfig(config)
  return c.mode === 'affiche' ? genererAffiche(c, polices) : genererFiche(c, polices)
}

// ── Fiches toutes prêtes (PDF générés au build) ──
const fiche = (types, params, extra = {}) => ({ ...DEFAUTS, mode: 'fiche', types, params, nb: 30, colonnes: 2, taille: 'moyenne', corrige: true, ...extra })
const affiche = extra => ({ ...DEFAUTS, mode: 'affiche', corrige: false, seed: 1, ...extra })
const tableSeule = t => ({
  slug: `fiche-table-de-multiplication-${t}`,
  titre: `Fiche de calcul : la table de multiplication de ${t}`,
  court: `Table de ${t}`,
  description: `Fiche gratuite à imprimer pour réviser la table de ${t} : produits (${t} × 7, 7 × ${t}) et facteurs manquants (${t} × … = ${t * 6}), avec corrigé. Calcul mental CE1, CE2, CM1.`,
  niveaux: t <= 5 || t === 10 ? 'CE1 · CE2' : 'CE2 · CM1',
  config: fiche(['tables'], { tables: { tables: [t], forme: 'mixte', ordre: 'melange' } }, { nb: 30, seed: 100 + t }),
})

export const TELECHARGEMENTS_CALCUL = [
  ...plage(2, 10).map(tableSeule),
  {
    slug: 'fiche-tables-de-multiplication-2-a-5', court: 'Tables de 2 à 5 mélangées',
    titre: 'Fiche de calcul : tables de multiplication de 2, 3, 4 et 5 mélangées',
    description: 'Fiche de calcul mental à imprimer : 40 multiplications mélangées des tables de 2, 3, 4 et 5, avec facteurs manquants et corrigé. Idéal pour le CE1 et le CE2.',
    niveaux: 'CE1 · CE2',
    config: fiche(['tables'], { tables: { tables: [2, 3, 4, 5], forme: 'mixte', ordre: 'melange' } }, { nb: 40, seed: 2345 }),
  },
  {
    slug: 'fiche-tables-de-multiplication-6-a-9', court: 'Tables de 6 à 9 mélangées',
    titre: 'Fiche de calcul : tables de multiplication de 6, 7, 8 et 9 mélangées',
    description: 'Les tables les plus difficiles : 40 multiplications mélangées des tables de 6, 7, 8 et 9, avec facteurs manquants. Fiche gratuite avec corrigé, CE2, CM1, CM2.',
    niveaux: 'CE2 · CM1 · CM2',
    config: fiche(['tables'], { tables: { tables: [6, 7, 8, 9], forme: 'mixte', ordre: 'melange' } }, { nb: 40, seed: 6789 }),
  },
  {
    slug: 'fiche-toutes-les-tables-de-multiplication', court: 'Toutes les tables (60 calculs)',
    titre: 'Fiche de calcul : toutes les tables de multiplication (60 calculs)',
    description: 'Grande révision des tables de multiplication de 2 à 10 : 60 multiplications mélangées sur une page, avec corrigé. Pour le CE2, le CM1 et le CM2.',
    niveaux: 'CE2 · CM1 · CM2',
    config: fiche(['tables'], { tables: { tables: plage(2, 10), forme: 'produit', ordre: 'melange' } }, { nb: 60, colonnes: 3, seed: 2100 }),
  },
  {
    slug: 'affiche-tables-de-multiplication-a4', court: 'Affiche tables × (A4)',
    titre: 'Affiche des tables de multiplication de 1 à 10 (A4)',
    description: 'Affiche gratuite des tables de multiplication de 1 à 10 sur une page A4, en couleurs, à afficher ou coller dans le cahier. À imprimer en PDF.',
    niveaux: 'CE1 · CE2 · CM1 · CM2',
    config: affiche({ affiche: 'multiplication', disposition: 'toutes', format: 'A4', orientation: 'landscape' }),
  },
  {
    slug: 'affiche-tables-de-multiplication-a3', court: 'Affiche tables × (A3)',
    titre: 'Affiche des tables de multiplication pour la classe (A3)',
    description: 'Grande affiche A3 des tables de multiplication de 1 à 10 pour le mur de la classe, en couleurs. Gratuite à imprimer en PDF.',
    niveaux: 'CE1 · CE2 · CM1 · CM2',
    config: affiche({ affiche: 'multiplication', disposition: 'toutes', format: 'A3', orientation: 'landscape' }),
  },
  {
    slug: 'affiches-une-table-de-multiplication-par-page', court: 'Une table × par page',
    titre: 'Les tables de multiplication : une grande affiche par table',
    description: 'Dix affiches A4, une par table de multiplication (de 1 à 10), en gros caractères pour la classe ou la chambre. PDF gratuit.',
    niveaux: 'CE1 · CE2 · CM1',
    config: affiche({ affiche: 'multiplication', disposition: 'une', format: 'A4', orientation: 'portrait' }),
  },
  {
    slug: 'table-de-pythagore-multiplication', court: 'Table de Pythagore',
    titre: 'Table de Pythagore : tableau des multiplications de 1 à 10',
    description: 'Tableau à double entrée des multiplications de 1 × 1 à 10 × 10 (table de Pythagore), les carrés en couleur. Affiche gratuite à imprimer.',
    niveaux: 'CE2 · CM1 · CM2',
    config: affiche({ affiche: 'multiplication', disposition: 'grille', format: 'A4', orientation: 'portrait' }),
  },
  {
    slug: 'affiche-tables-d-addition', court: "Affiche tables d'addition",
    titre: "Affiche des tables d'addition de 1 à 10",
    description: "Affiche gratuite des tables d'addition de 1 à 10 (de 1 + 1 à 10 + 10) en couleurs, pour apprendre les résultats par cœur au CP et au CE1.",
    niveaux: 'CP · CE1',
    config: affiche({ affiche: 'addition', disposition: 'toutes', format: 'A4', orientation: 'landscape' }),
  },
  {
    slug: 'tableau-des-additions-0-a-10', court: 'Tableau des additions',
    titre: 'Tableau à double entrée des additions de 0 à 10',
    description: 'Tableau des additions de 0 + 0 à 10 + 10, doubles en couleur : un outil mémo pour le CP et le CE1. Gratuit à imprimer.',
    niveaux: 'CP · CE1',
    config: affiche({ affiche: 'addition', disposition: 'grille', format: 'A4', orientation: 'portrait' }),
  },
  {
    slug: 'fiche-tables-d-addition-cp', court: "Tables d'addition (≤ 10)",
    titre: "Fiche de calcul : tables d'addition, résultats jusqu'à 10",
    description: "30 additions des tables d'addition (résultats jusqu'à 10) et termes manquants, en gros chiffres, avec corrigé. Calcul mental CP.",
    niveaux: 'CP',
    config: fiche(['tablesAdd'], { tablesAdd: { plage: '10', forme: 'mixte' } }, { taille: 'grande', nb: 30, seed: 1010 }),
  },
  {
    slug: 'fiche-complements-a-10', court: 'Compléments à 10',
    titre: 'Fiche de calcul : les compléments à 10',
    description: 'Fiche gratuite pour apprendre les compléments à 10 (7 + … = 10) : les « amoureux de 10 », en gros chiffres, avec corrigé. CP et CE1.',
    niveaux: 'CP · CE1',
    config: fiche(['complements'], { complements: { cibles: ['10'] } }, { nb: 18, taille: 'grande', seed: 1000 }),
  },
  {
    slug: 'fiche-complements-a-100', court: 'Compléments à 100',
    titre: 'Fiche de calcul : les compléments à 100',
    description: 'Compléments à 100 avec des dizaines entières (30 + … = 100) puis des nombres quelconques (37 + … = 100) : fiche de calcul mental avec corrigé, CE1 et CE2.',
    niveaux: 'CE1 · CE2',
    config: fiche(['complements'], { complements: { cibles: ['100d', '100'] } }, { nb: 30, seed: 1100 }),
  },
  {
    slug: 'fiche-complements-dizaine-superieure', court: 'Compléments à la dizaine',
    titre: 'Fiche de calcul : compléter à la dizaine supérieure',
    description: 'Atteindre la dizaine supérieure (37 + … = 40) : la stratégie clé pour calculer avec passage de dizaine. Fiche à imprimer avec corrigé, CE1.',
    niveaux: 'CP · CE1',
    config: fiche(['complements'], { complements: { cibles: ['dizaine'] } }, { nb: 30, seed: 1200 }),
  },
  {
    slug: 'fiche-doubles-et-moities-cp', court: 'Doubles et moitiés CP',
    titre: 'Fiche de calcul : doubles et moitiés (CP)',
    description: 'Les doubles des nombres jusqu\'à 10 et les moitiés des nombres pairs jusqu\'à 20, comme demandé au CP. Fiche gratuite en gros chiffres avec corrigé.',
    niveaux: 'CP',
    config: fiche(['doubles'], { doubles: { quoi: 'les2', plages: ['10'] } }, { nb: 20, taille: 'grande', seed: 1300 }),
  },
  {
    slug: 'fiche-doubles-et-moities-ce1', court: 'Doubles et moitiés CE1',
    titre: 'Fiche de calcul : doubles et moitiés (CE1)',
    description: 'Doubles jusqu\'à 20 et moitiés jusqu\'à 40, puis nombres ronds (double de 25, moitié de 50, de 30…). Fiche de calcul mental CE1 avec corrigé.',
    niveaux: 'CE1 · CE2',
    config: fiche(['doubles'], { doubles: { quoi: 'les2', plages: ['20', 'ronds'] } }, { nb: 30, seed: 1400 }),
  },
  {
    slug: 'fiche-additions-jusqu-a-20', court: 'Additions jusqu\'à 20',
    titre: "Fiche de calcul : additions jusqu'à 20",
    description: "30 additions dont le résultat ne dépasse pas 20, en gros chiffres : fiche de calcul gratuite avec corrigé pour le CP et le CE1.",
    niveaux: 'CP · CE1',
    config: fiche(['addition'], { addition: { plage: '20' } }, { nb: 30, seed: 1500 }),
  },
  {
    slug: 'fiche-additions-soustractions-ce1', court: 'Additions / soustractions CE1',
    titre: 'Fiche de calcul : additions et soustractions jusqu\'à 100 (CE1)',
    description: 'Additions et soustractions jusqu\'à 100 sans et avec passage de dizaine, mélangées. Fiche de calcul CE1 gratuite à imprimer, avec corrigé.',
    niveaux: 'CE1',
    config: fiche(['addition', 'soustraction'], { addition: { plage: '100s' }, soustraction: { plage: '100s' } }, { nb: 30, seed: 1600 }),
  },
  {
    slug: 'fiche-ajouter-retirer-10', court: '+ 10 / − 10',
    titre: 'Fiche de calcul : ajouter 10 et retirer 10',
    description: 'Ajouter ou retirer 10 à un nombre jusqu\'à 100 : fiche de calcul mental CP et CE1 pour comprendre les dizaines, avec corrigé.',
    niveaux: 'CP · CE1',
    config: fiche(['dixCent'], { dixCent: { ops: ['+10', '-10'], plage: '100' } }, { nb: 30, seed: 1700 }),
  },
  {
    slug: 'fiche-multiplier-par-10-et-100', court: '× 10 et × 100',
    titre: 'Fiche de calcul : multiplier par 10 et par 100',
    description: 'Multiplier un nombre entier par 10 et par 100 : fiche de calcul mental CE2 et CM1, avec corrigé. Gratuite à imprimer.',
    niveaux: 'CE2 · CM1',
    config: fiche(['dixCent'], { dixCent: { ops: ['x10', 'x100'], plage: '1000' } }, { nb: 30, seed: 1800 }),
  },
  {
    slug: 'fiche-ajouter-retirer-9-11', court: '+ 9 / − 9 / + 11 / − 11',
    titre: 'Fiche de calcul : ajouter et retirer 9 et 11',
    description: 'La stratégie « + 10 − 1 » : ajouter et retirer 9 et 11 à des nombres jusqu\'à 100. Fiche de calcul mental CE1, CE2 avec corrigé.',
    niveaux: 'CE1 · CE2',
    config: fiche(['neufOnze'], { neufOnze: { ops: ['+9', '-9', '+11', '-11'], plage: '100' } }, { nb: 30, seed: 1900 }),
  },
  {
    slug: 'fiche-divisions-combien-de-fois', court: 'Combien de fois ? (CE2)',
    titre: 'Fiche de calcul : combien de fois ? (divisions CE2)',
    description: 'Premières divisions au CE2 : « combien de fois 6 dans 42 ? » à partir des tables de multiplication. Fiche gratuite à imprimer avec corrigé.',
    niveaux: 'CE2',
    config: fiche(['division'], { division: { tables: [2, 3, 4, 5, 10], forme: 'combien' } }, { nb: 20, seed: 2000 }),
  },
  {
    slug: 'fiche-divisions-tables-cm1', court: 'Divisions CM1',
    titre: 'Fiche de calcul : divisions avec le signe ÷ (CM1)',
    description: 'Divisions exactes dans les tables de multiplication (42 ÷ 6 = …) pour le CM1 et le CM2. Fiche de calcul mental à imprimer avec corrigé.',
    niveaux: 'CM1 · CM2',
    config: fiche(['division'], { division: { tables: plage(2, 9), forme: 'signe' } }, { nb: 40, seed: 2200 }),
  },
  {
    slug: 'fiche-suites-de-nombres', court: 'Suites de nombres',
    titre: 'Fiche de calcul : compléter des suites de nombres',
    description: 'Compléter des suites de nombres de 2 en 2, de 5 en 5, de 10 en 10, en avançant et à reculons. Fiche gratuite CP et CE1 avec corrigé.',
    niveaux: 'CP · CE1',
    config: fiche(['suites'], { suites: { pas: [2, 5, 10], sens: 'les2' } }, { nb: 20, seed: 2300 }),
  },
  {
    slug: 'fiche-calcul-mental-ce1', court: 'Calcul mental CE1 (mélange)',
    titre: 'Fiche de calcul mental CE1 : révisions mélangées',
    description: 'Une fiche complète de calcul mental pour le CE1 : tables de 2 à 5, additions, soustractions, compléments et doubles mélangés, avec corrigé.',
    niveaux: 'CE1',
    config: fiche(PRESETS_NIVEAU.ce1.types, PRESETS_NIVEAU.ce1.params, { nb: 40, seed: 2400 }),
  },
].map(e => ({ ...e, categorie: 'calcul', type: 'calcul', lien: '/imprimer/calcul' }))
