// Les textes de l'eau. Le breton est nouveau : à relire.
import type { TextesAffiche } from '../types.ts'

export const TEXTES: TextesAffiche = {
  fr: {
    'titre': 'L’eau',
    'variante.etats.court': 'Glace et eau',
    'variante.etats.titre': 'Affiche de l’eau : la glace fond, l’eau gèle',
    'variante.etats.description': 'La glace et l’eau liquide : la glace fond, l’eau gèle (fusion et solidification, programme du cycle 1).',
    'lot.etats': 'Fondre et geler',
    'mot.glace': 'la glace',
    'mot.eau': 'l’eau',
    'precision.glace': 'elle fond', 'precision.eau': 'elle gèle',
  },
  br: {
    'titre': 'An dour', // br: à relire
    'variante.etats.court': 'Skorn ha dour', // br: à relire
    'variante.etats.titre': 'Skritell an dour : ar skorn a dich, an dour a skorn', // br: à relire
    'variante.etats.description': 'Ar skorn hag an dour dre-dermen : ar skorn a dich, an dour a skorn.', // br: à relire
    'lot.etats': 'Teuzañ ha skorniñ', // br: à relire
    'mot.glace': 'ar skorn', // br: à relire
    'mot.eau': 'an dour', // br: à relire
    'precision.glace': 'a dich', 'precision.eau': 'a skorn', // br: à relire
  },
}
