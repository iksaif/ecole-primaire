// Point d'entrée utilisé par scripts/telechargements.mjs (Chrome sans interface) pour
// générer les PDF avec exactement le même code que l'app. Chargé seulement avec ?generation.
import { chargerPolices, ajouterPolicePerso, POLICE_ATTACHE, POLICE_SCRIPT } from '../utils/impression'
import { genererEcriture } from './ecriture'
import { genererNombres } from './nombres'
import { TELECHARGEMENTS as FICHES, catalogueDuSite } from './catalogue'
import { genererCalcul, TELECHARGEMENTS_CALCUL } from './calcul'
import { genererAffichesProgramme } from './affichesProgramme'

const GENERATEURS = { ecriture: genererEcriture, nombres: genererNombres, calcul: genererCalcul, affiche: genererAffichesProgramme }
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

export function catalogue(langues = ['fr']) {
  const duSite = liste => liste.filter(t => t.langues.some(l => langues.includes(l)))
  return [...catalogueDuSite(langues), ...duSite(CALCUL)]
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
