import { chromium } from 'playwright-core'
const b = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' })
const ctx = await b.newContext()
await ctx.addInitScript(() => { try { localStorage.setItem('ep_avis_traduction_vu', 'true') } catch {} })
const p = await ctx.newPage()
const viol = []
p.on('console', m => { if (/Content Security Policy|Refused to/.test(m.text())) viol.push(m.text().slice(0, 150)) })
p.on('pageerror', e => viol.push('ERR ' + String(e).slice(0, 120)))
for (const site of ['https://ecoleprimaire.app/', 'https://skoolik.app/']) {
  for (const u of ['', '#/imprimer/ecriture', '#/imprimer/alphabet', '#/imprimer/nombres', '#/imprimer/calcul', '#/maths/heure?mode=imprimer',
                   '#/maths/calcul-mental', '#/francais/dictee?mode=imprimer', '#/parametres', 'telechargements/', 'telechargements/fiche-ecriture-lettre-a/']) {
    viol.length = 0
    await p.goto(site + u); await p.waitForTimeout(1200)
    if (viol.length) console.log('⚠️ ', site + u, [...new Set(viol)].join(' || '))
  }
  // police ajoutée depuis un fichier (data:) + aperçu
  await p.goto(site + '#/imprimer/ecriture'); await p.waitForTimeout(800)
  await p.locator('summary').first().click().catch(() => {})
  viol.length = 0
  await p.locator('input[type=file]').first().setInputFiles('/tmp/pw/test-font.woff2').catch(() => {})
  await p.waitForTimeout(1200)
  console.log(site, 'police ajoutée :', viol.length ? '⚠️ ' + viol.join(' | ') : 'ok')
}
console.log('fin')
await b.close()
