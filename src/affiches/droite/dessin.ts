// Le dessin de l'affiche de la droite numérique : pur. Une droite graduée en bandes de couleur (une par dizaine, ou par centaine
// de 0 à 1 000), chaque nombre au-dessus de son trait et son nom en lettres écrit à la verticale dessous, dans la langue de la page.
// Les tailles sont MESURÉES dans la police choisie (contexte.mesure) : le plus grand nombre tient entre deux traits, le plus long nom
// tient dans la bande, la légende garde un interligne suffisant pour les hampes et jambages d'une police attachée.
import { echapper } from '../../utils/html.js'
import { COULEURS, cm, echelleA3, txt } from '../../impression/affiches/cadre.ts'
import { donneesRegionales } from '../../langues/registre.ts'
import type { Langue } from '../../langues/registre.ts'
import { enLettresFr } from '../../langues/fr/nombres.ts'
import type { Rendu } from '../types.ts'
import type { Reglages } from './definition.ts'

const enLettres = (langue: string, n: number): string => donneesRegionales(langue as Langue)?.enLettres(n) ?? enLettresFr(n)

export const dessin: Rendu<Reglages>['dessin'] = (r, zone, _T, ctx) => {
  const { mesure } = ctx
  const nom = ctx.nomPolice()
  const max = r.max as number
  const pas = max === 1000 ? 10 : 1
  const grosPas = max === 1000 ? 100 : 10
  const moyenPas = max === 1000 ? 50 : 5
  const W = zone.W
  // la légende est un paragraphe sous le dessin (retour à la ligne automatique)
  const m = mesure.metriques(nom)
  const u0 = Math.min(zone.H / 130, 1.7)
  const hAide = 14 * u0
  const H = zone.H - hAide
  const u = Math.min(H / 130, 1.7), x0 = 12 * echelleA3(r.format), x1 = W - x0, y = H * 0.38
  const n = max / pas
  const px = (v: number): number => x0 + (v / max) * (x1 - x0)
  // interligne de la légende : 1,25, ou plus pour une police aux hampes et jambages longs (attachée)
  const interligne = Math.max(1.25, +((m.hampe + m.jambage) * 1.15).toFixed(2))
  return (r.langues as readonly string[]).map(langue => {
    const T = ctx.Tde(langue)
    let s = ''
    // bandes alternées : une par dizaine (0–100, 0–20) ou par centaine (0–1 000)
    for (let b = 0; b * grosPas < max; b++) {
      s += `<rect x="${px(b * grosPas)}" y="${y - 30 * u}" width="${px(grosPas) - x0}" height="${H * 0.66}" fill="${b % 2 ? '#eef3fb' : '#fff8ef'}"/>`
    }
    s += `<line x1="${x0 - 6}" y1="${y}" x2="${x1 + 6}" y2="${y}" stroke="#222" stroke-width="${1.1 * u}" marker-end="url(#fleche)"/>`
    // écart entre deux nombres écrits : de 0 à 20, chaque trait a son nombre (2 chiffres doivent tenir)
    const ecart = px(max === 20 ? 1 : grosPas) - x0
    // le nombre le plus large (en gras) doit tenir dans l'écart, quelle que soit la police (marge de 8 %)
    const tailleMax = ecart * 0.9 / (mesure.largeur(cm(max), nom, true) * 1.08)
    const taillePolice = Math.min(7.5 * u, ecart * 0.85, tailleMax)
    for (let i = 0; i <= n; i++) {
      const v = i * pas
      const gros = v % grosPas === 0, moyen = v % moyenPas === 0
      const h = (gros ? 9 : moyen ? 6 : 3.5) * u
      const couleur = COULEURS[Math.floor(v / grosPas) % COULEURS.length]
      s += `<line x1="${px(v)}" y1="${y - h}" x2="${px(v)}" y2="${y + h}" stroke="${gros ? couleur : '#555'}" stroke-width="${gros ? 0.9 : 0.4}"/>`
      if (max === 20 || gros) s += txt(px(v), y - h - 6 * u, cm(v), gros ? Math.min(taillePolice * 1.1, ecart * 0.95, tailleMax) : taillePolice, { gras: gros, couleur: gros ? couleur : '#222' })
      // le nom du nombre, écrit à la verticale sous la graduation (réduit s'il dépasserait du bas de la bande)
      if (max === 20 || gros) {
        const mot = enLettres(langue, v), haut = y - 30 * u + H * 0.66 - (y + h + 4 * u)
        const taille = (max === 20 ? 5 : 5.2) * u * 1.15
        s += txt(px(v), y + h + 4 * u, mot, Math.min(taille, haut / (mesure.largeur(mot, nom) * 1.08)), { ancre: 'start', rot: 90, couleur: '#555' })
      }
    }
    const corps = `<svg width="${W}mm" height="${H}mm" viewBox="0 0 ${W} ${H}"><defs><marker id="fleche" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill="#222"/></marker></defs>${s}</svg>`
      + `<p class="aide-droite" style="height:${hAide}mm;font-size:${5.2 * u0}mm${interligne !== 1.25 ? `;line-height:${interligne}` : ''}">${echapper(T(`aide.${max}`))}</p>`
    return { titre: T('titre.max', { max: cm(max) }), corps }
  })
}

export const css = `.aide-droite { flex: none; width: 85%; text-align: center; color: #555; line-height: 1.25; display: flex; align-items: center; justify-content: center; }
  svg { display: block; flex: none; }`
