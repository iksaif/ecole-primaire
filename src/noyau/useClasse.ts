// Classe choisie dans la barre du haut ('' : toutes), partagée par toutes les pages et mémorisée sous la clé `classe`
// (la même que l'ancien socle, que lit aussi useReglages).
import { ref, watch } from 'vue'
import type { Ref } from 'vue'
import { chargerValeur, sauvegarder } from '../utils/index.js'
import { NIVEAUX } from '../data/classes.ts'
import type { Classe } from '../data/classes.ts'

const estClasse = (v: unknown): v is Classe => NIVEAUX.some(n => n === v)

const lue = chargerValeur<string>('classe', '')
const classe: Ref<Classe | ''> = ref(estClasse(lue) ? lue : '')
watch(classe, v => sauvegarder('classe', v))

export function useClasse(): Ref<Classe | ''> {
  return classe
}
