// Choix d'une voix de synthèse vocale pour une langue : pur (aucun navigateur), lisible par node et testé.
// Le navigateur donne une liste de voix ({ name: 'Amélie (Premium)', lang: 'fr-FR', localService: true… }) ; on garde la
// meilleure pour l'étiquette BCP 47 de la langue (registre des langues : `voix.bcp47`), ou aucune : il n'y a par exemple
// pas de voix bretonne.
//
// La règle, critère après critère (le suivant ne départage que les égalités du précédent) :
//   1. Sur l'appareil avant en ligne. Une voix « en ligne » (`localService: false` : voix « Google » de Chrome, voix
//      « Online (Natural) » d'Edge) est souvent la plus naturelle, mais le NAVIGATEUR envoie alors le texte lu au service
//      de son éditeur (Google, Microsoft…). Ce n'est pas notre site qui l'envoie, mais la promesse du site est que rien ne
//      sort de l'appareil : on ne la choisit donc jamais d'office tant qu'une voix locale existe. L'adulte peut la choisir
//      lui-même dans les réglages (la page le prévient).
//   2. Pas de voix « fantaisie » : macOS propose en français des voix-gags ou très synthétiques (Grandma, Rocko, Bubbles…).
//   3. Même région que la langue (fr-FR avant fr-CA) : l'accent compte pour une dictée ou le nom des lettres.
//   4. Qualité annoncée dans le nom : « Premium », « Enhanced »/« Amélioré », « Natural », « Neural », « Siri » (voix
//      téléchargées de macOS et iOS, voix neuronales de Windows et d'Edge) ; ce sont les voix les moins robotiques.
//   5. La voix par défaut du système (choix de l'utilisateur de l'appareil), puis l'ordre donné par le navigateur.
// Aucune voix de la langue : `null` (le bouton « écouter » est alors masqué, la consigne reste écrite).

/** Ce que le choix lit d'une voix du navigateur (SpeechSynthesisVoice en a davantage). */
export interface VoixNavigateur {
  readonly lang: string
  readonly localService: boolean
  readonly name?: string
  readonly voiceURI?: string
  readonly default?: boolean
}

// « fr_FR » (Android) et « fr-fr » valent « fr-FR » ; seule la langue (avant le tiret) sert au repli
const normaliser = (lang: string): string => lang.replace('_', '-').toLowerCase()
const principale = (lang: string): string => normaliser(lang).split('-')[0]

// mots du nom qui annoncent une voix de meilleure qualité (macOS, iOS, Windows, Edge, Android)
const MARQUES_QUALITE = /premium|enhanced|amélioré|ameliore|natural|naturel|neural|siri/i

// voix-gags ou très synthétiques de macOS (premier mot du nom), proposées aussi en français
const VOIX_FANTAISIE = new Set([
  'albert', 'bad', 'bahh', 'bells', 'boing', 'bubbles', 'cellos', 'eddy', 'flo', 'good', 'grandma', 'grandpa', 'jester',
  'junior', 'kathy', 'organ', 'ralph', 'reed', 'rocko', 'sandy', 'shelley', 'superstar', 'trinoids', 'whisper', 'wobble',
  'zarvox',
])

/** Identifiant stable d'une voix (mémorisé dans les réglages) : `voiceURI`, sinon le nom. */
export function idVoix(v: VoixNavigateur): string {
  return v.voiceURI || v.name || ''
}

/** La voix annonce-t-elle une qualité supérieure dans son nom ? */
export function voixDeQualite(v: VoixNavigateur): boolean {
  return MARQUES_QUALITE.test(v.name ?? '')
}

/** Voix-gag de macOS (Grandma, Rocko…) ? */
export function voixFantaisie(v: VoixNavigateur): boolean {
  const premierMot = (v.name ?? '').trim().split(/[\s(]/)[0].toLowerCase()
  return VOIX_FANTAISIE.has(premierMot)
}

// Note d'une voix pour la langue : une liste de critères comparés dans l'ordre (plus grand = mieux), voir l'en-tête.
function note(v: VoixNavigateur, cible: string): number[] {
  return [
    v.localService ? 1 : 0,
    voixFantaisie(v) ? 0 : 1,
    normaliser(v.lang) === cible ? 1 : 0,
    voixDeQualite(v) ? 1 : 0,
    v.default ? 1 : 0,
  ]
}

// Comparaison de deux notes, critère après critère : négatif si `a` est meilleure
function comparerNotes(a: number[], b: number[]): number {
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return b[i] - a[i]
  }
  return 0
}

/** Les voix qui parlent la langue de `bcp47`, de la meilleure à la moins bonne (règle de l'en-tête). */
export function classerVoix<V extends VoixNavigateur>(voix: readonly V[], bcp47: string): V[] {
  const cible = normaliser(bcp47)
  const langue = principale(bcp47)
  const notees = voix
    .filter(v => principale(v.lang) === langue)
    .map((v, rang) => ({ v, rang, note: note(v, cible) }))
  // à note égale, l'ordre du navigateur (le tri est stable, le rang le rend explicite)
  notees.sort((a, b) => comparerNotes(a.note, b.note) || a.rang - b.rang)
  return notees.map(n => n.v)
}

/**
 * La voix à utiliser pour `bcp47` : celle que l'adulte a choisie (`preferee`, identifiant de `idVoix`) si elle existe
 * encore et parle la langue, sinon la meilleure selon la règle de l'en-tête ; `null` si aucune voix ne parle la langue.
 */
export function choisirVoix<V extends VoixNavigateur>(voix: readonly V[], bcp47: string, preferee?: string | null): V | null {
  const classees = classerVoix(voix, bcp47)
  const choisie = preferee ? classees.find(v => idVoix(v) === preferee) : undefined
  return choisie ?? classees[0] ?? null
}
