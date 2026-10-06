// Le matériel de numération en base 10 — LE dessin (SVG, pur : lisible par node) : gros cubes (1000), plaques (100), barres (10),
// cubes (1). Partagé par l'exercice « Les nombres » (jeu et fiche : src/exercices/numeration/, `svgBase10`) et par l'affiche des
// nombres (src/affiches/nombres/, `representation`) : un seul dessin, donc les mêmes plaques, barres et cubes partout, avec les mêmes
// couleurs (unités orange, dizaines vertes, centaines bleues, milliers violets).
//   svgBase10(m, c, d, u)                       l'exercice : m gros cubes, c plaques, d barres, u cubes, en pixels
//   representation(type, n, h, largeurMax)      l'affiche : les unités (n cubes), les dizaines (n/10 barres) ou les centaines (n/100
//                                               plaques), à la hauteur h (mm), réduites si elles dépassent la largeur maximale

/** Ce que montre une représentation d'affiche. */
export type TypeRepresentation = 'unites' | 'dizaines' | 'centaines'

const COULEURS = {
  cube: { fond: '#fde3b8', trait: '#c77c00' },
  barre: { fond: '#d4f0d4', trait: '#3d8b3d', graduation: '#7cc47c' },
  plaque: { fond: '#cfe3fb', trait: '#2f6db3', graduation: '#6fa0d8' },
} as const

// Les traits sont dessinés pour l'exercice (pixels : plaque de 80, cube de 8). `k` les met à l'échelle d'un dessin plus petit ou plus
// grand (l'affiche dessine en millimètres : sans `k`, une barre de 12 mm aurait des bordures de 1,5 mm et un quadrillage qui la noie).

// des traits réguliers (tous les `pas`) dans un rectangle : nx colonnes et ny rangées de cases
function lignes(x0: number, y0: number, w: number, h: number, nx: number, ny: number, coul: string, pas: number, k: number): string {
  let r = ''
  for (let i = 1; i < nx; i++) r += `<line x1="${x0 + i * pas}" y1="${y0}" x2="${x0 + i * pas}" y2="${y0 + h}" stroke="${coul}" stroke-width="${0.7 * k}"/>`
  for (let j = 1; j < ny; j++) r += `<line x1="${x0}" y1="${y0 + j * pas}" x2="${x0 + w}" y2="${y0 + j * pas}" stroke="${coul}" stroke-width="${0.7 * k}"/>`
  return r
}

/** Une plaque de 100 : carré de côté L, quadrillé de 10 × 10 cases. */
const plaque = (x: number, y: number, L: number, k = 1): string => {
  const c = COULEURS.plaque
  return `<rect x="${x}" y="${y}" width="${L}" height="${L}" fill="${c.fond}" stroke="${c.trait}" stroke-width="${1.5 * k}"/>${lignes(x, y, L, L, 10, 10, c.graduation, L / 10, k)}`
}
/** Une barre de 10 : largeur e, hauteur L, dix cases. */
const barre = (x: number, y: number, e: number, L: number, k = 1): string => {
  const c = COULEURS.barre
  return `<rect x="${x}" y="${y}" width="${e}" height="${L}" fill="${c.fond}" stroke="${c.trait}" stroke-width="${1.5 * k}"/>${lignes(x, y, e, L, 1, 10, c.graduation, L / 10, k)}`
}
/** Un cube-unité de côté s. */
const cube = (x: number, y: number, s: number, k = 1): string => {
  const c = COULEURS.cube
  return `<rect x="${x}" y="${y}" width="${s}" height="${s}" fill="${c.fond}" stroke="${c.trait}" stroke-width="${1.5 * k}"/>`
}

/** Le matériel d'une question : m gros cubes (1000), c plaques (100), d barres (10), u cubes (1), en pixels. */
export function svgBase10(m: number, c: number, d: number, u: number): string {
  const s = 8, L = 10 * s, gap = 8
  let x = 4
  const parts: string[] = []
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
    for (let i = 0; i < c; i++) parts.push(plaque(x + (i % 5) * (L + gap), 4 + Math.floor(i / 5) * (L + gap), L))
    hauteur = Math.max(hauteur, Math.ceil(c / 5) * (L + gap) - gap)
    x += Math.min(c, 5) * (L + gap) + 12
  }
  // Barres verticales
  if (d > 0) {
    for (let i = 0; i < d; i++) parts.push(barre(x + i * (s + 6), 4, s, L))
    x += d * (s + 6) + 12
  }
  // Cubes : colonnes de 5
  if (u > 0) {
    for (let i = 0; i < u; i++) parts.push(cube(x + Math.floor(i / 5) * (s + 6), 4 + (i % 5) * (s + 6), s))
    x += Math.ceil(u / 5) * (s + 6)
  }
  const w = x + 4, h = hauteur + 8
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${Math.min(w * 1.5, 900)}" style="max-width:100%;height:auto;">${parts.join('')}</svg>`
}

/**
 * La représentation d'un nombre sur l'affiche, à la hauteur h (mm) : n cubes rangés par 5 sur deux rangées (unités), n/10 barres
 * côte à côte (dizaines), n/100 plaques par 5 par rangée (centaines). Si elle dépasse `largeurMax`, tout le dessin est réduit.
 * Rend '' pour zéro (rien à montrer).
 */
export function representation(type: TypeRepresentation, n: number, h: number, largeurMax: number): string {
  const { w, corps } = dessinBrut(type, n, h)
  if (!corps) return ''
  const k = w > largeurMax ? largeurMax / w : 1
  return `<svg width="${w * k}mm" height="${h * k}mm" viewBox="0 0 ${w} ${h}">${corps}</svg>`
}

function dessinBrut(type: TypeRepresentation, n: number, h: number): { w: number, corps: string } {
  if (type === 'unites') {
    if (n === 0) return { w: h * 0.6, corps: '' }
    // des cubes rangés par 5 sur deux rangées (comme les cartes à points de la maternelle), assez écartés pour se compter un à un
    const cote = h / 3.4, pas = cote * 1.6, k = cote / 8
    const parRangee = Math.min(n, 5), rangees = n > 5 ? 2 : 1
    const haut = rangees * pas - (pas - cote)
    const y0 = (h - haut) / 2
    let s = ''
    for (let i = 0; i < n; i++) s += cube((i % 5) * pas, y0 + Math.floor(i / 5) * pas, cote, k)
    return { w: (parRangee - 1) * pas + cote, corps: s }
  }
  if (type === 'dizaines') {
    // une barre = dix cases carrées : largeur h / 10 au plus étroit ; élargie à h / 5 pour rester lisible à petite taille
    const e = h / 5, ecart = e * 0.6
    const nb = n / 10, k = h / 80
    let s = ''
    for (let i = 0; i < nb; i++) s += barre(i * (e + ecart), 0, e, h, k)
    return { w: nb * (e + ecart) - ecart, corps: s }
  }
  // centaines : plaques par rangées de 5, sans chevauchement pour pouvoir les compter. La taille d'une plaque est la MÊME pour tout
  // nombre (celle de deux rangées, le plus qu'il y ait : 1 000 = 10 plaques) : une plaque ne rétrécit pas quand il y en a plus ;
  // une seule rangée est centrée en hauteur
  const nb = n / 100, parRang = Math.min(nb, 5), rangs = Math.ceil(nb / 5)
  const ecart = h * 0.06
  const c = (h - ecart) / 2, k = c / 80
  const y0 = (h - (rangs * c + (rangs - 1) * ecart)) / 2
  let s = ''
  for (let i = 0; i < nb; i++) s += plaque((i % 5) * (c + ecart), y0 + Math.floor(i / 5) * (c + ecart), c, k)
  return { w: parRang * (c + ecart) - ecart, corps: s }
}
