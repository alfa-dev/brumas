function removeAccents(str) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(/Đ/g, "D").replace(/đ/g, "d");
}

const navLinks = () => {
  return NAV_LINKS.map(link => `
    <a href="index.html#${removeAccents(link).toLowerCase()}">${link}</a>
  `).join('');
}

const currentYear = () => {
  return new Date().getFullYear();
}

class HeaderComponent extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.innerHTML = `
      <header>
        <nav class="navbar">
          <div class="logo">
            <a href="index.html">
              <img src="assets/b_fundo_escuro.svg" alt="Brumas Logo">
            </a>
          </div>
          <input type="checkbox" id="menu-toggle" class="menu-toggle">
          <div class="nav-links">
            ${navLinks()}
          </div>
          <label for="menu-toggle" class="menu-icon" id="menu-toggle-label">
            <img src="assets/burger_menu.svg" alt="Menu">
          </label>
        </nav>
      </header>
    `;

    (function() {
      const menuToggle = document.getElementById('menu-toggle');
      const menuLinks = document.querySelectorAll('.nav-links a');

      menuLinks.forEach(link => {
        link.addEventListener('click', () => {
          console.log(link);
          menuToggle.click();
        });
      });
    })();
  }
}

class FooterComponent extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.innerHTML = `
      <footer>
        <div class="footer-content">
            <div class="footer-logo">
                <img src="assets/b_fundo_escuro.svg" alt="Brumas Logo">
                <p>Brumas - Festival Medieval</p>
            </div>
            <div class="footer-links">
                ${navLinks()}
            </div>
            <div class="footer-legal">
                <p>© ${currentYear()} Brumas Festival Medieval. Todos os direitos reservados.</p>
            </div>
        </div>
    </footer>
    `;
  }
}

class TicketsComponent extends HTMLElement {
  constructor() {
    super();

    this.tickets = TICKETS;
  }

  connectedCallback() {
    this.innerHTML = this.tickets.map(ticket => `
      <article class="ticket-card">
        <header>
          <h3>${ticket.name} <span class="ticket-base-price">R$ ${ticket.price}</span></h3>
        </header>
        <ul>
          ${ticket.description.map(description => `<li>${description}</li>`).join('')}
        </ul>
        <a href="ingressos.html?tipo=${ticket.id}" class="ticket-button">Adquirir Passagem</a>
      </article>
    `).join('');
  }
}
class TicketTypes extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    // Get ticket type from url
    const ticketType = parseInt(new URLSearchParams(window.location.search).get('tipo'));

    TICKETS.forEach(ticket => {
      this.innerHTML += `
        <input type="radio" id="ticket-${ticket.id}" name="ticket-type" data-price="${btoa(ticket.price)}" data-name="${btoa(ticket.name)}" value="${ticket.id}" ${ticket.id === ticketType ? 'checked' : ''}>
        <label for="ticket-${ticket.id}">
          <span>${ticket.name}</span>
          <span class="ticket-price"><span class="currency">R$</span> ${ticket.price}</span>
        </label>
      `;
    });
  }
}

class ContactComponent extends HTMLElement {
  constructor() {
    super();

    const mensagens = [
      "As brumas estão densas, mas sei que você enxerga através delas. Podemos falar?",
      "Tenho perguntas que precisam de respostas. Você pode me ajudar a encontrar o que procuro?",
      "Sei que você sabe. Não vou perguntar como, só preciso das respostas certas.",
      "Nem tudo pode ser dito às claras. Mas nas brumas, podemos conversar?",
      "As peças não se encaixam. Falta algo. Você tem o que eu preciso?",
      "Os rumores são confusos, mas sei que você conhece a verdade. Podemos falar?",
      "Sinais, rastros, pistas... Já juntei algumas, mas preciso da peça final. Você pode me ajudar?",
      "A verdade está escondida, mas você sempre sabe onde procurar. Vamos conversar?",
      "Dizem que os que sabem demais somem nas brumas... mas você ainda está aqui. Podemos falar?"
    ];

    this.mensagem = mensagens[Math.floor(Math.random() * mensagens.length)];
  }

  connectedCallback() {
    this.innerHTML = `
      <a href="mailto:${CONTACT.email}" target="_blank">
        <i class="fa-solid fa-envelope gold-text"></i>
        ${CONTACT.email}
      </a>
      <a href="https://wa.me/${CONTACT.phone.replace(/\D/g, '')}/?text=${this.mensagem}" target="_blank">
        <i class="fa-brands fa-whatsapp gold-text"></i>
        ${CONTACT.phone}
      </a>
    `;
  }
}

class SocialComponent extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.innerHTML = `
      <div class="social-icons-container">
        <h4>Segui-nos nas Redes dos Reinos</h4>
        <div class="social-icons">
          ${SOCIAL_LINKS.map(link => `
            <a href="${link.url}" class="gold-hover" style="text-decoration: none;" target="_blank">
              <i class="fa-brands fa-${link.name.toLowerCase()}"></i>
            </a>
          `).join('')}
        </div>
      </div>
    `;
  }
}

class PhotoGallery extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.innerHTML = `
      <div class="photo-gallery">
        <div class="gallery-grid">
        ${PHOTOS.map(photo => `
          <div class="gallery-item">
            <a href="photo-viewer.html?src=${photo.src}&title=${photo.title}" class="gallery-link">
              <img src="${photo.src.replace('.webp', '_sm.webp')}" alt="${photo.alt}" loading="lazy">
              <div class="gallery-overlay">
                <p>${photo.title}</p>
              </div>
            </a>
          </div>
          `).join('')}
        </div>
      </div>
    `;
  }
}


// Registrar o componente
customElements.define('header-component', HeaderComponent);
customElements.define('footer-component', FooterComponent);
customElements.define('tickets-component', TicketsComponent);
customElements.define('contact-component', ContactComponent);
customElements.define('social-component', SocialComponent);
customElements.define('ticket-types', TicketTypes);
customElements.define('photo-gallery', PhotoGallery);