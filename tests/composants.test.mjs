// Les composants optionnels du noyau (CadreExercice, Chronometre, OrdonnerClics, ConsigneParlee, RetourReponse, SaisieReponse) :
// comportement et accessibilité au clavier, sur /dev/composants et /dev/exemple (Chrome), en français et en breton ; puis le choix
// de voix (pur, node). L'analyse automatique (axe-core) est dans tests/accessibilite.test.mjs.
// Les pages /dev n'existent que dans un site construit avec VITE_AVEC_DEV=1 (TEST_URL_DEV) ou sur le serveur de dev :
//   TEST_URL=http://localhost:5173/ecole-primaire/ node tests/composants.test.mjs
import { lancerNavigateur, contexte, surveiller, verifier, nbEchecs, appDev } from './outils.mjs'
import { choisirVoix } from '../src/noyau/voix.ts'
import { LANGUES } from '../src/langues/registre.ts'

console.log('Voix : choix pur')
const v = (lang, localService = true) => ({ lang, localService })
verifier(choisirVoix([v('en-US'), v('fr-CA'), v('fr-FR')], 'fr-FR')?.lang === 'fr-FR', 'même région d\'abord')
verifier(choisirVoix([v('fr-FR', false), v('fr_CA')], 'fr-FR')?.lang === 'fr_CA', 'une voix locale de la langue avant une voix réseau de la région')
verifier(choisirVoix([v('en-US'), v('de-DE')], 'fr-FR') === null, 'aucune voix de la langue : null')
verifier(choisirVoix([v('fr-FR'), v('en-US')], LANGUES.br.voix.bcp47) === null, 'pas de voix bretonne : null (repli silencieux)')
verifier(LANGUES.fr.voix.disponible && !LANGUES.br.voix.disponible, 'la capacité vient du registre des langues')

const nav = await lancerNavigateur()
for (const langue of ['fr', 'br']) {
  console.log(`Interface ${langue}`)
  const ctx = await contexte(nav, { langue })
  // la synthèse vocale est remplacée : on note ce qu'on lui fait lire (le navigateur sans interface n'a pas de voix)
  await ctx.addInitScript(() => {
    window.__lu = []
    const s = window.speechSynthesis
    s.speak = u => { window.__lu.push([u.text, u.lang]) }
    s.cancel = () => {}
  })
  const page = await ctx.newPage()
  const erreurs = surveiller(page)
  await page.clock.install()

  // ── /dev/composants
  await page.goto(appDev('/dev/composants'))
  await page.waitForSelector('.chronometre')
  verifier(await page.locator('.cadre-exercice [role=tablist]').count() === 0, 'fiche seule : pas d\'onglets')
  verifier(await page.locator('.cadre-exercice .btn-ghost:has-text("ouvelle")').count() === 0 && await page.locator('.cadre-exercice .choix-police').count() === 0,
    'fiche seule, aleatoire et police à faux : ni « Nouvelle fiche » ni choix de police')
  verifier(await page.locator('.cadre-exercice iframe').getAttribute('sandbox') === 'allow-same-origin' && !!(await page.locator('.cadre-exercice iframe').getAttribute('title')),
    'l\'aperçu est une iframe sans scripts (sandbox) et titrée')

  // chronomètre : role=timer, nom lisible, décompte
  const chrono = page.locator('.chronometre')
  verifier(await chrono.getAttribute('role') === 'timer', 'le chronomètre est un role="timer"')
  await page.locator('.chrono .btn-primary').click()
  await page.clock.runFor(3000)
  verifier(/7/.test(await chrono.getAttribute('aria-label') ?? ''), 'après 3 s, il reste 7 s (nom accessible)')

  // ranger par clics, au clavier : 30, 10, 20 → l'ordre juste est 10, 20, 30
  const boutons = page.locator('.ordre-btn')
  await boutons.nth(1).focus()
  await page.keyboard.press('Enter')
  verifier(await boutons.nth(1).getAttribute('aria-pressed') === 'true', 'un élément touché est « enfoncé » (aria-pressed)')
  verifier(await page.evaluate(() => document.activeElement?.textContent?.trim()) === '20', 'le focus passe à l\'élément libre suivant')
  await page.keyboard.press('Space')
  await page.keyboard.press('Enter')
  verifier(await page.evaluate(() => document.activeElement?.textContent?.includes('✓') || document.activeElement?.classList.contains('btn-primary')) === true, 'tout est placé : le focus passe à « Valider »')
  verifier(await page.locator('.ordre-zone').getAttribute('aria-live') === 'polite', 'la réponse en cours est annoncée (aria-live)')
  await page.keyboard.press('Enter')
  await page.waitForSelector('.feedback.ok')
  verifier(await page.locator('.feedback.ok').getAttribute('role') === 'status', 'le retour de réponse est un role="status" (aria-live poli)')
  verifier(await boutons.nth(0).getAttribute('aria-disabled') === 'true', 'réponse juste : les éléments sont verrouillés (aria-disabled, focus gardé)')
  // une réponse fausse : couleur « erreur », « Annuler » retire le dernier élément, le verdict s'efface
  await page.reload()
  await page.waitForSelector('.ordre-btn')
  for (const i of [0, 1, 2]) await boutons.nth(i).click()
  await page.locator('.ordre-actions .btn-primary').click()
  await page.waitForSelector('.feedback.erreur')
  verifier(await page.locator('.ordre-slot.erreur').count() === 3, 'réponse fausse : les cases passent en « erreur »')
  await page.locator('.ordre-actions .btn-ghost').click()
  verifier(await page.locator('.feedback.erreur').count() === 0 && await page.locator('.ordre-slot.rempli').count() === 2, 'Annuler retire le dernier élément et efface le verdict')

  // consigne parlée : lue au clic, en français ; pas de bouton pour le breton (repli silencieux)
  verifier(await page.locator('.consigne-parlee .ecouter').count() === 1, 'un seul bouton « écouter » : le texte français (le breton n\'a pas de voix)')
  verifier(!!(await page.locator('.ecouter').getAttribute('aria-label')) && await page.locator('.ecouter').getAttribute('aria-pressed') === 'false', 'le bouton a un nom et un état (aria-pressed)')
  await page.locator('.ecouter').click()
  const lu = await page.evaluate(() => window.__lu)
  verifier(lu.length === 1 && lu[0][1] === 'fr-FR' && lu[0][0].includes('billes'), 'le clic lit le texte français avec la voix française')
  verifier(await page.locator('.consigne-parlee .texte').nth(1).textContent().then(t => t.includes('billoù')), 'le texte breton reste écrit')

  // ── /dev/exemple : onglets, groupes, réglages, champ de réponse
  await page.goto('about:blank')
  await page.goto(appDev('/dev/exemple'))
  await page.waitForSelector('.cadre-exercice')
  const onglets = page.locator('[role=tab]')
  verifier(await page.locator('[role=tablist]').count() === 1 && await onglets.count() === 2, 'deux onglets dans une tablist')
  verifier(await onglets.nth(0).getAttribute('aria-selected') === 'true' && await onglets.nth(0).getAttribute('tabindex') === '0' && await onglets.nth(1).getAttribute('tabindex') === '-1',
    'un seul onglet dans l\'ordre de tabulation (le choisi)')
  const panneau = await onglets.nth(0).getAttribute('aria-controls')
  verifier(await page.locator(`[role=tabpanel][id="${panneau}"]`).getAttribute('aria-labelledby') === await onglets.nth(0).getAttribute('id'), 'le panneau est relié à son onglet')
  await onglets.nth(0).focus()
  await page.keyboard.press('ArrowRight')
  await page.waitForSelector('iframe')
  verifier(await onglets.nth(1).getAttribute('aria-selected') === 'true' && await page.evaluate(() => document.activeElement?.getAttribute('role')) === 'tab', 'flèche droite : onglet « Imprimer », le focus le suit')
  verifier(await page.locator('.choix-police select').evaluate(e => e.labels.length === 1 && !!e.labels[0].textContent.trim()), 'ChoixPolice : la liste a son libellé (label for)')
  await page.keyboard.press('Home')
  await page.waitForSelector('.actions .btn-primary')
  verifier(await onglets.nth(0).getAttribute('aria-selected') === 'true', 'Début : premier onglet')
  verifier(await page.locator('[data-reglage] .level-btn:not([aria-pressed])').count() === 0, 'tous les boutons de choix portent aria-pressed')
  verifier(await page.locator('[data-reglage][role=group][aria-labelledby]').count() > 0, 'les réglages sont des groupes nommés')
  const titres = await page.locator('h1, h2, h3, h4').evaluateAll(l => l.map(h => +h.tagName[1]))
  verifier(titres[0] === 1 && titres.every((n, i) => i === 0 || n - titres[i - 1] <= 1), `hiérarchie des titres sans saut (${titres.join(',')})`)

  await page.locator('.actions .btn-primary').click()
  await page.waitForSelector('.score-bar')
  const champ = page.locator('.exercise-input')
  verifier(!!(await champ.getAttribute('aria-label')) && ['numeric', 'decimal', 'text', null].includes(await champ.getAttribute('inputmode')), 'le champ de réponse a un nom et un clavier adapté')
  verifier(await page.evaluate(() => document.activeElement?.classList.contains('exercise-input')), 'à chaque question le champ a le focus')
  verifier(await page.locator('.exercise-box[role=group][aria-label]').count() === 1, 'la question est un groupe nommé')
  await champ.fill('999999')
  await page.keyboard.press('Enter')
  await page.waitForSelector('.feedback.erreur')
  verifier(await champ.getAttribute('aria-invalid') === 'true', 'mauvaise réponse : aria-invalid')
  verifier(await champ.getAttribute('aria-describedby') === await page.locator('.feedback').getAttribute('id') && !!(await page.locator('.feedback').textContent()), 'le champ est relié au message de retour (aria-describedby)')
  verifier(await page.evaluate(() => document.activeElement?.classList.contains('exercise-input')), 'après l\'erreur, le focus reste dans le champ')
  await page.keyboard.press('Enter')
  await page.waitForFunction(() => document.querySelector('.score-bar span')?.textContent?.includes('2'))
  verifier(true, 'Entrée sur un champ répondu passe à la question suivante')
  verifier(await page.evaluate(() => document.activeElement?.classList.contains('exercise-input')), 'question suivante : le focus est dans le champ')

  verifier(erreurs.length === 0, `aucune erreur JavaScript${erreurs.length ? ' : ' + erreurs[0] : ''}`)
  await ctx.close()
}
await nav.close()
process.exit(nbEchecs() ? 1 : 0)
