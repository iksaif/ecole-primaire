// @ts-check
// Les mesures — questions sur les longueurs : règle graduée, unité adaptée, conversions, comparaisons.
// Chaque générateur reçoit le contexte { rng, T, niv, reglages } (hasard et textes de l'exercice) et rend une question
// { type, cle, consigne, svg?, affiche?, mode: 'nombre' | 'choix', unite | choix, reponse, attendu, texte, explication }.
// L'ordre des tirages est celui de l'ancienne vue : même flux de hasard, mêmes fiches.
import { svgRegle } from './dessins.js'

export const cmmm = mm => mm % 10 === 0 ? `${mm / 10} cm` : mm < 10 ? `${mm} mm` : `${Math.floor(mm / 10)} cm ${mm % 10} mm`

export function genRegle({ rng, T, niv, reglages }) {
  const { max, segMin, segMax, px, mm } = niv.regle
  const decale = reglages.decale && rng.vrai(0.7)
  if (mm) {
    // CE2 : longueur en mm (pas un nombre entier de cm 3 fois sur 4), départ sur un trait de cm
    let L = rng.entier(segMin * 10, (decale ? segMax : max - 2) * 10)
    if (rng.vrai(0.25)) L = Math.round(L / 10) * 10
    const sCm = decale ? rng.entier(1, Math.floor((max * 10 - L) / 10)) : 0
    const eMm = sCm * 10 + L
    return {
      type: 'regle', cle: `regle-${sCm}-${L}`,
      consigne: T('regleMmQ'),
      svg: svgRegle(max, sCm, eMm / 10, px, T('ariaRegle')),
      mode: 'nombre', unite: 'mm', reponse: L, attendu: `${L} mm (${cmmm(L)})`,
      texte: T('regleMmTexte', { s: sCm, e: cmmm(eMm) }),
      explication: T('regleMmExpl', { s: sCm, e: cmmm(eMm), L: cmmm(L), mm: L }),
      s: sCm * 10, e: eMm, max: max * 10,
    }
  }
  // Depuis 0, on peut aller presque jusqu'au bout de la règle (assez de variété pour 15 questions)
  const L = rng.entier(segMin, decale ? segMax : max - 2)
  const s = decale ? rng.entier(1, max - L) : 0
  const e = s + L
  return {
    type: 'regle', cle: `regle-${s}-${L}`,
    consigne: T('regleQ'),
    svg: svgRegle(max, s, e, px, T('ariaRegle')),
    mode: 'nombre', unite: 'cm', reponse: L, attendu: `${L} cm`,
    texte: T('regleTexte', { s, e }),
    explication: T('regleExpl', { s, e, L }),
    s, e, max,
  }
}

// o : { id, valeur, unite } ; phrase dans le catalogue de contenu (`phrases`)
export function questionUnite({ T }, type, o, choix) {
  const texte = T('phrases')[o.id]
  return {
    type, cle: `${type}-u-${o.id}`,
    consigne: T('uniteQ'),
    affiche: `${texte} ${o.valeur} …`,
    mode: 'choix', choix, reponse: o.unite, attendu: o.unite,
    texte: `${texte} ${o.valeur} …`,
    explication: `${texte} ${o.valeur} ${o.unite}.`,
  }
}

export function genUnite(ctx) {
  return questionUnite(ctx, 'unite', ctx.rng.choisir(ctx.niv.objetsUnite), ctx.niv.unites)
}

export function genConversion({ rng, T, niv }) {
  const kind = rng.choisir(niv.conversions)
  const donc = T('donc')
  const et = mot => T('et', { mot })   // « et » / « ha », « hag »
  let affiche, reponse, unite, explication
  if (kind === 'm-cm') {
    const a = rng.entier(1, 9)
    affiche = `${a} m = ? cm`; reponse = a * 100; unite = 'cm'
    explication = `1 m = 100 cm, ${donc} ${a} m = ${a * 100} cm.`
  } else if (kind === 'mcm-cm') {
    const a = rng.entier(1, 5), b = rng.entier(1, 19) * 5
    affiche = `${a} m ${b} cm = ? cm`; reponse = a * 100 + b; unite = 'cm'
    explication = `${a} m = ${a * 100} cm, ${et(a * 100)} ${a * 100} + ${b} = ${reponse} cm.`
  } else if (kind === 'cm-m') {
    const a = rng.entier(1, 9)
    affiche = `${a * 100} cm = ? m`; reponse = a; unite = 'm'
    explication = `100 cm = 1 m, ${donc} ${a * 100} cm = ${a} m.`
  } else if (kind === 'km-m') {
    const a = rng.entier(1, niv.kmMax)
    affiche = `${a} km = ? m`; reponse = a * 1000; unite = 'm'
    explication = a === 1 ? '1 km = 1 000 m.' : `1 km = 1 000 m, ${donc} ${a} km = ${a * 1000} m.`
  } else if (kind === 'm-km') {
    const a = rng.entier(1, niv.kmMax)
    affiche = `${a * 1000} m = ? km`; reponse = a; unite = 'km'
    explication = `1 000 m = 1 km.`
  } else if (kind === 'kmm-m') {
    const a = rng.entier(1, 5), b = rng.entier(1, 9) * 100
    affiche = `${a} km ${b} m = ? m`; reponse = a * 1000 + b; unite = 'm'
    explication = `${a} km = ${a * 1000} m, ${et(a * 1000)} ${a * 1000} + ${b} = ${reponse} m.`
  } else if (kind === 'kg-g') {
    const a = rng.entier(1, niv.kgMax)
    affiche = `${a} kg = ? g`; reponse = a * 1000; unite = 'g'
    explication = a === 1 ? '1 kg = 1 000 g.' : `1 kg = 1 000 g, ${donc} ${a} kg = ${a * 1000} g.`
  } else if (kind === 'kgg-g') {
    const a = rng.entier(1, 3), b = rng.entier(1, 9) * 100
    affiche = `${a} kg ${b} g = ? g`; reponse = a * 1000 + b; unite = 'g'
    explication = `${a} kg = ${a * 1000} g, ${et(a * 1000)} ${a * 1000} + ${b} = ${reponse} g.`
  } else if (kind === 'g-kg') {
    const a = rng.entier(1, niv.kgMax)
    affiche = `${a * 1000} g = ? kg`; reponse = a; unite = 'kg'
    explication = a === 1 ? '1 000 g = 1 kg.' : `1 000 g = 1 kg, ${donc} ${a * 1000} g = ${a} kg.`
  } else if (kind === 'cm-mm') {
    const a = rng.entier(2, 20)
    affiche = `${a} cm = ? mm`; reponse = a * 10; unite = 'mm'
    explication = `1 cm = 10 mm, ${donc} ${a} cm = ${a * 10} mm.`
  } else if (kind === 'cmmm-mm') {
    const a = rng.entier(1, 15), b = rng.entier(1, 9)
    affiche = `${a} cm ${b} mm = ? mm`; reponse = a * 10 + b; unite = 'mm'
    explication = `${a} cm = ${a * 10} mm, ${et(a * 10)} ${a * 10} + ${b} = ${reponse} mm.`
  } else if (kind === 'mm-cm') {
    const a = rng.entier(2, 20)
    affiche = `${a * 10} mm = ? cm`; reponse = a; unite = 'cm'
    explication = `10 mm = 1 cm, ${donc} ${a * 10} mm = ${a} cm.`
  } else if (kind === 'L-dL') {
    const a = rng.entier(1, 9)
    affiche = `${a} L = ? dL`; reponse = a * 10; unite = 'dL'
    explication = `1 L = 10 dL, ${donc} ${a} L = ${a * 10} dL.`
  } else if (kind === 'L-cL') {
    const a = rng.entier(1, 9)
    affiche = `${a} L = ? cL`; reponse = a * 100; unite = 'cL'
    explication = `1 L = 100 cL, ${donc} ${a} L = ${a * 100} cL.`
  } else {
    const a = rng.entier(1, 9)
    affiche = `${a} dL = ? cL`; reponse = a * 10; unite = 'cL'
    explication = `1 dL = 10 cL, ${donc} ${a} dL = ${a * 10} cL.`
  }
  return {
    type: 'conversion', cle: `conv-${affiche}`,
    consigne: T('completeQ'), affiche, mode: 'nombre', unite, reponse,
    attendu: `${reponse} ${unite}`, texte: affiche, explication,
  }
}

export function genComparer({ rng, T, niv }) {
  const kind = rng.choisir(niv.comparaisons)
  const r = rng.entier(0, 2)   // 0 : égal, 1 : proche, 2 : piège
  const signe = () => (rng.vrai(0.5) ? 1 : -1)
  let A, vA, B, vB, u
  if (kind === 'm-cm') {
    const a = rng.entier(1, 5); u = 'cm'
    A = `${a} m`; vA = a * 100
    vB = r === 0 ? vA : vA + signe() * rng.entier(1, 9) * 10
    B = `${vB} cm`
  } else if (kind === 'mcm-cm') {
    const a = rng.entier(1, 3), c = rng.entier(1, 9) * 10; u = 'cm'
    A = `${a} m ${c} cm`; vA = a * 100 + c
    vB = r === 0 ? vA : r === 1 ? vA + signe() * rng.entier(1, 5) * 10 : a * 100 + c / 10
    if (vB === vA && r !== 0) vB += 10
    B = `${vB} cm`
  } else if (kind === 'km-m' || kind === 'kg-g') {
    const [gros, petit] = kind === 'km-m' ? ['km', 'm'] : ['kg', 'g']
    const a = rng.entier(1, kind === 'km-m' ? Math.min(3, niv.kmMax) : Math.min(3, niv.kgMax)); u = petit
    A = `${a} ${gros}`; vA = a * 1000
    if (r === 0) vB = vA
    // CE1 (1 km, 1 kg) : nombres ≤ 1 000 seulement
    else if (a === 1 && niv.kmMax === 1) vB = rng.entier(1, 9) * 100
    else vB = vA + signe() * rng.entier(1, 9) * 100
    B = `${vB} ${petit}`
  } else if (kind === 'cm-mm') {
    const a = rng.entier(2, 15); u = 'mm'
    A = `${a} cm`; vA = a * 10
    vB = r === 0 ? vA : r === 1 ? vA + signe() * rng.entier(1, 9) : a   // piège : 7 cm … 7 mm
    B = `${vB} mm`
  } else if (kind === 'L-cL') {
    const a = rng.entier(1, 3); u = 'cL'
    A = `${a} L`; vA = a * 100
    vB = r === 0 ? vA : r === 1 ? vA + signe() * rng.entier(1, 9) * 10 : a * 10
    B = `${vB} cL`
  } else {
    const a = rng.entier(1, 5); u = 'dL'
    A = `${a} L`; vA = a * 10
    vB = r === 0 ? vA : vA + signe() * rng.entier(1, 5)
    B = `${vB} dL`
  }
  const swap = rng.vrai(0.5)
  const [G, vG, D, vD] = swap ? [B, vB, A, vA] : [A, vA, B, vB]
  const sym = vG < vD ? '<' : vG > vD ? '>' : '='
  const affiche = `${G}  …  ${D}`
  return {
    type: 'comparer', cle: `cmp-${G}-${D}`,
    consigne: T('comparerQ'), affiche,
    mode: 'choix', choix: ['<', '=', '>'], reponse: sym, attendu: `${G} ${sym} ${D}`,
    texte: `${G} … ${D}`,
    explication: T('comparerExpl', { A, vA, u, vG, sym, vD }),
    vG, vD,
  }
}

