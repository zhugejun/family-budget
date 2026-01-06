import type { Expense } from './calculations';

/**
 * Filter expenses by a specific month and year
 */
export function filterByMonth(
  expenses: Expense[],
  year: number,
  month: number
): Expense[] {
  return expenses.filter((exp) => {
    const date = new Date(exp.created_at || new Date());
    return date.getFullYear() === year && date.getMonth() === month;
  });
}

/**
 * Get all unique year-month combinations from expenses
 * Returns array of { year, month, count, label }
 */
export function getAvailableMonths(expenses: Expense[]): Array<{
  year: number;
  month: number;
  count: number;
  label: string;
}> {
  const monthMap = new Map<string, number>();

  expenses.forEach((exp) => {
    const date = new Date(exp.created_at || new Date());
    const year = date.getFullYear();
    const month = date.getMonth();
    const key = `${year}-${month}`;
    monthMap.set(key, (monthMap.get(key) || 0) + 1);
  });

  const months = Array.from(monthMap.entries()).map(([key, count]) => {
    const [year, month] = key.split('-').map(Number);
    const date = new Date(year, month);
    const label = date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
    return { year, month, count, label };
  });

  // Sort by year and month descending (most recent first)
  return months.sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return b.month - a.month;
  });
}

/**
 * Format a month for display
 */
export function formatMonth(year: number, month: number): string {
  const date = new Date(year, month);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Get the previous month
 */
export function getPreviousMonth(year: number, month: number): {
  year: number;
  month: number;
} {
  if (month === 0) {
    return { year: year - 1, month: 11 };
  }
  return { year, month: month - 1 };
}

/**
 * Get the next month
 */
export function getNextMonth(year: number, month: number): {
  year: number;
  month: number;
} {
  if (month === 11) {
    return { year: year + 1, month: 0 };
  }
  return { year, month: month + 1 };
}

/**
 * Get current month and year
 */
export function getCurrentMonth(): { year: number; month: number } {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth(),
  };
}

/**
 * Check if a month is the current month
 */
export function isCurrentMonth(year: number, month: number): boolean {
  const now = new Date();
  return now.getFullYear() === year && now.getMonth() === month;
}

/**
 * Get month short name (e.g., "Jan", "Feb")
 */
export function getMonthShortName(month: number): string {
  const date = new Date(2000, month);
  return date.toLocaleDateString('en-US', { month: 'short' });
}
