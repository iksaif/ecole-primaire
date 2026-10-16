// Le plus lourd — la balance d'une pesée, pour l'écran et la fiche. Pur (lisible par node) : le dessin de la balance est celui de « mesures »
// (src/exercices/mesures/dessins.ts), les objets y sont des emojis OpenMoji.
import type { Traducteur } from '../../noyau/types.ts'
import type { CleContenu } from '../../langues/catalogue.ts'
import { svgBalance } from '../mesures/dessins.ts'
import type { Pesee } from './generateur.ts'
import type { CONTENU } from './textes.ts'

type Cle = CleContenu<typeof CONTENU>

/** Le nom d'un objet (`objet.<emoji>` du catalogue). */
export const nomObjet = (e: string, T: Traducteur<Cle>): string => T(`objet.${e}` as Cle)

/** La balance d'une pesée, avec son texte alternatif (« Balance : plume à gauche, pomme à droite ; le plateau de droite descend »). */
export function htmlPesee(p: Pesee, T: Traducteur<Cle>): string {
  const aria = T('ariaBalance', { gauche: nomObjet(p.gauche, T), droite: nomObjet(p.droite, T), cote: T(p.tilt === 1 ? 'gauche' : 'droite') })
  return svgBalance(p.tilt, [{ kind: 'emoji', e: p.gauche }], [{ kind: 'emoji', e: p.droite }], aria)
}
