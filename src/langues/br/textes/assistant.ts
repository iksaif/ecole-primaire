// Textes de l'interface — gweladenn heñchet ar wech kentañ (breton). Traduction automatique : voir nav.ts.
import type { Traductions } from '../../types.ts'
import type fr from '../../fr/textes/assistant.ts'

export default {
  etape: 'Pazenn {n} war {total}', // br: à relire
  fermer: 'Serriñ ar weladenn heñchet', // br: à relire
  passer: 'Tremen ar weladenn', // br: à relire
  precedent: '← A-raok', // br: à relire
  menu: 'War ar pellgomz, emañ an arventenn-mañ el lañser ☰, e laez a-zehou.', // br: à relire
  profil: {
    titre: 'Degemer mat war {nom} !', // br: à relire
    texte: 'Poelladennoù d’ober war ar skramm ha fichennoù da voullañ, eus ar rannskol vihan betek ar CM2. Un nebeud kuzulioù evit kregiñ mat.', // br: à relire
    question: 'Kerent pe kelenner oc’h ?', // br: à relire
    parentDesc: 'Ma bugel en em bleustr er gêr, war ar skramm pe war baper.', // br: à relire
    enseignantDesc: 'Prientiñ a ran poelladennoù ha fichennoù evit ma c’hlas pe ma c’hlasoù.', // br: à relire
  },
  classes: {
    titreParent: 'Klas ho pugel', // br: à relire
    texteParent: 'Dibabit anezhi amañ, pe diwezhatoc’h gant ar bouton « Klas » er varrenn a-us : ar poelladennoù hag ar fichennoù kinniget a vo diouti. Meur a vugel ? Dibabit meur a glas.', // br: à relire
    titreEnseignant: 'Ho klasoù', // br: à relire
    texteEnseignant: 'Ar bouton « Klas » er varrenn a-us a zalc’h soñj eus ho klasoù : unan hepken, pe meur a hini evit ur c’hlas gant meur a live. Ar rolloù a ziskouez neuze kement tra a sell outo.', // br: à relire
  },
  enfant: {
    titre: 'Ar mod bugel', // br: à relire
    texte: 'Pa implij ho pugel al lec’hienn e-unan, tremenit er mod bugel gant ar bouton profil-mañ : eeunaet e vez ar skramm ha ne ziskouez nemet e boelladennoù, e bras.', // br: à relire
    cadenas: 'Prennet e vez e glas gant ur c’hadenn 🔒 neuze : evit he cheñch e talc’h un den deuet anezhañ pouezet e-pad 2 eilenn. Evit distreiñ d’ar mod kerent, an hevelep bouton profil eo.', // br: à relire
  },
  langue: {
    titre: 'Hag ar {langue} ?', // br: à relire
    texte: 'Ar bouton « Yezh » er varrenn a-us a ginnig ar galleg hepken, ar galleg gant ar {langue} (an div yezh war ar fichennoù hag ar poelladennoù, evit ar skolioù divyezhek) pe ar {langue} hepken. Dibabit bremañ pe diwezhatoc’h :', // br: à relire
  },
  programme: {
    titre: 'Kavout un ampladur resis', // br: à relire
    texte: 'An enmont « Programm » a gemer ar programmoù ofisiel : evit pep klas, an domanioù hag an ampladurioù, ha evit pep ampladur, ar poelladennoù hag ar fichennoù a labour warnañ. An hent gwellañ evit kavout resis ar pezh a glaskit.', // br: à relire
  },
  fin: {
    titre: 'Deomp dezhi !', // br: à relire
    texte: 'Pep tra a c’haller cheñch forzh pegoulz er varrenn a-us pe war pajenn an arventennoù ⚙️, ma c’hallot ivez gwelet ar weladenn-mañ en-dro. Netra n’a er-maez : ho tibaboù a chom war an drobarzhell-mañ.', // br: à relire
    enfant: '🧒 Tremen er mod bugel', // br: à relire
    programme: '📚 Digeriñ ar programm', // br: à relire
    commencer: 'Dizoleiñ al lec’hienn', // br: à relire
  },
  revoir: {
    titre: 'Gweladenn heñchet', // br: à relire
    aide: 'Kuzulioù ar weladenn gentañ : profil, klasoù, yezh, programm.', // br: à relire
    bouton: '🧭 Gwelet ar weladenn heñchet en-dro', // br: à relire
  },
} satisfies Traductions<typeof fr>
