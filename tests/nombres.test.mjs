// Nombres en lettres (node, sans Chrome) : src/langues/fr/nombres.ts et src/langues/br/nombres.ts, par le registre de langues.
// Les valeurs bretonnes sont vérifiées (Wiktionnaire, Meurgorf, Kervarker) : ce test ne doit pas être « corrigé » sans source.
//   node tests/nombres.test.mjs
import { donneesRegionales } from '../src/langues/registre.ts'
import { enLettresFr } from '../src/langues/fr/nombres.ts'
import { enLettresBr } from '../src/langues/br/nombres.ts'
import { verifier, nbEchecs } from './outils.mjs'

console.log('Français : orthographe rectifiée (1990, traits d’union partout)')
const FR = { 0: 'zéro', 1: 'un', 16: 'seize', 17: 'dix-sept', 21: 'vingt-et-un', 22: 'vingt-deux', 60: 'soixante', 70: 'soixante-dix', 71: 'soixante-et-onze',
  72: 'soixante-douze', 80: 'quatre-vingts', 81: 'quatre-vingt-un', 90: 'quatre-vingt-dix', 91: 'quatre-vingt-onze', 99: 'quatre-vingt-dix-neuf',
  100: 'cent', 101: 'cent-un', 200: 'deux-cents', 201: 'deux-cent-un', 280: 'deux-cent-quatre-vingts', 999: 'neuf-cent-quatre-vingt-dix-neuf',
  1000: 'mille', 1001: 'mille-un', 2000: 'deux-mille', 80000: 'quatre-vingt-mille', 80080: 'quatre-vingt-mille-quatre-vingts',
  200000: 'deux-cent-mille', 999999: 'neuf-cent-quatre-vingt-dix-neuf-mille-neuf-cent-quatre-vingt-dix-neuf' }
for (const [n, attendu] of Object.entries(FR)) verifier(enLettresFr(+n) === attendu, `${n} → ${attendu}`)

console.log('Français : orthographe traditionnelle')
const TRAD = { 21: 'vingt et un', 71: 'soixante et onze', 81: 'quatre-vingt-un', 201: 'deux cent un', 1001: 'mille un', 2021: 'deux mille vingt et un' }
for (const [n, attendu] of Object.entries(TRAD)) verifier(enLettresFr(+n, { rectifiee: false }) === attendu, `${n} → ${attendu}`)

console.log('Français : hors limites')
verifier(enLettresFr(-5) === 'cinq', 'un nombre négatif s’écrit sans signe')
verifier(enLettresFr(12.9) === 'douze', 'la partie entière seule')
verifier(enLettresFr(1000000) === '1000000', 'au-delà de 999 999 : les chiffres, rien d’inventé')

console.log('Breton (vérifiés : Wiktionnaire, Meurgorf)')
const BR = { 0: 'zero', 1: 'unan', 19: 'naontek', 20: 'ugent', 21: 'unan warn-ugent', 31: 'unan ha tregont', 40: 'daou-ugent', 42: 'daou ha daou-ugent',
  50: 'hanter-kant', 51: 'unan hag hanter-kant', 60: 'tri-ugent', 70: 'dek ha tri-ugent', 75: 'pemzek ha tri-ugent', 80: 'pevar-ugent',
  94: 'pevarzek ha pevar-ugent', 99: 'naontek ha pevar-ugent', 100: 'kant', 101: 'kant unan', 125: 'kant pemp warn-ugent', 200: "daou c'hant",
  300: "tri c'hant", 1000: 'mil', 2000: 'daou vil', 2021: 'daou vil unan warn-ugent', 2125: 'daou vil kant pemp warn-ugent' }
for (const [n, attendu] of Object.entries(BR)) verifier(enLettresBr(+n) === attendu, `${n} → ${attendu}`)
verifier(enLettresBr(10000) === '10000', 'au-delà de 9 999 : les chiffres, rien d’inventé')

console.log('Invariants sur toute la plage')
// forme : mots en minuscules (lettres, apostrophe, tiret), séparés par une seule espace, ni espace de bord ni mot vide
const BIEN_FORME = /^[a-zàâäéèêëîïôöùûüçœ'’-]+(?: [a-zàâäéèêëîïôöùûüçœ'’-]+)*$/
const mal = (f, max) => { const m = []; for (let n = 0; n <= max; n++) { const s = f(n); if (!BIEN_FORME.test(s)) m.push(`${n} → « ${s} »`) } return m }
const malFr = mal(enLettresFr, 999999), malBr = mal(enLettresBr, 9999)
verifier(!malFr.length, `français 0 → 999 999 : tous bien formés${malFr.length ? ` (${malFr.slice(0, 3)})` : ''}`)
verifier(!malBr.length, `breton 0 → 9 999 : tous bien formés${malBr.length ? ` (${malBr.slice(0, 3)})` : ''}`)
let espaces = 0
for (let n = 0; n <= 999999; n++) if (enLettresFr(n).includes(' ')) espaces++
verifier(espaces === 0, 'français rectifié : aucune espace dans aucun nombre')
// deux nombres différents ne s'écrivent jamais pareil
const vus = new Map(); let doublons = 0
for (let n = 0; n <= 9999; n++) { const s = enLettresBr(n); if (vus.has(s)) doublons++; vus.set(s, n) }
verifier(doublons === 0, 'breton : deux nombres différents ne s’écrivent jamais pareil')

console.log('Par la langue régionale')
const d = donneesRegionales('br')
verifier(d.enLettres(94) === enLettresBr(94) && d.enLettres(2000) === 'daou vil', 'enLettres des données régionales = nombres bretons')

process.exit(nbEchecs() ? 1 : 0)
