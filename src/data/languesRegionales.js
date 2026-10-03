// Langues régionales disponibles (activables dans les paramètres).
// Pour ajouter une langue : une entrée ici (alphabet, nombres en lettres, listes de mots),
// les fiches à imprimer s'adaptent automatiquement.
import { enLettresBr } from '../utils/nombres.js'

const plage = (de, a) => Array.from({ length: a - de + 1 }, (_, k) => de + k)

export const LANGUES_REGIONALES = [
  {
    id: 'br',
    nom: 'breton',
    nomLocal: 'brezhoneg',
    drapeau: '🏴',
    // Lizherenneg (orthographe peurunvan) : 25 lettres, ch et c'h, ni c, ni q, ni x ; ñ et ù en plus
    alphabet: ['a', 'b', 'ch', "c'h", 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'r', 's', 't', 'u', 'v', 'w', 'y', 'z'],
    titreAlphabet: 'Al lizherenneg',
    lettresEnPlus: ['ch', "c'h", 'ñ', 'ù'],
    enLettres: enLettresBr,
    // Les noms de jours et de mois prennent une majuscule en breton
    // label : libellé du bouton dans l'interface en français, labelBr : dans l'interface en breton
    listes: [
      { id: 'jours', label: 'Jours (Lun, Meurzh…)', labelBr: 'Deizioù (Lun, Meurzh…)', titre: 'Deizioù ar sizhun', mots: ['Lun', 'Meurzh', "Merc'her", 'Yaou', 'Gwener', 'Sadorn', 'Sul'] },
      { id: 'jours-di', label: 'Jours (Dilun, Dimeurzh…)', labelBr: 'Deizioù (Dilun, Dimeurzh…)', titre: 'Deizioù ar sizhun', mots: ['Dilun', 'Dimeurzh', "Dimerc'her", 'Diriaou', 'Digwener', 'Disadorn', 'Disul'] },
      { id: 'mois', label: 'Mois (Genver…)', labelBr: 'Mizioù (Genver…)', titre: 'Mizioù ar bloaz', mots: ['Genver', "C'hwevrer", 'Meurzh', 'Ebrel', 'Mae', 'Mezheven', 'Gouere', 'Eost', 'Gwengolo', 'Here', 'Du', 'Kerzu'] },
      { id: 'nombres-10', label: 'Nombres 1 → 10', labelBr: 'Niveroù 1 → 10', titre: 'Les nombres de 1 à 10 en breton', mots: plage(1, 10).map(enLettresBr) },
      { id: 'nombres-20', label: 'Nombres 11 → 20', labelBr: 'Niveroù 11 → 20', titre: 'Les nombres de 11 à 20 en breton', mots: plage(11, 20).map(enLettresBr) },
      { id: 'dizaines', label: 'Dizaines', labelBr: 'Degadoù', titre: 'Les dizaines en breton', mots: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(enLettresBr) },
    ],
  },
]

export const langueRegionale = id => LANGUES_REGIONALES.find(l => l.id === id) ?? null
