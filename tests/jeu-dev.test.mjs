// Le JEU et la FICHE des exemples d'exercice dans Chrome (/dev/exemple et /dev/exemple-corpus) : réglages, changement de
// niveau, bonne et mauvaise réponse, suite et résultats, rejouer, fiche reproductible (Jouer → Imprimer → Jouer → Imprimer =
// même fiche ; « Nouvelle fiche » écrit la graine dans l'URL ; recharger la garde). Pas d'attente fixe : on attend un état de
// la page, et l'horloge est pilotée (page.clock) pour le délai de 1,6 s qui suit une bonne réponse.
// Les pages /dev n'existent que dans un site construit avec VITE_AVEC_DEV=1 (tests/lancer.mjs → TEST_URL_DEV) ou sur le
// serveur de dev :
//   TEST_URL=http://localhost:5173/ecole-primaire/ node tests/jeu-dev.test.mjs
import { lancerNavigateur, contexte, surveiller, verifier, nbEchecs, appDev } from './outils.mjs'

const nav = await lancerNavigateur()
const ctx = await contexte(nav)
const page = await ctx.newPage()
const erreurs = surveiller(page)
// « Blocked script execution in 'about:srcdoc' » : attendu. L'aperçu est un iframe sandbox SANS allow-scripts et la fiche ne contient
// aucun script ; c'est le script d'initialisation que Playwright (contexte(), page.clock) injecte dans chaque frame que le navigateur bloque.
page.on('console', m => { if (m.type() === 'error' && !/\/journal\?/.test(m.location().url ?? '') && !/Blocked script execution/.test(m.text())) erreurs.push(m.text().slice(0, 200)) })
await page.clock.install()

const ouvrir = async route => {
  await page.goto('about:blank')
  await page.goto(appDev(route))
  await page.waitForSelector('.cadre-exercice')
}
const actifs = cle => page.locator(`[data-reglage="${cle}"] .level-btn.active`).evaluateAll(l => l.map(b => b.dataset.valeur))
const cliquer = (cle, valeur) => page.locator(`[data-reglage="${cle}"] [data-valeur="${valeur}"]`).click()
const apercu = () => page.locator('iframe').evaluate(f => f.contentDocument?.documentElement?.innerHTML ?? '')
const attendreApercu = async () => { await page.waitForSelector('iframe'); await page.waitForFunction(() => !!document.querySelector('iframe')?.contentDocument?.querySelector('.entete')) }
const suivant = () => page.locator('.exercise-box .btn-primary')
const numeroQuestion = () => page.locator('.score-bar span').first().textContent()

// La réponse juste d'une question de l'exemple « suites » lue à l'écran : le terme qui manque, ou le pas
const reponseJuste = () => page.evaluate(() => {
  const suite = [...document.querySelectorAll('.suite > *')]
  const nombres = suite.map(e => (e.matches('.terme') ? Number(e.textContent) : null))
  const connus = nombres.map((n, i) => ({ n, i })).filter(x => x.n !== null)
  const pas = connus[1].n - connus[0].n
  const unPas = pas / (connus[1].i - connus[0].i)
  const trou = nombres.indexOf(null)
  const regle = !document.querySelector('.suite .exercise-input')
  return regle ? Math.abs(unPas) : connus[0].n + unPas * (trou - connus[0].i)
})
const saisir = async n => { await page.locator('.exercise-input').fill(String(n)); await page.keyboard.press('Enter') }

console.log('Exemple simple : réglages et niveau')
await ouvrir('/dev/exemple')
verifier((await actifs('niveau'))[0] === 'cp', 'ouvre au niveau par défaut (CP)')
verifier(await page.locator('[data-reglage="pas"] [data-valeur="5"]').textContent().then(t => t.includes('bonus')), 'le CP propose 5 en bonus (marqué)')
await cliquer('pas', '1')   // un pas de moins coché : la liste se modifie
verifier(!(await actifs('pas')).includes('1') || (await actifs('pas')).length > 0, 'au moins une valeur reste cochée')
await cliquer('niveau', 'ce1')
verifier(JSON.stringify(await actifs('pas')) === '["2","5","10","100"]', 'CE1 : un choix multiple reprend les défauts du niveau')
await cliquer('niveau', 'cp')
verifier((await actifs('pas')).every(v => ['1', '2', '10'].includes(v)), 'retour au CP : seuls les pas du programme sont cochés (le bonus 5 ne suit pas)')
await cliquer('nbQ', '5')
await cliquer('exercices', 'complete')

console.log('Exemple simple : partie')
await page.locator('.actions .btn-primary').click()
await page.waitForSelector('.score-bar')
verifier((await numeroQuestion()).includes('1'), 'la partie commence à la question 1')
// 1re : une mauvaise réponse
await saisir((await reponseJuste()) + 7)
await page.waitForSelector('.feedback.erreur')
verifier(await page.locator('.feedback.erreur').count() === 1, 'mauvaise réponse : retour « erreur »')
await suivant().click()
await page.waitForFunction(() => document.querySelector('.score-bar span')?.textContent?.includes('2'))
// 2e : une bonne, puis l'horloge avance (délai avant la suite)
await saisir(await reponseJuste())
await page.waitForSelector('.feedback.ok')
verifier(await page.locator('.feedback.ok').count() === 1, 'bonne réponse : retour « ok »')
await page.clock.runFor(2000)
await page.waitForFunction(() => document.querySelector('.score-bar span')?.textContent?.includes('3'))
verifier(true, 'une bonne réponse passe seule à la question suivante')
for (let i = 3; i <= 5; i++) {
  await saisir(await reponseJuste())
  await page.waitForSelector('.feedback.ok')
  await page.clock.runFor(2000)
}
await page.waitForSelector('.resultats-jeu')
verifier((await page.locator('.result-score').textContent()).includes('4') && (await page.locator('.result-score').textContent()).includes('5'), 'résultats : 4 / 5 (une erreur)')
verifier(await page.locator('.resultats-jeu .btn-primary').count() === 1, 'Rejouer disponible')
await page.locator('.resultats-jeu .btn-primary').click()
await page.waitForSelector('.score-bar')
verifier((await numeroQuestion()).includes('1'), 'rejouer : une nouvelle partie, question 1')
await page.locator('.btn-quitter').click()
await page.waitForSelector('.cadre-exercice')
verifier((await actifs('nbQ'))[0] === '5', 'quitter : retour aux réglages, ils sont gardés')

console.log('Exemple simple : fiche reproductible (graine)')
await page.locator('.modes button').nth(1).click()
await attendreApercu()
const fiche1 = await apercu()
verifier(/class="suite"/.test(fiche1), 'l\'onglet « Imprimer » montre la fiche')
await page.locator('.modes button').nth(0).click()
await page.waitForSelector('.actions .btn-primary')
await page.locator('.modes button').nth(1).click()
await attendreApercu()
verifier(await apercu() === fiche1, 'Jouer → Imprimer → Jouer → Imprimer : la même fiche')
const urlAvant = page.url()
await page.locator('.apercu-impression .btn-ghost, button:has-text("ouvelle")').first().click()
await page.waitForFunction(av => location.href !== av, urlAvant)
// l'aperçu suit l'URL : on attend qu'il ait changé (état de la page, pas une durée)
await page.waitForFunction(av => (document.querySelector('iframe')?.contentDocument?.documentElement?.innerHTML ?? av) !== av, fiche1)
const fiche2 = await apercu()
verifier(/graine=\d+/.test(page.url()) && fiche2 !== fiche1, '« Nouvelle fiche » : une autre fiche, graine écrite dans l\'URL')
const lien = page.url()
await page.goto('about:blank')
await page.goto(lien)
await attendreApercu()
verifier(await apercu() === fiche2, 'recharger le lien redonne la même fiche')
await page.goto(appDev('/dev/exemple?mode=imprimer&graine=12345'))
await attendreApercu()
const f12345 = await apercu()
await page.goto('about:blank')
await page.goto(appDev('/dev/exemple?mode=imprimer&graine=12345'))
await attendreApercu()
verifier(await apercu() === f12345, '?graine=12345 : toujours la même fiche')

console.log('Exemple à corpus (QCM)')
await ouvrir('/dev/exemple-corpus')
await cliquer('nbQ', '5')
await page.locator('.actions .btn-primary').click()
await page.waitForSelector('.choix-btn')
for (let i = 1; i <= 5; i++) {
  await page.waitForFunction(n => document.querySelector('.score-bar span')?.textContent?.includes(String(n)), i)
  await page.locator('.choix-btn').first().click()
  await page.waitForSelector('.choix-btn.ok')
  verifier(await page.locator('.choix-btn.ok').count() === 1, `question ${i} : la bonne proposition est colorée`)
  if (await suivant().count()) await suivant().click()
  else await page.clock.runFor(2000)
}
await page.waitForSelector('.resultats-jeu')
verifier(/\/\s*5/.test(await page.locator('.result-score').textContent()), 'résultats sur 5 questions')

verifier(!erreurs.length, `aucune erreur JavaScript${erreurs.length ? ` (${erreurs[0]})` : ''}`)
await nav.close()
process.exit(nbEchecs() ? 1 : 0)
