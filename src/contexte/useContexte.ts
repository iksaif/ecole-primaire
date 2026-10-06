// Le contexte de l'utilisateur (classes, mode de langue, vue, références, profil), partagé par toute l'application.
//   const { contexte, choisirClasses, choisirMode } = useContexte()
//   contexte.value.classes        // réactif : ['ce1'] ; jamais vide
//   await choisirClasses(['ce2']) // false si le profil ou le verrou l'interdit
// Priorité (plan 13) : l'ADRESSE d'abord, puis le réglage mémorisé sur l'appareil, puis les défauts du site (src/sites.ts).
//   - lire ne modifie jamais le réglage mémorisé : ouvrir `/maths?classes=cm1` n'oublie pas la classe habituelle ;
//   - un changement fait par l'utilisateur (les actions ci-dessous) met à jour l'adresse (`router.replace` : pas de pile
//     d'historique pour un changement de contexte) ET le réglage mémorisé ;
//   - le profil est un réglage d'appareil : il n'apparaît jamais dans l'adresse.
// `installerContexte(router)` se fait une fois (main.ts) ; `useContexte()` est ensuite utilisable partout (composant ou module).
import { computed, effectScope, ref, watchEffect } from 'vue'
import type { ComputedRef, EffectScope, Ref } from 'vue'
import type { Router } from 'vue-router'
import { charger, sauvegarder } from '../utils/index.js'
import type { Classe } from '../data/classes.ts'
import { langueImposee } from '../langues/etat.ts'
import type { Langue } from '../langues/registre.ts'
import { SITE } from '../sites.ts'
import type { Site } from '../sites.ts'
import { lienDuTableau, lienPourLesFamilles } from './partage.ts'
import { PROFIL_PAR_DEFAUT, classesMigrees, classesPourProfil, defautsContexte, modeMigre, plusieursClasses } from './regles.ts'
import type { Memorise } from './regles.ts'
import { MODES, PROFILS, VUES } from './types.ts'
import type { Contexte, Mode, Profil, Vue } from './types.ts'
import { ecrireContexteDansLAdresse, fusionnerParamsContexte, lireContexteDeLAdresse } from './url.ts'
import type { ContexteAdresse, DefautsContexte, QueryBrute } from './url.ts'

export interface UtilisationContexte {
  /** le contexte courant : adresse d'abord, sinon réglage mémorisé, sinon défauts du site */
  contexte: ComputedRef<Contexte>
  /** défauts en vigueur (réglage mémorisé sur les valeurs du site) : ce que l'adresse n'écrit pas */
  defauts: ComputedRef<DefautsContexte>
  /** profil enfant : la classe est verrouillée tant qu'on n'a pas appelé `deverrouillerClasse()` */
  verrouillee: ComputedRef<boolean>
  /** le profil permet de choisir plusieurs classes (enseignant) */
  plusieursClasses: ComputedRef<boolean>
  /** mode « langue régionale seule » : l'interface est dans la langue régionale si le site la propose ; `choisirMode('fr')` ramène au français */
  modeRegionalSeul: ComputedRef<boolean>
  /** Choisit les classes (une seule pour un parent ou un enfant : la dernière citée). `false` : refusé (verrou, liste vide). */
  choisirClasses: (classes: readonly Classe[]) => Promise<boolean>
  /** Ajoute / retire une classe : profil enseignant seulement (`false` sinon, ou si on retirait la dernière). */
  ajouterClasse: (classe: Classe) => Promise<boolean>
  retirerClasse: (classe: Classe) => Promise<boolean>
  /** Mode de langue ; `regionale` : la langue régionale voulue quand le site en propose plusieurs. `false` : le site n'en propose pas. */
  choisirMode: (mode: Mode, regionale?: Langue) => Promise<boolean>
  choisirVue: (vue: Vue) => Promise<void>
  basculerRefs: () => Promise<void>
  /** Profil de l'appareil (mémorisé, jamais dans l'adresse). Referme le verrou de l'enfant. */
  choisirProfil: (profil: Profil) => void
  /** Lève le verrou de classe de l'enfant pour la durée de la session (jusqu'au rechargement de la page). */
  deverrouillerClasse: () => void
  /** Le contexte qu'une adresse (`route.query`) donnerait, avec les défauts et le profil d'aujourd'hui. */
  contexteDeLAdresse: (route: { readonly query: QueryBrute }) => Contexte
  /** Adresse absolue de la page courante « pour les familles » (classe, mode de langue) / avec tout l'état du tableau. */
  lienFamilles: () => string
  lienTableau: () => string
}

interface Etat {
  readonly router: Router
  readonly site: Site
  readonly scope: EffectScope
  readonly memo: Ref<Memorise>
  readonly profil: Ref<Profil>
  readonly deverrouille: Ref<boolean>
  readonly utilisation: UtilisationContexte
}
let etat: Etat | null = null

// ── réglages mémorisés ──

const lireMemorise = (site: Site): Memorise => {
  const classes = classesMigrees(charger('classes'), charger('classe'))
  const mode = MODES.find(m => m === charger('mode')) ?? modeMigre(charger('langue_regionale'))
  return {
    classes: classes.length ? classes : null,
    mode,
    regionale: site.languesRegionales.find(l => l === charger('reg')) ?? null,
    vue: VUES.find(v => v === charger('vue')) ?? null,
    refs: typeof charger('refs') === 'boolean' ? charger<boolean>('refs') : null,
  }
}

const ecrireMemorise = (m: Memorise): void => {
  const [premiere] = m.classes ?? []
  // `classe` : l'ancienne clé (une seule classe), que lit encore l'ancien socle
  if (m.classes && premiere) { sauvegarder('classes', m.classes); sauvegarder('classe', premiere) }
  if (m.mode) sauvegarder('mode', m.mode)
  if (m.regionale) sauvegarder('reg', m.regionale)
  if (m.vue) sauvegarder('vue', m.vue)
  if (m.refs !== null) sauvegarder('refs', m.refs)
}

const lireProfil = (): Profil => PROFILS.find(p => p === charger('profil')) ?? PROFIL_PAR_DEFAUT

// ── installation ──

/**
 * Branche le contexte sur le routeur (une fois, avant de monter l'application). `site` : les défauts à appliquer (celui du build).
 * Une seconde installation remplace la première (tests).
 */
export function installerContexte(router: Router, site: Site = SITE): void {
  etat?.scope.stop()
  langueImposee.value = null
  const scope = effectScope(true)
  etat = scope.run((): Etat => {
    const memo = ref(lireMemorise(site))
    const profil = ref(lireProfil())
    const deverrouille = ref(false)
    const defauts = computed(() => defautsContexte(site, memo.value))
    const requete = (): QueryBrute => router.currentRoute.value.query
    const contexteDe = (query: QueryBrute): Contexte => ({ ...lireContexteDeLAdresse(query, defauts.value), profil: profil.value })
    const contexte = computed(() => contexteDe(requete()))
    const verrouillee = computed(() => profil.value === 'enfant' && !deverrouille.value)
    const modeRegionalSeul = computed(() => contexte.value.mode === 'regionale')

    // mode « langue régionale seule » : l'interface passe dans la langue régionale si le site la propose (sans toucher au réglage)
    watchEffect(() => {
      const r = contexte.value.regionale
      langueImposee.value = modeRegionalSeul.value && r && site.languesInterface.includes(r) ? r : null
    })

    /** Applique un changement voulu par l'utilisateur : réglage mémorisé et adresse (replace), l'adresse gardant ses autres écarts. */
    const changer = async (memorise: Partial<Memorise>, adresse: Partial<ContexteAdresse>): Promise<void> => {
      const avant = contexte.value
      memo.value = { ...memo.value, ...memorise }
      ecrireMemorise(memo.value)
      const apres: ContexteAdresse = { ...avant, ...adresse }
      const query = fusionnerParamsContexte(requete(), ecrireContexteDansLAdresse(apres, defauts.value))
      await router.replace({ query })
    }
    const fixerClasses = async (demandees: readonly unknown[]): Promise<boolean> => {
      const classes = classesPourProfil(profil.value, demandees)
      if (verrouillee.value || !classes.length) return false
      await changer({ classes }, { classes })
      return true
    }
    const racine = typeof location === 'undefined' ? site.url : `${location.origin}${import.meta.env?.BASE_URL ?? '/'}`
    const routeCourante = () => router.currentRoute.value

    const utilisation: UtilisationContexte = {
      contexte,
      defauts,
      verrouillee,
      plusieursClasses: computed(() => plusieursClasses(profil.value)),
      modeRegionalSeul,
      choisirClasses: fixerClasses,
      ajouterClasse: async classe => plusieursClasses(profil.value) && fixerClasses([...contexte.value.classes, classe]),
      retirerClasse: async classe => plusieursClasses(profil.value) && fixerClasses(contexte.value.classes.filter(c => c !== classe)),
      choisirMode: async (mode, regionale) => {
        const choisie = site.languesRegionales.find(l => l === regionale)
        if (mode !== 'fr' && !site.languesRegionales.length) return false
        await changer({ mode, ...(choisie && { regionale: choisie }) }, { mode, regionale: mode === 'fr' ? null : choisie ?? contexte.value.regionale })
        return true
      },
      choisirVue: vue => changer({ vue }, { vue }),
      basculerRefs: () => changer({ refs: !contexte.value.refs }, { refs: !contexte.value.refs }),
      choisirProfil: p => {
        profil.value = p
        deverrouille.value = false
        sauvegarder('profil', p)
        // un parent ou un enfant n'a qu'une classe mémorisée (l'adresse, elle, garde ce qu'elle dit)
        const classes = memo.value.classes
        if (classes && classes.length > 1 && !plusieursClasses(p)) {
          memo.value = { ...memo.value, classes: classes.slice(0, 1) }
          ecrireMemorise(memo.value)
        }
      },
      deverrouillerClasse: () => { deverrouille.value = true },
      contexteDeLAdresse: route => contexteDe(route.query),
      lienFamilles: () => lienPourLesFamilles(routeCourante(), contexte.value, { racine, site }),
      lienTableau: () => lienDuTableau(routeCourante(), contexte.value, { racine, site }),
    }
    return { router, site, scope, memo, profil, deverrouille, utilisation }
  }) ?? null
}

/** Le contexte partagé. `installerContexte(router)` doit avoir été appelé (main.ts). */
export function useContexte(): UtilisationContexte {
  if (!etat) throw new Error('useContexte : installerContexte(router) n’a pas été appelé')
  return etat.utilisation
}
