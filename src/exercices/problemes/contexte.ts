// Problèmes — le contexte d'un tirage : ce que les modèles d'énoncés (modeles-*.ts) utilisent pour tirer des prénoms, des objets et
// des nombres, et pour écrire un problème (énoncé, question, correction) avec les textes de la langue. Pur : lisible par node.
import type { Rng } from '../../utils/hasard.ts'
import type { Traducteur } from '../../noyau/types.ts'
import type { CleContenu } from '../../langues/catalogue.ts'
import type { CONTENU } from './textes.ts'

export type Cle = CleContenu<typeof CONTENU>
export type Params = Record<string, string | number>

/** Les catégories de problèmes (valeurs du réglage `categories`). */
export type Categorie = 'ajoutRetrait' | 'comparaison' | 'partiesTout' | 'multiplication' | 'partage' | 'foisPlus' | 'deuxEtapes'

export type Genre = 'm' | 'f'
export interface Personne { nom: string, g: Genre }
/** Un objet que l'on collectionne : noms au singulier et au pluriel dans la langue du contenu, et genre. */
export interface Objet { id: string, s: string, p: string, g: Genre }
/** L'unité d'une réponse : au singulier et au pluriel (le breton garde le singulier). */
export interface Unite { s: string, p: string }

/** Un problème tiré par un modèle : le texte, la question, la réponse attendue et son calcul. */
export interface Probleme { enonce: string, question: string, reponse: number, unite: Unite, calcul: string }

type Sous<K extends string, P extends string> = K extends `${P}${infer R}` ? R : never
/** Les identifiants d'énoncés du catalogue (`pb.<id>`). */
export type ClePb = Sous<Cle, 'pb.'>
type MotGenre = Sous<Cle, 'genre.m.'>
type NomUnite = Sous<Cle, 'unite.'>
type NomFrag = Sous<Cle, 'frag.'>

/** Les modèles d'une catégorie : `cap` est le plus grand nombre réaliste dans leur contexte (pas 900 passagers dans un bus). */
export interface Modele {
  cat: Categorie
  cap: number
  /** plus petit champ numérique où ce modèle a un sens (« 10 ou 100 paquets de feuilles » : grands nombres seulement) */
  min?: number
  /** niveaux où il est proposé (tous, par défaut) */
  niveaux?: readonly string[]
  /** Un problème, ou null si ce tirage ne convient pas (le tirage suivant en essaie un autre). `max` : le champ numérique de la série. */
  gen: (ctx: Contexte, tables: readonly number[], max: number) => Probleme | null
}

/** Les ids des objets et des paquets, dans l'ordre du catalogue (l'ordre est celui des tirages : il ne change pas). */
export const OBJETS = ['bille', 'carte', 'image', 'perle', 'autocollant', 'coquillage', 'bonbon', 'timbre'] as const
export const PAQUETS = ['gateau', 'image', 'carte', 'biscuit', 'crayon', 'bonbon'] as const
/** Les choses qui ont des parties : « Un vélo a 2 roues » (k parties). */
export const CHOSES_A_PARTIES = [
  { id: 'velo', k: 2 }, { id: 'tricycle', k: 3 }, { id: 'voiture', k: 4 },
  { id: 'chien', k: 4 }, { id: 'main', k: 5 }, { id: 'etoile', k: 5 },
] as const
export const PARENTS = ['p0', 'p1', 'p2', 'p3'] as const

// l'élision (« qu'Emma », « d'images ») : devant une voyelle ; « Hugo » garde « que » (h aspiré)
const VOYELLE = /^[aeiouyàâäéèêëîïôöùûüœ]/i

export class Contexte {
  readonly rng: Rng
  readonly T: Traducteur<Cle>
  constructor(rng: Rng, T: Traducteur<Cle>) {
    this.rng = rng
    this.T = T
  }

  // ── Textes ──

  /** Le nom commun `mot` accordé avec `n` (« 1 bille », « 3 billes » : le nom seul, sans le nombre). */
  nom(mot: NomUnite, n: number): string { return this.T(`unite.${mot}` as Cle, { n }) }
  /** « 3 pages » : le nombre et son nom commun. */
  nb(mot: NomUnite, n: number): string { return `${n} ${this.nom(mot, n)}` }
  /** L'unité d'une réponse, à garder dans la question : le texte est écrit au tirage, dans la langue du moment. */
  unite(mot: NomUnite): Unite { return { s: this.nom(mot, 1), p: this.nom(mot, 2) } }
  /** « 3 billes » pour un objet ou un paquet. */
  nbObjet(n: number, o: Pick<Objet, 's' | 'p'>): string { return `${n} ${n >= 2 ? o.p : o.s}` }
  /** Un morceau de phrase à pluriel : « 1 passager descend » / « 5 passagers descendent ». */
  frag(mot: NomFrag, n: number): string { return this.T(`frag.${mot}` as Cle, { n }) }

  private elide(famille: 'que' | 'de', mot: string): string {
    return this.T(`elision.${famille}.${VOYELLE.test(mot) ? 'voyelle' : 'consonne'}` as Cle, { mot })
  }
  /** « que Léo », « qu'Emma » (breton : « eget Léo »). */
  que(mot: string): string { return this.elide('que', mot) }
  /** « de billes », « d'images » (breton : le mot seul). */
  de(mot: string): string { return this.elide('de', mot) }

  /** Les mots qui suivent le genre (il/elle, « a » / « en deus »…), avec un suffixe pour distinguer deux personnes : il1, il2. */
  genre(g: Genre, suffixe = ''): Params {
    const mots: MotGenre[] = ['il', 'Il', 'deus', 'doa', 'gant', 'son', 'queLui', 'collection', 'anniversaire', 'maitre', 'Maitre', 'bleus', 'ils', 'eux']
    return Object.fromEntries(mots.map(m => [m + suffixe, this.T(`genre.${g}.${m}` as Cle)]))
  }
  /** Les paramètres d'un prénom : `p` (ou p1, p2) et ses mots de genre. */
  personne(p: Personne, suffixe = ''): Params { return { [`p${suffixe}`]: p.nom, ...this.genre(p.g, suffixe) } }

  // ── Tirages ──

  /** Un prénom, avec son genre. */
  prenom(): Personne { return this.lirePrenom(this.rng.choisir(this.T('prenoms').split('|'))) }
  /** Deux prénoms différents. */
  deuxPrenoms(): [Personne, Personne] {
    const [a, b] = this.rng.melanger(this.T('prenoms').split('|'))
    return [this.lirePrenom(a), this.lirePrenom(b)]
  }
  private lirePrenom(texte: string): Personne {
    const [nom, g] = texte.split(':')
    return { nom, g: g === 'f' ? 'f' : 'm' }
  }

  private lireObjet(famille: 'objet' | 'paquet', id: string): Objet {
    const cle = (champ: string): Cle => `${famille}.${id}.${champ}` as Cle
    return { id, s: this.T(cle('s')), p: this.T(cle('p')), g: famille === 'objet' && this.T(cle('g')) === 'f' ? 'f' : 'm' }
  }
  /** Les paramètres d'un objet : `o` (au pluriel) et `deO` (« de billes »). */
  texteObjet(o: Pick<Objet, 'p'>): Params { return { o: o.p, deO: this.de(o.p) } }
  /** Un objet que l'on collectionne (sauf ceux de `sauf`). */
  objet(sauf: readonly string[] = []): Objet { return this.lireObjet('objet', this.rng.choisir(OBJETS.filter(id => !sauf.includes(id)))) }
  /** Ce que contient un paquet. */
  paquet(): Objet { return this.lireObjet('paquet', this.rng.choisir(PAQUETS)) }

  /** Une chose à parties (« un vélo ») que la langue connaît, avec son nombre de parties ; `null` si aucune ne convient. */
  chose(max: number): { id: string, k: number, un: string, p: string, partie: string, partieS: string, g: Genre } | null {
    const connue = (id: string): boolean => this.T(`chose.${id}.un` as Cle) !== ''   // chaîne vide : pas proposé dans cette langue
    const ok = CHOSES_A_PARTIES.filter(c => 2 * c.k <= Math.max(max, 20) && connue(c.id))
    if (!ok.length) return null
    const { id, k } = this.rng.choisir(ok)
    const champ = (c: string): string => this.T(`chose.${id}.${c}` as Cle)
    return { id, k, un: champ('un'), p: champ('p'), partie: champ('partie'), partieS: champ('partieS'), g: champ('g') === 'f' ? 'f' : 'm' }
  }

  /** Un lien de parenté (« Sa maman ») : sujet, nom et accord de « âgé », au genre de l'enfant. */
  parent(enfant: Personne): { sujet: string, nom: string, accord: string } {
    const i = this.rng.choisir(PARENTS)
    const [sujet, nom, accord] = this.T(`${enfant.g === 'f' ? 'parentF' : 'parent'}.${i}` as Cle).split(':')
    return { sujet, nom, accord }
  }

  /** Deux nombres a, b avec a + b ≤ max, ni trop petits ni triviaux. */
  somme(max: number): [number, number] {
    const lo = max <= 20 ? 2 : max <= 100 ? Math.max(3, Math.round(max / 10)) : 40
    const a = this.rng.entier(lo, max - lo)
    const b = this.rng.entier(Math.max(2, Math.round(lo / 2)), max - a)
    return [a, b]
  }

  /** n × k avec k dans les tables du niveau, produit ≤ max. */
  produit(tables: readonly number[], max: number): [number, number] {
    let n: number, k: number
    do { n = this.rng.entier(2, 10); k = this.rng.choisir(tables) } while (n * k > Math.max(max, 20))
    return [n, k]
  }

  // ── Écrire un problème ──

  /** « 2 + 2 + 2 = 6, donc 3 × 2 = 6 » pour les petits multiplicateurs, « 7 × 4 = 28 » sinon. */
  detailMultiplication(n: number, k: number): string {
    const r = n * k
    return n <= 5 ? this.T('pb.additionRepetee', { somme: Array(n).fill(k).join(' + '), r, n, k }) : `${n} × ${k} = ${r}`
  }

  /** Un problème : l'énoncé `pb.<cle>`, sa question `pb.<cleQ>`, puis réponse, unité et calcul. */
  pb(cle: ClePb, cleQ: ClePb, params: Params, reponse: number, unite: Unite, calcul: string): Probleme {
    return { enonce: this.T(`pb.${cle}` as Cle, params), question: this.T(`pb.${cleQ}` as Cle, params), reponse, unite, calcul }
  }
}
