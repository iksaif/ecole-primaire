// Pages « Programme » et « Compétence » dans Chrome : adresse partagée = même vue, cases = liens vers la compétence, étiquettes de
// référence séparées (jamais un lien dans un lien), bascule des références et défaut par profil, liens PDF avec #page=, liste par défaut
// sur téléphone, tableau sans débordement de la page à 320 px, accessibilité (axe) à 360 et 1280 px en français et en breton.
//   TEST_URL=http://localhost:5173/ecole-primaire/ node tests/pages-programme.test.mjs
import { COMPETENCES } from '../src/data/programme.ts'
import { lancerNavigateur, contexte, surveiller, verifier, nbEchecs, app, appDev, URL_SITE } from './outils.mjs'
import { verifierAxe } from './outils-axe.mjs'

const URL_SKOOLIK = process.env.TEST_URL_SKOOLIK && process.env.TEST_URL_SKOOLIK.replace(/\/?$/, '/')
const BASE = new URL(URL_SITE).pathname
const ou = page => { const u = new URL(page.url()); return `${u.pathname.slice(BASE.length - 1)}${u.search}` }
const pret = page => page.waitForSelector('main#contenu h1', { timeout: 10000 })
const presse = (page, nom) => page.locator(`button[aria-pressed="true"]`, { hasText: nom }).count().then(n => n > 0)
const nav = await lancerNavigateur()

/** Un contexte de navigateur avec un profil (réglage d'appareil) ; la copie dans le presse-papiers est autorisée. */
async function ouvrir({ profil, largeur = 1280, langue = 'fr' } = {}) {
  const ctx = await contexte(nav, { langue, viewport: { width: largeur, height: 900 } })
  await ctx.grantPermissions(['clipboard-read', 'clipboard-write']).catch(() => {})
  await ctx.addInitScript(() => { try { localStorage.setItem('ep_enseignant', 'true') } catch {} })   // mode enseignant activé (caché par défaut : tests/enseignant.test.mjs)
  if (profil) await ctx.addInitScript(p => { try { localStorage.setItem('ep_profil', JSON.stringify(p)) } catch {} }, profil)
  const page = await ctx.newPage()
  return { ctx, page, erreurs: surveiller(page) }
}

console.log('Adresse partagée : même vue ouverte à froid')
{
  const { ctx, page, erreurs } = await ouvrir()
  await page.goto(app('/programme?matiere=francais&domaine=lecture&affichage=tableau&classes=ce1,ce2&refs=1'))
  await pret(page)
  await page.waitForSelector('table.prog')
  verifier(await presse(page, 'Français') && await presse(page, 'Lecture'), 'matière et domaine de l’adresse')
  verifier(await presse(page, 'CE1') && await presse(page, 'CE2') && !(await presse(page, 'CP')), 'classes de l’adresse (union)')
  verifier(await page.locator('table.prog tbody tr').count() > 0 && await page.locator('th[scope="col"]').count() >= 9 && await page.locator('th[scope="row"]').count() > 0, 'tableau : en-têtes de colonne et de ligne (th scope)')
  verifier(await page.locator('table.prog caption').count() === 1 && (await page.locator('.cle').count()) === 1, 'légende du tableau (caption et clé de lecture)')
  const liens = await page.locator('td a.case').evaluateAll(l => l.map(a => a.getAttribute('href')))
  verifier(liens.length > 0 && liens.every(h => /\/competence\/[^/?]+\?classes=(ps|ms|gs|cp|ce1|ce2|cm1|cm2)/.test(h)), `chaque case est un lien vers /competence/<id>?classes=<classe> (${liens.length} cases)`)
  verifier(await page.locator('a a, a:has(a), a:has(button), button a').count() === 0, 'aucun lien dans un lien')
  const refs = await page.locator('a.reference').evaluateAll(l => l.map(a => ({ href: a.href, texte: a.textContent.trim() })))
  verifier(refs.length > 0 && refs.every(r => /#page=\d+$/.test(r.href)) && refs.every(r => /p\. PDF \d+/.test(r.texte)), 'étiquettes de référence : « … p. PDF n », lien PDF avec #page=')
  verifier(await page.locator('a.reference').first().getAttribute('target') === '_blank', 'le PDF s’ouvre dans un autre onglet')
  const sticky = await page.locator('th[scope="row"]').first().evaluate(e => getComputedStyle(e).position)
  verifier(sticky === 'sticky', 'colonne des compétences collante')
  verifier(!erreurs.length, `aucune erreur JavaScript${erreurs.length ? ` (${erreurs[0]})` : ''}`)
  // un clic sur une case : la page de la compétence, avec la classe
  const premier = page.locator('td a.case').first()
  const href = await premier.getAttribute('href')
  await premier.click()
  await page.waitForURL(/\/competence\//)
  await pret(page)
  verifier(ou(page) === href.slice(BASE.length - 1) && ou(page).includes('classes='), `la case mène à la compétence, avec la classe (${ou(page)})`)
  await ctx.close()
}

console.log('Références : défaut par profil, bascule, adresse')
{
  for (const [profil, attendu] of [['enseignant', true], ['parent', false], ['enfant', false]]) {
    const { ctx, page } = await ouvrir({ profil })
    await page.goto(app('/programme?affichage=tableau'))
    await page.waitForSelector('table.prog')
    const actif = await presse(page, 'Afficher les références')
    verifier(actif === attendu && (await page.locator('a.reference').count() > 0) === attendu, `profil ${profil} : références ${attendu ? 'affichées' : 'masquées'} d’office`)
    await ctx.close()
  }
  const { ctx, page } = await ouvrir()
  await page.goto(app('/programme?affichage=tableau'))
  await page.waitForSelector('table.prog')
  await page.getByRole('button', { name: /Afficher les références/ }).click()
  await page.waitForSelector('a.reference')
  // le choix est mémorisé sur l'appareil : il devient le défaut, l'adresse n'a donc rien à écrire (le lien à partager, si : voir plus bas)
  verifier(await presse(page, 'Afficher les références') && await page.evaluate(() => localStorage.getItem('ep_refs')) === 'true', 'la bascule affiche les étiquettes et mémorise le choix')
  await page.getByRole('button', { name: /Afficher les références/ }).click()
  verifier(await page.locator('a.reference').count() === 0, 'la bascule masque les étiquettes')
  await page.getByRole('button', { name: /Afficher les références/ }).click()
  await page.getByRole('button', { name: 'Liste', exact: true }).click()
  await page.waitForSelector('ul.competences, p.vide')
  verifier(ou(page).includes('affichage=liste') && await presse(page, 'Liste'), 'la présentation est dans l’adresse')
  await page.getByRole('button', { name: 'Mathématiques' }).click()
  await page.getByRole('button', { name: 'Le monde' }).click()
  verifier(ou(page).includes('matiere=monde') && !ou(page).includes('domaine=nombres-calcul') && ou(page).includes('affichage=liste') && await presse(page, 'Afficher les références'), 'changer de matière garde la présentation et les références, et change de domaine')
  // lien à partager
  await page.getByRole('button', { name: 'Copier le lien vers ce tableau' }).click()
  await page.waitForFunction(() => /Lien copié|Copie impossible/.test(document.querySelector('[role=status]')?.textContent ?? ''))
  const statut = await page.locator('[role=status]').textContent()
  verifier(statut.includes('Lien copié') && await page.locator('[role=status][aria-live="polite"]').count() === 1, 'confirmation annoncée (aria-live)')
  const lien = await page.evaluate(() => navigator.clipboard.readText()).catch(() => '')
  verifier(/matiere=monde/.test(lien) && /domaine=/.test(lien) && /affichage=liste/.test(lien) && /refs=1/.test(lien) && /classes=/.test(lien), `le lien copié dit toute la vue (${lien.replace(/^.*programme/, 'programme')})`)
  const autre = await ouvrir()
  const adresse = new URL(lien)
  await autre.page.goto(`${new URL(URL_SITE).origin}${adresse.pathname}${adresse.search}`)
  await pret(autre.page)
  verifier(await presse(autre.page, 'Le monde') && await presse(autre.page, 'Liste') && await presse(autre.page, 'Afficher les références'), 'ouvert chez un autre : même matière, présentation et références')
  await autre.ctx.close()
  await ctx.close()
}

console.log('Téléphone : liste par défaut, tableau sans débordement de la page')
{
  const { ctx, page } = await ouvrir({ largeur: 320 })
  await page.goto(app('/programme'))
  await pret(page)
  await page.waitForSelector('ul.competences, p.vide')
  verifier(await page.locator('table.prog').count() === 0 && await presse(page, 'Liste'), 'à 320 px la liste est la présentation par défaut')
  await page.getByRole('button', { name: 'Tableau', exact: true }).click()
  await page.waitForSelector('table.prog')
  verifier(ou(page).includes('affichage=tableau'), 'choisir le tableau l’écrit dans l’adresse')
  await page.getByRole('button', { name: /Afficher les références/ }).click()
  await page.waitForSelector('a.reference')
  const mesure = await page.evaluate(() => ({ page: document.documentElement.scrollWidth, fenetre: document.documentElement.clientWidth,
    defile: document.querySelector('.defile').scrollWidth > document.querySelector('.defile').clientWidth, focus: document.querySelector('.defile').tabIndex }))
  verifier(mesure.page <= mesure.fenetre, `la page ne déborde pas à 320 px (${mesure.page} ≤ ${mesure.fenetre})`)
  verifier(mesure.defile && mesure.focus === 0, 'le tableau défile dans sa région, atteignable au clavier')
  await page.locator('.defile').evaluate(e => { e.scrollLeft = 300 })
  const x = await page.locator('th[scope="row"]').first().evaluate(e => e.getBoundingClientRect().left)
  verifier(x >= 0 && x < 20, `la colonne des compétences reste visible pendant le défilement (x = ${Math.round(x)})`)
  await ctx.close()
}

console.log('Programme : titre, fil d’Ariane, liste par défaut, adresse de la vue, colonne des ressources')
{
  const { ctx, page } = await ouvrir()
  await page.goto(app('/programme?classes=ce1,ce2'))
  await pret(page)
  verifier(await page.locator('h1').count() === 1 && (await page.locator('h1').textContent()).trim() === '📚 Programme', 'titre « 📚 Programme »')
  const fil = await page.locator('nav.fil li').allTextContents()
  verifier(fil.length === 2 && /Accueil/.test(fil[0]) && /Programme/.test(fil[1]) && await page.locator('nav.fil li a').count() === 1, 'fil d’Ariane : Accueil › Programme')
  verifier(await presse(page, 'Liste') && await page.locator('table.prog').count() === 0, 'la liste est la présentation par défaut (comme la maquette)')
  const adresse = await page.locator('p.adresse code').textContent()
  verifier(/^https?:\/\/.*\/programme\?/.test(adresse) && /classes=ce1(,|%2C)ce2/.test(adresse) && /affichage=liste/.test(adresse), `ligne « Adresse de cette vue » (${adresse.replace(/^.*programme/, 'programme')})`)
  await page.getByRole('button', { name: 'Tableau', exact: true }).click()
  await page.waitForSelector('table.prog')
  const entete = page.locator('table.prog thead th').last()
  verifier((await entete.textContent()).trim().startsWith('🧰') && await entete.locator('.sr-only').textContent() === 'Ressources' && await entete.locator('[aria-hidden="true"]').textContent() === '🧰', 'colonne « Ressources » : l’icône 🧰 et un libellé accessible')
  verifier((await page.locator('p.adresse code').textContent()).includes('affichage=tableau'), 'l’adresse suit la vue')
  await ctx.close()
}

console.log('Interprétation (Le monde)')
{
  const k = COMPETENCES.find(c => c.interpretation && c.niveaux.includes('cm2'))
  const { ctx, page } = await ouvrir()
  await page.goto(app(`/programme?matiere=monde&domaine=${k.domaine}&classes=cm2&affichage=tableau`))
  await page.waitForSelector('table.prog')
  const resume = page.locator('details.lecture summary').first()
  verifier(await resume.count() === 1 && await page.locator('details.lecture p').first().isHidden(), 'indicateur discret, texte masqué')
  await resume.focus()
  await page.keyboard.press('Enter')
  verifier(await page.locator('details.lecture p').first().isVisible(), 'au clavier : l’interprétation s’affiche')
  await verifierAxe(page, 'programme monde avec interprétation ouverte', { exclure: [['nav.nav'], ['footer.pied']] })
  await ctx.close()
}

console.log('Page d’une compétence')
{
  const k = COMPETENCES.find(c => c.id === 'composer-decomposer')
  const { ctx, page, erreurs } = await ouvrir()
  await page.goto(app('/competence/composer-decomposer?classes=ms'))
  await pret(page)
  verifier((await page.locator('main h1').textContent()).includes(k.libelle) && await page.locator('main h1').count() === 1, 'h1 : l’intitulé de la compétence')
  await page.waitForFunction(l => document.title.startsWith(l), k.libelle)
  verifier((await page.title()).startsWith(k.libelle) && (await page.title()).endsWith(' — École Primaire'), `titre du document : l’intitulé (${(await page.title()).slice(0, 50)}…)`)
  verifier(await page.getByText('Nombres et calcul').first().isVisible() && await page.locator('a[href$="/maths"]').count() >= 1, 'domaine et lien vers la matière')
  verifier(await page.locator('a.classe').count() === k.niveaux.length && await page.locator('a.classe[aria-current]').count() === 1, 'classes concernées en liens, la classe de l’adresse mise en avant')
  const pdf = await page.locator('a[href*="#page="]').first().getAttribute('href')
  verifier(pdf === k.source.url && (await page.locator('a[href*="#page="]').first().textContent()).includes(`p. PDF ${k.source.page}`), 'lien « programme officiel » : PDF à la page du PDF')
  verifier((await page.locator('blockquote').textContent()).includes(k.source.extrait), 'extrait du texte officiel')
  verifier(await page.getByRole('heading', { name: /Compétences voisines/ }).count() === 1 && await page.locator('.voisines li a').count() > 0, 'compétences voisines (même domaine)')
  verifier(await page.getByRole('heading', { name: 'Toutes les ressources liées' }).count() === 1, 'toutes les ressources liées')
  const vides = await page.locator('.vide').allTextContents()
  verifier(vides.length === 1 && vides[0].startsWith('Pas encore de ressource'), `aucune ressource : une seule ligne d’état (${vides[0]})`)
  verifier(await page.locator('.voisines li a').count() <= 6, 'compétences voisines : six au plus')
  verifier(!erreurs.length, `aucune erreur JavaScript${erreurs.length ? ` (${erreurs[0]})` : ''}`)
  const avant = await page.title()
  await page.locator('.voisines li a').first().click()
  await page.waitForFunction(t => document.title !== t, avant)
  verifier(!(await page.title()).startsWith(k.libelle), 'le titre suit la compétence voisine')
  await page.goto(app('/competence/nexiste-pas'))
  await pret(page)
  await page.waitForFunction(() => document.title.includes('introuvable'))
  verifier((await page.locator('main h1').textContent()).includes('introuvable') && (await page.title()).includes('introuvable'), 'compétence inconnue : message clair, jamais une page cassée')
  await ctx.close()
}

console.log('Compétence avec des exemples (développement)')
{
  const { ctx, page } = await ouvrir()
  await page.goto(appDev('/competence/exemple-compter'))
  await pret(page)
  if ((await page.locator('main h1').textContent()).includes('Compter de n en n')) {
    await page.waitForSelector('.liste li, .vide')
    await page.waitForFunction(() => document.querySelectorAll('.liste li a').length > 0, null, { timeout: 5000 }).catch(() => {})
    verifier(await page.locator('.liste li a[href^="/dev"], .liste li a[href*="/dev"]').count() > 0, 'les ressources liées apparaissent (exercice d’exemple)')
    verifier(await page.locator('a[href*="/dev/exemple"]').count() > 0, 'lien vers l’exercice d’exemple')
    await verifierAxe(page, 'compétence avec ressources (cartes)', { exclure: [['nav.nav'], ['footer.pied']] })
  } else console.log('  (build sans exemples : vérifications ignorées)')
  await ctx.close()
}

console.log('Accessibilité (axe)')
for (const largeur of [1280, 360]) {
  for (const [langue, base] of [['fr', app], ['br', URL_SKOOLIK ? (r => `${URL_SKOOLIK}${r.replace(/^\//, '')}`) : null]]) {
    if (!base) { console.log('  (pas de build skoolik : breton ignoré)'); continue }
    const { ctx, page } = await ouvrir({ largeur, langue, profil: 'enseignant' })
    for (const route of ['/programme?affichage=tableau&classes=ce1,cm2&refs=1', '/programme?affichage=liste&matiere=monde&classes=cm1&refs=1', '/programme?matiere=francais&domaine=lecture&affichage=tableau', '/competence/composer-decomposer?classes=ms']) {
      await page.goto(base(route))
      await pret(page)
      await page.waitForSelector('table.prog, ul.competences, .officiel, p.vide')
      await verifierAxe(page, `${route.split('?')[0]} (${langue}, ${largeur})`, { exclure: [['nav.nav'], ['footer.pied']] })
    }
    await ctx.close()
  }
}

await nav.close()
process.exit(nbEchecs() ? 1 : 0)
