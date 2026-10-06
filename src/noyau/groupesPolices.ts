// Regroupement des polices proposées pour une fiche ou une affiche (ChoixPolice) : logique pure, lisible par node.
//   - « Nos polices » (favorites) : les polices incluses au site, puis les polices scolaires suggérées (Belle Allure, Écolier,
//     Cursif…) : sélectionnables si elles sont installées, sinon présentes quand même, grisées (état `manquante`) ;
//   - « Installées » : les autres polices de l'ordinateur (nom saisi, ou liste complète du système) ;
//   - « Ajoutées » : les polices ajoutées depuis un fichier.
// Rien ne lit le navigateur ici : polices.ts fournit ce qui est installé (mesure sur canvas) et ce qui est mémorisé.

/** La police de repli quand un choix mémorisé n'est plus disponible (la police script incluse au site). */
export const POLICE_REPLI = 'Andika'

export type EtatPolice = 'incluse' | 'installee' | 'manquante' | 'systeme' | 'ajoutee'
export interface EntreePolice {
  /** identifiant = nom de la police en CSS ; pour une police manquante : `manquante:<famille>` (jamais sélectionnable) */
  id: string
  /** libellé en français : le nom (les polices incluses sont traduites par ChoixPolice) */
  label: string
  etat: EtatPolice
  /** famille suggérée (clé de LIENS_POLICES) d'une police connue ou manquante */
  famille?: string
}
export interface GroupesPolices {
  favorites: EntreePolice[]
  installees: EntreePolice[]
  ajoutees: EntreePolice[]
  /** familles suggérées dont aucune variante n'est installée (l'aide ne parle que de celles-là) */
  manquantes: string[]
}
export interface SourcesPolices {
  incluses: { id: string, label: string }[]
  /** polices scolaires suggérées pour ce type d'écriture, avec leur état d'installation */
  connues: { nom: string, installee: boolean }[]
  /** noms de polices de l'ordinateur déjà validés (mémorisés, saisis ou listés par le système) */
  systeme: string[]
  ajoutees: { id: string, label: string }[]
}

/** La famille suggérée d'un nom de police scolaire (« BelleAllure CM » → « Belle Allure »). */
export function familleDe(nom: string): string {
  if (/^belle ?allure/i.test(nom)) return 'Belle Allure'
  if (/^ecolier/i.test(nom)) return 'Écolier'
  return 'Cursif'
}

const cle = (nom: string): string => nom.trim().toLocaleLowerCase('fr')

/** Un nom de police utilisable dans une règle CSS entre apostrophes : court, sans caractère qui sortirait de la chaîne. */
export function nomPoliceValide(nom: unknown): nom is string {
  return typeof nom === 'string' && nom.trim() === nom && nom.length > 0 && nom.length <= 80 && !/['"\\<>{};\n\r]/.test(nom)
}

/** Les noms mémorisés, relus : une valeur qui n'est pas une liste de noms valides est ignorée, sans doublon. */
export function assainirNoms(lu: unknown): string[] {
  if (!Array.isArray(lu)) return []
  const vus = new Set<string>()
  return lu.filter((n): n is string => nomPoliceValide(n) && !vus.has(cle(n)) && !!vus.add(cle(n)))
}

export function regrouper(src: SourcesPolices): GroupesPolices {
  const favorites: EntreePolice[] = src.incluses.map(p => ({ id: p.id, label: p.label, etat: 'incluse' }))
  const familles = [...new Set(src.connues.map(c => familleDe(c.nom)))]
  const manquantes: string[] = []
  for (const c of src.connues.filter(c => c.installee)) favorites.push({ id: c.nom, label: c.nom, etat: 'installee', famille: familleDe(c.nom) })
  for (const f of familles) {
    if (src.connues.some(c => c.installee && familleDe(c.nom) === f)) continue
    manquantes.push(f)
    favorites.push({ id: `manquante:${f}`, label: f, etat: 'manquante', famille: f })
  }
  // une police du système déjà proposée ailleurs (incluse, suggérée, ajoutée) n'est pas répétée
  const dejaVus = new Set([...src.incluses.map(p => cle(p.id)), ...src.connues.map(c => cle(c.nom)), ...src.ajoutees.map(p => cle(p.id))])
  const installees = [...new Set(src.systeme.filter(nomPoliceValide))]
    .filter(n => !dejaVus.has(cle(n)))
    .sort((a, b) => a.localeCompare(b, 'fr'))
    .map((n): EntreePolice => ({ id: n, label: n, etat: 'systeme' }))
  const ajoutees = src.ajoutees.map((p): EntreePolice => ({ id: p.id, label: p.label, etat: 'ajoutee' }))
  return { favorites, installees, ajoutees, manquantes }
}

/** Toutes les polices sélectionnables d'un regroupement (les manquantes ne le sont pas). */
export function selectionnables(g: GroupesPolices): EntreePolice[] {
  return [...g.favorites, ...g.installees, ...g.ajoutees].filter(e => e.etat !== 'manquante')
}

/** Le choix mémorisé s'il est encore sélectionnable, sinon la police par défaut (Andika) : jamais d'erreur. */
export function choixValide(id: unknown, g: GroupesPolices, defaut: string = POLICE_REPLI): string {
  return typeof id === 'string' && selectionnables(g).some(e => e.id === id) ? id : defaut
}

/** Une police est-elle écrite dans la fiche ? Sinon (installée sur l'ordinateur) elle ne s'imprime fiablement qu'ici. */
export const estEmbarquee = (e: EntreePolice | undefined): boolean => !e || e.etat === 'incluse' || e.etat === 'ajoutee'
