// Tous les compteurs, dans l'ordre d'affichage de `npm run qualite` (l'ordre de l'ancien script).
import type { Compteur } from './compteur.ts'
import { compteursApp } from './app.ts'
import { compteursImports } from './imports.ts'
import { compteursTexte } from './texte.ts'
import { compteursRepetes } from './repetes.ts'

const t = compteursTexte, i = compteursImports, a = compteursApp

export const COMPTEURS: Record<string, Compteur> = {
  brEnDur: t.brEnDur,
  importsBr: t.importsBr,
  niveauxEnTexte: t.niveauxEnTexte,
  vuesLongues: t.vuesLongues,
  mathRandomVues: t.mathRandomVues,
  importeursAncienSocle: i.importeursAncienSocle,
  ancienMondeNonReporte: i.ancienMondeNonReporte,
  erreursDeType: a.erreursDeType,
  attentesFixes: t.attentesFixes,
  couverture: a.couverture,
  couvertureMonde: a.couvertureMonde,
  textesRepetes: compteursRepetes.textesRepetes,
}
