// Exercices au format « définition » (src/exercices/, plan 10) : test unitaire node, sans Chrome ni serveur.
// Pour chaque exercice du registre, chaque niveau et 5 graines : la définition est valide, ses compétences existent et
// sont au programme du niveau, les questions et la fiche respectent contraintesDe(niveau), la fiche est un document
// complet avec .entete et section.corrige, et la même graine redonne la même fiche.
//   node tests/exercices.test.mjs
import { readdirSync, statSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { REGISTRE } from '../src/exercices/index.js'
import { toutAuProgramme, estBonus, raisonHorsProgramme, jeuxDeReglages, langueContenuDe, lireVerdict } from '../src/exercices/outils.js'
// noyau i18n (traduire : pluriels, interpolation, catalogue commun) : imports avec extension, lisible par node
import { contenu } from '../src/i18n/index.js'
import { creerRng } from '../src/utils/hasard.js'
import { COMPETENCES, DOMAINES, NIVEAUX, contraintesDe, competenceDe } from '../src/data/programme.js'
import { ACTIVITES } from '../src/data/activites.js'
import { verifier, nbEchecs } from './outils.mjs'

const racine = join(dirname(fileURLToPath(import.meta.url)), '..')
const GRAINES = [1, 2, 3, 4, 5]
const LANGUES = ['fr', 'br']

// une vérification par sujet : la liste des problèmes (les 3 premiers) en cas d'échec
function controler(problemes, message) {
  const p = [...new Set(problemes)]
  verifier(!p.length, `${message}${p.length ? ` — ${p.slice(0, 3).join(' ; ')}${p.length > 3 ? ` (+${p.length - 3})` : ''}` : ''}`)
}

console.log('Registre')
const dossiers = readdirSync(join(racine, 'src/exercices')).filter(d => statSync(join(racine, 'src/exercices', d)).isDirectory())
const ids = REGISTRE.map(e => e.definition.id)
controler(dossiers.filter(d => !ids.includes(d)).map(d => `${d} absent de src/exercices/index.js`), `${dossiers.length} dossier(s), tous dans le registre`)
controler(ids.filter((id, i) => ids.indexOf(id) !== i).map(id => `${id} en double`), 'ids uniques')

for (const { definition: d, generateur: g, fiche: f, textes } of REGISTRE) {
  console.log(`\n${d.id}`)

  // ── Définition ──
  const pbs = []
  for (const cle of ['id', 'route', 'domaine', 'contenu', 'niveauDefaut', 'niveaux', 'fiches']) if (d[cle] === undefined) pbs.push(`${cle} manquant`)
  if (!['fr', 'interface'].includes(d.contenu)) pbs.push(`contenu « ${d.contenu} »`)
  if (!DOMAINES.some(x => x.id === d.domaine)) pbs.push(`domaine ${d.domaine} inconnu`)
  if (!d.niveaux[d.niveauDefaut]) pbs.push(`niveauDefaut ${d.niveauDefaut} absent des niveaux`)
  for (const [n, niv] of Object.entries(d.niveaux)) {
    if (!NIVEAUX.includes(n)) pbs.push(`${n} : classe inconnue`)
    if (!niv.competences?.length) pbs.push(`${n} : aucune compétence`)
    const declarees = (niv.horsProgramme ?? []).map(h => h.option)
    for (const id of niv.competences ?? []) {
      const k = competenceDe(id)
      if (!k) pbs.push(`${n} : compétence ${id} inconnue de programme.js`)
      else if (!k.niveaux.includes(n) && !declarees.includes(id)) pbs.push(`${n} : ${id} n'est pas au programme (ni déclarée horsProgramme)`)
      else if (k && k.domaine !== d.domaine) pbs.push(`${n} : ${id} est du domaine ${k.domaine}`)
    }
    for (const h of niv.horsProgramme ?? []) {
      if (!h.raison) pbs.push(`${n} : horsProgramme ${h.option} sans raison`)
      if (h.reglage && !niv.options?.[h.reglage]?.includes(h.option)) pbs.push(`${n} : horsProgramme ${h.reglage}=${h.option} hors des options`)
    }
    for (const [cle, offertes] of Object.entries(niv.options ?? {})) {
      if (!(cle in (niv.reglages ?? {}))) { pbs.push(`${n} : option ${cle} sans défaut dans reglages`); continue }
      // choix multiple (liste) ou unique (valeur)
      const defaut = Array.isArray(niv.reglages[cle]) ? niv.reglages[cle] : [niv.reglages[cle]]
      for (const v of defaut) if (!offertes.includes(v)) pbs.push(`${n} : défaut ${cle}=${v} hors des options`)
      for (const v of offertes) {
        const hors = estBonus(d, n, cle, v) ? 'bonus' : raisonHorsProgramme(d, n, cle, v) ? 'horsProgramme' : null
        if (hors && defaut.includes(v)) pbs.push(`${n} : ${hors} ${cle}=${v} coché par défaut`)
      }
      for (const v of niv.bonus?.[cle] ?? []) if (!offertes.includes(v)) pbs.push(`${n} : bonus ${cle}=${v} hors des options`)
    }
  }
  // options communes (nbQ…) : le défaut commun fait partie des valeurs proposées
  for (const [cle, offertes] of Object.entries(d.options ?? {})) {
    if (!(cle in (d.reglages ?? {}))) pbs.push(`option commune ${cle} sans défaut dans reglages`)
    else if (!offertes.includes(d.reglages[cle])) pbs.push(`défaut commun ${cle}=${d.reglages[cle]} hors des options`)
  }
  for (const fi of d.fiches) {
    const niv = d.niveaux[fi.niveau]
    if (!niv) { pbs.push(`fiche ${fi.id} : niveau ${fi.niveau} absent`); continue }
    if (!niv.competences.includes(fi.competence)) pbs.push(`fiche ${fi.id}-${fi.niveau} : ${fi.competence} hors des compétences du niveau`)
    for (const [cle, vals] of Object.entries(fi.reglages)) {
      if (Array.isArray(vals)) for (const v of vals) if (niv.options?.[cle] && !niv.options[cle].includes(v)) pbs.push(`fiche ${fi.id}-${fi.niveau} : ${cle}=${v} hors des options`)
    }
  }
  const activite = ACTIVITES.find(a => a.to === d.route)
  if (!activite) pbs.push(`route ${d.route} absente de activites.js`)
  else if (activite.niveaux.join() !== Object.keys(d.niveaux).join()) pbs.push(`activites.js : niveaux ${activite.niveaux} ≠ ${Object.keys(d.niveaux)}`)
  controler(pbs, `définition valide (${Object.keys(d.niveaux).join(', ')} ; ${COMPETENCES.length} compétences connues)`)

  // ── Questions et fiches, par niveau ──
  for (const n of Object.keys(d.niveaux)) {
    const k = contraintesDe(n)
    // tout le programme du niveau est proposé (si le générateur sait le dire)
    if (g.manquesAuProgramme) controler(g.manquesAuProgramme(toutAuProgramme(d, n), k), `${n.toUpperCase()} : tout le programme du niveau est proposé`)
    // défauts, tout au programme, chaque autre valeur d'un choix unique (au programme), chaque fiche : outils.js
    for (const [nom, reglages] of Object.entries(jeuxDeReglages(d, n))) {
      const ecarts = [], fiches = []
      for (const l of LANGUES) {
        const langue = langueContenuDe(d, l)
        const T = contenu(textes, langue).t
        for (const graine of GRAINES) {
          const qs = g.questions({ niveau: n, reglages, rng: creerRng(graine), T, nb: 10 })
          if (!qs.length) ecarts.push(`graine ${graine} : aucune question`)
          ecarts.push(...g.ecartsAuProgramme(qs, k).map(e => `graine ${graine} : ${e}`))
          // verifier rend un booléen ou { ok, nuance } (lireVerdict)
          const juste = (q, rep) => lireVerdict(g.verifier(q, rep)).ok
          for (const q of qs) if (q.options && !juste(q, { choix: q.bonne })) ecarts.push(`graine ${graine} : la bonne proposition est refusée (${q.cle})`)
          if (g.bonneReponse) for (const q of qs) if (!juste(q, g.bonneReponse(q))) ecarts.push(`graine ${graine} : la bonne réponse est refusée (${q.cle})`)
          const tirage = g.questionsFiche({ niveau: n, reglages, rng: creerRng(graine), T })
          ecarts.push(...g.ecartsAuProgramme(tirage, k).map(e => `fiche, graine ${graine} : ${e}`))
          const html = f.fiche({ questions: tirage, reglages, T, langue })
          const encore = f.fiche({ questions: g.questionsFiche({ niveau: n, reglages, rng: creerRng(graine), T }), reglages, T, langue })
          if (!/^<!DOCTYPE html><html lang="\w+">/.test(html)) fiches.push(`${l} ${graine} : pas de doctype ou de lang`)
          if (!/<p class="entete">/.test(html)) fiches.push(`${l} ${graine} : pas de .entete`)
          if (!/<section class="corrige">[\s\S]*<\/section>/.test(html)) fiches.push(`${l} ${graine} : pas de section.corrige`)
          if (/undefined|NaN|\[object Object\]/.test(html)) fiches.push(`${l} ${graine} : ${html.match(/undefined|NaN|\[object Object\]/)[0]} dans la fiche`)
          if (html !== encore) fiches.push(`${l} ${graine} : même graine, fiche différente`)
          if (g.ecartsFiche) fiches.push(...g.ecartsFiche(html, k).map(e => `${l} ${graine} : ${e}`))
        }
      }
      controler(ecarts, `${n.toUpperCase()}, ${nom} : questions et fiche au programme`)
      controler(fiches, `${n.toUpperCase()}, ${nom} : fiche complète (.entete, section.corrige), reproductible`)
    }
  }
}

// code de sortie lu par tests/lancer.mjs
process.exit(nbEchecs() ? 1 : 0)
