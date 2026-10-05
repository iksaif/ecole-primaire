// Les textes du deuxième exemple. Les jours du breton sont ceux, vérifiés, de la langue régionale (src/langues/…/donnees.ts) :
// on ne les recopie pas. Les clés `jour.0` à `jour.6` sont propres à cette affiche.
import { donneesRegionales, REGIONALES } from '../../langues/registre.ts'
import type { TextesAffiche } from '../types.ts'

const joursRegionaux = (code: (typeof REGIONALES)[number]): Record<string, string> =>
  Object.fromEntries((donneesRegionales(code)?.listes.find(l => l.id === 'jours-di')?.mots ?? []).map((mot, i) => [`jour.${i}`, mot]))

export const TEXTES: TextesAffiche = {
  fr: {
    titre: 'Les jours de la semaine',
    'variante.semaine.court': 'Les jours de la semaine',
    'variante.semaine.titre': 'Les jours de la semaine à imprimer',
    'variante.semaine.description': 'Les sept jours de la semaine, en script puis en attaché.',
    'police.script': 'Police des mots',
    'police.attache': 'Police du tracé',
    'jour.0': 'lundi', 'jour.1': 'mardi', 'jour.2': 'mercredi', 'jour.3': 'jeudi', 'jour.4': 'vendredi', 'jour.5': 'samedi', 'jour.6': 'dimanche',
  },
  br: {
    titre: 'Deizioù ar sizhun', // br: à relire
    'variante.semaine.court': 'Deizioù ar sizhun', // br: à relire
    'variante.semaine.titre': 'Deizioù ar sizhun da voullañ', // br: à relire
    'variante.semaine.description': 'Seizh deiz ar sizhun, e skript neuze e stag.', // br: à relire
    'police.script': 'Nodrezh ar gerioù', // br: à relire
    'police.attache': 'Nodrezh an dresadenn', // br: à relire
    ...joursRegionaux('br'),
  },
}
