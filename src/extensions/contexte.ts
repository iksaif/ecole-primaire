// Ce que les extensions donnent à une fiche (`ParamsFiche.extensions[<id>]`) : leurs réglages communs, lus dans le navigateur. Actives ou non : une extension coupée garde ses réglages.
import { EXTENSIONS } from './registre.ts'

export const contextesDeFiche = (): Record<string, unknown> => Object.fromEntries(EXTENSIONS.filter(e => e.contexteFiche).map(e => [e.id, e.contexteFiche!()]))
