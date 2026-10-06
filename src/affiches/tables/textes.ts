// Les textes des affiches des tables, par langue de l'affiche, lus avec T(clé) (`traducteurAffiche`, src/affiches/textes.ts).
//   titre : le nom de l'affiche (carte du catalogue) ; titre.multiplication|addition : le titre écrit sur la feuille ;
//   table : le titre d'un bloc (« Table de 7 ») ; variante.<id>.court|titre|description : la convention des affiches ;
//   reglage.tables : le choix des tables à montrer.
// Breton : chaque texte est à faire relire.
import type { TextesAffiche } from '../types.ts'

export const TEXTES: TextesAffiche = {
  fr: {
    titre: 'Affiches des tables',
    'titre.multiplication': 'Les tables de multiplication',
    'titre.addition': "Les tables d'addition",
    table: 'Table de {t}',
    'reglage.tables': 'Tables à afficher',
    'valeur.tables.1': '1', 'valeur.tables.2': '2', 'valeur.tables.3': '3', 'valeur.tables.4': '4', 'valeur.tables.5': '5', 'valeur.tables.6': '6', 'valeur.tables.7': '7', 'valeur.tables.8': '8', 'valeur.tables.9': '9', 'valeur.tables.10': '10',
    'variante.multiplication-a4.court': 'Affiche tables × (A4)',
    'variante.multiplication-a4.titre': 'Affiche des tables de multiplication de 1 à 10 (A4)',
    'variante.multiplication-a4.description': 'Affiche gratuite des tables de multiplication de 1 à 10 sur une page A4, en couleurs, à afficher ou coller dans le cahier. À imprimer en PDF.',
    'variante.multiplication-a3.court': 'Affiche tables × (A3)',
    'variante.multiplication-a3.titre': 'Affiche des tables de multiplication pour la classe (A3)',
    'variante.multiplication-a3.description': 'Grande affiche A3 des tables de multiplication de 1 à 10 pour le mur de la classe, en couleurs. Gratuite à imprimer en PDF.',
    'variante.multiplication-une-par-page.court': 'Une table × par page',
    'variante.multiplication-une-par-page.titre': 'Les tables de multiplication : une grande affiche par table',
    'variante.multiplication-une-par-page.description': 'Dix affiches A4, une par table de multiplication (de 1 à 10), en gros caractères pour la classe ou la chambre. PDF gratuit.',
    'variante.pythagore.court': 'Table de Pythagore',
    'variante.pythagore.titre': 'Table de Pythagore : tableau des multiplications de 1 à 10',
    'variante.pythagore.description': 'Tableau à double entrée des multiplications de 1 × 1 à 10 × 10 (table de Pythagore), les carrés en couleur. Affiche gratuite à imprimer.',
    'variante.addition.court': "Affiche tables d'addition",
    'variante.addition.titre': "Affiche des tables d'addition de 1 à 10",
    'variante.addition.description': "Affiche gratuite des tables d'addition de 1 à 10 (de 1 + 1 à 10 + 10) en couleurs, pour apprendre les résultats par cœur au CP et au CE1.",
    'variante.addition-tableau.court': 'Tableau des additions',
    'variante.addition-tableau.titre': 'Tableau à double entrée des additions de 0 à 10',
    'variante.addition-tableau.description': 'Tableau des additions de 0 + 0 à 10 + 10, doubles en couleur : un outil mémo pour le CP et le CE1. Gratuit à imprimer.',
  },
  br: {
    titre: 'Skritelloù an taolennoù', // br: à relire
    'titre.multiplication': 'An taolennoù liesañ', // br: à relire
    'titre.addition': 'An taolennoù sammañ', // br: à relire
    table: 'Taolenn {t}', // br: à relire
    'reglage.tables': 'Taolennoù da ziskouez', // br: à relire
    'valeur.tables.1': '1', 'valeur.tables.2': '2', 'valeur.tables.3': '3', 'valeur.tables.4': '4', 'valeur.tables.5': '5', 'valeur.tables.6': '6', 'valeur.tables.7': '7', 'valeur.tables.8': '8', 'valeur.tables.9': '9', 'valeur.tables.10': '10',
    'variante.multiplication-a4.court': 'Skritell taolennoù × (A4)', // br: à relire
    'variante.multiplication-a4.titre': 'Skritell an taolennoù liesañ 1 betek 10 (A4)', // br: à relire
    'variante.multiplication-a4.description': 'Skritell an taolennoù liesañ — affiche des tables de multiplication de 1 à 10 en breton, A4 e liv. PDF digoust da voullañ.', // br: à relire
    'variante.multiplication-a3.court': 'Skritell taolennoù × (A3)', // br: à relire
    'variante.multiplication-a3.titre': "Skritell an taolennoù liesañ evit ar c'hlas (A3)", // br: à relire
    'variante.multiplication-a3.description': 'Skritell vras an taolennoù liesañ — grande affiche A3 des tables de multiplication en breton pour la classe. PDF digoust.', // br: à relire
    'variante.multiplication-une-par-page.court': 'Un daolenn × dre bajenn', // br: à relire
    'variante.multiplication-une-par-page.titre': 'An taolennoù liesañ : ur skritell vras evit pep taolenn', // br: à relire
    'variante.multiplication-une-par-page.description': 'Dek skritell A4, unan evit pep taolenn liesañ — une affiche par table de multiplication, en breton. PDF digoust.', // br: à relire
    'variante.pythagore.court': 'Taolenn Pitagor', // br: à relire
    'variante.pythagore.titre': 'Taolenn Pitagor : taolenn al liesadennoù 1 betek 10', // br: à relire
    'variante.pythagore.description': 'Taolenn Pitagor — table de Pythagore (multiplications de 1 × 1 à 10 × 10) pour les classes bilingues breton. Skritell digoust da voullañ.', // br: à relire
    'variante.addition.court': 'Skritell taolennoù sammañ', // br: à relire
    'variante.addition.titre': 'Skritell an taolennoù sammañ 1 betek 10', // br: à relire
    'variante.addition.description': "Skritell an taolennoù sammañ — affiche des tables d'addition de 1 à 10 en breton, e liv. CP, CE1.", // br: à relire
    'variante.addition-tableau.court': 'Taolenn ar sammadennoù', // br: à relire
    'variante.addition-tableau.titre': 'Taolenn daou-zor ar sammadennoù 0 betek 10', // br: à relire
    'variante.addition-tableau.description': 'Taolenn ar sammadennoù — tableau des additions de 0 + 0 à 10 + 10 en breton, an doubl e liv. CP, CE1.', // br: à relire
  },
}
