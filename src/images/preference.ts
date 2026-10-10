// La préférence « Images » de l'utilisateur, comme la police : la famille des emojis (OpenMoji, ou ceux du système de l'appareil)
// et leur style (couleur, ou contour noir à colorier). Pur : lu par node (build, tests) comme par le navigateur.
// Mémorisée par useImagesFiche (clé `images`) ; les PDF publiés sont toujours en DEFAUT_IMAGES.

/** `openmoji` : les dessins livrés avec le site (même rendu partout) ; `systeme` : les emojis de l'appareil (rendu variable). */
export type FamilleImages = 'openmoji' | 'systeme'
/** `couleur` ; `contour` : trait noir sur fond blanc (OpenMoji seulement : un emoji du système reste en couleur). */
export type StyleImages = 'couleur' | 'contour'

// un type (pas une interface) : chargerReglages le lit comme un objet de réglages
export type ImagesFiche = {
  famille: FamilleImages
  style: StyleImages
}

export const FAMILLES_IMAGES: readonly FamilleImages[] = ['openmoji', 'systeme']
export const STYLES_IMAGES: readonly StyleImages[] = ['couleur', 'contour']

export const DEFAUT_IMAGES: ImagesFiche = { famille: 'openmoji', style: 'couleur' }

/** Une préférence lue avec méfiance (stockage, adresse) : chaque champ inconnu reprend sa valeur par défaut. */
export function assainirImages(valeur: unknown): ImagesFiche {
  const lue = (typeof valeur === 'object' && valeur !== null ? valeur : {}) as Partial<Record<keyof ImagesFiche, unknown>>
  const famille = FAMILLES_IMAGES.find(f => f === lue.famille) ?? DEFAUT_IMAGES.famille
  const style = STYLES_IMAGES.find(s => s === lue.style) ?? DEFAUT_IMAGES.style
  return { famille, style }
}
