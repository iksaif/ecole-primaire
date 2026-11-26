// D'où vient une visite : une catégorie, jamais l'adresse. Sert aux statistiques anonymes (src/utils/journal.js) : savoir si l'on arrive par un
// moteur de recherche, un réseau, un site de l'éducation ou directement, sans garder le site précis (un portail d'école en dirait trop).
// Pur (lisible par node).

export type Origine = 'direct' | 'interne' | 'recherche' | 'reseau' | 'education' | 'autre'

// le nom du moteur, puis son suffixe (.com, .fr, .co.uk) et rien d'autre : « google.com.exemple.org » n'est pas Google
const MOTEURS = /(^|\.)(google|bing|duckduckgo|qwant|ecosia|yahoo|startpage|yandex|baidu|lilo|ask|search\.brave)\.[a-z]{2,3}(\.[a-z]{2})?$/
const RESEAUX = /(^|\.)(facebook|instagram|pinterest|youtube|twitter|x|t|linkedin|lnkd|reddit|whatsapp|telegram|tiktok|bsky|mastodon\.social)\.(com|co|in|ee|app|me|social)$/
const EDUCATION = /(^|\.)(education\.gouv\.fr|eduscol\.education\.fr|lumni\.fr|reseau-canope\.fr|ac-[a-z-]+\.fr|monecole\.fr|apps\.education\.fr)$/

/** Le nom d'hôte d'une adresse, sans « www. » ; `null` si ce n'est pas une adresse. */
function hoteDe(adresse: string): string | null {
  try {
    return new URL(adresse).hostname.toLowerCase().replace(/^www\./, '')
  } catch {
    return null
  }
}

/** La catégorie d'origine d'une visite : `referrer` est l'adresse de la page précédente (vide : arrivée directe), `hotesDuSite` les noms d'hôte du site (ses pages ne comptent pas). */
export function origineDe(referrer: string, hotesDuSite: readonly string[]): Origine {
  if (!referrer) return 'direct'
  const hote = hoteDe(referrer)
  if (hote === null) return 'direct'
  if (hotesDuSite.includes(hote)) return 'interne'
  if (MOTEURS.test(hote)) return 'recherche'
  if (RESEAUX.test(hote)) return 'reseau'
  if (EDUCATION.test(hote)) return 'education'
  return 'autre'
}
