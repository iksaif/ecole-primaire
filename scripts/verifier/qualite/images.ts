// Compteur des emojis du système (« max » : il ne peut que baisser) :
//   emojisSysteme    emojis écrits en caractères (🍎, ⭐…) dans les .ts et .vue de src/, hors src/images/ : chacun s'affiche avec la
//                    police de l'appareil (rendu différent d'un appareil à l'autre, et dans le PDF du build). Ils passent un à un par
//                    le socle src/images/ (rendu OpenMoji, préférence « Images ») : brouillons/iconographie/ETAPES.md, objectif 0.
//                    Le JavaScript de l'ancien monde n'est pas compté : il garde ses emojis jusqu'à son report.
import { compter, lire } from '../../lib/fichiers.ts'
import type { Compteur } from './compteur.ts'
import { fichiersDe } from './sources.ts'

/**
 * Un emoji tel qu'il s'affiche : un caractère emoji par défaut (Emoji_Presentation : 🍎), ou un pictogramme suivi du sélecteur FE0F
 * (☀️), avec ses liaisons (🐈‍⬛ compte pour un). Pas `\p{Extended_Pictographic}` seul : ses données changent avec la version d'Unicode
 * de Node (★ et ☰ en font partie sous Node 22, plus sous Node 26) et le compte local différait de celui de la CI ; ces caractères
 * s'affichent d'ailleurs comme du texte. Vérifié le 2026-10-11 : même compte, caractère par caractère, sous Node 22.18 et 26.
 */
const EMOJI = /(?:\p{Emoji_Presentation}|\p{Extended_Pictographic}\uFE0F)(?:\u200D(?:\p{Emoji_Presentation}|\p{Extended_Pictographic}\uFE0F?))*/gu

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
