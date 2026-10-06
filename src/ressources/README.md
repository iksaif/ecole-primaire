# Ressources : le catalogue de tout ce que le site propose

Une liste typée de `Ressource` (`types.ts`), dérivée des registres, du programme et de l'index des fiches prêtes. Les pages
(matière, programme, compétence, fiches prêtes) et la recherche la lisent : aucune ne refait ces calculs. Modules purs (lisibles
par node), sauf `useRessources.ts`.

## Modèle
`Ressource` = `exercice | affiche | fiche` (contenu : `matiere`, `domaine`, `badges {jeu, imprimable}`, `usage`) ou
`competence | page` (navigation, cherchées par la recherche). Communs : `id` (`<type>:<identifiant>`, stable, unique), `titre`
et `description` (`Libelle` : clé de l'interface typée, ou texte par langue venu de données ; `description` peut être `null`),
`emoji` (du domaine), `classes` (multi-classes ; vide pour une page : toutes), `competences`, `langues`, `route`, `exemple`.
Un exercice et son générateur de fiche sont **une** ressource (badges `jeu` + `imprimable`). Une fiche prête a en plus `slug` et
`parent`. `Matiere` : `maths | francais | monde | regionale` (`MATIERES`, `programme.ts`).

## Dérivation (détail : en-tête de `catalogue.ts`)
- Domaine : toutes les compétences d'un même domaine → ce domaine ; sinon le domaine déclaré, à défaut celui de la première
  compétence. Matière : celle du domaine. Une fiche sans domaine (hors programme) n'entre pas.
- Langues : celles du contenu, restreintes à celles du site. Exemples : seulement avec `enDeveloppement`.
- Les compétences d'une fiche prête se retrouvent par son slug dans les registres (l'index n'en porte pas).
- **Matière « regionale »** : `programme.ts` n'a aucun domaine de langue régionale (les domaines du français sont ceux du
  français). Le rattachement se fera en déclarant des domaines de matière `regionale` dans `programme.ts` (alphabet, nombres,
  jours, mois, mutations) ; ressources et pages suivront sans autre changement. Rien n'y est rangé aujourd'hui.

## API
```ts
construireCatalogue({ exercices, affiches, fiches, site, enDeveloppement }): readonly RessourceDeContenu[]
ressourcesCompetences(enDeveloppement): readonly RessourceCompetence[]
texteDe(libelle, langue): string                                     // textes.ts

filtrerParClasses(ressources, classes)             // union ; aucune classe = toutes ; une ressource une fois
filtrerParMode(ressources, mode, regionale)        // langues utilisables : fr | bilingue | regionale (languesUtilisables)
grouperParDomaine(ressources, { matiere, classes }) // GroupeDomaine[] : programme × cycles des classes, jamais masqués
voisines(ressource, catalogue, limite?)            // même compétence d'abord, puis même domaine ; pas la classe
ressourcesDeCompetence(catalogue, competence)
competencesVoisines(competence)

useRessources()  // { catalogue, fiches, pret, recharger } ; index absent : exercices et affiches seulement
creerRessources({ chercher, registres, site, enDeveloppement }) // instance de test

construireIndexRecherche(catalogue, competences, pages, langue)   // src/recherche/index.ts
chercher(index, requete, { classes, toutesLesClasses }) // { groupes par type, masques }
normaliser(texte)
```
`GroupeDomaine` : `domaine`, `ressources` (des classes choisies), `apprendre`, `sentrainer`, `horsClasse` (compteur), `replie`
(`true` quand `ressources` est vide : repliable, jamais masqué). Tests : `tests/ressources.test.mjs`, `tests/recherche.test.mjs`
(données : `tests/donnees-ressources.mjs`).
