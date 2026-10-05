// @ts-check
// Les mesures — questions sur les contenances (CE2) : broc gradué, bouteilles, verres, unité adaptée.
// Contexte et forme des questions : voir longueurs.js.
import { svgBroc, svgBouteilles } from './dessins.js'
import { questionUnite } from './longueurs.js'

export function genContenance(ctx) {
  const { rng, T, niv } = ctx
  const sous = rng.choisir(niv.contenances)
  if (sous === 'unite') {
    // Mélange avec d'autres unités (kg, m…) pour obliger à réfléchir
    return questionUnite(ctx, 'contenance', rng.choisir(niv.objetsContenance), niv.unitesContenance)
  }
  if (sous === 'broc') {
    const { max, u } = rng.choisir(niv.brocs)
    const k = rng.entier(1, max)
    return {
      type: 'contenance', cle: `cont-broc-${max}-${u}-${k}`,
      consigne: T(u === 'L' ? 'brocQL' : 'brocQdL'),
      svg: svgBroc(max, k, u, T('ariaBroc')),
      mode: 'nombre', unite: u, reponse: k, attendu: `${k} ${u}`,
      texte: T('brocTexte', { max, u }),
      explication: T('brocExpl', { k, u }) + (u === 'dL' && k === 10 ? ' 10 dL = 1 L.' : ''),
      max, k,
    }
  }
  if (sous === 'verres') {
    const c = rng.choisir([20, 25, 50]), Bt = rng.choisir([1, 2])
    const n = Bt * 100 / c
    return {
      // la clé ne dépend que du verre (comme avant : une seule question par taille de verre)
      type: 'contenance', cle: `cont-verres-${c}`,
      consigne: T('verresQ', { c, b: Bt }),
      mode: 'nombre', unite: T('verres'), reponse: n, attendu: `${n} ${T('verres')}`,
      texte: T('verresTexte', { c, b: Bt }),
      explication: `${Bt} L = ${Bt * 100} cL. ${Array(n).fill(c).join(' + ')} = ${Bt * 100} cL : ${T('verresExpl', { n })}.`,
      c, B: Bt,
    }
  }
  const { max1, max2 } = niv.bouteilles
  const n2 = rng.entier(0, max2)
  const n1 = rng.entier(n2 === 0 ? 2 : n2 === 1 ? 1 : 0, max1)
  const total = n1 + 2 * n2
  const parts = []
  if (n2) parts.push(T('bouteilles', { n: n2, l: 2 }) + ` = ${2 * n2} L`)
  if (n1) parts.push(T('bouteilles', { n: n1, l: 1 }) + ` = ${n1} L`)
  return {
    type: 'contenance', cle: `cont-bout-${n1}-${n2}`,
    consigne: T('bouteillesQ'),
    svg: svgBouteilles(n1, n2, T('ariaBouteilles')),
    mode: 'nombre', unite: 'L', reponse: total, attendu: `${total} L`,
    texte: T('bouteillesTexte', { n1, n2 }),
    explication: parts.length === 2 ? `${parts.join(' ; ')}. ${2 * n2} + ${n1} = ${total} L.` : `${parts[0]}.`,
    n1, n2,
  }
}

