// Compteur des emojis du système (« max » : il ne peut que baisser) :
//   emojisSysteme    emojis écrits en caractères (🍎, ⭐…) dans les .ts et .vue de src/, hors src/images/ : chacun s'affiche avec la
//                    police de l'appareil (rendu différent d'un appareil à l'autre, et dans le PDF du build). Ils passent un à un par
//                    le socle src/images/ (rendu OpenMoji, préférence « Images ») : brouillons/iconographie/ETAPES.md, objectif 0.
//                    Le JavaScript de l'ancien monde n'est pas compté : il garde ses emojis jusqu'à son report.
import { compter, lire } from '../../lib/fichiers.ts'
import type { Compteur } from './compteur.ts'
import { fichiersDe } from './sources.ts'

/** Un emoji : un pictogramme (Extended_Pictographic), avec ses éventuels sélecteur FE0F et liaisons (🐈‍⬛ compte pour un). */
const EMOJI = /\p{Extended_Pictographic}️?(?:‍\p{Extended_Pictographic}️?)*/gu

/** Le code typé de src/, hors du socle des images (ses tables nomment les emojis par leur code, pas par leur caractère). */
const codeTypeHorsImages = (): string[] =>
  fichiersDe('src').filter(f => (f.endsWith('.ts') || f.endsWith('.vue')) && !f.startsWith('src/images/'))

export const compteursImages: Record<string, Compteur> = {
  emojisSysteme: () => {
    const parDossier = new Map<string, number>()
    for (const fichier of codeTypeHorsImages()) {
      const n = compter(lire(fichier), EMOJI)
      if (!n) continue
      const dossier = fichier.split('/').slice(0, 2).join('/')
      parDossier.set(dossier, (parDossier.get(dossier) ?? 0) + n)
    }
    const valeur = [...parDossier.values()].reduce((a, b) => a + b, 0)
    const plusGros = [...parDossier.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([d, n]) => `${d} ${n}`).join(', ')
    return { valeur, detail: plusGros }
  },
}
