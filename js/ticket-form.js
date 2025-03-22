document.addEventListener('DOMContentLoaded', function() {
    // Elementos do formulário
    const form = document.getElementById('ticket-form');
    const ticketTypeRegular = document.getElementById('ticket-regular');
    const ticketTypePremium = document.getElementById('ticket-premium');
    const mugCheckbox = document.getElementById('mug');
    const ticketBasePrice = document.getElementById('ticket-base-price');
    const mugPriceRow = document.getElementById('mug-price-row');
    const totalPrice = document.getElementById('total-price');

    // Preços
    const PRICE_REGULAR = 120;
    const PRICE_PREMIUM = 290;
    const PRICE_MUG = 40;

    // Verificar parâmetros da URL para pré-selecionar o ingresso
    function preSelectTicket() {
        const urlParams = new URLSearchParams(window.location.search);
        const ticketType = urlParams.get('tipo');

        if (ticketType === 'premium') {
            ticketTypePremium.checked = true;
            ticketTypeRegular.checked = false;

            // Rolar até o formulário com um breve atraso para garantir renderização
            setTimeout(() => {
                const formElement = document.querySelector('.form-intro');
                const headerOffset = 120; // Ajuste conforme necessário para compensar o header fixo
                const elementPosition = formElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }, 300);
        }

        // Atualizar preço e classes visuais
        updatePrice();
    }

    // Função para atualizar o preço total
    function updatePrice() {
        // Determinar o preço base
        let basePrice = ticketTypeRegular.checked ? PRICE_REGULAR : PRICE_PREMIUM;
        ticketBasePrice.textContent = `R$ ${basePrice.toFixed(2).replace('.', ',')}`;

        // Atualizar classes visuais
        document.querySelector('.radio-option:nth-child(1)').classList.toggle('selected', ticketTypeRegular.checked);
        document.querySelector('.radio-option:nth-child(2)').classList.toggle('selected', ticketTypePremium.checked);

        // Verificar se a caneca foi selecionada
        if (mugCheckbox.checked) {
            mugPriceRow.style.display = 'flex';
            basePrice += PRICE_MUG;
        } else {
            mugPriceRow.style.display = 'none';
        }

        // Atualizar o preço total
        totalPrice.textContent = `R$ ${basePrice.toFixed(2).replace('.', ',')}`;
    }

    // Adicionar listeners aos elementos que afetam o preço
    ticketTypeRegular.addEventListener('change', updatePrice);
    ticketTypePremium.addEventListener('change', updatePrice);
    mugCheckbox.addEventListener('change', updatePrice);

    // Formatar o campo de WhatsApp enquanto o usuário digita
    const whatsappInput = document.getElementById('whatsapp');
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
        alert('Reserva recebida com sucesso! Instruções para pagamento serão enviadas para o seu email em breve.');

        // Opcionalmente, redirecionar para a página inicial ou de confirmação
        // window.location.href = 'confirmacao.html';
    });

    // Link para os termos
    const termsLink = document.querySelector('.terms-link');
    if (termsLink) {
        termsLink.addEventListener('click', function(e) {
            e.preventDefault();
            window.open(this.href, 'termsWindow', 'width=900,height=700,scrollbars=yes');
        });
    }

    // Certifique-se de que o checkbox está marcado antes de enviar o formulário
    const formSubmit = document.querySelector('form');
    if (formSubmit) {
        formSubmit.addEventListener('submit', function(e) {
            const termsCheckbox = document.getElementById('accept-terms');
            if (!termsCheckbox.checked) {
                e.preventDefault();
                alert('Você precisa aceitar os termos e condições para prosseguir.');
            }
        });
    }

    // Inicializar a pré-seleção do ingresso baseado na URL
    preSelectTicket();
});