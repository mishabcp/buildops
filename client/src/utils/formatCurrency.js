/**
 * Format number as Indian Rupees (₹) with 2 decimals.
 * @param {number|string} value
 * @returns {string} e.g. "₹ 1,23,456.00"
 */
export function formatCurrency(value) {
  const num = Number(value);
  if (Number.isNaN(num)) return '₹ 0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}
