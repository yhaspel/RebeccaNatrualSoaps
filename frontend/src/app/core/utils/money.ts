/**
 * Format a cents integer for display.
 *
 * Why we hand-format ILS rather than trusting Intl.NumberFormat: browsers
 * disagree on whether to render the shekel sign as prefix (`₪36`) or suffix
 * (`36 ₪`), and on bidi-control characters that surround it. For the Israeli
 * audience this shop targets, the suffix form is the natural reading. We
 * keep Intl for non-ILS currencies (where it's well-behaved).
 */
export function formatMoney(cents: number, currency = 'ILS', lang = 'en'): string {
  const amount = cents / 100;
  const hasFraction = amount % 1 !== 0;
  const formatted = amount.toLocaleString(lang === 'he' ? 'he-IL' : 'en-IL', {
    minimumFractionDigits: 0,
    maximumFractionDigits: hasFraction ? 2 : 0,
  });

  if (currency === 'ILS') {
    // Suffix form, with a thin no-break space so the symbol stays glued to
    // the number across line wraps.
    return `${formatted} ₪`;
  }
  try {
    return new Intl.NumberFormat(lang === 'he' ? 'he-IL' : 'en-IL', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${formatted} ${currency}`;
  }
}
