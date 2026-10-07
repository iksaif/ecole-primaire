import { chromium } from 'playwright-core'
const R = process.argv[2] ? [process.argv[2]] : ['/maths/calcul-mental', '/maths/calcul-pose', '/maths/tables', '/maths/numeration', '/maths/problemes', '/maths/fractions',
  '/maths/heure', '/maths/monnaie', '/maths/mesures', '/maths/geometrie', '/francais/grammaire', '/francais/vocabulaire',
  '/francais/conjugaison', '/francais/dictee', '/francais/orthographe', '/lecture', '/autres',
  '/maternelle/compter', '/maternelle/comparer', '/maternelle/ordonner', '/maternelle/lettres', '/maternelle/formes']
const b = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' })
const ctx = await b.newContext({ viewport: { width: 1100, height: 1000 } })
// hasard reproductible : window.__reset() remet la graine à zéro
await ctx.addInitScript(() => {
  let s = 1
  const r = () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296 }
  Math.random = r; window.__reset = () => { s = 1 }
  try { localStorage.setItem('ep_avis_traduction_vu', 'true') } catch {}
})
const p = await ctx.newPage()
const html = async () => (await p.locator('iframe').first().getAttribute('srcdoc').catch(() => '')) || ''
const etat = async el => (await el.getAttribute('class').catch(() => '')) + '|' + (await el.isChecked().catch(() => ''))
async function charger(r) {
  await p.evaluate(() => { localStorage.clear(); localStorage.setItem('ep_avis_traduction_vu', 'true') }).catch(() => {})
  await p.goto(`http://localhost:5173/ecole-primaire/?r=${Math.random()}#${r}?mode=imprimer`)
  await p.locator('.cadre-exercice').first().waitFor({ timeout: 8000 }).catch(() => {})
  await p.locator('iframe').first().waitFor({ timeout: 8000 }).catch(() => {})
  await p.waitForTimeout(200)
}
const SEL = '.cadre-exercice button:not([role=tab]), .cadre-exercice input[type=checkbox]'
for (const r of R) {
  await p.goto('http://localhost:5173/ecole-primaire/')
  await charger(r)
  const n = await p.locator(SEL).count()
  if (!n) console.log('  debug:', p.url(), 'cadre=', await p.locator('.cadre-exercice').count(), 'texte=', (await p.locator('body').innerText()).slice(0, 200).replace(/\n/g, ' / '))
  const sansEffet = []
  for (let i = 0; i < n; i++) {
    if (i > 0) await charger(r)
    const el = p.locator(SEL).nth(i)
    if (!(await el.isVisible().catch(() => false)) || await el.isDisabled().catch(() => true)) continue
    const lib = ((await el.innerText().catch(() => '')) || (await el.evaluate(e => e.parentElement?.innerText).catch(() => '')) || '').trim().replace(/\s+/g, ' ').slice(0, 40)
    if (/Nouvelle fiche|Imprimer|Fichenn nevez|Moullañ/.test(lib)) continue
    await p.evaluate(() => window.__reset()); await p.locator(SEL).nth(0).evaluate(() => 0)
    // fiche de référence avec la même graine : on force un recalcul en regénérant puis on remet la graine
    const e0 = await etat(el)
    await p.evaluate(() => window.__reset())
    await el.click({ timeout: 1500 }).catch(() => {})
    await p.waitForTimeout(500)
    const e1 = await etat(el), apres = await html()
    // retour à l'état initial avec la même graine
    await p.evaluate(() => window.__reset())
    await el.click({ timeout: 1500 }).catch(() => {})
    await p.waitForTimeout(500)
    const avant = await html(), e2 = await etat(el)
    if (e0 !== e1 && e2 === e0 && apres === avant) sansEffet.push(lib)
  }
  console.log(`${sansEffet.length || !n ? '⚠️ ' : '✓ '}${r.padEnd(22)} ${n} réglages${sansEffet.length ? ' — SANS EFFET : ' + sansEffet.join(' · ') : ''}`)
}
await b.close()
