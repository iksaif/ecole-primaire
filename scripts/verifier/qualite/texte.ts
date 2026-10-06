// Compteurs qui lisent le texte des sources (une expression régulière par compteur). Tous « max » : ils ne peuvent que baisser.
//   brEnDur          littéraux 'br' / "br" dans src/ et scripts/, hors src/i18n/ et src/data/languesRegionales.js
//                    (tables { fr, br }, `langue === 'br'`, boucles de langues du build…) : objectif 0 (phase 3)
//   importsBr        fichiers de src/ et scripts/ hors src/i18n/ qui importent un module de i18n/br/
//                    (le noyau, les exemples et scripts/build/fiches/ lisent le catalogue typé src/langues/ : plus aucun import de ce genre)
//   niveauxEnTexte   chaînes qui ne sont qu'une liste de classes (« CE1 · CE2 », « CP → CM2 », '^CP → CM2$'),
//                    hors src/i18n/ : les niveaux doivent être des tableaux (src/data/classes.ts), pas du texte relu
//   vuesLongues      vues de src/views/ de plus de 600 lignes : objectif 0 (fin de phase 2)
//   mathRandomVues   appels à Math.random dans src/views/ : le hasard doit avoir une graine (utils/hasard.ts)
//   attentesFixes    waitForTimeout dans tests/ : attendre un état plutôt qu'une durée
import { compter, lire } from '../../lib/fichiers.ts'
import type { Compteur } from './compteur.ts'
import { code, fichiersDe, horsLangues } from './sources.ts'

const somme = (fichiers: string[], re: RegExp): number => fichiers.reduce((n, f) => n + compter(lire(f), re), 0)

const CLASSE = '(?:PS|MS|GS|CP|CE1|CE2|CM1|CM2)'
const LISTE_CLASSES = new RegExp(`(['"\`])\\^?${CLASSE}(?:\\s*[·→]\\s*${CLASSE})+\\$?\\1`, 'g')

export const compteursTexte: Record<string, Compteur> = {
  brEnDur: () => somme(code.filter(horsLangues), /['"]br['"]/g),
  importsBr: () => code.filter(horsLangues).filter(f => /from\s+['"][^'"]*i18n\/br\//.test(lire(f))).length,
  niveauxEnTexte: () => somme(code.filter(horsLangues), LISTE_CLASSES),
  vuesLongues: () => fichiersDe('src/views').filter(f => f.endsWith('.vue') && lire(f).split('\n').length > 600).length,
  mathRandomVues: () => somme(fichiersDe('src/views'), /Math\.random\b/g),
  attentesFixes: () => somme(fichiersDe('tests'), /waitForTimeout\b/g),
}
