// Grammaire — générateur : QUOI poser comme questions, et comment les corriger. Pur : aucun import de Vue, aucun Math.random (le hasard
// vient de `rng`), donc lisible par node, par les tests et par le build des fiches.
//   questions({ niveau, reglages, rng, nb })      une partie : nb questions réparties entre les types choisis, jamais deux fois la même
//   questionsFiche({ niveau, reglages, rng })      { niveau, questions } de la fiche (fiche.ts les met en page)
//   verifier(q, rep)                               rep : { choix } (indice), { selection } (indices de mots), { ordre } (indices
//                                                  d'étiquettes), { texte } (saisie)
//   bonneReponse(q) / mauvaiseReponse(q)  ecartsAuProgramme(x, contraintes) : types, natures, pluriels et accords hors du programme
// Les textes affichés (consigne, explication, solution, libellés de choix) sont des textes calculés : `valeur(x, tr)`, où `tr` est le
// traducteur de l'interface (jeu, `grammaire.<clé>`) ou celui de la fiche (catalogue textes.ts, toujours en français).
// L'ordre des tirages est celui de l'ancienne version : même flux de hasard, mêmes fiches (instantanés). Corpus : src/data/grammaire.js.
import type { Classe, Contraintes, ParamsGenerateur, Rng, Verdict } from '../../noyau/types.ts'
import type { ReglagesDeDefinition } from '../../noyau/definir.ts'
import type { CleContenu } from '../../langues/catalogue.ts'
import { cleQuestion } from '../../noyau/uniques.ts'
import { DONNEES, ADJECTIFS } from '../../data/grammaire.js'
import { verdictSaisie } from '../../utils/reponses.ts'
import type DEFINITION from './definition.ts'
import { typesDuNiveau } from './definition.ts'
import type { TypeGrammaire } from './definition.ts'
import type { CONTENU } from './textes.ts'

type Reglages = ReglagesDeDefinition<typeof DEFINITION>
type Cle = CleContenu<typeof CONTENU>

/** Un traducteur : une clé (sans section) et ses paramètres → le texte. */
export type Tr = (cle: string, params?: Record<string, unknown>) => string
/** Un texte fixe, ou calculé dans la langue du traducteur. */
export type Texte = string | ((tr: Tr) => string)
/** Texte fixe ou calculé, lu avec un traducteur. */
export const valeur = (x: Texte | null | undefined, tr: Tr): string => (typeof x === 'function' ? x(tr) : x ?? '')

// le CM reprend les phrases du CE2 (avec les exercices de son niveau)
const baseDe = (niveau: Classe): 'ce1' | 'ce2' => (niveau === 'ce1' ? 'ce1' : 'ce2')

// Choix « métalangage » traduits dans l'interface : clé des textes (les choix en français étudié restent tels quels)
const CHOIX: Readonly<Record<string, string>> = {
  "Oui, c'est une phrase": 'choix_ouiPhrase',
  "Non, ce n'est pas une phrase": 'choix_nonPhrase',
  'phrase simple': 'choix_phraseSimple',
  'phrase complexe': 'choix_phraseComplexe',
  'affirmative': 'choix_affirmative',
  'négative': 'choix_negative',
  'complément du verbe': 'choix_complementVerbe',
  'complément de phrase': 'choix_complementPhrase',
  'Où ?': 'choix_ou',
  'Quand ?': 'choix_quand',
  'singulier': 'choix_singulier',
  'pluriel': 'choix_pluriel',
  'masculin': 'choix_masculin',
  'féminin': 'choix_feminin',
  'nom': 'choix_nom',
  'verbe': 'choix_verbe',
  'déterminant': 'choix_determinant',
  'adjectif': 'choix_adjectif',
  'pronom': 'choix_pronom',
  '. (point)': 'choix_point',
  "? (point d'interrogation)": 'choix_interrogation',
  "! (point d'exclamation)": 'choix_exclamation',
  'déclarative': 'choix_declarative',
  'interrogative': 'choix_interrogative',
  'impérative': 'choix_imperative',
}
/** Le libellé d'un choix dans la langue du traducteur (un mot français étudié reste tel quel). */
export const tc = (tr: Tr, c: string): string => (CHOIX[c] ? tr(CHOIX[c]) : c)

// ── Phrases annotées (syntaxe : src/data/grammaire.js) ──
type Nature = 'det' | 'nom' | 'verbe' | 'adj' | 'pronom' | 'autre' | 'ponct'
/** Un mot d'une phrase annotée : sa nature, et les groupes dont il fait partie (sujet, complément de phrase, complément du verbe). */
export interface Token { m: string, n: Nature, propre?: boolean, sujet?: boolean, cv?: boolean, cp?: boolean }
type Genre = 'ms' | 'fs' | 'mp' | 'fp'
/** Une phrase analysée : ses mots, le genre et le nombre du sujet, la question du complément de phrase (o : où ?, q : quand ?). */
interface Phrase { src: string, tokens: Token[], gn: Genre | null, cp: 'o' | 'q' | null }

const NATURES: Readonly<Record<string, Nature>> = { d: 'det', n: 'nom', N: 'nom', v: 'verbe', a: 'adj', p: 'pronom', x: 'autre' }
const NOM_NATURE: Readonly<Partial<Record<Nature, string>>> = { det: 'déterminant', nom: 'nom', verbe: 'verbe', adj: 'adjectif', pronom: 'pronom' }

function analyserPhrase(src: string): Phrase {
  const tokens: Token[] = []
  let gn: Genre | null = null, cp: 'o' | 'q' | null = null
  let dansSujet = false, dansCV = false, groupeCP: Token[] | null = null
  for (let brut of src.trim().split(/\s+/)) {
    // ouvertures de groupes en tête du mot : [ sujet, { complément de phrase, < complément du verbe
    while (brut.length > 1 && '[{<'.includes(brut[0])) {
      if (brut[0] === '[') dansSujet = true
      if (brut[0] === '{') groupeCP = []
      if (brut[0] === '<') dansCV = true
      brut = brut.slice(1)
    }
    // fermetures en fin de mot : ]ms, }o, >
    const fins: RegExpMatchArray[] = []
    for (let m = brut.match(/(\](ms|fs|mp|fp|-)|\}([oq])|>)$/); m && brut.length > m[0].length; m = brut.match(/(\](ms|fs|mp|fp|-)|\}([oq])|>)$/)) {
      fins.unshift(m)
      brut = brut.slice(0, -m[0].length)
    }
    let tok: Token
    if (/^[.?!,]$/.test(brut)) {
      tok = { m: brut, n: 'ponct' }
    } else {
      const k = brut.lastIndexOf(':')
      const code = brut.slice(k + 1)
      tok = { m: brut.slice(0, k), n: NATURES[code] }
      if (code === 'N') tok.propre = true
      if (dansSujet) tok.sujet = true
      if (dansCV) tok.cv = true
      if (groupeCP) { tok.cp = true; groupeCP.push(tok) }
    }
    tokens.push(tok)
    for (const m of fins) {
      if (m[0].startsWith(']')) { gn = m[2] === '-' ? null : m[2] as Genre; dansSujet = false }
      else if (m[0].startsWith('}')) { cp = m[3] as 'o' | 'q'; groupeCP = null }
      else dansCV = false
    }
  }
  return { src, tokens, gn, cp }
}

/** Le texte d'une suite de mots, avec la typographie française (rien avant « . , », une espace avant « ? ! », rien après une élision). */
export function texteTokens(tokens: readonly Token[], avecMarques: ((t: Token, i: number) => string) | null = null): string {
  let s = ''
  tokens.forEach((t, i) => {
    const mot = avecMarques ? avecMarques(t, i) : t.m
    if (i > 0) {
      const apresElision = tokens[i - 1].m.endsWith('\'') && t.m !== '?' && t.m !== '!'
      const colle = t.m === '.' || t.m === ',' || apresElision
      if (!colle) s += ' '
    }
    s += mot
  })
  return s
}

const majuscule = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1)
const minuscule = (s: string): string => s.charAt(0).toLowerCase() + s.slice(1)
const indicesOu = (tokens: readonly Token[], pred: (t: Token) => boolean): number[] => tokens.map((t, i) => (pred(t) ? i : -1)).filter(i => i >= 0)

const PRONOM_TONIQUE: Readonly<Record<string, string>> = { Je: 'moi', Tu: 'toi', Il: 'lui', Elle: 'elle', Nous: 'nous', Vous: 'vous', Ils: 'eux', Elles: 'elles' }

const aSujet = (p: Phrase): boolean => p.tokens.some(t => t.sujet)
const sujetInverse = (p: Phrase): boolean => aSujet(p) && p.tokens.findIndex(t => t.sujet) > p.tokens.findIndex(t => t.n === 'verbe')

// Texte d'un groupe de mots (minuscule initiale, sauf un nom propre ou un pronom)
function texteGroupe(p: Phrase, pred: (t: Token) => boolean): string {
  const g = p.tokens.filter(pred)
  return texteTokens(g.map((t, i) => ((i === 0 && !t.propre && t.n !== 'pronom') ? { ...t, m: minuscule(t.m) } : t)))
}
const texteSujet = (p: Phrase): string => texteGroupe(p, t => !!t.sujet)

// « C'est le petit chat qui dort sur le canapé. » / « Ce sont des loups qui vivent dans la forêt. »
function phraseCestQui(p: Phrase): string {
  const st = p.tokens.filter(t => t.sujet)
  const iv = p.tokens.findIndex(t => t.n === 'verbe')
  let reste = p.tokens.slice(iv).filter(t => t.n !== 'ponct' && !t.sujet)
  if (sujetInverse(p)) {
    const avant = p.tokens.slice(0, iv).filter(t => t.n !== 'ponct')
    reste = [...reste, ...avant.map((t, i) => ((i === 0 && !t.propre) ? { ...t, m: minuscule(t.m) } : t))]
  }
  const verbe = texteTokens(reste)
  let sujet: string, pluriel: boolean
  if (st.length === 1 && st[0].n === 'pronom') {
    const pr = majuscule(st[0].m)
    sujet = PRONOM_TONIQUE[pr]
    pluriel = pr === 'Ils' || pr === 'Elles'
  } else {
    sujet = texteSujet(p)
    pluriel = p.gn === 'mp' || p.gn === 'fp'
  }
  return `${pluriel ? 'Ce sont' : 'C\'est'} ${sujet} qui ${verbe}.`
}

const PRONOM_DE: Readonly<Record<Genre, string>> = { ms: 'il', fs: 'elle', mp: 'ils', fp: 'elles' }

function phraseAvecPronom(p: Phrase): string {
  const pr = PRONOM_DE[p.gn as Genre]
  const out: Token[] = []
  let place = false
  p.tokens.forEach((t, i) => {
    if (!t.sujet) { out.push(t); return }
    if (!place) { out.push({ m: i === 0 ? majuscule(pr) : pr, n: 'pronom' }); place = true }
  })
  return texteTokens(out)
}

const u = (s: string): string => `<u>${s}</u>`
const b = (s: string): string => `<strong>${s}</strong>`

function surligner(p: Phrase, indices: readonly number[], balise = b): string {
  const set = new Set(indices)
  return texteTokens(p.tokens, (t, i) => (set.has(i) ? balise(t.m) : t.m))
}

// Souligne un groupe de mots contigu (sujet, complément…)
function surlignerGroupe(p: Phrase, pred: (t: Token) => boolean, balise = u): string {
  const idx = indicesOu(p.tokens, pred)
  const debut = texteTokens(p.tokens.slice(0, idx[0]))
  const groupe = texteTokens(p.tokens.slice(idx[0], idx[idx.length - 1] + 1))
  const reste = texteTokens(p.tokens.slice(idx[idx.length - 1] + 1))
  let s = debut ? debut + (debut.endsWith('\'') ? '' : ' ') : ''
  s += balise(groupe)
  if (reste) s += (/^[.,]/.test(reste) ? '' : ' ') + reste
  return s
}
const surlignerSujet = (p: Phrase): string => surlignerGroupe(p, t => !!t.sujet)

// Une phrase est utilisable pour « remettre dans l'ordre » si elle est courte, sans virgule et sans adjectif déplaçable vers un autre
// nom (une seule réponse juste)
function ordrePossible(p: Phrase): boolean {
  const mots = p.tokens.filter(t => t.n !== 'ponct')
  if (p.tokens.some(t => t.m === ',')) return false
  if (mots.length < 3 || mots.length > 7) return false
  // « et » (Tom et Zoé ↔ Zoé et Tom) ou adverbe pouvant devenir adjectif (le vent fort souffle)
  if (mots.some(t => ['et', 'fort', 'bon'].includes(t.m))) return false
  const nbAdj = mots.filter(t => t.n === 'adj').length
  const nbNoms = mots.filter(t => t.n === 'nom').length
  if (nbAdj > 0 && nbNoms > 1) return false
  // deux noms après le verbe pourraient être échangés (une glace à la fraise / une fraise à la glace)
  const iVerbe = mots.findIndex(t => t.n === 'verbe')
  if (mots.slice(iVerbe + 1).filter(t => t.n === 'nom').length > 1) return false
  return true
}

// Les étiquettes à ranger : les mots, une élision collée au mot suivant (l' + arbre → l'arbre)
function etiquettesDe(p: Phrase): string[] {
  const etiq: string[] = []
  const mots = p.tokens.filter(t => t.n !== 'ponct')
  for (let i = 0; i < mots.length; i++) {
    if (mots[i].m.endsWith('\'') && i + 1 < mots.length) { etiq.push(mots[i].m + mots[i + 1].m); i++ }
    else etiq.push(mots[i].m)
  }
  return etiq
}

// ── Forme négative ──
const joindre = (...parts: string[]): string => parts.filter(Boolean).join(' ')
const commenceParVoyelle = (mot: string): boolean => /^[aâàeéèêiîoôuûyh]/i.test(mot)
interface Negation { aff: string, neg: string, mot: string, elide: boolean, faux: string[] }

// e : [avant, verbe, après] (CE1, ne… pas) ou [affirmative, avant, verbe, après, mot] (CE2)
function negationDe(e: string[]): Negation {
  let aff: string, avant: string, verbe: string, apres: string, mot: string
  if (e.length === 3) {
    [avant, verbe, apres] = e
    aff = `${joindre(avant, verbe, apres)}.`
    mot = 'pas'
  } else {
    [aff, avant, verbe, apres, mot] = e
  }
  const elide = commenceParVoyelle(verbe)
  const ne = elide ? `n'${verbe}` : `ne ${verbe}`
  const neg = `${joindre(avant, ne, mot, apres)}.`
  const oubliDuNe = `${joindre(avant, verbe, mot, apres)}.`
  const deuxiemeFaute = elide
    ? `${joindre(avant, 'ne', verbe, mot, apres)}.`    // « ne » non élidé
    : `${joindre(avant, 'ne', mot, verbe, apres)}.`    // mots mal placés
  return { aff, neg, mot, elide, faux: [oubliDuNe, deuxiemeFaute] }
}

// Consignes (textes : consigne_<type>, ou consigne_<niveau>_<type> pour celles propres à un niveau) ; fiche : fiche_<type>
const CONSIGNES_NIVEAU: Readonly<Partial<Record<'ce1' | 'ce2', readonly TypeGrammaire[]>>> = { ce2: ['verbe', 'negReconnaitre'] }
function cleConsigne(prefixe: 'consigne' | 'fiche', type: TypeGrammaire, niveau: Classe): string {
  const base = baseDe(niveau)
  return CONSIGNES_NIVEAU[base]?.includes(type) ? `${prefixe}_${base}_${type}` : `${prefixe}_${type}`
}
/** La consigne d'une partie de la fiche. */
export const consigneFiche = (tr: Tr, type: TypeGrammaire, niveau: Classe): string => tr(cleConsigne('fiche', type, niveau))

// ── Le corpus (src/data/grammaire.js) ──
interface Corpus {
  phrases: string[]
  groupesNominaux?: string[]
  phraseOuPas?: { t: string, ok: boolean, r?: string }[]
  typesPhrases?: { t: string, s: '.' | '?' | '!' }[]
  typesNommes?: { t: string, type: TypeNomme }[]
  pronomsPersonnes?: [string, PronomSujet][]
  negations?: string[][]
  genre?: [string, 'm' | 'f'][]
  pluriels?: [string, string, string?][]
  accordsGN?: [string, string, string, Genre][]
  accordsSV?: [string, string, string, string, string, 's' | 'p'][]
}
/** Les trois types de phrases du CE1 (l'exclamative est une forme, pas un type). */
type TypeNomme = 'declarative' | 'interrogative' | 'imperative'
const LIB_TYPE: Readonly<Record<TypeNomme, string>> = { declarative: 'déclarative', interrogative: 'interrogative', imperative: 'impérative' }
/** Les pronoms personnels sujets du CE1, dans l'ordre des personnes (on ne figure pas au corpus : il remplace souvent « nous » à l'oral). */
const PRONOMS_SUJETS = ['je', 'tu', 'il', 'elle', 'nous', 'vous', 'ils', 'elles'] as const
type PronomSujet = (typeof PRONOMS_SUJETS)[number]

const CORPUS = DONNEES as unknown as Record<'ce1' | 'ce2', Corpus>
const FORMES_ADJECTIF = ADJECTIFS as Record<string, string[]>

/** Les réservoirs de chaque type : une entrée du réservoir donne une question. */
type Reservoirs = Record<TypeGrammaire, unknown[]>

function construireReservoirs(niveau: Classe): Reservoirs {
  const d = CORPUS[baseDe(niveau)]
  const phrases = d.phrases.map(analyserPhrase)
  const gns = (d.groupesNominaux || []).map(analyserPhrase)
  // les groupes nominaux servent aussi à repérer noms, déterminants et adjectifs
  const avec = (n: Nature): Phrase[] => [...phrases, ...gns].filter(p => p.tokens.some(t => t.n === n))
  const nature: { p: Phrase, i: number }[] = []
  phrases.forEach(p => p.tokens.forEach((t, i) => { if (NOM_NATURE[t.n]) nature.push({ p, i }) }))
  const nombre: { gn: string, n: 's' | 'p' }[] = []
  for (const [s, pl] of d.pluriels || []) { nombre.push({ gn: s, n: 's' }); nombre.push({ gn: pl, n: 'p' }) }
  const cpltNature: { p: Phrase, g: 'cp' | 'cv' }[] = []
  phrases.forEach(p => {
    if (p.cp) cpltNature.push({ p, g: 'cp' })
    if (p.tokens.some(t => t.cv)) cpltNature.push({ p, g: 'cv' })
  })
  const negations = (d.negations || []).map(negationDe)
  return {
    ordre: phrases.filter(ordrePossible),
    phrase: d.phraseOuPas || [],
    majuscule: phrases.filter(p => p.tokens[p.tokens.length - 1].m === '.' && aSujet(p)),
    ponctuation: d.typesPhrases || [],
    typePhrase: d.typesNommes || [],
    complexe: phrases,
    negation: negations,
    negReconnaitre: negations.flatMap(n => [{ n, neg: true }, { n, neg: false }]),
    verbe: phrases,
    nom: avec('nom'),
    det: avec('det'),
    adj: avec('adj'),
    nature,
    gnNoyau: gns,
    sujet: phrases.filter(aSujet),
    pronom: phrases.filter(p => p.gn && !sujetInverse(p) && !p.tokens.some(t => t.sujet && t.n === 'pronom')),
    pronomPersonne: d.pronomsPersonnes || [],
    cplt: phrases.filter(p => p.cp),
    cpltQ: phrases.filter(p => p.cp),
    cpltNature,
    genre: d.genre || [],
    nombre,
    // CE1 : pluriel en -s seulement (les pluriels en -x arrivent au CE2, BO n° 41 p. 94)
    pluriel: (d.pluriels || []).filter(([, , regle]) => niveau !== 'ce1' || !['eau', 'eu'].includes(regle ?? '')),
    accordGN: (d.accordsGN || []).map(a => ({ a, formes: FORMES_ADJECTIF[a[2]] })),
    accordSV: d.accordsSV || [],
  }
}

const LIB_SIGNES: Readonly<Record<string, string>> = { '.': '. (point)', '?': '? (point d\'interrogation)', '!': '! (point d\'exclamation)' }
// Type de phrase selon le signe de fin (textes : typePhrase_<nom du signe>)
const NOM_SIGNE: Readonly<Record<string, string>> = { '.': 'point', '?': 'interrogation', '!': 'exclamation' }
const LIB_CPLT: Readonly<Record<'o' | 'q', string>> = { o: 'Où ?', q: 'Quand ?' }
const libGN = (tr: Tr, g: string): string => tr(`gn_${g}`)
const nombreDe = (tr: Tr, n: string): string => tr(`nombre_${n}`)
const neOuNApostrophe = (elide: boolean): string => (elide ? 'n\'' : 'ne')

/**
 * Une question : à choix (`options`, `bonne`), à cliquer (`mode: 'clic'` : `tokens`, `cibles`), à ranger (`mode: 'ordre'` : `etiquettes`)
 * ou à écrire (`mode: 'saisie'`). `attendu` : la bonne réponse (texte) ; `lecture` : ce que la voix peut lire.
 */
export interface Question {
  cle: string
  type: TypeGrammaire
  mode: 'choix' | 'clic' | 'ordre' | 'saisie'
  consigne: Texte
  attendu: string
  explication?: Texte
  solution: Texte
  html?: Texte
  lecture?: string | null
  choix?: string[]
  options?: { label: string }[]
  bonne?: number
  colonne?: boolean
  tokens?: Token[]
  cibles?: number[]
  etiquettes?: string[]
  fin?: string
  regle?: string
  adj?: string
  mot?: string
}
/** La réponse de l'élève. */
export type Reponse = { choix: number } | { selection: number[] } | { ordre: number[] } | { texte: string }
/** Ce que tire la fiche. */
export interface TirageFiche { niveau: Classe, questions: Question[] }

type Base = Pick<Question, 'type' | 'cle' | 'consigne'>
// Question à choix : propositions { label } (traduites par la vue avec tc), indice de la bonne ; `attendu` : la bonne proposition
const choix = (q: Base, propositions: string[], bonne: string): Base & Pick<Question, 'mode' | 'choix' | 'options' | 'bonne' | 'attendu'> =>
  ({ ...q, mode: 'choix', choix: propositions, options: propositions.map(label => ({ label })), bonne: propositions.indexOf(bonne), attendu: bonne })

/** Ce qu'il faut trouver dans la phrase, pour les questions « clique sur… ». */
function cibleDe(type: TypeGrammaire): (t: Token) => boolean {
  if (type === 'sujet') return t => !!t.sujet
  if (type === 'cplt') return t => !!t.cp
  if (type === 'gnNoyau') return t => t.n === 'nom'
  return t => t.n === type
}

function questionClic(q: Base, type: TypeGrammaire, e: Phrase): Question {
  const pred = cibleDe(type)
  const cibles = indicesOu(e.tokens, pred)
  const mots = cibles.map(i => `« ${e.tokens[i].m} »`).join(', ')
  let explication: Texte
  if (type === 'sujet') {
    explication = tr => tr('expl_sujet', { sujet: texteSujet(e), cestQui: phraseCestQui(e) }) + (sujetInverse(e) ? tr('expl_sujetInverse') : '')
  } else if (type === 'cplt') {
    explication = tr => tr('expl_cplt', { groupe: texteGroupe(e, pred), question: tr(e.cp === 'o' ? 'expl_cpltOu' : 'expl_cpltQuand') })
  } else if (type === 'gnNoyau') {
    explication = tr => tr('expl_gnNoyau', { nom: e.tokens[cibles[0]].m })
  } else if (type === 'verbe') {
    explication = tr => tr(cibles.length > 1 ? 'expl_verbes' : 'expl_verbe', { verbes: mots })
  } else {
    explication = tr => `${tr(`lib_${type}${cibles.length > 1 ? 's' : ''}`)} : ${mots}.`
  }
  let solution: string
  if (type === 'sujet' || type === 'cplt') solution = surlignerGroupe(e, pred)
  else solution = surligner(e, cibles, type === 'verbe' ? u : b)
  return { ...q, mode: 'clic', tokens: e.tokens, cibles, attendu: mots, lecture: texteTokens(e.tokens), explication, solution }
}

function construireQuestion(rng: Rng, type: TypeGrammaire, entree: unknown, niveau: Classe): Question {
  const q: Base = { type, cle: type, consigne: tr => tr(cleConsigne('consigne', type, niveau)) }
  switch (type) {
    case 'ordre': {
      const e = entree as Phrase
      const etiq = etiquettesDe(e)
      let melange = rng.melanger(etiq)
      for (let k = 0; k < 10 && melange.join(' ') === etiq.join(' '); k++) melange = rng.melanger(etiq)
      return { ...q, mode: 'ordre', etiquettes: melange, fin: e.tokens[e.tokens.length - 1].m, attendu: etiq.join(' '), solution: texteTokens(e.tokens) }
    }
    case 'phrase': {
      const e = entree as { t: string, ok: boolean, r?: string }
      const oui = 'Oui, c\'est une phrase', non = 'Non, ce n\'est pas une phrase'
      const bonne = e.ok ? oui : non
      const expl = (tr: Tr): string => {
        if (e.ok) return tr('expl_phraseOk')
        return tr(e.r === 'verbe' ? 'expl_phraseVerbe' : 'expl_phraseOrdre')
      }
      return { ...choix(q, [oui, non], bonne), html: e.t, lecture: e.ok ? e.t : null,
        explication: expl,
        solution: tr => `« ${e.t} » → ${tc(tr, bonne).toLowerCase()}. ${expl(tr)}` }
    }
    case 'majuscule': {
      const e = entree as Phrase
      const juste = texteTokens(e.tokens)
      const sansMaj = minuscule(juste)
      const sansPoint = juste.slice(0, -1)
      return { ...choix(q, rng.melanger([juste, sansMaj, sansPoint]), juste), colonne: true, lecture: juste,
        explication: tr => tr('expl_majuscule'),
        solution: juste }
    }
    case 'ponctuation': {
      const e = entree as { t: string, s: string }
      const typ = (tr: Tr): string => tr(`typePhrase_${NOM_SIGNE[e.s]}`)
      return { ...choix(q, ['.', '?', '!'].map(s => LIB_SIGNES[s]), LIB_SIGNES[e.s]), html: `${e.t} <span class="trou">…</span>`,
        explication: tr => tr('expl_ponctuation', { type: typ(tr) }),
        solution: tr => `${e.t}${e.s === '.' ? '' : ' '}${b(e.s)} (${typ(tr)})` }
    }
    case 'typePhrase': {
      const e = entree as { t: string, type: TypeNomme }
      const bonne = LIB_TYPE[e.type]
      return { ...choix(q, Object.values(LIB_TYPE), bonne), html: e.t, lecture: e.t,
        explication: tr => tr(`expl_typePhrase_${e.type}`),
        solution: tr => `${e.t} → ${b(tc(tr, bonne))}` }
    }
    case 'complexe': {
      const e = entree as Phrase
      const iv = indicesOu(e.tokens, t => t.n === 'verbe')
      const bonne = iv.length > 1 ? 'phrase complexe' : 'phrase simple'
      const verbes = iv.map(i => `« ${e.tokens[i].m} »`).join(', ')
      return { ...choix(q, ['phrase simple', 'phrase complexe'], bonne), html: texteTokens(e.tokens), lecture: texteTokens(e.tokens),
        explication: tr => (iv.length > 1 ? tr('expl_complexe', { n: iv.length, verbes }) : tr('expl_simple', { verbes })),
        solution: tr => `${surligner(e, iv, u)} → ${tc(tr, bonne)}` }
    }
    case 'negation': {
      const e = entree as Negation
      const precision = (tr: Tr): string => (e.mot !== 'pas' ? `<div class="sens">${tr('avec')} « ne … ${e.mot} »</div>` : '')
      return { ...choix(q, rng.melanger([e.neg, ...e.faux]), e.neg), colonne: true,
        html: tr => e.aff + precision(tr),
        lecture: e.aff,
        explication: tr => tr('expl_negation', { ne: neOuNApostrophe(e.elide), mot: e.mot, elision: e.elide ? tr('expl_negationElision') : '' }),
        solution: `${e.aff} → ${b(e.neg)}`, mot: e.mot }
    }
    case 'negReconnaitre': {
      const { n, neg } = entree as { n: Negation, neg: boolean }
      const phrase = neg ? n.neg : n.aff
      const ce1 = niveau === 'ce1'
      const propositions = ce1 ? ['affirmative', 'négative'] : ['affirmative', 'ne … pas', 'ne … plus', 'ne … jamais', 'ne … rien']
      let bonne = 'affirmative'
      if (neg) bonne = ce1 ? 'négative' : `ne … ${n.mot}`
      return { ...choix(q, propositions, bonne), html: phrase, lecture: phrase,
        explication: tr => (neg ? tr('expl_negative', { ne: neOuNApostrophe(n.elide), mot: n.mot }) : tr('expl_affirmative')),
        solution: tr => `${phrase} → ${tc(tr, bonne)}` }
    }
    case 'verbe': case 'nom': case 'det': case 'adj': case 'sujet': case 'cplt': case 'gnNoyau':
      return questionClic(q, type, entree as Phrase)
    case 'cpltQ': {
      const e = entree as Phrase
      const bonne = LIB_CPLT[e.cp as 'o' | 'q']
      const groupe = texteGroupe(e, t => !!t.cp)
      return { ...choix(q, ['Où ?', 'Quand ?'], bonne), html: surlignerGroupe(e, t => !!t.cp), lecture: texteTokens(e.tokens),
        explication: tr => tr('expl_cpltQ', { groupe, quoi: tr(e.cp === 'o' ? 'expl_cpltQLieu' : 'expl_cpltQMoment') }),
        solution: tr => `${surlignerGroupe(e, t => !!t.cp)} → ${tc(tr, bonne)}` }
    }
    case 'cpltNature': {
      const e = entree as { p: Phrase, g: 'cp' | 'cv' }
      const pred = e.g === 'cp' ? (t: Token) => !!t.cp : (t: Token) => !!t.cv
      const groupe = texteGroupe(e.p, pred)
      const verbe = e.p.tokens.find(t => t.n === 'verbe')?.m ?? ''
      const bonne = e.g === 'cp' ? 'complément de phrase' : 'complément du verbe'
      return { ...choix(q, ['complément du verbe', 'complément de phrase'], bonne), html: surlignerGroupe(e.p, pred), lecture: texteTokens(e.p.tokens),
        explication: tr => (e.g === 'cp' ? tr('expl_cpltPhrase', { groupe }) : tr('expl_cpltVerbe', { groupe, verbe })),
        solution: tr => `${surlignerGroupe(e.p, pred)} → ${tc(tr, bonne)}` }
    }
    case 'nature': {
      const e = entree as { p: Phrase, i: number }
      const tok = e.p.tokens[e.i]
      const bonne = NOM_NATURE[tok.n] as string
      const precision = (tr: Tr): string => {
        if (tok.propre) return tr('expl_nomPropre')
        if (tok.n === 'verbe' && niveau !== 'ce1') return tr('expl_conjugue')
        return ''
      }
      return { ...choix(q, ['nom', 'verbe', 'déterminant', 'adjectif', 'pronom'], bonne), html: surligner(e.p, [e.i]), lecture: texteTokens(e.p.tokens),
        explication: tr => tr('expl_nature', { mot: tok.m, nature: tc(tr, bonne), precision: precision(tr) }),
        solution: tr => `${surligner(e.p, [e.i])} → ${tc(tr, bonne)}` }
    }
    case 'pronom': {
      const e = entree as Phrase
      const bonne = PRONOM_DE[e.gn as Genre]
      const nouvelle = phraseAvecPronom(e)
      return { ...choix(q, ['il', 'elle', 'ils', 'elles'], bonne), html: surlignerSujet(e), lecture: texteTokens(e.tokens),
        explication: tr => tr('expl_pronom', { sujet: texteSujet(e), gn: libGN(tr, e.gn as string), phrase: nouvelle }),
        solution: nouvelle }
    }
    case 'pronomPersonne': {
      const [mots, pronom] = entree as [string, PronomSujet]
      return { ...choix(q, [...PRONOMS_SUJETS], pronom), html: `<b>${mots}</b>`, lecture: mots,
        explication: tr => tr(`expl_pronomPersonne_${pronom}`, { mots }),
        solution: `${mots} → ${b(pronom)}` }
    }
    case 'genre': {
      const [nom, g] = entree as [string, 'm' | 'f']
      const bonne = g === 'm' ? 'un' : 'une'
      const lib = (tr: Tr): string => tc(tr, g === 'm' ? 'masculin' : 'féminin')
      return { ...choix(q, ['un', 'une'], bonne), html: `<span class="trou">___</span> ${nom}`, lecture: null,
        explication: tr => tr('expl_genre', { det: bonne, nom, genre: lib(tr) }),
        solution: tr => `${b(bonne)} ${nom} (${lib(tr)})` }
    }
    case 'nombre': {
      const e = entree as { gn: string, n: 's' | 'p' }
      const bonne = e.n === 's' ? 'singulier' : 'pluriel'
      const det = e.gn.split(' ')[0]
      return { ...choix(q, ['singulier', 'pluriel'], bonne), html: e.gn, lecture: e.gn,
        explication: tr => tr('expl_nombre', { det, nombre: nombreDe(tr, e.n) }),
        solution: tr => `${e.gn} → ${tc(tr, bonne)}` }
    }
    case 'pluriel': {
      const [s, pl, regle] = entree as [string, string, string?]
      const cleRegle = regle || 'defaut'
      return { ...q, mode: 'saisie', html: `${s} → <span class="trou">…</span>`, lecture: null,
        attendu: pl, regle: cleRegle,
        explication: tr => tr(`regle_${cleRegle}`),
        solution: `${s} → ${b(pl)}` }
    }
    case 'accordGN': {
      const { a, formes } = entree as { a: [string, string, string, Genre], formes: string[] }
      const [gn, nom, adj, g] = a
      const bonne = formes[['ms', 'fs', 'mp', 'fp'].indexOf(g)]
      return { ...choix(q, [...new Set(formes)], bonne), html: `${gn.replace('___', '<span class="trou">___</span>')} <em>(${adj})</em>`,
        lecture: null, adj,
        explication: tr => tr('expl_accordGN', { nom, gn: libGN(tr, g), bonne }),
        solution: gn.replace('___', b(bonne)) }
    }
    case 'accordSV': {
      const [phrase, suj, inf, fs, fp, n] = entree as [string, string, string, string, string, 's' | 'p']
      const bonne = n === 's' ? fs : fp
      return { ...choix(q, [fs, fp], bonne), html: `${phrase.replace('___', '<span class="trou">___</span>')} <em>(${inf})</em>`,
        lecture: null,
        explication: tr => tr('expl_accordSV', { sujet: suj, nombre: nombreDe(tr, n), bonne }),
        solution: phrase.replace('___', b(bonne)) }
    }
  }
}

// nb questions réparties entre les types choisis (disponibles au niveau), jamais deux fois la même
function genererQuestions(rng: Rng, niveau: Classe, types: readonly string[], nb: number): Question[] {
  const res = construireReservoirs(niveau)
  const dispo = typesDuNiveau(niveau)
  let ok = types.filter((t): t is TypeGrammaire => (dispo as string[]).includes(t) && res[t as TypeGrammaire].length > 0)
  if (!ok.length) ok = [dispo[0]]
  const pools: Partial<Record<TypeGrammaire, unknown[]>> = {}
  const ordreTypes: TypeGrammaire[] = []
  while (ordreTypes.length < nb) ordreTypes.push(...rng.melanger(ok))
  ordreTypes.length = nb
  const deja = new Set<string>()
  return rng.melanger(ordreTypes).flatMap(type => {
    let q: Question | null = null
    for (let k = 0; k < 20; k++) {
      if (!pools[type] || pools[type].length === 0) pools[type] = rng.melanger(res[type])
      q = construireQuestion(rng, type, pools[type].pop(), niveau)
      if (!deja.has(cleQuestion(q))) break
    }
    // réservoir épuisé : la question est retirée plutôt que répétée
    if (!q || deja.has(cleQuestion(q))) return []
    deja.add(cleQuestion(q))
    return [q]
  })
}

/** Une partie : `nb` questions (réglage `nb` par défaut) réparties entre les types cochés. */
export const questions = ({ niveau, reglages, rng, nb = reglages.nb }: ParamsGenerateur<Reglages, Cle>): Question[] =>
  genererQuestions(rng, niveau, reglages.types ?? [], nb)

/** Questions de la fiche : { niveau, questions }. */
export const questionsFiche = ({ niveau, reglages, rng }: Omit<ParamsGenerateur<Reglages, Cle>, 'nb' | 'T'>): TirageFiche =>
  ({ niveau, questions: genererQuestions(rng, niveau, reglages.types ?? [], reglages.nb) })

export function verifier(q: Question, rep: Reponse): Verdict {
  if ('choix' in rep) return rep.choix === q.bonne
  if ('selection' in rep) {
    const sel = [...rep.selection].sort((x, y) => x - y)
    const cibles = q.cibles ?? []
    return sel.length === cibles.length && sel.every((v, k) => v === cibles[k])
  }
  // étiquettes : séparées par une espace
  if ('ordre' in rep) return rep.ordre.map(k => q.etiquettes?.[k]).join(' ') === q.attendu
  // pluriel : accents oubliés comptés faux, avec un avertissement (décision du 2026-10-05)
  return verdictSaisie(rep.texte, q.attendu)
}

export function bonneReponse(q: Question): Reponse {
  if (q.mode === 'choix') return { choix: q.bonne ?? 0 }
  if (q.mode === 'clic') return { selection: [...(q.cibles ?? [])] }
  if (q.mode === 'ordre') return { ordre: q.attendu.split(' ').map(mot => (q.etiquettes ?? []).indexOf(mot)) }
  return { texte: q.attendu }
}

export function mauvaiseReponse(q: Question): Reponse {
  if (q.mode === 'choix') return { choix: ((q.bonne ?? 0) + 1) % (q.options?.length ?? 2) }
  if (q.mode === 'clic') {
    // un mot qui n'est pas une cible
    const autre = (q.tokens ?? []).findIndex((t, i) => t.n !== 'ponct' && !(q.cibles ?? []).includes(i))
    return { selection: [autre] }
  }
  if (q.mode === 'ordre') {
    // le bon ordre, les deux premières étiquettes échangées
    const o = (bonneReponse(q) as { ordre: number[] }).ordre
    return { ordre: [o[1], o[0], ...o.slice(2)] }
  }
  return { texte: `${q.attendu}zz` }
}

// ── Programme (src/data/programme.ts : contraintes classesMots, pluriels, feminins ; compléments et phrase complexe : programmes du
// cycle 2 p. 91 et du cycle 3 p. 17-19) ──
const CLASSE_MOT: Readonly<Record<string, readonly string[]>> = {
  nom: ['nom-commun', 'nom-propre'], verbe: ['verbe'], déterminant: ['determinant'], adjectif: ['adjectif'],
  pronom: ['pronom-personnel-sujet', 'pronom-personnel'],
}
// accord régulier de l'adjectif : +e au féminin, +s au pluriel
function accordRegulier(adj: string, forme: string): boolean {
  const feminin = adj.endsWith('e') ? adj : `${adj}e`
  const pluriel = adj.endsWith('s') ? adj : `${adj}s`
  return [adj, feminin, pluriel, `${feminin}s`].includes(forme)
}

export function ecartsAuProgramme(x: readonly Question[] | TirageFiche, contraintes: Contraintes): string[] {
  const niveau = contraintes.niveau as Classe
  const liste = Array.isArray(x) ? (x as readonly Question[]) : (x as TirageFiche).questions
  const permis = typesDuNiveau(niveau)
  const classesMots = (contraintes.classesMots ?? []) as readonly string[]
  const ecarts: string[] = []
  for (const q of liste) {
    if (!permis.includes(q.type)) ecarts.push(`${q.type} : exercice hors du programme ${niveau}`)
    if (q.type === 'nature') {
      const natures = (q.choix ?? []).filter(c => !(CLASSE_MOT[c] ?? []).some(k => classesMots.includes(k)))
      if (natures.length) ecarts.push(`nature : ${natures.join(', ')} n'est pas une classe de mots du ${niveau}`)
    }
    if (q.type === 'pluriel' && !(contraintes.pluriels ?? []).includes('x') && ['eau', 'eu'].includes(q.regle ?? '')) ecarts.push(`pluriel en -x au ${niveau} : ${q.attendu}`)
    if (q.type === 'accordGN' && !(contraintes.feminins ?? []).includes('audible')) {
      const irregulieres = (q.choix ?? []).filter(f => !accordRegulier(q.adj ?? '', f))
      if (irregulieres.length) ecarts.push(`accord irrégulier au ${niveau} : ${q.adj} → ${irregulieres.join(', ')}`)
    }
  }
  return ecarts
}
