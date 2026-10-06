// Pages statiques des fiches (/telechargements/<slug>/, scripts/build/statique/) : sans JavaScript, rien ne dépasse de l'écran
// (pas de défilement horizontal, aucun bloc plus large que la fenêtre, aucune image plus large que son conteneur, aucun texte coupé
// dans une boîte à overflow caché), à 320 px (le plus étroit des téléphones : le cas le plus strict) et à 1280 px. Toutes les pages du site construit
// y passent (l'index de fiches donne la liste), plus l'index statique /telechargements/ et la page 404.
// Demande un site construit avec `npm run fiches` puis `npm run statique` (tests/lancer.mjs : dist-test, TEST_URL).
//   TEST_URL=http://localhost:4190/ node tests/statique-debordement.test.mjs
import { lancerNavigateur, verifier, nbEchecs, app } from './outils.mjs'

const LARGEURS = [320, 1280]
const PARALLELE = 6
const nav = await lancerNavigateur()
const lecture = await nav.newContext()
const index = await (await lecture.request.get(app('/fiches/index.json'))).json()
const slugs = index.entrees.map(e => e.slug)

// ce qui dépasse dans la page chargée : défilement horizontal, éléments plus larges que la fenêtre, images trop larges, texte coupé
const defauts = page => page.evaluate(() => {
  const out = []
  const larg = document.documentElement.clientWidth
  if (document.documentElement.scrollWidth > larg + 1) out.push(`défilement horizontal (${document.documentElement.scrollWidth} > ${larg})`)
  for (const e of document.querySelectorAll('body *')) {
    const r = e.getBoundingClientRect()
    if (!r.width || !r.height) continue
    const nom = `${e.tagName.toLowerCase()}${e.className && typeof e.className === 'string' ? '.' + e.className.split(' ')[0] : ''}`
    if (r.right > larg + 1 || r.left < -1) out.push(`${nom} dépasse de l'écran`)
    const s = getComputedStyle(e)
    if (s.overflow !== 'visible' && e.tagName !== 'HTML' && (e.scrollWidth > e.clientWidth + 2 || e.scrollHeight > e.clientHeight + 2)) out.push(`${nom} coupé « ${e.textContent.trim().slice(0, 25)} »`)
  }
  return [...new Set(out)]
})

// un lot de pages réutilisées d'une adresse à l'autre (ouvrir une page coûte plus cher que la charger)
async function mesurer(contexte, routes) {
  const mauvaises = []
  const file = [...routes]
  const pages = await Promise.all(Array.from({ length: PARALLELE }, () => contexte.newPage()))
  await Promise.all(pages.map(async page => {
    for (let route = file.shift(); route !== undefined; route = file.shift()) {
      const r = await page.goto(app(route), { waitUntil: 'domcontentloaded' })
      const d = r?.status() === 200 ? await defauts(page) : []
      if (r?.status() !== 200) mauvaises.push(`${route} : statut ${r?.status()}`)
      else if (d.length) mauvaises.push(`${route} : ${d.slice(0, 2).join(' ; ')}`)
    }
  }))
  await Promise.all(pages.map(p => p.close()))
  return mauvaises
}

console.log('Le détecteur voit un débordement')
{
  const ctx = await nav.newContext({ javaScriptEnabled: false, viewport: { width: 320, height: 600 } })
  const page = await ctx.newPage()
  await page.setContent('<body><main><p>Un titre</p><div style="width:600px;height:20px;background:#ccc"></div></main></body>')
  verifier((await defauts(page)).length >= 2, 'un bloc de 600 px à 320 px : défilement horizontal et bloc qui dépasse')
  await page.setContent('<body><div style="width:100px;height:20px;overflow:hidden"><span style="display:inline-block;width:300px">texte coupé</span></div></body>')
  verifier((await defauts(page)).some(d => d.includes('coupé')), 'un texte coupé dans une boîte à overflow caché est vu')
  await ctx.close()
}

for (const largeur of LARGEURS) {
  console.log(`Pages statiques à ${largeur} px, sans JavaScript (${slugs.length + 1} pages)`)
  // sans JavaScript : c'est le HTML statique qui est mesuré, pas l'app qui le remplace
  const ctx = await nav.newContext({ javaScriptEnabled: false, viewport: { width: largeur, height: 900 } })
  const routes = ['/telechargements/', ...slugs.map(s => `/telechargements/${s}/`)]
  const mauvaises = await mesurer(ctx, routes)
  verifier(!mauvaises.length, `${routes.length - mauvaises.length} / ${routes.length} pages sans débordement${mauvaises.length ? ` — ${mauvaises.slice(0, 3).join(' | ')}${mauvaises.length > 3 ? ` (+${mauvaises.length - 3})` : ''}` : ''}`)
  await ctx.close()
}

console.log('Page 404 statique')
{
  const ctx = await nav.newContext({ javaScriptEnabled: false, viewport: { width: 320, height: 900 } })
  const page = await ctx.newPage()
  await page.goto(app('/404.html'))
  const d = await defauts(page)
  verifier(!d.length, `404.html à 320 px : rien ne dépasse${d.length ? ` (${d.slice(0, 2).join(' ; ')})` : ''}`)
  await ctx.close()
}

await nav.close()
process.exit(nbEchecs() ? 1 : 0)
