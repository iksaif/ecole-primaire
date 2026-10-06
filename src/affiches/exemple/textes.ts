// Les textes de l'affiche d'exemple, par langue de l'affiche, lus avec T(clé) (`traducteurAffiche`, src/affiches/textes.ts). Les clés
// suivent la convention de src/affiches/textes.ts (titre, variante.<id>.court…, reglage.<cle>, valeur.<cle>.<valeur>,
// groupe.<id>, aide.<cle>). Les variantes sont calculées : leurs textes aussi. Une langue sans traduction retombe sur le
// français. Breton : chaque texte est à faire relire.
import type { TextesAffiche } from '../types.ts'
import { BANDES } from './definition.ts'

// Les textes des variantes : une bande, avec ou sans la page à compléter
const variantes = (bande: (b: (typeof BANDES)[number]) => string, titre: (b: (typeof BANDES)[number]) => string, description: (b: (typeof BANDES)[number]) => string, completer: string): Record<string, string> =>
  Object.fromEntries(BANDES.flatMap(b => [false, true].flatMap(c => {
    const id = c ? `${b.id}-completer` : b.id
    return [[`variante.${id}.court`, bande(b) + (c ? completer : '')], [`variante.${id}.titre`, titre(b) + (c ? completer : '')], [`variante.${id}.description`, description(b) + (c ? completer : '')]]
  })))

export const TEXTES: TextesAffiche = {
  fr: {
    titre: 'La bande numérique',
    'page.completer': 'Je complète la bande',
    ...variantes(b => `Bande numérique ${b.debut} à ${b.max}`, b => `Bande numérique de ${b.debut} à ${b.max} à imprimer`,
      b => `La bande numérique de ${b.debut} à ${b.max}, une case par nombre, avec les points à compter.`, ' (avec une page à compléter)'),
    'reglage.points': 'Points à compter',
    'reglage.lettres': 'Nombres en lettres',
    'valeur.points.false': 'Sans', 'valeur.points.true': 'Avec',
    'valeur.lettres.false': 'Sans', 'valeur.lettres.true': 'Avec',
    'groupe.repere': 'Ce que montre la bande',
    'groupe.completer': 'Page à compléter',
    'aide.langues': 'Avec plusieurs langues, chaque nombre écrit en lettres l’est dans chacune.',
    'aide.graine': 'Quels nombres sont à compléter ? « Nouvelle » en tire d’autres.',
  },
  br: {
    titre: 'Ar vandenn niveroù', // br: à relire
    'page.completer': 'Klokaat a ran ar vandenn', // br: à relire
    ...variantes(b => `Bandenn niveroù ${b.debut} da ${b.max}`, b => `Bandenn niveroù eus ${b.debut} da ${b.max} da voullañ`,
      b => `Ar vandenn niveroù eus ${b.debut} da ${b.max}, ur gael evit pep niver, gant ar pikoù da gontañ.`, ' (gant ur bajenn da glokaat)'), // br: à relire
    'reglage.points': 'Pikoù da gontañ', // br: à relire
    'reglage.lettres': 'Niveroù e lizherennoù', // br: à relire
    'valeur.points.false': 'Hep', 'valeur.points.true': 'Gant', // br: à relire
    'valeur.lettres.false': 'Hep', 'valeur.lettres.true': 'Gant', // br: à relire
    'groupe.repere': 'Ar pezh a ziskouez ar vandenn', // br: à relire
    'groupe.completer': 'Pajenn da glokaat', // br: à relire
    'aide.langues': 'Gant meur a yezh e vez skrivet pep niver en pep hini anezho.', // br: à relire
    'aide.graine': 'Peseurt niveroù da glokaat ? « Unan nevez » a zibab re all.', // br: à relire
  },
}
