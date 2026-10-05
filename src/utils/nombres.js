// Écriture des nombres en lettres : raccourci de l'ancien monde (le code est dans src/langues/<code>/nombres.ts).
export { enLettresFr } from '../langues/fr/nombres.ts'
export { enLettresBr } from '../langues/br/nombres.ts'

// Décomposition en centaines / dizaines / unités
export function decomposer(n) {
  return {
    milliers: Math.floor(n / 1000) % 10,
    centaines: Math.floor(n / 100) % 10,
    dizaines: Math.floor(n / 10) % 10,
    unites: n % 10,
  }
}
