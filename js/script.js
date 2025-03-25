const PRICES = {
  ticket: {
    regular: 120,
    premium: 290,
  },
  mug: 40
};

const TICKETS = [
  {
    name: 'Festival',
    price: PRICES.ticket.regular,
    description: [
      'Acesso às festividades do reino',
      'Apresentações de menestréis e trovadores',
      'Torneios de cavaleiros e jogos medievais',
      'Mercado medieval com artesanato e comidas típicas',
    ],
  },
  {
    name: 'Festival + Hospedagem',
    price: PRICES.ticket.premium,
    description: [
      'Todas as benesses do ingresso Festival',
      'Pernoite em aposentos na vila medieval',
      'Desjejum tradicional servido no salão comunal',
      'Acesso à cerimônia de encerramento ao luar',
      'Participação na caçada ao tesouro noturna',
    ],
  }
];

const NAV_LINKS = ['Início', 'Sobre', 'Atrações', 'Programação', 'Local', 'Ingressos', 'Organizadores', 'Contato'];


// Atualiza a contagem regressiva quando a página carrega
document.addEventListener('DOMContentLoaded', function () {

});