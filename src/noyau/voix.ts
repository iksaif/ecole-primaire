// Choix d'une voix de synthèse vocale pour une langue : pur (aucun navigateur), lisible par node et testé.
// Le navigateur donne une liste de voix ({ lang: 'fr-FR', localService: true… }) ; on garde la meilleure pour l'étiquette BCP 47
// de la langue (registre des langues : `voix.bcp47`), ou aucune : il n'y a par exemple pas de voix bretonne.

/** Ce que le choix lit d'une voix du navigateur (SpeechSynthesisVoice en a davantage). */
export interface VoixNavigateur { readonly lang: string, readonly localService: boolean }

// « fr_FR » (Android) et « fr-fr » valent « fr-FR » ; seule la langue (avant le tiret) sert au repli
const normaliser = (lang: string): string => lang.replace('_', '-').toLowerCase()
const principale = (lang: string): string => normaliser(lang).split('-')[0]

/**
 * La meilleure voix pour `bcp47` : locale et de la même région > locale et de la même langue > réseau et de la même région
 * > réseau et de la même langue ; `null` si aucune voix ne parle cette langue (le bouton « écouter » est alors masqué, la
 * consigne reste écrite).
 */
export function choisirVoix<V extends VoixNavigateur>(voix: readonly V[], bcp47: string): V | null {
  const cible = normaliser(bcp47)
  const langue = principale(bcp47)
  const memeRegion = (v: V) => normaliser(v.lang) === cible
  const memeLangue = (v: V) => principale(v.lang) === langue
  return voix.find(v => memeRegion(v) && v.localService)
    ?? voix.find(v => memeLangue(v) && v.localService)
    ?? voix.find(memeRegion)
    ?? voix.find(memeLangue)
    ?? null
}
