document.addEventListener('DOMContentLoaded', function() {
    // Elementos do formulário
    const form = document.getElementById('merchant-form');
    const experienceYes = document.getElementById('experience-yes');
    const experienceNo = document.getElementById('experience-no');
    const eventsGroup = document.getElementById('events-group');

    // Mostrar/esconder o campo de eventos anteriores
    function togglePreviousEvents() {
        if (experienceYes.checked) {
            eventsGroup.style.display = 'block';
            document.getElementById('previous-events').setAttribute('required', 'required');
        } else {
            eventsGroup.style.display = 'none';
            document.getElementById('previous-events').removeAttribute('required');
        }
    }

    // Adicionar listeners
    experienceYes.addEventListener('change', togglePreviousEvents);
    experienceNo.addEventListener('change', togglePreviousEvents);

    // Formatar o campo de WhatsApp enquanto o usuário digita
    const whatsappInput = document.getElementById('merchant-whatsapp');
    whatsappInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 11) value = value.substring(0, 11);

        if (value.length > 7) {
            value = `(${value.substring(0, 2)}) ${value.substring(2, 7)}-${value.substring(7)}`;
        } else if (value.length > 2) {
            value = `(${value.substring(0, 2)}) ${value.substring(2)}`;
        } else if (value.length > 0) {
            value = `(${value}`;
        }

        e.target.value = value;
    });

    // Tratamento do envio do formulário
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        // Aqui você pode adicionar o código para enviar os dados do formulário
        // por exemplo, via fetch para uma API

        // Por agora, vamos apenas exibir uma mensagem de confirmação
        alert('Solicitação enviada com sucesso! Nossa equipe analisará sua proposta e entrará em contato em breve.');

        // Opcional: redefinir o formulário após envio
        form.reset();
        togglePreviousEvents(); // Garantir que o campo de eventos seja escondido

        // Opcionalmente, redirecionar para a página inicial ou de confirmação
        // window.location.href = 'confirmacao.html';
    });

    // Inicializar o estado do formulário
    togglePreviousEvents();

    // Link para os termos
    const termsLink = document.querySelector('.terms-link');
    if (termsLink) {
        termsLink.addEventListener('click', function(e) {
            e.preventDefault();
            window.open(this.href, 'termsWindow', 'width=900,height=700,scrollbars=yes');
        });
    }
});