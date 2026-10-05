// Le dessin de l'affiche d'exemple : une fonction pure (réglages, zone, T) → HTML, sans Vue ni DOM (lisible par node).
// Le cadre (src/impression/affiches/cadre.ts) fournit la page, le titre, la marge et l'échelle A3 : le dessin ne connaît
// que sa zone { W, H } en millimètres, sous le titre, et la remplit.
//
// Pour un dessin plus riche, voir les affiches de main : l'horloge (SVG + légende), la droite (textes mesurés dans la
// police), les pièces (dessins partagés avec un exercice).
import { COULEURS, txt } from '../../impression/affiches/cadre.ts'
import { enLettresFr, enLettresBr } from '../../utils/nombres.js'
import type { Rendu } from '../types.ts'
import type { Reglages } from './definition.ts'

export const dessin: Rendu<Reglages>['dessin'] = (r, { W, H }, _T) => {
  const nombres = Array.from({ length: r.max - r.debut + 1 }, (_, i) => r.debut + i)
  // une case par nombre, toutes de la même largeur ; leur hauteur suit la largeur, sans dépasser la zone
  const l = W / nombres.length
  const h = Math.min(H, l * 2.4)
  const y0 = (H - h) / 2
  const enLettres = r.langue === 'fr' ? enLettresFr : enLettresBr
  let s = ''
  for (const n of nombres) {
    const x = (n - r.debut) * l
    // une couleur par groupe de 5 : on voit la main (5) et la dizaine (10) dans la bande
    const couleur = COULEURS[Math.floor(n / 5) % COULEURS.length]
    s += `<rect x="${x + 0.5}" y="${y0 + 0.5}" width="${l - 1}" height="${h - 1}" rx="2" fill="white" stroke="${couleur}" stroke-width="1"/>`
    s += txt(x + l / 2, y0 + h * 0.2, n, l * 0.5, { gras: true, couleur })
    // les points en deux rangées de 5, comme les doigts de deux mains : de quoi dénombrer sans compter un à un
    if (r.points) {
      for (let k = 0; k < n; k++) {
        const colonne = k % 5, rangee = Math.floor(k / 5)
        s += `<circle cx="${x + l * (0.14 + 0.18 * colonne)}" cy="${y0 + h * (0.44 + 0.11 * rangee)}" r="${l * 0.07}" fill="${couleur}"/>`
      }
    }
    if (r.lettres) s += txt(x + l / 2, y0 + h * 0.85, enLettres(n), Math.min(l * 0.22, 5), { couleur: '#555' })
  }
  return `<svg width="${W}mm" height="${H}mm" viewBox="0 0 ${W} ${H}">${s}</svg>`
}

// CSS propre à l'affiche (ajouté après celui du cadre) ; ici le cadre suffit
export const css = 'svg { display: block; flex: none; } svg text { font-family: inherit; }'
