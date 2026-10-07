// Vocabulaire — générateur : QUOI poser comme questions, et comment les corriger. Pur : aucun import de Vue, aucun Math.random (le hasard
// vient de `rng`), donc lisible par node, par les tests et par le build des fiches.
//   questions({ niveau, reglages, rng, nb })      une partie : nb questions réparties entre les types choisis
//   questionsFiche({ niveau, reglages, rng })      { niveau, questions } de la fiche (fiche.ts les met en page)
//   verifier(q, rep)                               rep : { choix } (indice) ou { ordre } (indices d'étiquettes)
//   bonneReponse(q) / mauvaiseReponse(q)  ecartsAuProgramme(x, contraintes) : types hors du programme du niveau (bonus compris)
// Les textes affichés (consigne, explication, solution, et parfois la phrase) sont des textes calculés : `valeur(x, tr)`, où `tr` est le
// traducteur de l'interface (jeu, `vocabulaire.<clé>`) ou celui de la fiche (catalogue textes.ts, toujours en français).
// L'ordre des tirages est celui de l'ancienne version : même flux de hasard, mêmes fiches (instantanés). Corpus : src/data/vocabulaire.js.
import type { Classe, Contraintes, ParamsGenerateur, Rng, Verdict } from '../../noyau/types.ts'
import type { ReglagesDeDefinition } from '../../noyau/definir.ts'
import type { CleContenu } from '../../langues/catalogue.ts'
import { DONNEES, ALPHABET } from '../../data/vocabulaire.js'
import DEFINITION, { typesDuNiveau } from './definition.ts'
import type { TypeVocabulaire } from './definition.ts'
import type { CONTENU } from './textes.ts'
import { cleQuestion } from '../../noyau/uniques.ts'

type Reglages = ReglagesDeDefinition<typeof DEFINITION>
type Cle = CleContenu<typeof CONTENU>

/** Un traducteur : une clé (sans section) et ses paramètres → le texte. */
export type Tr = (cle: string, params?: Record<string, unknown>) => string
/** Un texte fixe, ou calculé dans la langue du traducteur. */
export type Texte = string | ((tr: Tr) => string)
/** Texte fixe ou calculé, lu avec un traducteur. */
export const valeur = (x: Texte | undefined, tr: Tr): string => (typeof x === 'function' ? x(tr) : x ?? '')

/** Libellé d'une proposition : seuls « sens propre / figuré » sont des mots à traduire. */
export const libelleChoix = (tr: Tr, c: string): string => (c === 'sens propre' ? tr('sensPropre') : c === 'sens figuré' ? tr('sensFigure') : c)

/** Une question : à choix (`options`, `bonne`) ou à ranger (`mode: 'ordre'`, `etiquettes`). `attendu` : la bonne réponse (texte). */
export interface Question {
  cle: string
  type: TypeVocabulaire
  mode: 'choix' | 'ordre'
  consigne: Texte
  attendu: string
  explication?: Texte
  solution: Texte
  html?: Texte
  /** texte que la voix peut lire (le mot, la définition, la phrase) */
  lecture?: string
  choix?: string[]
  options?: { label: string }[]
  bonne?: number
  colonne?: boolean
  etiquettes?: string[]
  separateur?: string
}
/** La réponse de l'élève : l'indice de la proposition touchée, ou les indices des étiquettes dans l'ordre placé. */
export type Reponse = { choix: number } | { ordre: number[] }
/** Ce que tire la fiche. */
export interface TirageFiche { niveau: Classe, questions: Question[] }

// ── Le corpus (src/data/vocabulaire.js), tel que le générateur le lit ──
type Paire = [string, string, string?, string?]
interface Categorie { etiquette: string, mots: string[], un: string }
interface Corpus {
  alpha: Record<string, string[]>
  alpha3?: Record<string, string[]>
  contraires?: Paire[]
  synonymes?: Paire[]
  definitions?: [string, string][]
  contexte?: [string, string, string, string[]][]
  homonymes?: [string, string, string[], string][]
  sensFigure?: [string, 'propre' | 'figure', string][]
  familles?: [string[], string][]
  categories?: Categorie[]
  prefixes?: [string, string, string][]
  suffixes?: [string, string, string, string][]
}
const CORPUS = DONNEES as unknown as Record<string, Corpus>

const collator = new Intl.Collator('fr', { sensitivity: 'base' })
const trierAlpha = (mots: readonly string[]): string[] => [...mots].sort(collator.compare)
const b = (s: string): string => `<strong>${s}</strong>`

interface EntreeAlpha { mots: string[], memeLettre: number }
// Questions d'ordre alphabétique générées à l'avance (dédoublonnées)
function genererAlpha(rng: Rng, d: Corpus): EntreeAlpha[] {
  const aleaDans = <X>(t: readonly X[]): X => t[rng.entier(0, t.length - 1)]
  const lettres = Object.keys(d.alpha)
  const out = new Map<string, EntreeAlpha>()
  for (let k = 0; k < 400 && out.size < 80; k++) {
    let mots: string[], memeLettre: number
    if (d.alpha3 && k % 2 === 0) {
      // mêmes 2 premières lettres → il faut regarder la 3e lettre
      const l = aleaDans(Object.keys(d.alpha3))
      mots = rng.melanger(d.alpha3[l]).slice(0, 4)
      memeLettre = 3
    } else if (d.alpha3 || k % 2 === 0) {
      // même 1re lettre → il faut regarder la 2e lettre
      const l = aleaDans(lettres.filter(x => d.alpha[x].length >= 4))
      mots = rng.melanger(d.alpha[l]).slice(0, 4)
      memeLettre = 2
    } else {
      mots = rng.melanger(lettres).slice(0, 5).map(l => aleaDans(d.alpha[l]))
      memeLettre = 1
    }
    const cle = trierAlpha(mots).join(',')
    if (!out.has(cle)) out.set(cle, { mots, memeLettre })
  }
  return [...out.values()]
}

interface EntreeLettre { l: string, sens: 'avant' | 'apres' }
function genererLettres(): EntreeLettre[] {
  const out: EntreeLettre[] = []
  for (let i = 1; i < ALPHABET.length - 1; i++) {
    out.push({ l: ALPHABET[i], sens: 'avant' })
    out.push({ l: ALPHABET[i], sens: 'apres' })
  }
  return out
}

// Distracteurs : autres mots de même catégorie, hors famille de sens identique
function distracteurs(rng: Rng, paires: readonly Paire[], paire: Paire, nb: number): string[] {
  const [m1, m2, cat, fam] = paire
  const candidats = new Set<string>()
  paires.forEach(p => {
    if (p === paire || p[2] !== cat) return
    if (fam && p[3] === fam) return
    if (p.includes(m1) || p.includes(m2)) return
    candidats.add(p[0]); candidats.add(p[1])
  })
  candidats.delete(m1); candidats.delete(m2)
  return rng.melanger([...candidats]).slice(0, nb)
}

interface EntreeDico { i: number, liste: string[] }
// Mots-repères : une « page » du dictionnaire = deux mots voisins dans la liste triée
function genererDictionnaire(d: Corpus): EntreeDico[] {
  const tous = [...Object.values(d.alpha || {}).flat(), ...Object.values(d.alpha3 || {}).flat()]
  const liste = trierAlpha(tous).filter((m, i, t) => i === 0 || collator.compare(m, t[i - 1]) !== 0)
  const out: EntreeDico[] = []
  for (let i = 1; i < liste.length - 1; i++) out.push({ i, liste })
  return out
}

/** Les réservoirs de chaque type, pour un niveau : une entrée du réservoir donne une question. */
interface Reservoirs {
  alpha: EntreeAlpha[]
  lettre: EntreeLettre[]
  dictionnaire: EntreeDico[]
  contraires: { p: Paire, inv: boolean }[]
  synonymes: { p: Paire, inv: boolean }[]
  definitions: { e: [string, string], tous: [string, string][] }[]
  contexte: NonNullable<Corpus['contexte']>
  homonymes: NonNullable<Corpus['homonymes']>
  sensFigure: NonNullable<Corpus['sensFigure']>
  familles: NonNullable<Corpus['familles']>
  categorie: { c: Categorie, cats: Categorie[] }[]
  intrus: { c: Categorie, cats: Categorie[] }[]
  prefixes: NonNullable<Corpus['prefixes']>
  suffixes: NonNullable<Corpus['suffixes']>
}

function construireReservoirs(rng: Rng, niveau: Classe): Reservoirs {
  const d = CORPUS[niveau] || CORPUS.ce1
  const cats = d.categories || []
  const paires = (t: readonly Paire[] | undefined): { p: Paire, inv: boolean }[] => (t || []).flatMap(p => [{ p, inv: false }, { p, inv: true }])
  return {
    alpha: genererAlpha(rng, d),
    lettre: genererLettres(),
    dictionnaire: genererDictionnaire(d),
    contraires: paires(d.contraires),
    synonymes: paires(d.synonymes),
    definitions: (d.definitions || []).map(e => ({ e, tous: d.definitions ?? [] })),
    contexte: d.contexte || [],
    homonymes: d.homonymes || [],
    sensFigure: d.sensFigure || [],
    familles: d.familles || [],
    categorie: cats.map(c => ({ c, cats })),
    intrus: cats.flatMap(c => [{ c, cats }, { c, cats }]),
    prefixes: d.prefixes || [],
    suffixes: d.suffixes || [],
  }
}

type Base = Pick<Question, 'type' | 'cle' | 'consigne'>
// Question à choix : propositions { label }, indice de la bonne ; `attendu` : la bonne proposition (texte)
const choix = (q: Base, propositions: string[], bonne: string): Pick<Question, 'type' | 'cle' | 'consigne' | 'mode' | 'choix' | 'options' | 'bonne' | 'attendu'> =>
  ({ ...q, mode: 'choix', choix: propositions, options: propositions.map(label => ({ label })), bonne: propositions.indexOf(bonne), attendu: bonne })

function construireQuestion(rng: Rng, type: TypeVocabulaire, e: unknown, d: Corpus): Question {
  const aleaDans = <X>(t: readonly X[]): X => t[rng.entier(0, t.length - 1)]
  const q: Base = { type, cle: type, consigne: tr => tr(`c_${type}`) }
  switch (type) {
    case 'alpha': {
      const x = e as EntreeAlpha
      const attendu = trierAlpha(x.mots)
      return { ...q, mode: 'ordre', etiquettes: x.mots, separateur: '→', attendu: attendu.join(' → '),
        explication: tr => tr(`exAlpha${x.memeLettre === 3 ? 3 : x.memeLettre === 2 ? 2 : 1}`),
        solution: attendu.join(' → ') }
    }
    case 'lettre': {
      const x = e as EntreeLettre
      const i = ALPHABET.indexOf(x.l)
      const bonne = x.sens === 'avant' ? ALPHABET[i - 1] : ALPHABET[i + 1]
      const autre = x.sens === 'avant' ? ALPHABET[i + 1] : ALPHABET[i - 1]
      const pool = [ALPHABET[i - 2], ALPHABET[i + 2]].filter(Boolean)
      const propositions = rng.melanger([bonne, autre, ...pool])
      const p = { l: x.l, a: ALPHABET[i - 1], c: ALPHABET[i + 1], r: b(bonne) }
      const avant = x.sens === 'avant'
      return { ...choix(q, propositions, bonne), html: tr => tr(avant ? 'lettreAvant' : 'lettreApres', { l: b(x.l) }),
        explication: tr => tr('exLettre', p),
        solution: tr => tr(avant ? 'solAvant' : 'solApres', p) }
    }
    case 'contraires': case 'synonymes': {
      const x = e as { p: Paire, inv: boolean }
      const paires = (type === 'contraires' ? d.contraires : d.synonymes) ?? []
      const [m1, m2] = x.p
      const mot = x.inv ? m2 : m1
      const bonne = x.inv ? m1 : m2
      const propositions = rng.melanger([bonne, ...distracteurs(rng, paires, x.p, 3)])
      return { ...choix(q, propositions, bonne), html: mot, lecture: mot,
        explication: tr => tr(type === 'contraires' ? 'exContraire' : 'exSynonyme', { r: bonne, m: mot }),
        solution: `${mot} → ${b(bonne)}` }
    }
    case 'definitions': {
      const x = e as { e: [string, string], tous: [string, string][] }
      const [mot, def] = x.e
      const autres = rng.melanger(x.tous.filter(y => y[0] !== mot)).slice(0, 3).map(y => y[0])
      return { ...choix(q, rng.melanger([mot, ...autres]), mot), html: `<em>${def}</em>`, lecture: def,
        explication: `${mot} : ${def}`,
        solution: `${def} → ${b(mot)}` }
    }
    case 'familles': {
      const [fam, intrus] = e as [string[], string]
      return { ...choix(q, rng.melanger([...fam, intrus]), intrus),
        explication: tr => tr('exFamille', { liste: fam.join(', '), f: fam[0], i: intrus }),
        solution: tr => tr('solIntrus', { liste: fam.join(', '), i: b(intrus) }) }
    }
    case 'categorie': {
      const x = e as { c: Categorie, cats: Categorie[] }
      const mots = rng.melanger(x.c.mots).slice(0, 4)
      const autres = rng.melanger(x.cats.filter(c => c !== x.c)).slice(0, 3).map(c => c.etiquette)
      return { ...choix(q, rng.melanger([x.c.etiquette, ...autres]), x.c.etiquette), html: mots.join(', '), lecture: mots.join(', '),
        explication: tr => tr('exCategorie', { e: x.c.etiquette }),
        solution: `${mots.join(', ')} → ${b(x.c.etiquette)}` }
    }
    case 'intrus': {
      const x = e as { c: Categorie, cats: Categorie[] }
      const mots = rng.melanger(x.c.mots).slice(0, 3)
      const autre = aleaDans(x.cats.filter(c => c !== x.c))
      const intrus = aleaDans(autre.mots)
      return { ...choix(q, rng.melanger([...mots, intrus]), intrus),
        explication: tr => tr('exIntrus', { liste: mots.join(', '), e: x.c.etiquette, i: intrus, un: autre.un }),
        solution: tr => tr('solIntrusCat', { liste: mots.join(', '), e: x.c.etiquette, i: b(intrus) }) }
    }
    case 'prefixes': {
      const [base, pre, sens] = e as [string, string, string]
      const mot = pre + base
      const noteIm = (tr: Tr): string => (pre === 'im' ? tr('noteIm') : '')
      return { ...choix(q, ['re', 'dé', 'in', 'im'], pre),
        html: `<span class="trou">___</span>${base}<div class="sens">= ${sens}</div>`,
        explication: tr => `${pre} + ${base} = ${mot} : ${sens}.${noteIm(tr)}`,
        solution: `${b(mot)} = ${sens}` }
    }
    case 'suffixes': {
      const [base, suf, sens, mot] = e as [string, string, string, string]
      return { ...choix(q, ['-eur', '-ette', '-ment', '-age', '-ier'], `-${suf}`),
        html: `${base}<span class="trou">___</span><div class="sens">= ${sens}</div>`,
        explication: `${base} + ${suf} = ${mot} : ${sens}.`,
        solution: `${b(mot)} = ${sens}` }
    }
    case 'dictionnaire': {
      const { i, liste } = e as EntreeDico
      const page = (j: number): string => `${liste[j - 1]} … ${liste[j + 1]}`
      const autres = rng.melanger(liste.map((_, j) => j).filter(j => j > 0 && j < liste.length - 1 && Math.abs(j - i) >= 3)).slice(0, 2)
      const bonne = page(i)
      return { ...choix(q, rng.melanger([bonne, ...autres.map(page)]), bonne), colonne: true, html: liste[i], lecture: liste[i],
        explication: tr => tr('exDico', { a: liste[i - 1], m: b(liste[i]), c: liste[i + 1] }),
        solution: tr => tr('solDico', { m: liste[i], a: b(liste[i - 1]), c: b(liste[i + 1]) }) }
    }
    case 'contexte': {
      const [phrase, mot, sens, autres] = e as [string, string, string, string[]]
      const html = phrase.replace(new RegExp(`(^|[^\\p{L}])(${mot})(?![\\p{L}])`, 'u'), `$1${b(mot)}`)
      return { ...choix(q, rng.melanger([sens, ...autres]), sens), colonne: true, html, lecture: phrase,
        explication: tr => tr('exContexte', { m: mot, s: sens }),
        solution: `${html} → ${sens}` }
    }
    case 'homonymes': {
      const [phrase, mot, autres, sens] = e as [string, string, string[], string]
      return { ...choix(q, rng.melanger([mot, ...autres]), mot), html: phrase.replace('___', '<span class="trou">___</span>'),
        explication: `« ${mot} » : ${sens}.`,
        solution: phrase.replace('___', b(mot)) }
    }
    case 'sensFigure': {
      const [phrase, sens, expl] = e as [string, string, string]
      const bonne = sens === 'propre' ? 'sens propre' : 'sens figuré'
      return { ...choix({ ...q, consigne: tr => tr('c_sensFigurePhrase') }, ['sens propre', 'sens figuré'], bonne),
        html: phrase, lecture: phrase,
        explication: expl, solution: tr => `${phrase} → ${b(libelleChoix(tr, bonne))}. ${expl}` }
    }
  }
}

function genererQuestions(rng: Rng, niveau: Classe, types: readonly string[], nb: number): Question[] {
  const res = construireReservoirs(rng, niveau)
  const dispo = typesDuNiveau(niveau)
  // dans l'ordre des types du niveau (bonus à sa place) : l'ordre du tirage, donc la fiche, n'en dépend pas
  let ok = dispo.filter(t => types.includes(t) && res[t].length)
  if (!ok.length) ok = [dispo[0]]
  const pools: Partial<Record<TypeVocabulaire, unknown[]>> = {}
  const ordreTypes: TypeVocabulaire[] = []
  while (ordreTypes.length < nb) ordreTypes.push(...rng.melanger(ok))
  ordreTypes.length = nb
  const vus = new Set<string>()
  const deja = new Set<string>()
  return rng.melanger(ordreTypes).flatMap(type => {
    let q: Question | null = null
    for (let k = 0; k < 20; k++) {
      if (!pools[type] || pools[type].length === 0) pools[type] = rng.melanger(res[type] as unknown[])
      q = construireQuestion(rng, type, pools[type].pop(), CORPUS[niveau] || CORPUS.ce1)
      // évite deux fois le même mot à trouver (ex. contraire dans les deux sens), et jamais deux fois la même question
      if (!vus.has(type + q.attendu) && !deja.has(cleQuestion(q))) break
    }
    // réservoir épuisé (peu de préfixes, peu de phrases au sens figuré) : la question est retirée plutôt que répétée
    if (!q || deja.has(cleQuestion(q))) return []
    vus.add(type + q.attendu)
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
  return rep.ordre.map(k => q.etiquettes?.[k]).join(' → ') === q.attendu
}
export function bonneReponse(q: Question): Reponse {
  if (q.mode === 'ordre') return { ordre: q.attendu.split(' → ').map(mot => (q.etiquettes ?? []).indexOf(mot)) }
  return { choix: q.bonne ?? 0 }
}
export function mauvaiseReponse(q: Question): Reponse {
  if (q.mode === 'ordre') {
    // le bon ordre, les deux premiers échangés
    const o = q.attendu.split(' → ').map(mot => (q.etiquettes ?? []).indexOf(mot))
    return { ordre: [o[1], o[0], ...o.slice(2)] }
  }
  return { choix: ((q.bonne ?? 0) + 1) % (q.options?.length ?? 2) }
}

// ── Programme : seuls les types du programme du niveau (les bonus et ceux d'un autre niveau sont des écarts) ──
export function ecartsAuProgramme(x: readonly Question[] | TirageFiche, contraintes: Contraintes): string[] {
  const niveau = contraintes.niveau as Classe
  const liste = Array.isArray(x) ? (x as readonly Question[]) : (x as TirageFiche).questions
  const permis = typesDuNiveau(niveau).filter(t => !(niveau === 'ce2' && t === 'homonymes'))
  return liste.filter(q => !permis.includes(q.type)).map(q => `${q.type} : exercice hors du programme ${niveau}`)
}
