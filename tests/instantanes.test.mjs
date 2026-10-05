// Instantanés des fiches (node, sans Chrome, ~1 s) : les fiches générées ne changent pas par accident.
// Pour chaque exercice du registre, chaque niveau, 3 graines, chaque langue de contenu et chaque jeu de réglages
// (défauts du niveau, tout au programme, fiches de definition.fiches) : sha1 du HTML normalisé de
// fiche(questionsFiche(…, creerRng(graine))), comparé à tests/instantanes/<exercice>.json (format :
// tests/outils-instantanes.mjs ; c'est aussi celui de scripts/capturer-fiches.mjs).
//   npm run instantanes                          vérifier
//   npm run instantanes -- heure/ce1             seulement les cas qui commencent ainsi
//   npm run instantanes -- --maj [préfixe]       réécrire les empreintes (+ HTML complets dans /tmp/instantanes/)
//   npm run instantanes -- --diff <cas|préfixe>  HTML recalculé et diff avec celui d'avant (/tmp/instantanes/)
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { REGISTRE } from '../src/exercices/index.js'
import { REGISTRE_DEV } from '../src/exercices/dev.ts'
import { contenu } from '../src/i18n/index.js'
import { creerRng } from '../src/utils/hasard.js'
import {
  casDe, empreinte, normaliser, fichierInstantanes, lireInstantanes, ecrireInstantanes, ecrireHtml, fichierHtml, DOSSIER_HTML,
} from './outils-instantanes.mjs'
import { verifier, nbEchecs } from './outils.mjs'

const args = process.argv.slice(2)
const maj = args.includes('--maj')
const iDiff = args.indexOf('--diff')
const diff = iDiff >= 0 ? args[iDiff + 1] : null
const prefixe = diff ?? args.find((a, i) => !a.startsWith('--') && (iDiff < 0 || i !== iDiff + 1)) ?? ''
const retenu = cle => cle.startsWith(prefixe)

// HTML d'un cas : exactement ce que la vue met dans l'aperçu (avant les options prénom/corrigé du cadre)
function htmlDe({ generateur, fiche, textes }, { niveau, reglages, graine, langue }) {
  const T = contenu(textes, langue).t
  const questions = generateur.questionsFiche({ niveau, reglages, rng: creerRng(graine), T })
  return fiche.fiche({ questions, reglages, T, langue })
}

// HTML lisible en diff : une balise par ligne, espaces normalisés
const enLignes = html => normaliser(html).replace(/>\s*</g, '>\n<') + '\n'

function montrerDiff(cle, html, attendue) {
  const avant = fichierHtml(cle)
  const apres = ecrireHtml(cle, html, `${DOSSIER_HTML}/actuel`)
  console.log(`\n── ${cle}\n  maintenant : ${apres}`)
  if (!existsSync(avant)) {
    console.log(`  pas de HTML d'avant (${avant}) : lancer --maj (ou capturer-fiches) avant la modification`)
    return
  }
  const hAvant = empreinte(readFileSync(avant, 'utf8'))
  console.log(`  avant      : ${avant}${attendue && hAvant !== attendue ? ' (attention : ce n\'est pas le HTML de l\'instantané enregistré)' : ''}`)
  if (hAvant === empreinte(html)) { console.log('  identiques (après normalisation)'); return }
  const a = `${DOSSIER_HTML}/diff/avant.html`, b = `${DOSSIER_HTML}/diff/apres.html`
  mkdirSync(dirname(a), { recursive: true })
  writeFileSync(a, enLignes(readFileSync(avant, 'utf8')))
  writeFileSync(b, enLignes(html))
  try { execFileSync('diff', ['-u', '--label', `avant/${cle}`, '--label', `maintenant/${cle}`, a, b], { encoding: 'utf8' }) } catch (e) { console.log(e.stdout) }
}

const debut = performance.now()
let nbCas = 0, nbDiffs = 0
for (const module of [...REGISTRE, ...REGISTRE_DEV]) {
  const id = module.definition.id
  const cas = casDe(module.definition).filter(c => retenu(c.cle))
  if (!cas.length) continue
  const fichier = fichierInstantanes(id)
  const enregistres = lireInstantanes(fichier)
  const calcules = {}
  for (const c of cas) {
    const html = htmlDe(module, c)
    calcules[c.cle] = empreinte(html)
    if (maj) ecrireHtml(c.cle, html)
    else if (diff && calcules[c.cle] !== enregistres?.[c.cle] && nbDiffs++ < 3) montrerDiff(c.cle, html, enregistres?.[c.cle])
  }
  nbCas += cas.length

  if (maj) {
    // avec un préfixe, les autres cas enregistrés sont gardés
    const garder = Object.fromEntries(Object.entries(enregistres ?? {}).filter(([k]) => !retenu(k)))
    ecrireInstantanes(fichier, { ...garder, ...calcules })
    console.log(`  ✓ ${id} : ${cas.length} empreinte(s) écrite(s) dans tests/instantanes/${id}.json`)
    continue
  }
  if (!enregistres) {
    // exercice en cours de migration : pas encore d'instantané (à créer avec --maj une fois la fiche stable)
    console.log(`  ⚠ ${id} : pas d'instantané (tests/instantanes/${id}.json) — npm run instantanes -- --maj ${id}`)
    continue
  }
  const differents = cas.filter(c => enregistres[c.cle] !== undefined && enregistres[c.cle] !== calcules[c.cle]).map(c => c.cle)
  const nouveaux = cas.filter(c => enregistres[c.cle] === undefined).map(c => c.cle)
  const disparus = Object.keys(enregistres).filter(k => retenu(k) && !(k in calcules))
  const resume = (l, quoi) => (l.length ? ` ; ${l.length} ${quoi} : ${l.slice(0, 4).join(', ')}${l.length > 4 ? '…' : ''}` : '')
  verifier(!differents.length && !nouveaux.length && !disparus.length,
    `${id} : ${cas.length - differents.length - nouveaux.length}/${cas.length} fiches identiques à l'instantané${resume(differents, 'différente(s)')}${resume(nouveaux, 'nouvelle(s)')}${resume(disparus, 'disparue(s)')}`)
}
if (!nbCas) verifier(false, `aucun cas ne commence par « ${prefixe} »`)
if (diff && !maj && !nbDiffs) console.log(`  aucun écart pour « ${diff} »`)
console.log(`  ${nbCas} cas en ${Math.round(performance.now() - debut)} ms${nbEchecs() ? ' — écart voulu : --diff <cas>, regarder, puis --maj (et le justifier dans le commit)' : ''}`)

// code de sortie lu par tests/lancer.mjs
process.exit(nbEchecs() ? 1 : 0)
