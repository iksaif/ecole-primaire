// Les routes de l'application pour les tests Chrome : lues dans la table src/router/routes.ts (+ une route par exercice du
// registre, + les pages /dev du routeur), jamais recopiées. Une route à paramètre devient deux adresses : une valeur valide
// et une valeur inconnue (la page « introuvable » de la ressource).
import { readFileSync } from 'node:fs'
import { get as getHttp } from 'node:http'
import { get as getHttps } from 'node:https'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { routesDeBase, routesDesExercices } from '../src/router/routes.ts'
import { REGISTRE } from '../src/exercices/index.ts'
import { COMPETENCES } from '../src/data/programme.ts'
import { SITES } from '../src/sites.ts'

const racine = join(dirname(fileURLToPath(import.meta.url)), '..')

/** Chemins déclarés de la table (hors redirections, hors page introuvable), avec leurs paramètres (`:slug`). */
export function cheminsDeLaTable(site = 'ecoleprimaire') {
  const base = routesDeBase(SITES[site].languesRegionales)
  return [...base, ...routesDesExercices(REGISTRE, base)].filter(r => !r.redirect).map(r => r.path)
}

/** Les pages /dev, déclarées dans src/router/index.ts (le site « avec développement » seulement). */
export const cheminsDev = () => [...readFileSync(join(racine, 'src/router/index.ts'), 'utf8').matchAll(/path: '(\/dev[^']*)'/g)].map(m => m[1])

/**
 * Adresses à visiter pour `chemins` : sans paramètre telles quelles ; avec paramètre, une valeur valide et une inconnue.
 * `valides` : paramètre → valeur valide (ex. `{ slug: 'une-fiche' }`) ; un paramètre sans valeur connue donne une erreur franche.
 */
export function adresses(chemins, valides) {
  return chemins.flatMap(c => {
    const params = [...c.matchAll(/:(\w+)/g)].map(m => m[1])
    if (!params.length) return [c]
    for (const p of params) if (valides[p] === undefined) throw new Error(`route ${c} : aucune valeur valide connue pour :${p} (tests/outils-routes.mjs)`)
    const avec = v => c.replace(/:(\w+)/g, (_, p) => v(p))
    return [avec(p => valides[p]), avec(() => 'inconnu-xyz')]
  })
}

// node:http plutôt que fetch : fetch refuse le port 4190 (liste des ports interdits du standard, « sieve »)
const lireJson = url => new Promise((ok, ko) => {
  (url.startsWith('https') ? getHttps : getHttp)(url, r => {
    const morceaux = []
    r.on('data', d => morceaux.push(d))
    r.on('end', () => { try { ok(JSON.parse(Buffer.concat(morceaux).toString())) } catch (e) { ko(e) } })
  }).on('error', ko)
})

/** Valeurs valides des paramètres de la table : une compétence du programme ; une fiche lue dans l'index du site testé. */
export async function valeursValides(urlSite) {
  const index = await lireJson(`${urlSite}fiches/index.json`).catch(() => null)
  const slug = index?.entrees?.[0]?.slug
  return { id: COMPETENCES[0].id, ...(slug ? { slug } : {}) }
}
