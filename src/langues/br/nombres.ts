// Écriture des nombres en lettres en breton (0 à 9999). Vérifiée (Wiktionnaire, Meurgorf, Kervarker) : à ne pas modifier sans source.
// Système en partie vicésimal (base 20). Forme masculine (daou, tri, pevar).
// Les unités se placent avant les dizaines : 32 = daou ha tregont (« deux et trente »).

const UNITES_BR = ['zero', 'unan', 'daou', 'tri', 'pevar', 'pemp', "c'hwec'h", 'seizh', 'eizh', 'nav',
  'dek', 'unnek', 'daouzek', 'trizek', 'pevarzek', 'pemzek', "c'hwezek", 'seitek', "triwec'h", 'naontek']

// Dizaines « rondes »
const DIZAINES_BR: Record<number, string> = { 20: 'ugent', 30: 'tregont', 40: 'daou-ugent', 50: 'hanter-kant', 60: 'tri-ugent', 80: 'pevar-ugent' }

// « ha » devant consonne, « hag » devant voyelle ou h muet
function ha(mot: string): string {
  return /^[aeiouhy]/i.test(mot) ? 'hag' : 'ha'
}

function moinsDeCentBr(n: number): string {
  if (n < 20) return UNITES_BR[n]
  if (DIZAINES_BR[n]) return DIZAINES_BR[n]
  if (n < 30) return `${UNITES_BR[n - 20]} warn-ugent`
  // 70-79 et 90-99 : dek…naontek + tri-ugent / pevar-ugent
  const base = n < 40 ? 30 : n < 50 ? 40 : n < 60 ? 50 : n < 80 ? 60 : 80
  const dizaine = DIZAINES_BR[base]
  const u = UNITES_BR[n - base]
  return `${u} ${ha(dizaine)} ${dizaine}`
}

// Mutations après daou / tri / pevar / nav : kant → c'hant, mil → vil (daou vil)
const CENTAINES_BR = ['', 'kant', "daou c'hant", "tri c'hant", "pevar c'hant", 'pemp kant',
  "c'hwec'h kant", 'seizh kant', 'eizh kant', "nav c'hant"]

function moinsDeMilleBr(n: number): string {
  const c = Math.floor(n / 100), r = n % 100
  if (c === 0) return moinsDeCentBr(r)
  if (r === 0) return CENTAINES_BR[c]
  // forme moderne courante : 101 = kant unan, 125 = kant pemp warn-ugent
  return `${CENTAINES_BR[c]} ${moinsDeCentBr(r)}`
}

const MILLIERS_BR = ['', 'mil', 'daou vil', 'tri mil', 'pevar mil', 'pemp mil',
  "c'hwec'h mil", 'seizh mil', 'eizh mil', 'nav mil']

export function enLettresBr(n: number): string {
  n = Math.floor(Math.abs(n))
  if (n < 1000) return moinsDeMilleBr(n)
  if (n > 9999) return String(n)
  const m = Math.floor(n / 1000), r = n % 1000
  if (r === 0) return MILLIERS_BR[m]
  return `${MILLIERS_BR[m]} ${moinsDeMilleBr(r)}`
}

