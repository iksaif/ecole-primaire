// Gabarit de la page statique d'une fiche (`telechargements/<slug>/index.html`) : balises de tête propres (titre, description,
// canonical absolu, hreflang des entrées soeurs, Open Graph et Twitter avec la miniature, JSON-LD) et contenu lisible sans
// JavaScript. Titre, description, niveaux et compétences viennent du JSON de l'entrée ; les libellés, des textes typés
// (section `statique`) dans la langue de la fiche. L'app se charge par-dessus (modele.ts).
import { contenu } from '../../src/langues/traduire.ts'
import { LANGUES } from '../../src/langues/registre.ts'
import type { Langue } from '../../src/langues/registre.ts'
import { NIVEAUX } from '../../src/data/classes.ts'
import { etiquetteClasses, langueDuTexte, texteDe } from '../../src/telechargements/recherche.ts'
import type { Entree } from '../../src/telechargements/types.ts'
import { DOSSIER_FICHES } from '../../src/telechargements/types.ts'
import { absolue, adresseFiche, alternativesDe, langueDePage, siteDeReference } from './adresses.ts'
import { echapper, jsonSur, meta, propriete } from './html.ts'
import { jsonLdFiche } from './jsonld.ts'
import { habiller, STYLE_STATIQUE } from './modele.ts'
import type { ContexteStatique, PageStatique } from './types.ts'

/** Lien vers une route de l'app (« /maths/heure » ou « maths/heure »), avec sa requête. */
export function lienApp(base: string, route: string, requete: Readonly<Record<string, string>> = {}): string {
  const q = new URLSearchParams(requete).toString()
  return `${base}${route.replace(/^[#/]+/, '')}${q ? `?${q}` : ''}`
}

const kilo = (octets: number): number => Math.max(1, Math.round(octets / 1024))

function tete(ctx: ContexteStatique, e: Entree, langue: Langue, canonique: string, titre: string, description: string): string {
  const { t } = contenu(langue)
  const site = ctx.site
  const image = `${site.url}${DOSSIER_FICHES}/${e.miniature.chemin}`
  const alternates = alternativesDe(e.slug, ctx.index.entrees, site).map(a => `<link rel="alternate" hreflang="${a.hreflang}" href="${echapper(a.href)}">`)
  const ld = jsonLdFiche({ entree: e, index: ctx.index, langue, site, url: canonique, image, fichiers: c => `${site.url}${DOSSIER_FICHES}/${c}`, date: ctx.date })
  return [
    `<title>${echapper(`${titre} — ${site.nom}`)}</title>`,
    meta('description', description),
    `<link rel="canonical" href="${echapper(canonique)}">`,
    ...alternates,
    propriete('og:type', 'article'), propriete('og:site_name', site.nom), propriete('og:title', titre), propriete('og:description', description),
    propriete('og:url', canonique), propriete('og:locale', LANGUES[langue].bcp47.replace('-', '_')),
    propriete('og:image', image), propriete('og:image:width', e.miniature.largeur), propriete('og:image:height', e.miniature.hauteur),
    propriete('og:image:alt', t('statique.apercu')),
    meta('twitter:card', 'summary_large_image'), meta('twitter:title', titre), meta('twitter:description', description), meta('twitter:image', image),
    `<script type="application/ld+json">${jsonSur(ld)}</script>`,
    STYLE_STATIQUE,
  ].join('\n    ')
}

function corps(ctx: ContexteStatique, e: Entree, langue: Langue, titre: string): string {
  const { t } = contenu(langue)
  const { base } = ctx
  const fiches = (c: string): string => `${base}${DOSSIER_FICHES}/${c}`
  const domaine = ctx.index.filtres.domaines.find(d => d.id === e.domaine)
  const attrLang = (texte: { fr: string } & Record<string, string>): string => (langueDuTexte(texte, langue) === langue ? '' : ` lang="${langueDuTexte(texte, langue)}"`)
  const description = texteDe(e.description, langue)
  const longue = texteDe(e.descriptionLongue, langue)
  const premiere = e.variantes[0]

  const fil = `<nav aria-label="${echapper(t('statique.filAriane'))}"><ol class="fil">
      <li><a href="${echapper(base)}">${echapper(t('statique.accueil'))}</a></li>
      <li><a href="${echapper(`${base}telechargements/`)}">${echapper(t('statique.fichesAImprimer'))}</a></li>
      <li aria-current="page">${echapper(titre)}</li></ol></nav>`
  const apercus = premiere.pages.map((p, k) =>
    `<img src="${echapper(fiches(p.chemin))}" width="${p.largeur}" height="${p.hauteur}" alt="${echapper(t('statique.apercuPage', { n: k + 1, titre }))}"${k ? ' loading="lazy"' : ''}>`).join('\n      ')
  const pdfs = e.variantes.flatMap(v => v.pdfs.map(p => {
    const nom = v.titre ? texteDe(v.titre, langue) : titre
    const detail = t('statique.pdfDetail', { titre: nom, format: p.format, taille: t('statique.taille', { n: kilo(p.taille) }) })
    return `<li><a href="${echapper(fiches(p.chemin))}">${echapper(t('statique.pdf'))} : ${echapper(detail)}</a> (${echapper(t('statique.pages', { n: p.nbPages }))})</li>`
  })).join('\n      ')
  const competences = e.competences.map(c =>
    `<li lang="fr"><a href="${echapper(`${base}competence/${c.id}`)}">${echapper(c.libelle)}</a>${c.source ? ` (<a href="${echapper(c.source.url)}" rel="noopener">${echapper(t('statique.programmeOfficiel'))}</a>)` : ''}</li>`).join('\n      ')
  const voisines = e.voisines.map(s => ctx.index.entrees.find(x => x.slug === s)).filter(x => x !== undefined)
    .map(v => `<li><a href="${echapper(`${base}${adresseFiche(v.slug)}`)}"${attrLang(v.titre)}>${echapper(texteDe(v.titre, langue))}</a></li>`).join('\n      ')
  const actions = e.personnaliser ? `<ul class="actions">
      <li><a class="principal" href="${echapper(lienApp(base, e.personnaliser.route, e.personnaliser.requete))}">${echapper(t('statique.personnaliser'))}</a></li>
      <li><a href="${echapper(lienApp(base, e.personnaliser.route, Object.fromEntries(Object.entries(e.personnaliser.requete).filter(([k]) => k !== 'mode'))))}">${echapper(t('statique.enLigne'))}</a></li>
    </ul>` : ''

  return `<main class="statique">
    ${fil}
    <h1${attrLang(e.titre)}>${echapper(titre)}</h1>
    <p${attrLang(e.description)}>${echapper(description)}</p>
    ${longue && longue !== description ? `<p${attrLang(e.descriptionLongue)}>${echapper(longue)}</p>` : ''}
    <p>${apercus}</p>
    ${actions}
    <h2>${echapper(t('statique.fiches'))}</h2>
    <ul>
      ${pdfs}
    </ul>
    <dl>
      <dt>${echapper(t('statique.classes'))}</dt><dd>${echapper(etiquetteClasses(e.niveaux, NIVEAUX))}</dd>
      ${domaine ? `<dt>${echapper(t('statique.domaine'))}</dt><dd>${echapper(texteDe(domaine.nom, langue))}</dd>` : ''}
    </dl>
    ${competences ? `<h2>${echapper(t('statique.competences'))}</h2>\n    <ul>\n      ${competences}\n    </ul>` : ''}
    ${voisines ? `<h2>${echapper(t('statique.voisines'))}</h2>\n    <ul>\n      ${voisines}\n    </ul>` : ''}
  </main>`
}

/** La page statique d'une entrée. */
export function pageFiche(ctx: ContexteStatique, e: Entree): PageStatique {
  const langue = langueDePage(e, ctx.site)
  const titre = texteDe(e.titre, langue)
  const description = texteDe(e.description, langue)
  const adresse = adresseFiche(e.slug)
  const canonique = absolue(siteDeReference(e.langues), adresse)
  const html = habiller(ctx.modele, { langue, tete: tete(ctx, e, langue, canonique, titre, description), corps: corps(ctx, e, langue, titre) })
  return { adresse, langue, canonique, titre: `${titre} — ${ctx.site.nom}`, description, html }
}
