// Le caractère emoji d'un code OpenMoji, pour la famille « emojis du système ». Les codes de tables.ts sont ceux des fichiers
// OpenMoji : points de code en hexadécimal séparés par `-`, sans le sélecteur de variante FE0F. Un emoji n'a pas de caractère
// quand il n'existe pas dans Unicode : dessin maison (`maison:…`) ou extra d'OpenMoji (zone d'usage privé, E000 à F8FF).

/** Le sélecteur de variante « présentation emoji » : sans lui, ☀ ou 🍽 s'affichent parfois en noir, comme du texte. */
const SELECTEUR_EMOJI = 0xfe0f
const USAGE_PRIVE = { debut: 0xe000, fin: 0xf8ff }

/** Un point de code emoji qui s'affiche en texte par défaut (propriété Unicode Emoji_Presentation absente) : il lui faut FE0F. */
function texteParDefaut(point: number): boolean {
  const caractere = String.fromCodePoint(point)
  return /\p{Emoji}/u.test(caractere) && !/\p{Emoji_Presentation}/u.test(caractere)
}

/** Le caractère emoji d'un code (`1F34E` → 🍎, `2600` → ☀️, `1F408-200D-2B1B` → 🐈‍⬛), ou null s'il n'y en a pas. */
export function caractereDe(code: string): string | null {
  if (code.startsWith('maison:')) return null
  const points = code.split('-').map(p => parseInt(p, 16))
  if (points.some(p => Number.isNaN(p))) return null
  if (points.some(p => p >= USAGE_PRIVE.debut && p <= USAGE_PRIVE.fin)) return null
  const avecSelecteur: number[] = []
  points.forEach((point, i) => {
    avecSelecteur.push(point)
    // un sélecteur après chaque élément « texte » (☀, ♂ dans 🏃‍♂️), sauf s'il est déjà là
    const suivant = points[i + 1]
    if (texteParDefaut(point) && suivant !== SELECTEUR_EMOJI) avecSelecteur.push(SELECTEUR_EMOJI)
  })
  return String.fromCodePoint(...avecSelecteur)
}
