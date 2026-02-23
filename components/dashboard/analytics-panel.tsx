'use client';

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
  BarChart3,
  PieChart as PieChartIcon,
  Users,
  TrendingUp,
  CreditCard,
  ChevronDown,
  ChevronRight,
  Receipt,
  Check,
} from 'lucide-react';
import type { Expense } from '@/lib/calculations';
import {
  calculateCategoryBreakdown,
  calculateDailySpending,
  calculateMemberSpending,
  calculateTrendData,
  calculateCardSpending,
} from '@/lib/analytics';
import { filterByMonth, getPreviousMonth } from '@/lib/date-utils';
import { CategoryPieChart } from './category-pie-chart';
import { SpendingChart } from './spending-chart';
import { TrendCards } from './trend-cards';
import { SpendingComparison } from './spending-comparison';

interface AnalyticsPanelProps {
  expenses: Expense[];
  allExpenses: Expense[];
  familyMembers: string[];
  selectedYear: number;
  selectedMonth: number;
}

export function AnalyticsPanel({
  expenses,
  allExpenses,
  familyMembers,
  selectedYear,
  selectedMonth,
}: AnalyticsPanelProps) {
  // Calculate analytics data
  const categoryData = useMemo(
    () => calculateCategoryBreakdown(expenses),
    [expenses],
  );

  const dailySpending = useMemo(
    () => calculateDailySpending(allExpenses, selectedYear, selectedMonth),
    [allExpenses, selectedYear, selectedMonth],
  );

  const memberSpending = useMemo(
    () => calculateMemberSpending(expenses, familyMembers),
    [expenses, familyMembers],
  );

  const trendData = useMemo(() => {
    const prev = getPreviousMonth(selectedYear, selectedMonth);
    const lastMonthExpenses = filterByMonth(allExpenses, prev.year, prev.month);
    return calculateTrendData(expenses, lastMonthExpenses);
  }, [expenses, allExpenses, selectedYear, selectedMonth]);

  const cardData = useMemo(() => calculateCardSpending(expenses), [expenses]);

  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  // Reconciliation state persisted in localStorage
  const storageKey = `reconciled_${selectedYear}_${selectedMonth}`;
  const [reconciledReceipts, setReconciledReceipts] = useState<Set<string>>(
    () => {
      try {
        const saved = localStorage.getItem(storageKey);
        return saved ? new Set(JSON.parse(saved)) : new Set();
      } catch {
        return new Set();
      }
    },
  );

  // Re-load when month changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      setReconciledReceipts(saved ? new Set(JSON.parse(saved)) : new Set());
    } catch {
      setReconciledReceipts(new Set());
    }
  }, [storageKey]);

  const toggleReconciled = useCallback(
    (receiptGroup: string) => {
      setReconciledReceipts((prev) => {
        const next = new Set(prev);
        if (next.has(receiptGroup)) {
          next.delete(receiptGroup);
        } else {
          next.add(receiptGroup);
        }
        try {
          localStorage.setItem(storageKey, JSON.stringify([...next]));
        } catch {
          /* ignore */
        }
        return next;
      });
    },
    [storageKey],
  );

  if (expenses.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-16'>
        <div className='w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-4'>
          <BarChart3 className='w-10 h-10 text-amber-600' />
        </div>
        <h3 className='text-xl font-bold text-stone-800 mb-2'>No Data Yet</h3>
        <p className='text-stone-500 text-center max-w-md'>
          Add some expenses to see beautiful analytics and insights about your
          spending
        </p>
      </div>
    );
  }

  return (
    <div className='space-y-8'>
      {/* Trend Cards */}
      <div>
        <div className='flex items-center gap-2 mb-4'>
          <TrendingUp className='w-5 h-5 text-amber-600' />
          <h3 className='text-lg font-bold text-stone-800'>Quick Insights</h3>
        </div>
        <TrendCards trendData={trendData} />
      </div>

      {/* Charts Grid */}
      <div className='grid md:grid-cols-2 gap-6'>
        {/* Category Breakdown */}
        <div className='bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-stone-200 shadow-sm'>
          <div className='flex items-center gap-2 mb-4'>
            <PieChartIcon className='w-5 h-5 text-amber-600' />
            <h3 className='text-base sm:text-lg font-bold text-stone-800'>
              Spending by Category
            </h3>
          </div>
          <CategoryPieChart data={categoryData} />
        </div>

        {/* Member Comparison */}
        <div className='bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-stone-200 shadow-sm'>
          <div className='flex items-center gap-2 mb-4'>
            <Users className='w-5 h-5 text-amber-600' />
            <h3 className='text-base sm:text-lg font-bold text-stone-800'>
              Spending by Member
            </h3>
          </div>
          <SpendingComparison data={memberSpending} />
        </div>
      </div>

      {/* Daily Spending Chart */}
      <div className='bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-stone-200 shadow-sm'>
        <div className='flex items-center gap-2 mb-4'>
          <BarChart3 className='w-5 h-5 text-amber-600' />
          <h3 className='text-lg font-bold text-stone-800'>Daily Spending</h3>
        </div>
        <SpendingChart data={dailySpending} />
      </div>

      {/* Spending by Card */}
      {cardData.length > 0 && (
        <div className='bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-stone-200 shadow-sm'>
          <div className='flex items-center gap-2 mb-4'>
            <CreditCard className='w-5 h-5 text-amber-600' />
            <h3 className='text-base sm:text-lg font-bold text-stone-800'>
              Spending by Card
            </h3>
          </div>
          <div className='space-y-3'>
            {cardData.map((item, index) => {
              const colors = [
                'bg-amber-500',
                'bg-orange-500',
                'bg-emerald-500',
                'bg-violet-500',
                'bg-cyan-500',
                'bg-rose-500',
                'bg-blue-500',
              ];
              const barColor = colors[index % colors.length];
              const isExpanded = expandedCards.has(item.card);
              return (
                <div key={item.card}>
                  <button
                    className='w-full text-left'
                    onClick={() => {
                      const next = new Set(expandedCards);
                      if (next.has(item.card)) {
                        next.delete(item.card);
                      } else {
                        next.add(item.card);
                      }
                      setExpandedCards(next);
                    }}
                  >
                    <div className='flex items-center justify-between mb-1'>
                      <div className='flex items-center gap-2'>
                        {isExpanded ? (
                          <ChevronDown className='w-3.5 h-3.5 text-stone-400' />
                        ) : (
                          <ChevronRight className='w-3.5 h-3.5 text-stone-400' />
                        )}
                        <CreditCard className='w-3.5 h-3.5 text-stone-400' />
                        <span className='text-sm font-medium text-stone-700'>
                          {item.card}
                        </span>
                        <span className='text-xs text-stone-400'>
                          {item.receipts.length} receipt
                          {item.receipts.length !== 1 ? 's' : ''} · {item.count}{' '}
                          item{item.count !== 1 ? 's' : ''}
                        </span>
                        {(() => {
                          const reconciled = item.receipts.filter((r) =>
                            reconciledReceipts.has(r.receiptGroup),
                          ).length;
                          return reconciled > 0 ? (
                            <span
                              className={`flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded-full ${
                                reconciled === item.receipts.length
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-amber-100 text-amber-700'
                              }`}
                            >
                              <Check className='w-3 h-3' />
                              {reconciled}/{item.receipts.length}
                            </span>
                          ) : null;
                        })()}
                      </div>
                      <span className='text-sm font-bold text-stone-800 font-serif'>
                        ${item.total.toFixed(2)}
                      </span>
                    </div>
                  </button>
                  <div className='h-2 bg-stone-100 rounded-full overflow-hidden ml-5'>
                    <div
                      className={`h-full ${barColor} rounded-full transition-all duration-500`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <div className='text-right mt-0.5'>
                    <span className='text-xs text-stone-400'>
                      {item.percentage.toFixed(1)}%
                    </span>
                  </div>
                  {/* Receipt breakdown */}
                  {isExpanded && (
                    <div className='mt-2 ml-5 space-y-1 animate-in slide-in-from-top-2 duration-150'>
                      {item.receipts.map((receipt) => {
                        const isReconciled = reconciledReceipts.has(
                          receipt.receiptGroup,
                        );
                        return (
                          <div
                            key={receipt.receiptGroup}
                            className={`flex items-center justify-between py-1.5 px-3 rounded-lg transition-colors ${
                              isReconciled
                                ? 'bg-emerald-50 border border-emerald-200'
                                : 'bg-stone-50'
                            }`}
                          >
                            <div className='flex items-center gap-2 min-w-0'>
                              <input
                                type='checkbox'
                                checked={isReconciled}
                                onChange={() =>
                                  toggleReconciled(receipt.receiptGroup)
                                }
                                className='w-3.5 h-3.5 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer shrink-0'
                              />
                              <Receipt
                                className={`w-3.5 h-3.5 shrink-0 ${
                                  isReconciled
                                    ? 'text-emerald-400'
                                    : 'text-stone-400'
                                }`}
                              />
                              <span
                                className={`text-xs font-medium truncate ${
                                  isReconciled
                                    ? 'text-stone-400 line-through'
                                    : 'text-stone-600'
                                }`}
                              >
                                {receipt.receiptGroup}
                              </span>
                              <span className='text-xs text-stone-400 shrink-0'>
                                {receipt.count} item
                                {receipt.count !== 1 ? 's' : ''}
                              </span>
                            </div>
                            <span
                              className={`text-xs font-bold font-serif shrink-0 ml-2 ${
                                isReconciled
                                  ? 'text-emerald-600'
                                  : 'text-stone-700'
                              }`}
                            >
                              ${receipt.total.toFixed(2)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
