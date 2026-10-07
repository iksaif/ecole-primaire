// Les fractions — textes de CONTENU : ce que les énoncés, la fiche et son corrigé écrivent. Lus par T (générateur, fiche) ; la vue
// passe par `traducteur(CONTENU, …)`. Les textes de l'INTERFACE (réglages, retours du jeu) sont dans
// src/langues/<langue>/textes/fractions.ts.
//
// Les listes sont des chaînes séparées par « | » (T ne lit que des textes ; le générateur les découpe) :
//   lettres.d<d>  la fraction n/d écrite en lettres, pour n = 1 → 9 (« un demi|deux demis|… » ; en breton les mutations sont déjà
//                 appliquées : « daou drede », « tri c'hard »)
//   ordinaux      0 → 12 (« 1re », « 2e » ; « 1añ », « 2vet »)
//   nbParts       0 → 10, le nombre écrit dans « partage en {parts} parts égales » (en breton : en chiffres)
// Paramètres des p* (fiche) : f = fraction déjà écrite en HTML.
import { catalogue } from '../../langues/catalogue.ts'
import { reglesBr } from '../../langues/br/regles.ts'

// ── Français : « un demi », « trois quarts » ──
const CHIFFRES_FR = ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf']
const PARTS_FR: Readonly<Record<number, readonly [string, string]>> = {
  2: ['demi', 'demis'], 3: ['tiers', 'tiers'], 4: ['quart', 'quarts'], 5: ['cinquième', 'cinquièmes'],
  6: ['sixième', 'sixièmes'], 7: ['septième', 'septièmes'], 8: ['huitième', 'huitièmes'],
  9: ['neuvième', 'neuvièmes'], 10: ['dixième', 'dixièmes'],
}
const lettresFr = (n: number, d: number): string => `${CHIFFRES_FR[n]} ${PARTS_FR[d][n >= 2 ? 1 : 0]}`
// n = 1 → 9 pour un dénominateur
const listeFr = (d: number): string => Array.from({ length: 9 }, (_, i) => lettresFr(i + 1, d)).join('|')

// ── Breton : un hanter, un trede, ur c'hard… ; daou drede, tri c'hard, daou bempvet… ──
// (article indéfini : un devant voyelle, h, n, d, t ; ul devant l ; ur ailleurs, k → c'h après ur ; mutation adoucissante
// après « daou », spirante après « tri, pevar, nav »)
const CHIFFRES_BR = ['zero', 'un', 'daou', 'tri', 'pevar', 'pemp', "c'hwec'h", 'seizh', 'eizh', 'nav']
const PARTS_BR: Readonly<Record<number, string>> = {
  2: 'hanter', 3: 'trede', 4: 'kard', 5: 'pempvet', 6: "c'hwec'hvet", 7: 'seizhvet', 8: 'eizhvet', 9: 'navvet', 10: 'dekvet',
}
function lettresBr(n: number, d: number): string {
  const nom = PARTS_BR[d]
  if (n === 1) {
    if (/^[aeiouhndt]/.test(nom)) return `un ${nom}`
    if (nom.startsWith('l')) return `ul ${nom}`
    return `ur ${nom.startsWith('k') ? reglesBr.spirer?.(nom) ?? nom : nom}`
  }
  if (n === 2) return `daou ${reglesBr.adoucir?.(nom) ?? nom}`
  if (n === 3 || n === 4 || n === 9) return `${CHIFFRES_BR[n]} ${reglesBr.spirer?.(nom) ?? nom}`
  return `${CHIFFRES_BR[n]} ${nom}`
}
const listeBr = (d: number): string => Array.from({ length: 9 }, (_, i) => lettresBr(i + 1, d)).join('|')

export const CONTENU = catalogue({
  titre: 'Les fractions',
  // la fraction n/d en lettres, n = 1 → 9, pour chaque dénominateur
  lettres: { d2: listeFr(2), d3: listeFr(3), d4: listeFr(4), d5: listeFr(5), d6: listeFr(6), d7: listeFr(7), d8: listeFr(8), d9: listeFr(9), d10: listeFr(10) },
  // ordinal en chiffres : « 1re », « 2e » (la 3e graduation)
  ordinaux: '0e|1re|2e|3e|4e|5e|6e|7e|8e|9e|10e|11e|12e',
  // « La moitié de 8, combien ? » : nom de la part selon le dénominateur
  partDe: { d2: 'La moitié', d3: 'Le tiers', d4: 'Le quart', d5: 'Le cinquième', d10: 'Le dixième' },
  // nombre de parts dans la consigne « partage en {parts} parts égales »
  nbParts: 'zéro|un|deux|trois|quatre|cinq|six|sept|huit|neuf|dix',
  disque: 'Disque', barre: 'Barre', rectangle: 'Rectangle',
  partsColoriees: { one: '{n} part coloriée sur {d}', other: '{n} parts coloriées sur {d}' },
  partsSur: { one: '{n} part sur {d}', other: '{n} parts sur {d}' },
  graduationApres0: '{o} graduation après 0',
  // consignes (jeu) et libellés (tableau de correction)
  cIdentifier: 'Quelle fraction de la figure est coloriée ?',
  cColorie: 'Colorie',
  cColorieFin: ' de la figure ({l}).',
  libColorier: 'Colorier {f}',
  cSeLit: 'Comment se lit cette fraction ?',
  libEnLettres: '{f} en lettres',
  cEcrite: 'Quelle fraction est écrite ?',
  partDeTexte: "{nom} de {total}, c'est ?",
  partDeConsigne: "{nom}, c'est une des {parts} parts égales.",
  partDeLibelle: '{nom} de {total}',
  cEgalesNombre: 'Complète pour que les fractions soient égales.',
  cEgalesChoix: 'Quelle fraction est égale à',
  libEgale: 'Égale à {f}',
  cDroite: "Quelle fraction montre la flèche ? (l'unité est partagée en {d} parts égales)",
  libDroite: 'Droite de 0 à {u}, flèche',
  cPlacer: 'Place la fraction',
  cPlacerFin: ' sur la droite : touche la bonne graduation.',
  libPlacer: 'Placer {f} (droite de 0 à {u})',
  // fiche imprimable
  pIdentifier: 'Quelle fraction est coloriée ?',
  pColorie: 'Colorie {f} de la figure.',
  pEnLettres: "{f} s'écrit en lettres :",
  pEnChiffres: "{f} s'écrit en chiffres :",
  pPartDe: "{l}, c'est",
  pComplete: 'Complète :',
  pEntoure: 'Entoure la fraction égale à {f} :',
  pDroite: 'Quelle fraction montre la flèche ?',
  pReponse: 'Réponse :',
  pPlacer: 'Dessine une flèche pour placer {f} sur la droite.',
  pNbQuestions: '{n} questions',
}, {
  br: {
    titre: 'An darnaouennoù',
    lettres: { d2: listeBr(2), d3: listeBr(3), d4: listeBr(4), d5: listeBr(5), d6: listeBr(6), d7: listeBr(7), d8: listeBr(8), d9: listeBr(9), d10: listeBr(10) }, // br: à relire
    ordinaux: '0vet|1añ|2vet|3de|4re|5vet|6vet|7vet|8vet|9vet|10vet|11vet|12vet', // br: à relire
    partDe: { d2: 'An hanter', d3: 'An trede', d4: "Ar c'hard", d5: 'Ar pempvet', d10: 'An dekvet' },
    // en breton la consigne garde le nombre en chiffres
    nbParts: '0|1|2|3|4|5|6|7|8|9|10',
    disque: "Kelc'h", barre: 'Barrenn', rectangle: 'Hirgarrez',
    partsColoriees: { other: '{n} lodenn livet war {d}' },
    partsSur: { other: '{n} lodenn war {d}' },
    graduationApres0: '{o} derez goude 0',
    cIdentifier: 'Peseurt darnaouenn eus ar skeudenn a zo livet ?',
    cColorie: 'Liv',
    cColorieFin: ' eus ar skeudenn ({l}).',
    libColorier: 'Livañ {f}',
    cSeLit: 'Penaos e lenner an darnaouenn-mañ ?',
    libEnLettres: '{f} e lizherennoù',
    cEcrite: 'Peseurt darnaouenn a zo skrivet ?',
    partDeTexte: '{nom} eus {total}, pegement eo ?',
    partDeConsigne: '{nom} : unan eus {parts} lodenn gevatal.', // br: à relire
    partDeLibelle: '{nom} eus {total}',
    cEgalesNombre: 'Kloka evit ma vo kevatal an darnaouennoù.', // br: à relire
    cEgalesChoix: 'Peseurt darnaouenn a zo kevatal da',
    libEgale: 'Kevatal da {f}',
    cDroite: 'Peseurt darnaouenn a ziskouez ar bir ? (rannet eo an unanenn e {d} lodenn gevatal)',
    libDroite: 'Linenn eus 0 betek {u}, bir',
    cPlacer: 'Laka an darnaouenn',
    cPlacerFin: ' war al linenn : stok an derez mat.', // br: à relire (« derez » = graduation)
    libPlacer: 'Lakaat {f} (linenn eus 0 betek {u})',
    pIdentifier: 'Peseurt darnaouenn a zo livet ?',
    pColorie: 'Liv {f} eus ar skeudenn.',
    pEnLettres: '{f} e lizherennoù :',
    pEnChiffres: '{f} e sifroù :',
    pPartDe: '{l} =',
    pComplete: 'Kloka :',
    pEntoure: "Kelc'hia an darnaouenn kevatal da {f} :", // br: à relire
    pDroite: 'Peseurt darnaouenn a ziskouez ar bir ?',
    pReponse: 'Respont :',
    pPlacer: 'Tresa ur bir evit lakaat {f} war al linenn.',
    pNbQuestions: '{n} goulenn',
  },
})
