// Vérification des types : `vue-tsc --noEmit` (tsconfig.json, strict), sans les erreurs situées dans des fichiers
// JavaScript. Le JavaScript n'est pas vérifié (checkJs: false), mais certains .js portent `// @ts-check` pour l'éditeur
// et, importés par un .ts, seraient comptés : on n'en garde que les erreurs des .ts, .vue et .d.ts.
//   npm run types        échoue (code 1) s'il reste une erreur de type dans du TypeScript
import { spawnSync } from 'node:child_process'

const r = spawnSync('npx', ['vue-tsc', '--noEmit', '--pretty', 'false'], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
const sortie = (r.stdout ?? '') + (r.stderr ?? '')
// un diagnostic = une ligne « fichier(l,c): error TSxxxx: … » et ses lignes de détail (indentées)
const diagnostics = []
for (const ligne of sortie.split('\n')) {
  if (/^\S.*\(\d+,\d+\): error TS\d+:/.test(ligne)) diagnostics.push([ligne])
  else if (/^\s/.test(ligne) && diagnostics.length) diagnostics.at(-1).push(ligne)
  else if (ligne.trim() && !/^Found \d+ error/.test(ligne)) console.log(ligne)   // erreur de configuration, etc.
}
const enJs = d => /^[^(]+\.(m?js|cjs)\(/.test(d[0])
const gardes = diagnostics.filter(d => !enJs(d))
for (const d of gardes) console.log(d.join('\n'))
const ignores = diagnostics.length - gardes.length
console.log(gardes.length ? `\n✗ ${gardes.length} erreur(s) de type` : '✓ types : 0 erreur', ignores ? `(${ignores} ignorée(s) dans des .js, non vérifiés)` : '')
process.exit(gardes.length || (r.status && !diagnostics.length) ? 1 : 0)
