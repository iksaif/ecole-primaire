// Des documents à la fiche rendue : fait rendre chaque document (PDF par format, aperçus), nomme les fichiers, fait la
// miniature, et décrit la variante telle que le JSON la publie. Les fiches sont rendues en parallèle ; c'est le groupe
// d'onglets de `Rendu` qui borne le travail simultané.
import type { FichierPdf, Image, Variante } from '../../src/telechargements/types.ts'
import type { Rendu } from './rendu.ts'
import type { FichierRendu, FicheRendue, FicheSource } from './types.ts'

const LARGEUR_MINIATURE = 300

export async function produire(fiches: readonly FicheSource[], rendu: Rendu, progres: (fait: FicheRendue, nb: number) => void = () => {}): Promise<FicheRendue[]> {
  let nb = 0
  return Promise.all(fiches.map(async (source): Promise<FicheRendue> => {
    const { slug } = source.meta
    const rendus = await Promise.all(source.documents.map(d => rendu.rendre(d)))
    const fichiers: FichierRendu[] = []
    const variantes = source.documents.map((d, i): Variante => {
      const r = rendus[i]
      const plusieursSens = new Set(r.pdfs.map(p => p.orientation)).size > 1
      const pdfs = r.pdfs.map((p): FichierPdf => {
        const sens = plusieursSens ? `-${p.orientation === 'landscape' ? 'paysage' : 'portrait'}` : ''
        const chemin = `${slug}/${d.id}-${p.format.toLowerCase()}${sens}.pdf`
        fichiers.push({ chemin, octets: p.octets })
        return { chemin, format: p.format, orientation: p.orientation, taille: p.octets.length, nbPages: p.nbPages }
      })
      const pages = r.pages.map((p, k): Image => {
        const chemin = `${slug}/${d.id}-p${k + 1}.jpg`
        fichiers.push({ chemin, octets: p.octets })
        return { chemin, largeur: p.largeur, hauteur: p.hauteur }
      })
      return { id: d.id, titre: d.titre, graine: d.graine, pdfs, pages }
    })
    const premiere = rendus[0].pages[0]
    const reduite = await rendu.reduire(premiere.octets, LARGEUR_MINIATURE)
    const cheminMiniature = `${slug}/miniature.jpg`
    fichiers.push({ chemin: cheminMiniature, octets: reduite })
    const fait: FicheRendue = {
      source, variantes, fichiers,
      miniature: { chemin: cheminMiniature, largeur: LARGEUR_MINIATURE, hauteur: Math.round(premiere.hauteur * LARGEUR_MINIATURE / premiere.largeur) },
    }
    progres(fait, ++nb)
    return fait
  }))
}
