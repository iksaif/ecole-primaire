// @ts-check
// Matériel base 10 (Numération) : dessin SVG pur, gros cubes (1000), plaques (100), barres (10), cubes (1).
export function svgBase10(m, c, d, u) {
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
