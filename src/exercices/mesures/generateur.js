// Les mesures — générateur (pur : aucun import de Vue, aucun Math.random ; lisible par node).
//   questions({ niveau, reglages, rng, T, nb })   questions de l'exercice à l'écran, sans répétition
//   questionsFiche({ niveau, reglages, rng, T })  tout ce que tire la fiche imprimable (fiche.js la met en page)
//   verifier(q, rep)                              la réponse est-elle juste ? rep : { texte } (nombre) ou { choix } (QCM)
//   bonneReponse(q)                               une réponse juste, dans la forme attendue par verifier (tests)
//   ecartsAuProgramme(questions, contraintes)     unités hors programme du niveau (tests)
//   manquesAuProgramme(reglages, contraintes)     ce que le programme demande et que « tout » ne propose pas (tests)
// Une question par type d'exercice : règle, unité, conversion, comparer (longueurs.js), masse (masses.js),
// contenance (contenances.js), calendrier (calendrier.js). Données par niveau : donnees.js.
// rng : src/utils/hasard.js ; T(cle, params) : textes de l'exercice dans la langue du contenu (textes.js).
// L'ordre des tirages est celui de l'ancienne vue : même flux de hasard, mêmes fiches.
import DEFINITION from './definition.js'
import { DONNEES } from './donnees.js'
import { genRegle, genUnite, genConversion, genComparer } from './longueurs.js'
import { genMasse } from './masses.js'
import { genContenance } from './contenances.js'
import { genCalendrier } from './calendrier.js'

const GENERATEURS = {
  regle: genRegle, unite: genUnite, conversion: genConversion, comparer: genComparer,
  masse: genMasse, contenance: genContenance, calendrier: genCalendrier,
}

const niveauConnu = niveau => (DEFINITION.niveaux[niveau] ? niveau : DEFINITION.niveauDefaut)
/** Exercices proposés au niveau (définition) */
export const exercicesDu = niveau => DEFINITION.niveaux[niveauConnu(niveau)].options.exercices
const contexte = (niveau, reglages, rng, T) => ({ rng, T, reglages, niv: DONNEES[niveauConnu(niveau)] })

// Répartit les questions entre les exercices choisis (ceux du niveau), sans répétition (essais bornés)
function genererSerie(ctx, niveau, choisis, nb, typesForces) {
  const offerts = exercicesDu(niveau)
  let types = (typesForces || choisis).filter(t => offerts.includes(t) && GENERATEURS[t])
  if (!types.length) types = ['regle']
  const ordre = ctx.rng.melanger(types)
  const vus = new Set(), res = []
  for (let i = 0; i < nb; i++) {
    const type = ordre[i % ordre.length]
    for (let essai = 0; essai < 80; essai++) {
      const q = GENERATEURS[type](ctx)
      if (!vus.has(q.cle)) { vus.add(q.cle); res.push(q); break }
    }
  }
  return typesForces ? res : ctx.rng.melanger(res)
}

export function questions({ niveau, reglages, rng, T, nb = reglages.nbQ ?? 10 }) {
  return genererSerie(contexte(niveau, reglages, rng, T), niveau, reglages.exercices ?? [], nb)
}

// ── Fiche : segments à mesurer et à tracer, puis quelques questions par exercice ──
// [type, nombre de questions]
const BLOCS = [['conversion', 6], ['unite', 6], ['comparer', 4], ['masse', 2], ['contenance', 2], ['calendrier', 4]]

function segmentsFiche(rng, niv, nbSeg) {
  const f = niv.fiche
  if (f.mm) {
    // CE2 : longueurs en cm et mm (en mm, entre 3 cm et 12 cm), surtout pas des cm entiers
    const longueurs = []
    for (let L = f.segMin * 10; L <= f.segMax * 10; L++) if (L % 10 !== 0 || L % 30 === 0) longueurs.push(L)
    const choisis = rng.melanger(longueurs).slice(0, nbSeg)
    const aTracer = rng.melanger(longueurs.filter(L => L <= 100 && !choisis.includes(L))).slice(0, 2)
    return { mm: true, choisis, aTracer }
  }
  const longueurs = []
  for (let L = f.segMin; L <= f.segMax; L++) longueurs.push(L)
  const choisis = rng.melanger(longueurs).slice(0, nbSeg)
  const aTracer = rng.melanger(longueurs.filter(L => L <= 10 && !choisis.includes(L)).concat([5, 8]))
    .filter((v, i, a) => a.indexOf(v) === i).slice(0, 2)
  return { mm: false, choisis, aTracer }
}

export function questionsFiche({ niveau, reglages, rng, T }) {
  const n = niveauConnu(niveau)
  const ctx = contexte(n, reglages, rng, T)
  const ex = (reglages.exercices ?? []).filter(e => exercicesDu(n).includes(e))
  return {
    niveau: n, unites: ctx.niv.unites,
    regle: ex.includes('regle') ? segmentsFiche(rng, ctx.niv, reglages.nbSegments || 6) : null,
    blocs: BLOCS.filter(([type]) => ex.includes(type)).map(([type, nb]) => ({ type, questions: genererSerie(ctx, n, reglages.exercices, nb, [type]) })),
  }
}

// ── Réponses ──
// rep : { texte } (nombre tapé, virgule acceptée) ou { choix } (proposition choisie)
export function verifier(q, rep) {
  if (q.mode === 'nombre') {
    const v = String(rep.texte ?? '').trim().replace(',', '.')
    return v !== '' && Number(v) === q.reponse
  }
  return rep.choix === q.reponse
}
export const bonneReponse = q => (q.mode === 'nombre' ? { texte: String(q.reponse) } : { choix: q.reponse })

// ── Programme : unités des énoncés, des réponses et des propositions ──
const UNITE = '(mm|cm|dm|km|m|mg|g|kg|t|mL|cL|dL|L)'
const APRES_NOMBRE = new RegExp(`\\d[\\s\\u00a0]*${UNITE}(?![\\p{L}\\d])`, 'gu')
const SEULE = new RegExp(`^${UNITE}$`)
// unités écrites dans une question : après un nombre (« 3 cm », « 500 g »), ou seules (propositions, unité attendue)
const unitesDe = q => {
  const textes = [q.texte, q.affiche, q.attendu, q.explication]
  const seules = [q.unite, q.attendu, ...(q.mode === 'choix' && ['unite', 'contenance'].includes(q.type) ? q.choix : [])]
  return [...new Set([
    ...textes.filter(Boolean).flatMap(t => [...String(t).matchAll(APRES_NOMBRE)].map(m => m[1])),
    ...seules.filter(Boolean).map(t => String(t).match(SEULE)?.[1]).filter(Boolean),
  ])]
}
export function ecartsAuProgramme(qs, k) {
  const permises = [...k.unitesLongueur, ...k.unitesMasse, ...k.unitesContenance]
  const ecarts = []
  // le calendrier ne parle d'aucune unité de mesure
  for (const q of Array.isArray(qs) ? qs : qs.blocs.flatMap(b => b.questions)) {
    if (q.type === 'calendrier') continue
    for (const u of unitesDe(q)) if (!permises.includes(u)) ecarts.push(`${u} : unité hors programme (${q.type})`)
    if (q.type === 'contenance' && !k.unitesContenance.length) ecarts.push('contenances : pas au programme du niveau')
  }
  return [...new Set(ecarts)]
}
export function manquesAuProgramme(reglages, k) {
  const ex = reglages.exercices ?? []
  const manques = []
  if (k.unitesLongueur.length && !ex.includes('regle')) manques.push('longueurs : mesurer à la règle')
  if (k.unitesMasse.length && !ex.includes('masse')) manques.push('masses : balance')
  if (k.unitesContenance.length && !ex.includes('contenance')) manques.push('contenances')
  return manques
}
