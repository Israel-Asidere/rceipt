/**
 * formatCurrency
 * ---------------
 * Formats a number for money display: thousands-separator commas plus
 * always exactly two decimal places (so ₦1,000 doesn't render as
 * "1,000" with no cents, and ₦1,234.5 doesn't render missing a digit).
 *
 * Doesn't include the ₦ symbol itself — callers prepend that, since not
 * every place a number is money necessarily wants the symbol repeated
 * (e.g. a plain-text share message might phrase it differently).
 *
 * Centralized here so every screen formats money the same way. Before
 * this existed, some screens used `.toLocaleString('en-NG')` (commas,
 * but inconsistent decimal places) and others used `.toFixed(2)`
 * (decimals, but no commas) — this replaces both with one shared rule.
 */
export function formatCurrency(amount: number): string {
  return amount.toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
