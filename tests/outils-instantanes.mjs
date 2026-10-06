// Instantanés de fiches : ce qui est commun au test node (tests/instantanes.test.mjs) et à la capture dans Chrome des
// vues pas encore migrées (scripts/capturer-fiches.mjs). Même format, mêmes clés de cas :
//   tests/instantanes/<exercice>.json   { "heure/ce1/graine1/fr/defauts": "<sha1 du HTML normalisé>", … }
// Une capture « avant » d'une vue ancienne devient ainsi directement l'instantané de référence de l'exercice migré.
import { createHash } from 'node:crypto'
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { jeuxDeReglages, langueContenuDe } from '../src/noyau/reglages.ts'

export const racine = join(dirname(fileURLToPath(import.meta.url)), '..')
export const DOSSIER_INSTANTANES = join(racine, 'tests/instantanes')
// HTML complets du dernier --maj (ou de la dernière capture) : non versionnés, pour --diff
export const DOSSIER_HTML = '/tmp/instantanes'
export const GRAINES = [1, 2, 3]

// HTML normalisé avant empreinte :
// - les @font-face sont retirés : leurs url(...) contiennent un hash et un chemin de build (ou une data: URL), et
//   node n'en a pas (documentFiche sans cssPolices). Le nom de la police reste, dans le font-family du body ;
// - les suites d'espaces deviennent un seul espace (indentation des gabarits).
export const normaliser = html => html.replace(/@font-face\s*\{[^}]*\}/g, '').replace(/\s+/g, ' ').trim()
export const empreinte = html => createHash('sha1').update(normaliser(html)).digest('hex')

// Clé d'un cas : exercice/niveau/graineN/langue/réglages
export const cleCas = ({ exercice, niveau, graine, langue, nom }) => `${exercice}/${niveau}/graine${graine}/${langue}/${nom}`

// Langues de contenu d'un exercice : fr seulement si le contenu est toujours en français, sinon fr et br
export const languesDe = definition => [...new Set(['fr', 'br'].map(l => langueContenuDe(definition, l)))]

// Jeux de réglages d'un niveau (src/noyau/reglages.ts, jeuxDeReglages) : défauts, « tout au programme », chaque autre
// valeur d'un réglage à choix unique (y compris bonus et hors programme : la fiche ne doit pas changer non plus),
// chaque fiche par compétence de la définition. Tous passent par reglagesDuNiveau, comme les réglages mémorisés.
export const reglagesDe = (definition, niveau) => jeuxDeReglages(definition, niveau, { horsProgramme: true })

// Tous les cas d'un exercice du registre (filtrables par niveaux, graines, langues)
export function casDe(definition, { niveaux = Object.keys(definition.niveaux), graines = GRAINES, langues = languesDe(definition) } = {}) {
  const cas = []
  for (const niveau of niveaux.filter(n => definition.niveaux[n])) {
    for (const [nom, reglages] of Object.entries(reglagesDe(definition, niveau))) {
      for (const graine of graines) for (const langue of langues) {
        const c = { exercice: definition.id, niveau, graine, langue, nom, reglages }
        cas.push({ ...c, cle: cleCas(c) })
      }
    }
  }
  return cas
}

export const fichierInstantanes = id => join(DOSSIER_INSTANTANES, `${id}.json`)
export const lireInstantanes = fichier => (existsSync(fichier) ? JSON.parse(readFileSync(fichier, 'utf8')) : null)
// une ligne par cas, clés triées : le diff git reste lisible
export function ecrireInstantanes(fichier, empreintes) {
  mkdirSync(dirname(fichier), { recursive: true })
  const trie = Object.fromEntries(Object.keys(empreintes).sort().map(k => [k, empreintes[k]]))
  writeFileSync(fichier, JSON.stringify(trie, null, 2) + '\n')
}

export const fichierHtml = (cle, dossier = DOSSIER_HTML) => join(dossier, `${cle}.html`)
export function ecrireHtml(cle, html, dossier = DOSSIER_HTML) {
  const f = fichierHtml(cle, dossier)
  mkdirSync(dirname(f), { recursive: true })
  writeFileSync(f, html)
  return f
}
