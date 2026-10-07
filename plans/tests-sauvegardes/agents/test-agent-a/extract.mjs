import fs from 'fs'
const ROOT = '/Users/corentin.chary/dev/ecole-primaire/src'
export async function charger(fichier, noms) {
  const src = fs.readFileSync(`${ROOT}/views/maths/${fichier}`, 'utf8')
  const m = src.match(/\/\/ #region generation[\s\S]*?\/\/ #endregion generation/)
  if (!m) throw new Error('region absente')
  const code = `import { aleatoire, melanger } from '${ROOT}/utils/index.js'
import { enLettresFr, decomposer } from '${ROOT}/utils/nombres.js'
${m[0]}
export { ${noms.join(', ')} }`
  const out = `/tmp/test-agent-a/${fichier}.mjs`
  fs.writeFileSync(out, code)
  return import(out + '?t=' + Date.now())
}
