// Exemple d'exercice — définition : QUI peut faire quoi. Lire de haut en bas ; ce fichier est le seul où l'on parle
// de niveaux, de compétences du programme et de réglages. Le reste de l'exercice en découle.
//
// Programme : un exercice rattache ses niveaux à des compétences de src/data/programme.ts. Ici, des compétences
// FICTIVES (K.exemple…, domaine D.exemple), qui n'existent qu'en développement : un exercice réel prend les vraies
// (K.ajouterDizaines, K.suitesNombres… : l'éditeur les complète). `npm run nouveau` les remplace par celles qu'on lui donne.
import { definir, choix, cases, herite } from '../../noyau/definir.ts'
import { K, D } from '../../noyau/ids.ts'

export default definir({
  id: 'exemple',
  route: '/dev/exemple',
  domaine: D.exemple,   // 'contenu' vaut 'interface' : les textes suivent la langue de l'interface

  // Les compétences de l'exercice, une fois. Chaque niveau garde celles qui sont à son programme : ici le CP n'en a
  // qu'une (l'autre commence au CE1), le CE1 et le CE2 ont les deux. `sauf: [K.…]` écarte une compétence d'un niveau.
  competences: [K.exempleCompter, K.exempleRegle],

  // Réglages communs à tous les niveaux. Un réglage = un `choix` (une valeur, la première par défaut) ou des `cases`
  // (plusieurs valeurs, toutes cochées par défaut) : valeurs, défaut et écarts au programme au même endroit.
  reglages: {
    nbQ: choix([5, 10, 15], { defaut: 10 }),
  },

  // Réglages qui changent avec le niveau. Le type de `config` s'en déduit : `config.pas` est 1 | 2 | 5 | 10 | 100 | 1000.
  niveaux: {
    cp: {
      reglages: {
        exercices: cases(['complete']),
        sens: cases(['monte'], { bonus: ['descend'] }),   // bonus : proposé, jamais coché, hors du programme du niveau
        pas: choix([1, 2, 10], {
          defaut: 2,
          bonus: [5],
          // hors programme, mais utile : la raison s'affiche en infobulle, et les tests ne l'essaient pas
          horsProgramme: [{ option: 100, raison: 'Les centaines arrivent au CE1 : au CP, les nombres vont jusqu\'à 100.' }],
        }),
      },
    },
    ce1: {
      reglages: {
        exercices: cases(['complete', 'regle']),
        sens: cases(['monte', 'descend']),
        pas: choix([2, 5, 10, 100]),
      },
    },
    // le CE2 reprend les réglages du CE1 et ne change que le pas
    ce2: herite('ce1', { reglages: { pas: choix([2, 5, 10, 100, 1000]) } }),
  },

  // Une fiche à télécharger par compétence et niveau (pages /telechargements/) ; le bilan d'une classe (réglages par
  // défaut du niveau) existe toujours. Les réglages d'une fiche doivent être proposés par le niveau.
  fiches: [
    { id: 'dizaines', competence: K.exempleCompter, niveau: 'ce1', reglages: { exercices: ['complete'], pas: 10 } },
    { id: 'regle', competence: K.exempleRegle, niveau: 'ce1', reglages: { exercices: ['regle'] } },
  ],
})
