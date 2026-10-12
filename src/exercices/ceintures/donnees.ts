// Les ceintures (activité de fiches) — les choix de l'activité : les supports imprimables et leurs bornes.
export const SUPPORTS = ['livret', 'bandes', 'diplome', 'passeport'] as const
export type Support = (typeof SUPPORTS)[number]

/** Combien de fois chaque ceinture est répétée sur la feuille des ceintures à découper. */
export const COPIES = [1, 2, 3, 4] as const
/** Le numéro de la ceinture du diplôme (1 pour la première). */
export const NUMEROS = [1, 2, 3, 4, 5, 6, 7, 8] as const

/** Des objectifs d'exemple pour la piste libre : à remplacer. */
export const OBJECTIFS_LIBRES = 'Je range mon cartable\nJe lève la main pour parler\nJe termine mon travail\nJ’aide un camarade'
