document.addEventListener('DOMContentLoaded', function () {
  const form = document.querySelector('form');
  if (!form) return;

  const submitButton = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    submitButton.innerHTML = 'Enviando';
    submitButton.classList.add('disabled');
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
          return fetch(response.url, { mode: 'no-cors' });

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


  // Initialize IMask for Whatsapp input
  const whatsappMask = IMask(document.getElementById('whatsapp'), {
    mask: '(00) 00000-0000',
    translation: {
      '0': { pattern: /[0-9]/ }
    }
  });
});
