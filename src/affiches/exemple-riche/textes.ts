// Les textes du troisième exemple, par langue. Le formulaire les lit dans la langue de l'interface (retombée sur le français),
// l'aperçu dans la langue de la feuille. Les lettres s'écrivent pareil partout : `valeur.lettres.<lettre>` est la lettre.
import type { TextesAffiche } from '../types.ts'
import { LETTRES } from './definition.ts'

const lettres = Object.fromEntries(LETTRES.map(l => [`valeur.lettres.${l}`, l]))

export const TEXTES: TextesAffiche = {
  fr: {
    titre: 'Lettres à écrire',
    'variante.ecrire.court': 'Lettres à écrire',
    'variante.ecrire.titre': 'Lettres, mot ou nombres à écrire',
    'variante.ecrire.description': 'Des lettres, un mot ou des nombres à écrire en script et en attaché.',
    'reglage.serie': 'Que veux-tu écrire ?',
    'valeur.serie.alphabet': 'Des lettres', 'valeur.serie.mot': 'Un mot', 'valeur.serie.nombres': 'Des nombres',
    'reglage.lettres': 'Les lettres',
    ...lettres,
    'reglage.mot': 'Le mot',
    'reglage.de': 'De', 'reglage.a': 'À',
    'reglage.styles': 'Écritures',
    'valeur.styles.script': 'Script', 'valeur.styles.attache': 'Attaché',
    'reglage.pointilles': 'À repasser',
    'valeur.pointilles.false': 'Non', 'valeur.pointilles.true': 'Oui, en pointillés',
    'groupe.contenu': 'Le contenu', 'groupe.ecriture': 'L’écriture',
    'aide.mot': 'Vingt lettres au plus.',
    'aide.lettres': 'Les lettres proposées suivent la langue de la feuille.',
    'police.script': 'Police du script', 'police.attache': 'Police de l’attaché',
    'prereglage.premieres-lettres': 'Les premières lettres', 'prereglage.mon-prenom': 'Mon prénom', 'prereglage.compter-jusqua-dix': 'Compter jusqu’à dix',
  },
  br: {
    titre: 'Lizherennoù da skrivañ', // br: à relire
    'variante.ecrire.court': 'Lizherennoù da skrivañ', // br: à relire
    'variante.ecrire.titre': 'Lizherennoù, ur ger pe niveroù da skrivañ', // br: à relire
    'variante.ecrire.description': 'Lizherennoù, ur ger pe niveroù da skrivañ e skript hag e stag.', // br: à relire
    'reglage.serie': 'Petra a fell dit skrivañ ?', // br: à relire
    'valeur.serie.alphabet': 'Lizherennoù', 'valeur.serie.mot': 'Ur ger', 'valeur.serie.nombres': 'Niveroù', // br: à relire
    'reglage.lettres': 'Al lizherennoù', // br: à relire
    ...lettres,
    'reglage.mot': 'Ar ger', // br: à relire
    'reglage.de': 'Eus', 'reglage.a': 'Da', // br: à relire
    'reglage.styles': 'Skritur', // br: à relire
    'valeur.styles.script': 'Skript', 'valeur.styles.attache': 'Stag', // br: à relire
    'reglage.pointilles': 'Da adtreiñ', // br: à relire
    'valeur.pointilles.false': 'Ket', 'valeur.pointilles.true': 'Ya, e pikoù', // br: à relire
    'groupe.contenu': 'An danvez', 'groupe.ecriture': 'Ar skritur', // br: à relire
    'aide.mot': 'Ugent lizherenn d’ar muiañ.', // br: à relire
    'aide.lettres': 'Al lizherennoù a heuilh yezh ar skritell.', // br: à relire
    'police.script': 'Nodrezh ar skript', 'police.attache': 'Nodrezh ar stag', // br: à relire
    'prereglage.premieres-lettres': 'Al lizherennoù kentañ', 'prereglage.mon-prenom': 'Va anv bihan', 'prereglage.compter-jusqua-dix': 'Kontañ betek dek', // br: à relire
  },
}
