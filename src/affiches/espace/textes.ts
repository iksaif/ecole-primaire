// Les textes des repères d'espace. Le breton est nouveau : à relire (dans = e, war = sur, dindan = sous, dirak = devant, a-dreñv = derrière, e-kichen = à côté).
import type { TextesAffiche } from '../types.ts'

export const TEXTES: TextesAffiche = {
  fr: {
    titre: 'Où est le chat ?',
    'variante.reperes.court': 'Repères d’espace',
    'variante.reperes.titre': 'Affiche des repères d’espace : dans, sur, sous, devant, derrière, à côté',
    'variante.reperes.description': 'Six petites scènes pour situer un objet : dans, sur, sous, devant, derrière, à côté.',
    'lot.reperes': 'Où est le chat ?',
    'variante.reperes-plus.court': 'Repères d’espace, avec gauche et droite',
    'variante.reperes-plus.titre': 'Affiche des repères d’espace : dans, sur, sous, devant, derrière, à côté, entre, à gauche, à droite',
    'variante.reperes-plus.description': 'Neuf petites scènes pour situer un objet, dont entre, à gauche et à droite (à partir de la MS).',
    'lot.reperes-plus': 'Où est le chat ? (suite)',
    'mot.entre': 'entre', 'mot.gauche': 'à gauche', 'mot.droite': 'à droite',
    'mot.dans': 'dans', 'mot.sur': 'sur', 'mot.sous': 'sous', 'mot.devant': 'devant', 'mot.derriere': 'derrière', 'mot.cote': 'à côté',
  },
  br: {
    titre: 'Pelec’h emañ ar c’hazh ?', // br: à relire
    'variante.reperes.court': 'Merkoù egor', // br: à relire
    'variante.reperes.titre': 'Skritell merkoù egor : e, war, dindan, dirak, a-dreñv, e-kichen', // br: à relire
    'variante.reperes.description': 'C’hwec’h kinnig bihan evit lakaat un dra en e blas : e, war, dindan, dirak, a-dreñv, e-kichen.', // br: à relire
    'lot.reperes': 'Pelec’h emañ ar c’hazh ?', // br: à relire
    'variante.reperes-plus.court': 'Merkoù egor, gant kleiz ha dehou', // br: à relire
    'variante.reperes-plus.titre': 'Skritell merkoù egor : e, war, dindan, dirak, a-dreñv, e-kichen, etre, a-gleiz, a-zehou', // br: à relire
    'variante.reperes-plus.description': 'Nav kinnig bihan evit lakaat un dra en e blas, etre ha a-gleiz hag a-zehou en o zouez (adalek ar skol-vamm krenn).', // br: à relire
    'lot.reperes-plus': 'Pelec’h emañ ar c’hazh ? (derc’hel)', // br: à relire
    'mot.entre': 'etre', 'mot.gauche': 'a-gleiz', 'mot.droite': 'a-zehou', // vérifié (Wiktionnaire, 2026-10-09)
    'mot.dans': 'e-barzh', 'mot.sur': 'war', 'mot.sous': 'dindan', 'mot.devant': 'dirak', 'mot.derriere': 'a-dreñv', 'mot.cote': 'e-kichen', // vérifié (Wiktionnaire, 2026-10-09)
  },
}
