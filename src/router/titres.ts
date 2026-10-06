// Titre du document : un par route (`meta.titre`, clé de texte typée), suivi du nom du site : « Mathématiques — École Primaire ».
// Mis à jour à chaque navigation et à chaque changement de langue de l'interface (en breton sur skoolik).
import { watchEffect } from 'vue'
import type { Router, RouteMeta } from 'vue-router'
import { langueAffichee } from '../langues/etat.ts'
import type { Langue } from '../langues/registre.ts'
import { LANGUES, LANGUE_SOURCE } from '../langues/registre.ts'
import { lireFeuille, texteDeFeuille } from '../langues/traduire.ts'
import { SITE } from '../sites.ts'
import type { Site } from '../sites.ts'

/** Le titre d'une route (sans le nom du site) ; vide si la route n'en déclare pas. */
export function titreDeLaRoute(meta: RouteMeta, langue: Langue): string {
  if (meta.titreLibre) return meta.titreLibre
  if (!meta.titre) return ''
  // comme `traduire`, mais pour une clé connue seulement à l'exécution (aucun titre n'a de paramètre) : la langue, puis le français
  const feuille = lireFeuille(LANGUES[langue].textes, meta.titre) ?? lireFeuille(LANGUES[LANGUE_SOURCE].textes, meta.titre)
  return texteDeFeuille(feuille, langue) ?? ''
}

/** Le titre du document : « <titre de la page> — <site> », ou le titre du site pour une route sans titre. */
export function titreDeDocument(meta: RouteMeta, langue: Langue, site: Site): string {
  const titre = titreDeLaRoute(meta, langue)
  return titre ? `${titre} — ${site.nom}` : site.titre
}

/** Tient `document.title` à jour (une fois, au démarrage). */
export function installerTitres(router: Router, site: Site = SITE): void {
  watchEffect(() => {
    const route = router.currentRoute.value
    if (route.matched.length) document.title = titreDeDocument(route.meta, langueAffichee.value, site)
  })
}
