// Vocabulaire — générateur (pur : aucun import de Vue, aucun Math.random ; lisible par node).
//   questions({ niveau, reglages, rng, nb? })       une partie : nb questions réparties entre les types choisis
//   questionsFiche({ niveau, reglages, rng })        { niveau, questions } de la fiche (fiche.js les met en page)
//   verifier(q, rep)                                 rep : { choix } (indice) ou { ordre } (indices d'étiquettes)
//   bonneReponse(q)                                  une réponse juste (tests)
//   ecartsAuProgramme(x, contraintes)                types hors du programme du niveau (bonus compris)
//   manquesAuProgramme(reglages, contraintes)        types du niveau que « tout au programme » ne propose pas
// Les textes affichés (consigne, explication, solution) sont des fonctions de T (`valeur(q.consigne, T)`), appelées par
// la vue avec t (langue de l'interface) et par fiche.js avec T (français). Corpus : src/data/vocabulaire.js.
// L'ordre des tirages est celui de l'ancienne vue : même flux de hasard, mêmes fiches.
import DEFINITION, { typesDuNiveau } from './definition.js'
import { DONNEES, ALPHABET } from '../../data/vocabulaire.js'

const niveauConnu = niveau => (DEFINITION.niveaux[niveau] ? niveau : DEFINITION.niveauDefaut)

/** Texte fixe ou fonction de T (texte calculé selon la langue). */
export const valeur = (x, T) => (typeof x === 'function' ? x(T) : x)

/** Libellé d'une proposition : seuls « sens propre / figuré » sont des mots d'interface. */
export const libelleChoix = (T, c) => (c === 'sens propre' ? T('sensPropre') : c === 'sens figuré' ? T('sensFigure') : c)

const collator = new Intl.Collator('fr', { sensitivity: 'base' })
const trierAlpha = mots => [...mots].sort(collator.compare)
const b = s => `<strong>${s}</strong>`

// Questions d'ordre alphabétique générées à l'avance (dédoublonnées)
function genererAlpha(rng, d) {
  const aleaDans = t => t[rng.entier(0, t.length - 1)]
  const lettres = Object.keys(d.alpha)
  const out = new Map()
  for (let k = 0; k < 400 && out.size < 80; k++) {
    let mots, memeLettre
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

function genererLettres() {
  const out = []
  for (let i = 1; i < ALPHABET.length - 1; i++) {
    out.push({ l: ALPHABET[i], sens: 'avant' })
    out.push({ l: ALPHABET[i], sens: 'apres' })
  }
  return out
}

// Distracteurs : autres mots de même catégorie, hors famille de sens identique
function distracteurs(rng, paires, paire, nb) {
  const [m1, m2, cat, fam] = paire
  const candidats = new Set()
  paires.forEach(p => {
    if (p === paire || p[2] !== cat) return
    if (fam && p[3] === fam) return
    if (p.includes(m1) || p.includes(m2)) return
    candidats.add(p[0]); candidats.add(p[1])
  })
  candidats.delete(m1); candidats.delete(m2)
  return rng.melanger([...candidats]).slice(0, nb)
}

// Mots-repères : une « page » du dictionnaire = deux mots voisins dans la liste triée
function genererDictionnaire(d) {
  const tous = [...Object.values(d.alpha || {}).flat(), ...Object.values(d.alpha3 || {}).flat()]
  const liste = trierAlpha(tous).filter((m, i, t) => i === 0 || collator.compare(m, t[i - 1]) !== 0)
  const out = []
  for (let i = 1; i < liste.length - 1; i++) out.push({ i, liste })
  return out
}

function construireReservoirs(rng, niveau) {
  const d = DONNEES[niveau] || DONNEES.ce1
  const cats = d.categories || []
  const paires = t => (t || []).flatMap(p => [{ p, inv: false }, { p, inv: true }])
  return {
    alpha: genererAlpha(rng, d),
    lettre: genererLettres(),
    dictionnaire: genererDictionnaire(d),
    contraires: paires(d.contraires),
    synonymes: paires(d.synonymes),
    definitions: (d.definitions || []).map(e => ({ e, tous: d.definitions })),
    contexte: d.contexte || [],
    homonymes: d.homonymes || [],
    sensFigure: d.sensFigure || [],
    familles: d.familles || [],
    categorie: cats.map(c => ({ c, cats })),
    intrus: cats.flatMap(c => [{ c, cats }, { c, cats }]),
    prefixes: d.prefixes || [],
    suffixes: d.suffixes || [],
    _d: d,
  }
}

// Question à choix : propositions { label }, indice de la bonne ; `attendu` : la bonne proposition (texte)
function choix(q, propositions, bonne) {
  return { ...q, mode: 'choix', choix: propositions, options: propositions.map(label => ({ label })), bonne: propositions.indexOf(bonne), attendu: bonne }
}

function construireQuestion(rng, type, e, d) {
  const aleaDans = t => t[rng.entier(0, t.length - 1)]
  const q = { type, cle: type, consigne: T => T('c_' + type) }
  switch (type) {
    case 'alpha': {
      const attendu = trierAlpha(e.mots)
      return { ...q, mode: 'ordre', etiquettes: e.mots, separateur: '→', attendu: attendu.join(' → '),
        explication: T => T('exAlpha' + (e.memeLettre === 3 ? 3 : e.memeLettre === 2 ? 2 : 1)),
        solution: attendu.join(' → ') }
    }
    case 'lettre': {
      const i = ALPHABET.indexOf(e.l)
      const bonne = e.sens === 'avant' ? ALPHABET[i - 1] : ALPHABET[i + 1]
      const autre = e.sens === 'avant' ? ALPHABET[i + 1] : ALPHABET[i - 1]
      const pool = [ALPHABET[i - 2], ALPHABET[i + 2]].filter(Boolean)
      const propositions = rng.melanger([bonne, autre, ...pool])
      const p = { l: e.l, a: ALPHABET[i - 1], c: ALPHABET[i + 1], r: b(bonne) }
      const avant = e.sens === 'avant'
      return { ...choix(q, propositions, bonne), html: T => T(avant ? 'lettreAvant' : 'lettreApres', { l: b(e.l) }),
        explication: T => T('exLettre', p),
        solution: T => T(avant ? 'solAvant' : 'solApres', p) }
    }
    case 'contraires': case 'synonymes': {
      const paires = type === 'contraires' ? d.contraires : d.synonymes
      const [m1, m2] = e.p
      const mot = e.inv ? m2 : m1
      const bonne = e.inv ? m1 : m2
      const propositions = rng.melanger([bonne, ...distracteurs(rng, paires, e.p, 3)])
      return { ...choix(q, propositions, bonne), html: mot, lecture: mot,
        explication: T => T(type === 'contraires' ? 'exContraire' : 'exSynonyme', { r: bonne, m: mot }),
        solution: `${mot} → ${b(bonne)}` }
    }
    case 'definitions': {
      const [mot, def] = e.e
      const autres = rng.melanger(e.tous.filter(x => x[0] !== mot)).slice(0, 3).map(x => x[0])
      return { ...choix(q, rng.melanger([mot, ...autres]), mot), html: `<em>${def}</em>`, lecture: def,
        explication: `${mot} : ${def}`,
        solution: `${def} → ${b(mot)}` }
    }
    case 'familles': {
      const [fam, intrus] = e
      return { ...choix(q, rng.melanger([...fam, intrus]), intrus),
        explication: T => T('exFamille', { liste: fam.join(', '), f: fam[0], i: intrus }),
        solution: T => T('solIntrus', { liste: fam.join(', '), i: b(intrus) }) }
    }
    case 'categorie': {
      const mots = rng.melanger(e.c.mots).slice(0, 4)
      const autres = rng.melanger(e.cats.filter(c => c !== e.c)).slice(0, 3).map(c => c.etiquette)
      return { ...choix(q, rng.melanger([e.c.etiquette, ...autres]), e.c.etiquette), html: mots.join(', '), lecture: mots.join(', '),
        explication: T => T('exCategorie', { e: e.c.etiquette }),
        solution: `${mots.join(', ')} → ${b(e.c.etiquette)}` }
    }
    case 'intrus': {
      const mots = rng.melanger(e.c.mots).slice(0, 3)
      const autre = aleaDans(e.cats.filter(c => c !== e.c))
      const intrus = aleaDans(autre.mots)
      return { ...choix(q, rng.melanger([...mots, intrus]), intrus),
        explication: T => T('exIntrus', { liste: mots.join(', '), e: e.c.etiquette, i: intrus, un: autre.un }),
        solution: T => T('solIntrusCat', { liste: mots.join(', '), e: e.c.etiquette, i: b(intrus) }) }
    }
    case 'prefixes': {
      const [base, pre, sens] = e
      const mot = pre + base
      const noteIm = T => (pre === 'im' ? T('noteIm') : '')
      return { ...choix(q, ['re', 'dé', 'in', 'im'], pre),
        html: `<span class="trou">___</span>${base}<div class="sens">= ${sens}</div>`,
        explication: T => `${pre} + ${base} = ${mot} : ${sens}.${noteIm(T)}`,
        solution: `${b(mot)} = ${sens}` }
    }
    case 'suffixes': {
      const [base, suf, sens, mot] = e
      return { ...choix(q, ['-eur', '-ette', '-ment', '-age', '-ier'], '-' + suf),
        html: `${base}<span class="trou">___</span><div class="sens">= ${sens}</div>`,
        explication: `${base} + ${suf} = ${mot} : ${sens}.`,
        solution: `${b(mot)} = ${sens}` }
    }
    case 'dictionnaire': {
      const { i, liste } = e
      const page = j => `${liste[j - 1]} … ${liste[j + 1]}`
      const autres = rng.melanger(liste.map((_, j) => j).filter(j => j > 0 && j < liste.length - 1 && Math.abs(j - i) >= 3)).slice(0, 2)
      const bonne = page(i)
      return { ...choix(q, rng.melanger([bonne, ...autres.map(page)]), bonne), colonne: true, html: liste[i], lecture: liste[i],
        explication: T => T('exDico', { a: liste[i - 1], m: b(liste[i]), c: liste[i + 1] }),
        solution: T => T('solDico', { m: liste[i], a: b(liste[i - 1]), c: b(liste[i + 1]) }) }
    }
    case 'contexte': {
      const [phrase, mot, sens, autres] = e
      const html = phrase.replace(new RegExp(`(^|[^\\p{L}])(${mot})(?![\\p{L}])`, 'u'), `$1${b(mot)}`)
      return { ...choix(q, rng.melanger([sens, ...autres]), sens), colonne: true, html, lecture: phrase,
        explication: T => T('exContexte', { m: mot, s: sens }),
        solution: `${html} → ${sens}` }
    }
    case 'homonymes': {
      const [phrase, mot, autres, sens] = e
      return { ...choix(q, rng.melanger([mot, ...autres]), mot), html: phrase.replace('___', '<span class="trou">___</span>'),
        explication: `« ${mot} » : ${sens}.`,
        solution: phrase.replace('___', b(mot)) }
    }
    case 'sensFigure': {
      const [phrase, sens, expl] = e
      const bonne = sens === 'propre' ? 'sens propre' : 'sens figuré'
      return { ...choix({ ...q, consigne: T => T('c_sensFigurePhrase') }, ['sens propre', 'sens figuré'], bonne),
        html: phrase, lecture: phrase,
        explication: expl, solution: T => `${phrase} → ${b(libelleChoix(T, bonne))}. ${expl}` }
    }
  }
  return null
}

function genererQuestions(rng, niveau, types, nb) {
  const res = construireReservoirs(rng, niveau)
  const dispo = typesDuNiveau(niveau)
  let ok = types.filter(t => dispo.includes(t) && res[t] && res[t].length)
  if (!ok.length) ok = [dispo[0]]
  const pools = {}
  const ordreTypes = []
  while (ordreTypes.length < nb) ordreTypes.push(...rng.melanger(ok))
  ordreTypes.length = nb
  const vus = new Set()
  return rng.melanger(ordreTypes).map(type => {
    let q = null
    for (let k = 0; k < 20; k++) {
      if (!pools[type] || pools[type].length === 0) pools[type] = rng.melanger(res[type])
      q = construireQuestion(rng, type, pools[type].pop(), res._d)
      // évite deux fois le même mot à trouver (ex. contraire dans les deux sens)
      if (!vus.has(type + q.attendu)) break
    }
    vus.add(type + q.attendu)
    return q
  })
}

/** Une partie : `nb` questions (réglage `nb` par défaut) réparties entre les types cochés. */
export function questions({ niveau, reglages, rng, nb }) {
  return genererQuestions(rng, niveauConnu(niveau), reglages.types ?? [], nb ?? reglages.nb ?? 10)
}

/** Questions de la fiche : { niveau, questions }. */
export function questionsFiche({ niveau, reglages, rng }) {
  const n = niveauConnu(niveau)
  return { niveau: n, questions: genererQuestions(rng, n, reglages.types ?? [], reglages.nb ?? 10) }
}

// ── Réponses : indice choisi (rep.choix), indices des étiquettes dans l'ordre placé (rep.ordre)
export function verifier(q, rep) {
  if (rep?.choix !== undefined) return rep.choix === q.bonne
  if (rep?.ordre) return rep.ordre.map(k => q.etiquettes[k]).join(' → ') === q.attendu
  return false
}

export function bonneReponse(q) {
  if (q.mode === 'ordre') return { ordre: q.attendu.split(' → ').map(mot => q.etiquettes.indexOf(mot)) }
  return { choix: q.bonne }
}

// ── Programme : seuls les types du programme du niveau (les bonus et ceux d'un autre niveau sont des écarts) ──
export function ecartsAuProgramme(x, contraintes) {
  const niveau = contraintes.niveau
  const liste = Array.isArray(x) ? x : x.questions
  const bonus = DEFINITION.niveaux[niveau]?.bonus?.types ?? []
  const permis = typesDuNiveau(niveau).filter(t => !bonus.includes(t))
  return liste.filter(q => !permis.includes(q.type)).map(q => `${q.type} : exercice hors du programme ${niveau}`)
}

export function manquesAuProgramme(reglages, contraintes) {
  const niveau = contraintes.niveau
  const bonus = DEFINITION.niveaux[niveau]?.bonus?.types ?? []
  const choisis = reglages.types ?? []
  return typesDuNiveau(niveau).filter(t => !bonus.includes(t) && !choisis.includes(t)).map(t => `exercice ${t} non proposé`)
}
