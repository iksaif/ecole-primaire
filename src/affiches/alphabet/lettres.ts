// Les lettres de l'affiche de l'alphabet : celles d'une langue (son alphabet, ou ses lettres « spéciales »), leur forme
// majuscule, leur couleur (voyelle ou consonne). Pur : lisible par node (dessin, textes, tests).
//   alphabet  : les 26 lettres du français ; une langue régionale a le sien (breton : ch et c'h, ni c, ni q, ni x),
//               dans ses données vérifiées (src/langues/<langue>/donnees.ts)
//   speciales : les lettres à signe (accents, cédille, ligatures) ; pour une langue régionale, ses lettres « en plus »
//               d'une seule lettre (breton : ñ et ù ; ch et c'h sont des digrammes, déjà dans son alphabet)
import { donneesRegionales } from '../../langues/registre.ts'
import type { Langue } from '../../langues/registre.ts'
import type { NomEmoji } from '../../images/tables.ts'

export const SERIES = ['alphabet', 'speciales'] as const
export type Serie = (typeof SERIES)[number]

const LATIN = [...'abcdefghijklmnopqrstuvwxyz']
// les lettres à signe du français : voyelles accentuées, cédille, ligatures œ et æ (ÿ et ü : noms propres et mots d'emprunt)
const SPECIALES = ['é', 'è', 'ê', 'ë', 'à', 'â', 'î', 'ï', 'ô', 'ù', 'û', 'ü', 'ÿ', 'ç', 'œ', 'æ']

/** L'alphabet d'une langue : l'alphabet régional s'il en a un, sinon les 26 lettres. */
export const alphabetDe = (langue: string): readonly string[] => donneesRegionales(langue as Langue)?.alphabet ?? LATIN

/** Les lettres spéciales d'une langue. */
export const specialesDe = (langue: string): readonly string[] => {
  const regionale = donneesRegionales(langue as Langue)
  return regionale ? regionale.lettresEnPlus.filter(l => [...l].length === 1) : SPECIALES
}

/** Les lettres d'une série dans une langue. */
export const lettresDe = (langue: string, serie: Serie): readonly string[] => (serie === 'speciales' ? specialesDe(langue) : alphabetDe(langue))

/** La lettre en majuscule ; un digramme ne met que sa première lettre (« ch » → « Ch », « c'h » → « C'h »). */
export const majuscule = (lettre: string): string => lettre.charAt(0).toUpperCase() + lettre.slice(1)

/** Voyelle ? (« é », « ù » comptent ; les ligatures œ et æ aussi ; « ch », « c'h », « ñ », « ç » non). */
export const estVoyelle = (lettre: string): boolean => /^[aeiouyœæ]/.test(lettre.normalize('NFD'))

// l'image de chaque mot du français (le mot est dans les textes de l'affiche : `mot.<lettre>`), un emoji de src/images/tables.ts ; une
// langue régionale a les siennes. Images ambiguës relues et acceptées (2026-10-07) : image, jus, usine, taxi (pour x), stylo, nuage.
export const IMAGES: Readonly<Record<string, NomEmoji>> = {
  a: 'abeille', b: 'ballonDeBaudruche', c: 'canard', d: 'dauphin', e: 'escargot', f: 'fraise', g: 'gorille', h: 'hibou', i: 'tableau',
  j: 'jus', k: 'koala', l: 'lion', m: 'maison', n: 'nuage', o: 'orange', p: 'pomme', q: 'quilles', r: 'renard', s: 'soleil',
  t: 'tortue', u: 'usine', v: 'vache', w: 'wagon', x: 'taxi', y: 'stylo', z: 'zebre',
  é: 'etoile', è: 'glace', ê: 'fete', ë: 'sapinDeNoel', à: 'repere', â: 'pates', î: 'ile', ï: 'mais', ô: 'hotel', ù: 'boussole',
  û: 'myrtilles', ç: 'glacon', œ: 'oeuf', æ: 'medaille',
}
