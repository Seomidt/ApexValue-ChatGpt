const form = document.querySelector('#valuation-form');
const resultCard = document.querySelector('#result-card');
const range = document.querySelector('#range');
const meta = document.querySelector('#meta');
const summary = document.querySelector('#summary');

const formatCurrency = (value) =>
  new Intl.NumberFormat('da-DK', {
    style: 'currency',
    currency: 'DKK',
    maximumFractionDigits: 0,
  }).format(value);

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const payload = Object.fromEntries(new FormData(form).entries());

  const response = await fetch('/api/valuate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    alert('Noget gik galt i beregningen.');
    return;
  }

  const data = await response.json();

  range.textContent = `${formatCurrency(data.valuationRange.lower)} – ${formatCurrency(data.valuationRange.upper)} (mid: ${formatCurrency(data.valuationRange.midpoint)})`;
  meta.textContent = `Multiple: ${data.scoring.multiple}x · Risiko: ${data.scoring.risk}`;
  summary.textContent = data.summary;
  resultCard.hidden = false;
});
