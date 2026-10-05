// @ts-check
// Les fractions — formes découpées en parts égales (disque, rectangle, barre) : géométrie pure, chemins SVG.
// forme : { type, parts: ['M… Z', …], viewBox, largeur } ; la vue colorie les parts (<path>), la fiche appelle formeEnSvg.
const r2 = x => Math.round(x * 100) / 100

export function formeDisque(d) {
  const cx = 70, cy = 70, r = 62
  const parts = []
  for (let i = 0; i < d; i++) {
    const a0 = -Math.PI / 2 + 2 * Math.PI * i / d, a1 = a0 + 2 * Math.PI / d
    parts.push(`M${cx} ${cy} L${r2(cx + r * Math.cos(a0))} ${r2(cy + r * Math.sin(a0))} A${r} ${r} 0 0 1 ${r2(cx + r * Math.cos(a1))} ${r2(cy + r * Math.sin(a1))} Z`)
  }
  return { type: 'disque', parts, viewBox: '0 0 140 140', largeur: 200 }
}

// Rectangle quadrillé : 2 lignes quand c'est possible (4 = 2×2, 6 = 2×3, 8 = 2×4, 10 = 2×5)
export function formeRectangle(d) {
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

export function formeBarre(d) {
  const W = 320, H = 50, w = W / d
  const parts = Array.from({ length: d }, (_, i) => `M${r2(4 + i * w)} 4 h${r2(w)} v${H} h${r2(-w)} Z`)
  return { type: 'barre', parts, viewBox: `0 0 ${W + 8} ${H + 8}`, largeur: 340 }
}

// SVG en texte (fiche imprimable) : parts coloriées en gris
export function formeEnSvg(forme, colorees = []) {
  const paths = forme.parts.map((p, i) =>
    `<path d="${p}" fill="${colorees.includes(i) ? '#bbbbbb' : '#ffffff'}" stroke="#222" stroke-width="2.5" stroke-linejoin="round"/>`).join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${forme.viewBox}" width="${Math.round(forme.largeur * 0.6)}">${paths}</svg>`
}
