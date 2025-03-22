// Função para atualizar a contagem regressiva da programação
function updateCountdown() {
    // Data alvo: 30 dias a partir de hoje (apenas para demonstração)
    const now = new Date();
    const targetDate = new Date();
    targetDate.setDate(now.getDate() + 30);

    // Calcula a diferença de tempo
    const diff = targetDate - now;

    // Converte para dias, horas e minutos
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    // Atualiza os elementos na página
    document.querySelector('.countdown-item:nth-child(1) .count-number').textContent = days;
    document.querySelector('.countdown-item:nth-child(2) .count-number').textContent = hours;
    document.querySelector('.countdown-item:nth-child(3) .count-number').textContent = minutes;
}

// Atualiza a contagem regressiva quando a página carrega
document.addEventListener('DOMContentLoaded', function() {
    // Inicializa a contagem
    updateCountdown();

    // Atualiza a cada minuto
    setInterval(updateCountdown, 60000);

    // Animação para os selos dos ingressos
    const ticketSeals = document.querySelectorAll('.ticket-seal');

    ticketSeals.forEach(seal => {
        // Pequena animação de rotação ao carregar a página
        setTimeout(() => {
            seal.style.transition = 'all 1s ease';
            seal.style.transform = 'rotate(10deg)';

            setTimeout(() => {
                seal.style.transform = 'rotate(0deg)';
            }, 500);
        }, Math.random() * 1000);
    });
});