import type { Expense } from './calculations';

/**
 * Analytics data types
 */
export interface CategoryData {
  category: string;
  total: number;
  count: number;
  percentage: number;
}

export interface DailySpending {
  date: string;
  amount: number;
  count: number;
}

export interface MemberSpending {
  member: string;
  amount: number;
  percentage: number;
}

export interface TrendData {
  avgDailySpending: number;
  highestExpense: Expense | null;
  mostExpensiveCategory: string;
  monthOverMonthChange: number;
  totalThisMonth: number;
  totalLastMonth: number;
}

/**
 * Calculate category breakdown with totals and percentages
 */
export function calculateCategoryBreakdown(expenses: Expense[]): CategoryData[] {
  const categoryMap = new Map<string, { total: number; count: number }>();

  expenses.forEach((exp) => {
    const total = exp.price * exp.quantity;
    const existing = categoryMap.get(exp.category) || { total: 0, count: 0 };
    categoryMap.set(exp.category, {
      total: existing.total + total,
      count: existing.count + 1,
    });
  });

  const grandTotal = expenses.reduce(
    (sum, exp) => sum + exp.price * exp.quantity,
    0
  );

  const data = Array.from(categoryMap.entries()).map(
    ([category, { total, count }]) => ({
      category,
      total,
      count,
      percentage: grandTotal > 0 ? (total / grandTotal) * 100 : 0,
    })
  );

  // Sort by total descending
  return data.sort((a, b) => b.total - a.total);
}

/**
 * Calculate daily spending for a given month
 */
export function calculateDailySpending(
  expenses: Expense[],
  year: number,
  month: number
): DailySpending[] {
  const dailyMap = new Map<string, { amount: number; count: number }>();

  expenses.forEach((exp) => {
    const date = new Date(exp.created_at || new Date());
    if (date.getFullYear() === year && date.getMonth() === month) {
      const dateKey = date.toISOString().split('T')[0];
      const total = exp.price * exp.quantity;
      const existing = dailyMap.get(dateKey) || { amount: 0, count: 0 };
      dailyMap.set(dateKey, {
        amount: existing.amount + total,
        count: existing.count + 1,
      });
    }
  });

  // Convert to array and sort by date
  const data = Array.from(dailyMap.entries()).map(([date, { amount, count }]) => ({
    date,
    amount,
    count,
  }));

  return data.sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Calculate member spending breakdown
 */
export function calculateMemberSpending(
  expenses: Expense[],
  familyMembers: string[]
): MemberSpending[] {
  const memberTotals: Record<string, number> = {};

  // Initialize
  familyMembers.forEach((member) => {
    memberTotals[member] = 0;
  });

  expenses.forEach((exp) => {
    const total = exp.price * exp.quantity;

    if (exp.split) {
      // Calculate ratio sum to handle cases where ratios don't add to 100
      const ratioSum = familyMembers.reduce((sum, member) => {
        return sum + (exp.split_ratio[member] || 0);
      }, 0);

      // Distribute based on ratios
      familyMembers.forEach((member) => {
        memberTotals[member] += (total * (exp.split_ratio[member] || 0)) / ratioSum;
      });
    } else {
      // If not split, assign to first member (typically "You")
      memberTotals[familyMembers[0]] += total;
    }
  });

  const grandTotal = Object.values(memberTotals).reduce((sum, val) => sum + val, 0);

  return familyMembers.map((member) => ({
    member,
    amount: memberTotals[member],
    percentage: grandTotal > 0 ? (memberTotals[member] / grandTotal) * 100 : 0,
  }));
}

/**
 * Calculate trend data and insights
 */
export function calculateTrendData(
  currentMonthExpenses: Expense[],
  lastMonthExpenses: Expense[]
): TrendData {
  const totalThisMonth = currentMonthExpenses.reduce(
    (sum, exp) => sum + exp.price * exp.quantity,
    0
  );

  const totalLastMonth = lastMonthExpenses.reduce(
    (sum, exp) => sum + exp.price * exp.quantity,
    0
  );

  const monthOverMonthChange =
    totalLastMonth > 0
      ? ((totalThisMonth - totalLastMonth) / totalLastMonth) * 100
      : 0;

  // Find highest expense
  const highestExpense = currentMonthExpenses.reduce<Expense | null>(
    (max, exp) => {
      const total = exp.price * exp.quantity;
      const maxTotal = max ? max.price * max.quantity : 0;
      return total > maxTotal ? exp : max;
    },
    null
  );

  // Calculate average daily spending
  const daysInMonth = new Set(
    currentMonthExpenses.map((exp) => {
      const date = new Date(exp.created_at || new Date());
      return date.toISOString().split('T')[0];
    })
  ).size;

  const avgDailySpending = daysInMonth > 0 ? totalThisMonth / daysInMonth : 0;

  // Find most expensive category
  const categoryBreakdown = calculateCategoryBreakdown(currentMonthExpenses);
  const mostExpensiveCategory =
    categoryBreakdown.length > 0 ? categoryBreakdown[0].category : 'None';

  return {
    avgDailySpending,
    highestExpense,
    mostExpensiveCategory,
    monthOverMonthChange,
    totalThisMonth,
    totalLastMonth,
  };
}

/**
 * Get top N expenses
 */
export function getTopExpenses(expenses: Expense[], limit: number = 5): Expense[] {
  return [...expenses]
    .sort((a, b) => b.price * b.quantity - a.price * a.quantity)
    .slice(0, limit);
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

/**
 * Format percentage for display
 */
export function formatPercentage(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
}

/**
 * Get color for category (consistent hash-based color)
 */
const CHART_COLORS = [
  '#f97316', // orange-500
  '#eab308', // yellow-500
  '#84cc16', // lime-500
  '#10b981', // emerald-500
  '#06b6d4', // cyan-500
  '#3b82f6', // blue-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#f43f5e', // rose-500
  '#f59e0b', // amber-500
];

export function getCategoryColor(category: string, index: number): string {
  return CHART_COLORS[index % CHART_COLORS.length];
}
