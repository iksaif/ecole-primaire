// Les textes des mois de l'année et des saisons. Les mois de la langue régionale sont ceux, vérifiés, de ses données
// (src/langues/<langue>/donnees.ts, liste `mois`) : on ne les recopie pas. Les saisons bretonnes viennent des repères de l'académie de
// Rennes (« Nevez-amzer, hañv, diskar-amzer, goañv », docs/programmes/bretonA1.md p. 4) : sourcées, mais nouvelles ici, donc à relire.
import { donneesRegionales, REGIONALES } from '../../langues/registre.ts'
import type { Langue } from '../../langues/registre.ts'
import type { TextesAffiche } from '../types.ts'
import { TEXTES_LISTE } from '../listeMots.ts'

/** Les mois d'une langue régionale, sous les clés `mois.0` à `mois.11`. */
const moisRegionaux = (code: Langue): Record<string, string> =>
  Object.fromEntries((donneesRegionales(code)?.listes.find(l => l.id === 'mois')?.mots ?? []).map((mot, i) => [`mois.${i}`, mot]))

export const TEXTES: TextesAffiche = {
  fr: {
    ...TEXTES_LISTE.fr,
    titre: 'Les mois de l’année',
    'variante.gs.court': 'Les mois de l’année et les saisons',
    'variante.gs.titre': 'Affiche des mois de l’année et des saisons (GS)',
    'variante.gs.description': 'Les douze mois de l’année en script, et les quatre saisons ; en français, en breton, ou les deux.',
    'variante.cp.court': 'Les mois de l’année (script et attaché)',
    'variante.cp.titre': 'Affiche des mois de l’année en script et en attaché, et des saisons (CP)',
    'variante.cp.description': 'Les douze mois de l’année en script et en attaché, et les quatre saisons ; en français, en breton, ou les deux.',
    'reglage.ordre': 'Présentation',
    'valeur.ordre.annee': 'De janvier à décembre',
    'valeur.ordre.saisons': 'Par saison',
    'saison.debut': 'vers le {jour} {mois}',
    'note.saisons': 'Une saison ne commence pas au début d’un mois : elle change en cours de mois, vers le 21 (mars, juin, septembre, décembre).',
    'reglage.saisons': 'Les saisons',
    'valeur.saisons.true': 'Avec',
    'valeur.saisons.false': 'Sans',
    'mois.0': 'janvier', 'mois.1': 'février', 'mois.2': 'mars', 'mois.3': 'avril', 'mois.4': 'mai', 'mois.5': 'juin',
    'mois.6': 'juillet', 'mois.7': 'août', 'mois.8': 'septembre', 'mois.9': 'octobre', 'mois.10': 'novembre', 'mois.11': 'décembre',
    'saison.printemps': 'printemps', 'saison.ete': 'été', 'saison.automne': 'automne', 'saison.hiver': 'hiver',
  },
  br: {
    ...TEXTES_LISTE.br,
    titre: 'Mizioù ar bloaz', // br: à relire (titre de la liste `mois`, src/langues/br/donnees.ts)
    'variante.gs.court': 'Mizioù ar bloaz hag ar c’houlzioù-amzer', // br: à relire
    'variante.gs.titre': 'Skritell mizioù ar bloaz hag ar c’houlzioù-amzer (GS)', // br: à relire
    'variante.gs.description': 'An daouzek miz e skript, hag ar pevar c’houlz-amzer ; e galleg, e brezhoneg, pe en div yezh.', // br: à relire
    'variante.cp.court': 'Mizioù ar bloaz (skript hag a-stag)', // br: à relire
    'variante.cp.titre': 'Skritell mizioù ar bloaz e skript hag e a-stag, hag ar c’houlzioù-amzer (CP)', // br: à relire
    'variante.cp.description': 'An daouzek miz e skript hag e a-stag, hag ar pevar c’houlz-amzer ; e galleg, e brezhoneg, pe en div yezh.', // br: à relire
    'reglage.ordre': 'Aozadur', // br: à relire
    'valeur.ordre.annee': 'Eus Genver da Kerzu', // br: à relire
    'valeur.ordre.saisons': 'Dre c’houlz-amzer', // br: à relire
    'saison.debut': 'war-dro {jour} {mois}', // br: à relire
    'note.saisons': 'N’eo ket e deroù ur miz e krog ur c’houlz-amzer : cheñch a ra e-pad ar miz, war-dro an 21.', // br: à relire
    'reglage.saisons': 'Ar c’houlzioù-amzer', // br: à relire
    'valeur.saisons.true': 'Gant', // br: à relire
    'valeur.saisons.false': 'Hep', // br: à relire
    // br: à relire — repères de l'académie de Rennes, p. 4 (docs/programmes/bretonA1.md)
    'saison.printemps': 'nevez-amzer', 'saison.ete': 'hañv', 'saison.automne': 'diskar-amzer', 'saison.hiver': 'goañv',
  },
}

// les mots vérifiés de chaque langue régionale, ajoutés à ses textes
for (const code of REGIONALES) TEXTES[code] = { ...TEXTES[code], ...moisRegionaux(code) }
