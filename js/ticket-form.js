document.addEventListener('DOMContentLoaded', function() {
  const mugCheckbox = document.getElementById('mug');
  const priceSummary = document.getElementById('price-summary');
  const mugPrice = document.getElementById('mug-price');
  const participantDialog = document.getElementById('participant-dialog');
  const participantList = document.querySelector('#participant-list ul');
  const totalParticipants = document.getElementById('total-participants');
  const participants = [];

  mugPrice.textContent = PRICES.mug.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  mugCheckbox.dataset.price = btoa(PRICES.mug);
  mugCheckbox.dataset.name = btoa('Caneca Oficial');

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

    priceSummary.innerHTML = `
      <div class="top"></div>
      <table>
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
        </tr>
      </table>
      <div class="bottom"></div>`;
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
        <span id="name">${participant.name} - ${participant.age} anos</span>
        <button type="button" class="remove-participant">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </li>
    `).join('');
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
});