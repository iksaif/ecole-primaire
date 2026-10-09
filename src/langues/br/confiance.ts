// Le niveau de confiance de chaque ressource en breton (échelle : src/langues/confiance.ts ; méthode et prompt de (re)tagage :
// docs/confiance-breton/). Une ressource absente de cette table vaut 0 (« non évaluée »). Le niveau est celui du maillon le plus
// faible parmi les textes qui figurent sur la fiche imprimée ; les titres et descriptions du catalogue ne comptent que s'ils sont longs.
// Évaluations de départ (2026-10-09) : prudentes, à revoir avec le prompt.
import type { TableConfiance } from '../confiance.ts'

const MOTS_VERIFIES = 'Contenu imprimé : mots vérifiés (Wiktionnaire, Meurgorf, Kervarker, AGENTS.md). Titres et descriptions du catalogue : courts, automatiques.'

export default {
  'affiche:alphabet': { niveau: 2, le: '2026-10-09', par: 'assistant', note: `Alphabet breton de 25 lettres. ${MOTS_VERIFIES}` },
  'affiche:jours': { niveau: 2, le: '2026-10-09', par: 'assistant', note: `Les sept jours. ${MOTS_VERIFIES}` },
  'affiche:mois': { niveau: 2, le: '2026-10-09', par: 'assistant', note: `Les douze mois et les quatre saisons (repères de l'académie de Rennes). ${MOTS_VERIFIES} Phrase « note.saisons » : automatique.` },
  'affiche:nombres': { niveau: 2, le: '2026-10-09', par: 'assistant', note: `Nombres en breton (système vigésimal). ${MOTS_VERIFIES}` },
  'affiche:bande-numerique': { niveau: 1, le: '2026-10-09', par: 'assistant', note: 'Nombres vérifiés ; noms des objets à compter (avaloù, steredoù…) et réglages : automatiques, courts.' },
} as const satisfies TableConfiance
