// Les fractions — une fonction par type de question (pur : rng et T viennent du contexte ; aucun Math.random).
// Contexte ctx : { rng, T, niv, mode } — niv : données du niveau (generateur.ts), mode : 'unitaires' | 'toutes'.
// Chaque question porte `fractions` (les fractions demandées ou affichées, hors propositions : ecartsAuProgramme).
// L'ordre des tirages est celui de l'ancienne vue : même flux de hasard, mêmes fiches.
import type { Rng } from '../../utils/hasard.ts'
import type { Traducteur } from '../../noyau/types.ts'
import type { CleContenu } from '../../langues/catalogue.ts'
import { formeDisque, formeRectangle, formeBarre } from './formes.ts'
import type { Forme } from './formes.ts'
import { droiteFraction, svgDroiteFraction } from './droite.ts'
import type { DroiteFraction } from './droite.ts'
import type { CONTENU } from './textes.ts'

type T = Traducteur<CleContenu<typeof CONTENU>>

export interface Fraction { n: number, d: number }
export type Mode = 'unitaires' | 'toutes'
export type TypeQuestion = 'identifier' | 'colorier' | 'lettres' | 'partDe' | 'egales' | 'droite' | 'placer'

/** Données d'un niveau (programme : fractions ≤ 1 au cycle 2, dénominateurs 2, 3, 4, 5, 6, 8, 10). */
export interface DonneesNiveau {
  denominateurs: readonly number[]
  /** droite graduée de 0 à 1 (fractions ≤ 1), CE2 seulement */
  droiteUnites?: readonly number[]
  /** « la moitié de 8 » (calcul mental du cycle 2) : totaux possibles par dénominateur ; le tiers ou le quart d'une quantité est du CM1 */
  partDe: Readonly<Record<number, { max: number, extra: readonly number[] }>>
}
export interface Contexte { rng: Rng, T: T, niv: DonneesNiveau, mode: Mode }

/** Ce que toute question porte. `cle` : ce qui rend deux questions identiques ; `libelle` : le tableau de correction. */
interface Base {
  cle: string
  /** les fractions demandées ou affichées (hors propositions) */
  fractions: Fraction[]
  consigne: string
  libelle: string
  attendu: string
  fracConsigne?: Fraction
  consigneFin?: string
}
/** Un QCM : écrit en fractions (`frac`) ou en lettres (`lettres`). */
export interface QChoix extends Base {
  kind: 'choix'
  type: 'identifier' | 'lettres' | 'egales' | 'droite'
  choixEn: 'frac' | 'lettres'
  reponse: Fraction
  choix: Fraction[]
  forme?: Forme
  colorees?: number[]
  fracAffichee?: Fraction
  texte?: string
  svg?: string
  droite?: DroiteFraction
}
/** Colorier des parts : on touche les parts, la réponse est leur nombre. */
export interface QParts extends Base { kind: 'parts', type: 'colorier', reponse: Fraction, forme: Forme }
/** Un nombre à écrire. */
export interface QNombre extends Base {
  kind: 'nombre'
  type: 'partDe' | 'egales'
  reponse: number
  texte?: string
  jetons?: string | null
  forme?: Forme
  colorees?: number[]
  formeAide?: Forme
  egalite?: { gauche: Fraction, droite: { n: string, d: number } }
}
/** Placer une fraction : on touche une graduation de la droite. */
export interface QPlacer extends Base { kind: 'placer', type: 'placer', reponse: Fraction, droite: DroiteFraction }
export type Question = QChoix | QParts | QNombre | QPlacer

export const cle = (f: Fraction): string => `${f.n}/${f.d}`
const egales = (a: Fraction, b: Fraction): boolean => a.n * b.d === b.n * a.d

// Les listes de textes sont des chaînes séparées par « | » (textes.ts)
const liste = (T: T, k: 'ordinaux' | 'nbParts'): string[] => T(k).split('|')
/** La fraction en lettres : « trois quarts », « tri c'hard ». */
export const enLettres = (T: T, f: Fraction): string => {
  const d = f.d
  if (d < 2 || d > 10) throw new Error(`fractions : dénominateur ${d} sans nom`)
  return T(`lettres.d${d as 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10}`).split('|')[f.n - 1]
}
/** L'ordinal en chiffres : « 1re », « 2e » ; « 1añ », « 2vet ». */
export const ordinal = (T: T, n: number): string => liste(T, 'ordinaux')[n]

function tirerFraction(rng: Rng, niv: DonneesNiveau, mode: Mode): Fraction {
  const d = rng.choisir(niv.denominateurs)
  if (mode === 'unitaires' || d === 2 || rng.vrai(0.35)) return { n: 1, d }
  return { n: rng.entier(2, d - 1), d }
}

const tirerForme = (rng: Rng, d: number): Forme => rng.choisir([formeDisque, formeRectangle, formeBarre])(d)

// Quelles parts sont coloriées : souvent à la suite, parfois dispersées
function partsColoriees(rng: Rng, n: number, d: number): number[] {
  if (rng.vrai(0.6)) {
    const debut = rng.entier(0, d - 1)
    return Array.from({ length: n }, (_, i) => (debut + i) % d)
  }
  return rng.melanger(Array.from({ length: d }, (_, i) => i)).slice(0, n)
}

// Distracteurs : erreurs typiques (coloriées / non coloriées, non coloriées / total, inversion)
function distracteursFraction(rng: Rng, f: Fraction, niv: DonneesNiveau, nb = 3): Fraction[] {
  const { n, d } = f
  const candidats = rng.melanger([
    { n, d: d - n },          // parts coloriées sur parts blanches
    { n: d - n, d },          // parts blanches
    { n: d, d: n },           // inversion
  ]).concat(rng.melanger([
    { n, d: d + 1 }, { n, d: d - 1 }, { n: n + 1, d }, { n: n - 1, d }, { n: 1, d: n + d },
  ]))
  const res: Fraction[] = []
  for (const c of candidats) {
    if (c.n < 1 || c.n === c.d || c.n > 10 || !niv.denominateurs.includes(c.d)) continue
    if (egales(c, f) || res.some(r => cle(r) === cle(c))) continue
    res.push(c)
    if (res.length === nb) return res
  }
  let essais = 0
  while (res.length < nb && essais++ < 200) {
    const dd = rng.choisir(niv.denominateurs)
    const c = { n: rng.entier(1, dd - 1), d: dd }
    if (!egales(c, f) && !res.some(r => cle(r) === cle(c))) res.push(c)
  }
  return res
}

export function genIdentifier({ rng, T, niv, mode }: Contexte): QChoix {
  const f = tirerFraction(rng, niv, mode)
  const forme = tirerForme(rng, f.d)
  const colorees = partsColoriees(rng, f.n, f.d)
  return {
    type: 'identifier', kind: 'choix', choixEn: 'frac', cle: `id${cle(f)}${forme.type}${colorees.join('-')}`, fractions: [f],
    consigne: T('cIdentifier'),
    forme, colorees, reponse: f, choix: rng.melanger([f, ...distracteursFraction(rng, f, niv)]),
    libelle: `${T(forme.type)} : ${T('partsColoriees', { n: f.n, d: f.d })}`,
    attendu: `${cle(f)} (${enLettres(T, f)})`,
  }
}

export function genColorier({ rng, T, niv, mode }: Contexte): QParts {
  const f = tirerFraction(rng, niv, mode)
  const forme = tirerForme(rng, f.d)
  return {
    type: 'colorier', kind: 'parts', cle: `co${cle(f)}${forme.type}`, fractions: [f],
    consigne: T('cColorie'), fracConsigne: f, consigneFin: T('cColorieFin', { l: enLettres(T, f) }),
    forme, reponse: f,
    libelle: T('libColorier', { f: cle(f) }), attendu: T('partsSur', { n: f.n, d: f.d }),
  }
}

export function genLettres({ rng, T, niv, mode }: Contexte): QChoix {
  const f = tirerFraction(rng, niv, mode)
  // distracteurs : vraies fractions, pour ne pas montrer d'écriture fausse
  const autres = distracteursFraction(rng, f, niv).filter(c => niv.denominateurs.includes(c.d) && c.n <= 9)
  while (autres.length < 3) {
    const dd = rng.choisir(niv.denominateurs)
    const c = { n: rng.entier(1, dd - 1), d: dd }
    if (!egales(c, f) && !autres.some(r => cle(r) === cle(c))) autres.push(c)
  }
  const choix = rng.melanger([f, ...autres.slice(0, 3)])
  if (rng.vrai(0.5)) {
    return {
      type: 'lettres', kind: 'choix', choixEn: 'lettres', cle: `le${cle(f)}`, fractions: [f],
      consigne: T('cSeLit'), fracAffichee: f, reponse: f, choix,
      libelle: T('libEnLettres', { f: cle(f) }), attendu: enLettres(T, f),
    }
  }
  return {
    type: 'lettres', kind: 'choix', choixEn: 'frac', cle: `lc${cle(f)}`, fractions: [f],
    consigne: T('cEcrite'), texte: enLettres(T, f), reponse: f, choix,
    libelle: enLettres(T, f), attendu: cle(f),
  }
}

// Jetons ronds à partager (aide visuelle)
function svgJetons(total: number): string {
  const parLigne = total <= 12 ? total : Math.ceil(total / 2) <= 12 ? Math.ceil(total / 2) : 10
  const lignes = Math.ceil(total / parLigne)
  const e = 30
  let s = ''
  for (let i = 0; i < total; i++) {
    const x = 18 + (i % parLigne) * e, y = 18 + Math.floor(i / parLigne) * e
    s += `<circle cx="${x}" cy="${y}" r="11" fill="#fde3b8" stroke="#c77c00" stroke-width="2"/>`
  }
  const w = parLigne * e + 6, h = lignes * e + 6
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" style="max-width:100%;height:auto;">${s}</svg>`
}

// « La moitié de 8 » : calcul mental du cycle 2 (la fraction opérateur est au programme du CM1)
export function genPartDe({ rng, T, niv }: Contexte): QNombre {
  const ds = Object.keys(niv.partDe).map(Number)
  const d = rng.choisir(ds)
  const cfg = niv.partDe[d]
  const possibles: number[] = []
  for (let t = 2 * d; t <= cfg.max; t += d) possibles.push(t)
  const totaux = rng.vrai(0.8) || !cfg.extra.length ? possibles : cfg.extra
  const total = rng.choisir(totaux)
  const rep = total / d
  const nom = T(`partDe.d${d as 2 | 3 | 4 | 5 | 10}`)
  const texte = T('partDeTexte', { nom, total })
  return {
    type: 'partDe', kind: 'nombre', cle: `pd${d}-${total}`, fractions: [],
    consigne: T('partDeConsigne', { nom, parts: liste(T, 'nbParts')[d] }),
    texte, jetons: total <= 24 ? svgJetons(total) : null, reponse: rep,
    libelle: T('partDeLibelle', { nom, total }), attendu: `${rep} (${Array(d).fill(rep).join(' + ')} = ${total})`,
  }
}

// ─── CE2 : fractions égales simples (1/2 = 2/4) ───
export function genEgales({ rng, T, niv }: Contexte): QNombre | QChoix {
  const bases: [Fraction, number][] = []
  for (const d of [2, 3, 4, 5]) for (let n = 1; n < d; n++) for (let m = 2; m * d <= 10; m++) {
    if (niv.denominateurs.includes(m * d)) bases.push([{ n, d }, m])
  }
  const [f, m] = rng.choisir(bases)
  const g = { n: f.n * m, d: f.d * m }
  const forme = formeBarre(f.d)
  const colorees = Array.from({ length: f.n }, (_, i) => i)
  if (rng.vrai(0.5)) {
    return {
      type: 'egales', kind: 'nombre', cle: `egn${cle(f)}-${g.d}`, fractions: [f, g],
      consigne: T('cEgalesNombre'), forme, colorees, formeAide: formeBarre(g.d),
      egalite: { gauche: f, droite: { n: '?', d: g.d } }, reponse: g.n,
      libelle: `${cle(f)} = ?/${g.d}`, attendu: `${cle(f)} = ${cle(g)}`,
    }
  }
  // distracteurs : erreur « additive » (1/2 → 2/3), numérateur seul ou dénominateur seul multiplié
  const candidats = rng.melanger([
    { n: f.n + 1, d: f.d + 1 }, { n: f.n + m, d: f.d + m }, { n: f.n, d: g.d }, { n: g.n, d: g.d + 1 },
    { n: g.n, d: f.d + m }, { n: f.d * m - g.n === g.n ? g.n + 1 : f.d * m - g.n, d: g.d },
  ])
  const choix = [g]
  for (const c of candidats) {
    if (choix.length === 4) break
    if (c.n < 1 || c.n >= c.d || !niv.denominateurs.includes(c.d)) continue
    if (egales(c, f) || choix.some(x => cle(x) === cle(c))) continue
    choix.push(c)
  }
  let essais = 0
  while (choix.length < 4 && essais++ < 200) {
    const dd = rng.choisir(niv.denominateurs)
    const c = { n: rng.entier(1, dd - 1), d: dd }
    if (!egales(c, f) && !choix.some(x => cle(x) === cle(c))) choix.push(c)
  }
  return {
    type: 'egales', kind: 'choix', choixEn: 'frac', cle: `egc${cle(f)}-${g.d}`, fractions: [f, g],
    consigne: T('cEgalesChoix'), fracConsigne: f, consigneFin: ' ?', forme, colorees,
    reponse: g, choix: rng.melanger(choix),
    libelle: T('libEgale', { f: cle(f) }), attendu: `${cle(g)} (${cle(f)} = ${cle(g)})`,
  }
}

// ─── CE2 : droite graduée en fractions ───
function tirerPointDroite(rng: Rng, niv: DonneesNiveau): { dr: DroiteFraction, f: Fraction } {
  const unites = rng.choisir(niv.droiteUnites ?? [1])
  const dens = niv.denominateurs.filter(d => d * unites <= 12)   // graduations assez larges pour un doigt
  const d = rng.choisir(dens)
  let k: number
  do { k = rng.entier(1, unites * d - 1) } while (k % d === 0)
  return { dr: droiteFraction(unites, d), f: { n: k, d } }
}

export function genDroite({ rng, T, niv }: Contexte): QChoix {
  const { dr, f } = tirerPointDroite(rng, niv)
  const candidats = rng.melanger([
    { n: f.n, d: dr.unites * dr.d },  // compte toutes les graduations
    { n: f.n + 1, d: f.d }, { n: f.n - 1, d: f.d }, { n: f.n, d: f.d + 1 }, { n: f.d, d: f.n },
  ])
  const choix = [f]
  for (const c of candidats) {
    if (choix.length === 4) break
    if (c.n < 1 || c.n > c.d * dr.unites || !niv.denominateurs.includes(c.d) || c.n === c.d || egales(c, f) || choix.some(x => cle(x) === cle(c))) continue
    choix.push(c)
  }
  let essais = 0
  while (choix.length < 4 && essais++ < 200) {
    const dd = rng.vrai(0.6) ? f.d : rng.choisir(niv.denominateurs)
    const c = { n: rng.entier(1, dr.unites * dd - 1), d: dd }
    if (c.n !== c.d && !egales(c, f) && !choix.some(x => cle(x) === cle(c))) choix.push(c)
  }
  return {
    type: 'droite', kind: 'choix', choixEn: 'frac', cle: `dr${dr.unites}-${cle(f)}`, fractions: [f],
    consigne: T('cDroite', { d: dr.d }),
    svg: svgDroiteFraction(dr, { fleche: f.n }), droite: dr, reponse: f, choix: rng.melanger(choix),
    libelle: T('libDroite', { u: dr.unites }), attendu: cle(f),
  }
}

export function genPlacer({ rng, T, niv }: Contexte): QPlacer {
  const { dr, f } = tirerPointDroite(rng, niv)
  return {
    type: 'placer', kind: 'placer', cle: `pl${dr.unites}-${cle(f)}`, fractions: [f],
    consigne: T('cPlacer'), fracConsigne: f, consigneFin: T('cPlacerFin'),
    droite: dr, reponse: f,
    libelle: T('libPlacer', { f: cle(f), u: dr.unites }), attendu: T('graduationApres0', { o: ordinal(T, f.n) }),
  }
}
