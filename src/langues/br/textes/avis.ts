// Textes de l'interface — avis sur une traduction automatique (breton). Ce texte n'est pas affiché : l'avis est toujours
// en français (la source), mais le catalogue garde les mêmes clés pour toutes les langues.
import type { Traductions } from '../../types.ts'
import type fr from '../../fr/textes/avis.ts'

export default {
  titre: 'An etrefas e {langue}', // br: à relire
  p1: 'Graet eo bet an droidigezh e {langue} ent emgefre ha n\'eo ket bet adlennet gant ur brezhonegerez·our c\'hoazh.', // br: à relire
  p2: 'Gwiriet eo bet an niveroù, al lizherenneg, an deizioù hag ar mizioù e geriadurioù, met degemeret eo pep evezhiadenn.', // br: à relire
  contact: '✉️ Skrivit din :', // br: à relire
  sujet: 'Troidigezh {langue}', // br: à relire
  merci: 'Trugarez !',
  revenir: 'Distreiñ e {langue}', // br: à relire
  continuer: 'Mat eo, kenderc\'hel e {langue}', // br: à relire
} satisfies Traductions<typeof fr>
