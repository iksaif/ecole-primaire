// Accessibilité des pages de la base dans Chrome, mesurée avec axe-core (WCAG 2.x A et AA) : aucune violation « critique » ou
// « sérieuse » sur les pages générales, les pages de développement (/dev, les exemples, les composants) et les exercices reportés,
// en français et en breton, à 1280 px et à 360 px, et dans les états utiles (fiche à imprimer, question en cours).
// La barre et le pied de page sont inclus (le shell a aussi son propre test : pages-shell.test.mjs). Pour voir toutes les violations
// (y compris moyennes et mineures) :
//   AXE_DETAIL=1 TEST_URL=http://localhost:5173/ecole-primaire/ node tests/accessibilite.test.mjs
// Les pages /dev n'existent que dans un site construit avec VITE_AVEC_DEV=1 (TEST_URL_DEV) ou sur le serveur de dev.
//
// DEUX NIVEAUX (tests/lancer.mjs ; `npm test` = rapide, `npm run test:complet` ou TEST_COMPLET=1 = complet) :
//   - COMPLET : toutes les routes de PAGES (+ GENERALES) × fr/br × 1280/360 px, avec leurs états (comme avant l'échantillon).
//   - RAPIDE  : GENERALES + ECHANTILLON seulement, et deux combinaisons langue × largeur au lieu de quatre (COMBINAISONS_RAPIDES).
// Les combinaisons (langue × largeur) tournent EN PARALLÈLE (un contexte Chrome chacune) ; la sortie de chacune est imprimée d'un
// bloc, dans l'ordre fixe de COMBINAISONS.
import { lancerNavigateur, contexte, nbEchecs, appDev, complet, enTampon } from './outils.mjs'
import { verifierAxe } from './outils-axe.mjs'

// Pages générales (sans état) : une de chaque sorte. Elles ont chacune leur test de contenu (pages-*) ; ici, un contrôle axe de plus.
const GENERALES = [
  '/',                                                 // accueil
  '/maths',                                            // page de matière
  '/maths/fiches?classes=ce1',                         // fiches toutes prêtes d'une matière
  '/telechargements/exercices-exemple-ce1',            // une feuille (fiche prête, aperçu)
  '/programme',                                        // le programme
  '/competence/composer-decomposer?classes=ms',        // une compétence
  '/parametres',                                       // réglages
  '/imprimer/affiches?affiche=alphabet',               // formulaire d'une affiche réelle
  '/une/adresse/inconnue',                             // page introuvable
]

// Toutes les routes d'exercice et de développement (niveau complet), avec états (fiche, question) pour les exercices.
const PAGES = ['/dev', '/dev/exemple', '/dev/exemple-corpus', '/dev/affiches', '/dev/composants', '/maths/calcul-mental', '/maths/heure', '/maths/monnaie', '/maths/numeration', '/maths/suites', '/maths/problemes', '/maths/tables', '/maths/calcul-pose', '/maternelle/compter', '/maternelle/comparer', '/maternelle/ordonner', '/maternelle/formes', '/maternelle/motifs', '/maths/geometrie']
const SANS_ETATS = new Set(['/dev', '/dev/affiches', '/dev/composants', '/maths/geometrie'])   // pas de fiche ni de partie à ouvrir

// Échantillon du niveau rapide : un exercice par famille de rendu (une ligne de raison par choix).
const ECHANTILLON = [
  '/dev',                  // le point d'entrée des pages de développement (liens, listes)
  '/dev/composants',       // tous les composants du noyau d'un coup (boutons, choix, saisies, résultats)
  '/dev/affiches',         // le formulaire générique d'une affiche (réglages, aperçu)
  '/dev/exemple',          // modèle d'exercice à saisie (champ de réponse, fiche, réglages, partie)
  '/dev/exemple-corpus',   // modèle d'exercice à corpus (énoncés lus dans une liste)
  '/maths/numeration',     // QCM (comparer) et saisie, avec dessins (matériel de base 10, droite graduée)
  '/maths/heure',          // dessin interactif : l'horloge
  '/maths/monnaie',        // clic sur des pièces et des billets
  '/maths/calcul-pose',    // opération posée : saisie chiffre par chiffre
  '/maternelle/ordonner',  // clic dans l'ordre, grands boutons de la maternelle
]
const COMBINAISONS = [['fr', 1280], ['br', 1280], ['fr', 360], ['br', 360]]
const COMBINAISONS_RAPIDES = [['fr', 1280], ['br', 360]]   // les deux langues et les deux largeurs sont vues, sans le produit

const nav = await lancerNavigateur()

/** Une route : page, puis les états de l'exercice (fiche à imprimer avec l'aide dépliée, question en cours). */
async function mesurerRoute(page, route, langue, largeur, avecEtats) {
  const nom = `${route} (${langue}, ${largeur})`
  await page.goto('about:blank')
  await page.goto(appDev(route))
  await page.waitForSelector('h1, h2')
  await verifierAxe(page, nom)
  if (!avecEtats) return
  await page.locator('.modes button').nth(1).click()
  await page.waitForSelector('iframe')
  await verifierAxe(page, `${nom} fiche`)
  // l'aide et l'ajout de police dépliés (champ du nom, boutons)
  await page.locator('.options-fiche .aide').evaluate(d => { d.open = true })
  await verifierAxe(page, `${nom} fiche, ajout de police`)
  await page.locator('.modes button').nth(0).click()
  await page.locator('.actions .btn-primary').click()
  await page.waitForSelector('.score-bar')
  await verifierAxe(page, `${nom} question`)
}

const ETATS = route => route.startsWith('/dev/exemple') || route.startsWith('/maths/') || route.startsWith('/maternelle/')

async function tache([langue, largeur]) {
  const ctx = await contexte(nav, { langue, viewport: { width: largeur, height: 900 } })
  try {
    const page = await ctx.newPage()
    for (const route of GENERALES) await mesurerRoute(page, route, langue, largeur, false)
    for (const route of complet ? PAGES : ECHANTILLON) await mesurerRoute(page, route, langue, largeur, ETATS(route) && !SANS_ETATS.has(route))
  } finally {
    await ctx.close()
  }
}

const combinaisons = complet ? COMBINAISONS : COMBINAISONS_RAPIDES
const sorties = await Promise.all(combinaisons.map(async c => {
  const lignes = await enTampon(() => tache(c))
  return [`${c[1]} px, interface ${c[0]}`, lignes]
}))
for (const [titre, lignes] of sorties) { console.log(titre); for (const l of lignes) console.log(l) }
await nav.close()
process.exit(nbEchecs() ? 1 : 0)
