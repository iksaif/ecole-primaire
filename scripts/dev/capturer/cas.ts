// Les cas à capturer : un cas = une fiche = (exercice, niveau, graine, langue, réglages). Deux sources :
//   - un exercice du registre (src/exercices/index.ts) : les cas du test des instantanés (défauts du niveau, tout
//     au programme, fiches de la définition), via tests/outils-instantanes.mjs ;
//   - un fichier --reglages : les cas écrits à la main (format dans l'en-tête de capturer-fiches.ts).
import { readFileSync } from 'node:fs'
import { casDe, cleCas } from '../../../tests/outils-instantanes.mjs'

export interface Cas {
  /** clé de l'instantané : <id>/<niveau>/graine<N>/<langue>/<nom> */
  cle: string
  niveau: string
  graine: number
  langue: string
  /** valeurs de localStorage (sans le préfixe `ep_`) posées avant d'ouvrir la vue : réglages mémorisés et autres */
  stockage: Record<string, unknown>
  /** boutons cliqués ensuite (expressions régulières sur leur texte) */
  clics: string[]
}

/** Le fichier --reglages : les cas décrits à la main, pour une vue qui n'est pas dans le registre. */
interface FichierReglages {
  /** clé des réglages mémorisés de la vue (chargerReglages), sans `ep_` */
  cle: string
  cas: { niveau: string, nom: string, cle?: string, reglages?: unknown, stockage?: Record<string, unknown>, clics?: string[] }[]
}

interface Selection { id: string, graines: number[], langues: string[], niveaux: string[] | null }

/** Les cas d'un fichier --reglages, un par graine et par langue. */
export function casDuFichier(fichier: string, { id, graines, langues, niveaux }: Selection): Cas[] {
  const f = JSON.parse(readFileSync(fichier, 'utf8')) as FichierReglages
  const cas: Cas[] = []
  for (const c of f.cas.filter(x => !niveaux || niveaux.includes(x.niveau))) {
    for (const graine of graines) for (const langue of langues) {
      const stockage = { ...c.stockage, ...(c.reglages ? { [c.cle ?? f.cle]: c.reglages } : {}) }
      cas.push({ cle: cleCas({ exercice: id, niveau: c.niveau, graine, langue, nom: c.nom }), niveau: c.niveau, graine, langue, stockage, clics: c.clics ?? [] })
    }
  }
  return cas
}

/** Les cas d'un exercice du registre : ses réglages sont mémorisés sous `cle` (défaut : `<id>_config`, tirets en soulignés). */
export function casDuRegistre(definition: unknown, cle: string, { graines, langues, niveaux }: Omit<Selection, 'id'>): Cas[] {
  const cas = casDe(definition, { niveaux: niveaux ?? undefined, graines, langues }) as (Omit<Cas, 'stockage' | 'clics'> & { reglages: unknown })[]
  return cas.map(({ reglages, ...c }) => ({ ...c, stockage: { [cle]: reglages }, clics: [] }))
}
