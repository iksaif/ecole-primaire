// Tests de logique pure (node) : nombres en lettres, catalogue des fiches
import { enLettresFr, enLettresBr } from '../src/utils/nombres.js'
import { TELECHARGEMENTS } from '../src/impression/catalogue.js'
import { verifier } from './outils.mjs'

console.log('Nombres en lettres')
const FR = { 0: 'zéro', 21: 'vingt-et-un', 71: 'soixante-et-onze', 80: 'quatre-vingts', 81: 'quatre-vingt-un', 91: 'quatre-vingt-onze',
  200: 'deux-cents', 201: 'deux-cent-un', 280: 'deux-cent-quatre-vingts', 1000: 'mille', 80000: 'quatre-vingt-mille' }
for (const [n, attendu] of Object.entries(FR)) verifier(enLettresFr(+n) === attendu, `${n} → ${attendu}`)
verifier(enLettresFr(71, { rectifiee: false }) === 'soixante et onze', '71 (traditionnelle) → soixante et onze')
verifier(enLettresFr(201, { rectifiee: false }) === 'deux cent un', '201 (traditionnelle) → deux cent un')
// Breton : vérifiés dans le Wiktionnaire et le Meurgorf
const BR = { 21: 'unan warn-ugent', 31: 'unan ha tregont', 42: 'daou ha daou-ugent', 51: 'unan hag hanter-kant', 70: 'dek ha tri-ugent',
  75: 'pemzek ha tri-ugent', 80: 'pevar-ugent', 99: 'naontek ha pevar-ugent', 101: 'kant unan', 125: 'kant pemp warn-ugent',
  200: "daou c'hant", 2000: 'daou vil' }
for (const [n, attendu] of Object.entries(BR)) verifier(enLettresBr(+n) === attendu, `${n} → ${attendu}`)

console.log('Règles de langue')
const { regles } = await import('../src/i18n/regles.js')
const F = regles('fr'), B = regles('br')
const exemples = [
  [F.nombre(1, 'bille'), '1 bille'], [F.nombre(3, 'bille'), '3 billes'], [F.nombre(2, { s: 'cheval', p: 'chevaux' }), '2 chevaux'],
  [F.que('Emma'), "qu'Emma"], [F.que('Léo'), 'que Léo'], [F.de('euros'), "d'euros"],
  [B.nombre(3, 'bilhenn'), '3 bilhenn'], [B.et('aval'), 'hag'], [B.et('bara'), 'ha'],
  [B.le('ki'), "ar c'hi"], [B.le('kador', 'f'), 'ar gador'], [B.le('taol', 'f'), 'an daol'], [B.le('mamm', 'f'), 'ar vamm'],
  [B.le('aval'), 'an aval'], [B.le('loar', 'f'), 'al loar'], [B.le('bara'), 'ar bara'],
]
for (const [obtenu, attendu] of exemples) verifier(obtenu === attendu, `${attendu}${obtenu !== attendu ? ` (obtenu : ${obtenu})` : ''}`)

console.log('Catalogue des fiches')
const slugs = TELECHARGEMENTS.map(t => t.slug)
verifier(new Set(slugs).size === slugs.length, `${slugs.length} fiches, slugs uniques`)
verifier(TELECHARGEMENTS.every(t => t.langues?.length), 'chaque fiche a ses langues')

console.log('Affiches du programme')
const { conjuguer, VERBES } = await import('../src/data/conjugaison.js')
const CONJ = [
  ['etre', 'present', 3, 'nous sommes'], ['etre', 'imparfait', 0, "j'étais"], ['etre', 'futur', 5, 'ils / elles seront'], ['etre', 'passe-simple', 2, 'il / elle / on fut'],
  ['avoir', 'present', 0, "j'ai"], ['avoir', 'passe-compose', 1, 'tu as eu'], ['avoir', 'plus-que-parfait', 0, "j'avais eu"],
  ['chanter', 'present', 3, 'nous chantons'], ['chanter', 'passe-simple', 5, 'ils / elles chantèrent'], ['finir', 'present', 5, 'ils / elles finissent'], ['finir', 'imparfait', 3, 'nous finissions'],
  ['aller', 'present', 0, 'je vais'], ['aller', 'futur', 0, "j'irai"], ['aller', 'passe-compose', 3, 'nous sommes allé(e)s'], ['aller', 'plus-que-parfait', 2, 'il / elle / on était allé(e)'],
  ['faire', 'present', 4, 'vous faites'], ['dire', 'present', 4, 'vous dites'], ['venir', 'futur', 2, 'il / elle / on viendra'], ['venir', 'passe-simple', 5, 'ils / elles vinrent'],
  ['pouvoir', 'present', 0, 'je peux'], ['pouvoir', 'futur', 0, 'je pourrai'], ['voir', 'futur', 3, 'nous verrons'], ['voir', 'imparfait', 3, 'nous voyions'] ,
  ['vouloir', 'present', 2, 'il / elle / on veut'], ['vouloir', 'futur', 0, 'je voudrai'], ['prendre', 'present', 5, 'ils / elles prennent'], ['prendre', 'passe-simple', 0, 'je pris'],
]
for (const [v, t, i, attendu] of CONJ) {
  const obtenu = conjuguer(v, t)[i]
  verifier(obtenu === attendu, `${v} ${t} → ${attendu}${obtenu !== attendu ? ` (obtenu : ${obtenu})` : ''}`)
}
verifier(Object.keys(VERBES).length === 12, 'les 12 verbes du programme (être, avoir, 1er et 2e groupes, 8 irréguliers)')
verifier(TELECHARGEMENTS.filter(t => t.type === 'nombres').every(t => t.lien === `/imprimer/nombres?mise=${t.config.miseEnPage}`), 'nombres : le lien garde la mise en page (affiches / fiche)')

console.log('Pluriels (Intl.PluralRules)')
const { choisirPluriel } = await import('../src/i18n/pluriel.js')
const pages = { fr: { one: '{n} page', other: '{n} pages' }, br: { one: 'bajenn', two: 'bajenn', few: 'fajenn', many: 'a bajennoù', other: 'pajenn' } }
verifier(choisirPluriel(pages.fr, { n: 1 }, 'fr') === '{n} page' && choisirPluriel(pages.fr, { n: 3 }, 'fr') === '{n} pages', 'français : 1 page / 3 pages')
verifier(choisirPluriel(pages.br, { n: 3 }, 'br') === 'fajenn' && choisirPluriel(pages.br, { n: 5 }, 'br') === 'pajenn' && choisirPluriel(pages.br, { n: 2 }, 'br') === 'bajenn',
  'breton : 2 → « two », 3 → « few », 5 → « other »')
verifier(choisirPluriel('texte simple', { n: 3 }, 'br') === 'texte simple', 'message sans pluriel inchangé')
