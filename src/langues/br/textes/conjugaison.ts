// Textes de l'interface — conjugaison (breton). Traduction automatique : les passages marqués « br: à relire » sont à faire vérifier par un
// brittophone (`npm run i18n:relecture`). Les formes françaises étudiées restent en français.
import type { Traductions } from '../../types.ts'
import type fr from '../../fr/textes/conjugaison.ts'

export default {
  titre: 'Displegadur',
  description: 'Displegañ en amzer-vremañ, en amzer-dremenet anstrob, en dazont…', // br: à relire
  verbeAConjuguer: 'Verboù da zisplegañ', // br: à relire
  groupe: { aux: 'verb-skoazell', g1: '1añ strollad', g2: '2vet strollad', g3: '3vet strollad' }, // br: à relire
  temps: 'Amzer',
  nomTemps: {
    present: 'Amzer-vremañ',
    imparfait: 'Amzer-dremenet anstrob', // br: à relire (imparfait)
    futur: 'Dazont',
    'passe-compose': 'Tremenet kevrennek', // br: à relire (passé composé)
    'passe-simple': 'Tremenet strizh', // br: à relire (passé simple)
    'plus-que-parfait': 'Tremenet pell', // br: à relire (plus-que-parfait)
  },
  mode: 'Mod',
  modes: { lacunes: 'Toulloù', complet: 'Klok' }, // br: à relire
  modesDesc: { lacunes: 'Klok an dibennoù', complet: 'Skriv ar stumm a-bezh' }, // br: à relire (consigne : forme de l’académie de Rennes, « Kelc’h(it) », « Klok(ait) »)
  accents: 'Diwall ouzh an akcentoù : {forme}', // br: à relire (« attention aux accents » : terme à vérifier)
  ficheFormat: 'War ar fichenn', // br: à relire
  ficheFormats: { tableaux: 'Taolennoù (pevar verb)', lignes: 'Ur stumm dre linenn' }, // br: à relire
  correction: 'Reizhadenn',
} as const satisfies Traductions<typeof fr>
