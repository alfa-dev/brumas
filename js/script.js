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
      'Apresentação de menestrei e trovadores',
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

const NAV_LINKS = ['Início', 'Sobre', 'Programação', 'Atrações', 'Local', 'Ingressos', 'Contato', 'Organizadores'];

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
});
