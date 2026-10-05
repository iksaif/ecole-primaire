// Réponses écrites (src/utils/reponses.js) : test unitaire node, sans Chrome.
//   node tests/reponses.test.mjs
import { comparerReponse, normaliserSaisie, sansAccents, estVide, verdictSaisie } from '../src/utils/reponses.js'
import { verifier, nbEchecs } from './outils.mjs'

console.log('Normalisation')
const NORMES = [
  ['  Je   Suis ', 'je suis'],
  ['J’étais', "j'étais"], ['j‘irai', "j'irai"], ['jʼai', "j'ai"], ['j´ai', "j'ai"], ['j`ai', "j'ai"],
  ["j' ai", "j'ai"], ["j ' irai", "j'irai"],
  ['vous êtes', 'vous êtes'], ['ils sont', 'ils sont'], ['\tnous\nsommes ', 'nous sommes'],
  ['peut‑être', 'peut-être'], ['ÉTÉ', 'été'], ['ÊTES', 'êtes'],
  ['été', 'été'],          // accents combinants (NFD) → NFC
  [null, ''], [undefined, ''], [42, '42'],
]
for (const [entree, attendu] of NORMES) {
  const obtenu = normaliserSaisie(entree)
  verifier(obtenu === attendu, `normaliserSaisie(${JSON.stringify(entree)}) → ${JSON.stringify(attendu)}${obtenu !== attendu ? ` (obtenu : ${JSON.stringify(obtenu)})` : ''}`)
}
verifier(sansAccents('fûmes, êtes, été, ça, cœur, Lætitia') === 'fumes, etes, ete, ca, coeur, Laetitia', 'sansAccents : accents, cédille, ligatures')
verifier(estVide('   ') && estVide(' ') && estVide(null) && !estVide(' a '), 'estVide')

console.log('Verdicts')
const CAS = [
  // [saisie, attendus, verdict]
  ['étais', 'étais', 'juste'], ['ÉTAIS', 'étais', 'juste'], ['  étais ', 'étais', 'juste'],
  ['J’étais', "j'étais", 'juste'], ["j' étais", "j'étais", 'juste'],
  ['etais', 'étais', 'accents'], ['ETAIS', 'étais', 'accents'], ['fumes', 'fûmes', 'accents'], ['fûmés', 'fûmes', 'accents'],
  ['coeur', 'cœur', 'accents'], ['ca', 'ça', 'accents'],
  ['chante', 'chanté', 'accents'],     // verdictSaisie : faux par défaut, avec la nuance « accents »
  ['jetais', "j'étais", 'faux'], ['étai', 'étais', 'faux'], ['étaient', 'étais', 'faux'], ['', 'étais', 'faux'], ['   ', 'étais', 'faux'],
  ['allées', ['allé(e)s', 'allés', 'allées'], 'juste'], ['alles', ['allé(e)s', 'allés', 'allées'], 'accents'],
  ['allé(e)s', ['allé(e)s', 'allés', 'allées'], 'juste'], ['allée', ['allé(e)s', 'allés', 'allées'], 'faux'],
  ['vous   êtes', 'vous êtes', 'juste'], ['vous etes', 'vous êtes', 'accents'], ['vousêtes', 'vous êtes', 'faux'],
]
for (const [saisie, attendus, verdict] of CAS) {
  const obtenu = comparerReponse(saisie, attendus)
  verifier(obtenu === verdict, `« ${saisie} » / ${JSON.stringify(attendus)} → ${verdict}${obtenu !== verdict ? ` (obtenu : ${obtenu})` : ''}`)
}

console.log('verdictSaisie (pour verifier)')
const egal = (a, b) => JSON.stringify(a) === JSON.stringify(b)
const VERDICTS = [
  [['étais', 'étais'], { ok: true, nuance: null }],
  [['etais', 'étais'], { ok: false, nuance: 'accents' }],                      // accents oubliés : faux par défaut
  [['etais', 'étais', { accents: 'accepter' }], { ok: true, nuance: 'accents' }],
  [['étai', 'étais', { accents: 'accepter' }], { ok: false, nuance: null }],
  [['', 'étais'], { ok: false, nuance: null }],
]
for (const [args, attendu] of VERDICTS) {
  const obtenu = verdictSaisie(...args)
  verifier(egal(obtenu, attendu), `verdictSaisie(${args.map(a => JSON.stringify(a)).join(', ')}) → ${JSON.stringify(attendu)}${egal(obtenu, attendu) ? '' : ` (obtenu : ${JSON.stringify(obtenu)})`}`)
}

// code de sortie lu par tests/lancer.mjs
process.exit(nbEchecs() ? 1 : 0)
