// Hasard reproductible, commun à l'app, aux tests et au build : même graine → même suite de nombres, donc même
// fiche. Module pur (aucune dépendance), lisible par node.
//
//   const rng = creerRng(graine)        // ou creerRng(Math.random) : une source déjà prête
//   rng.entier(1, 12)  rng.choisir(['a', 'b'])  rng.melanger(liste)  rng.vrai(0.4)  rng()
//
// Les tirages reproduisent ceux des anciens utilitaires (aleatoire, melanger de src/utils, pioche des vues) :
// un générateur migré sur `rng` donne exactement les mêmes questions à partir du même flux de nombres.

/**
 * Générateur pseudo-aléatoire mulberry32 : renvoie une fonction qui donne un nombre dans [0, 1[.
 * C'est aussi l'algorithme que le build et les tests installent à la place de Math.random (`?graine=`).
 * @param graine entier (32 bits)
 */
export function mulberry32(graine: number): () => number {
  let a = graine >>> 0
  return () => {
    a = (a + 0x6D2B79F5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Une graine neuve (1 → 2³¹), tirée avec Math.random : déterministe elle aussi quand les tests fixent Math.random. */
export const graineAleatoire = (): number => Math.floor(Math.random() * 2 ** 31) + 1

/** Appelé seul, un Rng donne un nombre dans [0, 1[ (comme Math.random). */
export interface Rng {
  (): number
  /** entier dans [min, max], bornes comprises */
  entier: (min: number, max: number) => number
  choisir: <T>(liste: readonly T[]) => T
  /** copie mélangée (Fisher-Yates) : la liste d'origine n'est pas modifiée */
  melanger: <T>(liste: readonly T[]) => T[]
  /** vrai avec la probabilité p */
  vrai: (p: number) => boolean
}

/** Crée un Rng à partir d'une graine (mulberry32) ou d'une source de nombres dans [0, 1[. */
export function creerRng(graineOuSource: number | (() => number)): Rng {
  const source = typeof graineOuSource === 'function' ? graineOuSource : mulberry32(graineOuSource)
  const rng = (() => source()) as Rng
  // entier dans [min, max], bornes comprises
  rng.entier = (min, max) => Math.floor(source() * (max - min + 1)) + min
  rng.choisir = liste => liste[rng.entier(0, liste.length - 1)]
  // mélange de Fisher-Yates (copie : la liste d'origine n'est pas modifiée)
  rng.melanger = liste => {
    const t = [...liste]
    for (let i = t.length - 1; i > 0; i--) {
      const j = rng.entier(0, i);
      [t[i], t[j]] = [t[j], t[i]]
    }
    return t
  }
  // vrai avec la probabilité p (un tirage, comme `Math.random() < p`)
  rng.vrai = p => source() < p
  return rng
}
