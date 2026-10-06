// Lire l'heure — générateur : QUOI poser comme questions, et comment les corriger. Pur : aucun import de Vue, aucun Math.random
// (le hasard vient de `rng`), donc lisible par node, par les tests et par le build des fiches.
//   questions({ niveau, reglages, rng, T, nb })   questions du jeu, sans répétition
//   questionsFiche({ niveau, reglages, rng, T })  tout ce que tire la fiche imprimable (fiche.ts la met en page)
//   verifier(q, rep)                              la réponse est-elle juste ?
//   ecartsAuProgramme(x, contraintes)             ce qui sort du programme du niveau (tests)
//   ecartsFiche(html, contraintes)                ce que la fiche montre hors du programme du niveau (tests)
// L'ordre des tirages est celui de l'ancienne vue : mêmes questions, mêmes fiches à graine égale (tests/instantanes).
import type { Classe, Contraintes, ParamsGenerateur, Traducteur, Verdict } from '../../noyau/types.ts'
import type { ConfigDe, ReglagesDeDefinition } from '../../noyau/definir.ts'
import type { Rng } from '../../utils/hasard.ts'
import { contraintesDe } from '../../data/programme.ts'
import { tirerUniques } from '../../noyau/uniques.ts'
import type { CleContenu } from '../../langues/catalogue.ts'
import DEFINITION from './definition.ts'
import type { CONTENU } from './textes.ts'
import type { Heure } from './horloge.ts'

type Reglages = ReglagesDeDefinition<typeof DEFINITION>
type Config = ConfigDe<typeof DEFINITION>
type Cle = CleContenu<typeof CONTENU>
type T = Traducteur<Cle>

/** Ce que la partie ou la fiche propose (réglage `exercices`). */
export type Exercice = Reglages['exercices'][number]
/** Les minutes que montrent les horloges (réglage `precisions`). */
export type Precision = Reglages['precisions'][number]

// ── Questions ──

/** Une proposition d'horloge ou d'heure écrite (`label` : le texte ; absent quand le bouton montre une horloge). */
export interface OptionHeure extends Heure { label?: string }
/** Une proposition de texte (« Que fait-on à 8 h 30 ? »). */
export interface OptionNom { label: string }

interface Base { cle: string, texte: string, attendu: string }

/** Lire une horloge : 4 propositions (`mode: 'choix'`, `options` et `bonne`) ou au clavier. */
export interface QLire extends Base {
  type: 'lire'
  h: number
  m: number
  mode: 'choix' | 'clavier'
  sansMinutes: boolean
  oral: string
  options?: OptionHeure[]
  bonne?: number
}
/** Placer les aiguilles : `depart` est la position des aiguilles à l'ouverture. */
export interface QPlacer extends Base {
  type: 'placer'
  h: number
  m: number
  depart: Heure
  consigneOrale: boolean
  /** heures entières seulement : la grande aiguille reste sur le 12 */
  sansMinutes: boolean
  ecrit: string
  oral: string
}
/** Matin / après-midi : lire une horloge et écrire l'heure sur 24 h (`lire24`), ou choisir l'horloge d'une heure sur 24 h (`choisir`). */
export interface QJournee extends Base {
  type: 'journee'
  sous: 'lire24' | 'choisir'
  h: number
  m: number
  h24: number
  ecrit24: string
  sansMinutes: boolean
  phrase: string
  oral: string
  options?: OptionHeure[]
  bonne?: number
}
/** Une activité d'un problème de durée : son nom (dans la langue du contenu) et son genre, qui choisit la variante de l'énoncé (« il dure » / « elle dure »). */
export interface Activite { nom: string, genre: Genre }
type Genre = 'm' | 'f'
/** Durées : « dans 1 h 30, quelle heure ? » (`apres`) ou « combien de temps dure… ? » (`combien`). */
export interface QDuree extends Base {
  type: 'duree'
  sous: 'apres' | 'combien'
  h: number
  m: number
  h2: number
  m2: number
  h24: number
  h24f: number
  d: number
  ecritDebut: string
  ecritFin: string
  ecritDuree: string
  act?: Activite
}
/** Conversions h / min (CE2) : `texte` « 2 h 15 min = ? min », `valeurs` ce qu'on met dans les cases (`unites`). */
export interface QConversion extends Base {
  type: 'conversion'
  k: 'h-min' | 'hmin-min' | 'min-hmin'
  unites: ('h' | 'min')[]
  valeurs: number[]
}
/** Une ligne d'emploi du temps ; `debut` et `fin` en minutes depuis minuit. */
export interface LigneEmploi { nom: string, phrase: string, recre?: boolean, debut: number, fin: number }
/** Emploi du temps (CE2) : début d'une séance (`debut`), durée (`duree`) ou ce qu'on fait à une heure (`quoi`, avec `options`). */
export interface QEmploi extends Base {
  type: 'emploi'
  sous: 'debut' | 'duree' | 'quoi'
  emploi: LigneEmploi[]
  question: string
  h24?: number
  m?: number
  d?: number
  options?: OptionNom[]
  bonne?: number
}
export type Question = QLire | QPlacer | QJournee | QDuree | QConversion | QEmploi

/**
 * La réponse de l'élève : un choix (indice de la proposition), la position des aiguilles (`h` de 0 à 11), ou les cases « ? h ? min »
 * (nombres ou chaînes tapées, vides possibles).
 */
export type Reponse = { choix: number } | { aiguilles: { h: number, m: number } } | { h: number | string, m: number | string }

// ── Données ──

// Minutes de chaque précision (libellés : `precisions.<id>` de l'interface)
export const MINUTES_PAR_PRECISION: Record<Precision, number[]> = {
  heure: [0],
  demi: [30],
  quart: [15, 45],
  cinq: [5, 10, 20, 25, 35, 40, 50, 55],
  minute: Array.from({ length: 60 }, (_, i) => i).filter(i => i % 5 !== 0),
}

// Durées proposées par niveau (en minutes) et conversions (1 h = 60 min ; les secondes arrivent au CM2)
interface Donnees { durees: number[], dureesCinq: number[], dureesMinute: number[], dureeMax: number, conversions: QConversion['k'][] }
const DONNEES: Partial<Record<Classe, Donnees>> = {
  cp: { durees: [], dureesCinq: [], dureesMinute: [], dureeMax: 0, conversions: [] },
  ce1: { durees: [15, 30, 45, 60, 90, 120, 180], dureesCinq: [5, 10, 20], dureesMinute: [], dureeMax: 180, conversions: [] },
  ce2: {
    durees: [15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 180, 210],
    dureesCinq: [5, 10, 20, 25, 35, 40, 50, 55, 70, 80, 100, 110, 125, 140, 160],
    dureesMinute: [12, 18, 27, 33, 48, 52, 64, 72, 87, 96],
    dureeMax: 240,
    conversions: ['h-min', 'hmin-min', 'min-hmin'],
  },
}
/** Les données d'un niveau de l'exercice (une classe hors de l'exercice est une erreur, jamais un repli silencieux). */
function donneesDe(niveau: Classe): Donnees {
  const d = DONNEES[niveau]
  if (!d) throw new Error(`heure : pas de données pour le niveau « ${niveau} » (niveaux : ${Object.keys(DONNEES).join(', ')})`)
  return d
}

// Activités et créneaux plausibles (heures sur 24 h) ; noms : `activites.<id>` du catalogue de contenu
type IdActivite = 'dessinAnime' | 'film' | 'promenade' | 'match' | 'sieste' | 'piqueNique' | 'piscine' | 'gouter' | 'peinture'
const ACTIVITES: readonly { id: IdActivite, genre: Genre, debut: readonly [number, number], dureeMax: number }[] = [
  { id: 'dessinAnime', genre: 'm', debut: [8, 18], dureeMax: 60 },
  { id: 'film', genre: 'm', debut: [14, 17], dureeMax: 150 },
  { id: 'promenade', genre: 'f', debut: [9, 17], dureeMax: 180 },
  { id: 'match', genre: 'm', debut: [9, 17], dureeMax: 120 },
  { id: 'sieste', genre: 'f', debut: [13, 15], dureeMax: 120 },
  { id: 'piqueNique', genre: 'm', debut: [11, 13], dureeMax: 120 },
  { id: 'piscine', genre: 'f', debut: [9, 17], dureeMax: 90 },
  { id: 'gouter', genre: 'm', debut: [16, 17], dureeMax: 30 },
  { id: 'peinture', genre: 'm', debut: [9, 16], dureeMax: 120 },
]
const activiteDe = (T: T, a: { id: IdActivite, genre: Genre }): Activite => ({ nom: T(`activites.${a.id}`), genre: a.genre })

// Matières de l'emploi du temps, dans l'ordre du catalogue (le mélange en dépend : même graine, même emploi du temps)
type IdMatiere = 'lecture' | 'maths' | 'anglais' | 'sport' | 'musique' | 'sciences' | 'dessin' | 'ecriture' | 'geographie'
const MATIERES: readonly IdMatiere[] = ['lecture', 'maths', 'anglais', 'sport', 'musique', 'sciences', 'dessin', 'ecriture', 'geographie']

// Moments de la journée : phrase et suffixe (« du matin ») dans le catalogue de contenu, `moments.<nom>`
type NomMoment = 'matin' | 'apresMidi' | 'soir'
export const MOMENTS: readonly { nom: NomMoment, heures: readonly number[], decalage: number }[] = [
  { nom: 'matin', heures: [7, 8, 9, 10, 11], decalage: 0 },
  { nom: 'apresMidi', heures: [1, 2, 3, 4, 5], decalage: 12 },
  { nom: 'soir', heures: [6, 7, 8, 9, 10], decalage: 12 },
]

// ── Écriture des heures ──

const deux = (n: number): string => String(n).padStart(2, '0')
/** « 3 h », « 3 h 05 », « 15 h 30 » (notation des programmes, la même dans toutes les langues). */
export const ecrit = (h: number, m: number): string => (m === 0 ? `${h} h` : `${h} h ${deux(m)}`)
/** « 3 h » ou « 3 h 05 » comme on l'écrit dans les cases d'une réponse. */
export const ecritCases = (h: number | string, m: number | string, sansMinutes: boolean): string => (sansMinutes ? `${h || 0} h` : `${h || 0} h ${deux(+m || 0)}`)
/** Minutes depuis minuit → « 8 h 30 ». */
export const hm = (t: number): string => ecrit(Math.floor(t / 60), t % 60)
/** « 1 h 30 min », « 2 h », « 45 min ». */
export function ecritDuree(d: number): string {
  const h = Math.floor(d / 60), m = d % 60
  if (h && m) return `${h} h ${m} min`
  return h ? `${h} h` : `${m} min`
}
const egal = (a: Heure, b: Heure): boolean => a.h === b.h && a.m === b.m
const h12 = (x: number): number => ((x - 1 + 120) % 12) + 1

// ── L'heure dite en lettres : les mots et les modèles de phrase sont dans le catalogue (textes.ts), pas ici ──

const mots = (T: T, cle: 'mots.heures12' | 'mots.heures24' | 'mots.minutes'): string[] => T(cle).split('|')

/** Heure sur un cadran (1 → 12) dite à l'oral : « trois heures et quart », « quatre heures moins le quart », « midi ». */
export function oral12(T: T, h: number, m: number): string {
  const heures = mots(T, 'mots.heures12'), minutes = mots(T, 'mots.minutes')
  const suivante = heures[(h % 12) + 1]
  if (m === 0) return heures[h]
  if (m === 15) return T('oral.quart', { h: heures[h] })
  if (m === 30) return T(h === 12 ? 'oral.demieMidi' : 'oral.demie', { h: heures[h] })
  if (m === 45) return T('oral.moinsQuart', { h: suivante })
  if (m < 30 || m % 5 !== 0) return T('oral.apres', { h: heures[h], m: minutes[m] })
  return T('oral.moins', { h: suivante, m: minutes[60 - m] })
}
/** « trois heures et quart de l'après-midi » ; pas de suffixe quand on dit « midi » (11 h 45 → « midi moins le quart »). */
function oralMoment(T: T, h: number, m: number, nom: NomMoment): string {
  const oral = oral12(T, h, m)
  return oral.startsWith(mots(T, 'mots.heures12')[12]) ? oral : `${oral} ${T(`moments.${nom}.suffixe`)}`
}
/** Correction « matin / après-midi » : l'heure sur 24 h en lettres, puis l'oral du cadran. */
export function oralJournee(T: T, h24: number, m: number, oral: string): string {
  const base = mots(T, 'mots.heures24')[h24]
  return T('oral.journee', { lettres: m === 0 ? base : `${base} ${mots(T, 'mots.minutes')[m]}`, oral })
}

// ── Réglages du niveau ──

/** Les valeurs d'un réglage à choix multiple retenues parmi celles que le niveau propose. */
function retenues<C extends 'exercices' | 'precisions'>(niveau: Classe, reglages: Config, cle: C): Config[C] {
  const offertes = (DEFINITION.niveaux[niveau]?.options as Record<string, readonly unknown[] | undefined> | undefined)?.[cle] ?? []
  return (((reglages as Record<string, unknown>)[cle] as readonly unknown[] | undefined) ?? []).filter(x => offertes.includes(x)) as Config[C]
}

/** Les minutes que les horloges peuvent montrer d'après les précisions choisies. */
export const minutesDisponibles = (precisions: readonly Precision[]): number[] =>
  [...new Set(precisions.flatMap(p => MINUTES_PAR_PRECISION[p] ?? []))].sort((a, b) => a - b)

// heures entières seulement (CP, ou précision « heures pile » seule) : pas de case pour les minutes
const sansMinutesDe = (pool: readonly number[]): boolean => pool.length === 1 && pool[0] === 0

/**
 * Les minutes écrites autour du cadran sont-elles possibles ? Pas au CP : le programme se limite aux heures entières, la
 * graduation des minutes n'a pas à y paraître (ni dans le jeu ni sur la fiche).
 */
export const aideMinutesPossible = (niveau: Classe): boolean => contraintesDe(niveau)?.heure !== 'entiere'

/** Pas de la grande aiguille quand on place les aiguilles : à la minute (1) si la précision « à la minute près » est choisie, sinon 5. */
export const pasDesMinutes = (niveau: Classe, reglages: Config): 1 | 5 => ((retenues(niveau, reglages, 'precisions') as readonly Precision[]).includes('minute') ? 1 : 5)

// Ce que tire une question : les choix du niveau, une fois lus dans les réglages
interface Tirage1 { niveau: Classe, exercices: readonly Exercice[], precisions: readonly Precision[], clavier: boolean, rng: Rng, T: T }

function dureesDisponibles(niv: Donnees, precisions: readonly Precision[]): number[] {
  const fin = precisions.includes('cinq') || precisions.includes('minute')
  const ok = (d: number): boolean => {
    const r = d % 60
    if (r % 5 !== 0) return precisions.includes('minute')
    if (r === 0) return true
    if (r === 30) return precisions.includes('demi') || fin
    if (r === 15 || r === 45) return precisions.includes('quart') || fin
    return fin
  }
  const liste = [...niv.durees,
    ...(fin ? niv.dureesCinq : []),
    ...(precisions.includes('minute') ? niv.dureesMinute : [])]
  const res = [...new Set(liste.filter(ok))]
  return res.length ? res : [60, 120]
}

// Distracteurs plausibles pour une heure (h 1..12, m) : erreurs typiques d'enfants.
function distracteurs(rng: Rng, h: number, m: number, pool: readonly number[]): Heure[] {
  const cands: Heure[] = [
    { h: h12(h + 1), m },                      // « 2 h 45 » lu « 3 h 45 »
    { h: h12(h - 1), m },
    { h: m === 0 ? 12 : m / 5, m: (h * 5) % 60 }, // aiguilles inversées
    { h, m: (m + 30) % 60 },
    { h, m: (60 - m) % 60 },
    { h: h12(h + 1), m: (60 - m) % 60 },       // « moins le quart » ↔ « et quart »
    { h, m: (m + 5) % 60 },
  ].filter(c => Number.isInteger(c.h) && c.h >= 1 && c.h <= 12 && !egal(c, { h, m }) && pool.includes(c.m))  // précision du niveau
  const uniques: Heure[] = []
  for (const c of rng.melanger(cands)) if (!uniques.some(u => egal(u, c))) uniques.push(c)
  let essais = 0
  while (uniques.length < 3 && essais++ < 100) {
    const c = { h: rng.entier(1, 12), m: rng.choisir(pool) }
    if (!egal(c, { h, m }) && !uniques.some(u => egal(u, c))) uniques.push(c)
  }
  return uniques.slice(0, 3)
}

// Emploi du temps d'une matinée ou d'un après-midi : créneaux consécutifs (au niveau qui propose les minutes, des séances de 40 et 50 min).
function genererEmploi(rng: Rng, T: T, niveau: Classe): LigneEmploi[] {
  const matin = rng.vrai(0.6)
  let t = matin ? 8 * 60 + 30 : 13 * 60 + 30
  const precisions = (DEFINITION.niveaux[niveau]?.options as { precisions?: readonly Precision[] } | undefined)?.precisions ?? []
  const pas = precisions.includes('minute') ? [30, 45, 60, 40, 50] : [30, 45, 60]
  const matieres = rng.melanger(MATIERES)
  const lignes: LigneEmploi[] = []
  for (let i = 0; i < 4; i++) {
    const d = rng.choisir(pas)
    lignes.push({ nom: T(`matieres.${matieres[i]}`), phrase: T(`matieresPhrase.${matieres[i]}`), debut: t, fin: t + d })
    t += d
    if (i === 1) { lignes.push({ nom: T('recre'), phrase: T('recre'), recre: true, debut: t, fin: t + 15 }); t += 15 }
  }
  return lignes
}

// « 2 h = ? min » → « 2 h = 120 min » ; « 70 min = ? h ? min » → « 70 min = 1 h 10 min »
const resolue = (texte: string, valeurs: readonly number[]): string =>
  texte.replace(/\?\s*h\s*\?\s*min/, `${valeurs[0]} h ${valeurs[1]} min`).replace('?', String(valeurs[0]))

function genererConversion(rng: Rng, conversions: readonly QConversion['k'][]): QConversion {
  const k = rng.choisir(conversions)
  const conversion = (texte: string, unites: QConversion['unites'], valeurs: number[]): QConversion =>
    ({ type: 'conversion', k, cle: `conv-${texte}`, texte, unites, valeurs, attendu: resolue(texte, valeurs) })
  if (k === 'h-min') {
    const h = rng.entier(1, 4)
    return conversion(`${h} h = ? min`, ['min'], [h * 60])
  }
  if (k === 'hmin-min') {
    const h = rng.entier(1, 3), m = rng.choisir([5, 10, 15, 20, 30, 40, 45, 50])
    return conversion(`${h} h ${m} min = ? min`, ['min'], [h * 60 + m])
  }
  const t = rng.choisir([70, 75, 80, 90, 100, 110, 120, 130, 135, 150, 180, 200])
  return conversion(`${t} min = ? h ? min`, ['h', 'min'], [Math.floor(t / 60), t % 60])
}

// Une question (type tiré parmi les exercices choisis)
function genererQuestion({ niveau, exercices, precisions, clavier, rng, T }: Tirage1): Question {
  const niv = donneesDe(niveau)
  const type = rng.choisir(exercices.length ? exercices : ['lire' as const])
  const pool = minutesDisponibles(precisions.length ? precisions : ['heure'])
  const sansMinutes = sansMinutesDe(pool)

  if (type === 'lire') {
    const h = rng.entier(1, 12), m = rng.choisir(pool)
    const q: QLire = { type, cle: `lire-${h}-${m}`, h, m, mode: clavier ? 'clavier' : 'choix', sansMinutes,
      texte: T('lireQ'), attendu: `${ecrit(h, m)} (${oral12(T, h, m)})`, oral: oral12(T, h, m) }
    if (q.mode === 'choix') {
      const enLettres = rng.vrai(0.4)
      const opts = rng.melanger([{ h, m }, ...distracteurs(rng, h, m, pool)])
      q.options = opts.map(o => ({ ...o, label: enLettres ? oral12(T, o.h, o.m) : ecrit(o.h, o.m) }))
      q.bonne = opts.findIndex(o => egal(o, { h, m }))
    }
    return q
  }

  if (type === 'placer') {
    const h = rng.entier(1, 12), m = rng.choisir(pool)
    let depart: Heure
    // au CP (heures entières) la grande aiguille reste sur le 12 : on ne déplace que la petite (même nombre de tirages)
    do {
      const hd = rng.entier(0, 11), md = rng.entier(0, 11) * 5
      depart = { h: hd, m: sansMinutes ? 0 : md }
    } while (depart.h === h % 12 && depart.m === m)
    return { type, cle: `placer-${h}-${m}`, h, m, depart, sansMinutes, consigneOrale: rng.vrai(0.5),
      ecrit: ecrit(h, m), oral: oral12(T, h, m),
      texte: T('placerQ', { ecrit: ecrit(h, m) }), attendu: `${ecrit(h, m)} (${oral12(T, h, m)})` }
  }

  if (type === 'journee') {
    const nomMoment = rng.choisir(rng.vrai(0.25) ? [MOMENTS[0]] : MOMENTS.slice(1))
    const h = rng.choisir(nomMoment.heures), m = rng.choisir(pool)
    const h24 = h + nomMoment.decalage
    const oral = oralMoment(T, h, m, nomMoment.nom)
    const sous = rng.vrai(0.5) ? 'lire24' : 'choisir'
    const phrase = T(`moments.${nomMoment.nom}.phrase`)
    const q: QJournee = { type, sous, cle: `journee-${sous}-${h24}-${m}`, h, m, h24, ecrit24: ecrit(h24, m), sansMinutes,
      phrase, oral, texte: '', attendu: `${ecrit(h24, m)} (${oral})` }
    if (sous === 'lire24') {
      q.texte = T('journeeLireQ', { phrase })
    } else {
      q.texte = T('journeeChoisirQ', { ecrit: ecrit(h24, m) })
      const cands: Heure[] = [
        { h: h12(h + 2), m },          // « 16 h » confondu avec « 6 h »
        { h: h12(h + 1), m },
        { h: h12(h - 1), m },
        { h, m: (m + 30) % 60 },
      ].filter(c => !egal(c, { h, m }))
      const uniques: Heure[] = []
      for (const c of cands) if (!uniques.some(u => egal(u, c))) uniques.push(c)
      const opts = rng.melanger([{ h, m }, ...uniques.slice(0, 3)])
      q.options = opts
      q.bonne = opts.findIndex(o => egal(o, { h, m }))
    }
    return q
  }

  if (type === 'conversion') return genererConversion(rng, niv.conversions)

  if (type === 'emploi') {
    const emploi = genererEmploi(rng, T, niveau)
    const cours = emploi.filter(l => !l.recre)
    const sous = rng.choisir(['debut', 'duree', 'quoi'] as const)
    const l = rng.choisir(sous === 'duree' ? emploi : cours)
    const q: QEmploi = { type, sous, emploi, cle: `emploi-${sous}-${l.nom}-${l.debut}-${l.fin}`, question: '', texte: '', attendu: '' }
    if (sous === 'debut') {
      q.question = T('emploiDebutQ', { nom: l.phrase })
      q.h24 = Math.floor(l.debut / 60); q.m = l.debut % 60
      q.attendu = hm(l.debut)
    } else if (sous === 'duree') {
      q.question = l.recre ? T('emploiDureeRecreQ') : T('emploiDureeQ', { nom: l.phrase })
      q.d = l.fin - l.debut
      q.attendu = ecritDuree(q.d)
    } else {
      const t = l.debut + rng.entier(1, Math.floor((l.fin - l.debut) / 5) - 1) * 5
      q.question = T('emploiQuoiQ', { ecrit: hm(t) })
      const autres = rng.melanger(emploi.filter(x => x.nom !== l.nom).map(x => x.nom)).slice(0, 3)
      q.options = rng.melanger([l.nom, ...autres]).map(n => ({ label: n }))
      q.bonne = q.options.findIndex(o => o.label === l.nom)
      q.attendu = l.nom
    }
    q.texte = q.question
    return q
  }

  // Durées : départ à une heure plausible (8 h → 11 h ou 13 h → 18 h), fin avant 19 h.
  const d = rng.choisir(dureesDisponibles(niv, precisions).filter(x => x <= niv.dureeMax))
  const departsPour = ([hMin, hMax]: readonly [number, number]): Heure[] => {
    const res: Heure[] = []
    for (let h = hMin; h <= hMax; h++) {
      if (h === 12) continue
      for (const m of pool) if (h * 60 + m + d <= 19 * 60) res.push({ h, m })
    }
    return res
  }
  const acts = ACTIVITES.filter(a => a.dureeMax >= d && departsPour(a.debut).length)
  const sous = rng.vrai(0.6) || !acts.length ? 'apres' : 'combien'
  const choisie = sous === 'combien' ? rng.choisir(acts) : null
  const act = choisie ? activiteDe(T, choisie) : undefined
  const { h: h24, m } = rng.choisir(departsPour(choisie ? choisie.debut : [8, 18]))
  const debut = h24 * 60 + m
  const fin = debut + d
  const h24f = Math.floor(fin / 60), m2 = fin % 60
  const q: QDuree = { type: 'duree', sous, cle: `duree-${sous}-${debut}-${d}`, h: h12(h24), m, h2: h12(h24f), m2, h24, h24f, d,
    ecritDebut: ecrit(h24, m), ecritFin: ecrit(h24f, m2), ecritDuree: ecritDuree(d), texte: '', attendu: '' }
  if (act) {
    q.act = act
    q.texte = T(`dureeCombienQ.${act.genre}`, { nom: act.nom, debut: ecrit(h24, m), fin: ecrit(h24f, m2) })
    q.attendu = ecritDuree(d)
  } else {
    q.texte = T('dureeApresQ', { debut: ecrit(h24, m), duree: ecritDuree(d) })
    q.attendu = ecrit(h24f, m2)
  }
  return q
}

/** Les questions du jeu : `nb` questions toutes différentes (un petit niveau peut en donner moins : jamais de doublon). */
export function questions({ niveau, reglages, rng, T, nb = reglages.nbQ }: ParamsGenerateur<Reglages, Cle>): Question[] {
  const t1: Tirage1 = {
    niveau, exercices: retenues(niveau, reglages, 'exercices'), precisions: retenues(niveau, reglages, 'precisions'),
    clavier: reglages.saisie === 'clavier', rng, T,
  }
  return tirerUniques(nb, () => genererQuestion(t1), { cle: q => q.cle, essais: nb * 60 })
}

// ── Vérification ──

/** Les cases « ? h ? min » : vide → 0 ; null si ce n'est pas un nombre entier positif. */
function lireCases(rep: { h: number | string, m: number | string }): { h: number, m: number } | null {
  const vide = (v: number | string): boolean => v === ''
  if (vide(rep.h) && vide(rep.m)) return null
  const h = vide(rep.h) ? 0 : Number(rep.h)
  const m = vide(rep.m) ? 0 : Number(rep.m)
  if (!Number.isInteger(h) || !Number.isInteger(m) || h < 0 || m < 0) return null
  return { h, m }
}

export function verifier(q: Question, rep: Reponse): Verdict {
  if ('choix' in rep) return rep.choix === ('bonne' in q ? q.bonne : undefined)
  if ('aiguilles' in rep) return q.type === 'placer' && rep.aiguilles.h === q.h % 12 && rep.aiguilles.m === q.m
  const saisie = lireCases(rep)
  if (!saisie) return false
  const { h, m } = saisie
  switch (q.type) {
    case 'conversion': return q.valeurs.length === 1 ? h === q.valeurs[0] : h === q.valeurs[0] && m === q.valeurs[1]
    case 'lire': return m === q.m && h % 12 === q.h % 12 && h <= 23   // 3 h 15 ou 15 h 15
    case 'journee': return m === q.m && h === q.h24
    case 'emploi': return q.sous === 'debut' ? m === q.m && h === q.h24 : m < 60 && h * 60 + m === q.d || (h === 0 && m === q.d)
    case 'duree': return q.sous === 'apres' ? m === q.m2 && h % 12 === q.h24f % 12 && h <= 23 : m < 60 && h * 60 + m === q.d || (h === 0 && m === q.d)
    default: return false
  }
}

/** Une réponse juste, que `verifier` doit accepter (tests). */
export function bonneReponse(q: Question): Reponse {
  if ('options' in q && q.options) return { choix: q.bonne ?? 0 }
  switch (q.type) {
    case 'placer': return { aiguilles: { h: q.h % 12, m: q.m } }
    case 'journee': return { h: q.h24, m: q.m }
    case 'conversion': return { h: q.valeurs[0], m: q.valeurs[1] ?? '' }
    case 'duree': return q.sous === 'apres' ? { h: q.h24f, m: q.m2 } : { h: Math.floor(q.d / 60), m: q.d % 60 }
    case 'emploi': return q.sous === 'debut' ? { h: q.h24 ?? 0, m: q.m ?? 0 } : { h: Math.floor((q.d ?? 0) / 60), m: (q.d ?? 0) % 60 }
    default: return { h: q.h, m: q.m }
  }
}

/** Une réponse fausse, que `verifier` doit refuser (tests). */
export function mauvaiseReponse(q: Question): Reponse {
  if ('options' in q && q.options) return { choix: ((q.bonne ?? 0) + 1) % q.options.length }
  switch (q.type) {
    case 'placer': return { aiguilles: { h: (q.h + 1) % 12, m: q.m } }
    case 'journee': return { h: q.h24 + 1, m: q.m }
    case 'conversion': return { h: q.valeurs[0] + 1, m: q.valeurs[1] ?? '' }
    case 'duree': return q.sous === 'apres' ? { h: q.h24f + 1, m: q.m2 } : { h: 0, m: q.d + 1 }
    case 'emploi': return { h: 0, m: (q.d ?? 0) + 1 }
    default: return { h: (q.h % 12) + 1, m: q.m }
  }
}

/** Le retour après une erreur, selon le type de question. */
export function messageErreur(q: Question, T: T): string {
  if (q.type === 'duree' && q.act) return T(`dureeCombienFaux.${q.act.genre}`, { attendu: q.attendu })
  if (q.type === 'conversion') return `❌ ${q.attendu}`
  if (q.type === 'emploi') return `❌ ${T('bonneReponse')} : ${q.attendu}`
  if (q.type === 'duree') return T('dureeApresFaux', { attendu: q.attendu })
  if (q.type === 'journee') return `❌ ${T('bonneReponse')} : ${ecrit(q.h24, q.m)}`
  if (q.type === 'placer') return T('placerFaux', { ecrit: q.ecrit })
  return T('lireFaux', { ecrit: ecrit(q.h, q.m) })
}

// ── La fiche ──

/** Une ligne « matin / après-midi » de la fiche : l'heure du cadran (`h`, 1 → 12) et la même sur 24 h. */
export interface LigneJournee { h: number, m: number, moment: NomMoment, h24: number }
/** Ce que tire la fiche imprimable (fiche.ts la met en page). */
export interface Tirage {
  niveau: Classe
  avecLire: boolean
  avecPlacer: boolean
  sansMinutes: boolean
  /** horloges à lire */
  aLire: Heure[]
  /** horloges vides où dessiner les aiguilles ; `oral` : l'heure dite en lettres, une fois sur deux */
  aDessiner: (Heure & { oral: string | null })[]
  journee?: LigneJournee[]
  durees?: QDuree[]
  conversions?: QConversion[]
  emploi?: { lignes: LigneEmploi[], debut: LigneEmploi, duree: LigneEmploi, quoi: LigneEmploi }
}

/**
 * Ce que tire la fiche, dans l'ordre de l'ancienne vue : horloges à lire, à dessiner, puis les parties choisies (matin / après-midi,
 * durées, conversions, emploi du temps). Jamais deux fois la même heure d'horloge.
 */
export function questionsFiche({ niveau, reglages, rng, T }: Omit<ParamsGenerateur<Reglages, Cle>, 'nb'>): Tirage {
  const exercices: readonly Exercice[] = retenues(niveau, reglages, 'exercices')
  const precisions: readonly Precision[] = retenues(niveau, reglages, 'precisions')
  const pool = minutesDisponibles(precisions.length ? precisions : ['heure'])
  // les horloges à lire et à dessiner ne se répètent pas, même entre elles : `vues` est partagé (au plus 500 tirages par partie)
  const vues = new Set<string>()
  const tirer = (n: number): Heure[] => {
    const res: Heure[] = []
    for (let essais = 0; res.length < n && essais < 500; essais++) {
      const t = { h: rng.entier(1, 12), m: rng.choisir(pool) }
      const k = `${t.h}-${t.m}`
      if (!vues.has(k)) { vues.add(k); res.push(t) }
    }
    return res
  }
  const nbH = reglages.nbHorloges || 8
  // parties « horloges » selon les exercices choisis (les deux si aucune autre partie n'est demandée)
  const autres = (['journee', 'duree', 'conversion', 'emploi'] as const).some(e => exercices.includes(e))
  let avecLire = exercices.includes('lire'), avecPlacer = exercices.includes('placer')
  if (!avecLire && !avecPlacer && !autres) avecLire = avecPlacer = true
  const aLire = tirer(nbH)
  const aDessiner = tirer(nbH).map((t, i) => ({ ...t, oral: i % 2 ? oral12(T, t.h, t.m) : null }))
  const res: Tirage = { niveau, avecLire, avecPlacer, sansMinutes: sansMinutesDe(pool), aLire, aDessiner }

  if (exercices.includes('journee')) {
    const lignes: LigneJournee[] = []
    const vusJ = new Set<string>()
    let essais = 0
    while (lignes.length < 6 && essais++ < 200) {
      const mo = rng.choisir(MOMENTS.slice(1)), h = rng.choisir(mo.heures), m = rng.choisir(pool)
      if (vusJ.has(`${h}-${m}-${mo.nom}`)) continue
      vusJ.add(`${h}-${m}-${mo.nom}`)
      lignes.push({ h, m, moment: mo.nom, h24: h + 12 })
    }
    res.journee = lignes
  }
  const entree = (types: readonly Exercice[]): Tirage1 => ({ niveau, exercices: types, precisions, clavier: false, rng, T })
  const nombre = <Q extends Question>(types: readonly Exercice[], n: number): Q[] =>
    tirerUniques(n, () => genererQuestion(entree(types)) as Q, { cle: q => q.cle, essais: n * 60 })
  if (exercices.includes('duree')) res.durees = nombre<QDuree>(['duree'], 4)
  if (exercices.includes('conversion')) res.conversions = nombre<QConversion>(['conversion'], 6)
  if (exercices.includes('emploi')) {
    const emploi = genererEmploi(rng, T, niveau)
    const [debut, duree, quoi] = rng.melanger(emploi.filter(l => !l.recre))
    res.emploi = { lignes: emploi, debut, duree, quoi }
  }
  return res
}

// ── Programme : ce qui sort des contraintes du niveau (src/data/programme.ts, CONTRAINTES) ──

const PAS: Partial<Record<NonNullable<Contraintes['heure']>, number>> = { entiere: 60, quart: 15, minute: 1, seconde: 1 }
// Heures et durées (en minutes) présentes dans une question de jeu ou dans le tirage d'une fiche
interface Mesures { heures: Heure[], durees: number[] }
function mesures(x: readonly Question[] | Tirage): Mesures {
  const res: Mesures = { heures: [], durees: [] }
  const h = (hh: number, m: number): void => { res.heures.push({ h: hh, m }) }
  const ajouter = (r: Mesures): void => { res.heures.push(...r.heures); res.durees.push(...r.durees) }
  if (Array.isArray(x)) { for (const q of x as readonly Question[]) ajouter(mesures1(q)); return res }
  const t = x as Tirage
  if (t.avecLire) t.aLire.forEach(c => h(c.h, c.m))
  if (t.avecPlacer) t.aDessiner.forEach(c => h(c.h, c.m))
  t.journee?.forEach(l => h(l.h24, l.m))
  for (const q of [...(t.durees ?? []), ...(t.conversions ?? [])]) ajouter(mesures1(q))
  if (t.emploi) for (const l of t.emploi.lignes) { h(Math.floor(l.debut / 60), l.debut % 60); res.durees.push(l.fin - l.debut) }
  return res
}
function mesures1(q: Question): Mesures {
  const res: Mesures = { heures: [], durees: [] }
  const h = (hh: number, m: number): void => { res.heures.push({ h: hh, m }) }
  if (q.type === 'lire' || q.type === 'placer') { h(q.h, q.m); if (q.type === 'lire') q.options?.forEach(o => h(o.h, o.m)) }
  if (q.type === 'journee') { h(q.h24, q.m); q.options?.forEach(o => h(o.h, o.m)) }
  if (q.type === 'duree') { h(q.h24, q.m); h(q.h24f, q.m2); res.durees.push(q.d) }
  if (q.type === 'conversion') res.durees.push(q.valeurs.length === 2 ? q.valeurs[0] * 60 + q.valeurs[1] : q.valeurs[0])
  if (q.type === 'emploi') q.emploi.forEach(l => { h(Math.floor(l.debut / 60), l.debut % 60); res.durees.push(l.fin - l.debut) })
  return res
}

/** Ce qui sort du programme du niveau : une précision ou une heure au-delà de 12 que le niveau ne lit pas. */
export function ecartsAuProgramme(x: readonly Question[] | Tirage, contraintes: Contraintes): string[] {
  const ecarts: string[] = []
  const pas = contraintes.heure ? PAS[contraintes.heure] : undefined
  if (!pas) return contraintes.heure ? [] : ['heure : pas au programme du niveau']
  const { heures, durees } = mesures(x)
  for (const { h, m } of heures) {
    if (m % pas) ecarts.push(`${ecrit(h, m)} : précision « ${contraintes.heure} »`)
    if (contraintes.heureMax12 && h > 12) ecarts.push(`${ecrit(h, m)} : heure > 12`)
  }
  for (const d of durees) if (d % pas) ecarts.push(`durée ${ecritDuree(d)} : précision « ${contraintes.heure} »`)
  return [...new Set(ecarts)]
}

/**
 * Ce que la fiche montre hors du programme du niveau : au CP (heures entières), ni case pour les minutes (« __ h », pas « __ h __ »)
 * ni minutes écrites autour du cadran.
 */
export function ecartsFiche(html: string, contraintes: Contraintes): string[] {
  if (contraintes.heure !== 'entiere') return []
  const ecarts: string[] = []
  if (/h\s*_{2,}/.test(html)) ecarts.push('case des minutes alors que le niveau ne lit que les heures entières')
  if (html.includes('font-size="11"')) ecarts.push('minutes écrites autour du cadran alors que le niveau ne lit que les heures entières')
  return ecarts
}
