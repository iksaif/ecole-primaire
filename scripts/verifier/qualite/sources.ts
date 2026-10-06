// Les fichiers que lisent les compteurs, listés une fois (ils ne changent pas pendant l'exécution).
import { listerFichiers } from '../../lib/fichiers.ts'

export const EXTENSIONS_CODE = ['js', 'mjs', 'ts', 'vue'] as const

/** Le code de src/ et scripts/ : ce que comptent les compteurs de texte. Les compteurs eux-mêmes en sont exclus (leurs expressions citent ce qu'ils cherchent). */
export const code: string[] = [...listerFichiers('src', EXTENSIONS_CODE), ...listerFichiers('scripts', EXTENSIONS_CODE)]
  .filter(f => !f.startsWith('scripts/verifier/qualite'))

export const fichiersDe = (dossier: string): string[] => listerFichiers(dossier, EXTENSIONS_CODE)

/** Hors des endroits où les langues sont nommées : catalogues et registre de langues, données régionales, réglages des sites. */
export const horsLangues = (f: string): boolean =>
  !f.startsWith('src/i18n/') && !f.startsWith('src/langues/') && f !== 'src/data/languesRegionales.js' && f !== 'src/sites.ts'
