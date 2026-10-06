// Les modes de langue que le site propose, prêts à afficher : « Français », « Français + Brezhoneg », « Brezhoneg seul »
// (un couple d'entrées par langue régionale du site ; aucune entrée si le site n'en propose pas). Lit et écrit le contexte.
import { computed } from 'vue'
import type { ComputedRef } from 'vue'
import { useContexte } from '../contexte/useContexte.ts'
import type { Mode } from '../contexte/types.ts'
import type { Langue } from '../langues/registre.ts'
import { useLangue } from '../langues/useLangue.ts'
import { useLangueRegionale } from '../langues/useLangueRegionale.ts'

export interface OptionLangue {
  readonly id: string
  readonly mode: Mode
  readonly regionale?: Langue
  readonly titre: string
  readonly description: string
  /** drapeaux de l'entrée : le français, la langue régionale, ou les deux */
  readonly drapeaux: readonly Langue[]
  readonly actif: boolean
}

const majuscule = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1)

export function useModesLangue(): { options: ComputedRef<OptionLangue[]>, actuelle: ComputedRef<OptionLangue | undefined>, choisir: (o: OptionLangue) => Promise<boolean> } {
  const { t } = useLangue()
  const { contexte, choisirMode } = useContexte()
  const { proposees } = useLangueRegionale()

  const options = computed<OptionLangue[]>(() => {
    const { mode, regionale } = contexte.value
    return [
      { id: 'fr', mode: 'fr', titre: t('shell.langue.fr'), description: t('shell.langue.frDesc'), drapeaux: ['fr'], actif: mode === 'fr' },
      ...proposees.flatMap((l): OptionLangue[] => {
        const nom = majuscule(l.nomLocal)
        const actifSi = (m: Mode): boolean => mode === m && regionale === l.code
        return [
          { id: `bilingue-${l.code}`, mode: 'bilingue', regionale: l.code, titre: t('shell.langue.bilingue', { langue: nom }),
            description: t('shell.langue.bilingueDesc'), drapeaux: ['fr', l.code], actif: actifSi('bilingue') },
          { id: `regionale-${l.code}`, mode: 'regionale', regionale: l.code, titre: t('shell.langue.regionale', { langue: nom }),
            description: t('shell.langue.regionaleDesc', { langue: l.nomLocal }), drapeaux: [l.code], actif: actifSi('regionale') },
        ]
      }),
    ]
  })
  const actuelle = computed(() => options.value.find(o => o.actif))
  return { options, actuelle, choisir: o => choisirMode(o.mode, o.regionale) }
}

