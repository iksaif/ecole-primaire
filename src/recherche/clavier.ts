// Le clavier de la palette de recherche : quelle frappe l'ouvre, comment se déplacer dans la liste. Pur : lisible par node.

/** Ce qu'il faut d'une frappe pour décider d'ouvrir la palette. */
export interface FrappeRecherche {
  readonly key: string
  readonly ctrlKey: boolean
  readonly metaKey: boolean
  readonly altKey: boolean
  readonly target: { readonly tagName?: string, readonly isContentEditable?: boolean } | null
}

/** La cible est un endroit où l'on tape du texte (champ, zone de texte, liste déroulante, contenu éditable). */
export function estZoneDeSaisie(cible: FrappeRecherche['target']): boolean {
  if (!cible) return false
  const balise = cible.tagName?.toUpperCase()
  return balise === 'INPUT' || balise === 'TEXTAREA' || balise === 'SELECT' || cible.isContentEditable === true
}

/** Ctrl+K et ⌘K ouvrent partout ; « / » seulement hors d'une zone de saisie (on peut avoir à écrire une barre oblique). */
export function ouvreLaRecherche(f: FrappeRecherche): boolean {
  if ((f.ctrlKey || f.metaKey) && !f.altKey) return f.key.toLowerCase() === 'k'
  return f.key === '/' && !f.altKey && !estZoneDeSaisie(f.target)
}

/** L'option suivante (+1) ou précédente (-1) parmi `n`, en bouclant ; 0 quand il n'y en a pas. */
export function deplacer(actif: number, n: number, pas: 1 | -1): number {
  return n > 0 ? (actif + pas + n) % n : 0
}
