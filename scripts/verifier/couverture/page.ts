// La page couverture.html (non versionnée) : style, légende et les deux parties du rapport.
export const pageCouverture = (parDomaine: string, parExercice: string): string => `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8">
<title>Couverture du programme</title>
<style>
  body { font-family: system-ui, sans-serif; margin: 2rem; color: #222; background: #f8f9fa; }
  h1 { margin: 0 0 .25rem; } .legende { color: #555; margin-bottom: 1.5rem; }
  section { background: white; border-radius: 10px; padding: 1rem 1.25rem; margin-bottom: 1.25rem; box-shadow: 0 2px 8px rgba(0,0,0,.06); }
  h2 { font-size: 1.15rem; margin: 0 0 .75rem; } h2 small { font-weight: 400; color: #777; font-size: .85rem; margin-left: .5rem; }
  table { border-collapse: collapse; width: 100%; font-size: .85rem; }
  th, td { border: 1px solid #e3e6ea; padding: .3rem .4rem; }
  tr > th:first-child { text-align: left; font-weight: 500; width: 45%; }
  td { text-align: center; white-space: nowrap; cursor: default; }
  td.hors { background: #f3f4f6; } td.rien { background: #fde2e1; color: #b42318; font-weight: 700; }
  td.peu { background: #fff4d6; } td.bien { background: #ddf3e4; }
  details { background: white; border-radius: 10px; padding: .6rem 1rem; margin-bottom: .5rem; box-shadow: 0 2px 8px rgba(0,0,0,.06); }
  summary { cursor: pointer; font-weight: 700; } summary small { font-weight: 400; color: #777; margin-left: .5rem; }
  table.exercice { margin-top: .6rem; } table.exercice th { width: 4rem; text-align: center; } table.exercice td:nth-child(2) { width: 5rem; }
  td.liste { text-align: left; white-space: normal; } td.liste span { display: block; } td.liste small { color: #888; } .ok { color: #1a7f37; } .non { color: #999; } .alerte { color: #b42318; font-weight: 700; }
</style></head><body>
<h1>Couverture du programme</h1>
<p class="legende">Par domaine, chaque compétence de <code>src/data/programme.ts</code> aux classes où elle est travaillée :
🎯 exercice dans l'app · 📄 fiche toute prête (ou générateur de fiches) · 📘 affiche. Vert : au moins deux sortes ;
jaune : une seule ; rouge : rien ; gris : pas au programme de cette classe. Survoler une case pour voir les ressources.
Généré le ${new Date().toLocaleDateString('fr-FR')} par <code>npm run couverture</code>.</p>
<h2 style="margin:2rem 0 .75rem">Par domaine</h2>
${parDomaine}
<h2 style="margin:2rem 0 .5rem">Par exercice</h2>
<p class="legende">À chaque classe, les options de l'exercice (une fiche toute prête par compétence) : ✓ compétence au
programme de cette classe, ⚠ compétence qui n'est pas au programme de cette classe ; — compétence de l'exercice au
programme de la classe sans option dédiée. Le contenu des fiches (nombres, heure, unités, temps…) est vérifié par
<code>tests/exercices.test.mjs</code>.</p>
${parExercice}
</body></html>`
