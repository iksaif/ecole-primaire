
// Écriture des nombres en lettres en français (0 à 999 999).
// `rectifiee` = orthographe rectifiée de 1990 (traits d'union partout),
// référence des programmes scolaires. Sinon orthographe traditionnelle.

const UNITES_FR = ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf',
  'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize']
const DIZAINES_FR = ['', 'dix', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante']

// 0 → 99, renvoie une liste de mots (à joindre par '-' ou ' ')
function moinsDeCentFr(n: number): string[] {
  if (n <= 16) return [UNITES_FR[n]]
  if (n < 20) return ['dix', UNITES_FR[n - 10]]
  const d = Math.floor(n / 10), u = n % 10
  if (d === 7 || d === 9) {
    const base = d === 7 ? ['soixante'] : ['quatre', 'vingt']
    const reste = moinsDeCentFr(10 + u)
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
function joindreFr(groupes: string[][], rectifiee: boolean): string {
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

function moinsDeMilleGroupes(n: number, finDeNombre: boolean): string[][] {
  const c = Math.floor(n / 100), r = n % 100
  const groupes: string[][] = []
  if (c > 0) {
    const pluriel = c > 1 && r === 0 && finDeNombre
    if (c > 1) groupes.push([UNITES_FR[c]])
    groupes.push([pluriel ? 'cents' : 'cent'])
  }
  if (r > 0 || c === 0) {
    let mots = moinsDeCentFr(r)
    // « quatre-vingts » perd son s s'il est suivi de « mille »
    if (!finDeNombre && r === 80) mots = ['quatre', 'vingt']
    groupes.push(mots)
  }
  return groupes
}

export function enLettresFr(n: number, { rectifiee = true }: { rectifiee?: boolean } = {}): string {
  n = Math.floor(Math.abs(n))
  if (n === 0) return 'zéro'
  if (n > 999999) return String(n)
  const milliers = Math.floor(n / 1000), reste = n % 1000
  const groupes: string[][] = []
  if (milliers > 0) {
    if (milliers > 1) groupes.push(...moinsDeMilleGroupes(milliers, false))
    groupes.push(['mille'])
  }
  if (reste > 0) groupes.push(...moinsDeMilleGroupes(reste, true))
  return joindreFr(groupes, rectifiee)
}

