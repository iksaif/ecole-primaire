// Données structurées d'une fiche : `LearningResource` (schema.org), alignée sur le programme officiel (compétences visées
// et lien du domaine). Pur : le gabarit le met dans un <script type="application/ld+json"> avec `jsonSur`.
import { contenu } from '../../src/langues/traduire.ts'
import type { Langue } from '../../src/langues/registre.ts'
import { texteDe } from '../../src/telechargements/recherche.ts'
import type { Entree, IndexFiches } from '../../src/telechargements/types.ts'
import type { Site } from '../../src/sites.ts'

export interface OptionsJsonLd {
  entree: Entree
  index: IndexFiches
  langue: Langue
  site: Site
  /** adresse absolue de la page (canonical) */
  url: string
  /** adresse absolue de l'image (miniature) et des PDF */
  image: string
  fichiers: (chemin: string) => string
  date: string
}

export function jsonLdFiche({ entree, index, langue, site, url, image, fichiers, date }: OptionsJsonLd): Record<string, unknown> {
  const { t } = contenu(langue)
  const cadre = t('statique.cadreProgramme')
  const alignements: Record<string, unknown>[] = []
  // hors programme (domaine null) : aucun alignement de domaine
  const domaine = entree.domaine === null ? undefined : index.filtres.domaines.find(d => d.id === entree.domaine)
  if (domaine) {
    const lien = domaine.programme.find(p => p.classes.some(c => entree.niveaux.includes(c))) ?? domaine.programme[0]
    alignements.push({
      '@type': 'AlignmentObject', alignmentType: 'educationalSubject', educationalFramework: cadre,
      targetName: texteDe(domaine.nom, langue), ...(lien ? { targetUrl: lien.url } : {}),
    })
  }
  for (const c of entree.competences) {
    alignements.push({
      '@type': 'AlignmentObject', alignmentType: 'teaches', educationalFramework: cadre,
      targetName: c.libelle, ...(c.source ? { targetUrl: c.source.url } : {}),
    })
  }
  return {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    name: texteDe(entree.titre, langue),
    description: texteDe(entree.description, langue),
    url,
    image,
    inLanguage: entree.langues,
    educationalLevel: entree.niveaux.map(n => n.toUpperCase()),
    learningResourceType: t(`statique.type.${entree.genre}`),
    isAccessibleForFree: true,
    dateModified: date,
    encoding: entree.variantes.flatMap(v => v.pdfs.map(p => ({
      '@type': 'MediaObject', contentUrl: fichiers(p.chemin), encodingFormat: 'application/pdf', contentSize: `${p.taille} B`,
    }))),
    educationalAlignment: alignements,
    publisher: { '@type': 'Organization', name: site.nom, url: site.url },
  }
}
