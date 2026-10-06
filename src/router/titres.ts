// Titre du document : un par route (`meta.titre`, clé de texte typée), suivi du nom du site : « Mathématiques — École Primaire ».
// Mis à jour à chaque navigation et à chaque changement de langue de l'interface (en breton sur skoolik).
import { onBeforeUnmount, ref, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import type { Router, RouteMeta } from 'vue-router'
import { langueAffichee } from '../langues/etat.ts'
import type { Langue } from '../langues/registre.ts'
import { LANGUES, LANGUE_SOURCE } from '../langues/registre.ts'
import { lireFeuille, texteDeFeuille } from '../langues/traduire.ts'
import { SITE } from '../sites.ts'
import { poserIndexation } from './canonique.ts'
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

/** Le titre qu'une page pose pour son adresse (une compétence : son intitulé) ; sans effet sur une autre adresse. */
const titreDePage = ref<{ chemin: string, titre: string } | null>(null)

/**
 * Pour une page dont le titre dépend de ses données (`/competence/<id>`) : `titre()` remplace le titre de la route tant que la page
 * est affichée ; une chaîne vide rend le titre de la route. À appeler dans `setup`.
 */
export function useTitreDePage(titre: () => string): void {
  const route = useRoute()
  watchEffect(() => { titreDePage.value = { chemin: route.path, titre: titre() } })
  onBeforeUnmount(() => { titreDePage.value = null })
}

/**
 * Tient `document.title`, l'adresse canonique et `noindex` à jour (une fois, au démarrage). Une page statique (scripts/statique/,
 * `<html data-statique>`) a déjà son titre et son canonical, propres à la fiche : on n'y touche pas avant la première navigation.
 */
export function installerTitres(router: Router, site: Site = SITE, urlSite: string = import.meta.env.VITE_SITE_URL || site.url): void {
  let gardeStatique = document.documentElement.hasAttribute('data-statique')
  let cheminStatique = ''
  watchEffect(() => {
    const route = router.currentRoute.value
    if (!route.matched.length) return
    if (gardeStatique) {
      cheminStatique ||= route.path
      if (route.path === cheminStatique) return
      gardeStatique = false
    }
    const propre = titreDePage.value?.chemin === route.path ? titreDePage.value.titre : ''
    document.title = propre ? `${propre} — ${site.nom}` : titreDeDocument(route.meta, langueAffichee.value, site)
    poserIndexation(route, urlSite)
  })
}
