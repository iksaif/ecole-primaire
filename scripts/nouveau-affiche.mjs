// Squelette d'une affiche : copie src/affiches/exemple/ sous le nouvel identifiant et l'inscrit au registre.
//   npm run nouveau -- affiche <id> "<Titre>"        (ou : node scripts/nouveau-affiche.mjs <id> "<Titre>")
// L'affiche créée est la bande numérique de l'exemple, à transformer : définition (variantes, compétences, réglages),
// dessin, textes. Elle est dans le registre (src/affiches/index.ts), donc testée tout de suite (tests/affiches-modele.test.mjs).
import { cpSync, existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const racine = join(dirname(fileURLToPath(import.meta.url)), '..')
const camel = id => id.replace(/-(\w)/g, (_, c) => c.toUpperCase())

export function nouveauAffiche(id, titre) {
  if (!/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(id ?? '')) throw new Error(`identifiant « ${id} » : minuscules, chiffres et tirets (ex. bande-numerique)`)
  if (!titre) throw new Error('titre manquant : npm run nouveau -- affiche <id> "<Titre>"')
  if (id === 'exemple') throw new Error('« exemple » est pris par l\'affiche d\'exemple')
  const dossier = join(racine, 'src/affiches', id)
  if (existsSync(dossier)) throw new Error(`src/affiches/${id}/ existe déjà`)
  const registre = join(racine, 'src/affiches/index.ts')
  let index = readFileSync(registre, 'utf8')
  if (!index.includes('// nouveau:imports') || !index.includes('// nouveau:registre')) throw new Error('src/affiches/index.ts : repères « nouveau: » absents')

  cpSync(join(racine, 'src/affiches/exemple'), dossier, { recursive: true })
  const reecrire = (fichier, f) => { const p = join(dossier, fichier); writeFileSync(p, f(readFileSync(p, 'utf8'))) }
  // la définition : le nouvel identifiant, le formulaire à la place par défaut, une marque pour ce qui reste à faire
  reecrire('definition.ts', s => s
    .replace("id: 'exemple'", `id: '${id}'`)
    .replace(/\n\s{2}\/\/ route du formulaire[^\n]*\n\s{2}route: '[^']*',/, '')
    .replace('// L\'affiche d\'exemple : la bande numérique (MS : 1 à 6, GS : 0 à 10). Point de départ de toute affiche : on copie ce\n// dossier (`npm run nouveau -- affiche <id> "<Titre>"`) et on change ce qui change.',
      `// ${titre} — squelette créé par \`npm run nouveau -- affiche\` d'après l'exemple (src/affiches/exemple/) : à adapter.\n// À FAIRE : de vraies compétences (K.…) et un vrai domaine (D.…) à la place de ceux, fictifs, de l'exemple.`))
  reecrire('textes.ts', s => s.replace(/titre: 'La bande numérique',/, `titre: '${titre.replaceAll("'", "\\'")}',`).replace(/titre: 'Ar vandenn niveroù', \/\/ br: à relire/, `titre: '${titre.replaceAll("'", "\\'")}', // br: à traduire et à relire`))
  // le registre : l'import et l'entrée
  const nom = camel(id)
  index = index.replace('// nouveau:imports', `import { module as ${nom} } from './${id}/index.ts'\n// nouveau:imports`).replace('// nouveau:registre', `${nom},\n  // nouveau:registre`)
  writeFileSync(registre, index)
  return { dossier: `src/affiches/${id}/`, fichiers: readdirSync(dossier) }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const { dossier, fichiers } = nouveauAffiche(process.argv[2], process.argv[3])
    console.log(`✓ ${dossier} : ${fichiers.join(', ')}\n  inscrite dans src/affiches/index.ts\n  à faire : compétences et domaine (K.…, D.…), variantes, dessin, textes (fr et br)\n  vérifier : node tests/affiches-modele.test.mjs --maj  (puis sans --maj), npm run types, npm run lint`)
  } catch (e) { console.error(`✗ ${e.message}`); process.exit(1) }
}
