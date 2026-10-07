// Les textes de l'affiche des nombres, par langue de l'affiche, lus avec T(clé) (`traducteurAffiche`, src/affiches/textes.ts) :
// titre, section.<id> (titre d'une page), section.deA (« De {de} à {a} »), variante.<id>.*, et les libellés du formulaire.
// Le nom des nombres en lettres vient des langues (src/langues/<langue>/nombres.ts : vérifiés), pas d'ici. Breton : à relire.
import type { TextesAffiche } from '../types.ts'

export const TEXTES: TextesAffiche = {
  fr: {
    'titre': 'Les nombres en lettres',
    'titre.fiche': 'Les nombres',
    'section.deA': 'De {de} à {a}',
    'section.unites': 'Les unités',
    'section.dizaines': 'Les dizaines',
    'section.centaines': 'Les centaines',
    'section.milliers': 'Les milliers',
    'section.cent': 'Les nombres de 0 à 100',
    'variante.unites.court': 'Unités (0 à 9)',
    'variante.unites.titre': 'Les nombres de 0 à 9 en lettres',
    'variante.unites.description': 'Affiche des unités : les nombres de 0 à 9 en chiffres, en lettres et en points, en français, en breton (brezhoneg : unan, daou, tri… nav) ou les deux. Une petite série facile à lire au mur.',
    'variante.dizaines.court': 'Dizaines (10 à 100)',
    'variante.dizaines.titre': 'Les dizaines en lettres, de 10 à 100',
    'variante.dizaines.description': 'Affiche des dizaines : 10, 20, 30… 100 en chiffres, en lettres et en barres de dix, en français, en breton (brezhoneg, qui compte par vingt : ugent, daou-ugent, tri-ugent, pevar-ugent) ou les deux.',
    'variante.cent.court': 'Français de 0 à 100',
    'variante.cent.titre': 'Les nombres en lettres de 0 à 100 (orthographe rectifiée)',
    'variante.cent.description': 'Tableau des nombres de 0 à 100 écrits en chiffres et en lettres, avec l\'orthographe rectifiée de 1990 utilisée à l\'école en français (vingt-et-un, quatre-vingts…), et en breton (brezhoneg : unan, daou, tri… ugent, tregont, hanter-kant, pevar-ugent, kant). Gratuit, à imprimer.',
    'variante.unites-milliers.court': 'Unités, dizaines, centaines',
    'variante.unites-milliers.titre': 'Affiches des nombres : unités, dizaines, centaines, milliers',
    'variante.unites-milliers.description': 'Cinq affiches : les unités, de 10 à 20, les dizaines, les centaines et les milliers, en chiffres et en lettres, avec points, barres de dix et plaques de cent (en français, en breton, ou les deux).',
    'variante.dizaine-1.court': 'De 10 à 20',
    'variante.dizaine-1.titre': 'Les nombres de 10 à 20 en lettres',
    'variante.dizaine-1.description': 'Affiche : les nombres de 10 à 20 écrits en chiffres et en lettres, en français, en breton (brezhoneg) ou les deux. Pour l\'école bilingue ou Diwan.',
    'variante.dizaine-2.court': 'De 20 à 30',
    'variante.dizaine-2.titre': 'Les nombres de 20 à 30 en lettres',
    'variante.dizaine-2.description': 'Affiche : les nombres de 20 à 30 écrits en chiffres et en lettres, en français, en breton (brezhoneg) ou les deux. Pour l\'école bilingue ou Diwan.',
    'variante.dizaine-3.court': 'De 30 à 40',
    'variante.dizaine-3.titre': 'Les nombres de 30 à 40 en lettres',
    'variante.dizaine-3.description': 'Affiche : les nombres de 30 à 40 écrits en chiffres et en lettres, en français, en breton (brezhoneg) ou les deux. Pour l\'école bilingue ou Diwan.',
    'variante.dizaine-4.court': 'De 40 à 50',
    'variante.dizaine-4.titre': 'Les nombres de 40 à 50 en lettres',
    'variante.dizaine-4.description': 'Affiche : les nombres de 40 à 50 écrits en chiffres et en lettres, en français, en breton (brezhoneg) ou les deux. Pour l\'école bilingue ou Diwan.',
    'variante.dizaine-5.court': 'De 50 à 60',
    'variante.dizaine-5.titre': 'Les nombres de 50 à 60 en lettres',
    'variante.dizaine-5.description': 'Affiche : les nombres de 50 à 60 écrits en chiffres et en lettres, en français, en breton (brezhoneg) ou les deux. Pour l\'école bilingue ou Diwan.',
    'variante.dizaine-6.court': 'De 60 à 70',
    'variante.dizaine-6.titre': 'Les nombres de 60 à 70 en lettres',
    'variante.dizaine-6.description': 'Affiche : les nombres de 60 à 70 écrits en chiffres et en lettres, en français, en breton (brezhoneg) ou les deux. Pour l\'école bilingue ou Diwan.',
    'variante.dizaine-7.court': 'De 70 à 80',
    'variante.dizaine-7.titre': 'Les nombres de 70 à 80 en lettres',
    'variante.dizaine-7.description': 'Affiche : les nombres de 70 à 80 écrits en chiffres et en lettres, en français, en breton (brezhoneg) ou les deux. Pour l\'école bilingue ou Diwan.',
    'variante.dizaine-8.court': 'De 80 à 90',
    'variante.dizaine-8.titre': 'Les nombres de 80 à 90 en lettres',
    'variante.dizaine-8.description': 'Affiche : les nombres de 80 à 90 écrits en chiffres et en lettres, en français, en breton (brezhoneg) ou les deux. Pour l\'école bilingue ou Diwan.',
    'variante.dizaine-9.court': 'De 90 à 100',
    'variante.dizaine-9.titre': 'Les nombres de 90 à 100 en lettres',
    'variante.dizaine-9.description': 'Affiche : les nombres de 90 à 100 écrits en chiffres et en lettres, en français, en breton (brezhoneg) ou les deux. Pour l\'école bilingue ou Diwan.',
    'groupe.contenu': 'Les nombres',
    'groupe.miseEnPage': 'Présentation',
    'reglage.sections': 'À afficher',
    'reglage.de': 'De',
    'reglage.a': 'À',
    'reglage.pas': 'De … en …',
    'reglage.miseEnPage': 'Mise en page',
    'reglage.representation': 'Représentation (points, barres, plaques)',
    'reglage.rectifiee': 'Orthographe rectifiée (français)',
    'valeur.sections.unites': 'Unités (0 → 9)',
    'valeur.sections.onze': '10 → 20',
    'valeur.sections.dizaines': 'Dizaines (10 → 100)',
    'valeur.sections.centaines': 'Centaines (100 → 1000)',
    'valeur.sections.milliers': 'Milliers (1000 → 9000)',
    'valeur.sections.cent': 'Tableau de 0 à 100',
    'valeur.sections.perso': 'Personnalisé…',
    'valeur.sections.d1': '10 → 20',
    'valeur.sections.d2': '20 → 30',
    'valeur.sections.d3': '30 → 40',
    'valeur.sections.d4': '40 → 50',
    'valeur.sections.d5': '50 → 60',
    'valeur.sections.d6': '60 → 70',
    'valeur.sections.d7': '70 → 80',
    'valeur.sections.d8': '80 → 90',
    'valeur.sections.d9': '90 → 100',
    'valeur.miseEnPage.affiches': 'Une affiche par section',
    'valeur.miseEnPage.fiche': 'Une seule feuille',
    'valeur.representation.true': 'Avec',
    'valeur.representation.false': 'Sans',
    'valeur.rectifiee.true': 'Oui',
    'valeur.rectifiee.false': 'Non (traditionnelle)',
  },
  br: {
    'titre': 'An niveroù e lizherennoù', // br: à relire
    'titre.fiche': 'An niveroù', // br: à relire
    'section.deA': 'Eus {de} da {a}', // br: à relire
    'section.unites': 'Unanennoù', // br: à relire
    'section.dizaines': 'Degadoù', // br: à relire
    'section.centaines': 'Kantadoù', // br: à relire
    'section.milliers': 'Miliadoù', // br: à relire
    'section.cent': 'An niveroù eus 0 da 100', // br: à relire
    'variante.unites.court': 'Unanennoù (0 da 9)', // br: à relire
    'variante.unites.titre': 'An niveroù eus 0 da 9 e lizherennoù', // br: à relire
    'variante.unites.description': 'Skritell an unanennoù : an niveroù eus 0 da 9 e sifroù, e lizherennoù hag e poentoù, e galleg, e brezhoneg pe an daou. Ur steudad vihan aes da lenn war ar voger.', // br: à relire
    'variante.dizaines.court': 'Degadoù (10 da 100)', // br: à relire
    'variante.dizaines.titre': 'An degadoù e lizherennoù, eus 10 da 100', // br: à relire
    'variante.dizaines.description': 'Skritell an degadoù : 10, 20, 30… 100 e sifroù, e lizherennoù hag e barrennoù dek, e galleg, e brezhoneg (a gont dre ugent : ugent, daou-ugent, tri-ugent, pevar-ugent) pe an daou.', // br: à relire
    'variante.cent.court': 'Tableau de 0 à 100', // br: à relire
    'variante.cent.titre': 'Les nombres de 0 à 100 en lettres', // br: à relire
    'variante.cent.description': 'Taolenn an niveroù eus 0 da 100 skrivet e sifroù hag e lizherennoù, e galleg (reizhskrivadur reizhet 1990) hag e brezhoneg. Digoust, da voullañ.', // br: à relire
    'variante.unites-milliers.court': 'Unanennoù, degadoù, kantadoù', // br: à relire
    'variante.unites-milliers.titre': 'Skritelloù an niveroù : unanennoù, degadoù, kantadoù, miliadoù', // br: à relire
    'variante.unites-milliers.description': 'Pemp skritell : an unanennoù, eus 10 da 20, an degadoù, ar c’hantadoù hag ar miliadoù, e sifroù hag e lizherennoù, gant kubioù, barrennoù ha plakennoù (e galleg, e brezhoneg, pe an daou).', // br: à relire
    'variante.dizaine-1.court': 'Eus 10 da 20', // br: à relire
    'variante.dizaine-1.titre': 'An niveroù eus 10 da 20 e lizherennoù', // br: à relire
    'variante.dizaine-1.description': 'Skritell : an niveroù eus 10 da 20 skrivet e sifroù hag e lizherennoù, e galleg, e brezhoneg pe an daou. Evit ar skol divyezhek pe Diwan.', // br: à relire
    'variante.dizaine-2.court': 'Eus 20 da 30', // br: à relire
    'variante.dizaine-2.titre': 'An niveroù eus 20 da 30 e lizherennoù', // br: à relire
    'variante.dizaine-2.description': 'Skritell : an niveroù eus 20 da 30 skrivet e sifroù hag e lizherennoù, e galleg, e brezhoneg pe an daou. Evit ar skol divyezhek pe Diwan.', // br: à relire
    'variante.dizaine-3.court': 'Eus 30 da 40', // br: à relire
    'variante.dizaine-3.titre': 'An niveroù eus 30 da 40 e lizherennoù', // br: à relire
    'variante.dizaine-3.description': 'Skritell : an niveroù eus 30 da 40 skrivet e sifroù hag e lizherennoù, e galleg, e brezhoneg pe an daou. Evit ar skol divyezhek pe Diwan.', // br: à relire
    'variante.dizaine-4.court': 'Eus 40 da 50', // br: à relire
    'variante.dizaine-4.titre': 'An niveroù eus 40 da 50 e lizherennoù', // br: à relire
    'variante.dizaine-4.description': 'Skritell : an niveroù eus 40 da 50 skrivet e sifroù hag e lizherennoù, e galleg, e brezhoneg pe an daou. Evit ar skol divyezhek pe Diwan.', // br: à relire
    'variante.dizaine-5.court': 'Eus 50 da 60', // br: à relire
    'variante.dizaine-5.titre': 'An niveroù eus 50 da 60 e lizherennoù', // br: à relire
    'variante.dizaine-5.description': 'Skritell : an niveroù eus 50 da 60 skrivet e sifroù hag e lizherennoù, e galleg, e brezhoneg pe an daou. Evit ar skol divyezhek pe Diwan.', // br: à relire
    'variante.dizaine-6.court': 'Eus 60 da 70', // br: à relire
    'variante.dizaine-6.titre': 'An niveroù eus 60 da 70 e lizherennoù', // br: à relire
    'variante.dizaine-6.description': 'Skritell : an niveroù eus 60 da 70 skrivet e sifroù hag e lizherennoù, e galleg, e brezhoneg pe an daou. Evit ar skol divyezhek pe Diwan.', // br: à relire
    'variante.dizaine-7.court': 'Eus 70 da 80', // br: à relire
    'variante.dizaine-7.titre': 'An niveroù eus 70 da 80 e lizherennoù', // br: à relire
    'variante.dizaine-7.description': 'Skritell : an niveroù eus 70 da 80 skrivet e sifroù hag e lizherennoù, e galleg, e brezhoneg pe an daou. Evit ar skol divyezhek pe Diwan.', // br: à relire
    'variante.dizaine-8.court': 'Eus 80 da 90', // br: à relire
    'variante.dizaine-8.titre': 'An niveroù eus 80 da 90 e lizherennoù', // br: à relire
    'variante.dizaine-8.description': 'Skritell : an niveroù eus 80 da 90 skrivet e sifroù hag e lizherennoù, e galleg, e brezhoneg pe an daou. Evit ar skol divyezhek pe Diwan.', // br: à relire
    'variante.dizaine-9.court': 'Eus 90 da 100', // br: à relire
    'variante.dizaine-9.titre': 'An niveroù eus 90 da 100 e lizherennoù', // br: à relire
    'variante.dizaine-9.description': 'Skritell : an niveroù eus 90 da 100 skrivet e sifroù hag e lizherennoù, e galleg, e brezhoneg pe an daou. Evit ar skol divyezhek pe Diwan.', // br: à relire
    'groupe.contenu': 'An niveroù', // br: à relire
    'groupe.miseEnPage': 'Neuz', // br: à relire
    'reglage.sections': 'Da ziskouez', // br: à relire
    'reglage.de': 'Eus', // br: à relire
    'reglage.a': 'Da', // br: à relire
    'reglage.pas': 'Eus … e …', // br: à relire
    'reglage.miseEnPage': 'Lakaat e pajenn', // br: à relire
    'reglage.representation': 'Skeudenn (kubioù, barrennoù, plakennoù)', // br: à relire
    'reglage.rectifiee': 'Reizhskrivadur reizhet (galleg)', // br: à relire
    'valeur.sections.unites': 'Unanennoù (0 → 9)', // br: à relire
    'valeur.sections.onze': '10 → 20', // br: à relire
    'valeur.sections.dizaines': 'Degadoù (10 → 100)', // br: à relire
    'valeur.sections.centaines': 'Kantadoù (100 → 1000)', // br: à relire
    'valeur.sections.milliers': 'Miliadoù (1000 → 9000)', // br: à relire
    'valeur.sections.cent': 'Taolenn eus 0 da 100', // br: à relire
    'valeur.sections.perso': 'Diouzh da zibab…', // br: à relire
    'valeur.sections.d1': '10 → 20', // br: à relire
    'valeur.sections.d2': '20 → 30', // br: à relire
    'valeur.sections.d3': '30 → 40', // br: à relire
    'valeur.sections.d4': '40 → 50', // br: à relire
    'valeur.sections.d5': '50 → 60', // br: à relire
    'valeur.sections.d6': '60 → 70', // br: à relire
    'valeur.sections.d7': '70 → 80', // br: à relire
    'valeur.sections.d8': '80 → 90', // br: à relire
    'valeur.sections.d9': '90 → 100', // br: à relire
    'valeur.miseEnPage.affiches': 'Ur skritell dre rann', // br: à relire
    'valeur.miseEnPage.fiche': 'Ur follenn hepken', // br: à relire
    'valeur.representation.true': 'Gant', // br: à relire
    'valeur.representation.false': 'Hep', // br: à relire
    'valeur.rectifiee.true': 'Ya', // br: à relire
    'valeur.rectifiee.false': 'Ne (hengounel)', // br: à relire
  },
}
