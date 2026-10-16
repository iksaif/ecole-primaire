// Le plus lourd — textes de CONTENU : les consignes dites, le nom des objets, ce que la fiche écrit. Lus par T ; la vue passe par
// `traducteur(CONTENU, …)`. Les textes de l'INTERFACE sont dans src/langues/<langue>/textes/lourd.ts.
import { catalogue } from '../../langues/catalogue.ts'

export const CONTENU = catalogue({
  titre: 'Le plus lourd',
  consigne: {
    lourd: 'Regarde la balance. Quel objet est le plus lourd ?',
    leger: 'Regarde la balance. Quel objet est le plus léger ?',
    lourd3: 'Regarde les deux balances. Quel objet est le plus lourd des trois ?',
    leger3: 'Regarde les deux balances. Quel objet est le plus léger des trois ?',
  },
  consigneFiche: 'Regarde les balances. Entoure l’objet qu’on te demande.',
  demande: { lourd: 'Entoure le plus lourd.', leger: 'Entoure le plus léger.' },
  ariaBalance: 'Balance : {gauche} à gauche, {droite} à droite ; le plateau de {cote} descend.',
  gauche: 'gauche', droite: 'droite',
  objet: { plume: 'plume', ballonDeBaudruche: 'ballon gonflé', souris: 'souris', pomme: 'pomme', pierre: 'pierre', elephant: 'éléphant' },
}, {
  br: {
    titre: 'Ar pezh a zo ar pounnerañ', // br: à relire
    consigne: {
      lourd: 'Sell ouzh ar valañs. Peseurt tra a zo ar pounnerañ ?', // br: à relire
      leger: 'Sell ouzh ar valañs. Peseurt tra a zo ar skañvañ ?', // br: à relire
      lourd3: 'Sell ouzh an daou valañs. Peseurt tra eus an teir a zo ar pounnerañ ?', // br: à relire
      leger3: 'Sell ouzh an daou valañs. Peseurt tra eus an teir a zo ar skañvañ ?', // br: à relire
    },
    consigneFiche: 'Sell ouzh ar balañsoù. Kelc’h an tra a vez goulennet.', // br: à relire
    demande: { lourd: 'Kelc’h ar pounnerañ.', leger: 'Kelc’h ar skañvañ.' }, // br: à relire
    ariaBalance: 'Balañs : {gauche} a-gleiz, {droite} a-zehoù ; kouezhañ a ra ar plad {cote}.', // br: à relire
    gauche: 'a-gleiz', droite: 'a-zehoù', // br: à relire
    objet: { plume: 'pluenn', ballonDeBaudruche: 'balon', souris: 'logodenn', pomme: 'aval', pierre: 'maen', elephant: 'olifant' }, // br: à relire
  },
})
