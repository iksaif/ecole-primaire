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
export const cleVariante = (variante: string, champ: 'court' | 'titre' | 'description'): string => `variante.${variante}.${champ}`
export const cleReglage = (cle: string): string => `reglage.${cle}`
export const cleValeur = (cle: string, valeur: unknown): string => `valeur.${cle}.${valeur}`
export const cleGroupe = (id: string): string => `groupe.${id}`
export const cleAide = (cle: string): string => `aide.${cle}`
export const clePolice = (type: string): string => `police.${type}`
