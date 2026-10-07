// Les textes de la météo. Le breton : la question et le mot amzer viennent de l'évaluation d'entrée en CP bilingue (« Penaos eo an amzer ?
// — Glav a ra. », docs/programmes/bretonCP.md p. 11) ; les cinq noms sont vérifiés dans le Wiktionnaire (2026-10-07 : heol « soleil »,
// glav « pluie », avel « vent », erc'h « neige », koumoul « nuages », collectif) ; heol est aussi le mot illustré de la lettre H
// (src/langues/br/donnees.ts). Nouveaux ici : à relire.
import type { TextesAffiche } from '../types.ts'

export const TEXTES: TextesAffiche = {
  fr: {
    titre: 'La météo',
    'variante.rituel.court': 'La météo',
    'variante.rituel.titre': 'Affiche de la météo : quel temps fait-il ?',
    'variante.rituel.description': 'Quel temps fait-il ? Le soleil, la pluie, le vent, la neige, les nuages, pour le rituel du matin ; en français, en breton, ou les deux.',
    question: 'Quel temps fait-il ?',
    'temps.soleil': 'soleil', 'temps.pluie': 'pluie', 'temps.vent': 'vent', 'temps.neige': 'neige', 'temps.nuages': 'nuages',
  },
  br: {
    titre: 'An amzer', // br: à relire
    'variante.rituel.court': 'An amzer', // br: à relire
    'variante.rituel.titre': 'Skritell an amzer : penaos eo an amzer ?', // br: à relire
    'variante.rituel.description': "Penaos eo an amzer ? An heol, ar glav, an avel, an erc'h, ar c'houmoul, evit lid ar beure ; e galleg, e brezhoneg, pe en div yezh.", // br: à relire
    question: 'Penaos eo an amzer ?', // br: à relire (bretonCP p. 11)
    // br: à relire (Wiktionnaire, 2026-10-07)
    'temps.soleil': 'heol', 'temps.pluie': 'glav', 'temps.vent': 'avel', 'temps.neige': "erc'h", 'temps.nuages': 'koumoul',
  },
}
