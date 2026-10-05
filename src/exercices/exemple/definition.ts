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

  // Réglages qui changent avec le niveau. Le type de `config` s'en déduit : `config.pas` est (1 | 2 | 5 | 10 | 100 | 1000)[].
  // Un choix multiple peut porter des nombres comme des chaînes ; la valeur choisie reste un nombre, mémorisée telle quelle.
  niveaux: {
    cp: {
      reglages: {
        exercices: cases(['complete'], {
          // hors programme, mais proposé : la raison s'affiche en infobulle ; jamais coché par défaut, les tests ne l'essaient pas
          horsProgramme: [{ option: 'regle', raison: 'Trouver la règle d\'une suite commence au CE1 ; proposé aux élèves en avance.' }],
        }),
        sens: cases(['monte'], { bonus: ['descend'] }),   // bonus : proposé, jamais coché, au-delà du programme du niveau
        pas: cases([1, 2, 10], { bonus: [5], horsProgramme: [{ option: 100, raison: 'Les centaines arrivent au CE1 : au CP, les nombres vont jusqu\'à 100.' }] }),
      },
      // La compétence « trouver la règle » n'est pas au programme du CP : l'exercice la travaille quand même, si on coche
      // « Trouver la règle (hors programme) ». Elle est déclarée ici, avec sa raison, pour que rien ne sorte du programme en silence.
      horsProgramme: [{ competence: K.exempleRegle, raison: 'Proposée aux élèves en avance ; au programme dès le CE1.' }],
    },
    ce1: {
      reglages: {
        exercices: cases(['complete', 'regle']),
        sens: cases(['monte', 'descend']),
        pas: cases([2, 5, 10, 100]),
      },
    },
    // le CE2 reprend les réglages du CE1 et ne change que les pas
    ce2: herite('ce1', { reglages: { pas: cases([2, 5, 10, 100, 1000]) } }),
  },

  // Une fiche à télécharger par compétence et niveau (pages /telechargements/) ; le bilan d'une classe (réglages par
  // défaut du niveau) existe toujours. Les réglages d'une fiche doivent être proposés par le niveau.
  fiches: [
    { id: 'dizaines', competence: K.exempleCompter, niveau: 'ce1', reglages: { exercices: ['complete'], pas: [10] } },
    { id: 'regle', competence: K.exempleRegle, niveau: 'ce1', reglages: { exercices: ['regle'] } },
  ],
})
