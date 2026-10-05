// Vérifie les catalogues de traduction et prépare la relecture.
//   npm run i18n              clés manquantes / en trop entre français et breton, passages « à relire »
//   npm run i18n:relecture    + écrit i18n-relecture.html : tableau clé / français / breton à faire relire
// Les catalogues sont src/i18n/<langue>/**/*.js (un fichier par composant ou module, `export default { … }`).
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join, relative, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { echapper } from '../src/utils/html.js'

const racine = join(dirname(fileURLToPath(import.meta.url)), '..')
const dossier = join(racine, 'src/i18n')
const LANGUES = ['fr', 'br']
const relecture = process.argv.includes('--relecture')

const lister = d => readdirSync(d).flatMap(n => (statSync(join(d, n)).isDirectory() ? lister(join(d, n)) : n.endsWith('.js') ? [join(d, n)] : []))
const texte = v => (typeof v === 'function' ? `ƒ ${v.toString().replace(/\s+/g, ' ')}` : Array.isArray(v) ? v.join(' · ') : typeof v === 'object' ? JSON.stringify(v) : String(v))

// clés marquées « br: à relire » : commentaire sur la ligne de la clé, ou sur la ligne précédente
function aRelire(source) {
  const marquees = new Set()
  // on ne regarde que le corps du catalogue (pas l'en-tête du fichier)
  const lignes = source.slice(source.indexOf('export default')).split('\n')
  let fichierEntier = false
  lignes.forEach((l, i) => {
    if (!/br: à relire/.test(l)) return
    const cle = l.match(/^\s*['"]?([\w-]+)['"]?\s*:/) ?? lignes[i + 1]?.match(/^\s*['"]?([\w-]+)['"]?\s*:/)
    if (cle) marquees.add(cle[1]); else fichierEntier = true
  })
  return { marquees, fichierEntier }
}

const modules = [...new Set(LANGUES.flatMap(l => lister(join(dossier, l)).map(f => relative(join(dossier, l), f))))].sort()
let problemes = 0, total = 0, nbRelire = 0
const lignesHtml = []
for (const m of modules) {
  const cat = {}, src = {}
  for (const l of LANGUES) {
    const f = join(dossier, l, m)
    try {
      cat[l] = (await import(pathToFileURL(f))).default
      src[l] = readFileSync(f, 'utf8')
    } catch (e) {
      console.log(`✗ ${l}/${m} : ${e.code === 'ERR_MODULE_NOT_FOUND' ? 'fichier absent' : e.message}`)
      problemes++
    }
  }
  if (!cat.fr || !cat.br) continue
  const manquantes = Object.keys(cat.fr).filter(k => !(k in cat.br))
  const enTrop = Object.keys(cat.br).filter(k => !(k in cat.fr))
  if (manquantes.length) { problemes++; console.log(`✗ br/${m} : clés manquantes (le français s'affiche) : ${manquantes.join(', ')}`) }
  if (enTrop.length) console.log(`⚠ br/${m} : clés en trop : ${enTrop.join(', ')}`)
  const { marquees, fichierEntier } = aRelire(src.br)
  total += Object.keys(cat.fr).length
  nbRelire += fichierEntier ? Object.keys(cat.br).length : marquees.size
  if (relecture) {
    lignesHtml.push(`<tr class="module"><th colspan="4">${echapper(m.replace(/\.js$/, ''))}</th></tr>`)
    for (const k of Object.keys(cat.fr)) {
      const relire = fichierEntier || marquees.has(k)
      lignesHtml.push(`<tr${relire ? ' class="relire"' : ''}><td><code>${echapper(k)}</code></td><td>${echapper(texte(cat.fr[k]))}</td>
<td>${k in cat.br ? echapper(texte(cat.br[k])) : '<em>— manquant —</em>'}</td><td>${relire ? '⚠️' : ''}</td></tr>`)
    }
  }
}
console.log(`\n${modules.length} catalogues, ${total} textes ; ${nbRelire} marqués « à relire » ; ${problemes} problème(s)`)

if (relecture) {
  writeFileSync(join(racine, 'i18n-relecture.html'), `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8">
<title>Relecture de la traduction bretonne</title><style>
body { font-family: system-ui, sans-serif; margin: 2rem; color: #222; }
table { border-collapse: collapse; width: 100%; font-size: .9rem; }
td, th { border: 1px solid #ddd; padding: .35rem .5rem; vertical-align: top; text-align: left; }
tr.module th { background: #2c3e50; color: white; font-size: .95rem; }
tr.relire td { background: #fff7e0; }
td:nth-child(3) { font-style: italic; }
</style></head><body>
<h1>Relecture de la traduction bretonne</h1>
<p>Pour chaque texte : la clé (repère technique), le français, la traduction bretonne actuelle (automatique).
Les lignes en jaune ⚠️ sont celles dont on est le moins sûr. Corrigez directement dans la colonne breton
(imprimez, annotez, ou copiez dans un tableur) et renvoyez à contact@skoolik.app. Trugarez !</p>
<table><tr><th>Clé</th><th>Français</th><th>Brezhoneg</th><th></th></tr>
${lignesHtml.join('\n')}
</table></body></html>`)
  console.log('→ i18n-relecture.html écrit')
}
process.exit(problemes ? 1 : 0)
