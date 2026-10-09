// Les saisons de l'affiche des mois : leurs couleurs, leurs mois (par mois entiers, pour la présentation « par saison ») et les dates où
// elles changent. Les saisons ne commencent pas au début d'un mois : elles changent vers le 21 mars (printemps), le 21 juin (été), le
// 22 septembre (automne) et le 21 décembre (hiver). Pur : lu par les deux présentations (calendrier.ts, dessin.ts).

/** Les saisons dans l'ordre des repères de l'académie de Rennes (« nevez-amzer, hañv, diskar-amzer, goañv »). `mois` : 0 = janvier. */
export const SAISONS = [
  { id: 'printemps', emoji: '🌱', mois: [2, 3, 4], fond: '#eaf7e4', accent: '#a5d98f' },
  { id: 'ete', emoji: '☀️', mois: [5, 6, 7], fond: '#fff7d9', accent: '#ffd966' },
  { id: 'automne', emoji: '🍂', mois: [8, 9, 10], fond: '#fdeede', accent: '#f4aa6c' },
  { id: 'hiver', emoji: '❄️', mois: [11, 0, 1], fond: '#e8f2fc', accent: '#9fc9f0' },
] as const

export type IdSaison = (typeof SAISONS)[number]['id']

export const saisonDe = (id: IdSaison): (typeof SAISONS)[number] => SAISONS.find(s => s.id === id) ?? SAISONS[0]

/**
 * Les repères « vers le 21 mars »… posés sur la bande de saisons de la présentation de janvier à décembre. Cachés pour l'instant (décision du
 * 2026-10-09) : la note sous l'affiche dit déjà que les saisons changent en cours de mois. Passer à `true` pour les remettre (les textes
 * `saison.debut` et leur style y sont toujours).
 */
export const AFFICHER_DATES_DE_CHANGEMENT = false

/** Les changements de saison : le mois (0 = janvier), le jour, et la saison qui commence. */
export const CHANGEMENTS: readonly { mois: number, jour: number, saison: IdSaison }[] = [
  { mois: 2, jour: 21, saison: 'printemps' },
  { mois: 5, jour: 21, saison: 'ete' },
  { mois: 8, jour: 22, saison: 'automne' },
  { mois: 11, jour: 21, saison: 'hiver' },
]

const JOURS_DU_MOIS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

/** Une date comme une position dans l'année, en mois : 0 = le 1er janvier, 2,5 = à peu près la mi-mars, 12 = la fin de décembre. */
export const position = (mois: number, jour: number): number => mois + (jour - 1) / JOURS_DU_MOIS[mois]

/** Les tronçons de l'année : l'hiver (qui finit l'année précédente), puis chaque saison de son changement au suivant, puis l'hiver qui recommence. */
export function troncons(): { saison: IdSaison, debut: number, fin: number }[] {
  const debuts = [{ saison: 'hiver' as IdSaison, debut: 0 }, ...CHANGEMENTS.map(c => ({ saison: c.saison, debut: position(c.mois, c.jour) }))]
  return debuts.map((d, i) => ({ ...d, fin: debuts[i + 1]?.debut ?? 12 }))
}
