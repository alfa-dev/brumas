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
              <img src="assets/images/logo.png" alt="Brumas Logo">
            </a>
          </div>
          <div class="nav-links">
            ${navLinks()}
          </div>
          <div class="hamburger">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </nav>
      </header>
    `;
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
                <img src="assets/images/logo.png" alt="Brumas Logo">
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

// Registrar o componente
customElements.define('header-component', HeaderComponent);
customElements.define('footer-component', FooterComponent);
customElements.define('tickets-component', TicketsComponent);