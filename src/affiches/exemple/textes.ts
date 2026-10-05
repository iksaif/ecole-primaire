// Les textes de l'affiche d'exemple, par langue de l'affiche, lus avec T(clé) (src/i18n/index.js, `contenu`). Les clés
// suivent la convention de src/affiches/textes.ts (titre, variante.<id>.court…, reglage.<cle>, valeur.<cle>.<valeur>).
// Une langue sans traduction retombe sur le français. Breton : chaque texte est à faire relire.
import type { TextesAffiche } from '../types.ts'

export const TEXTES: TextesAffiche = {
  fr: {
    titre: 'La bande numérique',
    'variante.jusqua6.court': 'Bande numérique 1 à 6',
    'variante.jusqua6.titre': 'Bande numérique de 1 à 6 à imprimer',
    'variante.jusqua6.description': 'La bande numérique de 1 à 6, une case par nombre, avec les points à compter (programme de la moyenne section).',
    'variante.jusqua10.court': 'Bande numérique 0 à 10',
    'variante.jusqua10.titre': 'Bande numérique de 0 à 10 à imprimer',
    'variante.jusqua10.description': 'La bande numérique de 0 à 10, une case par nombre, avec les points à compter (programme de la grande section).',
    'reglage.points': 'Points à compter',
    'reglage.lettres': 'Nombres en lettres',
    'valeur.points.false': 'Sans', 'valeur.points.true': 'Avec',
    'valeur.lettres.false': 'Sans', 'valeur.lettres.true': 'Avec',
  },
  br: {
    titre: 'Ar vandenn niveroù', // br: à relire
    'variante.jusqua6.court': 'Bandenn niveroù 1 da 6', // br: à relire
    'variante.jusqua6.titre': 'Bandenn niveroù eus 1 da 6 da voullañ', // br: à relire
    'variante.jusqua6.description': 'Ar vandenn niveroù eus 1 da 6, ur gael evit pep niver, gant ar pikoù da gontañ.', // br: à relire
    'variante.jusqua10.court': 'Bandenn niveroù 0 da 10', // br: à relire
    'variante.jusqua10.titre': 'Bandenn niveroù eus 0 da 10 da voullañ', // br: à relire
    'variante.jusqua10.description': 'Ar vandenn niveroù eus 0 da 10, ur gael evit pep niver, gant ar pikoù da gontañ.', // br: à relire
    'reglage.points': 'Pikoù da gontañ', // br: à relire
    'reglage.lettres': 'Niveroù e lizherennoù', // br: à relire
    'valeur.points.false': 'Hep', 'valeur.points.true': 'Gant', // br: à relire
    'valeur.lettres.false': 'Hep', 'valeur.lettres.true': 'Gant', // br: à relire
  },
}
