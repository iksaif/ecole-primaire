// Utilitaires communs à tous les exercices

const Utils = (() => {
  function aleatoire(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function melanger(tableau) {
    const t = [...tableau];
    for (let i = t.length - 1; i > 0; i--) {
      const j = aleatoire(0, i);
      [t[i], t[j]] = [t[j], t[i]];
    }
    return t;
  }

  function sauvegarder(cle, valeur) {
    try { localStorage.setItem('ep_' + cle, JSON.stringify(valeur)); } catch {}
  }

  function charger(cle, defaut = null) {
    try {
      const v = localStorage.getItem('ep_' + cle);
      return v !== null ? JSON.parse(v) : defaut;
    } catch { return defaut; }
  }

  function confettis(nb = 30) {
    const couleurs = ['#4a90e2','#5cb85c','#f39c12','#e74c3c','#9b59b6','#f1c40f'];
    for (let i = 0; i < nb; i++) {
      const el = document.createElement('div');
      el.style.cssText = `
        position:fixed; top:-10px; pointer-events:none; z-index:9999;
        width:10px; height:10px; border-radius:50%;
        background:${couleurs[aleatoire(0, couleurs.length - 1)]};
        left:${aleatoire(10, 90)}vw;
        animation: tomber ${aleatoire(1, 3)}s linear forwards;
        animation-delay:${aleatoire(0, 800)}ms;
      `;
      document.body.appendChild(el);
      el.addEventListener('animationend', () => el.remove());
    }
    if (!document.getElementById('confetti-style')) {
      const s = document.createElement('style');
      s.id = 'confetti-style';
      s.textContent = '@keyframes tomber{to{top:110vh;transform:rotate(720deg);opacity:0}}';
      document.head.appendChild(s);
    }
  }

  function pluriel(n, mot) {
    return `${n} ${mot}${n > 1 ? 's' : ''}`;
  }

  return { aleatoire, melanger, sauvegarder, charger, confettis, pluriel };
})();
