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
const AUTRE = LANGUES[1]   // la langue à relire
const relecture = process.argv.includes('--relecture')

const lister = d => readdirSync(d).flatMap(n => (statSync(join(d, n)).isDirectory() ? lister(join(d, n)) : /\.(js|ts)$/.test(n) ? [join(d, n)] : []))
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
    lignesHtml.push(`<tr class="module"><th colspan="4">${echapper(m.replace(/\.(js|ts)$/, ''))}</th></tr>`)
    for (const k of Object.keys(cat.fr)) {
      const relire = fichierEntier || marquees.has(k)
      lignesHtml.push(`<tr${relire ? ' class="relire"' : ''}><td><code>${echapper(k)}</code></td><td>${echapper(texte(cat.fr[k]))}</td>
<td>${k in cat.br ? echapper(texte(cat.br[k])) : '<em>— manquant —</em>'}</td><td>${relire ? '⚠️' : ''}</td></tr>`)
    }
  }
}
// ── Catalogues typés (src/langues/<langue>/textes/<section>.ts) ──
// Le compilateur (npm run types) refuse déjà une clé manquante ou en trop ; ici on compte seulement les passages « à relire »
// et on ajoute les textes au tableau de relecture. Une clé est marquée par « // br: à relire » sur sa ligne ou la ligne précédente
// (une section marquée marque tout son contenu). L'indentation (2 espaces) donne le chemin de la clé.
{
  const dossierTextes = l => join(racine, 'src/langues', l, 'textes')
  const sections = readdirSync(dossierTextes('fr')).filter(f => f.endsWith('.ts') && f !== 'index.ts').sort()
  const feuilles = (o, pre = '') => Object.entries(o).flatMap(([k, v]) =>
    typeof v === 'string' || Array.isArray(v) || (v && typeof v === 'object' && 'other' in v) ? [[pre + k, v]] : feuilles(v, `${pre}${k}.`))
  // chemins marqués, d'après le source
  function marques(source) {
    const lignes = source.split('\n'), res = new Set(), pile = []
    let precedenteMarquee = false
    for (const l of lignes) {
      const m = l.match(/^(\s*)(['"]?)([\w'-]+)\2:\s*(.*)$/)
      const marquee = /br: à relire/.test(l)
      if (!m) { precedenteMarquee = marquee && /^\s*\/\//.test(l); continue }
      const niveau = m[1].length / 2 - 1
      pile.length = Math.max(niveau, 0); pile[pile.length] = m[3]
      if (marquee || precedenteMarquee || pile.slice(0, -1).some(c => res.has(c))) res.add(pile.join('.'))
      precedenteMarquee = false
    }
    return res
  }
  let nbTypes = 0, nbTypesRelire = 0
  for (const f of sections) {
    const section = f.replace(/\.ts$/, '')
    const fr = new Map(feuilles((await import(pathToFileURL(join(dossierTextes('fr'), f)))).default))
    const br = new Map(feuilles((await import(pathToFileURL(join(dossierTextes(AUTRE), f)))).default))
    const marquees = marques(readFileSync(join(dossierTextes(AUTRE), f), 'utf8'))
    const estMarquee = k => [...marquees].some(c => k === c || k.startsWith(`${c}.`))
    nbTypes += fr.size
    for (const k of fr.keys()) if (estMarquee(k)) nbTypesRelire++
    if ([...fr.keys()].some(k => !br.has(k)) || [...br.keys()].some(k => !fr.has(k))) { problemes++; console.log(`✗ langues/br/textes/${f} : clés différentes du français`) }
    if (relecture) {
      lignesHtml.push(`<tr class="module"><th colspan="4">${echapper(section)}</th></tr>`)
      for (const [k, v] of fr) {
        const relire = estMarquee(k)
        lignesHtml.push(`<tr${relire ? ' class="relire"' : ''}><td><code>${echapper(`${section}.${k}`)}</code></td><td>${echapper(texte(v))}</td>
<td>${br.has(k) ? echapper(texte(br.get(k))) : '<em>— manquant —</em>'}</td><td>${relire ? '⚠️' : ''}</td></tr>`)
      }
    }
  }
  total += nbTypes; nbRelire += nbTypesRelire
  console.log(`${sections.length} sections typées (src/langues), ${nbTypes} textes ; ${nbTypesRelire} marqués « à relire »`)
}

// ── Catalogues de contenu des exercices (src/exercices/<id>/textes.ts, `catalogue(…)` de src/langues/catalogue.ts) ──
// Le compilateur vérifie déjà les clés du breton contre le français ; ici on compte les passages « à relire » (clé marquée
// sur sa ligne, dans le bloc `br: { … }`) et on ajoute les textes au tableau de relecture. Sans bloc `br`, rien à relire.
{
  const dossierExercices = join(racine, 'src/exercices')
  let nbContenu = 0, nbContenuRelire = 0, nbCatalogues = 0
  for (const id of readdirSync(dossierExercices).sort()) {
    const f = join(dossierExercices, id, 'textes.ts')
    let source
    try { source = readFileSync(f, 'utf8') } catch { continue }
    if (!/catalogue\(/.test(source)) continue
    const cat = Object.values(await import(pathToFileURL(f))).find(v => v?.sorte === 'catalogue')
    if (!cat) continue
    nbCatalogues++
    const feuillesDe = (o, pre = '') => Object.entries(o).flatMap(([k, v]) =>
      typeof v === 'string' || Array.isArray(v) || (v && typeof v === 'object' && 'other' in v) ? [[pre + k, v]] : feuillesDe(v, `${pre}${k}.`))
    const fr = new Map(feuillesDe(cat.source)), br = new Map(feuillesDe(cat.traductions[AUTRE] ?? {}))
    const bloc = source.slice(Math.max(0, source.search(/\bbr:\s*\{/)))
    const marquees = new Set(cat.traductions[AUTRE] ? [...bloc.matchAll(/^\s*(['"]?)([\w'-]+)\1:.*br: à relire/gm)].map(m => m[2]) : [])
    if (br.size && ([...fr.keys()].some(k => !br.has(k)) || [...br.keys()].some(k => !fr.has(k)))) { problemes++; console.log(`✗ exercices/${id}/textes.ts : clés du breton différentes du français`) }
    nbContenu += fr.size
    for (const k of br.keys()) if (marquees.has(k.split('.')[0])) nbContenuRelire++
    if (relecture) {
      lignesHtml.push(`<tr class="module"><th colspan="4">contenu : ${echapper(id)}</th></tr>`)
      for (const [k, v] of fr) {
        const relire = marquees.has(k.split('.')[0])
        lignesHtml.push(`<tr${relire ? ' class="relire"' : ''}><td><code>${echapper(`${id}.${k}`)}</code></td><td>${echapper(texte(v))}</td>
<td>${br.has(k) ? echapper(texte(br.get(k))) : '<em>— français seulement —</em>'}</td><td>${relire ? '⚠️' : ''}</td></tr>`)
      }
    }
  }
  total += nbContenu; nbRelire += nbContenuRelire
  console.log(`${nbCatalogues} catalogues de contenu d'exercice (src/exercices), ${nbContenu} textes ; ${nbContenuRelire} marqués « à relire »`)
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
