document.addEventListener('DOMContentLoaded', function () {
  const form = document.querySelector('form');
  if (!form) return;

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    const confirmationModal = document.getElementById('confirmation-modal');
    confirmationModal.showModal();

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
        const submissionSummary = document.getElementById('submission-summary');
        submissionSummary.innerHTML = createMerchantSummary(data);
      })
      .catch(error => {
        console.error('Erro ao enviar os dados:', error);
      });
  });
});

function createMerchantSummary(formData) {
  const name = formData.name;
  const email = formData.email;
  const whatsapp = formData.whatsapp;
  const business = formData.business;
  const productType = formData.productType;
  const spaceSize = formData.spaceSize;

  return `
    <p>Vossa solicitação como mercador do reino foi recebida com selo real!</p>

    <h3>Dados do Mercador</h3>
    <p><span class="highlight">Nome:</span> ${name}</p>
    <p><span class="highlight">Mensageiro Eletrônico:</span> ${email}</p>
    <p><span class="highlight">WhatsApp:</span> ${whatsapp}</p>
    <p><span class="highlight">Estabelecimento:</span> ${business}</p>

    <h3>Mercadorias & Artesanato</h3>
    <p><span class="highlight">Categoria:</span> ${getProductTypeName(productType)}</p>
    <p><span class="highlight">Dimensão do Estabelecimento:</span> ${getSpaceSizeName(spaceSize)}</p>

    <h3>Decretos Reais</h3>
    <p>Os arautos examinarão vossa solicitação e enviarão um pergaminho ao vosso mensageiro eletrônico com a decisão real. Ficai atento às mensagens do reino!</p>
  `;
}

function createTicketSummary(formData) {
  const name = formData.name;
  const email = formData.email;
  const whatsapp = formData.whatsapp;
  const ticketType = formData.ticketType;
  const ticketPrice = formData.ticketPrice;
  const wantsMug = formData.mug;
  const mugPrice = formData.mugPrice;
  const totalPrice = formData.total;
  const needsParking = formData.parking;

  return `
    <p>Vossa passagem para o Festival Brumas foi selada com o timbre real!</p>

    <h3>Identificação do Viajante</h3>
    <p><span class="highlight">Nome:</span> ${name}</p>
    <p><span class="highlight">Mensageiro Eletrônico:</span> ${email}</p>
    <p><span class="highlight">WhatsApp:</span> ${whatsapp}</p>

    <h3>Detalhes da Passagem</h3>
    <p><span class="highlight">Tipo de Passagem:</span> ${ticketType}</p>
    <p><span class="highlight">Valor:</span> ${ticketPrice.toFixed(2)} Moedas de Ouro</p>
    ${wantsMug ? `<p><span class="highlight">Caneca do Festival:</span> ${mugPrice.toFixed(2)} Moedas de Ouro</p>` : ''}
    <p><span class="highlight">Estadia para Montaria:</span> ${needsParking ? 'Sim' : 'Não'}</p>
    <p><span class="highlight">Tributo Total:</span> ${totalPrice.toFixed(2)} Moedas de Ouro</p>

    <h3>Instruções do Arauto</h3>
    <p>Um pergaminho com instruções para pagamento será enviado ao vosso mensageiro eletrônico. Após confirmação do tributo, recebereis vossa carta de passagem para adentrar o festival.</p>
  `;
}