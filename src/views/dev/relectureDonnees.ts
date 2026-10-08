// Les textes bretons de tout le site, prêts pour la relecture (page /dev/relecture-breton). Vite lit les modules de textes et leur
// source brut (les marqueurs « // br: à relire » sont des commentaires, donc seulement dans le source) ; la lecture elle-même est
// src/langues/relecture.ts, la même que `npm run i18n`. Développement seulement : jamais importé par un build de production.
import { CODES, LANGUE_SOURCE } from '../../langues/registre.ts'
import { estCatalogue } from '../../langues/catalogue.ts'
import { lignesAffiche, lignesContenu, lignesSection } from '../../langues/relecture.ts'
import type { Arbre, LigneRelecture } from '../../langues/relecture.ts'
import { REGISTRE as EXERCICES } from '../../exercices/index.ts'
import { REGISTRE as AFFICHES } from '../../affiches/index.ts'

/** La langue relue : la première langue du registre qui n'est pas la langue source. */
const LANGUE_RELUE = CODES.find(c => c !== LANGUE_SOURCE) ?? LANGUE_SOURCE

// Une entrée par fichier ; la clé est son chemin, dont on tire la langue ou l'identifiant.
const modules = import.meta.glob<{ default: Arbre }>('../../langues/*/textes/*.ts', { eager: true })
const sources = import.meta.glob<string>(['../../langues/*/textes/*.ts', '../../exercices/*/textes.ts', '../../affiches/*/textes.ts'], { eager: true, query: '?raw', import: 'default' })

const fichier = (chemin: string): string => chemin.split('/').pop() ?? chemin

/** Les textes de l'interface : une section par fichier de `src/langues/<langue>/textes/`. */
function interfaceDuSite(): LigneRelecture[] {
  const parLangue = (langue: string): [string, Arbre][] => Object.entries(modules)
    .filter(([c]) => c.includes(`/langues/${langue}/textes/`) && fichier(c) !== 'index.ts')
    .map(([c, m]) => [fichier(c).replace(/\.ts$/, ''), m.default])
  const relu = new Map(parLangue(LANGUE_RELUE))
  return parLangue(LANGUE_SOURCE).flatMap(([section, fr]) => {
    const source = sources[`../../langues/${LANGUE_RELUE}/textes/${section}.ts`] ?? ''
    return lignesSection(section, fr, relu.get(section) ?? {}, source)
  })
}

/** Le contenu des exercices : le catalogue `catalogue(…)` de chaque exercice qui en a un. */
function contenuDesExercices(): LigneRelecture[] {
  return EXERCICES.filter(m => !m.exemple).flatMap(m => {
    const catalogue: unknown = m.textes
    if (!estCatalogue(catalogue)) return []
    const source = sources[`../../exercices/${m.definition.id}/textes.ts`] ?? ''
    return lignesContenu(m.definition.id, catalogue.source as Arbre, (catalogue.traductions as Readonly<Record<string, Arbre | undefined>>)[LANGUE_RELUE], source)
  })
}

/** Les textes des affiches (hors exemples de développement). */
function textesDesAffiches(): LigneRelecture[] {
  return AFFICHES.filter(a => a.definition.domaine !== 'exemple').flatMap(a => {
    const source = sources[`../../affiches/${a.definition.id}/textes.ts`] ?? ''
    return lignesAffiche(a.definition.id, a.textes[LANGUE_SOURCE] ?? {}, a.textes[LANGUE_RELUE], source)
  })
}

/** Tous les textes, dans l'ordre de la relecture : le contenu des fiches (exercices, affiches), le plus important, puis l'interface. */
export const lignesDuSite = (): LigneRelecture[] => [...contenuDesExercices(), ...textesDesAffiches(), ...interfaceDuSite()]
