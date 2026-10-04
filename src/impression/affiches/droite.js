// Affiche de la droite numérique. CP : nombres jusqu'à 100 ; CE1 : jusqu'à 1 000 (programme du cycle 2)
import { echapper } from '../../utils/impression'
import { enLettresFr } from '../../utils/nombres.js'
import { COULEURS, cm, txt } from './cadre.js'

export const titre = c => `La droite numérique de 0 à ${cm(+c.variante)}`

export function dessin(cfg, W, H) {
  const max = +cfg.variante || 100
  const pas = max === 1000 ? 10 : 1
  const grosPas = max === 20 ? 10 : max === 100 ? 10 : 100
  const moyenPas = max === 20 ? 5 : max === 100 ? 5 : 50
  // la légende est un paragraphe sous le dessin (retour à la ligne automatique)
  const hAide = 14 * Math.min(H / 130, 1.7)
  H -= hAide
  const u = Math.min(H / 130, 1.7), x0 = 12, x1 = W - 12, y = H * 0.38
  const n = max / pas
  const px = v => x0 + (v / max) * (x1 - x0)
  let s = ''
  // bandes alternées : une par dizaine (0–100, 0–20) ou par centaine (0–1 000)
  for (let b = 0; b * grosPas < max; b++) {
    s += `<rect x="${px(b * grosPas)}" y="${y - 30 * u}" width="${px(grosPas) - x0}" height="${H * 0.66}" fill="${b % 2 ? '#eef3fb' : '#fff8ef'}"/>`
  }
  s += `<line x1="${x0 - 6}" y1="${y}" x2="${x1 + 6}" y2="${y}" stroke="#222" stroke-width="${1.1 * u}" marker-end="url(#fleche)"/>`
  // écart entre deux nombres écrits : de 0 à 20, chaque trait a son nombre (2 chiffres doivent tenir)
  const ecart = px(max === 20 ? 1 : grosPas) - x0
  const taillePolice = Math.min(7.5 * u, ecart * 0.85)
  for (let i = 0; i <= n; i++) {
    const v = i * pas
    const gros = v % grosPas === 0, moyen = v % moyenPas === 0
    const h = (gros ? 9 : moyen ? 6 : 3.5) * u
    const couleur = COULEURS[Math.floor(v / grosPas) % COULEURS.length]
    s += `<line x1="${px(v)}" y1="${y - h}" x2="${px(v)}" y2="${y + h}" stroke="${gros ? couleur : '#555'}" stroke-width="${gros ? 0.9 : 0.4}"/>`
    if (max === 20 || gros) s += txt(px(v), y - h - 6 * u, cm(v), gros ? Math.min(taillePolice * 1.1, ecart * 0.95) : taillePolice, { gras: gros, couleur: gros ? couleur : '#222' })
    // le nom du nombre, écrit à la verticale sous la graduation
    if (max === 20 || gros) s += txt(px(v), y + h + 4 * u, enLettresFr(v), (max === 20 ? 5 : 5.2) * u * 1.15, { ancre: 'start', rot: 90, couleur: '#555' })
  }
  const aide = {
    20: 'Je saute de 1 en 1 : chaque trait est un nombre de plus. Le trait long est la dizaine (10).',
    100: 'Chaque dizaine est un trait long. Entre deux dizaines, je compte de 1 en 1. Le trait moyen est le milieu (5).',
    1000: 'Chaque centaine est un trait long, chaque dizaine un petit trait. Entre 0 et 1 000, il y a 10 centaines.',
  }[max]
  return `<svg width="${W}mm" height="${H}mm" viewBox="0 0 ${W} ${H}"><defs><marker id="fleche" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#222"/></marker></defs>${s}</svg>`
    + `<p class="aide-droite" style="height:${hAide}mm;font-size:${5.2 * u}mm">${echapper(aide)}</p>`
}

export const css = `
  .aide-droite { flex: none; width: 85%; text-align: center; color: #555; line-height: 1.25; display: flex; align-items: center; justify-content: center; }`
