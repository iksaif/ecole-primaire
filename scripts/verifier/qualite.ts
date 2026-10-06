// Compteurs de qualité, avec un seuil enregistré dans scripts/verifier/qualite-seuils.json (plan 10, principe 5).
//   npm run qualite                     échoue si un compteur passe du mauvais côté de son seuil
//   npm run qualite -- --enregistrer    resserre les seuils sur les valeurs actuelles (jamais l'inverse)
// Un compteur « max » ne peut que baisser, un compteur « min » que monter. Quand il s'améliore, la commande passe
// et propose de resserrer le seuil (à commiter avec le changement qui l'a amélioré). Un seuil ne se relâche jamais sans raison écrite.
//
// Ce que mesure chaque compteur, et pourquoi, est écrit en tête de son module : qualite/texte.ts (lecture des sources),
// qualite/imports.ts (graphe d'imports), qualite/app.ts (modules de l'app, types). qualite/index.ts les range dans l'ordre d'affichage.
import { readFileSync, writeFileSync } from 'node:fs'
import { parseArgs } from 'node:util'
import { relative } from 'node:path'
import { chemin, racine } from '../lib/racine.ts'
import { COMPTEURS } from './qualite/index.ts'
import { fermerChargeur } from './qualite/app.ts'

const { values } = parseArgs({ options: { enregistrer: { type: 'boolean', default: false } } })
const FICHIER_SEUILS = chemin('scripts/verifier/qualite-seuils.json')

type Sens = 'max' | 'min'
type Seuils = Record<Sens, Record<string, number>>
const seuils = JSON.parse(readFileSync(FICHIER_SEUILS, 'utf8')) as Partial<Seuils>

let echec = false, ameliore = false
for (const [nom, calcul] of Object.entries(COMPTEURS)) {
  const r = await calcul()
  const { valeur, detail } = typeof r === 'number' ? { valeur: r, detail: undefined } : r
  const sens: Sens = nom in (seuils.min ?? {}) ? 'min' : 'max'
  const seuil = seuils[sens]?.[nom]
  const mieux = seuil !== undefined && (sens === 'max' ? valeur < seuil : valeur > seuil)
  const pire = seuil === undefined || (sens === 'max' ? valeur > seuil : valeur < seuil)
  const etat = pire ? '✗' : mieux ? '↓' : '✓'
  console.log(`${etat} ${nom.padEnd(15)} ${String(valeur).padStart(6)}  (seuil ${sens} ${seuil ?? '—'})${detail ? `  ${detail}` : ''}`)
  if (pire) echec = true
  if (mieux) { ameliore = true; if (values.enregistrer && seuils[sens]) seuils[sens][nom] = valeur }
}

await fermerChargeur()

if (ameliore && values.enregistrer) {
  writeFileSync(FICHIER_SEUILS, JSON.stringify(seuils, null, 2) + '\n')
  console.log(`\nSeuils resserrés dans ${relative(racine, FICHIER_SEUILS)} : à commiter.`)
} else if (ameliore) console.log('\n↓ Des compteurs se sont améliorés : `npm run qualite -- --enregistrer` resserre les seuils.')
if (echec) console.log('\n✗ Régression : un compteur a dépassé son seuil (voir l\'en-tête de scripts/verifier/qualite.ts).')
process.exit(echec ? 1 : 0)
