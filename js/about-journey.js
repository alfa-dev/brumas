// Seção "Sobre o Festival": fundo medieval e mágico animado (trilhas de tinta, astrolábio com luas,
// constelações), parallax, brilho que segue o mouse e revelação da jornada
(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Modo leve (celular/tablet): menos trilhas; e, só na reserva em JS (sem scroll-driven CSS), sem parallax,
  // porque no toque a rolagem roda fora do JS e o parallax via JS chega atrasado ("travado").
  const lite = window.matchMedia('(pointer: coarse), (max-width: 760px)').matches;
  // Com scroll-driven animations, parallax/fio/borda/entrada dos passos ficam no CSS (about.css)
  const cssScroll = window.CSS && CSS.supports('animation-timeline: view()');
  const SVG_NS = 'http://www.w3.org/2000/svg';

  // Trilhas de tinta (coordenadas no viewBox 1200x900) e lugares do mapa
  // Trilhas pontilhadas aleatórias (viewBox 1200x900): cada uma se desenha linearmente, some do início para
  // o fim e renasce com outro traçado, outra duração e outro atraso
  const TRAIL_COUNT = lite ? 2 : 4;
  const rand = (min, max) => min + Math.random() * (max - min);
  // Traçados: "suave" (poucas curvas, ondas largas), "sinuoso" (mais curvas, mais amplitude) e "laço"
  // (uma volta no meio do caminho). Curvas ligadas por "S" continuam a tangente: nada de quinas.
  let loopActive = false;
  function randomTrail(kind) {
    const fromLeft = Math.random() < 0.5;
    const dir = fromLeft ? 1 : -1;
    const segments = kind === 'suave' ? 2 : kind === 'sinuoso' ? 4 + Math.floor(Math.random() * 2) : 2;
    const amp = kind === 'suave' ? 90 : kind === 'sinuoso' ? 210 : 120;
    const step = 1360 / segments;
    const handle = step * 0.45;
    let x = fromLeft ? -80 : 1280;
    let y = rand(160, 740);
    let d = `M ${x.toFixed(0)} ${y.toFixed(0)}`;
    for (let i = 0; i < segments; i++) {
      const nx = x + dir * step;
      const ny = Math.min(820, Math.max(80, y + rand(-amp, amp)));
      if (i === 0) d += ` C ${(x + dir * handle).toFixed(0)} ${(y + rand(-40, 40)).toFixed(0)}, ${(nx - dir * handle).toFixed(0)} ${ny.toFixed(0)}, ${nx.toFixed(0)} ${ny.toFixed(0)}`;
      else d += ` S ${(nx - dir * handle).toFixed(0)} ${ny.toFixed(0)}, ${nx.toFixed(0)} ${ny.toFixed(0)}`;
      // laço: no fim do 1º trecho (meio da tela), dá uma volta para cima e segue em frente
      if (kind === 'laço' && i === 0) {
        const r = rand(55, 85);
        const up = Math.random() < 0.5 ? -1 : 1;
        const X = v => (nx + dir * v * r).toFixed(0);
        const Y = v => (ny + up * v * r).toFixed(0);
        d += ` C ${X(1.1)} ${Y(0)}, ${X(1.5)} ${Y(1.9)}, ${X(0.4)} ${Y(2)}`;
        d += ` C ${X(-0.6)} ${Y(2.1)}, ${X(-0.7)} ${Y(0.6)}, ${X(0.3)} ${Y(0.1)}`;
        d += ` C ${X(0.9)} ${Y(-0.2)}, ${X(1.6)} ${Y(-0.1)}, ${X(2.2)} ${Y(0)}`;
        x = nx + dir * 2.2 * r; y = ny;
        continue;
      }
      x = nx; y = ny;
    }
    return d;
  }
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

  function svgLayer(cls, depth) {
    const svg = el('svg', { viewBox: '0 0 1200 900', preserveAspectRatio: 'xMidYMid slice', class: `map-svg ${cls}` });
    svg.dataset.depth = depth;
    return svg;
  }

  // Desempenho: cada camada é um <svg> próprio (composto na GPU) e os anéis que giram são <svg> pequenos
  // girados por CSS. Assim nada dentro da camada grande com máscara precisa ser repintado a cada quadro.
  function buildMap(container) {
    // Camada distante: trilhas de tinta (estáticas)
    const far = svgLayer('map-far', 6);
    const defs = el('defs', {});
    far.appendChild(defs);
    for (let i = 0; i < TRAIL_COUNT; i++) {
      // a linha pontilhada aparece só onde a máscara (traço sólido animado) já passou
      const mask = el('mask', { id: `trail-mask-${i}`, maskUnits: 'userSpaceOnUse', x: -200, y: -200, width: 1600, height: 1300 });
      // pathLength fixo: o tamanho do traço na animação não depende do comprimento real do caminho, então
      // trocar o traçado entre ciclos nunca deixa pedaços aparecendo (sem piscar)
      const reveal = el('path', { class: 'map-trail-reveal', pathLength: 1000 });
      mask.appendChild(reveal);
      defs.appendChild(mask);
      const trail = el('path', { class: 'map-trail', mask: `url(#trail-mask-${i})` });
      far.appendChild(trail);

      // Cada ciclo: sorteia um traçado, desenha do início ao fim e logo apaga do início ao fim (linear),
      // espera um pouco e recomeça. Animado pela Web Animations API: duração e traçado só mudam entre
      // ciclos, com a linha totalmente apagada (nada pisca)
      const cycle = () => {
        if (!reveal.isConnected) return;
        // sorteia o tipo (no máximo um laço por vez) e a intensidade da tinta deste ciclo
        let kind = Math.random() < 0.5 ? 'suave' : 'sinuoso';
        if (!loopActive && Math.random() < 0.3) { kind = 'laço'; loopActive = true; }
        trail.isLoop = kind === 'laço';
        const d = randomTrail(kind);
        trail.setAttribute('d', d);
        reveal.setAttribute('d', d);
        trail.style.opacity = rand(0.3, 1).toFixed(2);
        const anim = reveal.animate(
          [{ strokeDashoffset: 1010 }, { strokeDashoffset: 0 }, { strokeDashoffset: -1010 }],
          { duration: rand(10000, 16000), easing: 'linear', fill: 'forwards' }
        );
        reveal.trailAnim = anim;
        anim.onfinish = () => {
          if (trail.isLoop) loopActive = false;
          setTimeout(cycle, rand(300, 2500));
        };
      };
      if (reduceMotion) {
        const d = randomTrail(i % 2 ? 'suave' : 'sinuoso');
        trail.setAttribute('d', d);
        reveal.setAttribute('d', d);
        reveal.style.strokeDashoffset = '0';
      } else {
        setTimeout(cycle, i * rand(1500, 3500));
      }
    }

    // Camada do meio: constelações (acendem quando o mouse chega perto)
    const mid = svgLayer('map-mid', 14);
    CONSTELLATIONS.forEach(pts => {
      const g = el('g', { class: 'magic-constellation' });
      g.dataset.cx = pts.reduce((t, p) => t + p[0], 0) / pts.length;
      g.dataset.cy = pts.reduce((t, p) => t + p[1], 0) / pts.length;
      g.appendChild(el('polyline', { points: pts.map(p => p.join(',')).join(' '), class: 'magic-line' }));
      pts.forEach(([x, y]) => g.appendChild(el('circle', { cx: x, cy: y, r: 3, class: 'magic-star' })));
      mid.appendChild(g);
    });

    // Astrolábio lúdico: anéis com fases da lua e pontinhos girando em sentidos opostos
    const astro = document.createElement('div');
    astro.className = 'magic-sigil';
    astro.dataset.depth = 24;
    const ring = (cls, build) => {
      const svg = el('svg', { viewBox: '-135 -135 270 270', class: cls });
      build(svg);
      astro.appendChild(svg);
    };
    ring('magic-sigil-outer', svg => {
      svg.appendChild(el('circle', { r: 118, class: 'magic-line' }));
      svg.appendChild(el('circle', { r: 96, class: 'magic-line' }));
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        const moon = el('g', { transform: `translate(${(Math.cos(a) * 107).toFixed(1)} ${(Math.sin(a) * 107).toFixed(1)})` });
        moon.appendChild(el('circle', { r: 7, class: 'magic-moon' }));
        moon.appendChild(el('circle', { cx: (Math.cos(a) * 6).toFixed(1), r: 7, class: 'magic-moon-shadow' }));
        svg.appendChild(moon);
      }
    });
    ring('magic-sigil-inner', svg => {
      svg.appendChild(el('circle', { r: 70, class: 'magic-line' }));
      for (let i = 0; i < 24; i++) {
        const a = (i / 24) * Math.PI * 2;
        svg.appendChild(el('circle', { cx: (Math.cos(a) * 70).toFixed(1), cy: (Math.sin(a) * 70).toFixed(1), r: i % 3 === 0 ? 3 : 1.5, class: 'magic-star' }));
      }
    });
    ring('magic-hex', svg => {
      svg.appendChild(el('path', { d: 'M 10 -30 A 30 30 0 1 0 10 30 A 24 24 0 1 1 10 -30 Z', class: 'magic-moon' }));
      svg.appendChild(el('path', { d: 'M 22 -6 Q 23 -1 28 0 Q 23 1 22 6 Q 21 1 16 0 Q 21 -1 22 -6 Z', class: 'magic-moon' }));
    });

    // Rosa dos ventos girando devagar
    const rose = document.createElement('div');
    rose.className = 'map-rose';
    rose.dataset.depth = 6;
    const roseSvg = el('svg', { viewBox: '-75 -85 150 160', class: 'map-rose-spin' });
    roseSvg.appendChild(el('circle', { r: 46, class: 'map-rose-ring' }));
    roseSvg.appendChild(el('circle', { r: 38, class: 'map-rose-ring' }));
    roseSvg.appendChild(el('path', { d: 'M 0 -60 L 9 0 L 0 60 L -9 0 Z M -60 0 L 0 -9 L 60 0 L 0 9 Z', class: 'map-rose-star' }));
    roseSvg.appendChild(el('path', { d: 'M -32 -32 L 4 -4 M 32 -32 L -4 -4 M -32 32 L 4 4 M 32 32 L -4 4', class: 'map-rose-ring' }));
    rose.appendChild(roseSvg);
    const north = document.createElement('span');
    north.className = 'map-rose-n';
    north.textContent = 'N';
    rose.appendChild(north);

    container.append(far, mid, astro, rose);
  }

  function init() {
    const section = document.getElementById('sobre');
    const map = section && section.querySelector('.about-map');
    const journey = section && section.querySelector('.about-journey');
    if (!section || !map || !journey) return;

    buildMap(map);

    // Borda dourada entre "Sobre" e a seção seguinte, que se abre a partir do ponto onde o fio chega
    const seam = document.createElement('span');
    seam.className = 'about-seam';
    seam.setAttribute('aria-hidden', 'true');
    section.appendChild(seam);
    const placeSeam = () => {
      const jr = journey.getBoundingClientRect(), sr = section.getBoundingClientRect();
      const lineX = window.matchMedia('(max-width: 760px)').matches ? jr.left + 36 : jr.left + jr.width / 2;
      seam.style.setProperty('--origin', `${(lineX - sr.left).toFixed(0)}px`);  // só no resize
    };
    placeSeam();
    window.addEventListener('resize', placeSeam);

    const steps = journey.querySelectorAll('.journey-step');
    const orbs = [...steps].map(step => step.querySelector('.journey-orb'));

    // Fio dourado: trilho + preenchimento reais (o preenchimento cresce por transform: scaleY, sem
    // recalcular estilo da seção a cada rolagem)
    const line = document.createElement('div');
    line.className = 'journey-line';
    line.setAttribute('aria-hidden', 'true');
    const fill = document.createElement('div');
    fill.className = 'journey-line-fill';
    line.appendChild(fill);
    journey.parentElement.appendChild(line);
    const isMobile = () => window.matchMedia('(max-width: 760px)').matches;
    function placeLine() {
      const container = journey.parentElement;
      const cr = container.getBoundingClientRect(), jr = journey.getBoundingClientRect(), sr = section.getBoundingClientRect();
      const x = isMobile() ? jr.left - cr.left + 36 : jr.left - cr.left + jr.width / 2;
      const top = jr.top - cr.top + 40;
      line.style.left = `${x.toFixed(0)}px`;
      line.style.top = `${top.toFixed(0)}px`;
      line.style.height = `${(sr.bottom - cr.top - top).toFixed(0)}px`;
    }
    placeLine();
    window.addEventListener('resize', placeLine);

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

    // Explosão de partículas num ponto qualquer da seção (reaproveita o visual do Orbe Encantado)
    function burst(x, y, count) {
      const holder = document.createElement('span');
      holder.className = 'magic-burst';
      holder.style.left = `${x}px`;
      holder.style.top = `${y}px`;
      section.appendChild(holder);
      for (let i = 0; i < count; i++) {
        const p = document.createElement('span');
        const star = Math.random() < 0.4;
        p.className = 'orb-particle' + (star ? ' orb-particle--star' : '');
        const angle = Math.random() * Math.PI * 2;
        const end = 30 + Math.random() * 70;
        p.style.setProperty('--x0', '0px');
        p.style.setProperty('--y0', '0px');
        p.style.setProperty('--x1', `${Math.cos(angle) * end}px`);
        p.style.setProperty('--y1', `${Math.sin(angle) * end - 10}px`);
        p.style.setProperty('--size', `${(3 + Math.random() * (star ? 9 : 5)).toFixed(1)}px`);
        p.style.setProperty('--life', `${(0.7 + Math.random() * 0.8).toFixed(2)}s`);
        p.style.setProperty('--color', COLORS[Math.floor(Math.random() * COLORS.length)]);
        holder.appendChild(p);
      }
      setTimeout(() => holder.remove(), 1800);
    }

    // Brilho dourado que segue o mouse (só com ponteiro fino)
    if (!reduceMotion && window.matchMedia('(pointer: fine)').matches) {
      const mid = map.querySelector('.map-mid');
      const constellations = map.querySelectorAll('.magic-constellation');
      const layers = map.querySelectorAll('[data-depth]');
      const astro = map.querySelector('.magic-sigil');
      const glow = document.createElement('div');
      glow.className = 'about-glow';
      glow.setAttribute('aria-hidden', 'true');
      section.insertBefore(glow, section.firstChild);

      // Clique no fundo: onda dourada + explosão de partículas
      section.addEventListener('click', e => {
        if (e.target.closest('a, button, .journey-step')) return;
        const r = section.getBoundingClientRect();
        const x = e.clientX - r.left, y = e.clientY - r.top;
        const ring = document.createElement('span');
        ring.className = 'magic-ripple';
        ring.style.left = `${x}px`;
        ring.style.top = `${y}px`;
        ring.addEventListener('animationend', () => ring.remove());
        section.appendChild(ring);
        burst(x, y, 16);
      });
      let lastTrail = 0;
      section.addEventListener('pointermove', e => {
        const r = section.getBoundingClientRect();
        const x = e.clientX - r.left, y = e.clientY - r.top;
        glow.style.transform = `translate3d(${x.toFixed(0)}px, ${y.toFixed(0)}px, 0)`;
        if (!glow.classList.contains('is-on')) glow.classList.add('is-on');

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

        // Profundidade: camadas do fundo se deslocam contra o cursor
        const nx = x / r.width - 0.5, ny = y / r.height - 0.5;
        layers.forEach(layer => {
          const d = layer.dataset.depth;
          layer.style.translate = `${(-nx * d).toFixed(1)}px ${(-ny * d).toFixed(1)}px`;
        });

        // Constelações perto do cursor se acendem; o astrolábio "desperta"
        const ar = astro.getBoundingClientRect();
        const near = Math.hypot(ar.left + ar.width / 2 - e.clientX, ar.top + ar.height / 2 - e.clientY) < 260;
        if (near !== astro.classList.contains('is-awake')) astro.classList.toggle('is-awake', near);
        const ctm = mid.getScreenCTM();
        if (!ctm) return;
        constellations.forEach(g => {
          const sx = ctm.a * g.dataset.cx + ctm.e, sy = ctm.d * g.dataset.cy + ctm.f;
          const lit = Math.hypot(sx - e.clientX, sy - e.clientY) < 220;
          if (lit !== g.classList.contains('is-lit')) g.classList.toggle('is-lit', lit);
        });
      });
      section.addEventListener('pointerleave', () => {
        glow.classList.remove('is-on');
        constellations.forEach(g => g.classList.remove('is-lit'));
        layers.forEach(layer => { layer.style.translate = ''; });
        astro.classList.remove('is-awake');
      });
    }

    // Fora da tela: pausa as animações contínuas do fundo
    new IntersectionObserver(([entry]) => {
      section.classList.toggle('is-paused', !entry.isIntersecting);
      // trilhas (Web Animations) também pausam fora da tela
      map.querySelectorAll('.map-trail-reveal').forEach(r => {
        if (!r.trailAnim) return;
        if (entry.isIntersecting) { if (r.trailAnim.playState === 'paused') r.trailAnim.play(); }
        else if (r.trailAnim.playState === 'running') r.trailAnim.pause();
      });
    }).observe(section);

    if (cssScroll) return; // efeitos de rolagem por conta do CSS

    if (reduceMotion) {
      steps.forEach(step => step.classList.add('is-visible'));
      fill.style.transform = 'scaleY(1)';
      section.classList.add('is-sealed');
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

      if (!lite) map.style.transform = `translate3d(0, ${rect.top * -0.25}px, 0)`;

      // Fio desce até a borda inferior da seção; ao encostar nela, abre a borda dourada entre as seções
      const lr = line.getBoundingClientRect();
      const progress = Math.min(1, Math.max(0, (vh * 0.6 - lr.top) / lr.height));
      fill.style.transform = `scaleY(${progress.toFixed(3)})`;
      const sealed = progress >= 0.995;
      if (sealed !== section.classList.contains('is-sealed')) section.classList.toggle('is-sealed', sealed);

      if (!lite) orbs.forEach(orb => {
        if (!orb) return;
        const r = orb.getBoundingClientRect();
        const offset = (r.top + r.height / 2 - vh / 2) / vh;
        orb.style.transform = `translate3d(0, ${(offset * -24).toFixed(1)}px, 0)`;
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

  // Guardrail: os efeitos só são montados quando o CSS desta versão está carregado. Com CSS antigo em
  // cache, o SVG apareceria sem estilo (formas pretas gigantes) — então espera a checagem do script.js
  // e confere o sentinela --about-fx definido em about.css.
  function cssReady() {
    const section = document.getElementById('sobre');
    return section && getComputedStyle(section).getPropertyValue('--about-fx').trim() === '1';
  }
  document.addEventListener('DOMContentLoaded', () => {
    const wait = window.BRUMAS_CSS_READY || Promise.resolve(true);
    if (cssReady()) init();
    else wait.then(() => {
      if (cssReady()) return init();
      // Sem o CSS certo: mostra os passos sem efeitos, em vez de deixá-los invisíveis
      document.querySelectorAll('#sobre .journey-step').forEach(step => step.classList.add('is-visible'));
    });
  });
})();
