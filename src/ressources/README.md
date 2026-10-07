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
- **Matière « regionale »** : quatre domaines dans `programme.ts`, de la maternelle au CE1 (comprendre et parler, les mots du
  quotidien, les sons et les lettres, comptines et contes ; sources : programme de langues vivantes 2026 et repères de l'académie de
  Rennes). Une ressource y entre par ses **compétences** de ces domaines, quel que soit son domaine principal (`grouperParDomaine`,
  `estDuDomaine`) : l'affiche de l'alphabet (lecture) est aussi dans « les sons et les lettres », parce qu'en breton elle montre
  l'alphabet breton ; les classes comptées sont alors celles de la compétence. La page ne montre que ce qui existe dans la langue, et
  l'ouvre dans la langue (`lienDansLaLangue`) ; le reste de ce qui existe dans la langue suit (« Les autres matières en breton »).

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
