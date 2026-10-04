// Pluriels selon les règles de chaque langue (Intl.PluralRules, intégré au navigateur et à node) :
// un message peut être { one: '…', other: '…' } (français) ou { one, two, few, many, other } (breton :
// 1, 2, 3-4-9, 1 000 000, autres), choisi d'après params.n. Sans dépendance (lu aussi par node).
const regles = {}

export function choisirPluriel(v, params, langue) {
  if (!v || typeof v !== 'object' || Array.isArray(v) || !('other' in v) || typeof params?.n !== 'number') return v
  regles[langue] ??= new Intl.PluralRules(langue)
  return v[regles[langue].select(params.n)] ?? v.other
}
