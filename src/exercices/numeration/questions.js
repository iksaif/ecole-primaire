// Les nombres — une fonction par type de question (pur : rng et T viennent du contexte ; aucun Math.random).
// Contexte ctx : { rng, T, niv, max } — niv : données du niveau (generateur.js), max : plus grand nombre tiré (plage).
// Chaque question porte `valeurs` (tous les nombres en jeu : ecartsAuProgramme) et, si elle écrit un nombre en lettres,
// `enLettres: true`. L'ordre des tirages est celui de l'ancienne vue : même flux de hasard, mêmes fiches.
import { enLettresFr, enLettresBr, decomposer } from '../../utils/nombres.js'
import { regles } from '../../i18n/regles.js'
import { svgBase10 } from './base10.js'
import { svgDroiteNombres } from './droite.js'

// 10 000 s'écrit avec une espace ; en dessous on garde 3 400 sans espace (plus simple à recopier)
export const fmt = n => n >= 10000 ? String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : String(n)

// Titres des cases (clés de l'interface) ; « 3 centaines » : nom du catalogue de contenu (cdu_<champ>), accordé par regles()
export const LIBELLES_CDU = { milliers: 'lib_milliers', centaines: 'lib_centaines', dizaines: 'lib_dizaines', unites: 'lib_unites' }

const EN_LETTRES = { fr: enLettresFr, br: enLettresBr }
export const enLettres = (T, n) => (EN_LETTRES[T('langue')] ?? enLettresFr)(n)
export const libCdu = (T, v, champ) => regles(T('langue')).nombre(v, T(`cdu_${champ}`))

const nbChiffres = max => max <= 100 ? 2 : max <= 1000 ? 3 : 4
export const champsPour = max => ['milliers', 'centaines', 'dizaines', 'unites'].slice(4 - nbChiffres(max))
const chiffresDe = n => String(n).split('').map(Number)

// Tire un nombre « intéressant » ayant le nombre de chiffres de la plage,
// avec régulièrement des 0 (305, 340, 4 060) et des dizaines 70/80/90.
function tirerNombre(rng, max, { zeros = true, dizainesDifficiles = 0.2 } = {}) {
  const k = nbChiffres(max)
  const ch = [rng.entier(1, 9), ...Array.from({ length: k - 1 }, () => rng.entier(0, 9))]
  if (rng.vrai(dizainesDifficiles)) ch[k - 2] = rng.entier(7, 9)
  if (zeros) {
    if (k === 2 && rng.vrai(0.15)) ch[1] = 0
    if (k >= 3 && rng.vrai(0.3)) ch[rng.entier(1, k - 1)] = 0
    if (k === 4 && rng.vrai(0.15)) ch[rng.entier(1, k - 1)] = 0
  }
  return +ch.join('')
}

// Nombre à écrire en lettres : au CP, pas au-delà de `lettresMax` (50) ; sinon tiré comme les autres
function tirerNombreEnLettres({ rng, niv, max }, options) {
  return niv.lettresMax && max > niv.lettresMax ? rng.entier(10, niv.lettresMax) : tirerNombre(rng, max, options)
}

export function genDecomposer({ rng, T, max }) {
  const n = tirerNombre(rng, max)
  const dec = decomposer(n)
  const champs = champsPour(max)
  const reponse = Object.fromEntries(champs.map(ch => [ch, dec[ch]]))
  const attendu = champs.map(ch => libCdu(T, reponse[ch], ch)).join(' ')
  const noms = champs.map(ch => T(LIBELLES_CDU[ch]))
  if (rng.vrai(0.5)) {
    return {
      type: 'decomposer', kind: 'cdu', cle: 'dec' + n, valeurs: [n],
      consigne: T('cDecomposer', { liste: `${noms.slice(0, -1).join(', ')} ${T('et')} ${noms[noms.length - 1]}` }),
      texte: fmt(n), champs, reponse,
      libelle: `${fmt(n)} = ?`, attendu,
    }
  }
  // Recomposer : on omet les termes nuls (piège : 3 centaines + 7 unités = 307)
  let termes = champs.filter(ch => reponse[ch]).map(ch => libCdu(T, reponse[ch], ch))
  if (termes.length > 1 && rng.vrai(0.3)) termes = rng.melanger(termes)
  const texte = termes.join(' + ')
  return {
    type: 'decomposer', kind: 'nombre', cle: 'rec' + texte, valeurs: [n],
    consigne: T('cEcrisNombre'), texte, texteLong: true, reponse: n,
    libelle: `${texte} = ?`, attendu: fmt(n),
  }
}

export function genRepresentation({ rng, T, max }) {
  const n = tirerNombre(rng, max, { dizainesDifficiles: 0 })
  let { milliers: m, centaines: c, dizaines: d, unites: u } = decomposer(n)
  // Parfois plus de 9 cubes : il faut faire un échange (1 dizaine = 10 unités)
  if (rng.vrai(0.2) && d >= 1 && u <= 4) { d -= 1; u += 10 }
  const morceau = (v, nom) => regles(T('langue')).nombre(v, T(`base10_${nom}`))
  const morceaux = []
  if (m) morceaux.push(morceau(m, 'millier'))
  if (c) morceaux.push(morceau(c, 'centaine'))
  morceaux.push(morceau(d, 'dizaine'), morceau(u, 'unite'))
  return {
    type: 'representation', kind: 'nombre', cle: `rep${m}-${c}-${d}-${u}`, valeurs: [n],
    consigne: T('cRepresente'), texte: '', reponse: n, milliers: m > 0 || max > 1000,
    svg: svgBase10(m, c, d, u), libelle: morceaux.join(', '), attendu: fmt(n),
  }
}

export function genLettresChiffres(ctx) {
  const { T } = ctx
  const n = tirerNombreEnLettres(ctx, { dizainesDifficiles: 0.35 })
  const texte = enLettres(T, n)
  return {
    type: 'lettresChiffres', kind: 'nombre', cle: 'lc' + n, valeurs: [n], enLettres: true,
    consigne: T('cEnChiffres'), texte, texteLong: true, reponse: n,
    libelle: texte, attendu: fmt(n),
  }
}

// Distracteurs plausibles pour l'écriture en lettres
function distracteurs(rng, n, max, nb = 3) {
  const ch = chiffresDe(n), k = ch.length
  const d = ch[k - 2]
  const ok = v => Number.isInteger(v) && v >= 10 && v <= max && v !== n
  const pieges = []
  if (d === 7 || d === 9) pieges.push(n - 10)          // soixante-quinze / soixante-cinq
  if (d === 6 || d === 8) pieges.push(n + 10)          // soixante-cinq / soixante-quinze
  if (d === 8) pieges.push(n - 60)                     // quatre-vingt-deux / vingt-deux
  if (d === 2) pieges.push(n + 60)
  // 0 mal placé : 2 030 / 2 300 / 2 003
  for (let i = 1; i < k; i++) for (let j = 1; j < k; j++) {
    if (i !== j && ch[i] === 0 && ch[j] !== 0) {
      const tab = [...ch]; [tab[i], tab[j]] = [tab[j], tab[i]]; pieges.push(+tab.join(''))
    }
  }
  // chiffres échangés
  const perms = []
  for (let i = 0; i < k; i++) for (let j = i + 1; j < k; j++) {
    const tab = [...ch]; [tab[i], tab[j]] = [tab[j], tab[i]]
    if (tab[0] !== 0) perms.push(+tab.join(''))
  }
  const voisins = [n + 10, n - 10, n + 1, n - 1]
  if (k >= 3) voisins.push(n + 100, n - 100)
  if (k >= 4) voisins.push(n + 1000, n - 1000)
  const res = []
  for (const v of [...rng.melanger(pieges), ...rng.melanger(perms), ...rng.melanger(voisins)]) {
    if (ok(v) && !res.includes(v)) res.push(v)
    if (res.length === nb) break
  }
  let essais = 0
  while (res.length < nb && essais++ < 100) {
    const v = rng.entier(10, max - 1)
    if (ok(v) && !res.includes(v)) res.push(v)
  }
  return res
}

export function genChiffresLettres(ctx) {
  const { rng, T, niv, max } = ctx
  const n = tirerNombreEnLettres(ctx, { dizainesDifficiles: 0.4 })
  const bonne = enLettres(T, n)
  const dist = distracteurs(rng, n, niv.lettresMax ?? max)
  const choix = rng.melanger([bonne, ...dist.map(v => enLettres(T, v))])
  return {
    type: 'chiffresLettres', kind: 'choix', cle: 'cl' + n, valeurs: [n, ...dist], enLettres: true,
    consigne: T('cEnLettres'), texte: fmt(n), reponse: bonne, choix,
    libelle: fmt(n), attendu: bonne,
  }
}

export function genComparer({ rng, T, max }) {
  const a = tirerNombre(rng, max, { dizainesDifficiles: 0 })
  const ch = chiffresDe(a), k = ch.length
  let b
  const r = rng()
  if (r < 0.1) b = a
  else if (r < 0.35) {                                                   // deux chiffres échangés
    const i = rng.entier(Math.min(1, k - 2), k - 2), tab = [...ch];
    [tab[i], tab[i + 1]] = [tab[i + 1], tab[i]]; b = +tab.join('')
  }
  else if (r < 0.6) b = a - a % 10 + rng.entier(0, 9)                      // même dizaine
  else if (r < 0.75 && k > 2) b = tirerNombre(rng, Math.pow(10, k - 1))        // un chiffre de moins
  else b = a - a % Math.pow(10, k - 1) + rng.entier(0, Math.pow(10, k - 1) - 1)  // même premier chiffre
  if (b < 1 || (b === a && r >= 0.1)) b = a + (rng.vrai(0.5) ? 1 : 10)
  if (b > max) b = a - 1
  const [x, y] = rng.vrai(0.5) ? [a, b] : [b, a]
  const reponse = x < y ? '<' : x > y ? '>' : '='
  return {
    type: 'comparer', kind: 'choix', cle: `cmp${x}-${y}`, valeurs: [x, y],
    consigne: T('cSigne'), texte: `${fmt(x)}  …  ${fmt(y)}`, reponse, choix: ['<', '=', '>'],
    libelle: `${fmt(x)} … ${fmt(y)}`, attendu: `${fmt(x)} ${reponse} ${fmt(y)}`,
  }
}

export function genSuites({ rng, T, niv, max }) {
  const r = rng()
  if (r < 0.2) {
    // juste après / juste avant, souvent sur un passage de dizaine, centaine ou millier
    const apres = rng.vrai(0.5)
    let n = tirerNombre(rng, max, { zeros: false, dizainesDifficiles: 0 })
    if (rng.vrai(0.5)) n = apres ? n - n % 10 + 9 : n - n % 10
    if (max > 100 && rng.vrai(0.3)) n = apres ? n - n % 100 + 99 : n - n % 100
    if (max > 1000 && rng.vrai(0.3)) n = apres ? n - n % 1000 + 999 : n - n % 1000
    if (n < 1) n = 10
    const rep = apres ? n + 1 : n - 1
    const texte = T(apres ? 'justeApres' : 'justeAvant', { n: fmt(n) })
    return {
      type: 'suites', kind: 'nombre', cle: 'sv' + texte, valeurs: [n, rep], consigne: T('cTrouve'),
      texte, texteLong: true, reponse: rep, libelle: texte, attendu: fmt(rep),
    }
  }
  if (r < 0.45) {
    // + 10, − 10, + 100, − 100, + 1000… souvent avec un passage (395 + 10, 305 − 10, 3 950 + 100)
    const pas = rng.choisir(niv.pasPlusMoins[max])
    const plus = rng.vrai(0.5)
    const bloc = pas * 10
    const passage = bloc < max && rng.vrai(0.5)
    let n
    if (plus) n = passage ? bloc * rng.entier(0, max / bloc - 2) + (bloc - pas) + rng.entier(0, pas - 1) : rng.entier(1, max - pas)
    else n = passage ? bloc * rng.entier(1, max / bloc - 1) + rng.entier(0, pas - 1) : rng.entier(pas, max)
    const rep = plus ? n + pas : n - pas
    const texte = `${fmt(n)} ${plus ? '+' : '−'} ${fmt(pas)} = ?`
    return {
      type: 'suites', kind: 'nombre', cle: 'pm' + texte, valeurs: [n, pas, rep], consigne: T('cCalcule'),
      texte, reponse: rep, libelle: texte, attendu: fmt(rep),
    }
  }
  // Suite à compléter
  const pas = rng.choisir(niv.pasSuites[max])
  const nbTermes = 5
  const etendue = pas * (nbTermes - 1)
  let debut
  if (pas >= 10 && pas * 10 >= max) debut = (pas / 10) * rng.entier(0, (max - etendue) / (pas / 10))  // 200, 300… ou 250, 350…
  else if (pas >= 10) {
    // passage : 370, 380, 390, 400… ou 375, 385, 395, 405…
    const bloc = pas * 10
    const cible = bloc * rng.entier(1, max / bloc - 1)
    debut = cible - pas * rng.entier(1, nbTermes - 2) - (rng.vrai(0.4) ? rng.entier(1, 9) * (pas / 10) : 0)
  } else {
    // pas de 1, 2 ou 5 : passage de dizaine (58, 59, 60…) ou de centaine (398, 399, 400…)
    const bloc = max > 100 && rng.vrai(0.4) ? 100 : 10
    const cible = bloc * rng.entier(1, max / bloc - 1)
    debut = cible - pas * rng.entier(1, nbTermes - 2)
  }
  debut = Math.max(0, Math.min(debut, max - etendue))
  const termes = Array.from({ length: nbTermes }, (_, i) => debut + i * pas)
  if (rng.vrai(0.25)) termes.reverse()
  const trou = rng.entier(1, nbTermes - 1)
  const rep = termes[trou]
  const texte = termes.map((v, i) => i === trou ? '?' : fmt(v)).join(', ')
  return {
    type: 'suites', kind: 'nombre', cle: 'su' + texte, valeurs: termes,
    consigne: T('cSuite'), texte, texteLong: true, reponse: rep, termes, trou, libelle: texte, attendu: fmt(rep),
  }
}

export function genDroite({ rng, T, niv, max }) {
  const pas = rng.choisir(niv.pasDroite[max])
  const etendue = 10 * pas
  const debut = etendue * rng.entier(0, max / etendue - 1)
  const k = rng.entier(1, 9)
  const rep = debut + k * pas
  return {
    type: 'droite', kind: 'nombre', cle: `dr${debut}-${pas}-${k}`, valeurs: [debut, debut + etendue],
    consigne: T('cDroite', { pas: fmt(pas) }),
    texte: '', svg: svgDroiteNombres(debut, pas, k, fmt), reponse: rep,
    debut, pas, k,
    libelle: T('libDroite', { a: fmt(debut), b: fmt(debut + etendue) }), attendu: fmt(rep),
  }
}

export function genRanger({ rng, T, niv, max }) {
  const nb = niv.nbRanger
  const vus = new Set()
  const base = tirerNombre(rng, max, { dizainesDifficiles: 0 })
  vus.add(base)
  const ch = chiffresDe(base), k = ch.length
  // deux derniers chiffres inversés (piège classique : 352 / 325)
  const tab = [...ch]; [tab[k - 2], tab[k - 1]] = [tab[k - 1], tab[k - 2]]
  const inv = +tab.join('')
  if (inv >= 10 && inv <= max) vus.add(inv)
  const unite = Math.pow(10, k - 1)          // 10, 100 ou 1000
  const tete = ch[0]
  let essais = 0
  while (vus.size < nb && essais++ < 200) {
    let v
    if (k === 2) v = rng.entier(10, 99)
    else v = (rng.vrai(0.6) ? tete : rng.entier(Math.max(1, tete - 1), Math.min(9, tete + 1))) * unite + rng.entier(0, unite - 1)
    if (v >= 1 && v <= max) vus.add(v)
  }
  const nombres = rng.melanger([...vus])
  const reponse = [...nombres].sort((a, b) => a - b)
  return {
    type: 'ranger', kind: 'ordre', cle: 'rg' + reponse.join('-'), valeurs: nombres,
    consigne: T('cRanger'), texte: '', nombres, reponse,
    libelle: nombres.map(fmt).join(' ; '), attendu: reponse.map(fmt).join(' < '),
  }
}
