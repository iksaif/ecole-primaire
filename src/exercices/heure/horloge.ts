// Horloge analogique en SVG (chaîne), pour l'exercice et pour la fiche : le même dessin dans le jeu et sur le papier. Module pur
// (aucun import de Vue, lisible par node).
// h : 0..23 (seul h % 12 compte), m : 0..59 ; libelle : nom accessible (« horloge », dans la langue du contenu).

/** Une heure et des minutes. */
export interface Heure { h: number, m: number }

export interface OptionsHorloge {
  /** dessiner les aiguilles (faux : un cadran vide, à compléter sur la fiche) */
  aiguilles?: boolean
  /** les minutes (0, 5, 10…) écrites autour du cadran */
  aideMinutes?: boolean
  /** une heure « fantôme », en vert, pour montrer la bonne réponse après une erreur */
  fantome?: Heure | null
  /** taille fixe (« 3.8cm ») ; sinon le dessin remplit son conteneur */
  taille?: string | null
  /** impression : aiguilles noires sur fond blanc */
  impression?: boolean
  libelle?: string
  /** les heures de l'après-midi (13 → 24) écrites en vert dans le cadran (affiche) */
  heures24?: boolean
  /** « 60 » au lieu de « 0 » en haut des minutes écrites autour du cadran (affiche) */
  minutes60?: boolean
  /** une couleur par aiguille (courte : rouge, longue : bleue) et les nombres de l'heure et des minutes dans la couleur de leur aiguille (affiche) ; faux : les couleurs de l'exercice */
  couleursAiguilles?: boolean
  /** les nombres par-dessus les aiguilles, avec un liseré blanc : une aiguille ne cache jamais un nombre (affiche) */
  nombresAuDessus?: boolean
}

/** Les couleurs des aiguilles quand `couleursAiguilles` est vrai (contraste ≥ 3:1 sur fond blanc : 5,4 et 6,7). */
export const COULEUR_HEURES = '#c0392b'
export const COULEUR_MINUTES = '#1a5fb4'

/** Où et à quelle taille dessiner le cadran : centre (cx, cy) et échelle k (1 : rayon 100). */
export interface Placement { cx?: number, cy?: number, k?: number }

/**
 * Les éléments SVG du cadran (sans la balise `<svg>`), centrés en (cx, cy) et à l'échelle k : coordonnées absolues, pour qu'une
 * affiche pose plusieurs horloges sur une même feuille sans SVG imbriqué. `svgHorloge` en est l'enveloppe (centre 0, rayon 100).
 */
export function elementsHorloge(h: number, m: number, { aiguilles = true, aideMinutes = false, fantome = null, impression = false, heures24 = false, minutes60 = false, couleursAiguilles = false, nombresAuDessus = false }: OptionsHorloge = {}, { cx = 0, cy = 0, k = 1 }: Placement = {}): string {
  const R = 100
  // une longueur du dessin (rayon 100) à l'échelle k
  const v = (x: number): number => (k === 1 ? x : +(x * k).toFixed(3))
  const pt = (angle: number, r: number): [number, number] => {
    const a = angle * Math.PI / 180
    return [+(cx + k * r * Math.sin(a)).toFixed(2), +(cy - k * r * Math.cos(a)).toFixed(2)]
  }
  const centre = cx === 0 && cy === 0 ? '' : ` cx="${cx}" cy="${cy}"`
  const encre = '#2c3e50'
  const couleurH = couleursAiguilles ? COULEUR_HEURES : impression ? '#111' : '#c0392b'
  const couleurM = couleursAiguilles ? COULEUR_MINUTES : impression ? '#111' : '#1a5fb4'
  let s = `<circle${centre} r="${v(R)}" fill="${impression ? '#fff' : '#fffdf5'}" stroke="${encre}" stroke-width="${v(5)}"/>`
  // graduations des minutes (60) et des heures (12)
  for (let i = 0; i < 60; i++) {
    const heure = i % 5 === 0
    const [x1, y1] = pt(i * 6, heure ? 80 : 87)
    const [x2, y2] = pt(i * 6, 94)
    s += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${encre}" stroke-width="${v(heure ? 3.5 : 1.3)}" stroke-linecap="round"/>`
  }
  // les nombres : les heures, les minutes autour du cadran (facultatif), l'après-midi (13 → 24, facultatif, à l'intérieur)
  const nombre = (x: number, y: number, taille: number, couleur: string, texte: string | number): string =>
    `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central" font-family="Arial, sans-serif" font-size="${v(taille)}" font-weight="700" fill="${couleur}">${texte}</text>`
  let nombres = ''
  for (let n = 1; n <= 12; n++) {
    const [x, y] = pt(n * 30, heures24 ? 74 : 66)
    nombres += nombre(x, y, 19, couleursAiguilles ? couleurH : encre, n)
  }
  if (aideMinutes) {
    for (let n = 0; n < 12; n++) {
      const [x, y] = pt(n * 30, 113)
      nombres += nombre(x, y, 11, couleurM, n === 0 && minutes60 ? 60 : n * 5)
    }
  }
  if (heures24) {
    for (let n = 1; n <= 12; n++) {
      const [x, y] = pt(n * 30, 50)
      nombres += nombre(x, y, 10, '#2b8a3e', n + 12)
    }
  }
  if (!nombresAuDessus) s += nombres
  const aiguille = (angle: number, long: number, larg: number, coul: string, opacite = 1): string => {
    const [x, y] = pt(angle, long)
    const [xq, yq] = pt(angle + 180, 12)
    return `<line x1="${xq}" y1="${yq}" x2="${x}" y2="${y}" stroke="${coul}" stroke-width="${v(larg)}" stroke-linecap="round" opacity="${opacite}"/>`
  }
  const angleH = (hh: number, mm: number): number => (hh % 12) * 30 + mm * 0.5
  if (fantome) {
    s += aiguille(angleH(fantome.h, fantome.m), 48, 9, '#27ae60', 0.55)
    s += aiguille(fantome.m * 6, 78, 6, '#27ae60', 0.55)
  }
  if (aiguilles) {
    s += aiguille(angleH(h, m), 48, 9, couleurH)
    s += aiguille(m * 6, 78, 5, couleurM)
  }
  if (nombresAuDessus) s += `<g stroke="#fff" stroke-width="${v(2.5)}" stroke-linejoin="round" paint-order="stroke">${nombres}</g>`
  return `${s}<circle${centre} r="${v(6)}" fill="${encre}"/>`
}

export function svgHorloge(h: number, m: number, options: OptionsHorloge = {}): string {
  const { aideMinutes = false, taille = null, libelle = 'horloge' } = options
  const ext = aideMinutes ? 122 : 104
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-ext} ${-ext} ${2 * ext} ${2 * ext}"`
    + (taille ? ` width="${taille}" height="${taille}"` : ' width="100%" height="100%"')
    + ` role="img" aria-label="${libelle}">${elementsHorloge(h, m, options)}</svg>`
}
