// Exercices au format « définition » (src/exercices/, plan 10) : test unitaire node, sans Chrome ni serveur.
// Pour chaque exercice du registre, chaque niveau et 5 graines : la définition est valide, ses compétences existent et
// sont au programme du niveau, les questions et la fiche respectent contraintesDe(niveau), la fiche est un document
// complet avec .entete et section.corrige, et la même graine redonne la même fiche.
//   node tests/exercices.test.mjs
import { readdirSync, statSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { REGISTRE } from '../src/exercices/index.ts'
import { toutAuProgramme, estBonus, raisonHorsProgramme, jeuxDeReglages, langueContenuDe, lireVerdict, aUnJeu } from '../src/noyau/reglages.ts'
// noyau i18n (traduire : pluriels, interpolation, catalogue commun) : imports avec extension, lisible par node
import { traducteurExercice } from '../src/exercices/traducteur.ts'
import { creerRng } from '../src/utils/hasard.js'
import { COMPETENCES, NIVEAUX, SOURCES, contraintesDe, competenceDe, domaineDe } from '../src/data/programme.js'
import { ACTIVITES } from '../src/data/activites.js'
import { doublons } from '../src/noyau/uniques.ts'
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
// les exemples (`exemple: true`) sont vérifiés comme les autres, mais ne sont pas au catalogue public (activites.js)
const TOUS = REGISTRE
const estExemple = d => REGISTRE.some(e => e.exemple && e.definition === d)
const ids = TOUS.map(e => e.definition.id)
controler(dossiers.filter(d => !ids.includes(d)).map(d => `${d} absent de src/exercices/index.ts`), `${dossiers.length} dossier(s), tous dans le registre`)
controler(ids.filter((id, i) => ids.indexOf(id) !== i).map(id => `${id} en double`), 'ids uniques')

for (const { definition: d, generateur: g, fiche: f, textes } of TOUS) {
  console.log(`\n${d.id}`)

  // ── Définition ──
  const pbs = []
  for (const cle of ['id', 'route', 'domaine', 'contenu', 'niveauDefaut', 'niveaux', 'fiches']) if (d[cle] === undefined) pbs.push(`${cle} manquant`)
  if (!['fr', 'interface'].includes(d.contenu)) pbs.push(`contenu « ${d.contenu} »`)
  if (!domaineDe(d.domaine)) pbs.push(`domaine ${d.domaine} inconnu`)
  if (!d.niveaux[d.niveauDefaut]) pbs.push(`niveauDefaut ${d.niveauDefaut} absent des niveaux`)
  for (const [n, niv] of Object.entries(d.niveaux)) {
    if (!NIVEAUX.includes(n)) pbs.push(`${n} : classe inconnue`)
    if (!niv.competences?.length) pbs.push(`${n} : aucune compétence`)
    // compétence hors programme : `{ competence, raison }` (noyau) ou, dans l'ancien format, `{ option: <id>, raison }` sans `reglage`
    const declarees = (niv.horsProgramme ?? []).filter(h => h.competence || !h.reglage).map(h => h.competence ?? h.option)
    for (const id of niv.competences ?? []) {
      const k = competenceDe(id)
      if (!k) pbs.push(`${n} : compétence ${id} inconnue de programme.js`)
      else if (!k.niveaux.includes(n) && !declarees.includes(id)) pbs.push(`${n} : ${id} n'est pas au programme (ni déclarée horsProgramme)`)
      // même matière suffit : Orthographe (vocabulaire) travaille aussi les accords (grammaire)
      else if (k && domaineDe(k.domaine)?.matiere !== domaineDe(d.domaine)?.matiere) pbs.push(`${n} : ${id} est du domaine ${k.domaine}`)
    }
    for (const h of niv.horsProgramme ?? []) {
      if (!h.raison) pbs.push(`${n} : horsProgramme ${h.competence ?? h.option} sans raison`)
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
    else for (const v of [d.reglages[cle]].flat()) if (!offertes.includes(v)) pbs.push(`défaut commun ${cle}=${v} hors des options`)   // choix unique ou multiple
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
  if (estExemple(d)) { if (activite) pbs.push(`${d.route} (exemple) ne doit pas être au catalogue`) }
  else if (!/^\/[\w-]+(\/[\w-]+)*$/.test(d.route)) pbs.push(`route ${d.route} invalide`)
  // jeu en ligne : `jeu: false` = fiche seule (ni questions ni verifier) ; sinon les deux sont là
  const jeu = aUnJeu(d)
  if (jeu !== ('questions' in g && 'verifier' in g)) pbs.push(jeu ? 'jeu en ligne : questions et verifier attendus' : 'fiche seule (jeu: false) : ni questions ni verifier')
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
        const T = traducteurExercice(textes, langue)
        for (const graine of GRAINES) {
          const qs = jeu ? g.questions({ niveau: n, reglages, rng: creerRng(graine), T, nb: 10, langue }) : []
          if (jeu && !qs.length) ecarts.push(`graine ${graine} : aucune question`)
          // jamais deux fois la même question (src/noyau/uniques.ts) ; les exercices pas encore reportés n'y sont pas tenus
          ecarts.push(...doublons(qs).map(q => `graine ${graine} : question en double ${q.slice(0, 60)}`))
          if (jeu) ecarts.push(...g.ecartsAuProgramme(qs, k).map(e => `graine ${graine} : ${e}`))
          // verifier rend un booléen ou { ok, nuance } (lireVerdict)
          const juste = (q, rep) => lireVerdict(g.verifier(q, rep)).ok
          for (const q of qs) if (q.options && !juste(q, { choix: q.bonne })) ecarts.push(`graine ${graine} : la bonne proposition est refusée (${q.cle})`)
          if (g.bonneReponse) for (const q of qs) if (!juste(q, g.bonneReponse(q))) ecarts.push(`graine ${graine} : la bonne réponse est refusée (${q.cle})`)
          // et une fausse est refusée (un verifier toujours vrai ne se verrait pas autrement) ; exigée des exercices du noyau
          if (g.mauvaiseReponse) { for (const q of qs) if (juste(q, g.mauvaiseReponse(q))) ecarts.push(`graine ${graine} : une mauvaise réponse est acceptée (${q.texte ?? q.cle})`) }
          else if (jeu && !ecarts.includes('mauvaiseReponse manquante (voir Generateur, types.ts)')) ecarts.push('mauvaiseReponse manquante (voir Generateur, types.ts)')
          const tirage = g.questionsFiche({ niveau: n, reglages, rng: creerRng(graine), T, langue })
          ecarts.push(...g.ecartsAuProgramme(tirage, k).map(e => `fiche, graine ${graine} : ${e}`))
          if (Array.isArray(tirage)) ecarts.push(...doublons(tirage).map(q => `fiche, graine ${graine} : question en double ${q.slice(0, 60)}`))
          const html = f.fiche({ questions: tirage, reglages, T, langue })
          const encore = f.fiche({ questions: g.questionsFiche({ niveau: n, reglages, rng: creerRng(graine), T, langue }), reglages, T, langue })
          if (!/^<!DOCTYPE html><html lang="\w+">/.test(html)) fiches.push(`${l} ${graine} : pas de doctype ou de lang`)
          // la ligne Prénom / Date porte la classe .entete (l'option « Prénom et date » la retire) ; le corrigé, sauf `corrige: false`
          if (!/class="entete"/.test(html)) fiches.push(`${l} ${graine} : pas de .entete`)
          const corrige = /<section class="corrige">[\s\S]*<\/section>/.test(html)
          const attendu = typeof d.corrige === 'function' ? d.corrige(reglages) : d.corrige !== false
          if (attendu && !corrige) fiches.push(`${l} ${graine} : pas de section.corrige`)
          if (!attendu && corrige) fiches.push(`${l} ${graine} : section.corrige alors que la définition n'en attend pas`)
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

// les liens du référentiel sont mis tels quels dans des href : toujours en https
controler([...Object.entries(SOURCES).flatMap(([id, s]) => [s.url, s.page].filter(u => u !== undefined && !/^https:\/\//.test(u)).map(u => `${id} : ${u}`)),
  ...COMPETENCES.filter(k => !/^https:\/\//.test(k.source.url)).map(k => k.id)], 'liens du programme en https')

// code de sortie lu par tests/lancer.mjs
process.exit(nbEchecs() ? 1 : 0)
