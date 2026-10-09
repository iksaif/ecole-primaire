// Les textes de la bande numérique. Les nombres en lettres viennent de src/langues/ (vérifiés) ; tout le reste du breton est nouveau : à relire.
import type { TextesAffiche } from '../types.ts'

export const TEXTES: TextesAffiche = {
  fr: {
    titre: 'La bande numérique',
    'variante.ms.court': 'Bande numérique 1 à 6',
    'variante.ms.titre': 'Bande numérique de 1 à 6 à imprimer',
    'variante.ms.description': 'La bande numérique de 1 à 6, une case par nombre, avec les objets à dénombrer.',
    'variante.gs.court': 'Bande numérique 1 à 10',
    'variante.gs.titre': 'Bande numérique de 1 à 10 à imprimer',
    'variante.gs.description': 'La bande numérique de 1 à 10, une case par nombre, avec les objets à dénombrer.',
    'variante.gs-comptine.court': 'Bande numérique 1 à 30',
    'variante.gs-comptine.titre': 'Bande numérique de 1 à 30 à imprimer',
    'variante.gs-comptine.description': 'La comptine numérique jusqu’à 30, en trois rangées de dix, pour réciter et repérer les nombres.',
    'reglage.representation': 'Sous chaque nombre',
    'valeur.representation.objets': 'Des objets',
    'valeur.representation.points': 'Des points',
    'valeur.representation.aucune': 'Rien',
    'reglage.objet': 'Les objets',
    'valeur.objet.pomme': 'Des pommes',
    'valeur.objet.etoile': 'Des étoiles',
    'valeur.objet.fleur': 'Des fleurs',
    'valeur.objet.coccinelle': 'Des coccinelles',
    'reglage.lettres': 'Nombres en lettres',
    'valeur.lettres.false': 'Chiffres seulement', 'valeur.lettres.true': 'Chiffres et lettres',
    'groupe.representation': 'Ce qui montre chaque nombre',
    'groupe.lettres': 'Écriture des nombres',
    'aide.langues': 'Avec plusieurs langues, chaque nombre écrit en lettres l’est dans chacune.',
  },
  br: {
    titre: 'Ar vandenn niveroù', // br: à relire
    'variante.ms.court': 'Bandenn niveroù 1 da 6', // br: à relire
    'variante.ms.titre': 'Bandenn niveroù eus 1 da 6 da voullañ', // br: à relire
    'variante.ms.description': 'Ar vandenn niveroù eus 1 da 6, ur gael evit pep niver, gant an traoù da gontañ.', // br: à relire
    'variante.gs.court': 'Bandenn niveroù 1 da 10', // br: à relire
    'variante.gs.titre': 'Bandenn niveroù eus 1 da 10 da voullañ', // br: à relire
    'variante.gs.description': 'Ar vandenn niveroù eus 1 da 10, ur gael evit pep niver, gant an traoù da gontañ.', // br: à relire
    'variante.gs-comptine.court': 'Bandenn niveroù 1 da 30', // br: à relire
    'variante.gs-comptine.titre': 'Bandenn niveroù eus 1 da 30 da voullañ', // br: à relire
    'variante.gs-comptine.description': 'Ar gontadenn niveroù betek 30, e teir renkad a zek, evit adlavar ha kavout ar niveroù.', // br: à relire
    'reglage.representation': 'Dindan pep niver', // br: à relire
    'valeur.representation.objets': 'Traoù', // br: à relire
    'valeur.representation.points': 'Pikoù', // br: à relire
    'valeur.representation.aucune': 'Netra', // br: à relire
    'reglage.objet': 'An traoù', // br: à relire
    'valeur.objet.pomme': 'Avaloù', // br: à relire
    'valeur.objet.etoile': 'Steredoù', // br: à relire
    'valeur.objet.fleur': 'Bleunioù', // br: à relire
    'valeur.objet.coccinelle': 'Amprevaned-Doue', // br: à relire
    'reglage.lettres': 'Niveroù e lizherennoù', // br: à relire
    'valeur.lettres.false': 'Niveroù hepken', 'valeur.lettres.true': 'Niveroù ha lizherennoù', // br: à relire
    'groupe.representation': 'Ar pezh a ziskouez pep niver', // br: à relire
    'groupe.lettres': 'Skrivañ ar niveroù', // br: à relire
    'aide.langues': 'Gant meur a yezh e vez skrivet pep niver en pep hini anezho.', // br: à relire
  },
}
