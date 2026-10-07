// Phrases de dictée générées par Mistral (api.mistral.ai) : SEULE requête vers un autre site permise (AGENTS.md, décision du 2026-10-06),
// facultative, et seulement avec la clé que l'utilisateur a saisie lui-même. Sans clé : aucune requête, la phrase du corpus (phraseDe).
// Non pur (réseau, stockage) : appelé par la vue, jamais par le générateur ni par le build des fiches.
import { phraseDe } from './generateur.ts'

/** Clé de stockage de la clé Mistral (même clé que l'ancien site : une clé déjà saisie est gardée). */
export const CLE_STOCKAGE = 'ep_mistral_key'

/** La clé saisie par l'utilisateur, ou '' (aucune). */
export function cleMistral(): string {
  try { return localStorage.getItem(CLE_STOCKAGE) ?? '' } catch { return '' }
}

/** Enregistre la clé (vide : l'efface). */
export function enregistrerCleMistral(cle: string): void {
  try {
    if (cle.trim()) localStorage.setItem(CLE_STOCKAGE, cle.trim())
    else localStorage.removeItem(CLE_STOCKAGE)
  } catch { /* stockage refusé : la clé n'est pas gardée */ }
}

/** Une phrase courte contenant `mot` : générée par Mistral si une clé est saisie, sinon (ou en cas d'échec) celle du corpus. */
export async function phraseGeneree(mot: string): Promise<string> {
  const cle = cleMistral()
  if (!cle) return phraseDe(mot)
  try {
    const reponse = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${cle}` },
      body: JSON.stringify({
        model: 'mistral-small-latest',
        messages: [{
          role: 'user',
          content: `Tu es un assistant pédagogique pour enfants de CP (6-7 ans).\nGénère UNE SEULE phrase courte et simple en français (10 mots maximum) contenant l'expression "${mot}".\nRéponds UNIQUEMENT avec la phrase, sans guillemets ni explication.`,
        }],
        temperature: 0.7,
        max_tokens: 60,
      }),
    })
    if (!reponse.ok) return phraseDe(mot)
    const donnees = await reponse.json() as { choices?: { message?: { content?: string } }[] }
    return donnees.choices?.[0]?.message?.content?.trim() || phraseDe(mot)
  } catch {
    return phraseDe(mot)
  }
}
