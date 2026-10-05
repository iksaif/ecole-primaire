// Horloge analogique en SVG (chaîne), pour l'exercice et pour la fiche. Module pur.
// h : 0..23 (seul h % 12 compte), m : 0..59 ; libelle : nom accessible (« horloge », dans la langue du contenu).
export function svgHorloge(h, m, { aiguilles = true, aideMinutes = false, fantome = null, taille = null, impression = false, libelle = 'horloge' } = {}) {
  const R = 100
  const ext = aideMinutes ? 122 : 104
  const pt = (angle, r) => {
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
  const aiguille = (angle, long, larg, coul, opacite = 1) => {
    const [x, y] = pt(angle, long)
    const [xq, yq] = pt(angle + 180, 12)
    return `<line x1="${xq}" y1="${yq}" x2="${x}" y2="${y}" stroke="${coul}" stroke-width="${larg}" stroke-linecap="round" opacity="${opacite}"/>`
  }
  const angleH = (hh, mm) => (hh % 12) * 30 + mm * 0.5
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
