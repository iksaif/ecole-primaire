// Assemblages de formes — textes de CONTENU : ce que la fiche écrit (titre, consignes, corrigé). Lus par T (fiche) ; la vue passe par
// `traducteur(CONTENU, …)`. Les textes de l'INTERFACE (réglages) sont dans src/langues/<langue>/textes/assemblages.ts.
import { catalogue } from '../../langues/catalogue.ts'

export const CONTENU = catalogue({
  titre: 'Assemblages de formes',
  consignePs: 'Découpe les formes. Pose-les sur le modèle, puis colle-les.',
  consigneMsGs: 'Découpe les formes. Fais comme le modèle avec les formes, puis colle-les.',
  aDecouper: 'Les formes à découper',
  modelesPs: 'Les modèles : pose les formes dessus',
  modelesMsGs: 'Les modèles : fais pareil dans le cadre',
  forme: {
    carre: { one: '{n} carré', other: '{n} carrés' },
    rectangle: { one: '{n} rectangle', other: '{n} rectangles' },
    triangle: { one: '{n} triangle', other: '{n} triangles' },
  },
}, {
  br: {
    titre: 'Strollad stummoù', // br: à relire
    consignePs: "Troc'h ar stummoù. Laka anezho war ar skouer, goude pegañ anezho.", // br: à relire
    consigneMsGs: "Troc'h ar stummoù. Great evel ar skouer gant ar stummoù, goude pegañ anezho.", // br: à relire
    aDecouper: "Ar stummoù da droc'hañ", // br: à relire
    modelesPs: 'Ar skouerioù : laka ar stummoù warno', // br: à relire
    modelesMsGs: 'Ar skouerioù : great evel-se er framm', // br: à relire
    forme: {
      carre: { other: '{n} karrez' }, // br: à relire
      rectangle: { other: '{n} skouergorneg' }, // br: à relire
      triangle: { other: "{n} tric'horn" }, // br: à relire
    },
  },
})
