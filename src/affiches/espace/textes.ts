// Les textes des repères d'espace. Le breton est nouveau : à relire (dans = e, war = sur, dindan = sous, dirak = devant, a-dreñv = derrière, e-kichen = à côté).
import type { TextesAffiche } from '../types.ts'

export const TEXTES: TextesAffiche = {
  fr: {
    titre: 'Où est le chat ?',
    'variante.reperes.court': 'Repères d’espace',
    'variante.reperes.titre': 'Affiche des repères d’espace : dans, sur, sous, devant, derrière, à côté',
    'variante.reperes.description': 'Six petites scènes pour situer un objet : dans, sur, sous, devant, derrière, à côté.',
    'lot.reperes': 'Où est le chat ?',
    'mot.dans': 'dans', 'mot.sur': 'sur', 'mot.sous': 'sous', 'mot.devant': 'devant', 'mot.derriere': 'derrière', 'mot.cote': 'à côté',
  },
  br: {
    titre: 'Pelec’h emañ ar c’hazh ?', // br: à relire
    'variante.reperes.court': 'Merkoù egor', // br: à relire
    'variante.reperes.titre': 'Skritell merkoù egor : e, war, dindan, dirak, a-dreñv, e-kichen', // br: à relire
    'variante.reperes.description': 'C’hwec’h kinnig bihan evit lakaat un dra en e blas : e, war, dindan, dirak, a-dreñv, e-kichen.', // br: à relire
    'lot.reperes': 'Pelec’h emañ ar c’hazh ?', // br: à relire
    'mot.dans': 'e', 'mot.sur': 'war', 'mot.sous': 'dindan', 'mot.devant': 'dirak', 'mot.derriere': 'a-dreñv', 'mot.cote': 'e-kichen', // br: à relire
  },
}
