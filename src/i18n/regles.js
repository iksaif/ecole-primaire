// Règles de langue : raccourci de l'ancien monde. Les règles sont dans src/langues/<code>/regles.ts (registre typé).
import { regles as reglesDe, estLangue } from '../langues/registre.ts'

export const regles = langue => reglesDe(estLangue(langue) ? langue : 'fr')
