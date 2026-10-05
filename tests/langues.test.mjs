// Langues (node, sans Chrome) : registre, parité des catalogues fr/br, textes typés, règles de langue, nombres en lettres,
// pluriels, données de la langue régionale. Le compilateur (`npm run types`) refuse déjà une clé manquante ou en trop ;
// ce test échoue aussi si un catalogue diverge à l'exécution (cas d'un `any` ou d'un contournement).
import { LANGUES, CODES, REGIONALES, estLangue, estRegionale, regles, nomDeLangue, donneesRegionales, LANGUE_SOURCE } from '../src/langues/registre.ts'
import { traduire, traduireListe, contenu } from '../src/langues/traduire.ts'
import { enLettresFr } from '../src/langues/fr/nombres.ts'
import { enLettresBr } from '../src/langues/br/nombres.ts'
import { verifier, nbEchecs } from './outils.mjs'

console.log('Registre des langues')
verifier(CODES.join() === 'fr,br' && LANGUE_SOURCE === 'fr', 'langues du registre : fr, br (source : fr)')
verifier(CODES.every(c => LANGUES[c].code === c), 'le code de chaque langue est sa clé')
verifier(CODES.every(c => CODES.every(d => typeof LANGUES[c].nom[d] === 'string' && LANGUES[c].nom[d])), 'chaque langue a un nom dans chaque langue d’interface')
verifier(CODES.every(c => LANGUES[c].bcp47 && LANGUES[c].nomLocal && LANGUES[c].drapeau.startsWith('<svg')), 'bcp47, nomLocal et drapeau SVG présents')
verifier(nomDeLangue('br', 'fr') === 'breton' && nomDeLangue('br', 'br') === 'brezhoneg', 'nom du breton en français et en breton')
verifier(estLangue('br') && !estLangue('xx') && !estLangue(undefined) && !estLangue('toString'), 'estLangue')
verifier(REGIONALES.join() === 'br' && estRegionale('br') && !estRegionale('fr'), 'langue régionale : le breton seul (a des données)')
verifier(donneesRegionales('fr') === undefined && donneesRegionales('br')?.alphabet.length === 25, 'données : absentes pour fr, alphabet breton de 25 lettres')
verifier(LANGUES.fr.voix.disponible && !LANGUES.br.voix.disponible, 'voix : le français oui, le breton non')
verifier(LANGUES.fr.traductionRelue && !LANGUES.br.traductionRelue, 'traduction : français relu, breton à relire')
verifier(CODES.every(c => LANGUES[c].programme === null), 'emplacement du programme de langue : vide')

console.log('Parité des catalogues')
// chemins des feuilles : texte, liste ou pluriel (objet avec `other`)
function feuilles(o, prefixe = '') {
  return Object.entries(o).flatMap(([k, v]) => {
    const chemin = prefixe + k
    return typeof v === 'string' || Array.isArray(v) || (v && typeof v === 'object' && 'other' in v) ? [[chemin, v]] : feuilles(v, `${chemin}.`)
  })
}
const FR = new Map(feuilles(LANGUES.fr.textes))
verifier(FR.size > 50, `${FR.size} textes dans le catalogue français`)
const params = t => [...(typeof t === 'string' ? t : t.other ?? '').matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort().join()
for (const c of CODES.filter(c => c !== LANGUE_SOURCE)) {
  const L = new Map(feuilles(LANGUES[c].textes))
  const manquantes = [...FR.keys()].filter(k => !L.has(k)), enTrop = [...L.keys()].filter(k => !FR.has(k))
  verifier(!manquantes.length && !enTrop.length, `${c} : mêmes clés que le français${manquantes.length ? ` — manquantes : ${manquantes}` : ''}${enTrop.length ? ` — en trop : ${enTrop}` : ''}`)
  const formes = [...FR].filter(([k, v]) => L.has(k) && (typeof v === 'string') !== (typeof L.get(k) === 'string') && !Array.isArray(v))
  verifier(!formes.length, `${c} : un texte reste un texte, un pluriel un pluriel${formes.length ? ` — ${formes.map(f => f[0])}` : ''}`)
  const autres = [...FR].filter(([k, v]) => L.has(k) && !Array.isArray(v) && !(v && typeof v === 'object' && !('other' in v)) && params(v) !== params(L.get(k)))
  verifier(!autres.length, `${c} : mêmes paramètres {…} que le français${autres.length ? ` — ${autres.map(f => f[0])}` : ''}`)
  verifier([...L.values()].every(v => typeof v !== 'string' || v.trim()), `${c} : aucun texte vide`)
}

console.log('t() typé')
verifier(traduire('fr', 'nav.accueil') === 'Accueil' && traduire('br', 'nav.langueRegionale') === 'Yezh rannvroel', 'texte simple fr / br')
verifier(traduire('fr', 'reglages.remise.fait', { n: 1 }) === '✅ 1 réglage supprimé.' && traduire('fr', 'reglages.remise.fait', { n: 4 }) === '✅ 4 réglages supprimés.', 'pluriel français (1 / 4)')
verifier(traduire('br', 'langueRegionale.alphabetAide', { n: 25, plus: 'ñ' }).includes('25'), 'paramètres interpolés')
verifier(traduireListe('fr', 'apropos.commentListe').length === 3, 'liste de textes')
verifier(contenu('br').t('nav.accueil') === 'Degemer' && contenu('br').langue === 'br', 'contenu(langue) : texte dans la langue du contenu')
// pluriel breton : Intl.PluralRules('br') donne one / two / few / many / other
const rb = new Intl.PluralRules('br')
verifier([1, 2, 3, 1000000, 5].map(n => rb.select(n)).join() === 'one,two,few,many,other', 'breton : formes de pluriel one, two, few, many, other')

console.log('Marquage « à relire »')
import { readFileSync, readdirSync } from 'node:fs'
const marques = readdirSync(new URL('../src/langues/br/textes/', import.meta.url)).map(f => readFileSync(new URL(`../src/langues/br/textes/${f}`, import.meta.url), 'utf8')).join('\n').match(/br: à relire/g) ?? []
verifier(marques.length > 20, `${marques.length} textes bretons marqués « br: à relire » (comptés par npm run i18n)`)

console.log('Règles de langue')
const F = regles('fr'), B = regles('br')
const exemples = [
  [F.nombre(1, 'bille'), '1 bille'], [F.nombre(3, 'bille'), '3 billes'], [F.nombre(2, { s: 'cheval', p: 'chevaux' }), '2 chevaux'],
  [F.que('Emma'), "qu'Emma"], [F.que('Léo'), 'que Léo'], [F.de('euros'), "d'euros"], [F.le('école', 'f'), "l'école"], [F.le('table', 'f'), 'la table'],
  [B.nombre(3, 'bilhenn'), '3 bilhenn'], [B.et('aval'), 'hag'], [B.et('bara'), 'ha'],
  [B.le('ki'), "ar c'hi"], [B.le('kador', 'f'), 'ar gador'], [B.le('taol', 'f'), 'an daol'], [B.le('mamm', 'f'), 'ar vamm'],
  [B.le('aval'), 'an aval'], [B.le('loar', 'f'), 'al loar'], [B.le('bara'), 'ar bara'], [B.adoucir('kazh'), 'gazh'], [B.spirer('tad'), 'zad'],
]
for (const [obtenu, attendu] of exemples) verifier(obtenu === attendu, `${attendu}${obtenu !== attendu ? ` (obtenu : ${obtenu})` : ''}`)
verifier(F.adoucir === undefined, 'le français n’a pas de mutations')

console.log('Nombres en lettres')
const FRN = { 0: 'zéro', 21: 'vingt-et-un', 71: 'soixante-et-onze', 80: 'quatre-vingts', 81: 'quatre-vingt-un', 91: 'quatre-vingt-onze',
  200: 'deux-cents', 201: 'deux-cent-un', 280: 'deux-cent-quatre-vingts', 1000: 'mille', 80000: 'quatre-vingt-mille' }
for (const [n, attendu] of Object.entries(FRN)) verifier(enLettresFr(+n) === attendu, `${n} → ${attendu}`)
verifier(enLettresFr(71, { rectifiee: false }) === 'soixante et onze', '71 (traditionnelle) → soixante et onze')
// Breton : vérifiés dans le Wiktionnaire et le Meurgorf
const BRN = { 21: 'unan warn-ugent', 31: 'unan ha tregont', 42: 'daou ha daou-ugent', 51: 'unan hag hanter-kant', 70: 'dek ha tri-ugent',
  75: 'pemzek ha tri-ugent', 80: 'pevar-ugent', 99: 'naontek ha pevar-ugent', 101: 'kant unan', 125: 'kant pemp warn-ugent',
  200: "daou c'hant", 2000: 'daou vil' }
for (const [n, attendu] of Object.entries(BRN)) verifier(enLettresBr(+n) === attendu, `${n} → ${attendu}`)

console.log('Données de la langue régionale')
const d = donneesRegionales('br')
verifier(d.enLettres(94) === 'pevarzek ha pevar-ugent', 'enLettres de la langue = nombres bretons')
verifier(d.alphabet.every(l => d.mots[l]), 'un mot illustré par lettre de l’alphabet')
verifier(['jours', 'mois', 'nombres-10'].every(id => d.listes.some(l => l.id === id)), 'listes : jours, mois, nombres')
verifier(d.listes.find(l => l.id === 'jours').mots.length === 7 && d.listes.find(l => l.id === 'mois').mots.length === 12, '7 jours, 12 mois')
verifier(CODES.every(c => d.ecoles[c]) && d.listes.every(l => CODES.every(c => l.libelle[c])), 'libellés dans chaque langue d’interface')

process.exit(nbEchecs() ? 1 : 0)
