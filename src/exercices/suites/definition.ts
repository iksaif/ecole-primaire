// Suites de nombres — définition : QUI peut faire quoi (modèle : ../exemple/definition.ts, qui commente chaque mécanisme).
// Programme (src/data/programme.ts, compétence « suites-nombres ») : à partir du CE1 seulement (c2maths p. 11 : suites évolutives ;
// c3maths p. 9 et c3maths p. 13 : identifier et formuler une règle pour poursuivre une suite). Il n'y a donc pas de niveau CP.
//   CE1 : nombres ≤ 1 000, comptage de 2 en 2, de 5 en 5, de 10 en 10 et de 100 en 100 ;
//   CE2 : nombres ≤ 10 000, et de 25 en 25, de 50 en 50, de 1 000 en 1 000 ;
//   CM1, CM2 : les mêmes, avec 250 et 500 (le champ numérique ne borne plus les suites).
// Les identifiants des exercices (« poursuivre »…), des sens et des pas sont aussi les valeurs des réglages mémorisés des visiteurs
// (clé « suites_config ») : ils ne changent pas ; les libellés affichés sont dans src/langues/<langue>/textes/suites.ts.
import { definir, choix, cases, pourClasses, fichesPourClasses } from '../../noyau/definir.ts'
import { K, D } from '../../noyau/ids.ts'

export default definir({
  id: 'suites',
  route: '/maths/suites',
  domaine: D.nombresCalcul,
  emoji: '🔢',
  niveauDefaut: 'ce1',
  competences: [K.suitesNombres],

  // nbQ : questions du jeu ; nbFiche : suites d'une fiche
  reglages: {
    nbQ: choix([5, 10, 15], { defaut: 10 }),
    nbFiche: choix([10, 15, 20], { defaut: 15 }),
  },

  niveaux: {
    ce1: { reglages: { exercices: cases(['poursuivre', 'complete', 'regle']), sens: cases(['monte', 'descend']), pas: cases([2, 5, 10, 100]) } },
    ce2: { reglages: {
      exercices: cases(['poursuivre', 'complete', 'regle']), sens: cases(['monte', 'descend']),
      pas: cases([2, 5, 10, 25, 50, 100, 1000], { defaut: [5, 10, 25, 50, 100] }),
    } },
    ...pourClasses('cm1-cm2', { reglages: {
      exercices: cases(['poursuivre', 'complete', 'regle']), sens: cases(['monte', 'descend']),
      pas: cases([10, 25, 50, 100, 250, 500, 1000], { defaut: [25, 50, 100, 250, 500] }),
    } }),
  },

  // Fiches par compétence (le bilan d'une classe : les réglages par défaut du niveau). Celle qui porte un `slug` existait avant,
  // sous cette adresse (la fiche « suites de nombres » à la carte, du calcul) : elle ne change pas.
  fiches: [
    ...fichesPourClasses('ce1+', { id: 'suites', competence: K.suitesNombres, reglages: { exercices: ['poursuivre', 'complete'] } }),
    { id: 'suites-de-nombres', slug: 'fiche-suites-de-nombres', competence: K.suitesNombres, niveau: 'ce1',
      reglages: { exercices: ['complete'], sens: ['monte', 'descend'], pas: [2, 5, 10], nbFiche: 20 } },
  ],
})
