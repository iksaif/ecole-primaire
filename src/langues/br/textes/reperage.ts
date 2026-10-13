// Textes de l'interface — le repérage (breton). Traduction automatique : les passages marqués « br: à relire » sont à faire vérifier.
import type { Traductions } from '../../types.ts'
import type fr from '../../fr/textes/reperage.ts'

export default {
  titre: 'En em lec’hiañ', // br: à relire
  description: 'Kodañ hag heuliañ fiñvoù ur robot war ur c’harrezennaoueg', // br: à relire
  exercices: { // br: à relire
    suivre: 'Heuliañ ur programm',
    coder: 'Skrivañ ur programm',
  },
  programme: 'Programm ar robot', // br: à relire
  avancer: 'War-raok', // br: à relire
  droite: 'Treiñ a-zehou', // br: à relire
  gauche: 'Treiñ a-gleiz', // br: à relire
  annuler: 'Lemel an hini diwezhañ', // br: à relire
  lancer: 'Lañsañ ar robot', // br: à relire
  vide: 'Stok ouzh ar boutonoù evit skrivañ ar programm.', // br: à relire
  caseDe: 'karrezenn {n}', // br: à relire
} satisfies Traductions<typeof fr>
