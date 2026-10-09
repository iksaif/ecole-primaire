// Des registres aux fiches à produire. Lit les registres d'exercices et d'affiches de la base et en dérive, sans
// navigateur et sans clic, les métadonnées et le HTML de chaque document :
//   - une affiche : une entrée par variante et par langue (src/affiches/catalogue.ts), HTML par `genererAffiche`
//     dans chacun de ses formats ;
//   - un exercice : par classe et par langue de contenu, le bilan (réglages par défaut du niveau) et une entrée par
//     fiche de `definition.fiches`, avec NB_VARIANTES tirages (graine fixe, dérivée du slug) ; HTML par
//     `questionsFiche` puis `fiche`, les mêmes modules purs que l'app.
// Les exemples (domaine fictif) n'y entrent qu'avec `avecExemples`, jamais en production.
import { traducteurExercice } from '../../../src/exercices/traducteur.ts'
import { REGISTRE as EXERCICES } from '../../../src/exercices/index.ts'
import { CODES, confianceFiche, estLangue, langue as definitionDeLangue } from '../../../src/langues/registre.ts'
import { fichesInconnues } from '../../../src/langues/confiance.ts'
import type { Langue } from '../../../src/langues/registre.ts'
import { REGISTRE as AFFICHES } from '../../../src/affiches/index.ts'
import { entreesDe as entreesAffiche, languesDuSite } from '../../../src/affiches/catalogue.ts'
import { site as siteDe } from '../../../src/sites.ts'
import { genererAffiche } from '../../../src/affiches/generer.ts'
import { reglagesDe } from '../../../src/affiches/outils.ts'
import { reglagesDuNiveau, langueContenuDe } from '../../../src/noyau/reglages.ts'
import { slugBilan, slugFiche } from '../../../src/noyau/slugs.ts'
import { creerRng } from '../../../src/utils/hasard.ts'
import { NIVEAUX } from '../../../src/data/classes.ts'
import { competenceDe, domaineDe } from '../../../src/data/programme.ts'
import { POLICE_SCOLAIRE } from '../../../src/impression/document.ts'
import { CSS_OPTIONS_FICHE } from '../../../src/noyau/optionsFiche.ts'
import type { CompetenceVisee, Texte } from '../../../src/telechargements/types.ts'
import type { Classe, CompetenceId, DefinitionExercice, FicheExercice, ModuleExercice } from '../../../src/noyau/types.ts'
import { competencesDeFiche } from '../../../src/noyau/definir.ts'
import { mesureEstimee } from '../../../src/affiches/mesure.ts'
import type { DefinitionAffiche, ModuleAffiche, TextesAffiche } from '../../../src/affiches/types.ts'
import { cssPoliceScolaire } from './polices.ts'
import type { DocumentSource, FicheSource, MetaFiche } from './types.ts'

/** Langues dont on écrit les textes (titres, descriptions) et pour lesquelles les exercices ont une entrée : celles du registre de langues. */
export const LANGUES: readonly Langue[] = CODES

/** Fiches différentes tirées pour le bilan d'une classe, et pour une fiche par compétence. */
export const NB_VARIANTES = 4
export const NB_VARIANTES_COMPETENCE = 2

export interface OptionsRegistres {
  /** ajoute les exercices et les affiches d'exemple (domaine fictif) */
  avecExemples?: boolean
  /** site (mode Vite) : les affiches ne sont produites que dans les langues qu'il publie ; défaut : toutes */
  site?: string
  /** ne garder que les fiches dont le slug commence ainsi (test, mise au point) */
  prefixe?: string
  /** n'en garder qu'un échantillon représentatif (`echantillonner`) : build de test rapide, jamais la production */
  echantillon?: boolean
}

/**
 * Fiches que des tests nomment explicitement (tests/*.test.mjs) : toujours dans l'échantillon.
 * Les exemples y sont déjà tous ; ces deux-là servent de garde-fou si un exemple change de nature.
 */
export const FICHES_NOMMEES: readonly string[] = ['exercices-exemple-ce1', 'affiche-exemple-jusqua6', 'affiche-alphabet-a4-paysage']

/**
 * Un échantillon représentatif des fiches (build de test rapide, tests/lancer.mjs sans `--complet`) :
 *   - toutes les fiches d'exemple (`exemple: true`) ;
 *   - pour chaque famille (exercice ou affiche du registre), la première fiche de chaque genre et de chaque langue ;
 *   - les fiches de `FICHES_NOMMEES` ;
 *   - le parent de toute fiche gardée (une fiche par compétence ne va pas sans son bilan : l'index reste cohérent).
 * L'ordre des registres est conservé ; l'assemblage recalcule les voisines sur les seules fiches gardées.
 */
export function echantillonner(fiches: readonly FicheSource[], nommees: readonly string[] = FICHES_NOMMEES): FicheSource[] {
  const gardees = new Set<string>()
  const vues = new Set<string>()
  for (const f of fiches) {
    const cle = `${f.meta.famille}|${f.meta.genre}|${f.meta.langues.join()}`
    const premiere = !vues.has(cle)
    vues.add(cle)
    if (premiere || f.meta.exemple || nommees.includes(f.meta.slug)) gardees.add(f.meta.slug)
  }
  const parSlug = new Map(fiches.map(f => [f.meta.slug, f] as const))
  for (const slug of [...gardees]) { const p = parSlug.get(slug)?.meta.parent; if (p) gardees.add(p) }
  return fiches.filter(f => gardees.has(f.meta.slug))
}

/** Graine stable d'un texte : les PDF sont identiques d'un build à l'autre. */
export const graineDe = (s: string): number => [...s].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) >>> 0, 7) % 1e6

const suffixeLangue = (langue: string): string => (langue === 'fr' ? '' : `-${langue}`)

/** Un texte dans les langues d'interface, d'après un catalogue ; le français seul quand les autres langues n'ont pas de version. */
function texteMulti(textes: TextesAffiche | ModuleExercice['textes'], cle: string, repli: string): Texte {
  const lu = (l: string): string | null => {
    const v = traducteurExercice(textes, l)(cle)
    return v === cle ? null : v
  }
  const fr = lu('fr') ?? repli
  const res: Texte = { fr }
  for (const l of LANGUES) if (l !== 'fr') { const v = lu(l); if (v && v !== fr) res[l] = v }
  return res
}

const competencesVisees = (ids: readonly CompetenceId[]): CompetenceVisee[] => ids.flatMap(id => {
  const k = competenceDe(id)
  return k ? [{ id, libelle: k.libelle, niveaux: [...k.niveaux], source: k.source }] : []
})

const estExemple = (domaine: string): boolean => !!domaineDe(domaine)?.devSeulement

/** `/dev/affiches?affiche=x&variante=y` → { route, requete } */
function lienPersonnaliser(lien: string): { route: string, requete: Record<string, string> } {
  const [route, requete = ''] = lien.split('?')
  return { route, requete: Object.fromEntries(new URLSearchParams(requete)) }
}

// ── Affiches ──

function fichesAffiche(module: ModuleAffiche, publiees: readonly string[]): FicheSource[] {
  const d = module.definition as DefinitionAffiche
  return entreesAffiche(module).filter(e => e.langues.every(l => publiees.includes(l))).map(e => {
    const { variante } = e.config
    const v = d.variantes[variante]
    // un document par format et par sens que l'affiche permet (le premier de chaque liste est celui par défaut)
    // (la variante peut avoir son propre défaut : A3 pour l'affiche de la classe ; il passe en premier)
    const defaut = reglagesDe(d, e.config)
    const formats = d.formats.flatMap(format => d.orientations.map(orientation => {
      const config = reglagesDe(d, { ...e.config, format, orientation })
      return { format, orientation, html: genererAffiche(module, config, { script: 'Andika' }).html }
    })).sort((a, b) => Number(b.format === defaut.format && b.orientation === defaut.orientation) - Number(a.format === defaut.format && a.orientation === defaut.orientation))
    const reglages = reglagesDe(d, e.config) as unknown as MetaFiche['reglages']
    const description = texteMulti(module.textes, `variante.${variante}.description`, e.description)
    return {
      meta: {
        slug: e.slug,
        titre: texteMulti(module.textes, `variante.${variante}.titre`, e.titre),
        titreCourt: texteMulti(module.textes, `variante.${variante}.court`, e.court),
        description, descriptionLongue: description,
        niveaux: [...v.classes], domaine: d.domaine, genre: 'affiche', langues: [...e.langues], parent: null, famille: d.id,
        confiance: confianceFiche(e.langues, 'affiche', d.id, e.slug),
        personnaliser: lienPersonnaliser(e.lien),
        exemple: estExemple(d.domaine), competences: competencesVisees(v.competences), reglages,
      },
      documents: [{ id: 'affiche', titre: null, graine: null, formats }],
    }
  })
}

// ── Exercices ──

/**
 * Les options par défaut du cadre (« Sur la fiche » : en-tête gardé, corrigé sur une autre page) appliquées au HTML d'une
 * fiche, sans DOM : la fiche balise `<section class="corrige">` (voir src/noyau/optionsFiche.ts).
 */
export function avecOptionsParDefaut(html: string): string {
  return html
    .replace(/<section class="corrige">/g, '<section class="corrige sur-page">')
    .replace('<style>', `<style>${CSS_OPTIONS_FICHE}`)
}

/** Les polices des fiches à plusieurs écritures (fiches d'écriture) : celles des PDF publiés (décision du 2026-10-06). */
const POLICES_PUBLIEES = { script: 'Andika', attache: 'Playwrite FR Trad' }

/** HTML complet d'une fiche d'exercice : questions tirées avec la graine, mises en page avec Andika embarquée. */
function htmlFicheExercice(module: ModuleExercice, niveau: Classe, reglagesFiche: Record<string, unknown>, langue: string, graine: number): string {
  const { definition, generateur, fiche, textes } = module
  const reglages = reglagesDuNiveau(definition, { niveau, ...reglagesFiche })
  const T = traducteurExercice(textes, langue)
  const questions = generateur.questionsFiche({ niveau, reglages, rng: creerRng(graine), T, langue })
  return avecOptionsParDefaut(fiche.fiche({
    questions, reglages, T, langue, police: POLICE_SCOLAIRE, cssPolices: cssPoliceScolaire(), polices: POLICES_PUBLIEES, mesure: mesureEstimee,
  }))
}

/** Le slug d'une fiche de `definition.fiches` dans une langue : publié tel quel pour une fiche d'une seule langue. */
function slugDeFiche(def: DefinitionExercice, f: FicheExercice, langue: string): string {
  if (f.slug && f.langues?.length === 1) return f.slug
  return `${slugFiche(def.id, f)}${suffixeLangue(langue)}`
}

function fichesExercice(module: ModuleExercice, publiees: readonly string[]): FicheSource[] {
  const def: DefinitionExercice = module.definition
  const res: FicheSource[] = []
  // les langues de contenu de l'exercice que le site publie (comme pour les affiches)
  const langues = [...new Set(LANGUES.map(l => langueContenuDe(def, l)))].filter(l => publiees.includes(l))
  const titre = texteMulti(module.textes, 'titre', def.id)
  for (const niveau of NIVEAUX.filter((n): n is Classe => !!def.niveaux[n])) {
    const niv = def.niveaux[niveau]!
    for (const langue of langues) {
      const avecBilan = def.bilanParClasse !== false
      const slugDuBilan = `${slugBilan(def.id, niveau)}${suffixeLangue(langue)}`
      const lignes: { fiche: FicheExercice | null, slug: string, ids: readonly CompetenceId[] }[] = []
      if (avecBilan) lignes.push({ fiche: null, slug: slugDuBilan, ids: niv.competences })
      for (const f of def.fiches.filter(x => x.niveau === niveau && (!x.langues || x.langues.includes(langue)))) {
        lignes.push({ fiche: f, slug: slugDeFiche(def, f, langue), ids: competencesDeFiche(def, f) })
      }
      for (const { fiche: f, slug, ids } of lignes) {
        // une fiche sans hasard (écriture) : un seul exemplaire
        const nb = def.aleatoire === false ? 1 : f ? NB_VARIANTES_COMPETENCE : NB_VARIANTES
        const competences = competencesVisees(ids)
        const libelles = competences.map(k => k.libelle).join(' ; ')
        // une fiche peut avoir ses propres textes dans le catalogue de l'exercice (`fiche.<id>.titre|court|description`) ; sinon, d'après sa compétence
        const description = texteMulti(module.textes, f ? `fiche.${f.id}.description` : 'description', libelles)
        const documents: DocumentSource[] = Array.from({ length: nb }, (_, k) => {
          const graine = graineDe(slug) + k + 1
          return {
            id: `fiche-${k + 1}`, titre: nb > 1 ? { fr: `Exemplaire ${k + 1}`, br: `Skouerenn ${k + 1}` } : null, graine: def.aleatoire === false ? null : graine,   // br: à relire
            formats: [{ format: 'A4', orientation: 'portrait', html: htmlFicheExercice(module, niveau, f?.reglages ?? {}, langue, graine) }],
          }
        })
        res.push({
          meta: {
            slug,
            titre: f ? texteMulti(module.textes, `fiche.${f.id}.titre`, `${titre.fr} — ${competences[0]?.libelle ?? f.id}`) : titre,
            titreCourt: f ? texteMulti(module.textes, `fiche.${f.id}.court`, competences[0]?.libelle ?? f.id) : titre,
            description, descriptionLongue: description,
            niveaux: [...(f?.classes ?? [niveau])], domaine: def.domaine, genre: 'exercice', langues: [langue], famille: def.id,
            confiance: confianceFiche([langue], 'exercice', def.id, slug),
            parent: f && avecBilan ? slugDuBilan : null,
            // « Personnaliser » : l'exercice réglé comme cette fiche (useReglages lit `fiche` et `niveau`)
            personnaliser: { route: def.route, requete: f ? { mode: 'imprimer', fiche: f.id, niveau } : { mode: 'imprimer' } },
            exemple: estExemple(def.domaine), competences,
            reglages: reglagesDuNiveau(def, { niveau, ...(f?.reglages ?? {}) }) as unknown as MetaFiche['reglages'],
          },
          documents,
        })
      }
    }
  }
  return res
}

/** Les fiches à produire, dans l'ordre des registres (affiches d'abord). */
export async function fichesDesRegistres({ avecExemples = false, prefixe = '', site, echantillon = false }: OptionsRegistres = {}): Promise<FicheSource[]> {
  const affiches: ModuleAffiche[] = [...AFFICHES as ModuleAffiche[]]
  // le registre ; les exemples (`exemple: true`) seulement avec `avecExemples`, jamais en production
  const exercices: ModuleExercice[] = EXERCICES.filter(e => avecExemples || !e.exemple)
  if (avecExemples) affiches.push(...(await import('../../../src/affiches/dev.ts')).EXEMPLES as ModuleAffiche[])
  const publiees = site ? languesDuSite(siteDe(site)) : LANGUES
  const fiches = [...affiches.flatMap(m => fichesAffiche(m, publiees)), ...exercices.flatMap(m => fichesExercice(m, publiees))]
  const vues = new Set<string>()
  for (const f of fiches) {
    if (vues.has(f.meta.slug)) throw new Error(`slug « ${f.meta.slug} » produit deux fois (registres)`)
    vues.add(f.meta.slug)
  }
  // une exception de confiance qui vise une fiche absente est une faute (slug changé, faute de frappe) : le build s'arrête (builds partiels exceptés)
  if (!prefixe && !echantillon) {
    for (const code of publiees.filter(estLangue)) {
      const inconnues = fichesInconnues(definitionDeLangue(code).confiance ?? {}, vues)
      if (inconnues.length) throw new Error(`Confiance (${code}) : fiche(s) inconnue(s) : ${inconnues.join(', ')}`)
    }
  }
  const gardees = fiches.filter(f => f.meta.slug.startsWith(prefixe))
  return echantillon ? echantillonner(gardees) : gardees
}
