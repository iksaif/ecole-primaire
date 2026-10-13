<template>
  <div class="container">
    <h1 class="section-heading"><Icone v-if="definition.emoji" :nom="definition.emoji" /> {{ titrePage }}</h1>

    <!-- Config -->
    <CadreExercice v-if="phase === 'config'" v-model:mode="mode" :fiche="fiche" :config="config" images
      @commencer="jeu.demarrer" @regenerer="nouvelle">
      <template #default="{ mode: modeCourant }">
        <ChoixReglage :definition="definition" cle="niveau" v-model="config.niveau" :titre="t('communs.niveau')" />
        <ChoixReglage v-if="plusieursTypes" :definition="definition" :niveau="config.niveau" cle="exercices" v-model="config.exercices"
          :titre="t('communs.exercices')" :libelle="libelleType" :icone="e => ICONE_EXERCICE[String(e)]" />
        <ChoixReglage v-if="avecSymetrie" :definition="definition" :niveau="config.niveau"
          cle="axeHorizontal" v-model="config.axeHorizontal" :titre="t('geometrie.optionsSym')" :libelle="h => t(h ? 'geometrie.axeH' : 'geometrie.axeV')" />
        <ChoixReglage v-if="modeCourant === 'jouer'" :definition="definition" :niveau="config.niveau" cle="nbQ" v-model="config.nbQ" :titre="t('communs.nbQuestions')" />
      </template>
    </CadreExercice>

    <!-- Exercice -->
    <QuestionJeu v-if="phase === 'jeu' && q" :jeu="jeu">
      <div class="geo-box">
        <!-- la consigne, lue à voix haute au clic (au CP, « Combien de sommets… » ne se déchiffre pas seul) -->
        <ConsigneParlee class="consigne" :texte="consigne" :auto="false" />

        <!-- Symétrie -->
        <div v-if="q.type === 'symetrie'" class="grilles">
          <div class="grille" :style="styleGrille(q.cols)">
            <template v-for="r in q.rows" :key="'r' + r">
              <div v-for="c in q.cols" :key="r + '-' + c"
                class="case" :class="classeSymetrie(c - 1, r - 1)"
                @click="clicSymetrie(c - 1, r - 1)"></div>
            </template>
            <div class="axe" :class="q.axe === 'v' ? 'axe-v' : 'axe-h'" :style="styleAxe(q)"></div>
          </div>
        </div>

        <!-- Figures planes, solides, cercle, patrons -->
        <div v-else-if="dessin" class="dessin" v-html="dessin"></div>

        <div v-if="(q.type === 'figure' && q.sous === 'angle') || q.type === 'angles' || q.type === 'aigus' || q.type === 'justifier'" class="astuce">
          <Icone nom="ampoule" /> {{ t('geometrie.astuceEquerre') }}
        </div>

        <!-- Angles droits : choix multiple de lettres -->
        <div v-if="q.type === 'angles'" class="choix-group">
          <button v-for="l in [...q.lettres].sort()" :key="l" type="button" class="choix-btn" :class="classeLettre(l)"
            :disabled="repondu" @click="basculerLettre(l)">{{ l }}</button>
          <button type="button" class="choix-btn" :class="classeLettre('aucun')"
            :disabled="repondu" @click="basculerLettre('aucun')">{{ t('geometrie.aucunBtn') }}</button>
        </div>

        <!-- Choix -->
        <!-- « Lequel est un cylindre ? » : les propositions sont des dessins -->
        <ChoixReponses v-if="q.type === 'solide' && q.proposes" images :titre="consigne" :options="q.options" :bonne="q.bonne" :repondu="repondu"
          :libelle="i => q && 'options' in q ? q.options[i].label : ''" @choisir="choisir">
          <template #default="{ index }"><span class="dessin-choix" v-html="svgSolide(q.proposes[index], 120)" /></template>
        </ChoixReponses>
        <ChoixReponses v-else-if="'options' in q" :titre="consigne" :options="q.options" :bonne="q.bonne" :repondu="repondu"
          :colonne="q.type === 'justifier'" @choisir="choisir" />

        <RetourReponse :message="retour?.message" :etat="etat" />

        <div v-if="corrige && !reussi" class="legende">
          <span><i class="pastille juste"></i> {{ t('geometrie.legJuste') }}</span>
          <span><i class="pastille manquante"></i> {{ t('geometrie.legOubliee') }}</span>
          <span><i class="pastille entrop"></i> {{ t('geometrie.legEnTrop') }}</span>
        </div>

        <div class="btn-group" style="justify-content:center;margin-top:1rem;">
          <template v-if="!repondu">
            <button type="button" class="btn btn-ghost" @click="passer">{{ t('communs.passer') }} <Icone nom="passer" /></button>
            <button v-if="estGrille" type="button" class="btn btn-ghost" @click="effacer"><Icone nom="effacer" /> {{ t('geometrie.effacer') }}</button>
            <button v-if="!('options' in q)" type="button" class="btn btn-primary" @click="valider">{{ t('communs.valider') }} <Icone nom="valide" /></button>
          </template>
          <BoutonSuivant v-else :jeu="jeu" />
        </div>
      </div>
    </QuestionJeu>

    <!-- Résultats -->
    <ResultatsJeu v-if="phase === 'resultats'" :bonnes="bonnes" :total="questions.length" :cle-fin="cleFin"
      @rejouer="jeu.recommencer" @reglages="jeu.quitter">
      <TableauCorrection :historique="historique" />
    </ResultatsJeu>
  </div>
</template>

<script setup lang="ts">
import type { NomIcone } from '../../images/icones.ts'
import Icone from '../../images/Icone.vue'
// La géométrie : la vue ne fait que les réglages et le rendu d'une question (cases à colorier, figures, lettres). C'est le même composant
// pour les exercices de géométrie (une vue mince par exercice : FiguresView.vue…), qui lui donnent leur définition et le nom de leur section
// de textes (titre de la page). Niveaux : src/exercices/<id>/definition.ts ; générateur, dessins et fiche, communs : src/moteurs/geometrie/ ;
// les figures et les solides se dessinent avec src/dessins/.
import { ref, computed } from 'vue'
import { useLangue } from '../../langues/useLangue.ts'
import { traducteur } from '../../langues/catalogue.ts'
import CadreExercice from '../../noyau/CadreExercice.vue'
import ChoixReglage from '../../noyau/ChoixReglage.vue'
import ChoixReponses from '../../noyau/ChoixReponses.vue'
import QuestionJeu from '../../noyau/QuestionJeu.vue'
import BoutonSuivant from '../../noyau/BoutonSuivant.vue'
import ResultatsJeu from '../../noyau/ResultatsJeu.vue'
import RetourReponse from '../../noyau/RetourReponse.vue'
import ConsigneParlee from '../../noyau/ConsigneParlee.vue'
import TableauCorrection from '../../noyau/TableauCorrection.vue'
import { useReglages } from '../../noyau/useReglages.ts'
import { useJeu } from '../../noyau/useJeu.ts'
import { useFicheExercice } from '../../noyau/useFicheExercice.ts'
import type { DefinitionTypee } from '../../noyau/definir.ts'
import { CONTENU } from '../../moteurs/geometrie/textes.ts'
import { moteurGeometrie, typesDeDefinition, verifier, decrire, messageErreur } from '../../moteurs/geometrie/generateur.ts'
import type { Question, QSymetrie, Reglages, Reponse } from '../../moteurs/geometrie/generateur.ts'
import { k } from '../../moteurs/geometrie/quadrillage.ts'
import { angleDroitAu } from '../../moteurs/geometrie/donnees.ts'
import { svgFigure, svgSolide, svgCercle, svgPatron } from '../../moteurs/geometrie/dessins.ts'
import { fiche as ficheGeometrie } from '../../moteurs/geometrie/fiche.ts'
import { svgAngle } from '../../moteurs/geometrie/angles.ts'

/** L'icône de chaque choix du réglage (src/images/icones.ts). */
const ICONE_EXERCICE: Readonly<Record<string, NomIcone>> = { symetrie: 'papillon', aigus: 'equerre', justifier: 'presseFeuilles', figures: 'losange', solides: 'glacon', angles: 'equerre', proprietes: 'presseFeuilles', cercle: 'cercle', patrons: 'de' }

const props = defineProps<{
  definition: DefinitionTypee<Reglages>
  /** la section de textes de l'interface de l'exercice (`figures` : son titre) */
  section: string
}>()
const { t } = useLangue()
// Réglages mémorisés, ajustés au changement de niveau (politique commune : src/noyau/useReglages.ts) ; maths : le contenu (questions,
// fiche) suit la langue de l'interface
const { config, langueContenu } = useReglages(props.definition)
const T = traducteur(CONTENU, () => langueContenu.value)
// les types de questions des niveaux de l'exercice (sa définition)
const typesDe = typesDeDefinition(props.definition)
const { questions: tirer, questionsFiche } = moteurGeometrie(typesDe, [])
/** le titre de la page : celui de la section de textes de l'exercice */
const titrePage = computed(() => (t as (cle: string) => string)(`${props.section}.titre`))
/** le nom d'un type de questions (réglage `exercices`) */
const libelleType = (type: unknown): string => (t as (cle: string) => string)(`geometrie.exercices.${String(type)}`)
// un seul type de questions au niveau : pas de réglage à montrer
const plusieursTypes = computed(() => typesDe(config.value.niveau).length > 1)

const avecSymetrie = computed(() => (config.value.exercices as readonly string[]).includes('symetrie'))

// ── Jeu ──
const selection = ref<Record<string, boolean>>({})   // cases (clés « colonne,ligne ») ou lettres cochées

const jeu = useJeu<Question, Reponse>({
  generer: rng => tirer({ niveau: config.value.niveau, reglages: config.value, rng, T, nb: config.value.nbQ }),
  verifier,
  messageErreur: (q, rep) => messageErreur(q, rep, T),
  delai: 900,
  surQuestion: () => { selection.value = {} },
})
const { phase, questions, q, bonnes, historique, retour, repondu, etat, cleFin } = jeu

const reussi = computed(() => !!retour.value?.ok)
const consigne = computed(() => (q.value ? ('consigne' in q.value ? q.value.consigne : q.value.texte) : ''))
// correction case par case, une fois la réponse donnée
const estGrille = computed(() => q.value?.type === 'symetrie')
const corrige = computed(() => repondu.value && estGrille.value && historique.value.at(-1)?.rep != null)
const modeleSet = computed(() => new Set(q.value && 'modele' in q.value ? q.value.modele : []))
const cellulesSet = computed(() => new Set(q.value && 'cellules' in q.value ? q.value.cellules : []))
const dessin = computed(() => {
  const x = q.value
  if (!x) return ''
  // le codage de l'angle droit : à partir du CE1 seulement
  if (x.type === 'figure') return svgFigure(x, x.sous === 'nom' && angleDroitAu(config.value.niveau))
  if (x.type === 'solide') return x.proposes ? '' : svgSolide(x.solide)
  if (x.type === 'angles') return svgFigure(x, repondu.value && !reussi.value)
  if (x.type === 'cercle') return svgCercle(x)
  if (x.type === 'patron') return svgPatron(x.cases)
  if (x.type === 'aigus') return svgAngle(x)
  // justifier : sans le codage des angles droits (c'est à l'élève de les vérifier)
  if (x.type === 'justifier') return svgFigure(x, false)
  return ''
})

function classeLettre(l: string): string {
  const x = q.value
  const sel = !!selection.value[l]
  if (!repondu.value) return sel ? 'actif' : ''
  if (x?.type !== 'angles') return ''
  const att = x.droits.length ? x.droits.includes(l) : l === 'aucun'
  if (att) return sel ? 'bon' : 'manque'
  return sel ? 'faux' : ''
}
function basculerLettre(l: string): void {
  if (repondu.value) return
  if (l === 'aucun') { selection.value = selection.value.aucun ? {} : { aucun: true }; return }
  const s = { ...selection.value }
  delete s.aucun
  if (s[l]) delete s[l]; else s[l] = true
  selection.value = s
}

function styleGrille(cols: number): Record<string, string> {
  return { gridTemplateColumns: `repeat(${cols}, var(--cell))`, '--cell': `clamp(26px, calc((100vw - 4rem) / ${cols}), 40px)` }
}
function styleAxe(x: QSymetrie): Record<string, string> {
  const n = (x.axe === 'v' ? x.cols : x.rows) / 2
  const pos = `calc(${n} * (var(--cell) + 1px) - 1.5px)`
  return x.axe === 'v' ? { left: pos } : { top: pos }
}

function etatCase(cle: string): string {
  const sel = !!selection.value[cle]
  if (!corrige.value) return sel ? 'coloriee' : ''
  const att = cellulesSet.value.has(cle)
  if (att && sel) return 'juste'
  if (att) return 'manquante'
  if (sel) return 'entrop'
  return ''
}

function cliquableSymetrie(c: number, r: number): boolean {
  const x = q.value
  if (x?.type !== 'symetrie') return false
  const pos = x.axe === 'v' ? c : r
  const moitie = (x.axe === 'v' ? x.cols : x.rows) / 2
  return x.premier ? pos >= moitie : pos < moitie
}
function classeSymetrie(c: number, r: number): string | string[] {
  const cle = k(c, r)
  if (modeleSet.value.has(cle)) return 'modele'
  if (!cliquableSymetrie(c, r)) return 'inactive'
  return ['cliquable', etatCase(cle)]
}
function clicSymetrie(c: number, r: number): void {
  if (cliquableSymetrie(c, r)) basculer(k(c, r))
}

function basculer(cle: string): void {
  if (repondu.value) return
  const s = { ...selection.value }
  if (s[cle]) delete s[cle]; else s[cle] = true
  selection.value = s
}

function effacer(): void {
  if (!repondu.value) selection.value = {}
}

function repondre(rep: Reponse): void {
  if (q.value) jeu.repondre(rep, { donne: decrire(q.value, rep, T) })
}
const choisir = (i: number): void => repondre({ choix: i })

function valider(): void {
  const x = q.value
  if (repondu.value || !x || 'options' in x) return
  const sel = Object.keys(selection.value)
  if (!sel.length) return
  repondre(x.type === 'angles' ? { lettres: sel } : { selection: sel })
}

// passer : la question compte comme une erreur, et on enchaîne aussitôt
function passer(): void {
  if (repondu.value) return
  jeu.passer({ donne: t('geometrie.passe') })
  jeu.suivante()
}

// ── Fiche imprimable (aperçu et impression : CadreExercice) : graine du lien, sinon tirée ──
const { mode, fiche, nouvelle } = useFicheExercice({
  tirer: rng => questionsFiche({ niveau: config.value.niveau, reglages: config.value, rng, T }),
  mettreEnPage: (tirage, police) => ficheGeometrie({ questions: tirage, reglages: config.value, T, langue: langueContenu.value, ...police }),
})
</script>

<style scoped>
.consigne {
  font-size: 1.3rem;
  font-weight: 700;
  text-align: center;
  margin: .5rem 0 1rem;
  line-height: 1.4;
}

.astuce { text-align: center; color: #666; font-size: .95rem; margin-top: .5rem; }

.grilles {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1.25rem;
  margin: .5rem 0;
}

.grille {
  display: grid;
  gap: 1px;
  padding: 1px;
  background: #9aa5b1;
  position: relative;
  width: max-content;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
}

.case {
  width: var(--cell);
  height: var(--cell);
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1rem;
  transition: background .1s;
}
.case.cliquable { cursor: pointer; }
.case.cliquable:hover { background: #eef5ff; }
.case.inactive { background: #eef0f2; }
.case.modele   { background: var(--bleu); }
.case.coloriee, .case.cliquable.coloriee:hover { background: var(--orange); }
.case.juste    { background: var(--vert); }
.case.manquante { background: #fff3cd; box-shadow: inset 0 0 0 3px var(--orange); }
.case.manquante::after { content: '•'; color: var(--orange); font-size: 1.4rem; }
.case.entrop   { background: var(--rouge); }
.case.entrop::after { content: '✕'; color: white; }

.axe { position: absolute; background: var(--rouge); border-radius: 2px; pointer-events: none; }
.axe-v { width: 4px; top: -10px; bottom: -10px; }
.axe-h { height: 4px; left: -10px; right: -10px; }

.dessin { display: flex; justify-content: center; margin: .5rem 0; }
.dessin :deep(svg) { max-width: 100%; height: auto; }

.choix-group {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: .75rem;
  margin-top: 1rem;
}
.choix-btn {
  min-height: 56px;
  font-size: 1.2rem;
  font-weight: 800;
  border: 3px solid var(--gris-brd);
  border-radius: var(--radius);
  background: white;
  color: var(--texte);
  cursor: pointer;
  transition: border-color .15s, background .15s;
}
.choix-btn:hover:not(:disabled) { border-color: var(--bleu); color: var(--bleu); }
.choix-btn:disabled { cursor: default; }
.choix-btn.bon  { border-color: var(--vert); background: #f0faf0; color: var(--vert); }
.choix-btn.faux { border-color: var(--rouge); background: #fef0f0; color: var(--rouge); }
.choix-btn.actif { border-color: var(--bleu); background: var(--bleu); color: white; }
.choix-btn.manque { border-color: var(--orange); background: #fff3cd; color: var(--texte); }

.legende { display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap; font-size: .9rem; color: #555; }
.pastille { display: inline-block; width: 14px; height: 14px; border-radius: 3px; vertical-align: middle; margin-right: .2rem; }
.pastille.juste { background: var(--vert); }
.pastille.manquante { background: #fff3cd; box-shadow: inset 0 0 0 2px var(--orange); }
.pastille.entrop { background: var(--rouge); }

@media (max-width: 520px) {
  .container :deep(.exercise-box) { padding: 1rem .5rem; }
  .consigne { font-size: 1.1rem; }
}
</style>
