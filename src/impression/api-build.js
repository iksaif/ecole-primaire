// Point d'entrée utilisé par scripts/telechargements.mjs (Chrome sans interface) pour
// générer les PDF avec exactement le même code que l'app. Chargé seulement avec ?generation.
import { chargerPolices, ajouterPolicePerso, POLICE_ATTACHE, POLICE_SCRIPT } from '../utils/impression'
import { genererEcriture } from './ecriture'
import { genererAlphabet } from './alphabet'
import { genererNombres } from './nombres'
import { TELECHARGEMENTS as FICHES, catalogueDuSite } from './catalogue'
import { genererCalcul, TELECHARGEMENTS_CALCUL } from './calcul'

const GENERATEURS = { ecriture: genererEcriture, alphabet: genererAlphabet, nombres: genererNombres, calcul: genererCalcul }
// Les fiches de calcul (textes en français) ne sont publiées que sur le site français
const CALCUL = TELECHARGEMENTS_CALCUL.map(t => ({ langues: ['fr'], ...t }))
const TELECHARGEMENTS = [...FICHES, ...CALCUL]
const polices = { attache: POLICE_ATTACHE, script: POLICE_SCRIPT }

export async function preparer() {
  await chargerPolices()
}

// Police locale (fichier non versionné) à utiliser à la place de la police incluse
export async function utiliserPolice(type, nom, dataUrl) {
  const blob = await (await fetch(dataUrl)).blob()
  polices[type] = await ajouterPolicePerso(new File([blob], nom), type)
  await document.fonts.ready
  return polices[type]
}

export function catalogue(langue = 'fr') {
  return [...catalogueDuSite(langue), ...CALCUL.filter(t => t.langues.includes(langue))]
}

export function generer(slug) {
  const t = TELECHARGEMENTS.find(x => x.slug === slug)
  return GENERATEURS[t.type](t.config, polices)
}
