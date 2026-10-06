// Les pièces et les billets de l'euro — LE dessin (SVG, pur : lisible par node). Valeurs en centimes.
// Partagé par l'exercice « La monnaie » (jeu et fiche : src/exercices/monnaie/) et par l'affiche « Pièces et billets »
// (src/affiches/monnaie/), planche à découper comprise : un seul dessin, donc les mêmes billets partout.
//   piece(v, { echelle, unite, libelle })    diamètre = diamètre réel (mm) × echelle, dans l'unité donnée
//   billet(v, { echelle, unite, libelle })   largeur × hauteur = format réel (mm) × echelle
//   svgArgent(v, echelle, libelle)            l'exercice : pièce (v < 500) ou billet, en pixels, pièces à la loupe
//   tailleReelle(v)                           { w, h } en mm (pièce : w = h = diamètre)
// libelle : nom lu par les lecteurs d'écran. Texte foncé sur fonds clairs : lisible imprimé en noir et blanc.
import { echapper } from '../utils/html.js'

/** Les pièces de l'euro (valeurs en centimes), de la plus petite à la plus grande. */
export const VALEURS_PIECES = [1, 2, 5, 10, 20, 50, 100, 200] as const
/** Les billets de l'euro de la série « Europe » (valeurs en centimes), du plus petit au plus grand. */
export const VALEURS_BILLETS = [500, 1000, 2000, 5000, 10000, 20000] as const
export type ValeurPiece = (typeof VALEURS_PIECES)[number]
export type ValeurBillet = (typeof VALEURS_BILLETS)[number]
/** Une pièce ou un billet, par sa valeur en centimes. */
export type ValeurArgent = ValeurPiece | ValeurBillet

type Metal = 'cuivre' | 'or' | 'argent'
interface DonneesPiece { d: number, metal: Metal, coeur?: Metal, label: string, unite: string }
interface DonneesBillet { w: number, h: number, fond: string, fonce: string }

// Diamètres réels (mm). Le cœur des pièces de 1 € et 2 € est d'un autre métal que la couronne.
const PIECES: Readonly<Record<ValeurPiece, DonneesPiece>> = {
  1:   { d: 16.25, metal: 'cuivre', label: '1',  unite: 'c' },
  2:   { d: 18.75, metal: 'cuivre', label: '2',  unite: 'c' },
  5:   { d: 21.25, metal: 'cuivre', label: '5',  unite: 'c' },
  10:  { d: 19.75, metal: 'or',     label: '10', unite: 'c' },
  20:  { d: 22.25, metal: 'or',     label: '20', unite: 'c' },
  50:  { d: 24.25, metal: 'or',     label: '50', unite: 'c' },
  100: { d: 23.25, metal: 'or',     coeur: 'argent', label: '1', unite: '€' },
  200: { d: 25.75, metal: 'argent', coeur: 'or',     label: '2', unite: '€' },
}
// Formats réels (mm, série « Europe ») ; couleurs proches des vrais billets (fond clair, valeur foncée)
const BILLETS: Readonly<Record<ValeurBillet, DonneesBillet>> = {
  500:   { w: 120, h: 62, fond: '#c3c9bd', fonce: '#4f5c49' },
  1000:  { w: 127, h: 67, fond: '#f2a596', fonce: '#a33a2a' },
  2000:  { w: 133, h: 72, fond: '#a3c2ea', fonce: '#24508f' },
  5000:  { w: 140, h: 77, fond: '#f7b878', fonce: '#9c5513' },
  10000: { w: 147, h: 77, fond: '#a3d39f', fonce: '#2a6f35' },
  20000: { w: 153, h: 77, fond: '#e9cf77', fonce: '#7d5c12' },
}
const METAUX: Readonly<Record<Metal, { fond: string, clair: string, bord: string }>> = {
  cuivre: { fond: '#d8956a', clair: '#e9b28c', bord: '#8a4b2a' },
  or:     { fond: '#e8c65a', clair: '#f6e29a', bord: '#9c7a1f' },
  argent: { fond: '#d9dde1', clair: '#f3f5f7', bord: '#7d858d' },
}
// Taille dans l'exercice (px par mm réel) : les pièces sont agrandies pour rester lisibles à côté des billets
const PX_PIECE = 2.6
const PX_BILLET = 0.9

const POLICE = 'font-family="Arial, Helvetica, sans-serif"'
const r2 = (n: number): number => Math.round(n * 100) / 100

/** Un billet (et non une pièce) ? */
export const estBillet = (v: ValeurArgent): v is ValeurBillet => v in BILLETS

/** Taille réelle en mm : { w, h } d'un billet, { w, h } égaux au diamètre d'une pièce. */
export const tailleReelle = (v: ValeurArgent): { w: number, h: number } =>
  (estBillet(v) ? { w: BILLETS[v].w, h: BILLETS[v].h } : { w: PIECES[v].d, h: PIECES[v].d })

// les 12 étoiles de l'Europe, en cercle
const etoiles = (cx: number, cy: number, r: number, re: number, couleur: string): string => Array.from({ length: 12 }, (_, i) => {
  const a = i * Math.PI / 6
  return `<circle cx="${r2(cx + r * Math.sin(a))}" cy="${r2(cy - r * Math.cos(a))}" r="${r2(re)}" fill="${couleur}"/>`
}).join('')

const enveloppe = (w: number, h: number, unite: string, vb: string, libelle: string, corps: string): string => {
  const u = unite === 'px' ? '' : unite
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${r2(w)}${u}" height="${r2(h)}${u}" viewBox="${vb}" role="img" aria-label="${echapper(libelle)}">${corps}</svg>`
}

/** Options communes : `echelle` (fois la taille réelle), `unite` ('px', 'mm'…) et `libelle` (nom lu par les lecteurs d'écran). */
export interface OptionsDessin { echelle?: number, unite?: string, libelle?: string }

export function piece(v: ValeurPiece, { echelle = 1, unite = 'px', libelle = '' }: OptionsDessin = {}): string {
  const p = PIECES[v]
  const m = METAUX[p.metal]
  const c = p.coeur && METAUX[p.coeur]
  // tranche cannelée, puis cœur (bimétal) ou filet intérieur, reflet, étoiles
  let s = `<circle cx="50" cy="50" r="48" fill="${m.fond}" stroke="${m.bord}" stroke-width="2.5"/>`
    + `<circle cx="50" cy="50" r="48" fill="none" stroke="${m.bord}" stroke-width="1.2" stroke-dasharray="1.2 1.6" opacity=".7"/>`
  s += c
    ? `<circle cx="50" cy="50" r="33" fill="${c.fond}" stroke="${c.bord}" stroke-width="1.8"/>`
      + `<path d="M 27 38 A 26 26 0 0 1 56 22" fill="none" stroke="${c.clair}" stroke-width="4" stroke-linecap="round" opacity=".9"/>`
    : `<circle cx="50" cy="50" r="40" fill="none" stroke="${m.bord}" stroke-width="1.4" opacity=".55"/>`
      + `<path d="M 20 40 A 32 32 0 0 1 56 18" fill="none" stroke="${m.clair}" stroke-width="5" stroke-linecap="round" opacity=".9"/>`
  s += etoiles(50, 50, c ? 41 : 44, 1.5, m.bord)
  const fs = p.label.length > 1 ? 34 : 44
  s += `<text x="50" y="${r2(50 + fs * 0.36)}" text-anchor="middle" ${POLICE} font-weight="800" font-size="${fs}" fill="#1f1f1f">${p.label}`
    + `<tspan font-size="${Math.round(fs * 0.55)}" dx="1">${p.unite}</tspan></text>`
  return enveloppe(p.d * echelle, p.d * echelle, unite, '0 0 100 100', libelle, s)
}

export function billet(v: ValeurBillet, { echelle = 1, unite = 'px', libelle = '' }: OptionsDessin = {}): string {
  const b = BILLETS[v]
  const { w, h } = b
  const n = String(v / 100)
  const xb = w * 0.705, lb = w * 0.07         // bande argentée (hologramme)
  const xa = w * 0.5, la = w * 0.18           // fenêtre en arche (motif du recto)
  const fs = h * (n.length > 2 ? 0.33 : 0.44)
  const hd = h * 0.22                         // drapeau européen
  const s = `<rect x=".6" y=".6" width="${w - 1.2}" height="${h - 1.2}" rx="3.5" fill="${b.fond}" stroke="${b.fonce}" stroke-width="1.2"/>`
    + `<path d="M ${r2(w * 0.3)} .6 L ${r2(w * 0.62)} .6 L ${r2(w * 0.42)} ${h - 0.6} L ${r2(w * 0.1)} ${h - 0.6} Z" fill="#fff" opacity=".22"/>`
    + `<rect x="3.5" y="3.5" width="${w - 7}" height="${h - 7}" rx="2" fill="none" stroke="#fff" stroke-width=".9" opacity=".8"/>`
    + `<path d="M ${r2(xa)} ${h - 8} V ${r2(h * 0.42)} A ${r2(la / 2)} ${r2(la / 2)} 0 0 1 ${r2(xa + la)} ${r2(h * 0.42)} V ${h - 8} Z" `
    + `fill="#fff" fill-opacity=".45" stroke="${b.fonce}" stroke-opacity=".45" stroke-width=".9"/>`
    + `<path d="M ${r2(xa + la * 0.22)} ${h - 8} V ${r2(h * 0.46)} M ${r2(xa + la * 0.78)} ${h - 8} V ${r2(h * 0.46)}" stroke="${b.fonce}" stroke-opacity=".3" stroke-width="1.6"/>`
    + `<rect x="${r2(xb)}" y=".6" width="${r2(lb)}" height="${h - 1.2}" fill="#e6e9ec" opacity=".9"/>`
    + `<ellipse cx="${r2(xb + lb / 2)}" cy="${r2(h * 0.5)}" rx="${r2(lb * 0.3)}" ry="${r2(lb * 0.42)}" fill="none" stroke="#9aa3ab" stroke-width=".8"/>`
    + `<rect x="8" y="7" width="${r2(hd * 1.5)}" height="${r2(hd)}" rx=".8" fill="#1f3f99"/>`
    + etoiles(8 + hd * 0.75, 7 + hd / 2, hd * 0.34, hd * 0.055 + 0.3, '#ffd23f')
    // la valeur : en grand (couleur du billet, liseré blanc), rappelée en haut à droite
    + `<text x="9" y="${r2(h * 0.8)}" ${POLICE} font-weight="900" font-size="${r2(fs)}" fill="${b.fonce}" stroke="#fff" stroke-width="${r2(h * 0.012)}" paint-order="stroke">`
    + `${n}<tspan font-size="${r2(h * 0.24)}" dx="1.5">€</tspan></text>`
    + `<text x="${w - 6}" y="${r2(h * 0.23)}" text-anchor="end" ${POLICE} font-weight="800" font-size="${r2(h * 0.17)}" fill="#1f1f1f">${n}</text>`
    + `<text x="${w - 6}" y="${h - 7}" text-anchor="end" ${POLICE} font-weight="700" font-size="${r2(h * 0.1)}" fill="#1f1f1f" letter-spacing="1">EURO</text>`
  return enveloppe(w * echelle, h * echelle, unite, `0 0 ${w} ${h}`, libelle, s)
}

/** L'exercice : une pièce (v < 500) ou un billet, en pixels ; `echelle` 1 = la taille de l'exercice (pièces à la loupe). */
export const svgArgent = (v: ValeurArgent, echelle = 1, libelle = ''): string =>
  (estBillet(v) ? billet(v, { echelle: PX_BILLET * echelle, libelle }) : piece(v, { echelle: PX_PIECE * echelle, libelle }))
