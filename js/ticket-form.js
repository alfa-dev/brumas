document.addEventListener('DOMContentLoaded', function() {
  const birthdate = document.getElementById('birthdate');
  const mugCheckbox = document.getElementById('mug');
  const priceSummaryTable = document.getElementById('price-summary-table');
  const mugPrice = document.getElementById('mug-price');
  const participantDialog = document.getElementById('participant-dialog');
  const participantList = document.querySelector('#participant-list ul');
  const totalParticipants = document.getElementById('total-participants');
  const additionalParticipant = document.getElementById('additional-participant');
  const participantBirthday = document.getElementById('participant-birthday');
  const priceSummarySignature = document.getElementById('price-summary-signature');
  const nameInput = document.getElementById('name');
  const termsLink = document.querySelector('.terms-link');
  const participants = [];

  mugPrice.textContent = PRICES.mug.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  mugCheckbox.dataset.price = btoa(PRICES.mug);
  mugCheckbox.dataset.name = btoa('Caneca Oficial');

  birthdate.max = new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0];

  participantBirthday.max = new Date().toISOString().split('T')[0];

  mugCheckbox.addEventListener('change', updatePriceSummary.bind(this));
  document.querySelectorAll('input[data-price]').forEach(ticket => {
    ticket.addEventListener('change', updatePriceSummary.bind(this));
  });

  function updatePriceSummary() {
    mugCheckbox.dataset.price = btoa(PRICES.mug);

    const priceSummaryData = [];

    document.querySelectorAll('input[data-price]:checked').forEach(input => {
      const price = atob(input.dataset.price);
      const priceFormatted = parseFloat(price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

      priceSummaryData.push({
        price: price,
        priceFormatted: priceFormatted,
        name: atob(input.dataset.name),
      });
    });

    checkMinorParticipants();

    participants.map(participant => {
      const ticketPrice = atob(getSelectedTickets().dataset.price);
      const ticketPriceFormatted = parseFloat(ticketPrice).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      const halfTicketPrice = ticketPrice / 2;
      const halfTicketPriceFormatted = halfTicketPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

      if (participant.age >= 18) {
        priceSummaryData.push({
          price: ticketPrice,
          priceFormatted: ticketPriceFormatted,
          name: participant.name
        });
      } else if (participant.age < 6) {
        priceSummaryData.push({
          price: 0,
          priceFormatted: 'Grátis - Menor de 6 anos',
          name: participant.name
        });
      } else {
        priceSummaryData.push({
          price: halfTicketPrice,
          priceFormatted: `Meia: ${halfTicketPriceFormatted}`,
          name: participant.name
        });
      }
    });

    priceSummaryTable.innerHTML = `
        ${priceSummaryData.map(item => `
          <tr>
            <td>${item.name}</td>
            <td>${item.priceFormatted}</td>
          </tr>
        `).join('')}
        <tr>
          <td><strong>Total:</strong></td>
          <td><strong>${priceSummaryData
            .reduce((acc, item) => acc + parseFloat(item.price), 0)
            .toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong></td>
        </tr>`;

    priceSummarySignature.textContent = nameInput.value;
  };

  // Add participant dialog
  const addParticipantButton = document.getElementById('add-participant');
  addParticipantButton.addEventListener('click', function() {
    participantDialog.showModal();
  });

  // Close participant dialog
  const closeParticipantDialogButton = document.querySelector('.close-dialog');
  closeParticipantDialogButton.addEventListener('click', function() {
    participantDialog.close();
  });

  // Add participant
  const addParticipantForm = document.querySelector('#additional-participant-form');
  addParticipantForm.addEventListener('submit', function(event) {
    event.preventDefault();

    participants.push({
      id: participants.length,
      name: document.getElementById('participant-name').value,
      document: document.getElementById('participant-document').value,
      age: calculateAge(document.getElementById('participant-birthday').value),
      birthday: document.getElementById('participant-birthday').value,
    });

    updateParticipantList();
    addParticipantForm.reset();
    participantDialog.close();

    const removeParticipantButtons = document.querySelectorAll('.remove-participant');
    removeParticipantButtons.forEach(button => {
      button.addEventListener('click', function() {
        const participantId = button.closest('li').dataset.id;
        participants.splice(participants.findIndex(participant => participant.id === parseInt(participantId)), 1);
        updateParticipantList();
      });
    });
  });

  function updateParticipantList() {
    totalParticipants.textContent = "+" + participants.length;

    participantList.innerHTML = participants.map(participant => `
      <li data-id="${participant.id}">
        ${participant.name} - ${participant.age} anos
        <button type="button" class="remove-participant">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </li>
    `).join('');

    additionalParticipant.value = participants.map(participant => `${participant.name}, ${participant.birthday}`).join('; ');
    updatePriceSummary();
  }

  function getSelectedTickets() {
    return document.querySelector('ticket-types input:checked');
  }

  function calculateAge(birthday) {
    const today = new Date();
    const birthDate = new Date(birthday);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }

  function checkMinorParticipants() {
    const minorParticipants = participants.some(participant => participant.age < 18);

    if (minorParticipants) {
      document.getElementById('ticket-1').click();
      document.getElementById('ticket-2').setAttribute('disabled', true);
    } else {
      document.getElementById('ticket-2').removeAttribute('disabled');
    }
  }

  // Initialize IMask for CPF input
  const cpfMask = IMask(document.getElementById('cpf'), {
    mask: '000.000.000-00',
    translation: {
      '0': { pattern: /[0-9]/ }
    }
  });

  // Initialize IMask for Whatsapp input
  const whatsappMask = IMask(document.getElementById('whatsapp'), {
    mask: '(00) 00000-0000',
    translation: {
      '0': { pattern: /[0-9]/ }
    }
  });

  termsLink.addEventListener('click', function () {
    event.preventDefault();
    const link = this.href;
    window.open(link, '_blank', 'width=900,height=700');
  });
});


document.addEventListener('DOMContentLoaded', function () {
  const form = document.querySelector('form');
  if (!form) return;

  const submitButton = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    submitButton.innerHTML = 'Enviando';
    submitButton.classList.add('loading');
    submitButton.setAttribute('disabled', true);

    const formData = new FormData(form);
    // const data = Object.fromEntries(formData);

    fetch(form.action, {
      method: form.method,
      body: formData,
      mode: 'no-cors'
    })
      .then(response => {
        if (response.type === 'opaqueredirect')
          return fetch(response.url, {mode: 'no-cors'});

        return response;
      })
      .then(response => {
        console.log(response);
        document.getElementById('confirmation-modal').showModal();
      })
      .catch(error => {
        alert('Erro ao enviar os dados: ' + error);
        console.error('Erro ao enviar os dados:', error);
        submitButton.removeAttribute('disabled');
      });
  });

  document.getElementById('confirmation-modal').addEventListener('close', function () {
    submitButton.removeAttribute('disabled');
  });
});