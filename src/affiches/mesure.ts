// Mesure de texte d'un dessin d'affiche, injectée (`contexte.mesure`) pour que le dessin reste pur :
//   - `mesureEstimee` : somme des largeurs tabulées (metriques.ts) des polices livrées. Aucun canvas ni DOM : lisible par node
//     (tests, build des fiches). Elle ignore le crénage et les ligatures, donc se trompe de quelques pour cent : sur les
//     phrases d'essai, au plus 0,1 % en Andika, 4 % en Luciole, 3 % en Playwrite FR Trad, 8 % en OpenDyslexic (le plus
//     irrégulier). Une police inconnue (installée sur l'ordinateur) est estimée comme Andika. Un dessin garde donc une marge
//     (5 à 10 %) quand il ajuste un texte à une largeur ; le test « rien ne sort de la zone » le vérifie sous cette mesure.
//   - `mesureNavigateur` (mesureNavigateur.ts) : le canvas, exact, dans le navigateur (aperçu et impression).
// Un document généré par node et un document généré dans le navigateur peuvent donc différer légèrement quand le dessin
// ajuste un texte à la mesure ; sans ajustement, ils sont identiques.
import { CARACTERES, LARGEURS, PROPORTIONS } from './metriques.ts'
import type { Mesure } from './types.ts'

const DEFAUT = 'Andika'
const nomDe = (police: string): string => (police in PROPORTIONS ? police : DEFAUT)

export const mesureEstimee: Mesure = {
  largeur(texte, police, gras = false) {
    const nom = nomDe(police)
    const largeurs = (gras ? LARGEURS[`${nom}:700`] : undefined) ?? LARGEURS[nom]
    // un caractère absent de la table : la largeur moyenne de la police
    const moyenne = largeurs.reduce((a, b) => a + b, 0) / largeurs.length
    let total = 0
    for (const c of texte) { const i = CARACTERES.indexOf(c); total += i < 0 ? moyenne : largeurs[i] }
    return total
  },
  metriques: police => PROPORTIONS[nomDe(police)],
}
