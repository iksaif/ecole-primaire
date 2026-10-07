// Problèmes — les modèles d'énoncés multiplicatifs : multiplication, partage et groupements (tables du niveau), « fois plus » (CE2).
// Même règle que modeles-additifs.ts : l'ordre des tirages est celui des fiches d'une graine.
import type { Contexte, Modele } from './contexte.ts'

// La correction d'un groupement : « 4 × 5 = 20, donc 4 pages » (q groupes de k, soit t ; la réponse est q, dans son unité)
const groupement = (ctx: Contexte, q: number, k: number, t: number, unite: 'page' | 'equipe' | 'livre' | 'morceau'): string =>
  ctx.T('pb.groupementC', { q, k, t, nu: ctx.nb(unite, q) })

export const MULTIPLICATION: readonly Modele[] = [
  { cat: 'multiplication', cap: 1000, gen(ctx, tables, max) {
    const p = ctx.prenom(), o = ctx.paquet(), [n, k] = ctx.produit(tables, max)
    return ctx.pb('paquetsAchat', 'paquetsAchatQ', { ...ctx.personne(p), ...ctx.texteObjet(o), n, k }, n * k, o, ctx.detailMultiplication(n, k))
  } },
  { cat: 'multiplication', cap: 1000, gen(ctx, tables, max) {
    const [n, k] = ctx.produit(tables, max)
    return ctx.pb('chaises', 'chaisesQ', { n, k }, n * k, ctx.unite('chaise'), ctx.detailMultiplication(n, k))
  } },
  { cat: 'multiplication', cap: 1000, gen(ctx, _t, max) {        // « Un vélo a 2 roues »
    const c = ctx.chose(max)
    if (!c) return null
    let n: number
    do { n = ctx.rng.entier(2, 10) } while (n * c.k > Math.max(max, 20))
    const params = { ...ctx.genre(c.g), Un: c.un, partie: c.partie, dePartie: ctx.de(c.partie), ch: c.p, k: c.k, n }
    return ctx.pb('parties', 'partiesQ', params, n * c.k, { s: c.partieS, p: c.partie }, ctx.detailMultiplication(n, c.k))
  } },
  { cat: 'multiplication', cap: 1000, gen(ctx, tables, max) {
    const p = ctx.prenom(), [n, k] = ctx.produit(tables, max)
    return ctx.pb('feutres', 'feutresQ', { ...ctx.personne(p), n, k }, n * k, ctx.unite('euro'), ctx.detailMultiplication(n, k))
  } },
  { cat: 'multiplication', cap: 1000, gen(ctx, tables, max) {
    const [n, k] = ctx.produit(tables, max)
    return ctx.pb('chocolat', 'chocolatQ', { n, k }, n * k, ctx.unite('carre'), ctx.detailMultiplication(n, k))
  } },
  // multiplication par 10, 100 (CE2)
  { cat: 'multiplication', cap: 1000, min: 1000, niveaux: ['ce2'], gen(ctx) {
    const n = ctx.rng.entier(2, 9), k = ctx.rng.vrai(0.5) ? 10 : 100
    return ctx.pb('feuilles', 'feuillesQ', { n, k }, n * k, ctx.unite('feuille'), `${n} × ${k} = ${n * k}`)
  } },
]

// Partage équitable et groupements (pas de signe ÷ au CE1)
export const PARTAGE: readonly Modele[] = [
  { cat: 'partage', cap: 1000, gen(ctx, tables, max) {
    const p = ctx.prenom(), o = ctx.objet(), [q, k] = ctx.produit(tables, max), t = q * k
    const params = { ...ctx.personne(p), ...ctx.texteObjet(o), k, t, q, qo: ctx.nbObjet(q, o) }
    return ctx.pb('partageAmis', 'partageAmisQ', params, q, o, ctx.T('pb.partageAmisC', params))
  } },
  { cat: 'partage', cap: 1000, gen(ctx, tables, max) {
    const [q, k] = ctx.produit(tables, max), t = q * k
    const fem = ctx.rng.vrai(0.5)
    const nu = ctx.nb('feutre', q)
    return ctx.pb('partageGroupes', 'partageGroupesQ', { Maitre: ctx.genre(fem ? 'f' : 'm').Maitre, k, t }, q, ctx.unite('feutre'), ctx.T('pb.partageGroupesC', { q, k, t, nu }))
  } },
  { cat: 'partage', cap: 1000, gen(ctx, tables, max) {              // groupement
    const p = ctx.prenom(), [q, k] = ctx.produit(tables, max), t = q * k
    return ctx.pb('album', 'albumQ', { ...ctx.personne(p), k, t }, q, ctx.unite('page'), groupement(ctx, q, k, t, 'page'))
  } },
  { cat: 'partage', cap: 1000, gen(ctx, tables, max) {
    const [q, k] = ctx.produit(tables, max), t = q * k
    return ctx.pb('equipes', 'equipesQ', { k, t }, q, ctx.unite('equipe'), groupement(ctx, q, k, t, 'equipe'))
  } },
  { cat: 'partage', cap: 1000, gen(ctx, tables, max) {
    const p = ctx.prenom(), [q, k] = ctx.produit(tables, max), t = q * k
    return ctx.pb('livresAchat', 'livresAchatQ', { ...ctx.personne(p), k, t }, q, ctx.unite('livre'), groupement(ctx, q, k, t, 'livre'))
  } },
  // partage avec reste (CE2) : « combien de boîtes remplies », « combien de voitures »
  { cat: 'partage', cap: 1000, niveaux: ['ce2'], gen(ctx, tables, max) {
    const p = ctx.prenom(), [q, k] = ctx.produit(tables, max), reste = ctx.rng.entier(1, k - 1)
    if (k < 3) return null
    const t = q * k + reste
    if (t > max) return null
    return ctx.pb('oeufs', 'oeufsQ', { ...ctx.personne(p), k, t }, q, ctx.unite('boite'), ctx.T('pb.oeufsC', { n: reste, q, k, qk: q * k, reste }))
  } },
  { cat: 'partage', cap: 1000, niveaux: ['ce2'], gen(ctx, tables, max) {
    const [q, k] = ctx.produit(tables, max), reste = ctx.rng.entier(1, k - 1)
    if (k < 3) return null
    const t = q * k + reste
    if (t > max) return null
    return ctx.pb('sortie', 'sortieQ', { k, t }, q + 1, ctx.unite('voiture'), ctx.T('pb.sortieC', { n: reste, q, k, qk: q * k, reste, q1: q + 1 }))
  } },
  { cat: 'partage', cap: 1000, gen(ctx, tables, max) {             // « combien de fois »
    const [q, k] = ctx.produit(tables, max), t = q * k
    return ctx.pb('ruban', 'rubanQ', { k, t }, q, ctx.unite('morceau'), groupement(ctx, q, k, t, 'morceau'))
  } },
]

// Comparaison multiplicative « fois plus » (CE2) : les facteurs restent dans les tables de 2 à 5
const TABLES_FOIS_PLUS = [2, 3, 4, 5]
export const FOIS_PLUS: readonly Modele[] = [
  { cat: 'foisPlus', cap: 1000, gen(ctx, _t, max) {
    const [p1, p2] = ctx.deuxPrenoms(), o = ctx.objet(), [a, k] = ctx.produit(TABLES_FOIS_PLUS, max)
    const params = { ...ctx.personne(p1, '1'), ...ctx.personne(p2, '2'), ...ctx.texteObjet(o), a, k, que1: ctx.que(p1.nom) }
    return ctx.pb('foisPlus', 'combienA2', params, a * k, o, `${a} × ${k} = ${a * k}`)
  } },
  { cat: 'foisPlus', cap: 1000, gen(ctx, _t, max) {
    const [a, k] = ctx.produit(TABLES_FOIS_PLUS, max)
    return ctx.pb('manteau', 'manteauQ', { a, k }, a * k, ctx.unite('euro'), `${a} × ${k} = ${a * k}`)
  } },
  { cat: 'foisPlus', cap: 1000, gen(ctx) {
    const p = ctx.prenom(), a = ctx.rng.entier(7, 10), k = ctx.rng.choisir([3, 4])
    const parent = ctx.parent(p)
    const params = { ...ctx.personne(p), a, k, parentSujet: parent.sujet, parentNom: parent.nom, parentAccord: parent.accord, dePrenom: ctx.de(p.nom) }
    return ctx.pb('age', 'ageQ', params, a * k, ctx.unite('an'), `${a} × ${k} = ${a * k}`)
  } },
]
