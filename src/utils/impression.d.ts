// Types de src/utils/impression.js (JavaScript, non vérifié) pour les modules .ts qui l'importent. À tenir à jour avec le .js.
import type { Ref } from 'vue'

export const POLICE_SCRIPT: string
export const POLICE_ATTACHE: string
export type TypePolice = 'attache' | 'script'
export const POLICES_CONNUES: Record<TypePolice, string[]>
export const POLICES_INCLUSES: Record<TypePolice, { id: string, label: string }[]>
export const LIENS_POLICES: { nom: string, url: string, note: string }[]
/** Police ajoutée depuis un fichier, gardée dans le navigateur. */
export interface PolicePerso { id: string, label: string, type: TypePolice, dataUrl: string }
export const policesPerso: Ref<PolicePerso[]>
export function ajouterPolicePerso(fichier: File, type: TypePolice): Promise<string>
export function supprimerPolicePerso(id: string): void
/** @font-face des polices incluses. */
export function cssPolices(): string
export function chargerPolices(): Promise<unknown>
export function largeurTexte(texte: string, police: string, gras?: boolean): number
export function metriquesPolice(police: string): { x: number, majuscule: number, hampe: number, jambage: number }
export function policeInstallee(police: string): boolean
export function echapper(s: unknown): string
export function imprimerDocument(html: string): void
export { FORMATS, dimensionsPage, documentImpression } from './page.js'
