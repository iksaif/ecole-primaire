// Textes générés par Mistral (api.mistral.ai) : SEULE requête vers un autre site permise (AGENTS.md, décision du 2026-10-06), facultative,
// et seulement avec la clé que l'utilisateur a saisie lui-même (<CleMistral>). Sans clé : aucune requête. Deux exercices s'en servent,
// chacun avec sa consigne et son repli : la Dictée (une phrase autour d'un mot) et la Lecture (une petite histoire).
// Non pur (réseau, stockage) : appelé par les vues, jamais par un générateur ni par le build des fiches.

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

/**
 * Le texte que Mistral écrit pour cette consigne, ou `null` : sans clé (aucune requête n'est faite), en cas d'échec ou de réponse vide.
 * L'appelant a toujours un texte de repli.
 */
export async function texteMistral(consigne: string, maxJetons: number): Promise<string | null> {
  const cle = cleMistral()
  if (!cle) return null
  try {
    const reponse = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${cle}` },
      body: JSON.stringify({
        model: 'mistral-small-latest',
        messages: [{ role: 'user', content: consigne }],
        temperature: 0.7,
        max_tokens: maxJetons,
      }),
    })
    if (!reponse.ok) return null
    const donnees = await reponse.json() as { choices?: { message?: { content?: string } }[] }
    return donnees.choices?.[0]?.message?.content?.trim() || null
  } catch {
    return null
  }
}
