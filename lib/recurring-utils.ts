export type FrequencyType = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly';

export interface RecurringExpense {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  category: string;
  frequency: FrequencyType;
  start_date: string;
  end_date?: string;
  next_due_date: string;
  split: boolean;
  split_ratio: Record<string, number>;
  auto_create: boolean;
  is_active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Calculate the next due date based on frequency
 */
export function calculateNextDueDate(
  currentDueDate: Date,
  frequency: FrequencyType
): Date {
  const next = new Date(currentDueDate);

  switch (frequency) {
    case 'daily':
      next.setDate(next.getDate() + 1);
      break;
    case 'weekly':
      next.setDate(next.getDate() + 7);
      break;
    case 'biweekly':
      next.setDate(next.getDate() + 14);
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + 1);
      break;
    case 'yearly':
      next.setFullYear(next.getFullYear() + 1);
      break;
  }

  return next;
}

/**
 * Check if a recurring expense is due
 */
export function isRecurringDue(nextDueDate: string): boolean {
  const due = new Date(nextDueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  return due <= today;
}

/**
 * Check if recurring expense is past end date
 */
export function isRecurringExpired(
  nextDueDate: string,
  endDate?: string
): boolean {
  if (!endDate) return false;
  const due = new Date(nextDueDate);
  const end = new Date(endDate);
  return due > end;
}

/**
 * Get frequency display text
 */
export function getFrequencyText(frequency: FrequencyType): string {
  const frequencyMap: Record<FrequencyType, string> = {
    daily: 'Daily',
    weekly: 'Weekly',
    biweekly: 'Every 2 weeks',
    monthly: 'Monthly',
    yearly: 'Yearly',
  };
  return frequencyMap[frequency];
}

/**
 * Calculate total annual cost
 */
export function calculateAnnualCost(
  amount: number,
  frequency: FrequencyType
): number {
  const multipliers: Record<FrequencyType, number> = {
    daily: 365,
    weekly: 52,
    biweekly: 26,
    monthly: 12,
    yearly: 1,
  };
  return amount * multipliers[frequency];
}

/**
 * Format date for display
 */
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Get days until next due date
 */
export function getDaysUntilDue(nextDueDate: string): number {
  const due = new Date(nextDueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  const diffTime = due.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Get status of recurring expense
 */
export function getRecurringStatus(recurring: RecurringExpense): {
  status: 'active' | 'due' | 'paused' | 'expired';
  message: string;
  color: string;
} {
  if (!recurring.is_active) {
    return {
      status: 'paused',
      message: 'Paused',
      color: 'text-stone-500',
    };
  }

  if (isRecurringExpired(recurring.next_due_date, recurring.end_date)) {
    return {
      status: 'expired',
      message: 'Expired',
      color: 'text-stone-400',
    };
  }

  if (isRecurringDue(recurring.next_due_date)) {
    return {
      status: 'due',
      message: 'Due now',
      color: 'text-rose-600',
    };
  }

  const days = getDaysUntilDue(recurring.next_due_date);
  return {
    status: 'active',
    message: `Due in ${days} ${days === 1 ? 'day' : 'days'}`,
    color: 'text-emerald-600',
  };
}
