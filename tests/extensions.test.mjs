// Extensions (node) : le registre est valide, et les parties communes ne nomment aucune extension (ce sont les extensions qui s'accrochent à elles, pas l'inverse).
// Le balayage lit les sources : une mention de « ceinture » en dehors de src/ceintures/, des deux activités, des registres et des textes fait échouer le test.
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { EXTENSIONS, extensionParId, extensionDeRessource, problemesRegistre } from '../src/extensions/registre.ts'
import { ressourceMontree, extensionActive } from '../src/extensions/activation.ts'
import { REGISTRE } from '../src/exercices/index.ts'
import { verifier, nbEchecs } from './outils.mjs'

console.log('Registre')
verifier(problemesRegistre(EXTENSIONS).length === 0, `registre valide ${problemesRegistre(EXTENSIONS).join(' ; ')}`)
verifier(problemesRegistre([{ id: 'Mauvais', activation: {}, ressources: [] }]).length === 1, 'identifiant invalide refusé')
verifier(problemesRegistre([{ id: 'a', activation: {}, ressources: ['exercice:x'] }, { id: 'a', activation: {}, ressources: ['exercice:x'] }]).length === 2, 'identifiant et ressource en double refusés')
verifier(problemesRegistre([{ id: 'a', activation: {}, ressources: ['x'] }]).length === 1, 'ressource sans « exercice: » ou « affiche: » refusée')
verifier(extensionParId('ceintures')?.id === 'ceintures' && extensionParId('nexistepas') === undefined, 'extensionParId')
verifier(extensionDeRessource('exercice:ceintures')?.id === 'ceintures' && extensionDeRessource('exercice:tables') === undefined, 'extensionDeRessource')

console.log('Ressources d’une extension')
const ids = new Set(REGISTRE.map(e => `exercice:${e.definition.id}`))
for (const e of EXTENSIONS) {
  const inconnues = e.ressources.filter(r => r.startsWith('exercice:') && !ids.has(r))
  verifier(!inconnues.length, `${e.id} : ses exercices existent ${inconnues.join(', ')}`)
  verifier(e.ressources.filter(r => r.startsWith('exercice:')).every(r => REGISTRE.find(x => `exercice:${x.definition.id}` === r).definition.extensions.includes(e.id)), `${e.id} : ses exercices déclarent l’extension (extensions de leur définition)`)
}
verifier(!extensionActive('ceintures') && !ressourceMontree('exercice:ceintures') && ressourceMontree('exercice:tables'), 'extension cachée : ses ressources sont masquées, les autres non')

console.log('Les parties communes ne nomment aucune extension')
const src = join(dirname(fileURLToPath(import.meta.url)), '..', 'src')
const sources = c => statSync(c).isDirectory() ? readdirSync(c).flatMap(f => sources(join(c, f))) : /\.(js|ts|vue)$/.test(c) ? [c] : []
// ce qui a le droit de nommer une extension : le dossier de la fonctionnalité, ses deux activités et leurs vues, les registres, les textes
const PERMIS = [/^ceintures\//, /^extensions\//, /^exercices\/ceintures(-brevet)?\//, /^views\/(monde\/CeinturesView|maths\/CeinturesBrevetView)\.vue$/, /^exercices\/index\.ts$/, /^views\/exercices\.ts$/, /\/textes\//]
for (const e of EXTENSIONS) {
  const motif = new RegExp(e.id.replace(/s$/, ''), 'i')
  const fuites = sources(src).map(f => relative(src, f)).filter(f => !PERMIS.some(p => p.test(f))).filter(f => motif.test(readFileSync(join(src, f), 'utf8')))
  verifier(!fuites.length, `${e.id} : aucune mention dans les parties communes ${fuites.join(', ')}`)
}

process.exit(nbEchecs() ? 1 : 0)
