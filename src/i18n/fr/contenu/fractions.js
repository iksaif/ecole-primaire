// Textes générés de l'exercice « Les fractions » (FractionsView) — français.
// Clés partagées avec src/i18n/br/contenu/fractions.js (vérifier avec `npm run i18n`).
const CHIFFRES = ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf']
const NOMS_PARTS = {
  2: ['demi', 'demis'], 3: ['tiers', 'tiers'], 4: ['quart', 'quarts'], 5: ['cinquième', 'cinquièmes'],
  6: ['sixième', 'sixièmes'], 7: ['septième', 'septièmes'], 8: ['huitième', 'huitièmes'],
  9: ['neuvième', 'neuvièmes'], 10: ['dixième', 'dixièmes'],
}

export default {
  // fraction n/d en lettres : « un demi », « trois quarts »
  enLettres: ({ n, d }) => `${CHIFFRES[n]} ${NOMS_PARTS[d][n >= 2 ? 1 : 0]}`,
  // ordinal en chiffres : « 1re », « 2e » (la 3e graduation)
  ordinal: ({ n }) => `${n}${n > 1 ? 'e' : 're'}`,
  // « La moitié de 8, combien ? » : nom de la part selon le dénominateur
  partDe_2: 'La moitié', partDe_3: 'Le tiers', partDe_4: 'Le quart', partDe_5: 'Le cinquième', partDe_10: 'Le dixième',
  // nombre de parts dans la consigne « partage en {parts} parts égales »
  nbParts: ({ d }) => (d === 10 ? 'dix' : CHIFFRES[d] ?? String(d)),
}
