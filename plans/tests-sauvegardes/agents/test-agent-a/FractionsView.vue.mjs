import { aleatoire, melanger } from '/Users/corentin.chary/dev/ecole-primaire/src/utils/index.js'
import { enLettresFr, decomposer } from '/Users/corentin.chary/dev/ecole-primaire/src/utils/nombres.js'
// #region generation — fonctions pures (testables hors de Vue)

// Données par niveau. CE2 : ajouter des fractions > 1, la comparaison, la droite graduée…
const NIVEAUX = {
  ce1: {
    denominateurs: [2, 3, 4, 5, 6, 8, 10],
    types: ['identifier', 'colorier', 'lettres', 'partDe'],
    modeDefaut: 'unitaires',
    // « la moitié de 8 », « le tiers de 9 », « le quart de 12 » : totaux possibles
    partDe: {
      2: { nom: 'La moitié', max: 20, extra: [30, 40, 50, 60, 80, 100] },
      3: { nom: 'Le tiers', max: 30, extra: [] },
      4: { nom: 'Le quart', max: 40, extra: [100] },
    },
  },
  ce2: {
    denominateurs: [2, 3, 4, 5, 6, 8, 10],
    types: ['identifier', 'colorier', 'lettres', 'partDe', 'unite', 'egales', 'droite', 'placer'],
    modeDefaut: 'toutes',
    droiteUnites: [1, 2],          // droite graduée de 0 à 1 ou de 0 à 2 (fractions > 1)
    partDe: {
      2: { nom: 'La moitié', max: 40, extra: [50, 60, 80, 100, 200, 500] },
      3: { nom: 'Le tiers', max: 30, extra: [36, 45, 60, 90] },
      4: { nom: 'Le quart', max: 40, extra: [60, 80, 100] },
      5: { nom: 'Le cinquième', max: 50, extra: [100] },
      10: { nom: 'Le dixième', max: 100, extra: [] },
    },
  },
}

const TYPES = [
  { id: 'identifier', label: '👀 Quelle fraction ?' },
  { id: 'colorier',   label: '🖍️ Colorier' },
  { id: 'lettres',    label: '🔤 En lettres' },
  { id: 'partDe',     label: '🍪 La moitié de…' },
  { id: 'unite',      label: '⚖️ Plus ou moins que 1 ?' },
  { id: 'egales',     label: '🟰 Fractions égales' },
  { id: 'droite',     label: '📏 Lire sur la droite' },
  { id: 'placer',     label: '📍 Placer sur la droite' },
]

const MODES = {
  unitaires: 'Un demi, un tiers… (1/2, 1/3…)',
  toutes: 'Aussi 2/3, 3/4…',
}

const COULEUR = '#f39c12'

const CHIFFRES_LETTRES = ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf']
const NOMS_PARTS = {
  2: ['demi', 'demis'], 3: ['tiers', 'tiers'], 4: ['quart', 'quarts'], 5: ['cinquième', 'cinquièmes'],
  6: ['sixième', 'sixièmes'], 7: ['septième', 'septièmes'], 8: ['huitième', 'huitièmes'],
  9: ['neuvième', 'neuvièmes'], 10: ['dixième', 'dixièmes'],
}

function enLettres({ n, d }) {
  return `${CHIFFRES_LETTRES[n]} ${NOMS_PARTS[d][n >= 2 ? 1 : 0]}`
}
const cle = f => typeof f === 'string' ? f : `${f.n}/${f.d}`
const egales = (a, b) => a.n * b.d === b.n * a.d

function tirerFraction(niv, mode) {
  const d = niv.denominateurs[aleatoire(0, niv.denominateurs.length - 1)]
  if (mode === 'unitaires' || d === 2 || Math.random() < 0.35) return { n: 1, d }
  return { n: aleatoire(2, d - 1), d }
}

// ─── Formes découpées en parts égales ───
const r2 = x => Math.round(x * 100) / 100

function formeDisque(d) {
  const cx = 70, cy = 70, r = 62
  const parts = []
  for (let i = 0; i < d; i++) {
    const a0 = -Math.PI / 2 + 2 * Math.PI * i / d, a1 = a0 + 2 * Math.PI / d
    parts.push(`M${cx} ${cy} L${r2(cx + r * Math.cos(a0))} ${r2(cy + r * Math.sin(a0))} A${r} ${r} 0 0 1 ${r2(cx + r * Math.cos(a1))} ${r2(cy + r * Math.sin(a1))} Z`)
  }
  return { type: 'disque', parts, viewBox: '0 0 140 140', largeur: 200 }
}

// Rectangle quadrillé : 2 lignes quand c'est possible (4 = 2×2, 6 = 2×3, 8 = 2×4, 10 = 2×5)
function formeRectangle(d) {
  const lignes = d >= 4 && d % 2 === 0 ? 2 : 1, colonnes = d / lignes
  const W = 220, H = lignes === 2 ? 140 : 110
  const w = W / colonnes, h = H / lignes
  const parts = []
  for (let l = 0; l < lignes; l++) for (let c = 0; c < colonnes; c++) {
    const x = r2(4 + c * w), y = r2(4 + l * h)
    parts.push(`M${x} ${y} h${r2(w)} v${r2(h)} h${r2(-w)} Z`)
  }
  return { type: 'rectangle', parts, viewBox: `0 0 ${W + 8} ${H + 8}`, largeur: 260 }
}

function formeBarre(d) {
  const W = 320, H = 50, w = W / d
  const parts = Array.from({ length: d }, (_, i) => `M${r2(4 + i * w)} 4 h${r2(w)} v${H} h${r2(-w)} Z`)
  return { type: 'barre', parts, viewBox: `0 0 ${W + 8} ${H + 8}`, largeur: 340 }
}

function tirerForme(d) {
  const f = [formeDisque, formeRectangle, formeBarre][aleatoire(0, 2)]
  return f(d)
}

// Quelles parts sont coloriées : souvent à la suite, parfois dispersées
function partsColoriees(n, d) {
  if (Math.random() < 0.6) {
    const debut = aleatoire(0, d - 1)
    return Array.from({ length: n }, (_, i) => (debut + i) % d)
  }
  return melanger(Array.from({ length: d }, (_, i) => i)).slice(0, n)
}

// Distracteurs : erreurs typiques (coloriées / non coloriées, non coloriées / total, inversion)
function distracteursFraction(f, niv, nb = 3) {
  const { n, d } = f
  const candidats = melanger([
    { n, d: d - n },          // parts coloriées sur parts blanches
    { n: d - n, d },          // parts blanches
    { n: d, d: n },           // inversion
  ]).concat(melanger([
    { n, d: d + 1 }, { n, d: d - 1 }, { n: n + 1, d }, { n: n - 1, d }, { n: 1, d: n + d },
  ]))
  const res = []
  for (const c of candidats) {
    if (c.n < 1 || c.n === c.d || c.n > 10 || !niv.denominateurs.includes(c.d)) continue
    if (egales(c, f) || res.some(r => cle(r) === cle(c))) continue
    res.push(c)
    if (res.length === nb) return res
  }
  let essais = 0
  while (res.length < nb && essais++ < 200) {
    const dd = niv.denominateurs[aleatoire(0, niv.denominateurs.length - 1)]
    const c = { n: aleatoire(1, dd - 1), d: dd }
    if (!egales(c, f) && !res.some(r => cle(r) === cle(c))) res.push(c)
  }
  return res
}

function genIdentifier(niv, mode) {
  const f = tirerFraction(niv, mode)
  const forme = tirerForme(f.d)
  const colorees = partsColoriees(f.n, f.d)
  return {
    type: 'identifier', kind: 'choix', choixEn: 'frac', cle: `id${cle(f)}${forme.type}${colorees.join('-')}`,
    consigne: 'Quelle fraction de la figure est coloriée ?',
    forme, colorees, reponse: f, choix: melanger([f, ...distracteursFraction(f, niv)]),
    libelle: `${forme.type === 'disque' ? 'Disque' : forme.type === 'barre' ? 'Barre' : 'Rectangle'} : ${f.n} part${f.n > 1 ? 's' : ''} coloriée${f.n > 1 ? 's' : ''} sur ${f.d}`,
    attendu: `${cle(f)} (${enLettres(f)})`,
  }
}

function genColorier(niv, mode) {
  const f = tirerFraction(niv, mode)
  const forme = tirerForme(f.d)
  return {
    type: 'colorier', kind: 'parts', cle: `co${cle(f)}${forme.type}`,
    consigne: 'Colorie', fracConsigne: f, consigneFin: ` de la figure (${enLettres(f)}).`,
    forme, reponse: f,
    libelle: `Colorier ${cle(f)}`, attendu: `${f.n} part${f.n > 1 ? 's' : ''} sur ${f.d}`,
  }
}

function genLettres(niv, mode) {
  const f = tirerFraction(niv, mode)
  // distracteurs : vraies fractions, pour ne pas montrer d'écriture fausse
  const autres = distracteursFraction(f, niv).filter(c => niv.denominateurs.includes(c.d) && c.n <= 9)
  while (autres.length < 3) {
    const dd = niv.denominateurs[aleatoire(0, niv.denominateurs.length - 1)]
    const c = { n: aleatoire(1, dd - 1), d: dd }
    if (!egales(c, f) && !autres.some(r => cle(r) === cle(c))) autres.push(c)
  }
  const choix = melanger([f, ...autres.slice(0, 3)])
  if (Math.random() < 0.5) {
    return {
      type: 'lettres', kind: 'choix', choixEn: 'lettres', cle: `le${cle(f)}`,
      consigne: 'Comment se lit cette fraction ?', fracAffichee: f, reponse: f, choix,
      libelle: `${cle(f)} en lettres`, attendu: enLettres(f),
    }
  }
  return {
    type: 'lettres', kind: 'choix', choixEn: 'frac', cle: `lc${cle(f)}`,
    consigne: 'Quelle fraction est écrite ?', texte: enLettres(f), reponse: f, choix,
    libelle: enLettres(f), attendu: cle(f),
  }
}

// Jetons ronds à partager (aide visuelle)
function svgJetons(total) {
  const parLigne = total <= 12 ? total : Math.ceil(total / 2) <= 12 ? Math.ceil(total / 2) : 10
  const lignes = Math.ceil(total / parLigne)
  const e = 30
  let s = ''
  for (let i = 0; i < total; i++) {
    const x = 18 + (i % parLigne) * e, y = 18 + Math.floor(i / parLigne) * e
    s += `<circle cx="${x}" cy="${y}" r="11" fill="#fde3b8" stroke="#c77c00" stroke-width="2"/>`
  }
  const w = parLigne * e + 6, h = lignes * e + 6
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" style="max-width:100%;height:auto;">${s}</svg>`
}

function genPartDe(niv) {
  const ds = Object.keys(niv.partDe).map(Number)
  const d = ds[aleatoire(0, ds.length - 1)]
  const nbParts = d === 2 ? 'deux' : CHIFFRES_LETTRES[d] ?? String(d)
  const cfg = niv.partDe[d]
  const possibles = []
  for (let t = 2 * d; t <= cfg.max; t += d) possibles.push(t)
  const totaux = Math.random() < 0.8 || !cfg.extra.length ? possibles : cfg.extra
  const total = totaux[aleatoire(0, totaux.length - 1)]
  const rep = total / d
  const texte = `${cfg.nom} de ${total}, c'est ?`
  return {
    type: 'partDe', kind: 'nombre', cle: `pd${d}-${total}`,
    consigne: `${cfg.nom}, c'est une des ${d === 10 ? 'dix' : nbParts} parts égales.`,
    texte, jetons: total <= 24 ? svgJetons(total) : null, reponse: rep, d, total,
    libelle: `${cfg.nom} de ${total}`, attendu: `${rep} (${Array(d).fill(rep).join(' + ')} = ${total})`,
  }
}

// ─── CE2 : comparer à 1 ───
function genUnite(niv) {
  const d = niv.denominateurs[aleatoire(0, niv.denominateurs.length - 1)]
  const r = Math.random()
  const n = r < 0.2 ? d : r < 0.55 ? aleatoire(1, d - 1) : aleatoire(d + 1, 2 * d)
  const f = { n, d }
  const reponse = n < d ? '<' : n > d ? '>' : '='
  const explication = n === d ? `${d}/${d}, c'est l'unité entière`
    : n < d ? `il manque ${d - n} part${d - n > 1 ? 's' : ''} pour faire ${d}/${d} = 1`
    : `${d}/${d} = 1 et il y a ${n - d} part${n - d > 1 ? 's' : ''} en plus`
  return {
    type: 'unite', kind: 'choix', choixEn: 'signe', cle: `un${cle(f)}`,
    consigne: 'Compare cette fraction à 1 : < , = ou > ?', fracAffichee: f, suffixe: '…  1',
    reponse, choix: ['<', '=', '>'],
    libelle: `${cle(f)} … 1`, attendu: `${cle(f)} ${reponse} 1 (${explication})`,
  }
}

// ─── CE2 : fractions égales simples (1/2 = 2/4) ───
function genEgales(niv) {
  const bases = []
  for (const d of [2, 3, 4, 5]) for (let n = 1; n < d; n++) for (let m = 2; m * d <= 10; m++) {
    if (niv.denominateurs.includes(m * d)) bases.push([{ n, d }, m])
  }
  const [f, m] = bases[aleatoire(0, bases.length - 1)]
  const g = { n: f.n * m, d: f.d * m }
  const forme = formeBarre(f.d)
  const colorees = Array.from({ length: f.n }, (_, i) => i)
  if (Math.random() < 0.5) {
    return {
      type: 'egales', kind: 'nombre', cle: `egn${cle(f)}-${g.d}`,
      consigne: 'Complète pour que les fractions soient égales.', forme, colorees, formeAide: formeBarre(g.d),
      egalite: { gauche: f, droite: { n: '?', d: g.d } }, reponse: g.n,
      libelle: `${cle(f)} = ?/${g.d}`, attendu: `${cle(f)} = ${cle(g)}`,
    }
  }
  // distracteurs : erreur « additive » (1/2 → 2/3), numérateur seul ou dénominateur seul multiplié
  const candidats = melanger([
    { n: f.n + 1, d: f.d + 1 }, { n: f.n + m, d: f.d + m }, { n: f.n, d: g.d }, { n: g.n, d: g.d + 1 },
    { n: g.n, d: f.d + m }, { n: f.d * m - g.n === g.n ? g.n + 1 : f.d * m - g.n, d: g.d },
  ])
  const choix = [g]
  for (const c of candidats) {
    if (choix.length === 4) break
    if (c.n < 1 || c.n >= c.d || !niv.denominateurs.includes(c.d)) continue
    if (egales(c, f) || choix.some(x => cle(x) === cle(c))) continue
    choix.push(c)
  }
  let essais = 0
  while (choix.length < 4 && essais++ < 200) {
    const dd = niv.denominateurs[aleatoire(0, niv.denominateurs.length - 1)]
    const c = { n: aleatoire(1, dd - 1), d: dd }
    if (!egales(c, f) && !choix.some(x => cle(x) === cle(c))) choix.push(c)
  }
  return {
    type: 'egales', kind: 'choix', choixEn: 'frac', cle: `egc${cle(f)}-${g.d}`,
    consigne: 'Quelle fraction est égale à', fracConsigne: f, consigneFin: ' ?', forme, colorees,
    reponse: g, choix: melanger(choix),
    libelle: `Égale à ${cle(f)}`, attendu: `${cle(g)} (${cle(f)} = ${cle(g)})`,
  }
}

// ─── CE2 : droite graduée en fractions ───
function droiteFraction(unites, d) {
  const x0 = 40, L = 520, ecart = L / (unites * d), y = 60
  const ticks = Array.from({ length: unites * d + 1 }, (_, i) => ({
    i, x: Math.round((x0 + i * ecart) * 100) / 100, unite: i % d === 0, label: i % d === 0 ? String(i / d) : null,
  }))
  return { unites, d, ticks, x0, L, y, largeur: x0 * 2 + L }
}

function svgDroiteFraction(dr, fleche = null) {
  const { y } = dr
  let s = `<line x1="${dr.x0 - 15}" y1="${y}" x2="${dr.x0 + dr.L + 15}" y2="${y}" stroke="#2c3e50" stroke-width="3"/>`
  for (const t of dr.ticks) {
    const h = t.unite ? 16 : 9
    s += `<line x1="${t.x}" y1="${y - h}" x2="${t.x}" y2="${y + h}" stroke="#2c3e50" stroke-width="${t.unite ? 3 : 2}"/>`
    if (t.label !== null) s += `<text x="${t.x}" y="${y + 40}" font-size="26" font-weight="700" text-anchor="middle" fill="#2c3e50" font-family="Arial, sans-serif">${t.label}</text>`
  }
  if (fleche !== null) {
    const x = dr.ticks[fleche].x
    s += `<line x1="${x}" y1="${y - 48}" x2="${x}" y2="${y - 18}" stroke="#e74c3c" stroke-width="4"/>`
    s += `<polygon points="${x - 9},${y - 22} ${x + 9},${y - 22} ${x},${y - 10}" fill="#e74c3c"/>`
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${dr.largeur} 110" width="${dr.largeur}" style="max-width:100%;height:auto;">${s}</svg>`
}

function tirerPointDroite(niv) {
  const unites = (niv.droiteUnites || [1])[aleatoire(0, (niv.droiteUnites || [1]).length - 1)]
  const dens = niv.denominateurs.filter(d => d * unites <= 12)   // graduations assez larges pour un doigt
  const d = dens[aleatoire(0, dens.length - 1)]
  let k
  do { k = aleatoire(1, unites * d - 1) } while (k % d === 0)
  return { dr: droiteFraction(unites, d), f: { n: k, d } }
}

function genDroite(niv) {
  const { dr, f } = tirerPointDroite(niv)
  const candidats = melanger([
    { n: f.n, d: dr.unites * dr.d },  // compte toutes les graduations
    { n: f.n + 1, d: f.d }, { n: f.n - 1, d: f.d }, { n: f.n, d: f.d + 1 }, { n: f.d, d: f.n },
  ])
  const choix = [f]
  for (const c of candidats) {
    if (choix.length === 4) break
    if (c.n < 1 || !niv.denominateurs.includes(c.d) || c.n === c.d || egales(c, f) || choix.some(x => cle(x) === cle(c))) continue
    choix.push(c)
  }
  let essais = 0
  while (choix.length < 4 && essais++ < 200) {
    const dd = Math.random() < 0.6 ? f.d : niv.denominateurs[aleatoire(0, niv.denominateurs.length - 1)]
    const c = { n: aleatoire(1, 2 * dd - 1), d: dd }
    if (c.n !== c.d && !egales(c, f) && !choix.some(x => cle(x) === cle(c))) choix.push(c)
  }
  return {
    type: 'droite', kind: 'choix', choixEn: 'frac', cle: `dr${dr.unites}-${cle(f)}`,
    consigne: `Quelle fraction montre la flèche ? (l'unité est partagée en ${dr.d} parts égales)`,
    svg: svgDroiteFraction(dr, f.n), droite: dr, reponse: f, choix: melanger(choix),
    libelle: `Droite de 0 à ${dr.unites}, flèche`, attendu: cle(f),
  }
}

function genPlacer(niv) {
  const { dr, f } = tirerPointDroite(niv)
  return {
    type: 'placer', kind: 'placer', cle: `pl${dr.unites}-${cle(f)}`,
    consigne: 'Place la fraction', fracConsigne: f, consigneFin: ' sur la droite : touche la bonne graduation.',
    droite: dr, reponse: f,
    libelle: `Placer ${cle(f)} (droite de 0 à ${dr.unites})`, attendu: `${f.n}${f.n > 1 ? 'e' : 're'} graduation après 0`,
  }
}

const GENERATEURS = {
  identifier: genIdentifier, colorier: genColorier, lettres: genLettres, partDe: genPartDe,
  unite: genUnite, egales: genEgales, droite: genDroite, placer: genPlacer,
}

function genererQuestion(cfg, type) {
  const niv = NIVEAUX[cfg.niveau] || NIVEAUX.ce1
  return GENERATEURS[type](niv, MODES[cfg.mode] ? cfg.mode : 'toutes')
}

function genererSansRepetition(cfg, nb) {
  const niv = NIVEAUX[cfg.niveau] || NIVEAUX.ce1
  let types = cfg.types.filter(t => GENERATEURS[t] && niv.types.includes(t))
  if (!types.length) types = niv.types
  const ordre = melanger(Array.from({ length: nb }, (_, i) => types[i % types.length]))
  const vus = new Set()
  const result = []
  let essais = 0, echecs = 0
  while (result.length < nb && essais < nb * 50) {
    essais++
    const type = echecs > 20 ? types[aleatoire(0, types.length - 1)] : ordre[result.length]
    const qu = genererQuestion(cfg, type)
    if (!vus.has(qu.cle)) { vus.add(qu.cle); result.push(qu); echecs = 0 } else echecs++
  }
  return result
}

// SVG en texte (fiche imprimable)
function formeEnSvg(forme, colorees = []) {
  const paths = forme.parts.map((p, i) =>
    `<path d="${p}" fill="${colorees.includes(i) ? '#bbbbbb' : '#ffffff'}" stroke="#222" stroke-width="2.5" stroke-linejoin="round"/>`).join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${forme.viewBox}" width="${Math.round(forme.largeur * 0.6)}">${paths}</svg>`
}

// #endregion generation
export { NIVEAUX, TYPES, GENERATEURS, genererSansRepetition, enLettres, formeEnSvg, MODES }