// Les adresses de l'ancien site (production avant la base saine) qui n'existent plus : on les renvoie vers la page qui les remplace,
// avec leurs réglages quand c'est possible. L'ancien `?preset=<slug>` (le générateur réglé sur une fiche toute prête) devient :
//   - pour une affiche : `?affiche=<id>&variante=<v>&langues=…` (la variante dont le slug publié est celui-là) ;
//   - pour l'écriture : `?fiche=<id>&niveau=<classe>` (la fiche publiée de même slug, lue par useReglages).
// Les modules des affiches et de l'écriture sont chargés à la demande (garde asynchrone) : ils n'alourdissent pas la page d'accueil.
import type { LocationQuery, RouteLocationRaw } from 'vue-router'

/** Le premier texte d'un paramètre d'adresse. */
const premier = (v: LocationQuery[string]): string | undefined => {
  const x = Array.isArray(v) ? v[0] : v
  return typeof x === 'string' && x ? x : undefined
}

/** L'affiche réglée sur l'ancienne fiche `preset` (ou l'affiche seule si le slug n'est pas reconnu). */
export async function versAffiche(id: string, query: LocationQuery): Promise<RouteLocationRaw> {
  const slug = premier(query.preset)
  const base = { path: '/imprimer/affiches', query: { affiche: id } as Record<string, string> }
  if (!slug) return base
  const { REGISTRE } = await import('../affiches/index.ts')
  const { slugDe } = await import('../affiches/catalogue.ts')
  const { ensemblesDeLangues } = await import('../affiches/outils.ts')
  const d = REGISTRE.find(m => m.definition.id === id)?.definition
  if (!d) return base
  for (const variante of Object.keys(d.variantes)) {
    for (const langues of ensemblesDeLangues(d)) {
      if (slugDe(d, variante, langues) === slug) return { path: '/imprimer/affiches', query: { affiche: id, variante, langues: langues.join(',') } }
    }
  }
  return base
}

/** L'exercice d'écriture réglé sur l'ancienne fiche `preset`, en mode impression. */
export async function versEcriture(query: LocationQuery): Promise<RouteLocationRaw> {
  const slug = premier(query.preset)
  const base = { path: '/francais/ecriture', query: { mode: 'imprimer' } as Record<string, string> }
  if (!slug) return base
  const { default: definition } = await import('../exercices/ecriture/definition.ts')
  const fiche = definition.fiches.find(f => f.slug === slug)
  return fiche ? { path: '/francais/ecriture', query: { mode: 'imprimer', fiche: fiche.id, niveau: fiche.niveau } } : base
}
