# Contexte (plan 13)

Ce que l'utilisateur a choisi pour qu'on lui montre les bonnes ressources : **classes**, **mode de langue**, **vue**,
**références officielles**, **profil**. Types : `types.ts` (partagés avec `src/ressources/`).

## Paramètres d'adresse
| Paramètre | Valeurs | Remarque |
|---|---|---|
| `classes` | `ce1` ou `ce1,ce2` | triées de PS à CM2, sans doublon ; valeurs inconnues ignorées |
| `mode` | `fr` · `bi` · `reg` | français seul · français + langue régionale · langue régionale seule |
| `reg` | code de langue | seulement s'il y a plusieurs langues régionales sur le site |
| `vue` | `cartes` · `liste` | présentation des listes |
| `refs` | `1` · `0` | références officielles du tableau du programme |

Le profil n'est **jamais** dans l'adresse (réglage d'appareil). Un paramètre égal au défaut n'est pas écrit.
Valeur invalide : ignorée (jamais d'exception). **Attention** : `?mode=imprimer` (onglet d'un exercice, `useFicheExercice`)
n'est pas un mode de langue : il est reconnu comme tel et jamais écrasé ; l'écriture du mode de langue est alors omise.
À renommer (`?onglet=imprimer`) quand les exercices seront migrés.

## Priorité
1. **L'adresse** (`/maths?classes=cm1`) ;
2. le **réglage mémorisé** sur l'appareil (clés `classes`, `mode`, `reg`, `vue`, `refs`, `profil`) ;
3. les **défauts du site** (`src/sites.ts` : ecoleprimaire = `fr` ; skoolik = `bilingue`, breton) ; classe de départ : `ce1`.

Lire une adresse ne modifie jamais le réglage mémorisé. Une action de l'utilisateur (`choisirClasses`…) met à jour le réglage
**et** l'adresse (`router.replace` : pas d'entrée d'historique), en gardant les autres écarts de l'adresse. Un lien interne vers
une autre page reporte les paramètres de contexte de l'adresse courante (`beforeEach`, `src/router/index.ts`).
Anciennes clés lues (migration douce) : `classe` (une classe), `langue_regionale` (une langue = bilingue, `''` = français seul) ;
`classe` reste écrite (première classe) pour l'ancien socle.

## Profils
| Profil | Classes | Particularité |
|---|---|---|
| `parent` (défaut) | plusieurs | plusieurs enfants : `ajouterClasse` / `retirerClasse` (jamais moins d'une) ; ni « Programme » dans la barre ni références par défaut |
| `enfant` | une | **verrouillée** (`verrouillee`) ; `deverrouillerClasse()` la lève jusqu'au rechargement |
| `enseignant` | plusieurs | comme le parent, plus l'entrée « Programme », les références officielles par défaut et `lienFamilles()` |

## Langue d'interface et mode
Deux notions distinctes : le mode ne change pas la langue de l'interface, sauf **`regionale`** (langue régionale seule) : si le
site propose cette langue comme langue d'interface, elle est **imposée** (`langueImposee`, `src/langues/etat.ts`) sans toucher
au réglage mémorisé. `useLangue().langueAffichee` est la langue réellement affichée (à lire pour le contenu) ; `langue` reste le
réglage. `modeRegionalSeul` dit quand afficher « Retour en français » (= `choisirMode('fr')`).

## API
```ts
installerContexte(router, site?)   // une fois, main.ts
const { contexte, defauts, verrouillee, plusieursClasses, modeRegionalSeul,
        choisirClasses, ajouterClasse, retirerClasse, choisirMode, choisirVue, basculerRefs,
        choisirProfil, deverrouillerClasse, contexteDeLAdresse, lienFamilles, lienTableau } = useContexte()
contexte.value // { classes, mode, regionale, profil, vue, refs }  (réactif)
```
Les actions de classe, de mode, de vue et de références rendent une promesse (`false` : refusé). Modules purs (node) :
`url.ts` (`lireContexteDeLAdresse`, `ecrireContexteDansLAdresse`, `fusionnerParamsContexte`, `extraireParamsContexte`,
`chaineDeQuery`), `regles.ts` (défauts, profils, migration), `partage.ts` (`lienPourLesFamilles`, `lienDuTableau`).
Tests : `tests/contexte.test.mjs` (node), `tests/navigation.test.mjs` (Chrome).
