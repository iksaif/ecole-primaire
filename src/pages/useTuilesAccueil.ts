// Ce que montrent les tuiles de l'accueil : une par matière (avec le nombre de ressources des classes choisies), et la langue
// régionale quand elle est active. Partagé par les dispositions enfant et adulte.
import { computed } from 'vue'
import { useContexte } from '../contexte/useContexte.ts'
import { LANGUES, nomDeLangue } from '../langues/registre.ts'
import type { Langue } from '../langues/registre.ts'
import { contenu } from '../langues/traduire.ts'
import { useLangue } from '../langues/useLangue.ts'
import { cheminRegional } from '../router/chemins.ts'
import { texteClasses } from '../data/classes.ts'
import { EMOJI_MATIERE, majuscule } from '../ressources/composants/presentation.ts'
import { filtrerParClasses, filtrerParMode } from '../ressources/filtres.ts'
import { useRessources } from '../ressources/useRessources.ts'
import { MATIERES_PAGE, cheminMatiere } from './matieres.ts'
import type { MatierePage } from './matieres.ts'

/** Le liseré de couleur de chaque matière (ceux de la maquette). */
const COULEUR: Readonly<Record<MatierePage, string>> = { maths: '#4a90e2', francais: '#5cb85c', monde: '#9b59b6' }
const COULEUR_REGIONALE = '#f39c12'

export function useTuilesAccueil() {
  const { t, langueAffichee } = useLangue()
  const { contexte } = useContexte()
  const { catalogue } = useRessources()
  const classes = computed(() => contexte.value.classes)
  const classesTexte = computed(() => texteClasses(classes.value))
  const visibles = computed(() => filtrerParMode(catalogue.value, contexte.value.mode, contexte.value.regionale))
  const compte = (m: MatierePage): number => filtrerParClasses(visibles.value.filter(r => r.matiere === m), classes.value).length
  /** le nom dans la langue régionale active, à côté du nom affiché (« Matematik » sous « Maths ») ; rien si c'est la langue affichée */
  const sousTitre = (m: MatierePage): string | null => {
    const l: Langue | null = contexte.value.regionale
    return l && l !== langueAffichee.value ? contenu(l).t(`accueil.tuile.${m}`) : null
  }
  const tuiles = computed(() => MATIERES_PAGE.map(m => ({
    matiere: m, to: cheminMatiere(m), emoji: EMOJI_MATIERE[m], titre: t(`accueil.tuile.${m}`), couleur: COULEUR[m], n: compte(m),
    sous: sousTitre(m), langueSous: contexte.value.regionale ? LANGUES[contexte.value.regionale].bcp47 : undefined,
  })))
  const regionale = computed(() => {
    const code = contexte.value.regionale
    if (!code) return null
    // comme « Maths » et « Matematik » : le nom de la langue dans la langue affichée (« Breton »), et son nom local dessous (« Brezhoneg ») quand ils diffèrent
    const titre = majuscule(nomDeLangue(code, langueAffichee.value))
    const local = majuscule(LANGUES[code].nomLocal)
    return { code, to: cheminRegional(code), titre, sous: local === titre ? null : local, langueSous: LANGUES[code].bcp47, couleur: COULEUR_REGIONALE }
  })
  return { tuiles, regionale, classes, classesTexte, t }
}
