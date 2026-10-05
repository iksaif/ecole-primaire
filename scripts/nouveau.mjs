// Crée un exercice neuf à partir du modèle src/exercices/exemple/ (voir src/exercices/README.md).
//   npm run nouveau -- exercice <id> "<Titre>" --domaine <domaine> --competences <id,id> [--matiere maths|francais|maternelle]
//   npm run nouveau -- affiche <id> "<Titre>"     (voir scripts/nouveau-affiche.mjs)
//   npm run nouveau -- exercice suites "Les suites" --domaine nombres-calcul --competences ajouter-dizaines,suites-nombres
// Ce que le script écrit :
//   src/exercices/<id>/              copie de exemple/ (id, titre, domaine et compétences remplacés)
//   src/views/<matiere>/<Id>View.vue   copie de src/views/dev/ExempleView.vue
//   src/i18n/{fr,br}/views/<matiere>/<Id>View.js   catalogues copiés (titre breton à traduire)
// et il ajoute, sans rien réécrire d'autre : 5 lignes au registre (src/exercices/index.js), 1 route (src/router/index.js)
// et 3 lignes de catalogue (src/data/activites.js). Tout est calculé avant d'écrire : si une ancre manque dans l'un de ces
// trois fichiers (ils changent), rien n'est écrit et le script dit ce qui bloque.
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync, rmSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { competenceDe, domaineDe, DOMAINES } from '../src/data/programme.ts'
import { nouveauAffiche } from './nouveau-affiche.mjs'

const racine = join(dirname(fileURLToPath(import.meta.url)), '..')
const chemin = (...p) => join(racine, ...p)
const echec = message => { console.error(`✗ ${message}`); process.exit(1) }

const args = process.argv.slice(2)
const option = nom => { const i = args.indexOf(`--${nom}`); return i < 0 ? null : args[i + 1] }
const positionnels = args.filter((a, i) => !a.startsWith('--') && !(i > 0 && args[i - 1].startsWith('--')))
const [commande, id, titre] = positionnels
const matiere = option('matiere') ?? 'maths'
const domaine = option('domaine')
const competences = (option('competences') ?? '').split(',').filter(Boolean)
const USAGE = `usage : npm run nouveau -- exercice <id> "<Titre>" --domaine <domaine> --competences <id,id> [--matiere maths|francais|maternelle]
  domaines : ${DOMAINES.map(d => d.id).join(', ')}`

if (commande === 'affiche') {
  if (!id || !titre) echec('usage : npm run nouveau -- affiche <id> "<Titre>"')
  try { const { dossier, fichiers } = nouveauAffiche(id, titre); console.log(`✓ affiche créée dans ${dossier}\n  ${fichiers.join('\n  ')}`) } catch (e) { echec(e.message) }
  process.exit(0)
}
if (commande !== 'exercice' || !id || !titre) echec(USAGE)
if (!/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(id) || id === 'exemple') echec(`identifiant « ${id} » invalide (minuscules, chiffres et tirets ; pas « exemple »)`)
if (!['maths', 'francais', 'maternelle'].includes(matiere)) echec(`--matiere : maths, francais ou maternelle (reçu : ${matiere})`)
if (!domaine || !domaineDe(domaine)) echec(`--domaine manquant ou inconnu.\n${USAGE}`)
if (!competences.length) echec(`--competences manquant : au moins une compétence réelle de src/data/programme.ts.\n${USAGE}`)
for (const k of competences) if (!competenceDe(k) || competenceDe(k).devSeulement) echec(`compétence « ${k} » inconnue de src/data/programme.ts`)
if (existsSync(chemin('src/exercices', id))) echec(`src/exercices/${id}/ existe déjà`)

const camel = s => s.replace(/-(\w)/g, (_, c) => c.toUpperCase())
const pascal = s => camel(s).replace(/^./, c => c.toUpperCase())
const nomVue = `${pascal(id)}View`
const route = `/${matiere}/${id}`
const ancien = { vue: 'src/views/dev/ExempleView.vue', fr: 'src/i18n/fr/views/dev/ExempleView.js', br: 'src/i18n/br/views/dev/ExempleView.js' }
const neuf = { vue: `src/views/${matiere}/${nomVue}.vue`, fr: `src/i18n/fr/views/${matiere}/${nomVue}.js`, br: `src/i18n/br/views/${matiere}/${nomVue}.js` }
for (const f of Object.values(neuf)) if (existsSync(chemin(f))) echec(`${f} existe déjà`)

// ── Les fichiers copiés ──
const sortie = new Map()   // chemin relatif → contenu
const lire = f => readFileSync(chemin(f), 'utf8')
const remplacer = (texte, de, vers) => { if (!texte.includes(de)) echec(`« ${de} » introuvable dans le modèle : le script est en retard sur exemple/`); return texte.replaceAll(de, vers) }

for (const nom of readdirSync(chemin('src/exercices/exemple')).filter(n => statSync(chemin('src/exercices/exemple', n)).isFile())) {
  let t = lire(`src/exercices/exemple/${nom}`)
  if (nom === 'definition.ts') {
    t = remplacer(t, "id: 'exemple'", `id: '${id}'`)
    t = remplacer(t, "route: '/dev/exemple'", `route: '${route}'`)
    t = remplacer(t, 'D.exemple', `D.${camel(domaine)}`)
    // les deux compétences fictives deviennent les vraies (une seule : elle sert deux fois)
    const [a, b = a] = competences.map(k => `K.${camel(k)}`)
    t = remplacer(t, 'K.exempleCompter', a)
    t = remplacer(t, 'K.exempleRegle', b)
    t = t.replace(/\/\/ Programme :[\s\S]*?\n(?=import)/, '// Programme : les compétences de src/data/programme.ts (K.…) et le domaine (D.…) de l\'exercice.\n')
    t = t.replace(/\/\/ Exemple d'exercice — /, `// ${titre} — `)
  }
  if (nom === 'textes.ts') {
    t = remplacer(t, 'views/dev/ExempleView.js', `views/${matiere}/${nomVue}.js`)
  }
  sortie.set(`src/exercices/${id}/${nom}`, t)
}
sortie.set(neuf.vue, remplacer(lire(ancien.vue), 'exercices/exemple/', `exercices/${id}/`))
sortie.set(neuf.fr, lire(ancien.fr).replace("titre: 'Suites de nombres'", `titre: '${titre.replaceAll("'", "\\'")}'`).replace(/exemple d'exercice/, titre))
sortie.set(neuf.br, lire(ancien.br).replace(/titre: '[^']*', \/\/ br: à relire/, `titre: '${titre.replaceAll("'", "\\'")}', // br: à relire (non traduit)`).replace(/exemple d'exercice/, titre))

// ── Les trois fichiers existants : une insertion chacun, sur une ancre qui doit exister ──
function inserer(texte, ancre, ajout, apres = true) {
  const m = ancre.exec(texte)
  if (!m) return null
  const fin = m.index + m[0].length
  return apres ? texte.slice(0, fin) + ajout + texte.slice(fin) : texte.slice(0, m.index) + ajout + texte.slice(m.index)
}
const modifs = new Map()
const probleme = []
function modifier(f, etapes) {
  let t = lire(f)
  for (const [ancre, ajout, apres] of etapes) {
    const r = inserer(t, ancre, ajout, apres)
    if (r === null) { probleme.push(`${f} : ancre ${ancre} introuvable`); return }
    t = r
  }
  modifs.set(f, t)
}

const nom = camel(id), CONST = id.toUpperCase().replaceAll('-', '_')
modifier('src/exercices/index.js', [
  // après le dernier import de textes ; avant le `]` qui ferme REGISTRE
  [/^import \{ TEXTES as \w+ \} from '\.\/[\w-]+\/textes\.js'\n(?![\s\S]*^import \{ TEXTES as \w+ \} from '\.\/[\w-]+\/textes\.js')/m,
    `import ${nom}Definition from './${id}/definition.ts'\nimport * as ${nom}Generateur from './${id}/generateur.ts'\nimport * as ${nom}Fiche from './${id}/fiche.ts'\nimport { TEXTES as ${nom}Textes } from './${id}/textes.ts'\n`],
  [/(?<=export const REGISTRE = \[\n[\s\S]*?\n)(?=\]\n)/, `  { definition: ${nom}Definition, generateur: ${nom}Generateur, fiche: ${nom}Fiche, textes: ${nom}Textes },\n`, false],
])
modifier('src/router/index.js', [
  [/(?<=const routes = \[\n[\s\S]*?\n)(?=\]\n)/, `  { path: '${route}', component: () => import('../views/${matiere}/${nomVue}.vue') },\n`, false],
])
modifier('src/data/activites.js', [
  [/^import \w+ from '\.\.\/exercices\/[\w-]+\/definition\.js'\n(?![\s\S]*^import \w+ from '\.\.\/exercices\/[\w-]+\/definition\.js')/m,
    `import ${CONST} from '../exercices/${id}/definition.ts'\n`],
  [/(?<=export const ACTIVITES = \[\n[\s\S]*?\n)(?=\]\n)/,
    `  { fiche: true, to: '${route}', matiere: '${matiere === 'francais' ? 'francais' : 'maths'}', domaine: '${domaine}', rubrique: '${domaineDe(domaine).court}', icon: '📘', titre: '${titre.replaceAll("'", "\\'")}', desc: 'À compléter', niveaux: Object.keys(${CONST}.niveaux) },\n`, false],
  [/(?<=const BR = \{\n[\s\S]*?\n)(?=\}\n)/, `  '${route}': ['${titre.replaceAll("'", "\\'")}', 'À compléter'], // br: à relire (non traduit)\n`, false],
  [/(?<=const COMPETENCES_ROUTES = \{\n[\s\S]*?\n)(?=\}\n)/, `  '${route}': Object.fromEntries(Object.entries(${CONST}.niveaux).map(([n, v]) => [n, v.competences])),\n`, false],
])
if (probleme.length) echec(`rien n'a été écrit :\n  ${probleme.join('\n  ')}\n(ces fichiers ont changé : ajouter les lignes à la main, voir src/exercices/README.md)`)

// ── Écriture (tout ou rien : en cas d'erreur, on retire ce qu'on a créé) ──
const crees = []
try {
  for (const [f, t] of sortie) { mkdirSync(dirname(chemin(f)), { recursive: true }); writeFileSync(chemin(f), t); crees.push(f) }
  for (const [f, t] of modifs) writeFileSync(chemin(f), t)
} catch (e) {
  for (const f of crees) rmSync(chemin(f), { force: true })
  rmSync(chemin('src/exercices', id), { recursive: true, force: true })
  throw e
}

console.log(`✓ exercice « ${id} » créé : ${route}
  src/exercices/${id}/   ${neuf.vue}   catalogues ${neuf.fr} et ${neuf.br}
  inscrit dans src/exercices/index.js, src/router/index.js et src/data/activites.js (icône et description à compléter)
Ensuite :
  1. adapter définition, générateur, fiche et textes (les commentaires du modèle expliquent chaque choix) ;
  2. npm run types && npm run lint && npm run i18n && node tests/exercices.test.mjs ;
  3. npm run instantanes -- --maj ${id}   (les instantanés de l'exercice, une fois la fiche stable) ;
  4. traduire le breton des catalogues (marqué « br: à relire »).`)
