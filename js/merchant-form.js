document.addEventListener('DOMContentLoaded', function () {
  const form = document.querySelector('form');
  if (!form) return;

  const submitButton = form.querySelector('button[type="submit"]');

  // Estado de erro visível: ao tentar enviar com campos inválidos, cada campo inválido fica vermelho e
  // ganha uma mensagem logo abaixo; some assim que o campo é corrigido.
  const MESSAGES = {
    valueMissing: field => field.type === 'checkbox'
      ? 'É preciso aceitar os termos para continuar.'
      : field.tagName === 'SELECT' ? 'Escolha uma opção.' : 'Este campo é obrigatório.',
    typeMismatch: () => 'Informe um e-mail válido (ex.: nome@email.com).',
    patternMismatch: () => 'Informe o WhatsApp completo com DDD: (00) 00000-0000.'
  };
  function messageFor(field) {
    const v = field.validity;
    const key = Object.keys(MESSAGES).find(k => v[k]);
    return key ? MESSAGES[key](field) : field.validationMessage;
  }
  function container(field) {
    return field.closest('.exp-field, .exp-check') || field.parentElement;
  }
  function showError(field) {
    const box = container(field);
    box.classList.add('has-error');
    field.setAttribute('aria-invalid', 'true');
    let msg = box.querySelector('.exp-error');
    if (!msg) {
      msg = document.createElement('p');
      msg.className = 'exp-error';
      msg.id = `${field.id}-error`;
      msg.setAttribute('role', 'alert');
      box.appendChild(msg);
      field.setAttribute('aria-describedby', msg.id);
    }
    msg.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> ${messageFor(field)}`;
  }
  function clearError(field) {
    const box = container(field);
    box.classList.remove('has-error');
    field.removeAttribute('aria-invalid');
    const msg = box.querySelector('.exp-error');
    if (msg) msg.remove();
  }
  // Aceite dos termos: ao marcar, o selo "acende" e solta partículas mágicas (visual do Orbe Encantado,
  // classes .orb-particle de about.css, carregado via styles.css)
  const terms = document.getElementById('accept-terms');
  const COLORS = ['#e8c770', '#f6e3a6', '#c8a050', '#b98ae6', '#d9c2f5'];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (terms) terms.addEventListener('change', () => {
    const label = terms.closest('.exp-check');
    label.classList.toggle('is-sealed', terms.checked);
    if (!terms.checked || reduceMotion) return;
    const burst = document.createElement('span');
    burst.className = 'exp-check-burst';
    burst.style.left = `${terms.offsetLeft + terms.offsetWidth / 2}px`;
    burst.style.top = `${terms.offsetTop + terms.offsetHeight / 2}px`;
    for (let i = 0; i < 36; i++) {
      const p = document.createElement('span');
      const star = Math.random() < 0.45;
      p.className = 'orb-particle' + (star ? ' orb-particle--star' : '');
      const a = Math.random() * Math.PI * 2, d = 36 + Math.random() * 84;
      p.style.setProperty('--x0', '0px');
      p.style.setProperty('--y0', '0px');
      p.style.setProperty('--x1', `${Math.cos(a) * d}px`);
      p.style.setProperty('--y1', `${Math.sin(a) * d - 8}px`);
      p.style.setProperty('--size', `${(4 + Math.random() * (star ? 12 : 6)).toFixed(1)}px`);
      p.style.setProperty('--life', `${(0.9 + Math.random() * 1).toFixed(2)}s`);
      p.style.setProperty('--color', COLORS[Math.floor(Math.random() * COLORS.length)]);
      burst.appendChild(p);
    }
    label.appendChild(burst);
    setTimeout(() => burst.remove(), 2200);
  });

  form.addEventListener('invalid', e => showError(e.target), true);
  ['input', 'change'].forEach(type => form.addEventListener(type, e => {
    const field = e.target;
    if (!field.matches('input, select, textarea')) return;
    if (field.checkValidity()) clearError(field);
    else if (container(field).classList.contains('has-error')) showError(field);
  }));
  const createdAt = form.querySelector('input[name="created_at"]');

  createdAt.value = new Date().toISOString();

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    if (SpamProtection.isSpam(form)) {
      document.getElementById('confirmation-modal').showModal();
      return;
    }

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
        SpamProtection.recordSubmission();
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
