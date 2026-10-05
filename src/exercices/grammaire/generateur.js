// Grammaire — générateur (pur : aucun import de Vue, aucun Math.random ; lisible par node).
//   questions({ niveau, reglages, rng, nb? })       une partie : nb questions réparties entre les types choisis
//   questionsFiche({ niveau, reglages, rng })        { niveau, questions } de la fiche (fiche.js les met en page)
//   verifier(q, rep)                                 rep : { choix } (indice), { selection } (indices de mots),
//                                                    { ordre } (indices d'étiquettes), { texte } (saisie)
//   bonneReponse(q)                                  une réponse juste (tests)
//   ecartsAuProgramme(x, contraintes)                types, natures, pluriels et accords hors du programme du niveau
//   ecartsFiche(html, contraintes)                   idem, lus dans le HTML de la fiche (data-type)
//   manquesAuProgramme(reglages, contraintes)        types du niveau que « tout au programme » ne propose pas
// Les textes affichés (consigne, explication, solution, libellés de choix) dépendent de la langue de l'interface en
// jeu et du français sur la fiche : ce sont des fonctions de T (`q.consigne(T)`, `valeur(q.solution, T)`), appelées
// par la vue avec t (interface) ou par fiche.js avec T (français).
// L'ordre des tirages est celui de l'ancienne vue : même flux de hasard, mêmes fiches. Corpus : src/data/grammaire.js.
import DEFINITION, { typesDuNiveau } from './definition.js'
import { DONNEES, ADJECTIFS } from '../../data/grammaire.js'
import { verdictSaisie } from '../../utils/reponses.js'

const CM = ['cm1', 'cm2']
// le CM reprend les phrases du CE2 (avec les exercices de son niveau)
const baseDe = niveau => (CM.includes(niveau) ? 'ce2' : niveau)
const niveauConnu = niveau => (DEFINITION.niveaux[niveau] ? niveau : DEFINITION.niveauDefaut)

/** Texte fixe ou fonction de T (texte calculé selon la langue). */
export const valeur = (x, T) => (typeof x === 'function' ? x(T) : x)

// Choix « métalangage » traduits dans l'interface : clé du catalogue (les choix en français étudié restent tels quels)
const CHOIX = {
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
}
/** Libellé d'un choix dans la langue de T. */
export const tc = (T, c) => (CHOIX[c] ? T(CHOIX[c]) : c)

const NATURES = { d: 'det', n: 'nom', N: 'nom', v: 'verbe', a: 'adj', p: 'pronom', x: 'autre' }
const NOM_NATURE = { det: 'déterminant', nom: 'nom', verbe: 'verbe', adj: 'adjectif', pronom: 'pronom' }

// ── Analyse d'une phrase annotée → liste de tokens (syntaxe : src/data/grammaire.js)
function analyserPhrase(src) {
  const tokens = []
  let gn = null, cp = null
  let dansSujet = false, dansCV = false, groupeCP = null
  for (let brut of src.trim().split(/\s+/)) {
    while (brut.length > 1 && '[{<'.includes(brut[0])) {
      if (brut[0] === '[') dansSujet = true
      if (brut[0] === '{') groupeCP = []
      if (brut[0] === '<') dansCV = true
      brut = brut.slice(1)
    }
    const fins = []
    for (let m; (m = brut.match(/(\](ms|fs|mp|fp|-)|\}([oq])|>)$/)) && brut.length > m[0].length;) {
      fins.unshift(m)
      brut = brut.slice(0, -m[0].length)
    }
    let tok
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
      if (m[0].startsWith(']')) { gn = m[2] === '-' ? null : m[2]; dansSujet = false }
      else if (m[0].startsWith('}')) { cp = m[3]; groupeCP = null }
      else dansCV = false
    }
  }
  return { src, tokens, gn, cp }
}

// ── Reconstitution du texte (typographie française)
export function texteTokens(tokens, avecMarques = null) {
  let s = ''
  tokens.forEach((t, i) => {
    const mot = avecMarques ? avecMarques(t, i) : t.m
    if (i > 0) {
      const prec = tokens[i - 1]
      if (t.m === '.' || t.m === ',') s += ''
      else if (t.m === '?' || t.m === '!') s += ' '
      else if (prec.m.endsWith('\'')) s += ''
      else s += ' '
    }
    s += mot
  })
  return s
}

const majuscule = s => s.charAt(0).toUpperCase() + s.slice(1)
const minuscule = s => s.charAt(0).toLowerCase() + s.slice(1)
const indicesOu = (tokens, pred) => tokens.map((t, i) => (pred(t) ? i : -1)).filter(i => i >= 0)

const PRONOM_TONIQUE = { Je: 'moi', Tu: 'toi', Il: 'lui', Elle: 'elle', Nous: 'nous', Vous: 'vous', Ils: 'eux', Elles: 'elles' }

const aSujet = p => p.tokens.some(t => t.sujet)
const sujetInverse = p => aSujet(p) && p.tokens.findIndex(t => t.sujet) > p.tokens.findIndex(t => t.n === 'verbe')

// Texte d'un groupe de mots (minuscule initiale sauf nom propre)
function texteGroupe(p, pred) {
  const g = p.tokens.filter(pred)
  return texteTokens(g.map((t, i) => ((i === 0 && !t.propre && t.n !== 'pronom') ? { ...t, m: minuscule(t.m) } : t)))
}
const texteSujet = p => texteGroupe(p, t => t.sujet)

// « C'est le petit chat qui dort sur le canapé. » / « Ce sont des loups qui vivent dans la forêt. »
function phraseCestQui(p) {
  const st = p.tokens.filter(t => t.sujet)
  const iv = p.tokens.findIndex(t => t.n === 'verbe')
  let reste = p.tokens.slice(iv).filter(t => t.n !== 'ponct' && !t.sujet)
  if (sujetInverse(p)) {
    const avant = p.tokens.slice(0, iv).filter(t => t.n !== 'ponct')
    reste = [...reste, ...avant.map((t, i) => ((i === 0 && !t.propre) ? { ...t, m: minuscule(t.m) } : t))]
  }
  const verbe = texteTokens(reste)
  let sujet, pluriel
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

const pronomDe = gn => ({ ms: 'il', fs: 'elle', mp: 'ils', fp: 'elles' }[gn])

function phraseAvecPronom(p) {
  const pr = pronomDe(p.gn)
  const out = []
  let place = false
  p.tokens.forEach((t, i) => {
    if (t.sujet) {
      if (!place) { out.push({ m: i === 0 ? majuscule(pr) : pr, n: 'pronom' }); place = true }
    } else out.push(t)
  })
  return texteTokens(out)
}

const u = s => `<u>${s}</u>`
const b = s => `<strong>${s}</strong>`

function surligner(p, indices, balise = b) {
  const set = new Set(indices)
  return texteTokens(p.tokens, (t, i) => (set.has(i) ? balise(t.m) : t.m))
}

// Souligne un groupe de mots contigu (sujet, complément…)
function surlignerGroupe(p, pred, balise = u) {
  const idx = indicesOu(p.tokens, pred)
  const debut = texteTokens(p.tokens.slice(0, idx[0]))
  const groupe = texteTokens(p.tokens.slice(idx[0], idx[idx.length - 1] + 1))
  const reste = texteTokens(p.tokens.slice(idx[idx.length - 1] + 1))
  let s = debut ? debut + (debut.endsWith('\'') ? '' : ' ') : ''
  s += balise(groupe)
  if (reste) s += (/^[.,]/.test(reste) ? '' : /^[?!]/.test(reste) ? ' ' : ' ') + reste
  return s
}
const surlignerSujet = (p, balise = u) => surlignerGroupe(p, t => t.sujet, balise)

// Une phrase est utilisable pour « remettre dans l'ordre » si elle est courte, sans virgule
// et sans adjectif déplaçable vers un autre nom (pour éviter plusieurs réponses justes).
function ordrePossible(p) {
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

function etiquettesDe(p) {
  // Fusionne les élisions (l' + arbre → l'arbre) en une seule étiquette
  const etiq = []
  const mots = p.tokens.filter(t => t.n !== 'ponct')
  for (let i = 0; i < mots.length; i++) {
    if (mots[i].m.endsWith('\'') && i + 1 < mots.length) { etiq.push(mots[i].m + mots[i + 1].m); i++ }
    else etiq.push(mots[i].m)
  }
  return etiq
}

// ── Forme négative
const joindre = (...parts) => parts.filter(Boolean).join(' ')
const commenceParVoyelle = mot => /^[aâàeéèêiîoôuûyh]/i.test(mot)

// e : [avant, verbe, après] (CE1, ne… pas) ou [affirmative, avant, verbe, après, mot] (CE2)
function negationDe(e) {
  const [aff, avant, verbe, apres, mot] = e.length === 3
    ? [joindre(e[0], e[1], e[2]) + '.', e[0], e[1], e[2], 'pas'] : e
  const elide = commenceParVoyelle(verbe)
  const ne = elide ? `n'${verbe}` : `ne ${verbe}`
  const neg = joindre(avant, ne, mot, apres) + '.'
  const faux = [
    joindre(avant, verbe, mot, apres) + '.',                              // oubli de « ne »
    elide ? joindre(avant, 'ne', verbe, mot, apres) + '.'                 // « ne » non élidé
      : joindre(avant, 'ne', mot, verbe, apres) + '.',                    // mots mal placés
  ]
  return { aff, neg, mot, elide, faux }
}

// Consignes (catalogue : consigne_<type>, ou consigne_<niveau>_<type> pour les consignes propres à un niveau)
const CONSIGNES_NIVEAU = { ce2: ['verbe', 'negReconnaitre'] }
const consigneDe = (type, niveau) => T =>
  T(CONSIGNES_NIVEAU[baseDe(niveau)]?.includes(type) ? `consigne_${baseDe(niveau)}_${type}` : `consigne_${type}`)
// Consignes de la fiche (catalogue : fiche_<type>, ou fiche_<niveau>_<type> pour un niveau)
export const consigneFiche = (T, type, niveau) =>
  T(CONSIGNES_NIVEAU[baseDe(niveau)]?.includes(type) ? `fiche_${baseDe(niveau)}_${type}` : `fiche_${type}`)

// Règles du pluriel (catalogue : regle_<cle>)
const regleDe = cle => T => T(`regle_${cle}`)

// Construit les « réservoirs » d'éléments pour chaque type d'exercice
function construireReservoirs(niveau) {
  const d = DONNEES[baseDe(niveau)] || DONNEES.ce1
  const phrases = d.phrases.map(analyserPhrase)
  const gns = (d.groupesNominaux || []).map(analyserPhrase)
  // les groupes nominaux servent aussi à repérer noms, déterminants et adjectifs
  const avec = n => [...phrases, ...gns].filter(p => p.tokens.some(t => t.n === n))
  const nature = []
  phrases.forEach(p => p.tokens.forEach((t, i) => { if (NOM_NATURE[t.n]) nature.push({ p, i }) }))
  const nombre = []
  ;(d.pluriels || []).forEach(([s, pl]) => { nombre.push({ gn: s, n: 's' }); nombre.push({ gn: pl, n: 'p' }) })
  const cpltNature = []
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
    cplt: phrases.filter(p => p.cp),
    cpltQ: phrases.filter(p => p.cp),
    cpltNature,
    genre: d.genre || [],
    nombre,
    // CE1 : pluriel en -s seulement (les pluriels en -x arrivent au CE2, BO n° 41 p. 94)
    pluriel: (d.pluriels || []).filter(([, , regle]) => niveau !== 'ce1' || !['eau', 'eu'].includes(regle)),
    accordGN: (d.accordsGN || []).map(a => ({ a, formes: ADJECTIFS[a[2]] })),
    accordSV: d.accordsSV || [],
  }
}

const LIB_SIGNES = { '.': '. (point)', '?': '? (point d\'interrogation)', '!': '! (point d\'exclamation)' }
// Type de phrase selon le signe de fin (catalogue : typePhrase_<nom du signe>)
const NOM_SIGNE = { '.': 'point', '?': 'interrogation', '!': 'exclamation' }
const LIB_CPLT = { o: 'Où ?', q: 'Quand ?' }
const libGN = (T, g) => T(`gn_${g}`)
const nombreDe = (T, n) => T(`nombre_${n}`)
const ne_ = elide => (elide ? 'n\'' : 'ne')

// Question à choix : propositions { label } (le libellé est traduit par la vue avec tc), indice de la bonne
function choix(q, propositions, bonne) {
  return { ...q, mode: 'choix', choix: propositions, options: propositions.map(label => ({ label })), bonne: propositions.indexOf(bonne), attendu: bonne }
}

function construireQuestion(rng, type, e, niveau = 'ce1') {
  const q = { type, cle: type, consigne: consigneDe(type, niveau) }
  switch (type) {
    case 'ordre': {
      const etiq = etiquettesDe(e)
      let melange = rng.melanger(etiq)
      for (let k = 0; k < 10 && melange.join(' ') === etiq.join(' '); k++) melange = rng.melanger(etiq)
      const fin = e.tokens[e.tokens.length - 1].m
      return { ...q, mode: 'ordre', etiquettes: melange, fin,
        attendu: etiq.join(' '), solution: texteTokens(e.tokens) }
    }
    case 'phrase': {
      const bonne = e.ok ? 'Oui, c\'est une phrase' : 'Non, ce n\'est pas une phrase'
      const expl = T => (e.ok
        ? T('expl_phraseOk')
        : e.r === 'verbe' ? T('expl_phraseVerbe') : T('expl_phraseOrdre'))
      return { ...choix(q, ['Oui, c\'est une phrase', 'Non, ce n\'est pas une phrase'], bonne), html: e.t, lecture: e.ok ? e.t : null,
        explication: expl,
        solution: T => `« ${e.t} » → ${tc(T, bonne).toLowerCase()}. ${expl(T)}` }
    }
    case 'majuscule': {
      const juste = texteTokens(e.tokens)
      const sansMaj = minuscule(juste)
      const sansPoint = juste.slice(0, -1)
      return { ...choix(q, rng.melanger([juste, sansMaj, sansPoint]), juste), colonne: true, lecture: juste,
        explication: T => T('expl_majuscule'),
        solution: juste }
    }
    case 'ponctuation': {
      const typ = T => T(`typePhrase_${NOM_SIGNE[e.s]}`)
      return { ...choix(q, ['.', '?', '!'].map(s => LIB_SIGNES[s]), LIB_SIGNES[e.s]), html: `${e.t} <span class="trou">…</span>`,
        explication: T => T('expl_ponctuation', { type: typ(T) }),
        solution: T => `${e.t}${e.s === '.' ? '' : ' '}${b(e.s)} (${typ(T)})` }
    }
    case 'complexe': {
      const iv = indicesOu(e.tokens, t => t.n === 'verbe')
      const bonne = iv.length > 1 ? 'phrase complexe' : 'phrase simple'
      const verbes = iv.map(i => `« ${e.tokens[i].m} »`).join(', ')
      return { ...choix(q, ['phrase simple', 'phrase complexe'], bonne), html: texteTokens(e.tokens), lecture: texteTokens(e.tokens),
        explication: T => (iv.length > 1
          ? T('expl_complexe', { n: iv.length, verbes })
          : T('expl_simple', { verbes })),
        solution: T => `${surligner(e, iv, u)} → ${tc(T, bonne)}` }
    }
    case 'negation': {
      return { ...choix(q, rng.melanger([e.neg, ...e.faux]), e.neg), colonne: true,
        html: T => e.aff + (e.mot !== 'pas' ? `<div class="sens">${T('avec')} « ne … ${e.mot} »</div>` : ''),
        lecture: e.aff,
        explication: T => T('expl_negation', { ne: ne_(e.elide), mot: e.mot, elision: e.elide ? T('expl_negationElision') : '' }),
        solution: `${e.aff} → ${b(e.neg)}`, mot: e.mot }
    }
    case 'negReconnaitre': {
      const n = e.n
      const phrase = e.neg ? n.neg : n.aff
      const ce1 = niveau === 'ce1'
      const propositions = ce1 ? ['affirmative', 'négative']
        : ['affirmative', 'ne … pas', 'ne … plus', 'ne … jamais', 'ne … rien']
      const bonne = !e.neg ? 'affirmative' : ce1 ? 'négative' : `ne … ${n.mot}`
      return { ...choix(q, propositions, bonne), html: phrase, lecture: phrase,
        explication: T => (e.neg
          ? T('expl_negative', { ne: ne_(n.elide), mot: n.mot })
          : T('expl_affirmative')),
        solution: T => `${phrase} → ${tc(T, bonne)}` }
    }
    case 'verbe': case 'nom': case 'det': case 'adj': case 'sujet': case 'cplt': case 'gnNoyau': {
      const pred = type === 'sujet' ? (t => t.sujet)
        : type === 'cplt' ? (t => t.cp)
          : type === 'gnNoyau' ? (t => t.n === 'nom')
            : (t => t.n === type)
      const cibles = indicesOu(e.tokens, pred)
      let explication
      if (type === 'sujet') {
        explication = T => {
          let x = T('expl_sujet', { sujet: texteSujet(e), cestQui: phraseCestQui(e) })
          if (sujetInverse(e)) x += T('expl_sujetInverse')
          return x
        }
      } else if (type === 'cplt') {
        explication = T => T('expl_cplt', { groupe: texteGroupe(e, pred), question: T(e.cp === 'o' ? 'expl_cpltOu' : 'expl_cpltQuand') })
      } else if (type === 'gnNoyau') {
        explication = T => T('expl_gnNoyau', { nom: e.tokens[cibles[0]].m })
      } else if (type === 'verbe') {
        const vs = cibles.map(i => `« ${e.tokens[i].m} »`).join(', ')
        explication = T => (cibles.length > 1
          ? T('expl_verbes', { verbes: vs })
          : T('expl_verbe', { verbes: vs }))
      } else {
        const mots = cibles.map(i => `« ${e.tokens[i].m} »`).join(', ')
        const pl = cibles.length > 1
        explication = T => `${T(`lib_${type}${pl ? 's' : ''}`)} : ${mots}.`
      }
      const solution = (type === 'sujet' || type === 'cplt') ? surlignerGroupe(e, pred)
        : surligner(e, cibles, type === 'verbe' ? u : b)
      return { ...q, mode: 'clic', tokens: e.tokens, cibles, lecture: texteTokens(e.tokens), explication, solution }
    }
    case 'cpltQ': {
      const bonne = LIB_CPLT[e.cp]
      const groupe = texteGroupe(e, t => t.cp)
      return { ...choix(q, ['Où ?', 'Quand ?'], bonne), html: surlignerGroupe(e, t => t.cp), lecture: texteTokens(e.tokens),
        explication: T => T('expl_cpltQ', { groupe, quoi: T(e.cp === 'o' ? 'expl_cpltQLieu' : 'expl_cpltQMoment') }),
        solution: T => `${surlignerGroupe(e, t => t.cp)} → ${tc(T, bonne)}` }
    }
    case 'cpltNature': {
      const pred = e.g === 'cp' ? (t => t.cp) : (t => t.cv)
      const groupe = texteGroupe(e.p, pred)
      const verbe = e.p.tokens.find(t => t.n === 'verbe').m
      const bonne = e.g === 'cp' ? 'complément de phrase' : 'complément du verbe'
      return { ...choix(q, ['complément du verbe', 'complément de phrase'], bonne), html: surlignerGroupe(e.p, pred), lecture: texteTokens(e.p.tokens),
        explication: T => (e.g === 'cp'
          ? T('expl_cpltPhrase', { groupe })
          : T('expl_cpltVerbe', { groupe, verbe })),
        solution: T => `${surlignerGroupe(e.p, pred)} → ${tc(T, bonne)}` }
    }
    case 'nature': {
      const tok = e.p.tokens[e.i]
      const bonne = NOM_NATURE[tok.n]
      const precision = T => (tok.propre ? T('expl_nomPropre')
        : tok.n === 'verbe' && niveau !== 'ce1' ? T('expl_conjugue') : '')
      return { ...choix(q, ['nom', 'verbe', 'déterminant', 'adjectif', 'pronom'], bonne), html: surligner(e.p, [e.i]), lecture: texteTokens(e.p.tokens),
        explication: T => T('expl_nature', { mot: tok.m, nature: tc(T, bonne), precision: precision(T) }),
        solution: T => `${surligner(e.p, [e.i])} → ${tc(T, bonne)}` }
    }
    case 'pronom': {
      const bonne = pronomDe(e.gn)
      const nouvelle = phraseAvecPronom(e)
      return { ...choix(q, ['il', 'elle', 'ils', 'elles'], bonne), html: surlignerSujet(e), lecture: texteTokens(e.tokens),
        explication: T => T('expl_pronom', { sujet: texteSujet(e), gn: libGN(T, e.gn), phrase: nouvelle }),
        solution: nouvelle }
    }
    case 'genre': {
      const [nom, g] = e
      const bonne = g === 'm' ? 'un' : 'une'
      const lib = T => tc(T, g === 'm' ? 'masculin' : 'féminin')
      return { ...choix(q, ['un', 'une'], bonne), html: `<span class="trou">___</span> ${nom}`, lecture: null,
        explication: T => T('expl_genre', { det: bonne, nom, genre: lib(T) }),
        solution: T => `${b(bonne)} ${nom} (${lib(T)})` }
    }
    case 'nombre': {
      const bonne = e.n === 's' ? 'singulier' : 'pluriel'
      const det = e.gn.split(' ')[0]
      return { ...choix(q, ['singulier', 'pluriel'], bonne), html: e.gn, lecture: e.gn,
        explication: T => T('expl_nombre', { det, nombre: nombreDe(T, e.n) }),
        solution: T => `${e.gn} → ${tc(T, bonne)}` }
    }
    case 'pluriel': {
      const [s, pl, regle] = e
      return { ...q, mode: 'saisie', html: `${s} → <span class="trou">…</span>`, lecture: null,
        attendu: pl, regle: regle || 'defaut',
        explication: regleDe(regle || 'defaut'),
        solution: `${s} → ${b(pl)}` }
    }
    case 'accordGN': {
      const [gn, nom, adj, g] = e.a
      const bonne = e.formes[['ms', 'fs', 'mp', 'fp'].indexOf(g)]
      const propositions = [...new Set(e.formes)]
      return { ...choix(q, propositions, bonne), html: `${gn.replace('___', '<span class="trou">___</span>')} <em>(${adj})</em>`,
        lecture: null, adj,
        explication: T => T('expl_accordGN', { nom, gn: libGN(T, g), bonne }),
        solution: gn.replace('___', b(bonne)) }
    }
    case 'accordSV': {
      const [phrase, suj, inf, fs, fp, n] = e
      const bonne = n === 's' ? fs : fp
      return { ...choix(q, [fs, fp], bonne), html: `${phrase.replace('___', '<span class="trou">___</span>')} <em>(${inf})</em>`,
        lecture: null,
        explication: T => T('expl_accordSV', { sujet: suj, nombre: nombreDe(T, n), bonne }),
        solution: phrase.replace('___', b(bonne)) }
    }
  }
  return null
}

// Génère nb questions réparties entre les types choisis (disponibles au niveau), sans répétition
function genererQuestions(rng, niveau, types, nb) {
  const res = construireReservoirs(niveau)
  const dispo = typesDuNiveau(niveau)
  let ok = types.filter(t => dispo.includes(t) && res[t] && res[t].length)
  if (!ok.length) ok = [dispo[0]]
  const pools = {}
  const ordreTypes = []
  while (ordreTypes.length < nb) ordreTypes.push(...rng.melanger(ok))
  ordreTypes.length = nb
  return rng.melanger(ordreTypes).map(type => {
    if (!pools[type] || pools[type].length === 0) pools[type] = rng.melanger(res[type])
    return construireQuestion(rng, type, pools[type].pop(), niveau)
  })
}

/** Une partie : `nb` questions (réglage `nb` par défaut) réparties entre les types cochés. */
export function questions({ niveau, reglages, rng, nb }) {
  const n = niveauConnu(niveau)
  return genererQuestions(rng, n, reglages.types ?? [], nb ?? reglages.nb ?? 10)
}

/** Questions de la fiche : { niveau, questions }. */
export function questionsFiche({ niveau, reglages, rng }) {
  const n = niveauConnu(niveau)
  return { niveau: n, questions: genererQuestions(rng, n, reglages.types ?? [], reglages.nb ?? 10) }
}

// ── Réponses : indice choisi (rep.choix), indices de mots (rep.selection), d'étiquettes (rep.ordre), texte (rep.texte)
export function verifier(q, rep) {
  if (rep?.choix !== undefined) return rep.choix === q.bonne
  if (rep?.selection) {
    const sel = [...rep.selection].sort((a, b) => a - b)
    return sel.length === q.cibles.length && sel.every((v, k) => v === q.cibles[k])
  }
  if (rep?.ordre) return rep.ordre.map(k => q.etiquettes[k]).join(' ') === q.attendu // étiquettes d'un mot : séparées par une espace
  // pluriel : accents oubliés comptés faux, avec un avertissement (décision du 2026-10-05)
  if (rep?.texte !== undefined) return verdictSaisie(rep.texte, q.attendu)
  return false
}

export function bonneReponse(q) {
  if (q.mode === 'choix') return { choix: q.bonne }
  if (q.mode === 'clic') return { selection: [...q.cibles] }
  if (q.mode === 'ordre') return { ordre: q.attendu.split(' ').map(mot => q.etiquettes.indexOf(mot)) }
  return { texte: q.attendu }
}

// ── Programme (src/data/programme.js : CONTRAINTES classesMots, pluriels, feminins ; compléments et phrase complexe :
// programmes du cycle 2 p. 91 et du cycle 3 p. 17-19) ──
const CLASSE_MOT = { nom: ['nom-commun', 'nom-propre'], verbe: ['verbe'], déterminant: ['determinant'], adjectif: ['adjectif'],
  pronom: ['pronom-personnel-sujet', 'pronom-personnel'] }
const REGULIERE = (adj, forme) => {
  const fem = adj.endsWith('e') ? adj : adj + 'e'
  return [adj, fem, adj.endsWith('s') ? adj : adj + 's', fem + 's'].includes(forme)
}

export function ecartsAuProgramme(x, contraintes) {
  const niveau = contraintes.niveau
  const liste = Array.isArray(x) ? x : x.questions
  const permis = typesDuNiveau(niveau)
  const ecarts = []
  for (const q of liste) {
    if (!permis.includes(q.type)) ecarts.push(`${q.type} : exercice hors du programme ${niveau}`)
    if (q.type === 'nature') {
      const natures = q.choix.filter(c => !(CLASSE_MOT[c] ?? []).some(k => (contraintes.classesMots ?? []).includes(k)))
      if (natures.length) ecarts.push(`nature : ${natures.join(', ')} n'est pas une classe de mots du ${niveau}`)
    }
    if (q.type === 'pluriel' && !(contraintes.pluriels ?? []).includes('x') && ['eau', 'eu'].includes(q.regle)) ecarts.push(`pluriel en -x au ${niveau} : ${q.attendu}`)
    if (q.type === 'accordGN' && !(contraintes.feminins ?? []).includes('audible')) {
      const irregulieres = q.choix.filter(f => !REGULIERE(q.adj, f))
      if (irregulieres.length) ecarts.push(`accord irrégulier au ${niveau} : ${q.adj} → ${irregulieres.join(', ')}`)
    }
  }
  return ecarts
}

// Sections d'une fiche (<h2 data-type="…">) : exercices du niveau
export function ecartsFiche(html, contraintes) {
  const permis = typesDuNiveau(contraintes.niveau)
  return [...html.matchAll(/data-type="([^"]+)"/g)].map(m => m[1]).filter(t => !permis.includes(t)).map(t => `fiche : ${t} hors du programme ${contraintes.niveau}`)
}

export function manquesAuProgramme(reglages, contraintes) {
  const choisis = reglages.types ?? []
  return typesDuNiveau(contraintes.niveau).filter(t => !choisis.includes(t)).map(t => `exercice ${t} non proposé`)
}
