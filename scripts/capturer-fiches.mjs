// Capture des fiches d'une vue dans Chrome (vues pas encore migrées) : empreintes au format des instantanés
// (tests/instantanes/<exercice>.json, mêmes clés de cas), et HTML complets pour `npm run instantanes -- --diff`.
// La capture « avant » d'une vue ancienne devient ainsi l'instantané de référence de l'exercice migré.
//
//   node scripts/capturer-fiches.mjs <route> [--niveaux CE1,CE2] [--graines 1,2,3] [--langues fr,br]
//        [--reglages fichier.json] [--cle heure_config] [--id heure] [--sortie fichier.json] [--html dossier]
//        [--url http://localhost:5173/ecole-primaire/] [--paralleles 8] [--recharger]
//
// - Serveur : --url, sinon TEST_URL, sinon le serveur de dev (npm run dev).
// - Cas : pour un exercice du registre (src/exercices/index.js), ceux du test des instantanés (défauts du niveau,
//   tout au programme, fiches de la définition) ; sinon ceux de --reglages :
//     { "cle": "monnaie_config",                       // clé des réglages mémorisés de la vue (chargerReglages)
//       "cas": [{ "niveau": "ce1", "nom": "defauts",    // → clé <id>/ce1/graineN/<langue>/defauts
//                 "reglages": { … },                    // réglages mémorisés (ep_<cle>) avant l'ouverture de la vue
//                 "stockage": { "autre_cle": … },       // facultatif : autres valeurs de localStorage (sans ep_)
//                 "clics": ["^CE1$"] }] }               // facultatif : boutons cliqués ensuite (regex du texte)
//   Le plus sûr : des réglages mémorisés plutôt que des clics. La fiche est alors le premier tirage de la graine,
//   comme fiche(questionsFiche(…, creerRng(graine))) en node ; chaque clic qui régénère la fiche avance le flux.
// - Graine : ?graine=N avant le #, Math.random remplacé par mulberry32(N) (comme le build et tests/outils.mjs).
// - HTML capturé : celui que la vue donne au cadre (avant les options prénom/corrigé), relevé à l'entrée de
//   appliquerOptionsFiche (DOMParser) ; à défaut, le srcdoc de l'aperçu.
// - Rapide : un navigateur, un contexte par langue × niveau en parallèle, pas d'attente fixe ; la page n'est pas
//   rechargée entre deux cas : la vue est démontée (route légère) puis remontée, avec la graine et les réglages du
//   cas. --recharger : un chargement complet par cas (plus lent, si une vue garde un état entre deux montages).
import { chromium } from 'playwright-core'
import { readFileSync } from 'node:fs'
import { REGISTRE } from '../src/exercices/index.js'
import { trouverChrome } from '../tests/outils.mjs'
import {
  GRAINES, DOSSIER_HTML, casDe, cleCas, languesDe, empreinte, ecrireInstantanes, ecrireHtml, fichierInstantanes, lireInstantanes,
} from '../tests/outils-instantanes.mjs'

const args = process.argv.slice(2)
const arg = (nom, defaut = null) => { const i = args.indexOf(nom); return i >= 0 ? args[i + 1] : defaut }
const liste = (nom, defaut) => arg(nom)?.split(',').map(s => s.trim()).filter(Boolean) ?? defaut
const AVEC_VALEUR = ['--niveaux', '--graines', '--langues', '--reglages', '--cle', '--id', '--sortie', '--html', '--url', '--paralleles']
const route = args.find((a, i) => !a.startsWith('--') && !AVEC_VALEUR.includes(args[i - 1]))
if (!route?.startsWith('/')) {
  console.error('Usage : node scripts/capturer-fiches.mjs <route> [--niveaux CE1,CE2] [--graines 1,2,3] [--langues fr,br] [--reglages f.json] [--sortie f.json]')
  process.exit(2)
}
const module = REGISTRE.find(m => m.definition.route === route)
const id = arg('--id') ?? module?.definition.id ?? route.split('/').pop()
const graines = liste('--graines', GRAINES.map(String)).map(Number)
const niveaux = liste('--niveaux', null)?.map(n => n.toLowerCase())
const langues = liste('--langues', module ? languesDe(module.definition) : ['fr'])
const base = (arg('--url') ?? process.env.TEST_URL ?? 'http://localhost:5173/ecole-primaire/').replace(/\/?$/, '/')
const dossierHtml = arg('--html', DOSSIER_HTML)
const recharger = args.includes('--recharger')
const ROUTE_NEUTRE = '/mentions-legales'

// ── Cas à capturer : { cle, niveau, graine, langue, stockage, clics } ──
let cas
if (arg('--reglages')) {
  const f = JSON.parse(readFileSync(arg('--reglages'), 'utf8'))
  cas = []
  for (const c of f.cas.filter(x => !niveaux || niveaux.includes(x.niveau))) {
    for (const graine of graines) for (const langue of langues) {
      const stockage = { ...c.stockage, ...(c.reglages ? { [c.cle ?? f.cle]: c.reglages } : {}) }
      cas.push({ cle: cleCas({ exercice: id, niveau: c.niveau, graine, langue, nom: c.nom }), niveau: c.niveau, graine, langue, stockage, clics: c.clics ?? [] })
    }
  }
} else if (module) {
  const cle = arg('--cle', `${id.replaceAll('-', '_')}_config`)
  cas = casDe(module.definition, { niveaux, graines, langues }).map(c => ({ ...c, stockage: { [cle]: c.reglages }, clics: [] }))
} else {
  console.error(`${route} n'est pas dans le registre des exercices : donner les cas avec --reglages fichier.json`)
  process.exit(2)
}
if (!cas.length) { console.error('Aucun cas à capturer (niveaux ?)'); process.exit(2) }

try { await fetch(base) } catch { console.error(`Serveur injoignable : ${base} (npm run dev, ou --url)`); process.exit(2) }

// ── Navigateur : un contexte (localStorage à soi) par langue × niveau ──
const debut = performance.now()
const navigateur = await chromium.launch({ executablePath: trouverChrome() })
const groupes = Object.values(Object.groupBy(cas, c => `${c.langue}/${c.niveau}`))
const erreurs = []

async function preparer(langue) {
  const ctx = await navigateur.newContext({ viewport: { width: 1100, height: 900 } })
  await ctx.addInitScript(l => {
    // graine du lien, et __graine(n) pour repartir d'une autre sans recharger
    let s = Number(new URLSearchParams(location.search).get('graine')) | 0
    Math.random = () => { s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296 }
    window.__graine = g => { s = g | 0 }
    // HTML de la fiche tel que la vue le donne au cadre (appliquerOptionsFiche le relit avec DOMParser)
    const lire = DOMParser.prototype.parseFromString
    DOMParser.prototype.parseFromString = function (html, type) {
      if (type === 'text/html' && /^<!DOCTYPE html>/i.test(html)) window.__ficheBrute = html
      return lire.call(this, html, type)
    }
    try { if (!localStorage.getItem('ep_langue_interface')) { localStorage.setItem('ep_langue_interface', JSON.stringify(l)); localStorage.setItem('ep_avis_traduction_vu', 'true') } } catch {}
  }, langue)
  const page = await ctx.newPage()
  page.on('pageerror', e => erreurs.push(String(e).slice(0, 200)))
  await page.goto(`${base}#${ROUTE_NEUTRE}`)
  return { ctx, page }
}

// localStorage du cas : rien d'autre que la langue et les réglages du cas
const poserStockage = (page, langue, stockage) => page.evaluate(([l, st]) => {
  localStorage.clear()
  localStorage.setItem('ep_langue_interface', JSON.stringify(l))
  localStorage.setItem('ep_avis_traduction_vu', 'true')
  for (const [k, v] of Object.entries(st)) localStorage.setItem(`ep_${k}`, JSON.stringify(v))
}, [langue, stockage])

// une image + une tâche : le temps que Vue applique un changement (pas d'attente fixe)
const tic = page => page.evaluate(() => new Promise(r => requestAnimationFrame(() => setTimeout(r))))
const lireFiche = page => page.evaluate(() => window.__ficheBrute ?? document.querySelector('.cadre-exercice iframe')?.getAttribute('srcdoc'))

async function capturer(page, c) {
  if (recharger) {
    await poserStockage(page, c.langue, c.stockage)
    const url = `${base}?graine=${c.graine}#${route}?mode=imprimer`
    if (page.url() === url) await page.reload(); else await page.goto(url)
  } else {
    // démonter la vue (route légère), poser les réglages, puis la remonter avec la graine du cas
    await page.evaluate(r => { location.hash = `#${r}` }, ROUTE_NEUTRE)
    await page.waitForFunction(() => !document.querySelector('.cadre-exercice'))
    await poserStockage(page, c.langue, c.stockage)
    await page.evaluate(([g, r]) => {
      history.replaceState(history.state, '', `${location.pathname}?graine=${g}${location.hash}`)
      window.__ficheBrute = null
      window.__graine(g)
      location.hash = `#${r}?mode=imprimer`
    }, [c.graine, route])
  }
  await page.waitForFunction(() => document.querySelector('.cadre-exercice iframe')?.getAttribute('srcdoc'), null, { timeout: 15000 })
  for (const re of c.clics) {
    await page.locator('.cadre-exercice button', { hasText: new RegExp(re) }).first().click()
    await tic(page)
  }
  // fiche stable : la même après une image de plus
  let html = await lireFiche(page)
  for (let i = 0; i < 10; i++) { await tic(page); const encore = await lireFiche(page); if (encore === html) break; html = encore }
  return html
}

const empreintes = {}
const enAttente = [...groupes]
const nbParalleles = Math.max(1, Number(arg('--paralleles', 8)))
await Promise.all(Array.from({ length: Math.min(nbParalleles, groupes.length) }, async () => {
  for (let g; (g = enAttente.shift());) {
    const { ctx, page } = await preparer(g[0].langue)
    for (const c of g) {
      const html = await capturer(page, c)
      empreintes[c.cle] = empreinte(html)
      ecrireHtml(c.cle, html, dossierHtml)
    }
    await ctx.close()
  }
}))
await navigateur.close()
const duree = ((performance.now() - debut) / 1000).toFixed(1)

const sortie = arg('--sortie')
if (sortie) ecrireInstantanes(sortie, empreintes)
console.log(`✓ ${cas.length} fiche(s) capturée(s) en ${duree} s (${groupes.length} contexte(s), ${recharger ? 'rechargement' : 'remontage'} par cas)`)
console.log(`  HTML : ${dossierHtml}/${id}/…${sortie ? `\n  empreintes : ${sortie}` : ''}`)
if (erreurs.length) console.log(`  ⚠ ${erreurs.length} erreur(s) JavaScript : ${[...new Set(erreurs)].slice(0, 3).join(' | ')}`)
// comparaison avec l'instantané enregistré, s'il existe (exercice déjà migré)
const enregistres = lireInstantanes(fichierInstantanes(id))
if (enregistres) {
  const communs = Object.keys(empreintes).filter(k => k in enregistres)
  const differents = communs.filter(k => enregistres[k] !== empreintes[k])
  console.log(`  instantané tests/instantanes/${id}.json : ${communs.length - differents.length}/${communs.length} identiques${differents.length ? ` ; différents : ${differents.slice(0, 5).join(', ')}${differents.length > 5 ? '…' : ''}` : ''}`)
}
process.exit(erreurs.length ? 1 : 0)
