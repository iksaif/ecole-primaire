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
}

export function svgHorloge(h: number, m: number, { aiguilles = true, aideMinutes = false, fantome = null, taille = null, impression = false, libelle = 'horloge' }: OptionsHorloge = {}): string {
  const R = 100
  const ext = aideMinutes ? 122 : 104
  const pt = (angle: number, r: number): [number, number] => {
    const a = angle * Math.PI / 180
    return [+(r * Math.sin(a)).toFixed(2), +(-r * Math.cos(a)).toFixed(2)]
  }
  const encre = '#2c3e50'
  const couleurH = impression ? '#111' : '#c0392b'
  const couleurM = impression ? '#111' : '#1a5fb4'
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-ext} ${-ext} ${2 * ext} ${2 * ext}"`
    + (taille ? ` width="${taille}" height="${taille}"` : ' width="100%" height="100%"')
    + ` role="img" aria-label="${libelle}">`
  s += `<circle r="${R}" fill="${impression ? '#fff' : '#fffdf5'}" stroke="${encre}" stroke-width="5"/>`
  // graduations des minutes (60) et des heures (12)
  for (let i = 0; i < 60; i++) {
    const heure = i % 5 === 0
    const [x1, y1] = pt(i * 6, heure ? 80 : 87)
    const [x2, y2] = pt(i * 6, 94)
    s += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${encre}" stroke-width="${heure ? 3.5 : 1.3}" stroke-linecap="round"/>`
  }
  for (let n = 1; n <= 12; n++) {
    const [x, y] = pt(n * 30, 66)
    s += `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central" font-family="Arial, sans-serif" font-size="19" font-weight="700" fill="${encre}">${n}</text>`
  }
  if (aideMinutes) {
    for (let n = 0; n < 12; n++) {
      const [x, y] = pt(n * 30, 113)
      s += `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="${couleurM}">${n * 5}</text>`
    }
  }
  const aiguille = (angle: number, long: number, larg: number, coul: string, opacite = 1): string => {
    const [x, y] = pt(angle, long)
    const [xq, yq] = pt(angle + 180, 12)
    return `<line x1="${xq}" y1="${yq}" x2="${x}" y2="${y}" stroke="${coul}" stroke-width="${larg}" stroke-linecap="round" opacity="${opacite}"/>`
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
  s += `<circle r="6" fill="${encre}"/></svg>`
  return s
}
