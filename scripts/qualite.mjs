// Compteurs de qualité, avec un seuil enregistré dans scripts/qualite-seuils.json (plan 10, principe 5).
//   npm run qualite                     échoue si un compteur passe du mauvais côté de son seuil
//   npm run qualite -- --enregistrer    resserre les seuils sur les valeurs actuelles (jamais l'inverse)
// Un compteur « max » ne peut que baisser, un compteur « min » que monter. Quand il s'améliore, la commande passe
// et propose de resserrer le seuil (à commiter avec le changement qui l'a amélioré).
//
// Compteurs (max) :
//   brEnDur          littéraux 'br' / "br" dans src/ et scripts/, hors src/i18n/ et src/data/languesRegionales.js
//                    (tables { fr, br }, `langue === 'br'`, boucles de langues du build…) : objectif 0 (phase 3)
//   importsBr        fichiers de src/ et scripts/ hors src/i18n/ qui importent un module de i18n/br/
//   niveauxEnTexte   chaînes qui ne sont qu'une liste de classes (« CE1 · CE2 », « CP → CM2 », '^CP → CM2$'),
//                    hors src/i18n/ : les niveaux doivent être des tableaux (src/data/classes.js), pas du texte relu
//   vuesLongues      vues de src/views/ de plus de 600 lignes : objectif 0 (fin de phase 2)
//   mathRandomVues   appels à Math.random dans src/views/ : le hasard doit avoir une graine (utils/hasard.js)
//   attentesFixes    waitForTimeout dans tests/ : attendre un état plutôt qu'une durée
// Compteurs (min) :
//   couverture       % des couples compétence × classe de src/data/programme.js qui ont au moins une ressource
//                    (exercice, fiche ou affiche ; src/impression/couverture.js, comme `npm run couverture`)
//   exercicesMigres  exercices interactifs du catalogue (activites.js, `fiche: true`, sous /maths, /francais,
//                    /maternelle) passés au modèle src/exercices/ (dans le registre) : avancement de la phase 2
import { createServer } from 'vite'
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { join, dirname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const racine = join(dirname(fileURLToPath(import.meta.url)), '..')
const FICHIER_SEUILS = join(racine, 'scripts/qualite-seuils.json')
const enregistrer = process.argv.includes('--enregistrer')

// fichiers .js/.mjs/.vue sous un dossier, chemins relatifs à la racine (« src/views/… »)
const fichiers = dossier => readdirSync(join(racine, dossier)).flatMap(f => {
  const p = join(dossier, f)
  return statSync(join(racine, p)).isDirectory() ? fichiers(p) : /\.(js|mjs|vue)$/.test(f) ? [p] : []
})
const lire = f => readFileSync(join(racine, f), 'utf8')
const compter = (texte, re) => (texte.match(re) || []).length
const horsLangues = f => !f.startsWith('src/i18n/') && f !== 'src/data/languesRegionales.js'
const code = [...fichiers('src'), ...fichiers('scripts')].filter(f => f !== 'scripts/qualite.mjs')

const CLASSE = '(?:PS|MS|GS|CP|CE1|CE2|CM1|CM2)'
const LISTE_CLASSES = new RegExp(`(['"\`])\\^?${CLASSE}(?:\\s*[·→]\\s*${CLASSE})+\\$?\\1`, 'g')

// Modules de l'app chargés par Vite (calcul.js importe des modules sans extension), comme scripts/couverture.mjs ;
// un seul serveur pour tous les compteurs qui en ont besoin
let vite = null
const charger = async module => {
  vite ??= await createServer({ root: racine, server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' })
  return vite.ssrLoadModule(module)
}

async function couverture() {
  const { COMPETENCES } = await charger('/src/data/programme.js')
  const { ressourcesDe } = await charger('/src/impression/couverture.js')
  let cases = 0, couvertes = 0
  for (const k of COMPETENCES) for (const n of k.niveaux) {
    cases++
    if (Object.values(ressourcesDe(k.id, n)).some(l => l.length)) couvertes++
  }
  // arrondi vers le bas au dixième : le seuil enregistré ne dépasse jamais la valeur réelle
  return { valeur: Math.floor(1000 * couvertes / cases) / 10, detail: `${couvertes} / ${cases} cases` }
}

async function exercicesMigres() {
  const { ACTIVITES } = await charger('/src/data/activites.js')
  const { REGISTRE } = await charger('/src/exercices/index.js')
  const exercices = ACTIVITES.filter(a => a.fiche && /^\/(maths|francais|maternelle)\//.test(a.to)).map(a => a.to)
  const migres = new Set(REGISTRE.map(e => e.definition.route))
  const restants = exercices.filter(r => !migres.has(r))
  return { valeur: exercices.length - restants.length, detail: `${exercices.length - restants.length} / ${exercices.length} exercices au format définition` }
}

const COMPTEURS = {
  brEnDur: () => code.filter(horsLangues).reduce((n, f) => n + compter(lire(f), /['"]br['"]/g), 0),
  importsBr: () => code.filter(horsLangues).filter(f => /from\s+['"][^'"]*i18n\/br\//.test(lire(f))).length,
  niveauxEnTexte: () => code.filter(horsLangues).reduce((n, f) => n + compter(lire(f), LISTE_CLASSES), 0),
  vuesLongues: () => fichiers('src/views').filter(f => f.endsWith('.vue') && lire(f).split('\n').length > 600).length,
  mathRandomVues: () => fichiers('src/views').reduce((n, f) => n + compter(lire(f), /Math\.random\b/g), 0),
  attentesFixes: () => fichiers('tests').reduce((n, f) => n + compter(lire(f), /waitForTimeout\b/g), 0),
  couverture,
  exercicesMigres,
}

const seuils = JSON.parse(readFileSync(FICHIER_SEUILS, 'utf8'))
let echec = false, ameliore = false
for (const [nom, calcul] of Object.entries(COMPTEURS)) {
  const r = await calcul()
  const { valeur, detail } = typeof r === 'number' ? { valeur: r } : r
  const sens = nom in (seuils.min ?? {}) ? 'min' : 'max'
  const seuil = seuils[sens]?.[nom]
  const mieux = sens === 'max' ? valeur < seuil : valeur > seuil
  const pire = seuil === undefined || (sens === 'max' ? valeur > seuil : valeur < seuil)
  const etat = pire ? '✗' : mieux ? '↓' : '✓'
  console.log(`${etat} ${nom.padEnd(15)} ${String(valeur).padStart(6)}  (seuil ${sens} ${seuil ?? '—'})${detail ? `  ${detail}` : ''}`)
  if (pire) echec = true
  if (mieux) { ameliore = true; if (enregistrer) seuils[sens][nom] = valeur }
}

await vite?.close()

if (ameliore && enregistrer) {
  writeFileSync(FICHIER_SEUILS, JSON.stringify(seuils, null, 2) + '\n')
  console.log(`\nSeuils resserrés dans ${relative(racine, FICHIER_SEUILS)} : à commiter.`)
} else if (ameliore) console.log('\n↓ Des compteurs se sont améliorés : `npm run qualite -- --enregistrer` resserre les seuils.')
if (echec) console.log('\n✗ Régression : un compteur a dépassé son seuil (voir l\'en-tête de scripts/qualite.mjs).')
process.exit(echec ? 1 : 0)
