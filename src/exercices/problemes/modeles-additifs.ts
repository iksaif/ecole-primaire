// Problèmes — les modèles d'énoncés additifs : ajout et retrait, comparaison, parties et tout. Chaque modèle tire ses prénoms, ses
// objets et ses nombres (dans cet ordre : c'est l'ordre des tirages, donc des fiches d'une graine), puis écrit son problème avec les
// textes `pb.<id>` du catalogue (textes.ts).
import type { Modele } from './contexte.ts'

// « a + b = c » et « c − a = b » : les calculs qui reviennent
const somme = (a: number, b: number): string => `${a} + ${b} = ${a + b}`
const difference = (c: number, a: number): string => `${c} − ${a} = ${c - a}`

export const AJOUT_RETRAIT: readonly Modele[] = [
  { cat: 'ajoutRetrait', cap: 100, gen(ctx, _t, max) {          // état final, ajout
    const p = ctx.prenom(), o = ctx.objet(['timbre']), [a, b] = ctx.somme(max)
    return ctx.pb('ajoutGain', 'ajoutGainQ', { ...ctx.personne(p), ...ctx.texteObjet(o), a, b }, a + b, o, somme(a, b))
  } },
  { cat: 'ajoutRetrait', cap: 10000, gen(ctx, _t, max) {
    const p = ctx.prenom(), [a, b] = ctx.somme(max)
    return ctx.pb('timbres', 'timbresQ', { ...ctx.personne(p), a, b }, a + b, ctx.unite('timbre'), somme(a, b))
  } },
  { cat: 'ajoutRetrait', cap: 60, gen(ctx, _t, max) {           // état final, retrait
    const [r, b] = ctx.somme(max), a = r + b
    return ctx.pb('busRetrait', 'busRetraitQ', { a, descend: ctx.frag('descend', b) }, r, ctx.unite('passager'), difference(a, b))
  } },
  { cat: 'ajoutRetrait', cap: 1000, gen(ctx, _t, max) {
    const p = ctx.prenom(), [r, b] = ctx.somme(max), a = r + b
    return ctx.pb('livrePages', 'livrePagesQ', { ...ctx.personne(p), a, b }, r, ctx.unite('page'), difference(a, b))
  } },
  { cat: 'ajoutRetrait', cap: 100, gen(ctx, _t, max) {          // état initial inconnu (après un gain)
    const p = ctx.prenom(), o = ctx.objet(), [a, b] = ctx.somme(max), c = a + b
    return ctx.pb('initialGain', 'initialGainQ', { ...ctx.personne(p), ...ctx.texteObjet(o), b, c }, a, o, difference(c, b))
  } },
  { cat: 'ajoutRetrait', cap: 100, gen(ctx, _t, max) {          // état initial inconnu (après une perte)
    const p = ctx.prenom(), [b, c] = ctx.somme(max)
    return ctx.pb('initialPerte', 'initialPerteQ', { ...ctx.personne(p), b, c }, b + c, ctx.unite('bonbon'), somme(b, c))
  } },
  { cat: 'ajoutRetrait', cap: 10000, gen(ctx, _t, max) {
    const [b, c] = ctx.somme(max)
    return ctx.pb('bibliotheque', 'bibliothequeQ', { b, c }, b + c, ctx.unite('livre'), somme(b, c))
  } },
  { cat: 'ajoutRetrait', cap: 100, gen(ctx, _t, max) {          // transformation inconnue (ajout)
    const [a, b] = ctx.somme(max), c = a + b
    return ctx.pb('cour', 'courQ', { a, c }, b, ctx.unite('enfant'), difference(c, a))
  } },
  { cat: 'ajoutRetrait', cap: 100, gen(ctx, _t, max) {          // transformation inconnue (retrait)
    const p = ctx.prenom(), [c, b] = ctx.somme(max), a = b + c
    return ctx.pb('tirelire', 'tirelireQ', { ...ctx.personne(p), a, c }, b, ctx.unite('euro'), difference(a, c))
  } },
  { cat: 'ajoutRetrait', cap: 1000, gen(ctx, _t, max) {
    const p = ctx.prenom(), [a, b] = ctx.somme(max), c = a + b
    return ctx.pb('partiePoints', 'partiePointsQ', { ...ctx.personne(p), a, c }, b, ctx.unite('point'), difference(c, a))
  } },
]

export const COMPARAISON: readonly Modele[] = [
  { cat: 'comparaison', cap: 100, gen(ctx, _t, max) {           // « de plus »
    const [p1, p2] = ctx.deuxPrenoms(), o = ctx.objet(), [a, b] = ctx.somme(max)
    const params = { ...ctx.personne(p1, '1'), ...ctx.personne(p2, '2'), ...ctx.texteObjet(o), a, b, bo: ctx.nbObjet(b, o), que1: ctx.que(p1.nom) }
    return ctx.pb('compPlus', 'combienA2', params, a + b, o, somme(a, b))
  } },
  { cat: 'comparaison', cap: 100, gen(ctx, _t, max) {           // « de moins »
    const [p1, p2] = ctx.deuxPrenoms(), o = ctx.objet(), [r, b] = ctx.somme(max), a = r + b
    const params = { ...ctx.personne(p1, '1'), ...ctx.personne(p2, '2'), ...ctx.texteObjet(o), a, b, bo: ctx.nbObjet(b, o), que1: ctx.que(p1.nom) }
    return ctx.pb('compMoins', 'combienA2', params, r, o, difference(a, b))
  } },
  { cat: 'comparaison', cap: 100, gen(ctx, _t, max) {           // écart
    const [p1, p2] = ctx.deuxPrenoms(), o = ctx.objet(), [a, b] = ctx.somme(max), c = a + b
    const params = { ...ctx.personne(p1, '1'), ...ctx.personne(p2, '2'), ...ctx.texteObjet(o), a, c, que1: ctx.que(p1.nom) }
    return ctx.pb('compEcart', 'compEcartQ', params, b, o, difference(c, a))
  } },
  { cat: 'comparaison', cap: 100, gen(ctx, _t, max) {           // comparaison « inversée » (piège) : l'énoncé parle de p1, la question de p2
    const [p1, p2] = ctx.deuxPrenoms(), o = ctx.objet(), [r, b] = ctx.somme(max), a = r + b
    const params = { ...ctx.personne(p1, '1'), ...ctx.personne(p2, '2'), ...ctx.texteObjet(o), a, b, bo: ctx.nbObjet(b, o), que2: ctx.que(p2.nom) }
    return ctx.pb('compInverse', 'combienA2', params, r, o, difference(a, b))
  } },
  { cat: 'comparaison', cap: 10000, gen(ctx, _t, max) {
    const [a, b] = ctx.somme(max)
    return ctx.pb('ecoles', 'ecolesQ', { a, eleves: ctx.nb('eleve', b) }, a + b, ctx.unite('eleve'), somme(a, b))
  } },
  { cat: 'comparaison', cap: 1000, min: 1000, gen(ctx) {
    const r = ctx.rng.entier(40, 300), b = ctx.rng.entier(20, 400), a = r + b
    return ctx.pb('velo', 'veloQ', { a, euros: ctx.nb('euro', b) }, r, ctx.unite('euro'), difference(a, b))
  } },
]

export const PARTIES_TOUT: readonly Modele[] = [
  { cat: 'partiesTout', cap: 30, gen(ctx, _t, max) {
    const [a, b] = ctx.somme(max)
    return ctx.pb('classe', 'classeQ', { filles: ctx.nb('fille', a), garcons: ctx.nb('garcon', b) }, a + b, ctx.unite('eleve'), somme(a, b))
  } },
  { cat: 'partiesTout', cap: 50, gen(ctx, _t, max) {            // partie inconnue
    const [a, b] = ctx.somme(max), c = a + b
    return ctx.pb('panier', 'panierQ', { c, pommes: ctx.nb('pomme', a) }, b, ctx.unite('poire'), difference(c, a))
  } },
  { cat: 'partiesTout', cap: 100, gen(ctx, _t, max) {
    const p = ctx.prenom(), o = ctx.objet(['timbre']), [a, b] = ctx.somme(max), c = a + b
    // « bleus » s'accorde avec l'objet, pas avec le prénom : il passe après les mots du prénom
    const params = { ...ctx.personne(p), ...ctx.texteObjet(o), a, c, rouge: ctx.frag('rouge', a), bleus: ctx.genre(o.g).bleus }
    return ctx.pb('couleurs', 'couleursQ', params, b, o, difference(c, a))
  } },
  { cat: 'partiesTout', cap: 1000, gen(ctx, _t, max) {
    const [a, b] = ctx.somme(max)
    return ctx.pb('ferme', 'fermeQ', { poules: ctx.nb('poule', a), canards: ctx.nb('canard', b) }, a + b, ctx.unite('animal'), somme(a, b))
  } },
  { cat: 'partiesTout', cap: 1000, gen(ctx, _t, max) {
    const [a, b] = ctx.somme(max), c = a + b
    return ctx.pb('cinema', 'cinemaQ', { c, adultes: ctx.nb('adulte', a) }, b, ctx.unite('enfant'), difference(c, a))
  } },
]
