// Suites de nombres — textes de CONTENU : ce que la fiche et son corrigé écrivent. Lus par T (fiche) ; la vue passe par
// `traducteur(CONTENU, …)`. Les textes de l'INTERFACE (boutons, réglages, retours du jeu) sont dans
// src/langues/<langue>/textes/suites.ts ; les mots communs (« corrige »…) dans la section `communs`, que T lit aussi.
// `fiche.<id>` : titre court, titre et description d'une fiche par compétence (pages /telechargements/), la même clé que son `id`
// dans definition.ts.
import { catalogue } from '../../langues/catalogue.ts'

export const CONTENU = catalogue({
  titre: 'Les suites de nombres',
  consignePoursuivre: 'Poursuis chaque suite : écris les nombres qui suivent.',
  consigneComplete: 'Complète chaque suite : écris les nombres qui manquent.',
  consigneRegle: 'Trouve la règle : à chaque fois, on ajoute ou on enlève quel nombre ?',
  regleFiche: 'on change de',
  corrigeRegle: 'pas de {pas}',
  fiche: {
    suites: {
      court: 'Poursuivre des suites',
      titre: 'Fiche de suites de nombres : poursuivre et compléter',
      description: 'Poursuivre et compléter des suites de nombres, de 2 en 2, de 5 en 5, de 10 en 10, de 100 en 100 et plus : fiche gratuite à imprimer, avec corrigé.',
    },
    'suites-de-nombres': {
      court: 'Compléter des suites',
      titre: 'Fiche de calcul : compléter des suites de nombres',
      description: 'Compléter des suites de nombres de 2 en 2, de 5 en 5, de 10 en 10, en avançant et à reculons. Fiche gratuite CE1 avec corrigé.',
    },
  },
}, {
  br: {
    titre: 'An heuliadoù niveroù', // br: à relire
    consignePoursuivre: "Kendalc'hit pep heuliad : skrivit an niveroù da heul.", // br: à relire
    consigneComplete: 'Klokait pep heuliad : skrivit an niveroù a vank.', // br: à relire
    consigneRegle: 'Kavit ar reolenn : bep tro, peseurt niver a vez ouzhpennet pe lamet ?', // br: à relire
    regleFiche: 'cheñchet e vez a', // br: à relire
    corrigeRegle: 'pazenn a {pas}', // br: à relire
    fiche: {
      suites: {
        court: "Kendalc'hel heuliadoù", // br: à relire
        titre: "Fichenn heuliadoù niveroù : kendalc'hel ha klokaat", // br: à relire
        description: "Kendalc'hel ha klokaat heuliadoù niveroù, a 2 da 2, a 5 da 5, a 10 da 10, a 100 da 100 ha muioc'h c'hoazh : fichenn digoust da voullañ, gant ar reizhadur.", // br: à relire
      },
      'suites-de-nombres': {
        court: 'Klokaat heuliadoù', // br: à relire
        titre: 'Fichenn jediñ : klokaat heuliadoù niveroù',
        description: 'Heuliadoù niveroù — fiche suites de nombres en breton : a 2 da 2, a 5 da 5, a 10 da 10, war-raok ha war-gil. CE1.', // br: à relire
      },
    },
  },
})
