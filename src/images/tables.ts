// Les emojis OpenMoji que le site affiche, par nom : une faute de frappe ne compile pas, et le script `scripts/generer/images.ts` n'importe
// que ces fichiers-là (code = nom du fichier de la version d'OpenMoji, en majuscules, sans le sélecteur FE0F). Un emoji se rend avec
// `emojiSvg` (dans un SVG) ou `emojiHtml` (dans un texte HTML) de `src/images/openmoji.ts`. Un emoji de plus : l'écrire ici, puis
// `node scripts/generer/images.ts`. Il garde un seul sens : jamais un même nom pour deux choses différentes à l'écran.
export const EMOJIS = {
  // objets à compter, à nommer
  pomme: '1F34E', etoile: '2B50', fleur: '1F338', coccinelle: '1F41E', chat: '1F431', arbre: '1F333',
  // couleurs (un objet de la couleur)
  baleine: '1F433', citron: '1F34B', grenouille: '1F438', carotte: '1F955', raisin: '1F347', cochon: '1F437', chataigne: '1F330',
  chatNoir: '1F408-200D-2B1B', bonhommeDeNeige: '2603', elephant: '1F418',
  // la journée
  coq: '1F413', soleil: '2600', couchant: '1F307', lune: '1F319', jouet: '1F9F8',
  croissant: '1F950', repas: '1F37D', gouter: '1F36A', pates: '1F35D', lit: '1F6CF', brosseADents: '1FAA5', ecole: '1F3EB',
  // le corps et les cinq sens
  visage: '1F642', deuxYeux: '1F440', oeil: '1F441', oreille: '1F442', nez: '1F443', bouche: '1F444', langue: '1F445', sourire: '1F601',
  mainOuverte: '1F590', main: '270B', bras: '1F4AA', jambe: '1F9B5', pied: '1F9B6',
  // l'hygiène
  goutte: '1F4A7', savon: '1F9FC', bulles: '1FAE7', eclaboussures: '1F4A6', papier: '1F9FB', coureur: '1F3C3', salade: '1F957', eternuement: '1F927',
  // les cycles de vie, l'eau
  oeuf: '1F95A', poussinQuiEclot: '1F423', poussin: '1F425', poule: '1F414', graine: '1FAD8', pousse: '1F331', plantePot: '1FAB4', tournesol: '1F33B',
  glacon: '1F9CA',
  // les objets des solides
  de: '1F3B2', boite: '1F4E6', ballon: '26BD', conserve: '1F96B', glace: '1F366',
} as const

/** Les emojis qui sont une scène en carré plein (la ville au coucher du soleil) : rendus aux coins arrondis, pas comme un objet détouré. */
export const SCENES: readonly NomEmoji[] = ['couchant']

/** Le nom d'un emoji de la table. */
export type NomEmoji = keyof typeof EMOJIS
