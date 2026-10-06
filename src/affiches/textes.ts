// Les clés de textes d'une affiche suivent une convention : la définition ne les répète pas.
//   titre                          titre imprimé en haut de la feuille
//   variante.<id>.court            nom court de la variante (bouton, carte)
//   variante.<id>.titre            titre de la page de téléchargement
//   variante.<id>.description      description de la page de téléchargement
//   reglage.<cle>                  titre d'un réglage à choix dans le formulaire
//   valeur.<cle>.<valeur>          libellé d'une valeur
//   groupe.<id>                    titre d'un groupe du formulaire
//   aide.<cle>                     aide sous un réglage (facultative : sans texte, pas d'aide)
//   police.<type>                  nom d'un type de police (mode parType)
import { LANGUES, LANGUE_SOURCE, estLangue } from '../langues/registre.ts'
import { lireFeuille, texteDeFeuille } from '../langues/traduire.ts'
import type { Traducteur } from '../noyau/types.ts'
import type { TextesAffiche } from './types.ts'
export const cleVariante = (variante: string, champ: 'court' | 'titre' | 'description'): string => `variante.${variante}.${champ}`
export const cleReglage = (cle: string): string => `reglage.${cle}`
export const cleValeur = (cle: string, valeur: unknown): string => `valeur.${cle}.${valeur}`
export const cleGroupe = (id: string): string => `groupe.${id}`
export const cleAide = (cle: string): string => `aide.${cle}`
export const clePolice = (type: string): string => `police.${type}`

/**
 * Le T d'une affiche dans une langue de contenu : `T(cle, params)` lit les textes de l'affiche (clés à points ci-dessus, dont
 * certaines sont calculées : elles ne peuvent pas être typées une à une), sinon les mots communs (section `communs`), sinon le
 * français ; la clé elle-même si rien n'est trouvé (le formulaire s'en sert pour savoir qu'une aide est absente).
 */
export function traducteurAffiche(textes: TextesAffiche, langue: string): Traducteur {
  const l = estLangue(langue) ? langue : LANGUE_SOURCE
  return (cle, params) => {
    const v = textes[l]?.[cle] ?? lireFeuille(LANGUES[l].textes, `communs.${cle}`) ?? textes[LANGUE_SOURCE]?.[cle] ?? lireFeuille(LANGUES[LANGUE_SOURCE].textes, `communs.${cle}`)
    return texteDeFeuille(v, l, params) ?? cle
  }
}
