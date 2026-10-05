// Conjugaison — générateur (pur : aucun import de Vue, aucun Math.random ; lisible par node).
//   questions({ niveau, reglages, rng })         une partie : les six lignes d'un tableau (un verbe, un temps)
//   questionsFiche({ niveau, reglages, rng })    les tableaux de la fiche imprimable (fiche.js les met en page)
//   verifier(q, rep)                             la saisie { texte } est-elle juste ? → { ok, nuance } (nuance 'accents')
//   bonneReponse(q)                              une réponse juste (tests)
//   ecartsAuProgramme(x, contraintes)            verbes et temps hors du programme du niveau (tests)
//   ecartsFiche(html, contraintes)               idem, lus dans le HTML de la fiche (data-verbe, data-temps)
//   manquesAuProgramme(reglages, contraintes)    temps, groupes et irréguliers du programme que le niveau ne propose pas
// rng : src/utils/hasard.js. Formes : src/data/conjugaison.js (partagé avec les affiches de conjugaison).
// L'ordre des tirages est celui de l'ancienne vue : même flux de hasard, mêmes fiches.
import DEFINITION from './definition.js'
import { formesTemps, verbeDe } from '../../data/conjugaison.js'
import { verdictSaisie } from '../../utils/reponses.js'

export const NB_TABLEAUX = 4    // tableaux par fiche
// groupe (src/data/conjugaison.js) → clé du catalogue groupe_<…>
export const GROUPE_DE = { auxiliaire: 'aux', '1er groupe': '1', '2e groupe': '2', '3e groupe': '3' }
export const cleGroupe = verbe => 'groupe_' + GROUPE_DE[verbeDe(verbe).groupe]
export const cleTemps = temps => 'temps_' + temps.replace(/-/g, '_')

const niveauConnu = niveau => (DEFINITION.niveaux[niveau] ? niveau : DEFINITION.niveauDefaut)

// Les six lignes d'un tableau : pronom, forme, début donné (radical ou auxiliaire) et partie à écrire (terminaison ou
// participe passé ; toute la forme quand la terminaison n'est pas régulière, ex. vous êtes)
export function lignes(verbe, temps) {
  return formesTemps(verbe, temps).map(([[, pronom], ...segs]) => {
    const k = segs.map(([c]) => c).findLastIndex(c => c === 'ter' || c === 'pp')
    const txt = l => l.map(([, x]) => x).join('')
    return { pronom: pronom.trim(), forme: txt(segs), debut: k > 0 ? txt(segs.slice(0, k)) : '', trou: k > 0 ? txt(segs.slice(k)) : txt(segs) }
  })
}

// Couples (verbe, temps) possibles avec les choix du niveau, dans l'ordre des réglages
export function paires(niveau, reglages) {
  const n = DEFINITION.niveaux[niveauConnu(niveau)].options
  const vs = (reglages.verbes ?? []).filter(v => n.verbes.includes(v)), ts = (reglages.temps ?? []).filter(x => n.temps.includes(x))
  return vs.flatMap(verbe => ts.map(temps => ({ verbe, temps })))
}

// « allé(e)s » : la forme écrite telle quelle, et allés, allées
export const formesAcceptees = attendu => (attendu.includes('(e)') ? [attendu, attendu.replace(/\(e\)/g, ''), attendu.replace(/\(e\)/g, 'e')] : [attendu])

// Une partie : un couple au hasard, ses six lignes. Une question par ligne ; `attendu` : ce que l'élève écrit
// (terminaison en mode « lacunes », forme entière en mode « complet »).
export function questions({ niveau, reglages, rng }) {
  const ps = paires(niveau, reglages)
  if (!ps.length) return []
  const { verbe, temps } = ps[rng.entier(0, ps.length - 1)]
  const lacunes = reglages.mode !== 'complet'
  return lignes(verbe, temps).map((l, i) => ({
    cle: `${verbe}:${temps}:${i}`, verbe, temps, i, ...l, lacunes,
    // en mode lacunes, une ligne sans début donné (vous êtes) s'écrit en entier
    attendu: lacunes ? l.trou : l.forme,
    texte: `${l.pronom} ${l.forme}`,
  }))
}

// Verdict d'une saisie { texte } : { ok, nuance }. Accents oubliés : comptés faux, avec la nuance 'accents' (la vue
// avertit et montre la bonne graphie ; décision du 2026-10-05)
export const verifier = (q, rep) => verdictSaisie(rep?.texte, formesAcceptees(q.attendu))
export const bonneReponse = q => ({ texte: q.attendu })

// Tableaux de la fiche : des couples au hasard, en variant les verbes autant que possible
export function questionsFiche({ niveau, reglages, rng }) {
  const tous = rng.melanger([...paires(niveau, reglages)]), choisis = [], vus = new Set()
  for (const p of tous) if (choisis.length < NB_TABLEAUX && !vus.has(p.verbe)) { choisis.push(p); vus.add(p.verbe) }
  for (const p of tous) if (choisis.length < NB_TABLEAUX && !choisis.includes(p)) choisis.push(p)
  return {
    niveau: niveauConnu(niveau), lacunes: reglages.mode !== 'complet',
    tableaux: choisis.map(p => ({ ...p, lignes: lignes(p.verbe, p.temps) })),
  }
}

// ── Programme : verbes et temps hors des contraintes du niveau (src/data/programme.js, CONTRAINTES : conjugaison) ──
const GROUPE_PROGRAMME = { auxiliaire: 'etre-avoir', '1er groupe': '1er-groupe', '2e groupe': '2e-groupe' }
function ecartsCouples(couples, contraintes) {
  const c = contraintes.conjugaison
  if (!c) return ['conjugaison : pas au programme du niveau']
  const ecarts = []
  for (const { verbe, temps } of couples) {
    const v = verbeDe(verbe)
    if (!v) ecarts.push(`${verbe} : verbe inconnu`)
    else if (v.groupe === '3e groupe' ? !c.irreguliers.includes(verbe) : !c.groupes.includes(GROUPE_PROGRAMME[v.groupe])) ecarts.push(`${v.inf} : pas au programme`)
    if (!c.temps.includes(temps)) ecarts.push(`${temps} : pas au programme`)
  }
  return [...new Set(ecarts)]
}
export const ecartsAuProgramme = (x, contraintes) => ecartsCouples(Array.isArray(x) ? x : x.tableaux, contraintes)
// Ce que le programme du niveau demande et que les réglages ne proposent pas (tests : avec toutAuProgramme)
export function manquesAuProgramme(reglages, contraintes) {
  const c = contraintes.conjugaison
  if (!c) return []
  const verbes = (reglages.verbes ?? []).map(verbeDe).filter(Boolean)
  const groupes = new Set(verbes.map(v => GROUPE_PROGRAMME[v.groupe]))
  return [
    ...c.temps.filter(x => !reglages.temps?.includes(x)).map(x => `temps ${x} absent`),
    ...c.groupes.filter(g => !groupes.has(g)).map(g => `groupe ${g} absent`),
    ...c.irreguliers.filter(v => !reglages.verbes?.includes(v)).map(v => `irrégulier ${v} absent`),
  ]
}
export function ecartsFiche(html, contraintes) {
  const couples = [...html.matchAll(/data-verbe="([^"]+)" data-temps="([^"]+)"/g)].map(([, verbe, temps]) => ({ verbe, temps }))
  return couples.length ? ecartsCouples(couples, contraintes) : ['aucun tableau']
}
