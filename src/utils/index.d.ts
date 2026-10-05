// Types de src/utils/index.js (JavaScript, non vérifié) pour les modules .ts qui l'importent. À tenir à jour avec le .js.
import type { Reglages } from '../noyau/types.ts'

export function aleatoire(min: number, max: number): number
export function melanger<T>(tableau: readonly T[]): T[]
/** Mémorise (localStorage, préfixe `ep_`) ; sans effet si le stockage est indisponible. */
export function sauvegarder(cle: string, valeur: unknown): void
/** Valeur mémorisée (JSON), ou `defaut` si elle manque ou si le stockage est indisponible. */
export function charger<T = unknown>(cle: string, defaut?: T | null): T | null
/** Même nature de valeur : tableau, objet, nombre, texte, booléen (null accepte tout). */
export function memeType(valeur: unknown, modele: unknown): boolean
/** Réglages mémorisés : seules les clés du défaut, une valeur d'un autre type reprend le défaut. */
export function chargerReglages<R extends Record<string, unknown> = Reglages>(cle: string, defaut: R): R
/** Valeur mémorisée simple : le défaut si elle manque ou n'a pas le bon type. */
export function chargerValeur<T>(cle: string, defaut: T): T
export function confettis(nb?: number): void
export function normaliser(s: string): string
