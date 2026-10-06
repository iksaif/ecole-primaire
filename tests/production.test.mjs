// Rien de ce qui est réservé au développement n'entre dans un build de production (I6) : ni les modules des exemples, ni leurs
// textes, ni leurs ids, ni les fausses compétences, ni les JSON de fiches d'exemple copiés depuis public/fiches/. Et un exercice
// RÉEL qui cite K.exemple… / D.exemple échoue à l'import en production (`EP_PROD=1`, voir src/dev.ts).
// Les builds viennent de tests/lancer.mjs (PROD_DIRS : dossiers séparés par « : », ecoleprimaire et skoolik ; FUITE : le
// fichier posé dans public/fiches/ avant le build) ; sans eux (TEST_URL distant), la partie « build » est ignorée.
//   node tests/production.test.mjs
import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'
import { verifier, nbEchecs } from './outils.mjs'

const racine = join(dirname(fileURLToPath(import.meta.url)), '..')
const { AVEC_DEV } = await import('../src/dev.ts')
verifier(AVEC_DEV === true, 'node : développement par défaut (AVEC_DEV)')

// Ce qui ne doit pas se voir en production : ids, titres et textes des exemples (lus d'après les registres, pas écrits ici)
const { REGISTRE } = await import('../src/exercices/index.ts')
const { EXEMPLES: AFFICHES_EXEMPLES } = await import('../src/affiches/dev.ts')
const fr = (await import('../src/langues/fr/textes/exemple.ts')).default
const frCorpus = (await import('../src/langues/fr/textes/exempleCorpus.ts')).default
const br = (await import('../src/langues/br/textes/exemple.ts')).default
const frDev = (await import('../src/langues/fr/textes/dev.ts')).default
const { COMPETENCES_EXEMPLE } = await import('../src/data/programme.ts')

const textesDe = arbre => Object.values(arbre).flatMap(v => (typeof v === 'string' ? [v] : Array.isArray(v) ? v.filter(x => typeof x === 'string') : v && typeof v === 'object' ? textesDe(v) : []))
const interdits = new Set()
for (const e of REGISTRE.filter(e => e.exemple)) { if (e.definition.id.includes('-')) interdits.add(e.definition.id); interdits.add(e.definition.route) }
for (const m of AFFICHES_EXEMPLES) if (m.definition.id.includes('-')) interdits.add(m.definition.id)
for (const k of COMPETENCES_EXEMPLE) interdits.add(k.id)
for (const arbre of [fr, frCorpus, br, frDev]) for (const t of textesDe(arbre)) if (t.length >= 14) interdits.add(t)
interdits.add('/dev/exemple'); interdits.add('/dev/affiches')
// la chaîne `exemple-` seule est trop courante pour être cherchée telle quelle ; les ids ci-dessus la couvrent
verifier(interdits.size > 20, `${interdits.size} chaînes d'exemple à chercher (ids, routes, textes fr/br)`)

const dossiers = (process.env.PROD_DIRS ?? '').split(':').filter(Boolean)
if (!dossiers.length) console.log('  (pas de build fourni : partie « build » ignorée)')
for (const dossier of dossiers) {
  const racineBuild = join(racine, dossier)
  console.log(dossier)
  const js = readdirSync(join(racineBuild, 'assets')).filter(f => /\.(js|css)$/.test(f))
  const fuites = []
  for (const f of ['index.html', ...js.map(f => `assets/${f}`)]) {
    const contenu = readFileSync(join(racineBuild, f), 'utf8')
    // chaque chaîne se cherche ENTIÈRE, entre guillemets (un texte n'est pas détecté dans un texte plus long qui le contient :
    // « Trouver la règle » dans le libellé d'une vraie compétence). « exemple » seul (id de l'exercice simple) est un mot courant
    // (classe CSS, libellé) : non cherché ; ses textes, sa route et ses compétences le sont.
    for (const x of interdits) {
      const motif = new RegExp(`["'\`]${x.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')}["'\`]`)
      if (/["'`]/.test(x) ? contenu.includes(x) : motif.test(contenu)) fuites.push(`${f} contient « ${x.slice(0, 40)} »`)
    }
  }
  verifier(!fuites.length, `aucun exemple dans les ${js.length} fichiers JS/CSS${fuites.length ? ` — ${fuites.slice(0, 3).join(' ; ')} (+${fuites.length - 3 > 0 ? fuites.length - 3 : 0})` : ''}`)
  verifier(!js.some(f => /^(Exemple|ExempleCorpus|AfficheDev|DevView|Composants)/.test(f)), 'aucun chunk de page /dev')
  // la copie de public/ : fiches/ n'est pas recopiée par vite build (src vite.config.js, sansFichesDeDev)
  verifier(!existsSync(join(racineBuild, 'fiches', process.env.FUITE ?? '__fuite_test__.json')), 'public/fiches/ n\'est pas copié tel quel dans le build')
}

console.log('Un exercice réel qui cite K.exemple… échoue en production')
// EP_PROD=1 : node simule un build de production (src/dev.ts) ; une définition RÉELLE (domaine et compétences réels) passe,
// celle qui cite l'une des entrées fictives lève une erreur claire à l'import
const lancer = code => {
  try { return { ok: true, sortie: execFileSync(process.execPath, ['--input-type=module', '-e', code], { cwd: racine, env: { ...process.env, EP_PROD: '1' }, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }) } } catch (e) { return { ok: false, sortie: String(e.stderr) } }
}
const cite = (domaine, competence) => `
  const { definir } = await import('${join(racine, 'src/noyau/definir.ts')}')
  const { K, D } = await import('${join(racine, 'src/noyau/ids.ts')}')
  definir({ id: 'reel', route: '/maths/reel', domaine: ${domaine}, competences: [${competence}], niveaux: { cp: {} } })
  console.log('defini')`
const reel = lancer(cite('D.nombresCalcul', 'K.numeration100'))
verifier(reel.ok && /defini/.test(reel.sortie), 'EP_PROD : un exercice réel (vraies entrées du programme) se définit')
const fictiveD = lancer(cite('D.exemple', 'K.numeration100'))
verifier(!fictiveD.ok && /D\.exemple/.test(fictiveD.sortie) && /fictives/.test(fictiveD.sortie), 'EP_PROD : D.exemple est refusé, avec une explication')
const fictiveK = lancer(cite('D.nombresCalcul', 'K.exempleCompter'))
verifier(!fictiveK.ok && /K\.exempleCompter/.test(fictiveK.sortie) && /fictives/.test(fictiveK.sortie), 'EP_PROD : K.exempleCompter est refusé')
const registre = lancer(`const { REGISTRE } = await import('${join(racine, 'src/exercices/index.ts')}'); console.log('n=' + REGISTRE.filter(e => e.exemple).length)`)
verifier(registre.ok && /n=0/.test(registre.sortie), 'EP_PROD : le registre ne contient aucun exemple (ni leur import)')
const textes = lancer(`const fr = (await import('${join(racine, 'src/langues/fr/textes/index.ts')}')).default; console.log('exemple=' + ('exemple' in fr) + ' dev=' + ('dev' in fr))`)
verifier(textes.ok && /exemple=false dev=false/.test(textes.sortie), 'EP_PROD : le catalogue de textes n\'a ni section « exemple » ni section « dev »')

process.exit(nbEchecs() ? 1 : 0)
