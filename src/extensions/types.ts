// Une extension : une fonctionnalité en option, cachée par défaut, qui s'accroche aux parties communes (fiches, réglages, listes) sans que celles-ci la connaissent.
// Pur (aucun import de Vue ni de composant) : lu par node (tests, build des fiches) comme par le navigateur ; les composants s'importent à la demande.
import type { Component } from 'vue'
import type { NomIcone } from '../images/icones.ts'
import type { CleTexte } from '../langues/traduire.ts'

/** Un composant chargé à la demande (`() => import('./X.vue')`) : le registre reste lisible par node. */
export type ComposantParesseux = () => Promise<{ default: Component }>

/** Les textes de l'interface de l'extension pour son activation (onglet « Appareil » des réglages). */
export interface TextesActivation {
  titre: CleTexte
  aide: CleTexte
  /** « Proposer … sur cet appareil » */
  case: CleTexte
  /** « Ce site les propose d'office. » */
  parSite: CleTexte
}

/** Un bloc de la page des réglages (onglet « Fiches »), montré seulement quand l'extension est active. */
export interface BlocReglages {
  icone: NomIcone
  titre: CleTexte
  aide: CleTexte
  composant: ComposantParesseux
}

export interface Extension {
  /** minuscules et tirets : c'est aussi le paramètre d'adresse qui l'active (`?<id>=oui`, `?<id>=non`) et la clé du réglage de l'appareil */
  id: string
  activation: TextesActivation
  /** les ressources qu'elle ajoute au catalogue (`exercice:<id>`, `affiche:<id>`) : masquées des listes tant qu'elle n'est pas active */
  ressources: readonly string[]
  /** choix montré dans « Sur la fiche » des exercices qui l'acceptent (`extensions` de leur définition) */
  optionsFiche?: ComposantParesseux
  /** ce que reçoit la mise en page d'une fiche (`ParamsFiche.extensions[<id>]`) : les réglages de l'extension, lus dans le navigateur */
  contexteFiche?: () => unknown
  /** bloc de la page des réglages */
  reglages?: BlocReglages
}
