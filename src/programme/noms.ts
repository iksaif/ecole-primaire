// Noms affichés par les pages du programme, purs (lisibles par node).
import { domaineDe } from '../data/programme.ts'
import { LANGUES, LANGUE_SOURCE } from '../langues/registre.ts'
import type { Langue } from '../langues/registre.ts'
import { lireFeuille } from '../langues/traduire.ts'

/** Le nom court d'un domaine dans une langue (section `domaines` de l'interface) ; celui du programme à défaut (domaines d'exemple). */
export function nomDuDomaine(id: string, langue: Langue): string {
  const nom = lireFeuille(LANGUES[langue].textes, `domaines.${id}`) ?? lireFeuille(LANGUES[LANGUE_SOURCE].textes, `domaines.${id}`)
  return typeof nom === 'string' ? nom : domaineDe(id)?.court ?? id
}
