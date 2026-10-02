// Efeito "Encantado" para qualquer elemento com [data-enchant] (ex.: foto do expositor na home):
// no hover, uma luz dourada/violeta percorre a moldura e partículas saem das bordas. Mesmo visual do
// "Orbe Encantado" do Sobre (classes .orb-particle em about.css), adaptado para retângulos.
(function () {
  const COLORS = ['#e8c770', '#f6e3a6', '#c8a050', '#b98ae6', '#d9c2f5'];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function emit(el, count) {
    const w = el.offsetWidth, h = el.offsetHeight;
    for (let i = 0; i < count; i++) {
      const p = document.createElement('span');
      const star = Math.random() < 0.4;
      p.className = 'orb-particle' + (star ? ' orb-particle--star' : '');
      // ponto aleatório no perímetro, relativo ao centro, e direção para fora
      const side = Math.floor(Math.random() * 4);
      const t = Math.random() - 0.5;
      let x0, y0, dx, dy;
      if (side === 0) { x0 = t * w; y0 = -h / 2; dx = 0; dy = -1; }
      else if (side === 1) { x0 = w / 2; y0 = t * h; dx = 1; dy = 0; }
      else if (side === 2) { x0 = t * w; y0 = h / 2; dx = 0; dy = 1; }
      else { x0 = -w / 2; y0 = t * h; dx = -1; dy = 0; }
      const dist = 20 + Math.random() * 45;
      const drift = (Math.random() - 0.5) * 30;
      p.style.setProperty('--x0', `${x0}px`);
      p.style.setProperty('--y0', `${y0}px`);
      p.style.setProperty('--x1', `${x0 + dx * dist + (dy ? drift : 0)}px`);
      p.style.setProperty('--y1', `${y0 + dy * dist + (dx ? drift : 0) - 12}px`);
      p.style.setProperty('--size', `${(3 + Math.random() * (star ? 9 : 5)).toFixed(1)}px`);
      p.style.setProperty('--life', `${(0.8 + Math.random() * 0.9).toFixed(2)}s`);
      p.style.setProperty('--color', COLORS[Math.floor(Math.random() * COLORS.length)]);
      p.addEventListener('animationend', () => p.remove());
      el.appendChild(p);
    }
  }

  function init() {
    document.querySelectorAll('[data-enchant]').forEach(el => {
      let timer = null;
      el.addEventListener('pointerenter', () => {
        if (timer) return;
        el.classList.add('is-enchanted');
        if (reduceMotion) return;
        emit(el, 16);
        timer = setInterval(() => emit(el, 4), 220);
      });
      el.addEventListener('pointerleave', () => {
        el.classList.remove('is-enchanted');
        clearInterval(timer);
        timer = null;
      });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
