const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export function calculateValuation({
  annualRevenue,
  yearlyGrowthPercent,
  grossMarginPercent,
  churnPercent,
  marketSize,
}) {
  const revenue = Number(annualRevenue) || 0;
  const growth = clamp(Number(yearlyGrowthPercent) || 0, -20, 200);
  const margin = clamp(Number(grossMarginPercent) || 0, 0, 95);
  const churn = clamp(Number(churnPercent) || 0, 0, 80);
  const tam = Number(marketSize) || 0;

  const growthBoost = 1 + growth / 100;
  const marginBoost = 0.5 + margin / 100;
  const churnPenalty = 1 - churn / 120;
  const tamSignal = tam > 0 ? Math.log10(tam + 1) / 8 : 0.5;

  const baseMultiple = clamp(1.5 + growthBoost + marginBoost + churnPenalty + tamSignal, 1.5, 12);

  const midpoint = revenue * baseMultiple;
  const lower = Math.max(0, midpoint * 0.8);
  const upper = midpoint * 1.25;

  let risk = 'Lav';
  if (churn > 20 || growth < 10) risk = 'Middel';
  if (churn > 35 || margin < 35 || growth < 0) risk = 'Høj';

  return {
    valuationRange: {
      lower: Math.round(lower),
      midpoint: Math.round(midpoint),
      upper: Math.round(upper),
    },
    scoring: {
      multiple: Number(baseMultiple.toFixed(2)),
      risk,
    },
    summary: buildSummary({ revenue, growth, margin, churn, tam, baseMultiple, risk }),
  };
}

export function buildSummary({ revenue, growth, margin, churn, tam, baseMultiple, risk }) {
  const sizeText = tam > 0 ? `TAM på ${formatDkk(tam)}` : 'ukendt TAM';
  return `Virksomheden med omsætning på ${formatDkk(revenue)} estimeres til ~${baseMultiple.toFixed(
    1,
  )}x ARR baseret på ${sizeText}, ${growth}% vækst, ${margin}% bruttomargin og ${churn}% churn. Risikoniveau: ${risk}.`;
}

export function formatDkk(value) {
  return new Intl.NumberFormat('da-DK', {
    style: 'currency',
    currency: 'DKK',
    maximumFractionDigits: 0,
  }).format(value || 0);
}
