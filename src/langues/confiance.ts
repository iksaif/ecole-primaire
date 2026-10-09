// Le niveau de confiance d'une traduction (breton) : de 0 (traduction automatique non vérifiée) à 4 (relue par un·e enseignant·e).
// Pur (sans Vue ni DOM) : lu par l'app (réglage, badge), par le build des fiches (index) et par les scripts. Les niveaux de chaque
// exercice et de chaque affiche sont dans src/langues/<langue>/confiance.ts ; la méthode pour les établir : docs/confiance-breton/README.md.

/** 0 à 4 : plus le nombre est grand, plus on peut faire confiance au texte. */
export type NiveauConfiance = 0 | 1 | 2 | 3 | 4

export const NIVEAUX_CONFIANCE: readonly NiveauConfiance[] = [0, 1, 2, 3, 4]

/** Les noms des niveaux, du plus sûr au moins sûr ; ils servent de clés de texte (section `confiance`). */
export const NOMS_NIVEAU = {
  4: 'enseignant',
  3: 'brittophone',
  2: 'dictionnaire',
  1: 'simple',
  0: 'automatique',
} as const satisfies Record<NiveauConfiance, string>

/** Niveau minimum montré tant que l'utilisateur n'a rien choisi : des mots et des expressions simples, chacun vérifié dans une source. */
export const NIVEAU_PAR_DEFAUT: NiveauConfiance = 2

export const estNiveauConfiance = (v: unknown): v is NiveauConfiance => typeof v === 'number' && NIVEAUX_CONFIANCE.includes(v as NiveauConfiance)

/** Une ressource qui contient du texte traduit : un exercice (`exercice:heure`) ou une affiche (`affiche:jours`). */
export type CleRessource = `${'exercice' | 'affiche'}:${string}`

/**
 * Une exception pour une fiche seule : son slug publié, avec le suffixe de langue (`fiche:affiche-mois-gs-br`). Elle l'emporte sur le niveau de sa
 * ressource : à n'écrire que si la fiche est nettement plus sûre (ou moins sûre) que le reste de la ressource.
 */
export type CleFiche = `fiche:${string}`

/** Qui a relu : sans nom, seulement le rôle (niveaux 3 et 4). */
export type RoleRelecteur = 'brittophone' | 'enseignant'

/** L'évaluation d'une ressource. */
export interface Confiance {
  niveau: NiveauConfiance
  /** date de l'évaluation (AAAA-MM-JJ) : un niveau vieux est à revoir quand le texte a changé depuis */
  le: string
  /** qui a évalué : `assistant` (un agent de code, d'après la méthode) ou `relecteur` (une personne) */
  par: 'assistant' | 'relecteur'
  /** pourquoi ce niveau, en une ou deux phrases, avec les sources consultées (obligatoire) */
  note: string
  /** niveaux 3 et 4 : le rôle de la personne qui a relu */
  relecteur?: RoleRelecteur
}

/** Les évaluations d'une langue : une entrée par ressource, et des exceptions par fiche. Une ressource absente vaut 0 (« non évaluée »). */
export type TableConfiance = Readonly<Partial<Record<CleRessource | CleFiche, Confiance>>>

export const cleRessource = (genre: 'exercice' | 'affiche', id: string): CleRessource => `${genre}:${id}`
export const cleFiche = (slug: string): CleFiche => `fiche:${slug}`

/** Le niveau d'une ressource ; 0 si elle n'a pas été évaluée. */
export function niveauDe(table: TableConfiance, cle: CleRessource): NiveauConfiance {
  return table[cle]?.niveau ?? 0
}

/** Le niveau d'une fiche : l'exception de sa fiche si elle existe, sinon le niveau de sa ressource (0 si jamais évaluée). */
export function niveauDeFiche(table: TableConfiance, ressource: CleRessource, slug: string): NiveauConfiance {
  return table[cleFiche(slug)]?.niveau ?? niveauDe(table, ressource)
}

/** Une ressource est-elle assez sûre pour le seuil choisi ? Sans seuil (`undefined`), tout est montré. */
export function assezSure(niveau: NiveauConfiance | null | undefined, seuil: number | undefined): boolean {
  if (niveau === null || niveau === undefined) return true   // pas de langue régionale dans la fiche : rien à mettre en doute
  return niveau >= (seuil ?? 0)
}

/** Les problèmes d'une table (clé inconnue, note vide, relecteur manquant ou en trop) : liste vide si tout va bien. `connues` : les clés qui existent. */
export function problemesTable(table: TableConfiance, connues: ReadonlySet<string>): string[] {
  const problemes: string[] = []
  for (const [cle, c] of Object.entries(table) as [CleRessource | CleFiche, Confiance][]) {
    // une exception de fiche se vérifie contre les slugs réels au build (`fichesInconnues`) : ici, seulement la forme
    if (cle.startsWith('fiche:')) { if (cle.length <= 'fiche:'.length) problemes.push(`${cle} : slug vide`) }
    else if (!connues.has(cle)) problemes.push(`${cle} : ressource inconnue`)
    if (!estNiveauConfiance(c.niveau)) problemes.push(`${cle} : niveau ${String(c.niveau)} hors de 0 à 4`)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(c.le)) problemes.push(`${cle} : date « ${c.le} » (AAAA-MM-JJ attendu)`)
    if (!c.note.trim()) problemes.push(`${cle} : la note est obligatoire (pourquoi ce niveau ?)`)
    const relu = c.niveau >= 3
    if (relu && !c.relecteur) problemes.push(`${cle} : niveau ${c.niveau} sans relecteur`)
    if (!relu && c.relecteur) problemes.push(`${cle} : un relecteur n'a de sens qu'à partir du niveau 3`)
    if (relu && c.par !== 'relecteur') problemes.push(`${cle} : niveau ${c.niveau} évalué « par ${c.par} » (une relecture est faite par un relecteur)`)
    if (c.niveau === 4 && c.relecteur !== 'enseignant') problemes.push(`${cle} : le niveau 4 est relu par un·e enseignant·e`)
  }
  return problemes
}

/** Les exceptions de fiche d'une table qui ne correspondent à aucune fiche publiée : à corriger (un slug a changé, une faute de frappe). */
export function fichesInconnues(table: TableConfiance, slugs: ReadonlySet<string>): string[] {
  return Object.keys(table).filter(k => k.startsWith('fiche:') && !slugs.has(k.slice('fiche:'.length)))
}
