// Types de src/i18n/index.js (JavaScript, non vérifié) pour les modules .ts qui l'importent. À tenir à jour avec le .js.
import type { Ref } from 'vue'

/** Paramètres d'interpolation ({n} dans le texte) et de pluriel. */
export type ParamsTexte = Record<string, unknown>
/** Catalogues par langue : { fr: { cle: texte }, br: { … } }. */
export type Catalogues = Record<string, Record<string, unknown> | undefined>

export const LANGUES_INTERFACE: readonly { id: string, label: string, court: string }[]
/** Langue de l'interface ('fr' | 'br'), mémorisée. */
export const langue: Ref<string>
export function traduire(messages: Catalogues, cle: string, params?: ParamsTexte, l?: string): string
/** Textes de contenu (énoncés, fiches) dans une langue qui peut différer de l'interface. */
export function contenu(messages: Catalogues, langueDe?: string | (() => string)): { t: (cle: string, params?: ParamsTexte) => string, langue: () => string }
/** Exécute fn() en rendant tous les t() de useI18n dans la langue l. */
export function enLangue<T>(l: string, fn: () => T): T
export function useI18n(messages?: Catalogues): {
  langue: Ref<string>
  t: (cle: string, params?: ParamsTexte) => string
  tr: <T>(valeurs?: Record<string, T>) => T | undefined
}
