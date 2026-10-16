// Les textes du matériel de la valise. Tout le breton est nouveau : à relire.
import type { TextesAffiche } from '../types.ts'

export const TEXTES: TextesAffiche = {
  fr: {
    titre: 'La valise et les jetons',
    'variante.boite.court': 'Boîte opaque et jetons',
    'variante.boite.titre': 'La boîte opaque à plier et les jetons à découper',
    'variante.boite.description': 'Le patron d’une boîte opaque avec son couvercle, et une planche de jetons à découper, pour jouer aux petits problèmes d’ajout et de retrait.',
    'variante.jetons.court': 'Jetons à découper',
    'variante.jetons.titre': 'Une planche de jetons à découper',
    'variante.jetons.description': 'Une planche de jetons alignés pour le massicot : des oursons, des pommes, des étoiles… pour compter, ajouter, retirer.',
    'reglage.objet': 'Les jetons',
    'valeur.objet.ours': 'Des oursons',
    'valeur.objet.pomme': 'Des pommes',
    'valeur.objet.etoile': 'Des étoiles',
    'valeur.objet.fleur': 'Des fleurs',
    'valeur.objet.chat': 'Des chats',
    'patron.titre': 'La boîte opaque',
    'patron.consigne': 'Découpe sur les traits pleins, plie sur les pointillés, colle les languettes des murs. Les rabats du couvercle ne se collent pas : ils se glissent dans la boîte. Perce la fente avec la pointe des ciseaux : on glisse les jetons sans ouvrir. Le couvercle s’ouvre et se ferme. Tu peux la colorier.',
    'jetons.titre': 'Les jetons',
    'jetons.consigne': 'Découpe les jetons sur les traits : on les met dans la boîte, on en ajoute, on en retire.',
    'variante.des.court': 'Dés à plier',
    'variante.des.titre': 'Les dés à plier : usuel, « 1, 2, 3 » et « + / − »',
    'variante.des.description': 'Les patrons de trois dés à découper et à plier : le dé de 1 à 6, le dé « 1, 2, 3 » et le dé « + / − », pour jouer à gagner ou perdre des jetons.',
    'reglage.decor': 'Les couleurs de la boîte',
    'valeur.decor.true': 'En couleurs', 'valeur.decor.false': 'Blanche, à colorier',
    'valeur.objet.mix': 'Un mélange',
    'reglage.des': 'Les dés',
    'valeur.des.usuel': 'Dé de 1 à 6', 'valeur.des.un-deux-trois': 'Dé « 1, 2, 3 »', 'valeur.des.plus-moins': 'Dé « + / − »',
    'des.usuel': 'Le dé de 1 à 6', 'des.un-deux-trois': 'Le dé « 1, 2, 3 »', 'des.plus-moins': 'Le dé « + / − »',
    'des.titre.usuel': 'Le dé de 1 à 6', 'des.titre.un-deux-trois': 'Le dé « 1, 2, 3 »', 'des.titre.plus-moins': 'Le dé « + / − »',
    'des.consigne': 'Découpe sur les traits pleins, plie sur les pointillés, colle les languettes.',
  },
  br: {
    titre: 'Ar valizenn hag ar jetonoù', // br: à relire
    'variante.boite.court': 'Boest dall ha jetonoù', // br: à relire
    'variante.boite.titre': 'Ar voest dall da blegañ hag ar jetonoù da droc’hañ', // br: à relire
    'variante.boite.description': 'Patrom ur voest dall gant he c’holo, ha ur plankenn jetonoù da droc’hañ, evit c’hoari gant ar c’hudennoù bihan.', // br: à relire
    'variante.jetons.court': 'Jetonoù da droc’hañ', // br: à relire
    'variante.jetons.titre': 'Ur plankenn jetonoù da droc’hañ', // br: à relire
    'variante.jetons.description': 'Ur plankenn jetonoù kenstummet evit ar vasin : arzhed, avaloù, steredoù… evit kontañ, ouzhpennañ, tennañ.', // br: à relire
    'reglage.objet': 'Ar jetonoù', // br: à relire
    'valeur.objet.ours': 'Arzhed', // br: à relire
    'valeur.objet.pomme': 'Avaloù', // br: à relire
    'valeur.objet.etoile': 'Steredoù', // br: à relire
    'valeur.objet.fleur': 'Bleunioù', // br: à relire
    'valeur.objet.chat': 'Kizhier', // br: à relire
    'patron.titre': 'Ar voest dall', // br: à relire
    'patron.consigne': 'Troc’h war al linennoù leun, plij war ar pikoù, peg bizhierioù ar mogerioù. Ar skoazelloù eus ar c’holo ne vezont ket peget : lakaat a reer anezho e-barzh ar voest. Toull ar fent gant beg ar gwerzhidi : lakaat a reer ar jetonoù hep digeriñ. Digeriñ ha serriñ a c’haller ar c’holo. Liv ar voest.', // br: à relire
    'jetons.titre': 'Ar jetonoù', // br: à relire
    'jetons.consigne': 'Troc’h ar jetonoù war al linennoù : lakaat a reer anezho er voest, ouzhpennañ, tennañ.', // br: à relire
    'variante.des.court': 'Deizioù da blegañ', // br: à relire
    'variante.des.titre': 'An deizioù da blegañ : boutin, « 1, 2, 3 » ha « + / − »', // br: à relire
    'variante.des.description': 'Patromoù tri deiz da droc’hañ ha da blegañ : an deiz eus 1 da 6, an deiz « 1, 2, 3 » hag an deiz « + / − », evit c’hoari da gaout pe da goll jetonoù.', // br: à relire
    'reglage.decor': 'Livioù ar voest', // br: à relire
    'valeur.decor.true': 'Liv warni', 'valeur.decor.false': 'Gwenn, da livañ', // br: à relire
    'valeur.objet.mix': 'Ur meskaj', // br: à relire
    'reglage.des': 'An deizioù', // br: à relire
    'valeur.des.usuel': 'Deiz eus 1 da 6', 'valeur.des.un-deux-trois': 'Deiz « 1, 2, 3 »', 'valeur.des.plus-moins': 'Deiz « + / − »', // br: à relire
    'des.usuel': 'An deiz eus 1 da 6', 'des.un-deux-trois': 'An deiz « 1, 2, 3 »', 'des.plus-moins': 'An deiz « + / − »', // br: à relire
    'des.titre.usuel': 'An deiz eus 1 da 6', 'des.titre.un-deux-trois': 'An deiz « 1, 2, 3 »', 'des.titre.plus-moins': 'An deiz « + / − »', // br: à relire
    'des.consigne': 'Troc’h war al linennoù leun, plij war ar pikoù, peg ar bizhierioù.', // br: à relire
  },
}
