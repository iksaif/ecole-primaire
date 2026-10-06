// Le contrat d'un compteur de qualité : une fonction sans argument qui rend un nombre, avec au besoin un détail à afficher.
// Son SENS (max : ne peut que baisser, min : ne peut que monter) n'est pas ici : il est dans qualite-seuils.json, qui range
// chaque compteur sous « max » ou « min ».
export type Resultat = number | { valeur: number, detail?: string }
export type Compteur = () => Resultat | Promise<Resultat>
