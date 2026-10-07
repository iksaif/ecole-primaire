// #region generation — fonctions pures (testables hors de Vue)

// Données par niveau : plages proposées, pas des droites graduées et des suites.
const NIVEAUX = {
  ce1: {
    plages: [100, 1000],
    pasDroite: { 100: [1, 10], 1000: [1, 10, 100] },
    pasSuites: { 100: [1, 2, 5, 10], 1000: [1, 10, 100] },
    pasPlusMoins: { 100: [10], 1000: [10, 100] },
    nbRanger: 5,
  },
  ce2: {
    plages: [1000, 10000],
    pasDroite: { 1000: [1, 10, 100], 10000: [10, 100, 1000] },
    pasSuites: { 1000: [1, 10, 100], 10000: [10, 100, 1000] },
    pasPlusMoins: { 1000: [10, 100], 10000: [10, 100, 1000] },
    nbRanger: 5,
  },
}

const TYPES = [
  { id: 'decomposer',      label: '🧱 Décomposer' },
  { id: 'representation',  label: '🟦 Représentation' },
  { id: 'lettresChiffres', label: '✏️ Écrire en chiffres' },
  { id: 'chiffresLettres', label: '🔤 Écrire en lettres' },
  { id: 'comparer',        label: '⚖️ Comparer' },
  { id: 'suites',          label: '➡️ Suivant / suites' },
  { id: 'droite',          label: '📏 Droite graduée' },
  { id: 'ranger',          label: '📶 Ranger' },
]

// Titres des cases (pluriel) et noms au singulier pour les accords
const LIBELLES_CDU = { milliers: 'milliers', centaines: 'centaines', dizaines: 'dizaines', unites: 'unités' }
const SINGULIERS_CDU = { milliers: 'millier', centaines: 'centaine', dizaines: 'dizaine', unites: 'unité' }
const VALEURS_CDU = { milliers: 1000, centaines: 100, dizaines: 10, unites: 1 }

function pluriel(n, mot) {
  return n >= 2 ? mot + 's' : mot
}
const libCdu = (v, champ) => `${v} ${pluriel(v, SINGULIERS_CDU[champ])}`

// 10 000 s'écrit avec une espace ; en dessous on garde 3 400 sans espace (plus simple à recopier)
const fmt = n => n >= 10000 ? String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : String(n)

const nbChiffres = max => max <= 100 ? 2 : max <= 1000 ? 3 : 4
const champsPour = max => ['milliers', 'centaines', 'dizaines', 'unites'].slice(4 - nbChiffres(max))
const chiffresDe = n => String(n).split('').map(Number)

// Tire un nombre « intéressant » ayant le nombre de chiffres de la plage,
// avec régulièrement des 0 (305, 340, 4 060) et des dizaines 70/80/90.
function tirerNombre(max, { zeros = true, dizainesDifficiles = 0.2 } = {}) {
  const k = nbChiffres(max)
  const ch = [aleatoire(1, 9), ...Array.from({ length: k - 1 }, () => aleatoire(0, 9))]
  if (Math.random() < dizainesDifficiles) ch[k - 2] = aleatoire(7, 9)
  if (zeros) {
    if (k === 2 && Math.random() < 0.15) ch[1] = 0
    if (k >= 3 && Math.random() < 0.3) ch[aleatoire(1, k - 1)] = 0
    if (k === 4 && Math.random() < 0.15) ch[aleatoire(1, k - 1)] = 0
  }
  return +ch.join('')
}

function genDecomposer(niv, max) {
  const n = tirerNombre(max)
  const dec = decomposer(n)
  const champs = champsPour(max)
  const reponse = Object.fromEntries(champs.map(ch => [ch, dec[ch]]))
  const attendu = champs.map(ch => libCdu(reponse[ch], ch)).join(' ')
  const noms = champs.map(ch => LIBELLES_CDU[ch])
  if (Math.random() < 0.5) {
    return {
      type: 'decomposer', kind: 'cdu', cle: 'dec' + n,
      consigne: `Décompose le nombre en ${noms.slice(0, -1).join(', ')} et ${noms[noms.length - 1]}.`,
      texte: fmt(n), champs, reponse,
      libelle: `${fmt(n)} = ?`, attendu,
    }
  }
  // Recomposer : on omet les termes nuls (piège : 3 centaines + 7 unités = 307)
  let termes = champs.filter(ch => reponse[ch]).map(ch => libCdu(reponse[ch], ch))
  if (termes.length > 1 && Math.random() < 0.3) termes = melanger(termes)
  const texte = termes.join(' + ')
  return {
    type: 'decomposer', kind: 'nombre', cle: 'rec' + texte,
    consigne: 'Écris le nombre.', texte, texteLong: true, reponse: n,
    libelle: `${texte} = ?`, attendu: fmt(n),
  }
}

// Dessin SVG du matériel base 10 : gros cubes (1000), plaques (100), barres (10), cubes (1)
function svgBase10(m, c, d, u) {
  const s = 8, L = 10 * s, gap = 8
  let x = 4
  const parts = []
  const lignes = (x0, y0, w, h, nx, ny, coul) => {
    let r = ''
    for (let i = 1; i < nx; i++) r += `<line x1="${x0 + i * s}" y1="${y0}" x2="${x0 + i * s}" y2="${y0 + h}" stroke="${coul}" stroke-width="0.7"/>`
    for (let j = 1; j < ny; j++) r += `<line x1="${x0}" y1="${y0 + j * s}" x2="${x0 + w}" y2="${y0 + j * s}" stroke="${coul}" stroke-width="0.7"/>`
    return r
  }
  let hauteur = L
  // Gros cubes (1000) en perspective : face avant quadrillée + dessus + côté
  if (m > 0) {
    const p = 22, C = L - p  // profondeur, côté de la face avant
    for (let i = 0; i < m; i++) {
      const px = x + (i % 5) * (L + gap), py = 4 + Math.floor(i / 5) * (L + gap)
      const fx = px, fy = py + p
      parts.push(`<polygon points="${fx},${fy} ${fx + p},${py} ${fx + p + C},${py} ${fx + C},${fy}" fill="#e6d5f5" stroke="#6c3483" stroke-width="1.5"/>`)
      parts.push(`<polygon points="${fx + C},${fy} ${fx + C + p},${py} ${fx + C + p},${py + C} ${fx + C},${fy + C}" fill="#c9a6e4" stroke="#6c3483" stroke-width="1.5"/>`)
      parts.push(`<rect x="${fx}" y="${fy}" width="${C}" height="${C}" fill="#ddc4f0" stroke="#6c3483" stroke-width="1.5"/>`)
      for (let k = 1; k < 10; k++) {
        parts.push(`<line x1="${fx + k * C / 10}" y1="${fy}" x2="${fx + k * C / 10}" y2="${fy + C}" stroke="#9b6fc0" stroke-width="0.6"/>`)
        parts.push(`<line x1="${fx}" y1="${fy + k * C / 10}" x2="${fx + C}" y2="${fy + k * C / 10}" stroke="#9b6fc0" stroke-width="0.6"/>`)
      }
    }
    hauteur = Math.max(hauteur, Math.ceil(m / 5) * (L + gap) - gap)
    x += Math.min(m, 5) * (L + gap) + 12
  }
  // Plaques : 5 par ligne
  if (c > 0) {
    for (let i = 0; i < c; i++) {
      const px = x + (i % 5) * (L + gap), py = 4 + Math.floor(i / 5) * (L + gap)
      parts.push(`<rect x="${px}" y="${py}" width="${L}" height="${L}" fill="#cfe3fb" stroke="#2f6db3" stroke-width="1.5"/>`)
      parts.push(lignes(px, py, L, L, 10, 10, '#6fa0d8'))
    }
    hauteur = Math.max(hauteur, Math.ceil(c / 5) * (L + gap) - gap)
    x += Math.min(c, 5) * (L + gap) + 12
  }
  // Barres verticales
  if (d > 0) {
    for (let i = 0; i < d; i++) {
      const bx = x + i * (s + 6)
      parts.push(`<rect x="${bx}" y="4" width="${s}" height="${L}" fill="#d4f0d4" stroke="#3d8b3d" stroke-width="1.5"/>`)
      parts.push(lignes(bx, 4, s, L, 1, 10, '#7cc47c'))
    }
    x += d * (s + 6) + 12
  }
  // Cubes : colonnes de 5
  if (u > 0) {
    for (let i = 0; i < u; i++) {
      const cx = x + Math.floor(i / 5) * (s + 6), cy = 4 + (i % 5) * (s + 6)
      parts.push(`<rect x="${cx}" y="${cy}" width="${s}" height="${s}" fill="#fde3b8" stroke="#c77c00" stroke-width="1.5"/>`)
    }
    x += Math.ceil(u / 5) * (s + 6)
  }
  const w = x + 4, h = hauteur + 8
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${Math.min(w * 1.5, 900)}" style="max-width:100%;height:auto;">${parts.join('')}</svg>`
}

function genRepresentation(niv, max) {
  const n = tirerNombre(max, { dizainesDifficiles: 0 })
  let { milliers: m, centaines: c, dizaines: d, unites: u } = decomposer(n)
  // Parfois plus de 9 cubes : il faut faire un échange (1 dizaine = 10 unités)
  if (Math.random() < 0.2 && d >= 1 && u <= 4) { d -= 1; u += 10 }
  const morceaux = []
  if (m) morceaux.push(`${m} gros cube${m > 1 ? 's' : ''}`)
  if (c) morceaux.push(`${c} plaque${c > 1 ? 's' : ''}`)
  morceaux.push(`${d} barre${d > 1 ? 's' : ''}`, `${u} cube${u > 1 ? 's' : ''}`)
  return {
    type: 'representation', kind: 'nombre', cle: `rep${m}-${c}-${d}-${u}`,
    consigne: 'Quel nombre est représenté ?', texte: '', reponse: n, milliers: m > 0 || max > 1000,
    svg: svgBase10(m, c, d, u), libelle: morceaux.join(', '), attendu: fmt(n),
  }
}

function genLettresChiffres(niv, max) {
  const n = tirerNombre(max, { dizainesDifficiles: 0.35 })
  const texte = enLettresFr(n)
  return {
    type: 'lettresChiffres', kind: 'nombre', cle: 'lc' + n,
    consigne: 'Écris ce nombre en chiffres.', texte, texteLong: true, reponse: n,
    libelle: texte, attendu: fmt(n),
  }
}

// Distracteurs plausibles pour l'écriture en lettres
function distracteurs(n, max, nb = 3) {
  const ch = chiffresDe(n), k = ch.length
  const d = ch[k - 2], u = ch[k - 1]
  const ok = v => Number.isInteger(v) && v >= 10 && v <= max && v !== n
  const pieges = []
  if (d === 7 || d === 9) pieges.push(n - 10)          // soixante-quinze / soixante-cinq
  if (d === 6 || d === 8) pieges.push(n + 10)          // soixante-cinq / soixante-quinze
  if (d === 8) pieges.push(n - 60)                     // quatre-vingt-deux / vingt-deux
  if (d === 2) pieges.push(n + 60)
  // 0 mal placé : 2 030 / 2 300 / 2 003
  for (let i = 1; i < k; i++) for (let j = 1; j < k; j++) {
    if (i !== j && ch[i] === 0 && ch[j] !== 0) {
      const t = [...ch]; [t[i], t[j]] = [t[j], t[i]]; pieges.push(+t.join(''))
    }
  }
  // chiffres échangés
  const perms = []
  for (let i = 0; i < k; i++) for (let j = i + 1; j < k; j++) {
    const t = [...ch]; [t[i], t[j]] = [t[j], t[i]]
    if (t[0] !== 0) perms.push(+t.join(''))
  }
  const voisins = [n + 10, n - 10, n + 1, n - 1]
  if (k >= 3) voisins.push(n + 100, n - 100)
  if (k >= 4) voisins.push(n + 1000, n - 1000)
  void u
  const res = []
  for (const v of [...melanger(pieges), ...melanger(perms), ...melanger(voisins)]) {
    if (ok(v) && !res.includes(v)) res.push(v)
    if (res.length === nb) break
  }
  let essais = 0
  while (res.length < nb && essais++ < 100) {
    const v = aleatoire(10, max - 1)
    if (ok(v) && !res.includes(v)) res.push(v)
  }
  return res
}

function genChiffresLettres(niv, max) {
  const n = tirerNombre(max, { dizainesDifficiles: 0.4 })
  const bonne = enLettresFr(n)
  const choix = melanger([bonne, ...distracteurs(n, max).map(v => enLettresFr(v))])
  return {
    type: 'chiffresLettres', kind: 'choix', cle: 'cl' + n,
    consigne: 'Comment s\'écrit ce nombre en lettres ?', texte: fmt(n), reponse: bonne, choix,
    libelle: fmt(n), attendu: bonne,
  }
}

function genComparer(niv, max) {
  const a = tirerNombre(max, { dizainesDifficiles: 0 })
  const ch = chiffresDe(a), k = ch.length
  let b
  const r = Math.random()
  if (r < 0.1) b = a
  else if (r < 0.35) {                                                   // deux chiffres échangés
    const i = aleatoire(Math.min(1, k - 2), k - 2), t = [...ch];
    [t[i], t[i + 1]] = [t[i + 1], t[i]]; b = +t.join('')
  }
  else if (r < 0.6) b = a - a % 10 + aleatoire(0, 9)                      // même dizaine
  else if (r < 0.75 && k > 2) b = tirerNombre(Math.pow(10, k - 1))        // un chiffre de moins
  else b = a - a % Math.pow(10, k - 1) + aleatoire(0, Math.pow(10, k - 1) - 1)  // même premier chiffre
  if (b < 1 || (b === a && r >= 0.1)) b = a + (Math.random() < 0.5 ? 1 : 10)
  if (b > max) b = a - 1
  const [x, y] = Math.random() < 0.5 ? [a, b] : [b, a]
  const reponse = x < y ? '<' : x > y ? '>' : '='
  return {
    type: 'comparer', kind: 'choix', cle: `cmp${x}-${y}`,
    consigne: 'Choisis le bon signe : < , = ou >', texte: `${fmt(x)}  …  ${fmt(y)}`, reponse, choix: ['<', '=', '>'],
    libelle: `${fmt(x)} … ${fmt(y)}`, attendu: `${fmt(x)} ${reponse} ${fmt(y)}`,
  }
}

function genSuites(niv, max) {
  const r = Math.random()
  if (r < 0.2) {
    // juste après / juste avant, souvent sur un passage de dizaine, centaine ou millier
    const apres = Math.random() < 0.5
    let n = tirerNombre(max, { zeros: false, dizainesDifficiles: 0 })
    if (Math.random() < 0.5) n = apres ? n - n % 10 + 9 : n - n % 10
    if (max > 100 && Math.random() < 0.3) n = apres ? n - n % 100 + 99 : n - n % 100
    if (max > 1000 && Math.random() < 0.3) n = apres ? n - n % 1000 + 999 : n - n % 1000
    if (n < 1) n = 10
    const rep = apres ? n + 1 : n - 1
    const texte = `Le nombre juste ${apres ? 'après' : 'avant'} ${fmt(n)}`
    return {
      type: 'suites', kind: 'nombre', cle: 'sv' + texte, consigne: 'Trouve le nombre.',
      texte, texteLong: true, reponse: rep, libelle: texte, attendu: fmt(rep),
    }
  }
  if (r < 0.45) {
    // + 10, − 10, + 100, − 100, + 1000… souvent avec un passage (395 + 10, 305 − 10, 3 950 + 100)
    const pasPossibles = niv.pasPlusMoins[max]
    const pas = pasPossibles[aleatoire(0, pasPossibles.length - 1)]
    const plus = Math.random() < 0.5
    const bloc = pas * 10
    const passage = bloc < max && Math.random() < 0.5
    let n
    if (plus) n = passage ? bloc * aleatoire(0, max / bloc - 2) + (bloc - pas) + aleatoire(0, pas - 1) : aleatoire(1, max - pas)
    else n = passage ? bloc * aleatoire(1, max / bloc - 1) + aleatoire(0, pas - 1) : aleatoire(pas, max)
    const rep = plus ? n + pas : n - pas
    const texte = `${fmt(n)} ${plus ? '+' : '−'} ${fmt(pas)} = ?`
    return {
      type: 'suites', kind: 'nombre', cle: 'pm' + texte, consigne: 'Calcule.',
      texte, reponse: rep, libelle: texte, attendu: fmt(rep),
    }
  }
  // Suite à compléter
  const pasPossibles = niv.pasSuites[max]
  const pas = pasPossibles[aleatoire(0, pasPossibles.length - 1)]
  const nbTermes = 5
  const etendue = pas * (nbTermes - 1)
  let debut
  if (pas >= 10 && pas * 10 >= max) debut = (pas / 10) * aleatoire(0, (max - etendue) / (pas / 10))  // 200, 300… ou 250, 350…
  else if (pas >= 10) {
    // passage : 370, 380, 390, 400… ou 375, 385, 395, 405…
    const bloc = pas * 10
    const cible = bloc * aleatoire(1, max / bloc - 1)
    debut = cible - pas * aleatoire(1, nbTermes - 2) - (Math.random() < 0.4 ? aleatoire(1, 9) * (pas / 10) : 0)
  } else {
    // pas de 1, 2 ou 5 : passage de dizaine (58, 59, 60…) ou de centaine (398, 399, 400…)
    const bloc = max > 100 && Math.random() < 0.4 ? 100 : 10
    const cible = bloc * aleatoire(1, max / bloc - 1)
    debut = cible - pas * aleatoire(1, nbTermes - 2)
  }
  debut = Math.max(0, Math.min(debut, max - etendue))
  let termes = Array.from({ length: nbTermes }, (_, i) => debut + i * pas)
  if (Math.random() < 0.25) termes.reverse()
  const trou = aleatoire(1, nbTermes - 1)
  const rep = termes[trou]
  const texte = termes.map((t, i) => i === trou ? '?' : fmt(t)).join(', ')
  return {
    type: 'suites', kind: 'nombre', cle: 'su' + texte, consigne: 'Complète la suite.',
    texte, texteLong: true, reponse: rep, termes, trou, libelle: texte, attendu: fmt(rep),
  }
}

// Droite graduée : 11 graduations, extrémités notées, flèche sur une graduation
function svgDroite(debut, pas, k, { fleche = true } = {}) {
  const x0 = 50, ecart = 50, y = 70
  let s = `<line x1="${x0 - 20}" y1="${y}" x2="${x0 + 10 * ecart + 20}" y2="${y}" stroke="#2c3e50" stroke-width="3"/>`
  for (let i = 0; i <= 10; i++) {
    const x = x0 + i * ecart
    const h = i === 0 || i === 10 ? 16 : i === 5 ? 13 : 9
    s += `<line x1="${x}" y1="${y - h}" x2="${x}" y2="${y + h}" stroke="#2c3e50" stroke-width="${i % 5 === 0 ? 3 : 2}"/>`
  }
  s += `<text x="${x0}" y="${y + 40}" font-size="20" font-weight="700" text-anchor="middle" fill="#2c3e50" font-family="Arial, sans-serif">${fmt(debut)}</text>`
  s += `<text x="${x0 + 10 * ecart}" y="${y + 40}" font-size="20" font-weight="700" text-anchor="middle" fill="#2c3e50" font-family="Arial, sans-serif">${fmt(debut + 10 * pas)}</text>`
  if (fleche) {
    const x = x0 + k * ecart
    s += `<line x1="${x}" y1="${y - 48}" x2="${x}" y2="${y - 18}" stroke="#e74c3c" stroke-width="4"/>`
    s += `<polygon points="${x - 9},${y - 22} ${x + 9},${y - 22} ${x},${y - 10}" fill="#e74c3c"/>`
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 120" width="600" style="max-width:100%;height:auto;">${s}</svg>`
}

function genDroite(niv, max) {
  const pasPossibles = niv.pasDroite[max]
  const pas = pasPossibles[aleatoire(0, pasPossibles.length - 1)]
  const etendue = 10 * pas
  const debut = etendue * aleatoire(0, max / etendue - 1)
  const k = aleatoire(1, 9)
  const rep = debut + k * pas
  return {
    type: 'droite', kind: 'nombre', cle: `dr${debut}-${pas}-${k}`,
    consigne: `Quel nombre montre la flèche ? (on avance de ${fmt(pas)} à chaque graduation)`,
    texte: '', svg: svgDroite(debut, pas, k), reponse: rep,
    debut, pas, k,
    libelle: `Droite de ${fmt(debut)} à ${fmt(debut + etendue)}`, attendu: fmt(rep),
  }
}

function genRanger(niv, max) {
  const nb = niv.nbRanger
  const vus = new Set()
  const base = tirerNombre(max, { dizainesDifficiles: 0 })
  vus.add(base)
  const ch = chiffresDe(base), k = ch.length
  // deux derniers chiffres inversés (piège classique : 352 / 325)
  const t = [...ch]; [t[k - 2], t[k - 1]] = [t[k - 1], t[k - 2]]
  const inv = +t.join('')
  if (inv >= 10 && inv <= max) vus.add(inv)
  const unite = Math.pow(10, k - 1)          // 10, 100 ou 1000
  const tete = ch[0]
  let essais = 0
  while (vus.size < nb && essais++ < 200) {
    let v
    if (k === 2) v = aleatoire(10, 99)
    else v = (Math.random() < 0.6 ? tete : aleatoire(Math.max(1, tete - 1), Math.min(9, tete + 1))) * unite + aleatoire(0, unite - 1)
    if (v >= 1 && v <= max) vus.add(v)
  }
  const nombres = melanger([...vus])
  const reponse = [...nombres].sort((a, b) => a - b)
  return {
    type: 'ranger', kind: 'ordre', cle: 'rg' + reponse.join('-'),
    consigne: 'Clique sur les nombres du plus petit au plus grand.', texte: '', nombres, reponse,
    libelle: nombres.map(fmt).join(' ; '), attendu: reponse.map(fmt).join(' < '),
  }
}

const GENERATEURS = {
  decomposer: genDecomposer,
  representation: genRepresentation,
  lettresChiffres: genLettresChiffres,
  chiffresLettres: genChiffresLettres,
  comparer: genComparer,
  suites: genSuites,
  droite: genDroite,
  ranger: genRanger,
}

function genererQuestion(cfg) {
  const niv = NIVEAUX[cfg.niveau] || NIVEAUX.ce1
  const max = niv.plages.includes(cfg.plage) ? cfg.plage : niv.plages[niv.plages.length - 1]
  const types = cfg.types.filter(t => GENERATEURS[t])
  const t = types.length ? types[aleatoire(0, types.length - 1)] : 'decomposer'
  return GENERATEURS[t](niv, max)
}

// Répartit les types pour bien mélanger, sans répétition de question
function genererSansRepetition(cfg, nb) {
  const types = cfg.types.filter(t => GENERATEURS[t])
  const ordre = melanger(Array.from({ length: nb }, (_, i) => types[i % types.length]))
  const vus = new Set()
  const result = []
  let essais = 0, echecs = 0
  while (result.length < nb && essais < nb * 50) {
    essais++
    // si un type n'a plus de question neuve (peu de droites possibles…), on en prend un autre
    const type = echecs > 20 ? types[aleatoire(0, types.length - 1)] : ordre[result.length]
    const q = genererQuestion({ ...cfg, types: [type] })
    if (!vus.has(q.cle)) { vus.add(q.cle); result.push(q); echecs = 0 } else echecs++
  }
  return result
}

// #endregion generation
