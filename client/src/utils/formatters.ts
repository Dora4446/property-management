/**
 * Formats a numeric value into standard Indian Currency (INR - ₹) representation.
 * Example: 150000 -> ₹1,50,000
 */
export const formatINR = (amount?: number | null): string => {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Formats an ISO date string or Date object into DD-MM-YYYY.
 * Example: 2026-10-30T12:00:00Z -> 30-10-2026
 */
export const formatDate = (dateInput?: string | Date | null): string => {
  if (!dateInput) return '—';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '—';

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  return `${day}-${month}-${year}`;
};

/**
 * Formats a date with time: DD-MM-YYYY, HH:MM AM/PM
 */
export const formatDateTime = (dateInput?: string | Date | null): string => {
  if (!dateInput) return '—';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '—';

  const datePart = formatDate(d);
  const timePart = d.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return `${datePart}, ${timePart}`;
};
