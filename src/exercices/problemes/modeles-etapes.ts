// Problèmes — les modèles d'énoncés à plusieurs étapes : deux étapes (CE1), trois étapes (CE2). Même règle que modeles-additifs.ts :
// l'ordre des tirages est celui des fiches d'une graine.
import type { Modele } from './contexte.ts'

export const DEUX_ETAPES: readonly Modele[] = [
  { cat: 'deuxEtapes', cap: 100, gen(ctx, _t, max) {
    // livre de 3 à 25 €, stylo de 1 à 5 €
    const p = ctx.prenom(), c = ctx.rng.entier(1, 5), b = ctx.rng.entier(3, Math.min(25, max - c - 2)), x = b + c
    if (x >= max) return null
    const r = ctx.rng.entier(1, Math.min(max - x, 50)), a = r + x
    const params = { ...ctx.personne(p), a, euroB: ctx.nb('euro', b), euroC: ctx.nb('euro', c) }
    return ctx.pb('achats', 'resteEurosQ', params, r, ctx.unite('euro'), `${b} + ${c} = ${x} ; ${a} − ${x} = ${r}`)
  } },
  { cat: 'deuxEtapes', cap: 60, gen(ctx, _t, max) {
    const [a, b] = ctx.somme(max), x = a + b, c = ctx.rng.entier(1, x - 1), r = x - c
    const params = { a, monteB: ctx.frag('monte', b), descendC: ctx.frag('descend', c) }
    return ctx.pb('bus2', 'busMaintenantQ', params, r, ctx.unite('passager'), `${a} + ${b} = ${x} ; ${x} − ${c} = ${r}`)
  } },
  { cat: 'deuxEtapes', cap: 100, gen(ctx, tables, max) {
    const [p1, p2] = ctx.deuxPrenoms(), [n, k] = ctx.produit(tables, max), x = n * k
    if (x < 3) return null
    const d = ctx.rng.entier(1, x - 1), r = x - d
    const params = { ...ctx.personne(p1, '1'), ...ctx.personne(p2, '2'), n, k, d }
    return ctx.pb('imagesDon', 'imagesDonQ', params, r, ctx.unite('image'), `${n} × ${k} = ${x} ; ${x} − ${d} = ${r}`)
  } },
  { cat: 'deuxEtapes', cap: 100, gen(ctx, _t, max) {
    const [p1, p2] = ctx.deuxPrenoms(), o = ctx.objet()
    let a: number, b: number
    do { [a, b] = ctx.somme(max) } while (2 * a + b > max)
    const x = a + b, r = a + x
    // « à eux deux » / « à elles deux » : elles seulement si les deux sont des filles
    const { ils, eux } = ctx.genre(p1.g === 'f' && p2.g === 'f' ? 'f' : 'm')
    const params = { ...ctx.personne(p1, '1'), ...ctx.personne(p2, '2'), ...ctx.texteObjet(o), a, b, que1: ctx.que(p1.nom), ils, eux }
    return ctx.pb('total2', 'total2Q', params, r, o, `${a} + ${b} = ${x} ; ${a} + ${x} = ${r}`)
  } },
  { cat: 'deuxEtapes', cap: 1000, gen(ctx, _t, max) {
    const [a, b] = ctx.somme(max), x = a + b, c = ctx.rng.entier(1, x - 1), r = x - c
    return ctx.pb('pommes', 'pommesQ', { a, b, c }, r, ctx.unite('pomme'), `${a} + ${b} = ${x} ; ${x} − ${c} = ${r}`)
  } },
]

// Trois étapes (CE2)
export const TROIS_ETAPES: readonly Modele[] = [
  { cat: 'deuxEtapes', cap: 100, niveaux: ['ce2'], gen(ctx, _t, max) {
    const p = ctx.prenom(), n = ctx.rng.entier(2, 5), k = ctx.rng.entier(2, 6), c = ctx.rng.entier(3, 9)
    const y = n * k + c
    if (y >= max) return null
    const r = ctx.rng.entier(1, Math.min(max - y, 40)), a = y + r
    return ctx.pb('achats3', 'resteEurosQ', { ...ctx.personne(p), a, n, k, c }, r, ctx.unite('euro'),
      `${n} × ${k} = ${n * k} ; ${n * k} + ${c} = ${y} ; ${a} − ${y} = ${r}`)
  } },
  { cat: 'deuxEtapes', cap: 60, niveaux: ['ce2'], gen(ctx, _t, max) {
    const a = ctx.rng.entier(10, Math.max(11, max - 25)), b = ctx.rng.entier(3, 12), c = ctx.rng.entier(2, a + b - 1), d = ctx.rng.entier(2, 10)
    const x = a + b, y = x - c, r = y + d
    if (r > max || y < 1) return null
    const params = { a, monteB: ctx.frag('monte', b), descendC: ctx.frag('descend', c), monteD: ctx.frag('monte', d) }
    return ctx.pb('bus3', 'busMaintenantQ', params, r, ctx.unite('passager'), `${a} + ${b} = ${x} ; ${x} − ${c} = ${y} ; ${y} + ${d} = ${r}`)
  } },
  { cat: 'deuxEtapes', cap: 100, niveaux: ['ce2'], gen(ctx, tables, max) {
    const [n, k] = ctx.produit(tables, max), x = n * k
    if (x < 6) return null
    const b = ctx.rng.entier(1, Math.min(9, x - 1)), y = x - b, c = ctx.rng.entier(2, 12), r = y + c
    if (r > max) return null
    const { maitre, il } = ctx.genre(ctx.rng.vrai(0.5) ? 'f' : 'm')
    const params = { maitre, il, n, k, c, eclateB: ctx.frag('eclate', b) }
    return ctx.pb('ballons', 'ballonsQ', params, r, ctx.unite('ballon'), `${n} × ${k} = ${x} ; ${x} − ${b} = ${y} ; ${y} + ${c} = ${r}`)
  } },
]
