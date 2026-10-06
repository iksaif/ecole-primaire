// La politique des réglages d'un niveau d'exercice ou d'une variante d'affiche : valeurs valides, marques « bonus » et « hors
// programme », ce qui n'est pas reporté d'un niveau à l'autre. Un seul code pour les deux modèles (reglages.ts : exercices,
// src/affiches/outils.ts : affiches), qui n'en recopient rien. Fonctions pures, lisibles par node.
import type { NiveauExercice, ValeurOption, ValeurReglage } from './types.ts'

type Options = Readonly<Record<string, readonly ValeurOption[]>>

/** Réglages à choix d'un niveau : options communes, puis celles du niveau, qui l'emportent. */
export const optionsDe = (communes: object | undefined, niv: NiveauExercice): Options =>
  ({ ...communes, ...niv.options } as Options)

/** Défauts d'un niveau : ceux de l'exercice, puis ceux du niveau, qui l'emportent. */
export const defautsDe = (communes: object | undefined, niv: NiveauExercice): Record<string, ValeurReglage> =>
  ({ ...communes, ...niv.reglages } as Record<string, ValeurReglage>)

/** La valeur est-elle marquée « bonus » (hors programme du niveau, jamais par défaut) ? */
export const estBonus = (niv: NiveauExercice | undefined, cle: string, valeur: unknown): boolean =>
  !!(niv?.bonus as Options | undefined)?.[cle]?.includes(valeur as ValeurOption)

/** Raison d'une valeur déclarée hors programme (`horsProgramme: [{ reglage, option, raison }]`), sinon null. */
export const raisonHorsProgramme = (niv: NiveauExercice | undefined, cle: string, valeur: unknown): string | null =>
  niv?.horsProgramme?.find(h => 'reglage' in h && h.reglage === cle && h.option === valeur)?.raison ?? null

/** Un réglage à choix lu (mémorisé, lien, test…) ramené à une valeur valide d'après ses options. */
export function valeurValide(defaut: ValeurReglage, offertes: readonly ValeurOption[], lue: unknown): ValeurReglage {
  // choix unique : la valeur lue si elle est proposée, sinon le défaut
  if (!Array.isArray(defaut)) return offertes.includes(lue as ValeurOption) ? lue as ValeurOption : defaut
  // choix multiple : les valeurs lues qui sont proposées ; aucune : le défaut
  const choisies = Array.isArray(lue) ? lue.filter(v => offertes.includes(v)) : []
  return (choisies.length ? choisies : [...defaut]) as string[] | number[]
}

/**
 * Réglages à reprendre d'un niveau (ou d'une variante) à un autre : retire ceux qui retombent sur le défaut du nouveau
 * niveau, à savoir un choix multiple (le programme change) et une valeur « bonus » ou « hors programme » (jamais reportée).
 * Le reste (choix unique proposé, réglages sans rapport avec le niveau) est gardé ; l'appelant revalide ensuite.
 * @param niv le NOUVEAU niveau
 * @param defauts ses défauts (defautsDe)
 */
export function reglagesReportes(reglages: Record<string, unknown>, niv: NiveauExercice, defauts: Record<string, ValeurReglage>): Record<string, unknown> {
  const res = { ...reglages }
  for (const cle of Object.keys(niv.options ?? {})) {
    if (Array.isArray(defauts[cle]) || estBonus(niv, cle, res[cle]) || raisonHorsProgramme(niv, cle, res[cle])) delete res[cle]
  }
  return res
}
