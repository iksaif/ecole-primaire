// Le contrat de fragment des fiches : une fiche rend toujours un document complet (`documentFiche`), mais `fragmentDe(() => fiche(…))` en récupère les morceaux (son titre, son
// CSS propre, son corps) pour qu'une feuille en réunisse plusieurs (src/impression/assemblage.ts). Aucune fiche n'est modifiée : c'est `documentFiche` qui signale ses morceaux
// au collecteur quand il y en a un. Synchrone et pur : le collecteur n'existe que le temps de l'appel, et une fiche appelée hors de `fragmentDe` rend son document comme avant.

/** Les morceaux d'une fiche, avant qu'ils soient mis dans un document. */
export interface Fragment {
  /** titre de la fiche (texte brut) */
  titre: string
  /** HTML du titre affiché ; `null` : la fiche n'en a pas (elle a les siens) ; `undefined` : le titre */
  h1: string | null | undefined
  /** CSS propre à la fiche (sans le CSS de base du document) */
  css: string
  /** @font-face embarqués (polices choisies) */
  cssPolices: string
  /** HTML du corps, après le titre : en-tête, exercices, section.corrige */
  corps: string
}

let collecteur: Fragment[] | null = null

/** Appelé par `documentFiche` : il remet ses morceaux au collecteur s'il y en a un. Renvoie vrai quand ils ont été pris (le document n'est alors pas construit). */
export function signalerFragment(fragment: Fragment): boolean {
  if (!collecteur) return false
  collecteur.push(fragment)
  return true
}

/** Les morceaux de la fiche que `rendre` produit (un seul document attendu). Une fiche en plusieurs documents, ou qui n'appelle pas `documentFiche`, est refusée. */
export function fragmentDe(rendre: () => unknown): Fragment {
  if (collecteur) throw new Error('fragmentDe ne s’imbrique pas')
  collecteur = []
  try {
    rendre()
    if (collecteur.length !== 1) throw new Error(`une fiche doit rendre exactement un document (documentFiche) pour devenir un fragment : ${collecteur.length} reçus`)
    return collecteur[0]
  } finally {
    collecteur = null
  }
}
