// Les clés de textes d'une affiche suivent une convention : la définition ne les répète pas.
//   titre                          titre imprimé en haut de la feuille
//   variante.<id>.court            nom court de la variante (bouton, carte)
//   variante.<id>.titre            titre de la page de téléchargement
//   variante.<id>.description      description de la page de téléchargement
//   reglage.<cle>                  titre d'un réglage à choix dans le formulaire
//   valeur.<cle>.<valeur>          libellé d'une valeur
export const cleVariante = (variante: string, champ: 'court' | 'titre' | 'description'): string => `variante.${variante}.${champ}`
export const cleReglage = (cle: string): string => `reglage.${cle}`
export const cleValeur = (cle: string, valeur: unknown): string => `valeur.${cle}.${valeur}`
