// Les ceintures — la fiche : le support choisi (livret, ceintures à découper, diplôme, passeport) de la piste, aux couleurs et au dessin des réglages communs
// (ParamsFiche.ceintures, sinon le défaut : build des PDF publiés, instantanés). Pure (lisible par node).
import { documentFiche, ligneNomDate } from '../../impression/document.ts'
import { estLangue, LANGUE_SOURCE } from '../../langues/registre.ts'
import type { Langue } from '../../langues/registre.ts'
import { traduire } from '../../langues/traduire.ts'
import type { ParamsFiche } from '../../noyau/types.ts'
import type { ReglagesDeDefinition } from '../../noyau/definir.ts'
import type { CleContenu } from '../../langues/catalogue.ts'
import { DEFAUT_CEINTURES } from '../../ceintures/reglages.ts'
import { CSS_CEINTURES, bandesHtml, ceinturesDe, diplomeHtml, livretHtml, passeportHtml } from '../../ceintures/supports.ts'
import type { DonneesSupport } from '../../ceintures/supports.ts'
import type DEFINITION from './definition.ts'
import type { CONTENU } from './textes.ts'
import type { TirageFiche } from './generateur.ts'

type Cle = CleContenu<typeof CONTENU>

/** Le titre d'une piste : celui de son exercice (tables, calcul mental, lettres), ou le titre écrit pour la piste libre. */
function titreDeLaPiste(piste: TirageFiche['piste'], titreLibre: string, i: (cle: string) => string, l: Langue): string {
  if (piste === 'tables') return traduire(l, 'tables.titre')
  if (piste === 'calcul-mental') return traduire(l, 'calculMental.titre')
  if (piste === 'lettres') return traduire(l, 'lettres.titre')
  return titreLibre || i('intituleAuto')
}

export function fiche({ questions: x, reglages, T, langue, police, cssPolices, ceintures = DEFAUT_CEINTURES }: ParamsFiche<ReglagesDeDefinition<typeof DEFINITION>, TirageFiche, Cle>): string {
  const t = T as (cle: string, params?: Record<string, unknown>) => string
  // les noms des couleurs, des supports et des pistes sont ceux de l'interface (section `ceintures`), dans la langue du contenu
  const l = estLangue(langue) ? langue : LANGUE_SOURCE
  const i = (cle: string, params?: Record<string, string | number>): string => (traduire as (l: string, c: string, p?: unknown) => string)(l, `ceintures.${cle}`, params)
  const titrePiste = titreDeLaPiste(x.piste, x.titreLibre, i, l)
  const donnees: DonneesSupport = {
    titre: titrePiste,
    ceintures: ceinturesDe(x.objectifs, couleur => i(`ceinture.${couleur.id}`), ceintures),
    reglages: ceintures,
    prenom: reglages.prenom.trim() || undefined,
    libelles: {
      prenom: t('prenom'), classe: traduire(l, 'fichesPretes.classe'), date: t('date'), signature: t('signature'), livret: t('livret'), diplome: i('support.diplome'),
      passeport: i('support.passeport'), decerne: t('decerne'), commentFaire: t('commentFaire'),
    },
  }
  const corps = {
    livret: () => livretHtml(donnees),
    bandes: () => bandesHtml(donnees, reglages.copies),
    diplome: () => diplomeHtml(donnees, reglages.ceinture - 1),
    passeport: () => passeportHtml(donnees),
  }[reglages.support]()
  // le diplôme a sa propre mise en page (une page, sans titre de fiche)
  const h1 = reglages.support === 'diplome' ? null : undefined
  // le livret a sa propre ligne « Prénom / Classe » (.entete) ; les autres supports ont la ligne commune, que l'option « Prénom et date » retire
  const entete = reglages.support === 'livret' ? '' : ligneNomDate(langue)
  return documentFiche({ titre: i(`support.${reglages.support}`), langue, h1, police, cssPolices, css: CSS_CEINTURES, largeur: '700px', marge: '1.2cm', corps: `${entete}${corps}` })
}
