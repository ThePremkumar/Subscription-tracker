/**
 * Lightweight date helpers – avoids a heavy dependency like date-fns
 * while still providing clean, readable output.
 */

export function format(dateInput) {
  if (!dateInput) return '—';
  try {
    const d = new Date(dateInput);
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
}

/**
 * Returns number of days from now to the given date.
 * Negative → date is in the past.
 */
export function differenceInDays(dateInput) {
  if (!dateInput) return null;
  const now  = new Date();
  const then = new Date(dateInput);
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.ceil((then.getTime() - now.getTime()) / msPerDay);
}

export function parseISO(str) {
  return new Date(str);
}
