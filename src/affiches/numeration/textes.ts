// Les textes de l'affiche du tableau de numération, par langue de la feuille (une page par langue) : titre, noms des classes et des rangs,
// phrases de lecture, note du bas, variantes. Les nombres en lettres viennent des langues (vérifiés). Breton : à relire.
import type { TextesAffiche } from '../types.ts'

export const TEXTES: TextesAffiche = {
  fr: {
    'titre': 'Le tableau de numération',
    'classe.mille': 'mille',
    'classe.unitesSimples': 'unités simples',
    'classe.milliers': 'classe des milliers',
    'classe.millions': 'classe des millions',
    'classe.decimale': 'partie décimale',
    'rang.mille': 'mille',
    'rang.centaines': 'centaines',
    'rang.dizaines': 'dizaines',
    'rang.unites': 'unités',
    'rang.dixiemes': 'dixièmes',
    'rang.centiemes': 'centièmes',
    'rang.milliemes': 'millièmes',
    'lecture.entier': '{nb} se lit « {lettres} »',
    'lecture.decimal': '{n} unités et {d} {nom}',
    'lecture.grand': '{nb} = {m} millions + {k} milliers + {u} unités',
    'note.0': '10 unités = 1 dizaine · 10 dizaines = 1 centaine · 10 centaines = 1 mille',
    'note.2': 'Chaque rang vaut 10 fois le rang de droite et 10 fois moins que le rang de gauche.',
    'note.3': 'Chaque rang vaut 10 fois le rang de droite et 10 fois moins que le rang de gauche.',
    'variante.ce1.court': 'Numération jusqu\'à 1 000',
    'variante.ce1.titre': 'Tableau de numération jusqu\'à 1 000 à imprimer',
    'variante.ce1.description': 'Tableau de numération jusqu\'à 1 000 : unités, dizaines, centaines et mille, avec deux exemples lus à voix haute. En français, en breton ou les deux.',
    'variante.cm1.court': 'Numération CM1 (6 chiffres, décimaux)',
    'variante.cm1.titre': 'Tableau de numération CM1 (6 chiffres, décimaux) à imprimer',
    'variante.cm1.description': 'Tableau de numération du CM1 : nombres jusqu’à six chiffres (classe des milliers) et partie décimale (dixièmes, centièmes). En français, en breton ou les deux.',
    'variante.cm2.court': 'Numération CM2 (9 chiffres, décimaux)',
    'variante.cm2.titre': 'Tableau de numération CM2 (9 chiffres, décimaux) à imprimer',
    'variante.cm2.description': 'Tableau de numération du CM2 : nombres jusqu’à neuf chiffres (classe des millions) et partie décimale jusqu’aux millièmes. En français, en breton ou les deux.',
  },
  br: {
    'titre': 'An daolenn niveriñ', // br: à relire
    'classe.mille': 'mil', // br: à relire
    'classe.unitesSimples': 'unanennoù eeun', // br: à relire
    'classe.milliers': 'rummad ar miliadoù', // br: à relire
    'classe.millions': 'rummad ar milionoù', // br: à relire
    'classe.decimale': 'lodenn dekvedel', // br: à relire
    'rang.mille': 'mil', // br: à relire
    'rang.centaines': 'kantadoù', // br: à relire
    'rang.dizaines': 'degadoù', // br: à relire
    'rang.unites': 'unanennoù', // br: à relire
    'rang.dixiemes': 'dekvedoù', // br: à relire
    'rang.centiemes': 'kantvedoù', // br: à relire
    'rang.milliemes': 'milvedoù', // br: à relire
    'lecture.entier': '{nb} a lenner « {lettres} »', // br: à relire
    'lecture.decimal': '{n} unanenn ha {d} {nom}', // br: à relire
    'lecture.grand': '{nb} = {m} milion + {k} mil + {u} unanenn', // br: à relire
    'note.0': '10 unanenn = 1 degad · 10 degad = 1 kantad · 10 kantad = 1 mil', // br: à relire
    'note.2': 'Pep renk a dalv 10 gwech renk an tu dehou ha 10 gwech nebeutoc’h eget renk an tu kleiz.', // br: à relire
    'note.3': 'Pep renk a dalv 10 gwech renk an tu dehou ha 10 gwech nebeutoc’h eget renk an tu kleiz.', // br: à relire
    'variante.ce1.court': 'Niveriñ betek 1 000', // br: à relire
    'variante.ce1.titre': 'Taolenn niveriñ betek 1 000 da voullañ', // br: à relire
    'variante.ce1.description': 'Taolenn niveriñ betek 1 000 : unanennoù, degadoù, kantadoù ha mil, gant daou skouer lennet a-bleustr. E galleg, e brezhoneg pe an daou.', // br: à relire
    'variante.cm1.court': 'Niveriñ CM1 (6 sifr, degadel)', // br: à relire
    'variante.cm1.titre': 'Taolenn niveriñ CM1 (6 sifr, degadel) da voullañ', // br: à relire
    'variante.cm1.description': 'Taolenn niveriñ ar CM1 : niveroù betek c’hwec’h sifr (rummad ar miliadoù) ha lodenn dekvedel (dekvedoù, kantvedoù). E galleg, e brezhoneg pe an daou.', // br: à relire
    'variante.cm2.court': 'Niveriñ CM2 (9 sifr, degadel)', // br: à relire
    'variante.cm2.titre': 'Taolenn niveriñ CM2 (9 sifr, degadel) da voullañ', // br: à relire
    'variante.cm2.description': 'Taolenn niveriñ ar CM2 : niveroù betek nav sifr (rummad ar milionoù) ha lodenn dekvedel betek ar milvedoù. E galleg, e brezhoneg pe an daou.', // br: à relire
  },
}
