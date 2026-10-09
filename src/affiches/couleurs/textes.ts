// Les textes des couleurs. Breton : ruz, roz, glas, gwer, mouk, gell, du, gwenn, melen sont ceux du programme de breton (docs/programmes/bretonA1.md, « Al livioù », p. 417) ;
// orañjez et louet sont nouveaux ici. Le tout est à relire.
import type { TextesAffiche } from '../types.ts'

export const TEXTES: TextesAffiche = {
  fr: {
    'titre': 'Les couleurs',
    'variante.couleurs.court': 'Couleurs en images',
    'variante.couleurs.titre': 'Affiche des couleurs : rouge, bleu, jaune, vert…',
    'variante.couleurs.description': 'Les couleurs de base, chacune avec un objet pour la reconnaître ; avec ou sans le noir, le blanc et le gris.',
    'lot.couleurs': 'Les couleurs',
    'mot.rouge': 'rouge',
    'mot.bleu': 'bleu',
    'mot.jaune': 'jaune',
    'mot.vert': 'vert',
    'mot.orange': 'orange',
    'mot.violet': 'violet',
    'mot.rose': 'rose',
    'mot.marron': 'marron',
    'mot.noir': 'noir',
    'mot.blanc': 'blanc',
    'mot.gris': 'gris',
    'reglage.neutres': 'Noir, blanc et gris',
    'valeur.neutres.true': 'Ajoutés',
    'valeur.neutres.false': 'Pas ajoutés',
  },
  br: {
    'titre': 'Al livioù', // br: à relire
    'variante.couleurs.court': 'Livioù e skeudennoù', // br: à relire
    'variante.couleurs.titre': 'Skritell al livioù : ruz, glas, melen, gwer…', // br: à relire
    'variante.couleurs.description': 'Al livioù diazez, pep hini gant un dra evit anavezout anezhi ; gant pe hep an du, ar gwenn hag al louet.', // br: à relire
    'lot.couleurs': 'Al livioù', // br: à relire
    'mot.rouge': 'ruz', // vérifié (Wiktionnaire, 2026-10-09)
    'mot.bleu': 'glas', // vérifié (Wiktionnaire, 2026-10-09)
    'mot.jaune': 'melen', // vérifié (Wiktionnaire, 2026-10-09)
    'mot.vert': 'gwer', // vérifié (Wiktionnaire, 2026-10-09)
    'mot.orange': 'orañjez', // vérifié (Wiktionnaire, 2026-10-09)
    'mot.violet': 'mouk', // vérifié (Wiktionnaire, 2026-10-09)
    'mot.rose': 'roz', // vérifié (Wiktionnaire, 2026-10-09)
    'mot.marron': 'gell', // vérifié (Wiktionnaire, 2026-10-09)
    'mot.noir': 'du', // vérifié (Wiktionnaire, 2026-10-09)
    'mot.blanc': 'gwenn', // vérifié (Wiktionnaire, 2026-10-09)
    'mot.gris': 'louet', // vérifié (Wiktionnaire, 2026-10-09)
    'reglage.neutres': 'Du, gwenn ha louet', // br: à relire
    'valeur.neutres.true': 'Ouzhpennet', // br: à relire
    'valeur.neutres.false': 'Hep ouzhpennañ', // br: à relire
  },
}
