<template>
  <div class="container">
    <h1 class="section-heading">💶 {{ t('monnaie.titre') }}</h1>

    <CadreExercice v-if="phase === 'config'" v-model:mode="mode" :fiche="fiche" :config="config"
      @commencer="jeu.demarrer" @regenerer="nouvelle">
      <template #default="{ mode: modeCourant }">
        <ChoixReglage :definition="DEFINITION" cle="niveau" v-model="config.niveau" :titre="t('communs.niveau')" />
        <ChoixReglage :definition="DEFINITION" :niveau="config.niveau" cle="exercices" v-model="config.exercices"
          :titre="t('communs.exercices')" :libelle="e => t(`monnaie.type_${e}`)" />
        <ChoixReglage :definition="DEFINITION" :niveau="config.niveau" cle="centimes" v-model="config.centimes"
          :titre="t('monnaie.options')" :libelle="c => t(c ? 'monnaie.avecCentimes' : 'monnaie.eurosEntiers')">
          <div v-if="modeCourant === 'jouer'" class="btn-group" style="margin-top:.5rem;">
            <button type="button" class="level-btn" :class="{ active: config.aideTotal }" :aria-pressed="config.aideTotal" @click="config.aideTotal = !config.aideTotal">
              {{ config.aideTotal ? '✔' : '✖' }} {{ t('monnaie.afficherTotal') }}
            </button>
          </div>
        </ChoixReglage>
        <ChoixReglage v-if="modeCourant === 'jouer'" :definition="DEFINITION" cle="nbQ" v-model="config.nbQ" :titre="t('communs.nbQuestions')" />

        <div class="apercu">
          <span v-for="v in pieces" :key="v" class="argent" v-html="argent(v, 0.7)"></span>
        </div>

        <div v-if="modeCourant === 'imprimer'" class="aide-config">{{ t('monnaie.aideFiche') }}</div>
      </template>
    </CadreExercice>

    <QuestionJeu v-if="phase === 'jeu' && q" :jeu="jeu">
      <!-- Compter -->
      <template v-if="q.type === 'compter'">
        <div class="consigne">{{ t('monnaie.combienArgent') }}</div>
        <div class="tas">
          <span v-for="(v, i) in q.items" :key="i" class="argent" v-html="argent(v)"></span>
        </div>
        <template v-if="q.avecCentimes && decimal">
          <div class="saisie-somme">
            <SaisieReponse v-model="saisieT" type="decimal" class="exercise-input saisie-large" :etat="etat"
              :placeholder="t('monnaie.exemple')" :disabled="repondu" focus aria-describedby="monnaie-retour" @entree="entree" />
          </div>
          <div class="astuce" style="text-align:center;">{{ t('monnaie.tuPeuxEcrire') }}</div>
        </template>
        <div v-else class="saisie-somme">
          <SaisieReponse v-model="saisieE" type="nombre" class="exercise-input saisie-petite" :etat="etat" min="0" placeholder="?"
            :disabled="repondu" :libelle="t('monnaie.euros')" focus aria-describedby="monnaie-retour" @entree="entree" />
          <span class="unite" aria-hidden="true">€</span>
          <template v-if="q.avecCentimes">
            <SaisieReponse v-model="saisieC" type="nombre" class="exercise-input saisie-petite" :etat="etat" min="0" max="99"
              placeholder="?" :disabled="repondu" :libelle="t('monnaie.centimes')" aria-describedby="monnaie-retour" @entree="entree" />
            <span class="unite" aria-hidden="true">c</span>
          </template>
        </div>
      </template>

      <!-- Composer / le moins possible / rendre -->
      <template v-if="q.type === 'composer' || q.type === 'moins' || q.type === 'rendre'">
        <div v-if="q.type === 'composer'" class="consigne">
          {{ t('monnaie.composer1') }} <strong class="somme">{{ f(q.cible) }}</strong>
        </div>
        <div v-else-if="q.type === 'moins'" class="consigne">
          {{ t('monnaie.moins1') }} <strong class="somme">{{ f(q.cible) }}</strong>
          {{ t('monnaie.moins2') }} <strong>{{ t('monnaie.moins3') }}</strong> {{ t('monnaie.moins4') }}
        </div>
        <template v-else>
          <div class="consigne">
            <span class="objet">{{ q.objet.e }}</span>
            {{ T('tuAchetes') }} {{ nomObjet(q.objet, T) }} {{ T(q.objet.pluriel ? 'coutent' : 'coute') }} <strong class="somme">{{ f(q.prix) }}</strong>.
          </div>
          <div class="consigne petite">
            {{ T('tuDonnes') }}
            <span class="argent" v-html="argent(q.paye, 0.8)"></span>
          </div>
          <div class="consigne petite">{{ t('monnaie.combienRendre') }}</div>
        </template>

        <div class="plateau" :class="etat">
          <span v-if="!selection.length" class="plateau-vide">{{ t('monnaie.plateauVide') }}</span>
          <button v-for="(v, i) in selection" :key="i" type="button" class="btn-argent dans-plateau"
                  :disabled="repondu" :title="t('monnaie.enlever') + ' : ' + nomArgent(v, T)"
                  @click="enlever(i)">
            <span class="argent" v-html="argent(v, 0.8)"></span>
          </button>
        </div>
        <div class="plateau-actions">
          <span v-if="config.aideTotal" class="total-aide">{{ t('monnaie.total') }} : <strong>{{ f(totalDe(selection)) }}</strong></span>
          <span v-else></span>
          <span class="btn-group">
            <button type="button" class="btn btn-ghost petit" :disabled="repondu || !selection.length" @click="selection.pop()">{{ t('communs.annuler') }}</button>
            <button type="button" class="btn btn-ghost petit" :disabled="repondu || !selection.length" @click="selection = []">{{ t('monnaie.toutEnlever') }}</button>
          </span>
        </div>

        <div class="palette">
          <button v-for="v in pieces" :key="v" type="button" class="btn-argent" :disabled="repondu"
                  :title="t('monnaie.ajouter') + ' : ' + nomArgent(v, T)" @click="ajouter(v)">
            <span class="argent" v-html="argent(v)"></span>
          </button>
        </div>
      </template>

      <!-- Convertir (CE2) -->
      <template v-if="q.type === 'convertir'">
        <div class="consigne">{{ t('monnaie.rappel') }} : <strong>1 € = 100 c</strong></div>
        <div class="consigne conversion">{{ q.texte.replace(/ = \?.*$/, ' =') }}</div>
        <div class="saisie-somme">
          <template v-if="q.sous === 'c2ec'">
            <SaisieReponse v-model="saisieE" type="nombre" class="exercise-input saisie-petite" :etat="etat" min="0" placeholder="?"
              :disabled="repondu" :libelle="t('monnaie.euros')" focus aria-describedby="monnaie-retour" @entree="entree" />
            <span class="unite" aria-hidden="true">€</span>
            <SaisieReponse v-model="saisieC" type="nombre" class="exercise-input saisie-petite" :etat="etat" min="0" max="99"
              placeholder="?" :disabled="repondu" :libelle="t('monnaie.centimes')" aria-describedby="monnaie-retour" @entree="entree" />
            <span class="unite" aria-hidden="true">c</span>
          </template>
          <template v-else>
            <SaisieReponse v-model="saisieT" type="decimal" class="exercise-input saisie-large" :etat="etat"
              :placeholder="q.sous === 'ec2dec' ? '?,??' : '?'"
              :disabled="repondu" focus aria-describedby="monnaie-retour" @entree="entree" />
            <span class="unite" aria-hidden="true">{{ q.sous === 'ec2dec' ? '€' : 'c' }}</span>
          </template>
        </div>
      </template>

      <!-- Comparer -->
      <template v-if="q.type === 'comparer'">
        <div class="consigne">{{ t('monnaie.quiPlus') }}</div>
        <div class="porte-monnaies">
          <div v-for="cote in COTES" :key="cote" class="porte-monnaie"
               :class="{ gagnant: repondu && (q.bonne === cote || q.bonne === 'egal') }">
            <div class="porte-nom">👛 {{ cote === 'A' ? q.nomA : q.nomB }}</div>
            <div class="tas">
              <span v-for="(v, i) in (cote === 'A' ? q.itemsA : q.itemsB)" :key="i"
                    class="argent" v-html="argent(v, 0.75)"></span>
            </div>
            <div v-if="repondu" class="porte-total">{{ f(cote === 'A' ? q.totalA : q.totalB) }}</div>
          </div>
        </div>
        <div class="btn-group" style="justify-content:center;margin-top:1rem;">
          <button type="button" class="btn btn-ghost choix" :disabled="repondu" @click="choisirComparer('A')">{{ q.nomA }}</button>
          <button type="button" class="btn btn-ghost choix" :disabled="repondu" @click="choisirComparer('B')">{{ q.nomB }}</button>
          <button type="button" class="btn btn-ghost choix" :disabled="repondu" @click="choisirComparer('egal')">{{ t('monnaie.autantDeux') }}</button>
        </div>
      </template>

      <RetourReponse id="monnaie-retour" :message="feedback" :etat="feedbackEtat" />

      <!-- Correction visuelle -->
      <div v-if="repondu && !dernierOk" class="correction">
        <template v-if="q.type === 'compter'">
          <strong>{{ t('monnaie.ilYa', { s: q.attendu }) }}</strong>
          <div class="astuce">{{ t('monnaie.astuceCompter') }}<span v-if="config.niveau === 'ce2'"> {{ t('monnaie.noublie') }} : 100 c = 1 €.</span></div>
        </template>
        <template v-else-if="q.type === 'convertir'">
          {{ q.texte.replace(/ = \?.*$/, '') }} = <strong>{{ q.attendu }}</strong>
          <div class="astuce">{{ t('monnaie.astuceConvertir') }}</div>
        </template>
        <template v-else-if="q.type === 'comparer'">
          {{ q.nomA }}{{ t('monnaie.aSomme') }} <strong>{{ f(q.totalA) }}</strong>,
          {{ q.nomB }}{{ t('monnaie.aSomme') }} <strong>{{ f(q.totalB) }}</strong>.
          <div class="astuce">{{ t('monnaie.astuceComparer') }}</div>
        </template>
        <template v-else>
          <div>{{ q.type === 'moins' ? t('monnaie.avecMoins') : t('monnaie.uneBonne') }}</div>
          <div class="tas">
            <span v-for="(v, i) in q.solution" :key="i" class="argent" v-html="argent(v, 0.75)"></span>
          </div>
          <div v-if="q.type === 'rendre'" class="astuce">
            {{ t('monnaie.astuceRendre', { prix: f(q.prix), paye: f(q.paye), cible: f(q.cible) }) }}
          </div>
          <div v-else-if="q.type === 'moins'" class="astuce">{{ t('monnaie.astuceMoins') }}</div>
        </template>
      </div>

      <div class="btn-group" style="justify-content:center;margin-top:1rem;">
        <template v-if="!repondu">
          <button type="button" class="btn btn-ghost" @click="passer">{{ t('monnaie.passer') }}</button>
          <button v-if="q.type !== 'comparer'" type="button" class="btn btn-primary" @click="valider">{{ t('communs.valider') }}</button>
        </template>
        <BoutonSuivant v-else :jeu="jeu" />
      </div>
    </QuestionJeu>

    <ResultatsJeu v-if="phase === 'resultats'" :bonnes="bonnes" :total="questions.length" :cle-fin="cleFin"
      @rejouer="jeu.recommencer" @reglages="jeu.quitter">
      <TableauCorrection :historique="historique" />
    </ResultatsJeu>
  </div>
</template>

<script setup lang="ts">
// La monnaie : la vue ne fait que les réglages et le rendu d'une question. Niveaux, générateur et fiche :
// src/exercices/monnaie/ (definition.ts, generateur.ts, fiche.ts) ; les pièces et les billets : src/dessins/argent.ts. Sommes en centimes.
import { ref, computed } from 'vue'
import { useLangue } from '../../langues/useLangue.ts'
import { traducteur } from '../../langues/catalogue.ts'
import CadreExercice from '../../noyau/CadreExercice.vue'
import ChoixReglage from '../../noyau/ChoixReglage.vue'
import QuestionJeu from '../../noyau/QuestionJeu.vue'
import BoutonSuivant from '../../noyau/BoutonSuivant.vue'
import SaisieReponse from '../../noyau/SaisieReponse.vue'
import RetourReponse from '../../noyau/RetourReponse.vue'
import ResultatsJeu from '../../noyau/ResultatsJeu.vue'
import TableauCorrection from '../../noyau/TableauCorrection.vue'
import { useReglages } from '../../noyau/useReglages.ts'
import { useJeu } from '../../noyau/useJeu.ts'
import { useFicheExercice } from '../../noyau/useFicheExercice.ts'
import DEFINITION from '../../exercices/monnaie/definition.ts'
import { CONTENU } from '../../exercices/monnaie/textes.ts'
import {
  questions as tirer, questionsFiche, verifier, sommeDonnee, donnees, palette, fmt, formatSomme, totalDe, trierDesc, nomArgent, nomObjet,
} from '../../exercices/monnaie/generateur.ts'
import type { Choix, Question, Reponse } from '../../exercices/monnaie/generateur.ts'
import { fiche as ficheMonnaie } from '../../exercices/monnaie/fiche.ts'
import { svgArgent } from '../../dessins/argent.ts'
import type { ValeurArgent } from '../../dessins/argent.ts'

const { t } = useLangue()
// Réglages mémorisés, ajustés au changement de niveau ; maths : le contenu (énoncés, fiche) suit la langue de l'interface
const { config, langueContenu } = useReglages(DEFINITION)
// T : les textes du contenu (CONTENU, textes.ts : objets, prénoms, nom des pièces), dans la langue du contenu
const T = traducteur(CONTENU, () => langueContenu.value)

const COTES = ['A', 'B'] as const
const decimal = computed(() => donnees(config.value.niveau).saisieDecimale)
const pieces = computed(() => palette(config.value.niveau, config.value.centimes))
const f = (c: number): string => fmt(c, config.value.niveau)
// « billet de 5 € », « pièce de 2 centimes » : lecteurs d'écran et infobulles
const argent = (v: ValeurArgent, echelle = 1): string => svgArgent(v, echelle, nomArgent(v, T))

// ── Jeu ──
const saisieE = ref<string | number>('')
const saisieC = ref<string | number>('')
const saisieT = ref<string | number>('')
const selection = ref<ValeurArgent[]>([])
const avis = ref('')          // somme illisible : message, sans compter de réponse

// message après une erreur, selon le type de question (rep : la réponse donnée ; null si passée)
function messageErreur(q: Question, rep: Reponse | null): string {
  if (!rep) return ''
  if (q.type === 'comparer') return `❌ ${q.bonne === 'egal' ? t('monnaie.autantArgent', { s: f(q.totalA) }) : t('monnaie.lePlus', { nom: q.attendu })}`
  if (q.type === 'compter' || q.type === 'convertir') return `❌ ${t('monnaie.pasTout')}`
  const tot = totalDe(rep.selection ?? [])
  if (q.type === 'moins') return `❌ ${tot !== q.cible ? t('monnaie.auLieuDe', { t: f(tot), c: f(q.cible) }) : t('monnaie.tropDePieces', { t: f(tot), n: q.solution.length })}`
  return `❌ ${tot < q.cible ? t('monnaie.ilManque', { t: f(tot), m: f(q.cible - tot) }) : t('monnaie.deTrop', { t: f(tot), m: f(tot - q.cible) })}`
}

const jeu = useJeu<Question, Reponse>({
  generer: rng => tirer({ niveau: config.value.niveau, reglages: config.value, rng, T, nb: config.value.nbQ }),
  verifier,
  messageErreur,
  delai: 900,
  // champs vidés ; le focus : SaisieReponse (attribut focus)
  surQuestion: () => { saisieE.value = ''; saisieC.value = ''; saisieT.value = ''; selection.value = []; avis.value = '' },
})
const { phase, questions, q, bonnes, historique, retour, repondu, etat, cleFin } = jeu

const dernierOk = computed(() => !!retour.value?.ok)
const feedback = computed(() => retour.value?.message ?? avis.value)
const feedbackEtat = computed(() => (etat.value || (avis.value ? 'erreur' : '')))

function ajouter(v: ValeurArgent) { if (!repondu.value && selection.value.length < 30) selection.value.push(v) }
function enlever(i: number) { if (!repondu.value) selection.value.splice(i, 1) }

function entree() {
  if (!repondu.value) valider()
  else if (!dernierOk.value) jeu.suivante()
}

function valider() {
  if (repondu.value) return
  const qu = q.value
  if (!qu) return
  if (qu.type === 'convertir') {
    const deux = qu.sous === 'c2ec'
    if (deux ? saisieE.value === '' && saisieC.value === '' : !String(saisieT.value).trim()) return
    const donne = deux ? `${saisieE.value || 0} € ${saisieC.value || 0} c` : `${String(saisieT.value).trim()}${qu.sous === 'ec2dec' ? '' : ' c'}`
    jeu.repondre({ e: String(saisieE.value), c: String(saisieC.value), texte: String(saisieT.value) }, { donne })
    return
  }
  if (qu.type === 'compter') {
    const enTexte = qu.avecCentimes && decimal.value
    if (enTexte ? !String(saisieT.value).trim() : saisieE.value === '' && saisieC.value === '') return
    const rep: Reponse = enTexte ? { texte: String(saisieT.value) } : { e: String(saisieE.value), c: String(saisieC.value) }
    const val = sommeDonnee(qu, rep)
    if (val === null) { if (enTexte) avis.value = t('monnaie.ecrisSomme'); return }
    jeu.repondre(rep, { donne: f(val) })
    return
  }
  if (!selection.value.length) return
  const sel = [...selection.value]
  const donne = qu.type === 'moins' ? `${sel.length} : ${trierDesc(sel).map(formatSomme).join(' + ')}` : f(totalDe(sel))
  jeu.repondre({ selection: sel }, { donne })
}

function choisirComparer(choix: Choix) {
  const qu = q.value
  if (qu?.type !== 'comparer') return
  jeu.repondre({ choix }, { donne: choix === 'A' ? qu.nomA : choix === 'B' ? qu.nomB : T('autant') })
}

// passer : la question compte comme une erreur, et on enchaîne aussitôt
function passer() {
  if (repondu.value) return
  jeu.passer({ donne: t('monnaie.passe') })
  jeu.suivante()
}

// ── Fiche imprimable (aperçu et impression : CadreExercice) : graine du lien, sinon tirée ──
const { mode, fiche, nouvelle } = useFicheExercice({
  tirer: rng => questionsFiche({ niveau: config.value.niveau, reglages: config.value, rng, T }),
  mettreEnPage: (tirage, police) => ficheMonnaie({ questions: tirage, reglages: config.value, T, langue: langueContenu.value, ...police }),
})
</script>

<style scoped>
.aide-config { font-size: .8rem; color: #595959; margin-top: .4rem; }
.consigne {
  font-size: 1.3rem;
  font-weight: 700;
  text-align: center;
  margin: .75rem 0;
  line-height: 1.5;
}
.consigne.petite { font-size: 1.1rem; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: .5rem; flex-wrap: wrap; }
.somme { color: var(--bleu); white-space: nowrap; font-size: 1.5rem; }
.objet { font-size: 2rem; vertical-align: middle; }

.apercu {
  display: flex; flex-wrap: wrap; align-items: center; justify-content: center;
  gap: 6px; margin-top: 1rem; padding: .75rem; background: var(--gris-bg); border-radius: 8px;
}

.tas {
  display: flex; flex-wrap: wrap; align-items: center; justify-content: center;
  gap: 8px; margin: 1rem 0;
}
.argent { display: inline-flex; line-height: 0; }
.argent :deep(svg) { display: block; filter: drop-shadow(0 1px 1px rgba(0,0,0,.25)); }

.saisie-somme {
  display: flex; align-items: center; justify-content: center; gap: .5rem; margin-top: .5rem;
}
.saisie-petite { width: 7rem; display: inline-block; }
.saisie-large { width: 12rem; display: inline-block; }
.consigne.conversion { font-size: 1.8rem; font-weight: 900; }
.unite { font-size: 1.8rem; font-weight: 800; }

.plateau {
  min-height: 90px;
  border: 3px dashed var(--gris-brd);
  border-radius: var(--radius);
  padding: .5rem;
  display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 4px;
  margin-top: .75rem;
  background: #fffdf5;
}
.plateau.ok     { border-color: var(--vert); background: #f0faf0; }
.plateau.erreur { border-color: var(--rouge); background: #fef0f0; }
.plateau-vide { color: #6b6b6b; font-style: italic; }

.plateau-actions {
  display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;
  gap: .5rem; margin: .5rem 0 1rem;
}
.total-aide { font-size: 1.1rem; }
.btn.petit { padding: .45rem .9rem; font-size: .9rem; min-height: 44px; }
.btn:disabled { opacity: .45; cursor: not-allowed; }

.palette {
  display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 8px;
  padding: .75rem; background: var(--gris-bg); border-radius: var(--radius);
}
.btn-argent {
  min-width: 48px; min-height: 48px;
  display: inline-flex; align-items: center; justify-content: center;
  background: white; border: 2px solid var(--gris-brd); border-radius: 10px;
  padding: 4px; cursor: pointer; transition: transform .1s, border-color .15s;
  touch-action: manipulation;
}
.btn-argent:hover:not(:disabled)  { border-color: var(--bleu); }
.btn-argent:active:not(:disabled) { transform: scale(.94); }
.btn-argent:disabled { cursor: default; opacity: .8; }
.btn-argent.dans-plateau { background: transparent; border-color: transparent; }

.porte-monnaies {
  display: grid; grid-template-columns: 1fr 1fr; gap: .75rem;
}
.porte-monnaie {
  border: 3px solid var(--gris-brd); border-radius: var(--radius); padding: .5rem;
  background: #fffdf5;
}
.porte-monnaie.gagnant { border-color: var(--vert); background: #f0faf0; }
.porte-nom { font-weight: 800; text-align: center; font-size: 1.15rem; }
.porte-monnaie .tas { margin: .5rem 0; gap: 4px; }
.porte-total { text-align: center; font-weight: 800; font-size: 1.2rem; color: var(--bleu); }
.choix { min-height: 48px; font-size: 1.05rem; }

.correction {
  border: 2px solid var(--orange); background: #fff8ec; border-radius: var(--radius);
  padding: .75rem 1rem; text-align: center; font-size: 1.05rem;
}
.correction .tas { margin: .5rem 0; }
.astuce { font-size: .95rem; color: #666; margin-top: .4rem; }

@media (max-width: 520px) {
  .porte-monnaies { grid-template-columns: 1fr; }
  .container :deep(.exercise-box) { padding: 1.25rem .75rem; }
}
</style>
