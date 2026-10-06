// Vie privée (Chrome) : sur quelques pages des deux sites, aucun cookie, aucune requête vers un autre site que celui servi
// (le signal anonyme /journal est local : même hôte), aucune iframe ni script d'un tiers, rien de mémorisé hors `ep_*`.
// Garde Mistral (AGENTS.md, décision du 2026-10-06) : la Dictée est la SEULE à pouvoir joindre api.mistral.ai, avec la clé que
// l'utilisateur saisit lui-même ; sans clé, rien ne sort du navigateur.
//   TEST_URL=http://localhost:5173/ecole-primaire/ node tests/vie-privee.test.mjs
import { lancerNavigateur, contexte, surveiller, verifier, nbEchecs, URL_SITE } from './outils.mjs'
import { valeursValides } from './outils-routes.mjs'

const URL_SKOOLIK = process.env.TEST_URL_SKOOLIK && process.env.TEST_URL_SKOOLIK.replace(/\/?$/, '/')
const SITES = [['ecoleprimaire', URL_SITE], ...(URL_SKOOLIK ? [['skoolik', URL_SKOOLIK]] : [])]
const nav = await lancerNavigateur()

async function visiter([site, base]) {
  const slug = (await valeursValides(base)).slug
  // accueil, matière, feuille (si le site en publie), programme, réglages
  const pages = ['', 'maths', ...(slug ? [`telechargements/${slug}`] : []), 'programme', 'parametres']
  const ctx = await contexte(nav)
  const hotes = new Map()   // hôte → première adresse demandée
  const mistral = []
  ctx.on('request', r => {
    const u = new URL(r.url())
    if (u.protocol === 'data:' || u.protocol === 'blob:' || u.protocol === 'about:') return
    if (!hotes.has(u.host)) hotes.set(u.host, r.url())
    if (u.hostname === 'api.mistral.ai') mistral.push(r.url())
  })
  const resultats = []
  for (const p of pages) {
    const page = await ctx.newPage()
    const erreurs = surveiller(page)
    await page.goto(`${base}${p}`)
    await page.waitForSelector('h1')
    await page.waitForLoadState('networkidle')   // les requêtes tardives (statistiques, polices) comptent aussi
    const { cookiesDocument, iframes, scripts, cles } = await page.evaluate(() => ({
      cookiesDocument: document.cookie,
      iframes: [...document.querySelectorAll('iframe[src]')].map(i => i.src),
      scripts: [...document.querySelectorAll('script[src], link[href][rel~=stylesheet]')].map(e => e.src || e.href),
      cles: Object.keys(localStorage),
    }))
    const autre = o => new URL(o, base).host !== new URL(base).host
    resultats.push({ p, erreurs, cookiesDocument, tiers: [...iframes, ...scripts].filter(autre), horsEp: cles.filter(k => !k.startsWith('ep_')) })
    await page.close()
  }
  const cookies = await ctx.cookies()
  await ctx.close()
  const etrangers = [...hotes].filter(([h]) => h !== new URL(base).host)

  console.log(`${site} : ${pages.length} pages`)
  verifier(!cookies.length && resultats.every(r => !r.cookiesDocument), 'aucun cookie')
  verifier(!etrangers.length, `aucune requête vers un autre site${etrangers.length ? ` : ${etrangers.map(e => e[1])}` : ''}`)
  verifier(resultats.every(r => !r.tiers.length), `aucun script, feuille de style ni iframe d'un tiers${resultats.flatMap(r => r.tiers).slice(0, 2).join(' ')}`)
  verifier(resultats.every(r => !r.horsEp.length), `localStorage : seulement des clés ep_*${resultats.flatMap(r => r.horsEp).slice(0, 3).join(' ')}`)
  verifier(resultats.every(r => !r.erreurs.length), 'aucune erreur JavaScript')
  // À son report, ce volet doit viser la Dictée elle-même : ouvrir son exercice SANS clé saisie, lancer une dictée, et vérifier
  // qu'aucune requête ne part vers api.mistral.ai ; puis, avec une clé saisie, qu'une seule destination est jointe : api.mistral.ai.
  // Tant que la Dictée n'est pas dans la base, la garde est générique : aucune page ne joint Mistral, et aucune clé n'est mémorisée.
  verifier(!mistral.length, 'aucune requête vers api.mistral.ai tant qu\'aucune clé n\'est saisie')
}

console.log('Vie privée')
await Promise.all(SITES.map(visiter))
await nav.close()

// code de sortie lu par tests/lancer.mjs
process.exit(nbEchecs() ? 1 : 0)
