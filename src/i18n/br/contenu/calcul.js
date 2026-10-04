// Textes des fiches et affiches de calcul (titres, consignes, en-tête) — breton.
// Traduction automatique : les passages marqués « br: à relire » sont à faire vérifier par un brittophone.
// « § » marque une case réponse dans un calcul.
export default {
  // « ha » devient « hag » devant un nombre qui commence par une voyelle à l'oral
  // (unan, eizh, unnek, eizhtek, eizhtek-ha-tri-ugent…)
  etNombre: ({ n }) => (/^(1|8|11|18|80|800|8000)$/.test(String(n).replace(/\s/g, '')) ? 'hag' : 'ha'), // br: à relire
  calculMental: 'Jediñ e penn',
  prenom: 'Anv-bihan', date: 'Deiziad', corrige: 'Reizhadenn',
  table: 'Taolenn liesañ {t}',
  tables: 'Taolennoù liesañ {l}',
  tablesAdd: "Taolennoù sammañ (disoc'hoù betek {m})",
  plage_10: 'betek 10', plage_20: 'betek 20',
  plage_100s: "betek 100 (hep dalc'h)", // br: à relire (retenue = dalc'h ?)
  plage_100r: "betek 100 (gant dalc'h)", // br: à relire (retenue = dalc'h ?)
  plage_1000: 'betek 1 000',
  additions: 'Sammadennoù {s}',
  soustractions: 'Lamadennoù {s}',
  complements: 'Klokaat {s}',
  cible_10: 'betek 10', cible_20: 'betek 20', cible_dizaine: 'betek an dekad', cible_100d: 'betek 100', cible_100: 'betek 100', cible_1000: 'betek 1 000',
  doubles_doubles: 'An doubl', doubles_moities: 'An hanter', doubles_les2: 'An doubl hag an hanter',
  doubleDe: 'an doubl eus {n}', // br: à relire
  moitieDe: 'an hanter eus {n}', // br: à relire
  calculer: 'Jediñ {l}',
  neufOnze: 'Ouzhpennañ ha lemel 9 hag 11', // br: à relire
  divReste: "Rannadennoù gant un dilerc'h", divisions: 'Rannadennoù', combienTitre: 'Pet gwech ?',
  combien: 'Pet gwech {t} e {n} ? §',
  partage: '{n} rannet etre {t} → § pep hini', // br: à relire
  reste: "{a} ÷ {t} = § dilerc'h §",
  suites: 'Heuliadoù niveroù',
  afficheMult: 'An taolennoù liesañ',
  afficheAdd: 'An taolennoù sammañ',
  tableAffiche: 'Taolenn {t}',
}
