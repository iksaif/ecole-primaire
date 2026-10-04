// Pages de téléchargement : filtres, recherche, langue régionale, visionneuse ; vie privée (cookies, tiers)
import { lancerNavigateur, contexte, surveiller, verifier, URL_SITE, app } from './outils.mjs'

const nav = await lancerNavigateur()
const visibles = p => p.locator('.carte:not([hidden])').count()

console.log('Index des fiches')
for (const regionale of ['', 'br']) {
  const ctx = await contexte(nav, { regionale })
  const p = await ctx.newPage()
  const erreurs = surveiller(p)
  await p.goto(`${URL_SITE}telechargements/`)
  await p.waitForTimeout(400)
  const total = await visibles(p)
  await p.keyboard.press('/'); await p.keyboard.type('alphabet'); await p.waitForTimeout(200)
  const recherche = await visibles(p)
  await p.keyboard.press('Escape')
  await p.locator('.filtre[data-filtre=classe] button', { hasText: 'CE1' }).click()
  const ce1 = await visibles(p)
  const filtreLangue = await p.locator('.filtre[data-filtre=langue]').isVisible()
  verifier(total > 0 && recherche > 0 && recherche < total && ce1 > 0 && ce1 < total && !erreurs.length,
    `langue régionale « ${regionale || 'aucune'} » : ${total} fiches, « alphabet » ${recherche}, CE1 ${ce1}`)
  verifier(filtreLangue === (regionale === 'br'), `filtre de langue ${regionale === 'br' ? 'visible' : 'masqué'}`)
  await ctx.close()
}

console.log('Visionneuse de pages')
{
  const ctx = await contexte(nav)
  const p = await ctx.newPage()
  await p.goto(`${URL_SITE}telechargements/cartes-alphabet-une-lettre-par-page/`)
  const pos = await p.locator('.pager .position').innerText().catch(() => '')
  await p.locator('.fleche[data-pas="1"]').click().catch(() => {})
  verifier(/1 \/ 26/.test(pos) && (await p.locator('#apercu').getAttribute('src')) === 'apercu-p2.jpg', `${pos.trim()} → page 2`)
  await ctx.close()
}

console.log('Vie privée')
{
  const ctx = await contexte(nav)
  const p = await ctx.newPage()
  const hote = new URL(URL_SITE).host, tiers = new Set()
  p.on('request', r => { const h = new URL(r.url()).host; if (h !== hote && !r.url().startsWith('data:')) tiers.add(h) })
  for (const r of ['/', '/parametres', '/maths/calcul-mental?mode=imprimer', '/imprimer/ecriture']) { await p.goto(app(r)); await p.waitForTimeout(600) }
  await p.goto(`${URL_SITE}telechargements/`)
  verifier((await ctx.cookies()).length === 0, 'aucun cookie')
  verifier(tiers.size === 0, `aucune requête vers un autre site${tiers.size ? ' : ' + [...tiers].join(', ') : ''}`)
  await ctx.close()
}
await nav.close()
