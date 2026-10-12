// Les brevets de ceintures — la fiche : le brevet papier d'une ceinture, au seuil et au nombre de questions des réglages communs des ceintures
// (ParamsFiche.ceintures, sinon le défaut : build des PDF publiés, instantanés). Pure (lisible par node).
import { documentFiche, ligneNomDate } from '../../impression/document.ts'
import { estLangue, LANGUE_SOURCE } from '../../langues/registre.ts'
import { traduire } from '../../langues/traduire.ts'
import type { ParamsFiche } from '../../noyau/types.ts'
import type { ReglagesDeDefinition } from '../../noyau/definir.ts'
import type { CleContenu } from '../../langues/catalogue.ts'
import { NB_CEINTURES_BREVET } from '../../ceintures/brevets.ts'
import { DEFAUT_CEINTURES } from '../../ceintures/reglages.ts'
import { CSS_CEINTURES, brevetHtml, ceinturesDe } from '../../ceintures/supports.ts'
import type { DonneesSupport, LibellesBrevet } from '../../ceintures/supports.ts'
import type DEFINITION from './definition.ts'
import type { CONTENU } from './textes.ts'
import type { TirageFiche } from './generateur.ts'

type Cle = CleContenu<typeof CONTENU>

export function fiche({ questions: x, reglages, T, langue, police, cssPolices, ceintures = DEFAUT_CEINTURES }: ParamsFiche<ReglagesDeDefinition<typeof DEFINITION>, TirageFiche, Cle>): string {
  const t = T as (cle: string, params?: Record<string, unknown>) => string
  // les noms des ceintures et le titre de la piste sont ceux de l'interface, dans la langue du contenu
  const l = estLangue(langue) ? langue : LANGUE_SOURCE
  const i = (cle: string): string => (traduire as (l: string, c: string) => string)(l, `ceintures.${cle}`)
  const lignes = x.questions.slice(0, ceintures.questions)
  const bonnes = Math.ceil((lignes.length * ceintures.seuil) / 100)
  const donnees: DonneesSupport = {
    titre: traduire(l, 'tables.titre'),
    // un nom par ceinture de la piste (les objectifs ne sont pas écrits sur le brevet)
    ceintures: ceinturesDe(Array.from({ length: NB_CEINTURES_BREVET[x.piste] }, () => ''), couleur => i(`ceinture.${couleur.id}`), { ...ceintures, nbCeintures: NB_CEINTURES_BREVET[x.piste] }),
    reglages: ceintures,
    prenom: reglages.prenom.trim() || undefined,
    libelles: { prenom: '', classe: '', date: '', signature: '', livret: '', diplome: '', passeport: '', decerne: '', commentFaire: '' },
  }
  const libelles: LibellesBrevet = {
    brevet: t('titre'), consigne: t('consigne', { n: lignes.length, bonnes }), resultat: t('resultat'), validee: t('validee'), pasEncore: t('pasEncore'), corrige: t('corrige'),
  }
  return documentFiche({
    titre: t('titre'), langue, police, cssPolices, css: CSS_CEINTURES, largeur: '700px', marge: '1.2cm',
    corps: `${ligneNomDate(langue)}${brevetHtml(donnees, x.indice, lignes, libelles)}`,
  })
}
