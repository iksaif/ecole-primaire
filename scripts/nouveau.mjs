// Crée un exercice ou une affiche neufs à partir des modèles de la base (src/exercices/exemple/, exemple-corpus/, src/affiches/exemple/).
//   npm run nouveau -- exercice <id> "<Titre>" --domaine <domaine> --competences <id,id> [--modele simple|corpus] [--matiere maths|francais|maternelle]
//   npm run nouveau -- affiche <id> "<Titre>"     (voir scripts/nouveau-affiche.mjs)
//   npm run nouveau -- exercice suites "Les suites" --domaine nombres-calcul --competences numeration-100,suites-nombres
// modèles : simple (src/exercices/exemple/, un catalogue de textes) ou corpus (src/exercices/exemple-corpus/ : français
//   seulement, corpus dans src/data/<id>.ts)
// Ce que le script écrit :
//   src/exercices/<id>/                       copie du modèle (id, route, titre, domaine, compétences remplacés)
//   src/data/<id>.ts                          modèle corpus : le corpus
//   src/views/<matiere>/<Id>View.vue          copie de la vue du modèle (src/views/dev/)
//   src/langues/{fr,br}/textes/<id>.ts        textes de l'INTERFACE de l'exercice (section `<id>` du catalogue, fr et br)
// et il INSCRIT, aux repères « // nouveau:… » : l'exercice dans le registre (src/exercices/index.ts), la section de textes dans
// src/langues/{fr,br}/textes/index.ts, la route dans src/router/index.ts. Tout est calculé avant d'écrire : si un repère manque,
// rien n'est écrit. Pas d'autre registre : le catalogue, le build des fiches et les tests lisent src/exercices/index.ts.
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync, rmSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { competenceDe, domaineDe, DOMAINES } from '../src/data/programme.ts'
import { CODES } from '../src/langues/registre.ts'
import { nouveauAffiche } from './nouveau-affiche.mjs'

const racine = join(dirname(fileURLToPath(import.meta.url)), '..')
const chemin = (...p) => join(racine, ...p)
const echec = message => { console.error(`✗ ${message}`); process.exit(1) }

const args = process.argv.slice(2)
const option = nom => { const i = args.indexOf(`--${nom}`); return i < 0 ? null : args[i + 1] }
const positionnels = args.filter((a, i) => !a.startsWith('--') && !(i > 0 && args[i - 1].startsWith('--')))
const [commande, id, titre] = positionnels
const matiere = option('matiere') ?? 'maths'
// les modèles : dossier copié, vue, section de textes de l'interface, compétences fictives à remplacer, titre d'exemple
const MODELES = {
  simple: { dossier: 'exemple', vue: 'ExempleView', section: 'exemple', fictives: ['K.exempleCompter', 'K.exempleRegle'], titre: 'Suites de nombres', titreBr: 'Heuliadoù niveroù' },
  corpus: { dossier: 'exemple-corpus', vue: 'ExempleCorpusView', section: 'exempleCorpus', fictives: ['K.exempleSynonymes'], titre: 'Les synonymes', data: 'exemple-corpus.ts' },
}
const modeleNom = option('modele') ?? 'simple'
const modele = MODELES[modeleNom]
const domaine = option('domaine')
const competences = (option('competences') ?? '').split(',').filter(Boolean)
const USAGE = `usage : npm run nouveau -- exercice <id> "<Titre>" --domaine <domaine> --competences <id,id> [--modele simple|corpus] [--matiere maths|francais|maternelle]
  domaines : ${DOMAINES.map(d => d.id).join(', ')}`

if (commande === 'affiche') {
  if (!id || !titre) echec('usage : npm run nouveau -- affiche <id> "<Titre>"')
  try { const { dossier, fichiers } = nouveauAffiche(id, titre); console.log(`✓ affiche créée dans ${dossier}\n  ${fichiers.join('\n  ')}`) } catch (e) { echec(e.message) }
  process.exit(0)
}
if (commande !== 'exercice' || !id || !titre) echec(USAGE)
if (!/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(id) || id.startsWith('exemple')) echec(`identifiant « ${id} » invalide (minuscules, chiffres et tirets ; pas « exemple… »)`)
if (!modele) echec(`--modele : simple ou corpus (reçu : ${modeleNom})`)
if (!['maths', 'francais', 'maternelle'].includes(matiere)) echec(`--matiere : maths, francais ou maternelle (reçu : ${matiere})`)
if (!domaine || !domaineDe(domaine)) echec(`--domaine manquant ou inconnu.\n${USAGE}`)
if (!competences.length) echec(`--competences manquant : au moins une compétence réelle de src/data/programme.ts.\n${USAGE}`)
for (const k of competences) if (!competenceDe(k) || competenceDe(k).devSeulement) echec(`compétence « ${k} » inconnue de src/data/programme.ts`)
if (existsSync(chemin('src/exercices', id))) echec(`src/exercices/${id}/ existe déjà`)
if (modele.data && existsSync(chemin('src/data', `${id}.ts`))) echec(`src/data/${id}.ts existe déjà`)

const camel = s => s.replace(/-(\w)/g, (_, c) => c.toUpperCase())
const pascal = s => camel(s).replace(/^./, c => c.toUpperCase())
const nom = camel(id)
const nomVue = `${pascal(id)}View`
const route = `/${matiere}/${id}`
const vue = `src/views/${matiere}/${nomVue}.vue`
const textesFr = `src/langues/fr/textes/${nom}.ts`, textesBr = `src/langues/br/textes/${nom}.ts`
for (const f of [vue, textesFr, textesBr]) if (existsSync(chemin(f))) echec(`${f} existe déjà`)

// ── Les fichiers copiés ──
const sortie = new Map()   // chemin relatif → contenu
const lire = f => readFileSync(chemin(f), 'utf8')
const remplacer = (texte, de, vers) => { if (!texte.includes(de)) echec(`« ${de} » introuvable dans le modèle : le script est en retard sur ${modele.dossier}/`); return texte.replaceAll(de, vers) }
const titreJs = titre.replaceAll("'", "\\'")
// le titre en tête des commentaires et dans les textes ; le nom du modèle partout où il désigne l'exercice
const adapter = t => {
  t = t.replace(/^\/\/ Exemple d'exercice[^—\n]*— /m, `// ${titre} — `)
  t = t.replaceAll(`'${modele.titre}'`, `'${titreJs}'`)
  if (modeleNom === 'corpus') t = t.replaceAll('exemple-corpus', id)
  return t
}

for (const f of readdirSync(chemin('src/exercices', modele.dossier)).filter(n => statSync(chemin('src/exercices', modele.dossier, n)).isFile() && n.endsWith('.ts'))) {
  let t = adapter(lire(`src/exercices/${modele.dossier}/${f}`))
  if (f === 'definition.ts') {
    if (modeleNom === 'simple') {
      t = remplacer(t, "id: 'exemple'", `id: '${id}'`)
      t = remplacer(t, "route: '/dev/exemple'", `route: '${route}'`)
    } else {
      t = remplacer(t, `route: '/dev/${id}'`, `route: '${route}'`)
    }
    t = remplacer(t, 'D.exemple', `D.${camel(domaine)}`)
    // les compétences fictives deviennent les vraies : la liste de l'exercice ; une fiche (au CE1) prend une compétence du CE1 ;
    // la compétence « hors programme » du CP, une compétence qui n'y est pas ; à défaut, la première (à corriger à la main)
    const reelles = competences.map(k => `K.${camel(k)}`)
    const au = (niveau, oui = true) => competences.findIndex(k => competenceDe(k).niveaux.includes(niveau) === oui)
    const pris = i => reelles[i < 0 ? 0 : i]
    t = t.replace(/competences: \[[^\]]*\]/, `competences: [${reelles.join(', ')}]`)
    t = t.replace(/(fiches: \[[\s\S]*)$/, bloc => bloc.replace(/K\.exemple\w+/g, pris(au('ce1'))))
    t = t.replace(/horsProgramme: \[\{ competence: K\.exemple\w+/, `horsProgramme: [{ competence: ${pris(au('cp', false))}`)
    modele.fictives.forEach((fic, i) => { t = t.replaceAll(fic, reelles[i] ?? reelles[0]) })
    t = t.replace(/\/\/ Programme :[\s\S]*?\n(?=import)/, '// Programme : les compétences de src/data/programme.ts (K.…) et le domaine (D.…) de l\'exercice. À ADAPTER aux niveaux : un niveau\n// sans compétence au programme est refusé par `definir`.\n')
  }
  if (modeleNom === 'corpus') t = t.replaceAll('data/exemple-corpus.ts', `data/${id}.ts`)
  sortie.set(`src/exercices/${id}/${f}`, t)
}
if (modele.data) sortie.set(`src/data/${id}.ts`, adapter(lire(`src/data/${modele.data}`)))
// la vue : même profondeur (src/views/dev/ → src/views/<matiere>/), ses imports de l'exercice et ses clés de texte suivent
let v = lire(`src/views/dev/${modele.vue}.vue`)
v = v.replaceAll(`exercices/${modele.dossier}/`, `exercices/${id}/`).replace(new RegExp(`(['\`])${modele.section}\\.`, 'g'), `$1${nom}.`)
v = v.replaceAll(`'${modele.section}.`, `'${nom}.`)
sortie.set(vue, adapter(v).replace(/<!--[^]*?-->\n?/, m => m).replace(/\/\/ Exemple d'exercice[^—\n]*— /, `// ${titre} — `))
// les textes de l'interface (section de même nom que l'exercice)
const secFr = lire(`src/langues/fr/textes/${modele.section}.ts`)
const secBr = lire(`src/langues/br/textes/${modele.section}.ts`)
sortie.set(textesFr, secFr.replace(/^\/\/ Textes de l'interface — exemple d'exercice[^(\n]*/m, `// Textes de l'interface — ${titre}`).replace(/titre: '[^']*'/, `titre: '${titreJs}'`)
  .replaceAll(`exercices/${modele.dossier}/`, `exercices/${id}/`).replaceAll(`br/textes/${modele.section}.ts`, `br/textes/${nom}.ts`).replaceAll(`page /dev/${modele.dossier}`, `page ${route}`))
sortie.set(textesBr, secBr.replace(/^\/\/ Textes de l'interface — exemple d'exercice[^(\n]*/m, `// Textes de l'interface — ${titre}`).replace(/titre: '[^']*', \/\/ br: à relire/, `titre: '${titreJs}', // br: à traduire et à relire`)
  .replace(`fr/textes/${modele.section}.ts`, `fr/textes/${nom}.ts`))

// ── Les fichiers existants : une insertion chacun, sur un repère qui doit exister ──
const modifs = new Map()
const probleme = []
function inserer(f, repere, ajout, avant = true) {
  const t = modifs.get(f) ?? lire(f)
  if (!t.includes(repere)) { probleme.push(`${f} : repère « ${repere} » absent`); return }
  modifs.set(f, t.replace(repere, avant ? `${ajout}${repere}` : `${repere}${ajout}`))
}
inserer('src/exercices/index.ts', '// nouveau:imports', `import { module as ${nom} } from './${id}/index.ts'\n`)
inserer('src/exercices/index.ts', '  // nouveau:registre', `  ${nom},\n`)
inserer('src/router/index.ts', '  // nouveau:routes', `  { path: '${route}', component: () => import('../views/${matiere}/${nomVue}.vue') },\n`)
for (const l of CODES) {
  const f = `src/langues/${l}/textes/index.ts`
  inserer(f, "import { AVEC_DEV }", `import ${nom} from './${nom}.ts'\n`)
  inserer(f, '...sectionsDev', `${nom}, `)
}
if (probleme.length) echec(`rien n'a été écrit :\n  ${probleme.join('\n  ')}\n(ces fichiers ont changé : ajouter les lignes à la main, voir src/exercices/README.md)`)

// ── Écriture (tout ou rien : en cas d'erreur, on retire ce qu'on a créé) ──
const originaux = new Map([...modifs.keys()].map(f => [f, lire(f)]))
try {
  for (const [f, t] of sortie) { mkdirSync(dirname(chemin(f)), { recursive: true }); writeFileSync(chemin(f), t) }
  for (const [f, t] of modifs) writeFileSync(chemin(f), t)
} catch (e) {
  for (const f of sortie.keys()) rmSync(chemin(f), { force: true })
  rmSync(chemin('src/exercices', id), { recursive: true, force: true })
  for (const [f, t] of originaux) writeFileSync(chemin(f), t)
  throw e
}

console.log(`✓ exercice « ${id} » créé : ${route}
  src/exercices/${id}/   ${vue}   textes ${textesFr} et ${textesBr}
  inscrit dans src/exercices/index.ts, src/router/index.ts et les index de src/langues/{fr,br}/textes/
Ensuite :
  1. adapter définition, générateur, fiche et textes (les commentaires du modèle expliquent chaque choix) ;
  2. npm run types && npm run lint && npm run i18n && node tests/exercices.test.mjs ;
  3. npm run instantanes -- --maj ${id}   (les instantanés de l'exercice, une fois la fiche stable) ;
  4. traduire le breton des textes (marqué « br: à relire »).`)
