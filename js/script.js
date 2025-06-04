const PRICES = {
  ticket: {
    regular: 120,
    premium: 200,
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

const NAV_LINKS = ['Início', 'Sobre', 'Galeria', 'Programação', 'Atrações', 'Local', 'Ingressos', 'Contato', 'Organizadores'];

const PHOTOS = [
  {
    id: 1,
    src: 'assets/pictues/brumas_1.webp',
    alt: 'A Fauno',
    title: 'A Fauno'
  },
  {
    id: 2,
    src: 'assets/pictues/brumas_2.webp',
    alt: 'Dança Circular Celta',
    title: 'Dança Circular Celta'
  },
  {
    id: 3,
    src: 'assets/pictues/brumas_3.webp',
    alt: 'Swordplay',
    title: 'Swordplay'
  },
  {
    id: 4,
    src: 'assets/pictues/brumas_4.webp',
    alt: 'Taverna Medieval',
    title: 'Taverna Medieval'
  },
  {
    id: 5,
    src: 'assets/pictues/brumas_5.webp',
    alt: 'Oaklore',
    title: 'Oaklore'
  },
  {
    id: 6,
    src: 'assets/pictues/brumas_6.webp',
    alt: 'Fogueira Mística',
    title: 'Fogueira Mística'
  },
  {
    id: 7,
    src: 'assets/pictues/brumas_7.webp',
    alt: 'Arquearia',
    title: 'Arquearia'
  },
  {
    id: 8,
    src: 'assets/pictues/brumas_8.webp',
    alt: 'Encerramento da Dança Circular',
    title: 'Encerramento da Dança Circular'
  },
  {
    id: 9,
    src: 'assets/pictues/brumas_9.webp',
    alt: 'Montagem do Acampamento Recreacionista',
    title: 'Montagem do Acampamento Recreacionista'
  },
  {
    id: 10,
    src: 'assets/pictues/brumas_10.webp',
    alt: 'Acampamento Recreacionista',
    title: 'Acampamento Recreacionista'
  },
  {
    id: 11,
    src: 'assets/pictues/brumas_11.webp',
    alt: 'Parede de Escudos',
    title: 'Parede de Escudos'
  },
  {
    id: 12,
    src: 'assets/pictues/brumas_12.webp',
    alt: 'Oraculistas',
    title: 'Oraculistas'
  },
  {
    id: 13,
    src: 'assets/pictues/brumas_13.webp',
    alt: 'Expositores',
    title: 'Expositores'
  }
];

const SOCIAL_LINKS_ = ['ROL4666', 'GUI001', 'IRONERDS10', 'JUS001'];


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



// Atualiza a contagem regressiva quando a página carrega
document.addEventListener('DOMContentLoaded', function () {
  const eventDateElement = document.querySelector('.event-date');

  if (!eventDateElement) return;

  eventDateElement.addEventListener('click', () => {
    eventDateElement.removeEventListener('click', arguments.callee);

    const eventDate = new Date('2025-07-19T00:00:00');
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
