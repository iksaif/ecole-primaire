// Textes de l'interface — routeur (breton). Traduction automatique : les passages marqués « br: à relire »
// sont à faire vérifier par un brittophone (`npm run i18n:relecture`).
import type { Traductions } from '../../types.ts'
import type fr from '../../fr/textes/routeur.ts'

export default {
  evitement: 'Mont d’an endalc’h', // br: à relire
  avenir: 'Ar bajenn-mañ a zeuio a-benn nebeut.', // br: à relire
  introuvable: {
    message: 'N’eus ket eus ar chomlec’h-mañ (pe n’eus ket mui).', // br: à relire
    accueil: 'Distreiñ d’an degemer', // br: à relire
  },
  titre: {
    accueil: 'Poelladennoù ha fichennoù da voullañ', // br: à relire
    maths: 'Jedoniezh', // br: à relire
    francais: 'Galleg', // br: à relire
    monde: 'Ar bed', // br: à relire
    fichesMaths: 'Fichennoù jedoniezh prest', // br: à relire
    fichesFrancais: 'Fichennoù galleg prest', // br: à relire
    fichesMonde: 'Fichennoù diwar-benn ar bed prest', // br: à relire
    fichesRegionale: 'Fichennoù prest ar yezh rannvroel', // br: à relire
    fiche: 'Fichenn da voullañ', // br: à relire
    programme: 'Ar programm', // br: à relire
    competence: 'Barregezh ar programm', // br: à relire
    exercice: 'Poelladenn', // br: à relire
    affiche: 'Skritell da voullañ', // br: à relire
    introuvable: 'Pajenn ket kavet', // br: à relire
  },
} satisfies Traductions<typeof fr>
