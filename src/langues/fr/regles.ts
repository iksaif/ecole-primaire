// Règles du français pour écrire du contenu généré (énoncés, consignes, documents) sans branche « si breton… ».
import type { Regles, NomPluriel } from '../types.ts'

const VOYELLE = /^[aeiouyàâäéèêëîïôöùûüœh]/i

function pluriel(n: number, nom: string | NomPluriel): string {
  if (typeof nom === 'string') return Math.abs(n) >= 2 ? `${nom}s` : nom
  return Math.abs(n) >= 2 ? (nom.p ?? `${nom.s}s`) : nom.s
}

export const reglesFr: Regles = {
  langue: 'fr',
  // « 1 bille », « 3 billes » ; nom = { s, p } ou chaîne (pluriel en -s)
  nombre: (n, nom) => `${n} ${pluriel(n, nom)}`,
  pluriel,
  et: () => 'et',
  ou: () => 'ou',
  // élision : « que Léo », « qu'Emma »
  que: mot => (VOYELLE.test(mot) ? `qu'${mot}` : `que ${mot}`),
  de: mot => (VOYELLE.test(mot) ? `d'${mot}` : `de ${mot}`),
  le: (mot, genre = 'm') => (VOYELLE.test(mot) ? `l'${mot}` : `${genre === 'f' ? 'la' : 'le'} ${mot}`),
}
