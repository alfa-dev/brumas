// Carimbo de build (atualizado pelo pre-commit). Não editar à mão.
const BUILD = '34ce0cb';

// Guardrail de cache: se o CSS carregado for de outro build (cache antigo do navegador/CDN), recarrega as
// folhas de estilo com um parâmetro novo e avisa os scripts que dependem delas ('brumas:css-ready').
window.BRUMAS_CSS_READY = new Promise(resolve => {
  function cssBuild() {
    return getComputedStyle(document.documentElement).getPropertyValue('--build').trim().replace(/"/g, '');
  }
  function check() {
    if (BUILD === 'dev' || cssBuild() === BUILD) return resolve(true);
    let tries = 0;
    try { tries = Number(sessionStorage.getItem('brumas-css-retry') || 0); } catch (e) {}
    if (tries >= 2) return resolve(false);
    try { sessionStorage.setItem('brumas-css-retry', String(tries + 1)); } catch (e) {}
    const links = [...document.querySelectorAll('link[rel="stylesheet"][href^="css/"]')];
    let pending = links.length;
    if (!pending) return resolve(false);
    links.forEach(link => {
      const fresh = link.cloneNode();
      fresh.href = link.href.split('?')[0] + '?v=' + BUILD + '&r=' + Date.now();
      fresh.onload = fresh.onerror = () => {
        link.remove();
        if (--pending === 0) resolve(cssBuild() === BUILD);
      };
      link.after(fresh);
    });
  }
  if (document.readyState === 'complete') check();
  else window.addEventListener('load', check);
});

// Feedback de carregamento em botões que levam a outra página ([data-loading-link]): ícone vira um
// spinner e a largura do botão fica travada (não muda de tamanho). Desfaz ao voltar pelo histórico.
document.addEventListener('click', e => {
  const link = e.target.closest('a[data-loading-link]');
  if (!link || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
  link.style.width = `${link.getBoundingClientRect().width}px`;
  link.classList.add('is-loading');
  link.setAttribute('aria-busy', 'true');
  const icon = link.querySelector('i');
  if (icon) {
    icon.dataset.originalClass = icon.className;
    icon.className = 'fa-solid fa-circle-notch fa-spin';
  }
});
window.addEventListener('pageshow', () => {
  document.querySelectorAll('a[data-loading-link].is-loading').forEach(link => {
    link.classList.remove('is-loading');
    link.removeAttribute('aria-busy');
    link.style.width = '';
    const icon = link.querySelector('i');
    if (icon && icon.dataset.originalClass) icon.className = icon.dataset.originalClass;
  });
});

// Mapa ilustrado da seção Local: arrasta só um pouco (até 10% para cada lado) e volta ao centro ao soltar;
// clique sem arrastar abre o Google Maps (link do <a>).
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.map-illustrated').forEach(map => {
    let start = null, moved = false;
    const limit = () => ({ x: map.clientWidth * 0.1, y: map.clientHeight * 0.1 });
    const set = (x, y) => { map.style.setProperty('--map-x', `${x}px`); map.style.setProperty('--map-y', `${y}px`); };
    map.addEventListener('pointerdown', e => {
      if (e.button !== 0) return;
      start = { x: e.clientX, y: e.clientY };
      moved = false;
      map.setPointerCapture(e.pointerId);
    });
    map.addEventListener('pointermove', e => {
      if (!start) return;
      const dx = e.clientX - start.x, dy = e.clientY - start.y;
      if (!moved && Math.hypot(dx, dy) < 5) return;
      moved = true;
      map.classList.add('is-dragging');
      const l = limit();
      // resistência: quanto mais longe, menos anda
      const ease = (d, max) => max * Math.tanh(d / (max * 1.5));
      set(ease(dx, l.x), ease(dy, l.y));
    });
    const end = () => {
      if (!start) return;
      start = null;
      map.classList.remove('is-dragging');
      set(0, 0);
    };
    map.addEventListener('pointerup', end);
    map.addEventListener('pointercancel', end);
    map.addEventListener('click', e => { if (moved) { e.preventDefault(); moved = false; } });
    map.addEventListener('dragstart', e => e.preventDefault());
  });
});

// Rolagem suave só após o "load" (ver html.smooth-scroll em base.css)
window.addEventListener('load', () => {
  requestAnimationFrame(() => document.documentElement.classList.add('smooth-scroll'));
});

// Vídeos só começam a baixar depois que a página inteira terminou de carregar (evento "load").
// Até lá aparece só o poster. Marcação: <video preload="none" data-lazy-video> + <source data-src="...">.
function loadLazyVideos() {
  document.querySelectorAll('video[data-lazy-video]').forEach(video => {
    video.querySelectorAll('source[data-src]').forEach(source => {
      source.src = source.dataset.src;
      source.removeAttribute('data-src');
    });
    video.removeAttribute('data-lazy-video');
    video.preload = 'auto';
    video.load();
    const play = video.play();
    if (play && play.catch) play.catch(() => {});
  });
}
if (document.readyState === 'complete') setTimeout(loadLazyVideos, 0);
else window.addEventListener('load', () => setTimeout(loadLazyVideos, 0));

// Desempenho: seções fora da tela recebem .is-offscreen (pausa animações via CSS) e vídeos fora da tela
// ficam pausados. Começa depois do "load", junto com os vídeos.
function watchOffscreen() {
  if (!('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver(entries => {
    entries.forEach(({ target, isIntersecting }) => {
      if (target.tagName === 'VIDEO') {
        if (isIntersecting) { const p = target.play(); if (p && p.catch) p.catch(() => {}); }
        else target.pause();
      } else {
        target.classList.toggle('is-offscreen', !isIntersecting);
      }
    });
  }, { rootMargin: '100px 0px' });
  document.querySelectorAll('section, footer, video').forEach(el => io.observe(el));
}
if (document.readyState === 'complete') setTimeout(watchOffscreen, 0);
else window.addEventListener('load', () => setTimeout(watchOffscreen, 0));

// Transição entre páginas — elementos "gêmeos" ([data-morph="nome"] nas duas páginas) se transformam um
// no outro. Só entram no efeito se estiverem visíveis na tela, nas duas pontas; senão a página apenas
// faz a transição padrão (névoa). Os nomes valem só durante a transição.
(function () {
  const KEY = 'brumas-morph';
  const visible = el => {
    const r = el.getBoundingClientRect();
    return r.bottom > 0 && r.top < window.innerHeight && r.width > 0;
  };
  const clear = () => document.querySelectorAll('[data-morph]').forEach(el => { el.style.viewTransitionName = ''; });

  window.addEventListener('pageswap', e => {
    if (!e.viewTransition) return;
    const names = [];
    document.querySelectorAll('[data-morph]').forEach(el => {
      if (!visible(el)) return;
      el.style.viewTransitionName = el.dataset.morph;
      names.push(el.dataset.morph);
    });
    try { sessionStorage.setItem(KEY, names.join(',')); } catch (err) {}
  });

  window.addEventListener('pagereveal', e => {
    clear();
    let names = [];
    try { names = (sessionStorage.getItem(KEY) || '').split(',').filter(Boolean); sessionStorage.removeItem(KEY); } catch (err) {}
    if (!e.viewTransition || !names.length) return;
    names.forEach(name => {
      const el = document.querySelector(`[data-morph="${name}"]`);
      if (el && visible(el)) el.style.viewTransitionName = name;
    });
    e.viewTransition.finished.finally(clear);
  });
})();

const PRICES = {
  ticket: {
    regular: 120,
    camping: 187,
    lodging: 230,
  },
  mug: 40
};

const TICKET_SALES_URL = 'https://brumas-front-end.vercel.app/ingressos.html';

const TICKETS = [
  {
    id: 1,
    name: 'Ingresso Antecipado',
    price: PRICES.ticket.regular,
    description: [
      'Ingresso para entrada do dia 25.07.26',
    ],
  },
  {
    id: 2,
    name: 'Ingresso + Camping',
    price: PRICES.ticket.camping,
    description: [
      'Ingresso ao evento, com direito a um espaço no camping do local e um café da manhã no dia de domingo!',
    ],
  },
  {
    id: 3,
    name: 'Ingresso + Alojamento',
    price: PRICES.ticket.lodging,
    description: [
      'Acesso ao evento, com direito a hospedagem em quarto coletivo e um café da manhã no dia de domingo!',
    ],
  }
];

const NAV_LINKS = ['Início', 'Sobre', 'Galeria', 'Expositores', /* 'Programação', 'Atrações', 'Ingressos', 'Contato', */ 'Local', 'Organizadores'];

// Fotos da galeria. `album` é a edição; ids são únicos e estáveis (usados nos links de compartilhamento
// galeria/foto-N.html), então novas fotos ganham ids novos no fim, nunca renumerar.
const GALLERY_ALBUMS = [
  { year: 2026, label: '2ª edição · 2026', caption: 'Momentos da 2ª edição · 19 de setembro de 2026' },
  { year: 2025, label: '1ª edição · 2025', caption: 'Momentos da 1ª edição · Brumas Festival 2025' }
];

const PHOTOS = [
  {
    id: 1,
    src: 'assets/pictues/brumas_elmo_do_guerreiro.webp',
    alt: 'Itens históricos',
    title: 'Itens históricos',
    album: 2025
  },
  {
    id: 2,
    src: 'assets/pictues/brumas_contacao_de_historias.webp',
    alt: 'Contação de Histórias',
    title: 'Contação de Histórias',
    album: 2025
  },
  {
    id: 3,
    src: 'assets/pictues/brumas_artesaos_medievais.webp',
    alt: 'Expositores',
    title: 'Expositores',
    album: 2025
  },
  {
    id: 4,
    src: 'assets/pictues/brumas_jogo_medieval.webp',
    alt: 'Jogos',
    title: 'Jogos',
    album: 2025
  },
  {
    id: 5,
    src: 'assets/pictues/brumas_musico_do_pandeiro.webp',
    alt: 'Música',
    title: 'Música',
    album: 2025
  },
  {
    id: 6,
    src: 'assets/pictues/brumas_caneca_brumas.webp',
    alt: 'Souvenires',
    title: 'Souvenires',
    album: 2025
  },
  {
    id: 7,
    src: 'assets/pictues/brumas_caldeiron_na_fogueira.webp',
    alt: 'Acampamento histórico',
    title: 'Acampamento histórico',
    album: 2025
  },
  {
    id: 8,
    src: 'assets/pictues/brumas_alda_medieval.webp',
    alt: 'Recriação Histórica',
    title: 'Recriação Histórica',
    album: 2025
  },
  {
    id: 9,
    src: 'assets/pictues/brumas_portal_brumas.webp',
    alt: 'Imersão',
    title: 'Imersão',
    album: 2025
  },
  {
    id: 10,
    src: 'assets/pictues/brumas_hidromel_no_corno.webp',
    alt: 'Bebidas',
    title: 'Bebidas',
    album: 2025
  },
  {
    id: 11,
    src: 'assets/pictues/brumas_festival_ao_luar.webp',
    alt: 'Vivências',
    title: 'Vivências',
    album: 2025
  },
  {
    id: 12,
    src: 'assets/pictues/brumas_guerreiro_de_couro.webp',
    alt: 'Encontros ...',
    title: 'Encontros ...',
    album: 2025
  },
  {
    id: 13,
    src: 'assets/pictues/brumas_encontro_de_guerreiros.webp',
    alt: 'Reencontros',
    title: '... e reencontros',
    album: 2025
  },
  {
    id: 14,
    src: 'assets/pictues/brumas_guardia_da_fogueira.webp',
    alt: 'Fogueiras',
    title: 'Fogueiras',
    album: 2025
  },
  {
    id: 15,
    src: 'assets/pictues/brumas_danca_dos_veus.webp',
    alt: 'Danças',
    title: 'Danças',
    album: 2025
  },
  {
    id: 16,
    src: 'assets/pictues/brumas_conversa_ao_entardecer.webp',
    alt: 'Trocas',
    title: 'Trocas',
    album: 2025
  },
  {
    id: 17,
    src: 'assets/pictues/brumas_combate_com_escudos.webp',
    alt: 'Combates',
    title: 'Combates',
    album: 2025
  },
  {
    id: 18,
    src: 'assets/pictues/brumas_guerreira_medieval.webp',
    alt: 'Apresentações',
    title: 'Apresentações',
    album: 2025
  },
  {
    id: 21,
    src: 'assets/pictues/2026/brumas26_combates.webp',
    alt: 'Combate medieval com escudos e espadas',
    title: 'Combates',
    album: 2026
  },
  {
    id: 22,
    src: 'assets/pictues/2026/brumas26_a-dama-e-a-coruja.webp',
    alt: 'Dama em traje medieval olhando para a coruja pousada em sua luva',
    title: 'A Dama e a Coruja',
    album: 2026
  },
  {
    id: 24,
    src: 'assets/pictues/2026/brumas26_dancarinas.webp',
    alt: 'Trio de dançarinas tribais com saias e flores no cabelo',
    title: 'Dançarinas',
    album: 2026
  },
  {
    id: 26,
    src: 'assets/pictues/2026/brumas26_guerreiros.webp',
    alt: 'Dois guerreiros em túnicas medievais',
    title: 'Guerreiros',
    album: 2026
  },
  {
    id: 29,
    src: 'assets/pictues/2026/brumas26_trupe-tribal.webp',
    alt: 'Grupo de dança Zaman Tribal reunido para foto',
    title: 'Zaman Tribal',
    album: 2026
  },
  {
    id: 38,
    src: 'assets/pictues/2026/brumas26_chamado-da-trompa.webp',
    alt: 'Guerreiro de barba longa soprando uma trompa de chifre ao lado do estandarte do Brumas',
    title: 'O Chamado da Trompa',
    album: 2026
  },
  {
    id: 39,
    src: 'assets/pictues/2026/brumas26_pequena-falcoeira.webp',
    alt: 'Menina de capa azul segurando uma coruja suindara na luva',
    title: 'Pequena Falcoeira',
    album: 2026
  },
  {
    id: 40,
    src: 'assets/pictues/2026/brumas26_guardia-da-coruja.webp',
    alt: 'Mulher em traje medieval com uma coruja suindara pousada na luva de couro',
    title: 'Guardiã da Coruja',
    album: 2026
  },
  {
    id: 27,
    src: 'assets/pictues/2026/brumas26_musica-ao-luar.webp',
    alt: 'Músicos tocando à noite com alaúde e violão',
    title: 'Música ao Luar',
    album: 2026
  },
  {
    id: 28,
    src: 'assets/pictues/2026/brumas26_roda-da-fogueira.webp',
    alt: 'Público reunido em roda ao redor da fogueira',
    title: 'Roda da Fogueira',
    album: 2026
  },
  {
    id: 30,
    src: 'assets/pictues/2026/brumas26_viajantes.webp',
    alt: 'Casal de viajantes em trajes medievais à noite',
    title: 'Viajantes',
    album: 2026
  },
  {
    id: 31,
    src: 'assets/pictues/2026/brumas26_dancas-noturnas.webp',
    alt: 'Apresentação de dança à noite sob as luzes',
    title: 'Danças Noturnas',
    album: 2026
  },
  {
    id: 32,
    src: 'assets/pictues/2026/brumas26_oficios.webp',
    alt: 'Machado artesanal sobre pele, peça de um expositor',
    title: 'Ofícios',
    album: 2026
  },
  {
    id: 33,
    src: 'assets/pictues/2026/brumas26_magia-nas-brumas.webp',
    alt: 'Mago com cajado iluminado no escuro',
    title: 'Magia nas Brumas',
    album: 2026
  },
  {
    id: 34,
    src: 'assets/pictues/2026/brumas26_caminho-das-luzes.webp',
    alt: 'Trilha entre bambus levando às luzes do festival à noite',
    title: 'Caminho das Luzes',
    album: 2026
  },
  {
    id: 35,
    src: 'assets/pictues/2026/brumas26_faiscas-na-fogueira.webp',
    alt: 'Roda de pessoas em trajes medievais ao redor da fogueira com faíscas subindo',
    title: 'Faíscas na Fogueira',
    album: 2026
  },
  {
    id: 36,
    src: 'assets/pictues/2026/brumas26_mercado-ao-anoitecer.webp',
    alt: 'Mercado medieval iluminado visto da trilha de bambus',
    title: 'Mercado ao Anoitecer',
    album: 2026
  },
  {
    id: 37,
    src: 'assets/pictues/2026/brumas26_saberes-medievais.webp',
    alt: 'Palestrante em cota de malha apresentando sobre ofícios medievais',
    title: 'Saberes Medievais',
    album: 2026
  }
];



const CONTACT = {
  email: 'brumasfestival@gmail.com',
  phone: '+55(21) 98333-6417',
  address: 'Rua Francisco Portela, nº 115, Cantagalo, Guapimirim - RJ - CEP 25945-328',
  address_link: 'https://maps.app.goo.gl/pCQhvAfJ3on3fJhS7'
};

const SOCIAL_LINKS = [
  {
    name: 'Instagram',
    url: 'https://www.instagram.com/brumasfestivalmedieval/',
  },
  {
    name: 'Facebook',
    url: 'https://www.facebook.com/people/Brumas-Festival-Medieval/61574571856569/',
  }
];

const ATTRACTIONS = [
  {
    id: 1,
    name: 'Lui na Greine',
    description: 'Uma jornada mágica através da natureza e dos elementos da terra.',
    picture: 'lui_na_greine.jpg',
    picture_webp: 'lui_na_greine.webp',
    icon: 'leaf',
    tags: ['Natureza', 'Elementos']
  },
  {
    id: 2,
    name: 'Myrrox',
    description: 'Uma experiência épica de fantasia e aventura medieval.',
    picture: 'myrrox.jpg',
    picture_webp: 'myrrox.webp',
    icon: 'dragon',
    tags: ['Fantasia', 'Aventura']
  },
  {
    id: 3,
    name: 'Ordem das Flores',
    description: 'A sagrada ordem que preserva a beleza e harmonia da natureza.',
    picture: 'ordem_das_flores.jpg',
    picture_webp: 'ordem_das_flores.webp',
    icon: 'seedling',
    tags: ['Sagrado', 'Harmonia']
  },
  {
    id: 4,
    name: 'Ulf Viking Combat',
    description: 'Combates épicos e demonstrações de força dos guerreiros nórdicos.',
    picture: 'ulf_viking_combat.jpg',
    picture_webp: 'ulf_viking_combat.webp',
    icon: 'shield-halved',
    tags: ['Combate', 'Nórdico']
  },
  {
    id: 5,
    name: 'Zaman Tribal',
    description: 'Ritmos ancestrais e danças tribais que conectam com os espíritos da terra.',
    picture: 'zaman_tribal.jpg',
    picture_webp: 'zaman_tribal.webp',
    icon: 'drum',
    tags: ['Tribal', 'Ritual']
  }
];
