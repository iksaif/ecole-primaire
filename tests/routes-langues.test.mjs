// Toutes les routes de la table (src/router/routes.ts), en français et en breton, sur le site testé (TEST_URL) : aucune erreur
// JavaScript, un seul h1, et aucun mot d'interface français dans l'interface bretonne. Le contenu français voulu (titres de
// compétences du programme, source française) est marqué lang="fr" : il est exclu du texte contrôlé. Une route à paramètre est
// visitée avec une valeur valide et une valeur inconnue (tests/outils-routes.mjs). Les deux langues passent en parallèle.
//   TEST_URL=http://localhost:5173/ecole-primaire/ node tests/routes-langues.test.mjs
import { lancerNavigateur, contexte, surveiller, verifier, nbEchecs, app, URL_SITE } from './outils.mjs'
import { cheminsDeLaTable, adresses, valeursValides } from './outils-routes.mjs'

// Mots d'interface français qui ne doivent pas apparaître dans l'interface bretonne. Liste prudente : seulement des mots qui
// n'existent pas en breton ni dans un nom propre (pas de « Programme », « Bravo »…). À compléter quand une fuite est trouvée.
const MOTS_FR = /\b(Commencer|Valider|Passer|Suivant|Précédent|Quitter|Rejouer|Recommencer|Paramètres|Imprimer|Télécharger|Niveau|Nombre de|Question \d|Bonne réponse|Ta réponse|Exercices?|Choisis|Clique|Combien|Écris|Bienvenue|Aperçu|Calculs?|Accueil|Fermer|Rechercher|Réglages|Matières?|Maternelle|Classes?|Retour|Voir tout|Fiches?)\b/g

// + une adresse hors table : la page « introuvable » (route finale du routeur)
const routes = [...adresses(cheminsDeLaTable(), await valeursValides(URL_SITE)), '/ancienne-route/maths']
const nav = await lancerNavigateur()

async function parcourir(langue) {
  const ctx = await contexte(nav, { langue })
  const page = await ctx.newPage()
  const erreurs = surveiller(page)
  // une erreur de rendu d'un composant n'est qu'écrite dans la console par Vue ; un fichier absent (fiche inconnue, journal local) n'est pas une erreur de code
  page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) erreurs.push(m.text().slice(0, 200)) })
  const lignes = []
  for (const r of routes) {
    erreurs.length = 0
    await page.goto(app(r))
    // la page est prête quand son titre est posé (routeur) et que son h1 existe
    await page.waitForFunction(() => /—/.test(document.title) && document.querySelector('h1'), null, { timeout: 10000 }).catch(() => {})
    const { h1, texte } = await page.evaluate(() => {
      const c = document.body.cloneNode(true)
      c.querySelectorAll('[lang="fr"], script, style, svg').forEach(x => x.remove())
      return { h1: document.querySelectorAll('h1').length, texte: c.innerText ?? c.textContent ?? '' }
    })
    const restes = langue === 'br' ? [...new Set(texte.match(MOTS_FR) ?? [])] : []
    lignes.push([!erreurs.length && h1 === 1 && !restes.length,
      `${langue} ${r}${erreurs.length ? ' — ' + erreurs[0] : ''}${h1 !== 1 ? ` — ${h1} h1` : ''}${restes.length ? ' — français : ' + restes.join(', ') : ''}`])
  }
  await ctx.close()
  return lignes
}

console.log(`Routes en français et en breton (${routes.length} adresses)`)
for (const lignes of await Promise.all(['fr', 'br'].map(parcourir))) for (const [ok, msg] of lignes) verifier(ok, msg)
await nav.close()

// code de sortie lu par tests/lancer.mjs
process.exit(nbEchecs() ? 1 : 0)
