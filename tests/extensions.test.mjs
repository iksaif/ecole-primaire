// Extensions (node) : le registre est valide, et les parties communes ne nomment aucune extension (ce sont les extensions qui s'accrochent à elles, pas l'inverse).
// Le balayage lit les sources : une mention de « ceinture » en dehors de src/ceintures/, des deux activités, des registres et des textes fait échouer le test.
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { EXTENSIONS, extensionParId, extensionDeRessource, problemesRegistre } from '../src/extensions/registre.ts'
import { ressourceMontree, extensionActive } from '../src/extensions/activation.ts'
import { REGISTRE } from '../src/exercices/index.ts'
import { ongletsDe } from '../src/extensions/onglets.ts'
import { routesDesExercices } from '../src/router/routes.ts'
import { EXERCICES_AVEC_BREVET } from '../src/ceintures/brevets.ts'
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

console.log('Onglets d’exercice')
const ongletsTables = ongletsDe(EXTENSIONS, 'tables')
verifier(ongletsTables.length === 1 && ongletsTables[0].id === 'ceintures' && ongletsTables[0].extension === 'ceintures', 'les tables reçoivent l’onglet des ceintures')
verifier(ongletsDe(EXTENSIONS, 'heure').length === 0 && ongletsDe([], 'tables').length === 0, 'un autre exercice, ou aucune extension active : pas d’onglet')
verifier(Object.keys(EXERCICES_AVEC_BREVET).every(id => REGISTRE.some(m => m.definition.id === id)), 'les exercices qui ont un brevet existent au registre')
verifier(EXTENSIONS.flatMap(e => e.onglets ?? []).every(o => o.id !== 'jouer' && o.id !== 'imprimer'), 'un onglet d’extension ne reprend pas « jouer » ni « imprimer »')
const routes = routesDesExercices(REGISTRE.map(m => ({ definition: m.definition })), [])
verifier(routes.every(r => typeof r.meta.exercice === 'string') && routes.find(r => r.path === '/maths/tables').meta.exercice === 'tables', 'chaque route d’exercice porte son identifiant (meta.exercice)')

console.log('Les parties communes ne nomment aucune extension')
const src = join(dirname(fileURLToPath(import.meta.url)), '..', 'src')
const sources = c => statSync(c).isDirectory() ? readdirSync(c).flatMap(f => sources(join(c, f))) : /\.(js|ts|vue)$/.test(c) ? [c] : []
// ce qui a le droit de nommer une extension : le dossier de la fonctionnalité, ses deux activités et leurs vues, les registres, les textes
const PERMIS = [/^ceintures\//, /^assemblage\//, /^extensions\//, /^exercices\/ceintures(-brevet)?\//, /^views\/(monde\/CeinturesView|maths\/CeinturesBrevetView)\.vue$/, /^exercices\/index\.ts$/, /^views\/exercices\.ts$/, /\/textes\//]
// l'identifiant écrit comme texte ou comme chemin (`'ceintures'`, `/assemblage/`), et pour un nom qui n'est pas un mot courant du français, le mot lui-même
const MOTS_PROPRES = { ceintures: 'ceinture' }
for (const e of EXTENSIONS) {
  const motif = new RegExp(`['"\`/]${e.id}['"\`/]${MOTS_PROPRES[e.id] ? `|${MOTS_PROPRES[e.id]}` : ''}`, 'i')
  const fuites = sources(src).map(f => relative(src, f)).filter(f => !PERMIS.some(p => p.test(f))).filter(f => motif.test(readFileSync(join(src, f), 'utf8')))
  verifier(!fuites.length, `${e.id} : aucune mention dans les parties communes ${fuites.join(', ')}`)
}

process.exit(nbEchecs() ? 1 : 0)
