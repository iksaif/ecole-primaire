// Les textes de l'affiche de la droite numérique, par langue de la feuille (une page par langue) : titres, légende selon la plage,
// variantes. Le nom des nombres en lettres vient des langues (vérifié). Breton : à relire.
import type { TextesAffiche } from '../types.ts'

export const TEXTES: TextesAffiche = {
  fr: {
    'titre': 'La droite numérique',
    'titre.max': 'La droite numérique de 0 à {max}',
    'aide.20': 'Je saute de 1 en 1 : chaque trait est un nombre de plus. Le trait long est la dizaine (10).',
    'aide.100': 'Chaque dizaine est un trait long. Entre deux dizaines, je compte de 1 en 1. Le trait moyen est le milieu (5).',
    'aide.1000': 'Chaque centaine est un trait long, chaque dizaine un petit trait. Entre 0 et 1 000, il y a 10 centaines.',
    'variante.de-0-a-20.court': 'Droite numérique 0–20',
    'variante.de-0-a-20.titre': 'Droite numérique de 0 à 20 à imprimer',
    'variante.de-0-a-20.description': 'Affiche de la droite numérique graduée de 0 à 20, avec le nom de chaque nombre en lettres. Pour repérer, comparer et ranger les nombres (programme de cycle 2).',
    'variante.de-0-a-100.court': 'Droite numérique 0–100',
    'variante.de-0-a-100.titre': 'Droite numérique de 0 à 100 à imprimer',
    'variante.de-0-a-100.description': 'Affiche de la droite numérique graduée de 0 à 100, avec le nom de chaque dizaine en lettres. Pour repérer, comparer et ranger les nombres (programme de cycle 2).',
    'variante.de-0-a-1000.court': 'Droite numérique 0–1 000',
    'variante.de-0-a-1000.titre': 'Droite numérique de 0 à 1 000 à imprimer',
    'variante.de-0-a-1000.description': 'Affiche de la droite numérique graduée de 0 à 1 000, avec le nom de chaque centaine en lettres. Pour repérer, comparer et ranger les nombres (programme de cycle 2).',
  },
  br: {
    'titre': 'Al linenn niveroù', // br: à relire
    'titre.max': 'Al linenn niveroù eus 0 da {max}', // br: à relire
    'aide.20': 'Lammat a ran unan dre unan : pep tra a zo un niver ouzhpenn. An tra hir eo an degad (10).', // br: à relire
    'aide.100': 'Pep degad a zo un tra hir. Etre daou zegad e kontan unan dre unan. An tra krenn eo ar c’hreiz (5).', // br: à relire
    'aide.1000': 'Pep kantad a zo un tra hir, pep degad un tra bihan. Etre 0 ha 1 000 ez eus 10 kantad.', // br: à relire
    'variante.de-0-a-20.court': 'Linenn niveroù 0–20', // br: à relire
    'variante.de-0-a-20.titre': 'Linenn niveroù eus 0 da 20 da voullañ', // br: à relire
    'variante.de-0-a-20.description': 'Skritell al linenn niveroù eus 0 da 20, gant anv pep niver e lizherennoù. Evit lavaret ar plas, keñveriañ ha renkañ an niveroù (programm ar c’helc’hiad 2).', // br: à relire
    'variante.de-0-a-100.court': 'Linenn niveroù 0–100', // br: à relire
    'variante.de-0-a-100.titre': 'Linenn niveroù eus 0 da 100 da voullañ', // br: à relire
    'variante.de-0-a-100.description': 'Skritell al linenn niveroù eus 0 da 100, gant anv pep degad e lizherennoù. Evit lavaret ar plas, keñveriañ ha renkañ an niveroù (programm ar c’helc’hiad 2).', // br: à relire
    'variante.de-0-a-1000.court': 'Linenn niveroù 0–1 000', // br: à relire
    'variante.de-0-a-1000.titre': 'Linenn niveroù eus 0 da 1 000 da voullañ', // br: à relire
    'variante.de-0-a-1000.description': 'Skritell al linenn niveroù eus 0 da 1 000, gant anv pep kantad e lizherennoù. Evit lavaret ar plas, keñveriañ ha renkañ an niveroù (programm ar c’helc’hiad 2).', // br: à relire
  },
}
