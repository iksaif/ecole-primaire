// Textes de l'interface — tracer à la règle (breton). Traduction automatique : les passages marqués « br: à relire » sont à faire vérifier.
import type { Traductions } from '../../types.ts'
import type fr from '../../fr/textes/tracerRegle.ts'

export default {
  titre: 'Tresañ gant ar reolenn', // br: à relire
  description: 'Pikoù a-linenn, klokaat hag adtresañ stummoù war paper pikoù', // br: à relire
  exercices: { // br: à relire
    alignes: 'Pikoù a-linenn',
    completer: 'Klokaat ur stumm',
    reproduire: 'Adtresañ ur stumm',
    construire: 'Sevel ur stumm',
  },
  aideRegle: 'Evit gwiriañ, lak ar reolenn : stok ouzh daou bik.', // br: à relire
  regle: 'Ar reolenn', // br: à relire
  enleverRegle: 'Lemel ar reolenn', // br: à relire
  aideTrace: 'Stok ouzh ar pikoù an eil goude egile : ul linenn a liamm anezho. Distro d’ar pik kentañ evit serriñ ar stumm.', // br: à relire
  annuler: 'Nullañ al linenn diwezhañ', // br: à relire
  aideCompleter: 'Stok ouzh ar pikoù a vank, ha goude kadarnaat.', // br: à relire
  aideConstruire: 'Stok ouzh kornioù ar c’harrezennoù an eil goude egile : ul linenn a liamm anezho. Distro d’ar c’horn kentañ evit serriñ ar stumm.', // br: à relire
  enlever: 'Lemel ar pik diwezhañ', // br: à relire
  point: 'pik {n}', // br: à relire
} satisfies Traductions<typeof fr>
