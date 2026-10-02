// Carimbo de build (atualizado pelo pre-commit). Não editar à mão.
const BUILD = 'c735a39';

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

const PHOTOS = [
  {
    id: 1,
    src: 'assets/pictues/brumas_elmo_do_guerreiro.webp',
    alt: 'Itens históricos',
    title: 'Itens históricos'
  },
  {
    id: 2,
    src: 'assets/pictues/brumas_contacao_de_historias.webp',
    alt: 'Contação de Histórias',
    title: 'Contação de Histórias'
  },
  {
    id: 3,
    src: 'assets/pictues/brumas_artesaos_medievais.webp',
    alt: 'Expositores',
    title: 'Expositores'
  },
  {
    id: 4,
    src: 'assets/pictues/brumas_jogo_medieval.webp',
    alt: 'Jogos',
    title: 'Jogos'
  },
  {
    id: 5,
    src: 'assets/pictues/brumas_musico_do_pandeiro.webp',
    alt: 'Música',
    title: 'Música'
  },
  {
    id: 6,
    src: 'assets/pictues/brumas_caneca_brumas.webp',
    alt: 'Souvenires',
    title: 'Souvenires'
  },
  {
    id: 7,
    src: 'assets/pictues/brumas_caldeiron_na_fogueira.webp',
    alt: 'Acampamento histórico',
    title: 'Acampamento histórico'
  },
  {
    id: 8,
    src: 'assets/pictues/brumas_alda_medieval.webp',
    alt: 'Recriação Histórica',
    title: 'Recriação Histórica'
  },
  {
    id: 9,
    src: 'assets/pictues/brumas_portal_brumas.webp',
    alt: 'Imersão',
    title: 'Imersão'
  },
  {
    id: 10,
    src: 'assets/pictues/brumas_hidromel_no_corno.webp',
    alt: 'Bebidas',
    title: 'Bebidas'
  },
  {
    id: 11,
    src: 'assets/pictues/brumas_festival_ao_luar.webp',
    alt: 'Vivências',
    title: 'Vivências'
  },
  {
    id: 12,
    src: 'assets/pictues/brumas_guerreiro_de_couro.webp',
    alt: 'Encontros ...',
    title: 'Encontros ...'
  },
  {
    id: 13,
    src: 'assets/pictues/brumas_encontro_de_guerreiros.webp',
    alt: 'Reencontros',
    title: '... e reencontros'
  },
  {
    id: 14,
    src: 'assets/pictues/brumas_guardia_da_fogueira.webp',
    alt: 'Fogueiras',
    title: 'Fogueiras'
  },
  {
    id: 15,
    src: 'assets/pictues/brumas_danca_dos_veus.webp',
    alt: 'Danças',
    title: 'Danças'
  },
  {
    id: 16,
    src: 'assets/pictues/brumas_conversa_ao_entardecer.webp',
    alt: 'Trocas',
    title: 'Trocas'
  },
  {
    id: 17,
    src: 'assets/pictues/brumas_combate_com_escudos.webp',
    alt: 'Combates',
    title: 'Combates'
  },
  {
    id: 18,
    src: 'assets/pictues/brumas_guerreira_medieval.webp',
    alt: 'Apresentações',
    title: 'Apresentações'
  }
];



const CONTACT = {
  email: 'brumasfestival@gmail.com',
  phone: '+55(21) 98333-6417',
  address: 'Rua Francisco Portela, nº 115, Cantagalo, Guapimirim - RJ - CEP 25945-328',
  address_link: 'https://www.google.com/maps/search/?api=1&query=Rua+Francisco+Portela%2C+115%2C+Cantagalo%2C+Guapimirim%2C+RJ%2C+25945-328'
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
