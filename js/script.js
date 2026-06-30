const PRICES = {
  ticket: {
    regular: 120,
    premium: 220,
  },
  mug: 40
};

const TICKETS = [
  {
    id: 1,
    name: 'Festival',
    price: PRICES.ticket.regular,
    description: [
      'Acesso a festividades do reino',
      'Apresentação de menestreis e trovadores',
      'Jogo medievais',
      'Mercado medieval',
    ],
  },
  {
    id: 2,
    name: 'Festival + Hospedagem',
    price: PRICES.ticket.premium,
    description: [
      'Todas as benesses do ingresso Festival',
      'Pernoite na Hospedaria',
      'Desjejum tradicional',
    ],
  }
];

const NAV_LINKS = ['Início', 'Sobre', 'Galeria', /* 'Programação', 'Atrações', 'Local', */ 'Ingressos', 'Contato', 'Organizadores'];

const PHOTOS = [
  {
    id: 1,
    src: 'assets/pictues/brumas_contacao_de_historias.webp',
    alt: 'Contação de Histórias',
    title: 'Contação de Histórias'
  },
  {
    id: 2,
    src: 'assets/pictues/brumas_jogo_medieval.webp',
    alt: 'Jogo Medieval',
    title: 'Jogo Medieval'
  },
  {
    id: 3,
    src: 'assets/pictues/brumas_guerreiro_de_couro.webp',
    alt: 'Guerreiro de Couro',
    title: 'Guerreiro de Couro'
  },
  {
    id: 4,
    src: 'assets/pictues/brumas_musico_do_pandeiro.webp',
    alt: 'Músico do Pandeiro',
    title: 'Músico do Pandeiro'
  },
  {
    id: 5,
    src: 'assets/pictues/brumas_caneca_brumas.webp',
    alt: 'Caneca Brumas',
    title: 'Caneca Brumas'
  },
  {
    id: 6,
    src: 'assets/pictues/brumas_caldeiron_na_fogueira.webp',
    alt: 'Caldeirão na Fogueira',
    title: 'Caldeirão na Fogueira'
  },
  {
    id: 7,
    src: 'assets/pictues/brumas_alda_medieval.webp',
    alt: 'Aldeã Medieval',
    title: 'Aldeã Medieval'
  },
  {
    id: 8,
    src: 'assets/pictues/brumas_hidromel_no_corno.webp',
    alt: 'Hidromel no Corno',
    title: 'Hidromel no Corno'
  },
  {
    id: 9,
    src: 'assets/pictues/brumas_elmo_do_guerreiro.webp',
    alt: 'Elmo do Guerreiro',
    title: 'Elmo do Guerreiro'
  },
  {
    id: 10,
    src: 'assets/pictues/brumas_portal_brumas.webp',
    alt: 'Portal Brumas',
    title: 'Portal Brumas'
  },
  {
    id: 11,
    src: 'assets/pictues/brumas_festival_ao_luar.webp',
    alt: 'Festival ao Luar',
    title: 'Festival ao Luar'
  },
  {
    id: 12,
    src: 'assets/pictues/brumas_guardia_da_fogueira.webp',
    alt: 'Guardiã da Fogueira',
    title: 'Guardiã da Fogueira'
  },
  {
    id: 13,
    src: 'assets/pictues/brumas_encontro_de_guerreiros.webp',
    alt: 'Encontro de Guerreiros',
    title: 'Encontro de Guerreiros'
  },
  {
    id: 14,
    src: 'assets/pictues/brumas_danca_dos_veus.webp',
    alt: 'Dança dos Véus',
    title: 'Dança dos Véus'
  },
  {
    id: 15,
    src: 'assets/pictues/brumas_conversa_ao_entardecer.webp',
    alt: 'Conversa ao Entardecer',
    title: 'Conversa ao Entardecer'
  },
  {
    id: 16,
    src: 'assets/pictues/brumas_combate_com_escudos.webp',
    alt: 'Combate com Escudos',
    title: 'Combate com Escudos'
  },
  {
    id: 17,
    src: 'assets/pictues/brumas_guerreira_medieval.webp',
    alt: 'Guerreira Medieval',
    title: 'Guerreira Medieval'
  },
  {
    id: 18,
    src: 'assets/pictues/brumas_artesaos_medievais.webp',
    alt: 'Artesãos Medievais',
    title: 'Artesãos Medievais'
  }
];



const CONTACT = {
  email: 'brumasfestival@gmail.com',
  phone: '+55(21) 98333-6417',
  address: 'Estr. Adam Blumer, 5580 - Jardim Esmeralda, Magé - RJ, 25908-683',
  address_link: 'https://maps.app.goo.gl/wXHUA32M3vWztiTS9'
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


// Atualiza a contagem regressiva quando a página carrega
document.addEventListener('DOMContentLoaded', function () {
  const eventDateElement = document.querySelector('.event-date');

  if (!eventDateElement) return;

  eventDateElement.addEventListener('click', () => {
    eventDateElement.removeEventListener('click', arguments.callee);

    const eventDate = new Date('2026-09-19T00:00:00');
    let timeDifference = eventDate - new Date();

    const medievalMusicUrls = [
      'https://audio-variant-previews.envatousercontent.com/M4A/26/bd/38/57/b3/v1_E11/E1129BZE.m4a',
      'https://audio-variant-previews.envatousercontent.com/M4A/bf/96/a7/4a/13/v1_E11/E115X1O3.m4a',
      'https://audio-variant-previews.envatousercontent.com/M4A/19/45/b2/90/0e/v1_E11/E111H801.m4a',
      'https://audio-variant-previews.envatousercontent.com/M4A/3b/d3/e4/02/82/v1_E11/E112T5JS.m4a'
    ];

    const medievalSong = new Audio();
    medievalSong.src = medievalMusicUrls[Math.floor(Math.random() * medievalMusicUrls.length)];
    medievalSong.volume = 0.3;
    medievalSong.play();

    if (timeDifference > 0) {

      setInterval(() => {
        timeDifference = eventDate - new Date();
        const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

        eventDateElement.innerHTML = `Faltam ${days}d ${hours}h ${minutes}m ${seconds}s`;
      }, 1000);
    } else {
      document.querySelector('.countdown').innerHTML = 'O evento já começou!';
    }
  });

  function handleClick(e) {
    // Fallback for browsers that don't support this API:
    if (!document.startViewTransition) {
      updateTheDOMSomehow();
      return;
    }

    // With a View Transition:
    document.startViewTransition(() => updateTheDOMSomehow());
  }
});
