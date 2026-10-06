// Capture des fiches d'une vue dans Chrome (vues PAS ENCORE migrées vers src/exercices/ : à garder tant qu'il en reste) :
// empreintes au format des instantanés (tests/instantanes/<exercice>.json, mêmes clés de cas), et HTML complets pour
// `npm run instantanes -- --diff`. La capture « avant » d'une vue ancienne devient ainsi l'instantané de référence de
// l'exercice migré (procédure : src/exercices/README.md).
//
//   node scripts/dev/capturer-fiches.ts <route> [--niveaux CE1,CE2] [--graines 1,2,3] [--langues fr,br]
//        [--reglages fichier.json] [--cle heure_config] [--id heure] [--sortie fichier.json] [--html dossier]
//        [--url http://localhost:5173/ecole-primaire/] [--paralleles 8] [--recharger]
//
// - Serveur : --url, sinon TEST_URL, sinon le serveur de dev (npm run dev).
// - Cas : pour un exercice du registre (src/exercices/ancien.js), ceux du test des instantanés ; sinon ceux de --reglages :
//     { "cle": "monnaie_config",                       // clé des réglages mémorisés de la vue (chargerReglages)
//       "cas": [{ "niveau": "ce1", "nom": "defauts",    // → clé <id>/ce1/graineN/<langue>/defauts
//                 "reglages": { … },                    // réglages mémorisés (ep_<cle>) avant l'ouverture de la vue
//                 "stockage": { "autre_cle": … },       // facultatif : autres valeurs de localStorage (sans ep_)
//                 "clics": ["^CE1$"] }] }               // facultatif : boutons cliqués ensuite (regex du texte)
//   Le plus sûr : des réglages mémorisés plutôt que des clics. La fiche est alors le premier tirage de la graine,
//   comme fiche(questionsFiche(…, creerRng(graine))) en node ; chaque clic qui régénère la fiche avance le flux.
// - Un navigateur, un contexte par langue × niveau, en parallèle (--paralleles). Pilotage de la page : capturer/page.ts.
import { parseArgs } from 'node:util'
import { chromium } from 'playwright-core'
import { REGISTRE } from '../../src/exercices/ancien.js'
import { trouverChrome } from '../../tests/outils.mjs'
import {
  GRAINES, DOSSIER_HTML, empreinte, ecrireInstantanes, ecrireHtml, fichierInstantanes, languesDe, lireInstantanes,
} from '../../tests/outils-instantanes.mjs'
import { casDuFichier, casDuRegistre } from './capturer/cas.ts'
import type { Cas } from './capturer/cas.ts'
import { capturer, preparer } from './capturer/page.ts'

const USAGE = 'Usage : node scripts/dev/capturer-fiches.ts <route> [--niveaux CE1,CE2] [--graines 1,2,3] [--langues fr,br] [--reglages f.json] [--sortie f.json]'
const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    niveaux: { type: 'string' }, graines: { type: 'string' }, langues: { type: 'string' }, reglages: { type: 'string' },
    cle: { type: 'string' }, id: { type: 'string' }, sortie: { type: 'string' }, html: { type: 'string', default: DOSSIER_HTML },
    url: { type: 'string' }, paralleles: { type: 'string', default: '8' }, recharger: { type: 'boolean', default: false },
    help: { type: 'boolean', default: false },
  },
})
const route = positionals[0]
if (values.help || !route?.startsWith('/')) {
  console.error(USAGE)
  process.exit(values.help ? 0 : 2)
}
const liste = (valeur: string | undefined): string[] | null => valeur?.split(',').map(s => s.trim()).filter(Boolean) ?? null

const module = REGISTRE.find(m => m.definition.route === route)
const id = values.id ?? module?.definition.id ?? route.split('/').pop() ?? route
const graines = (liste(values.graines) ?? GRAINES.map(String)).map(Number)
const niveaux = liste(values.niveaux)?.map(n => n.toLowerCase()) ?? null
const langues = liste(values.langues) ?? (module ? languesDe(module.definition) as string[] : ['fr'])
const base = (values.url ?? process.env.TEST_URL ?? 'http://localhost:5173/ecole-primaire/').replace(/\/?$/, '/')

// ── Cas à capturer ──
let cas: Cas[]
if (values.reglages) cas = casDuFichier(values.reglages, { id, graines, langues, niveaux })
else if (module) cas = casDuRegistre(module.definition, values.cle ?? `${id.replaceAll('-', '_')}_config`, { graines, langues, niveaux })
else {
  console.error(`${route} n'est pas dans le registre des exercices : donner les cas avec --reglages fichier.json`)
  process.exit(2)
}
if (!cas.length) { console.error('Aucun cas à capturer (niveaux ?)'); process.exit(2) }

try { await fetch(base) } catch { console.error(`Serveur injoignable : ${base} (npm run dev, ou --url)`); process.exit(2) }

// ── Capture : un contexte (localStorage à soi) par langue × niveau, plusieurs à la fois ──
const debut = performance.now()
const navigateur = await chromium.launch({ executablePath: trouverChrome() })
const parContexte = new Map<string, Cas[]>()
for (const c of cas) parContexte.set(`${c.langue}/${c.niveau}`, [...parContexte.get(`${c.langue}/${c.niveau}`) ?? [], c])
const groupes = [...parContexte.values()]
const erreurs: string[] = []
const options = { base, route, recharger: values.recharger }
const empreintes: Record<string, string> = {}
const enAttente = [...groupes]
const nbParalleles = Math.max(1, Number(values.paralleles))
await Promise.all(Array.from({ length: Math.min(nbParalleles, groupes.length) }, async () => {
  for (let g = enAttente.shift(); g; g = enAttente.shift()) {
    const { ctx, page } = await preparer(navigateur, base, g[0].langue, erreurs)
    for (const c of g) {
      const html = await capturer(page, c, options)
      empreintes[c.cle] = empreinte(html)
      ecrireHtml(c.cle, html, values.html)
    }
    await ctx.close()
  }
}))
await navigateur.close()
const duree = ((performance.now() - debut) / 1000).toFixed(1)

// ── Compte rendu ──
if (values.sortie) ecrireInstantanes(values.sortie, empreintes)
console.log(`✓ ${cas.length} fiche(s) capturée(s) en ${duree} s (${groupes.length} contexte(s), ${values.recharger ? 'rechargement' : 'remontage'} par cas)`)
console.log(`  HTML : ${values.html}/${id}/…${values.sortie ? `\n  empreintes : ${values.sortie}` : ''}`)
if (erreurs.length) console.log(`  ⚠ ${erreurs.length} erreur(s) JavaScript : ${[...new Set(erreurs)].slice(0, 3).join(' | ')}`)
// comparaison avec l'instantané enregistré, s'il existe (exercice déjà migré)
const enregistres = lireInstantanes(fichierInstantanes(id)) as Record<string, string> | null
if (enregistres) {
  const communs = Object.keys(empreintes).filter(k => k in enregistres)
  const differents = communs.filter(k => enregistres[k] !== empreintes[k])
  console.log(`  instantané tests/instantanes/${id}.json : ${communs.length - differents.length}/${communs.length} identiques${differents.length ? ` ; différents : ${differents.slice(0, 5).join(', ')}${differents.length > 5 ? '…' : ''}` : ''}`)
}
process.exit(erreurs.length ? 1 : 0)
