import { chromium } from 'playwright-core'
const b = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' })
const ctx = await b.newContext()
const p = await ctx.newPage()
const tiers = new Set()
p.on('request', r => { const h = new URL(r.url()).host; if (!/ecoleprimaire\.app$/.test(h)) tiers.add(h) })
for (const r of ['#/', '#/parametres', '#/maths/calcul-mental', '#/imprimer/ecriture', '#/francais/dictee']) { await p.goto('https://ecoleprimaire.app/' + r); await p.waitForTimeout(1200) }
await p.getByRole('button', { name: /BR|Brezhoneg/ }).first().click().catch(() => {})
await p.waitForTimeout(500)
console.log('cookies (navigateur) :', JSON.stringify(await ctx.cookies()))
console.log('document.cookie :', JSON.stringify(await p.evaluate(() => document.cookie)))
console.log('localStorage :', await p.evaluate(() => Object.keys(localStorage).join(', ')))
console.log('requêtes vers d\'autres domaines :', [...tiers].join(', ') || 'aucune')
await b.close()
