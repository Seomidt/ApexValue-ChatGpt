import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateValuation } from '../src/valuation.js';

test('calculateValuation returns ordered range and summary', () => {
  const result = calculateValuation({
    annualRevenue: 10_000_000,
    yearlyGrowthPercent: 50,
    grossMarginPercent: 70,
    churnPercent: 5,
    marketSize: 3_000_000_000,
  });

  assert.ok(result.valuationRange.lower < result.valuationRange.midpoint);
  assert.ok(result.valuationRange.midpoint < result.valuationRange.upper);
  assert.match(result.summary, /Risikoniveau/);
});

test('high churn sets high risk', () => {
  const result = calculateValuation({
    annualRevenue: 2_000_000,
    yearlyGrowthPercent: 15,
    grossMarginPercent: 60,
    churnPercent: 42,
    marketSize: 500_000_000,
  });

  assert.equal(result.scoring.risk, 'Høj');
});
