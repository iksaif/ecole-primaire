// La géométrie — questions sur quadrillage : symétrie (compléter), reproduction, repérage (colorier / lire une case).
// Pur. Une case est une clé « colonne,ligne » ; l'ordre des tirages est celui de l'ancienne vue (mêmes fiches).
import { avecChoix } from './donnees.js'

export const LETTRES = 'ABCDEFGHIJKL'.split('')
export const k = (c, r) => c + ',' + r
export const dek = cle => cle.split(',').map(Number)
export const nomCase = (c, r) => LETTRES[c] + (r + 1)

// Figure connexe (cases voisines par un côté) de n cases dans une zone
function figureConnexe(rng, n, dansZone, departs) {
  const set = new Set([rng.choisir(departs)])
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]]
  let essais = 0
  while (set.size < n && essais < 1000) {
    essais++
    const [c, r] = dek(rng.choisir([...set]))
    const [dc, dr] = rng.choisir(dirs)
    if (dansZone(c + dc, r + dr)) set.add(k(c + dc, r + dr))
  }
  return [...set].sort()
}

/** Symétrie : compléter la figure de l'autre côté de l'axe. `horizontal` : axe horizontal (sinon vertical). */
export function genSymetrie({ rng, T, niv }, horizontal) {
  const p = niv.symetrie
  const axe = horizontal ? 'h' : 'v'
  // Axe horizontal : on tourne la grille (moitiés de même taille)
  const cols = axe === 'v' ? p.cols : p.rows
  const rows = axe === 'v' ? p.rows : p.cols
  const premier = rng.vrai(0.5)   // modèle à gauche / en haut
  const moitie = (axe === 'v' ? cols : rows) / 2
  const dansZone = (c, r) => {
    if (c < 0 || r < 0 || c >= cols || r >= rows) return false
    const pos = axe === 'v' ? c : r
    return premier ? pos < moitie : pos >= moitie
  }
  const bord = premier ? moitie - 1 : moitie
  const departs = []
  const toucheAxe = rng.vrai(p.toucheAxe ?? 0.65)
  for (let c = 0; c < cols; c++) for (let r = 0; r < rows; r++) {
    if (!dansZone(c, r)) continue
    if (toucheAxe && (axe === 'v' ? c : r) !== bord) continue
    departs.push(k(c, r))
  }
  const modele = figureConnexe(rng, rng.entier(...p.nbCases), dansZone, departs)
  const cellules = modele.map(cle => {
    const [c, r] = dek(cle)
    return axe === 'v' ? k(cols - 1 - c, r) : k(c, rows - 1 - r)
  }).sort()
  return {
    type: 'symetrie', cle: 'sym-' + axe + '-' + modele.join(';'),
    axe, cols, rows, premier, modele, cellules,
    texte: T(axe === 'v' ? 'symetrieV' : 'symetrieH'), consigne: T('symetrieConsigne'),
    attendu: T('nCases', { n: cellules.length }),
  }
}

/** Reproduction : recopier une figure sur un quadrillage (repère : la case la plus en haut, puis à gauche). */
export function genReproduction({ rng, T, niv }) {
  const p = niv.reproduction
  const dansZone = (c, r) => c >= 0 && r >= 0 && c < p.cols && r < p.rows
  const departs = []
  for (let c = 1; c < p.cols - 1; c++) for (let r = 1; r < p.rows - 1; r++) departs.push(k(c, r))
  const modele = figureConnexe(rng, rng.entier(...p.nbCases), dansZone, departs)
  const repere = [...modele].sort((a, b) => {
    const [ca, ra] = dek(a), [cb, rb] = dek(b)
    return ra - rb || ca - cb
  })[0]
  return {
    type: 'reproduction', cle: 'rep-' + modele.join(';'),
    cols: p.cols, rows: p.rows, modele, cellules: modele, repere,
    texte: T('reproductionQ'), consigne: T('reproductionConsigne'),
    attendu: T('nCases', { n: modele.length }),
  }
}

/** Repérage : colorier la case « B3 » (sous = 'colorie') ou dire laquelle est coloriée (sous = 'lire', à choix). */
export function genReperage({ rng, T, niv }) {
  const { cols, rows } = niv.reperage
  const c = rng.entier(0, cols - 1), r = rng.entier(0, rows - 1)
  const nom = nomCase(c, r)
  if (rng.vrai(0.5)) {
    return {
      type: 'reperage', sous: 'colorie', cle: 'pos-col-' + nom, cols, rows,
      cible: k(c, r), nom, cellules: [k(c, r)], texte: T('colorieQ', { nom }),
      consigne: T('colorieConsigne', { nom, col: nom[0], ligne: nom.slice(1) }), attendu: nom,
    }
  }
  // Pièges : lettre et chiffre inversés, cases voisines
  const pieges = [[r, c], [c + 1, r], [c - 1, r], [c, r + 1], [c, r - 1]]
    .filter(([pc, pr]) => pc >= 0 && pr >= 0 && pc < cols && pr < rows && (pc !== c || pr !== r))
    .map(([pc, pr]) => nomCase(pc, pr))
  const autres = rng.melanger([...new Set(pieges)]).slice(0, 3)
  // Dans un coin il y a moins de pièges : on complète avec d'autres cases
  while (autres.length < 3) {
    const n = nomCase(rng.entier(0, cols - 1), rng.entier(0, rows - 1))
    if (n !== nom && !autres.includes(n)) autres.push(n)
  }
  return avecChoix({
    type: 'reperage', sous: 'lire', cle: 'pos-lire-' + nom, cols, rows,
    cible: k(c, r), nom, texte: T('lireCaseQ'), consigne: T('lireCaseConsigne'), attendu: nom,
  }, rng.melanger([nom, ...autres]), nom)
}
