// L'affiche de conjugaison (reportée de `main`, src/impression/affiches/conjugaison.js) : un verbe, un bloc par temps, le radical et la
// terminaison en couleur (l'auxiliaire et le participe passé aux temps composés). Formes : src/data/conjugaison.js (celles de l'exercice).
// Programme (src/data/programme.ts, contraintes `conjugaison`) : CP être et avoir au présent ; CE1 être, avoir et 1er groupe aux 4 temps ;
// CE2 + les 8 irréguliers ; CM1 + 2e groupe ; CM2 passé simple et plus-que-parfait.
// Une variante par fiche publiée (slugs de `main`) : chaque verbe aux 4 temps (`<verbe>`), au passé simple et au plus-que-parfait
// (`<verbe>-passe-simple`), et être, avoir au présent seul (`<verbe>-present`). Contenu en français seulement (une version bretonne
// attend un relecteur brittophone). Le formulaire choisit le verbe, puis la série de temps (`axes` des variantes).
import { definirAffiche } from '../definir.ts'
import { D, K } from '../../noyau/ids.ts'
import type { Classe } from '../../data/classes.ts'
import type { CompetenceId } from '../../noyau/types.ts'
import { VERBES, TEMPS_CYCLE, TEMPS_CM2 } from '../../data/conjugaison.js'
import type { ReglagesDeAffiche } from '../types.ts'

type Groupe = 'auxiliaire' | '1er groupe' | '2e groupe' | '3e groupe'
const groupeDe = (verbe: string): Groupe => (VERBES as Record<string, { groupe: Groupe }>)[verbe].groupe

const COMPETENCES: readonly CompetenceId[] = [K.conjugaisonPresentEtreAvoir, K.conjugaison4Temps, K.conjugaisonIrreguliers, K.conjugaison2eGroupe, K.conjugaisonPasseSimple]
// les 4 temps du cycle 2 : classes et compétence selon le groupe du verbe
const CLASSES_GROUPE: Readonly<Record<Groupe, readonly Classe[]>> = {
  auxiliaire: ['ce1', 'ce2', 'cm1', 'cm2'], '1er groupe': ['ce1', 'ce2', 'cm1', 'cm2'], '3e groupe': ['ce2', 'cm1', 'cm2'], '2e groupe': ['cm1', 'cm2'],
}
const COMPETENCES_GROUPE: Readonly<Record<Groupe, readonly CompetenceId[]>> = {
  auxiliaire: [K.conjugaisonPresentEtreAvoir, K.conjugaison4Temps], '1er groupe': [K.conjugaison4Temps],
  '3e groupe': [K.conjugaisonIrreguliers], '2e groupe': [K.conjugaison2eGroupe],
}
/** `sauf` : les compétences de l'affiche que cette variante ne travaille pas. */
const sauf = (gardees: readonly CompetenceId[]): CompetenceId[] => COMPETENCES.filter(k => !gardees.includes(k))

function variantes() {
  const res: Record<string, { classes: readonly Classe[], slug: string, sauf: CompetenceId[], reglages: { verbe: string, temps: string[] }, axes: { verbe: string, temps: string } }> = {}
  for (const verbe of Object.keys(VERBES)) {
    const groupe = groupeDe(verbe)
    res[verbe] = { classes: CLASSES_GROUPE[groupe], slug: `affiche-conjugaison-${verbe}`, sauf: sauf(COMPETENCES_GROUPE[groupe]), reglages: { verbe, temps: [...TEMPS_CYCLE] }, axes: { verbe, temps: 'cycle' } }
    res[`${verbe}-passe-simple`] = { classes: ['cm2'], slug: `affiche-conjugaison-${verbe}-passe-simple`, sauf: sauf([K.conjugaisonPasseSimple]), reglages: { verbe, temps: [...TEMPS_CM2] }, axes: { verbe, temps: 'cm2' } }
  }
  // être et avoir au présent seul : le CP n'apprend que ce temps
  for (const verbe of ['etre', 'avoir']) {
    res[`${verbe}-present`] = { classes: ['cp', 'ce1'], slug: `affiche-conjugaison-${verbe}-present`, sauf: sauf([K.conjugaisonPresentEtreAvoir]), reglages: { verbe, temps: ['present'] }, axes: { verbe, temps: 'present' } }
  }
  return res
}

const definition = definirAffiche({
  id: 'conjugaison',
  domaine: D.grammaire,
  emoji: '✍️',
  orientations: ['portrait', 'landscape'],
  langues: ['fr'],
  competences: COMPETENCES,
  variantes,
})

export default definition
export type Reglages = ReglagesDeAffiche<typeof definition>
