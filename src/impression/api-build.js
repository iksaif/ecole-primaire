// Point d'entrée utilisé par scripts/telechargements.mjs (Chrome sans interface) pour
// générer les PDF avec exactement le même code que l'app. Chargé seulement avec ?generation.
import { chargerPolices, ajouterPolicePerso, POLICE_ATTACHE, POLICE_SCRIPT } from '../utils/impression'
import { genererEcriture } from './ecriture'
import { TELECHARGEMENTS as FICHES, catalogueDuSite } from './catalogue'
import { genererAffichesProgramme } from './affichesProgramme'

const GENERATEURS = { ecriture: genererEcriture, affiche: genererAffichesProgramme }
const TELECHARGEMENTS = FICHES
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

export function catalogue(langues = ['fr']) {
  return catalogueDuSite(langues)
}

export function generer(slug) {
  const t = TELECHARGEMENTS.find(x => x.slug === slug)
  return GENERATEURS[t.type](t.config, polices)
}

// Même fiche avec des réglages modifiés (tests : l'autre orientation, le format A3…)
export function genererAvec(slug, reglages) {
  const t = TELECHARGEMENTS.find(x => x.slug === slug)
  return GENERATEURS[t.type]({ ...t.config, ...reglages }, polices)
}
