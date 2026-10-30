// Prépare la lecture des textes officiels dans l'app (src/programme/lecteur.ts) :
//   node scripts/generer/programmes.ts           écrit public/programmes/<texte>/<page>.txt pour chaque page du PDF citée par une compétence
//                                                (extraite de docs/programmes/<texte>.md, sans retouche)
//   node scripts/generer/programmes.ts --ancres  propose les ancres (début et fin du passage) des compétences qui n'en ont pas, dans
//                                                src/programme/ancres.ts ; les ancres déjà là (relues, corrigées à la main) ne sont jamais écrasées.
//                                                Les propositions faibles (peu de mots de l'extrait retrouvés) sont listées : à relire.
// Le texte vient de `pdftotext` : les colonnes des tableaux s'y mélangent, donc un passage est indicatif (le PDF fait foi).
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { COMPETENCES } from '../../src/data/programme.ts'
import type { SourceId } from '../../src/data/programme.ts'
import { decouper, normaliser } from '../../src/programme/lecteur.ts'
import { ANCRES } from '../../src/programme/ancres.ts'
import { lectureDisponible } from '../../src/programme/officiel.ts'

const RACINE = join(import.meta.dirname, '../..')
const SORTIE = join(RACINE, 'public/programmes')
const FICHIER_ANCRES = join(RACINE, 'src/programme/ancres.ts')

/** Le texte de chaque page du PDF d'un texte officiel, d'après docs/programmes/<texte>.md (sections « ## Page N »). */
function pagesDe(source: SourceId): Map<number, string> {
  const fichier = join(RACINE, `docs/programmes/${source}.md`)
  if (!existsSync(fichier)) throw new Error(`docs/programmes/${source}.md introuvable`)
  const morceaux = readFileSync(fichier, 'utf8').split(/^#+ Page (\d+)\s*$/m)
  const pages = new Map<number, string>()
  for (let i = 1; i < morceaux.length; i += 2) pages.set(Number(morceaux[i]), morceaux[i + 1].trim())
  return pages
}

const memoire = new Map<SourceId, Map<number, string>>()
function textePage(source: SourceId, page: number): string {
  if (!memoire.has(source)) memoire.set(source, pagesDe(source))
  const texte = memoire.get(source)!.get(page)
  if (texte === undefined) throw new Error(`${source} : page ${page} absente de docs/programmes/${source}.md`)
  return texte
}

// ── Les pages ──

function ecrirePages(): void {
  const citees = new Set(COMPETENCES.filter(k => lectureDisponible(k.source.texte)).map(k => `${k.source.texte}/${k.source.page}`))
  for (const cle of [...citees].sort()) {
    const [source, page] = cle.split('/')
    mkdirSync(join(SORTIE, source), { recursive: true })
    writeFileSync(join(SORTIE, source, `${page}.txt`), `${textePage(source as SourceId, Number(page))}\n`)
  }
  console.log(`${citees.size} pages écrites dans public/programmes/`)
}

// ── Les ancres ──

const MOTS_VIDES = new Set(['dans', 'avec', 'pour', 'sont', 'leur', 'leurs', 'cette', 'entre', 'comme', 'aussi', 'plus', 'sans', 'sous', 'vers', 'dont', 'tout', 'tous', 'toute', 'toutes', 'chez', 'ainsi', 'avoir', 'faire', 'etre', 'ces', 'ses', 'les', 'des', 'une'])
const TAILLES = [25, 40, 60, 90, 130]
const LONGUEUR_ANCRE = 6

interface Proposition {
  debut: string
  fin: string
  /** part des mots-clés de l'extrait retrouvés dans le passage */
  couverture: number
}

/** Le passage de la page qui contient le plus de mots-clés de l'extrait (le plus court à égalité), arrondi aux phrases. */
function proposer(texte: string, extrait: string): Proposition | null {
  const { morceaux, mots } = decouper(texte)
  const bruts = morceaux.filter(m => m.mot !== null).map(m => m.texte)
  const cles = new Set(extrait.split(/\s+/).map(normaliser).filter(m => m.length >= 4 && !MOTS_VIDES.has(m)))
  if (cles.size === 0 || mots.length === 0) return null

  let meilleur = { debut: 0, fin: 0, trouves: -1 }
  for (const taille of TAILLES) {
    for (let d = 0; d + 1 <= mots.length; d++) {
      const f = Math.min(mots.length - 1, d + taille - 1)
      const trouves = new Set(mots.slice(d, f + 1).filter(m => cles.has(m))).size
      const plusLong = f - d > meilleur.fin - meilleur.debut
      if (trouves > meilleur.trouves || (trouves === meilleur.trouves && !plusLong && trouves > 0)) meilleur = { debut: d, fin: f, trouves }
      if (f === mots.length - 1) break
    }
  }
  if (meilleur.trouves <= 0) return null

  // resserrer sur le premier et le dernier mot-clé du passage
  let { debut, fin } = meilleur
  while (debut < fin && !cles.has(mots[debut])) debut++
  while (fin > debut && !cles.has(mots[fin])) fin--
  // arrondir aux phrases : remonter au début de la phrase, descendre à sa fin
  while (debut > 0 && !/[.:;]$/.test(bruts[debut - 1]) && debut > meilleur.debut - 12) debut--
  while (fin < mots.length - 1 && !/[.;]$/.test(bruts[fin]) && fin < meilleur.fin + 12) fin++

  const debutAncre = bruts.slice(debut, debut + LONGUEUR_ANCRE).join(' ')
  const finAncre = bruts.slice(Math.max(debut, fin - LONGUEUR_ANCRE + 1), fin + 1).join(' ')
  return { debut: debutAncre, fin: finAncre, couverture: meilleur.trouves / cles.size }
}

function ecrireAncres(): void {
  const nouvelles: Record<string, Proposition> = {}
  const faibles: string[] = []
  for (const k of COMPETENCES) {
    if (ANCRES[k.id]) continue
    const p = proposer(textePage(k.source.texte, k.source.page), k.source.extrait)
    if (!p) { faibles.push(`${k.id} : aucun passage trouvé`); continue }
    nouvelles[k.id] = p
    if (p.couverture < 0.6) faibles.push(`${k.id} : ${Math.round(p.couverture * 100)} % des mots de l'extrait`)
  }
  const lignes = COMPETENCES.map(k => {
    const ancre = ANCRES[k.id] ?? nouvelles[k.id]
    if (!ancre) return null
    return `  ${JSON.stringify(k.id)}: { debut: ${JSON.stringify(ancre.debut)}, fin: ${JSON.stringify(ancre.fin)} },`
  }).filter(l => l !== null)
  const entete = `// Le passage du texte officiel que chaque compétence cite : les mots du début et de la fin, tels qu'ils sont sur la page du PDF
// (\`source.page\` de src/data/programme.ts ; texte : docs/programmes/). Lus par src/programme/lecteur.ts pour surligner le passage.
// Proposées par \`node scripts/generer/programmes.ts --ancres\` (qui n'écrase jamais une ancre déjà là) : à relire, et à corriger à la main
// quand le passage proposé n'est pas le bon. Une compétence sans ancre : la page s'affiche sans surlignage.
import type { Ancre } from './lecteur.ts'

export const ANCRES: Readonly<Record<string, Ancre>> = {
`
  writeFileSync(FICHIER_ANCRES, `${entete}${lignes.join('\n')}\n}\n`)
  console.log(`${Object.keys(nouvelles).length} ancres proposées (${lignes.length} au total)`)
  if (faibles.length) console.log(`À relire en priorité (${faibles.length}) :\n${faibles.map(f => `  - ${f}`).join('\n')}`)
}

if (process.argv.includes('--ancres')) ecrireAncres()
else ecrirePages()
