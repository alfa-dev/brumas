document.addEventListener('DOMContentLoaded', function() {
  const mugCheckbox = document.getElementById('mug');
  const priceSummary = document.getElementById('price-summary');
  const mugPrice = document.getElementById('mug-price');

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

    priceSummary.innerHTML = priceSummaryData.map(item => {
      const name = item.name.padEnd(30, ' ');
      return `${name}${item.priceFormatted.padStart(10, ' ')}`
    }).join('\n') + `
      \nTotal: ${priceSummaryData
        .reduce((acc, item) => acc + parseFloat(item.price), 0)
        .toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`;
  };
});
