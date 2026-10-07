// Les mesures — questions sur les masses : balance à l'équilibre (masses marquées, kg et g), boîtes, seuils.
// Contexte et forme des questions : voir longueurs.ts et types.ts.
import type { Rng } from '../../utils/hasard.ts'
import { svgBalance, fmtMasse } from './dessins.ts'
import type { Contexte, Question, T } from './types.ts'

// Objets posés sur la balance, choisis selon la masse pour rester vraisemblables
// noms dans le catalogue de contenu (`objetsMasse.<id>`, `boites.<id>`)
type IdObjet = 'paquet' | 'cadeau' | 'ours' | 'bonbon' | 'cle' | 'clementine' | 'pasteque' | 'citrouille'
interface Objet { e: string, id: IdObjet, n: string }
const OBJETS_G: readonly { e: string, id: IdObjet }[] = [{ e: '📦', id: 'paquet' }, { e: '🎁', id: 'cadeau' }, { e: '🧸', id: 'ours' }]   // ≥ 100 g
const nomObj = (T: T, o: { e: string, id: IdObjet }): Objet => ({ ...o, n: T(`objetsMasse.${o.id}`) })
function objetPourMasse({ rng, T }: { rng: Rng, T: T }, g: number): Objet {
  if (g < 10) return nomObj(T, { e: '🍬', id: 'bonbon' })
  if (g < 50) return nomObj(T, { e: '🔑', id: 'cle' })
  if (g < 100) return nomObj(T, { e: '🍊', id: 'clementine' })
  return nomObj(T, rng.choisir(OBJETS_G))
}
const OBJETS_KG: readonly { e: string, id: IdObjet }[] = [{ e: '🍉', id: 'pasteque' }, { e: '🎃', id: 'citrouille' }]
type IdBoite = 'rouge' | 'bleue' | 'verte' | 'jaune'
const BOITES: readonly { couleur: string, id: IdBoite }[] = [
  { couleur: '#e74c3c', id: 'rouge' },
  { couleur: '#3498db', id: 'bleue' },
  { couleur: '#2ecc71', id: 'verte' },
  { couleur: '#f1c40f', id: 'jaune' },
]

function sousEnsemble(rng: Rng, liste: readonly number[], k: number): number[] {
  return rng.melanger(liste.map((_, i) => i)).slice(0, k).map(i => liste[i]).sort((a, b) => b - a)
}

export function genMasse(ctx: Contexte): Question {
  const { rng, T, niv } = ctx
  const sous = rng.choisir(niv.masses)
  if (sous === 'equilibreMix') {
    // CE2 : 1 kg + des masses en g → réponse en g
    const g = sousEnsemble(rng, niv.boiteMasses.filter(m => m >= 50), rng.entier(1, 2))
    const masses = [1000, ...g]
    const total = masses.reduce((a, b) => a + b, 0)
    const obj = nomObj(T, rng.choisir(OBJETS_KG))
    const items = masses.map(m => ({ kind: 'masse' as const, g: m }))
    const ecrites = masses.map(fmtMasse).join(' + ')
    return {
      type: 'masse', cle: `masse-mix-${masses.join('+')}`,
      consigne: T('masseMixQ', { n: obj.n }),
      svg: svgBalance(0, [{ kind: 'emoji', e: obj.e }], items, T('ariaBalance')),
      mode: 'nombre', unite: 'g', reponse: total, attendu: `${total} g`,
      texte: `${T('balance')} : ${obj.e} = ${ecrites}`,
      explication: `1 kg = 1000 g. ${masses.map(m => `${m} g`).join(' + ')} = ${total} g.`,
    }
  }
  if (sous === 'equilibre' || sous === 'equilibreKg') {
    const enKg = sous === 'equilibreKg'
    const masses = enKg
      ? sousEnsemble(rng, niv.boiteKg, rng.entier(2, 3))
      : sousEnsemble(rng, niv.boiteMasses, rng.entier(2, 4))
    const total = masses.reduce((a, b) => a + b, 0)
    const u = enKg ? 'kg' : 'g'
    const obj = enKg ? nomObj(T, rng.choisir(OBJETS_KG)) : objetPourMasse(ctx, total)
    const items = masses.map(m => ({ kind: 'masse' as const, g: enKg ? m * 1000 : m }))
    return {
      type: 'masse', cle: `masse-eq-${u}-${masses.join('+')}`,
      consigne: T('masseEqQ', { n: obj.n }),
      svg: svgBalance(0, [{ kind: 'emoji', e: obj.e }], items, T('ariaBalance')),
      mode: 'nombre', unite: u, reponse: total, attendu: `${total} ${u}`,
      texte: `${T('balance')} : ${obj.e} = ${masses.map(m => `${m} ${u}`).join(' + ')}`,
      explication: `${T('masseEqExpl', { n: obj.n })} ${masses.map(m => `${m} ${u}`).join(' + ')} = ${total} ${u}.`,
    }
  }
  if (sous === 'boites') {
    const [b1, b2] = rng.melanger(BOITES).slice(0, 2).map(b => ({ ...b, n: T(`boites.${b.id}`) }))
    const lourd = rng.entier(0, 1)   // 0 : gauche plus lourde
    const t1 = rng.choisir([40, 55, 70]), t2 = rng.choisir([40, 55, 70])
    const gauche = [{ kind: 'boite' as const, couleur: b1.couleur, w: t1, h: t1 * 0.8 }]
    const droite = [{ kind: 'boite' as const, couleur: b2.couleur, w: t2, h: t2 * 0.8 }]
    const rep = lourd === 0 ? b1.n : b2.n
    return {
      type: 'masse', cle: `masse-boites-${b1.id}-${b2.id}-${lourd}-${t1}-${t2}`,
      consigne: T('boitesQ'),
      svg: svgBalance(lourd === 0 ? 1 : -1, gauche, droite, T('ariaBalance')),
      mode: 'choix', choix: [b1.n, b2.n], reponse: rep, attendu: rep,
      texte: T('boitesTexte', { b1: b1.n, b2: b2.n.toLowerCase() }),
      explication: T('boitesExpl'),
    }
  }
  const X = rng.choisir(niv.seuils)
  const plus = rng.vrai(0.5)
  const choix = [T('seuilPlus', { x: fmtMasse(X) }), T('seuilMoins', { x: fmtMasse(X) })]
  const rep = plus ? choix[0] : choix[1]
  return {
    type: 'masse', cle: `masse-seuil-${X}-${plus}`,
    consigne: T('seuilQ', { x: fmtMasse(X) }),
    svg: svgBalance(plus ? 1 : -1, [{ kind: 'emoji', e: '📦' }], [{ kind: 'masse', g: X }], T('ariaBalance')),
    mode: 'choix', choix, reponse: rep, attendu: rep,
    texte: T('seuilTexte', { x: fmtMasse(X) }),
    explication: T(plus ? 'seuilExplPlus' : 'seuilExplMoins', { x: fmtMasse(X) }),
  }
}
