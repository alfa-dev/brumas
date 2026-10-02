// Seção "Sobre o Festival": fundo medieval e mágico animado (trilhas de tinta, astrolábio com luas,
// faíscas, constelações), parallax, brilho que segue o mouse e revelação da jornada
(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const SVG_NS = 'http://www.w3.org/2000/svg';

  // Trilhas de tinta (coordenadas no viewBox 1200x900) e lugares do mapa
  const TRAILS = [
    'M -40 760 C 160 700, 220 560, 380 600 S 560 760, 700 640 S 860 420, 1000 470 S 1180 560, 1260 500',
    'M 1240 120 C 1060 160, 1000 300, 840 260 S 620 90, 470 170 S 260 360, 120 300 S -20 220, -60 260'
  ];
  // Constelações (pontos ligados por linhas finas que cintilam)
  const CONSTELLATIONS = [
    [[930, 120], [990, 90], [1050, 130], [1100, 105], [1140, 160]],
    [[80, 520], [130, 470], [190, 500], [230, 450]],
    [[860, 820], [920, 790], [960, 840], [1030, 810]]
  ];

  function el(name, attrs) {
    const node = document.createElementNS(SVG_NS, name);
    Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
    return node;
  }

  function buildMap(container) {
    const svg = el('svg', { viewBox: '0 0 1200 900', preserveAspectRatio: 'xMidYMid slice', class: 'map-svg' });

    // Trilhas pontilhadas que se desenham
    TRAILS.forEach((d, i) => {
      const path = el('path', { d, class: 'map-trail' });
      path.style.animationDelay = `${i * 4}s`;
      svg.appendChild(path);
    });

    // Astrolábio lúdico: anéis com fases da lua e pontinhos, girando em sentidos opostos
    const astro = el('g', { class: 'magic-sigil', transform: 'translate(170 200)' });
    const outer = el('g', { class: 'magic-sigil-outer' });
    outer.appendChild(el('circle', { r: 118, class: 'magic-line' }));
    outer.appendChild(el('circle', { r: 96, class: 'magic-line' }));
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const x = Math.cos(a) * 107, y = Math.sin(a) * 107;
      // Lua: círculo cheio com outro deslocado "apagando" uma parte, de acordo com a fase
      const phase = Math.cos(a) * 6;
      const moon = el('g', { transform: `translate(${x.toFixed(1)} ${y.toFixed(1)})` });
      moon.appendChild(el('circle', { r: 7, class: 'magic-moon' }));
      moon.appendChild(el('circle', { cx: phase.toFixed(1), r: 7, class: 'magic-moon-shadow' }));
      outer.appendChild(moon);
    }
    const inner = el('g', { class: 'magic-sigil-inner' });
    inner.appendChild(el('circle', { r: 70, class: 'magic-line' }));
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2;
      inner.appendChild(el('circle', { cx: (Math.cos(a) * 70).toFixed(1), cy: (Math.sin(a) * 70).toFixed(1), r: i % 3 === 0 ? 3 : 1.5, class: 'magic-star' }));
    }
    // Lua crescente com uma estrelinha no centro
    const center = el('g', { class: 'magic-hex' });
    center.appendChild(el('path', { d: 'M 10 -30 A 30 30 0 1 0 10 30 A 24 24 0 1 1 10 -30 Z', class: 'magic-moon' }));
    center.appendChild(el('path', { d: 'M 22 -6 Q 23 -1 28 0 Q 23 1 22 6 Q 21 1 16 0 Q 21 -1 22 -6 Z', class: 'magic-moon' }));
    astro.appendChild(outer);
    astro.appendChild(inner);
    astro.appendChild(center);
    svg.appendChild(astro);

    // Constelações (acendem quando o mouse chega perto)
    CONSTELLATIONS.forEach((pts, c) => {
      const g = el('g', { class: 'magic-constellation' });
      g.dataset.cx = pts.reduce((t, p) => t + p[0], 0) / pts.length;
      g.dataset.cy = pts.reduce((t, p) => t + p[1], 0) / pts.length;
      g.appendChild(el('polyline', { points: pts.map(p => p.join(',')).join(' '), class: 'magic-line' }));
      pts.forEach(([x, y]) => g.appendChild(el('circle', { cx: x, cy: y, r: 3, class: 'magic-star' })));
      svg.appendChild(g);
    });

    // Rosa dos ventos girando devagar
    const rose = el('g', { class: 'map-rose', transform: 'translate(1080 780)' });
    const spin = el('g', { class: 'map-rose-spin' });
    spin.appendChild(el('circle', { r: 46, class: 'map-rose-ring' }));
    spin.appendChild(el('circle', { r: 38, class: 'map-rose-ring' }));
    spin.appendChild(el('path', { d: 'M 0 -60 L 9 0 L 0 60 L -9 0 Z M -60 0 L 0 -9 L 60 0 L 0 9 Z', class: 'map-rose-star' }));
    spin.appendChild(el('path', { d: 'M -32 -32 L 4 -4 M 32 -32 L -4 -4 M -32 32 L 4 4 M 32 32 L -4 4', class: 'map-rose-ring' }));
    rose.appendChild(spin);
    const north = el('text', { x: 0, y: -68, class: 'map-rose-n', 'text-anchor': 'middle' });
    north.textContent = 'N';
    rose.appendChild(north);
    svg.appendChild(rose);

    container.appendChild(svg);
  }

  function init() {
    const section = document.getElementById('sobre');
    const map = section && section.querySelector('.about-map');
    const journey = section && section.querySelector('.about-journey');
    if (!section || !map || !journey) return;

    buildMap(map);

    const steps = journey.querySelectorAll('.journey-step');

    // Medalhões encantados: anel mágico + partículas aleatórias enquanto o mouse estiver em cima
    const COLORS = ['#e8c770', '#f6e3a6', '#c8a050', '#b98ae6', '#d9c2f5'];
    function emit(orb, count) {
      const radius = orb.offsetWidth / 2;
      for (let i = 0; i < count; i++) {
        const p = document.createElement('span');
        const star = Math.random() < 0.35;
        p.className = 'orb-particle' + (star ? ' orb-particle--star' : '');
        const angle = Math.random() * Math.PI * 2;
        const start = radius * (0.85 + Math.random() * 0.2);
        const end = start + 25 + Math.random() * 45;
        p.style.setProperty('--x0', `${Math.cos(angle) * start}px`);
        p.style.setProperty('--y0', `${Math.sin(angle) * start}px`);
        p.style.setProperty('--x1', `${Math.cos(angle) * end}px`);
        p.style.setProperty('--y1', `${Math.sin(angle) * end - 15}px`);
        p.style.setProperty('--size', `${(3 + Math.random() * (star ? 9 : 5)).toFixed(1)}px`);
        p.style.setProperty('--life', `${(0.8 + Math.random() * 0.9).toFixed(2)}s`);
        p.style.setProperty('--color', COLORS[Math.floor(Math.random() * COLORS.length)]);
        p.addEventListener('animationend', () => p.remove());
        orb.appendChild(p);
      }
    }
    steps.forEach(step => {
      const orb = step.querySelector('.journey-orb');
      if (!orb) return;
      let timer = null;
      const start = () => {
        if (timer) return;
        orb.classList.add('is-enchanted');
        if (reduceMotion) return;
        emit(orb, 12);
        timer = setInterval(() => emit(orb, 3), 260);
      };
      const stop = () => {
        orb.classList.remove('is-enchanted');
        clearInterval(timer);
        timer = null;
      };
      step.addEventListener('pointerenter', start);
      step.addEventListener('pointerleave', stop);
    });

    // Brilho dourado que segue o mouse (só com ponteiro fino)
    if (!reduceMotion && window.matchMedia('(pointer: fine)').matches) {
      const svg = map.querySelector('svg');
      const constellations = map.querySelectorAll('.magic-constellation');
      let lastTrail = 0;
      section.addEventListener('pointermove', e => {
        const r = section.getBoundingClientRect();
        const x = e.clientX - r.left, y = e.clientY - r.top;
        section.style.setProperty('--mx', `${x}px`);
        section.style.setProperty('--my', `${y}px`);
        section.classList.add('is-glowing');

        // Rastro de estrelinhas atrás do cursor (no máximo 1 a cada 70ms)
        const now = performance.now();
        if (now - lastTrail > 70) {
          lastTrail = now;
          const star = document.createElement('span');
          star.className = 'cursor-star';
          star.style.left = `${x + (Math.random() - 0.5) * 16}px`;
          star.style.top = `${y + (Math.random() - 0.5) * 16}px`;
          star.style.setProperty('--size', `${(4 + Math.random() * 6).toFixed(1)}px`);
          star.style.setProperty('--color', COLORS[Math.floor(Math.random() * COLORS.length)]);
          star.addEventListener('animationend', () => star.remove());
          section.appendChild(star);
        }

        // Constelações perto do cursor se acendem
        const ctm = svg.getScreenCTM();
        if (!ctm) return;
        constellations.forEach(g => {
          const sx = ctm.a * g.dataset.cx + ctm.e, sy = ctm.d * g.dataset.cy + ctm.f;
          g.classList.toggle('is-lit', Math.hypot(sx - e.clientX, sy - e.clientY) < 220);
        });
      });
      section.addEventListener('pointerleave', () => {
        section.classList.remove('is-glowing');
        constellations.forEach(g => g.classList.remove('is-lit'));
      });
    }

    if (reduceMotion) {
      steps.forEach(step => step.classList.add('is-visible'));
      journey.style.setProperty('--progress', 1);
      return;
    }

    // Revela cada passo ao entrar na tela
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.35 });
    steps.forEach(step => observer.observe(step));

    // Parallax do mapa + medalhões, e fio dourado que se preenche com o scroll
    let ticking = false;
    function update() {
      ticking = false;
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;
      if (rect.bottom < 0 || rect.top > vh) return;

      map.style.transform = `translate3d(0, ${rect.top * -0.25}px, 0)`;

      const jr = journey.getBoundingClientRect();
      const progress = Math.min(1, Math.max(0, (vh * 0.6 - jr.top) / jr.height));
      journey.style.setProperty('--progress', progress.toFixed(3));

      steps.forEach(step => {
        const r = step.getBoundingClientRect();
        const offset = (r.top + r.height / 2 - vh / 2) / vh;
        step.style.setProperty('--shift', `${(offset * -24).toFixed(1)}px`);
      });
    }
    window.addEventListener('scroll', () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
