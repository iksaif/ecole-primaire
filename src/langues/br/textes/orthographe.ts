// Textes de l'interface — orthographe (breton). Traduction automatique : les passages marqués « br: à relire » sont à faire vérifier par un
// brittophone (`npm run i18n:relecture`). Les mots français étudiés restent en français.
import type { Traductions } from '../../types.ts'
import type fr from '../../fr/textes/orthographe.ts'

export default {
  titre: 'Reizhskrivañ',
  description: 'Heñvelsonioù, kenglotadurioù, lizherennoù a vank (e galleg)', // br: à relire
  theme: 'Tem',
  themes: { homophones: 'Heñvelsonioù', accords: 'Kenglotadurioù', lettres: 'Lizherennoù a vank' }, // br: à relire
  ecrisReponse: 'Skriv ar ger…',
  validerCourt: 'Gwiriañ',
  accents: '⚠️ Diwall ouzh an akcentoù : {r}', // br: à relire (« attention aux accents » : terme à vérifier)
  aRetravailler: "Da labourat c'hoazh :",
  erreur: '❌ Ar respont mat eo « {r} ».',
  // br: à relire — préposition = araogenn, conjonction = stagell, déterminant = ger-mont (incertain), pronom réfléchi = raganv emober (incertain)
  explications: {
    exp_a_avoir_il_a: '"a" = ar verb "avoir" (il a)', // br: à relire
    exp_a_preposition_de_lieu: '"à" = araogenn al lec\'h', // br: à relire
    exp_a_avoir_papa_a: '"a" = ar verb "avoir" (papa a)', // br: à relire
    exp_ou_choix_ou_bien: '"ou" = un dibab (ou bien)', // br: à relire
    exp_ou_lieu_remplace_a_quel: '"où" = al lec\'h (e-lec\'h "à quel endroit")', // br: à relire
    exp_ou_choix: '"ou" = un dibab', // br: à relire
    exp_on_pronom_sujet: '"on" = raganv sujed', // br: à relire
    exp_ont_avoir_au_pluriel_ils: '"ont" = "avoir" el liester (ils ont)', // br: à relire
    exp_on_pronom_on_nous: '"on" = raganv (on = nous)', // br: à relire
    exp_et_conjonction_et_puis: '"et" = stagell (et puis)', // br: à relire
    exp_est_etre_il_est: '"est" = ar verb "être" (il est)', // br: à relire
    exp_et_conjonction: '"et" = stagell', // br: à relire
    exp_sont_etre_au_pluriel_ils: '"sont" = "être" el liester (ils sont)', // br: à relire
    exp_son_determinant_possessif: '"son" = ger-mont perc\'hennañ', // br: à relire
    exp_sont_etre_au_pluriel: '"sont" = "être" el liester', // br: à relire
    exp_ce_determinant_demonstratif: '"ce" = ger-mont diskouez', // br: à relire
    exp_se_pronom_reflechi: '"se" = raganv emober', // br: à relire
    exp_mes_determinant_possessif_pluriel_de: '"mes" = ger-mont perc\'hennañ (liester "mon"/"ma")', // br: à relire
    exp_mais_conjonction_d_opposition: '"mais" = stagell enebiñ', // br: à relire
    exp_garcon_est_masculin_petit: '"garçon" a zo gourel → "petit"', // br: à relire
    exp_fille_est_feminin_petite: '"fille" a zo benel → "petite"', // br: à relire
    exp_chien_est_masculin_content: '"chien" a zo gourel → "content"', // br: à relire
    exp_chatte_est_feminin_blanche: '"chatte" a zo benel → "blanche"', // br: à relire
    exp_un_singulier_chateau: '"un" → unander → "château"', // br: à relire
    exp_beaux_pluriel_chateaux: '"beaux" → liester → "châteaux"', // br: à relire
    exp_chiens_est_pluriel_masculin_gros: '"chiens" a zo liester gourel → "gros" (ne cheñch ket, echu gant -s)', // br: à relire
    exp_voiture_est_feminin_grosse: '"voiture" a zo benel → "grosse"', // br: à relire
    exp_les_noms_en_eau_font: 'An anvioù echu gant -eau : liester gant -eaux', // br: à relire
    exp_les_noms_en_eu_font: 'An anvioù echu gant -eu : liester gant -eux', // br: à relire
    exp_pluriel_irregulier_genou_genoux: 'Liester direizh : genou → genoux', // br: à relire
    exp_les_noms_en_al_font: 'An anvioù echu gant -al : liester gant -aux', // br: à relire
    exp_hibou_s_ecrit_avec_un: '"hibou" a vez skrivet gant un h', // br: à relire
    exp_oiseau_commence_par_oi: '"oiseau" a grog gant "oi"', // br: à relire
    exp_clown_vient_de_l_anglais: '"clown" a zeu eus ar saozneg, gant ur w', // br: à relire
    exp_chanter_s_ecrit_ch_ante: '"chanter" a vez skrivet ch + ante', // br: à relire
    exp_robe_est_feminin_grande: '"robe" a zo benel → "grande"', // br: à relire
    exp_pomme_est_feminin_verte: '"pomme" a zo benel → "verte"', // br: à relire
    exp_chats_est_pluriel_noirs: '"chats" a zo liester → "noirs"', // br: à relire
    exp_pluriel_en_s_lapins: 'El liester e vez ouzhpennet ur -s : "lapins"', // br: à relire
    exp_pluriel_en_s_olives: 'El liester e vez ouzhpennet ur -s : "olives"', // br: à relire
    exp_velos_est_pluriel_jolis: '"vélos" a zo liester → "jolis"', // br: à relire
    exp_un_masculin_boulanger: '"un" → gourel → "boulanger"', // br: à relire
    exp_maisons_est_feminin_pluriel_jolies: '"maisons" a zo benel liester → "jolies" (+e, +s)', // br: à relire
    exp_robes_est_feminin_pluriel_vertes: '"robes" a zo benel liester → "vertes" (+e, +s)', // br: à relire
  },
} as const satisfies Traductions<typeof fr>
