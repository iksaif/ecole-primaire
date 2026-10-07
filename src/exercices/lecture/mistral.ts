// Textes de lecture générés par Mistral (src/noyau/mistral.ts : clé saisie par l'utilisateur, seule requête vers un autre site). Sans clé,
// ou en cas d'échec : le texte du corpus (`repli`). Non pur : appelé par la vue, jamais par le générateur.
import { texteMistral } from '../../noyau/mistral.ts'
import type { Classe } from '../../data/classes.ts'

// la consigne donnée à Mistral, par classe : une phrase au CP, une courte histoire ensuite
const CONSIGNES: Readonly<Partial<Record<Classe, string>>> = {
  cp: 'Génère une phrase simple, mignonne et positive en français, facile à lire pour un enfant de CP (6 ans) en apprentissage de la lecture. Maximum 8 mots. Réponds UNIQUEMENT avec la phrase, sans guillemets ni explication.',
  ce1: "Génère une très courte histoire simple, mignonne et positive en français (2 ou 3 phrases simples, maximum 25 mots), facile à lire pour un enfant de CE1 (7 ans). Réponds UNIQUEMENT avec l'histoire, sans guillemets ni explication.",
  ce2: "Génère une courte histoire simple, intéressante et positive en français (3 ou 4 phrases, maximum 40 mots), facile à lire pour un enfant de CE2 (8 ans). Réponds UNIQUEMENT avec l'histoire, sans guillemets ni explication.",
}

/** Un texte à lire pour cette classe : écrit par Mistral si une clé est saisie, sinon `repli` (le texte tiré du corpus). */
export async function texteGenere(niveau: Classe, repli: string): Promise<string> {
  const consigne = CONSIGNES[niveau]
  if (!consigne) return repli
  return (await texteMistral(consigne, 80)) ?? repli
}
