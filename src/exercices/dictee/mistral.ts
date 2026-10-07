// Phrases de dictée générées par Mistral (src/noyau/mistral.ts : clé saisie par l'utilisateur, seule requête vers un autre site).
// Sans clé, ou en cas d'échec : la phrase du corpus (phraseDe). Non pur : appelé par la vue, jamais par le générateur.
import { texteMistral } from '../../noyau/mistral.ts'
import { phraseDe } from './generateur.ts'

/** Une phrase courte contenant `mot` : générée par Mistral si une clé est saisie, sinon (ou en cas d'échec) celle du corpus. */
export async function phraseGeneree(mot: string): Promise<string> {
  const consigne = `Tu es un assistant pédagogique pour enfants de CP (6-7 ans).\nGénère UNE SEULE phrase courte et simple en français (10 mots maximum) contenant l'expression "${mot}".\nRéponds UNIQUEMENT avec la phrase, sans guillemets ni explication.`
  return (await texteMistral(consigne, 60)) ?? phraseDe(mot)
}
