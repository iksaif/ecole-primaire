// Les mesures — questions sur les contenances (CE2) : broc gradué, bouteilles, verres, unité adaptée.
// Contexte et forme des questions : voir longueurs.ts et types.ts.
import { svgBroc, svgBouteilles } from './dessins.ts'
import { questionUnite } from './longueurs.ts'
import type { Contexte, Question } from './types.ts'

export function genContenance(ctx: Contexte): Question {
  const { rng, T, niv } = ctx
  const { contenances, brocs, bouteilles, objetsContenance, unitesContenance } = niv
  if (!contenances || !brocs || !bouteilles || !objetsContenance || !unitesContenance) throw new Error('mesures : pas de contenances au programme du niveau')
  const sous = rng.choisir(contenances)
  if (sous === 'unite') {
    // Mélange avec d'autres unités (kg, m…) pour obliger à réfléchir
    return questionUnite(ctx, 'contenance', rng.choisir(objetsContenance), unitesContenance)
  }
  if (sous === 'broc') {
    const { max, u } = rng.choisir(brocs)
    const k = rng.entier(1, max)
    return {
      type: 'contenance', cle: `cont-broc-${max}-${u}-${k}`,
      consigne: T(u === 'L' ? 'brocQL' : 'brocQdL'),
      svg: svgBroc(max, k, u, T('ariaBroc')),
      mode: 'nombre', unite: u, reponse: k, attendu: `${k} ${u}`,
      texte: T('brocTexte', { max, u }),
      explication: T('brocExpl', { k, u }) + (u === 'dL' && k === 10 ? ' 10 dL = 1 L.' : ''),
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
      explication: `${Bt} L = ${Bt * 100} cL. ${Array.from({ length: n }, () => c).join(' + ')} = ${Bt * 100} cL : ${T('verresExpl', { n })}.`,
    }
  }
  const { max1, max2 } = bouteilles
  const n2 = rng.entier(0, max2)
  const n1 = rng.entier(n2 === 0 ? 2 : n2 === 1 ? 1 : 0, max1)
  const total = n1 + 2 * n2
  const parts: string[] = []
  if (n2) parts.push(T('bouteilles', { n: n2, l: 2 }) + ` = ${2 * n2} L`)
  if (n1) parts.push(T('bouteilles', { n: n1, l: 1 }) + ` = ${n1} L`)
  return {
    type: 'contenance', cle: `cont-bout-${n1}-${n2}`,
    consigne: T('bouteillesQ'),
    svg: svgBouteilles(n1, n2, T('ariaBouteilles')),
    mode: 'nombre', unite: 'L', reponse: total, attendu: `${total} L`,
    texte: T('bouteillesTexte', { n1, n2 }),
    explication: parts.length === 2 ? `${parts.join(' ; ')}. ${2 * n2} + ${n1} = ${total} L.` : `${parts[0]}.`,
  }
}
