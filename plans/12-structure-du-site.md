# Plan 12 — Structure du site et navigation

Discussion du 2026-10-06 avec l'utilisateur (suite du plan 11). Ce plan fixe la structure avant de coder.

## Décisions prises
1. **Adresses propres** (mode `history`, nginx renvoie vers l'app) + **une page HTML statique par fiche**, générée à partir
   du JSON ; redirection des anciennes adresses `#/…`.
2. **Pas de « Fiches » dans la barre, et les fiches toutes prêtes ne polluent pas la page de matière.** La page d'une
   matière est faite pour ceux qui **personnalisent** : « Pour apprendre » (affiches, fiches de leçon) et « Pour
   s'entraîner » (exercices en ligne, générateurs de fiches). En tête, un seul encart : « Des fiches toutes prêtes
   (PDF à télécharger) : c'est ici → ; ci-dessous, personnalisez vos fiches et exercices. » Il mène à une sous-page
   `/maths/fiches` (filtres classe, langue, usage, domaine, recherche) dont les feuilles sont les pages statiques
   `/telechargements/<slug>/` (référencement, et pour qui ne sait pas se servir des formulaires). L'accueil et le
   pied de page ont aussi un lien « Fiches toutes prêtes » (index `/telechargements/`).
3. **Pas de question au premier passage.** La classe se règle par un contrôle clair dans l'en-tête ; un **profil**
   facultatif (Enfant · Parent · Enseignant) décide du nombre de classes choisissables (une, ou plusieurs pour
   l'enseignant) et de ce que la barre montre.
4. **Langue** : trois modes conservés — Français · Français + langue régionale · Langue régionale seule. Défaut de
   **skoolik : Français + breton** ; défaut d'ecoleprimaire : Français.
5. **Recherche** (`Ctrl+K` / `⌘K` / `/`) : voulue.

## Adresses
```
/                                 accueil
/maths   /francais   /brezhoneg   page de matière (domaines → ressources)
/maths/heure                      exercice en ligne (+ mode « imprimer » : ?mode=imprimer)
/programme                        le programme (liste/tableau par classe), compétence → ressources
/programme/ce1/nombres-calcul     une classe et un domaine
/telechargements/<slug>/          feuille : une fiche ou affiche toute prête (slug publié, inchangé)
/telechargements/                 index A→Z et filtres (lien de pied de page, plan du site)
?classe=ce1,ce2&langue=fr+br      contexte partageable, prioritaire sur les réglages mémorisés
```

## Contexte : langue, classe, profil
- **Langue** (3 modes) : le mode règle la langue du contenu et l'onglet de la langue régionale. En mode bilingue, une
  ressource propose « langue de cette ressource » (FR / BR, et FR+BR pour les fiches). La langue de l'interface suit le
  mode par défaut (français), et se change dans les réglages.
- **Classe** : un ensemble de classes (`ps`…`cm2`). Profil Enseignant : plusieurs ; Parent et Enfant : une seule.
  Enregistrée sur l'appareil ; une adresse avec `?classe=` l'emporte et ne modifie pas le réglage mémorisé.
- **Profil** : facultatif, choisi sur l'accueil (jamais bloquant, jamais sur une page ouverte par un lien), parent par
  défaut. Il ne change que : nombre de classes, entrées de la barre (Programme pour l'enseignant), disposition de
  l'accueil (grosses tuiles pour l'enfant), bouton « Copier le lien pour les familles » (enseignant).

## Pages
- **Accueil** : contexte, tuiles par matière pour la classe, « Reprendre » (derniers exercices), accès au programme.
- **Matière** : encart « fiches toutes prêtes », puis sections par domaine ; dans chacune, « Pour apprendre » et
  « Pour s'entraîner ». **Une ressource apparaît une seule fois**, avec ses **classes en pastilles** (la plupart sont
  multi-classes) ; la sélection de classes filtre la liste (union si plusieurs) et met en évidence les pastilles
  correspondantes. Pas de regroupement par classe.
- **Feuille** (`/telechargements/<slug>/`) : aperçu multipage, téléchargement (formats déclarés), imprimer, Personnaliser,
  « Faire en ligne », compétence + lien programme officiel, fiches voisines (même compétence).
- **Programme** : classe × domaine → compétences → ressources ; vue pour l'enseignant, lisible pour les parents.
- **Brezhoneg** (langue régionale active) : apprendre la langue (alphabet, nombres, jours, mois, mutations).
- **Le monde** : masqué tant qu'il n'a pas de vraies ressources.

## Recherche
Index généré au build (`recherche.json` : exercices, affiches, fiches, compétences, pages ; texte normalisé sans accents,
français et langue régionale), filtre par la classe courante avec « toutes les classes » en un clic, résultats groupés
par type, navigation au clavier ; sur téléphone, une icône qui ouvre la recherche en plein écran.

## Barre de navigation
Bureau : logo (= accueil) · Maths · Français · Brezhoneg · (Programme pour l'enseignant) · 🔍 · Langue ▾ · Classe ▾ · ⚙.
Téléphone : logo, 🔍, Classe, menu (☰) pour le reste. Défauts du shell à corriger au passage : `<main>`, titre de
document par page, contrastes du logo, du lien actif et du pied de page, débordement à 320 px.

## Décidé en plus (2026-10-06)
- Plusieurs classes à la fois : oui, par pastilles sur les ressources (voir « Matière »).
- Profil Enfant : **verrou léger** (classe fixée, petit cadenas à ouvrir).
- Le profil se change par une pastille « 👤 Parent » dans la barre.
- Skoolik : mode Français + breton par défaut, interface en français (changeable dans les réglages).

## Suite

Les maquettes cliquables sont dans `plans/maquettes/` (référence de comportement et d'aspect ; données et breton inventés). La structure est implémentée
(`src/contexte/`, `src/ressources/`, `src/router/`, `src/shell/`, `src/pages/`, `src/recherche/`, `src/programme/` : voir leurs README et `REPRISE.md`).
Reste à faire avant la mise en ligne : les redirections des anciennes adresses et `deploy/setup-nginx.sh` (par l'utilisateur), voir `REPRISE.md`, « Avant de déployer ».
