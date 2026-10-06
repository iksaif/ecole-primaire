// Le dessin du troisième exemple : une rangée de texte par écriture choisie (script, attaché). Il ajuste la taille du texte à la
// largeur de la zone avec `contexte.mesure` : le dessin reste pur (sans canvas), et node l'exécute avec la mesure estimée,
// le navigateur avec le canvas. Une marge de 10 % absorbe l'écart d'estimation (src/affiches/mesure.ts).
import { echapper } from '../../utils/html.js'
import type { Rendu } from '../types.ts'
import type { Reglages } from './definition.ts'

export const dessin: Rendu<Reglages>['dessin'] = (r, { W, H }, _T, { police, nomPolice, mesure }) => {
  const contenu = r.serie === 'mot' ? r.mot || ' ' : r.serie === 'nombres'
    ? Array.from({ length: Math.abs(r.a - r.de) + 1 }, (_, i) => Math.min(r.de, r.a) + i).join(' ')
    : r.lettres.join(' ')
  const types = (['script', 'attache'] as const).filter(t => r.styles.includes(t))
  const rangee = H / types.length
  const svg = types.map((type, i) => {
    const largeur = mesure.largeur(contenu, nomPolice(type))
    // la taille : au plus 60 % de la hauteur de la rangée, et le texte tient dans 90 % de la largeur
    const taille = Math.min(rangee * 0.6, (W * 0.9) / Math.max(largeur, 0.1))
    return `<text x="${W / 2}" y="${rangee * (i + 0.5)}" font-size="${taille}" text-anchor="middle" dominant-baseline="central" `
      + `font-family="${echapper(police(type))}" fill="${r.pointilles ? '#aab' : '#222'}">${echapper(contenu)}</text>`
      + `<line x1="0" y1="${rangee * (i + 1)}" x2="${W}" y2="${rangee * (i + 1)}" stroke="#ccd" stroke-width="0.3"/>`
  }).join('')
  return [`<svg width="${W}mm" height="${H}mm" viewBox="0 0 ${W} ${H}">${svg}</svg>`]
}

export const css = 'svg { display: block; flex: none; }'
