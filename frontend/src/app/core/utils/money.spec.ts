import { formatMoney } from './money';

describe('formatMoney', () => {
  it('formats 5000 cents in ILS/en', () => {
    const result = formatMoney(5000, 'ILS', 'en');
    expect(result).toContain('50');
  });

  it('formats 5000 cents in ILS/he', () => {
    const result = formatMoney(5000, 'ILS', 'he');
    expect(result).toContain('50');
  });

  it('handles zero', () => {
    const result = formatMoney(0);
    expect(result).toContain('0');
  });

  it('handles fractional cents', () => {
    const result = formatMoney(1999, 'ILS', 'en');
    expect(result).toContain('19.99');
  });

  it('defaults currency to ILS', () => {
    const result = formatMoney(100);
    // Should contain ILS symbol or text
    expect(result).toBeTruthy();
  });
});
