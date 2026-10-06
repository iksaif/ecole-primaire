// Les textes de l'affiche « Pièces et billets », par langue de l'affiche, lus avec T(clé) (`traducteurAffiche`, src/affiches/textes.ts).
//   titre, variante.<id>.court|titre|description : la convention des affiches ;
//   section.pieces|billets : les deux rangées de l'affiche ; relation.<id>.a|b : « 2 pièces de 1 € » « = 1 pièce de 2 € » ;
//   legende : la note du bas ; planche.* : la planche à découper (titre, consigne, taille).
// Breton : chaque texte est à faire relire.
import type { TextesAffiche } from '../types.ts'

export const TEXTES: TextesAffiche = {
  fr: {
    titre: "Les pièces et les billets de l'euro",
    'variante.euros.court': 'Euros',
    'variante.euros.titre': "Affiche des pièces et des billets de l'euro",
    'variante.euros.description': "Les pièces de 1 € et 2 € et les billets de 5 à 100 €, avec les échanges usuels (10 pièces de 1 € = 1 billet de 10 €).",
    'variante.centimes.court': 'Euros et centimes',
    'variante.centimes.titre': 'Affiche des pièces et billets avec les centimes',
    'variante.centimes.description': 'Toutes les pièces (de 1 centime à 2 €) et les billets, avec la relation 1 € = 100 centimes (programme du CE1).',
    'variante.planche-euros.court': 'Pièces et billets à découper',
    'variante.planche-euros.titre': "Planche de pièces et de billets en euros à découper (taille réelle)",
    'variante.planche-euros.description': "Les pièces de 1 € et 2 € et les billets de 5 à 50 €, à la taille réelle (ou réduits, pour en avoir plus par page), alignés en bandes avec les traits de coupe pour le massicot : de quoi jouer à la marchande et s'exercer à payer et à rendre la monnaie.",
    'variante.planche-centimes.court': 'Euros et centimes à découper',
    'variante.planche-centimes.titre': "Planche d'euros et de centimes à découper (taille réelle)",
    'variante.planche-centimes.description': "Toutes les pièces (de 1 centime à 2 €) et les billets de 5 à 100 €, à la taille réelle (ou réduits, pour en avoir plus par page), alignés en bandes avec les traits de coupe pour le massicot : pour jouer à la marchande avec des euros et des centimes.",
    'section.pieces': 'Les pièces',
    'section.billets': 'Les billets',
    'relation.deuxUnEuro.a': '2 pièces de 1 €', 'relation.deuxUnEuro.b': '= 1 pièce de 2 €',
    'relation.cinqDeuxEuros.a': '5 pièces de 2 €', 'relation.cinqDeuxEuros.b': '= 10 €',
    'relation.dixUnEuro.a': '10 pièces de 1 €', 'relation.dixUnEuro.b': '= 1 billet de 10 €',
    'relation.deuxDixEuros.a': '2 billets de 10 €', 'relation.deuxDixEuros.b': '= 1 billet de 20 €',
    'relation.centCentimes.a': '100 centimes', 'relation.centCentimes.b': '= 1 €',
    'relation.dixDixCentimes.a': '10 pièces de 10 c', 'relation.dixDixCentimes.b': '= 1 €',
    'relation.deuxCinquante.a': '2 pièces de 50 c', 'relation.deuxCinquante.b': '= 1 €',
    legende: 'c = centime',
    'planche.titre': 'Pièces et billets à découper',
    'planche.consigne': 'Coupe d\'abord les bandes (traits horizontaux), puis chaque bande (traits verticaux).',
    'planche.taille100': 'Taille réelle.',
    'planche.tailleReduite': 'Taille réduite : {n} % de la taille réelle.',
    'reglage.echelle': 'Taille des pièces et des billets',
    'valeur.echelle.100': '100 % (taille réelle)', 'valeur.echelle.75': '75 %', 'valeur.echelle.50': '50 %',
    'aide.echelle': 'À 100 %, pièces et billets ont leur taille réelle. Plus petits, il y en a davantage sur chaque page.',
  },
  br: {
    titre: 'Pezhioù moneiz ha bilhedoù an euro', // br: à relire
    'variante.euros.court': 'Euroioù', // br: à relire
    'variante.euros.titre': 'Skritell pezhioù moneiz ha bilhedoù an euro', // br: à relire
    'variante.euros.description': 'Ar pezhioù 1 € ha 2 € hag ar bilhedoù eus 5 da 100 €, gant ar cheñchamantoù boas (10 pezh 1 € = 1 bilhed 10 €).', // br: à relire
    'variante.centimes.court': 'Euroioù ha santimoù', // br: à relire
    'variante.centimes.titre': 'Skritell pezhioù moneiz ha bilhedoù gant ar santimoù', // br: à relire
    'variante.centimes.description': 'An holl bezhioù moneiz (eus 1 santim da 2 €) hag ar bilhedoù, gant an darempred 1 € = 100 santim (programm ar CE1).', // br: à relire
    'variante.planche-euros.court': 'Pezhioù ha bilhedoù da droc\'hañ', // br: à relire
    'variante.planche-euros.titre': 'Plañchenn pezhioù ha bilhedoù euro da droc\'hañ (ment gwir)', // br: à relire
    'variante.planche-euros.description': 'Ar pezhioù 1 € ha 2 € hag ar bilhedoù eus 5 da 50 €, e-ment gwir (pe bihanaet, evit kaout muioc\'h war pep pajenn), renket e bandennoù gant al linennoù troc\'hañ evit ar vasikot : evit c\'hoari marc\'hadourez ha deskiñ paeañ ha distreiñ ar moneiz.', // br: à relire
    'variante.planche-centimes.court': 'Euroioù ha santimoù da droc\'hañ', // br: à relire
    'variante.planche-centimes.titre': 'Plañchenn euroioù ha santimoù da droc\'hañ (ment gwir)', // br: à relire
    'variante.planche-centimes.description': 'An holl bezhioù moneiz (eus 1 santim da 2 €) hag ar bilhedoù eus 5 da 100 €, e-ment gwir (pe bihanaet, evit kaout muioc\'h war pep pajenn), renket e bandennoù gant al linennoù troc\'hañ evit ar vasikot : evit c\'hoari marc\'hadourez gant euroioù ha santimoù.', // br: à relire
    'section.pieces': 'Ar pezhioù moneiz', // br: à relire
    'section.billets': 'Ar bilhedoù', // br: à relire
    'relation.deuxUnEuro.a': '2 bezh 1 €', 'relation.deuxUnEuro.b': '= 1 pezh 2 €', // br: à relire
    'relation.cinqDeuxEuros.a': '5 pezh 2 €', 'relation.cinqDeuxEuros.b': '= 10 €', // br: à relire
    'relation.dixUnEuro.a': '10 pezh 1 €', 'relation.dixUnEuro.b': '= 1 bilhed 10 €', // br: à relire
    'relation.deuxDixEuros.a': '2 vilhed 10 €', 'relation.deuxDixEuros.b': '= 1 bilhed 20 €', // br: à relire
    'relation.centCentimes.a': '100 santim', 'relation.centCentimes.b': '= 1 €', // br: à relire
    'relation.dixDixCentimes.a': '10 pezh 10 c', 'relation.dixDixCentimes.b': '= 1 €', // br: à relire
    'relation.deuxCinquante.a': '2 bezh 50 c', 'relation.deuxCinquante.b': '= 1 €', // br: à relire
    legende: 'c = santim', // br: à relire
    'planche.titre': 'Pezhioù ha bilhedoù da droc\'hañ', // br: à relire
    'planche.consigne': 'Troc\'h an dalennoù da gentañ (linennoù a-led), goude pep talenn (linennoù a-sav).', // br: à relire
    'planche.taille100': 'Ment gwir.', // br: à relire
    'planche.tailleReduite': 'Ment bihanaet : {n} % eus ar ment gwir.', // br: à relire
    'reglage.echelle': 'Ment ar pezhioù hag ar bilhedoù', // br: à relire
    'valeur.echelle.100': '100 % (ment gwir)', 'valeur.echelle.75': '75 %', 'valeur.echelle.50': '50 %', // br: à relire
    'aide.echelle': 'Da 100 % emañ ar pezhioù hag ar bilhedoù e-ment gwir. Pa vezont bihanoc\'h ez eus muioc\'h war pep pajenn.', // br: à relire
  },
}
