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
              <img src="assets/b_fundo_escuro.svg?v=6c79c29" alt="Brumas Logo">
            </a>
          </div>
          <input type="checkbox" id="menu-toggle" class="menu-toggle">
          <div class="nav-links">
            ${navLinks()}
            <div class="nav-extra">
              <div class="nav-extra-social">
                ${SOCIAL_LINKS.map(link => `
                  <a href="${link.url}" target="_blank" aria-label="${link.name}">
                    <i class="fa-brands fa-${link.name.toLowerCase()}"></i>
                  </a>
                `).join('')}
              </div>
            </div>
          </div>
          <label for="menu-toggle" class="menu-icon" id="menu-toggle-label" aria-label="Abrir menu">
            <span></span><span></span><span></span>
          </label>
        </nav>
      </header>
    `;

    (function() {
      const menuToggle = document.getElementById('menu-toggle');
      const menuLinks = document.querySelectorAll('.nav-links a');

      // Fecha o menu ao escolher um destino
      menuLinks.forEach(link => {
        link.addEventListener('click', () => {
          menuToggle.checked = false;
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
        ${['left', 'right'].map(side => `
          <div class="footer-banner footer-banner--${side}" aria-hidden="true">
            <video muted loop playsinline preload="none" data-lazy-video poster="videos/estandarte-footer-poster.jpg?v=6c79c29">
              <source data-src="videos/estandarte-footer.mp4?v=6c79c29" type="video/mp4">
            </video>
          </div>
        `).join('')}
        <div class="footer-content">
            <div class="footer-logo">
                <img src="assets/b_fundo_escuro.svg?v=6c79c29" alt="Brumas Logo">
                <p>Brumas - Festival Medieval</p>
            </div>
            <div class="footer-links">
                ${navLinks()}
            </div>
            <div class="footer-contact">
                <a href="mailto:${CONTACT.email}" target="_blank" aria-label="Email">
                  <i class="fa-solid fa-envelope"></i> ${CONTACT.email}
                </a>
                <a href="https://wa.me/${CONTACT.phone.replace(/\D/g, '')}" target="_blank" aria-label="WhatsApp">
                  <i class="fa-brands fa-whatsapp"></i> ${CONTACT.phone}
                </a>
                <span class="footer-social">
                  ${SOCIAL_LINKS.map(link => `
                    <a href="${link.url}" target="_blank" aria-label="${link.name}">
                      <i class="fa-brands fa-${link.name.toLowerCase()}"></i>
                    </a>
                  `).join('')}
                </span>
            </div>
            <div class="footer-legal">
                <p>© ${currentYear()} Brumas Festival Medieval. Todos os direitos reservados.</p>
            </div>
        </div>
    </footer>
    `;

    // Estandartes fora de sincronia: o da direita começa na metade do loop e toca num ritmo um pouco
    // diferente, então os dois nunca balançam juntos
    const rightVideo = this.querySelector('.footer-banner--right video');
    if (rightVideo) {
      const desync = () => {
        rightVideo.currentTime = (rightVideo.duration || 5) / 2;
        rightVideo.playbackRate = 0.8;
      };
      if (rightVideo.readyState >= 1) desync();
      else rightVideo.addEventListener('loadedmetadata', desync, { once: true });
    }
  }
}

class TicketsComponent extends HTMLElement {
  constructor() {
    super();

    this.tickets = TICKETS;
  }

  connectedCallback() {
    this.innerHTML = `
      <div class="tickets-grid">
        ${this.tickets.map(ticket => `
          <article class="ticket-card">
            <header>
              <h3>${ticket.name} <span class="ticket-base-price">R$ ${ticket.price}</span></h3>
            </header>
            <ul>
              ${ticket.description.map(description => `<li>${description}</li>`).join('')}
            </ul>
            <!-- CTA por tipo desabilitada temporariamente: a página de ingressos ainda não
                 suporta pré-selecionar o tipo via parâmetro "tipo" na URL.
            <a href="${TICKET_SALES_URL}?tipo=${ticket.id}" class="ticket-button">Adquirir Passagem</a>
            -->
          </article>
        `).join('')}
      </div>
      <a href="${TICKET_SALES_URL}" class="ticket-button ticket-main-cta">Adquirir Ingresso</a>
    `;
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
        <input type="radio" id="ticket-${ticket.id}" name="ticket-type" data-price="${btoa(ticket.price)}" data-name="${btoa(ticket.name)}" value="${ticket.id}" required ${ticket.id === ticketType ? 'checked' : ''}>
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
          <figure class="gallery-item">
            <a href="photo-viewer.html?id=${photo.id}" class="gallery-link">
              <div class="gallery-frame">
                <img src="${photo.src.replace('.webp', '_sm.webp')}" alt="${photo.alt.replace(/\s*\.+$/, '')} no Brumas Festival Medieval 2025, em Guapimirim (RJ)" loading="lazy" width="373" height="249">
              </div>
              <figcaption>${photo.title}</figcaption>
            </a>
          </figure>
          `).join('')}
        </div>
      </div>
      <div class="gallery-nav">
        <button type="button" class="gallery-nav-button" data-dir="-1" aria-label="Fotos anteriores">
          <i class="fa-solid fa-chevron-left"></i>
        </button>
        <span class="gallery-nav-label">${PHOTOS.length} registros</span>
        <button type="button" class="gallery-nav-button" data-dir="1" aria-label="Próximas fotos">
          <i class="fa-solid fa-chevron-right"></i>
        </button>
      </div>
    `;

    const grid = this.querySelector('.gallery-grid');
    this.querySelectorAll('.gallery-nav-button').forEach(button => {
      button.addEventListener('click', () => {
        const item = grid.querySelector('.gallery-item');
        const step = item ? item.offsetWidth + 24 : grid.clientWidth;
        grid.scrollBy({ left: step * Number(button.dataset.dir), behavior: 'smooth' });
      });
    });
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