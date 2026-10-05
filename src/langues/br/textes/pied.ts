// Textes de l'interface — pied de page (breton). Traduction automatique : voir nav.ts.
import type { Traductions } from '../../types.ts'
import type fr from '../../fr/textes/pied.ts'

export default {
  nouveautes: '🆕 Nevezentioù', // br: à relire
  apropos: 'Diwar-benn',
  contribuer: '🤝 Kemer perzh war GitHub',
  libre: 'Digoust · hep bruderezh · hep toupin na spiadur',
} satisfies Traductions<typeof fr>
