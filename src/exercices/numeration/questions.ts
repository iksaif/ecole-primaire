// Les nombres — une fonction par type de question (pur : rng et T viennent du contexte ; aucun Math.random).
// Contexte : { rng, T, niv, max } — niv : données du niveau (generateur.ts), max : plus grand nombre tiré (la plage).
// Chaque question porte `valeurs` (tous les nombres en jeu : ecartsAuProgramme) et, si elle écrit un nombre en lettres,
// `enLettres: true`. `cle` : ce qui fait deux questions « la même » (jamais deux fois dans une partie ou sur une fiche).
// L'ordre des tirages est celui de l'ancienne vue : mêmes questions, mêmes fiches à graine égale (tests/instantanes).
import type { Traducteur } from '../../noyau/types.ts'
import type { Rng } from '../../utils/hasard.ts'
import type { CleContenu } from '../../langues/catalogue.ts'
import { donneesRegionales, estLangue } from '../../langues/registre.ts'
import { enLettresFr } from '../../langues/fr/nombres.ts'
import { svgBase10 } from '../../dessins/base10.ts'
import { svgDroiteNombres } from './droite.ts'
import type { CONTENU } from './textes.ts'

type Cle = CleContenu<typeof CONTENU>

/** Les unités de numération, de la plus grande à la plus petite : les cases de « décompose le nombre ». */
export type Champ = 'milliers' | 'centaines' | 'dizaines' | 'unites'
const CHAMPS: readonly Champ[] = ['milliers', 'centaines', 'dizaines', 'unites']
/** Les chiffres d'un nombre rangés par unité de numération (seulement les champs de la plage). */
export type Chiffres = Partial<Record<Champ, number>>

/** Données d'un niveau : pas des droites graduées et des suites, nombre de nombres à ranger, plus grand nombre écrit en lettres (CP : cinquante). */
export interface DonneesNiveau {
  pasDroite: Readonly<Record<number, readonly number[]>>
  pasSuites?: Readonly<Record<number, readonly number[]>>
  pasPlusMoins?: Readonly<Record<number, readonly number[]>>
  nbRanger: number
  lettresMax?: number
}

export interface Contexte { rng: Rng, T: Traducteur<Cle>, niv: DonneesNiveau, max: number }

// ── Les questions ──
interface Commune { cle: string, valeurs: number[], enLettres?: boolean, consigne: string, texte: string, texteLong?: boolean, libelle: string, attendu: string }
/** Décomposer un nombre : une case par unité de numération. */
export interface QDecomposerCdu extends Commune { type: 'decomposer', kind: 'cdu', champs: readonly Champ[], reponse: Chiffres }
/** Réponse : un nombre (recomposer, représentation, lettres → chiffres, suites, droite). */
export interface QNombre extends Commune {
  type: 'decomposer' | 'representation' | 'lettresChiffres' | 'suites' | 'droite', kind: 'nombre', reponse: number
  /** matériel de base 10 ou droite graduée */
  svg?: string
  /** (représentation) il y a des gros cubes : la légende les nomme */
  milliers?: boolean
  /** (suite à compléter) les termes et le rang du terme caché */
  termes?: number[]
  trou?: number
  /** (droite) début, pas et rang de la graduation montrée */
  debut?: number
  pas?: number
  k?: number
}
/** Réponse : une proposition (écriture en lettres, signe de comparaison). */
export interface QChoix extends Commune { type: 'chiffresLettres' | 'comparer', kind: 'choix', reponse: string, choix: string[] }
/** Réponse : les nombres cliqués du plus petit au plus grand. */
export interface QOrdre extends Commune { type: 'ranger', kind: 'ordre', nombres: number[], reponse: number[] }
export type Question = QDecomposerCdu | QNombre | QChoix | QOrdre

// 10 000 s'écrit avec une espace ; en dessous on garde 3 400 sans espace (plus simple à recopier)
export const fmt = (n: number): string => (n >= 10000 ? String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : String(n))

/** Les nombres en lettres dans la langue du contenu (le français si la langue n'en a pas). */
export const enLettres = (T: Traducteur<Cle>, n: number): string => {
  const code = T('langue')
  return (estLangue(code) ? donneesRegionales(code)?.enLettres : undefined)?.(n) ?? enLettresFr(n)
}
/** « 3 centaines » : le nom de l'unité, accordé selon le nombre (pluriel du catalogue). */
export const libCdu = (T: Traducteur<Cle>, v: number, champ: Champ): string => T(`cdu.${champ}` as Cle, { n: v })

const decomposer = (n: number): Record<Champ, number> => ({
  milliers: Math.floor(n / 1000) % 10, centaines: Math.floor(n / 100) % 10, dizaines: Math.floor(n / 10) % 10, unites: n % 10,
})

const nbChiffres = (max: number): number => (max <= 100 ? 2 : max <= 1000 ? 3 : 4)
export const champsPour = (max: number): readonly Champ[] => CHAMPS.slice(4 - nbChiffres(max))
const chiffresDe = (n: number): number[] => String(n).split('').map(Number)

interface OptionsNombre { zeros?: boolean, dizainesDifficiles?: number }

// Tire un nombre « intéressant » ayant le nombre de chiffres de la plage,
// avec régulièrement des 0 (305, 340, 4 060) et des dizaines 70/80/90.
function tirerNombre(rng: Rng, max: number, { zeros = true, dizainesDifficiles = 0.2 }: OptionsNombre = {}): number {
  const k = nbChiffres(max)
  const ch = [rng.entier(1, 9), ...Array.from({ length: k - 1 }, () => rng.entier(0, 9))]
  if (rng.vrai(dizainesDifficiles)) ch[k - 2] = rng.entier(7, 9)
  if (zeros) {
    if (k === 2 && rng.vrai(0.15)) ch[1] = 0
    if (k >= 3 && rng.vrai(0.3)) ch[rng.entier(1, k - 1)] = 0
    if (k === 4 && rng.vrai(0.15)) ch[rng.entier(1, k - 1)] = 0
  }
  return +ch.join('')
}

// Nombre à écrire en lettres : au CP, pas au-delà de `lettresMax` (50) ; sinon tiré comme les autres
function tirerNombreEnLettres({ rng, niv, max }: Contexte, options: OptionsNombre): number {
  return niv.lettresMax && max > niv.lettresMax ? rng.entier(10, niv.lettresMax) : tirerNombre(rng, max, options)
}

/** Les pas d'un niveau pour une plage : une donnée manquante est une erreur de déclaration, pas un tirage au sort. */
function pasDe(table: DonneesNiveau['pasDroite'] | undefined, max: number, nom: string): readonly number[] {
  const pas = table?.[max]
  if (!pas?.length) throw new Error(`numération : aucun ${nom} pour la plage ${max}`)
  return pas
}

export function genDecomposer({ rng, T, max }: Contexte): QDecomposerCdu | QNombre {
  const n = tirerNombre(rng, max)
  const dec = decomposer(n)
  const champs = champsPour(max)
  const reponse: Chiffres = Object.fromEntries(champs.map(ch => [ch, dec[ch]]))
  const chiffre = (ch: Champ): number => reponse[ch] ?? 0
  const attendu = champs.map(ch => libCdu(T, chiffre(ch), ch)).join(' ')
  const noms = champs.map(ch => T(`lib.${ch}` as Cle))
  if (rng.vrai(0.5)) {
    return {
      type: 'decomposer', kind: 'cdu', cle: `dec${n}`, valeurs: [n],
      consigne: T('cDecomposer', { liste: `${noms.slice(0, -1).join(', ')} ${T('et')} ${noms[noms.length - 1]}` }),
      texte: fmt(n), champs, reponse,
      libelle: `${fmt(n)} = ?`, attendu,
    }
  }
  // Recomposer : on omet les termes nuls (piège : 3 centaines + 7 unités = 307)
  let termes = champs.filter(ch => chiffre(ch)).map(ch => libCdu(T, chiffre(ch), ch))
  if (termes.length > 1 && rng.vrai(0.3)) termes = rng.melanger(termes)
  const texte = termes.join(' + ')
  return {
    type: 'decomposer', kind: 'nombre', cle: `rec${texte}`, valeurs: [n],
    consigne: T('cEcrisNombre'), texte, texteLong: true, reponse: n,
    libelle: `${texte} = ?`, attendu: fmt(n),
  }
}

export function genRepresentation({ rng, T, max }: Contexte): QNombre {
  const n = tirerNombre(rng, max, { dizainesDifficiles: 0 })
  const { milliers: m, centaines: c } = decomposer(n)
  let { dizaines: d, unites: u } = decomposer(n)
  // Parfois plus de 9 cubes : il faut faire un échange (1 dizaine = 10 unités)
  if (rng.vrai(0.2) && d >= 1 && u <= 4) { d -= 1; u += 10 }
  const morceau = (v: number, nom: string): string => T(`base10.${nom}` as Cle, { n: v })
  const morceaux: string[] = []
  if (m) morceaux.push(morceau(m, 'millier'))
  if (c) morceaux.push(morceau(c, 'centaine'))
  morceaux.push(morceau(d, 'dizaine'), morceau(u, 'unite'))
  return {
    type: 'representation', kind: 'nombre', cle: `rep${m}-${c}-${d}-${u}`, valeurs: [n],
    consigne: T('cRepresente'), texte: '', reponse: n, milliers: m > 0 || max > 1000,
    svg: svgBase10(m, c, d, u), libelle: morceaux.join(', '), attendu: fmt(n),
  }
}

export function genLettresChiffres(ctx: Contexte): QNombre {
  const { T } = ctx
  const n = tirerNombreEnLettres(ctx, { dizainesDifficiles: 0.35 })
  const texte = enLettres(T, n)
  return {
    type: 'lettresChiffres', kind: 'nombre', cle: `lc${n}`, valeurs: [n], enLettres: true,
    consigne: T('cEnChiffres'), texte, texteLong: true, reponse: n,
    libelle: texte, attendu: fmt(n),
  }
}

// Distracteurs plausibles pour l'écriture en lettres
function distracteurs(rng: Rng, n: number, max: number, nb = 3): number[] {
  const ch = chiffresDe(n), k = ch.length
  const d = ch[k - 2]
  const ok = (v: number): boolean => Number.isInteger(v) && v >= 10 && v <= max && v !== n
  const pieges: number[] = []
  if (d === 7 || d === 9) pieges.push(n - 10)          // soixante-quinze / soixante-cinq
  if (d === 6 || d === 8) pieges.push(n + 10)          // soixante-cinq / soixante-quinze
  if (d === 8) pieges.push(n - 60)                     // quatre-vingt-deux / vingt-deux
  if (d === 2) pieges.push(n + 60)
  // 0 mal placé : 2 030 / 2 300 / 2 003
  for (let i = 1; i < k; i++) for (let j = 1; j < k; j++) {
    if (i !== j && ch[i] === 0 && ch[j] !== 0) {
      const tab = [...ch];
      [tab[i], tab[j]] = [tab[j], tab[i]]
      pieges.push(+tab.join(''))
    }
  }
  // chiffres échangés
  const perms: number[] = []
  for (let i = 0; i < k; i++) for (let j = i + 1; j < k; j++) {
    const tab = [...ch];
    [tab[i], tab[j]] = [tab[j], tab[i]]
    if (tab[0] !== 0) perms.push(+tab.join(''))
  }
  const voisins = [n + 10, n - 10, n + 1, n - 1]
  if (k >= 3) voisins.push(n + 100, n - 100)
  if (k >= 4) voisins.push(n + 1000, n - 1000)
  const res: number[] = []
  for (const v of [...rng.melanger(pieges), ...rng.melanger(perms), ...rng.melanger(voisins)]) {
    if (ok(v) && !res.includes(v)) res.push(v)
    if (res.length === nb) break
  }
  let essais = 0
  while (res.length < nb && essais++ < 100) {
    const v = rng.entier(10, max - 1)
    if (ok(v) && !res.includes(v)) res.push(v)
  }
  return res
}

export function genChiffresLettres(ctx: Contexte): QChoix {
  const { rng, T, niv, max } = ctx
  const n = tirerNombreEnLettres(ctx, { dizainesDifficiles: 0.4 })
  const bonne = enLettres(T, n)
  const dist = distracteurs(rng, n, niv.lettresMax ?? max)
  const choix = rng.melanger([bonne, ...dist.map(v => enLettres(T, v))])
  return {
    type: 'chiffresLettres', kind: 'choix', cle: `cl${n}`, valeurs: [n, ...dist], enLettres: true,
    consigne: T('cEnLettres'), texte: fmt(n), reponse: bonne, choix,
    libelle: fmt(n), attendu: bonne,
  }
}

export function genComparer({ rng, T, max }: Contexte): QChoix {
  const a = tirerNombre(rng, max, { dizainesDifficiles: 0 })
  const ch = chiffresDe(a), k = ch.length
  let b: number
  const r = rng()
  if (r < 0.1) b = a
  else if (r < 0.35) {                                                   // deux chiffres échangés
    const i = rng.entier(Math.min(1, k - 2), k - 2), tab = [...ch];
    [tab[i], tab[i + 1]] = [tab[i + 1], tab[i]]
    b = +tab.join('')
  } else if (r < 0.6) b = a - a % 10 + rng.entier(0, 9)                      // même dizaine
  else if (r < 0.75 && k > 2) b = tirerNombre(rng, Math.pow(10, k - 1))        // un chiffre de moins
  else b = a - a % Math.pow(10, k - 1) + rng.entier(0, Math.pow(10, k - 1) - 1)  // même premier chiffre
  if (b < 1 || (b === a && r >= 0.1)) b = a + (rng.vrai(0.5) ? 1 : 10)
  if (b > max) b = a - 1
  const [x, y] = rng.vrai(0.5) ? [a, b] : [b, a]
  const reponse = x < y ? '<' : x > y ? '>' : '='
  return {
    type: 'comparer', kind: 'choix', cle: `cmp${x}-${y}`, valeurs: [x, y],
    consigne: T('cSigne'), texte: `${fmt(x)}  …  ${fmt(y)}`, reponse, choix: ['<', '=', '>'],
    libelle: `${fmt(x)} … ${fmt(y)}`, attendu: `${fmt(x)} ${reponse} ${fmt(y)}`,
  }
}

export function genSuites({ rng, T, niv, max }: Contexte): QNombre {
  const r = rng()
  if (r < 0.2) {
    // juste après / juste avant, souvent sur un passage de dizaine, centaine ou millier
    const apres = rng.vrai(0.5)
    let n = tirerNombre(rng, max, { zeros: false, dizainesDifficiles: 0 })
    if (rng.vrai(0.5)) n = apres ? n - n % 10 + 9 : n - n % 10
    if (max > 100 && rng.vrai(0.3)) n = apres ? n - n % 100 + 99 : n - n % 100
    if (max > 1000 && rng.vrai(0.3)) n = apres ? n - n % 1000 + 999 : n - n % 1000
    if (n < 1) n = 10
    const rep = apres ? n + 1 : n - 1
    const texte = T(apres ? 'justeApres' : 'justeAvant', { n: fmt(n) })
    return {
      type: 'suites', kind: 'nombre', cle: `sv${texte}`, valeurs: [n, rep], consigne: T('cTrouve'),
      texte, texteLong: true, reponse: rep, libelle: texte, attendu: fmt(rep),
    }
  }
  if (r < 0.45) {
    // + 10, − 10, + 100, − 100, + 1000… souvent avec un passage (395 + 10, 305 − 10, 3 950 + 100)
    const pas = rng.choisir(pasDe(niv.pasPlusMoins, max, '± 10, ± 100'))
    const plus = rng.vrai(0.5)
    const bloc = pas * 10
    const passage = bloc < max && rng.vrai(0.5)
    let n: number
    if (plus) n = passage ? bloc * rng.entier(0, max / bloc - 2) + (bloc - pas) + rng.entier(0, pas - 1) : rng.entier(1, max - pas)
    else n = passage ? bloc * rng.entier(1, max / bloc - 1) + rng.entier(0, pas - 1) : rng.entier(pas, max)
    const rep = plus ? n + pas : n - pas
    const texte = `${fmt(n)} ${plus ? '+' : '−'} ${fmt(pas)} = ?`
    return {
      type: 'suites', kind: 'nombre', cle: `pm${texte}`, valeurs: [n, pas, rep], consigne: T('cCalcule'),
      texte, reponse: rep, libelle: texte, attendu: fmt(rep),
    }
  }
  // Suite à compléter
  const pas = rng.choisir(pasDe(niv.pasSuites, max, 'pas de suite'))
  const nbTermes = 5
  const etendue = pas * (nbTermes - 1)
  let debut: number
  if (pas >= 10 && pas * 10 >= max) debut = (pas / 10) * rng.entier(0, (max - etendue) / (pas / 10))  // 200, 300… ou 250, 350…
  else if (pas >= 10) {
    // passage : 370, 380, 390, 400… ou 375, 385, 395, 405…
    const bloc = pas * 10
    const cible = bloc * rng.entier(1, max / bloc - 1)
    debut = cible - pas * rng.entier(1, nbTermes - 2) - (rng.vrai(0.4) ? rng.entier(1, 9) * (pas / 10) : 0)
  } else {
    // pas de 1, 2 ou 5 : passage de dizaine (58, 59, 60…) ou de centaine (398, 399, 400…)
    const bloc = max > 100 && rng.vrai(0.4) ? 100 : 10
    const cible = bloc * rng.entier(1, max / bloc - 1)
    debut = cible - pas * rng.entier(1, nbTermes - 2)
  }
  debut = Math.max(0, Math.min(debut, max - etendue))
  const termes = Array.from({ length: nbTermes }, (_, i) => debut + i * pas)
  if (rng.vrai(0.25)) termes.reverse()
  const trou = rng.entier(1, nbTermes - 1)
  const rep = termes[trou]
  const texte = termes.map((v, i) => (i === trou ? '?' : fmt(v))).join(', ')
  return {
    type: 'suites', kind: 'nombre', cle: `su${texte}`, valeurs: termes,
    consigne: T('cSuite'), texte, texteLong: true, reponse: rep, termes, trou, libelle: texte, attendu: fmt(rep),
  }
}

export function genDroite({ rng, T, niv, max }: Contexte): QNombre {
  const pas = rng.choisir(pasDe(niv.pasDroite, max, 'pas de droite'))
  const etendue = 10 * pas
  const debut = etendue * rng.entier(0, max / etendue - 1)
  const k = rng.entier(1, 9)
  const rep = debut + k * pas
  return {
    type: 'droite', kind: 'nombre', cle: `dr${debut}-${pas}-${k}`, valeurs: [debut, debut + etendue],
    consigne: T('cDroite', { pas: fmt(pas) }),
    texte: '', svg: svgDroiteNombres(debut, pas, k, fmt), reponse: rep,
    debut, pas, k,
    libelle: T('libDroite', { a: fmt(debut), b: fmt(debut + etendue) }), attendu: fmt(rep),
  }
}

export function genRanger({ rng, T, niv, max }: Contexte): QOrdre {
  const nb = niv.nbRanger
  const vus = new Set<number>()
  const base = tirerNombre(rng, max, { dizainesDifficiles: 0 })
  vus.add(base)
  const ch = chiffresDe(base), k = ch.length
  // deux derniers chiffres inversés (piège classique : 352 / 325)
  const tab = [...ch];
  [tab[k - 2], tab[k - 1]] = [tab[k - 1], tab[k - 2]]
  const inv = +tab.join('')
  if (inv >= 10 && inv <= max) vus.add(inv)
  const unite = Math.pow(10, k - 1)          // 10, 100 ou 1000
  const tete = ch[0]
  let essais = 0
  while (vus.size < nb && essais++ < 200) {
    let v: number
    if (k === 2) v = rng.entier(10, 99)
    else v = (rng.vrai(0.6) ? tete : rng.entier(Math.max(1, tete - 1), Math.min(9, tete + 1))) * unite + rng.entier(0, unite - 1)
    if (v >= 1 && v <= max) vus.add(v)
  }
  const nombres = rng.melanger([...vus])
  const reponse = [...nombres].sort((a, b) => a - b)
  return {
    type: 'ranger', kind: 'ordre', cle: `rg${reponse.join('-')}`, valeurs: nombres,
    consigne: T('cRanger'), texte: '', nombres, reponse,
    libelle: nombres.map(fmt).join(' ; '), attendu: reponse.map(fmt).join(' < '),
  }
}
