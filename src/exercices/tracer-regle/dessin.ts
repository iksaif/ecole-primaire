// Tracer à la règle — les dessins de la fiche, en SVG (chaînes), à la taille réelle : le champ des points alignés en millimètres, le papier
// pointé ou quadrillé avec un centimètre entre deux points. Pur.
import { AUCUN, CHAMP, COIN_AUCUN } from './generateur.ts'
import type { Pt, QAlignes, Support } from './generateur.ts'

/** L'écart entre deux points de la grille, en millimètres (un centimètre : la règle graduée de l'élève). */
export const UNITE = 10
const MARGE_GRILLE = 4
const TRAIT = '#1d4e9e'

/** Une croix « + » (le BO : des points « représentés par des petites croix ») et sa lettre. */
function croix(q: Pt, lettre: string): string {
  const t = 1.8
  return `<path d="M${q.x - t} ${q.y}H${q.x + t}M${q.x} ${q.y - t}V${q.y + t}" stroke="#000" stroke-width="0.45" stroke-linecap="round"/>`
    + `<text x="${q.x + 2.4}" y="${q.y - 2}" font-size="4.2" font-family="inherit" font-weight="700">${lettre}</text>`
}

/** La case « aucun » en bas à droite du champ (cochée au corrigé quand aucun point n'est aligné). */
function caseAucun(texte: string, cochee: boolean): string {
  if (!texte) return ''
  // dans le coin réservé (aucune croix n'y tombe) ; le mot tient dans le champ
  const x = COIN_AUCUN.x + 3, y = CHAMP.hauteur - 7
  const coche = cochee ? `<path d="M${x + 0.6} ${y + 1.9}l1.2 1.3 2.2 -3" fill="none" stroke="#c92a2a" stroke-width="0.6"/>` : ''
  return `<rect x="${x}" y="${y}" width="3.6" height="3.6" fill="none" stroke="#555" stroke-width="0.35"/>${coche}`
    + `<text x="${x + 5}" y="${y + 3}" font-size="3.4" font-family="inherit">${texte}</text>`
}

/** La droite (AB) coupée aux bords du champ : ses deux extrémités, là où elle entre dans le champ et en sort. */
export function droiteDansLeChamp(a: Pt, b: Pt): { x1: number, y1: number, x2: number, y2: number } {
  const dx = b.x - a.x, dy = b.y - a.y
  // les valeurs de t (point a + t·(b − a)) où la droite croise chacun des quatre bords, gardées si le point est sur le bord du champ
  const bords: number[] = []
  if (dx !== 0) bords.push(-a.x / dx, (CHAMP.largeur - a.x) / dx)
  if (dy !== 0) bords.push(-a.y / dy, (CHAMP.hauteur - a.y) / dy)
  const dedans = bords.filter(t => {
    const x = a.x + t * dx, y = a.y + t * dy
    return x >= -1e-6 && x <= CHAMP.largeur + 1e-6 && y >= -1e-6 && y <= CHAMP.hauteur + 1e-6
  })
  const t1 = Math.min(...dedans), t2 = Math.max(...dedans)
  const arrondi = (v: number): number => Math.round(v * 100) / 100
  return { x1: arrondi(a.x + t1 * dx), y1: arrondi(a.y + t1 * dy), x2: arrondi(a.x + t2 * dx), y2: arrondi(a.y + t2 * dy) }
}

/** Le champ des points alignés. Corrigé : la droite (AB) et le point aligné entouré. */
export function svgAlignes(q: QAlignes, { corrige = false, echelle = 1, aucun = '' }: { corrige?: boolean, echelle?: number, aucun?: string } = {}): string {
  const { largeur, hauteur } = CHAMP
  let droite = ''
  if (corrige) {
    const { x1, y1, x2, y2 } = droiteDansLeChamp(q.a, q.b)
    droite = `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${TRAIT}" stroke-width="0.5"/>`
      + (q.bonne === AUCUN ? '' : `<circle cx="${q.candidats[q.bonne].x}" cy="${q.candidats[q.bonne].y}" r="3.6" fill="none" stroke="#c92a2a" stroke-width="0.5"/>`)
  }
  const points = [croix(q.a, 'A'), croix(q.b, 'B'), ...q.candidats.map((c, i) => croix(c, q.lettres[i]))].join('')
  return `<svg width="${largeur * echelle}mm" height="${hauteur * echelle}mm" viewBox="0 0 ${largeur} ${hauteur}" xmlns="http://www.w3.org/2000/svg">`
    + `<rect x="0.25" y="0.25" width="${largeur - 0.5}" height="${hauteur - 0.5}" fill="none" stroke="#bbb" stroke-width="0.5" rx="2"/>`
    + `${droite}${points}${caseAucun(aucun, corrige && q.bonne === AUCUN)}</svg>`
}

/** Ce qu'on dessine sur une grille : des côtés tracés, un polygone (refermé), des points marqués. */
export interface DessinGrille { cotes?: readonly (readonly [Pt, Pt])[], polygone?: readonly Pt[], marques?: readonly Pt[], couleur?: string, lettreA?: Pt }

/** Le papier pointé (ou quadrillé) de `colonnes` × `lignes` points, et ce qu'on y a tracé. */
export function svgGrille(support: Support, colonnes: number, lignes: number, dessin: DessinGrille = {}, echelle = 1): string {
  const largeur = (colonnes - 1) * UNITE + 2 * MARGE_GRILLE, hauteur = (lignes - 1) * UNITE + 2 * MARGE_GRILLE
  const x = (c: number): number => MARGE_GRILLE + c * UNITE
  const y = (l: number): number => MARGE_GRILLE + l * UNITE
  let fond = ''
  if (support === 'quadrille') {
    for (let c = 0; c < colonnes; c++) fond += `<line x1="${x(c)}" y1="${y(0)}" x2="${x(c)}" y2="${y(lignes - 1)}" stroke="#9aa5b1" stroke-width="0.25"/>`
    for (let l = 0; l < lignes; l++) fond += `<line x1="${x(0)}" y1="${y(l)}" x2="${x(colonnes - 1)}" y2="${y(l)}" stroke="#9aa5b1" stroke-width="0.25"/>`
  } else {
    for (let l = 0; l < lignes; l++) for (let c = 0; c < colonnes; c++) fond += `<circle cx="${x(c)}" cy="${y(l)}" r="0.7" fill="#555"/>`
  }
  const couleur = dessin.couleur ?? '#000'
  const cotes = (dessin.cotes ?? []).map(([a, b]) => `<line x1="${x(a.x)}" y1="${y(a.y)}" x2="${x(b.x)}" y2="${y(b.y)}" stroke="${couleur}" stroke-width="0.6" stroke-linecap="round"/>`).join('')
  const polygone = dessin.polygone
    ? `<polygon points="${dessin.polygone.map(q => `${x(q.x)},${y(q.y)}`).join(' ')}" fill="none" stroke="${couleur}" stroke-width="0.6" stroke-linejoin="round"/>`
    : ''
  const marques = (dessin.marques ?? []).map(q => `<circle cx="${x(q.x)}" cy="${y(q.y)}" r="1.3" fill="${couleur}"/>`).join('')
  // le sommet de l'angle droit d'un triangle rectangle à compléter : la lettre A, à côté
  const lettreA = dessin.lettreA ? `<text x="${x(dessin.lettreA.x) + 1.8}" y="${y(dessin.lettreA.y) - 1.8}" font-size="4.2" font-weight="700" font-family="inherit">A</text>` : ''
  return `<svg width="${largeur * echelle}mm" height="${hauteur * echelle}mm" viewBox="0 0 ${largeur} ${hauteur}" xmlns="http://www.w3.org/2000/svg">${fond}${cotes}${polygone}${marques}${lettreA}</svg>`
}

/** Le codage d'un angle droit en `s` (entre s→a et s→b), un petit carré de `c` mm. */
function codeAngleDroit(a: Pt, s: Pt, b: Pt, c: number): string {
  const u = { x: (a.x - s.x) / Math.hypot(a.x - s.x, a.y - s.y), y: (a.y - s.y) / Math.hypot(a.x - s.x, a.y - s.y) }
  const v = { x: (b.x - s.x) / Math.hypot(b.x - s.x, b.y - s.y), y: (b.y - s.y) / Math.hypot(b.x - s.x, b.y - s.y) }
  const p1 = { x: s.x + u.x * c, y: s.y + u.y * c }, p2 = { x: p1.x + v.x * c, y: p1.y + v.y * c }, p3 = { x: s.x + v.x * c, y: s.y + v.y * c }
  return `<path d="M${p1.x} ${p1.y}L${p2.x} ${p2.y}L${p3.x} ${p3.y}" fill="none" stroke="#c92a2a" stroke-width="0.35"/>`
}

/** Le codage d'un côté : `n` petits traits au milieu, perpendiculaires (deux côtés de même longueur ont le même nombre de traits). */
function codeLongueur(a: Pt, b: Pt, n: number): string {
  const m = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }, l = Math.hypot(b.x - a.x, b.y - a.y)
  const u = { x: (b.x - a.x) / l, y: (b.y - a.y) / l }, w = { x: -u.y, y: u.x }
  return Array.from({ length: n }, (_, i) => {
    const d = (i - (n - 1) / 2) * 1.8
    const c = { x: m.x + u.x * d, y: m.y + u.y * d }
    return `<line x1="${c.x - w.x * 2.4}" y1="${c.y - w.y * 2.4}" x2="${c.x + w.x * 2.4}" y2="${c.y + w.y * 2.4}" stroke="#c92a2a" stroke-width="0.6"/>`
  }).join('')
}

/** Une figure construite, pour le corrigé : en mm (1 unité = 1 cm × 10), réduite par `echelle`, avec le codage des angles droits et des longueurs. */
export function svgConstruction(figure: 'rectangle' | 'carre' | 'triangleRectangle', { a, b }: { a: number, b: number }, codeLongueurs: boolean, echelle = 0.5): string {
  const marge = 4
  const sommets: Pt[] = figure === 'triangleRectangle'
    ? [{ x: marge, y: marge }, { x: marge, y: marge + b * 10 }, { x: marge + a * 10, y: marge + b * 10 }]
    : [{ x: marge, y: marge }, { x: marge + a * 10, y: marge }, { x: marge + a * 10, y: marge + b * 10 }, { x: marge, y: marge + b * 10 }]
  const n = sommets.length
  const largeur = a * 10 + 2 * marge, hauteur = b * 10 + 2 * marge
  const trait = `<polygon points="${sommets.map(s => `${s.x},${s.y}`).join(' ')}" fill="none" stroke="#000" stroke-width="0.5"/>`
  // les angles droits : les quatre du rectangle et du carré ; celui du triangle (le sommet du bas à gauche)
  const droits = figure === 'triangleRectangle' ? [1] : [0, 1, 2, 3]
  const angles = droits.map(i => codeAngleDroit(sommets[(i + n - 1) % n], sommets[i], sommets[(i + 1) % n], 3)).join('')
  let longueurs = ''
  if (codeLongueurs && figure !== 'triangleRectangle') {
    // carré : les quatre côtés, un trait ; rectangle : les longueurs (un trait) et les largeurs (deux traits)
    longueurs = sommets.map((s, i) => codeLongueur(s, sommets[(i + 1) % n], figure === 'carre' ? 1 : (i % 2) + 1)).join('')
  }
  // les mesures sous la figure (elles ne couvrent pas le codage)
  const mesures = figure === 'carre' ? `${a} cm` : `${a} cm × ${b} cm`
  const legende = `<text x="${largeur / 2}" y="${hauteur + 5}" font-size="5" text-anchor="middle" font-family="inherit">${mesures}</text>`
  return `<svg width="${largeur * echelle}mm" height="${(hauteur + 7) * echelle}mm" viewBox="0 0 ${largeur} ${hauteur + 7}" xmlns="http://www.w3.org/2000/svg">${trait}${angles}${longueurs}${legende}</svg>`
}
