// Données du breton (langue régionale) : alphabet, mots illustrés, listes de jours, de mois et de nombres.
// Vérifiées (Wiktionnaire, Meurgorf, Kervarker) : à ne pas modifier sans source.
import type { DonneesRegionales } from '../types.ts'
import { enLettresBr } from './nombres.ts'

const plage = (de: number, a: number): number[] => Array.from({ length: a - de + 1 }, (_, k) => de + k)

// Mot illustré par lettre pour l'affiche de l'alphabet. Vérifiés dans le Wiktionnaire (ercʼh, frouezh,
// jirafenn, ognon, cʼhwil, warcʼhoazh, chokolad, rod, neizh, iliz) ou mots de base. Z : « zebr » (zèbre, m.,
// pl. zebred), vérifié le 2026-10-04 dans le Wiktionnaire breton (br.wiktionary.org/wiki/zebr), le Favereau
// (via geriafurch.bzh) et les traductions de « zèbre » du Wiktionnaire ; homographe de « zebr », forme mutée de debr.
const MOTS_ILLUSTRES: DonneesRegionales['mots'] = {
  a: ['aval', '🍎'], b: ['bara', '🍞'], ch: ['chokolad', '🍫'], "c'h": ["c'hwil", '🪲'], d: ['dour', '💧'],
  e: ["erc'h", '❄️'], f: ['frouezh', '🍓'], g: ['gavr', '🐐'], h: ['heol', '☀️'], i: ['iliz', '⛪'],
  j: ['jirafenn', '🦒'], k: ['ki', '🐕'], l: ['loar', '🌙'], m: ['mor', '🌊'], n: ['neizh', '🪺'],
  o: ['ognon', '🧅'], p: ['pesk', '🐟'], r: ['rod', '🛞'], s: ['skol', '🏫'], t: ['ti', '🏠'],
  u: ['unan', '1️⃣'], v: ['vi', '🥚'], w: ["warc'hoazh", '📅'], y: ['yar', '🐔'], z: ['zebr', '🦓'],
}

// Les noms de jours et de mois prennent une majuscule en breton
const LISTES: DonneesRegionales['listes'] = [
  { id: 'jours', libelle: { fr: 'Jours (Lun, Meurzh…)', br: 'Deizioù (Lun, Meurzh…)' }, titre: 'Deizioù ar sizhun', mots: ['Lun', 'Meurzh', "Merc'her", 'Yaou', 'Gwener', 'Sadorn', 'Sul'] },
  { id: 'jours-di', libelle: { fr: 'Jours (Dilun, Dimeurzh…)', br: 'Deizioù (Dilun, Dimeurzh…)' }, titre: 'Deizioù ar sizhun', mots: ['Dilun', 'Dimeurzh', "Dimerc'her", 'Diriaou', 'Digwener', 'Disadorn', 'Disul'] },
  { id: 'mois', libelle: { fr: 'Mois (Genver…)', br: 'Mizioù (Genver…)' }, titre: 'Mizioù ar bloaz', mots: ['Genver', "C'hwevrer", 'Meurzh', 'Ebrel', 'Mae', 'Mezheven', 'Gouere', 'Eost', 'Gwengolo', 'Here', 'Du', 'Kerzu'] },
  { id: 'nombres-10', libelle: { fr: 'Nombres 1 → 10', br: 'Niveroù 1 → 10' }, titre: 'Les nombres de 1 à 10 en breton', mots: plage(1, 10).map(enLettresBr) },
  { id: 'nombres-20', libelle: { fr: 'Nombres 11 → 20', br: 'Niveroù 11 → 20' }, titre: 'Les nombres de 11 à 20 en breton', mots: plage(11, 20).map(enLettresBr) },
  { id: 'dizaines', libelle: { fr: 'Dizaines', br: 'Degadoù' }, titre: 'Les dizaines en breton', mots: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(enLettresBr) },
]

export const donneesBr: DonneesRegionales = {
  // Lizherenneg (orthographe peurunvan) : 25 lettres, ch et c'h, ni c, ni q, ni x ; ñ et ù en plus
  alphabet: ['a', 'b', 'ch', "c'h", 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'r', 's', 't', 'u', 'v', 'w', 'y', 'z'],
  lettresEnPlus: ['ch', "c'h", 'ñ', 'ù'],
  titreAlphabet: 'Al lizherenneg',
  mots: MOTS_ILLUSTRES,
  enLettres: enLettresBr,
  listes: LISTES,
  ecoles: { fr: "l'école bilingue ou Diwan", br: 'ar skol divyezhek pe Diwan' },   // br: à relire
  fichesEcriture: {
    motLettre: 'lizherenn',            // slug des fiches « une lettre » : fiche-ecriture-lizherenn-a…
    titreLettre: 'Al lizherenn',       // titre imprimé : « Al lizherenn A a »
    listes: [
      { slug: 'jours-de-la-semaine', listes: ['jours', 'jours-di'], court: 'Jours', titre: 'les jours de la semaine', resume: 'les jours', classes: ['cp', 'ce1'], competence: 'jours-langue-regionale' },
      { slug: 'mois', listes: ['mois'], court: 'Mois', titre: "les mois de l'année", resume: 'les mois', classes: ['cp', 'ce1', 'ce2'], competence: 'mois-saisons-langue-regionale' },
      { slug: 'nombres', listes: ['nombres-10'], court: 'Nombres (1 à 10)', titre: 'les nombres de 1 à 10', resume: 'les nombres', classes: ['cp', 'ce1'], copie: 1, competence: 'nombres-jusqua-10-langue-regionale' },
    ],
  },
}
