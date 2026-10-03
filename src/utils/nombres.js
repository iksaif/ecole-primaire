// Écriture des nombres en lettres — français et breton.

// ─── Français ────────────────────────────────────────────────────────────────
// `rectifiee` = orthographe rectifiée de 1990 (traits d'union partout),
// référence des programmes scolaires. Sinon orthographe traditionnelle.

const UNITES_FR = ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf',
  'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize']
const DIZAINES_FR = ['', 'dix', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante']

// 0 → 99, renvoie une liste de mots (à joindre par '-' ou ' ')
function moinsDeCentFr(n, rectifiee) {
  if (n <= 16) return [UNITES_FR[n]]
  if (n < 20) return ['dix', UNITES_FR[n - 10]]
  const d = Math.floor(n / 10), u = n % 10
  if (d === 7 || d === 9) {
    const base = d === 7 ? ['soixante'] : ['quatre', 'vingt']
    const reste = moinsDeCentFr(10 + u, rectifiee)
    // 71 : soixante et onze ; 91 : quatre-vingt-onze
    return d === 7 && u === 1 ? [...base, 'et', ...reste] : [...base, ...reste]
  }
  if (d === 8) return u === 0 ? ['quatre', 'vingts'] : ['quatre', 'vingt', UNITES_FR[u]]
  const dizaine = DIZAINES_FR[d]
  if (u === 0) return [dizaine]
  if (u === 1) return [dizaine, 'et', 'un']
  return [dizaine, UNITES_FR[u]]
}

// Assemble les mots : traits d'union partout (rectifiée) ou seulement < 100 sauf « et »
function joindreFr(groupes, rectifiee) {
  if (rectifiee) return groupes.flat().join('-')
  return groupes.map(g => {
    // dans un groupe < 100 : « vingt et un », « quatre-vingt-dix », « soixante et onze »
    let s = ''
    g.forEach((m, i) => {
      if (i === 0) s = m
      else if (m === 'et' || g[i - 1] === 'et') s += ' ' + m
      else s += '-' + m
    })
    return s
  }).join(' ')
}

function moinsDeMilleGroupes(n, rectifiee, finDeNombre) {
  const c = Math.floor(n / 100), r = n % 100
  const groupes = []
  if (c > 0) {
    const pluriel = c > 1 && r === 0 && finDeNombre
    if (c > 1) groupes.push([UNITES_FR[c]])
    groupes.push([pluriel ? 'cents' : 'cent'])
  }
  if (r > 0 || c === 0) {
    let mots = moinsDeCentFr(r, rectifiee)
    // « quatre-vingts » perd son s s'il est suivi de « mille »
    if (!finDeNombre && r === 80) mots = ['quatre', 'vingt']
    groupes.push(mots)
  }
  return groupes
}

export function enLettresFr(n, { rectifiee = true } = {}) {
  n = Math.floor(Math.abs(n))
  if (n === 0) return 'zéro'
  if (n > 999999) return String(n)
  const milliers = Math.floor(n / 1000), reste = n % 1000
  const groupes = []
  if (milliers > 0) {
    if (milliers > 1) groupes.push(...moinsDeMilleGroupes(milliers, rectifiee, false))
    groupes.push(['mille'])
  }
  if (reste > 0) groupes.push(...moinsDeMilleGroupes(reste, rectifiee, true))
  return joindreFr(groupes, rectifiee)
}

// ─── Breton ──────────────────────────────────────────────────────────────────
// Système en partie vicésimal (base 20). Forme masculine (daou, tri, pevar).
// Les unités se placent avant les dizaines : 32 = daou ha tregont (« deux et trente »).

const UNITES_BR = ['zero', 'unan', 'daou', 'tri', 'pevar', 'pemp', "c'hwec'h", 'seizh', 'eizh', 'nav',
  'dek', 'unnek', 'daouzek', 'trizek', 'pevarzek', 'pemzek', "c'hwezek", 'seitek', "triwec'h", 'naontek']

// Dizaines « rondes »
const DIZAINES_BR = { 20: 'ugent', 30: 'tregont', 40: 'daou-ugent', 50: 'hanter-kant', 60: 'tri-ugent', 80: 'pevar-ugent' }

// « ha » devant consonne, « hag » devant voyelle ou h muet
function ha(mot) {
  return /^[aeiouhy]/i.test(mot) ? 'hag' : 'ha'
}

function moinsDeCentBr(n) {
  if (n < 20) return UNITES_BR[n]
  if (DIZAINES_BR[n]) return DIZAINES_BR[n]
  if (n < 30) return `${UNITES_BR[n - 20]} warn-ugent`
  // 70-79 et 90-99 : dek…naontek + tri-ugent / pevar-ugent
  const base = n < 40 ? 30 : n < 50 ? 40 : n < 60 ? 50 : n < 80 ? 60 : 80
  const dizaine = DIZAINES_BR[base]
  const u = UNITES_BR[n - base]
  return `${u} ${ha(dizaine)} ${dizaine}`
}

// Mutations après daou / tri / pevar / nav : kant → c'hant, mil → vil (daou vil)
const CENTAINES_BR = ['', 'kant', "daou c'hant", "tri c'hant", "pevar c'hant", 'pemp kant',
  "c'hwec'h kant", 'seizh kant', 'eizh kant', "nav c'hant"]

function moinsDeMilleBr(n) {
  const c = Math.floor(n / 100), r = n % 100
  if (c === 0) return moinsDeCentBr(r)
  if (r === 0) return CENTAINES_BR[c]
  // forme moderne courante : 101 = kant unan, 125 = kant pemp warn-ugent
  return `${CENTAINES_BR[c]} ${moinsDeCentBr(r)}`
}

const MILLIERS_BR = ['', 'mil', 'daou vil', 'tri mil', 'pevar mil', 'pemp mil',
  "c'hwec'h mil", 'seizh mil', 'eizh mil', 'nav mil']

export function enLettresBr(n) {
  n = Math.floor(Math.abs(n))
  if (n < 1000) return moinsDeMilleBr(n)
  if (n > 9999) return String(n)
  const m = Math.floor(n / 1000), r = n % 1000
  if (r === 0) return MILLIERS_BR[m]
  return `${MILLIERS_BR[m]} ${moinsDeMilleBr(r)}`
}

// Décomposition en centaines / dizaines / unités
export function decomposer(n) {
  return {
    milliers: Math.floor(n / 1000) % 10,
    centaines: Math.floor(n / 100) % 10,
    dizaines: Math.floor(n / 10) % 10,
    unites: n % 10,
  }
}
