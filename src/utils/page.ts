// Page imprimable : formats et document HTML (pages de taille fixe). Module pur, sans Vue ni Vite : lisible par node
// (cadre des affiches, tests). Les @font-face dépendent du navigateur : src/utils/impression.js les fournit avec
// fournirPolices(), à son chargement ; sans lui (node), le texte est en Arial.
import { echapper } from './html.js'

export type Format = 'A4' | 'A3'
export type Orientation = 'portrait' | 'landscape'

export const FORMATS: Record<Format, { w: number, h: number }> = {
  A4: { w: 210, h: 297 },
  A3: { w: 297, h: 420 },
}

/** Largeur et hauteur (mm) d'une page ; un format inconnu vaut A4. */
export function dimensionsPage(format: string = 'A4', orientation: string = 'portrait'): { w: number, h: number } {
  const f = FORMATS[format as Format] ?? FORMATS.A4
  return orientation === 'landscape' ? { w: f.h, h: f.w } : { w: f.w, h: f.h }
}

// (contenu du document) → @font-face à embarquer ; défini par src/utils/impression.js
let polices: (contenu: string) => string = () => ''
export const fournirPolices = (f: (contenu: string) => string): void => { polices = f }

const POLICE_SCRIPT = 'Andika'

/**
 * Document complet : chaque page est un <section class="page"> de taille fixe.
 * À l'écran les pages apparaissent comme des feuilles ; à l'impression, une par feuille.
 */
export function documentImpression({ titre, format = 'A4', orientation = 'portrait', css = '', pages }: {
  titre: string, format?: string, orientation?: string, css?: string, pages: string[]
}): string {
  const contenu = pages.join('') + css
  const { w, h } = dimensionsPage(format, orientation)
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8">
<title>${echapper(titre)}</title>
<style>
${polices(contenu)}
@page { size: ${format} ${orientation}; margin: 0; }
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { background: #e9ecef; }
body { font-family: '${POLICE_SCRIPT}', Arial, sans-serif; color: #222;
  -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.page { width: ${w}mm; height: ${h}mm; overflow: hidden; position: relative; background: white;
  margin: 0 auto 8mm; box-shadow: 0 2px 10px rgba(0,0,0,.18); }
@media print {
  html, body { background: white; }
  .page { margin: 0; box-shadow: none; break-after: page; }
  .page:last-child { break-after: auto; }
}
${css}
</style></head><body>
${pages.map(p => `<section class="page">${p}</section>`).join('\n')}
</body></html>`
}

