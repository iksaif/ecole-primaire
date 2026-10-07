import { chromium } from 'playwright-core'
const b = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' })
const base = 'http://localhost:4182/telechargements/'
const compte = p => p.locator('.carte:not([hidden])').count()
for (const reg of [null, 'br']) {
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } })
  if (reg) await ctx.addInitScript(r => localStorage.setItem('ep_langue_regionale', JSON.stringify(r)), reg)
  const p = await ctx.newPage()
  const err = []; p.on('pageerror', e => err.push(String(e)))
  await p.goto(base); await p.waitForTimeout(500)
  console.log(`— langue régionale ${reg ?? 'par défaut (aucune)'} : ${await compte(p)} cartes visibles, filtre langue visible : ${await p.locator('.filtre[data-filtre=langue]').isVisible()}`)
  await p.keyboard.press('/'); await p.keyboard.type('alphabet'); await p.waitForTimeout(200)
  console.log('  recherche « alphabet » :', await compte(p))
  await p.keyboard.press('Escape'); await p.waitForTimeout(100)
  await p.locator('.filtre[data-filtre=classe] button', { hasText: 'CE1' }).click()
  console.log('  classe CE1 :', await compte(p))
  await p.locator('.filtre[data-filtre=usage] button', { hasText: /Pour apprendre/ }).click()
  console.log('  CE1 + pour apprendre :', await compte(p))
  if (!reg) { await p.locator('.filtre[data-filtre=usage] button').first().click(); await p.locator('.filtre[data-filtre=classe] button').first().click()
    await p.getByRole('button', { name: /Afficher aussi les fiches en breton/ }).click(); await p.waitForTimeout(200)
    console.log('  après « afficher le breton » :', await compte(p)) }
  await p.locator('.langue-ui [data-ui=br]').click(); await p.waitForTimeout(200)
  console.log('  interface BR → titre :', await p.locator('h1').innerText(), '| erreurs :', err)
  if (!reg) await p.screenshot({ path: '/tmp/pw/idx.png' })
  await ctx.close()
}
await b.close()
