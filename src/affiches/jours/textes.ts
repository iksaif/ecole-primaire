// Les textes des jours de la semaine. Les jours de la langue régionale sont ceux, vérifiés, de ses données (src/langues/<langue>/donnees.ts,
// liste `jours-di` : Dilun, Dimeurzh… en breton, la forme du « Peseurt deiz eo hiziv ? » des repères de l'académie de Rennes) : on ne
// les recopie pas.
import { donneesRegionales, REGIONALES } from '../../langues/registre.ts'
import type { Langue } from '../../langues/registre.ts'
import type { TextesAffiche } from '../types.ts'
import { TEXTES_LISTE } from '../listeMots.ts'

/** Les jours d'une langue régionale, sous les clés `jour.0` à `jour.6`. */
const joursRegionaux = (code: Langue): Record<string, string> =>
  Object.fromEntries((donneesRegionales(code)?.listes.find(l => l.id === 'jours-di')?.mots ?? []).map((mot, i) => [`jour.${i}`, mot]))

export const TEXTES: TextesAffiche = {
  fr: {
    ...TEXTES_LISTE.fr,
    titre: 'Les jours de la semaine',
    'variante.maternelle.court': 'Les jours de la semaine',
    'variante.maternelle.titre': 'Affiche des jours de la semaine (maternelle)',
    'variante.maternelle.description': 'Les sept jours de la semaine en script, pour le calendrier de la classe ; en français, en breton, ou les deux.',
    'variante.cp.court': 'Les jours de la semaine (script et attaché)',
    'variante.cp.titre': 'Affiche des jours de la semaine en script et en attaché (CP)',
    'variante.cp.description': 'Les sept jours de la semaine en script et en attaché ; en français, en breton, ou les deux.',
    'jour.0': 'lundi', 'jour.1': 'mardi', 'jour.2': 'mercredi', 'jour.3': 'jeudi', 'jour.4': 'vendredi', 'jour.5': 'samedi', 'jour.6': 'dimanche',
  },
  br: {
    ...TEXTES_LISTE.br,
    titre: 'Deizioù ar sizhun', // br: à relire
    'variante.maternelle.court': 'Deizioù ar sizhun', // br: à relire
    'variante.maternelle.titre': 'Skritell deizioù ar sizhun (skol-vamm)', // br: à relire
    'variante.maternelle.description': 'Seizh deiz ar sizhun e skript, evit deiziadur ar c’hlas ; e galleg, e brezhoneg, pe en div yezh.', // br: à relire
    'variante.cp.court': 'Deizioù ar sizhun (skript hag a-stag)', // br: à relire
    'variante.cp.titre': 'Skritell deizioù ar sizhun e skript hag e a-stag (CP)', // br: à relire
    'variante.cp.description': 'Seizh deiz ar sizhun e skript hag e a-stag ; e galleg, e brezhoneg, pe en div yezh.', // br: à relire
  },
}

// les mots vérifiés de chaque langue régionale, ajoutés à ses textes
for (const code of REGIONALES) TEXTES[code] = { ...TEXTES[code], ...joursRegionaux(code) }
