// Textes de l'interface — confiance dans les traductions (breton). Mêmes clés que le français.
import type { Traductions } from '../../types.ts'
import type fr from '../../fr/textes/confiance.ts'

export default {
  titre: 'Fiziañs er c\'hinnigoù', // br: à relire
  aide: 'Troet eo ar follennoù e {langue} ent emgefre pe adlennet, hervez ar c\'hinnig. Dibabit al live izelañ.', // br: à relire
  minimum: 'Diskouez ar follennoù troet da nebeutañ :', // br: à relire
  niveaux: {
    enseignant: { nom: 'Adlennet gant ur gelennerez·our', court: 'Adlennet (kel.)', aide: 'Adlennet ha kadarnaet gant ur gelennerez·our {langue}.' }, // br: à relire
    brittophone: { nom: 'Adlennet gant ur brezhonegerez·our', court: 'Adlennet', aide: 'Adlennet gant unan a gomz {langue}.' }, // br: à relire
    dictionnaire: { nom: 'Gerioù gwiriet', court: 'Gerioù gwiriet', aide: 'Gerioù ha lavarennoù simpl, gwiriet e-barzh ur geriadur pe e-lec\'h all war al lec\'hienn.' }, // br: à relire
    simple: { nom: 'Emgefre, simpl-tre', court: 'Emgefre simpl', aide: 'Troidigezh emgefre a c\'herioù ha frazennoù berr-tre : just a-walc\'h e vez a-hend-all.' }, // br: à relire
    automatique: { nom: 'Emgefre, n\'eo ket gwiriet', court: 'Emgefre', aide: 'Troidigezh emgefre, frazennoù hir pe yezhadur : fazioù a c\'hall bezañ.' }, // br: à relire
  },
  pastille: 'Troidigezh {niveau}/4', // br: à relire
  masquee: 'kuzhet', // br: à relire
  masquees: '{n} follenn kuzhet : n\'eo ket reizh a-walc\'h o zroidigezh.', // br: à relire
  regler: 'Reoliñ', // br: à relire
} satisfies Traductions<typeof fr>
