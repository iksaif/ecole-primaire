// Mention de licence et de crédits dans les propriétés d'un PDF produit par Chrome (qui n'écrit que le titre) : Sujet, Mots-clés, Auteur.
// La licence des fiches est celle de LICENCE-CONTENU.md ; les images gardent la leur (guide d'iconographie : brouillon hors du dépôt, `brouillons/iconographie/`).
// Les crédits d'images suivent le CONTENU de la fiche : une balise d'image porte `data-image="openmoji"` ou `data-image="arasaac"` (src/images/),
// jamais un crédit figé : une fiche sans pictogramme ARASAAC ne doit pas en citer. Tant qu'aucune image n'en porte, seule la licence est écrite.
import { PDFDocument } from '@cantoo/pdf-lib'

const LICENCE = 'CC BY-NC-SA 4.0'
const CREDITS: Readonly<Record<string, string>> = {
  openmoji: 'Images : OpenMoji (CC BY-SA 4.0, openmoji.org).',
  arasaac: 'Pictogrammes : Sergio Palao, ARASAAC (arasaac.org), CC BY-NC-SA, Gouvernement d’Aragon.',
}

/** Les sources d'images que contient le HTML d'une fiche, d'après `data-image`. */
export function sourcesDImages(html: string): string[] {
  return [...new Set([...html.matchAll(/data-image="([a-z-]+)"/g)].map(m => m[1]))].filter(s => s in CREDITS).sort()
}

/** Le texte du champ Sujet : licence de la fiche, puis un crédit par source d'images présente. */
export function sujet(sources: readonly string[]): string {
  return ['Fiche à imprimer (ecoleprimaire.app, skoolik.app).', `Licence : ${LICENCE}.`, 'Textes et données sources : CC BY-SA 4.0.', ...sources.map(s => CREDITS[s])].join(' ')
}

/** Rend le PDF avec ses propriétés (titre, producteur et pages inchangés). */
export async function avecMetadonnees(octets: Uint8Array, html: string): Promise<Uint8Array> {
  const sources = sourcesDImages(html)
  // updateMetadata: false : pdf-lib ne remplace ni le producteur ni les dates de Chrome
  const pdf = await PDFDocument.load(octets, { updateMetadata: false })
  pdf.setAuthor('École Primaire · Skoolik')
  pdf.setSubject(sujet(sources))
  pdf.setKeywords([LICENCE, 'CC BY-SA 4.0', ...sources.map(s => (s === 'arasaac' ? 'ARASAAC' : 'OpenMoji'))])
  pdf.setCreator('ecoleprimaire.app')
  pdf.setProducer(`${pdf.getProducer() ?? 'Skia/PDF'} + pdf-lib`)
  // sans flux d'objets : le compte des pages de `nbPagesPdf` (rendu.ts) lit les objets /Type /Page en clair
  return pdf.save({ useObjectStreams: false })
}
